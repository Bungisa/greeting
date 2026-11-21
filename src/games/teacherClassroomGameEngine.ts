import { FULL_EXTRACTED_TEXTBOOK_BANK } from '../data/extractedTextbookExerciseBank';
import {
  getSubTopicsForMainTopic,
  getSyllabusTopicsForClassSubject,
  PaperRecord,
  TIE_CURRICULUM_SUBJECTS,
} from '../data/curriculumData';
import {
  computeQuestionSignature,
  getStoredBankQuestionsForClassSubject,
} from '../utils/questionBankManager';
import {
  GameDifficulty,
  getAvailableSubjectsForClass,
  getAvailableTopicsForClassSubject,
  getQuestionsForTreasureHunt,
  PLAY_CLASSES,
  PLAY_SUBJECTS,
} from './gameDataAndStorage';
import { TIE_LEVEL_TEXTBOOK_BANK } from './tieTextbookQuestionEngine';
import type { ElimikaBattleThemeId } from './elimikaBattleThemes';

export type ClassroomQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type ClassroomQuestionSource = 'custom' | 'bank' | 'ai';
export type ClassroomQuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ClassroomCreationOption = 'custom' | 'bank' | 'mix';

export interface ClassroomGameQuestion {
  id: string;
  signature: string;
  source: ClassroomQuestionSource;
  questionType: ClassroomQuestionType;
  subject: string;
  cls: string;
  topic: string;
  subTopic: string;
  difficulty: ClassroomQuestionDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  shortAnswer: string;
  explanation: string;
  hint?: string;
  points: number;
  imageUrl?: string;
  sourceRef?: string;
}

export interface ClassroomGameCustomization {
  questionCount: number;
  teamCount: number; // 2 to 6
  teamNames: string[]; // length 2 to 6
  questionOrder: 'manual' | 'random';
  difficultyFilter: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  pointsMode: 'per_question' | 'uniform';
  uniformPoints: number;
  allowNegativeDeduction: boolean;
  timerEnabled: boolean;
  timerSeconds: number;
  answerRevealMode: 'manual' | 'on_select' | 'on_timer_end';
  showExplanationOnReveal: boolean;
  answerDisplayMode?: 'answer_only' | 'multiple_choice';
  luckyBoxesEnabled?: boolean;
  luckyBoxCount?: number;
  boardTheme?: ElimikaBattleThemeId;
}

