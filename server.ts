import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  buildInstantOfficialDocument,
  generateLocalSmartTutorReply,
  getDefaultFlashcardsForSubject,
  getSyllabusTopicsForClassSubject,
  type LearnedMemoryItem,
  type OfficialDocType,
  type SiteResourceContext,
  type TeacherMetadata,
} from './src/data/curriculumData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 8) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const GEMINI_FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'] as const;
const modelCooldownUntil = new Map<string, number>();

async function generateContentWithQuotaFallback(
  ai: GoogleGenAI,
  params: {
    contents: unknown;
    config?: Record<string, unknown>;
  }
): Promise<string | null> {
  const now = Date.now();
  for (const modelName of GEMINI_FALLBACK_MODELS) {
    const cooldown = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldown) {
      continue;
    }
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents as never,
        config: params.config as never,
      });
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        // Put this specific model on cooldown for 30 minutes and try the next model
        modelCooldownUntil.set(modelName, Date.now() + 30 * 60 * 1000);
        continue;
      }
      // For non-quota transient errors, try next model or fall back cleanly
    }
  }
  return null;
}

// Proxy endpoint for Google Sheets CSV so client can sync reliably
app.get('/api/sheets/:sheetId', async (req, res) => {
  const { sheetId } = req.params;
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv`,
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (response.ok) {
        const text = await response.text();
        if (text && !text.includes('<!DOCTYPE html>') && text.length > 20) {
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          return res.send(text);
        }
      }
    } catch {
      // try next endpoint
    }
  }
  res.status(502).json({ error: 'Unable to fetch Google Sheet CSV' });
});

// Moha AI Chat & Multimodal Question Solver Endpoint
app.post('/api/moha/chat', async (req, res) => {
  const {
    prompt,
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    image,
    history = [],
    learnedMemory = [],
    siteResources,
  } = req.body as {
    prompt: string;
    cls?: string;
    subject?: string;
    image?: { mimeType: string; base64Data: string } | null;
    history?: Array<{ id?: string; role: 'user' | 'ai'; text: string }>;
    learnedMemory?: LearnedMemoryItem[];
    siteResources?: SiteResourceContext;
  };

  const userPrompt = (prompt || 'Solve this question step-by-step and show the NECTA Marking Scheme.').trim();

  // Check if user is explicitly querying a learned item first
  const lower = userPrompt.toLowerCase();
  for (const item of learnedMemory) {
    if (lower === item.topic.toLowerCase()) {
      return res.json({
        reply: `🧠 **Moha AI (Learned Memory — ${item.topic}):**\n\n${item.content}\n\n*(Saved on ${item.timestamp})*`,
        source: 'memory',
      });
    }
  }

  const ai = getGenAIClient();
  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const learnedContext =
    learnedMemory.length > 0
      ? `\n\nTeacher/Student Custom Learned Memory:\n${learnedMemory
          .slice(0, 20)
          .map((m) => `- ${m.topic} (${m.cls} ${m.subject}): ${m.content}`)
          .join('\n')}`
      : '';

  const siteResourcesContext = siteResources
    ? `\n\nUploaded Elimika Website Resources Integrated for ${cls} ${subject} & Related Subjects:
- TIE Textbooks Available: ${
        siteResources.books.map((b) => `${b.title} (${b.form} ${b.subject})`).join('; ') || 'Standard TIE Textbooks'
      }
- Official Syllabuses Available: ${
        siteResources.syllabuses.map((s) => `${s.title} (${s.form} ${s.subject})`).join('; ') || 'Official TIE Syllabus'
      }
- Past Examination Papers Available: ${
        siteResources.papers.map((p) => `${p.title} [${p.category} ${p.year}]`).join('; ') || 'NECTA Past Papers'
      }`
    : '';

  if (ai) {
    try {
      const systemInstruction = `You are Moha AI, the official Tanzanian TIE (Tanzania Institute of Education) Competence-Based Curriculum & NECTA (National Examinations Council of Tanzania) Examiner Assistant for ${cls} ${subject}.
Official TIE Syllabus Competences for ${cls} ${subject}:
${syllabusTopics.map((t) => `- ${t}`).join('\n')}${siteResourcesContext}${learnedContext}

Formatting & Pedagogical Rules:
1. Give thorough, crystal-clear, step-by-step explanations, lesson notes, lesson plans, or schemes of work tailored to Tanzanian ${cls} ${subject} students and teachers.
2. Actively integrate and reference the uploaded TIE Textbooks, Official Syllabuses, and Past Examination Papers available on the Elimika website.
3. CLEAR TABLES: Whenever the user asks for a table, comparison, experimental results (e.g., Physics Ohm's Law, Chemistry Titration Burette Table), Mathematics table of values/statistics, or Book-Keeping/Accounts ledgers, ALWAYS draw a clean, well-aligned Markdown table using pipe syntax (| Column 1 | Column 2 |).
4. When solving mathematical, physics, or chemistry problems, write clean LaTeX equations enclosed in $...$ for inline math and $$...$$ for block equations.
5. Include NECTA Marking Scheme mark allocations (e.g., [02 Marks], [01 Mark]) for steps and key points.
6. Use **bold** headings and bullet points (•) for readability.`;

      const recentHistoryParts = history
        .filter((h) => !h.text.includes('official-tie-doc') && h.id !== 'msg-welcome')
        .slice(-6)
        .map((h) => `${h.role === 'user' ? 'Student/Teacher' : 'Moha AI'}: ${h.text}`)
        .join('\n\n');

      const fullPromptText = recentHistoryParts
        ? `Previous conversation context:\n${recentHistoryParts}\n\nCurrent Request (${cls} ${subject}):\n${userPrompt}`
        : userPrompt;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (image && image.base64Data && image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.base64Data,
          },
        });
      }
      parts.push({ text: fullPromptText });

      const replyText = await generateContentWithQuotaFallback(ai, {
        contents: { parts },
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      if (replyText && replyText.length > 0) {
        return res.json({ reply: replyText, source: 'gemini' });
      }
    } catch {
      // Fallback to built-in curriculum engine below
    }
  }

  // Fallback to built-in curriculum engine
  const fallbackReply = generateLocalSmartTutorReply(userPrompt, cls, subject, learnedMemory, siteResources);
  return res.json({ reply: fallbackReply, source: 'local' });
});

// Moha AI Official TIE / PO-RALG / NECTA Document & Lesson Notes Generator Endpoint
app.post('/api/moha/generate-doc', async (req, res) => {
  const { type, meta } = req.body as {
    type: OfficialDocType;
    meta: TeacherMetadata;
  };

  const resourceSummary = meta.siteResources
    ? `Uploaded Website Books: ${meta.siteResources.books.map((b) => b.title).join(', ')}. Uploaded Syllabuses: ${meta.siteResources.syllabuses.map((s) => s.title).join(', ')}. Uploaded Past Papers: ${meta.siteResources.papers.map((p) => `${p.title} (${p.year})`).join(', ')}.`
    : '';

  const ai = getGenAIClient();
  if (ai && (type === 'lessonplan' || type === 'markingscheme' || type === 'lessonnotes')) {
    try {
      if (type === 'lessonplan') {
        const jsonText = await generateContentWithQuotaFallback(ai, {
          contents: `Create specific, curriculum-authentic Tanzanian TIE 4-stage lesson plan activities for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}, Present Students: ${meta.presTotal}. Integrate these website resources: ${resourceSummary}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mainCompetence: { type: Type.STRING },
                specificCompetence: { type: Type.STRING },
                introTeacher: { type: Type.STRING },
                introStudent: { type: Type.STRING },
                compTeacher: { type: Type.STRING },
                compStudent: { type: Type.STRING },
                designTeacher: { type: Type.STRING },
                designStudent: { type: Type.STRING },
                realTeacher: { type: Type.STRING },
                realStudent: { type: Type.STRING },
                remarks: { type: Type.STRING },
              },
              required: [
                'mainCompetence',
                'specificCompetence',
                'introTeacher',
                'introStudent',
                'compTeacher',
                'compStudent',
                'designTeacher',
                'designStudent',
                'realTeacher',
                'realStudent',
                'remarks',
              ],
            },
          },
        });
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const docHtml = buildInstantOfficialDocument('lessonplan', meta, parsed);
          return res.json({ html: docHtml, source: 'gemini' });
        }
      } else if (type === 'lessonnotes') {
        const jsonText = await generateContentWithQuotaFallback(ai, {
          contents: `Create comprehensive official Tanzanian TIE Lesson Notes for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}. Integrate concepts from the TIE textbook, official syllabus, and past examination papers (${resourceSummary}). Include 3 detailed keyConcepts, 2 step-by-step workedExamples, and 3 NECTA-style practiceQuestions with marking hints.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      heading: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ['heading', 'explanation'],
                  },
                },
                workedExamples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      problem: { type: Type.STRING },
                      solution: { type: Type.STRING },
                    },
                    required: ['problem', 'solution'],
                  },
                },
                practiceQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answerHint: { type: Type.STRING },
                    },
                    required: ['question', 'answerHint'],
                  },
                },
              },
              required: ['keyConcepts', 'workedExamples', 'practiceQuestions'],
            },
          },
        });
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const docHtml = buildInstantOfficialDocument('lessonnotes', meta, parsed);
          return res.json({ html: docHtml, source: 'gemini' });
        }
      } else if (type === 'markingscheme') {
        const jsonText = await generateContentWithQuotaFallback(ai, {
          contents: `Create 4 detailed NECTA examination questions and marking rubric items for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}. Reference uploaded past papers: ${resourceSummary}. Use <br/> between rubric bullet points.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                markingItems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      qn: { type: Type.STRING },
                      item: { type: Type.STRING },
                      rubric: { type: Type.STRING },
                      marks: { type: Type.STRING },
                    },
                    required: ['qn', 'item', 'rubric', 'marks'],
                  },
                },
              },
              required: ['markingItems'],
            },
          },
        });
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const docHtml = buildInstantOfficialDocument('markingscheme', meta, parsed);
          return res.json({ html: docHtml, source: 'gemini' });
        }
      }
    } catch {
      // Cleanly fall back to built-in official TIE/NECTA document builder below
    }
  }

  const html = buildInstantOfficialDocument(type, meta);
  return res.json({ html, source: 'local' });
});

