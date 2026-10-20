import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GenerateVideosOperation, GoogleGenAI, Type } from '@google/genai';
import { getDocumentProxy } from 'unpdf';
import {
  buildContentIntegratedQuizQuestions,
  buildInstantOfficialDocument,
  generateLocalSmartTutorReply,
  getDefaultFlashcardsForSubject,
  getSyllabusTopicsForClassSubject,
  getTieTextbookChapterContent,
  parseClassSubjectTopicFromPrompt,
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
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
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

const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
] as const;
const modelCooldownUntil = new Map<string, number>();
let roundRobinModelCursor = 0;

// ==================== HIGH-CONCURRENCY MULTI-USER CACHE & DEDUPLICATION ====================
interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}
const MAX_CACHE_ENTRIES = 600;
const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const responseCache = new Map<string, CacheRecord<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

function getCachedValue<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCachedValue<T>(key: string, value: T, ttlMs = DEFAULT_CACHE_TTL_MS): void {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function withHighTrafficDedupe<T>(
  cacheKey: string,
  worker: () => Promise<T>,
  shouldCache?: (res: T) => boolean,
  ttlMs = DEFAULT_CACHE_TTL_MS
): Promise<T> {
  const cached = getCachedValue<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const existingInflight = inflightRequests.get(cacheKey) as Promise<T> | undefined;
  if (existingInflight) {
    return existingInflight;
  }

  const promise = (async () => {
    try {
      const result = await worker();
      if (!shouldCache || shouldCache(result)) {
        setCachedValue(cacheKey, result, ttlMs);
      }
      return result;
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, promise);
  return promise;
}

async function generateContentWithQuotaFallback(
  ai: GoogleGenAI,
  params: {
    contents: unknown;
    config?: Record<string, unknown>;
    useGoogleSearch?: boolean;
  }
): Promise<string | null> {
  const now = Date.now();
  const totalModels = GEMINI_FALLBACK_MODELS.length;
  const startIdx = roundRobinModelCursor++ % totalModels;

  for (let offset = 0; offset < totalModels; offset++) {
    const modelName = GEMINI_FALLBACK_MODELS[(startIdx + offset) % totalModels];
    const cooldown = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldown) {
      continue;
    }
    try {
      const baseConfig = params.config || {};
      const configWithTools =
        params.useGoogleSearch && !baseConfig.responseMimeType
          ? { ...baseConfig, tools: [{ googleSearch: {} }] }
          : baseConfig;

      let response;
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents as never,
          config: configWithTools as never,
        });
      } catch (innerErr) {
        if (params.useGoogleSearch) {
          // Retry without googleSearch tool if model does not support search grounding on this tier
          response = await ai.models.generateContent({
            model: modelName,
            contents: params.contents as never,
            config: baseConfig as never,
          });
        } else {
          throw innerErr;
        }
      }

      let text = response.text?.trim();
      if (text) {
        // Append verified Google Search grounding links if present
        const chunks = (
          response.candidates?.[0] as {
            groundingMetadata?: {
              groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
            };
          }
        )?.groundingMetadata?.groundingChunks;

        if (Array.isArray(chunks) && chunks.length > 0) {
          const webSources = chunks
            .map((c) => c.web)
            .filter((w): w is { uri: string; title?: string } => Boolean(w && w.uri))
            .slice(0, 3);
          if (webSources.length > 0) {
            const sourceLines = webSources
              .map((w) => `• ${w.title || 'Google Curriculum Source'} (${w.uri})`)
              .join('\n');
            text += `\n\n**🌐 Google Search Grounding Sources:**\n${sourceLines}`;
          }
        }
        return text;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        modelCooldownUntil.set(modelName, Date.now() + 15 * 60 * 1000);
        continue;
      }
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

// ==================== ATTACHED TEXTBOOKS & PAST PAPERS STORE + GOOGLE DRIVE PDF READER ====================
interface AttachedResourceServerItem {
  id: string;
  title: string;
  form: string;
  subject: string;
  year: string;
  category: string;
  paperUrl: string | null;
  answersUrl: string | null;
  isBook: boolean;
  isSyllabus: boolean;
  customContent?: string;
  attachedFileMimeType?: string;
  attachedFileBase64?: string;
  attachedFileName?: string;
  isUserAttached?: boolean;
  createdAt: string;
}

const serverAttachedResources = new Map<string, AttachedResourceServerItem>();
const drivePdfCache = new Map<string, { mimeType: string; base64Data: string; fetchedAt: number }>();
const driveExtractedPagesCache = new Map<string, { pages: string[]; totalPages: number; fetchedAt: number }>();

function extractDriveFileIdFromUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || !rawUrl.includes('drive.google.com')) return null;
  const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function extractGoogleDrivePdfText(
  rawUrl?: string | null,
  queryText = ''
): Promise<string> {
  const driveId = extractDriveFileIdFromUrl(rawUrl);
  if (!driveId) return '';

  let cachedDoc = driveExtractedPagesCache.get(driveId);
  if (!cachedDoc || Date.now() - cachedDoc.fetchedAt > 2 * 60 * 60 * 1000) {
    try {
      const dlUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(dlUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const arrBuf = await res.arrayBuffer();
        const uint8 = new Uint8Array(arrBuf);
        if (uint8.byteLength > 200 && Buffer.from(uint8.slice(0, 5)).toString('ascii') === '%PDF-') {
          const pdf = await getDocumentProxy(uint8);
          const maxPagesToScan = Math.min(pdf.numPages, 75);
          const pages: string[] = [];
          for (let p = 1; p <= maxPagesToScan; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const text = (content.items as Array<{ str?: string }>)
              .map((i) => i.str || '')
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (text.length > 20) {
              pages.push(`[Page ${p}] ${text}`);
            }
          }
          cachedDoc = { pages, totalPages: pdf.numPages, fetchedAt: Date.now() };
          driveExtractedPagesCache.set(driveId, cachedDoc);
        }
      }
    } catch {
      // ignore timeout or non-text PDF
    }
  }

  if (!cachedDoc || cachedDoc.pages.length === 0) return '';

  const tocPages = cachedDoc.pages.slice(0, 6);
  const queryWords = (queryText || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !['what', 'explain', 'give', 'from', 'with', 'book', 'tie', 'question', 'questions', 'chapter', 'topic'].includes(w));

  let matchedPages: string[] = [];
  if (queryWords.length > 0 && cachedDoc.pages.length > 6) {
    const scored = cachedDoc.pages.slice(6).map((pageText) => {
      const lowerPage = pageText.toLowerCase();
      let score = 0;
      for (const w of queryWords) {
        if (lowerPage.includes(w)) score += 3;
      }
      return { pageText, score };
    });
    matchedPages = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.pageText);
  }

  const combined = [...tocPages, ...matchedPages].join('\n\n');
  return combined.slice(0, 9500);
}

