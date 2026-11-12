import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft,
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
  matchesSmartSearchTokens,
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
import { VirtualScienceLab } from './components/VirtualScienceLab';
import {
  MathText,
  renderLatexSnippet,
  renderMathTextToHtml,
  renderRichMathParagraphToPng,
  typesetMathInElement,
} from './utils/mathRenderer';
import { TextbookQuestionExtractorModal } from './components/TextbookQuestionExtractorModal';
import { getQuestionDiagramSvg } from './utils/questionDiagramGenerator';
import {
  addQuestionsToStoredBank,
  filterAndPrioritizeUnseenQuizItems,
  getQuestionBankStats,
  getSeenSignaturesForClassSubject,
  getStoredBankQuestionsForClassSubject,
  getVariantOffsetForClassSubject,
  incrementVariantOffsetForClassSubject,
  markQuestionAsSeenByStudent,
  markQuestionsBatchAsSeenByStudent,
  syncQuestionBankWithServer,
} from './utils/questionBankManager';

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
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isStaticCustomDomain = hostname.includes('github.io');

  if (!isFileProtocol && !isStaticCustomDomain) {
    try {
      const localRes = await fetch(endpointPath, options);
      const contentType = localRes.headers.get('content-type') || '';
      if (localRes.ok && contentType.includes('application/json')) {
        return localRes;
      }
    } catch (err) {
      if (options?.signal?.aborted) {
        throw err;
      }
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
  return /^(\/|https?:\/\/)/i.test(clean) ? clean : null;
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
  const deduplicatedMap = new Map<string, PaperRecord>();

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
      const rawCatOnlyLower = rawCatClean.toLowerCase();
      const catWithoutBookkeeping = catLower.replace(/book[- ]?keeping/gi, '');
      const isExplicitBookCat =
        /\b(book|kitabu|textbook)\b/i.test(rawCatOnlyLower) && !/keeping/i.test(rawCatOnlyLower);

      const isSyllabus =
        !isExplicitBookCat &&
        (rawCatOnlyLower.includes('syllabus') ||
          rawCatOnlyLower.includes('muhtasari') ||
          (/\b(syllabus|muhtasari)\b/i.test(catWithoutBookkeeping) &&
            !/\bnew\s+syllabus\b/i.test(catWithoutBookkeeping)));
      const isBook =
        !isSyllabus &&
        (isExplicitBookCat || /\b(book|kitabu|textbook|tie\s+book)\b/i.test(catWithoutBookkeeping));

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

      const item: PaperRecord = {
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
      };
      const dedupKey = `${item.form}|${item.subject}|${item.year}|${item.title}`.toLowerCase();
      const existing = deduplicatedMap.get(dedupKey);
      if (!existing || (!existing.paperUrl && item.paperUrl) || (!existing.answersUrl && item.answersUrl)) {
        deduplicatedMap.set(dedupKey, item);
      }
    }
    for (const r of deduplicatedMap.values()) {
      records.push(r);
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
        `<div style="margin-top:10px; margin-bottom:4px; padding:6px 10px; background:var(--bg-elevated); border-left:3px solid #6366f1; border-radius:6px; font-weight:700; color:var(--text-primary);">${formattedLine}</div>`
      );
    } else if (/^(•|-|\*)\s+/.test(trimmed)) {
      outLines.push(
        `<div style="margin-left:10px; margin-top:3px; margin-bottom:3px; padding-left:8px; border-left:2px solid var(--border-strong); color:var(--text-primary);">${formattedLine}</div>`
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
    'papers' | 'books' | 'syllabus' | 'daily_quiz' | 'virtual_lab' | 'moha' | 'game'
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
  const [classTierFilter, setClassTierFilter] = useState<'ALL' | 'Secondary' | 'Primary'>('ALL');
  const [recentPapers, setRecentPapers] = useState<
    Array<{ id: string; title: string; form: string; subject: string; year: string }>
  >([]);

  // Dedicated Books Page State
  const [booksPageLevel, setBooksPageLevel] = useState<'ALL' | 'Primary' | 'Secondary' | 'Advanced'>('ALL');
  const [booksPageSelectedClass, setBooksPageSelectedClass] = useState<string>('ALL');
  const [booksSearchQuery, setBooksSearchQuery] = useState<string>('');
  const [showUpcomingBooks, setShowUpcomingBooks] = useState<boolean>(false);

  // Dedicated Syllabus Page State
  const [syllabusPageLevel, setSyllabusPageLevel] = useState<'ALL' | 'Primary' | 'Secondary' | 'Advanced'>('ALL');
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState<string>('');
  const [showUpcomingSyllabuses, setShowUpcomingSyllabuses] = useState<boolean>(false);

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
  const [mohaViewMode, setMohaViewMode] = useState<'chat' | 'studio' | 'quiz' | 'diagram'>('chat');
  const [activeDiagramPreset, setActiveDiagramPreset] = useState<DiagramPreset>('physics_ohm');
  const [mohaActiveClass, setMohaActiveClass] = useState<string>(() => {
    try {
      return localStorage.getItem('elimika_moha_active_class_v1') || 'Form 3';
    } catch {
      return 'Form 3';
    }
  });
  const [mohaActiveSubject, setMohaActiveSubject] = useState<string>(() => {
    try {
      return localStorage.getItem('elimika_moha_active_subject_v1') || 'Basic Mathematics';
    } catch {
      return 'Basic Mathematics';
    }
  });
  const [mohaMessages, setMohaMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem('elimika_moha_chat_history_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: ChatMessage) =>
            m.text === 'Moha AI is thinking...'
              ? {
                  ...m,
                  text: '⚠️ Request was interrupted when switching apps. Tap **Send** or ask your question again for an instant step-by-step solution.',
                }
              : m
          );
        }
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
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
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | 'about' | null>(null);
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('elimika_cookie_consent') === 'accepted';
    } catch {
      return false;
    }
  });
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);
  const [whatsappTab, setWhatsappTab] = useState<'join' | 'broadcast' | 'logo' | 'setup' | 'adsense' | 'playstore'>('join');
  const [whatsappAdminUnlocked, setWhatsappAdminUnlocked] = useState<boolean>(false);
  const [whatsappAdminPinPrompt, setWhatsappAdminPinPrompt] = useState<boolean>(false);
  const [whatsappAdminPinInput, setWhatsappAdminPinInput] = useState<string>('');
  const [playStorePackageName, setPlayStorePackageName] = useState<string>(() => {
    try {
      return localStorage.getItem('elimika_playstore_pkg') || 'online.elimika.twa';
    } catch {
      return 'online.elimika.twa';
    }
  });
  const [playStoreSha256, setPlayStoreSha256] = useState<string>(() => {
    const defaultFingerprints = [
      'AF:36:16:F9:1A:D7:5F:B0:F4:BC:13:6C:EB:F3:F0:20:C8:B2:F5:2C:27:E7:15:98:08:0B:7D:A2:63:EB:17:84',
      '0E:F7:F5:2A:AD:EA:10:C4:F9:5E:BE:08:1F:A4:61:EC:15:D0:11:19:D7:36:0B:84:AE:43:F9:85:D1:5D:1C:39',
      '28:C5:33:47:35:D2:92:50:EA:30:BC:F2:26:AF:A8:FD:DF:B2:75:01:C3:0D:08:E0:4A:CF:EF:93:B1:55:72:9B',
      'BD:01:CB:07:B7:1E:E8:B5:E0:86:6D:AE:A1:81:9B:CC:A0:F3:49:8E:21:2C:F2:60:0B:3C:B7:07:EC:29:70:FC',
    ].join(',\n');
    try {
      const saved = localStorage.getItem('elimika_playstore_sha256');
      if (!saved || !saved.includes('AF:36:16:F9:1A:D7:5F:B0')) {
        localStorage.setItem('elimika_playstore_sha256', defaultFingerprints);
        return defaultFingerprints;
      }
      return saved;
    } catch {
      return defaultFingerprints;
    }
  });
  const [adsensePubId, setAdsensePubId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('elimika_adsense_pub_id');
      if (!saved || saved === 'ca-pub-7502193981138651') {
        localStorage.setItem('elimika_adsense_pub_id', 'ca-pub-7814843623545511');
        return 'ca-pub-7814843623545511';
      }
      return saved;
    } catch {
      return 'ca-pub-7814843623545511';
    }
  });
  const [profileLogoTheme, setProfileLogoTheme] = useState<'blue_black' | 'blue_white' | 'black_blue'>('blue_black');
  const [whatsappConfig, setWhatsappConfig] = useState<{
    channelName: string;
    mainChannelUrl: string;
    supportWhatsappNumber: string;
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
          const savedNum = parsed.supportWhatsappNumber;
          const resolvedNum =
            !savedNum || savedNum === '255748404500' || savedNum === '255700000000'
              ? CONFIG.ADMIN_WHATSAPP
              : savedNum;
          return {
            ...parsed,
            supportWhatsappNumber: resolvedNum,
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return {
      channelName: 'Elimika Online',
      mainChannelUrl: 'https://whatsapp.com/channel/0029VbE4Ctl0G0Xbp8kQwu0t',
      supportWhatsappNumber: CONFIG.ADMIN_WHATSAPP,
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
      showToast('✅ WhatsApp Channel & Support Number saved!');
    } catch {
      showToast('⚠️ Could not save links in browser storage.');
    }
  };

  function getRequestPaperWhatsAppUrl(cls?: string, sub?: string, issueContext?: string): string {
    const cleanPhone = (whatsappConfig.supportWhatsappNumber || CONFIG.ADMIN_WHATSAPP || '')
      .replace(/[^0-9]/g, '');
    const targetCls = cls || selectedClass || 'Form 4';
    const targetSub = sub || selectedSubject || 'General';
    const msg = issueContext
      ? `Hello Elimika Tanzania Team 👋,\nI would like to report/request: *${issueContext}* (${targetCls} • ${targetSub}).\nLink: ${window.location.href}`
      : `Hello Elimika Tanzania Team 👋,\nPlease upload or share past papers / TIE book for *${targetCls} — ${targetSub}*.\nLink: ${window.location.href}`;
    if (cleanPhone && cleanPhone.length >= 9 && cleanPhone !== '255700000000') {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  function buildShareableSubjectUrl(cls: string, sub?: string): string {
    const base = `${window.location.origin}${window.location.pathname}`;
    const clsSlug = encodeURIComponent(cls.replace(/\s+/g, '-'));
    if (sub && sub.trim()) {
      const subSlug = encodeURIComponent(sub.replace(/\s+/g, '-'));
      return `${base}#class=${clsSlug}&subject=${subSlug}`;
    }
    return `${base}#class=${clsSlug}`;
  }

  function copyShareableSubjectLink(cls: string, sub?: string) {
    const url = buildShareableSubjectUrl(cls, sub);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    showToast(`🔗 Direct link copied: ${sub ? `${cls} ${sub}` : cls}`);
  }

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

  const downloadPlayStoreFeatureGraphicPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1024x500 Google Play Store Feature Graphic (No alpha channel, 24-bit RGB compliant)
    const grad = ctx.createLinearGradient(0, 0, 1024, 500);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.55, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 500);

    // Subtle decorative geometric grid circles
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(880, 250, 210, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(880, 250, 145, 0, Math.PI * 2);
    ctx.stroke();

    // Left badge pill
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(64, 72, 370, 42, 21);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TANZANIA EDUCATION SUPER-APP', 86, 99);

    // Main Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 78px Inter, system-ui, sans-serif';
    ctx.fillText('ELIMIKA TZ', 64, 205);

    // Subtitle
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '700 30px Inter, system-ui, sans-serif';
    ctx.fillText('NECTA Past Papers • TIE Books • Moha AI Solver', 64, 262);

    // Feature bullets
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 23px Inter, system-ui, sans-serif';
    ctx.fillText('✓ Primary (Std 1–7) & Secondary (Form 1–6) Curriculum', 64, 330);
    ctx.fillText('✓ Step-by-Step Photo & Math Question Solver (Moha AI)', 64, 372);
    ctx.fillText('✓ Non-Repeating Textbook Exercise Quizzes & STEM Games', 64, 414);

    // Right Emblem Circle
    ctx.save();
    ctx.translate(860, 250);
    ctx.beginPath();
    ctx.arc(0, 0, 115, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.fillStyle = '#1d4ed8';
    ctx.textAlign = 'center';
    ctx.font = '900 84px Inter, system-ui, sans-serif';
    ctx.fillText('E', 0, 30);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Elimika-PlayStore-Feature-Graphic-1024x500.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ Downloaded 1024×500 Google Play Store Feature Graphic PNG!');
  };

  const downloadPlayStoreAppIcon512Png = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#1d4ed8');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 224, 0, Math.PI * 2);
    ctx.stroke();

    // Graduation Cap
    ctx.save();
    ctx.translate(256, 155);
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(105, -8);
    ctx.lineTo(0, 32);
    ctx.lineTo(-105, -8);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 76px Inter, system-ui, sans-serif';
    ctx.fillText('ELIMIKA', 256, 298);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(146, 326, 220, 46, 23);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.font = '900 26px Inter, system-ui, sans-serif';
    ctx.fillText('TANZANIA', 256, 358);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '800 18px Inter, system-ui, sans-serif';
    ctx.fillText('STD 1–7 • FORM 1–6', 256, 415);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Elimika-PlayStore-Icon-512x512.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ Downloaded 512×512 Google Play Store High-Res App Icon PNG!');
  };

  useEffect(() => {
    try {
      localStorage.setItem('elimika_moha_active_class_v1', mohaActiveClass);
      localStorage.setItem('elimika_moha_active_subject_v1', mohaActiveSubject);
    } catch {
      // ignore storage errors
    }
  }, [mohaActiveClass, mohaActiveSubject]);

  useEffect(() => {
    if (mohaMessages.length === 0) return;
    try {
      // Persist recent 25 messages (stripping huge base64 image previews to stay well under localStorage quota)
      const compact = mohaMessages.slice(-25).map((m) => ({
        ...m,
        imagePreview: m.imagePreview && m.imagePreview.length > 120000 ? undefined : m.imagePreview,
      }));
      localStorage.setItem('elimika_moha_chat_history_v2', JSON.stringify(compact));
    } catch {
      // ignore storage quota errors
    }
  }, [mohaMessages]);


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
  const [quizPageIndex, setQuizPageIndex] = useState<number>(0);
  const [quizShowAll, setQuizShowAll] = useState<boolean>(false);
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
  const [textbookExtractorModalOpen, setTextbookExtractorModalOpen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const savedMode = localStorage.getItem('elimika_theme_mode');
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        return savedMode;
      }
      const legacy = localStorage.getItem('elimika_dark_mode');
      if (legacy === 'true') return 'dark';
      if (legacy === 'false') return 'light';
      return 'system';
    } catch {
      return 'system';
    }
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    try {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  const selectThemeMode = (nextMode: 'light' | 'dark' | 'system') => {
    setThemeMode(nextMode);
    try {
      localStorage.setItem('elimika_theme_mode', nextMode);
      const resolvedDark =
        nextMode === 'dark' ||
        (nextMode === 'system' && (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false));
      localStorage.setItem('elimika_dark_mode', String(resolvedDark));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleOsThemeChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    setSystemPrefersDark(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handleOsThemeChange);
    }
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'elimika_theme_mode' && (e.newValue === 'light' || e.newValue === 'dark' || e.newValue === 'system')) {
        setThemeMode(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleOsThemeChange);
      }
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    root.setAttribute('data-theme-mode', themeMode);
    try {
      localStorage.setItem('elimika_theme_mode', themeMode);
      localStorage.setItem('elimika_dark_mode', String(darkMode));
    } catch {
      // ignore storage errors
    }
  }, [darkMode, themeMode]);

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
    setActivePage('daily_quiz');
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
    const applyDeepLinkFromHash = (): boolean => {
      const rawHash = (window.location.hash || '').replace(/^#/, '').trim();
      if (!rawHash) return false;

      if (rawHash.includes('class=') || rawHash.includes('subject=') || rawHash.includes('page=') || rawHash.includes('q=')) {
        const params = new URLSearchParams(rawHash);
        const pageParam = (params.get('page') || '').trim().toLowerCase();
        const rawCls = (params.get('class') || params.get('cls') || '').replace(/-/g, ' ').trim();
        const rawSub = (params.get('subject') || params.get('sub') || '').replace(/-/g, ' ').trim();
        const rawQ = (params.get('q') || params.get('search') || '').replace(/-/g, ' ').trim();
        const rawYr = (params.get('year') || '').trim();
        const rawCat = (params.get('cat') || params.get('category') || '').trim();

        const normCls = rawCls ? normalizeClassName(rawCls) : '';
        const officialSubs = normCls ? TIE_CURRICULUM_SUBJECTS[normCls] || [] : [];
        const matchedOfficialSub =
          rawSub && officialSubs.length > 0
            ? officialSubs.find((s) => matchesSubjectQuery(rawSub, s) || s.toLowerCase() === rawSub.toLowerCase()) ||
              normalizeSubjectName(rawSub, rawSub)
            : rawSub
            ? normalizeSubjectName(rawSub, rawSub)
            : '';

        if (pageParam === 'books') {
          openBooksPage(normCls, matchedOfficialSub || rawQ);
          return true;
        }
        if (pageParam === 'syllabus') {
          setActivePage('syllabus');
          if (rawQ || matchedOfficialSub) setSyllabusSearchQuery(rawQ || matchedOfficialSub);
          return true;
        }
        if (pageParam === 'daily_quiz' || pageParam === 'daily-quiz') {
          openDailyQuizPage(normCls || undefined, matchedOfficialSub || undefined);
          return true;
        }

        if (rawQ) {
          setActivePage('papers');
          setSearchQuery(rawQ);
          setStep(3);
          return true;
        }

        if (normCls && matchedOfficialSub) {
          setActivePage('papers');
          setSelectedClass(normCls);
          setSelectedSubject(matchedOfficialSub);
          setSelectedYear(rawYr || 'ALL');
          setSelectedCategory(rawCat || 'ALL');
          setPage(1);
          setStep(3);
          return true;
        }

        if (normCls) {
          setActivePage('papers');
          setSelectedClass(normCls);
          setSelectedSubject('');
          setStep(2);
          return true;
        }
      }
      return false;
    };

    if (parsedChallenge) {
      loadSharedChallengeFromUrl(
        parsedChallenge.id,
        parsedChallenge.cls,
        parsedChallenge.sub,
        parsedChallenge.topic,
        parsedChallenge.by
      );
    } else if (applyDeepLinkFromHash()) {
      // Handled via #class=...&subject=... deep link
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
      } else if (applyDeepLinkFromHash()) {
        // Deep link applied
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
        let nextHash = window.location.hash;
        if (!nextHash.includes('challenge=')) {
          if (activePage === 'papers') {
            if (step === 3 && selectedClass && selectedSubject) {
              nextHash = `#class=${encodeURIComponent(selectedClass.replace(/\s+/g, '-'))}&subject=${encodeURIComponent(selectedSubject.replace(/\s+/g, '-'))}`;
            } else if (step === 2 && selectedClass) {
              nextHash = `#class=${encodeURIComponent(selectedClass.replace(/\s+/g, '-'))}`;
            } else if (step === 1) {
              nextHash = '';
            }
          } else if (activePage === 'books') {
            nextHash = '#books';
          } else if (activePage === 'syllabus') {
            nextHash = '#syllabus';
          } else if (activePage === 'daily_quiz') {
            nextHash = '#daily-quiz';
          } else if (activePage === 'moha') {
            nextHash = '#moha';
          } else if (activePage === 'game') {
            nextHash = '#play';
          }
        }
        const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
        window.history.pushState(
          { elimikaNav: true, idx: stack.length - 1, ...nextSnap },
          '',
          nextUrl
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
          matchesSubjectQuery(p.subject, subVal, p.title) &&
          (matchesFormRange(p.form, clsVal) || p.isUserAttached)
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
          matchesSubjectQuery(p.subject, subVal, p.title) &&
          (matchesFormRange(p.form, clsVal) || p.isUserAttached)
      )
    );
    const matchingSyllabuses = sortByRelevance(
      allPapers.filter(
        (p) =>
          p.isSyllabus &&
          matchesSubjectQuery(p.subject, subVal, p.title) &&
          matchesFormRange(p.form, clsVal)
      )
    );
    const matchingPapers = sortByRelevance(
      allPapers.filter(
        (p) =>
          !p.isBook &&
          !p.isSyllabus &&
          matchesSubjectQuery(p.subject, subVal, p.title) &&
          (matchesFormRange(p.form, clsVal) || p.isUserAttached)
      )
    );

    const crossPapers = matchingPapers;

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

  function mergePapersWithAttached(sheetItems: PaperRecord[], customItems: PaperRecord[]): PaperRecord[] {
    const sanitizeRecord = (item: PaperRecord): PaperRecord => ({
      ...item,
      form: normalizeClassName(item.form),
      subject: normalizeSubjectName(item.subject || 'General', item.title || ''),
    });
    const byId = new Map<string, PaperRecord>();
    for (const c of customItems) {
      byId.set(c.id, sanitizeRecord(c));
    }
    for (const s of sheetItems) {
      if (!byId.has(s.id)) {
        byId.set(s.id, sanitizeRecord(s));
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
      localStorage.removeItem('elimika_papers_cache_v3');
      const cached = localStorage.getItem('elimika_papers_cache_v5');
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
      localStorage.setItem('elimika_papers_cache_v5', JSON.stringify(processed));
      setAllPapers(mergePapersWithAttached(processed, localCustom));
      setSyncStatus('live');
    } catch {
      setSyncStatus('error');
    }
  }

  async function handleSaveNewAttachedResource(e: React.FormEvent) {
    e.preventDefault();
    const cleanClass = normalizeClassName(newResClass);
    const title = newResTitle.trim() || `${cleanClass} ${newResSubject} — ${newResCategory} (${newResYear})`;
    const cleanSubject = normalizeSubjectName(newResSubject, title);
    const catLower = `${newResCategory} ${title}`.toLowerCase();
    const rawCatOnlyLower = newResCategory.toLowerCase();
    const catWithoutBookkeeping = catLower.replace(/book[- ]?keeping/gi, '');
    const isExplicitBookCat =
      /\b(book|kitabu|textbook)\b/i.test(rawCatOnlyLower) && !/keeping/i.test(rawCatOnlyLower);
    const isSyllabus =
      !isExplicitBookCat &&
      (rawCatOnlyLower.includes('syllabus') ||
        rawCatOnlyLower.includes('muhtasari') ||
        (/\b(syllabus|muhtasari)\b/i.test(catWithoutBookkeeping) &&
          !/\bnew\s+syllabus\b/i.test(catWithoutBookkeeping)));
    const isBook =
      !isSyllabus &&
      (isExplicitBookCat || /\b(book|kitabu|textbook|tie\s+book)\b/i.test(catWithoutBookkeeping));

    const id = `attached-${Date.now()}`;
    const created: PaperRecord = {
      id,
      title,
      form: cleanClass,
      subject: cleanSubject,
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
    const safeCls = typeof customClass === 'string' ? customClass : undefined;
    const safeSub = typeof customSubject === 'string' ? customSubject : undefined;
    const safeTop = typeof customTopic === 'string' ? customTopic : undefined;
    const safeSubTop = typeof customSubTopic === 'string' ? customSubTopic : undefined;

    const cls = safeCls || selectedClass || savedClass || mohaActiveClass || 'Form 1';
    const sub =
      safeSub ||
      selectedSubject ||
      mohaActiveSubject ||
      (TIE_CURRICULUM_SUBJECTS[cls]?.[0] ?? 'Basic Mathematics');
    const firstTopic = safeTop || 'ALL';
    const firstSubTopic = safeSubTop || 'ALL';
    const src = customSource || selectedQuizSourceFilter || 'ALL';

    setActivePage('daily_quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startAiQuiz(cls, sub, firstTopic, firstSubTopic, src, true);
  }

  function openVirtualLabPage(customClass?: string) {
    if (customClass) setMohaActiveClass(customClass);
    setActivePage('virtual_lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    initialView: 'chat' | 'studio' | 'quiz' | 'diagram' = 'chat',
    focusedDoc?: PaperRecord
  ) {
    const targetCls = focusedDoc?.form || cls || selectedClass || 'Form 3';
    const targetSub = focusedDoc?.subject || sub || selectedSubject || 'Basic Mathematics';
    if (initialView === 'quiz') {
      openDailyQuizPage(targetCls, targetSub);
      return;
    }
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
    showToast(`✅ Mastered "${card.topic}"! Saved to Moha AI Memory.`);
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

    // Render instant TIE / PO-RALG document immediately (0ms) so the user never waits on a spinner
    const instantHtml = buildInstantOfficialDocument(type, meta);
    setStudioPreviewHtml(instantHtml);
    const userMsgId = `user-doc-${Date.now()}`;
    const docMsgId = `ai-doc-${Date.now() + 1}`;

    setMohaMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: `${docLabels[type]}: ${meta.topic}`,
      },
      {
        id: docMsgId,
        role: 'ai',
        text: instantHtml,
      },
    ]);
    setGeneratingDocType(null);
    showToast(`✅ Generated ${docLabels[type]}!`);

    // Background AI enrichment if available within 5 seconds
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
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
            prev.map((m) => (m.id === docMsgId ? { ...m, text: data.html } : m))
          );
        }
      }
    } catch {
      // Keep the instant official document already displayed
    }
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

    const recentHistory = mohaMessages
      .slice(-6)
      .map((m) => ({ id: m.id, role: m.role, text: m.text }));

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

    try {
      const controller = new AbortController();
      const requestTimeoutMs = attachedImg ? 34000 : 22000;
      const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
      const response = await fetchElimikaApi('/api/moha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: displayPrompt,
          cls: targetCls,
          subject: targetSub,
          image: attachedImg ? { mimeType: attachedImg.mimeType, base64Data: attachedImg.base64Data } : null,
          history: recentHistory,
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
      // Instant fallback to local smart tutor below
    }

    const localReply = attachedImg
      ? `📷 **Image Processing Interrupted:** It looks like the connection paused or you switched apps while Moha AI was reading your photo.\n\n• **Tap the camera button (📷) and send again** (photos are now automatically compressed for fast mobile solving), OR\n• **Type or dictate (🎤) the question text** below for an instant step-by-step solution!`
      : generateLocalSmartTutorReply(
          displayPrompt,
          targetCls,
          targetSub,
          learnedMemory,
          promptSiteResources,
          recentHistory
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
    explicitFocusedDoc?: PaperRecord | null,
    batchLimit = 20
  ) {
    const safeBatchLimit = typeof batchLimit === 'number' && batchLimit > 0 ? batchLimit : 20;
    const safeCustomClass = typeof customClass === 'string' ? customClass : undefined;
    const safeCustomSubject = typeof customSubject === 'string' ? customSubject : undefined;
    const safeCustomTopic = typeof customTopic === 'string' ? customTopic : undefined;
    const safeCustomSubTopic = typeof customSubTopic === 'string' ? customSubTopic : undefined;

    const activeDoc = explicitFocusedDoc || mohaFocusedResource;
    const targetCls = explicitFocusedDoc?.form || safeCustomClass || mohaActiveClass;
    const targetSub = explicitFocusedDoc?.subject || safeCustomSubject || mohaActiveSubject;
    const targetTopic = safeCustomTopic !== undefined ? safeCustomTopic : selectedQuizTopic;
    const targetSubTopic = safeCustomSubTopic !== undefined ? safeCustomSubTopic : selectedQuizSubTopic;
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
    if (safeCustomTopic !== undefined) setSelectedQuizTopic(safeCustomTopic);
    if (safeCustomSubTopic !== undefined) setSelectedQuizSubTopic(safeCustomSubTopic);
    if (customSourceFilter !== undefined) setSelectedQuizSourceFilter(customSourceFilter);

    if (stayOnDailyQuizPage || activePage === 'daily_quiz') {
      setActivePage('daily_quiz');
    } else {
      setActivePage('moha');
      setMohaOpen(true);
      setMohaViewMode('quiz');
    }
    setQuizLoading(true);
    setQuizPageIndex(0);
    setQuizShowAll(batchLimit > 20);
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

    const seenSet = getSeenSignaturesForClassSubject(targetCls, targetSub);
    const excludeSignatures = Array.from(seenSet);
    const variantOffset = incrementVariantOffsetForClassSubject(targetCls, targetSub);

    // Check if we already have rich unseen textbook exercise questions in the built-in/stored bank for this Class & Subject
    const storedForSubject = getStoredBankQuestionsForClassSubject(targetCls, targetSub, targetTopic);
    const fallbackPool = buildContentIntegratedQuizQuestions(
      targetCls,
      targetSub,
      targetTopic,
      quizSiteResources,
      targetSubTopic,
      targetSourceFilter
    );

    if (storedForSubject.length > 0) {
      const fullTopicBatch = filterAndPrioritizeUnseenQuizItems(
        targetCls,
        targetSub,
        targetTopic,
        fallbackPool,
        Math.max(200, storedForSubject.length, safeBatchLimit)
      );
      markQuestionsBatchAsSeenByStudent(targetCls, targetSub, fullTopicBatch.slice(0, 20));
      setQuizItems(fullTopicBatch);
      setQuizLoading(false);
      return;
    }

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
          excludeSignatures,
          variantOffset,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          addQuestionsToStoredBank(
            data.questions.map((q: QuizItem) => ({
              cls: targetCls,
              subject: targetSub,
              topic: q.topic || targetTopic || 'Core Competence',
              subTopic: q.subTopic || targetSubTopic || q.topic || 'Core Competence',
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              textbookTitle:
                q.sourceRef || activeDoc?.title || `Official TIE ${targetCls} ${targetSub} Student's Book`,
            }))
          );

          const merged = [...data.questions];
          for (const fq of fallbackPool) {
            if (merged.length >= 25) break;
            if (!merged.some((q) => q.question === fq.question)) {
              merged.push(fq);
            }
          }
          const prioritizedUnseen = filterAndPrioritizeUnseenQuizItems(
            targetCls,
            targetSub,
            targetTopic,
            merged,
            20
          );
          markQuestionsBatchAsSeenByStudent(targetCls, targetSub, prioritizedUnseen);
          setQuizItems(prioritizedUnseen);
          setQuizLoading(false);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const finalFallbackBatch = filterAndPrioritizeUnseenQuizItems(
      targetCls,
      targetSub,
      targetTopic,
      fallbackPool,
      Math.max(200, fallbackPool.length, safeBatchLimit)
    );
    markQuestionsBatchAsSeenByStudent(targetCls, targetSub, finalFallbackBatch.slice(0, 20));
    setQuizItems(finalFallbackBatch);
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

    // Immediately record this question in the student's seen-question tracker so it won't repeat in future quizzes or games
    const answeredItem = quizItems[qIdx];
    if (answeredItem && answeredItem.question) {
      markQuestionAsSeenByStudent(mohaActiveClass, mohaActiveSubject, answeredItem.question);
    }

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

  function handleToggleQuizSolution(qIdx: number) {
    if (quizSelectedAnswers[qIdx] !== undefined) {
      const nextAnswers = { ...quizSelectedAnswers };
      delete nextAnswers[qIdx];
      setQuizSelectedAnswers(nextAnswers);
      return;
    }
    const correctIdx = quizItems[qIdx]?.correctIndex ?? 0;
    handleSelectQuizOption(qIdx, correctIdx);
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
      if (file.type.startsWith('image/')) {
        // Compress & resize large mobile camera photos (max 1600px, JPEG 0.82) for fast, reliable AI Vision solving
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let targetW = img.width;
          let targetH = img.height;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW >= targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            const base64Data = compressedDataUrl.split(',')[1];
            setMohaPendingImage({
              mimeType: 'image/jpeg',
              base64Data,
              previewUrl: compressedDataUrl,
              fileName: file.name,
            });
            showToast(`📷 Photo optimized & attached! Tap Send for step-by-step solutions.`);
            return;
          }
          const rawBase64 = resultStr.split(',')[1];
          setMohaPendingImage({
            mimeType: file.type,
            base64Data: rawBase64,
            previewUrl: resultStr,
            fileName: file.name,
          });
          showToast(`📎 Attached "${file.name}" for Moha AI analysis!`);
        };
        img.onerror = () => {
          const rawBase64 = resultStr.split(',')[1];
          setMohaPendingImage({
            mimeType: file.type,
            base64Data: rawBase64,
            previewUrl: resultStr,
            fileName: file.name,
          });
        };
        img.src = resultStr;
        return;
      }

      const base64Data = resultStr.split(',')[1];
      setMohaPendingImage({
        mimeType: file.type || 'application/pdf',
        base64Data,
        previewUrl: '',
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
      return normalizeClassName(p.form).toLowerCase() === selectedClass.toLowerCase();
    });
    const counts: Record<string, number> = {};
    const officialSubs = TIE_CURRICULUM_SUBJECTS[selectedClass] || [];
    officialSubs.forEach((s) => {
      counts[s] = 0;
    });
    classItems.forEach((p) => {
      const normalizedSub = normalizeSubjectName(p.subject, p.title);
      const matchedOfficial = officialSubs.find((s) => matchesSubjectQuery(normalizedSub, s));
      const key = matchedOfficial || normalizedSub;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [allPapers, selectedClass]);

  const { filteredPapers, availableYears } = React.useMemo(() => {
    let baseMatches: PaperRecord[] = [];
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      baseMatches = allPapers.filter((p) => {
        if (p.isSyllabus || p.isBook) return false;
        return matchesSmartSearchTokens(
          q,
          `${p.title} ${p.subject} ${p.form} ${p.year} ${p.category}`
        );
      });
    } else {
      baseMatches = allPapers.filter((p) => {
        if (p.isSyllabus || p.isBook) return false;
        const matchClass = normalizeClassName(p.form).toLowerCase() === selectedClass.toLowerCase();
        const matchSub = matchesSubjectQuery(p.subject, selectedSubject, p.title);
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
    const q = booksSearchQuery.trim();
    const list = allPapers.filter((p) => {
      if (!p.isBook) return false;
      if (!matchesSyllabusTier(p.form, booksPageLevel)) return false;
      if (booksPageSelectedClass !== 'ALL' && p.form.toLowerCase() !== booksPageSelectedClass.toLowerCase())
        return false;
      if (q && !matchesSmartSearchTokens(q, `${p.title} ${p.subject} ${p.form} ${p.year}`)) return false;
      return true;
    });
    list.sort((a, b) => (b.paperUrl ? 1 : 0) - (a.paperUrl ? 1 : 0));
    return list;
  }, [allPapers, booksPageLevel, booksPageSelectedClass, booksSearchQuery]);

  const availableUploadedBooks = React.useMemo(
    () => dedicatedBooks.filter((b) => Boolean(b.paperUrl || b.customContent)),
    [dedicatedBooks]
  );
  const upcomingPlaceholderBooks = React.useMemo(
    () => dedicatedBooks.filter((b) => !b.paperUrl && !b.customContent),
    [dedicatedBooks]
  );

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
    const q = syllabusSearchQuery.trim();
    const list = allPapers.filter((p) => {
      if (!p.isSyllabus) return false;
      if (!matchesSyllabusTier(p.form, syllabusPageLevel)) return false;
      if (q && !matchesSmartSearchTokens(q, `${p.title} ${p.subject} ${p.form} ${p.year}`)) return false;
      return true;
    });
    list.sort((a, b) => (b.paperUrl ? 1 : 0) - (a.paperUrl ? 1 : 0));
    return list;
  }, [allPapers, syllabusPageLevel, syllabusSearchQuery]);

  const availableUploadedSyllabuses = React.useMemo(
    () => dedicatedSyllabuses.filter((s) => Boolean(s.paperUrl || s.customContent)),
    [dedicatedSyllabuses]
  );
  const upcomingPlaceholderSyllabuses = React.useMemo(
    () => dedicatedSyllabuses.filter((s) => !s.paperUrl && !s.customContent),
    [dedicatedSyllabuses]
  );

  // Automatically extract real chapters from any attached TIE Textbook PDF when Class/Subject/Book changes
  useEffect(() => {
    const targetCls = mohaViewMode === 'studio' ? tsClass || mohaActiveClass : mohaActiveClass || tsClass;
    const targetSub = mohaViewMode === 'studio' ? tsSubject || mohaActiveSubject : mohaActiveSubject || tsSubject;
    const mapKey = `${targetCls}__${targetSub}`;
    if (extractedBookChaptersMap[mapKey]?.length) return;

    const focused = activeSiteResources.focusedResource;
    const bookWithCustomContent =
      (focused && focused.isBook && focused.customContent ? focused : null) ||
      activeSiteResources.books.find((b) => b.customContent) ||
      null;

    if (!bookWithCustomContent?.customContent) return;

    let cancelled = false;
    fetch('/api/moha/extract-book-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperUrl: bookWithCustomContent.paperUrl || '',
        cls: targetCls,
        subject: targetSub,
        customContent: bookWithCustomContent.customContent || '',
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
    const isStudioMode = activePage === 'moha' && mohaViewMode === 'studio';
    const targetCls = isStudioMode ? tsClass || mohaActiveClass : mohaActiveClass || tsClass;
    const targetSub = isStudioMode ? tsSubject || mohaActiveSubject : mohaActiveSubject || tsSubject;
    const baseTopics = getSyllabusTopicsForClassSubject(targetCls, targetSub);
    const mapKey = `${targetCls}__${targetSub}`;

    // Only override with user-attached PDF/text extraction if the user explicitly focused an attached book for this exact class & subject
    const focused = activeSiteResources.focusedResource;
    const focusedMatchesCurrent =
      focused &&
      normalizeClassName(focused.form || '') === normalizeClassName(targetCls) &&
      matchesSubjectQuery(focused.subject || '', targetSub, focused.title || '');

    if (focusedMatchesCurrent && extractedBookChaptersMap[mapKey]?.length) {
      return extractedBookChaptersMap[mapKey];
    }

    const rawCustom = focusedMatchesCurrent ? focused?.customContent || '' : '';
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
  }, [activePage, mohaViewMode, tsClass, mohaActiveClass, tsSubject, mohaActiveSubject, activeSiteResources, extractedBookChaptersMap]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors">
      {/* TOP BAR CONTRACT: 3 Zones (Brand, Nav Links, Primary Action) — hidden in full-viewport Moha AI & Game modes */}
      {activePage !== 'moha' && activePage !== 'game' && (
      <header className="sticky top-0 z-40 bg-[var(--bg-surface-glass)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-5xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              resetToStep1();
            }}
            className="text-sm sm:text-xl font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2"
          >
            <img
              src="/assets/aistudio/Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/pwa-192x192.png';
              }}
              alt="Elimika Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg shadow-xs shrink-0 object-cover"
            />
            <span>
              ELIMIKA<span className="text-blue-600">.</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
            <button
              onClick={() => resetToStep1()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activePage === 'papers' || activePage === 'books' || activePage === 'syllabus'
                  ? 'text-blue-600 font-bold underline underline-offset-4'
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Library (Papers, Books &amp; Syllabus)</span>
            </button>
            <button
              onClick={() => openDailyQuizPage()}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                activePage === 'daily_quiz' ? 'text-violet-700 font-bold underline underline-offset-4' : ''
              }`}
            >
              <span>🎯 Daily Quiz</span>
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

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton />

            <button
              onClick={() => setWhatsappModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer bg-[#25D366] hover:bg-[#1ebe5d] text-white"
              title="Join or Manage Elimika WhatsApp Channel & Community"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.494 5.457 5.586-1.466c1.911 1.251 4.187 1.976 6.624 1.976 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
              </svg>
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Instant 1-Tap Dark / Light Theme Button (Visible on all screens) */}
            <button
              type="button"
              onClick={() => selectThemeMode(darkMode ? 'light' : 'dark')}
              aria-label={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              title={darkMode ? 'Currently Dark Mode — Click for Light Mode' : 'Currently Light Mode — Click for Dark Mode'}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 border shadow-xs transition-all cursor-pointer shrink-0 ${
                darkMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
              }`}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 shrink-0" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => openMwalimuModal()}
              className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs items-center gap-1 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Moha AI</span>
            </button>
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
          <section className="py-3 bg-white border-b border-slate-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-2.5">
              {/* Compact Top Row: Unified Library 3-Tab Switcher + Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePage('papers')}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Past Papers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openBooksPage(selectedClass)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📘 Books ({availableUploadedBooks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSyllabusPage()}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📜 Syllabus ({availableUploadedSyllabuses.length})</span>
                  </button>
                </div>

                {/* Smart Search + Voice Search */}
                <div ref={searchBoxContainerRef} className="relative flex-1 max-w-md">
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-300 px-3 py-1.5 focus-within:border-blue-600 focus-within:bg-white transition-colors">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
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
                      placeholder="Search paper or book (e.g. Form 4 Math)..."
                      className="w-full text-xs sm:text-sm font-medium bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    {searchQuery.trim().length > 0 && (
                      <button
                        onClick={() => {
                          handleSmartSearchChange('');
                          setShowSearchSuggestions(true);
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1 mr-0.5 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={startVoiceSearch}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center shrink-0 cursor-pointer"
                      title="Voice Search"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {showSearchSuggestions && recentSearchQueries.length > 0 && (() => {
                    const qLower = searchQuery.trim().toLowerCase();
                    const matchingQueries = qLower
                      ? recentSearchQueries.filter((item) => item.toLowerCase().includes(qLower))
                      : recentSearchQueries;
                    const displayList = matchingQueries.length > 0 ? matchingQueries : recentSearchQueries;

                    return (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden text-left">
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500">Recent Searches</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearRecentSearchQueries();
                              setShowSearchSuggestions(false);
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {displayList.map((term) => (
                            <div
                              key={term}
                              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50/70 transition-colors group"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleSmartSearchChange(term, true);
                                  setShowSearchSuggestions(false);
                                }}
                                className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                              >
                                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">
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
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>

          <main className="flex-grow py-4 pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
              {/* Show Step Navigation Bar ONLY when inside Step 2 or Step 3 */}
              {step > 1 && (
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-500 overflow-x-auto">
                    <button
                      onClick={() => setStep(1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      All Classes
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <button
                      onClick={() => selectedClass && setStep(2)}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                        step === 2 ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {selectedClass || 'Subject'}
                    </button>
                    {step === 3 && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white whitespace-nowrap shrink-0">
                          {selectedSubject}
                        </span>
                      </>
                    )}
                  </nav>

                  <button
                    onClick={handleGoBack}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>
              )}

              {/* Network Error Banner */}
              {syncStatus === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-rose-900">Unable to sync online papers.</span>
                  <button
                    onClick={() => fetchSheetData()}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              )}

              {/* STEP 1: COMPACT & BEGINNER-FRIENDLY CLASS SELECTOR */}
              {step === 1 && (
                <section className="space-y-4">
                  {/* Slim 1-Line Quick Resume Bar */}
                  {savedClass && (
                    <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-emerald-950 truncate">
                        Continue with <strong>{savedClass}</strong>
                      </span>
                      <button
                        onClick={() => selectClass(savedClass)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open {savedClass} →
                      </button>
                    </div>
                  )}

                  {/* 1. COMPACT CLASS LEVEL CARD */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm sm:text-base font-black text-slate-900">
                        Choose Your Class
                      </h2>

                      <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                        {[
                          { id: 'ALL' as const, label: 'All' },
                          { id: 'Secondary' as const, label: 'Form 1–6' },
                          { id: 'Primary' as const, label: 'Std 1–7' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setClassTierFilter(tab.id)}
                            className={`px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                              classTierFilter === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary School (Form 1-6) */}
                    {(classTierFilter === 'ALL' || classTierFilter === 'Secondary') && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'].map((cls) => {
                          const isExamYear = cls === 'Form 2' || cls === 'Form 4' || cls === 'Form 6';
                          return (
                            <button
                              key={cls}
                              onClick={() => selectClass(cls)}
                              className={`py-3 px-2.5 rounded-xl text-center font-black text-sm transition-all cursor-pointer border ${
                                isExamYear
                                  ? 'bg-blue-50/80 hover:bg-blue-100 border-blue-300 text-blue-950'
                                  : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              {cls}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Primary School (Standard 1-7) */}
                    {(classTierFilter === 'ALL' || classTierFilter === 'Primary') && (
                      <div className={`grid grid-cols-3 sm:grid-cols-7 gap-2 ${classTierFilter === 'ALL' ? 'pt-2 border-t border-slate-100' : ''}`}>
                        {['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7'].map((cls) => {
                          const shortLabel = cls.replace('Standard ', 'Std ');
                          const isExam = cls === 'Standard 4' || cls === 'Standard 7';
                          return (
                            <button
                              key={cls}
                              onClick={() => selectClass(cls)}
                              className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                                isExam
                                  ? 'bg-amber-50/80 hover:bg-amber-100 border-amber-300 text-amber-950'
                                  : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {shortLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. COMPACT SINGLE-ROW STUDY TOOLS & LABS STRIP */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900">
                        02. Interactive Study Tools &amp; Labs
                      </h2>
                      <p className="text-xs text-slate-500">
                        AI Textbook Tutor, Teacher Studio (Lesson Plans &amp; Schemes), Science Practicals &amp; Mastery Tracker.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => openMwalimuModal()}
                        className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Moha AI &amp; Studio</span>
                      </button>
                      <button
                        onClick={() => openVirtualLabPage()}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>🧪 Virtual Science Lab</span>
                      </button>
                      <button
                        onClick={() => {
                          setPlayRoute('hub');
                          setActivePage('game');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>🎮 Elimika Play</span>
                      </button>
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      Select Subject — <span className="text-blue-600">{selectedClass}</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyShareableSubjectLink(selectedClass)}
                        className="px-3 py-2 rounded-xl font-bold text-xs border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        title="Copy direct shareable link for this class"
                      >
                        📲 Share Class
                      </button>
                      <button
                        onClick={() => openBooksPage(selectedClass)}
                        className="px-3 py-2 rounded-xl font-bold text-xs border border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        📚 Books &amp; Syllabus ↗
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
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                          {searchQuery.trim().length > 0
                            ? `Search Results for "${searchQuery}"`
                            : `${selectedClass} · ${selectedSubject} (${filteredPapers.length})`}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedClass && selectedSubject && (
                          <button
                            type="button"
                            onClick={() => copyShareableSubjectLink(selectedClass, selectedSubject)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
                            title="Copy direct link to share this Class & Subject"
                          >
                            📲 Share Subject
                          </button>
                        )}
                        <a
                          href={getRequestPaperWhatsAppUrl(selectedClass, selectedSubject)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs whitespace-nowrap shrink-0"
                          title="Request a missing past paper via WhatsApp"
                        >
                          📩 Request Paper
                        </a>
                      </div>
                    </div>

                    {/* UNIFIED SUBJECT HUB BAR: Instant 1-Tap Switcher for this exact Class & Subject */}
                    {selectedClass && selectedSubject && !searchQuery.trim() && (
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 px-1.5">
                          ⚡ {selectedClass} · {selectedSubject}:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs">
                            📄 Past Papers ({filteredPapers.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => openBooksPage(selectedClass, selectedSubject)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-900 border border-slate-300 font-bold text-xs cursor-pointer transition-colors"
                          >
                            📚 TIE Textbook &amp; Syllabus
                          </button>
                          <button
                            type="button"
                            onClick={() => openDailyQuizPage(selectedClass, selectedSubject)}
                            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer transition-colors"
                          >
                            🎯 Daily Quiz
                          </button>
                          <button
                            type="button"
                            onClick={() => openMwalimuModal(selectedClass, selectedSubject, 'chat')}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
                          >
                            ✨ Ask Moha AI
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Compact Single-Row Filter Bar: Year + Paper Type */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                          Year:
                        </span>
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
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {yr === 'ALL' ? 'All' : yr}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                          Type:
                        </span>
                        {['ALL', 'NECTA', 'Pre-NECTA', 'Mock', 'Annual', 'Midterm'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setPage(1);
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              selectedCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {cat === 'ALL' ? 'All' : cat}
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
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Have a paper to contribute or need a specific exam uploaded? Request it directly via WhatsApp below.
                      </p>
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
                        <a
                          href={getRequestPaperWhatsAppUrl(
                            selectedClass,
                            selectedSubject,
                            searchQuery.trim() || `${selectedClass} ${selectedSubject} Past Paper`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                        >
                          📩 Request Missing Paper on WhatsApp
                        </a>
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
                              {hasAnswers && (
                                <button
                                  onClick={() =>
                                    triggerDirectDownloadUrl(p.answersUrl, `${p.title} - Solution.pdf`)
                                  }
                                  className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Solution</span>
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

      {/* DEDICATED TIE BOOKS PAGE (PART OF UNIFIED LIBRARY) */}
      {activePage === 'books' && (
        <motion.div
          key="view-books"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow bg-slate-50 min-h-screen pb-24"
        >
          <section className="py-3 bg-white border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-2.5">
              {/* Row 1: Unified Library Switcher + Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePage('papers')}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Past Papers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openBooksPage()}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 text-white shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📘 Books ({availableUploadedBooks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSyllabusPage()}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📜 Syllabus ({availableUploadedSyllabuses.length})</span>
                  </button>
                </div>

                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={booksSearchQuery}
                    onChange={(e) => setBooksSearchQuery(e.target.value)}
                    placeholder="Search textbook or subject..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-none text-xs sm:text-sm font-medium bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              {/* Row 2: Simple Class Dropdown + Quick Level Filter + Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Select Class for Textbooks"
                    value={booksPageSelectedClass}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBooksPageSelectedClass(val);
                      if (val === 'ALL') {
                        setBooksPageLevel('ALL');
                      } else if (val.startsWith('Standard')) {
                        setBooksPageLevel('Primary');
                      } else if (val === 'Form 5' || val === 'Form 6') {
                        setBooksPageLevel('Advanced');
                      } else {
                        setBooksPageLevel('Secondary');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold text-xs cursor-pointer focus:outline-none focus:border-emerald-600"
                  >
                    <option value="ALL">All Classes (Std 1 – Form 6)</option>
                    <optgroup label="Secondary (Form 1–6)">
                      {['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Primary (Standard 1–7)">
                      {['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {(['ALL', 'Secondary', 'Primary', 'Advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setBooksPageLevel(lvl);
                          setBooksPageSelectedClass('ALL');
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                          booksPageLevel === lvl
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lvl === 'ALL' ? 'All' : lvl === 'Primary' ? 'Primary' : lvl === 'Secondary' ? 'O-Level' : 'A-Level'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-bold text-emerald-800">
                    {availableUploadedBooks.length} Books Ready
                  </span>
                  {upcomingPlaceholderBooks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowUpcomingBooks((prev) => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                    >
                      {showUpcomingBooks ? 'Hide Request List' : `+ Request Book (${upcomingPlaceholderBooks.length})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">

            {/* Available / Uploaded PDFs First */}
            {availableUploadedBooks.length === 0 ? (
              <div className="py-10 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  No uploaded TIE PDF Books match this filter yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try selecting &ldquo;All Levels&rdquo; or request a specific textbook via WhatsApp below.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBooksPageLevel('ALL');
                      setBooksPageSelectedClass('ALL');
                      setBooksSearchQuery('');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Show All Available TIE Books
                  </button>
                  <a
                    href={getRequestPaperWhatsAppUrl(
                      booksPageSelectedClass !== 'ALL' ? booksPageSelectedClass : 'Secondary',
                      booksSearchQuery || 'TIE Student Book',
                      'Missing TIE Textbook PDF'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    📩 Request a Textbook via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableUploadedBooks.map((p) => (
                  <article
                    key={p.id}
                    className="bg-white p-5 rounded-2xl border border-emerald-400 shadow-sm hover:border-emerald-600 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700">{p.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">{p.form}</span>
                          <span aria-hidden="true">·</span>
                          <span>{p.subject}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                          PDF Ready ✓
                        </span>
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
                ))}
              </div>
            )}

            {/* Collapsed "Coming Soon" Section for Unuploaded TIE Books */}
            {upcomingPlaceholderBooks.length > 0 && showUpcomingBooks && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-700">
                    ⏳ Upcoming TIE Curriculum Books — Coming Soon ({upcomingPlaceholderBooks.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowUpcomingBooks(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Collapse ▲
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {upcomingPlaceholderBooks.map((p) => (
                    <article
                      key={p.id}
                      className="bg-white/80 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-500">
                          {p.form} · {p.subject}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {getSubjectIcon(p.subject)} {p.title}
                        </h4>
                      </div>
                      <a
                        href={getRequestPaperWhatsAppUrl(p.form, p.subject, p.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] whitespace-nowrap shrink-0"
                      >
                        📩 Request Book
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* DEDICATED SYLLABUS PAGE (PART OF UNIFIED LIBRARY) */}
      {activePage === 'syllabus' && (
        <motion.div
          key="view-syllabus"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-grow bg-slate-50 min-h-screen pb-24"
        >
          <section className="py-3 bg-white border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-2.5">
              {/* Row 1: Unified Library Switcher + Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePage('papers')}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Past Papers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openBooksPage()}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-white/70 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📘 Books ({availableUploadedBooks.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSyllabusPage()}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-500 text-slate-950 shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>📜 Syllabus ({availableUploadedSyllabuses.length})</span>
                  </button>
                </div>

                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={syllabusSearchQuery}
                    onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                    placeholder="Search syllabus subject..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none text-xs sm:text-sm font-medium bg-slate-50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              {/* Row 2: Compact Level Filter + Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                  {(['ALL', 'Secondary', 'Primary', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSyllabusPageLevel(lvl)}
                      className={`px-2.5 py-1 rounded-md font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                        syllabusPageLevel === lvl
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl === 'ALL' ? 'All Levels' : lvl === 'Primary' ? 'Primary' : lvl === 'Secondary' ? 'O-Level' : 'A-Level'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-bold text-amber-900">
                    {availableUploadedSyllabuses.length} Syllabuses Ready
                  </span>
                  {upcomingPlaceholderSyllabuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowUpcomingSyllabuses((prev) => !prev)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                    >
                      {showUpcomingSyllabuses ? 'Hide Request List' : `+ Request Syllabus (${upcomingPlaceholderSyllabuses.length})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">

            {availableUploadedSyllabuses.length === 0 && !showUpcomingSyllabuses ? (
              <div className="py-10 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900">
                  Official TIE Competence-Based Syllabuses
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You can view all interactive syllabus topics inside <strong>Moha AI Tutor</strong> or click below to browse upcoming syllabus placeholders.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {upcomingPlaceholderSyllabuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowUpcomingSyllabuses(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ⏳ View All {upcomingPlaceholderSyllabuses.length} Curriculum Syllabus Subjects
                    </button>
                  )}
                  <a
                    href={getRequestPaperWhatsAppUrl('Secondary', syllabusSearchQuery || 'TIE Syllabus', 'TIE Syllabus PDF')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    📩 Request Syllabus PDF on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(showUpcomingSyllabuses ? dedicatedSyllabuses : availableUploadedSyllabuses).map((p) => {
                  const hasUrl = Boolean(p.paperUrl);
                  return (
                    <article
                      key={p.id}
                      className="bg-white p-5 rounded-2xl border border-amber-200 hover:border-amber-500 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5 tabular-nums">
                          <div>
                            <span className="font-bold text-amber-800">{p.category}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{p.form}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{p.year}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              hasUrl
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {hasUrl ? 'PDF Ready ✓' : 'Coming Soon'}
                          </span>
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
                          </>
                        ) : (
                          <a
                            href={getRequestPaperWhatsAppUrl(p.form, p.subject, p.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <span>📩 Request Syllabus on WhatsApp</span>
                          </a>
                        )}
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

        return (
          <motion.div
            key="view-daily-quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-grow w-full max-w-full overflow-x-hidden py-6 pb-24 bg-slate-50"
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

              {/* Simplified Student Selection Card: Class -> Subject -> Topic -> Question Source */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-black text-slate-900">
                    Select Class, Subject &amp; Topic
                  </h2>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                    ✓ Non-Repeating Bank ({getQuestionBankStats(mohaActiveClass, mohaActiveSubject).seenByStudentCount} Solved)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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
                        setMohaFocusedResourceId('ALL');
                        startAiQuiz(
                          nextCls,
                          nextSub,
                          firstTopic,
                          'ALL',
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
                        setMohaFocusedResourceId('ALL');
                        startAiQuiz(
                          mohaActiveClass,
                          nextSub,
                          firstTopic,
                          'ALL',
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
                        startAiQuiz(
                          mohaActiveClass,
                          mohaActiveSubject,
                          nextTopic,
                          'ALL',
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

                  {/* 4. Question Source (Textbook vs Past Papers) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">4. Question Source</label>
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
                      <option value="ALL">📚 Both (Textbook + Past Papers)</option>
                      <option value="textbook">📘 TIE Textbook Only</option>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            selectedQuizTopic,
                            selectedQuizSubTopic,
                            selectedQuizSourceFilter,
                            true,
                            null,
                            20
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black cursor-pointer transition-colors"
                      >
                        🔄 Next 20 Unseen Qns
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          startAiQuiz(
                            mohaActiveClass,
                            mohaActiveSubject,
                            selectedQuizTopic,
                            selectedQuizSubTopic,
                            selectedQuizSourceFilter,
                            true,
                            null,
                            200
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer transition-colors"
                      >
                        📚 Show All Chapter/Bank Qns
                      </button>
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black tabular-nums">
                        Score: {correctCount} / {totalQuestions} ({completionPercentage}% Solved)
                      </div>
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
                  (() => {
                    const quizSliceStart = quizShowAll ? 0 : quizPageIndex * 20;
                    const quizSliceEnd = quizShowAll
                      ? quizItems.length
                      : Math.min(quizItems.length, (quizPageIndex + 1) * 20);
                    const visibleQuizItems = quizItems.slice(quizSliceStart, quizSliceEnd);
                    const remainingCount = Math.max(0, quizItems.length - quizSliceEnd);
                    const nextBatchEnd = Math.min(quizItems.length, quizSliceEnd + 20);

                    return (
                      <div className="space-y-4">
                        {visibleQuizItems.map((q, localIdx) => {
                          const qIdx = quizSliceStart + localIdx;
                          const selectedIdx = quizSelectedAnswers[qIdx];
                          const hasAnswered = selectedIdx !== undefined;
                          const isPastPaperSource =
                        (q.sourceRef || '').toLowerCase().includes('necta') ||
                        (q.sourceRef || '').toLowerCase().includes('paper');
                      const diagramSpec = getQuestionDiagramSvg(
                        q.question,
                        q.topic,
                        q.subTopic,
                        mohaActiveSubject
                      );
                      const finalAnswerText =
                        Array.isArray(q.options) && q.options[q.correctIndex]
                          ? q.options[q.correctIndex]
                          : '';
                      const showMcqOptions = Boolean(
                        Array.isArray(q.options) &&
                          q.options.length > 0 &&
                          (q.isMultipleChoice ||
                            /\b(choose the most|multiple choice|write true|write t for|true or false|match each item)\b/i.test(
                              q.question
                            ))
                      );

                      return (
                        <div
                          key={qIdx}
                          className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-black">
                                Question {qIdx + 1} of {quizItems.length}
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

                          <div className="font-bold text-sm text-slate-900 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                            <MathText as="div" text={q.question} className="space-y-1" />
                          </div>

                          {diagramSpec && (
                            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                              <div className="text-[11px] font-black text-slate-700 flex items-center justify-between">
                                <span>📐 {diagramSpec.title}</span>
                                <span className="text-[10px] font-semibold text-slate-500">SVG Figure</span>
                              </div>
                              <div
                                className="w-full overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: diagramSpec.svgHtml }}
                              />
                              {diagramSpec.caption && (
                                <p className="text-[11px] text-slate-500 text-center font-medium">
                                  {diagramSpec.caption}
                                </p>
                              )}
                            </div>
                          )}

                          {showMcqOptions && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((optText, oIdx) => {
                                const optLetter = String.fromCharCode(65 + oIdx);
                                const isSelected = selectedIdx === oIdx;
                                const isCorrectOpt = oIdx === q.correctIndex;
                                let optStyle =
                                  'bg-white hover:bg-violet-50 border-slate-200 text-slate-800';
                                if (hasAnswered) {
                                  if (isCorrectOpt) {
                                    optStyle =
                                      'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400';
                                  } else if (isSelected) {
                                    optStyle =
                                      'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300';
                                  } else {
                                    optStyle = 'bg-slate-50 border-slate-200 text-slate-500 opacity-85';
                                  }
                                }
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                                    className={`text-left p-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer flex items-start gap-2.5 ${optStyle}`}
                                  >
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
                                        hasAnswered && isCorrectOpt
                                          ? 'bg-emerald-600 text-white'
                                          : hasAnswered && isSelected
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-violet-100 text-violet-900'
                                      }`}
                                    >
                                      {optLetter}
                                    </span>
                                    <span className="leading-snug flex-1 pt-0.5">
                                      <MathText text={optText} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => handleToggleQuizSolution(qIdx)}
                              className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                                hasAnswered
                                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>{hasAnswered ? '🙈 Hide Solution' : '💡 Show Solution'}</span>
                            </button>

                            <button
                              onClick={() => {
                                openMwalimuModal(mohaActiveClass, mohaActiveSubject, 'chat');
                                sendMwalimuMessage(
                                  `Show me the complete step-by-step working for this ${mohaActiveClass} ${mohaActiveSubject} problem (${q.topic || ''} - ${q.subTopic || ''}): ${q.question}`
                                );
                              }}
                              className="px-3 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-900 font-bold text-xs cursor-pointer"
                            >
                              Ask Moha AI Tutor →
                            </button>
                          </div>

                          {hasAnswered && (
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
                              {finalAnswerText && (
                                <div className="p-2.5 rounded-lg bg-white border border-emerald-300 flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[11px]">
                                    Final Answer
                                  </span>
                                  <MathText
                                    text={finalAnswerText}
                                    className="font-black text-emerald-950 text-xs sm:text-sm"
                                  />
                                </div>
                              )}
                              <div className="font-black text-emerald-900">
                                ✅ Worked Step-by-Step Solution ({q.sourceRef || 'TIE / NECTA Standard'}):
                              </div>
                              <MathText as="div" text={q.explanation} className="leading-relaxed font-medium" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                        {/* Bottom Next / Remaining Questions Navigation Bar */}
                        {quizItems.length > 0 && (
                          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-bold text-slate-800">
                              <span>
                                Showing Questions {quizSliceStart + 1}–{quizSliceEnd} of {quizItems.length}
                              </span>
                              {remainingCount > 0 && !quizShowAll && (
                                <span className="ml-2 px-2 py-0.5 rounded-md bg-violet-600 text-white font-black">
                                  {remainingCount} Remaining {remainingCount === 1 ? 'Question' : 'Questions'}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {!quizShowAll && quizPageIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizPageIndex((p) => Math.max(0, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-black text-xs cursor-pointer transition-all"
                                >
                                  ← Previous Questions ({Math.max(1, (quizPageIndex - 1) * 20 + 1)}–{quizPageIndex * 20})
                                </button>
                              )}

                              {!quizShowAll && remainingCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextPage = quizPageIndex + 1;
                                    const nextSlice = quizItems.slice(nextPage * 20, (nextPage + 1) * 20);
                                    markQuestionsBatchAsSeenByStudent(mohaActiveClass, mohaActiveSubject, nextSlice);
                                    setQuizPageIndex(nextPage);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs cursor-pointer shadow-sm transition-all"
                                >
                                  Next Remaining Questions ({quizSliceEnd + 1}–{nextBatchEnd}) →
                                </button>
                              )}

                              {quizItems.length > 20 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuizShowAll((prev) => !prev);
                                    setQuizPageIndex(0);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs cursor-pointer transition-all"
                                >
                                  {quizShowAll
                                    ? '📄 Show 20 Per Page'
                                    : `📚 Show All ${quizItems.length} Questions`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

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
                  onClick={() => openDailyQuizPage(mohaActiveClass, mohaActiveSubject)}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer"
                >
                  🎯 Daily Quiz
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

      {/* PERSISTENT 4-TAB MOBILE BOTTOM NAVIGATION BAR (WITH UNIFIED LIBRARY ICON) */}
      {activePage !== 'game' && (
        <nav
          aria-label="Mobile Primary Navigation"
          className="fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-surface-glass)] backdrop-blur-md border-t border-[var(--border-subtle)] px-2 py-1.5 flex items-center justify-around gap-1.5 lg:hidden shadow-lg"
        >
          <button
            type="button"
            onClick={() => {
              if (activePage !== 'papers' && activePage !== 'books' && activePage !== 'syllabus') {
                setActivePage('papers');
              } else {
                resetToStep1();
              }
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold cursor-pointer transition-colors ${
              activePage === 'papers' || activePage === 'books' || activePage === 'syllabus'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Library</span>
          </button>
          <button
            type="button"
            onClick={() => openDailyQuizPage()}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
              activePage === 'daily_quiz'
                ? 'bg-violet-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎯</span>
            <span>Daily Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => openMwalimuModal()}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
              activePage === 'moha'
                ? 'bg-violet-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Moha AI</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlayRoute('hub');
              setActivePage('game');
            }}
            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
              (activePage as string) === 'game'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎮</span>
            <span>Play</span>
          </button>
        </nav>
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

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
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
                <a
                  href={
                    (viewerType === 'answers' && viewerPaper.answersUrl
                      ? viewerPaper.answersUrl
                      : viewerPaper.paperUrl) || '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 shadow-xs"
                  title="Open fullscreen in Google Drive or mobile browser if preview is blocked"
                >
                  <span>Open Fullscreen in Drive / Browser ↗</span>
                </a>
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-4 text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                  <p className="text-xs font-bold text-slate-600 mb-3">Loading PDF document preview...</p>
                  <a
                    href={
                      (viewerType === 'answers' && viewerPaper.answersUrl
                        ? viewerPaper.answersUrl
                        : viewerPaper.paperUrl) || '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Taking too long on mobile? Open Fullscreen in Drive / Browser ↗</span>
                  </a>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 w-full max-w-full h-[100dvh] bg-slate-50 flex flex-col overflow-hidden"
        >
          {/* Unified Navigation & Context Bar (Responsive Mobile-First Layout) */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-2.5 sm:px-4 py-1.5 shadow-2xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
              {/* Row 1 on Mobile / Left on Desktop: Back + Brand + Class/Subject + Book/Chapter Selectors */}
              <div className="flex items-center justify-between md:justify-start gap-1.5 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleGoBack}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    title="Back to Elimika"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  <div className="flex items-center gap-1 font-black text-slate-900 text-xs sm:text-sm shrink-0">
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
                        setMohaFocusedResourceId('ALL');
                        const nextTopics = getSyllabusTopicsForClassSubject(newCls, nextSub);
                        const firstChap = nextTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || '';
                        setSelectedQuizTopic(firstChap || 'ALL');
                        setSelectedQuizSubTopic('ALL');
                        setTsTopic(firstChap);
                        setTsSubTopic(firstChap);
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
                        setMohaFocusedResourceId('ALL');
                        const nextTopics = getSyllabusTopicsForClassSubject(mohaActiveClass, nextSub);
                        const firstChap = nextTopics[0]?.replace(/^\d+\.\d+\s*/, '').trim() || '';
                        setSelectedQuizTopic(firstChap || 'ALL');
                        setSelectedQuizSubTopic('ALL');
                        setTsTopic(firstChap);
                        setTsSubTopic(firstChap);
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
                    className="max-w-[95px] sm:max-w-[125px] lg:max-w-[175px] bg-transparent text-slate-800 font-semibold text-[11px] truncate focus:outline-none cursor-pointer"
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
                    className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] cursor-pointer shrink-0"
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
                      if (mohaViewMode === 'quiz') {
                        void startAiQuiz(
                          mohaActiveClass,
                          mohaActiveSubject,
                          chosenChap,
                          'ALL',
                          selectedQuizSourceFilter,
                          false
                        );
                      }
                    }}
                    title="Select Syllabus Chapter / Topic"
                    className="max-w-[95px] sm:max-w-[125px] lg:max-w-[175px] bg-transparent text-slate-800 font-semibold text-[11px] truncate focus:outline-none cursor-pointer"
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

              {/* Row 2 on Mobile / Right on Desktop: Workspace Tab Switcher + Daily Quiz + Dark Mode */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'chat' as const, label: '💬 Chat' },
                  { id: 'studio' as const, label: '📘 Studio & Docs' },
                  { id: 'diagram' as const, label: '📐 Diagrams' },
                ].map((tab) => {
                  const active = mohaViewMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMohaViewMode(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                  onClick={() => openDailyQuizPage(mohaActiveClass, mohaActiveSubject)}
                  className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer shrink-0"
                  title="Open unified Daily Solving Quiz for this Class & Subject"
                >
                  🎯 Daily Quiz
                </button>
                {mohaViewMode === 'chat' && (
                  <button
                    type="button"
                    onClick={() =>
                      setMohaMessages([
                        {
                          id: 'msg-welcome',
                          role: 'ai',
                          text: `Ready for **${mohaActiveClass} • ${mohaActiveSubject}**.`,
                        },
                      ])
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Clear Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => selectThemeMode(darkMode ? 'light' : 'dark')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 ${
                    darkMode
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-white'
                  }`}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 shrink-0" /> : <Moon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{darkMode ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================== VIEW 1: CLEAN CHAT ==================== */}
          {mohaViewMode === 'chat' && (
            <div className="flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto overflow-hidden">

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

                  {/* Right: Direct PDF Export Actions (Shown only after a document is generated) */}
                  {studioPreviewHtml && (
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
                  )}
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

              {/* Maximized Full-Viewport Editable Document Canvas (Shown ONLY after generating a document) */}
              <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-6 py-3">
                {studioPreviewHtml ? (
                  <div className="max-w-6xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 min-h-full">
                    <div
                      id="msg-body-studio-preview"
                      contentEditable
                      suppressContentEditableWarning
                      className="overflow-x-auto focus:outline-none min-h-[calc(100vh-8rem)]"
                      dangerouslySetInnerHTML={{
                        __html: studioPreviewHtml,
                      }}
                    />
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto my-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto font-black text-xl">
                      📘
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Teacher Document Studio ({mohaActiveClass} · {mohaActiveSubject})
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                        Enter your School Name, Teacher Name, and Topic above, then click a document type below to generate your printable PDF document.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        disabled={generatingDocType !== null}
                        onClick={() => submitTeacherStudioDoc('lessonplan')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        📋 Generate 4-Stage Lesson Plan
                      </button>
                      <button
                        type="button"
                        disabled={generatingDocType !== null}
                        onClick={() => submitTeacherStudioDoc('schemeofwork')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        📅 Generate 12-Col Scheme of Work
                      </button>
                      <button
                        type="button"
                        disabled={generatingDocType !== null}
                        onClick={() => submitTeacherStudioDoc('lessonnotes')}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        📘 Generate Lesson Notes
                      </button>
                      <button
                        type="button"
                        disabled={generatingDocType !== null}
                        onClick={() => submitTeacherStudioDoc('logbook')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        📓 Generate Subject Log Book
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== VIEW 4: INTERACTIVE DIAGRAM LAB ==================== */}
          {mohaViewMode === 'diagram' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <span className="font-black text-slate-900">
                      🧪 NECTA Paper 2 Virtual Science Practicals Lab
                    </span>
                    <span className="text-slate-500 block sm:inline sm:ml-2">
                      Run Titration, Salt Analysis, Food Tests, Pendulum &amp; Ohm&apos;s Law simulations.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openVirtualLabPage(mohaActiveClass);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    Launch Virtual Science Lab →
                  </button>
                </div>
                <InteractiveDiagramLab
                  initialPreset={activeDiagramPreset}
                  activeClass={mohaActiveClass}
                  activeSubject={mohaActiveSubject}
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

      {/* GOOGLE ADSENSE & LEGAL COMPLIANCE MODAL (PRIVACY POLICY / TERMS OF SERVICE / DISCLAIMER / ABOUT) */}
      {legalModalType && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLegalModalType(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLegalModalType('privacy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    legalModalType === 'privacy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🔒 Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('terms')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    legalModalType === 'terms'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  📋 Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('disclaimer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    legalModalType === 'disclaimer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⚖️ Disclaimer
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModalType('about')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    legalModalType === 'about'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🏛️ About &amp; Contact
                </button>
              </div>
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
                  <strong>Effective Date:</strong> January 1, 2026 · <strong>Publisher ID:</strong>{' '}
                  <code>ca-pub-7814843623545511</code>
                </p>
                <p>
                  At <strong>Elimika Tanzania</strong> (<code>https://elimika.online</code>), we respect and protect the privacy of all students, teachers, and parents using our educational platform. This Privacy Policy explains how information is handled when you browse Past Papers, TIE Books, Official Syllabuses, and Teacher Tools.
                </p>
                <h3 className="font-bold text-slate-900">1. Google AdSense &amp; DoubleClick DART Cookie Disclosure</h3>
                <p>
                  Third-party vendors, including <strong>Google (Google AdSense)</strong>, use cookies (such as the DoubleClick DART cookie) to serve ads based on a user&apos;s prior visits to <code>https://elimika.online</code> or other websites on the internet. Google&apos;s use of advertising cookies enables it and its partners to serve relevant educational and general ads to our users based on their visit to Elimika Tanzania and/or other sites on the Internet. Users may opt out of personalized advertising at any time by visiting{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    Google Ads Settings (https://www.google.com/settings/ads)
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    www.aboutads.info
                  </a>
                  .
                </p>
                <h3 className="font-bold text-slate-900">2. Information Stored Locally</h3>
                <p>
                  Elimika uses your browser&apos;s <code>localStorage</code> to save your preferred theme mode (Light Mode, Dark Mode, or System Default), preferred class level, quiz progress, and offline print basket. This data stays on your device and can be cleared by you at any time.
                </p>
                <h3 className="font-bold text-slate-900">3. Educational Resources &amp; Student Safety</h3>
                <p>
                  Our library links to publicly accessible educational PDFs for curriculum study and revision. We do not knowingly collect personal financial or sensitive data from students, and we never sell, rent, or trade user data to third parties.
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
                  All Past Papers, Marking Schemes, TIE Textbooks, Official Syllabuses, and Lesson Plans or Schemes of Work provided on Elimika are intended strictly for educational, classroom teaching, and examination revision purposes in accordance with Tanzania Institute of Education (TIE) and NECTA guidelines.
                </p>
                <h3 className="font-bold text-slate-900">2. User Conduct &amp; Content</h3>
                <p>
                  Teachers and students using Elimika agree to use the resources responsibly for academic growth. Packaging or reselling free public curriculum textbooks or past papers for commercial profit is prohibited.
                </p>
                <h3 className="font-bold text-slate-900">3. Disclaimer of Warranties</h3>
                <p>
                  While Elimika strives to keep all curriculum materials, worked solutions, and teacher documents accurate and aligned with current MoEST, PO-RALG, and TIE standards, materials are provided &ldquo;as is&rdquo; for educational reference.
                </p>
              </div>
            )}

            {legalModalType === 'disclaimer' && (
              <div className="space-y-3">
                <p>
                  <strong>Academic &amp; Intellectual Property Disclaimer</strong>
                </p>
                <p>
                  <strong>Elimika Tanzania</strong> is an independent digital educational library created to support students and teachers across the United Republic of Tanzania.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>NECTA Examinations:</strong> Past national examination papers (PSLE, SFNA, FTNA, CSEE, ACSEE) and marking schemes are historical assessment materials administered by the <strong>National Examinations Council of Tanzania (NECTA)</strong>.
                  </li>
                  <li>
                    <strong>TIE Curriculum Materials:</strong> Official textbooks and national syllabuses are the property of the <strong>Tanzania Institute of Education (TIE)</strong> under the Ministry of Education, Science and Technology, provided here strictly for free non-commercial classroom and home study.
                  </li>
                  <li>
                    <strong>Inquiries &amp; Attribution:</strong> For any copyright or attribution inquiries, contact our editorial desk via WhatsApp at <code>+255689511868</code>.
                  </li>
                </ul>
              </div>
            )}

            {legalModalType === 'about' && (
              <div className="space-y-3">
                <p>
                  <strong>Elimika Tanzania</strong> (<code>https://elimika.online</code>) is a comprehensive digital learning and teacher productivity platform built for Primary (Standard 1–7), Ordinary Secondary (Form 1–4), and Advanced Secondary (Form 5–6) schools across Tanzania.
                </p>
                <p>
                  <strong>Our Mission:</strong> To ensure every Tanzanian student and teacher has instant, zero-cost access to official TIE textbooks, national syllabuses, NECTA past examination papers, worked marking schemes, and competency-based revision guides on any phone or computer.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">📬 Official Contact &amp; Editorial Desk</div>
                  <div><strong>Location:</strong> Dar es Salaam, United Republic of Tanzania</div>
                  <div><strong>Phone &amp; WhatsApp Support:</strong> <code>+255689511868</code></div>
                </div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
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
                    onClick={() => setWhatsappTab('playstore')}
                    className={`py-2 px-2.5 rounded-xl transition-colors cursor-pointer ${
                      whatsappTab === 'playstore'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🤖 Play Store
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

              {/* TAB PLAYSTORE: GOOGLE PLAY STORE APK / AAB PUBLISHER & GRAPHICS GENERATOR */}
              {whatsappAdminUnlocked && whatsappTab === 'playstore' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-blue-900 to-slate-950 text-white space-y-2.5 border border-indigo-500/30 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-black text-sm text-sky-300">
                        🤖 Publish Elimika TZ on Google Play Store (AAB / APK Ready)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px]">
                        PWA + TWA + Digital Asset Links Ready ✓
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      Your app is pre-configured with a Google Play compliant Web App Manifest (<code>/manifest.webmanifest</code>), offline Service Worker, 192×192 &amp; 512×512 Maskable Icons, and a live <code>/.well-known/assetlinks.json</code> endpoint for full-screen Android Trusted Web Activity (TWA).
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={downloadPlayStoreAppIcon512Png}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer shadow-xs"
                      >
                        ⬇️ Download 512×512 Play Store Icon (PNG)
                      </button>
                      <button
                        type="button"
                        onClick={downloadPlayStoreFeatureGraphicPng}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
                      >
                        ⬇️ Download 1024×500 Feature Graphic (PNG)
                      </button>
                      <a
                        href="/.well-known/assetlinks.json"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                      >
                        🔗 View /.well-known/assetlinks.json
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-slate-800">
                    <div className="font-black text-sm text-slate-900">
                      📋 4-Step Guide to Put Elimika TZ on Google Play Store
                    </div>
                    <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-slate-700">
                      <li>
                        <strong>Step 1 — Package Your Android Bundle (<code>.aab</code> &amp; <code>.apk</code>) for Free:</strong> Go to{' '}
                        <a
                          href="https://www.pwabuilder.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-bold"
                        >
                          pwabuilder.com
                        </a>
                        , enter your live app URL (<code>https://elimika.online</code> or your deployed URL), click <strong>Package for stores → Android (Google Play)</strong>, and set Package ID to <code>{playStorePackageName}</code>.
                      </li>
                      <li>
                        <strong>Step 2 — Download Your Signed ZIP:</strong> PWABuilder will download a zip containing your <code>.aab</code> (for Google Play Console), <code>.apk</code> (for direct phone testing), and <code>assetlinks.json</code> containing your <strong>SHA-256 fingerprint</strong>.
                      </li>
                      <li>
                        <strong>Step 3 — Paste Your SHA-256 Fingerprint Below:</strong> Copy the SHA-256 string from PWABuilder or Google Play Console (<em>Setup → App signing</em>) and save it below so your app opens in <strong>100% full-screen native mode</strong> with no browser address bar.
                      </li>
                      <li>
                        <strong>Step 4 — Upload to Google Play Console:</strong> Open{' '}
                        <a
                          href="https://play.google.com/console"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline font-bold"
                        >
                          play.google.com/console
                        </a>
                        , create a new app named <strong>Elimika TZ - Past Papers &amp; AI</strong>, upload the 512×512 Icon &amp; 1024×500 Feature Graphic downloaded above, and upload your <code>.aab</code> file under <strong>Production</strong>.
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-black text-slate-900">
                        🔐 Configure Android Package Name &amp; SHA-256 Digital Asset Links (4 Fingerprints Active)
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                        ✅ 4 SHA-256 Fingerprints Configured
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Android Package Name (Application ID)
                        </label>
                        <input
                          type="text"
                          value={playStorePackageName}
                          onChange={(e) => setPlayStorePackageName(e.target.value)}
                          placeholder="online.elimika.twa"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Signing Key SHA-256 Fingerprints (Comma or Newline Separated)
                        </label>
                        <textarea
                          rows={4}
                          value={playStoreSha256}
                          onChange={(e) => setPlayStoreSha256(e.target.value)}
                          placeholder="AF:36:16:F9:..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const fingerprints = playStoreSha256
                            .split(/[\n,]+/)
                            .map((s) => s.replace(/["'\s]/g, '').toUpperCase())
                            .filter(Boolean);
                          const pkgs = Array.from(
                            new Set([playStorePackageName.trim(), 'online.elimika.twa', 'online.elimika.tanzania'].filter(Boolean))
                          );
                          const jsonStr = JSON.stringify(
                            pkgs.map((pkg) => ({
                              relation: ['delegate_permission/common.handle_all_urls'],
                              target: {
                                namespace: 'android_app',
                                package_name: pkg,
                                sha256_cert_fingerprints: fingerprints,
                              },
                            })),
                            null,
                            2
                          );
                          navigator.clipboard.writeText(jsonStr);
                          showToast('📋 Copied assetlinks.json to clipboard!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                      >
                        📋 Copy assetlinks.json
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const fingerprints = playStoreSha256
                            .split(/[\n,]+/)
                            .map((s) => s.replace(/["'\s]/g, '').toUpperCase())
                            .filter(Boolean);
                          const pkgs = Array.from(
                            new Set([playStorePackageName.trim(), 'online.elimika.twa', 'online.elimika.tanzania'].filter(Boolean))
                          );
                          const jsonStr = JSON.stringify(
                            pkgs.map((pkg) => ({
                              relation: ['delegate_permission/common.handle_all_urls'],
                              target: {
                                namespace: 'android_app',
                                package_name: pkg,
                                sha256_cert_fingerprints: fingerprints,
                              },
                            })),
                            null,
                            2
                          );
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'assetlinks.json';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          showToast('⬇️ Downloaded assetlinks.json (place inside /.well-known/assetlinks.json)!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        ⬇️ Download assetlinks.json
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            localStorage.setItem('elimika_playstore_pkg', playStorePackageName.trim());
                            localStorage.setItem('elimika_playstore_sha256', playStoreSha256.trim());
                            await fetchElimikaApi('/api/playstore/assetlinks', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                packageName: playStorePackageName.trim(),
                                sha256Fingerprint: playStoreSha256.trim(),
                              }),
                            });
                            showToast('✅ Saved Android Package & SHA-256 to /.well-known/assetlinks.json!');
                          } catch {
                            showToast('⚠️ Saved locally.');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                      >
                        💾 Save to /.well-known/assetlinks.json
                      </button>
                    </div>
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
                        <a
                          href="/assets/aistudio/Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png"
                          download="elimika-app-icon.png"
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <img
                            src="/assets/aistudio/Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png"
                            alt=""
                            className="w-4 h-4 rounded-sm object-cover"
                          />
                          <span>⬇️ Download Official Golden Cap App Icon</span>
                        </a>
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
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Support / Stationery WhatsApp Number (for &ldquo;Request a Missing Paper&rdquo;, e.g. +255689511868)
                      </label>
                      <input
                        type="text"
                        value={whatsappConfig.supportWhatsappNumber}
                        onChange={(e) =>
                          setWhatsappConfig((prev) => ({
                            ...prev,
                            supportWhatsappNumber: e.target.value.replace(/[^0-9]/g, ''),
                          }))
                        }
                        placeholder="255689511868"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => saveWhatsappConfig(whatsappConfig)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      💾 Save WhatsApp Channel &amp; Support Number
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
                          google.com, pub-7814843623545511, DIRECT, f08c47fec0942fa0
                        </code>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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

                  {/* FULL UPDATED ELIMIKA WEBSITE HTML EXPORT (ADMIN ONLY) */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                    <div className="font-black text-emerald-950 text-xs flex items-center justify-between gap-2">
                      <span>🌐 Complete Updated Elimika Website Code (index.html)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold">
                        Google AdSense Verification Ready ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      Download or copy your complete standalone <code>index.html</code> for <strong>https://elimika.online</strong> with all Google AdSense verification requirements built in: <code>ca-pub-7814843623545511</code> meta &amp; script tags at the top of <code>&lt;head&gt;</code>, unified <strong>📚 Library</strong> navigation (Past Papers, TIE Books &amp; Syllabuses), compact class selector, rich crawlable static NECTA &amp; TIE Curriculum Study Guides, Privacy Policy with DoubleClick DART cookie disclosure, Terms of Service, Academic Disclaimer, About &amp; Contact modal, Cookie Consent banner, Midnight Plum Light/Dark/System theme switcher, and all 142 TIE Books &amp; Question Banks.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href="/elimika-tanzania-website.html?v=20261110"
                        download="index.html"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <span>⬇️ Download Updated index.html</span>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/elimika-tanzania-website.html?v=20261110', { cache: 'no-store' });
                            const htmlText = await res.text();
                            await navigator.clipboard.writeText(htmlText);
                            showToast('✅ Full updated website index.html code copied to clipboard!');
                          } catch {
                            showToast('⚠️ Could not copy automatically — click "Download Updated index.html".');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📋 Copy Full Website HTML Code</span>
                      </button>
                      <a
                        href="/elimika-tanzania-website.html?v=20261110"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1"
                      >
                        <span>↗ View Raw Website File</span>
                      </a>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const cleaned = whatsappAdminPinInput.trim().toLowerCase();
                          if (cleaned === 'elimika4045') {
                            setWhatsappAdminUnlocked(true);
                            setWhatsappTab('broadcast');
                            setWhatsappAdminPinPrompt(false);
                            setWhatsappAdminPinInput('');
                            showToast('🔓 Admin Tools unlocked (Post Generator, Logo & Setup).');
                          } else {
                            showToast('❌ Invalid Admin Password.');
                          }
                        }
                      }}
                      placeholder="Admin Password"
                      className="px-2 py-1 rounded-lg border border-slate-300 text-slate-700 text-[11px] w-28 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cleaned = whatsappAdminPinInput.trim().toLowerCase();
                        if (cleaned === 'elimika4045') {
                          setWhatsappAdminUnlocked(true);
                          setWhatsappTab('broadcast');
                          setWhatsappAdminPinPrompt(false);
                          setWhatsappAdminPinInput('');
                          showToast('🔓 Admin Tools unlocked (Post Generator, Logo & Setup).');
                        } else {
                          showToast('❌ Invalid Admin Password.');
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

      {/* SLIM 1-LINE COOKIE & PRIVACY BAR */}
      {!cookieConsentAccepted && (
        <div className="fixed bottom-14 lg:bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-xs border-t border-slate-700 px-4 py-2 text-white">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs">
            <p className="text-[11px] text-slate-200 truncate">
              🍪 We use cookies to save your theme &amp; study preferences.{' '}
              <button
                type="button"
                onClick={() => setLegalModalType('privacy')}
                className="text-amber-300 font-bold underline cursor-pointer ml-1"
              >
                Privacy Policy
              </button>
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('elimika_cookie_consent', 'accepted');
                } catch {
                  // ignore
                }
                setCookieConsentAccepted(true);
              }}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shrink-0"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* EDITORIAL STUDY GUIDES (SHOWN ONLY ON HOME STEP 1) & FOOTER */}
      {activePage !== 'moha' && activePage !== 'game' && (
        <>
          {activePage === 'papers' && step === 1 && (
          <section id="editorial-curriculum-guide" className="py-10 bg-white border-t border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider border border-blue-200">
                  Tanzania National Curriculum &amp; Examination Reference Guide
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Comprehensive Guide to NECTA Examinations, Official TIE Textbooks &amp; Competency-Based Revision
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Structured academic guidance for Primary School (Standard 1–7 SFNA &amp; PSLE), Ordinary Secondary (Form 1–4 FTNA &amp; CSEE), and Advanced Secondary (Form 5–6 ACSEE) candidates and educators across Tanzania.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Primary Education · Standard 1–7</div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">SFNA (Standard 4) &amp; PSLE (Standard 7)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Builds core numeracy, literacy, and scientific foundations under the Tanzania Institute of Education (TIE) syllabus. Practicing past NECTA papers strengthens multiple-choice precision and structured problem solving in Mathematics, Science and Technology, English, Kiswahili, Social Studies, and Civic and Moral Education.
                  </p>
                </article>
                <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Ordinary Level · Form 1–4</div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">FTNA (Form 2) &amp; CSEE (Form 4) Mastery</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Covers core and elective subjects from Form 1 to Form 4. Combining official TIE student textbooks with NECTA Paper 1 theory and Paper 2 laboratory practical marking schemes prepares candidates for top divisions in the Certificate of Secondary Education Examination (CSEE).
                  </p>
                </article>
                <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Advanced Level · Form 5–6</div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">ACSEE Subject Combinations</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Supports Science (PCM, PCB, PGM, CBG), Business (EGM, ECA), and Humanities (HGL, HGK, HKL) combinations alongside General Studies and Basic Applied Mathematics (BAM) for university degree preparation.
                  </p>
                </article>
              </div>
            </div>
          </section>
          )}

          <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs text-center mt-auto">
            <div className="max-w-5xl mx-auto px-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <img
                    src="/assets/aistudio/Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/pwa-192x192.png';
                    }}
                    alt="Elimika Tanzania Icon"
                    className="w-10 h-10 rounded-xl shadow-md shrink-0 object-cover"
                  />
                  <div>
                    <div className="font-black text-white text-sm tracking-tight">ELIMIKA TANZANIA</div>
                    <p className="text-slate-400 text-xs">
                      Past Papers, Marking Schemes, TIE Books, Official Syllabuses &amp; Moha AI Teacher Studio.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
                  <button
                    type="button"
                    onClick={() => setWhatsappModalOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
                  >
                    💬 WhatsApp Channel
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
                    onClick={() => setLegalModalType('disclaimer')}
                    className="hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    Disclaimer
                  </button>
                  <button
                    type="button"
                    onClick={() => setLegalModalType('about')}
                    className="hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    About &amp; Contact
                  </button>
                  <a
                    href="/ads.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white underline underline-offset-4"
                  >
                    ads.txt
                  </a>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© {new Date().getFullYear()} Elimika Tanzania · Contact: +255689511868 · All rights reserved.</span>
                <span>100% English Interface · TIE &amp; NECTA Curriculum Aligned</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* GLOBAL TEXTBOOK UPLOAD & PERSISTENT NON-REPEATING QUESTION BANK MODAL */}
      <TextbookQuestionExtractorModal
        isOpen={textbookExtractorModalOpen}
        initialClass={mohaActiveClass}
        initialSubject={mohaActiveSubject}
        onClose={() => setTextbookExtractorModalOpen(false)}
        onQuestionsExtracted={({ cls, subject: sub }) => {
          setMohaActiveClass(cls);
          setMohaActiveSubject(sub);
          void syncQuestionBankWithServer(cls, sub);
          if (activePage === 'daily_quiz' || (activePage === 'moha' && mohaViewMode === 'quiz')) {
            void startAiQuiz(cls, sub, selectedQuizTopic, selectedQuizSubTopic, selectedQuizSourceFilter, activePage === 'daily_quiz');
          }
          showToast(`✅ Extracted & stored non-repeating textbook questions for ${cls} ${sub}!`);
        }}
      />
    </div>
  );
}