export interface SavedTeacherClassroomGame {
  id: string;
  title: string;
  subject: string;
  cls: string;
  topic: string;
  subTopic?: string;
  creationMode: ClassroomCreationOption;
  questions: ClassroomGameQuestion[];
  customization: ClassroomGameCustomization;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomTeamStanding {
  id: string;
  name: string;
  colorHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  score: number;
  correctCount: number;
  deductCount: number;
  rank?: number;
}

export interface ClassroomGameSessionResult {
  id: string;
  gameId: string;
  gameTitle: string;
  subject: string;
  cls: string;
  topic: string;
  teams: ClassroomTeamStanding[];
  totalTiles: number;
  playedTilesCount: number;
  completedAt: string;
}

export interface QuestionBankFilterCriteria {
  subject: string;
  cls: string;
  topic: string;
  subTopic: string;
  difficulty: 'ALL' | ClassroomQuestionDifficulty;
  questionType: 'ALL' | ClassroomQuestionType;
  searchQuery: string;
}

export const DEFAULT_TEAM_PRESETS: Array<{
  defaultName: string;
  colorHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}> = [
  {
    defaultName: 'Team Kilimanjaro',
    colorHex: '#2563EB',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600',
  },
  {
    defaultName: 'Team Serengeti',
    colorHex: '#EA580C',
    bgClass: 'bg-orange-600',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600',
  },
  {
    defaultName: 'Team Zanzibar',
    colorHex: '#059669',
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600',
  },
  {
    defaultName: 'Team Ngorongoro',
    colorHex: '#7C3AED',
    bgClass: 'bg-violet-600',
    borderClass: 'border-violet-500',
    textClass: 'text-violet-600',
  },
  {
    defaultName: 'Team Victoria',
    colorHex: '#D97706',
    bgClass: 'bg-amber-600',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
  },
  {
    defaultName: 'Team Meru',
    colorHex: '#E11D48',
    bgClass: 'bg-rose-600',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600',
  },
];

export const MATH_NOTATION_SNIPPETS: Array<{
  label: string;
  display: string;
  snippet: string;
}> = [
  { label: 'Fraction', display: 'a/b', snippet: '$\\frac{a}{b}$' },
  { label: 'Exponent', display: 'x²', snippet: '$x^2$' },
  { label: 'Square Root', display: '√x', snippet: '$\\sqrt{x}$' },
  { label: 'Nth Root', display: 'ⁿ√x', snippet: '$\\sqrt[n]{x}$' },
  { label: 'Subscript', display: 'x₁', snippet: '$x_1$' },
  { label: 'Multiply', display: '×', snippet: '$\\times$' },
  { label: 'Divide', display: '÷', snippet: '$\\div$' },
  { label: 'Plus/Minus', display: '±', snippet: '$\\pm$' },
  { label: 'Pi', display: 'π', snippet: '$\\pi$' },
  { label: 'Theta', display: 'θ', snippet: '$\\theta$' },
  { label: 'Degrees', display: '°', snippet: '$^\\circ$' },
  { label: 'Logarithm', display: 'log₁₀', snippet: '$\\log_{10}(x)$' },
  { label: 'Inequality', display: '≤ / ≥', snippet: '$\\le$' },
  { label: 'Vector', display: 'v⃗', snippet: '$\\vec{v}$' },
  { label: 'Integral', display: '∫', snippet: '$\\int_{a}^{b} f(x)\\,dx$' },
  { label: '2×2 Matrix', display: '[a b; c d]', snippet: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$' },
];

const SAVED_GAMES_STORAGE_KEY = 'elimika_teacher_classroom_games_v1';
const SAVED_RESULTS_STORAGE_KEY = 'elimika_teacher_classroom_results_v1';

export function createDefaultCustomization(availableCount = 12): ClassroomGameCustomization {
  const safeMax = Math.max(1, availableCount);
  return {
    questionCount: Math.min(12, safeMax),
    teamCount: 2,
    teamNames: DEFAULT_TEAM_PRESETS.map((t) => t.defaultName),
    questionOrder: 'manual',
    difficultyFilter: 'Mixed',
    pointsMode: 'per_question',
    uniformPoints: 20,
    allowNegativeDeduction: false,
    timerEnabled: false,
    timerSeconds: 45,
    answerRevealMode: 'manual',
    showExplanationOnReveal: true,
    answerDisplayMode: 'answer_only',
    luckyBoxesEnabled: true,
    luckyBoxCount: 4,
    boardTheme: 'numbers',
  };
}

export function normalizeClassroomQuestionSignature(
  questionText: string,
  questionType: ClassroomQuestionType = 'multiple_choice'
): string {
  const baseSig = computeQuestionSignature(questionText);
  return `${questionType}::${baseSig || questionText.trim().toLowerCase().slice(0, 120)}`;
}

export function isDuplicateInGameRoster(
  candidate: { id?: string; question: string; questionType?: ClassroomQuestionType },
  existingRoster: ClassroomGameQuestion[]
): boolean {
  const candidateSig = normalizeClassroomQuestionSignature(
    candidate.question,
    candidate.questionType || 'multiple_choice'
  );
  const rawBaseSig = computeQuestionSignature(candidate.question);
  return existingRoster.some((item) => {
    if (candidate.id && item.id === candidate.id) return true;
    if (item.signature === candidateSig) return true;
    const itemBaseSig = computeQuestionSignature(item.question);
    return Boolean(rawBaseSig && itemBaseSig && rawBaseSig === itemBaseSig && item.questionType === (candidate.questionType || 'multiple_choice'));
  });
}

function inferDifficultyFromQuestion(text: string, idx: number): ClassroomQuestionDifficulty {
  const len = text.length;
  if (
    /\\int|\\frac\{d|\\begin\{pmatrix\}|simultaneous|determinant|asymptote|contrapositive|half-life|faraday|titration/i.test(
      text
    ) ||
    len > 180
  ) {
    return 'Hard';
  }
  if (len < 95 && idx % 3 === 0) {
    return 'Easy';
  }
  return idx % 3 === 0 ? 'Easy' : idx % 3 === 1 ? 'Medium' : 'Hard';
}

function defaultPointsForDifficulty(diff: ClassroomQuestionDifficulty): number {
  if (diff === 'Easy') return 10;
  if (diff === 'Medium') return 20;
  return 30;
}

/**
 * Extracts a clean short answer string when an option is concise enough for a Short-Answer question.
 */
function extractShortAnswerFromOption(rawOpt: string): string | null {
  const cleaned = String(rawOpt || '')
    .replace(/\$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .trim();
  if (!cleaned || cleaned.length > 42) return null;
  // Exclude complex multi-clause descriptions
  if (cleaned.split(/\s+/).length > 5) return null;
  return cleaned;
}

let cachedUnifiedQuestionBank: ClassroomGameQuestion[] | null = null;

/**
 * Builds the real, non-duplicated Elimika Question Bank from:
 * 1. FULL_EXTRACTED_TEXTBOOK_BANK (Official TIE Student's Textbooks across Form 1–6)
 * 2. TIE_LEVEL_TEXTBOOK_BANK (Level-specific TIE textbook chapters)
 * 3. Stored textbook questions & curriculum engine
 *
 * Includes Multiple-Choice, True/False, and Short-Answer questions so teachers can filter by any question type.
 */
export function getUnifiedElimikaQuestionBank(
  customServerQuestions: ClassroomGameQuestion[] = []
): ClassroomGameQuestion[] {
  if (!cachedUnifiedQuestionBank) {
    const bank: ClassroomGameQuestion[] = [];
    const seenSigs = new Set<string>();

    const pushUnique = (q: ClassroomGameQuestion) => {
      if (!q.question || !q.signature || seenSigs.has(q.signature)) return;
      seenSigs.add(q.signature);
      bank.push(q);
    };

    // 1. Official Extracted TIE Textbook Exercise Bank
    FULL_EXTRACTED_TEXTBOOK_BANK.forEach((seed, idx) => {
      const difficulty = inferDifficultyFromQuestion(seed.question, idx);
      const points = defaultPointsForDifficulty(difficulty);
      const mcSig = normalizeClassroomQuestionSignature(seed.question, 'multiple_choice');

      pushUnique({
        id: `bank-mc-${seed.id}`,
        signature: mcSig,
        source: 'bank',
        questionType: 'multiple_choice',
        subject: seed.subject,
        cls: seed.cls,
        topic: seed.topic,
        subTopic: seed.subTopic || 'Core Exercise',
        difficulty,
        question: seed.question,
        options: [...seed.options],
        correctIndex: seed.correctIndex,
        shortAnswer: seed.options[seed.correctIndex] || seed.options[0] || '',
        explanation: seed.explanation,
        hint: seed.hint,
        points,
        sourceRef: `${seed.textbookTitle} (${seed.exerciseRef})`,
      });

      // Derive authentic True/False & Short-Answer variants for textbook items so Question Type filter has rich coverage
      const correctOpt = seed.options[seed.correctIndex] || seed.options[0];
      const wrongOpt = seed.options[(seed.correctIndex + 1) % seed.options.length] || seed.options[1];

      if (idx % 3 === 0 && correctOpt && wrongOpt) {
        const isTrueStatement = idx % 2 === 0;
        const shownValue = isTrueStatement ? correctOpt : wrongOpt;
        const cleanPrompt = seed.question.replace(/^\[[^\]]+\]\s*/, '');
        const tfQuestionText = `True or False: For the problem "${cleanPrompt}", the correct result is ${shownValue}.`;
        const tfSig = normalizeClassroomQuestionSignature(tfQuestionText, 'true_false');
        pushUnique({
          id: `bank-tf-${seed.id}`,
          signature: tfSig,
          source: 'bank',
          questionType: 'true_false',
          subject: seed.subject,
          cls: seed.cls,
          topic: seed.topic,
          subTopic: seed.subTopic || 'True / False Verification',
          difficulty,
          question: tfQuestionText,
          options: ['True', 'False'],
          correctIndex: isTrueStatement ? 0 : 1,
          shortAnswer: isTrueStatement ? 'True' : 'False',
          explanation: `${isTrueStatement ? 'True.' : `False — the correct answer is ${correctOpt}.`} ${seed.explanation}`,
          hint: seed.hint,
          points,
          sourceRef: `${seed.textbookTitle} (${seed.exerciseRef})`,
        });
      }

      if (idx % 2 === 0 && correctOpt) {
        const shortAns = extractShortAnswerFromOption(correctOpt);
        if (shortAns) {
          const saSig = normalizeClassroomQuestionSignature(seed.question, 'short_answer');
          pushUnique({
            id: `bank-sa-${seed.id}`,
            signature: saSig,
            source: 'bank',
            questionType: 'short_answer',
            subject: seed.subject,
            cls: seed.cls,
            topic: seed.topic,
            subTopic: seed.subTopic || 'Short-Answer Problem',
            difficulty,
            question: seed.question,
            options: [correctOpt],
            correctIndex: 0,
            shortAnswer: shortAns,
            explanation: seed.explanation,
            hint: seed.hint,
            points: points + 5,
            sourceRef: `${seed.textbookTitle} (${seed.exerciseRef})`,
          });
        }
      }
    });

    // 2. Curated Level-Specific TIE Textbook Bank across Form 1–6 & Subjects
    TIE_LEVEL_TEXTBOOK_BANK.forEach((seed, idx) => {
      const difficulty = inferDifficultyFromQuestion(seed.question, idx);
      const points = defaultPointsForDifficulty(difficulty);
      const mcSig = normalizeClassroomQuestionSignature(seed.question, 'multiple_choice');
      const correctOpt = seed.options[seed.correctIndex] || seed.options[0];

      pushUnique({
        id: `tie-mc-${idx}`,
        signature: mcSig,
        source: 'bank',
        questionType: 'multiple_choice',
        subject: seed.subject,
        cls: seed.cls,
        topic: seed.chapter,
        subTopic: seed.chapter.includes('(')
          ? seed.chapter.replace(/^.*\(([^)]+)\).*$/, '$1')
          : 'TIE Chapter Competence',
        difficulty,
        question: seed.question,
        options: [...seed.options],
        correctIndex: seed.correctIndex,
        shortAnswer: correctOpt,
        explanation: seed.explanation,
        hint: seed.hint,
        points,
        sourceRef: `Official TIE ${seed.cls} ${seed.subject} Student's Book`,
      });

      const shortAns = extractShortAnswerFromOption(correctOpt);
      if (shortAns) {
        const saSig = normalizeClassroomQuestionSignature(seed.question, 'short_answer');
        pushUnique({
          id: `tie-sa-${idx}`,
          signature: saSig,
          source: 'bank',
          questionType: 'short_answer',
          subject: seed.subject,
          cls: seed.cls,
          topic: seed.chapter,
          subTopic: 'Short-Answer Calculation',
          difficulty,
          question: seed.question,
          options: [correctOpt],
          correctIndex: 0,
          shortAnswer: shortAns,
          explanation: seed.explanation,
          hint: seed.hint,
          points: points + 5,
          sourceRef: `Official TIE ${seed.cls} ${seed.subject} Student's Book`,
        });
      }
    });

    // 3. Ensure every Play Class & Subject has curriculum-aligned questions available in the bank
    const coreClasses = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'];
    const coreSubjects = [
      'Basic Mathematics',
      'Additional Mathematics',
      'Biology',
      'Chemistry',
      'Physics',
      'Geography',
      'History',
      'English Language',
      'Kiswahili',
      'Civics',
      'Book-Keeping',
      'Commerce',
      'Computer Science',
    ];

    for (const cls of coreClasses) {
      for (const subject of coreSubjects) {
        const stored = getStoredBankQuestionsForClassSubject(cls, subject, 'ALL');
        if (stored.length === 0) {
          const fallbackQns = getQuestionsForTreasureHunt(subject, cls, 'Medium', 'ALL', 'ALL');
          fallbackQns.forEach((fq, fIdx) => {
            const diff: ClassroomQuestionDifficulty =
              fq.difficulty || (fIdx % 3 === 0 ? 'Easy' : fIdx % 3 === 1 ? 'Medium' : 'Hard');
            const pts = defaultPointsForDifficulty(diff);
            const sig = normalizeClassroomQuestionSignature(fq.question, 'multiple_choice');
            const rightAns = fq.options[fq.correctIndex] || fq.options[0] || '';
            pushUnique({
              id: `curr-mc-${cls}-${subject}-${fIdx}`.replace(/\s+/g, '-').toLowerCase(),
              signature: sig,
              source: 'bank',
              questionType: 'multiple_choice',
              subject,
              cls,
              topic: fq.topic || subject,
              subTopic: fq.subTopic || 'Curriculum Competence',
              difficulty: diff,
              question: fq.question,
              options: [...fq.options],
              correctIndex: fq.correctIndex,
              shortAnswer: rightAns,
              explanation: fq.explanation,
              hint: fq.hint,
              points: pts,
              sourceRef: fq.sourceLabel || `TIE ${cls} ${subject} Curriculum Bank`,
            });

            // Also add a True/False question for variety
            if (fIdx % 2 === 0 && rightAns) {
              const wrongAns = fq.options[(fq.correctIndex + 1) % fq.options.length] || '';
              const isTrue = fIdx % 4 === 0;
              const tfText = `True or False (${subject}): For "${fq.question}", the correct answer is ${
                isTrue ? rightAns : wrongAns
              }.`;
              const tfSig = normalizeClassroomQuestionSignature(tfText, 'true_false');
              pushUnique({
                id: `curr-tf-${cls}-${subject}-${fIdx}`.replace(/\s+/g, '-').toLowerCase(),
                signature: tfSig,
                source: 'bank',
                questionType: 'true_false',
                subject,
                cls,
                topic: fq.topic || subject,
                subTopic: fq.subTopic || 'Concept Verification',
                difficulty: diff,
                question: tfText,
                options: ['True', 'False'],
                correctIndex: isTrue ? 0 : 1,
                shortAnswer: isTrue ? 'True' : 'False',
                explanation: `${isTrue ? 'True.' : `False — the correct answer is ${rightAns}.`} ${fq.explanation}`,
                hint: fq.hint,
                points: pts,
                sourceRef: fq.sourceLabel || `TIE ${cls} ${subject} Curriculum Bank`,
              });
            }
          });
        }
      }
    }

    cachedUnifiedQuestionBank = bank;
  }

  if (customServerQuestions.length === 0) {
    return cachedUnifiedQuestionBank;
  }

  const combined = [...cachedUnifiedQuestionBank];
  const existingSigs = new Set(combined.map((q) => q.signature));
  for (const sq of customServerQuestions) {
    if (sq && sq.signature && !existingSigs.has(sq.signature)) {
      existingSigs.add(sq.signature);
      combined.push(sq);
    }
  }
  return combined;
}

export function filterQuestionBank(
  bank: ClassroomGameQuestion[],
  criteria: QuestionBankFilterCriteria
): ClassroomGameQuestion[] {
  const subFilter = (criteria.subject || 'ALL').trim().toLowerCase();
  const clsFilter = (criteria.cls || 'ALL').trim().toLowerCase();
  const topicFilter = (criteria.topic || 'ALL').trim().toLowerCase();
  const subTopicFilter = (criteria.subTopic || 'ALL').trim().toLowerCase();
  const diffFilter = criteria.difficulty || 'ALL';
  const typeFilter = criteria.questionType || 'ALL';
  const query = (criteria.searchQuery || '').trim().toLowerCase();

  return bank.filter((q) => {
    if (clsFilter !== 'all' && q.cls.toLowerCase() !== clsFilter) {
      return false;
    }
    if (subFilter !== 'all') {
      const qSub = q.subject.toLowerCase();
      if (qSub !== subFilter && !qSub.includes(subFilter) && !subFilter.includes(qSub)) {
        return false;
      }
    }
    if (topicFilter !== 'all') {
      const qTop = (q.topic || '').toLowerCase();
      if (qTop !== topicFilter && !qTop.includes(topicFilter) && !topicFilter.includes(qTop)) {
        return false;
      }
    }
    if (subTopicFilter !== 'all') {
      const qSubTop = (q.subTopic || '').toLowerCase();
      if (
        qSubTop !== subTopicFilter &&
        !qSubTop.includes(subTopicFilter) &&
        !subTopicFilter.includes(qSubTop)
      ) {
        return false;
      }
    }
    if (diffFilter !== 'ALL' && q.difficulty !== diffFilter) {
      return false;
    }
    if (typeFilter !== 'ALL' && q.questionType !== typeFilter) {
      return false;
    }
    if (query) {
      const haystack = `${q.question} ${q.topic} ${q.subTopic} ${q.subject} ${q.cls} ${
        q.sourceRef || ''
      } ${q.options.join(' ')}`.toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      if (!terms.every((t) => haystack.includes(t))) {
        return false;
      }
    }
    return true;
  });
}

export function getDistinctBankTopics(
  bank: ClassroomGameQuestion[],
  cls: string,
  subject: string,
  allPapers?: PaperRecord[]
): string[] {
  const fromBank = bank
    .filter((q) => {
      const clsMatch = !cls || cls === 'ALL' || q.cls.toLowerCase() === cls.toLowerCase();
      const subMatch =
        !subject ||
        subject === 'ALL' ||
        q.subject.toLowerCase() === subject.toLowerCase() ||
        q.subject.toLowerCase().includes(subject.toLowerCase());
      return clsMatch && subMatch;
    })
    .map((q) => q.topic)
    .filter(Boolean);

  const syllabusTopics =
    cls && cls !== 'ALL' && subject && subject !== 'ALL'
      ? getAvailableTopicsForClassSubject(cls, subject, allPapers)
      : [];

  return Array.from(new Set([...fromBank, ...syllabusTopics]));
}

export function getDistinctBankSubTopics(
  bank: ClassroomGameQuestion[],
  cls: string,
  subject: string,
  topic: string
): string[] {
  const fromBank = bank
    .filter((q) => {
      const clsMatch = !cls || cls === 'ALL' || q.cls.toLowerCase() === cls.toLowerCase();
      const subMatch =
        !subject ||
        subject === 'ALL' ||
        q.subject.toLowerCase() === subject.toLowerCase() ||
        q.subject.toLowerCase().includes(subject.toLowerCase());
      const topMatch =
        !topic ||
        topic === 'ALL' ||
        q.topic.toLowerCase() === topic.toLowerCase() ||
        q.topic.toLowerCase().includes(topic.toLowerCase());
      return clsMatch && subMatch && topMatch;
    })
    .map((q) => q.subTopic)
    .filter(Boolean);

  const syllabusSubTopics =
    cls && cls !== 'ALL' && subject && subject !== 'ALL' && topic && topic !== 'ALL'
      ? getSubTopicsForMainTopic(cls, subject, topic)
      : [];

  return Array.from(new Set([...fromBank, ...syllabusSubTopics]));
}

export function validateCustomQuestionInput(input: {
  question: string;
  questionType: ClassroomQuestionType;
  options: string[];
  correctIndex: number;
  shortAnswer: string;
  points: number;
}): { valid: boolean; error?: string } {
  const trimmedQ = (input.question || '').trim();
  if (!trimmedQ) {
    return { valid: false, error: 'Please enter the question text.' };
  }
  if (!Number.isFinite(input.points) || input.points < 1 || input.points > 1000) {
    return { valid: false, error: 'Points per question must be between 1 and 1000.' };
  }
  if (input.questionType === 'multiple_choice') {
    const nonEmptyOpts = input.options.map((o) => o.trim()).filter(Boolean);
    if (nonEmptyOpts.length < 2) {
      return { valid: false, error: 'Multiple-choice questions require at least 2 answer choices.' };
    }
    if (input.correctIndex < 0 || input.correctIndex >= input.options.length || !input.options[input.correctIndex]?.trim()) {
      return { valid: false, error: 'Please select a valid non-empty correct answer choice.' };
    }
  } else if (input.questionType === 'true_false') {
    if (input.correctIndex !== 0 && input.correctIndex !== 1) {
      return { valid: false, error: 'Please select whether the statement is True or False.' };
    }
  } else if (input.questionType === 'short_answer') {
    if (!(input.shortAnswer || '').trim()) {
      return { valid: false, error: 'Please provide the expected correct short answer.' };
    }
  }
  return { valid: true };
}

export function clampAndValidateCustomization(
  custom: ClassroomGameCustomization,
  availableQuestionCount: number
): ClassroomGameCustomization {
  const maxAvailable = Math.max(0, availableQuestionCount);
  const clampedCount =
    maxAvailable === 0
      ? 0
      : Math.max(1, Math.min(maxAvailable, Math.round(custom.questionCount || maxAvailable)));
  const clampedTeams = Math.max(2, Math.min(6, Math.round(custom.teamCount || 2)));
  const teamNames = Array.from({ length: 6 }, (_, idx) => {
    const provided = (custom.teamNames?.[idx] || '').trim();
    return provided || DEFAULT_TEAM_PRESETS[idx].defaultName;
  });

  return {
    ...custom,
    questionCount: clampedCount,
    teamCount: clampedTeams,
    teamNames,
    uniformPoints: Math.max(1, Math.min(500, Math.round(custom.uniformPoints || 20))),
    timerSeconds: Math.max(5, Math.min(600, Math.round(custom.timerSeconds || 45))),
    answerDisplayMode: custom.answerDisplayMode === 'multiple_choice' ? 'multiple_choice' : 'answer_only',
    luckyBoxesEnabled: custom.luckyBoxesEnabled !== false,
    luckyBoxCount: Math.max(0, Math.min(8, Math.round(custom.luckyBoxCount ?? 4))),
    boardTheme: custom.boardTheme || 'numbers',
  };
}

export function loadSavedTeacherGames(): SavedTeacherClassroomGame[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_GAMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTeacherGameToStorage(game: SavedTeacherClassroomGame): SavedTeacherClassroomGame[] {
  const existing = loadSavedTeacherGames();
  const idx = existing.findIndex((g) => g.id === game.id);
  const updated =
    idx >= 0
      ? existing.map((g, i) => (i === idx ? game : g))
      : [game, ...existing].slice(0, 60);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
    void fetch('/api/classroom-games/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game }),
    }).catch(() => {});
  }
  return updated;
}

export function deleteSavedTeacherGameFromStorage(gameId: string): SavedTeacherClassroomGame[] {
  const existing = loadSavedTeacherGames();
  const updated = existing.filter((g) => g.id !== gameId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    void fetch(`/api/classroom-games/saved/${encodeURIComponent(gameId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  }
  return updated;
}

export function loadSavedGameResults(): ClassroomGameSessionResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_RESULTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClassroomGameResultToStorage(
  result: ClassroomGameSessionResult
): ClassroomGameSessionResult[] {
  const existing = loadSavedGameResults();
  const updated = [result, ...existing.filter((r) => r.id !== result.id)].slice(0, 100);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_RESULTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    void fetch('/api/classroom-games/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    }).catch(() => {});
  }
  return updated;
}

export {
  getAvailableSubjectsForClass,
  getAvailableTopicsForClassSubject,
   getSyllabusTopicsForClassSubject,
  PLAY_CLASSES,
  PLAY_SUBJECTS,
  TIE_CURRICULUM_SUBJECTS,
};
export type { GameDifficulty };
