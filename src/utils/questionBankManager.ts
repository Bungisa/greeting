import { QuizItem } from '../data/curriculumData';
import { FULL_EXTRACTED_TEXTBOOK_BANK } from '../data/extractedTextbookExerciseBank';

export interface StoredTextbookQuestion {
  id: string;
  signature: string;
  cls: string;
  subject: string;
  topic: string;
  subTopic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
  sourceRef: string;
  textbookTitle: string;
  createdAt: string;
  isMultipleChoice?: boolean;
}

export interface StudentSeenQuestionState {
  /** Keyed by normalized `${cls}::${subject}` -> array of question signatures */
  seenByClassSubject: Record<string, string[]>;
  /** Keyed by normalized `${cls}::${subject}` -> number of full bank cycles completed */
  cyclesByClassSubject: Record<string, number>;
  /** Keyed by normalized `${cls}::${subject}` -> incrementing offset so parameterized textbook numbers never repeat */
  variantOffsetByClassSubject: Record<string, number>;
}

export interface QuestionBankStats {
  cls: string;
  subject: string;
  storedFromTextbooksCount: number;
  seenByStudentCount: number;
  unseenInStoredBankCount: number;
  cyclesCompleted: number;
  variantOffset: number;
  uploadedTextbookTitles: string[];
}

const QUESTION_BANK_STORAGE_KEY = 'elimika_textbook_question_bank_v14';
const SEEN_QUESTIONS_STORAGE_KEY = 'elimika_seen_questions_v7';

export function normalizeClassSubjectKey(cls: string, subject: string): string {
  const c = (typeof cls === 'string' && cls.trim() ? cls : 'Form 1')
    .trim()
    .toLowerCase()
    .replace(/\bform\s+one\b/i, 'form 1')
    .replace(/\bform\s+i\b/i, 'form 1')
    .replace(/\bform\s+two\b/i, 'form 2')
    .replace(/\bform\s+ii\b/i, 'form 2')
    .replace(/\bform\s+three\b/i, 'form 3')
    .replace(/\bform\s+iii\b/i, 'form 3')
    .replace(/\bform\s+four\b/i, 'form 4')
    .replace(/\bform\s+iv\b/i, 'form 4')
    .replace(/\bform\s+five\b/i, 'form 5')
    .replace(/\bform\s+v\b/i, 'form 5')
    .replace(/\bform\s+six\b/i, 'form 6')
    .replace(/\bform\s+vi\b/i, 'form 6');
  const rawSub = (typeof subject === 'string' && subject.trim() ? subject : 'Basic Mathematics')
    .trim()
    .toLowerCase();
  let s = rawSub;
  if (rawSub.includes('additional math')) {
    s = 'additional mathematics';
  } else if (rawSub.includes('advanced math')) {
    s = 'advanced mathematics';
  } else if (rawSub.includes('applied math') || rawSub.includes('bam')) {
    s = 'basic applied mathematics (bam)';
  } else if (rawSub === 'mathematics' || rawSub.includes('basic math') || rawSub.includes('hisabati')) {
    s = 'basic mathematics';
  } else if (
    rawSub.includes('computer') ||
    rawSub.includes('information and computer') ||
    rawSub === 'ics' ||
    rawSub === 'ict'
  ) {
    s = 'computer science';
  } else if (rawSub.includes('geography') || rawSub.includes('jiografia')) {
    s = 'geography';
  } else if (rawSub.includes('chemistry') || rawSub.includes('kemia')) {
    s = 'chemistry';
  } else if (rawSub.includes('biology') || rawSub.includes('biolojia')) {
    s = 'biology';
  }
  return `${c}::${s}`;
}

export function extractCoreTopicTitle(rawTopic: string): {
  chapterNum: string | null;
  coreTitle: string;
  fullClean: string;
} {
  const strippedPrefix = String(rawTopic || '')
    .replace(/^(📘 Book Focus:|📋 Syllabus Focus:|📄 Past Paper Focus:)\s*/i, '')
    .replace(/^\d+\.\d+\s*/, '')
    .trim();
  const chapMatch = strippedPrefix.match(/^(?:chapter|topic)\s*(\d+)\s*[:.-]?\s*(.*)$/i);
  const chapterNum = chapMatch ? chapMatch[1] : null;
  const withoutChapterPrefix = chapMatch ? chapMatch[2].trim() : strippedPrefix;
  const withoutParens = withoutChapterPrefix.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
  const fullClean = strippedPrefix.toLowerCase();
  return {
    chapterNum,
    coreTitle: withoutParens || fullClean,
    fullClean,
  };
}

