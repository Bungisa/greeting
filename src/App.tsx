import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { jsPDF } from 'jspdf';
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
  buildContentIntegratedQuizQuestions,
  buildInstantOfficialDocument,
  CONFIG,
  escapeHtml,
  extractTextbookChaptersFromText,
  FlashcardItem,
  generateLocalSmartTutorReply,
  getDefaultFlashcardsForSubject,
  getSubTopicsForMainTopic,
  getSyllabusTopicsForClassSubject,
  getTieTextbookChapterContent,
  LearnedMemoryItem,
  matchesFormRange,
  matchesSubjectQuery,
  normalizeClassName,
  normalizeSubjectName,
  OFFICIAL_ATTACHED_TIE_BOOKS,
  OfficialDocType,
  PaperRecord,
  parseClassSubjectTopicFromPrompt,
  QuizHistoryRecord,
  QuizItem,
  SiteResourceContext,
  TeacherMetadata,
  TIE_CURRICULUM_SUBJECTS,
  UserProfileData,
} from './data/curriculumData';
import { DiagramPreset, InteractiveDiagramLab } from './components/InteractiveDiagramLab';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { StemArenaGame } from './components/StemArenaGame';
import { ElimikaPlayHub, PlayGameRoute } from './components/ElimikaPlayHub';
import { TopicMasteryPlanner } from './components/TopicMasteryPlanner';
import { VirtualScienceLab } from './components/VirtualScienceLab';
import {
  MathText,
  renderLatexSnippet,
  renderMathTextToHtml,
  renderRichMathParagraphToPng,
  typesetMathInElement,
} from './utils/mathRenderer';

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
  quizTarget?: {
    cls: string;
    subject: string;
    topic: string;
    subTopic: string;
  };
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

const ELIMIKA_REMOTE_API_BASE = 'https://ais-pre-utxrgt5piro4x4xpbnh75h-142058246407.europe-west2.run.app';