// Helper to build NECTA-aligned fallback questions for a class, subject, and specific topic
function buildFallbackTopicQuizQuestions(cls: string, subject: string, topic?: string) {
  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const focusTopic =
    topic && topic !== 'ALL'
      ? topic
      : syllabusTopics[0] || `1.0 Core Principles of ${subject}`;

  return [
    {
      question: `[NECTA ${cls} ${subject}] Which competence principle is central when solving problems on "${focusTopic}" under the TIE curriculum?`,
      options: [
        `Applying ${focusTopic} formulas, definitions, and real-life Tanzanian applications step-by-step`,
        'Memorizing final answers without showing working or units',
        'Skipping formula statements and diagrams',
        'Using unrelated non-syllabus assumptions',
      ],
      correctIndex: 0,
      explanation: `In NECTA ${subject}, questions on "${focusTopic}" require stating the governing principle/formula, substituting given data clearly, and stating proper units.`,
      topic: focusTopic,
    },
    {
      question: `When answering a structured NECTA Section B question on "${focusTopic}" (${cls} ${subject}), how are method marks (M1) awarded?`,
      options: [
        'Only if the page is completely full',
        `For identifying given parameters and writing the correct ${focusTopic} equation or law before substitution`,
        'For writing the final number only',
        'Method marks are never awarded in NECTA exams',
      ],
      correctIndex: 1,
      explanation:
        'NECTA marking schemes allocate method marks (M1) for extracting given data and stating the correct formula or law prior to numerical substitution.',
      topic: focusTopic,
    },
    {
      question: `Which of the following is an official TIE syllabus competence tested alongside "${focusTopic}" in ${cls} ${subject}?`,
      options: [
        syllabusTopics[1] || syllabusTopics[0] || focusTopic,
        'Unrelated Foreign Literature',
        'Non-Curriculum Speculative Trivia',
        'Deprecated Pre-1960 Syllabus Topic',
      ],
      correctIndex: 0,
      explanation: `${
        syllabusTopics[1] || syllabusTopics[0] || focusTopic
      } is part of the official Tanzania Institute of Education (TIE) syllabus for ${cls} ${subject}.`,
      topic: focusTopic,
    },
    {
      question: `In ${cls} ${subject}, why is graphical or tabular presentation important when analyzing "${focusTopic}"?`,
      options: [
        'It replaces all calculations completely',
        `It clearly shows relationships between variables, trends, and experimental accuracy in ${focusTopic}`,
        'It is only used for decoration',
        'NECTA forbids tables and diagrams',
      ],
      correctIndex: 1,
      explanation: `Clear tables and labeled diagrams help verify relationships between variables in "${focusTopic}" and earn full presentation marks in NECTA examinations.`,
      topic: focusTopic,
    },
  ];
}