export function doesQuestionTopicMatchSelectedTopic(
  qTopicRaw: string,
  qSubTopicRaw: string = '',
  selectedTopicRaw: string = 'ALL'
): boolean {
  if (!selectedTopicRaw || typeof selectedTopicRaw !== 'string') return true;
  const selTrim = selectedTopicRaw.trim();
  if (!selTrim || selTrim.toUpperCase() === 'ALL') return true;

  // If the user explicitly chose a "📘 Book Focus: ..." resource topic, match all chapters of that book
  if (/^(📘 Book Focus:|📋 Syllabus Focus:|📄 Past Paper Focus:)/i.test(selTrim)) {
    return true;
  }

  const sel = extractCoreTopicTitle(selTrim);
  const qT = extractCoreTopicTitle(qTopicRaw || '');
  const qSubLower = String(qSubTopicRaw || '').toLowerCase();

  // If both the selected topic and the question topic specify a Chapter number (e.g. Chapter 1 vs Chapter 2):
  if (sel.chapterNum && qT.chapterNum) {
    if (sel.chapterNum === qT.chapterNum) {
      return true;
    }
    // Different chapter numbers in the same textbook -> only match if the core chapter title is identical
    return Boolean(sel.coreTitle && qT.coreTitle && sel.coreTitle === qT.coreTitle);
  }

  if (sel.coreTitle && qT.coreTitle) {
    if (sel.coreTitle === qT.coreTitle) return true;
    if (sel.coreTitle.length >= 4 && qT.coreTitle.includes(sel.coreTitle)) return true;
    if (qT.coreTitle.length >= 4 && sel.coreTitle.includes(qT.coreTitle)) return true;
  }

  if (sel.coreTitle && sel.coreTitle.length >= 4 && qSubLower.includes(sel.coreTitle)) {
    return true;
  }

  return false;
}

export function computeQuestionSignature(questionText: string): string {
  return String(questionText || '')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, '') // strip leading [Form 1 • Chapter ...] or [Exercise 1.1 #3] tags
    .replace(/^\s*(?:question\s*\d+|qn?\s*\d+|\d+\s*[.)])\s*/i, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 200);
}

/**
 * Computes a number-agnostic template skeleton so two questions with the exact
 * same wording and only changed numbers are recognized as the same template.
 */
