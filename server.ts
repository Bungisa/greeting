import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GenerateVideosOperation, GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { getDocumentProxy } from 'unpdf';
import {
  buildContentIntegratedQuizQuestions,
  buildInstantOfficialDocument,
  buildTopicDiagramSvg,
  extractTextbookChaptersFromText,
  generateLocalSmartTutorReply,
  getDefaultFlashcardsForSubject,
  getSyllabusTopicsForClassSubject,
  getTieTextbookChapterContent,
  parseClassSubjectTopicFromPrompt,
  renderTopicDiagramBlockHtml,
  type LearnedMemoryItem,
  type OfficialDocType,
  type SiteResourceContext,
  type TeacherMetadata,
} from './src/data/curriculumData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
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
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
] as const;
const modelCooldownUntil = new Map<string, number>();

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

function withPromiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function generateContentWithQuotaFallback(
  ai: GoogleGenAI,
  params: {
    contents: unknown;
    config?: Record<string, unknown>;
    useGoogleSearch?: boolean;
    enableThinking?: boolean;
  }
): Promise<string | null> {
  const now = Date.now();
  const totalModels = GEMINI_FALLBACK_MODELS.length;

  for (let idx = 0; idx < totalModels; idx++) {
    const modelName = GEMINI_FALLBACK_MODELS[idx];
    const cooldown = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldown && idx < totalModels - 1) {
      continue;
    }
    try {
      const baseConfig: Record<string, unknown> = { ...(params.config || {}) };
      if (!params.enableThinking) {
        baseConfig.thinkingConfig = modelName.startsWith('gemini-3')
          ? { thinkingLevel: ThinkingLevel.LOW }
          : { thinkingBudget: 0 };
      }

      const configWithTools =
        params.useGoogleSearch && !baseConfig.responseMimeType
          ? { ...baseConfig, tools: [{ googleSearch: {} }] }
          : baseConfig;

      let response;
      try {
        response = await withPromiseTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: params.contents as never,
            config: configWithTools as never,
          }),
          10000
        );
      } catch (innerErr) {
        const innerMsg = innerErr instanceof Error ? innerErr.message : String(innerErr);
        if (
          innerMsg.includes('Timeout') ||
          innerMsg.includes('429') ||
          innerMsg.includes('RESOURCE_EXHAUSTED') ||
          innerMsg.includes('quota') ||
          innerMsg.includes('503') ||
          innerMsg.includes('high demand') ||
          innerMsg.includes('404') ||
          innerMsg.includes('not found')
        ) {
          throw innerErr;
        }
        const cleanConfig: Record<string, unknown> = { ...(params.config || {}) };
        delete cleanConfig.thinkingConfig;
        delete cleanConfig.tools;
        response = await withPromiseTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: params.contents as never,
            config: cleanConfig as never,
          }),
          9000
        );
      }

      let text = response.text?.trim();
      if (text) {
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
      if (
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota')
      ) {
        modelCooldownUntil.set(modelName, Date.now() + 15 * 60 * 1000);
        continue;
      }
      if (msg.includes('503') || msg.includes('high demand')) {
        modelCooldownUntil.set(modelName, Date.now() + 15 * 1000);
        continue;
      }
      if (msg.includes('404') || msg.includes('not found')) {
        modelCooldownUntil.set(modelName, Date.now() + 30 * 60 * 1000);
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

async function extractBase64PdfText(base64Data?: string, queryText = ''): Promise<string> {
  if (!base64Data) return '';
  try {
    const uint8 = new Uint8Array(Buffer.from(base64Data, 'base64'));
    if (uint8.byteLength < 100 || Buffer.from(uint8.slice(0, 5)).toString('ascii') !== '%PDF-') {
      return '';
    }
    const pdf = await getDocumentProxy(uint8);
    const maxPagesToScan = Math.min(pdf.numPages, 60);
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
    if (pages.length === 0) return '';
    const tocPages = pages.slice(0, 5);
    const queryWords = (queryText || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4);
    let matchedPages: string[] = [];
    if (queryWords.length > 0 && pages.length > 5) {
      matchedPages = pages
        .slice(5)
        .map((pageText) => {
          const lowerPage = pageText.toLowerCase();
          const score = queryWords.reduce((acc, w) => acc + (lowerPage.includes(w) ? 3 : 0), 0);
          return { pageText, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.pageText);
    }
    return [...tocPages, ...matchedPages].join('\n\n').slice(0, 9500);
  } catch {
    return '';
  }
}

function stripScannerWatermarks(rawText: string): string {
  return rawText
    .replace(/FOR\s+MORE\s+VISIT\s*[;:]?\s*https?:\/\/[^\s]+/gi, '')
    .replace(/https?:\/\/(?:www\.)?elimika\.online[^\s]*/gi, '')
    .replace(/\bCS\s*CamScanner\b/gi, '')
    .replace(/\bScanned\s+with\s+CamScanner\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
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

  const MAX_PDF_BYTES = 30 * 1024 * 1024;
  const candidateUrls = [
    `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}&confirm=t`,
  ];

  for (const dlUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18000);
      let res = await fetch(dlUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal,
      });
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        const html = await res.text();
        const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/i);
        if (uuidMatch && uuidMatch[1]) {
          const confirmUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t&uuid=${encodeURIComponent(uuidMatch[1])}`;
          res = await fetch(confirmUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: controller.signal,
          });
        } else {
          clearTimeout(timer);
          continue;
        }
      }
      const contentLen = Number(res.headers.get('content-length') || '0');
      if (!res.ok || contentLen > MAX_PDF_BYTES) {
        clearTimeout(timer);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      clearTimeout(timer);
      if (buf.byteLength < 100 || buf.byteLength > MAX_PDF_BYTES) continue;
      if (buf.slice(0, 5).toString('ascii') !== '%PDF-') continue;
      const mimeType = 'application/pdf';
      const base64Data = buf.toString('base64');
      drivePdfCache.set(driveId, { mimeType, base64Data, fetchedAt: Date.now() });
      return { mimeType, base64Data };
    } catch {
      // try next URL
    }
  }
  return null;
}

async function extractGoogleDrivePdfText(
  rawUrl?: string | null,
  queryText = ''
): Promise<string> {
  const driveId = extractDriveFileIdFromUrl(rawUrl);
  if (!driveId) return '';

  let cachedDoc = driveExtractedPagesCache.get(driveId);
  if (!cachedDoc || Date.now() - cachedDoc.fetchedAt > 2 * 60 * 60 * 1000) {
    const inlinePdf = await fetchGoogleDriveInlinePdf(rawUrl);
    if (!inlinePdf) {
      return '';
    }
    try {
      const uint8 = new Uint8Array(Buffer.from(inlinePdf.base64Data, 'base64'));
      const pdf = await getDocumentProxy(uint8);
      const maxPagesToScan = Math.min(pdf.numPages, 35);
      const pages: string[] = [];
      for (let p = 1; p <= maxPagesToScan; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const rawPageText = (content.items as Array<{ str?: string }>)
          .map((i) => i.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        const cleanedPageText = stripScannerWatermarks(rawPageText);
        // Ignore pages that only contain a short scanner watermark (scanned image pages)
        if (cleanedPageText.length >= 45) {
          pages.push(`[Page ${p}] ${cleanedPageText}`);
        }
      }
      cachedDoc = { pages, totalPages: pdf.numPages, fetchedAt: Date.now() };
      driveExtractedPagesCache.set(driveId, cachedDoc);
    } catch {
      return '';
    }
  }

  if (!cachedDoc || cachedDoc.pages.length === 0) return '';

  // For past examination papers (typically <= 20 pages), return all pages so Section A, Section B, and Section C are all included
  if (cachedDoc.totalPages <= 20) {
    return cachedDoc.pages.join('\n\n').slice(0, 14000);
  }

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
      .slice(0, 6)
      .map((s) => s.pageText);
  }

  const combined = [...tocPages, ...matchedPages].join('\n\n');
  return combined.slice(0, 12000);
}

app.get('/api/attached-resources', (_req, res) => {
  const items = Array.from(serverAttachedResources.values()).map((r) => ({
    ...r,
    // Omit heavy base64 from list payload to keep catalog fast
    attachedFileBase64: undefined,
  }));
  res.json({ resources: items });
});

app.post('/api/attached-resources', async (req, res) => {
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

  let extractedFromUpload = '';
  if (body.attachedFileBase64 && (body.attachedFileMimeType || '').includes('pdf')) {
    extractedFromUpload = await extractBase64PdfText(body.attachedFileBase64, `${form} ${subject} ${title}`);
  }

  const combinedCustomContent = [body.customContent || '', extractedFromUpload].filter(Boolean).join('\n\n').trim();

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
    customContent: combinedCustomContent,
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

// Extract Chapters / Table of Contents from Attached Textbook PDF
app.post('/api/moha/extract-book-chapters', async (req, res) => {
  try {
    const {
      paperUrl = '',
      cls = 'Form 2',
      subject = 'Basic Mathematics',
      customContent = '',
    } = req.body as {
      paperUrl?: string;
      cls?: string;
      subject?: string;
      customContent?: string;
    };

    const baseTopics = getSyllabusTopicsForClassSubject(cls, subject);
    let rawText = customContent || '';
    if (paperUrl) {
      const pdfTocText = await extractGoogleDrivePdfText(
        paperUrl,
        'table of contents chapter sura topic unit'
      );
      if (pdfTocText) {
        rawText = `${rawText}\n${pdfTocText}`;
      }
    }

    const extracted = extractTextbookChaptersFromText(rawText);
    const merged =
      extracted.length > 0
        ? [
            ...extracted,
            ...baseTopics.filter(
              (bt) => !extracted.some((ex) => ex.toLowerCase() === bt.toLowerCase())
            ),
          ]
        : baseTopics;

    return res.json({ chapters: merged, extractedCount: extracted.length });
  } catch {
    return res.json({ chapters: [], extractedCount: 0 });
  }
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
    systemPromptContext = '',
  } = req.body as {
    prompt: string;
    cls?: string;
    subject?: string;
    image?: { mimeType: string; base64Data: string; fileName?: string } | null;
    history?: Array<{ id?: string; role: 'user' | 'ai'; text: string }>;
    learnedMemory?: LearnedMemoryItem[];
    siteResources?: SiteResourceContext;
    systemPromptContext?: string;
  };

  const userPrompt = (prompt || 'Solve this question step-by-step and show the NECTA Marking Scheme.').trim();

  // Check if user is explicitly querying a learned item first
  const lower = userPrompt.toLowerCase();
  for (const item of learnedMemory) {
    const itemTopicLower = (item.topic || '').trim().toLowerCase();
    if (!itemTopicLower) continue;
    const topicWords = itemTopicLower.split(/\s+/).filter((w) => w.length >= 3);
    if (
      lower === itemTopicLower ||
      lower.includes(itemTopicLower) ||
      (topicWords.length > 0 && topicWords.every((w) => lower.includes(w)))
    ) {
      return res.json({
        reply: `🧠 **From Custom Teacher Memory — ${item.topic}:**\n\n${item.content}\n\n*(Saved on ${item.timestamp})*`,
        source: 'memory',
      });
    }
  }

  // Fast conversational routing for greetings, help, and pleasantries (never dump syllabuses or hang)
  const strippedPunct = lower.replace(/[^a-z0-9\s]/g, '').trim();
  const isConversationalGreeting =
    /^(hi|hello|hey|hii|helo|greetings|good\s+(morning|afternoon|evening|day)|hi\s+moha|hello\s+moha|hey\s+moha|how\s+are\s+you|how\s+are\s+you\s+doing|how\s+is\s+it\s+going|who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|help|how\s+to\s+use|thank\s+you|thanks|thx|ok|okay|got\s+it|nice|great|awesome|cool)$/i.test(
      strippedPunct
    );

  if (isConversationalGreeting && !image) {
    const instantReply = generateLocalSmartTutorReply(
      userPrompt,
      cls,
      subject,
      learnedMemory,
      siteResources,
      history
    );
    return res.json({
      reply: instantReply,
      source: 'local-conversational',
    });
  }

  // Parse any specific Class, Subject, or Topic mentioned in the user's prompt
  const parsedTarget = parseClassSubjectTopicFromPrompt(userPrompt, cls, subject);
  // If user explicitly asked for a specific class/subject in prompt, honor it; otherwise use pinned resource class/subject
  const effectiveCls = parsedTarget.matchedFromPrompt
    ? parsedTarget.cls
    : siteResources?.focusedResource?.form || parsedTarget.cls;
  const effectiveSubject = parsedTarget.matchedFromPrompt
    ? parsedTarget.subject
    : siteResources?.focusedResource?.subject || parsedTarget.subject;
  const effectiveTopic = parsedTarget.topic;
  const effectiveSubTopic = parsedTarget.subTopic;

  const isQuizRequest =
    /\b(quiz|questions|maswali|test me|exercise|practice)\b/i.test(userPrompt);

  const ai = getGenAIClient();
  const syllabusTopics = getSyllabusTopicsForClassSubject(effectiveCls, effectiveSubject);
  const textbookChapterInfo = getTieTextbookChapterContent(
    effectiveCls,
    effectiveSubject,
    userPrompt,
    siteResources
  );
  const learnedContext =
    learnedMemory.length > 0
      ? `\n\nTeacher/Student Custom Learned Memory:\n${learnedMemory
          .slice(0, 20)
          .map((m) => `- ${m.topic} (${m.cls} ${m.subject}): ${m.content}`)
          .join('\n')}`
      : '';

  const focusedRes = siteResources?.focusedResource;
  const isFocusedPastPaper = Boolean(
    focusedRes &&
      !focusedRes.isBook &&
      !focusedRes.isSyllabus &&
      !/\b(book|kitabu|textbook|syllabus|muhtasari)\b/i.test(`${focusedRes.category} ${focusedRes.title}`)
  );
  const serverStoredFocused = focusedRes?.id ? serverAttachedResources.get(focusedRes.id) : undefined;
  const primaryBookForSubject = siteResources?.books?.find((b) => b.paperUrl) || siteResources?.books?.[0];

  // Only extract remote Google Drive PDF when a specific Past Examination Paper is explicitly pinned
  const pdfUrlToExtract =
    isFocusedPastPaper && focusedRes && focusedRes.id && focusedRes.id !== 'ALL'
      ? focusedRes.paperUrl || focusedRes.answersUrl || null
      : null;

  const extractedPdfText = pdfUrlToExtract
    ? await Promise.race([
        extractGoogleDrivePdfText(pdfUrlToExtract, `${effectiveTopic} ${userPrompt}`),
        new Promise<string>((resolve) => setTimeout(() => resolve(''), 2000)),
      ])
    : '';

  const extractedInlinePdfText =
    image?.base64Data && (image.mimeType || '').includes('pdf')
      ? await extractBase64PdfText(image.base64Data, `${effectiveTopic} ${userPrompt}`)
      : serverStoredFocused?.attachedFileBase64 && (serverStoredFocused.attachedFileMimeType || '').includes('pdf')
      ? await extractBase64PdfText(serverStoredFocused.attachedFileBase64, `${effectiveTopic} ${userPrompt}`)
      : '';

  const userAskedForChaptersOrSyllabus =
    /\b(chapters|table of contents|syllabus|topics in|show me the official tie textbook chapters)\b/i.test(
      userPrompt
    );

  const mergedCustomContent = [
    systemPromptContext,
    focusedRes?.customContent,
    serverStoredFocused?.customContent,
    !isFocusedPastPaper ? primaryBookForSubject?.customContent : '',
    extractedInlinePdfText,
    extractedPdfText,
    userAskedForChaptersOrSyllabus ? textbookChapterInfo.chapterSummaryMarkdown : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const enrichedSiteResources: SiteResourceContext | undefined = siteResources
    ? {
        ...siteResources,
        focusedResource: siteResources.focusedResource
          ? {
              ...siteResources.focusedResource,
              customContent: [
                siteResources.focusedResource.customContent,
                serverStoredFocused?.customContent,
                extractedInlinePdfText,
                extractedPdfText,
              ]
                .filter(Boolean)
                .join('\n\n'),
            }
          : null,
      }
    : undefined;

  const focusedResourceBlock =
    isFocusedPastPaper && focusedRes
      ? `\n\n=== PINNED PAST EXAMINATION PAPER ===
- Document Title: "${focusedRes.title}"
- Category: ${focusedRes.category} | Class: ${focusedRes.form} | Subject: ${focusedRes.subject} | Year: ${focusedRes.year}
${
  mergedCustomContent.trim()
    ? `- Extracted Paper Content:\n${mergedCustomContent.slice(0, 12000)}`
    : ''
}
=== END OF PINNED RESOURCE ===`
      : mergedCustomContent.trim()
      ? `\n\n=== CURRICULUM CONTEXT (${effectiveCls} ${effectiveSubject}) ===\n${mergedCustomContent.slice(0, 6000)}`
      : '';

  const topicQuizQuestions = isQuizRequest
    ? buildContentIntegratedQuizQuestions(
        effectiveCls,
        effectiveSubject,
        effectiveTopic,
        enrichedSiteResources,
        effectiveSubTopic
      )
    : undefined;

  if (ai) {
    try {
      let activeInlineFile: { mimeType: string; base64Data: string } | null =
        image && image.base64Data && image.mimeType
          ? { mimeType: image.mimeType, base64Data: image.base64Data }
          : null;

      if (
        !activeInlineFile &&
        serverStoredFocused?.attachedFileBase64 &&
        serverStoredFocused?.attachedFileMimeType &&
        serverStoredFocused.attachedFileBase64.length < 15_000_000
      ) {
        activeInlineFile = {
          mimeType: serverStoredFocused.attachedFileMimeType,
          base64Data: serverStoredFocused.attachedFileBase64,
        };
      }

      const needsWebGrounding = /\b(search the web|google search|latest news|current events)\b/i.test(
        userPrompt
      );

      const chatCacheKey =
        history.length <= 2 && !activeInlineFile
          ? `chat:v14:${effectiveCls}:${effectiveSubject}:${isFocusedPastPaper ? focusedRes?.id : 'DIRECT'}:${userPrompt.toLowerCase().slice(0, 220)}`
          : '';

      const runChatGeneration = async () => {
        const systemInstruction = isFocusedPastPaper
          ? `You are Moha AI, an expert NECTA Examination Solver & Academic Tutor on Elimika.
Active Examination Paper: "${focusedRes?.title}" (${effectiveCls} ${effectiveSubject} · ${focusedRes?.category} ${focusedRes?.year}).
${focusedResourceBlock}${learnedContext}

CRITICAL RULES:
1. ANSWER THE USER'S EXACT REQUEST: Solve the specific question(s) requested by the user step-by-step.
2. CLEAR STEP-BY-STEP SOLUTIONS: Show clear step-by-step working/points and state the **Final Answer**.
3. DIAGRAMS ONLY WHEN RELEVANT: Only include an inline \`<svg viewBox="0 0 600 230" ...>\` if a question specifically requires a diagram, graph, circuit, or geometric figure. Never label diagrams "Figure 1.1".
4. MATHJAX: Format all mathematical and scientific equations inside $...$ (inline) or $$...$$ (display).`
          : `You are Moha AI, a highly intelligent, direct, and accurate Academic Tutor & Problem Solver on Elimika with full mastery of all subjects (Mathematics, Physics, Chemistry, Biology, Geography, History, Civics, Kiswahili, English, Literature, Book-Keeping, Commerce, Economics, Computer Science) under the Tanzanian TIE & NECTA Competence-Based Curriculum.
Current Workspace Context: ${effectiveCls} • ${effectiveSubject}.
${focusedResourceBlock}${learnedContext}

CRITICAL RULES FOR ANSWERING:
1. ANSWER THE USER'S EXACT QUESTION DIRECTLY: Read what the user is asking and answer THAT exact question immediately and accurately. NEVER ignore the user's question to output a generic textbook chapter list or unrelated topic summary.
2. LANGUAGE ADAPTATION: If the user asks in Kiswahili or asks a Kiswahili subject question, answer in fluent Kiswahili Sanifu. Otherwise, answer in clear English.
3. STEP-BY-STEP CLARITY:
   - For STEM calculations (Math, Physics, Chemistry): state the formula, substitute values step-by-step, and highlight the **Final Answer** with correct units.
   - For Arts, Humanities & Languages (History, Civics, Geography, English, Literature, Kiswahili): provide well-explained NECTA competence-based points with concrete Tanzanian/African examples (or clear grammar/literary analysis).
4. DIAGRAMS ONLY WHEN ASKED OR NECESSARY: Do NOT include an \`<svg>\` diagram on normal text/essay/grammar/history/calculation questions unless the user asks to draw/sketch/illustrate a diagram or the question specifically requires a geometric figure, graph, circuit, or lab apparatus. If you draw an SVG diagram, give it a specific title for that exact question—NEVER title it "Figure 1.1".
5. MATHJAX: Format mathematical and scientific equations inside $...$ (inline) or $$...$$ (display).`;

        const recentHistoryParts = history
          .filter((h) => !h.text.includes('official-tie-doc') && h.id !== 'msg-welcome')
          .slice(-4)
          .map((h) => `${h.role === 'user' ? 'User' : 'Moha AI'}: ${h.text.replace(/<!--DIAGRAM_START-->[\s\S]*?<!--DIAGRAM_END-->/g, '').slice(0, 600)}`)
          .join('\n\n');

        const fullPromptText = isFocusedPastPaper
          ? `Examination Paper: "${focusedRes?.title}" (${effectiveCls} ${effectiveSubject} ${focusedRes?.year}).\nUser Request: ${userPrompt}`
          : recentHistoryParts
          ? `Recent Conversation:\n${recentHistoryParts}\n\nUser's New Question (Answer this exact question directly): ${userPrompt}`
          : `User's Question (Answer this exact question directly): ${userPrompt}`;

        if (activeInlineFile && activeInlineFile.base64Data && activeInlineFile.mimeType) {
          const multimodalRes = await generateContentWithQuotaFallback(ai, {
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: activeInlineFile.mimeType,
                    data: activeInlineFile.base64Data,
                  },
                },
                { text: fullPromptText },
              ],
            },
            config: {
              systemInstruction,
              temperature: 0.25,
            },
            useGoogleSearch: false,
            enableThinking: false,
          });
          if (multimodalRes) return multimodalRes;
        }

        return generateContentWithQuotaFallback(ai, {
          contents: fullPromptText,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
          useGoogleSearch: needsWebGrounding,
          enableThinking: false,
        });
      };

      const rawGenerationPromise = chatCacheKey
        ? withHighTrafficDedupe(
            chatCacheKey,
            runChatGeneration,
            (val) => Boolean(val && val.length > 0)
          )
        : runChatGeneration();

      const replyText = await Promise.race([
        rawGenerationPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 20000)),
      ]);

      if (replyText && replyText.length > 0) {
        let cleanedReply = replyText.replace(
          /```(?:xml|svg|html)?\s*(<svg\b[\s\S]*?<\/svg>)\s*```/gi,
          '$1'
        );

        if (/<svg\b/i.test(cleanedReply) && !/<\/svg\s*>/i.test(cleanedReply)) {
          cleanedReply = cleanedReply
            .replace(/```(?:xml|svg|html)?\s*<svg\b[\s\S]*$/i, '')
            .replace(/<svg\b[\s\S]*$/i, '')
            .trim();
        }

        // Only append a fallback diagram if the user EXPLICITLY asked to draw/sketch a diagram and Gemini didn't include an <svg>
        const explicitlyAskedForDiagram =
          /\b(draw|chora|sketch|diagram\s+of|show\s+a\s+diagram|illustrate\s+with\s+a\s+diagram|table\s+and\s+an\s+interactive\s+diagram)\b/i.test(
            userPrompt
          );

        const finalReply =
          explicitlyAskedForDiagram && !cleanedReply.includes('<!--DIAGRAM_START-->') && !cleanedReply.includes('<svg')
            ? `${cleanedReply}\n\n<!--DIAGRAM_START-->${renderTopicDiagramBlockHtml(
                effectiveCls,
                effectiveSubject,
                textbookChapterInfo.matchedChapter || effectiveTopic,
                effectiveSubTopic || effectiveTopic
              )}<!--DIAGRAM_END-->`
            : cleanedReply;

        const extractedBookChapters = extractTextbookChaptersFromText(
          `${extractedPdfText}\n${extractedInlinePdfText}`
        );

        return res.json({
          reply: finalReply,
          source: 'gemini',
          parsedTarget,
          quizQuestions: topicQuizQuestions,
          extractedBookChapters,
        });
      }
    } catch {
      // Fallback to built-in curriculum engine below
    }
  }

  // Fallback to built-in curriculum engine (which generates distinct topic-, class-, and resource-specific answers!)
  const fallbackReply = generateLocalSmartTutorReply(
    userPrompt,
    effectiveCls,
    effectiveSubject,
    learnedMemory,
    enrichedSiteResources,
    history
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

  const tbInfo = getTieTextbookChapterContent(
    meta.cls,
    meta.subject,
    `${meta.topic} ${meta.subTopic}`,
    meta.siteResources
  );

  const resourceSummary = meta.siteResources
    ? `Attached Textbook: "${tbInfo.bookTitle}" (Matched Chapter: ${tbInfo.matchedChapter}; Sub-topics: ${tbInfo.subTopicsList.join(', ')}${tbInfo.attachedExcerpt ? `; Excerpt: ${tbInfo.attachedExcerpt.slice(0, 1500)}` : ''}). Uploaded Website Books: ${meta.siteResources.books.map((b) => b.title).join(', ')}. Uploaded Syllabuses: ${meta.siteResources.syllabuses.map((s) => s.title).join(', ')}. Uploaded Past Papers: ${meta.siteResources.papers.map((p) => `${p.title} (${p.year})`).join(', ')}.`
    : `Attached Textbook: "${tbInfo.bookTitle}" (Matched Chapter: ${tbInfo.matchedChapter}; Sub-topics: ${tbInfo.subTopicsList.join(', ')}).`;

  const ai = getGenAIClient();
  if (ai && (type === 'lessonplan' || type === 'markingscheme' || type === 'lessonnotes')) {
    try {
      if (type === 'lessonplan') {
        const jsonText = await generateContentWithQuotaFallback(ai, {
          contents: `Create specific, curriculum-authentic Tanzanian TIE 4-stage lesson plan activities for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}, Present Students: ${meta.presTotal}. Strictly follow the attached textbook contents: ${resourceSummary}`,
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
        const docCacheKey = `doc:lessonnotes:v2:${meta.cls}:${meta.subject}:${meta.topic}:${meta.subTopic}:${tbInfo.bookTitle}`;
        const jsonText = await withHighTrafficDedupe(
          docCacheKey,
          () =>
            generateContentWithQuotaFallback(ai, {
              contents: `Create comprehensive official Tanzanian TIE Lesson Notes for Class: ${meta.cls}, Subject: ${meta.subject}, Main Topic: ${meta.topic}, Sub-Topic: ${meta.subTopic}. Strictly follow the attached textbook "${tbInfo.bookTitle}" (${tbInfo.matchedChapter}) and its sub-topics (${tbInfo.subTopicsList.join(', ')}): ${resourceSummary}. Include 3 detailed keyConcepts (directly explaining the textbook sub-topics and labeled diagram components), 2 step-by-step workedExamples, and 3 NECTA-style practiceQuestions with marking hints. STRICT MATHJAX RULE: Format all mathematical expressions, formulas, fractions (\\frac{a}{b}), roots (\\sqrt{x}), exponents (x^2), logarithms (\\log_{10}(x)), and scientific equations inside $...$ inline LaTeX delimiters.`,
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
  const primaryBook = siteResources?.books?.find((b) => b.paperUrl || b.customContent) || siteResources?.books?.[0];

  // Also check serverAttachedResources for any user-uploaded textbook or PDF for this Class & Subject
  const clsLower = cls.toLowerCase();
  const subLower = subject.toLowerCase();
  const matchingServerBook = Array.from(serverAttachedResources.values()).find(
    (r) =>
      r.isBook &&
      r.form.toLowerCase() === clsLower &&
      (r.subject.toLowerCase().includes(subLower) || subLower.includes(r.subject.toLowerCase()))
  );

  const effectiveResourceTitle =
    (specificResourceTitle && specificResourceTitle !== 'ALL' ? specificResourceTitle : undefined) ||
    focusedRes?.title ||
    primaryBook?.title ||
    matchingServerBook?.title ||
    tbInfo.bookTitle;

  const pdfUrlForQuiz =
    focusedRes?.paperUrl ||
    primaryBook?.paperUrl ||
    matchingServerBook?.paperUrl ||
    null;

  const extractedQuizPdfText = pdfUrlForQuiz
    ? await Promise.race([
        extractGoogleDrivePdfText(pdfUrlForQuiz, `${topic || ''} ${subTopic || ''}`),
        new Promise<string>((resolve) => setTimeout(() => resolve(''), 8000)),
      ])
    : '';

  const extractedBase64PdfText =
    !extractedQuizPdfText && matchingServerBook?.attachedFileBase64
      ? await Promise.race([
          extractBase64PdfText(matchingServerBook.attachedFileBase64, `${topic || ''} ${subTopic || ''}`),
          new Promise<string>((resolve) => setTimeout(() => resolve(''), 5000)),
        ])
      : '';

  const tieBuiltInChapterReference = [
    `Official TIE Textbook Chapter: ${tbInfo.matchedChapter} (${tbInfo.bookTitle})`,
    `Sub-Topics: ${tbInfo.subTopicsList.join(', ')}`,
    tbInfo.attachedExcerpt ? `Textbook Excerpt: ${tbInfo.attachedExcerpt}` : '',
    tbInfo.chapterSummaryMarkdown ? `Chapter Summary:\n${tbInfo.chapterSummaryMarkdown}` : '',
    tbInfo.chapterDeepNotes ? `Chapter Deep Notes:\n${tbInfo.chapterDeepNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const mergedQuizText = [
    focusedRes?.customContent,
    primaryBook?.customContent,
    matchingServerBook?.customContent,
    extractedQuizPdfText,
    extractedBase64PdfText,
    tieBuiltInChapterReference,
  ]
    .filter(Boolean)
    .join('\n\n');

  const specificResourceLine = `PRIMARY ATTACHED TIE TEXTBOOK / SOURCE: Base the questions directly on "${effectiveResourceTitle}" for ${cls} ${subject} (Chapter: ${tbInfo.matchedChapter}).\nExtracted Textbook / Chapter Content:\n${mergedQuizText.slice(0, 7500)}`;

  const subLowerCheck = subject.toLowerCase();
  const isArtsOrLanguageSubject =
    subLowerCheck.includes('history') ||
    subLowerCheck.includes('historia') ||
    subLowerCheck.includes('civics') ||
    subLowerCheck.includes('uraia') ||
    subLowerCheck.includes('general studies') ||
    subLowerCheck.includes('english') ||
    subLowerCheck.includes('literature') ||
    subLowerCheck.includes('kiswahili') ||
    subLowerCheck.includes('communication') ||
    subLowerCheck.includes('maarifa') ||
    subLowerCheck.includes('sanaa') ||
    subLowerCheck.includes('kusoma') ||
    subLowerCheck.includes('kuandika');

  const sourceConstraintText =
    sourceFilter === 'BOOK' || sourceFilter === 'textbook'
      ? `All ${targetCount} questions MUST be competence-based exercises grounded in the Official TIE ${cls} ${subject} Textbook (${tbInfo.bookTitle}).`
      : sourceFilter === 'PAPER' || sourceFilter === 'past_paper'
      ? `All ${targetCount} questions MUST be authentic NECTA Competence-Based Assessment (CBA) examination questions grounded in ${cls} ${subject} NECTA / Mock Past Papers.`
      : `Odd-numbered questions MUST be competence-based exercises from the Official TIE ${cls} ${subject} Textbook (${tbInfo.bookTitle}), and even-numbered questions MUST be authentic NECTA Competence-Based examination questions from ${cls} ${subject} Past Papers.`;

  const subjectAdaptationRules = isArtsOrLanguageSubject
    ? `ARTS, HUMANITIES & LANGUAGE NECTA COMPETENCE-BASED ADAPTATION RULES:
- Because "${subject}" is an Arts / Humanities / Language subject, generate authentic NECTA Competence-Based Assessment (CBA) questions that test real subject content, case studies, historical/civic scenarios, source interpretation, grammatical transformation, literary analysis, or real-life Tanzanian applications of "${tbInfo.matchedChapter}".
- NEVER generate meta-questions about how many marks an essay has, how to write an introduction paragraph, or how marking schemes work. Every question MUST test actual ${cls} ${subject} curriculum knowledge and competence!
- Frame questions using NECTA CBA stems (e.g., "A local community in Tanzania faces...", "During the ${tbInfo.matchedChapter} period, why did...", "Identify the grammatical/literary function in...", "Which constitutional principle applies when...").
- If the subject is Kiswahili, write the questions, options, and explanations in standard, formal Kiswahili (Sanifu) aligned with TIE & NECTA Kiswahili examinations. For all other subjects, write in 100% clear English.`
    : `STEM & QUANTITATIVE NECTA COMPETENCE-BASED ADAPTATION RULES:
- Generate concrete numerical, analytical, experimental, or real-world competence-based problem-solving questions for ${cls} ${subject} on "${tbInfo.matchedChapter}".
- STRICT MATHJAX RULE: Format all mathematical expressions, equations, fractions (\\frac{a}{b}), roots (\\sqrt{x}), exponents (x^2), logarithms (\\log_{10}(x)), integrals, derivatives, and scientific formulas inside $...$ inline LaTeX delimiters in "question", "options", and "explanation".`;

  const availableContentSummary = siteResources
    ? `Uploaded Website Books & Past Papers for ${cls} ${subject}:
- Official TIE Textbook Chapters: ${syllabusTopics.join('; ')}
- Uploaded TIE Books: ${siteResources.books.map((b) => b.title).join(', ') || tbInfo.bookTitle}
- Uploaded Syllabuses: ${siteResources.syllabuses.map((s) => s.title).join(', ') || `Official TIE ${cls} ${subject} Syllabus`}
- Uploaded Past Papers: ${siteResources.papers.map((p) => `${p.title} (${p.year})`).join(', ') || `NECTA ${cls} ${subject} Past Papers`}`
    : '';

  const ai = getGenAIClient();

  const isConceptOfMathTopic =
    /\b(concept\s+of\s+mathematics|meaning\s+of\s+mathematics|branches\s+of\s+mathematics|relationship\s+between\s+mathematics|relationships\s+between\s+mathematics|mathematics\s+and\s+other\s+subjects|importance\s+of\s+mathematics)\b/i.test(
      `${topic || ''} ${subTopic || ''}`
    );

  if (isConceptOfMathTopic) {
    const conceptQuestions = buildFallbackTopicQuizQuestions(
      cls,
      subject,
      topic,
      siteResources,
      subTopic,
      sourceFilter
    );
    return res.json({
      questions: conceptQuestions.slice(0, targetCount),
      source: 'local',
    });
  }

  if (ai) {
    try {
      const quizCacheKey = `quiz:v4:${cls}:${subject}:${topic || 'ALL'}:${subTopic || 'ALL'}:${sourceFilter}:${targetCount}:${effectiveResourceTitle || 'ALL'}`;
      const jsonText = await withHighTrafficDedupe(
        quizCacheKey,
        async () => {
          const promptText = `Generate ${targetCount} distinct, authentic NECTA Competence-Based Assessment (CBA) questions for Tanzanian ${cls} ${subject} ${selectedTopicText}.
${specificResourceLine}
${sourceConstraintText}
${subjectAdaptationRules}
${availableContentSummary}
IMPORTANT RULES:
1. Every question MUST be strictly for ${cls} ${subject} and specifically on ${topic && topic !== 'ALL' ? `"${tbInfo.matchedChapter}"${subTopic && subTopic !== 'ALL' ? ` (Sub-Topic: "${subTopic}")` : ''}` : `the ${cls} ${subject} TIE textbook chapters`} — never include questions from other chapters or higher classes, and never return generic meta-questions about exam formatting.
2. Vary the correct answer position across options 0, 1, 2, and 3 so the correct answer is NOT always index 0.
3. Provide 4 clear options, correctIndex (0 to 3), a clear competence-based explanation in "explanation" (explaining why the answer is correct with real curriculum facts/steps), the "topic", the "subTopic", and the exact Book or Past Paper title in "sourceRef".`;

          return generateContentWithQuotaFallback(ai, {
            contents: promptText,
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
            enableThinking: false,
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

app.get('/ads.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send('google.com, pub-7502193981138651, DIRECT, f08c47fec0942fa0\n');
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