// Moha AI Interactive Quiz Generator Endpoint (supports specific topic)
app.post('/api/moha/quiz', async (req, res) => {
  const {
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    topic,
  } = req.body as {
    cls?: string;
    subject?: string;
    topic?: string;
  };

  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const selectedTopicText =
    topic && topic !== 'ALL'
      ? `focusing specifically on the topic "${topic}"`
      : `covering these official TIE syllabus topics: ${syllabusTopics.join('; ')}`;

  const ai = getGenAIClient();

  if (ai) {
    try {
      const jsonText = await generateContentWithQuotaFallback(ai, {
        contents: `Generate 4 high-quality NECTA multiple-choice practice questions for Tanzanian ${cls} ${subject} ${selectedTopicText}. Each question must have 4 options, correctIndex (0 to 3), a clear step-by-step explanation, and the specific syllabus topic name it tests.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation', 'topic'],
            },
          },
        },
      });
      if (jsonText) {
        const questions = JSON.parse(jsonText);
        if (Array.isArray(questions) && questions.length > 0) {
          return res.json({ questions, source: 'gemini' });
        }
      }
    } catch {
      // Cleanly fall back to built-in NECTA topic quiz generator below
    }
  }

  return res.json({
    questions: buildFallbackTopicQuizQuestions(cls, subject, topic),
    source: 'local',
  });
});

// ==================== CHALLENGE A FRIEND & LEADERBOARD STORE ====================
interface ChallengeLeaderboardEntry {
  id: string;
  playerName: string;
  school: string;
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  completedAt: string;
}

interface TopicQuizChallenge {
  id: string;
  cls: string;
  subject: string;
  topic: string;
  createdBy: string;
  createdAt: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    topic?: string;
  }>;
  leaderboard: ChallengeLeaderboardEntry[];
}

const challengesStore = new Map<string, TopicQuizChallenge>();

function normalizeChallengeCode(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase();
}

// Seed initial NECTA topic challenges so Leaderboard is immediately active
(function seedDefaultChallenges() {
  const seedList: Array<{
    id: string;
    cls: string;
    subject: string;
    topic: string;
    createdBy: string;
    entries: Array<{ playerName: string; school: string; score: number; total: number; timeSeconds: number }>;
  }> = [
    {
      id: 'MATH-301',
      cls: 'Form 3',
      subject: 'Basic Mathematics',
      topic: 'Relations & Functions',
      createdBy: 'Amina Juma',
      entries: [
        { playerName: 'Amina Juma', school: 'Ilboru Secondary', score: 4, total: 4, timeSeconds: 38 },
        { playerName: 'Kelvin Massawe', school: 'Mzumbe Secondary', score: 4, total: 4, timeSeconds: 45 },
        { playerName: 'Neema Mwakyusa', school: 'Jangwani Secondary', score: 3, total: 4, timeSeconds: 41 },
      ],
    },
    {
      id: 'PHYS-204',
      cls: 'Form 3',
      subject: 'Physics',
      topic: 'Current Electricity (Ohm’s Law)',
      createdBy: 'Baraka Mushi',
      entries: [
        { playerName: 'Baraka Mushi', school: 'Kibaha Secondary', score: 4, total: 4, timeSeconds: 34 },
        { playerName: 'Fatuma Ally', school: 'Feza Girls', score: 3, total: 4, timeSeconds: 49 },
      ],
    },
  ];

  seedList.forEach((s) => {
    const code = normalizeChallengeCode(s.id);
    challengesStore.set(code, {
      id: code,
      cls: s.cls,
      subject: s.subject,
      topic: s.topic,
      createdBy: s.createdBy,
      createdAt: new Date().toISOString().split('T')[0],
      questions: buildFallbackTopicQuizQuestions(s.cls, s.subject, s.topic),
      leaderboard: s.entries.map((e, idx) => ({
        id: `seed-${code}-${idx}`,
        playerName: e.playerName,
        school: e.school,
        score: e.score,
        total: e.total,
        percentage: Math.round((e.score / e.total) * 100),
        timeSeconds: e.timeSeconds,
        completedAt: new Date().toISOString().split('T')[0],
      })),
    });
  });
})();

function sortLeaderboard(entries: ChallengeLeaderboardEntry[]): ChallengeLeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });
}

// List all challenges
app.get('/api/challenges', (_req, res) => {
  const list = Array.from(challengesStore.values()).map((c) => ({
    ...c,
    leaderboard: sortLeaderboard(c.leaderboard),
  }));
  const rawAppUrl = process.env.APP_URL || '';
  const publicAppUrl = rawAppUrl.replace('//ais-dev-', '//ais-pre-');
  res.json({ challenges: list, publicAppUrl });
});

// Get a specific challenge by ID/Code (or dynamically create if shared via URL/Code)
app.get('/api/challenges/:id', (req, res) => {
  const code = normalizeChallengeCode(req.params.id);
  const cls = String(req.query.cls || 'Form 3');
  const subject = String(req.query.sub || 'Basic Mathematics');
  const topic = String(req.query.topic || 'Core Competence');
  const createdBy = String(req.query.by || 'Classmate');

  let challenge = challengesStore.get(code);
  if (!challenge) {
    challenge = {
      id: code,
      cls,
      subject,
      topic,
      createdBy,
      createdAt: new Date().toISOString().split('T')[0],
      questions: buildFallbackTopicQuizQuestions(cls, subject, topic),
      leaderboard: [],
    };
    challengesStore.set(code, challenge);
  }

  return res.json({
    challenge: {
      ...challenge,
      leaderboard: sortLeaderboard(challenge.leaderboard),
    },
  });
});

// Create a new 'Challenge a Friend' Topic Quiz Code & Link
app.post('/api/challenges/create', (req, res) => {
  const {
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    topic = 'Core Competence',
    createdBy = 'Student',
    school = 'Elimika Secondary',
    questions,
    creatorScore,
    creatorTimeSeconds = 45,
  } = req.body as {
    cls?: string;
    subject?: string;
    topic?: string;
    createdBy?: string;
    school?: string;
    questions?: TopicQuizChallenge['questions'];
    creatorScore?: number;
    creatorTimeSeconds?: number;
  };

  const prefix =
    subject
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'QUIZ';
  const randNum = Math.floor(100 + Math.random() * 900);
  const id = `${prefix}-${randNum}`;

  const quizQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : buildFallbackTopicQuizQuestions(cls, subject, topic);

  const leaderboard: ChallengeLeaderboardEntry[] = [];
  if (typeof creatorScore === 'number') {
    leaderboard.push({
      id: `entry-${Date.now()}`,
      playerName: createdBy.trim() || 'Challenger',
      school: school.trim() || 'Elimika Secondary',
      score: creatorScore,
      total: quizQuestions.length,
      percentage: Math.round((creatorScore / Math.max(1, quizQuestions.length)) * 100),
      timeSeconds: Math.max(5, Number(creatorTimeSeconds) || 40),
      completedAt: new Date().toISOString().split('T')[0],
    });
  }

  const newChallenge: TopicQuizChallenge = {
    id,
    cls,
    subject,
    topic,
    createdBy: createdBy.trim() || 'Student',
    createdAt: new Date().toISOString().split('T')[0],
    questions: quizQuestions,
    leaderboard: sortLeaderboard(leaderboard),
  };

  challengesStore.set(id, newChallenge);
  return res.json({ challenge: newChallenge });
});

// Submit a score to a Challenge Leaderboard
app.post('/api/challenges/:id/submit', (req, res) => {
  const code = normalizeChallengeCode(req.params.id);
  const {
    playerName = 'Student',
    school = 'Tanzania Secondary',
    score = 0,
    total = 4,
    timeSeconds = 40,
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    topic = 'Core Competence',
  } = req.body as {
    playerName?: string;
    school?: string;
    score?: number;
    total?: number;
    timeSeconds?: number;
    cls?: string;
    subject?: string;
    topic?: string;
  };

  let challenge = challengesStore.get(code);
  if (!challenge) {
    challenge = {
      id: code,
      cls,
      subject,
      topic,
      createdBy: playerName,
      createdAt: new Date().toISOString().split('T')[0],
      questions: buildFallbackTopicQuizQuestions(cls, subject, topic),
      leaderboard: [],
    };
    challengesStore.set(code, challenge);
  }

  const cleanName = playerName.trim() || 'Anonymous Student';
  const cleanSchool = school.trim() || 'Elimika Secondary';
  const pct = Math.round((Number(score) / Math.max(1, Number(total))) * 100);
  const newEntry: ChallengeLeaderboardEntry = {
    id: `score-${Date.now()}`,
    playerName: cleanName,
    school: cleanSchool,
    score: Number(score),
    total: Number(total),
    percentage: pct,
    timeSeconds: Math.max(3, Number(timeSeconds) || 35),
    completedAt: new Date().toISOString().split('T')[0],
  };

  // Update if same player improved score, otherwise add entry
  const existingIdx = challenge.leaderboard.findIndex(
    (e) => e.playerName.toLowerCase() === cleanName.toLowerCase()
  );
  if (existingIdx >= 0) {
    const prev = challenge.leaderboard[existingIdx];
    if (
      newEntry.percentage > prev.percentage ||
      (newEntry.percentage === prev.percentage && newEntry.timeSeconds < prev.timeSeconds)
    ) {
      challenge.leaderboard[existingIdx] = newEntry;
    }
  } else {
    challenge.leaderboard.push(newEntry);
  }

  challenge.leaderboard = sortLeaderboard(challenge.leaderboard);

  return res.json({
    challenge: {
      ...challenge,
      leaderboard: challenge.leaderboard,
    },
  });
});

// Moha AI Revision Flashcards Generator Endpoint
app.post('/api/moha/flashcards', async (req, res) => {
  const { cls = 'Form 3', subject = 'Basic Mathematics' } = req.body as {
    cls?: string;
    subject?: string;
  };

  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const ai = getGenAIClient();

  if (ai) {
    try {
      const jsonText = await generateContentWithQuotaFallback(ai, {
        contents: `Generate 5 high-yield revision flashcards for Tanzanian ${cls} ${subject} covering these official TIE syllabus topics: ${syllabusTopics.join(
          '; '
        )}. Each flashcard must have an id, topic, front (clear question or concept prompt), back (concise TIE/NECTA model answer), and formulaOrKeyPoint.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                topic: { type: Type.STRING },
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                formulaOrKeyPoint: { type: Type.STRING },
              },
              required: ['id', 'topic', 'front', 'back', 'formulaOrKeyPoint'],
            },
          },
        },
      });
      if (jsonText) {
        const cards = JSON.parse(jsonText);
        if (Array.isArray(cards) && cards.length > 0) {
          return res.json({ flashcards: cards, source: 'gemini' });
        }
      }
    } catch {
      // Cleanly fall back to built-in flashcard generator below
    }
  }

  return res.json({
    flashcards: getDefaultFlashcardsForSubject(cls, subject),
    source: 'local',
  });
});

// Google Play Store Trusted Web Activity (TWA) Digital Asset Links endpoint
app.get('/.well-known/assetlinks.json', (_req, res) => {
  const packageName = process.env.ANDROID_PACKAGE_NAME || 'tz.co.elimika.app';
  const sha256Fingerprint =
    process.env.ANDROID_SHA256_FINGERPRINT ||
    '00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00';
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: [sha256Fingerprint],
      },
    },
  ]);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Elimika Tanzania server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