export function computeQuestionTemplateSkeleton(questionText: string): string {
  return String(questionText || '')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\b\d+(\.\d+)?\b/g, ' # ')
    .replace(/[^a-z#\\^_{}+=-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

const BUILTIN_EXTRACTED_BANK: StoredTextbookQuestion[] = FULL_EXTRACTED_TEXTBOOK_BANK.map(
  (seed) => ({
    id: seed.id,
    signature: computeQuestionSignature(seed.question),
    cls: seed.cls,
    subject: seed.subject,
    topic: seed.topic,
    subTopic: seed.subTopic,
    question: seed.question,
    options: [...seed.options],
    correctIndex: seed.correctIndex,
    explanation: seed.explanation,
    hint: seed.hint,
    sourceRef: `📘 ${seed.textbookTitle} — ${seed.exerciseRef}`,
    textbookTitle: seed.textbookTitle,
    createdAt: '2026-10-30',
    isMultipleChoice: seed.isMultipleChoice,
  })
);

const UPLOADED_SUBJECT_KEYS = new Set<string>(
  BUILTIN_EXTRACTED_BANK.map((q) => normalizeClassSubjectKey(q.cls, q.subject).split('::')[1])
);

export function isUploadedTextbookSubject(subject: string): boolean {
  const normSub = normalizeClassSubjectKey('Form 1', subject).split('::')[1];
  return UPLOADED_SUBJECT_KEYS.has(normSub);
}

export function loadStoredQuestionBank(): StoredTextbookQuestion[] {
  let localItems: StoredTextbookQuestion[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Never load autogenerated localStorage questions for subjects that have an official uploaded textbook bank
          localItems = parsed.filter(
            (item) => item && item.subject && !isUploadedTextbookSubject(item.subject)
          );
        }
      }
    } catch {
      localItems = [];
    }
  }

  const combined: StoredTextbookQuestion[] = [];
  const seenKeys = new Set<string>();

  for (const item of [...BUILTIN_EXTRACTED_BANK, ...localItems]) {
    if (!item || !item.question) continue;
    const sig = computeQuestionSignature(item.question);
    if (!sig || sig.length < 8) continue;
    const key = `${normalizeClassSubjectKey(item.cls, item.subject)}::${sig}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    combined.push({
      ...item,
      signature: sig,
    });
  }

  return combined;
}

export function saveStoredQuestionBank(items: StoredTextbookQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(items.slice(0, 2500)));
    window.dispatchEvent(new CustomEvent('elimika-question-bank-updated'));
  } catch {
    // ignore storage quota errors
  }
}

export function addQuestionsToStoredBank(
  newQuestions: Array<{
    cls: string;
    subject: string;
    topic?: string;
    subTopic?: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    hint?: string;
    sourceRef?: string;
    textbookTitle?: string;
  }>
): { addedCount: number; totalInSubject: number } {
  const existing = loadStoredQuestionBank();
  const existingSigs = new Set(existing.map((q) => `${normalizeClassSubjectKey(q.cls, q.subject)}::${q.signature}`));
  let addedCount = 0;
  const nowStr = new Date().toISOString().split('T')[0];

  const additions: StoredTextbookQuestion[] = [];
  for (const item of newQuestions) {
    if (!item.question || !Array.isArray(item.options) || item.options.length < 2) continue;
    // Do not save autogenerated runtime questions into subjects that already have uploaded textbook banks
    if (isUploadedTextbookSubject(item.subject)) continue;
    const sig = computeQuestionSignature(item.question);
    if (!sig || sig.length < 8) continue;
    const fullKey = `${normalizeClassSubjectKey(item.cls, item.subject)}::${sig}`;
    if (existingSigs.has(fullKey)) continue;
    existingSigs.add(fullKey);
    addedCount++;
    const tbTitle =
      item.textbookTitle ||
      item.sourceRef ||
      `Official TIE ${item.cls} ${item.subject} Student's Textbook`;
    additions.push({
      id: `tbq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${addedCount}`,
      signature: sig,
      cls: item.cls,
      subject: item.subject,
      topic: item.topic || `${item.cls} ${item.subject}`,
      subTopic: item.subTopic,
      question: item.question,
      options: item.options,
      correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
      explanation: item.explanation || 'Step-by-step textbook working verified.',
      hint: item.hint,
      sourceRef: item.sourceRef || `📘 ${tbTitle}`,
      textbookTitle: tbTitle,
      createdAt: nowStr,
    });
  }

  const merged = [...additions, ...existing];
  if (addedCount > 0) {
    saveStoredQuestionBank(merged);
  }

  const targetKey =
    newQuestions[0] ? normalizeClassSubjectKey(newQuestions[0].cls, newQuestions[0].subject) : '';
  const totalInSubject = targetKey
    ? merged.filter((q) => normalizeClassSubjectKey(q.cls, q.subject) === targetKey).length
    : merged.length;

  return { addedCount, totalInSubject };
}

