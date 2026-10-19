import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Home,
  Mic,
  Moon,
  Printer,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Sun,
  Trash2,
  User,
  Volume2,
  X,
} from 'lucide-react';
import {
  buildInstantOfficialDocument,
  CONFIG,
  escapeHtml,
  FlashcardItem,
  generateLocalSmartTutorReply,
  getDefaultFlashcardsForSubject,
  getSyllabusTopicsForClassSubject,
  LearnedMemoryItem,
  normalizeClassName,
  OfficialDocType,
  PaperRecord,
  QuizHistoryRecord,
  QuizItem,
  SiteResourceContext,
  TeacherMetadata,
  TIE_CURRICULUM_SUBJECTS,
  UserProfileData,
} from './data/curriculumData';
import { DiagramPreset, InteractiveDiagramLab } from './components/InteractiveDiagramLab';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';

declare global {
  interface Window {
    renderMathInElement?: (
      element: HTMLElement,
      options?: {
        delimiters?: Array<{ left: string; right: string; display: boolean }>;
        throwOnError?: boolean;
      }
    ) => void;
    html2pdf?: () => {
      set: (opt: Record<string, unknown>) => {
        from: (el: HTMLElement) => {
          save: () => Promise<void>;
        };
      };
    };
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance {
  lang: string;
  start: () => void;
  onresult: ((event: { results?: Array<Array<{ transcript?: string }>> }) => void) | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  loading?: boolean;
  imagePreview?: string;
  diagramPreset?: DiagramPreset;
}

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
  questions: QuizItem[];
  leaderboard: ChallengeLeaderboardEntry[];
}

function detectDiagramPreset(promptText: string, subject: string): DiagramPreset | undefined {
  const lowerPrompt = promptText.toLowerCase();
  const q = `${lowerPrompt} ${subject.toLowerCase()}`;
  const wantsVisual =
    lowerPrompt.includes('diagram') ||
    lowerPrompt.includes('draw') ||
    lowerPrompt.includes('chora') ||
    lowerPrompt.includes('graph') ||
    lowerPrompt.includes('circuit') ||
    lowerPrompt.includes('simulation') ||
    lowerPrompt.includes('plot');

  if (!wantsVisual) return undefined;
  if (q.includes('titration') || q.includes('acid') || q.includes('burette') || q.includes('chemi')) {
    return 'chem_titration';
  }
  if (q.includes('photo') || q.includes('leaf') || q.includes('plant') || q.includes('biolog') || q.includes('sayansi')) {
    return 'bio_photosynthesis';
  }
  if (q.includes('ohm') || q.includes('circuit') || q.includes('voltage') || q.includes('physic')) {
    return 'physics_ohm';
  }
  return 'math_quadratic';
}

function sanitizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const clean = String(rawUrl).trim();
  return /^https?:\/\//i.test(clean) ? clean : null;
}

function extractGoogleDriveId(url: string | null): string | null {
  if (!url || !url.includes('drive.google.com')) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getPreviewUrl(rawUrl: string | null): string | null {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) return null;
  const driveId = extractGoogleDriveId(safe);
  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`;
  return safe;
}

function getDirectDownloadUrl(rawUrl: string | null): string {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) return '#';
  const driveId = extractGoogleDriveId(safe);
  if (driveId) return `https://drive.google.com/uc?export=download&id=${driveId}`;
  return safe;
}

function getSubjectIcon(subject: string): string {
  const s = (subject || '').toLowerCase();
  if (s.includes('math') || s.includes('hisabati')) return '📐';
  if (s.includes('physic')) return '⚡';
  if (s.includes('chemi')) return '🧪';
  if (s.includes('biolog') || s.includes('sayansi')) return '🧬';
  if (s.includes('geograph') || s.includes('jiografia')) return '🌍';
  if (s.includes('histor')) return '🏛️';
  if (s.includes('civic') || s.includes('uraia')) return '⚖️';
  if (s.includes('english') || s.includes('literature')) return '📖';
  if (s.includes('kiswahili')) return '🗣️';
  return '📘';
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  const cleanText = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) rows.push(currentRow);
  }
  return rows;
}

function processParsedRows(rows: string[][]): PaperRecord[] {
  const records: PaperRecord[] = [];
  const seenBooks = new Set<string>();

  if (Array.isArray(rows) && rows.length >= 2) {
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      const rawTitle = (cols[0] || '').trim();
      const rawForm = (cols[1] || '').trim();
      const rawSubject = (cols[2] || '').trim();
      const rawYear = (cols[3] || '').trim();
      const rawCat = (cols[4] || '').trim();
      const paperUrl = sanitizeUrl(cols[5] || '');
      const answersUrl = sanitizeUrl(cols[6] || '');

      if (!rawTitle && !rawSubject) continue;

      const form = normalizeClassName(rawForm);
      const subject = rawSubject || 'General';
      const year = rawYear || '2025';
      const category = rawCat || 'NECTA';
      const catLower = `${category} ${rawTitle}`.toLowerCase();

      const isSyllabus = catLower.includes('syllabus') || catLower.includes('muhtasari');
      const isBook =
        !isSyllabus &&
        (catLower.includes('book') ||
          catLower.includes('kitabu') ||
          catLower.includes('textbook') ||
          catLower.includes('tie'));

      if (isBook) {
        seenBooks.add(`${form.toLowerCase()}__${subject.toLowerCase()}`);
      }

      records.push({
        id: `sheet-${i}`,
        title: rawTitle || `${form} ${subject} (${year})`,
        form,
        subject,
        year,
        category: isSyllabus ? 'TIE Syllabus' : isBook ? 'TIE Book' : category,
        paperUrl,
        answersUrl,
        isBook,
        isSyllabus,
      });
    }
  }

  Object.entries(TIE_CURRICULUM_SUBJECTS).forEach(([cls, subjects]) => {
    subjects.forEach((sub, idx) => {
      const key = `${cls.toLowerCase()}__${sub.toLowerCase()}`;
      if (!seenBooks.has(key)) {
        records.push({
          id: `tie-book-${cls.replace(/\s+/g, '')}-${idx}`,
          title: `${cls} ${sub} — Official TIE Student's Book`,
          form: cls,
          subject: sub,
          year: '2025',
          category: 'TIE Book',
          paperUrl: null,
          answersUrl: null,
          isBook: true,
          isSyllabus: false,
        });
      }
    });
  });

  return records;
}

function matchesSyllabusTier(formStr: string, tier: string): boolean {
  if (tier === 'ALL') return true;
  const f = (formStr || '').toLowerCase();
  if (tier === 'Primary') return f.includes('primary') || f.includes('std') || f.includes('standard');
  if (tier === 'Secondary')
    return (
      f.includes('secondary') ||
      f.includes('form 1') ||
      f.includes('form 2') ||
      f.includes('form 3') ||
      f.includes('form 4')
    );
  if (tier === 'Advanced') return f.includes('advanced') || f.includes('form 5') || f.includes('form 6');
  return true;
}

function formatMwalimuHtml(raw: string): string {
  if (!raw) return '';
  if (raw.includes('official-tie-doc')) return raw;

  // Convert Markdown pipe tables into clean bordered HTML tables
  const lines = raw.split('\n');
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .slice(1, -1)
            .split('|')
            .map((cell) => escapeHtml(cell.trim()).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));

        const headers = parseRow(tableLines[0]);
        const isSep = /^[:\-\s|]+$/.test(tableLines[1].slice(1, -1));
        const bodyRows = tableLines.slice(isSep ? 2 : 1).map(parseRow);

        const tableHtml = `<div class="official-tie-doc"><table><thead><tr>${headers
          .map((h) => `<th>${h}</th>`)
          .join('')}</tr></thead><tbody>${bodyRows
          .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`;
        outLines.push(tableHtml);
        continue;
      }
    }
    outLines.push(
      escapeHtml(lines[i]).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    );
    i++;
  }

  return outLines.join('<br/>');
}