async function fetchElimikaApi(endpointPath: string, options?: RequestInit): Promise<Response> {
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const isStaticCustomDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('elimika.online') ||
      window.location.hostname.includes('github.io'));

  if (!isFileProtocol && !isStaticCustomDomain) {
    try {
      const localRes = await fetch(endpointPath, options);
      const contentType = localRes.headers.get('content-type') || '';
      if (localRes.ok && contentType.includes('application/json')) {
        return localRes;
      }
    } catch {
      // fall through to remote Cloud Run backend
    }
  }

  return fetch(`${ELIMIKA_REMOTE_API_BASE}${endpointPath}`, options);
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
    lowerPrompt.includes('plot') ||
    lowerPrompt.includes('notes') ||
    lowerPrompt.includes('lessonnotes') ||
    lowerPrompt.includes('chapter') ||
    lowerPrompt.includes('sura') ||
    lowerPrompt.includes('illustrate');

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
  const seenSyllabuses = new Set<string>();

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
      const subject = normalizeSubjectName(rawSubject || 'General', rawTitle);
      const year = rawYear || '2025';
      const rawCatClean = rawCat || 'NECTA';
      const catLower = `${rawCatClean} ${rawTitle}`.toLowerCase();

      const isSyllabus = catLower.includes('syllabus') || catLower.includes('muhtasari');
      const isBook =
        !isSyllabus &&
        (catLower.includes('book') ||
          catLower.includes('kitabu') ||
          catLower.includes('textbook') ||
          catLower.includes('tie'));

      const normalizedExamCat =
        /mid[- ]?term|nusu\s*muhula/i.test(catLower)
          ? 'Midterm'
          : /annual|terminal/i.test(catLower)
          ? 'Annual'
          : /pre[- ]?necta/i.test(catLower)
          ? 'Pre-NECTA'
          : /mock/i.test(catLower)
          ? 'Mock'
          : /necta|ftna|csee|acsee|psle|sfna/i.test(catLower)
          ? 'NECTA'
          : rawCatClean;

      if (isBook) {
        seenBooks.add(`${form.toLowerCase()}__${subject.toLowerCase()}`);
      }
      if (isSyllabus) {
        seenSyllabuses.add(`${form.toLowerCase()}__${subject.toLowerCase()}`);
      }

      records.push({
        id: `sheet-${i}`,
        title: rawTitle || `${form} ${subject} (${year})`,
        form,
        subject,
        year,
        category: isSyllabus ? 'TIE Syllabus' : isBook ? 'TIE Book' : normalizedExamCat,
        paperUrl,
        answersUrl,
        isBook,
        isSyllabus,
      });
    }
  }

  const existingDriveIds = new Set<string>();
  for (const r of records) {
    const m = r.paperUrl?.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    if (m && m[1]) existingDriveIds.add(m[1]);
  }

  for (const officialBook of OFFICIAL_ATTACHED_TIE_BOOKS) {
    const m = officialBook.paperUrl?.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    const driveId = m?.[1] || '';
    if (driveId && existingDriveIds.has(driveId)) continue;
    if (driveId) existingDriveIds.add(driveId);
    records.push(officialBook);
    seenBooks.add(`${officialBook.form.toLowerCase()}__${officialBook.subject.toLowerCase()}`);
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
      if (!seenSyllabuses.has(key)) {
        records.push({
          id: `tie-syllabus-${cls.replace(/\s+/g, '')}-${idx}`,
          title: `${cls} ${sub} — Official TIE Competence-Based Syllabus`,
          form: cls,
          subject: sub,
          year: '2025',
          category: 'TIE Syllabus',
          paperUrl: null,
          answersUrl: null,
          isBook: false,
          isSyllabus: true,
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

function sanitizeAndNormalizeSvgBlock(svgRaw: string): string {
  let s = String(svgRaw || '').trim();
  if (!s) return '';

  // Strip surrounding markdown code fences if present
  s = s
    .replace(/^```(?:xml|svg|html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // If SVG tags were HTML-escaped (&lt;svg ...&gt;), unescape them back to valid SVG XML
  if (/&lt;svg\b/i.test(s) || (!s.includes('<svg') && s.includes('&lt;'))) {
    s = s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;(?!lt;|gt;|quot;|apos;|amp;|#\d+;|#x[0-9a-fA-F]+;)/g, '&');
  }

  const startIdx = s.search(/<svg\b/i);
  if (startIdx === -1) return '';
  s = s.slice(startIdx);

  // Clean raw LaTeX $ delimiters inside <text>...</text> nodes so SVG labels look clean
  s = s.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi, (_m, attrs, inner) => {
    const cleanInner = String(inner)
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\le\b/g, '≤')
      .replace(/\\ge\b/g, '≥')
      .replace(/\\times\b/g, '×')
      .replace(/\\theta\b/g, 'θ')
      .replace(/\\pi\b/g, 'π')
      .replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
    return `<text${attrs}>${cleanInner}</text>`;
  });

  // If the SVG was truncated before </svg>, repair trailing incomplete tags and close </svg>
  if (!/<\/svg\s*>/i.test(s)) {
    // Remove any trailing unclosed tag at the end (e.g. `<line x1="50" ...`)
    s = s.replace(/<[^>]*$/, '').trim();
    // If an open <text> tag was not closed, close it
    const openTextCount = (s.match(/<text\b/gi) || []).length;
    const closeTextCount = (s.match(/<\/text>/gi) || []).length;
    if (openTextCount > closeTextCount) {
      s += '</text>'.repeat(openTextCount - closeTextCount);
    }
    const openGCount = (s.match(/<g\b/gi) || []).length;
    const closeGCount = (s.match(/<\/g>/gi) || []).length;
    if (openGCount > closeGCount) {
      s += '</g>'.repeat(openGCount - closeGCount);
    }
    s += '\n</svg>';
  } else {
    const closeIdx = s.search(/<\/svg\s*>/i);
    if (closeIdx !== -1) {
      s = s.slice(0, closeIdx) + '</svg>';
    }
  }

  // Ensure xmlns and white background styling on the root <svg> element
  s = s.replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
    let updatedAttrs = String(attrs || '');
    if (!/\bxmlns\s*=/i.test(updatedAttrs)) {
      updatedAttrs += ' xmlns="http://www.w3.org/2000/svg"';
    }
    if (!/\bviewBox\s*=/i.test(updatedAttrs)) {
      updatedAttrs += ' viewBox="0 0 600 240"';
    }
    if (!/\bstyle\s*=/i.test(updatedAttrs)) {
      updatedAttrs +=
        ' style="width:100%; max-width:600px; height:auto; display:block; margin:10px auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;"';
    }
    return `<svg${updatedAttrs}>`;
  });

  return `<div class="moha-svg-diagram" style="margin:12px 0; padding:12px; background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; overflow-x:auto;">${s}</div>`;
}

function formatMwalimuHtml(raw: string): string {
  if (!raw) return '';
  if (raw.includes('official-tie-doc')) {
    // Ensure any escaped <svg> inside official-tie-doc is unescaped and math delimiters are rendered
    const withFixedSvg = raw.replace(
      /&lt;svg\b[\s\S]*?(?:&lt;\/svg&gt;|$)/gi,
      (match) => sanitizeAndNormalizeSvgBlock(match)
    );
    const svgTokens: string[] = [];
    const protectedSvgs = withFixedSvg.replace(/<svg\b[\s\S]*?<\/svg>/gi, (m) => {
      const idx = svgTokens.length;
      svgTokens.push(m);
      return `__OFFICIAL_DOC_SVG_${idx}__`;
    });
    const withMath = protectedSvgs
      .replace(/\$\$([\s\S]+?)\$\$/g, (_m, tex) => renderLatexSnippet(String(tex), true))
      .replace(/\$([^$\n]+?)\$/g, (_m, tex) => renderLatexSnippet(String(tex), false));
    return withMath.replace(/__OFFICIAL_DOC_SVG_(\d+)__/g, (_m, idx) => svgTokens[Number(idx)] || '');
  }

  const diagramPlaceholders: string[] = [];
  const stashDiagram = (htmlBlock: string): string => {
    const token = `__TIE_DIAGRAM_BLOCK_${diagramPlaceholders.length}__`;
    diagramPlaceholders.push(htmlBlock);
    return `\n${token}\n`;
  };

  // 1. Extract explicit <!--DIAGRAM_START-->...<!--DIAGRAM_END--> blocks
  let preProcessed = raw.replace(
    /<!--DIAGRAM_START-->([\s\S]*?)<!--DIAGRAM_END-->/g,
    (_m, svgHtml) => stashDiagram(String(svgHtml))
  );

  // 2. Strip markdown code fences wrapping <svg> or &lt;svg&gt;
  preProcessed = preProcessed.replace(
    /```(?:xml|svg|html)?\s*((?:<svg|&lt;svg)\b[\s\S]*?(?:<\/svg>|&lt;\/svg&gt;|$))\s*```?/gi,
    (_m, svgInner) => stashDiagram(sanitizeAndNormalizeSvgBlock(String(svgInner)))
  );

  // 3. Extract any standalone <svg>...</svg> or escaped &lt;svg&gt;...&lt;/svg&gt; (including truncated <svg at end of text)
  preProcessed = preProcessed.replace(
    /<svg\b[\s\S]*?(?:<\/svg\s*>|$)/gi,
    (svgMatch) => stashDiagram(sanitizeAndNormalizeSvgBlock(svgMatch))
  );
  preProcessed = preProcessed.replace(
    /&lt;svg\b[\s\S]*?(?:&lt;\/svg&gt;|$)/gi,
    (svgMatch) => stashDiagram(sanitizeAndNormalizeSvgBlock(svgMatch))
  );

  // Collapse multi-line display math blocks ($$...$$) onto single lines so line splitting never breaks LaTeX
  const collapsedDisplayMath = preProcessed.replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => {
    return `$$${String(inner).replace(/\n+/g, ' ').trim()}$$`;
  });

  // Convert Markdown pipe tables into clean bordered HTML tables
  const lines = collapsedDisplayMath.split('\n');
  const outLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const diagMatch = line.match(/^__TIE_DIAGRAM_BLOCK_(\d+)__$/);
    if (diagMatch) {
      const dIdx = Number(diagMatch[1]);
      if (diagramPlaceholders[dIdx]) {
        outLines.push(diagramPlaceholders[dIdx]);
      }
      i++;
      continue;
    }

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
            .map((cell) => renderMathTextToHtml(cell.trim()));

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

    const formattedLine = renderMathTextToHtml(lines[i]).replace(
      /__TIE_DIAGRAM_BLOCK_(\d+)__/g,
      (_m, dIdxStr) => diagramPlaceholders[Number(dIdxStr)] || ''
    );
    const trimmed = formattedLine.trim();
    if (/^<strong>[1-9]\.\s/.test(trimmed)) {
      outLines.push(
        `<div style="margin-top:10px; margin-bottom:4px; padding:6px 10px; background:#f8fafc; border-left:3px solid #4f46e5; border-radius:6px; font-weight:700; color:#0f172a;">${formattedLine}</div>`
      );
    } else if (/^(•|-|\*)\s+/.test(trimmed)) {
      outLines.push(
        `<div style="margin-left:10px; margin-top:3px; margin-bottom:3px; padding-left:8px; border-left:2px solid #cbd5e1; color:#1e293b;">${formattedLine}</div>`
      );
    } else {
      outLines.push(formattedLine);
    }
    i++;
  }

  return outLines.join('<br/>');
}

export default function App() {
  const [allPapers, setAllPapers] = useState<PaperRecord[]>(() => processParsedRows([]));
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'offline' | 'error'>('syncing');

  // Navigation & View Mode
  const [activePage, setActivePage] = useState<
    'papers' | 'books' | 'syllabus' | 'daily_quiz' | 'mastery_planner' | 'virtual_lab' | 'moha' | 'game'
  >('papers');
  const [playRoute, setPlayRoute] = useState<PlayGameRoute>('hub');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentSearchQueries, setRecentSearchQueries] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearchQueries') || '[]');
      return Array.isArray(saved)
        ? saved.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);
  const searchBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const searchSaveTimerRef = useRef<number | null>(null);
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
  const [mohaViewMode, setMohaViewMode] = useState<'chat' | 'studio' | 'quiz' | 'diagram' | 'profile'>('chat');
  const [activeDiagramPreset, setActiveDiagramPreset] = useState<DiagramPreset>('physics_ohm');
  const [mohaActiveClass, setMohaActiveClass] = useState<string>('Form 3');
  const [mohaActiveSubject, setMohaActiveSubject] = useState<string>('Basic Mathematics');
  const [mohaMessages, setMohaMessages] = useState<ChatMessage[]>([]);
  const [mohaInput, setMohaInput] = useState<string>('');
  const [mohaPendingImage, setMohaPendingImage] = useState<{
    mimeType: string;
    base64Data: string;
    previewUrl: string;
    fileName?: string;
  } | null>(null);
  const [mohaFocusedResourceId, setMohaFocusedResourceId] = useState<string>('ALL');
  const [extractedBookChaptersMap, setExtractedBookChaptersMap] = useState<Record<string, string[]>>({});
  const [customAttachedPapers, setCustomAttachedPapers] = useState<PaperRecord[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('elimika_custom_attached_resources_v1') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [attachModalOpen, setAttachModalOpen] = useState<boolean>(false);
  const [newResTitle, setNewResTitle] = useState<string>('');
  const [newResClass, setNewResClass] = useState<string>('Form 4');
  const [newResSubject, setNewResSubject] = useState<string>('Basic Mathematics');
  const [newResCategory, setNewResCategory] = useState<string>('TIE Book');
  const [newResYear, setNewResYear] = useState<string>('2026');
  const [newResPaperUrl, setNewResPaperUrl] = useState<string>('');
  const [newResAnswersUrl, setNewResAnswersUrl] = useState<string>('');
  const [newResCustomContent, setNewResCustomContent] = useState<string>('');
  const [newResAttachedFile, setNewResAttachedFile] = useState<{
    mimeType: string;
    base64Data: string;
    fileName: string;
  } | null>(null);
  const [mohaLearnPanelOpen, setMohaLearnPanelOpen] = useState<boolean>(false);
  const [learnTopicInput, setLearnTopicInput] = useState<string>('');
  const [learnAnswerInput, setLearnAnswerInput] = useState<string>('');
  const [learnedMemory, setLearnedMemory] = useState<LearnedMemoryItem[]>([]);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'about' | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);
  const [whatsappTab, setWhatsappTab] = useState<'join' | 'broadcast' | 'logo' | 'setup' | 'adsense'>('join');
  const [whatsappAdminUnlocked, setWhatsappAdminUnlocked] = useState<boolean>(false);
  const [whatsappAdminPinPrompt, setWhatsappAdminPinPrompt] = useState<boolean>(false);
  const [whatsappAdminPinInput, setWhatsappAdminPinInput] = useState<string>('');
  const [adsensePubId, setAdsensePubId] = useState<string>(() => {
    try {
      return localStorage.getItem('elimika_adsense_pub_id') || 'ca-pub-7502193981138651';
    } catch {
      return 'ca-pub-7502193981138651';
    }
  });
  const [profileLogoTheme, setProfileLogoTheme] = useState<'blue_black' | 'blue_white' | 'black_blue'>('blue_black');
  const [whatsappConfig, setWhatsappConfig] = useState<{
    channelName: string;
    mainChannelUrl: string;
    oLevelGroupUrl: string;
    aLevelGroupUrl: string;
    primaryGroupUrl: string;
    teachersGroupUrl: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('elimika_whatsapp_community_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.mainChannelUrl &&
          parsed.mainChannelUrl !== 'https://whatsapp.com/channel/0029VaElimikaOnline'
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return {
      channelName: 'Elimika Online',
      mainChannelUrl: 'https://whatsapp.com/channel/0029VbE4Ctl0G0Xbp8kQwu0t',
      oLevelGroupUrl: 'https://chat.whatsapp.com/ElimikaOLevelForm1to4',
      aLevelGroupUrl: 'https://chat.whatsapp.com/ElimikaALevelForm5to6',
      primaryGroupUrl: 'https://chat.whatsapp.com/ElimikaPrimaryStd1to7',
      teachersGroupUrl: 'https://chat.whatsapp.com/ElimikaTeachersNetwork',
    };
  });
  const [broadcastTemplateType, setBroadcastTemplateType] = useState<'paper' | 'quiz' | 'book' | 'teacher'>('paper');

  const saveWhatsappConfig = (nextConfig: typeof whatsappConfig) => {
    setWhatsappConfig(nextConfig);
    try {
      localStorage.setItem('elimika_whatsapp_community_v3', JSON.stringify(nextConfig));
      showToast('✅ WhatsApp Channel & Community links saved!');
    } catch {
      showToast('⚠️ Could not save links in browser storage.');
    }
  };

  useEffect(() => {
    const cleaned = adsensePubId.trim();
    if (!cleaned || !cleaned.startsWith('ca-pub-')) return;
    let meta = document.querySelector('meta[name="google-adsense-account"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      document.head.appendChild(meta);
    }
    meta.content = cleaned;

    const scriptId = 'elimika-google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cleaned)}`;
      document.head.appendChild(script);
    }
  }, [adsensePubId]);

  const downloadElimikaProfilePicPng = (theme: 'blue_black' | 'blue_white' | 'black_blue' = profileLogoTheme) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLight = theme === 'blue_white';

    // 1. Background gradient (Blue + Black + White combinations)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    if (theme === 'blue_black') {
      bgGrad.addColorStop(0, '#050811');
      bgGrad.addColorStop(0.5, '#1d4ed8');
      bgGrad.addColorStop(1, '#090d16');
    } else if (theme === 'blue_white') {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.55, '#eff6ff');
      bgGrad.addColorStop(1, '#dbeafe');
    } else {
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Subtle glowing radial spotlight in center
    const radGrad = ctx.createRadialGradient(540, 460, 60, 540, 540, 480);
    radGrad.addColorStop(
      0,
      theme === 'blue_black'
        ? 'rgba(59, 130, 246, 0.35)'
        : theme === 'blue_white'
        ? 'rgba(37, 99, 235, 0.12)'
        : 'rgba(37, 99, 235, 0.40)'
    );
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // 3. Outer circular safe-zone ring (Blue, Black & White double crest ring)
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 540, 480, 0, Math.PI * 2);
    ctx.lineWidth = 16;
    ctx.strokeStyle = isLight ? '#1d4ed8' : theme === 'blue_black' ? '#ffffff' : '#2563eb';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(540, 540, 454, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = isLight ? '#090d16' : theme === 'blue_black' ? '#38bdf8' : '#ffffff';
    ctx.stroke();
    ctx.restore();

    // 4. Draw Sleek Graduation Cap (Mortarboard) at top center in Blue, Black & White
    ctx.save();
    ctx.translate(540, 295);
    // Diamond top
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(195, -15);
    ctx.lineTo(0, 65);
    ctx.lineTo(-195, -15);
    ctx.closePath();
    ctx.fillStyle = theme === 'black_blue' ? '#ffffff' : '#2563eb';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = isLight ? '#090d16' : theme === 'black_blue' ? '#2563eb' : '#ffffff';
    ctx.stroke();

    // Cap skull base
    ctx.beginPath();
    ctx.moveTo(-105, 25);
    ctx.lineTo(-105, 95);
    ctx.quadraticCurveTo(0, 145, 105, 95);
    ctx.lineTo(105, 25);
    ctx.lineTo(0, 68);
    ctx.closePath();
    ctx.fillStyle = isLight ? '#090d16' : '#ffffff';
    ctx.fill();

    // Tassel on right side
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(155, 20);
    ctx.lineTo(155, 95);
    ctx.lineWidth = 10;
    ctx.strokeStyle = isLight ? '#2563eb' : '#38bdf8';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(155, 102, 14, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? '#2563eb' : '#38bdf8';
    ctx.fill();
    ctx.restore();

    // 5. Draw Open Book Emblem below Cap
    ctx.save();
    ctx.translate(540, 475);
    ctx.beginPath();
    // Left page
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(-80, -15, -150, 5);
    ctx.lineTo(-150, -55);
    ctx.quadraticCurveTo(-80, -75, 0, -40);
    // Right page
    ctx.quadraticCurveTo(80, -75, 150, -55);
    ctx.lineTo(150, 5);
    ctx.quadraticCurveTo(80, -15, 0, 20);
    ctx.closePath();
    ctx.fillStyle = isLight ? 'rgba(37, 99, 235, 0.14)' : 'rgba(255, 255, 255, 0.16)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = isLight ? '#1d4ed8' : '#ffffff';
    ctx.stroke();
    ctx.restore();

    // 6. Main Brand Title: ELIMIKA.
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#090d16' : '#ffffff';
    ctx.font = '900 132px Inter, system-ui, -apple-system, sans-serif';
    ctx.shadowColor = isLight ? 'rgba(37, 99, 235, 0.18)' : 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 18;
    ctx.fillText('ELIMIKA', 540, 650);

    // Subtitle pill: ONLINE (Blue, Black & White contrast)
    ctx.shadowBlur = 0;
    ctx.fillStyle = theme === 'blue_black' ? '#ffffff' : '#2563eb';
    ctx.beginPath();
    ctx.roundRect(330, 690, 420, 68, 34);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = theme === 'blue_black' ? '#090d16' : '#ffffff';
    ctx.stroke();

    ctx.fillStyle = theme === 'blue_black' ? '#090d16' : '#ffffff';
    ctx.font = '900 42px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('ONLINE', 540, 739);

    // Bottom tagline inside circle
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = '700 28px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('PAST PAPERS • TIE BOOKS • MOHA AI', 540, 825);

    ctx.fillStyle = isLight ? '#1d4ed8' : '#60a5fa';
    ctx.font = '800 24px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('STD 1–7  |  FORM 1–6', 540, 875);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Elimika-Online-Logo-${theme}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ Downloaded HD 1080×1080 Elimika Online Logo (Blue, Black & White)!');
  };


  // User Profile & Mastery Progress State
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Teacher / Student',
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
  const [selectedQuizSubTopic, setSelectedQuizSubTopic] = useState<string>('ALL');
  const [selectedQuizSourceFilter, setSelectedQuizSourceFilter] = useState<'ALL' | 'textbook' | 'past_paper'>('ALL');
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

  function getPublicShareBaseUrl(customServerUrl?: string): string {
    const rawOrigin = (customServerUrl || serverPublicAppUrl || window.location.origin).replace(/\/+$/, '');
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
          const fallbackFifteen = buildContentIntegratedQuizQuestions(ch.cls, ch.subject, ch.topic);
          const loadedQns = Array.isArray(ch.questions) ? [...ch.questions] : [];
          for (const fq of fallbackFifteen) {
            if (loadedQns.length >= 15) break;
            if (!loadedQns.some((q) => q.question === fq.question)) {
              loadedQns.push(fq);
            }
          }
          setQuizItems(loadedQns.slice(0, 15));
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
      const rsq = JSON.parse(localStorage.getItem('recentSearchQueries') || '[]');
      if (Array.isArray(rsq)) {
        setRecentSearchQueries(
          rsq.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
        );
      }
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
    } else if (window.location.hash === '#daily-quiz') {
      openDailyQuizPage();
    } else if (window.location.hash === '#moha') {
      openMwalimuModal();
    } else if (window.location.hash === '#play') {
      setPlayRoute('hub');
      setActivePage('game');
    } else if (window.location.hash === '#stem-builder') {
      setPlayRoute('stem_builder');
      setActivePage('game');
    } else if (window.location.hash === '#treasure-hunt') {
      setPlayRoute('treasure_hunt');
      setActivePage('game');
    } else if (window.location.hash === '#escape-classroom') {
      setPlayRoute('escape_classroom');
      setActivePage('game');
    } else if (window.location.hash === '#stem-arena') {
      setPlayRoute('stem_arena');
      setActivePage('game');
    }

    const onHashChange = () => {
      const ch = parseChallengeFromLocation();
      if (ch) {
        loadSharedChallengeFromUrl(ch.id, ch.cls, ch.sub, ch.topic, ch.by);
      } else if (window.location.hash === '#play') {
        setPlayRoute('hub');
        setActivePage('game');
      } else if (window.location.hash === '#stem-builder') {
        setPlayRoute('stem_builder');
        setActivePage('game');
      } else if (window.location.hash === '#treasure-hunt') {
        setPlayRoute('treasure_hunt');
        setActivePage('game');
      } else if (window.location.hash === '#escape-classroom') {
        setPlayRoute('escape_classroom');
        setActivePage('game');
      } else if (window.location.hash === '#stem-arena') {
        setPlayRoute('stem_arena');
        setActivePage('game');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // ==================== PHONE & BROWSER BACK BUTTON HISTORY SUPPORT ====================
  interface ElimikaHistorySnapshot {
    activePage: typeof activePage;
    step: 1 | 2 | 3;
    selectedClass: string;
    selectedSubject: string;
    mohaViewMode: typeof mohaViewMode;
    playRoute: typeof playRoute;
  }

  const navHistoryStackRef = useRef<ElimikaHistorySnapshot[]>([
    {
      activePage: 'papers',
      step: 1,
      selectedClass: '',
      selectedSubject: '',
      mohaViewMode: 'chat',
      playRoute: 'hub',
    },
  ]);
  const isPoppingHistoryRef = useRef<boolean>(false);
  const latestNavStateRef = useRef({
    activePage,
    step,
    selectedClass,
    selectedSubject,
    mohaViewMode,
    playRoute,
    viewerPaper,
    attachModalOpen,
    teacherStudioOpen,
  });

  useEffect(() => {
    latestNavStateRef.current = {
      activePage,
      step,
      selectedClass,
      selectedSubject,
      mohaViewMode,
      playRoute,
      viewerPaper,
      attachModalOpen,
      teacherStudioOpen,
    };
  }, [
    activePage,
    step,
    selectedClass,
    selectedSubject,
    mohaViewMode,
    playRoute,
    viewerPaper,
    attachModalOpen,
    teacherStudioOpen,
  ]);

  useEffect(() => {
    if (isPoppingHistoryRef.current) {
      isPoppingHistoryRef.current = false;
      return;
    }
    const stack = navHistoryStackRef.current;
    const top = stack[stack.length - 1];
    const nextSnap: ElimikaHistorySnapshot = {
      activePage,
      step,
      selectedClass,
      selectedSubject,
      mohaViewMode,
      playRoute,
    };
    const isSame =
      top &&
      top.activePage === nextSnap.activePage &&
      top.step === nextSnap.step &&
      top.selectedClass === nextSnap.selectedClass &&
      top.selectedSubject === nextSnap.selectedSubject &&
      top.mohaViewMode === nextSnap.mohaViewMode &&
      top.playRoute === nextSnap.playRoute;

    if (!isSame) {
      stack.push(nextSnap);
      try {
        window.history.pushState(
          { elimikaNav: true, idx: stack.length - 1, ...nextSnap },
          ''
        );
      } catch {
        // ignore history push errors in restricted frames
      }
    }
  }, [activePage, step, selectedClass, selectedSubject, mohaViewMode, playRoute]);

  const stepBackFallback = () => {
    const cur = latestNavStateRef.current;
    if (cur.viewerPaper) {
      setViewerPaper(null);
      return;
    }
    if (cur.attachModalOpen) {
      setAttachModalOpen(false);
      return;
    }
    if (cur.teacherStudioOpen) {
      setTeacherStudioOpen(false);
      return;
    }
    if (cur.activePage === 'game' && cur.playRoute !== 'hub') {
      setPlayRoute('hub');
      return;
    }
    if (cur.activePage === 'moha' && cur.mohaViewMode !== 'chat') {
      setMohaViewMode('chat');
      return;
    }
    if (cur.activePage !== 'papers') {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setActivePage('papers');
      return;
    }
    if (cur.step === 3) {
      if (searchQuery.trim().length > 0) {
        setSearchQuery('');
        setStep(cur.selectedClass ? 2 : 1);
      } else {
        setStep(2);
      }
      return;
    }
    if (cur.step === 2) {
      setStep(1);
    }
  };

  useEffect(() => {
    // Seed initial history entry so phone Back button stays inside app
    try {
      if (!window.history.state || !window.history.state.elimikaNav) {
        window.history.replaceState(
          {
            elimikaNav: true,
            idx: 0,
            activePage: 'papers',
            step: 1,
            selectedClass: '',
            selectedSubject: '',
            mohaViewMode: 'chat',
            playRoute: 'hub',
          },
          ''
        );
      }
    } catch {
      // ignore
    }

    const onPopState = (event: PopStateEvent) => {
      const cur = latestNavStateRef.current;
      // If a modal/viewer is open, close it first and keep current page
      if (cur.viewerPaper || cur.attachModalOpen || cur.teacherStudioOpen) {
        setViewerPaper(null);
        setAttachModalOpen(false);
        setTeacherStudioOpen(false);
        try {
          const topSnap = navHistoryStackRef.current[navHistoryStackRef.current.length - 1];
          if (topSnap) {
            window.history.pushState({ elimikaNav: true, ...topSnap }, '');
          }
        } catch {
          // ignore
        }
        return;
      }

      const stack = navHistoryStackRef.current;
      if (stack.length > 1) {
        stack.pop();
        const prevSnap = stack[stack.length - 1];
        if (prevSnap) {
          isPoppingHistoryRef.current = true;
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setActivePage(prevSnap.activePage);
          setStep(prevSnap.step);
          setSelectedClass(prevSnap.selectedClass);
          setSelectedSubject(prevSnap.selectedSubject);
          setMohaViewMode(prevSnap.mohaViewMode);
          setPlayRoute(prevSnap.playRoute);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      if (event.state && event.state.elimikaNav) {
        isPoppingHistoryRef.current = true;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setActivePage(event.state.activePage || 'papers');
        setStep(event.state.step || 1);
        setSelectedClass(event.state.selectedClass || '');
        setSelectedSubject(event.state.selectedSubject || '');
        setMohaViewMode(event.state.mohaViewMode || 'chat');
        setPlayRoute(event.state.playRoute || 'hub');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      isPoppingHistoryRef.current = true;
      stepBackFallback();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function handleGoBack() {
    if (viewerPaper || attachModalOpen || teacherStudioOpen) {
      setViewerPaper(null);
      setAttachModalOpen(false);
      setTeacherStudioOpen(false);
      return;
    }
    if (navHistoryStackRef.current.length > 1) {
      try {
        window.history.back();
        return;
      } catch {
        // fall through to manual step back
      }
    }
    stepBackFallback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render MathJax 3 & KaTeX math formulas across Chat, Quiz, Daily Quiz, Flashcards & Lesson Notes Studio
  useEffect(() => {
    if (activePage === 'moha' && mohaViewMode === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      typesetMathInElement(chatContainerRef.current);
    }
    typesetMathInElement(document.body);
  }, [
    mohaMessages,
    mohaOpen,
    mohaViewMode,
    activePage,
    quizItems,
    quizSelectedAnswers,
    flashcards,
    activeFlashcardIdx,
    flashcardFlipped,
    studioPreviewHtml,
  ]);

  const mohaFocusedResource = React.useMemo<PaperRecord | null>(() => {
    if (!mohaFocusedResourceId || mohaFocusedResourceId === 'ALL') return null;
    return allPapers.find((p) => p.id === mohaFocusedResourceId) || null;
  }, [allPapers, mohaFocusedResourceId]);

  const classSubjectResourcesList = React.useMemo<PaperRecord[]>(() => {
    const clsVal = mohaActiveClass || 'Form 3';
    const subVal = mohaActiveSubject || 'Basic Mathematics';
    return allPapers
      .filter(
        (p) =>
          matchesSubjectQuery(p.subject, subVal) &&
          (matchesFormRange(p.form, clsVal) || p.paperUrl !== null || p.isUserAttached)
      )
      .sort((a, b) => {
        const aExactCls = matchesFormRange(a.form, clsVal) ? 1 : 0;
        const bExactCls = matchesFormRange(b.form, clsVal) ? 1 : 0;
        if (bExactCls !== aExactCls) return bExactCls - aExactCls;
        const aHasLink = a.paperUrl || a.customContent ? 1 : 0;
        const bHasLink = b.paperUrl || b.customContent ? 1 : 0;
        return bHasLink - aHasLink;
      });
  }, [allPapers, mohaActiveClass, mohaActiveSubject]);

  function buildSiteResourcesForClassSubject(
    clsVal: string,
    subVal: string,
    ignoreMismatchedFocus = false,
    explicitFocusedDoc?: PaperRecord | null
  ): SiteResourceContext {
    const sortByRelevance = (items: PaperRecord[]) =>
      [...items].sort((a, b) => {
        const aExactCls = matchesFormRange(a.form, clsVal) ? 1 : 0;
        const bExactCls = matchesFormRange(b.form, clsVal) ? 1 : 0;
        if (bExactCls !== aExactCls) return bExactCls - aExactCls;
        const aHasLink = a.paperUrl || a.customContent ? 1 : 0;
        const bHasLink = b.paperUrl || b.customContent ? 1 : 0;
        return bHasLink - aHasLink;
      });

    const matchingBooks = sortByRelevance(
      allPapers.filter(
        (p) =>
          p.isBook &&
          matchesSubjectQuery(p.subject, subVal) &&
          (matchesFormRange(p.form, clsVal) || p.paperUrl !== null || p.isUserAttached)
      )
    );
    const matchingSyllabuses = sortByRelevance(
      allPapers.filter(
        (p) =>
          p.isSyllabus &&
          (matchesSubjectQuery(p.subject, subVal) || matchesFormRange(p.form, clsVal))
      )
    );
    const matchingPapers = sortByRelevance(
      allPapers.filter(
        (p) =>
          !p.isBook &&
          !p.isSyllabus &&
          matchesSubjectQuery(p.subject, subVal) &&
          (matchesFormRange(p.form, clsVal) || p.paperUrl !== null || p.isUserAttached)
      )
    );

    const crossPapers =
      matchingPapers.length > 0
        ? matchingPapers
        : allPapers.filter((p) => !p.isBook && !p.isSyllabus).slice(0, 8);

    const candidateManualFocus = explicitFocusedDoc || mohaFocusedResource;
    const canUseManualFocus =
      Boolean(explicitFocusedDoc) ||
      Boolean(
        candidateManualFocus &&
          (!ignoreMismatchedFocus ||
            (matchesFormRange(candidateManualFocus.form, clsVal) &&
              matchesSubjectQuery(candidateManualFocus.subject, subVal)))
      );

    // If no matching manual focusedResource is active, automatically attach the primary TIE Book for this exact Class & Subject
    const autoAttachedBook =
      !canUseManualFocus
        ? matchingBooks.find(
            (b) => matchesFormRange(b.form, clsVal) && Boolean(b.paperUrl || b.customContent)
          ) ||
          matchingBooks.find((b) => matchesFormRange(b.form, clsVal)) ||
          matchingBooks[0] ||
          null
        : null;

    const effectiveFocused = (canUseManualFocus ? candidateManualFocus : null) || autoAttachedBook;

    return {
      syllabuses: matchingSyllabuses.slice(0, 6).map((s) => ({
        title: s.title,
        form: s.form,
        subject: s.subject,
        year: s.year,
        hasUrl: Boolean(s.paperUrl),
        paperUrl: s.paperUrl,
        customContent: s.customContent,
      })),
      books: matchingBooks.slice(0, 8).map((b) => ({
        title: b.title,
        form: b.form,
        subject: b.subject,
        year: b.year,
        hasUrl: Boolean(b.paperUrl || b.customContent),
        paperUrl: b.paperUrl,
        customContent: b.customContent,
      })),
      papers: crossPapers.slice(0, 12).map((p) => ({
        title: p.title,
        form: p.form,
        subject: p.subject,
        year: p.year,
        category: p.category,
        hasUrl: Boolean(p.paperUrl || p.customContent),
        hasAnswers: Boolean(p.answersUrl),
        paperUrl: p.paperUrl,
        customContent: p.customContent,
      })),
      focusedResource: effectiveFocused
        ? {
            id: effectiveFocused.id,
            title: effectiveFocused.title,
            form: effectiveFocused.form,
            subject: effectiveFocused.subject,
            category: effectiveFocused.category,
            year: effectiveFocused.year,
            paperUrl: effectiveFocused.paperUrl,
            answersUrl: effectiveFocused.answersUrl,
            customContent: effectiveFocused.customContent,
            isBook: effectiveFocused.isBook,
            isSyllabus: effectiveFocused.isSyllabus,
          }
        : null,
    };
  }

  // Integrated Website Resources Context for active Class & Subject (plus cross-subject fallback & focused resource)
  const activeSiteResources = React.useMemo<SiteResourceContext>(() => {
    return buildSiteResourcesForClassSubject(
      mohaActiveClass || 'Form 3',
      mohaActiveSubject || 'Basic Mathematics'
    );
  }, [allPapers, mohaActiveClass, mohaActiveSubject, mohaFocusedResource]);

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

  function mergePapersWithAttached(sheetItems: PaperRecord[], customItems: PaperRecord[]): PaperRecord[] {
    const byId = new Map<string, PaperRecord>();
    for (const c of customItems) {
      byId.set(c.id, c);
    }
    for (const s of sheetItems) {
      if (!byId.has(s.id)) {
        byId.set(s.id, s);
      }
    }
    return Array.from(byId.values());
  }

  async function fetchSheetData(customOverride?: PaperRecord[]) {
    setSyncStatus('syncing');
    let localCustom = customOverride || customAttachedPapers;
    try {
      const serverRes = await fetch('/api/attached-resources');
      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (Array.isArray(sData.resources) && sData.resources.length > 0) {
          const mergedCustomMap = new Map<string, PaperRecord>();
          for (const item of localCustom) mergedCustomMap.set(item.id, item);
          for (const item of sData.resources) mergedCustomMap.set(item.id, item);
          localCustom = Array.from(mergedCustomMap.values());
          setCustomAttachedPapers(localCustom);
          localStorage.setItem('elimika_custom_attached_resources_v1', JSON.stringify(localCustom));
        }
      }
    } catch {
      // ignore server attached fetch error
    }

    try {
      const cached = localStorage.getItem('elimika_papers_cache_v3');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          setAllPapers(mergePapersWithAttached(parsedCache, localCustom));
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
      localStorage.setItem('elimika_papers_cache_v3', JSON.stringify(processed));
      setAllPapers(mergePapersWithAttached(processed, localCustom));
      setSyncStatus('live');
    } catch {
      setSyncStatus('error');
    }
  }

  async function handleSaveNewAttachedResource(e: React.FormEvent) {
    e.preventDefault();
    const title = newResTitle.trim() || `${newResClass} ${newResSubject} — ${newResCategory} (${newResYear})`;
    const catLower = `${newResCategory} ${title}`.toLowerCase();
    const isSyllabus = catLower.includes('syllabus') || catLower.includes('muhtasari');
    const isBook =
      !isSyllabus &&
      (catLower.includes('book') || catLower.includes('kitabu') || catLower.includes('textbook') || catLower.includes('tie'));

    const id = `attached-${Date.now()}`;
    const created: PaperRecord = {
      id,
      title,
      form: newResClass,
      subject: newResSubject,
      year: newResYear.trim() || '2026',
      category: isSyllabus ? 'TIE Syllabus' : isBook ? 'TIE Book' : newResCategory,
      paperUrl: sanitizeUrl(newResPaperUrl),
      answersUrl: sanitizeUrl(newResAnswersUrl),
      isBook,
      isSyllabus,
      customContent: newResCustomContent.trim(),
      attachedFileMimeType: newResAttachedFile?.mimeType,
      attachedFileName: newResAttachedFile?.fileName,
      isUserAttached: true,
    };

    const nextCustom = [created, ...customAttachedPapers];
    setCustomAttachedPapers(nextCustom);
    try {
      localStorage.setItem('elimika_custom_attached_resources_v1', JSON.stringify(nextCustom));
    } catch {
      // ignore
    }

    setAllPapers((prev) => [created, ...prev]);
    setMohaActiveClass(newResClass);
    setMohaActiveSubject(newResSubject);
    setMohaFocusedResourceId(id);

    try {
      await fetch('/api/attached-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...created,
          attachedFileBase64: newResAttachedFile?.base64Data,
        }),
      });
    } catch {
      // ignore
    }

    setAttachModalOpen(false);
    setNewResTitle('');
    setNewResPaperUrl('');
    setNewResAnswersUrl('');
    setNewResCustomContent('');
    setNewResAttachedFile(null);
    showToast(`📚 Attached "${title}" and pinned it to Moha AI!`);
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

  function openDailyQuizPage(
    customClass?: string,
    customSubject?: string,
    customTopic?: string,
    customSubTopic?: string,
    customSource?: 'ALL' | 'textbook' | 'past_paper'
  ) {
    const cls = customClass || selectedClass || savedClass || mohaActiveClass || 'Form 4';
    const sub =
      customSubject ||
      selectedSubject ||
      mohaActiveSubject ||
      (TIE_CURRICULUM_SUBJECTS[cls]?.[0] ?? 'Basic Mathematics');
    const topics = getSyllabusTopicsForClassSubject(cls, sub);
    const firstTopic = customTopic || (topics[0] ? topics[0].replace(/^\d+\.\d+\s*/, '') : 'ALL');
    const subTopics = getSubTopicsForMainTopic(sub, firstTopic);
    const firstSubTopic = customSubTopic || subTopics[0] || 'ALL';
    const src = customSource || selectedQuizSourceFilter || 'ALL';

    setActivePage('daily_quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startAiQuiz(cls, sub, firstTopic, firstSubTopic, src, true);
  }

  function openMasteryPlannerPage(customClass?: string, customSubject?: string) {
    if (customClass) setMohaActiveClass(customClass);
    if (customSubject) setMohaActiveSubject(customSubject);
    setActivePage('mastery_planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openVirtualLabPage(customClass?: string) {
    if (customClass) setMohaActiveClass(customClass);
    setActivePage('virtual_lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogManualTopicPractice(cls: string, subject: string, topic: string, scoreOutOf20: number) {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: QuizHistoryRecord = {
      id: `manual-${Date.now()}`,
      cls,
      subject,
      topic,
      score: Math.max(0, Math.min(20, scoreOutOf20)),
      total: 20,
      timestamp: today,
    };
    const updatedHistory = [newRecord, ...quizHistory].slice(0, 200);
    setQuizHistory(updatedHistory);
    try {
      localStorage.setItem('elimika_quiz_history_v1', JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }
    showToast(`✅ Recorded ${scoreOutOf20}/20 for ${cls} ${subject} (${topic}) in Mastery Heatmap!`);
  }

  useEffect(() => {
    function handleDocumentMouseDown(e: MouseEvent) {
      if (
        searchBoxContainerRef.current &&
        !searchBoxContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, []);

  function saveRecentSearchQuery(rawQuery: string) {
    const clean = rawQuery.trim();
    if (clean.length < 2) return;
    setRecentSearchQueries((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('recentSearchQueries', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }

  function removeRecentSearchQuery(queryToRemove: string) {
    setRecentSearchQueries((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem('recentSearchQueries', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }

  function clearRecentSearchQueries() {
    setRecentSearchQueries([]);
    try {
      localStorage.removeItem('recentSearchQueries');
    } catch {
      // ignore storage errors
    }
  }

  function handleSmartSearchChange(val: string, saveImmediately = false) {
    setSearchQuery(val);
    setPage(1);
    if (searchSaveTimerRef.current) {
      window.clearTimeout(searchSaveTimerRef.current);
      searchSaveTimerRef.current = null;
    }
    if (val.trim().length > 0) {
      setActivePage('papers');
      setStep(3);
      if (saveImmediately) {
        saveRecentSearchQuery(val);
      } else if (val.trim().length >= 2) {
        searchSaveTimerRef.current = window.setTimeout(() => {
          saveRecentSearchQuery(val);
        }, 900);
      }
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
        handleSmartSearchChange(transcript, true);
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
    initialView: 'chat' | 'studio' | 'quiz' | 'diagram' | 'profile' = 'chat',
    focusedDoc?: PaperRecord
  ) {
    const targetCls = focusedDoc?.form || cls || selectedClass || 'Form 3';
    const targetSub = focusedDoc?.subject || sub || selectedSubject || 'Basic Mathematics';
    setMohaActiveClass(targetCls);
    setMohaActiveSubject(targetSub);
    setTsClass(targetCls);
    setTsSubject(targetSub);
    setMohaViewMode(initialView);
    setFlashcards(getDefaultFlashcardsForSubject(targetCls, targetSub));
    setActiveFlashcardIdx(0);
    setFlashcardFlipped(false);

    if (focusedDoc) {
      setMohaFocusedResourceId(focusedDoc.id);
    }

    const defaultTopics = getSyllabusTopicsForClassSubject(targetCls, targetSub);
    if (!tsTopic && defaultTopics.length > 0) {
      setTsTopic(defaultTopics[0].replace(/^\d+\.\d+\s*/, ''));
    }

    setMohaMessages((prev) => {
      if (focusedDoc) {
        return [
          ...prev,
          {
            id: `msg-pin-${Date.now()}`,
            role: 'ai',
            text: `📌 **${focusedDoc.title}** (${focusedDoc.form} ${focusedDoc.subject}) selected.`,
          },
        ];
      }
      if (prev.length > 0) return prev;
      return [
        {
          id: 'msg-welcome',
          role: 'ai',
          text: `Ready for **${targetCls} • ${targetSub}**. Select a book/chapter above or ask your question below.`,
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
      const res = await fetchElimikaApi('/api/moha/flashcards', {
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

  function deleteMohaLearnedItem(topicToDelete: string) {
    const updated = learnedMemory.filter(
      (x) => x.topic.toLowerCase() !== topicToDelete.trim().toLowerCase()
    );
    setLearnedMemory(updated);
    try {
      localStorage.setItem('elimika_moha_learned_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast(`Removed "${topicToDelete}" from Moha AI memory.`);
  }

  function handleSaveLearnedFromForm() {
    if (!learnTopicInput.trim() || !learnAnswerInput.trim()) {
      showToast('Please enter both a Topic/Question and Custom Notes.');
      return;
    }
    const t = learnTopicInput.trim();
    const a = learnAnswerInput.trim();
    saveMohaLearnedItem(t, a);
    setLearnTopicInput('');
    setLearnAnswerInput('');
    setMohaLearnPanelOpen(false);
    setMohaViewMode('chat');
    showToast(`🧠 Moha AI permanently learned "${t}" in localStorage!`);
    setMohaMessages((prev) => [
      ...prev,
      {
        id: `ai-learn-${Date.now()}`,
        role: 'ai',
        text: `🧠 **New Knowledge Saved to Permanent Memory!**\n• **Class & Subject:** ${mohaActiveClass} — ${mohaActiveSubject}\n• **Topic / Trigger:** ${t}\n• **Custom Notes:** ${a}\n\n*(Stored permanently in your browser's localStorage — ask me about "${t}" anytime!)*`,
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
        text: `${docLabels[type]}: ${meta.topic}`,
      },
      {
        id: loadingMsgId,
        role: 'ai',
        loading: true,
        text: `Generating ${docLabels[type]}...`,
      },
    ]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetchElimikaApi('/api/moha/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, meta }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.html) {
          setStudioPreviewHtml(data.html);
          setMohaMessages((prev) =>
            prev.map((m) =>
              m.id === loadingMsgId
                ? {
                    id: `ai-doc-${Date.now()}`,
                    role: 'ai',
                    text: data.html,
                  }
                : m
            )
          );
          setGeneratingDocType(null);
          showToast(`✅ Generated ${docLabels[type]}!`);
          return;
        }
      }
    } catch {
      // Instant local fallback below
    }

    const instantHtml = buildInstantOfficialDocument(type, meta);
    setStudioPreviewHtml(instantHtml);
    setMohaMessages((prev) =>
      prev.map((m) =>
        m.id === loadingMsgId
          ? {
              id: `ai-doc-${Date.now()}`,
              role: 'ai',
              text: instantHtml,
            }
          : m
      )
    );
    setGeneratingDocType(null);
    showToast(`✅ Generated ${docLabels[type]}!`);
  }

  async function sendMwalimuMessage(
    overridePrompt?: string,
    explicitFocusedDoc?: PaperRecord | null
  ) {
    const rawText = overridePrompt !== undefined ? overridePrompt : mohaInput;
    const userText = rawText.trim();
    const attachedImg = mohaPendingImage;

    if (!userText && !attachedImg) return;

    setMohaViewMode('chat');
    setMohaInput('');
    setMohaPendingImage(null);

    if (explicitFocusedDoc) {
      setMohaFocusedResourceId(explicitFocusedDoc.id);
      if (explicitFocusedDoc.form) {
        setMohaActiveClass(explicitFocusedDoc.form);
        setTsClass(explicitFocusedDoc.form);
      }
      if (explicitFocusedDoc.subject) {
        setMohaActiveSubject(explicitFocusedDoc.subject);
        setTsSubject(explicitFocusedDoc.subject);
      }
    }

    const activeFocusedDoc = explicitFocusedDoc || mohaFocusedResource;

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

    const displayPrompt = userText || 'Solve this question step-by-step.';
    const loadingId = `load-${Date.now()}`;

    // Parse any specific Class, Subject, and Topic requested in the user's message
    const baseDefaultCls = activeFocusedDoc?.form || mohaActiveClass;
    const baseDefaultSub = activeFocusedDoc?.subject || mohaActiveSubject;
    const parsedTarget = parseClassSubjectTopicFromPrompt(
      displayPrompt,
      baseDefaultCls,
      baseDefaultSub
    );
    const targetCls = explicitFocusedDoc?.form || parsedTarget.cls;
    const targetSub = explicitFocusedDoc?.subject || parsedTarget.subject;
    const targetTopic = parsedTarget.topic;
    const targetSubTopic = parsedTarget.subTopic;

    if (parsedTarget.matchedFromPrompt && !explicitFocusedDoc) {
      setMohaActiveClass(targetCls);
      setMohaActiveSubject(targetSub);
      setTsClass(targetCls);
      setTsSubject(targetSub);
      setSelectedQuizTopic(targetTopic);
      setSelectedQuizSubTopic(targetSubTopic);
    }

    // Build integrated website Books, Syllabuses & Past Papers specifically for targetCls & targetSub
    const promptSiteResources = buildSiteResourcesForClassSubject(
      targetCls,
      targetSub,
      !explicitFocusedDoc && parsedTarget.matchedFromPrompt,
      activeFocusedDoc
    );

    const pinnedSource =
      explicitFocusedDoc ||
      (activeFocusedDoc &&
      mohaFocusedResourceId !== 'ALL' &&
      (!parsedTarget.matchedFromPrompt ||
        (matchesFormRange(activeFocusedDoc.form, targetCls) &&
          matchesSubjectQuery(activeFocusedDoc.subject, targetSub)))
        ? activeFocusedDoc
        : null);

    const isPinnedPastPaper = Boolean(
      pinnedSource &&
        !pinnedSource.isBook &&
        !pinnedSource.isSyllabus &&
        !/\b(book|kitabu|textbook|syllabus|muhtasari)\b/i.test(
          `${pinnedSource.category} ${pinnedSource.title}`
        )
    );

    const askedForChaptersOrSyllabus =
      /\b(chapters|table of contents|syllabus|topics in|show me the official tie textbook chapters)\b/i.test(
        displayPrompt
      );

    const tbReadingContext = getTieTextbookChapterContent(
      targetCls,
      targetSub,
      displayPrompt,
      promptSiteResources
    );
    const chaptersListForContext = getSyllabusTopicsForClassSubject(targetCls, targetSub);

    const systemPromptContext = isPinnedPastPaper && pinnedSource
      ? [
          `PINNED PAST EXAMINATION PAPER DIRECTIVE:
- Paper Title: "${pinnedSource.title}"
- Category: ${pinnedSource.category} | Class: ${pinnedSource.form} | Subject: ${pinnedSource.subject} | Year: ${pinnedSource.year}
- Document URL: ${pinnedSource.paperUrl || 'Attached in Elimika Catalog'}${
            pinnedSource.customContent
              ? `\n- Extracted Paper Text:\n${pinnedSource.customContent}`
              : ''
          }
- CRITICAL INSTRUCTION: Solve and explain the exact questions asked by the user from "${pinnedSource.title}" step-by-step.`,
        ].join('\n\n')
      : [
          `DIRECT QUESTION-ANSWERING DIRECTIVE:
1. Answer the user's EXACT question directly, accurately, and step-by-step.
2. NEVER ignore the user's prompt to output a generic textbook chapter list or unrelated topic summary.
3. Do NOT include any "Figure 1.1" diagram unless the user explicitly asks to draw or sketch a diagram.`,
          pinnedSource && pinnedSource.customContent
            ? `PINNED RESOURCE CONTENT ("${pinnedSource.title}"):\n${pinnedSource.customContent}`
            : '',
          askedForChaptersOrSyllabus
            ? `OFFICIAL TIE TEXTBOOK CHAPTERS (${targetCls} ${targetSub}):\n${chaptersListForContext
                .map((c, idx) => `${idx + 1}. ${c}`)
                .join('\n')}\n\n${tbReadingContext.chapterSummaryMarkdown}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n');

    // If user asked for a quiz/questions in chat, pre-load the interactive Quiz items for this exact Class, Subject & Topic
    if (/\b(quiz|questions|maswali|test me|exercise|practice)\b/i.test(displayPrompt)) {
      const topicItems = buildContentIntegratedQuizQuestions(
        targetCls,
        targetSub,
        targetTopic,
        promptSiteResources,
        targetSubTopic,
        selectedQuizSourceFilter
      );
      setQuizItems(topicItems);
      setQuizSelectedAnswers({});
      setQuizResultSaved(false);
    }

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
        text: isPinnedPastPaper ? `Reading & solving ${pinnedSource?.title}...` : 'Thinking...',
      },
    ]);

    // Check if conversational greeting or custom learned memory can be answered immediately without delay
    const strippedLower = displayPrompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const isQuickConversational =
      !attachedImg &&
      /^(hi|hello|hey|hii|helo|greetings|good\s+(morning|afternoon|evening|day)|hi\s+moha|hello\s+moha|hey\s+moha|how\s+are\s+you|how\s+are\s+you\s+doing|how\s+is\s+it\s+going|who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|help|how\s+to\s+use|thank\s+you|thanks|thx|ok|okay|got\s+it|nice|great|awesome|cool)$/i.test(
        strippedLower
      );

    if (isQuickConversational) {
      const quickReply = generateLocalSmartTutorReply(
        displayPrompt,
        targetCls,
        targetSub,
        learnedMemory,
        promptSiteResources
      );
      setMohaMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                id: `ai-${Date.now()}`,
                role: 'ai',
                text: quickReply,
              }
            : m
        )
      );
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);
      const response = await fetchElimikaApi('/api/moha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: displayPrompt,
          cls: targetCls,
          subject: targetSub,
          image: attachedImg ? { mimeType: attachedImg.mimeType, base64Data: attachedImg.base64Data } : null,
          history: mohaMessages.slice(-6).map((m) => ({ id: m.id, role: m.role, text: m.text })),
          learnedMemory,
          siteResources: promptSiteResources,
          systemPromptContext,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.quizQuestions) && data.quizQuestions.length > 0) {
          setQuizItems(data.quizQuestions);
        }
        if (Array.isArray(data.extractedBookChapters) && data.extractedBookChapters.length > 0) {
          const mapKey = `${targetCls}__${targetSub}`;
          setExtractedBookChaptersMap((prev) => ({
            ...prev,
            [mapKey]: data.extractedBookChapters,
          }));
        }
        if (data.reply) {
          setMohaMessages((prev) =>
            prev.map((m) =>
              m.id === loadingId
                ? {
                    id: `ai-${Date.now()}`,
                    role: 'ai',
                    text: data.reply,
                    quizTarget: {
                      cls: targetCls,
                      subject: targetSub,
                      topic: targetTopic,
                      subTopic: targetSubTopic,
                    },
                  }
                : m
            )
          );
          return;
        }
      }
    } catch {
      // Instant fallback to local smart tutor below (never hangs or displays "Connection busy")
    }

    const localReply = generateLocalSmartTutorReply(
      displayPrompt,
      targetCls,
      targetSub,
      learnedMemory,
      promptSiteResources
    );
    setMohaMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? {
              id: `ai-${Date.now()}`,
              role: 'ai',
              text: localReply,
              quizTarget: {
                cls: targetCls,
                subject: targetSub,
                topic: targetTopic,
                subTopic: targetSubTopic,
              },
            }
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
        `Show me the official TIE Textbook chapters, Syllabus topics, competences, and integrated website resources for ${mohaActiveClass} ${mohaActiveSubject}.`
      );
    } else if (kind === 'summary') {
      sendMwalimuMessage(
        `Give me a comprehensive TIE Textbook revision summary, key definitions, and essential formulas for ${mohaActiveClass} ${mohaActiveSubject} based on the uploaded TIE Student's Book and syllabus.`
      );
    } else {
      sendMwalimuMessage(
        `Give me 5 high-yield NECTA examination practice questions with complete step-by-step Marking Schemes for ${mohaActiveClass} ${mohaActiveSubject}.`
      );
    }
  }

  async function startAiQuiz(
    customClass?: string,
    customSubject?: string,
    customTopic?: string,
    customSubTopic?: string,
    customSourceFilter?: 'ALL' | 'textbook' | 'past_paper',
    stayOnDailyQuizPage?: boolean,
    explicitFocusedDoc?: PaperRecord | null
  ) {
    const activeDoc = explicitFocusedDoc || mohaFocusedResource;
    const targetCls = explicitFocusedDoc?.form || customClass || mohaActiveClass;
    const targetSub = explicitFocusedDoc?.subject || customSubject || mohaActiveSubject;
    const targetTopic = customTopic !== undefined ? customTopic : selectedQuizTopic;
    const targetSubTopic = customSubTopic !== undefined ? customSubTopic : selectedQuizSubTopic;
    const targetSourceFilter =
      customSourceFilter !== undefined ? customSourceFilter : selectedQuizSourceFilter;

    if (explicitFocusedDoc) {
      setMohaFocusedResourceId(explicitFocusedDoc.id);
    }
    if (targetCls) {
      setMohaActiveClass(targetCls);
      setTsClass(targetCls);
    }
    if (targetSub) {
      setMohaActiveSubject(targetSub);
      setTsSubject(targetSub);
    }
    if (customTopic !== undefined) setSelectedQuizTopic(customTopic);
    if (customSubTopic !== undefined) setSelectedQuizSubTopic(customSubTopic);
    if (customSourceFilter !== undefined) setSelectedQuizSourceFilter(customSourceFilter);

    if (stayOnDailyQuizPage || activePage === 'daily_quiz') {
      setActivePage('daily_quiz');
    } else {
      setActivePage('moha');
      setMohaOpen(true);
      setMohaViewMode('quiz');
    }
    setQuizLoading(true);
    setQuizSelectedAnswers({});
    setQuizResultSaved(false);
    setScoreSubmittedToChallenge(false);
    setQuizStartTime(Date.now());

    // Build site resources context for the target class and subject so the quiz integrates available website contents
    const quizSiteResources = buildSiteResourcesForClassSubject(
      targetCls,
      targetSub,
      false,
      activeDoc
    );

    try {
      const response = await fetchElimikaApi('/api/moha/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cls: targetCls,
          subject: targetSub,
          topic: targetTopic,
          subTopic: targetSubTopic,
          sourceFilter: targetSourceFilter,
          siteResources: quizSiteResources,
          count: 20,
          specificResourceTitle: activeDoc?.title,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const fallbackTwenty = buildContentIntegratedQuizQuestions(
            targetCls,
            targetSub,
            targetTopic,
            quizSiteResources,
            targetSubTopic,
            targetSourceFilter
          );
          const merged = [...data.questions];
          for (const fq of fallbackTwenty) {
            if (merged.length >= 20) break;
            if (!merged.some((q) => q.question === fq.question)) {
              merged.push(fq);
            }
          }
          setQuizItems(merged.slice(0, 20));
          setQuizLoading(false);
          return;
        }
      }
    } catch {
      // fallback below
    }

    setQuizItems(
      buildContentIntegratedQuizQuestions(
        targetCls,
        targetSub,
        targetTopic,
        quizSiteResources,
        targetSubTopic,
        targetSourceFilter
      )
    );
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
    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = () => {
        const textContent = String(textReader.result || '').slice(0, 6000);
        setMohaInput((prev) =>
          `${prev ? prev + '\n' : ''}[Attached Document "${file.name}"]:\n${textContent}`
        );
        showToast(`📄 Loaded text from "${file.name}" into Moha AI!`);
      };
      textReader.readAsText(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = String(reader.result);
      const base64Data = resultStr.split(',')[1];
      setMohaPendingImage({
        mimeType: file.type || 'application/pdf',
        base64Data,
        previewUrl: file.type.startsWith('image/') ? resultStr : '',
        fileName: file.name,
      });
      showToast(`📎 Attached "${file.name}" for Moha AI analysis!`);
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

  async function downloadMwalimuDocPdf(msgId: string, orientation: 'portrait' | 'landscape' = 'portrait') {
    const target = document.getElementById(`msg-body-${msgId}`);
    if (!target) return;
    showToast(`⏳ Downloading PDF...`);

    const cleanForPdfHeader = (raw: string): string => {
      return String(raw || '')
        .replace(/[^\x20-\x7E]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    try {
      const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - margin * 2;
      let y = margin;

      const paintWhitePageBackground = () => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageW, pageH, 'F');
      };

      // Always paint 100% pure white background (#ffffff) on the first page
      paintWhitePageBackground();

      const ensureSpace = (needed: number) => {
        if (y + needed > pageH - margin) {
          pdf.addPage();
          paintWhitePageBackground();
          y = margin;
        }
      };

      // Pure White Header with dark text and crisp bottom rule (never dark/black background)
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y, contentW, 13, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('ELIMIKA TANZANIA - MOHA AI', margin, y + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(51, 65, 85);
      const docSubtitle = cleanForPdfHeader(
        `${mohaActiveClass} | ${mohaActiveSubject}${mohaFocusedResource ? ` | ${mohaFocusedResource.title}` : ''}`
      );
      pdf.text(docSubtitle.slice(0, 95), margin, y + 10);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.35);
      pdf.line(margin, y + 12.5, margin + contentW, y + 12.5);
      y += 16;

      // 1. Render any HTML tables inside target with pure white cell backgrounds and MathJax cell rendering
      const tables = Array.from(target.querySelectorAll('table'));
      for (const tbl of tables) {
        const rows = Array.from(tbl.querySelectorAll('tr'));
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const cells = Array.from(rows[rIdx].querySelectorAll('th, td'));
          if (cells.length === 0) continue;
          const isHeader = rows[rIdx].querySelector('th') !== null || rIdx === 0;
          const colW = contentW / cells.length;

          const cellRenderList = cells.map((cell) => {
            const rawCellTxt = ((cell as HTMLElement).innerText || cell.textContent || '-').trim();
            return renderRichMathParagraphToPng(rawCellTxt || '-', Math.max(12, colW - 3), isHeader);
          });

          const maxCellH = Math.max(
            6,
            ...cellRenderList.map((cr) => (cr ? cr.heightMm + 3 : 6))
          );
          ensureSpace(maxCellH + 2);

          for (let cIdx = 0; cIdx < cells.length; cIdx++) {
            const x = margin + cIdx * colW;
            // Pure white background for all table cells
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(148, 163, 184);
            pdf.setLineWidth(isHeader ? 0.35 : 0.25);
            pdf.rect(x, y, colW, maxCellH, 'FD');

            const cellImg = cellRenderList[cIdx];
            if (cellImg) {
              pdf.addImage(
                cellImg.dataUrl,
                'PNG',
                x + 1.5,
                y + 1.5,
                cellImg.widthMm,
                cellImg.heightMm
              );
            }
          }
          y += maxCellH;
        }
        y += 4;
      }

      // 2. Render text and MathJax mathematical expressions onto pure white background blocks
      const matchedMsg = mohaMessages.find((m) => m.id === msgId);
      const clone = target.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('table, svg, style, script').forEach((el) => el.remove());

      const rawSource =
        tables.length === 0 && matchedMsg && !matchedMsg.text.includes('<table')
          ? matchedMsg.text
              .replace(/<!--DIAGRAM_START-->[\s\S]*?<!--DIAGRAM_END-->/g, '')
              .replace(/<svg[\s\S]*?<\/svg>/gi, '')
              .replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => `\n$$${String(inner).replace(/\r?\n/g, ' ').trim()}$$\n`)
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
              .replace(/<[^>]+>/g, '')
          : clone.innerText || clone.textContent || '';

      const paragraphs = rawSource.split(/\r?\n/);
      for (const rawLine of paragraphs) {
        const trimmedRaw = rawLine.trim();
        if (!trimmedRaw) {
          y += 1.5;
          continue;
        }
        const isHeading =
          /^(\*\*|#{1,4}\s|[0-9]+\.\s|Section\s+[A-Z]|Final\s+Answer|Step\s+[0-9])/i.test(trimmedRaw);

        const mathBlockPng = renderRichMathParagraphToPng(trimmedRaw, contentW, isHeading);
        if (mathBlockPng) {
          ensureSpace(mathBlockPng.heightMm + 2);
          pdf.addImage(
            mathBlockPng.dataUrl,
            'PNG',
            margin,
            y,
            mathBlockPng.widthMm,
            mathBlockPng.heightMm
          );
          y += mathBlockPng.heightMm + (isHeading ? 1.8 : 1.0);
        }
      }

      // 3. Render any SVG diagrams inside target onto a pure white (#ffffff) offscreen canvas and embed into PDF
      const svgs = Array.from(target.querySelectorAll('svg'));
      for (const svgEl of svgs) {
        try {
          const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
          if (!svgClone.getAttribute('xmlns')) {
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          }
          svgClone.style.background = '#ffffff';
          const viewBox = svgClone.getAttribute('viewBox')?.split(/\s+/).map(Number);
          const svgW = (viewBox && viewBox[2]) || svgEl.clientWidth || 640;
          const svgH = (viewBox && viewBox[3]) || svgEl.clientHeight || 245;
          svgClone.setAttribute('width', String(svgW));
          svgClone.setAttribute('height', String(svgH));

          const svgXml = new XMLSerializer().serializeToString(svgClone);
          const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`;

          const pngUrl = await new Promise<string | null>((resolve) => {
            const img = new Image();
            const timer = window.setTimeout(() => resolve(null), 1500);
            img.onload = () => {
              window.clearTimeout(timer);
              try {
                const canvas = document.createElement('canvas');
                canvas.width = svgW * 2;
                canvas.height = svgH * 2;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  resolve(null);
                  return;
                }
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0, svgW, svgH);
                resolve(canvas.toDataURL('image/png'));
              } catch {
                resolve(null);
              }
            };
            img.onerror = () => {
              window.clearTimeout(timer);
              resolve(null);
            };
            img.src = svgDataUrl;
          });

          if (pngUrl) {
            const pdfImgW = Math.min(contentW, 170);
            const pdfImgH = Math.round((pdfImgW * svgH) / Math.max(1, svgW));
            ensureSpace(pdfImgH + 6);
            y += 2;
            pdf.addImage(pngUrl, 'PNG', margin, y, pdfImgW, pdfImgH);
            y += pdfImgH + 4;
          }
        } catch {
          // ignore individual SVG error
        }
      }

      // 4. Add a faint, centered 'elimika.online' watermark across every page of the generated PDF
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        try {
          pdf.saveGraphicsState();
          const gStateCtor = (
            pdf as unknown as { GState?: new (opts: { opacity: number }) => unknown }
          ).GState;
          if (gStateCtor) {
            pdf.setGState(new gStateCtor({ opacity: 0.14 }) as never);
            pdf.setTextColor(100, 116, 139);
          } else {
            pdf.setTextColor(226, 232, 240);
          }
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(42);
          pdf.text('elimika.online', pageW / 2, pageH / 2, {
            align: 'center',
            angle: 35,
          });
          pdf.restoreGraphicsState();
        } catch {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(42);
          pdf.setTextColor(226, 232, 240);
          pdf.text('elimika.online', pageW / 2, pageH / 2, {
            align: 'center',
            angle: 35,
          });
        }
      }

      const filename = `${mohaActiveClass}_${mohaActiveSubject}_Moha_AI.pdf`.replace(/[^a-zA-Z0-9_.-]+/g, '_');
      pdf.save(filename);
      showToast(`✅ Downloaded ${filename}`);
    } catch {
      showToast('Unable to generate PDF right now.');
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
      baseMatches = allPapers.filter((p) => {
        if (p.isSyllabus || p.isBook) return false;
        return `${p.title} ${p.subject} ${p.form} ${p.year} ${p.category}`.toLowerCase().includes(q);
      });
    } else {
      baseMatches = allPapers.filter((p) => {
        if (p.isSyllabus || p.isBook) return false;
        const matchClass = p.form.toLowerCase() === selectedClass.toLowerCase();
        const matchSub = p.subject.toLowerCase() === selectedSubject.toLowerCase();
        return matchClass && matchSub;
      });
    }

    const dataYears = baseMatches.map((p) => p.year).filter((y) => y && y !== 'N/A');
    const standardYears = ['2026', '2025', '2024', '2023', '2022'];
    const years = Array.from(new Set([...dataYears, ...standardYears])).sort((a, b) =>
      b.localeCompare(a)
    );

    const matches = baseMatches.filter((p) => {
      const matchYr = selectedYear === 'ALL' || p.year === selectedYear;
      const matchCat =
        selectedCategory === 'ALL' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Annual' && /annual|terminal/i.test(p.category)) ||
        (selectedCategory === 'Midterm' && /mid[- ]?term/i.test(`${p.category} ${p.title}`));
      return matchYr && matchCat;
    });
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

  // Automatically extract real chapters from any attached TIE Textbook PDF when Class/Subject/Book changes
  useEffect(() => {
    const targetCls = mohaViewMode === 'studio' ? tsClass || mohaActiveClass : mohaActiveClass || tsClass;
    const targetSub = mohaViewMode === 'studio' ? tsSubject || mohaActiveSubject : mohaActiveSubject || tsSubject;
    const mapKey = `${targetCls}__${targetSub}`;
    if (extractedBookChaptersMap[mapKey]?.length) return;

    const focused = activeSiteResources.focusedResource;
    const bookWithPdf =
      (focused && focused.isBook && focused.paperUrl ? focused : null) ||
      activeSiteResources.books.find((b) => b.paperUrl) ||
      null;

    if (!bookWithPdf?.paperUrl) return;

    let cancelled = false;
    fetch('/api/moha/extract-book-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperUrl: bookWithPdf.paperUrl,
        cls: targetCls,
        subject: targetSub,
        customContent: bookWithPdf.customContent || '',
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.chapters) && data.chapters.length > 0 && data.extractedCount > 0) {
          setExtractedBookChaptersMap((prev) => ({
            ...prev,
            [mapKey]: data.chapters,
          }));
        }
      })
      .catch(() => {
        // ignore background extraction error
      });

    return () => {
      cancelled = true;
    };
  }, [mohaViewMode, tsClass, mohaActiveClass, tsSubject, mohaActiveSubject, activeSiteResources, extractedBookChaptersMap]);

  const activeSyllabusTopics = React.useMemo(() => {
    const targetCls = mohaViewMode === 'studio' ? tsClass || mohaActiveClass : mohaActiveClass || tsClass;
    const targetSub = mohaViewMode === 'studio' ? tsSubject || mohaActiveSubject : mohaActiveSubject || tsSubject;
    const baseTopics = getSyllabusTopicsForClassSubject(targetCls, targetSub);
    const mapKey = `${targetCls}__${targetSub}`;

    // If chapters were extracted from the attached PDF textbook for this class/subject, prioritize them
    if (extractedBookChaptersMap[mapKey]?.length) {
      return extractedBookChaptersMap[mapKey];
    }

    // If the pinned or attached book has explicit chapters/topics in customContent, extract and prioritize them
    const focused = activeSiteResources.focusedResource;
    const rawCustom = focused?.customContent || activeSiteResources.books[0]?.customContent || '';
    if (rawCustom) {
      const extractedChapters = extractTextbookChaptersFromText(rawCustom);
      if (extractedChapters.length > 0) {
        const combined = [...extractedChapters];
        for (const bt of baseTopics) {
          if (!combined.some((c) => c.toLowerCase() === bt.toLowerCase())) {
            combined.push(bt);
          }
        }
        return combined;
      }
    }
    return baseTopics;
  }, [mohaViewMode, tsClass, mohaActiveClass, tsSubject, mohaActiveSubject, activeSiteResources, extractedBookChaptersMap]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      {/* TOP BAR CONTRACT: 3 Zones (Brand, Nav Links, Primary Action) — hidden in full-viewport Moha AI & Game modes */}
      {activePage !== 'moha' && activePage !== 'game' && (
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
              📚 TIE Books
            </button>
            <button
              onClick={() => openSyllabusPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'syllabus' ? 'text-amber-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              📜 Syllabus
            </button>
            <button
              onClick={() => openDailyQuizPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                activePage === 'daily_quiz' ? 'text-violet-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>🎯 Daily Solving Quiz</span>
            </button>
            <button
              onClick={() => openMasteryPlannerPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                activePage === 'mastery_planner' ? 'text-indigo-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>📊 Mastery Heatmap</span>
            </button>
            <button
              onClick={() => openVirtualLabPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                activePage === 'virtual_lab' ? 'text-teal-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>🧪 Virtual Practicals</span>
            </button>
            <button
              onClick={() => {
                setPlayRoute('hub');
                setActivePage('game');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                (activePage as string) === 'game' ? 'text-emerald-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>🎮 Elimika Play</span>
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
              onClick={() => setWhatsappModalOpen(true)}
              className="px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              title="Join or Manage Elimika WhatsApp Channel & Community"
            >
              <span>💬 WhatsApp</span>
            </button>

            <button
              onClick={() => openMwalimuModal()}
              className="px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Moha AI Site</span>
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </header>
      )}

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
          <section className="pt-5 pb-6 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
              <div className="text-xs font-bold text-blue-700 tracking-wide">
                Tanzania National Examinations (NECTA) &amp; TIE Curriculum · Standard 1–7 &amp; Form 1–6
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                Select Class &amp; Subject for{' '}
                <span className="text-blue-600">Past Papers, TIE Books &amp; Syllabus</span>
              </h1>

              {/* Smart Search + Voice Search + Recent Search Queries Dropdown */}
              <div ref={searchBoxContainerRef} className="relative max-w-2xl mx-auto">
                <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-300 px-3.5 py-2.5 focus-within:border-blue-600 transition-colors">
                  <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onClick={() => setShowSearchSuggestions(true)}
                    onChange={(e) => {
                      handleSmartSearchChange(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                        saveRecentSearchQuery(searchQuery);
                        setShowSearchSuggestions(false);
                      } else if (e.key === 'Escape') {
                        setShowSearchSuggestions(false);
                      }
                    }}
                    placeholder="Search directly (e.g. Form 4 Math 2024, Form 2 Physics Book)..."
                    className="w-full text-sm sm:text-base font-medium bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery.trim().length > 0 && (
                    <button
                      onClick={() => {
                        handleSmartSearchChange('');
                        setShowSearchSuggestions(true);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1.5 mr-1 cursor-pointer"
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

                {showSearchSuggestions && recentSearchQueries.length > 0 && (() => {
                  const qLower = searchQuery.trim().toLowerCase();
                  const matchingQueries = qLower
                    ? recentSearchQueries.filter((item) => item.toLowerCase().includes(qLower))
                    : recentSearchQueries;
                  const displayList = matchingQueries.length > 0 ? matchingQueries : recentSearchQueries;

                  return (
                    <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-left">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentSearchQueries();
                            setShowSearchSuggestions(false);
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {displayList.map((term) => (
                          <div
                            key={term}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/70 transition-colors group"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleSmartSearchChange(term, true);
                                setShowSearchSuggestions(false);
                              }}
                              className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-blue-700 truncate">
                                {term}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearchQuery(term);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                              title="Remove from recent searches"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Clean Segmented Primary Resource Switcher */}
              <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-200/75 rounded-2xl border border-slate-300/70">
                <button
                  onClick={() => setActivePage('papers')}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 text-white shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Past Papers</span>
                </button>
                <button
                  onClick={() => openBooksPage()}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-emerald-50 text-slate-900 border border-slate-200/80 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>📚 TIE Books</span>
                </button>
                <button
                  onClick={() => openSyllabusPage()}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-amber-50 text-slate-900 border border-slate-200/80 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>📜 Syllabus</span>
                </button>
                <button
                  onClick={() => openMwalimuModal()}
                  className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Moha AI Tutor &amp; Studio</span>
                </button>
              </div>
            </div>
          </section>

          <main className="flex-grow py-6 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              {/* Breadcrumbs + Step Back Bar */}
              <div className="flex items-center justify-between gap-2">
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

                {step > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              {/* Network Error Banner */}
              {syncStatus === 'error' && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
                  <h3 className="text-sm font-bold text-rose-900">Unable to Sync Google Sheet Data</h3>
                  <p className="text-xs text-rose-700">Please check your internet connection and click Retry.</p>
                  <button
                    onClick={() => fetchSheetData()}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Connection
                  </button>
                </div>
              )}

              {/* STEP 1: CHOOSE CLASS & PROFESSIONAL ACADEMIC HUB */}
              {step === 1 && (
                <section className="space-y-8">
                  {/* Quick Resume Bar if user previously selected a class */}
                  {savedClass && (
                    <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {savedClass.replace(/[^0-9]/g, '') || '★'}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                            Last Selected Class
                          </span>
                          <span className="text-sm sm:text-base font-bold text-emerald-950 truncate block">
                            Continue with {savedClass} Past Papers &amp; TIE Books
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => selectClass(savedClass)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open {savedClass} →
                      </button>
                    </div>
                  )}

                  {/* 1. PRIMARY FOCUS: CHOOSE YOUR CLASS LEVEL */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                          01. Select Your Class Level
                        </h2>
                        <p className="text-xs text-slate-500">
                          Choose a class to browse Past Papers, Marking Schemes, Official TIE Textbooks, and Syllabuses.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 tabular-nums">
                        13 Official Classes · TIE &amp; NECTA Aligned
                      </span>
                    </div>

                    {/* Secondary School (Form 1-6) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Secondary School (Ordinary &amp; Advanced Level · Form 1 – Form 6)</span>
                        <span className="text-slate-400">O-Level &amp; A-Level</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { cls: 'Form 1', sub: 'Ordinary Secondary · TIE Books' },
                          { cls: 'Form 2', sub: 'FTNA National Assessment' },
                          { cls: 'Form 3', sub: 'Ordinary Secondary · TIE Books' },
                          { cls: 'Form 4', sub: 'CSEE National Examination' },
                          { cls: 'Form 5', sub: 'Advanced Level · Combinations' },
                          { cls: 'Form 6', sub: 'ACSEE National Examination' },
                        ].map(({ cls, sub }) => {
                          const isExamYear = cls === 'Form 2' || cls === 'Form 4' || cls === 'Form 6';
                          return (
                            <button
                              key={cls}
                              onClick={() => selectClass(cls)}
                              className={`p-4 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                                isExamYear
                                  ? 'bg-blue-50/70 hover:bg-blue-100/80 border border-blue-300 text-slate-900'
                                  : 'bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 text-slate-900'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <span className="block text-base font-black text-slate-900 group-hover:text-blue-700">
                                  {cls}
                                </span>
                                <span className="block text-[11px] font-medium text-slate-500 truncate mt-0.5">
                                  {sub}
                                </span>
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                  isExamYear ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Primary School (Standard 1-7) */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Primary School (Standard 1 – Standard 7)</span>
                        <span className="text-slate-400">SFNA &amp; PSLE</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { cls: 'Standard 1', label: 'Standard 1', sub: 'Primary TIE' },
                          { cls: 'Standard 2', label: 'Standard 2', sub: 'Primary TIE' },
                          { cls: 'Standard 3', label: 'Standard 3', sub: 'Primary TIE' },
                          { cls: 'Standard 4', label: 'Standard 4 (SFNA)', sub: 'National Assessment' },
                          { cls: 'Standard 5', label: 'Standard 5', sub: 'Primary TIE' },
                          { cls: 'Standard 6', label: 'Standard 6', sub: 'Primary TIE' },
                          { cls: 'Standard 7', label: 'Standard 7 (PSLE)', sub: 'Primary Leaving Exam' },
                        ].map(({ cls, label, sub }) => {
                          const isStd4 = cls === 'Standard 4';
                          const isStd7 = cls === 'Standard 7';
                          return (
                            <button
                              key={cls}
                              onClick={() => selectClass(cls)}
                              className={`p-3.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group ${
                                isStd7
                                  ? 'col-span-2 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-300 text-slate-900'
                                  : isStd4
                                  ? 'bg-amber-50/70 hover:bg-amber-100/80 border border-amber-300 text-slate-900'
                                  : 'bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 text-slate-900'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <span className="block text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                                  {label}
                                </span>
                                <span className="block text-[11px] text-slate-500 truncate">{sub}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. PROFESSIONAL 2x2 ACADEMIC STUDY, AI COMPREHENSION & PRACTICALS HUB */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        02. Interactive Study, AI Textbook Tutor &amp; Science Labs
                      </h2>
                      <span className="text-xs font-medium text-slate-500">
                        TIE Textbooks · Past Papers · Paper 2 Practicals
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Card 1: Daily Solving Quiz */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white border border-slate-800 shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-amber-400 tracking-wide">
                            Daily Problem-Solving Quiz · 20 Questions
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white">
                            TIE Textbook &amp; Past Paper Workout Quiz
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Choose your Class, Subject, Main Topic, and Sub-Topic to solve step-by-step problems with NECTA Marking Schemes.
                          </p>
                          <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                            {[
                              { cls: 'Form 4', sub: 'Basic Mathematics', label: 'Mathematics' },
                              { cls: 'Form 4', sub: 'Physics', label: 'Physics' },
                              { cls: 'Form 4', sub: 'Chemistry', label: 'Chemistry' },
                              { cls: 'Form 4', sub: 'Biology', label: 'Biology' },
                              { cls: 'Form 4', sub: 'Geography', label: 'Geography' },
                            ].map((item) => (
                              <button
                                key={item.sub}
                                onClick={() => openDailyQuizPage(item.cls, item.sub)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] border border-white/15 cursor-pointer transition-colors"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => openDailyQuizPage()}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Open Daily Solving Quiz →</span>
                        </button>
                      </div>

                      {/* Card 2: Moha AI Textbook Reading Comprehension & Teacher Studio */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-violet-700 tracking-wide">
                            Moha AI Tutor &amp; Teacher Studio
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            TIE Textbook Reading Comprehension &amp; Q&amp;A
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Pin any uploaded TIE Textbook or Past Paper for direct reading comprehension, step-by-step question answering, Lesson Plans, Schemes of Work, and Lesson Notes.
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            <span>📌 Pin TIE Books</span>
                            <span aria-hidden="true">·</span>
                            <span>📐 MathJax Solutions</span>
                            <span aria-hidden="true">·</span>
                            <span>📋 PO-RALG Lesson Plans</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMwalimuModal()}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Ask Moha AI</span>
                          </button>
                          <button
                            onClick={() => openMwalimuModal(selectedClass || 'Form 4', 'Basic Mathematics', 'studio')}
                            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer shrink-0"
                          >
                            Teacher Studio
                          </button>
                        </div>
                      </div>

                      {/* Card 3: Virtual Science Practicals Lab (Paper 2) */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-teal-700 tracking-wide">
                            NECTA Paper 2 · Virtual Science Practicals
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            Physics, Chemistry &amp; Biology Lab Simulations
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Conduct interactive Volumetric Analysis (Titration), Qualitative Salt Analysis, Food Tests, Simple Pendulum, and Ohm&apos;s Law experiments.
                          </p>
                        </div>
                        <button
                          onClick={() => openVirtualLabPage()}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Launch Virtual Science Lab →</span>
                        </button>
                      </div>

                      {/* Card 4: Topic Mastery Heatmap & Elimika Play */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-indigo-700 tracking-wide">
                            Syllabus Mastery &amp; Educational Games
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            Mastery Heatmap, Revision Planner &amp; Elimika Play
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Track your competence mastery across every TIE chapter, generate a weak-topic timetable, or play NECTA Treasure Hunt &amp; STEM Arena.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMasteryPlannerPage()}
                            className="flex-1 py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer text-center"
                          >
                            Mastery Heatmap
                          </button>
                          <button
                            onClick={() => {
                              setPlayRoute('hub');
                              setActivePage('game');
                            }}
                            className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm cursor-pointer text-center"
                          >
                            🎮 Elimika Play
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. RECENTLY OPENED PAPERS */}
                  {recentPapers.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        03. Recently Opened Papers &amp; Books
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {recentPapers.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => openViewer(item.id, 'paper')}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                              <div className="text-[11px] font-medium text-slate-500">
                                {item.form} · {item.subject} · {item.year}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 shrink-0">Open →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* STEP 2: CHOOSE SUBJECT */}
              {step === 2 && (
                <section className="space-y-5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <button
                        onClick={handleGoBack}
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
                              {count} {count === 1 ? 'paper' : 'papers'} · Read, Download &amp; Solution
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
                        <button
                          onClick={handleGoBack}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />{' '}
                          {searchQuery.trim().length > 0 ? 'Back to Previous Page' : 'Back to Subjects'}
                        </button>
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
                      </div>
                    </div>

                    {/* 1. Select Year */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        1. Select Year
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['ALL', ...availableYears].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => {
                              setSelectedYear(yr);
                              setPage(1);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl tabular-nums whitespace-nowrap shrink-0 cursor-pointer ${
                              selectedYear === yr
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {yr === 'ALL' ? 'All Years' : yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Select Type of Paper (Annual, Mock, Midterm, NECTA, Pre-NECTA) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        2. Select Type of Paper (Annual, Mock, Midterm, NECTA or Pre-NECTA)
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {['ALL', 'Annual', 'Mock', 'Midterm', 'NECTA', 'Pre-NECTA'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setPage(1);
                            }}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              selectedCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {cat === 'ALL' ? 'All Types' : cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Results List */}
                  {paginatedPapers.length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                      <h4 className="font-bold text-slate-800">
                        No {selectedCategory !== 'ALL' ? selectedCategory : ''} papers found for{' '}
                        {selectedYear !== 'ALL' ? selectedYear : 'this selection'} yet.
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory('ALL');
                            setSelectedYear('ALL');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Show All Years &amp; Paper Types
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {paginatedPapers.map((p) => {
                        const hasAnswers = Boolean(p.answersUrl);
                        return (
                          <article
                            key={p.id}
                            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm transition-colors flex flex-col justify-between gap-3"
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

                            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
                              <button
                                onClick={() => openViewer(p.id, 'paper')}
                                className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read</span>
                              </button>
                              <button
                                onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                                className="flex-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                              {hasAnswers ? (
                                <button
                                  onClick={() =>
                                    triggerDirectDownloadUrl(p.answersUrl, `${p.title} - Solution.pdf`)
                                  }
                                  className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Solution</span>
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="flex-1 px-3.5 py-2 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap cursor-not-allowed"
                                >
                                  <span>Pending</span>
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
                    onClick={handleGoBack}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
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
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openViewer(p.id, 'paper')}
                        className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                      <button
                        onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                        className="flex-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
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
                    onClick={handleGoBack}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
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
              </div>
            </div>

            {dedicatedSyllabuses.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  Syllabuses Will Appear Here Once Uploaded to Your Google Sheet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add rows to your Google Sheet with Category set to <strong>TIE Syllabus</strong> and your Google Drive
                  link.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dedicatedSyllabuses.map((p) => {
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
                        <button
                          onClick={() => openViewer(p.id, 'paper')}
                          className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>
                        <button
                          onClick={() => triggerDirectDownloadUrl(p.paperUrl, `${p.title}.pdf`)}
                          className="flex-1 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
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

      {/* DEDICATED SEPARATE DAILY QUIZ PAGE (SUBJECT + TOPIC + SUB-TOPIC + TEXTBOOK/PAST PAPER SOLVING) */}
      {activePage === 'daily_quiz' && (() => {
        const totalQuestions = quizItems.length;
        const answeredCount = quizItems.reduce(
          (acc, _, idx) => acc + (quizSelectedAnswers[idx] !== undefined ? 1 : 0),
          0
        );
        const correctCount = quizItems.reduce(
          (acc, item, idx) => acc + (quizSelectedAnswers[idx] === item.correctIndex ? 1 : 0),
          0
        );
        const completionPercentage =
          totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
        const isQuizComplete = totalQuestions > 0 && answeredCount === totalQuestions;

        const allClassLevels = [
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
        const availableSubjectsForDaily =
          TIE_CURRICULUM_SUBJECTS[mohaActiveClass] || TIE_CURRICULUM_SUBJECTS['Form 4'] || ['Basic Mathematics'];
        const activeTopicForSubtopics =
          selectedQuizTopic && selectedQuizTopic !== 'ALL'
            ? selectedQuizTopic
            : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '') || 'Core Topic';
        const availableSubTopics = getSubTopicsForMainTopic(mohaActiveSubject, activeTopicForSubtopics);

        return (
          <motion.div
            key="view-daily-quiz"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-grow py-6 pb-24 bg-slate-50"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5">
              {/* Top Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-violet-950 via-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-sm">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                      🎯 Daily Solving Quiz
                    </span>
                    <span className="text-xs font-bold text-violet-200">
                      TIE Textbooks &amp; NECTA Past Papers
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Step-by-Step Problem Solving Quiz
                  </h1>
                  <p className="text-xs text-slate-200">
                    Choose your Class, Subject, Main Topic, Sub-Topic, and Question Source (TIE Textbook or NECTA Past Papers).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => openMwalimuModal(mohaActiveClass, mohaActiveSubject, 'quiz')}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    🏆 Leaderboard &amp; Friend Challenge
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>
              </div>

              {/* Sticky Progress Bar */}
              {totalQuestions > 0 && (
                <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-violet-200 shadow-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider text-[11px] ${
                          isQuizComplete
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-violet-100 text-violet-900 border border-violet-200'
                        }`}
                      >
                        {isQuizComplete ? '✅ Daily Quiz Completed' : '📊 Solving Progress'}
                      </span>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {answeredCount} of {totalQuestions} Problems Solved
                      </span>
                    </div>

                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="text-slate-600 font-semibold">
                        Correct:{' '}
                        <strong className="text-emerald-700">
                          {correctCount}/{totalQuestions}
                        </strong>
                      </span>
                      <span
                        className={`text-sm font-black ${
                          isQuizComplete ? 'text-emerald-700' : 'text-violet-700'
                        }`}
                      >
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isQuizComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-violet-600 to-blue-600'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Student Selection Card: Class -> Subject -> Topic -> Sub-Topic -> Question Source */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      1. Configure Your Solving Quiz (Subject · Topic · Sub-Topic · Source)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Every generated quiz question requires solving a real problem from the TIE Student&apos;s Book or NECTA Past Examination Papers.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      startAiQuiz(
                        mohaActiveClass,
                        mohaActiveSubject,
                        selectedQuizTopic,
                        selectedQuizSubTopic,
                        selectedQuizSourceFilter,
                        true
                      )
                    }
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                  >
                    🔄 Generate New Solving Set
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {/* 1. Class Level */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">1. Class Level</label>
                    <select
                      value={mohaActiveClass}
                      onChange={(e) => {
                        const nextCls = e.target.value;
                        const nextSubs = TIE_CURRICULUM_SUBJECTS[nextCls] || ['Basic Mathematics'];
                        const nextSub = nextSubs.includes(mohaActiveSubject) ? mohaActiveSubject : nextSubs[0];
                        const nextTopics = getSyllabusTopicsForClassSubject(nextCls, nextSub);
                        const firstTopic = nextTopics[0] ? nextTopics[0].replace(/^\d+\.\d+\s*/, '') : 'ALL';
                        const nextSubTopics = getSubTopicsForMainTopic(nextSub, firstTopic);
                        const firstSubTopic = nextSubTopics[0] || 'ALL';
                        startAiQuiz(
                          nextCls,
                          nextSub,
                          firstTopic,
                          firstSubTopic,
                          selectedQuizSourceFilter,
                          true
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                    >
                      {allClassLevels.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Subject */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. Subject</label>
                    <select
                      value={mohaActiveSubject}
                      onChange={(e) => {
                        const nextSub = e.target.value;
                        const nextTopics = getSyllabusTopicsForClassSubject(mohaActiveClass, nextSub);
                        const firstTopic = nextTopics[0] ? nextTopics[0].replace(/^\d+\.\d+\s*/, '') : 'ALL';
                        const nextSubTopics = getSubTopicsForMainTopic(nextSub, firstTopic);
                        const firstSubTopic = nextSubTopics[0] || 'ALL';
                        startAiQuiz(
                          mohaActiveClass,
                          nextSub,
                          firstTopic,
                          firstSubTopic,
                          selectedQuizSourceFilter,
                          true
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                    >
                      {availableSubjectsForDaily.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Main Topic */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">3. Main Topic</label>
                    <select
                      value={selectedQuizTopic}
                      onChange={(e) => {
                        const nextTopic = e.target.value;
                        const nextSubTopics = getSubTopicsForMainTopic(
                          mohaActiveSubject,
                          nextTopic === 'ALL' ? activeSyllabusTopics[0] || '' : nextTopic
                        );
                        const firstSubTopic = nextSubTopics[0] || 'ALL';
                        startAiQuiz(
                          mohaActiveClass,
                          mohaActiveSubject,
                          nextTopic,
                          firstSubTopic,
                          selectedQuizSourceFilter,
                          true
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                    >
                      <option value="ALL">All Syllabus Topics ({mohaActiveSubject})</option>
                      <optgroup label="📜 Official TIE Syllabus Topics">
                        {activeSyllabusTopics.map((t) => {
                          const cleanT = t.replace(/^\d+\.\d+\s*/, '');
                          return (
                            <option key={t} value={cleanT}>
                              {t}
                            </option>
                          );
                        })}
                      </optgroup>
                      {(activeSiteResources.books.length > 0 || activeSiteResources.papers.length > 0) && (
                        <optgroup label="📚 Website TIE Books & Past Papers">
                          {activeSiteResources.books.map((b, idx) => (
                            <option key={`dbook-${idx}`} value={b.title}>
                              📘 {b.title} ({b.form})
                            </option>
                          ))}
                          {activeSiteResources.papers.slice(0, 6).map((p, idx) => (
                            <option key={`dpaper-${idx}`} value={`${p.title} (${p.year})`}>
                              📄 {p.title} ({p.year})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* 4. Sub-Topic */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">4. Sub-Topic</label>
                    <select
                      value={selectedQuizSubTopic}
                      onChange={(e) => {
                        const nextSubT = e.target.value;
                        startAiQuiz(
                          mohaActiveClass,
                          mohaActiveSubject,
                          selectedQuizTopic,
                          nextSubT,
                          selectedQuizSourceFilter,
                          true
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                    >
                      <option value="ALL">All Sub-Topics</option>
                      {availableSubTopics.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Question Source (Textbook vs Past Papers) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">5. Question Source</label>
                    <select
                      value={selectedQuizSourceFilter}
                      onChange={(e) => {
                        const nextSrc = e.target.value as 'ALL' | 'textbook' | 'past_paper';
                        startAiQuiz(
                          mohaActiveClass,
                          mohaActiveSubject,
                          selectedQuizTopic,
                          selectedQuizSubTopic,
                          nextSrc,
                          true
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                    >
                      <option value="ALL">📚 Both (TIE Textbook + Past Papers)</option>
                      <option value="textbook">📘 TIE Textbook Exercises Only</option>
                      <option value="past_paper">📄 NECTA Past Papers Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Solving Questions List */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-700">
                      <span>{mohaActiveClass} · {mohaActiveSubject}</span>
                      <span>•</span>
                      <span>{selectedQuizTopic === 'ALL' ? 'All Topics' : selectedQuizTopic}</span>
                      {selectedQuizSubTopic !== 'ALL' && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700">{selectedQuizSubTopic}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">
                      Step-by-Step Solving Questions ({selectedQuizSourceFilter === 'textbook' ? 'TIE Textbook Exercises' : selectedQuizSourceFilter === 'past_paper' ? 'NECTA Past Papers' : 'TIE Textbook & NECTA Past Papers'})
                    </h3>
                  </div>

                  {totalQuestions > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black tabular-nums">
                      Score: {correctCount} / {totalQuestions} ({completionPercentage}% Solved)
                    </div>
                  )}
                </div>

                {quizLoading ? (
                  <div className="p-10 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-600">
                      Loading step-by-step solving questions for {mohaActiveClass} {mohaActiveSubject}...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quizItems.map((q, qIdx) => {
                      const selectedIdx = quizSelectedAnswers[qIdx];
                      const hasAnswered = selectedIdx !== undefined;
                      const isPastPaperSource = (q.sourceRef || '').toLowerCase().includes('necta') || (q.sourceRef || '').toLowerCase().includes('paper');
                      return (
                        <div
                          key={qIdx}
                          className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-black">
                                Problem {qIdx + 1} of {quizItems.length}
                              </span>
                              {q.sourceRef && (
                                <span
                                  className={`px-2.5 py-0.5 rounded-md font-bold border ${
                                    isPastPaperSource
                                      ? 'bg-blue-50 text-blue-900 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  }`}
                                >
                                  {isPastPaperSource ? '📄 ' : '📘 '}
                                  {q.sourceRef}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                              {q.topic && (
                                <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-900">
                                  Topic: {q.topic}
                                </span>
                              )}
                              {q.subTopic && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950">
                                  Sub-Topic: {q.subTopic}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-bold text-sm text-slate-900 leading-relaxed">
                            <MathText text={q.question} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const optionLetter = String.fromCharCode(65 + oIdx);
                              let btnClass =
                                'w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-violet-400 text-xs font-semibold text-slate-800 transition-colors cursor-pointer flex items-start gap-2';
                              if (hasAnswered) {
                                if (oIdx === q.correctIndex) {
                                  btnClass =
                                    'w-full text-left p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-xs font-bold text-emerald-950 flex items-start gap-2';
                                } else if (oIdx === selectedIdx) {
                                  btnClass =
                                    'w-full text-left p-3 rounded-xl border-2 border-rose-500 bg-rose-50 text-xs font-bold text-rose-900 flex items-start gap-2';
                                }
                              }
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                                  className={btnClass}
                                >
                                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-800 font-black flex items-center justify-center shrink-0 text-[11px]">
                                    {optionLetter}
                                  </span>
                                  <MathText text={opt} />
                                </button>
                              );
                            })}
                          </div>

                          {hasAnswered && (
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                              <div className="font-black text-emerald-900 flex items-center justify-between gap-2">
                                <span>✅ Worked Step-by-Step Solution ({q.sourceRef || 'TIE / NECTA Standard'}):</span>
                                <button
                                  onClick={() => {
                                    openMwalimuModal(mohaActiveClass, mohaActiveSubject, 'chat');
                                    sendMwalimuMessage(
                                      `Show me the complete step-by-step working for this ${mohaActiveClass} ${mohaActiveSubject} problem (${q.topic || ''} - ${q.subTopic || ''}): ${q.question}`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] cursor-pointer shrink-0"
                                >
                                  Ask Moha AI Tutor →
                                </button>
                              </div>
                              <MathText as="div" text={q.explanation} className="leading-relaxed font-medium" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* DEDICATED TOPIC MASTERY HEATMAP & WEAK-TOPIC REVISION PLANNER PAGE */}
      {activePage === 'mastery_planner' && (
        <motion.div
          key="view-mastery-planner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow py-6 pb-24 bg-slate-50"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleGoBack}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDailyQuizPage(mohaActiveClass, mohaActiveSubject)}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer"
                >
                  🎯 Open 20-Question Solving Quiz
                </button>
                <button
                  onClick={() => openVirtualLabPage(mohaActiveClass)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
                >
                  🧪 Virtual Science Practicals
                </button>
              </div>
            </div>

            <TopicMasteryPlanner
              activeClass={selectedClass || savedClass || mohaActiveClass || 'Form 4'}
              activeSubject={selectedSubject || mohaActiveSubject || 'Basic Mathematics'}
              quizHistory={quizHistory.map((q) => ({
                id: q.id,
                cls: q.cls,
                subject: q.subject,
                topic: q.topic,
                score: q.score,
                total: q.total,
                date: q.timestamp,
              }))}
              onLaunchTopicQuiz={(cls, subject, topic) => {
                openDailyQuizPage(cls, subject, topic, 'ALL', 'ALL');
              }}
              onOpenTopicNotes={(cls, subject, topic) => {
                setTsClass(cls);
                setTsSubject(subject);
                setTsTopic(topic);
                setTsSubTopic(topic);
                openMwalimuModal(cls, subject, 'studio');
              }}
              onLogManualPractice={handleLogManualTopicPractice}
            />
          </div>
        </motion.div>
      )}

      {/* DEDICATED VIRTUAL SCIENCE PRACTICALS LAB (NECTA PAPER 2) PAGE */}
      {activePage === 'virtual_lab' && (
        <motion.div
          key="view-virtual-lab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow py-6 pb-24 bg-slate-50"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleGoBack}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMasteryPlannerPage(mohaActiveClass, mohaActiveSubject)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                >
                  📊 Syllabus Mastery Heatmap
                </button>
                <button
                  onClick={() => openDailyQuizPage(mohaActiveClass, mohaActiveSubject)}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer"
                >
                  🎯 20-Question Practical Quiz
                </button>
              </div>
            </div>

            <VirtualScienceLab
              activeClass={selectedClass || savedClass || mohaActiveClass || 'Form 4'}
              onLaunchPracticalQuiz={(cls, subject, topic) => {
                openDailyQuizPage(cls, subject, topic, 'ALL', 'ALL');
              }}
            />
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* STICKY MOBILE BOTTOM BAR */}
      {activePage === 'papers' && step > 1 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 sm:hidden">
          <button
            onClick={handleGoBack}
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

            <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setViewerType('paper');
                    setViewerLoading(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" /> Read
                </button>
                <button
                  onClick={() =>
                    triggerDirectDownloadUrl(viewerPaper.paperUrl, `${viewerPaper.title}.pdf`)
                  }
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                {!viewerPaper.isBook && !viewerPaper.isSyllabus && (
                  viewerPaper.answersUrl ? (
                    <button
                      onClick={() =>
                        triggerDirectDownloadUrl(
                          viewerPaper.answersUrl,
                          `${viewerPaper.title} - Solution.pdf`
                        )
                      }
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Solution
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3.5 py-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <span>Pending</span>
                    </button>
                  )
                )}
              </div>
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
          className="h-screen bg-slate-50 flex flex-col overflow-hidden"
        >
          {/* Single-Row Unified Navigation & Context Bar (No Redundant Headers) */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-2.5 sm:px-4 py-1.5 shadow-2xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              {/* Left: Back + Brand + Compact Class/Subject/Book/Chapter Selectors */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleGoBack}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  title="Back to Elimika"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Back</span>
                </button>

                <div className="flex items-center gap-1 font-black text-slate-900 text-xs sm:text-sm shrink-0 pr-1">
                  <span className="w-5 h-5 rounded-md bg-violet-600 text-white flex items-center justify-center text-[11px]">
                    🤖
                  </span>
                  <span className="hidden sm:inline">Moha AI</span>
                </div>

                {/* Class & Subject Selector Pill */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-xs border border-slate-200 shrink-0">
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
                    className="bg-transparent text-violet-700 font-bold focus:outline-none cursor-pointer max-w-[115px] sm:max-w-[150px] truncate"
                  >
                    {(TIE_CURRICULUM_SUBJECTS[mohaActiveClass] || ['Basic Mathematics']).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compact Book & Chapter Selectors */}
                <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1.5 py-0.5 border border-slate-200 text-xs shrink-0">
                  <select
                    value={mohaFocusedResourceId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMohaFocusedResourceId(val);
                      const found = allPapers.find((p) => p.id === val);
                      if (found) {
                        if (found.form && !found.form.includes('-')) {
                          setMohaActiveClass(found.form);
                          setTsClass(found.form);
                        }
                        if (found.subject) {
                          setMohaActiveSubject(found.subject);
                          setTsSubject(found.subject);
                        }
                      }
                    }}
                    title="Select TIE Textbook or Past Paper"
                    className="max-w-[125px] lg:max-w-[175px] bg-transparent text-slate-800 font-semibold text-[11px] truncate focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">
                      📘 TIE {mohaActiveClass} ({classSubjectResourcesList.length})
                    </option>
                    {classSubjectResourcesList
                      .filter((r) => r.isBook)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          📘 {b.title}
                        </option>
                      ))}
                    {classSubjectResourcesList
                      .filter((r) => !r.isBook)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          📄 {p.title} ({p.year})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewResClass(mohaActiveClass);
                      setNewResSubject(mohaActiveSubject);
                      setAttachModalOpen(true);
                    }}
                    title="Attach Resource"
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] cursor-pointer shrink-0"
                  >
                    +Book
                  </button>
                  <span className="text-slate-300">|</span>
                  <select
                    value={
                      selectedQuizTopic && selectedQuizTopic !== 'ALL'
                        ? selectedQuizTopic
                        : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || ''
                    }
                    onChange={(e) => {
                      const chosenChap = e.target.value;
                      setSelectedQuizTopic(chosenChap);
                      setTsTopic(chosenChap);
                      setTsSubTopic(chosenChap);
                    }}
                    title="Select Syllabus Chapter / Topic"
                    className="max-w-[125px] lg:max-w-[175px] bg-transparent text-slate-800 font-semibold text-[11px] truncate focus:outline-none cursor-pointer"
                  >
                    {activeSyllabusTopics.map((rawChap, cIdx) => {
                      const cleanChap = rawChap.replace(/^\d+\.\d+\s*/, '').trim();
                      return (
                        <option key={`top-chap-${cIdx}`} value={cleanChap}>
                          {cleanChap.startsWith('Chapter') || cleanChap.startsWith('Sura')
                            ? cleanChap
                            : `Ch.${cIdx + 1}: ${cleanChap}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Right: Single-Row Workspace Tab Switcher + Teach AI */}
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { id: 'chat' as const, label: '💬 Chat' },
                  { id: 'studio' as const, label: '📘 Studio & Docs' },
                  { id: 'quiz' as const, label: '🎯 Quiz' },
                  { id: 'diagram' as const, label: '📐 Diagrams' },
                  { id: 'profile' as const, label: '👤 Profile' },
                ].map((tab) => {
                  const active = mohaViewMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'quiz' && quizItems.length === 0) {
                          startAiQuiz();
                          return;
                        }
                        setMohaViewMode(tab.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setMohaLearnPanelOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Teach Moha AI custom notes or topics (Saved permanently in localStorage)"
                >
                  <span>🧠 Teach AI</span>
                  {learnedMemory.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                      {learnedMemory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ==================== VIEW 1: CLEAN CHAT ==================== */}
          {mohaViewMode === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto overflow-hidden">
              {/* Minimal Single-Row Quick Actions */}
              <div className="shrink-0 px-3 sm:px-5 py-1.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      const activeChap =
                        selectedQuizTopic && selectedQuizTopic !== 'ALL'
                          ? selectedQuizTopic
                          : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || 'Core Topic';
                      setTsClass(mohaActiveClass);
                      setTsSubject(mohaActiveSubject);
                      setTsTopic(activeChap);
                      setTsSubTopic(activeChap);
                      setMohaViewMode('studio');
                      submitTeacherStudioDoc('lessonplan');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                  >
                    📋 4-Stage Lesson Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeChap =
                        selectedQuizTopic && selectedQuizTopic !== 'ALL'
                          ? selectedQuizTopic
                          : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || 'Core Topic';
                      setTsClass(mohaActiveClass);
                      setTsSubject(mohaActiveSubject);
                      setTsTopic(activeChap);
                      setTsSubTopic(activeChap);
                      setMohaViewMode('studio');
                      submitTeacherStudioDoc('schemeofwork');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                  >
                    📅 12-Col Scheme of Work
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeChap =
                        selectedQuizTopic && selectedQuizTopic !== 'ALL'
                          ? selectedQuizTopic
                          : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || 'Core Topic';
                      setTsClass(mohaActiveClass);
                      setTsSubject(mohaActiveSubject);
                      setTsTopic(activeChap);
                      setTsSubTopic(activeChap);
                      submitTeacherStudioDoc('lessonnotes');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer"
                  >
                    📘 Notes + Diagram
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeChap =
                        selectedQuizTopic && selectedQuizTopic !== 'ALL'
                          ? selectedQuizTopic
                          : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || 'Chapter 1';
                      sendMwalimuMessage(`Explain ${activeChap}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-[11px] cursor-pointer"
                  >
                    📖 Explain Chapter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeChap =
                        selectedQuizTopic && selectedQuizTopic !== 'ALL'
                          ? selectedQuizTopic
                          : activeSyllabusTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || 'Chapter 1';
                      sendMwalimuMessage(`Solve questions on ${activeChap}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-[11px] cursor-pointer"
                  >
                    🧮 Solve Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setMohaLearnPanelOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-[11px] cursor-pointer"
                  >
                    🧠 Teach AI
                  </button>
                </div>

                <button
                  onClick={() =>
                    setMohaMessages([
                      {
                        id: 'msg-welcome',
                        role: 'ai',
                        text: `Ready for **${mohaActiveClass} • ${mohaActiveSubject}**.`,
                      },
                    ])
                  }
                  className="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Scrollable Messages Viewport */}
              <div
                ref={chatContainerRef}
                className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 space-y-3 bg-slate-50"
              >
                {mohaMessages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[82%] bg-violet-600 text-white px-3.5 py-2 rounded-2xl rounded-br-xs text-xs sm:text-sm font-semibold shadow-2xs space-y-2">
                        {m.imagePreview && (
                          <img
                            src={m.imagePreview}
                            alt="Uploaded"
                            className="max-h-40 rounded-lg border border-white/30 object-contain"
                          />
                        )}
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-[96%] w-full bg-white border border-slate-200 p-3.5 rounded-2xl rounded-bl-xs shadow-2xs space-y-2">
                        {m.loading ? (
                          <div className="flex items-center gap-2 font-bold text-violet-700 text-xs">
                            <span className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            <span>{m.text}</span>
                          </div>
                        ) : (
                          <>
                            <div
                              id={`msg-body-${m.id}`}
                              className="text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto"
                            >
                              <div dangerouslySetInnerHTML={{ __html: formatMwalimuHtml(m.text) }} />
                            </div>
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                              <button
                                onClick={() => speakMwalimuText(m.id, m.text)}
                                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>{speakingMsgId === m.id ? 'Stop' : 'Listen'}</span>
                              </button>
                              <button
                                onClick={() => downloadMwalimuDocPdf(m.id, 'portrait')}
                                className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Attached Photo / PDF Preview */}
              {mohaPendingImage && (
                <div className="shrink-0 px-4 py-1.5 bg-violet-50 border-t border-violet-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-900 truncate">
                    {mohaPendingImage.fileName || 'File attached'}
                  </span>
                  <button
                    onClick={() => setMohaPendingImage(null)}
                    className="text-xs font-bold text-rose-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Bottom Input Dock */}
              <div className="shrink-0 bg-white border-t border-slate-200 px-3 sm:px-5 py-2">
                <div className="flex items-center gap-1.5">
                  <label
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                    title="Attach PDF or Photo"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*,application/pdf,.txt,.csv"
                      className="hidden"
                      onChange={handleMwalimuImageSelect}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={startMohaVoiceDictation}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                    title="Voice Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={mohaInput}
                    onChange={(e) => setMohaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMwalimuMessage();
                    }}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-violet-600 focus:outline-none text-xs sm:text-sm font-medium bg-white"
                  />
                  <button
                    onClick={() => sendMwalimuMessage()}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm rounded-xl shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 2: NECTA QUIZ, 'CHALLENGE A FRIEND' & LEADERBOARD ==================== */}
          {mohaViewMode === 'quiz' && (() => {
            const totalQuestions = quizItems.length;
            const answeredCount = quizItems.reduce(
              (acc, _, idx) => acc + (quizSelectedAnswers[idx] !== undefined ? 1 : 0),
              0
            );
            const correctCount = quizItems.reduce(
              (acc, item, idx) => acc + (quizSelectedAnswers[idx] === item.correctIndex ? 1 : 0),
              0
            );
            const completionPercentage =
              totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
            const isQuizComplete = totalQuestions > 0 && answeredCount === totalQuestions;

            return (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-6xl mx-auto space-y-5">
                {/* Quiz Session Completion Progress Bar at Top of Quiz View */}
                {totalQuestions > 0 && (
                  <div
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Quiz completion progress"
                    className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider text-[11px] ${
                            isQuizComplete
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-violet-100 text-violet-900'
                          }`}
                        >
                          {isQuizComplete ? '✅ Quiz Completed' : '📊 Quiz Progress'}
                        </span>
                        <span className="font-bold text-slate-800 tabular-nums">
                          {answeredCount} of {totalQuestions} Questions Answered
                        </span>
                      </div>

                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="text-slate-600 font-semibold">
                          Correct:{' '}
                          <strong className="text-emerald-700">
                            {correctCount}/{totalQuestions}
                          </strong>
                        </span>
                        <span
                          className={`text-sm font-black ${
                            isQuizComplete ? 'text-emerald-700' : 'text-violet-700'
                          }`}
                        >
                          {completionPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Smooth Animated Progress Bar Track */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isQuizComplete
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-gradient-to-r from-violet-600 to-blue-600'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Simple, Clean Quiz & Friend Challenge Control Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  {/* Row 1: Topic + Sub-Topic + Source Filter + Player Name + New Quiz */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs items-end">
                    <div className="sm:col-span-4">
                      <label className="font-bold text-slate-700 block mb-1">
                        1. Topic ({mohaActiveClass} {mohaActiveSubject})
                      </label>
                      <select
                        value={selectedQuizTopic}
                        onChange={(e) => {
                          const nextTopic = e.target.value;
                          const nextSubTopics = getSubTopicsForMainTopic(
                            mohaActiveSubject,
                            nextTopic === 'ALL' ? activeSyllabusTopics[0] || '' : nextTopic
                          );
                          const firstSubT = nextSubTopics[0] || 'ALL';
                          setSelectedQuizTopic(nextTopic);
                          setSelectedQuizSubTopic(firstSubT);
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            nextTopic,
                            firstSubT,
                            selectedQuizSourceFilter
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        <option value="ALL">All Syllabus Topics ({mohaActiveSubject})</option>
                        <optgroup label="📜 Official TIE Syllabus Topics">
                          {activeSyllabusTopics.map((t) => {
                            const cleanT = t.replace(/^\d+\.\d+\s*/, '');
                            return (
                              <option key={t} value={cleanT}>
                                {t}
                              </option>
                            );
                          })}
                        </optgroup>
                        {(activeSiteResources.books.length > 0 || activeSiteResources.papers.length > 0) && (
                          <optgroup label="📚 Website TIE Books & Past Papers">
                            {activeSiteResources.books.map((b, idx) => (
                              <option key={`book-${idx}`} value={b.title}>
                                📘 {b.title} ({b.form})
                              </option>
                            ))}
                            {activeSiteResources.papers.slice(0, 6).map((p, idx) => (
                              <option key={`paper-${idx}`} value={`${p.title} (${p.year})`}>
                                📄 {p.title} ({p.year})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-bold text-slate-700 block mb-1">2. Sub-Topic</label>
                      <select
                        value={selectedQuizSubTopic}
                        onChange={(e) => {
                          const nextSubT = e.target.value;
                          setSelectedQuizSubTopic(nextSubT);
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            selectedQuizTopic,
                            nextSubT,
                            selectedQuizSourceFilter
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        <option value="ALL">All Sub-Topics</option>
                        {getSubTopicsForMainTopic(
                          mohaActiveSubject,
                          selectedQuizTopic === 'ALL' ? activeSyllabusTopics[0] || '' : selectedQuizTopic
                        ).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">3. Question Source</label>
                      <select
                        value={selectedQuizSourceFilter}
                        onChange={(e) => {
                          const nextSrc = e.target.value as 'ALL' | 'textbook' | 'past_paper';
                          setSelectedQuizSourceFilter(nextSrc);
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            selectedQuizTopic,
                            selectedQuizSubTopic,
                            nextSrc
                          );
                        }}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                      >
                        <option value="ALL">📚 Book + Past Papers</option>
                        <option value="textbook">📘 TIE Book Only</option>
                        <option value="past_paper">📄 Past Papers Only</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={challengePlayerName}
                        onChange={(e) => setChallengePlayerName(e.target.value)}
                        placeholder={userProfile.name || 'Your Name'}
                        className="w-28 px-2.5 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                      />
                      <button
                        onClick={() =>
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            selectedQuizTopic,
                            selectedQuizSubTopic,
                            selectedQuizSourceFilter
                          )
                        }
                        className="flex-1 px-2.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap"
                      >
                        🔄 Solve
                      </button>
                      <button
                        onClick={() => setShowFlashcardsSection((v) => !v)}
                        className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer shrink-0"
                        title="Toggle Revision Flashcards"
                      >
                        {showFlashcardsSection ? 'Hide' : '🗂️'}
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Simple One-Line Friend Challenge Bar */}
                  <div className="pt-2.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-800">🤝 Challenge a Friend:</span>
                      {activeChallenge?.id && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-300 text-slate-950 font-black tracking-wider">
                          CODE: {activeChallenge.id}
                        </span>
                      )}
                      <button
                        onClick={() => createFriendChallenge()}
                        disabled={challengeCreating}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer disabled:opacity-50"
                      >
                        {challengeCreating ? 'Creating...' : '📋 Copy Challenge Link'}
                      </button>
                      <a
                        href={getChallengeWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        📲 WhatsApp Friend
                      </a>
                      <button
                        onClick={() => startFriendTurnSameDevice()}
                        className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold cursor-pointer"
                      >
                        👥 Friend&apos;s Turn
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={joinChallengeCode}
                        onChange={(e) => setJoinChallengeCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && joinChallengeCode.trim()) {
                            loadSharedChallengeFromUrl(joinChallengeCode);
                          }
                        }}
                        placeholder="Friend Code (e.g. MATH-301)"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 font-bold uppercase text-slate-900 w-44 focus:outline-none focus:border-violet-600"
                      />
                      <button
                        onClick={() => loadSharedChallengeFromUrl(joinChallengeCode)}
                        disabled={joiningChallengeByCode || !joinChallengeCode.trim()}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold cursor-pointer shrink-0"
                      >
                        {joiningChallengeByCode ? '...' : 'Join'}
                      </button>
                    </div>
                  </div>
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
                          <div className="text-sm font-bold my-2.5">
                            <MathText text={flashcardFlipped ? card.back : card.front} />
                          </div>
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                            <span>
                              Key Point: <MathText text={card.formulaOrKeyPoint} />
                            </span>
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
                      {totalQuestions > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-900 text-xs font-bold tabular-nums">
                            {completionPercentage}% Done
                          </span>
                          <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold tabular-nums">
                            Score: {correctCount} / {totalQuestions}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Integrated Website Content Pills for Quiz */}
                    {(activeSiteResources.books.length > 0 || activeSiteResources.papers.length > 0) && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-600 text-[11px] flex items-center justify-between">
                          <span>📚 Integrated Website Content (Click to Quiz on a Specific Book or Past Paper):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeSiteResources.books.slice(0, 2).map((b, i) => (
                            <button
                              key={`qbook-${i}`}
                              onClick={() => startAiQuiz(mohaActiveClass, mohaActiveSubject, b.title)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                                selectedQuizTopic === b.title
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200'
                              }`}
                            >
                              📘 {b.title}
                            </button>
                          ))}
                          {activeSiteResources.papers.slice(0, 3).map((p, i) => {
                            const label = `${p.title} (${p.year})`;
                            return (
                              <button
                                key={`qpaper-${i}`}
                                onClick={() => startAiQuiz(mohaActiveClass, mohaActiveSubject, label)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                                  selectedQuizTopic === label
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200'
                                }`}
                              >
                                📄 {p.title} ({p.year})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-slate-800">
                                    Problem {qIdx + 1} of {quizItems.length}
                                  </span>
                                  {q.sourceRef && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                                      {q.sourceRef}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {q.topic && <span className="font-bold text-violet-700">{q.topic}</span>}
                                  {q.subTopic && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-bold">
                                      {q.subTopic}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900">
                                <MathText text={q.question} />
                              </div>
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
                                      <MathText text={opt} />
                                    </button>
                                  );
                                })}
                              </div>
                              {hasAnswered && (
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
                                  <strong>NECTA Explanation:</strong> <MathText text={q.explanation} />
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
                                const fallbackFifteen = buildContentIntegratedQuizQuestions(
                                  activeChallenge.cls,
                                  activeChallenge.subject,
                                  activeChallenge.topic
                                );
                                const merged = [...activeChallenge.questions];
                                for (const fq of fallbackFifteen) {
                                  if (merged.length >= 15) break;
                                  if (!merged.some((q) => q.question === fq.question)) {
                                    merged.push(fq);
                                  }
                                }
                                setQuizItems(merged.slice(0, 15));
                                setQuizSelectedAnswers({});
                                setQuizResultSaved(false);
                                setQuizStartTime(Date.now());
                                showToast(`🎯 Loaded 15 "${activeChallenge.topic}" challenge questions!`);
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
            );
          })()}

          {/* ==================== VIEW 3: NOTES & TEACHER STUDIO (SINGLE-ROW TOOLBAR + MAXIMIZED EDITABLE WORKSPACE) ==================== */}
          {mohaViewMode === 'studio' && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-100">
              {/* Single-Row Studio Document Bar: Doc Types + Inline Metadata + PDF Export */}
              <div className="shrink-0 bg-white border-b border-slate-200 px-2.5 sm:px-4 py-1.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
                  {/* Left: Single-Row Document Type Tabs */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[
                      { id: 'lessonplan' as const, label: '📋 4-Stage Lesson Plan', activeBg: 'bg-blue-600 text-white' },
                      { id: 'schemeofwork' as const, label: '📅 12-Col Scheme of Work', activeBg: 'bg-emerald-700 text-white' },
                      { id: 'lessonnotes' as const, label: '📘 Notes', activeBg: 'bg-indigo-600 text-white' },
                      { id: 'exampaper' as const, label: '📝 Exam', activeBg: 'bg-amber-500 text-slate-950' },
                      { id: 'markingscheme' as const, label: '✅ Marking', activeBg: 'bg-rose-600 text-white' },
                      { id: 'blueprint' as const, label: '📐 Blueprint', activeBg: 'bg-teal-700 text-white' },
                      { id: 'logbook' as const, label: '📓 Log Book', activeBg: 'bg-slate-800 text-white' },
                    ].map((docBtn) => (
                      <button
                        key={docBtn.id}
                        disabled={generatingDocType !== null}
                        onClick={() => submitTeacherStudioDoc(docBtn.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 ${docBtn.activeBg} hover:opacity-90`}
                      >
                        {generatingDocType === docBtn.id ? '⏳...' : docBtn.label}
                      </button>
                    ))}
                  </div>

                  {/* Center: Compact Inline Metadata Fields + Full Metadata Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={tsSchool}
                      onChange={(e) => setTsSchool(e.target.value)}
                      placeholder="School Name"
                      title="School Name"
                      className="w-28 lg:w-36 px-2 py-1 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-500 focus:outline-none font-semibold text-[11px]"
                    />
                    <input
                      type="text"
                      value={tsTeacher}
                      onChange={(e) => setTsTeacher(e.target.value)}
                      placeholder="Teacher Name"
                      title="Teacher Name"
                      className="w-24 lg:w-32 px-2 py-1 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-500 focus:outline-none font-semibold text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setTeacherStudioOpen((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border cursor-pointer whitespace-nowrap ${
                        teacherStudioOpen
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                      title="Open Full Teacher Metadata Form (Attendance, Duration, Topic, Sub-Topic)"
                    >
                      ⚙️ Teacher Metadata
                    </button>
                  </div>

                  {/* Right: Direct PDF Export Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => downloadMwalimuDocPdf('studio-preview', 'portrait')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      title="Download Direct HTML-to-PDF (Portrait)"
                    >
                      <Download className="w-3 h-3" /> Portrait PDF
                    </button>
                    <button
                      onClick={() => downloadMwalimuDocPdf('studio-preview', 'landscape')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      title="Download Direct HTML-to-PDF (Landscape for 12-Col Scheme of Work)"
                    >
                      <Download className="w-3 h-3" /> Landscape PDF
                    </button>
                  </div>
                </div>

                {/* Collapsible Teacher Metadata Collection Panel for 4-Stage TIE Lesson Plan & 12-Column PO-RALG Scheme of Work */}
                {teacherStudioOpen && (
                  <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">School Name</label>
                      <input
                        type="text"
                        value={tsSchool}
                        onChange={(e) => setTsSchool(e.target.value)}
                        placeholder="e.g. Azania Secondary"
                        className="w-full px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Teacher Name</label>
                      <input
                        type="text"
                        value={tsTeacher}
                        onChange={(e) => setTsTeacher(e.target.value)}
                        placeholder="e.g. Mr. J. Nyerere"
                        className="w-full px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Main Topic</label>
                      <input
                        type="text"
                        value={tsTopic}
                        onChange={(e) => setTsTopic(e.target.value)}
                        placeholder={activeSyllabusTopics[0] || 'Main Topic'}
                        className="w-full px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Sub-Topic</label>
                      <input
                        type="text"
                        value={tsSubTopic}
                        onChange={(e) => setTsSubTopic(e.target.value)}
                        placeholder="Sub-Topic"
                        className="w-full px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Duration &amp; Date</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={tsDuration}
                          onChange={(e) => setTsDuration(e.target.value)}
                          placeholder="80 Min"
                          className="w-1/2 px-1.5 py-1 rounded border border-slate-300 font-semibold text-xs"
                        />
                        <input
                          type="date"
                          value={tsDate}
                          onChange={(e) => setTsDate(e.target.value)}
                          className="w-1/2 px-1 py-1 rounded border border-slate-300 font-semibold text-[11px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Registered (Girls / Boys)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={tsRegG}
                          onChange={(e) => setTsRegG(Number(e.target.value) || 0)}
                          className="w-1/2 px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                          title="Registered Girls"
                        />
                        <input
                          type="number"
                          value={tsRegB}
                          onChange={(e) => setTsRegB(Number(e.target.value) || 0)}
                          className="w-1/2 px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                          title="Registered Boys"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Present (Girls / Boys)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={tsPresG}
                          onChange={(e) => setTsPresG(Number(e.target.value) || 0)}
                          className="w-1/2 px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                          title="Present Girls"
                        />
                        <input
                          type="number"
                          value={tsPresB}
                          onChange={(e) => setTsPresB(Number(e.target.value) || 0)}
                          className="w-1/2 px-2 py-1 rounded border border-slate-300 font-semibold text-xs"
                          title="Present Boys"
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <button
                        type="button"
                        onClick={() => submitTeacherStudioDoc('lessonplan')}
                        className="flex-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        📋 Lesson Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => submitTeacherStudioDoc('schemeofwork')}
                        className="flex-1 px-2 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                      >
                        📅 Scheme
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Maximized Full-Viewport Editable Document Canvas */}
              <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-6 py-3">
                <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 min-h-full">
                  <div
                    id="msg-body-studio-preview"
                    contentEditable
                    suppressContentEditableWarning
                    className="overflow-x-auto focus:outline-none min-h-[calc(100vh-8rem)]"
                    dangerouslySetInnerHTML={{
                      __html:
                        studioPreviewHtml ||
                        buildInstantOfficialDocument('lessonnotes', {
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

          {/* ==================== VIEW 4: INTERACTIVE DIAGRAM LAB ==================== */}
          {mohaViewMode === 'diagram' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto">
                <InteractiveDiagramLab
                  initialPreset={activeDiagramPreset}
                  activeClass={mohaActiveClass}
                  activeSubject={mohaActiveSubject}
                />
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
                        <option value="Teacher">Teacher</option>
                        <option value="Student">Student</option>
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

                {/* Integrated Topic Mastery Heatmap & Smart Weak-Topic Revision Timetable inside Profile View */}
                <TopicMasteryPlanner
                  activeClass={masteryProgressData.targetCls}
                  activeSubject={mohaActiveSubject}
                  quizHistory={quizHistory.map((q) => ({
                    id: q.id,
                    cls: q.cls,
                    subject: q.subject,
                    topic: q.topic,
                    score: q.score,
                    total: q.total,
                    date: q.timestamp,
                  }))}
                  onLaunchTopicQuiz={(cls, subject, topic) => {
                    startAiQuiz(cls, subject, topic, 'ALL', 'ALL');
                  }}
                  onOpenTopicNotes={(cls, subject, topic) => {
                    setTsClass(cls);
                    setTsSubject(subject);
                    setTsTopic(topic);
                    setTsSubTopic(topic);
                    setMohaViewMode('studio');
                    submitTeacherStudioDoc('lessonnotes');
                  }}
                  onLogManualPractice={handleLogManualTopicPractice}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* FULL-VIEWPORT ELIMIKA PLAY ARCADE (NECTA TREASURE HUNT, ESCAPE THE CLASSROOM & ORIGINAL STEM ARENA) */}
      {activePage === 'game' && (
        <ElimikaPlayHub
          initialRoute={playRoute}
          initialClass={selectedClass || mohaActiveClass || 'Form 3'}
          initialSubject={selectedSubject || mohaActiveSubject || 'Basic Mathematics'}
          initialTopic={selectedQuizTopic && selectedQuizTopic !== 'ALL' ? selectedQuizTopic : 'ALL'}
          allPapers={allPapers}
          onExitPlay={handleGoBack}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* 🧠 TEACH MOHA AI MODAL (PERMANENT SELF-LEARNING MEMORY IN LOCALSTORAGE) */}
      {mohaLearnPanelOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setMohaLearnPanelOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                  Self-Learning Memory Engine (localStorage)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  🧠 Teach Moha AI Custom Notes &amp; Topics
                </h3>
              </div>
              <button
                onClick={() => setMohaLearnPanelOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Add custom school notes, definitions, marking rubrics, or topic explanations below. Moha AI permanently saves them in your browser&apos;s <strong>localStorage</strong> and automatically recalls them whenever you or your students ask about that topic.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Topic Name or Trigger Question ({mohaActiveClass} — {mohaActiveSubject})
                </label>
                <input
                  type="text"
                  value={learnTopicInput}
                  onChange={(e) => setLearnTopicInput(e.target.value)}
                  placeholder="e.g. Osmosis in Plant Cells, or School Exam Rule"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-600 focus:outline-none font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Notes / Answer to Remember Permanently
                </label>
                <textarea
                  rows={4}
                  value={learnAnswerInput}
                  onChange={(e) => setLearnAnswerInput(e.target.value)}
                  placeholder="Write the exact definition, worked example, or teaching notes that Moha AI should remember..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-violet-600 focus:outline-none font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMohaLearnPanelOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLearnedFromForm}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer"
                >
                  🧠 Save to Permanent Memory
                </button>
              </div>
            </div>

            {learnedMemory.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="text-xs font-black text-slate-800">
                  Saved Memory Items ({learnedMemory.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {learnedMemory.map((item, idx) => (
                    <div
                      key={`${item.topic}-${idx}`}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {item.topic}{' '}
                          <span className="text-[10px] font-semibold text-violet-700">
                            ({item.cls} · {item.subject})
                          </span>
                        </div>
                        <div className="text-slate-600 line-clamp-2">{item.content}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMohaLearnedItem(item.topic)}
                        className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE ADSENSE & LEGAL COMPLIANCE MODAL (PRIVACY POLICY / TERMS OF SERVICE / ABOUT) */}
      {legalModalType && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLegalModalType(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {legalModalType === 'privacy'
                  ? 'Privacy Policy — Elimika Tanzania'
                  : legalModalType === 'terms'
                  ? 'Terms of Service — Elimika Tanzania'
                  : 'About Elimika Tanzania & Contact'}
              </h2>
              <button
                onClick={() => setLegalModalType(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {legalModalType === 'privacy' && (
              <div className="space-y-3">
                <p>
                  <strong>Effective Date:</strong> January 1, 2026
                </p>
                <p>
                  At <strong>Elimika Tanzania</strong>, we respect and protect the privacy of all students, teachers, and visitors using our educational web platform. This Privacy Policy explains how information is handled when you browse Past Papers, TIE Books, Official Syllabuses, and Moha AI Teacher Tools.
                </p>
                <h3 className="font-bold text-slate-900">1. Information Stored Locally</h3>
                <p>
                  Elimika uses your browser&apos;s <code>localStorage</code> to save your preferred class level, quiz progress, teacher document metadata, and custom notes added via the <strong>Teach AI</strong> feature. This data stays on your device and can be cleared by you at any time.
                </p>
                <h3 className="font-bold text-slate-900">2. Cookies &amp; Google AdSense Compliance</h3>
                <p>
                  Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to Elimika and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    Google Ads Settings
                  </a>
                  .
                </p>
                <h3 className="font-bold text-slate-900">3. Educational Resources &amp; Third-Party Links</h3>
                <p>
                  Our library links to publicly accessible educational PDFs hosted on Google Drive for curriculum study and revision. We do not sell, rent, or trade personal user data to third parties.
                </p>
              </div>
            )}

            {legalModalType === 'terms' && (
              <div className="space-y-3">
                <p>
                  <strong>Last Updated:</strong> January 1, 2026
                </p>
                <p>
                  Welcome to <strong>Elimika Tanzania</strong>. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service.
                </p>
                <h3 className="font-bold text-slate-900">1. Educational Use Only</h3>
                <p>
                  All Past Papers, Marking Schemes, TIE Textbooks, Official Syllabuses, and AI-generated Lesson Plans or Schemes of Work provided on Elimika are intended strictly for educational, classroom teaching, and examination revision purposes in accordance with Tanzania Institute of Education (TIE) and NECTA guidelines.
                </p>
                <h3 className="font-bold text-slate-900">2. User Conduct &amp; Content</h3>
                <p>
                  Teachers and students using Moha AI, Quiz Challenges, or the Teacher Document Studio agree to use the tools responsibly for academic growth. Automated scraping or redistribution of the platform code for commercial resale is prohibited.
                </p>
                <h3 className="font-bold text-slate-900">3. Disclaimer of Warranties</h3>
                <p>
                  While Elimika strives to keep all curriculum materials, worked solutions, and generated teacher documents accurate and aligned with current PO-RALG and TIE standards, materials are provided &ldquo;as is&rdquo; and teachers should review generated lesson plans and schemes for their specific school calendar.
                </p>
              </div>
            )}

            {legalModalType === 'about' && (
              <div className="space-y-3">
                <p>
                  <strong>Elimika Tanzania</strong> is a comprehensive digital learning and teacher productivity platform built for Primary (Standard 1–7), Ordinary Secondary (Form 1–4), and Advanced Secondary (Form 5–6) schools across Tanzania.
                </p>
                <p>
                  <strong>Key Features:</strong> Official TIE Textbooks, Syllabuses, NECTA Past Examination Papers, Interactive 3D Virtual Science Labs, Daily Solving Quizzes, and Moha AI with instant 4-Stage TIE Lesson Plan and 12-Column PO-RALG Scheme of Work PDF generation.
                </p>
                <p>
                  <strong>Contact &amp; Support:</strong> For curriculum inquiries, resource contributions, or school partnerships, contact the Elimika Academic Desk at <code>support@elimika.ac.tz</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💬 WHATSAPP COMMUNITY & CHANNEL STUDIO MODAL */}
      {whatsappModalOpen && (() => {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://elimika.ac.tz';
        const activeCls = selectedClass || mohaActiveClass || 'Form 4';
        const activeSub = selectedSubject || mohaActiveSubject || 'Basic Mathematics';

        const broadcastMessage =
          broadcastTemplateType === 'paper'
            ? `📢 *NEW NECTA & MOCK PAST PAPERS UPDATE — ELIMIKA ONLINE* 🇹🇿\n\n📚 *Class:* ${activeCls}\n📖 *Subject:* ${activeSub}\n✅ Includes Full Question Papers + Marking Schemes & Step-by-Step Solutions!\n\n👉 *Download & Read Free Here:* ${siteUrl}\n🔔 *Follow Elimika Online on WhatsApp:* ${whatsappConfig.mainChannelUrl}`
            : broadcastTemplateType === 'quiz'
            ? `🎯 *DAILY 20-QUESTION NECTA QUIZ CHALLENGE — ELIMIKA ONLINE!* 🏆\n\nCan you score 18/20 or higher in today's *${activeCls} ${activeSub}* revision challenge?\n\n⚡ Instant marking + worked explanations\n🏅 Compete with students across Tanzania\n\n👉 *Start the Quiz Now:* ${siteUrl}\n🔔 *Follow Elimika Online on WhatsApp:* ${whatsappConfig.mainChannelUrl}`
            : broadcastTemplateType === 'book'
            ? `📚 *OFFICIAL TIE TEXTBOOKS & SYLLABUSES — ELIMIKA ONLINE* 🇹🇿\n\nAccess all competency-based TIE Student Books and Official Syllabuses (Std 1–7 & Form 1–6) for *${activeCls} ${activeSub}* in one click.\n\n👉 *Open TIE Library:* ${siteUrl}\n🔔 *Follow Elimika Online:* ${whatsappConfig.mainChannelUrl}`
            : `🧑‍🏫 *FOR TEACHERS: INSTANT TIE LESSON PLANS & 12-COLUMN PO-RALG SCHEMES* ✍️\n\nGenerate printable, curriculum-aligned *4-Stage TIE Lesson Plans* and *12-Column Schemes of Work* for *${activeCls} ${activeSub}* in seconds on *Elimika Online*.\n\n👉 *Generate & Download PDF:* ${siteUrl}\n🔔 *Follow Elimika Online on WhatsApp:* ${whatsappConfig.mainChannelUrl}`;

        return (
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setWhatsappModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                    Official Student &amp; Teacher Network
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>💬 {whatsappConfig.channelName}</span>
                  </h2>
                </div>
                <button
                  onClick={() => setWhatsappModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Navigation Tabs inside WhatsApp Hub (Visible ONLY to Admin when unlocked) */}
              {whatsappAdminUnlocked && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-black text-emerald-400">🌐 Full Standalone Website HTML Code:</span>{' '}
                      <span className="text-slate-300">WhatsApp Channel Only (No Community groups).</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/elimika-tanzania-website.html');
                            const htmlCode = await res.text();
                            await navigator.clipboard?.writeText(htmlCode);
                            showToast('✅ Full Website HTML Code copied to clipboard! Paste it into your website.');
                          } catch {
                            showToast('⚠️ Could not copy HTML code — click Download HTML File instead.');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>📋 Copy Full HTML Code</span>
                      </button>
                      <a
                        href="/elimika-tanzania-website.html"
                        download="index.html"
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>⬇️ Download index.html</span>
                      </a>
                      <a
                        href="/ads.txt"
                        download="ads.txt"
                        className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>⬇️ Download ads.txt</span>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setWhatsappTab('join')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'join'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📲 Join Channel
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappTab('broadcast')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'broadcast'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📢 Post Generator
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappTab('adsense')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'adsense'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💰 Google Ads
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappTab('logo')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'logo'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎨 Profile Pic
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappTab('setup')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'setup'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚙️ Setup Links
                  </button>
                  </div>
                </div>
              )}

              {/* TAB 0: OFFICIAL ELIMIKA WHATSAPP PROFILE PICTURE & 1-CLICK HD DOWNLOAD (Admin Only) */}
              {whatsappAdminUnlocked && whatsappTab === 'logo' && (
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    {/* Live Vector Circular Profile Picture Preview (Blue, Black & White) */}
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div
                        className={`w-48 h-48 rounded-full p-1.5 shadow-xl border-4 flex flex-col items-center justify-center text-center relative overflow-hidden ${
                          profileLogoTheme === 'blue_black'
                            ? 'bg-gradient-to-br from-slate-950 via-blue-700 to-slate-950 border-white ring-2 ring-blue-500'
                            : profileLogoTheme === 'blue_white'
                            ? 'bg-gradient-to-br from-white via-blue-50 to-blue-100 border-blue-700 ring-2 ring-slate-950'
                            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-blue-600 ring-2 ring-white'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 shadow-inner border ${
                            profileLogoTheme === 'blue_white'
                              ? 'bg-blue-600 border-slate-950 text-white'
                              : profileLogoTheme === 'black_blue'
                              ? 'bg-white border-blue-500 text-blue-700'
                              : 'bg-blue-600/40 border-white/80 text-white'
                          }`}
                        >
                          <GraduationCap className="w-7 h-7" />
                        </div>
                        <div
                          className={`text-xl font-black tracking-tight leading-none ${
                            profileLogoTheme === 'blue_white' ? 'text-slate-950' : 'text-white'
                          }`}
                        >
                          ELIMIKA
                        </div>
                        <div
                          className={`mt-1 px-3 py-0.5 rounded-full font-black text-[10px] tracking-widest border ${
                            profileLogoTheme === 'blue_black'
                              ? 'bg-white text-slate-950 border-slate-950'
                              : 'bg-blue-600 text-white border-white'
                          }`}
                        >
                          ONLINE
                        </div>
                        <div
                          className={`mt-1.5 text-[8px] font-extrabold tracking-wider uppercase ${
                            profileLogoTheme === 'blue_white' ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          Past Papers • TIE Books • AI
                        </div>
                        <div
                          className={`text-[8px] font-extrabold ${
                            profileLogoTheme === 'blue_white' ? 'text-blue-700' : 'text-sky-300'
                          }`}
                        >
                          Std 1–7 | Form 1–6
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        Circular WhatsApp Crop Preview
                      </span>
                    </div>

                    {/* Controls & 1-Click 1080x1080 PNG Download */}
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                          1080 × 1080 HD Square &amp; Circular Safe-Zone
                        </span>
                        <h3 className="text-base font-black text-slate-900">
                          Elimika Online Logo (Blue, Black &amp; White)
                        </h3>
                        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                          Styled in crisp <strong>Royal Blue, Jet Black, and Pure White</strong> to match your Elimika brand header and fit WhatsApp&apos;s circular profile frame cleanly.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block">Choose Blue / Black / White Style:</label>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          {[
                            { id: 'blue_black', label: '🔵⚫ Royal Blue, Black & White' },
                            { id: 'blue_white', label: '⚪🔵 Crisp White, Blue & Black' },
                            { id: 'black_blue', label: '⚫🔵 Pitch Black & Electric Blue' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setProfileLogoTheme(t.id as 'blue_black' | 'blue_white' | 'black_blue')}
                              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                                profileLogoTheme === t.id
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => downloadElimikaProfilePicPng(profileLogoTheme)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>⬇️ Download HD Profile Picture (1080×1080 PNG)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: JOIN CHANNEL & CLASS GROUPS (Always shown to public users) */}
              {(!whatsappAdminUnlocked || whatsappTab === 'join') && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                        Official Broadcast Channel (Unlimited Followers)
                      </span>
                      <h3 className="text-base sm:text-lg font-black">{whatsappConfig.channelName}</h3>
                      <p className="text-xs text-emerald-50">
                        Get daily NECTA Past Papers, Marking Schemes, TIE Textbooks, and 20-Question Quiz links straight to your phone. Phone numbers stay 100% private.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <a
                          href={whatsappConfig.mainChannelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs shadow-xs inline-flex items-center gap-1.5"
                        >
                          <span>🔔 Follow WhatsApp Channel</span>
                        </a>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `📚 *Follow ${whatsappConfig.channelName} on WhatsApp* for daily NECTA Past Papers, Marking Schemes, TIE Books & Quiz Challenges:\n👉 ${whatsappConfig.mainChannelUrl}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1"
                        >
                          <span>📲 Share with Classmates</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(whatsappConfig.mainChannelUrl);
                            showToast('📋 Channel invite link copied to clipboard!');
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-2xl shrink-0 shadow-sm text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                          whatsappConfig.mainChannelUrl
                        )}`}
                        alt="WhatsApp Channel QR"
                        className="w-24 h-24 rounded-lg"
                      />
                      <span className="block text-[10px] font-bold text-slate-600 mt-1">Scan to Follow</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHATSAPP BROADCAST POST GENERATOR (Admin Only) */}
              {whatsappAdminUnlocked && whatsappTab === 'broadcast' && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600">
                    Generate ready-to-post WhatsApp announcements formatted with bold headings and direct links to drive students and teachers from WhatsApp back to your website.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'paper', label: '📄 New Past Paper Post' },
                      { id: 'quiz', label: '🎯 Daily 20-Qn Quiz Challenge' },
                      { id: 'book', label: '📚 TIE Books & Syllabus Alert' },
                      { id: 'teacher', label: '🧑‍🏫 Teacher Lesson Plan Promo' },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setBroadcastTemplateType(tpl.id as 'paper' | 'quiz' | 'book' | 'teacher')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                          broadcastTemplateType === tpl.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    readOnly
                    rows={8}
                    value={broadcastMessage}
                    className="w-full p-3.5 rounded-2xl bg-slate-900 text-emerald-100 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(broadcastMessage);
                        showToast('✅ Broadcast message copied! Paste it in your WhatsApp Channel.');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
                    >
                      📋 Copy Broadcast Text
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(broadcastMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5"
                    >
                      <span>📲 Share Directly on WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 3: SETUP & STEP-BY-STEP GUIDE FOR ADMIN (Admin Only) */}
              {whatsappAdminUnlocked && whatsappTab === 'setup' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                    <div className="font-black text-sm">
                      🚀 Official WhatsApp Channel Configuration
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Update your WhatsApp Channel name or invite link below. All Follow buttons and the QR code across Elimika Online update immediately.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">WhatsApp Channel Display Name</label>
                      <input
                        type="text"
                        value={whatsappConfig.channelName}
                        onChange={(e) =>
                          setWhatsappConfig((prev) => ({ ...prev, channelName: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Official WhatsApp Channel URL (https://whatsapp.com/channel/...)
                      </label>
                      <input
                        type="url"
                        value={whatsappConfig.mainChannelUrl}
                        onChange={(e) =>
                          setWhatsappConfig((prev) => ({ ...prev, mainChannelUrl: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => saveWhatsappConfig(whatsappConfig)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      💾 Save WhatsApp Channel
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE ADSENSE MONETIZATION SETUP (Admin Only) */}
              {whatsappAdminUnlocked && whatsappTab === 'adsense' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm text-blue-950">
                        💰 Connect Elimika Online to Google AdSense
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Privacy Policy &amp; Terms Ready ✓
                      </span>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-700">
                      <li>
                        <strong>Step 1 — Get a Custom Domain:</strong> Google AdSense requires a top-level custom domain (such as <code>elimikaonline.co.tz</code> or <code>elimika.com</code>) rather than a temporary preview URL.
                      </li>
                      <li>
                        <strong>Step 2 — Sign Up at Google AdSense:</strong> Go to{' '}
                        <a
                          href="https://www.google.com/adsense/start/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-bold"
                        >
                          google.com/adsense
                        </a>{' '}
                        with your Gmail (<code>mohamedshabani751@gmail.com</code>) and add your website URL.
                      </li>
                      <li>
                        <strong>Step 3 — Copy Your Publisher ID:</strong> Google will give you a Publisher ID that looks like <code>ca-pub-1234567890123456</code>. Paste it below (or send it in chat so we hardcode it into <code>index.html</code> and <code>/public/ads.txt</code>).
                      </li>
                      <li>
                        <strong>Step 4 — Turn On Auto Ads:</strong> In your AdSense dashboard under <strong>Ads → Overview → By site</strong>, toggle <strong>Auto ads ON</strong> so Google automatically places clean educational banners without slowing down past papers or quizzes.
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <label className="font-bold text-slate-800 block">
                      Your Google AdSense Publisher ID (e.g. <code>ca-pub-1234567890123456</code>)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={adsensePubId}
                        onChange={(e) => setAdsensePubId(e.target.value)}
                        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cleaned = adsensePubId.trim();
                          try {
                            localStorage.setItem('elimika_adsense_pub_id', cleaned);
                            showToast('✅ Google AdSense Publisher ID saved & injected into <head>!');
                          } catch {
                            showToast('⚠️ Could not save Publisher ID.');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0"
                      >
                        💾 Activate AdSense Tag
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-2 pt-1 border-t border-slate-200">
                      <div>
                        Your <code>https://elimika.online/ads.txt</code> content for Google verification:{' '}
                        <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-bold">
                          google.com, pub-7502193981138651, DIRECT, f08c47fec0942fa0
                        </code>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="/elimika-tanzania-website.html"
                          download="index.html"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1"
                        >
                          <span>⬇️ Download index.html (for elimika.online)</span>
                        </a>
                        <a
                          href="/ads.txt"
                          download="ads.txt"
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1"
                        >
                          <span>⬇️ Download ads.txt (for elimika.online)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Discreet Owner / Admin Footer Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>🔒 100% Private WhatsApp Channel — Followers cannot see your phone number</span>
                {whatsappAdminUnlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappAdminUnlocked(false);
                      setWhatsappTab('join');
                      setWhatsappAdminPinPrompt(false);
                      setWhatsappAdminPinInput('');
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    🔒 Lock Admin Mode
                  </button>
                ) : whatsappAdminPinPrompt ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="password"
                      value={whatsappAdminPinInput}
                      onChange={(e) => setWhatsappAdminPinInput(e.target.value)}
                      placeholder="Admin Code"
                      className="px-2 py-1 rounded-lg border border-slate-300 text-slate-700 text-[11px] w-24 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cleaned = whatsappAdminPinInput.trim().toLowerCase();
                        if (cleaned === 'elimika' || cleaned === '2026' || cleaned === 'admin') {
                          setWhatsappAdminUnlocked(true);
                          setWhatsappTab('broadcast');
                          setWhatsappAdminPinPrompt(false);
                          setWhatsappAdminPinInput('');
                          showToast('🔓 Admin Tools unlocked (Post Generator, Logo & Setup).');
                        } else {
                          showToast('❌ Invalid Admin Code.');
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Unlock
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappAdminPinPrompt(false);
                        setWhatsappAdminPinInput('');
                      }}
                      className="text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setWhatsappAdminPinPrompt(true)}
                    className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                    title="Channel Owner Tools"
                  >
                    ⚙️ Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* FOOTER (Hidden when inside full-viewport Moha AI workspace or full-screen Game) */}
      {activePage !== 'moha' && activePage !== 'game' && (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs text-center mt-auto">
          <div className="max-w-5xl mx-auto px-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <div className="font-black text-white text-sm tracking-tight">ELIMIKA TANZANIA</div>
                <p className="text-slate-400 text-xs">
                  Past Papers, Marking Schemes, TIE Books, Official Syllabuses &amp; Moha AI Teacher Studio.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
                <a
                  href={whatsappConfig.mainChannelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  🔔 Follow Elimika Online Channel
                </a>
                <button
                  type="button"
                  onClick={() => setWhatsappModalOpen(true)}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
                >
                  💬 WhatsApp Channel
                </button>
                <button
                  type="button"
                  onClick={() => openBooksPage()}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  📚 TIE Books
                </button>
                <button
                  type="button"
                  onClick={() => openSyllabusPage()}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  📜 Syllabus
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('privacy')}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('terms')}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('about')}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  About &amp; Contact
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>© {new Date().getFullYear()} Elimika Tanzania. All rights reserved.</span>
              <span>100% English Interface · TIE &amp; NECTA Curriculum Aligned</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