export function getStoredBankQuestionsForClassSubject(
  cls: string,
  subject: string,
  topic: string = 'ALL'
): StoredTextbookQuestion[] {
  const all = loadStoredQuestionBank();
  const targetKey = normalizeClassSubjectKey(cls, subject);
  const targetSubOnly = targetKey.split('::')[1];
  let matching = all.filter((q) => normalizeClassSubjectKey(q.cls, q.subject) === targetKey);

  // If the subject has an uploaded textbook bank (e.g., Form 1 ICS or Form 2 Geography) and the user selected another class level without a separate upload yet, serve the uploaded bank for that subject rather than falling back to autogenerated questions
  if (matching.length === 0 && UPLOADED_SUBJECT_KEYS.has(targetSubOnly)) {
    matching = all.filter(
      (q) => normalizeClassSubjectKey(q.cls, q.subject).split('::')[1] === targetSubOnly
    );
  }

  const interleaveByTopic = (pool: StoredTextbookQuestion[]): StoredTextbookQuestion[] => {
    const byTopic = new Map<string, StoredTextbookQuestion[]>();
    for (const q of pool) {
      const tKey = extractCoreTopicTitle(q.topic || '').coreTitle || 'general';
      const list = byTopic.get(tKey) || [];
      list.push(q);
      byTopic.set(tKey, list);
    }
    const buckets = Array.from(byTopic.values());
    if (buckets.length <= 1) return pool;
    const interleaved: StoredTextbookQuestion[] = [];
    const maxLen = Math.max(...buckets.map((b) => b.length));
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (i < bucket.length) {
          interleaved.push(bucket[i]);
        }
      }
    }
    return interleaved;
  };

  if (!topic || typeof topic !== 'string' || topic.trim().toUpperCase() === 'ALL') {
    return interleaveByTopic(matching);
  }

  const topicFiltered = matching.filter((q) =>
    doesQuestionTopicMatchSelectedTopic(q.topic, q.subTopic, topic)
  );
  if (topicFiltered.length > 0) {
    return topicFiltered;
  }
  // If an uploaded subject has questions in `matching` but the selected topic label came from a different class/resource string, return the uploaded subject questions rather than `[]` (so autogenerated fallback questions are never triggered)
  if (matching.length > 0 && UPLOADED_SUBJECT_KEYS.has(targetSubOnly)) {
    return interleaveByTopic(matching);
  }
  return [];
}

export function loadStudentSeenState(): StudentSeenQuestionState {
  if (typeof window === 'undefined') {
    return {
      seenByClassSubject: {},
      cyclesByClassSubject: {},
      variantOffsetByClassSubject: {},
    };
  }
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_STORAGE_KEY);
    if (!raw) {
      return {
        seenByClassSubject: {},
        cyclesByClassSubject: {},
        variantOffsetByClassSubject: {},
      };
    }
    const parsed = JSON.parse(raw);
    return {
      seenByClassSubject:
        parsed && typeof parsed.seenByClassSubject === 'object' ? parsed.seenByClassSubject : {},
      cyclesByClassSubject:
        parsed && typeof parsed.cyclesByClassSubject === 'object' ? parsed.cyclesByClassSubject : {},
      variantOffsetByClassSubject:
        parsed && typeof parsed.variantOffsetByClassSubject === 'object'
          ? parsed.variantOffsetByClassSubject
          : {},
    };
  } catch {
    return {
      seenByClassSubject: {},
      cyclesByClassSubject: {},
      variantOffsetByClassSubject: {},
    };
  }
}

export function saveStudentSeenState(state: StudentSeenQuestionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEEN_QUESTIONS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('elimika-seen-questions-updated'));
  } catch {
    // ignore
  }
}

export function getSeenSignaturesForClassSubject(cls: string, subject: string): Set<string> {
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  return new Set(state.seenByClassSubject[key] || []);
}

export function getVariantOffsetForClassSubject(cls: string, subject: string): number {
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  return state.variantOffsetByClassSubject[key] || 0;
}

export function incrementVariantOffsetForClassSubject(
  cls: string,
  subject: string,
  step = 15
): number {
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  const nextOffset = (state.variantOffsetByClassSubject[key] || 0) + step;
  state.variantOffsetByClassSubject[key] = nextOffset;
  saveStudentSeenState(state);
  return nextOffset;
}

export function markQuestionAsSeenByStudent(
  cls: string,
  subject: string,
  questionText: string
): void {
  const sig = computeQuestionSignature(questionText);
  if (!sig) return;
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  const existing = state.seenByClassSubject[key] || [];
  if (!existing.includes(sig)) {
    state.seenByClassSubject[key] = [...existing, sig].slice(-1200);
    saveStudentSeenState(state);
  }
}