export default function App() {
  const [allPapers, setAllPapers] = useState<PaperRecord[]>(() => processParsedRows([]));
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'offline' | 'error'>('syncing');

  // Navigation & View Mode
  const [activePage, setActivePage] = useState<'papers' | 'books' | 'syllabus' | 'moha'>('papers');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Saved Class & Recent Papers
  const [savedClass, setSavedClass] = useState<string>('');
  const [recentPapers, setRecentPapers] = useState<
    Array<{ id: string; title: string; form: string; subject: string; year: string }>
  >([]);

  // Dedicated Books Page State
  const [booksPageLevel, setBooksPageLevel] = useState<'ALL' | 'Primary' | 'Secondary' | 'Advanced'>('ALL');
  const [booksPageSelectedClass, setBooksPageSelectedClass] = useState<string>('ALL');
  const [booksSearchQuery, setBooksSearchQuery] = useState<string>('');

  // Dedicated Syllabus Page State
  const [syllabusPageLevel, setSyllabusPageLevel] = useState<'ALL' | 'Primary' | 'Secondary' | 'Advanced'>('ALL');
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState<string>('');

  // Print Basket
  const [printBasket, setPrintBasket] = useState<PaperRecord[]>([]);

  // Document Viewer Modal
  const [viewerPaper, setViewerPaper] = useState<PaperRecord | null>(null);
  const [viewerType, setViewerType] = useState<'paper' | 'answers'>('paper');
  const [viewerLoading, setViewerLoading] = useState<boolean>(true);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Moha AI Full-Page Site State
  const [mohaOpen, setMohaOpen] = useState<boolean>(false);
  const [mohaViewMode, setMohaViewMode] = useState<
    'chat' | 'studio' | 'quiz' | 'diagram' | 'resources' | 'profile'
  >('chat');
  const [activeDiagramPreset, setActiveDiagramPreset] = useState<DiagramPreset>('physics_ohm');
  const [mohaActiveClass, setMohaActiveClass] = useState<string>('Form 3');
  const [mohaActiveSubject, setMohaActiveSubject] = useState<string>('Basic Mathematics');
  const [mohaMessages, setMohaMessages] = useState<ChatMessage[]>([]);
  const [mohaInput, setMohaInput] = useState<string>('');
  const [mohaPendingImage, setMohaPendingImage] = useState<{
    mimeType: string;
    base64Data: string;
    previewUrl: string;
  } | null>(null);
  const [mohaLearnPanelOpen, setMohaLearnPanelOpen] = useState<boolean>(false);
  const [learnTopicInput, setLearnTopicInput] = useState<string>('');
  const [learnAnswerInput, setLearnAnswerInput] = useState<string>('');
  const [learnedMemory, setLearnedMemory] = useState<LearnedMemoryItem[]>([]);

  // User Profile & Mastery Progress State
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Mwl. / Student',
    school: 'Elimika Secondary School',
    role: 'Teacher',
    targetClass: 'Form 4',
  });
  const [quizHistory, setQuizHistory] = useState<QuizHistoryRecord[]>([]);

  // Teacher & Exam Studio inside Moha AI Full-Page Site
  const [teacherStudioOpen, setTeacherStudioOpen] = useState<boolean>(false);
  const [tsSchool, setTsSchool] = useState<string>('');
  const [tsTeacher, setTsTeacher] = useState<string>('');
  const [tsDate, setTsDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [tsClass, setTsClass] = useState<string>('Form 3');
  const [tsSubject, setTsSubject] = useState<string>('Basic Mathematics');
  const [tsDuration, setTsDuration] = useState<string>('80 Minutes');
  const [tsTopic, setTsTopic] = useState<string>('');
  const [tsSubTopic, setTsSubTopic] = useState<string>('');
  const [tsRegG, setTsRegG] = useState<number>(25);
  const [tsRegB, setTsRegB] = useState<number>(25);
  const [tsPresG, setTsPresG] = useState<number>(24);
  const [tsPresB, setTsPresB] = useState<number>(24);
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);
  const [studioPreviewHtml, setStudioPreviewHtml] = useState<string>('');

  // Quiz, Challenge a Friend & Revision Flashcards Lab inside Moha AI
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResultSaved, setQuizResultSaved] = useState<boolean>(false);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState<string>('ALL');
  const [quizStartTime, setQuizStartTime] = useState<number>(() => Date.now());
  const [activeChallenge, setActiveChallenge] = useState<TopicQuizChallenge | null>(null);
  const [allChallenges, setAllChallenges] = useState<TopicQuizChallenge[]>([]);
  const [challengeShareUrl, setChallengeShareUrl] = useState<string>('');
  const [challengePlayerName, setChallengePlayerName] = useState<string>('');
  const [challengePlayerSchool, setChallengePlayerSchool] = useState<string>('');
  const [challengeCreating, setChallengeCreating] = useState<boolean>(false);
  const [scoreSubmittedToChallenge, setScoreSubmittedToChallenge] = useState<boolean>(false);
  const [showFlashcardsSection, setShowFlashcardsSection] = useState<boolean>(false);
  const [joinChallengeCode, setJoinChallengeCode] = useState<string>('');
  const [joiningChallengeByCode, setJoiningChallengeByCode] = useState<boolean>(false);
  const [serverPublicAppUrl, setServerPublicAppUrl] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>(() => {
    try {
      return localStorage.getItem('elimika_custom_domain') || '';
    } catch {
      return '';
    }
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('elimika_dark_mode');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('elimika_dark_mode', String(darkMode));
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(() =>
    getDefaultFlashcardsForSubject('Form 3', 'Basic Mathematics')
  );
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [flashcardLoading, setFlashcardLoading] = useState<boolean>(false);

  // Speech Synthesis State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  function handleSaveCustomDomain(domain: string) {
    setCustomDomain(domain);
    try {
      if (domain) {
        localStorage.setItem('elimika_custom_domain', domain);
        showToast(`🌐 Custom domain saved: ${domain}`);
      } else {
        localStorage.removeItem('elimika_custom_domain');
      }
    } catch {
      // ignore storage errors
    }
  }

  function getPublicShareBaseUrl(customServerUrl?: string): string {
    const rawOrigin = (customDomain || customServerUrl || serverPublicAppUrl || window.location.origin).replace(/\/+$/, '');
    // Replace private ais-dev URL (which shows 403 Forbidden to friends) with the shared ais-pre preview URL
    return rawOrigin.replace('https://ais-dev-', 'https://ais-pre-');
  }

  function buildPublicChallengeLink(
    challengeId: string,
    cls?: string,
    subject?: string,
    topic?: string,
    createdBy?: string,
    customServerUrl?: string
  ): string {
    const base = getPublicShareBaseUrl(customServerUrl);
    const code = challengeId.trim().toUpperCase();
    const hashParams = new URLSearchParams({ challenge: code });
    if (cls) hashParams.set('cls', cls);
    if (subject) hashParams.set('sub', subject);
    if (topic) hashParams.set('topic', topic);
    if (createdBy) hashParams.set('by', createdBy);
    return `${base}/#${hashParams.toString()}`;
  }

  async function fetchAllChallenges() {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        const data = await res.json();
        if (data.publicAppUrl) {
          setServerPublicAppUrl(data.publicAppUrl);
        }
        if (Array.isArray(data.challenges)) {
          setAllChallenges(data.challenges);
          if (!activeChallenge && data.challenges.length > 0) {
            setActiveChallenge(data.challenges[0]);
          }
        }
      }
    } catch {
      // ignore offline
    }
  }

  async function loadSharedChallengeFromUrl(
    challengeId: string,
    clsParam?: string,
    subParam?: string,
    topicParam?: string,
    byParam?: string
  ) {
    const cleanCode = challengeId.trim().toUpperCase();
    if (!cleanCode) return;

    const targetCls = clsParam || mohaActiveClass || 'Form 3';
    const targetSub = subParam || mohaActiveSubject || 'Basic Mathematics';
    const targetTopic = topicParam || 'Core Competence';
    setJoiningChallengeByCode(true);
    setMohaActiveClass(targetCls);
    setMohaActiveSubject(targetSub);
    setSelectedQuizTopic(targetTopic);
    setMohaOpen(true);
    setActivePage('moha');
    setMohaViewMode('quiz');
    setQuizLoading(true);
    setQuizSelectedAnswers({});
    setQuizResultSaved(false);
    setScoreSubmittedToChallenge(false);
    setQuizStartTime(Date.now());

    const query = new URLSearchParams({
      cls: targetCls,
      sub: targetSub,
      topic: targetTopic,
      by: byParam || 'Friend',
    }).toString();

    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(cleanCode)}?${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.publicAppUrl) {
          setServerPublicAppUrl(data.publicAppUrl);
        }
        if (data.challenge) {
          const ch: TopicQuizChallenge = data.challenge;
          setActiveChallenge(ch);
          setMohaActiveClass(ch.cls);
          setMohaActiveSubject(ch.subject);
          setSelectedQuizTopic(ch.topic);
          setQuizItems(ch.questions || []);
          const shareLink = buildPublicChallengeLink(
            ch.id,
            ch.cls,
            ch.subject,
            ch.topic,
            ch.createdBy,
            data.publicAppUrl
          );
          setChallengeShareUrl(shareLink);
          setQuizLoading(false);
          setJoiningChallengeByCode(false);
          setJoinChallengeCode('');
          showToast(`🏆 Joined Challenge [${ch.id}]: "${ch.topic}" by ${ch.createdBy}!`);
          fetchAllChallenges();
          return;
        }
      }
    } catch {
      // fallback to local quiz start below
    }

    setJoiningChallengeByCode(false);
    startAiQuiz(targetCls, targetSub, targetTopic);
  }

  function parseChallengeFromLocation(): {
    id: string;
    cls?: string;
    sub?: string;
    topic?: string;
    by?: string;
  } | null {
    // 1. Check query string (?challenge=...)
    const searchParams = new URLSearchParams(window.location.search);
    const qId = searchParams.get('challenge');
    if (qId && qId.trim()) {
      return {
        id: qId.trim().toUpperCase(),
        cls: searchParams.get('cls') || undefined,
        sub: searchParams.get('sub') || undefined,
        topic: searchParams.get('topic') || undefined,
        by: searchParams.get('by') || undefined,
      };
    }

    // 2. Check URL hash (#challenge=...) which survives redirects & proxy auth
    const rawHash = (window.location.hash || '').replace(/^#/, '');
    if (rawHash.includes('challenge=')) {
      const hashParams = new URLSearchParams(rawHash);
      const hId = hashParams.get('challenge');
      if (hId && hId.trim()) {
        return {
          id: hId.trim().toUpperCase(),
          cls: hashParams.get('cls') || undefined,
          sub: hashParams.get('sub') || undefined,
          topic: hashParams.get('topic') || undefined,
          by: hashParams.get('by') || undefined,
        };
      }
    }
    return null;
  }

  // Load initial localStorage state, Google Sheet data & URL Challenge link
  useEffect(() => {
    try {
      const sc = localStorage.getItem('elimika_saved_class');
      if (sc) setSavedClass(sc);
      const rp = JSON.parse(localStorage.getItem('elimika_recent_papers') || '[]');
      if (Array.isArray(rp)) setRecentPapers(rp);
      const lm = JSON.parse(localStorage.getItem('elimika_moha_learned_v1') || '[]');
      if (Array.isArray(lm)) setLearnedMemory(lm);
      const qh = JSON.parse(localStorage.getItem('elimika_quiz_history_v1') || '[]');
      if (Array.isArray(qh)) setQuizHistory(qh);
      const up = JSON.parse(localStorage.getItem('elimika_user_profile_v1') || 'null');
      if (up && typeof up === 'object') {
        setUserProfile(up);
        if (up.school) {
          setTsSchool(up.school);
          setChallengePlayerSchool(up.school);
        }
        if (up.name) {
          setTsTeacher(up.name);
          setChallengePlayerName(up.name);
        }
      }
    } catch {
      // ignore storage errors
    }

    fetchSheetData();
    fetchAllChallenges();

    const parsedChallenge = parseChallengeFromLocation();
    if (parsedChallenge) {
      loadSharedChallengeFromUrl(
        parsedChallenge.id,
        parsedChallenge.cls,
        parsedChallenge.sub,
        parsedChallenge.topic,
        parsedChallenge.by
      );
    } else if (window.location.hash === '#syllabus') {
      setActivePage('syllabus');
    } else if (window.location.hash === '#books') {
      setActivePage('books');
    } else if (window.location.hash === '#moha') {
      openMwalimuModal();
    }

    const onHashChange = () => {
      const ch = parseChallengeFromLocation();
      if (ch) {
        loadSharedChallengeFromUrl(ch.id, ch.cls, ch.sub, ch.topic, ch.by);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Render KaTeX math formulas & keep latest message visible above the pinned input box
  useEffect(() => {
    if (activePage !== 'moha' || mohaViewMode !== 'chat' || !chatContainerRef.current) return;
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(chatContainerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch {
        // ignore katex render error
      }
    }
  }, [mohaMessages, mohaOpen, mohaViewMode, activePage]);

  // Integrated Website Resources Context for active Class & Subject (plus cross-subject fallback)
  const activeSiteResources = React.useMemo<SiteResourceContext>(() => {
    const clsNorm = (mohaActiveClass || 'Form 3').toLowerCase();
    const subNorm = (mohaActiveSubject || 'Basic Mathematics').toLowerCase();

    const matchingBooks = allPapers.filter(
      (p) =>
        p.isBook &&
        (p.subject.toLowerCase().includes(subNorm) || subNorm.includes(p.subject.toLowerCase())) &&
        (p.form.toLowerCase() === clsNorm || p.paperUrl !== null)
    );
    const matchingSyllabuses = allPapers.filter(
      (p) =>
        p.isSyllabus &&
        (p.subject.toLowerCase().includes(subNorm) ||
          subNorm.includes(p.subject.toLowerCase()) ||
          p.form.toLowerCase().includes(clsNorm))
    );
    const matchingPapers = allPapers.filter(
      (p) =>
        !p.isBook &&
        !p.isSyllabus &&
        (p.subject.toLowerCase().includes(subNorm) || subNorm.includes(p.subject.toLowerCase())) &&
        (p.form.toLowerCase() === clsNorm || p.paperUrl !== null)
    );

    // If few specific papers, also include top uploaded papers across subjects so Moha AI knows what's on the website
    const crossPapers =
      matchingPapers.length > 0
        ? matchingPapers
        : allPapers.filter((p) => !p.isBook && !p.isSyllabus).slice(0, 6);

    return {
      syllabuses: matchingSyllabuses.slice(0, 6).map((s) => ({
        title: s.title,
        form: s.form,
        subject: s.subject,
        year: s.year,
        hasUrl: Boolean(s.paperUrl),
      })),
      books: matchingBooks.slice(0, 6).map((b) => ({
        title: b.title,
        form: b.form,
        subject: b.subject,
        year: b.year,
        hasUrl: Boolean(b.paperUrl),
      })),
      papers: crossPapers.slice(0, 8).map((p) => ({
        title: p.title,
        form: p.form,
        subject: p.subject,
        year: p.year,
        category: p.category,
        hasUrl: Boolean(p.paperUrl),
        hasAnswers: Boolean(p.answersUrl),
      })),
    };
  }, [allPapers, mohaActiveClass, mohaActiveSubject]);

  // Compute Mastery Progress Statistics for the User Profile View
  const masteryProgressData = React.useMemo(() => {
    const targetCls = userProfile.targetClass || mohaActiveClass || 'Form 4';
    const subjectsList = TIE_CURRICULUM_SUBJECTS[targetCls] || [
      'Basic Mathematics',
      'Biology',
      'Chemistry',
      'Physics',
      'Geography',
      'History',
      'English Language',
      'Kiswahili',
      'Civics',
    ];

    const subjectBreakdown = subjectsList.slice(0, 8).map((sub) => {
      const totalCompetences = Math.max(4, getSyllabusTopicsForClassSubject(targetCls, sub).length);
      const subLower = sub.toLowerCase();

      const learnedForSub = learnedMemory.filter(
        (m) => m.subject.toLowerCase().includes(subLower) || subLower.includes(m.subject.toLowerCase())
      );
      const quizzesForSub = quizHistory.filter(
        (q) =>
          (q.subject.toLowerCase().includes(subLower) || subLower.includes(q.subject.toLowerCase())) &&
          q.score > 0
      );

      // Unique topics mastered from quizzes + learned notes
      const uniqueMasteredTopics = new Set<string>();
      learnedForSub.forEach((l) => uniqueMasteredTopics.add(l.topic.toLowerCase()));
      quizzesForSub.forEach((q) => uniqueMasteredTopics.add(q.topic.toLowerCase()));

      const masteredCount = uniqueMasteredTopics.size;
      const percentage = Math.min(100, Math.round((masteredCount / totalCompetences) * 100));

      return {
        subject: sub,
        icon: getSubjectIcon(sub),
        masteredCount,
        quizTopicsCount: quizzesForSub.length,
        learnedNotesCount: learnedForSub.length,
        totalCompetences,
        percentage,
      };
    });

    const allMasteredSet = new Set<string>();
    learnedMemory.forEach((l) => allMasteredSet.add(`${l.subject}:${l.topic}`.toLowerCase()));
    quizHistory
      .filter((q) => q.score > 0)
      .forEach((q) => allMasteredSet.add(`${q.subject}:${q.topic}`.toLowerCase()));

    const totalMasteredTopics = allMasteredSet.size;
    const totalQuizzesCompleted = quizHistory.length;
    const totalLearnedNotes = learnedMemory.length;
    const totalCorrectAnswers = quizHistory.reduce((acc, q) => acc + q.score, 0);
    const totalQuizQuestions = quizHistory.reduce((acc, q) => acc + q.total, 0);
    const avgQuizAccuracy =
      totalQuizQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuizQuestions) * 100) : 0;

    return {
      targetCls,
      subjectBreakdown,
      totalMasteredTopics,
      totalQuizzesCompleted,
      totalLearnedNotes,
      avgQuizAccuracy,
    };
  }, [userProfile.targetClass, mohaActiveClass, learnedMemory, quizHistory]);

  async function fetchSheetData() {
    setSyncStatus('syncing');
    try {
      const cached = localStorage.getItem('elimika_papers_cache_v3');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          setAllPapers(parsedCache);
        }
      }
    } catch {
      // ignore cache parse error
    }

    const endpoints = [
      `/api/sheets/${CONFIG.SHEET_ID}`,
      `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv`,
      `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv`,
    ];

    let csvText: string | null = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes('<!DOCTYPE html>') && text.length > 20) {
            csvText = text;
            break;
          }
        }
      } catch {
        // try next
      }
    }

    if (!csvText) {
      setSyncStatus('offline');
      return;
    }

    try {
      const raw = parseCSV(csvText);
      const processed = processParsedRows(raw);
      setAllPapers(processed);
      localStorage.setItem('elimika_papers_cache_v3', JSON.stringify(processed));
      setSyncStatus('live');
    } catch {
      setSyncStatus('error');
    }
  }

  function triggerDirectDownloadUrl(rawUrl: string | null, filename?: string) {
    const dlUrl = getDirectDownloadUrl(rawUrl);
    if (!dlUrl || dlUrl === '#') {
      showToast('Google Drive link is not attached in the Google Sheet yet.');
      return;
    }
    const a = document.createElement('a');
    a.href = dlUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function selectClass(className: string) {
    setSelectedClass(className);
    setSearchQuery('');
    setSavedClass(className);
    try {
      localStorage.setItem('elimika_saved_class', className);
    } catch {
      // ignore
    }
    setActivePage('papers');
    setStep(2);
  }

  function selectSubject(subjectName: string) {
    setSelectedSubject(subjectName);
    setSelectedCategory('ALL');
    setSelectedYear('ALL');
    setPage(1);
    setStep(3);
  }

  function resetToStep1() {
    setActivePage('papers');
    setSelectedClass('');
    setSelectedSubject('');
    setSearchQuery('');
    setStep(1);
  }

  function openBooksPage(filterClass = '', filterSubject = '') {
    setActivePage('books');
    if (filterClass) {
      const fLower = filterClass.toLowerCase();
      if (fLower.includes('standard')) setBooksPageLevel('Primary');
      else if (fLower.includes('form 5') || fLower.includes('form 6')) setBooksPageLevel('Advanced');
      else setBooksPageLevel('Secondary');
      setBooksPageSelectedClass(filterClass);
    }
    if (filterSubject) {
      setBooksSearchQuery(filterSubject);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openSyllabusPage() {
    setActivePage('syllabus');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSmartSearchChange(val: string) {
    setSearchQuery(val);
    setPage(1);
    if (val.trim().length > 0) {
      setActivePage('papers');
      setStep(3);
    } else {
      setStep(selectedClass ? 2 : 1);
    }
  }

  function startVoiceSearch() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      showToast('Your browser does not support Voice Search.');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    showToast('🎤 Speak now (e.g. Form 4 Mathematics)...');
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        handleSmartSearchChange(transcript);
      }
    };
    recognition.start();
  }

  function saveRecentPaper(paper: PaperRecord) {
    try {
      const filtered = recentPapers.filter((x) => x.id !== paper.id);
      const updated = [
        { id: paper.id, title: paper.title, form: paper.form, subject: paper.subject, year: paper.year },
        ...filtered,
      ].slice(0, 4);
      setRecentPapers(updated);
      localStorage.setItem('elimika_recent_papers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  function openViewer(paperId: string, type: 'paper' | 'answers' = 'paper') {
    const p = allPapers.find((item) => item.id === paperId);
    if (!p) return;
    saveRecentPaper(p);

    const rawUrl = type === 'answers' && p.answersUrl ? p.answersUrl : p.paperUrl;
    const previewUrl = getPreviewUrl(rawUrl);

    if (!rawUrl || !previewUrl) {
      showToast('Google Drive link is not attached in the Google Sheet yet.');
      return;
    }

    setViewerPaper(p);
    setViewerType(type);
    setViewerLoading(true);
  }

  function togglePrintBasketItem(paperId: string) {
    const p = allPapers.find((x) => x.id === paperId);
    if (!p) return;
    setPrintBasket((prev) => {
      const exists = prev.some((x) => x.id === paperId);
      if (exists) return prev.filter((x) => x.id !== paperId);
      return [...prev, p];
    });
  }

  function getPrintBasketWhatsAppUrl(): string {
    const lines = printBasket.map(
      (p, idx) => `${idx + 1}. ${p.title} (${p.form}) - ${getDirectDownloadUrl(p.paperUrl)}`
    );
    const text = encodeURIComponent(
      `Hello Stationery, please print these past papers from Elimika Tanzania:\n\n${lines.join('\n')}`
    );
    return `https://wa.me/?text=${text}`;
  }

  // ==================== MOHA AI FULL-PAGE FUNCTIONS ====================
  function openMwalimuModal(
    cls?: string,
    sub?: string,
    initialView: 'chat' | 'studio' | 'quiz' | 'diagram' | 'resources' | 'profile' = 'chat'
  ) {
    const targetCls = cls || selectedClass || 'Form 3';
    const targetSub = sub || selectedSubject || 'Basic Mathematics';
    setMohaActiveClass(targetCls);
    setMohaActiveSubject(targetSub);
    setTsClass(targetCls);
    setTsSubject(targetSub);
    setMohaViewMode(initialView);
    setFlashcards(getDefaultFlashcardsForSubject(targetCls, targetSub));
    setActiveFlashcardIdx(0);
    setFlashcardFlipped(false);

    const defaultTopics = getSyllabusTopicsForClassSubject(targetCls, targetSub);
    if (!tsTopic && defaultTopics.length > 0) {
      setTsTopic(defaultTopics[0].replace(/^\d+\.\d+\s*/, ''));
    }

    setMohaMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 'msg-welcome',
          role: 'ai',
          text: `Hello! I am **Moha AI** for **${targetCls} • ${targetSub}**.\nAsk any question below, upload an exam photo (**📷**), or use the top tabs for **Quiz & Friend Challenges**, **Teacher Docs**, and **Diagrams**.`,
        },
      ];
    });

    setMohaOpen(true);
    setActivePage('moha');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startMohaVoiceDictation() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      showToast('Voice dictation is not supported on this browser.');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    showToast('🎤 Listening... Speak your question or topic for Moha AI.');
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setMohaInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.start();
  }

  async function loadAiFlashcards(customClass?: string, customSubject?: string) {
    const targetCls = customClass || mohaActiveClass;
    const targetSub = customSubject || mohaActiveSubject;
    setFlashcardLoading(true);
    setActiveFlashcardIdx(0);
    setFlashcardFlipped(false);
    try {
      const res = await fetch('/api/moha/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cls: targetCls, subject: targetSub }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
          setFlashcards(data.flashcards);
          setFlashcardLoading(false);
          return;
        }
      }
    } catch {
      // fallback below
    }
    setFlashcards(getDefaultFlashcardsForSubject(targetCls, targetSub));
    setFlashcardLoading(false);
  }

  function markFlashcardTopicMastered(card: FlashcardItem) {
    saveMohaLearnedItem(card.topic, `${card.front} — ${card.back} (${card.formulaOrKeyPoint})`);
    showToast(`✅ Mastered "${card.topic}"! Added to your Profile Mastery Chart.`);
  }

  function saveUserProfileChanges(updated: UserProfileData) {
    setUserProfile(updated);
    if (updated.school) setTsSchool(updated.school);
    if (updated.name) setTsTeacher(updated.name);
    try {
      localStorage.setItem('elimika_user_profile_v1', JSON.stringify(updated));
      showToast('Profile saved and linked to Teacher Studio!');
    } catch {
      // ignore
    }
  }

  function saveMohaLearnedItem(topic: string, content: string) {
    if (!topic.trim() || !content.trim()) return;
    const filtered = learnedMemory.filter((x) => x.topic.toLowerCase() !== topic.trim().toLowerCase());
    const updated: LearnedMemoryItem[] = [
      {
        topic: topic.trim(),
        content: content.trim(),
        cls: mohaActiveClass,
        subject: mohaActiveSubject,
        timestamp: new Date().toISOString().split('T')[0],
      },
      ...filtered,
    ].slice(0, 100);
    setLearnedMemory(updated);
    try {
      localStorage.setItem('elimika_moha_learned_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  function handleSaveLearnedFromForm() {
    if (!learnTopicInput.trim() || !learnAnswerInput.trim()) {
      showToast('Please enter both Topic and Knowledge.');
      return;
    }
    const t = learnTopicInput.trim();
    const a = learnAnswerInput.trim();
    saveMohaLearnedItem(t, a);
    setLearnTopicInput('');
    setLearnAnswerInput('');
    setMohaLearnPanelOpen(false);
    setMohaViewMode('chat');
    showToast(`🧠 Moha AI permanently learned "${t}" & updated your Mastery Chart!`);
    setMohaMessages((prev) => [
      ...prev,
      {
        id: `ai-learn-${Date.now()}`,
        role: 'ai',
        text: `🧠 **New Knowledge Saved to Permanent Memory & Mastery Progress!**\n• **Subject:** ${mohaActiveClass} ${mohaActiveSubject}\n• **Topic:** ${t}\n• **Knowledge:** ${a}`,
      },
    ]);
  }

  function openTeacherDocFormFor() {
    setActivePage('moha');
    setMohaViewMode('studio');
    setTeacherStudioOpen(true);
    const defaultTopics = getSyllabusTopicsForClassSubject(mohaActiveClass, mohaActiveSubject);
    if (!tsTopic && defaultTopics.length > 0) {
      setTsTopic(defaultTopics[0].replace(/^\d+\.\d+\s*/, ''));
    }
  }

  async function submitTeacherStudioDoc(type: OfficialDocType) {
    const school = tsSchool.trim() || userProfile.school || 'ELIMIKA SECONDARY SCHOOL';
    const teacher = tsTeacher.trim() || userProfile.name || 'SUBJECT TEACHER';
    const topic =
      tsTopic.trim() ||
      getSyllabusTopicsForClassSubject(tsClass || mohaActiveClass, tsSubject || mohaActiveSubject)[0] ||
      'Core Competence';
    const subTopic = tsSubTopic.trim() || topic;

    const meta: TeacherMetadata = {
      school,
      teacher,
      date: tsDate || new Date().toISOString().split('T')[0],
      cls: tsClass || mohaActiveClass,
      subject: tsSubject || mohaActiveSubject,
      duration: tsDuration || '80 Minutes',
      topic,
      subTopic,
      regG: Number(tsRegG) || 25,
      regB: Number(tsRegB) || 25,
      regTotal: (Number(tsRegG) || 25) + (Number(tsRegB) || 25),
      presG: Number(tsPresG) || 24,
      presB: Number(tsPresB) || 24,
      presTotal: (Number(tsPresG) || 24) + (Number(tsPresB) || 24),
      siteResources: activeSiteResources,
    };

    const docLabels: Record<OfficialDocType, string> = {
      lessonplan: '4-Stage TIE Competence-Based Lesson Plan',
      schemeofwork: 'PO-RALG Scheme of Work (2026)',
      lessonnotes: 'Official TIE Comprehensive Lesson Notes',
      exampaper: 'Full NECTA Format Examination Paper (100 Marks)',
      blueprint: "Bloom's Taxonomy Table of Specifications (Exam Blueprint)",
      markingscheme: 'Official NECTA Marking Scheme',
      logbook: 'Subject Log Book',
    };

    setTeacherStudioOpen(false);
    setGeneratingDocType(type);

    const userMsgId = `user-doc-${Date.now()}`;
    const loadingMsgId = `ai-doc-load-${Date.now() + 1}`;

    setMohaMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: `Generate official ${docLabels[type]} for ${meta.cls} ${meta.subject} — Topic: ${meta.topic} (${meta.subTopic}), integrating website TIE Books, Syllabus & Past Papers.`,
      },
      {
        id: loadingMsgId,
        role: 'ai',
        loading: true,
        text: `Preparing official ${docLabels[type]} using website syllabus, TIE books & past papers...`,
      },
    ]);

    try {
      const response = await fetch('/api/moha/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, meta }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.html) {
          setStudioPreviewHtml(data.html);
          setMohaMessages((prev) =>
            prev.map((m) => (m.id === loadingMsgId ? { id: `ai-doc-${Date.now()}`, role: 'ai', text: data.html } : m))
          );
          setGeneratingDocType(null);
          showToast(`✅ Generated ${docLabels[type]}!`);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const instantHtml = buildInstantOfficialDocument(type, meta);
    setStudioPreviewHtml(instantHtml);
    setMohaMessages((prev) =>
      prev.map((m) => (m.id === loadingMsgId ? { id: `ai-doc-${Date.now()}`, role: 'ai', text: instantHtml } : m))
    );
    setGeneratingDocType(null);
    showToast(`✅ Generated ${docLabels[type]}!`);
  }

  async function sendMwalimuMessage(overridePrompt?: string) {
    const rawText = overridePrompt !== undefined ? overridePrompt : mohaInput;
    const userText = rawText.trim();
    const attachedImg = mohaPendingImage;

    if (!userText && !attachedImg) return;

    setMohaViewMode('chat');
    setMohaInput('');
    setMohaPendingImage(null);

    // Check if user is teaching Moha AI via "learn: Topic = Explanation"
    const learnMatch = userText.match(/^(?:learn|teach|remember)\s*:\s*([^=:-]+)[=:-](.+)$/i);
    if (learnMatch) {
      const learnedTopic = learnMatch[1].trim();
      const learnedContent = learnMatch[2].trim();
      saveMohaLearnedItem(learnedTopic, learnedContent);
      setMohaMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', text: userText },
        {
          id: `ai-${Date.now() + 1}`,
          role: 'ai',
          text: `🧠 **Knowledge Saved Permanently & Added to Mastery Progress!**\n\n• **Class & Subject:** ${mohaActiveClass} ${mohaActiveSubject}\n• **Topic:** ${learnedTopic}\n• **Knowledge:** ${learnedContent}\n\nI will recall this whenever you ask about **${learnedTopic}**, and your Profile Mastery Chart has been updated.`,
        },
      ]);
      return;
    }

    // Check if user typed "lesson plan" or "scheme of work" without filling form
    const lower = userText.toLowerCase();
    if (
      overridePrompt === undefined &&
      (lower === 'lesson plan' || lower === 'scheme of work' || lower === 'prepare lesson plan')
    ) {
      openTeacherDocFormFor();
      setMohaMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', text: userText },
        {
          id: `ai-${Date.now() + 1}`,
          role: 'ai',
          text: `Please fill in or confirm the **Teacher Details** form above (**School Name, Teacher's Name, Class, Subject, Main Topic, Sub-Topic**) and click **Generate** to create your official document integrated with our website's TIE Books, Syllabuses, and Past Papers.`,
        },
      ]);
      return;
    }

    const displayPrompt = userText || 'Solve this question step-by-step and show the NECTA Marking Scheme.';
    const loadingId = `load-${Date.now()}`;

    setMohaMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: displayPrompt,
        imagePreview: attachedImg?.previewUrl,
      },
      {
        id: loadingId,
        role: 'ai',
        loading: true,
        text: 'Moha AI is analyzing with TIE Books, Syllabuses & NECTA Past Papers...',
      },
    ]);

    try {
      const response = await fetch('/api/moha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: displayPrompt,
          cls: mohaActiveClass,
          subject: mohaActiveSubject,
          image: attachedImg ? { mimeType: attachedImg.mimeType, base64Data: attachedImg.base64Data } : null,
          history: mohaMessages.slice(-6).map((m) => ({ id: m.id, role: m.role, text: m.text })),
          learnedMemory,
          siteResources: activeSiteResources,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const matchedPreset = detectDiagramPreset(displayPrompt, mohaActiveSubject);
          setMohaMessages((prev) =>
            prev.map((m) =>
              m.id === loadingId
                ? { id: `ai-${Date.now()}`, role: 'ai', text: data.reply, diagramPreset: matchedPreset }
                : m
            )
          );
          return;
        }
      }
    } catch {
      // fallback to local smart tutor below
    }

    const localReply = generateLocalSmartTutorReply(
      displayPrompt,
      mohaActiveClass,
      mohaActiveSubject,
      learnedMemory,
      activeSiteResources
    );
    const matchedPreset = detectDiagramPreset(displayPrompt, mohaActiveSubject);
    setMohaMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? { id: `ai-${Date.now()}`, role: 'ai', text: localReply, diagramPreset: matchedPreset }
          : m
      )
    );
  }

  function sendQuickMwalimuPrompt(kind: 'syllabus' | 'summary' | 'questions' | 'lessonnotes' | 'table_diagram') {
    if (kind === 'lessonnotes') {
      submitTeacherStudioDoc('lessonnotes');
      return;
    }
    if (kind === 'table_diagram') {
      sendMwalimuMessage(
        `Draw a clear structured comparison table and an interactive diagram for ${mohaActiveClass} ${mohaActiveSubject} with step-by-step NECTA explanation.`
      );
      return;
    }
    if (kind === 'syllabus') {
      sendMwalimuMessage(
        `Show me the official TIE Syllabus topics, competences, and integrated website resources for ${mohaActiveClass} ${mohaActiveSubject}.`
      );
    } else if (kind === 'summary') {
      sendMwalimuMessage(
        `Give me a comprehensive TIE revision summary, key definitions, and essential formulas for ${mohaActiveClass} ${mohaActiveSubject} based on the TIE textbook and syllabus.`
      );
    } else {
      sendMwalimuMessage(
        `Give me 5 high-yield NECTA examination practice questions with complete step-by-step Marking Schemes for ${mohaActiveClass} ${mohaActiveSubject}.`
      );
    }
  }

  async function startAiQuiz(customClass?: string, customSubject?: string, customTopic?: string) {
    const targetCls = customClass || mohaActiveClass;
    const targetSub = customSubject || mohaActiveSubject;
    const targetTopic = customTopic !== undefined ? customTopic : selectedQuizTopic;

    if (customClass) setMohaActiveClass(customClass);
    if (customSubject) setMohaActiveSubject(customSubject);
    if (customTopic !== undefined) setSelectedQuizTopic(customTopic);

    setMohaViewMode('quiz');
    setQuizLoading(true);
    setQuizSelectedAnswers({});
    setQuizResultSaved(false);
    setScoreSubmittedToChallenge(false);
    setQuizStartTime(Date.now());

    try {
      const response = await fetch('/api/moha/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cls: targetCls,
          subject: targetSub,
          topic: targetTopic,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizItems(data.questions);
          setQuizLoading(false);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const topics = getSyllabusTopicsForClassSubject(targetCls, targetSub);
    const focusTopic =
      targetTopic && targetTopic !== 'ALL'
        ? targetTopic
        : topics[0] || `1.0 Core Principles of ${targetSub}`;

    setQuizItems([
      {
        question: `[NECTA ${targetCls} ${targetSub}] Which competence principle is central when solving problems on "${focusTopic}" under the TIE curriculum?`,
        options: [
          `Applying ${focusTopic} formulas, definitions, and real-life Tanzanian applications step-by-step`,
          'Memorizing final answers without showing working or units',
          'Skipping formula statements and diagrams',
          'Using unrelated non-syllabus assumptions',
        ],
        correctIndex: 0,
        explanation: `In NECTA ${targetSub}, questions on "${focusTopic}" require stating the governing principle/formula, substituting given data clearly, and stating proper units.`,
        topic: focusTopic,
      },
      {
        question: `When answering a structured NECTA Section B question on "${focusTopic}" (${targetCls} ${targetSub}), how are method marks (M1) awarded?`,
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
        question: `Which of the following is an official TIE syllabus competence tested alongside "${focusTopic}" in ${targetCls} ${targetSub}?`,
        options: [
          topics[1] || topics[0] || focusTopic,
          'Unrelated Extracurricular Speculation',
          'Non-Tanzanian Optional Module',
          'Deprecated 1970s Syllabus Only',
        ],
        correctIndex: 0,
        explanation: `${topics[1] || topics[0] || targetSub} is a core competence in the TIE curriculum.`,
        topic: focusTopic,
      },
      {
        question: `In ${targetCls} ${targetSub}, why is graphical or tabular presentation important when analyzing "${focusTopic}"?`,
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
    ]);
    setQuizLoading(false);
  }

  async function submitChallengeScore(scoreCount: number, totalCount: number) {
    const elapsedSeconds = Math.max(5, Math.round((Date.now() - quizStartTime) / 1000));
    const playerName = (challengePlayerName || userProfile.name || 'Student').trim();
    const school = (challengePlayerSchool || userProfile.school || 'Elimika Secondary').trim();
    const topicLabel =
      selectedQuizTopic && selectedQuizTopic !== 'ALL'
        ? selectedQuizTopic.replace(/^\d+\.\d+\s*/, '')
        : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '') || `${mohaActiveSubject} Competence`;

    const targetChallengeId =
      activeChallenge?.id ||
      `ch-${mohaActiveClass.toLowerCase().replace(/\s+/g, '')}-${mohaActiveSubject
        .toLowerCase()
        .slice(0, 6)}-${Date.now().toString(36).slice(-4)}`;

    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(targetChallengeId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          school,
          score: scoreCount,
          total: totalCount,
          timeSeconds: elapsedSeconds,
          cls: mohaActiveClass,
          subject: mohaActiveSubject,
          topic: topicLabel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          setActiveChallenge(data.challenge);
          setScoreSubmittedToChallenge(true);
          fetchAllChallenges();
          showToast(`🏆 Score (${scoreCount}/${totalCount}) posted to the NECTA Leaderboard!`);
          return;
        }
      }
    } catch {
      // local fallback below
    }

    const fallbackEntry: ChallengeLeaderboardEntry = {
      id: `local-${Date.now()}`,
      playerName,
      school,
      score: scoreCount,
      total: totalCount,
      percentage: Math.round((scoreCount / Math.max(1, totalCount)) * 100),
      timeSeconds: elapsedSeconds,
      completedAt: new Date().toISOString().split('T')[0],
    };

    setActiveChallenge((prev) => {
      const base: TopicQuizChallenge = prev || {
        id: targetChallengeId,
        cls: mohaActiveClass,
        subject: mohaActiveSubject,
        topic: topicLabel,
        createdBy: playerName,
        createdAt: new Date().toISOString().split('T')[0],
        questions: quizItems,
        leaderboard: [],
      };
      const nextBoard = [...base.leaderboard.filter((e) => e.playerName !== playerName), fallbackEntry].sort(
        (a, b) => b.percentage - a.percentage || a.timeSeconds - b.timeSeconds
      );
      return { ...base, leaderboard: nextBoard };
    });
    setScoreSubmittedToChallenge(true);
    showToast(`🏆 Score (${scoreCount}/${totalCount}) added to Leaderboard!`);
  }

  async function createFriendChallenge() {
    setChallengeCreating(true);
    const topicLabel =
      selectedQuizTopic && selectedQuizTopic !== 'ALL'
        ? selectedQuizTopic.replace(/^\d+\.\d+\s*/, '')
        : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '') || `Core ${mohaActiveSubject}`;

    const creatorName = (challengePlayerName || userProfile.name || 'Classmate').trim();
    const creatorSchool = (challengePlayerSchool || userProfile.school || 'Elimika Secondary').trim();

    let currentScore: number | undefined = undefined;
    if (quizItems.length > 0 && Object.keys(quizSelectedAnswers).length === quizItems.length) {
      currentScore = quizItems.reduce(
        (acc, item, idx) => acc + (quizSelectedAnswers[idx] === item.correctIndex ? 1 : 0),
        0
      );
    }
    const elapsedSeconds = Math.max(8, Math.round((Date.now() - quizStartTime) / 1000));

    try {
      const res = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cls: mohaActiveClass,
          subject: mohaActiveSubject,
          topic: topicLabel,
          createdBy: creatorName,
          school: creatorSchool,
          questions: quizItems.length > 0 ? quizItems : undefined,
          creatorScore: currentScore,
          creatorTimeSeconds: elapsedSeconds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.publicAppUrl) {
          setServerPublicAppUrl(data.publicAppUrl);
        }
        if (data.challenge) {
          const ch: TopicQuizChallenge = data.challenge;
          setActiveChallenge(ch);
          if (ch.questions && ch.questions.length > 0 && quizItems.length === 0) {
            setQuizItems(ch.questions);
          }
          const shareLink = buildPublicChallengeLink(
            ch.id,
            ch.cls,
            ch.subject,
            ch.topic,
            ch.createdBy,
            data.publicAppUrl
          );
          setChallengeShareUrl(shareLink);
          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareLink).catch(() => {});
          }
          fetchAllChallenges();
          setChallengeCreating(false);
          showToast(`🤝 Challenge Code [${ch.id}] & Public Link Copied!`);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const fallbackId = `QUIZ-${Math.floor(100 + Math.random() * 899)}`;
    const shareLink = buildPublicChallengeLink(
      fallbackId,
      mohaActiveClass,
      mohaActiveSubject,
      topicLabel,
      creatorName
    );
    setChallengeShareUrl(shareLink);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLink).catch(() => {});
    }
    setChallengeCreating(false);
    showToast(`🤝 Challenge Code [${fallbackId}] & Link Copied!`);
  }

  function startFriendTurnSameDevice() {
    setChallengePlayerName('');
    setQuizSelectedAnswers({});
    setQuizResultSaved(false);
    setScoreSubmittedToChallenge(false);
    setQuizStartTime(Date.now());
    showToast('👥 Friend Turn Ready! Enter your friend’s name above and answer the same questions.');
  }

  function copyChallengeShareLink() {
    if (!challengeShareUrl && !activeChallenge) {
      createFriendChallenge();
      return;
    }
    const urlToCopy =
      challengeShareUrl ||
      (activeChallenge
        ? buildPublicChallengeLink(
            activeChallenge.id,
            activeChallenge.cls,
            activeChallenge.subject,
            activeChallenge.topic,
            activeChallenge.createdBy
          )
        : '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy).catch(() => {});
    }
    showToast('📋 Public Challenge Link copied to clipboard!');
  }

  function getChallengeWhatsAppUrl(): string {
    const code = activeChallenge?.id || 'MATH-301';
    const topicLabel =
      activeChallenge?.topic ||
      (selectedQuizTopic !== 'ALL' ? selectedQuizTopic : `${mohaActiveClass} ${mohaActiveSubject}`);
    const link =
      challengeShareUrl ||
      buildPublicChallengeLink(code, mohaActiveClass, mohaActiveSubject, topicLabel);
    const msg = `🏆 *NECTA Topic Quiz Challenge!*\nI challenge you to beat my score on *"${topicLabel}"* (${mohaActiveClass} ${mohaActiveSubject}) on Elimika Moha AI!\n\n🔑 *Challenge Room Code:* ${code}\n👉 Click this link OR enter code *${code}* inside Moha AI Quiz:\n${link}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  function handleSelectQuizOption(qIdx: number, oIdx: number) {
    const nextAnswers = { ...quizSelectedAnswers, [qIdx]: oIdx };
    setQuizSelectedAnswers(nextAnswers);

    // If all questions in the quiz have been answered and not yet saved, record mastered topics & post to Leaderboard!
    if (!quizResultSaved && quizItems.length > 0 && Object.keys(nextAnswers).length === quizItems.length) {
      setQuizResultSaved(true);
      let correctCount = 0;
      const newRecords: QuizHistoryRecord[] = [];
      const today = new Date().toISOString().split('T')[0];

      quizItems.forEach((item, idx) => {
        const isCorrect = nextAnswers[idx] === item.correctIndex;
        if (isCorrect) correctCount++;
        newRecords.push({
          id: `quiz-${Date.now()}-${idx}`,
          cls: mohaActiveClass,
          subject: mohaActiveSubject,
          topic: item.topic || `${mohaActiveSubject} Competence ${idx + 1}`,
          score: isCorrect ? 1 : 0,
          total: 1,
          timestamp: today,
        });
      });

      const updatedHistory = [...newRecords, ...quizHistory].slice(0, 150);
      setQuizHistory(updatedHistory);
      try {
        localStorage.setItem('elimika_quiz_history_v1', JSON.stringify(updatedHistory));
      } catch {
        // ignore
      }
      submitChallengeScore(correctCount, quizItems.length);
    }
  }

  function handleMwalimuImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = String(reader.result);
      const base64Data = resultStr.split(',')[1];
      setMohaPendingImage({
        mimeType: file.type,
        base64Data,
        previewUrl: resultStr,
      });
    };
    reader.readAsDataURL(file);
  }

  function speakMwalimuText(msgId: string, rawText: string) {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis is not supported on this browser.');
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = rawText
      .replace(/<[^>]+>/g, ' ')
      .replace(/[*#$]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'en-US';
    utter.onend = () => setSpeakingMsgId(null);
    utter.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utter);
  }

  function downloadMwalimuDocPdf(msgId: string, orientation: 'portrait' | 'landscape' = 'portrait') {
    const target = document.getElementById(`msg-body-${msgId}`);
    if (!target) return;
    showToast(`⏳ Generating ${orientation.toUpperCase()} PDF...`);
    const opt = {
      margin: 8,
      filename: `${mohaActiveClass}_${mohaActiveSubject}_Moha_AI.pdf`.replace(/\s+/g, '_'),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation },
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(target).save();
    } else {
      window.print();
    }
  }

  // ==================== COMPUTED DATA FOR VIEWS ====================
  const subjectsForSelectedClass = React.useMemo(() => {
    if (!selectedClass) return [];
    const classItems = allPapers.filter((p) => {
      if (p.isSyllabus || p.isBook) return false;
      return p.form.toLowerCase() === selectedClass.toLowerCase();
    });
    const counts: Record<string, number> = {};
    const officialSubs = TIE_CURRICULUM_SUBJECTS[selectedClass] || [];
    officialSubs.forEach((s) => {
      counts[s] = 0;
    });
    classItems.forEach((p) => {
      const s = p.subject.trim();
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [allPapers, selectedClass]);

  const { filteredPapers, availableYears } = React.useMemo(() => {
    let baseMatches: PaperRecord[] = [];
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      baseMatches = allPapers.filter((p) =>
        `${p.title} ${p.subject} ${p.form} ${p.year} ${p.category}`.toLowerCase().includes(q)
      );
    } else {
      baseMatches = allPapers.filter((p) => {
        if (p.isSyllabus || p.isBook) return false;
        const matchClass = p.form.toLowerCase() === selectedClass.toLowerCase();
        const matchSub = p.subject.toLowerCase() === selectedSubject.toLowerCase();
        const matchCat =
          selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchClass && matchSub && matchCat;
      });
    }

    const years = Array.from(new Set(baseMatches.map((p) => p.year).filter((y) => y && y !== 'N/A'))).sort((a, b) =>
      b.localeCompare(a)
    );

    const matches =
      selectedYear === 'ALL' ? baseMatches : baseMatches.filter((p) => p.year === selectedYear);
    matches.sort((a, b) => (b.year || '').localeCompare(a.year || ''));

    return { filteredPapers: matches, availableYears: years };
  }, [allPapers, searchQuery, selectedClass, selectedSubject, selectedCategory, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / CONFIG.ITEMS_PER_PAGE));
  const paginatedPapers = filteredPapers.slice(
    (page - 1) * CONFIG.ITEMS_PER_PAGE,
    page * CONFIG.ITEMS_PER_PAGE
  );

  const dedicatedBooks = React.useMemo(() => {
    const q = booksSearchQuery.trim().toLowerCase();
    const list = allPapers.filter((p) => {
      if (!p.isBook) return false;
      if (!matchesSyllabusTier(p.form, booksPageLevel)) return false;
      if (booksPageSelectedClass !== 'ALL' && p.form.toLowerCase() !== booksPageSelectedClass.toLowerCase())
        return false;
      if (q && !`${p.title} ${p.subject} ${p.form} ${p.year}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list.sort((a, b) => (b.paperUrl ? 1 : 0) - (a.paperUrl ? 1 : 0));
    return list;
  }, [allPapers, booksPageLevel, booksPageSelectedClass, booksSearchQuery]);

  const booksLevelClasses = React.useMemo(() => {
    if (booksPageLevel === 'Primary') {
      return ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7'];
    }
    if (booksPageLevel === 'Secondary') {
      return ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
    }
    if (booksPageLevel === 'Advanced') {
      return ['Form 5', 'Form 6'];
    }
    return [
      'Form 1',
      'Form 2',
      'Form 3',
      'Form 4',
      'Form 5',
      'Form 6',
      'Standard 1',
      'Standard 2',
      'Standard 3',
      'Standard 4',
      'Standard 5',
      'Standard 6',
      'Standard 7',
    ];
  }, [booksPageLevel]);

  const dedicatedSyllabuses = React.useMemo(() => {
    const q = syllabusSearchQuery.trim().toLowerCase();
    return allPapers.filter((p) => {
      if (!p.isSyllabus) return false;
      if (!matchesSyllabusTier(p.form, syllabusPageLevel)) return false;
      if (q && !`${p.title} ${p.subject} ${p.form} ${p.year}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allPapers, syllabusPageLevel, syllabusSearchQuery]);

  const activeSyllabusTopics = React.useMemo(
    () => getSyllabusTopicsForClassSubject(tsClass || mohaActiveClass, tsSubject || mohaActiveSubject),
    [tsClass, mohaActiveClass, tsSubject, mohaActiveSubject]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      {/* TOP BAR CONTRACT: 3 Zones (Brand, Nav Links, Primary Action) */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface-glass)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              resetToStep1();
            }}
            className="text-lg sm:text-xl font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <GraduationCap className="w-6 h-6 text-blue-600 shrink-0" />
            <span>
              ELIMIKA<span className="text-blue-600">.</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => resetToStep1()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'papers' ? 'text-blue-600 font-bold underline underline-offset-4' : ''
              }`}
            >
              Past Papers
            </button>
            <button
              onClick={() => openBooksPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'books' ? 'text-emerald-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              TIE Books
            </button>
            <button
              onClick={() => openSyllabusPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'syllabus' ? 'text-amber-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              Syllabuses
            </button>
            <button
              onClick={() => openMwalimuModal(undefined, undefined, 'studio')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'moha' && mohaViewMode === 'studio'
                  ? 'text-violet-700 font-bold underline underline-offset-4'
                  : ''
              }`}
            >
              Lesson Plans &amp; Studio
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => openMwalimuModal()}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'moha'
                  ? 'bg-slate-900 text-white ring-2 ring-violet-400'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{activePage === 'moha' ? 'Moha AI Portal (Active)' : 'Open Moha AI Site'}</span>
            </button>

            <PWAInstallButton
              customDomain={customDomain}
              onSaveCustomDomain={handleSaveCustomDomain}
            />
          </div>
        </div>
      </header>

      <OfflineIndicator />

      <AnimatePresence mode="wait">
      {/* MAIN PAST PAPERS BROWSER MODE */}
      {activePage === 'papers' && (
        <motion.div
          key="view-papers"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow flex flex-col"
        >
          <section className="pt-6 pb-8 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
              <div className="text-xs font-bold text-blue-700 tracking-wide">
                Tanzania National Examinations (NECTA) · Standard 1–7 &amp; Form 1–6
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                Select Class &amp; Subject for{' '}
                <span className="text-blue-600">Past Papers, TIE Books &amp; Syllabus</span>
              </h1>

              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => setActivePage('papers')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-blue-700 bg-blue-600 text-white shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Past Papers</span>
                </button>
                <button
                  onClick={() => openBooksPage()}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-emerald-600 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>TIE Books</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openSyllabusPage()}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-amber-500 bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Official Syllabuses</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Smart Search + Voice Search */}
              <div className="relative max-w-xl mx-auto pt-1">
                <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-300 px-3.5 py-2 focus-within:border-blue-600 transition-colors">
                  <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSmartSearchChange(e.target.value)}
                    placeholder="Search directly (e.g. Form 4 Math 2024)..."
                    className="w-full text-sm sm:text-base font-medium bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery.trim().length > 0 && (
                    <button
                      onClick={() => handleSmartSearchChange('')}
                      className="text-slate-400 hover:text-slate-700 p-1.5 mr-1"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={startVoiceSearch}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Voice Search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <main className="flex-grow py-6 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 overflow-x-auto pb-1">
                <button
                  onClick={() => setStep(1)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 cursor-pointer ${
                    step === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-blue-100 text-blue-800 font-semibold'
                  }`}
                >
                  1. Class Level
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <button
                  onClick={() => selectedClass && setStep(2)}
                  disabled={step < 2}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
                    step === 2
                      ? 'bg-blue-600 text-white font-bold'
                      : step > 2
                      ? 'bg-blue-100 text-blue-800 font-semibold cursor-pointer'
                      : 'bg-slate-100 text-slate-400 disabled:opacity-60'
                  }`}
                >
                  2. {selectedClass || 'Subject'}
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <button
                  disabled={step < 3}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 ${
                    step === 3 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-400 disabled:opacity-60'
                  }`}
                >
                  3. {selectedSubject || 'Past Papers'}
                </button>
              </nav>

              {/* Network Error Banner */}
              {syncStatus === 'error' && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                  <h3 className="text-sm font-bold text-rose-900">Unable to Sync Google Sheet Data</h3>
                  <p className="text-xs text-rose-700">Please check your internet connection and click Retry.</p>
                  <button
                    onClick={fetchSheetData}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Connection
                  </button>
                </div>
              )}

              {/* STEP 1: CHOOSE CLASS */}
              {step === 1 && (
                <section className="space-y-6">
                  {savedClass && (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                          Last Selected Class
                        </span>
                        <span className="text-sm sm:text-base font-bold text-emerald-950">
                          Continue with {savedClass}
                        </span>
                      </div>
                      <button
                        onClick={() => selectClass(savedClass)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open {savedClass} →
                      </button>
                    </div>
                  )}

                  {recentPapers.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="text-xs font-bold uppercase text-slate-500">Recently Opened Papers</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recentPapers.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => openViewer(item.id, 'paper')}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                              <div className="text-[11px] font-medium text-slate-500">
                                {item.form} · {item.subject}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 shrink-0">Read →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary School (Form 1-6) */}
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold tracking-wide text-slate-600">
                      Secondary School (Form 1 – Form 6)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'].map((cls) => {
                        const isExamYear = cls === 'Form 4' || cls === 'Form 6';
                        return (
                          <button
                            key={cls}
                            onClick={() => selectClass(cls)}
                            className={`p-4 rounded-2xl text-left shadow-sm flex items-center justify-between transition-colors cursor-pointer ${
                              isExamYear
                                ? 'bg-blue-50 hover:bg-blue-100 border border-blue-400 text-blue-950'
                                : 'bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-500 text-slate-900'
                            }`}
                          >
                            <span className="text-base font-bold">{cls}</span>
                            <ChevronRight
                              className={`w-5 h-5 ${isExamYear ? 'text-blue-600' : 'text-slate-400'}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary School (Standard 1-7) */}
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold tracking-wide text-slate-600">
                      Primary School (Standard 1 – 7)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        'Standard 1',
                        'Standard 2',
                        'Standard 3',
                        'Standard 4',
                        'Standard 5',
                        'Standard 6',
                        'Standard 7',
                      ].map((cls) => {
                        const isStd4 = cls === 'Standard 4';
                        const isStd7 = cls === 'Standard 7';
                        return (
                          <button
                            key={cls}
                            onClick={() => selectClass(cls)}
                            className={`p-3.5 rounded-2xl text-center font-bold transition-colors cursor-pointer ${
                              isStd7
                                ? 'col-span-2 bg-blue-50 hover:bg-blue-100 border border-blue-400 text-blue-900'
                                : isStd4
                                ? 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900'
                                : 'bg-white hover:bg-blue-50 border border-slate-200 text-slate-800'
                            }`}
                          >
                            {isStd7 ? 'Standard 7 (PSLE)' : cls}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 2: CHOOSE SUBJECT */}
              {step === 2 && (
                <section className="space-y-5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Classes
                      </button>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        Select Subject — <span className="text-blue-600">{selectedClass}</span>
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => openBooksPage(selectedClass)}
                        className="px-3 py-2 rounded-xl font-bold text-xs border border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        TIE Books ↗
                      </button>
                      <button
                        onClick={() => openSyllabusPage()}
                        className="px-3 py-2 rounded-xl font-bold text-xs border border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Syllabus ↗
                      </button>
                      <button
                        onClick={() => openMwalimuModal(selectedClass, 'Basic Mathematics')}
                        className="px-3 py-2 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-700 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Moha AI
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjectsForSelectedClass.map(({ name, count }) => (
                      <button
                        key={name}
                        onClick={() => selectSubject(name)}
                        className="p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-500 rounded-2xl text-left shadow-sm flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSubjectIcon(name)}</span>
                          <div>
                            <span className="block text-base font-bold text-slate-900 group-hover:text-blue-700">
                              {name}
                            </span>
                            <span className="text-xs font-medium text-slate-500 tabular-nums">
                              {count} {count === 1 ? 'paper' : 'papers'} · TIE &amp; Moha AI Ready
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 3: PAPERS LIST */}
              {step === 3 && (
                <section className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        {searchQuery.trim().length === 0 && (
                          <button
                            onClick={() => setStep(2)}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects
                          </button>
                        )}
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                          {searchQuery.trim().length > 0
                            ? `Search Results for "${searchQuery}"`
                            : `${selectedClass} · ${selectedSubject} (Past Papers)`}
                        </h2>
                        <div className="text-xs font-medium text-slate-500 tabular-nums">
                          Found {filteredPapers.length} {filteredPapers.length === 1 ? 'item' : 'items'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openBooksPage(selectedClass, selectedSubject)}
                          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Open TIE Books Page ↗
                        </button>
                        <button
                          onClick={() => openMwalimuModal(selectedClass, selectedSubject)}
                          className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Ask Moha AI
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      {['ALL', 'NECTA', 'Mock', 'Pre-NECTA', 'Terminal'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setPage(1);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {cat === 'ALL' ? 'All' : cat}
                        </button>
                      ))}
                    </div>

                    {/* Year Filter Controls */}
                    {availableYears.length > 1 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['ALL', ...availableYears].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => {
                              setSelectedYear(yr);
                              setPage(1);
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg tabular-nums whitespace-nowrap shrink-0 cursor-pointer ${
                              selectedYear === yr
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {yr === 'ALL' ? 'All Years' : yr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Results List */}
                  {paginatedPapers.length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                      <h4 className="font-bold text-slate-800">
                        No past papers matched this filter yet — use Moha AI for instant practice questions, lesson notes &amp; marking schemes!
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory('ALL');
                            setSelectedYear('ALL');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={() => openMwalimuModal(selectedClass, selectedSubject)}
                          className="px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Ask Moha AI ({selectedClass || 'Form 4'} {selectedSubject || 'Subject'})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paginatedPapers.map((p) => {
                        const hasPaper = Boolean(p.paperUrl);
                        const hasAnswers = Boolean(p.answersUrl);
                        const inBasket = printBasket.some((x) => x.id === p.id);

                        return (
                          <article
                            key={p.id}
                            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm transition-colors space-y-3"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-1 tabular-nums">
                                <span className="font-bold text-blue-700">{p.category}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-slate-700">{p.year}</span>
                                <span aria-hidden="true">·</span>
                                <span>{p.form}</span>
                                <span aria-hidden="true">·</span>
                                <span>{p.subject}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                              {hasPaper ? (
                                <>
                                  <button
                                    onClick={() => openViewer(p.id, 'paper')}
                                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Preview Paper</span>
                                  </button>
                                  <button
                                    onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Direct Download PDF</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                                  Google Drive link pending upload
                                </span>
                              )}

                              {hasAnswers && (
                                <>
                                  <button
                                    onClick={() => openViewer(p.id, 'answers')}
                                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Marking Scheme</span>
                                  </button>
                                  <button
                                    onClick={() => triggerDirectDownloadUrl(p.answersUrl, `${p.title}_Answers.pdf`)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Download Answers
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => openMwalimuModal(p.form, p.subject)}
                                className="px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Moha AI
                              </button>

                              {hasPaper && (
                                <button
                                  onClick={() => togglePrintBasketItem(p.id)}
                                  className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer ${
                                    inBasket ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {inBasket ? '✓ In Print List' : '+ Print List'}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {filteredPapers.length > CONFIG.ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-bold text-slate-600 tabular-nums">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          </main>
        </motion.div>
      )}

      {/* DEDICATED TIE BOOKS PAGE */}
      {activePage === 'books' && (
        <motion.div
          key="view-books"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow bg-slate-50 min-h-screen pb-24"
        >
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-b border-emerald-700 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Official TIE Textbooks Page
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    TIE Textbooks (Standard 1–7 &amp; Form 1–6)
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-emerald-50">
                    Select your Class and Subject to read or download official TIE Books directly from Google Drive
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => openSyllabusPage()}
                    className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Syllabus Page</span>
                  </button>
                  <button
                    onClick={() => setActivePage('papers')}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Past Papers</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(['ALL', 'Primary', 'Secondary', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setBooksPageLevel(lvl);
                        setBooksPageSelectedClass('ALL');
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                        booksPageLevel === lvl
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lvl === 'ALL'
                        ? 'All Levels'
                        : lvl === 'Primary'
                        ? 'Primary (Std 1–7)'
                        : lvl === 'Secondary'
                        ? 'Secondary (Form 1–4)'
                        : 'Advanced (Form 5–6)'}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={booksSearchQuery}
                    onChange={(e) => setBooksSearchQuery(e.target.value)}
                    placeholder="Search textbook or subject..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none text-xs sm:text-sm font-medium bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                {['ALL', ...booksLevelClasses].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBooksPageSelectedClass(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      booksPageSelectedClass === c
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'ALL' ? 'All Classes' : c}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100 tabular-nums">
                <span>
                  Showing {dedicatedBooks.length} TIE Books (
                  {dedicatedBooks.filter((b) => Boolean(b.paperUrl)).length} with Google Drive PDF links)
                </span>
                <button
                  onClick={() =>
                    openMwalimuModal(
                      booksPageSelectedClass === 'ALL' ? 'Form 1' : booksPageSelectedClass,
                      'Basic Mathematics'
                    )
                  }
                  className="text-violet-700 hover:underline font-bold cursor-pointer"
                >
                  Ask Moha AI about TIE Books &amp; Syllabus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dedicatedBooks.map((p) => {
                const hasUrl = Boolean(p.paperUrl);
                return (
                  <article
                    key={p.id}
                    className={`bg-white p-5 rounded-2xl border ${
                      hasUrl ? 'border-emerald-400 shadow-sm' : 'border-slate-200'
                    } hover:border-emerald-600 transition-colors flex flex-col justify-between gap-4`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                        <span className="font-bold text-emerald-700">{p.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-700">{p.form}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.subject}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{getSubjectIcon(p.subject)}</span>
                        <span>{p.title}</span>
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      {hasUrl ? (
                        <>
                          <button
                            onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Download className="w-4 h-4" /> Download Book (PDF)
                          </button>
                          <button
                            onClick={() => openViewer(p.id, 'paper')}
                            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Read
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 flex-1 text-center">
                          Add Google Drive Link in Sheet (Category: TIE Book)
                        </span>
                      )}
                      <button
                        onClick={() => openMwalimuModal(p.form, p.subject)}
                        className="px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Moha AI
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* DEDICATED SYLLABUS PAGE */}
      {activePage === 'syllabus' && (
        <motion.div
          key="view-syllabus"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow bg-slate-50 min-h-screen pb-24"
        >
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 border-b border-amber-600 shadow-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Official TIE Syllabus Page
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Official TIE Syllabuses
                  </h1>
                  <p className="text-xs sm:text-sm font-medium text-slate-900">
                    Primary (Std 1–7), Ordinary Secondary (Form 1–4) &amp; Advanced Level (Form 5–6) — Direct PDF Download
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActivePage('papers')}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Past Papers</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(['ALL', 'Primary', 'Secondary', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSyllabusPageLevel(lvl)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer ${
                        syllabusPageLevel === lvl
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lvl === 'ALL'
                        ? 'All Levels'
                        : lvl === 'Primary'
                        ? 'Primary (Std 1–7)'
                        : lvl === 'Secondary'
                        ? 'Secondary (Form 1–4)'
                        : 'Advanced (Form 5–6)'}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={syllabusSearchQuery}
                    onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                    placeholder="Search syllabus subject..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-none text-xs sm:text-sm font-medium bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-2 border-t border-slate-100 tabular-nums">
                <span>
                  {dedicatedSyllabuses.length} Official {dedicatedSyllabuses.length === 1 ? 'Syllabus' : 'Syllabuses'}{' '}
                  Found
                </span>
                <button
                  onClick={() => openMwalimuModal('Form 4', 'Basic Mathematics')}
                  className="text-violet-700 hover:underline font-bold cursor-pointer"
                >
                  Ask Moha AI for Syllabus Topics
                </button>
              </div>
            </div>

            {dedicatedSyllabuses.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  Syllabuses Will Appear Here Once Uploaded to Your Google Sheet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add rows to your Google Sheet with Category set to <strong>TIE Syllabus</strong> and your Google Drive
                  link, or ask Moha AI right now for any subject&apos;s official TIE competences.
                </p>
                <button
                  onClick={() => openMwalimuModal('Form 4', 'Basic Mathematics')}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Ask Moha AI for Subject Syllabus Topics
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dedicatedSyllabuses.map((p) => {
                  const hasUrl = Boolean(p.paperUrl);
                  return (
                    <article
                      key={p.id}
                      className="bg-white p-5 rounded-2xl border border-amber-200 hover:border-amber-500 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 tabular-nums">
                          <span className="font-bold text-amber-800">{p.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{p.form}</span>
                          <span aria-hidden="true">·</span>
                          <span>{p.year}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Subject: <span className="text-slate-800 font-semibold">{p.subject}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                        {hasUrl ? (
                          <>
                            <button
                              onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Direct Download PDF
                            </button>
                            <button
                              onClick={() => openViewer(p.id, 'paper')}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Read
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 flex-1 text-center">
                            Google Drive Link Pending
                          </span>
                        )}
                        <button
                          onClick={() => openMwalimuModal(p.form, p.subject)}
                          className="px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Moha AI
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* STICKY MOBILE BOTTOM BAR */}
      {activePage === 'papers' && step > 1 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 sm:hidden">
          <button
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            className="flex-1 py-2.5 px-3 bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={resetToStep1}
            className="flex-1 py-2.5 px-3 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      )}

      {/* PRINT BASKET FLOATING BAR */}
      {printBasket.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 w-[92%] max-w-lg justify-between">
          <div className="text-xs font-bold flex items-center gap-2 tabular-nums">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{printBasket.length} Papers in Print List</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getPrintBasketWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl whitespace-nowrap shrink-0"
            >
              Send to WhatsApp
            </a>
            <button onClick={() => setPrintBasket([])} className="p-1.5 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {viewerPaper && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-blue-700">
                  {viewerPaper.category} · {viewerPaper.year}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {viewerType === 'answers' ? `${viewerPaper.title} (Marking Scheme)` : viewerPaper.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {viewerPaper.paperUrl && viewerPaper.answersUrl && (
                  <div className="flex items-center bg-slate-200 p-0.5 rounded-xl">
                    <button
                      onClick={() => {
                        setViewerType('paper');
                        setViewerLoading(true);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        viewerType === 'paper' ? 'bg-white text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => {
                        setViewerType('answers');
                        setViewerLoading(true);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        viewerType === 'answers' ? 'bg-white text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      Answers
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setViewerPaper(null)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-grow bg-slate-100 relative">
              {viewerLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-xs font-bold text-slate-500">Loading PDF document...</p>
                </div>
              )}
              <iframe
                className="w-full h-full border-0"
                src={
                  getPreviewUrl(
                    viewerType === 'answers' && viewerPaper.answersUrl ? viewerPaper.answersUrl : viewerPaper.paperUrl
                  ) || 'about:blank'
                }
                onLoad={() => setViewerLoading(false)}
                title={viewerPaper.title}
              />
            </div>

            <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() =>
                  triggerDirectDownloadUrl(
                    viewerType === 'answers' && viewerPaper.answersUrl ? viewerPaper.answersUrl : viewerPaper.paperUrl,
                    `${viewerPaper.title}.pdf`
                  )
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Direct Download PDF
              </button>
              <button
                onClick={() => setViewerPaper(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED FULL-PAGE MOHA AI SITE (CLEAN VIEWPORT-LOCKED WORKSPACE) */}
      <AnimatePresence mode="wait">
      {activePage === 'moha' && (
        <motion.div
          key={`view-moha-${mohaViewMode === 'studio' ? 'studio' : 'portal'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="h-[calc(100vh-4rem)] bg-slate-50 flex flex-col overflow-hidden"
        >
          {/* Compact Single-Row Top Bar: Class/Subject + Mode Tabs */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-6 py-2 shadow-xs">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
              {/* Left: Back + Brand + Class & Subject Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    setActivePage('papers');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title="Return to Past Papers"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </button>

                <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                  <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm">
                    🤖
                  </span>
                  <span>Moha AI</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-xs border border-slate-200">
                  <select
                    value={mohaActiveClass}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setMohaActiveClass(newCls);
                      setTsClass(newCls);
                      const subs = TIE_CURRICULUM_SUBJECTS[newCls] || ['Basic Mathematics'];
                      const nextSub = subs.includes(mohaActiveSubject) ? mohaActiveSubject : subs[0];
                      setMohaActiveSubject(nextSub);
                      setTsSubject(nextSub);
                      setSelectedQuizTopic('ALL');
                      setFlashcards(getDefaultFlashcardsForSubject(newCls, nextSub));
                    }}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    {Object.keys(TIE_CURRICULUM_SUBJECTS).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400">·</span>
                  <select
                    value={mohaActiveSubject}
                    onChange={(e) => {
                      const nextSub = e.target.value;
                      setMohaActiveSubject(nextSub);
                      setTsSubject(nextSub);
                      setSelectedQuizTopic('ALL');
                      setFlashcards(getDefaultFlashcardsForSubject(mohaActiveClass, nextSub));
                    }}
                    className="bg-transparent text-violet-700 font-bold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
                  >
                    {(TIE_CURRICULUM_SUBJECTS[mohaActiveClass] || ['Basic Mathematics']).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: Clean Horizontal Segmented Navigation */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {[
                  { id: 'chat' as const, label: '💬 Chat' },
                  { id: 'quiz' as const, label: '🎯 Quiz & Challenge' },
                  { id: 'studio' as const, label: '📋 Teacher Docs' },
                  { id: 'diagram' as const, label: '🔬 Diagrams' },
                  { id: 'resources' as const, label: '📚 Resources' },
                  { id: 'profile' as const, label: `📊 Profile (${masteryProgressData.totalMasteredTopics})` },
                ].map((tab) => {
                  const active = mohaViewMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'diagram') {
                          setActiveDiagramPreset(detectDiagramPreset('diagram', mohaActiveSubject) || 'physics_ohm');
                        }
                        if (tab.id === 'quiz' && quizItems.length === 0) {
                          startAiQuiz();
                          return;
                        }
                        setMohaViewMode(tab.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collapsible Permanent AI Memory Bar */}
          {mohaLearnPanelOpen && (
            <div className="shrink-0 bg-emerald-50 border-b border-emerald-200 px-3 sm:px-6 py-2.5 text-xs">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="font-bold text-emerald-950 shrink-0">🧠 Teach Moha AI:</span>
                <input
                  type="text"
                  value={learnTopicInput}
                  onChange={(e) => setLearnTopicInput(e.target.value)}
                  placeholder="Topic / Formula (e.g. Ohm's Law)"
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 font-bold bg-white sm:w-48"
                />
                <input
                  type="text"
                  value={learnAnswerInput}
                  onChange={(e) => setLearnAnswerInput(e.target.value)}
                  placeholder="Notes or marking steps to remember permanently..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 font-medium bg-white"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleSaveLearnedFromForm}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setMohaLearnPanelOpen(false)}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 1: CLEAN SPLIT CHAT (OBSERVE OUTPUT + VISIBLE INPUT BOX) ==================== */}
          {mohaViewMode === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto overflow-hidden">
              {/* Compact Single-Line Quick Actions */}
              <div className="shrink-0 px-3 sm:px-5 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <button
                    onClick={() => sendQuickMwalimuPrompt('syllabus')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 font-bold cursor-pointer"
                  >
                    📜 Syllabus
                  </button>
                  <button
                    onClick={() => sendQuickMwalimuPrompt('summary')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 font-bold cursor-pointer"
                  >
                    📝 Summary
                  </button>
                  <button
                    onClick={() => sendQuickMwalimuPrompt('questions')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-violet-50 text-slate-800 border border-slate-200 font-bold cursor-pointer"
                  >
                    ❓ 5 NECTA Qs
                  </button>
                  <button
                    onClick={() => sendQuickMwalimuPrompt('table_diagram')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 font-bold cursor-pointer"
                  >
                    📊 Table &amp; Diagram
                  </button>
                  <button
                    onClick={() => {
                      if (quizItems.length === 0) startAiQuiz();
                      else setMohaViewMode('quiz');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold cursor-pointer"
                  >
                    🤝 Challenge a Friend
                  </button>
                  <button
                    onClick={() => setMohaLearnPanelOpen((v) => !v)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold cursor-pointer"
                  >
                    🧠 Teach AI ({learnedMemory.length})
                  </button>
                </div>

                <button
                  onClick={() =>
                    setMohaMessages([
                      {
                        id: 'msg-welcome',
                        role: 'ai',
                        text: `Chat cleared for **${mohaActiveClass} • ${mohaActiveSubject}**. Type your question below while watching my response here.`,
                      },
                    ])
                  }
                  className="text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>

              {/* Scrollable Messages Viewport (Always stays above the pinned bottom input box) */}
              <div
                ref={chatContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 bg-slate-50"
              >
                {mohaMessages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[82%] bg-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-br-xs text-xs sm:text-sm font-semibold shadow-xs space-y-2">
                        {m.imagePreview && (
                          <img
                            src={m.imagePreview}
                            alt="Uploaded question"
                            className="max-h-40 rounded-lg border border-white/30 object-contain"
                          />
                        )}
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-[96%] w-full bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-xs shadow-xs space-y-2.5">
                        {m.loading ? (
                          <div className="flex items-center gap-2.5 font-bold text-violet-700 text-xs sm:text-sm">
                            <span className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            <span>{m.text}</span>
                          </div>
                        ) : (
                          <>
                            <div
                              id={`msg-body-${m.id}`}
                              className="text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto space-y-2.5"
                            >
                              <div dangerouslySetInnerHTML={{ __html: formatMwalimuHtml(m.text) }} />
                              {m.diagramPreset && (
                                <div className="pt-2">
                                  <InteractiveDiagramLab
                                    initialPreset={m.diagramPreset}
                                    activeClass={mohaActiveClass}
                                    activeSubject={mohaActiveSubject}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => speakMwalimuText(m.id, m.text)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Volume2 className="w-3 h-3" />
                                  <span>{speakingMsgId === m.id ? 'Stop' : 'Listen'}</span>
                                </button>
                                <button
                                  onClick={() => downloadMwalimuDocPdf(m.id, 'portrait')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDiagramPreset(
                                      m.diagramPreset ||
                                        detectDiagramPreset('diagram', mohaActiveSubject) ||
                                        'physics_ohm'
                                    );
                                    setMohaViewMode('diagram');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-[11px] cursor-pointer"
                                >
                                  🔬 Diagram Lab
                                </button>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {mohaActiveClass} · {mohaActiveSubject}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Attached Photo Preview */}
              {mohaPendingImage && (
                <div className="shrink-0 px-4 py-2 bg-violet-50 border-t border-violet-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
                    <img
                      src={mohaPendingImage.previewUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded object-cover border border-violet-300"
                    />
                    <span>Question photo attached</span>
                  </div>
                  <button
                    onClick={() => setMohaPendingImage(null)}
                    className="text-xs font-bold text-rose-600 cursor-pointer"
                  >
                    Remove ✕
                  </button>
                </div>
              )}

              {/* Pinned Bottom Input Dock (Always visible while observing what Moha AI writes above) */}
              <div className="shrink-0 bg-white border-t border-slate-200 px-3 sm:px-5 py-2.5 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2">
                  <label
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                    title="Upload question photo"
                  >
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleMwalimuImageSelect} />
                  </label>
                  <button
                    type="button"
                    onClick={startMohaVoiceDictation}
                    className="p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 cursor-pointer shrink-0"
                    title="Voice Dictation"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={mohaInput}
                    onChange={(e) => {
                      setMohaInput(e.target.value);
                      if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMwalimuMessage();
                    }}
                    placeholder={`Type your ${mohaActiveClass} ${mohaActiveSubject} question here while observing Moha AI above...`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-600 focus:outline-none text-xs sm:text-sm font-medium bg-white"
                  />
                  <button
                    onClick={() => sendMwalimuMessage()}
                    className="px-4 sm:px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 2: NECTA QUIZ, 'CHALLENGE A FRIEND' & LEADERBOARD ==================== */}
          {mohaViewMode === 'quiz' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-6xl mx-auto space-y-5">
                {/* Topic Selector & Challenge a Friend Header Card */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        🎯 NECTA Topic Quiz &amp; &ldquo;Challenge a Friend&rdquo; Leaderboard
                      </h2>
                      <p className="text-xs text-slate-500">
                        Pick a specific syllabus topic, share a quiz link with friends, and see who scores highest on NECTA-aligned questions!
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowFlashcardsSection((v) => !v)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        {showFlashcardsSection ? 'Hide Flashcards' : '🗂️ Revision Flashcards'}
                      </button>
                      <button
                        onClick={() => startFriendTurnSameDevice()}
                        className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Let your friend play this exact quiz right here and add their score to the Leaderboard"
                      >
                        <span>👥 Friend&apos;s Turn (Play on Same Device)</span>
                      </button>
                      <button
                        onClick={() => createFriendChallenge()}
                        disabled={challengeCreating}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>🤝 {challengeCreating ? 'Creating Link...' : 'Challenge a Friend (Share Code & Link)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Join Friend Challenge by Room Code Bar */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-900 font-black uppercase tracking-wider text-[11px]">
                        🔑 Join Friend&apos;s Challenge
                      </span>
                      <span className="text-slate-600 font-medium">
                        Enter a friend&apos;s Challenge Code (e.g. <strong className="text-slate-900">MATH-301</strong>, <strong className="text-slate-900">BIO-102</strong>, <strong className="text-slate-900">PHYS-204</strong>):
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={joinChallengeCode}
                        onChange={(e) => setJoinChallengeCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && joinChallengeCode.trim()) {
                            loadSharedChallengeFromUrl(joinChallengeCode);
                          }
                        }}
                        placeholder="Code e.g. MATH-301"
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-black uppercase tracking-wider text-slate-900 w-40 sm:w-44 focus:outline-none focus:border-violet-600"
                      />
                      <button
                        onClick={() => loadSharedChallengeFromUrl(joinChallengeCode)}
                        disabled={joiningChallengeByCode || !joinChallengeCode.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold cursor-pointer shrink-0"
                      >
                        {joiningChallengeByCode ? 'Loading...' : 'Join Quiz →'}
                      </button>
                    </div>
                  </div>

                  {/* Topic Picker + Player Identity Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
                    <div className="sm:col-span-5">
                      <label className="font-bold text-slate-700 block mb-1">
                        Select Specific Topic ({mohaActiveClass} {mohaActiveSubject})
                      </label>
                      <select
                        value={selectedQuizTopic}
                        onChange={(e) => {
                          const nextTopic = e.target.value;
                          setSelectedQuizTopic(nextTopic);
                          startAiQuiz(mohaActiveClass, mohaActiveSubject, nextTopic);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        <option value="ALL">All Syllabus Topics ({mohaActiveSubject})</option>
                        {activeSyllabusTopics.map((t) => {
                          const cleanT = t.replace(/^\d+\.\d+\s*/, '');
                          return (
                            <option key={t} value={cleanT}>
                              {t}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">Player Name (for Leaderboard)</label>
                      <input
                        type="text"
                        value={challengePlayerName}
                        onChange={(e) => setChallengePlayerName(e.target.value)}
                        placeholder={userProfile.name || 'e.g. Kelvin Massawe'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">School</label>
                      <input
                        type="text"
                        value={challengePlayerSchool}
                        onChange={(e) => setChallengePlayerSchool(e.target.value)}
                        placeholder={userProfile.school || 'School Name'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        onClick={() => startAiQuiz(mohaActiveClass, mohaActiveSubject, selectedQuizTopic)}
                        className="w-full px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl cursor-pointer"
                      >
                        🔄 New Quiz
                      </button>
                    </div>
                  </div>

                  {/* Shareable Quiz Challenge Link & Room Code Box */}
                  {(challengeShareUrl || activeChallenge) && (
                    <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 space-y-2.5 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-bold text-violet-950 flex flex-wrap items-center gap-2">
                            <span>🔗 Public Shareable Challenge Link:</span>
                            {activeChallenge?.id && (
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-300 text-slate-950 font-black tracking-wider">
                                CODE: {activeChallenge.id}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-violet-200 text-violet-900 text-[11px]">
                              {activeChallenge?.topic ||
                                (selectedQuizTopic !== 'ALL' ? selectedQuizTopic : mohaActiveSubject)}
                            </span>
                          </div>
                          <input
                            type="text"
                            readOnly
                            value={
                              challengeShareUrl ||
                              (activeChallenge
                                ? buildPublicChallengeLink(
                                    activeChallenge.id,
                                    activeChallenge.cls,
                                    activeChallenge.subject,
                                    activeChallenge.topic,
                                    activeChallenge.createdBy
                                  )
                                : '')
                            }
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-violet-300 text-slate-700 font-mono text-[11px]"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={copyChallengeShareLink}
                            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer"
                          >
                            📋 Copy Public Link
                          </button>
                          {activeChallenge?.id && (
                            <button
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(activeChallenge.id).catch(() => {});
                                }
                                showToast(`🔑 Challenge Code ${activeChallenge.id} copied!`);
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                            >
                              🔑 Copy Code ({activeChallenge.id})
                            </button>
                          )}
                          <a
                            href={getChallengeWhatsAppUrl()}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            📲 WhatsApp Friend
                          </a>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-700 bg-white/90 border border-violet-200/80 rounded-lg px-3 py-2">
                        💡 <strong>Tip if your friend sees &ldquo;403 You do not have access&rdquo;:</strong> Private <code className="font-mono bg-slate-100 px-1 rounded">ais-dev</code> links are locked to your personal Google account. We automatically converted the link above to the shared <code className="font-mono bg-slate-100 px-1 rounded">ais-pre</code> URL and created a short <strong>Challenge Code ({activeChallenge?.id || 'MATH-301'})</strong>. Make sure your app is shared in AI Studio&apos;s top-right <strong>Share</strong> button, or click <strong>👥 Friend&apos;s Turn (Play on Same Device)</strong> so your friend can play right now and rank on the Leaderboard!
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Revision Flashcards Deck */}
                {showFlashcardsSection && flashcards.length > 0 && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900">
                        🗂️ Revision Flashcards ({mohaActiveClass} · {mohaActiveSubject})
                      </h3>
                      <button
                        onClick={() => loadAiFlashcards()}
                        disabled={flashcardLoading}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {flashcardLoading ? 'Generating...' : '✨ New Cards'}
                      </button>
                    </div>
                    {(() => {
                      const card = flashcards[activeFlashcardIdx] || flashcards[0];
                      return (
                        <div
                          onClick={() => setFlashcardFlipped((f) => !f)}
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                            flashcardFlipped
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                              : 'bg-violet-50/70 border-violet-300 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                            <span>
                              {flashcardFlipped ? '✅ MODEL ANSWER' : '❓ QUESTION PROMPT'} ({activeFlashcardIdx + 1}/
                              {flashcards.length})
                            </span>
                            <span>{card.topic}</span>
                          </div>
                          <div className="text-sm font-bold my-2.5">{flashcardFlipped ? card.back : card.front}</div>
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                            <span>Key Point: {card.formulaOrKeyPoint}</span>
                            <span className="font-bold underline">Click to flip ↻</span>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setActiveFlashcardIdx((i) => (i - 1 + flashcards.length) % flashcards.length);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => {
                            setFlashcardFlipped(false);
                            setActiveFlashcardIdx((i) => (i + 1) % flashcards.length);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold cursor-pointer"
                        >
                          Next →
                        </button>
                      </div>
                      <button
                        onClick={() => markFlashcardTopicMastered(flashcards[activeFlashcardIdx] || flashcards[0])}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                      >
                        ✓ Mark Mastered
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Quiz Questions (Left 7 cols) + Live NECTA Leaderboard (Right 5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: NECTA Topic Questions */}
                  <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-violet-700">
                          {selectedQuizTopic === 'ALL' ? 'All Syllabus Topics' : selectedQuizTopic}
                        </span>
                        <h3 className="text-sm font-black text-slate-900">
                          {mohaActiveClass} {mohaActiveSubject} — NECTA Practice Questions
                        </h3>
                      </div>
                      {quizItems.length > 0 && (
                        <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold tabular-nums">
                          Score:{' '}
                          {quizItems.reduce(
                            (acc, item, idx) => acc + (quizSelectedAnswers[idx] === item.correctIndex ? 1 : 0),
                            0
                          )}{' '}
                          / {quizItems.length}
                        </div>
                      )}
                    </div>

                    {quizLoading ? (
                      <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-600">
                          Preparing NECTA-aligned questions for {selectedQuizTopic}...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quizItems.map((q, qIdx) => {
                          const selectedIdx = quizSelectedAnswers[qIdx];
                          const hasAnswered = selectedIdx !== undefined;
                          return (
                            <div
                              key={qIdx}
                              className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                                <span className="font-semibold">
                                  Question {qIdx + 1} of {quizItems.length}
                                </span>
                                {q.topic && <span className="font-bold text-violet-700">{q.topic}</span>}
                              </div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900">{q.question}</div>
                              <div className="space-y-1.5">
                                {q.options.map((opt, oIdx) => {
                                  let btnClass =
                                    'w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-violet-400 text-xs font-semibold text-slate-700 transition-colors cursor-pointer';
                                  if (hasAnswered) {
                                    if (oIdx === q.correctIndex) {
                                      btnClass =
                                        'w-full text-left p-2.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-xs font-bold text-emerald-950';
                                    } else if (oIdx === selectedIdx) {
                                      btnClass =
                                        'w-full text-left p-2.5 rounded-lg border-2 border-rose-500 bg-rose-50 text-xs font-bold text-rose-900';
                                    }
                                  }
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                                      className={btnClass}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {hasAnswered && (
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
                                  <strong>NECTA Explanation:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Manual / Instant Submit to Leaderboard CTA */}
                        {quizItems.length > 0 && Object.keys(quizSelectedAnswers).length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="font-bold text-amber-950">
                              {scoreSubmittedToChallenge
                                ? '✅ Your score is live on the Leaderboard! Share the Challenge Link so friends can try to beat it.'
                                : 'Finished answering? Post your score to the Topic Leaderboard or challenge a friend!'}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => {
                                  const correctCount = quizItems.reduce(
                                    (acc, item, idx) =>
                                      acc + (quizSelectedAnswers[idx] === item.correctIndex ? 1 : 0),
                                    0
                                  );
                                  submitChallengeScore(correctCount, quizItems.length);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                              >
                                🏆 Update Leaderboard Score
                              </button>
                              <button
                                onClick={() => startFriendTurnSameDevice()}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                              >
                                👥 Let Friend Play Next
                              </button>
                              <button
                                onClick={() => createFriendChallenge()}
                                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer"
                              >
                                🤝 Share Challenge Link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Live NECTA Topic Leaderboard */}
                  <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <span>🏆 NECTA Topic Leaderboard</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Highest scores on shared NECTA topic challenges
                        </p>
                      </div>
                      <button
                        onClick={fetchAllChallenges}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>

                    {/* Active Topic Challenge Switcher */}
                    {allChallenges.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">
                          Select Topic Challenge Board:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {allChallenges.slice(0, 6).map((ch) => {
                            const isCurrent = activeChallenge?.id === ch.id;
                            return (
                              <button
                                key={ch.id}
                                onClick={() => {
                                  setActiveChallenge(ch);
                                  const link = buildPublicChallengeLink(
                                    ch.id,
                                    ch.cls,
                                    ch.subject,
                                    ch.topic,
                                    ch.createdBy
                                  );
                                  setChallengeShareUrl(link);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                                  isCurrent
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                [{ch.id}] {ch.subject}: {ch.topic}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Current Challenge Details & Leaderboard Table */}
                    {activeChallenge ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="font-black text-slate-900">
                              {activeChallenge.cls} · {activeChallenge.subject}
                            </div>
                            <div className="text-violet-700 font-bold">Topic: {activeChallenge.topic}</div>
                          </div>
                          <button
                            onClick={() => {
                              setMohaActiveClass(activeChallenge.cls);
                              setMohaActiveSubject(activeChallenge.subject);
                              setSelectedQuizTopic(activeChallenge.topic);
                              if (activeChallenge.questions && activeChallenge.questions.length > 0) {
                                setQuizItems(activeChallenge.questions);
                                setQuizSelectedAnswers({});
                                setQuizResultSaved(false);
                                setQuizStartTime(Date.now());
                                showToast(`🎯 Loaded "${activeChallenge.topic}" challenge questions!`);
                              } else {
                                startAiQuiz(activeChallenge.cls, activeChallenge.subject, activeChallenge.topic);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                          >
                            Play This Topic
                          </button>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                <th className="py-2 px-2.5 font-bold">Rank</th>
                                <th className="py-2 px-2.5 font-bold">Student / Teacher</th>
                                <th className="py-2 px-2.5 font-bold">Score</th>
                                <th className="py-2 px-2.5 font-bold">Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {activeChallenge.leaderboard.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-slate-500 font-medium">
                                    No scores submitted yet for this topic. Complete the quiz on the left to claim #1!
                                  </td>
                                </tr>
                              ) : (
                                activeChallenge.leaderboard.map((entry, idx) => {
                                  const medal = idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`;
                                  return (
                                    <tr
                                      key={entry.id}
                                      className={idx === 0 ? 'bg-amber-50/70 font-bold' : 'bg-white'}
                                    >
                                      <td className="py-2 px-2.5 font-black text-slate-900 whitespace-nowrap">
                                        {medal}
                                      </td>
                                      <td className="py-2 px-2.5">
                                        <div className="font-bold text-slate-900">{entry.playerName}</div>
                                        <div className="text-[10px] text-slate-500">{entry.school}</div>
                                      </td>
                                      <td className="py-2 px-2.5 font-black text-emerald-700 tabular-nums whitespace-nowrap">
                                        {entry.score}/{entry.total} ({entry.percentage}%)
                                      </td>
                                      <td className="py-2 px-2.5 text-slate-600 tabular-nums whitespace-nowrap">
                                        {entry.timeSeconds}s
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        Click &ldquo;Challenge a Friend&rdquo; above to create a topic leaderboard!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 3: TEACHER & EXAM STUDIO (7 OFFICIAL DOCUMENTS) ==================== */}
          {mohaViewMode === 'studio' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        📋 Official TIE, PO-RALG &amp; NECTA Document Studio
                      </h2>
                      <p className="text-xs text-slate-500">
                        Generates ready-to-print Lesson Plans, Schemes of Work, Notes &amp; Exams from website Syllabuses &amp; Books
                      </p>
                    </div>
                  </div>

                  {/* Teacher & Topic Metadata Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">School Name *</label>
                      <input
                        type="text"
                        value={tsSchool}
                        onChange={(e) => setTsSchool(e.target.value)}
                        placeholder="e.g. Kipingo Secondary School"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Teacher Name *</label>
                      <input
                        type="text"
                        value={tsTeacher}
                        onChange={(e) => setTsTeacher(e.target.value)}
                        placeholder="e.g. Mwl. Mohamed Shabani"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Date *</label>
                      <input
                        type="date"
                        value={tsDate}
                        onChange={(e) => setTsDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Class / Form *</label>
                      <input
                        type="text"
                        value={tsClass}
                        onChange={(e) => setTsClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subject *</label>
                      <input
                        type="text"
                        value={tsSubject}
                        onChange={(e) => setTsSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Duration</label>
                      <input
                        type="text"
                        value={tsDuration}
                        onChange={(e) => setTsDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Main Topic / Competence *</label>
                      <input
                        type="text"
                        value={tsTopic}
                        onChange={(e) => setTsTopic(e.target.value)}
                        placeholder="Select or type main competence..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                      {activeSyllabusTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {activeSyllabusTopics.map((t) => {
                            const cleanT = t.replace(/^\d+\.\d+\s*/, '');
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTsTopic(cleanT)}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 font-bold cursor-pointer"
                              >
                                + {cleanT}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sub-Topic *</label>
                      <input
                        type="text"
                        value={tsSubTopic}
                        onChange={(e) => setTsSubTopic(e.target.value)}
                        placeholder="e.g. Practical Calculations"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                    </div>
                  </div>

                  {/* 7 Official Document Generator Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('lessonplan')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      1. 4-Stage Lesson Plan
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('schemeofwork')}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      2. PO-RALG Scheme (2026)
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('lessonnotes')}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      3. Lesson Notes
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('exampaper')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      4. Full NECTA Exam
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('blueprint')}
                      className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      5. Exam Blueprint
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('markingscheme')}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      6. Marking Scheme
                    </button>
                    <button
                      disabled={generatingDocType !== null}
                      onClick={() => submitTeacherStudioDoc('logbook')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                    >
                      7. Log Book
                    </button>
                  </div>
                </div>

                {/* Live Generated Document Preview & Direct PDF Export */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      {generatingDocType ? '⏳ Generating official document...' : '📄 Official Document Preview'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => downloadMwalimuDocPdf('studio-preview', 'portrait')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Portrait PDF
                      </button>
                      <button
                        onClick={() => downloadMwalimuDocPdf('studio-preview', 'landscape')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Landscape PDF
                      </button>
                    </div>
                  </div>

                  <div
                    id="msg-body-studio-preview"
                    className="overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html:
                        studioPreviewHtml ||
                        buildInstantOfficialDocument('lessonplan', {
                          school: tsSchool || userProfile.school || 'ELIMIKA SECONDARY SCHOOL',
                          teacher: tsTeacher || userProfile.name || 'SUBJECT TEACHER',
                          cls: tsClass || mohaActiveClass,
                          subject: tsSubject || mohaActiveSubject,
                          topic: tsTopic || activeSyllabusTopics[0] || 'Core Competence',
                          subTopic: tsSubTopic || tsTopic || 'Specific Activity',
                          date: tsDate,
                          duration: tsDuration,
                          regG: tsRegG,
                          regB: tsRegB,
                          presG: tsPresG,
                          presB: tsPresB,
                          siteResources: activeSiteResources,
                        }),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 4: INTERACTIVE DIAGRAM & TABLE LAB ==================== */}
          {mohaViewMode === 'diagram' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto space-y-4">
                <InteractiveDiagramLab
                  initialPreset={activeDiagramPreset}
                  activeClass={mohaActiveClass}
                  activeSubject={mohaActiveSubject}
                />
              </div>
            </div>
          )}

          {/* ==================== VIEW 5: WEBSITE RESOURCE ANALYZER ==================== */}
          {mohaViewMode === 'resources' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    📚 Integrated Website Resources ({mohaActiveClass} · {mohaActiveSubject})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any syllabus topic or uploaded paper below to generate notes, lesson plans, or marking schemes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                  <div className="text-xs font-bold uppercase text-amber-950">
                    Official TIE Syllabus Competences ({mohaActiveClass} {mohaActiveSubject})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSyllabusTopics.map((topicItem) => {
                      const cleanT = topicItem.replace(/^\d+\.\d+\s*/, '');
                      return (
                        <div
                          key={topicItem}
                          className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-bold text-slate-800">{topicItem}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startAiQuiz(mohaActiveClass, mohaActiveSubject, cleanT)}
                              className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] cursor-pointer"
                            >
                              Quiz
                            </button>
                            <button
                              onClick={() => {
                                setTsTopic(cleanT);
                                setTsSubTopic(cleanT);
                                setMohaViewMode('studio');
                                submitTeacherStudioDoc('lessonnotes');
                              }}
                              className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => {
                                setTsTopic(cleanT);
                                setTsSubTopic(cleanT);
                                setMohaViewMode('studio');
                                submitTeacherStudioDoc('lessonplan');
                              }}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Plan
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase text-slate-600">
                    Linked Past Papers &amp; TIE Books on Website
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allPapers
                      .filter(
                        (p) =>
                          p.subject.toLowerCase().includes(mohaActiveSubject.toLowerCase()) ||
                          mohaActiveSubject.toLowerCase().includes(p.subject.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5 text-xs"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-violet-700">
                              {item.category} · {item.form} · {item.year}
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5">{item.title}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70">
                            {item.paperUrl && (
                              <button
                                onClick={() => openViewer(item.id, 'paper')}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                              >
                                Preview PDF
                              </button>
                            )}
                            <button
                              onClick={() =>
                                sendMwalimuMessage(
                                  `Analyze "${item.title}" (${item.form} ${item.subject}, ${item.year}) and prepare revision notes and worked solutions.`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer"
                            >
                              Analyze in Chat
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 6: USER PROFILE & MASTERY CHART ==================== */}
          {mohaViewMode === 'profile' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto space-y-5">
                {/* Editable User Profile Settings */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-800">
                    Profile Details (Synced with Leaderboard &amp; Teacher Studio)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => {
                          setUserProfile({ ...userProfile, name: e.target.value });
                          setChallengePlayerName(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">School Name</label>
                      <input
                        type="text"
                        value={userProfile.school}
                        onChange={(e) => {
                          setUserProfile({ ...userProfile, school: e.target.value });
                          setChallengePlayerSchool(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">Role</label>
                      <select
                        value={userProfile.role}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, role: e.target.value as 'Teacher' | 'Student' })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                      >
                        <option value="Teacher">Teacher (Mwalimu)</option>
                        <option value="Student">Student (Mwanafunzi)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-0.5">Target Class</label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={userProfile.targetClass}
                          onChange={(e) => setUserProfile({ ...userProfile, targetClass: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                        >
                          {Object.keys(TIE_CURRICULUM_SUBJECTS).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveUserProfileChanges(userProfile)}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Total Topics Mastered</div>
                    <div className="text-2xl font-black text-violet-700 mt-1">
                      {masteryProgressData.totalMasteredTopics}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Quizzes Completed</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {masteryProgressData.totalQuizzesCompleted}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Learned Notes</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {masteryProgressData.totalLearnedNotes}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Quiz Accuracy</div>
                    <div className="text-2xl font-black text-amber-700 mt-1">
                      {masteryProgressData.avgQuizAccuracy}%
                    </div>
                  </div>
                </div>

                {/* VISUAL PROGRESS CHART: Topics Mastered by Subject */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-violet-600" />
                        <span>Topics Mastered Progress Chart ({masteryProgressData.targetCls})</span>
                      </h5>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Quiz Mastery
                      </span>
                      <span className="flex items-center gap-1.5 text-violet-800">
                        <span className="w-3 h-3 rounded-xs bg-violet-600 inline-block" /> Learned Notes
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 pb-2 px-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 items-end h-40 pt-4 px-2">
                      {masteryProgressData.subjectBreakdown.map((item) => {
                        const quizPct = Math.min(
                          100,
                          Math.round((item.quizTopicsCount / item.totalCompetences) * 100)
                        );
                        const learnPct = Math.min(
                          100 - quizPct,
                          Math.round((item.learnedNotesCount / item.totalCompetences) * 100)
                        );
                        const totalBarPct = Math.max(8, quizPct + learnPct);
                        return (
                          <div
                            key={item.subject}
                            className="flex flex-col items-center h-full justify-end group cursor-pointer"
                            onClick={() => startAiQuiz(masteryProgressData.targetCls, item.subject)}
                          >
                            <div className="text-[10px] font-bold text-slate-700 mb-1 tabular-nums">
                              {item.masteredCount}/{item.totalCompetences}
                            </div>
                            <div className="w-full max-w-[36px] bg-slate-200 rounded-t-lg h-24 flex flex-col justify-end overflow-hidden border border-slate-300/80">
                              {learnPct > 0 && (
                                <div style={{ height: `${learnPct}%` }} className="w-full bg-violet-600" />
                              )}
                              {quizPct > 0 && (
                                <div style={{ height: `${quizPct}%` }} className="w-full bg-emerald-500" />
                              )}
                              {quizPct === 0 && learnPct === 0 && (
                                <div style={{ height: `${totalBarPct}%` }} className="w-full bg-slate-300" />
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-slate-700 mt-1.5 truncate w-full text-center">
                              {item.subject.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* FOOTER (Hidden when inside full-viewport Moha AI workspace so input box stays fixed in view) */}
      {activePage !== 'moha' && (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs text-center mt-auto">
          <div className="max-w-5xl mx-auto px-4 space-y-1.5">
            <div className="font-bold text-white text-sm">ELIMIKA TANZANIA</div>
            <p>Past Papers, Marking Schemes, TIE Books, Official Syllabuses &amp; Moha AI.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