async function fetchGoogleDriveInlinePdf(
  rawUrl?: string | null
): Promise<{ mimeType: string; base64Data: string } | null> {
  const driveId = extractDriveFileIdFromUrl(rawUrl);
  if (!driveId) return null;

  const cached = drivePdfCache.get(driveId);
  if (cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) {
    return { mimeType: cached.mimeType, base64Data: cached.base64Data };
  }

  try {
    const dlUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    const res = await fetch(dlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Cap inline PDF at 8MB to stay well within Gemini request payload limits
    if (buf.byteLength < 100 || buf.byteLength > 8 * 1024 * 1024) return null;
    if (buf.slice(0, 5).toString('ascii') !== '%PDF-') return null;
    const mimeType = 'application/pdf';
    const base64Data = buf.toString('base64');
    drivePdfCache.set(driveId, { mimeType, base64Data, fetchedAt: Date.now() });
    return { mimeType, base64Data };
  } catch {
    return null;
  }
}

app.get('/api/attached-resources', (_req, res) => {
  const items = Array.from(serverAttachedResources.values()).map((r) => ({
    ...r,
    // Omit heavy base64 from list payload to keep catalog fast
    attachedFileBase64: undefined,
  }));
  res.json({ resources: items });
});

app.post('/api/attached-resources', (req, res) => {
  const body = req.body as Partial<AttachedResourceServerItem>;
  const title = (body.title || '').trim();
  const form = (body.form || 'Form 4').trim();
  const subject = (body.subject || 'Basic Mathematics').trim();
  if (!title) {
    return res.status(400).json({ error: 'Resource title is required' });
  }
  const category = (body.category || 'NECTA').trim();
  const catLower = `${category} ${title}`.toLowerCase();
  const isSyllabus = Boolean(body.isSyllabus || catLower.includes('syllabus') || catLower.includes('muhtasari'));
  const isBook =
    !isSyllabus &&
    Boolean(
      body.isBook ||
        catLower.includes('book') ||
        catLower.includes('kitabu') ||
        catLower.includes('textbook') ||
        catLower.includes('tie')
    );

  const id = body.id || `attached-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const item: AttachedResourceServerItem = {
    id,
    title,
    form,
    subject,
    year: (body.year || new Date().getFullYear().toString()).trim(),
    category: isSyllabus ? 'TIE Syllabus' : isBook ? 'TIE Book' : category,
    paperUrl: body.paperUrl || null,
    answersUrl: body.answersUrl || null,
    isBook,
    isSyllabus,
    customContent: body.customContent || '',
    attachedFileMimeType: body.attachedFileMimeType,
    attachedFileBase64: body.attachedFileBase64,
    attachedFileName: body.attachedFileName,
    isUserAttached: true,
    createdAt: new Date().toISOString().split('T')[0],
  };
  serverAttachedResources.set(id, item);
  return res.json({
    resource: {
      ...item,
      attachedFileBase64: undefined,
    },
  });
});

app.delete('/api/attached-resources/:id', (req, res) => {
  const { id } = req.params;
  serverAttachedResources.delete(id);
  return res.json({ deleted: true, id });
});

// Moha AI Chat & Multimodal Textbook / Past Paper Solver Endpoint
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
    image?: { mimeType: string; base64Data: string; fileName?: string } | null;
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

  // Parse any specific Class, Subject, or Topic mentioned in the user's prompt (e.g., "generate quiz for Form 2 Math on Logarithms")
  const parsedTarget = parseClassSubjectTopicFromPrompt(userPrompt, cls, subject);
  const effectiveCls = siteResources?.focusedResource?.form || parsedTarget.cls;
  const effectiveSubject = siteResources?.focusedResource?.subject || parsedTarget.subject;
  const effectiveTopic = parsedTarget.topic;
  const effectiveSubTopic = parsedTarget.subTopic;

  const isQuizRequest =
    /\b(quiz|questions|maswali|test me|exercise|practice)\b/i.test(userPrompt);

  const ai = getGenAIClient();
  const syllabusTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSubject);
  const textbookChapterInfo = getTieTextbookChapterContent(effectiveCls, effectiveSubject, userPrompt);
  const learnedContext =
    learnedMemory.length > 0
      ? `\n\nTeacher/Student Custom Learned Memory:\n${learnedMemory
          .slice(0, 20)
          .map((m) => `- ${m.topic} (${m.cls} ${m.subject}): ${m.content}`)
          .join('\n')}`
      : '';

  const focusedRes = siteResources?.focusedResource;
  const serverStoredFocused = focusedRes?.id ? serverAttachedResources.get(focusedRes.id) : undefined;
  const primaryBookForSubject = siteResources?.books?.find((b) => b.paperUrl) || siteResources?.books?.[0];
  const primarySyllabusForSubject = siteResources?.syllabuses?.find((s) => s.paperUrl) || siteResources?.syllabuses?.[0];

  // Automatically extract PDF text from focused resource OR the subject's uploaded TIE Book / Syllabus
  const pdfUrlToExtract =
    focusedRes?.paperUrl ||
    primaryBookForSubject?.paperUrl ||
    primarySyllabusForSubject?.paperUrl ||
    null;

  const extractedPdfText = pdfUrlToExtract
    ? await extractGoogleDrivePdfText(pdfUrlToExtract, `${effectiveTopic} ${userPrompt}`)
    : '';

  const mergedCustomContent = [
    focusedRes?.customContent,
    serverStoredFocused?.customContent,
    primaryBookForSubject?.customContent,
    extractedPdfText,
  ]
    .filter(Boolean)
    .join('\n\n');

  const focusedResourceBlock = focusedRes
    ? `\n\nPRIMARY PINNED / ATTACHED DOCUMENT TO INTERACT WITH:
- Title: "${focusedRes.title}"
- Category: ${focusedRes.category} | Class: ${focusedRes.form} | Subject: ${focusedRes.subject} | Year: ${focusedRes.year}
- Direct Document Link: ${focusedRes.paperUrl || 'Attached in Elimika Catalog'}${
        mergedCustomContent
          ? `\n- Extracted Textbook / Document Content:\n${mergedCustomContent.slice(0, 9500)}`
          : ''
      }`
    : mergedCustomContent
    ? `\n\nEXTRACTED CONTENT FROM UPLOADED ${effectiveCls.toUpperCase()} ${effectiveSubject.toUpperCase()} TIE TEXTBOOK / SYLLABUS:\n${mergedCustomContent.slice(0, 9500)}`
    : '';

  const siteResourcesContext = siteResources
    ? `\n\nUploaded & Attached Elimika Website Resources Integrated for ${effectiveCls} ${effectiveSubject}:${focusedResourceBlock}
- TIE Textbooks Available: ${
        siteResources.books.map((b) => `${b.title} (${b.form} ${b.subject})`).join('; ') ||
        `Official TIE ${effectiveCls} ${effectiveSubject} Student's Book`
      }
- Official Syllabuses Available: ${
        siteResources.syllabuses.map((s) => `${s.title} (${s.form} ${s.subject})`).join('; ') ||
        `Official TIE ${effectiveCls} ${effectiveSubject} Syllabus`
      }
- Past Examination Papers Available: ${
        siteResources.papers.map((p) => `${p.title} [${p.category} ${p.year}]`).join('; ') ||
        `NECTA ${effectiveCls} ${effectiveSubject} Past Papers`
      }`
    : '';

  const topicQuizQuestions = isQuizRequest
    ? buildContentIntegratedQuizQuestions(
        effectiveCls,
        effectiveSubject,
        effectiveTopic,
        siteResources,
        effectiveSubTopic
      )
    : undefined;

  if (ai) {
    try {
      let activeInlineFile: { mimeType: string; base64Data: string } | null =
        image && image.base64Data && image.mimeType
          ? { mimeType: image.mimeType, base64Data: image.base64Data }
          : null;

      if (!activeInlineFile && serverStoredFocused?.attachedFileBase64 && serverStoredFocused?.attachedFileMimeType) {
        activeInlineFile = {
          mimeType: serverStoredFocused.attachedFileMimeType,
          base64Data: serverStoredFocused.attachedFileBase64,
        };
      }

      // Only fetch raw inline PDF if unpdf didn't already extract text and the PDF is small (<8MB)
      if (!activeInlineFile && !extractedPdfText && focusedRes?.paperUrl) {
        activeInlineFile = await fetchGoogleDriveInlinePdf(focusedRes.paperUrl);
      }

      const chatCacheKey =
        !activeInlineFile
          ? `chat:${effectiveCls}:${effectiveSubject}:${effectiveTopic}:${focusedRes?.title || 'ALL'}:${userPrompt.toLowerCase().slice(0, 220)}`
          : '';

      const runChatGeneration = async () => {
        const systemInstruction = `You are Moha AI, the official Tanzanian TIE (Tanzania Institute of Education) & NECTA Assistant for ${effectiveCls} ${effectiveSubject}.
Specified Class: ${effectiveCls}
Specified Subject: ${effectiveSubject}
Specified Textbook Chapter / Topic: ${textbookChapterInfo.matchedChapter}${
          focusedRes ? `\nActive Pinned Textbook / Past Paper: "${focusedRes.title}" (${focusedRes.category} · ${focusedRes.year})` : ''
        }

OFFICIAL TIE STUDENT'S TEXTBOOK CHAPTERS & TOPICS FOR ${effectiveCls.toUpperCase()} ${effectiveSubject.toUpperCase()}:
${syllabusTopics.map((t) => `- ${t}`).join('\n')}
${siteResourcesContext}${learnedContext}

CRITICAL TIE TEXTBOOK, PAST PAPER & MATHJAX RULES:
1. You MUST strictly refer to the chapters, topics, sub-topics, definitions, laws, and examples from the uploaded Official TIE ${effectiveCls} ${effectiveSubject} Student's Textbook (${textbookChapterInfo.bookTitle}) listed above.${
          focusedRes
            ? ` Because the user has pinned or attached "${focusedRes.title}", directly reference, quote, analyze, and solve problems from "${focusedRes.title}"!`
            : ''
        }
2. When the user asks about topics, chapters, summaries, or notes for ${effectiveCls} ${effectiveSubject}, ALWAYS list the exact Official TIE Textbook Chapters shown above and explain the matched chapter (${textbookChapterInfo.matchedChapter}) thoroughly with textbook definitions and worked examples.
3. Arrange every answer into 3 clear, numbered sections:
   **1. 📌 Official TIE Textbook Chapter & Direct Concept (${effectiveCls} • ${textbookChapterInfo.matchedChapter}):** State the exact TIE Textbook chapter, sub-topics, and core definitions.
   **2. 📐 Detailed Explanation / Step-by-Step Worked Examples:** Use numbered steps (Step 1, Step 2, Step 3) or clear bullet points (•) grounded in the TIE Student's Book.
   **3. ✅ NECTA Marking Tip & Integrated TIE Textbook Reference:** Show how marks are awarded (e.g., [02 Marks]) and cite the uploaded TIE Textbook and Past Papers.
4. LESSON NOTES RULE: Never put Lesson Notes or study notes inside a table. Format Lesson Notes with clean numbered headings, well-spaced paragraphs, bullet points (•), and step-by-step worked examples.
5. STRICT MATHJAX RULE: ALWAYS format all mathematical expressions, equations, fractions (\\frac{a}{b}), square roots (\\sqrt{x}), exponents (x^2), subscripts (a_1), logarithms (\\log_{10}(x)), trigonometry (\\sin\\theta, \\cos\\theta), derivatives (\\frac{dy}{dx}), integrals (\\int), vectors, and physics/chemistry formulas using LaTeX MathJax delimiters ($...$ for inline math and $$...$$ for display equations).`;

        const recentHistoryParts = history
          .filter((h) => !h.text.includes('official-tie-doc') && h.id !== 'msg-welcome')
          .slice(-6)
          .map((h) => `${h.role === 'user' ? 'Student/Teacher' : 'Moha AI'}: ${h.text}`)
          .join('\n\n');

        const fullPromptText = recentHistoryParts
          ? `Previous conversation context:\n${recentHistoryParts}\n\nCurrent Request (Class: ${effectiveCls}, Subject: ${effectiveSubject}, TIE Textbook Chapter: ${textbookChapterInfo.matchedChapter}${focusedRes ? `, Attached Source: "${focusedRes.title}"` : ''}):\n${userPrompt}`
          : `Class: ${effectiveCls} | Subject: ${effectiveSubject} | TIE Textbook Chapter: ${textbookChapterInfo.matchedChapter}${focusedRes ? ` | Attached Resource: "${focusedRes.title}"` : ''}\nRequest: ${userPrompt}`;

        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
        if (activeInlineFile && activeInlineFile.base64Data && activeInlineFile.mimeType) {
          parts.push({
            inlineData: {
              mimeType: activeInlineFile.mimeType,
              data: activeInlineFile.base64Data,
            },
          });
        }
        parts.push({ text: fullPromptText });

        return generateContentWithQuotaFallback(ai, {
          contents: { parts },
          config: {
            systemInstruction,
            temperature: 0.35,
          },
          useGoogleSearch: !activeInlineFile,
        });
      };

      const replyText = chatCacheKey
        ? await withHighTrafficDedupe(
            chatCacheKey,
            runChatGeneration,
            (val) => Boolean(val && val.length > 0)
          )
        : await runChatGeneration();

      if (replyText && replyText.length > 0) {
        return res.json({
          reply: replyText,
          source: 'gemini',
          parsedTarget,
          quizQuestions: topicQuizQuestions,
        });
      }
    } catch {
      // Fallback to built-in curriculum engine below
    }
  }

  // Fallback to built-in curriculum engine (which generates distinct topic-, class-, and resource-specific questions!)
  const fallbackReply = generateLocalSmartTutorReply(
    userPrompt,
    effectiveCls,
    effectiveSubject,
    learnedMemory,
    siteResources
  );
  return res.json({
    reply: fallbackReply,
    source: 'local',
    parsedTarget,
    quizQuestions: topicQuizQuestions,
  });
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
        const docCacheKey = `doc:lessonnotes:${meta.cls}:${meta.subject}:${meta.topic}:${meta.subTopic}`;
        const jsonText = await withHighTrafficDedupe(
          docCacheKey,
          () =>
            generateContentWithQuotaFallback(ai, {
              contents: `Create comprehensive official Tanzanian TIE Lesson Notes for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}. Integrate concepts from the TIE textbook, official syllabus, and past examination papers (${resourceSummary}). Include 3 detailed keyConcepts, 2 step-by-step workedExamples, and 3 NECTA-style practiceQuestions with marking hints. STRICT MATHJAX RULE: Format all mathematical expressions, formulas, fractions (\\frac{a}{b}), roots (\\sqrt{x}), exponents (x^2), logarithms (\\log_{10}(x)), and scientific equations inside $...$ inline LaTeX delimiters.`,
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
            }),
          (val) => Boolean(val && val.length > 10)
        );
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

// Helper to build NECTA-aligned fallback questions for a class, subject, specific topic, subTopic, and site resources
function buildFallbackTopicQuizQuestions(
  cls: string,
  subject: string,
  topic?: string,
  siteResources?: SiteResourceContext,
  subTopic?: string,
  sourceFilter: 'ALL' | 'BOOK' | 'PAPER' | 'textbook' | 'past_paper' = 'ALL'
) {
  return buildContentIntegratedQuizQuestions(cls, subject, topic, siteResources, subTopic, sourceFilter);
}

// Moha AI Interactive Quiz & Game Question Generator Endpoint (integrates specific topic, subTopic & uploaded website books/past papers)
app.post('/api/moha/quiz', async (req, res) => {
  const {
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    topic,
    subTopic,
    sourceFilter = 'ALL',
    siteResources,
    count = 20,
    specificResourceTitle,
  } = req.body as {
    cls?: string;
    subject?: string;
    topic?: string;
    subTopic?: string;
    sourceFilter?: 'ALL' | 'BOOK' | 'PAPER' | 'textbook' | 'past_paper';
    siteResources?: SiteResourceContext;
    count?: number;
    specificResourceTitle?: string;
  };

  const targetCount = Math.min(25, Math.max(4, Number(count) || 20));
  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const tbInfo = getTieTextbookChapterContent(cls, subject, topic && topic !== 'ALL' ? topic : '');
  const selectedTopicText =
    topic && topic !== 'ALL'
      ? `focusing specifically on TIE Textbook Chapter / Topic "${tbInfo.matchedChapter}" (${topic})${subTopic && subTopic !== 'ALL' ? ` and Sub-Topic "${subTopic}"` : ''}`
      : `covering these official TIE Student's Textbook chapters for ${cls} ${subject}: ${syllabusTopics.join('; ')}`;

  const focusedRes = siteResources?.focusedResource;
  const primaryBook = siteResources?.books?.find((b) => b.paperUrl) || siteResources?.books?.[0];
  const effectiveResourceTitle =
    (specificResourceTitle && specificResourceTitle !== 'ALL' ? specificResourceTitle : undefined) ||
    focusedRes?.title ||
    primaryBook?.title ||
    tbInfo.bookTitle;

  const pdfUrlForQuiz = focusedRes?.paperUrl || primaryBook?.paperUrl || null;
  const extractedQuizPdfText = pdfUrlForQuiz
    ? await extractGoogleDrivePdfText(pdfUrlForQuiz, `${topic || ''} ${subTopic || ''}`)
    : '';

  const mergedQuizText = [focusedRes?.customContent, primaryBook?.customContent, extractedQuizPdfText]
    .filter(Boolean)
    .join('\n\n');

  const specificResourceLine = `PRIMARY ATTACHED TIE TEXTBOOK / SOURCE: Base the questions directly on "${effectiveResourceTitle}" for ${cls} ${subject} (Chapter: ${tbInfo.matchedChapter}).${
    mergedQuizText ? `\nExtracted Textbook / Document Content:\n${mergedQuizText.slice(0, 6500)}` : ''
  }`;

  const sourceConstraintText =
    sourceFilter === 'BOOK' || sourceFilter === 'textbook'
      ? `All ${targetCount} questions MUST be solving/workout exercises grounded in the uploaded Official TIE ${cls} ${subject} Textbook (${tbInfo.bookTitle}).`
      : sourceFilter === 'PAPER' || sourceFilter === 'past_paper'
      ? `All ${targetCount} questions MUST be examination problem-solving questions grounded in the uploaded ${cls} ${subject} NECTA / Mock Past Papers.`
      : `Odd-numbered questions MUST be solving exercises from the uploaded Official TIE ${cls} ${subject} Textbook (${tbInfo.bookTitle}), and even-numbered questions MUST be problem-solving questions from the uploaded ${cls} ${subject} Past Examination Papers.`;

  const availableContentSummary = siteResources
    ? `Uploaded Website Books & Past Papers for ${cls} ${subject}:
- Official TIE Textbook Chapters: ${syllabusTopics.join('; ')}
- Uploaded TIE Books: ${siteResources.books.map((b) => b.title).join(', ') || tbInfo.bookTitle}
- Uploaded Syllabuses: ${siteResources.syllabuses.map((s) => s.title).join(', ') || `Official TIE ${cls} ${subject} Syllabus`}
- Uploaded Past Papers: ${siteResources.papers.map((p) => `${p.title} (${p.year})`).join(', ') || `NECTA ${cls} ${subject} Past Papers`}`
    : '';

  const ai = getGenAIClient();

  if (ai) {
    try {
      const quizCacheKey = `quiz:${cls}:${subject}:${topic || 'ALL'}:${subTopic || 'ALL'}:${sourceFilter}:${targetCount}:${effectiveResourceTitle || 'ALL'}`;
      const jsonText = await withHighTrafficDedupe(
        quizCacheKey,
        async () => {
          const promptText = `Generate ${targetCount} distinct, concrete problem-solving / workout questions for Tanzanian ${cls} ${subject} ${selectedTopicText}.
${specificResourceLine}
${sourceConstraintText}
${availableContentSummary}
IMPORTANT RULES:
1. Every question MUST be strictly for ${cls} ${subject} and specifically on ${topic && topic !== 'ALL' ? `"${tbInfo.matchedChapter}"` : `the ${cls} ${subject} TIE textbook chapters`} — never return generic questions from another topic or class.
2. Vary the correct answer position across options 0, 1, 2, and 3 so the correct answer is NOT always index 0.
3. STRICT MATHJAX RULE: Format all mathematical expressions, equations, fractions (\\frac{a}{b}), roots (\\sqrt{x}), exponents (x^2), logarithms (\\log_{10}(x)), integrals, derivatives, and scientific formulas inside $...$ inline LaTeX delimiters in "question", "options", and "explanation".
4. Provide 4 clear options, correctIndex (0 to 3), a step-by-step worked solution in "explanation" (Step 1 -> Step 2 -> Final Answer), the "topic", the "subTopic", and the exact uploaded Book or Past Paper title in "sourceRef".`;

          let inlinePdf: { mimeType: string; base64Data: string } | null = null;
          if (!extractedQuizPdfText && focusedRes?.paperUrl) {
            inlinePdf = await fetchGoogleDriveInlinePdf(focusedRes.paperUrl);
          }

          const contentsPayload = inlinePdf
            ? {
                parts: [
                  { inlineData: { mimeType: inlinePdf.mimeType, data: inlinePdf.base64Data } },
                  { text: promptText },
                ],
              }
            : promptText;

          return generateContentWithQuotaFallback(ai, {
            contents: contentsPayload,
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
                    subTopic: { type: Type.STRING },
                    sourceRef: { type: Type.STRING },
                  },
                  required: ['question', 'options', 'correctIndex', 'explanation', 'topic', 'subTopic', 'sourceRef'],
                },
              },
            },
          });
        },
        (val) => Boolean(val && val.length > 10)
      );
      if (jsonText) {
        const questions = JSON.parse(jsonText);
        if (Array.isArray(questions) && questions.length > 0) {
          if (questions.length < targetCount) {
            const padPool = buildFallbackTopicQuizQuestions(
              cls,
              subject,
              topic,
              siteResources,
              subTopic,
              sourceFilter
            );
            const merged = [...questions];
            for (const p of padPool) {
              if (merged.length >= targetCount) break;
              if (!merged.some((m) => m.question === p.question)) {
                merged.push(p);
              }
            }
            return res.json({ questions: merged.slice(0, targetCount), source: 'gemini' });
          }
          return res.json({ questions: questions.slice(0, targetCount), source: 'gemini' });
        }
      }
    } catch {
      // Cleanly fall back to built-in NECTA topic quiz generator below
    }
  }

  const baseQuestions = buildFallbackTopicQuizQuestions(cls, subject, topic, siteResources, subTopic, sourceFilter);
  if (targetCount > baseQuestions.length) {
    const extraTopic = syllabusTopics.find((t) => t !== topic) || topic;
    const extraQuestions = buildFallbackTopicQuizQuestions(cls, subject, extraTopic, siteResources, undefined, sourceFilter);
    return res.json({
      questions: [...baseQuestions, ...extraQuestions].slice(0, targetCount),
      source: 'local',
    });
  }

  return res.json({
    questions: baseQuestions.slice(0, targetCount),
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
        { playerName: 'Amina Juma', school: 'Ilboru Secondary', score: 20, total: 20, timeSeconds: 138 },
        { playerName: 'Kelvin Massawe', school: 'Mzumbe Secondary', score: 19, total: 20, timeSeconds: 152 },
        { playerName: 'Neema Mwakyusa', school: 'Jangwani Secondary', score: 18, total: 20, timeSeconds: 164 },
      ],
    },
    {
      id: 'PHYS-204',
      cls: 'Form 3',
      subject: 'Physics',
      topic: 'Current Electricity (Ohm’s Law)',
      createdBy: 'Baraka Mushi',
      entries: [
        { playerName: 'Baraka Mushi', school: 'Kibaha Secondary', score: 20, total: 20, timeSeconds: 134 },
        { playerName: 'Fatuma Ally', school: 'Feza Girls', score: 19, total: 20, timeSeconds: 149 },
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
    total = 20,
    timeSeconds = 120,
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
      const flashcardCacheKey = `flashcards:${cls}:${subject}`;
      const jsonText = await withHighTrafficDedupe(
        flashcardCacheKey,
        () =>
          generateContentWithQuotaFallback(ai, {
            contents: `Generate 5 high-yield revision flashcards for Tanzanian ${cls} ${subject} covering these official TIE syllabus topics: ${syllabusTopics.join(
              '; '
            )}. Each flashcard must have an id, topic, front (clear question or concept prompt), back (concise TIE/NECTA model answer), and formulaOrKeyPoint. STRICT MATHJAX RULE: Format all mathematical expressions, formulas, fractions (\\frac{a}{b}), exponents (x^2), roots (\\sqrt{x}), and scientific equations inside $...$ inline LaTeX delimiters.`,
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
          }),
        (val) => Boolean(val && val.length > 10)
      );
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

// ==================== VEO 3.1 PHOTO-TO-VIDEO 3-STEP ENDPOINTS ====================
app.post('/api/generate-video', async (req, res) => {
  const {
    prompt = 'Animate this image with smooth cinematic motion',
    imageBase64,
    imageMimeType = 'image/png',
    aspectRatio = '16:9',
  } = req.body as {
    prompt?: string;
    imageBase64?: string;
    imageMimeType?: string;
    aspectRatio?: '16:9' | '9:16';
  };

  const validAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
  const ai = getGenAIClient();
  if (!ai) {
    return res.status(400).json({
      error: 'Gemini API key is not configured on the server. Please configure GEMINI_API_KEY in Settings > Secrets.',
    });
  }

  try {
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      ...(imageBase64
        ? {
            image: {
              imageBytes: imageBase64,
              mimeType: imageMimeType,
            },
          }
        : {}),
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validAspect,
      },
    });
    return res.json({ operationName: operation.name });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to start Veo video generation.',
    });
  }
});

app.post('/api/video-status', async (req, res) => {
  const { operationName } = req.body as { operationName?: string };
  if (!operationName) {
    return res.status(400).json({ error: 'Missing operationName' });
  }
  const ai = getGenAIClient();
  if (!ai) {
    return res.status(400).json({ error: 'Gemini API key not configured' });
  }
  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({ done: Boolean(updated.done) });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to check video operation status.',
    });
  }
});

app.post('/api/video-download', async (req, res) => {
  const { operationName } = req.body as { operationName?: string };
  if (!operationName) {
    return res.status(400).json({ error: 'Missing operationName' });
  }
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';
  const ai = getGenAIClient();
  if (!ai || !apiKey) {
    return res.status(400).json({ error: 'Gemini API key not configured' });
  }
  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Generated video URI not found in completed operation.' });
    }
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey.trim() },
    });
    if (!videoRes.ok || !videoRes.body) {
      return res.status(502).json({ error: `Failed to fetch video stream (${videoRes.status})` });
    }
    res.setHeader('Content-Type', 'video/mp4');
    await videoRes.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to download generated video.',
    });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
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

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