export function markQuestionsBatchAsSeenByStudent(
  cls: string,
  subject: string,
  questions: Array<{ question: string }>
): void {
  if (!Array.isArray(questions) || questions.length === 0) return;
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  const set = new Set(state.seenByClassSubject[key] || []);
  let changed = false;
  for (const q of questions) {
    const sig = computeQuestionSignature(q.question);
    if (sig && !set.has(sig)) {
      set.add(sig);
      changed = true;
    }
  }
  if (changed) {
    state.seenByClassSubject[key] = Array.from(set).slice(-1200);
    saveStudentSeenState(state);
  }
}

export function resetSeenQuestionsForClassSubject(
  cls: string,
  subject: string,
  incrementCycle = false
): void {
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);
  state.seenByClassSubject[key] = [];
  if (incrementCycle) {
    state.cyclesByClassSubject[key] = (state.cyclesByClassSubject[key] || 0) + 1;
  }
  state.variantOffsetByClassSubject[key] = (state.variantOffsetByClassSubject[key] || 0) + 20;
  saveStudentSeenState(state);
}

export function getQuestionBankStats(
  cls: string,
  subject: string,
  fallbackPoolCount = 25
): QuestionBankStats {
  const stored = getStoredBankQuestionsForClassSubject(cls, subject, 'ALL');
  const seenSet = getSeenSignaturesForClassSubject(cls, subject);
  const state = loadStudentSeenState();
  const key = normalizeClassSubjectKey(cls, subject);

  const unseenStored = stored.filter((q) => !seenSet.has(q.signature)).length;
  const totalPool = Math.max(stored.length + fallbackPoolCount, fallbackPoolCount);
  const unseenTotal = Math.max(0, totalPool - seenSet.size);

  const textbookTitles = Array.from(
    new Set(stored.map((q) => q.textbookTitle).filter(Boolean))
  );

  return {
    cls,
    subject,
    storedFromTextbooksCount: stored.length,
    seenByStudentCount: seenSet.size,
    unseenInStoredBankCount: unseenStored > 0 ? unseenStored : unseenTotal,
    cyclesCompleted: state.cyclesByClassSubject[key] || 0,
    variantOffset: state.variantOffsetByClassSubject[key] || 0,
    uploadedTextbookTitles: textbookTitles,
  };
}

/**
 * Filters a candidate list of QuizItems or GameQuestions so that:
 * 1. Stored textbook questions for this Class & Subject are prioritized first.
 * 2. Questions already seen/answered by the student in either Game #1 or Quiz Section are excluded.
 * 3. If the student has exhausted 100% of available questions, the cycle automatically rotates so they never get stuck.
 */
export function filterAndPrioritizeUnseenQuizItems(
  cls: string,
  subject: string,
  topicOrCandidates: string | QuizItem[],
  candidatesOrTargetCount?: QuizItem[] | number,
  maybeTargetCount = 20
): QuizItem[] {
  const isFourArgCall = Array.isArray(topicOrCandidates);
  const topic = isFourArgCall
    ? 'ALL'
    : typeof topicOrCandidates === 'string'
    ? topicOrCandidates
    : 'ALL';
  const candidates: QuizItem[] = isFourArgCall
    ? topicOrCandidates
    : Array.isArray(candidatesOrTargetCount)
    ? candidatesOrTargetCount
    : [];
  const targetCount: number = isFourArgCall
    ? typeof candidatesOrTargetCount === 'number'
      ? candidatesOrTargetCount
      : 20
    : typeof maybeTargetCount === 'number'
    ? maybeTargetCount
    : 20;

  const storedBank = getStoredBankQuestionsForClassSubject(cls, subject, topic);
  let seenSet = getSeenSignaturesForClassSubject(cls, subject);

  const storedAsQuizItems: QuizItem[] = storedBank.map((sq) => ({
    question: sq.question,
    options: sq.options,
    correctIndex: sq.correctIndex,
    explanation: sq.explanation,
    topic: sq.topic,
    subTopic: sq.subTopic,
    sourceRef: sq.sourceRef,
    isMultipleChoice: sq.isMultipleChoice,
  }));

  // Filter fallback candidates so they strictly match the selected topic and never leak other chapters/levels
  const topicFilteredCandidates =
    topic && topic !== 'ALL'
      ? candidates.filter((item) => {
          if (!item || !item.question) return false;
          // Check if the question text itself contains an explicit [Chapter X: ...] tag from another chapter
          const embeddedChapterMatch = item.question.match(/\[Chapter\s*(\d+)\s*:\s*([^\]]+)\]/i);
          if (embeddedChapterMatch) {
            const embeddedTopicLabel = `Chapter ${embeddedChapterMatch[1]}: ${embeddedChapterMatch[2]}`;
            if (!doesQuestionTopicMatchSelectedTopic(embeddedTopicLabel, '', topic)) {
              return false;
            }
          }
          return doesQuestionTopicMatchSelectedTopic(item.topic || '', item.subTopic || '', topic);
        })
      : candidates;

  const combinedPool: QuizItem[] = [];
  const poolSigs = new Set<string>();
  const poolSkeletons = new Set<string>();

  // 1. Add ALL authentic stored/extracted textbook questions for this topic first (never drop authentic textbook questions via skeleton collision)
  for (const item of storedAsQuizItems) {
    if (!item || !item.question) continue;
    const sig = computeQuestionSignature(item.question);
    if (!sig || poolSigs.has(sig)) continue;
    poolSigs.add(sig);
    const skel = computeQuestionTemplateSkeleton(item.question);
    if (skel && skel.length >= 18) poolSkeletons.add(skel);
    combinedPool.push(item);
  }

  // 2. Only if there are ZERO authentic stored textbook questions AND the subject is not an uploaded textbook subject, use topic-matched fallback candidates
  if (combinedPool.length === 0 && !isUploadedTextbookSubject(subject)) {
    for (const item of topicFilteredCandidates) {
      if (!item || !item.question) continue;
      const sig = computeQuestionSignature(item.question);
      const skel = computeQuestionTemplateSkeleton(item.question);
      if (!sig || poolSigs.has(sig)) continue;
      if (skel && skel.length >= 18 && poolSkeletons.has(skel)) continue;
      poolSigs.add(sig);
      if (skel && skel.length >= 18) poolSkeletons.add(skel);
      combinedPool.push(item);
    }
  }

  const unseen = combinedPool.filter((item) => !seenSet.has(computeQuestionSignature(item.question)));

  // Build the final quiz batch by ALWAYS taking remaining unseen questions first (e.g. Q21..Q28)
  const selected: QuizItem[] = [];
  const selectedSigs = new Set<string>();

  for (const item of unseen) {
    if (selected.length >= targetCount) break;
    const sig = computeQuestionSignature(item.question);
    if (!sig || selectedSigs.has(sig)) continue;
    selectedSigs.add(sig);
    selected.push(item);
  }

  // If the remaining unseen questions were fewer than targetCount, rotate the cycle after queuing unseen ones first
  if (selected.length < targetCount && combinedPool.length > 0) {
    resetSeenQuestionsForClassSubject(cls, subject, true);
    for (const item of combinedPool) {
      if (selected.length >= targetCount) break;
      const sig = computeQuestionSignature(item.question);
      if (!sig || selectedSigs.has(sig)) continue;
      selectedSigs.add(sig);
      selected.push(item);
    }
  }

  return selected.slice(0, targetCount);
}

/**
 * Syncs client localStorage Question Bank with the backend /api/question-bank store.
 */
export async function syncQuestionBankWithServer(
  cls?: string,
  subject?: string
): Promise<StoredTextbookQuestion[]> {
  try {
    const params = new URLSearchParams();
    if (cls) params.set('cls', cls);
    if (subject) params.set('subject', subject);
    const res = await fetch(`/api/question-bank?${params.toString()}`);
    if (!res.ok) return loadStoredQuestionBank();
    const data = await res.json();
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      addQuestionsToStoredBank(data.questions);
    }
    return loadStoredQuestionBank();
  } catch {
    return loadStoredQuestionBank();
  }
}
