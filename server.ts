import 'dotenv/config';
import express from 'express';
import fs from 'fs';
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
import { FULL_EXTRACTED_TEXTBOOK_BANK } from './src/data/extractedTextbookExerciseBank.ts';

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
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
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
    timeoutMs?: number;
  }
): Promise<string | null> {
  const now = Date.now();
  const totalModels = GEMINI_FALLBACK_MODELS.length;
  const primaryTimeoutMs = params.timeoutMs || 18000;

  for (let idx = 0; idx < totalModels; idx++) {
    const modelName = GEMINI_FALLBACK_MODELS[idx];
    const cooldown = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldown && idx < totalModels - 1) {
      continue;
    }
    try {
      const baseConfig: Record<string, unknown> = { ...(params.config || {}) };
      delete baseConfig.temperature;
      if (!params.enableThinking && modelName.startsWith('gemini-3')) {
        baseConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
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
          primaryTimeoutMs
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
        delete cleanConfig.temperature;
        delete cleanConfig.thinkingConfig;
        delete cleanConfig.tools;
        response = await withPromiseTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: params.contents as never,
            config: cleanConfig as never,
          }),
          primaryTimeoutMs
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

const LEGACY_AISTUDIO_PDF_DRIVE_MAP: Record<string, string> = {
  'ADDITIONAL_BOOK_3-elimika.online_71df8e17.pdf': '1o6_JCDYRIwDcMrXLlNtD-YJqNi-BFC1m',
  'FORM_THREE_TIE_MATHEMATICS-elimika.online_da6faf57.pdf': '1euVsPlxlXUYLdkX7ajEk7FjMRDgVNO8j',
  'Additional_Mathematics_Form_Two_elimika.online_21d0053d.pdf': '1GlOxsR4aMBoQBPxDpqWQ0H4aRwlbn_I1',
  'Basic_Mathematics_F2_elimika.online_65ef9876.pdf': '1yhx10LAspqFck81xdn56WcPsnH_JbLzI',
  'MATHEMATICS_F1_-_Elimuzone.com_0e32bcd9.pdf': '1g0lE1PZAyD1wjQP_EyjzUJow39caujxn',
};

function extractDriveFileIdFromUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  for (const [fileName, driveId] of Object.entries(LEGACY_AISTUDIO_PDF_DRIVE_MAP)) {
    if (rawUrl.includes(fileName)) return driveId;
  }
  if (!rawUrl.includes('drive.google.com')) return null;
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

  // If this uploaded resource is a Textbook, automatically extract & store questions in serverQuestionBank
  if (isBook) {
    void extractAndStoreQuestionsIntoServerBank({
      cls: form,
      subject,
      topic: 'ALL',
      bookTitle: title,
      customContent: combinedCustomContent,
      paperUrl: body.paperUrl || undefined,
      attachedFileBase64: body.attachedFileBase64,
      count: 20,
    }).catch(() => {});
  }

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

// ==================== PERSISTENT TEXTBOOK QUESTION BANK STORE & EXTRACTOR ====================
interface ServerStoredTextbookQuestion {
  id: string;
  signature: string;
  cls: string;
  subject: string;
  topic: string;
  subTopic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  hint: string;
  explanation: string;
  sourceBookTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
}

const QUESTION_BANK_FILE_PATH = path.join(__dirname, '.aistudio', 'question-bank-v7.json');
const serverQuestionBank = new Map<string, ServerStoredTextbookQuestion>();
const builtinSeedIds = new Set<string>(FULL_EXTRACTED_TEXTBOOK_BANK.map((s) => s.id));

function computeServerQuestionSignature(questionText: string): string {
  return String(questionText || '')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 140);
}

function loadServerQuestionBankFromDisk(): void {
  const legacyF1BasicMathTopics = [
    'numbers i',
    'chapter 3: fractions',
    'decimals and percentages',
    'metric units',
    'chapter 6: approximations',
    'introduction to geometry',
    'chapter 8: algebra',
    'numbers ii',
    'ratios, profit',
    'chapter 11: coordinate geometry',
    'perimeters and areas',
  ];
  try {
    if (fs.existsSync(QUESTION_BANK_FILE_PATH)) {
      const raw = fs.readFileSync(QUESTION_BANK_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.question === 'string' && Array.isArray(item.options) && item.options.length >= 4) {
            const clsLower = String(item.cls || '').toLowerCase().trim();
            const subLower = String(item.subject || '').toLowerCase().trim();
            const topicLower = String(item.topic || '').toLowerCase();
            const idStr = String(item.id || '');
            const idLower = idStr.toLowerCase();
            // Skip any built-in seed item on disk so code updates to FULL_EXTRACTED_TEXTBOOK_BANK always take precedence
            if (
              builtinSeedIds.has(idStr) ||
              idLower.includes('-bank-ch') ||
              idLower.startsWith('addmath-') ||
              idLower.startsWith('bmath-') ||
              idLower.startsWith('cs-f1-')
            ) {
              continue;
            }
            if (
              clsLower === 'form 1' &&
              subLower.includes('basic math') &&
              legacyF1BasicMathTopics.some((legacy) => topicLower.includes(legacy))
            ) {
              continue;
            }
            const sig = item.signature || computeServerQuestionSignature(item.question);
            const key = `${clsLower}__${subLower}__${sig}`;
            serverQuestionBank.set(key, {
              ...item,
              signature: sig,
              options: [
                String(item.options[0]),
                String(item.options[1]),
                String(item.options[2]),
                String(item.options[3]),
              ],
            });
          }
        }
      }
    }
  } catch {
    // ignore read error
  }
}

function saveServerQuestionBankToDisk(): void {
  try {
    const dir = path.dirname(QUESTION_BANK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const allItems = Array.from(serverQuestionBank.values()).slice(-2500);
    fs.writeFileSync(QUESTION_BANK_FILE_PATH, JSON.stringify(allItems, null, 2), 'utf-8');
  } catch {
    // ignore write error
  }
}

function seedBuiltinExtractedBankOnServer(): void {
  for (const seed of FULL_EXTRACTED_TEXTBOOK_BANK) {
    const sig = computeServerQuestionSignature(seed.question);
    const key = `${seed.cls.toLowerCase()}__${seed.subject.toLowerCase()}__${sig}`;
    serverQuestionBank.set(key, {
      id: seed.id,
      signature: sig,
      cls: seed.cls,
      subject: seed.subject,
      topic: seed.topic,
      subTopic: seed.subTopic,
      question: seed.question,
      options: [seed.options[0], seed.options[1], seed.options[2], seed.options[3]],
      correctIndex: seed.correctIndex,
      hint: seed.hint,
      explanation: seed.explanation,
      sourceBookTitle: `${seed.textbookTitle} — ${seed.exerciseRef}`,
      difficulty: 'Medium',
      createdAt: '2026-10-30',
    });
  }
}

seedBuiltinExtractedBankOnServer();
loadServerQuestionBankFromDisk();
saveServerQuestionBankToDisk();

function doesServerSubjectMatchStrict(itemSub: string, targetSub: string): boolean {
  const a = String(itemSub || '').toLowerCase().trim();
  const b = String(targetSub || '').toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes('additional math') || b.includes('additional math')) {
    return a.includes('additional math') && b.includes('additional math');
  }
  if (a.includes('advanced math') || b.includes('advanced math') || a.includes('bam') || b.includes('bam')) {
    return (a.includes('advanced math') || a.includes('bam')) && (b.includes('advanced math') || b.includes('bam'));
  }
  if (a.includes('mathematics') || b.includes('mathematics') || a.includes('hisabati') || b.includes('hisabati')) {
    return (
      (a.includes('basic math') || a === 'mathematics' || a.includes('hisabati')) &&
      (b.includes('basic math') || b === 'mathematics' || b.includes('hisabati'))
    );
  }
  if (
    a.includes('computer') ||
    a.includes('information and computer') ||
    a === 'ics' ||
    a === 'ict' ||
    b.includes('computer') ||
    b.includes('information and computer') ||
    b === 'ics' ||
    b === 'ict'
  ) {
    return (
      (a.includes('computer') || a.includes('information and computer') || a === 'ics' || a === 'ict') &&
      (b.includes('computer') || b.includes('information and computer') || b === 'ics' || b === 'ict')
    );
  }
  return a.includes(b) || b.includes(a);
}

function getServerStoredQuestions(cls?: string, subject?: string): ServerStoredTextbookQuestion[] {
  const all = Array.from(serverQuestionBank.values());
  return all.filter((q) => {
    if (cls && q.cls.toLowerCase().trim() !== cls.toLowerCase().trim()) return false;
    if (subject && !doesServerSubjectMatchStrict(q.subject, subject)) return false;
    return true;
  });
}

function buildDeterministicTextbookQuestionsForBank(
  cls: string,
  subject: string,
  topic: string,
  bookTitle: string,
  targetCount: number,
  excludeSigs: Set<string>
): ServerStoredTextbookQuestion[] {
  const chapters = getSyllabusTopicsForClassSubject(cls, subject);
  const effectiveChapters =
    topic && topic !== 'ALL'
      ? [topic, ...chapters.filter((c) => c !== topic)]
      : chapters.length > 0
      ? chapters
      : ['Chapter 1: Core Competence'];

  const results: ServerStoredTextbookQuestion[] = [];
  const subLower = subject.toLowerCase();
  const isAddMath = subLower.includes('additional math');
  const isBasicMath = !isAddMath && (subLower.includes('math') || subLower.includes('hisabati'));
  const formMatch = cls.match(/Form\s*([1-6])/i);
  const formNum = formMatch ? Number(formMatch[1]) : 1;

  // First pull from built-in content-integrated textbook questions across every chapter
  for (const ch of effectiveChapters) {
    if (results.length >= targetCount) break;
    const chapterQns = buildContentIntegratedQuizQuestions(cls, subject, ch, undefined, undefined, 'BOOK');
    for (const cq of chapterQns) {
      if (results.length >= targetCount) break;
      const sig = computeServerQuestionSignature(cq.question);
      if (!sig || excludeSigs.has(sig) || results.some((r) => r.signature === sig)) continue;
      if (!Array.isArray(cq.options) || cq.options.length < 4) continue;
      results.push({
        id: `tb-${Date.now()}-${results.length}`,
        signature: sig,
        cls,
        subject,
        topic: cq.topic || ch,
        subTopic: cq.subTopic || ch,
        question: cq.question,
        options: [cq.options[0], cq.options[1], cq.options[2], cq.options[3]],
        correctIndex: cq.correctIndex ?? 0,
        hint: `Apply the ${cls} ${subject} formula from ${ch}.`,
        explanation: cq.explanation || 'Step-by-step TIE textbook solution.',
        sourceBookTitle: bookTitle || cq.sourceRef || `Official TIE ${cls} ${subject} Student's Book`,
        difficulty: results.length % 3 === 0 ? 'Easy' : results.length % 3 === 1 ? 'Medium' : 'Hard',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  // Generate additional parameterized textbook exercises for Mathematics & Additional Mathematics so the bank never runs out
  let seedIdx = 0;
  while (results.length < targetCount && seedIdx < 80) {
    seedIdx++;
    const ch = effectiveChapters[(seedIdx - 1) % effectiveChapters.length] || 'Chapter 1';
    const correctIndex = seedIdx % 4;
    let qText = '';
    let correctAns = '';
    let distractors: [string, string, string] = ['', '', ''];
    let hint = '';
    let explanation = '';

    if (isAddMath) {
      const mode = seedIdx % 5;
      if (formNum === 1) {
        if (mode === 0) {
          const d = (seedIdx % 5) + 2;
          const a1 = (seedIdx % 6) + 2;
          const t5 = a1 + 4 * d;
          qText = `[${cls} • ${bookTitle} — Number Patterns] In an arithmetic sequence with first term $a_1 = ${a1}$ and common difference $d = ${d}$, find the 5th term $T_5$.`;
          correctAns = `$${t5}$`;
          distractors = [`$${t5 + d}$`, `$${t5 - d}$`, `$${a1 * 5}$`];
          hint = 'Use $T_n = a_1 + (n - 1)d$.';
          explanation = `$T_5 = ${a1} + (5 - 1)\\times ${d} = ${a1} + ${4 * d} = ${t5}$.`;
        } else if (mode === 1) {
          const x0 = (seedIdx % 5) + 1;
          const y0 = (seedIdx % 6) + 2;
          qText = `[${cls} • ${bookTitle} — Coordinate Geometry & Symmetry] Find the image of the point $P(${x0}, ${y0})$ after reflection in the line $y = x$.`;
          correctAns = `$(${y0}, ${x0})$`;
          distractors = [`$(-${x0}, ${y0})$`, `$(${x0}, -${y0})$`, `$(-${y0}, -${x0})$`];
          hint = 'Reflection in $y = x$ swaps $(x, y) \\to (y, x)$.';
          explanation = `Reflecting $P(${x0}, ${y0})$ across $y = x$ gives $P'(${y0}, ${x0})$.`;
        } else if (mode === 2) {
          const k = (seedIdx % 4) + 2;
          const b = (seedIdx % 5) + 1;
          const c = k * b + (seedIdx % 6) + 3;
          const sol = (c - k * b) / k;
          if (Number.isInteger(sol) && sol > 0) {
            qText = `[${cls} • ${bookTitle} — Algebraic Manipulation] Solve for $x$: $${k}(x + ${b}) = ${c}$.`;
            correctAns = `$x = ${sol}$`;
            distractors = [`$x = ${sol + 2}$`, `$x = ${sol + 1}$`, `$x = ${c - b}$`];
            hint = 'Divide by the coefficient or expand first.';
            explanation = `$${k}x + ${k * b} = ${c} \\Rightarrow ${k}x = ${c - k * b} \\Rightarrow x = ${sol}$.`;
          } else {
            const p = (seedIdx % 5) + 2;
            const q = (seedIdx % 4) + 1;
            qText = `[${cls} • ${bookTitle} — Simultaneous Equations] Solve for $(x, y)$ if $x + y = ${p + q}$ and $x - y = ${p - q}$.`;
            correctAns = `$(${p}, ${q})$`;
            distractors = [`$(${q}, ${p + 1})$`, `$(${p + 1}, ${q - 1})$`, `$(${p + q}, ${p})$`];
            hint = 'Add the two equations to find $2x$.';
            explanation = `$2x = ${2 * p} \\Rightarrow x = ${p}$, and $y = ${q}$.`;
          }
        } else if (mode === 3) {
          const x1 = 2;
          const y1 = (seedIdx % 4) + 2;
          const x2 = 6;
          const y2 = y1 + ((seedIdx % 3) + 1) * 2;
          qText = `[${cls} • ${bookTitle} — Coordinate Geometry] Find the midpoint $M$ of the line segment joining $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
          correctAns = `$(${(x1 + x2) / 2}, ${(y1 + y2) / 2})$`;
          distractors = [`$(${x2 - x1}, ${y2 - y1})$`, `$(${x1 + x2}, ${y1 + y2})$`, `$(${(x1 + x2) / 2}, ${y2})$`];
          hint = 'Use $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$.';
          explanation = `$M = \\left(\\frac{${x1}+${x2}}{2}, \\frac{${y1}+${y2}}{2}\\right) = (${(x1 + x2) / 2}, ${(y1 + y2) / 2})$.`;
        } else {
          const a = (seedIdx % 4) + 2;
          const b = (seedIdx % 5) + 3;
          qText = `[${cls} • ${bookTitle} — Algebraic Identities] Expand and simplify $(x + ${a})(x + ${b})$.`;
          correctAns = `$x^2 + ${a + b}x + ${a * b}$`;
          distractors = [`$x^2 + ${a * b}x + ${a + b}$`, `$x^2 + ${a + b}x + ${a + b}$`, `$x^2 - ${a + b}x + ${a * b}$`];
          hint = 'Use $(x + a)(x + b) = x^2 + (a + b)x + ab$.';
          explanation = `$(x + ${a})(x + ${b}) = x^2 + ${a + b}x + ${a * b}$.`;
        }
      } else if (formNum === 2) {
        if (mode === 0) {
          const x1Sol = (seedIdx % 4) + 1;
          const y1Sol = (seedIdx % 3) + 2;
          const sumXY = x1Sol + y1Sol;
          const sumSq = x1Sol * x1Sol + y1Sol * y1Sol;
          qText = `[${cls} • ${bookTitle} — Chapter 1: Algebra] Solve the simultaneous equations $x + y = ${sumXY}$ and $x^2 + y^2 = ${sumSq}$.`;
          correctAns = `$(${x1Sol}, ${y1Sol})$ and $(${y1Sol}, ${x1Sol})$`;
          distractors = [
            `$(-${x1Sol}, -${y1Sol})$ and $(${x1Sol}, -${y1Sol})$`,
            `$(${x1Sol + 1}, ${y1Sol - 1})$ and $(${y1Sol}, ${x1Sol})$`,
            `$(${sumXY}, 0)$ and $(0, ${sumXY})$`,
          ];
          hint = 'Substitute $y = ' + sumXY + ' - x$ into $x^2 + y^2 = ' + sumSq + '$.';
          explanation = `Substituting $y = ${sumXY} - x$ into $x^2 + y^2 = ${sumSq}$ gives $(x - ${x1Sol})(x - ${y1Sol}) = 0 \\Rightarrow (${x1Sol}, ${y1Sol})$ and $(${y1Sol}, ${x1Sol})$.`;
        } else if (mode === 1) {
          const k = (seedIdx % 4) + 2;
          const x0 = (seedIdx % 3) + 2;
          const z0 = 2;
          const y0 = k * x0 * z0 * z0;
          const x1 = x0 + 1;
          const y1 = k * x1 * 9;
          qText = `[${cls} • ${bookTitle} — Chapter 2: Variations] Given $y$ varies jointly as $x$ and $z^2$ ($y = kxz^2$), and $y = ${y0}$ when $x = ${x0}, z = ${z0}$, find $y$ when $x = ${x1}$ and $z = 3$.`;
          correctAns = `$y = ${y1}$ (with $k = ${k}$)`;
          distractors = [`$y = ${k * x1 * 3}$`, `$y = ${y1 + 12}$`, `$y = ${y0 * 2}$`];
          hint = 'Find $k = \\frac{y}{xz^2}$ first.';
          explanation = `$k = \\frac{${y0}}{${x0} \\times ${z0}^2} = ${k}$. When $x = ${x1}, z = 3$, $y = ${k}(${x1})(9) = ${y1}$.`;
        } else if (mode === 2) {
          qText = `[${cls} • ${bookTitle} — Chapter 3: Logic] State the contrapositive of $p \\rightarrow q$ and classify $[(p \\rightarrow q) \\wedge \\sim q] \\rightarrow \\sim p$:`;
          correctAns = `Contrapositive: $\\sim q \\rightarrow \\sim p$ ; Valid argument (Tautology / Modus Tollens)`;
          distractors = [
            `Contrapositive: $q \\rightarrow p$ ; Invalid argument`,
            `Contrapositive: $\\sim p \\rightarrow \\sim q$ ; Contradiction`,
            `Contrapositive: $\\sim q \\rightarrow \\sim p$ ; Contradiction`,
          ];
          hint = 'The contrapositive of $p \\rightarrow q$ negates and swaps both statements.';
          explanation = `The contrapositive of $p \\rightarrow q$ is $\\sim q \\rightarrow \\sim p$, and Modus Tollens $[(p \\rightarrow q) \\wedge \\sim q] \\rightarrow \\sim p$ is a Tautology (Valid).`;
        } else if (mode === 3) {
          const h = (seedIdx % 4) + 1;
          const k = (seedIdx % 3) + 2;
          const r = (seedIdx % 3) + 3;
          const cVal = h * h + k * k - r * r;
          const cFmt = cVal >= 0 ? `+ ${cVal}` : `- ${Math.abs(cVal)}`;
          qText = `[${cls} • ${bookTitle} — Chapter 4: Locus] Find the equation of the locus of a point $P(x, y)$ whose distance from $(${h}, ${k})$ is always $${r}$ units.`;
          correctAns = `$x^2 + y^2 - ${2 * h}x - ${2 * k}y ${cFmt} = 0$`;
          distractors = [
            `$x^2 + y^2 + ${2 * h}x + ${2 * k}y ${cFmt} = 0$`,
            `$x^2 + y^2 - ${h}x - ${k}y - ${r * r} = 0$`,
            `$x^2 + y^2 - ${2 * h}x - ${2 * k}y + ${r * r} = 0$`,
          ];
          hint = 'Expand $(x - h)^2 + (y - k)^2 = r^2$.';
          explanation = `$(x - ${h})^2 + (y - ${k})^2 = ${r}^2 \\Rightarrow x^2 + y^2 - ${2 * h}x - ${2 * k}y ${cFmt} = 0$.`;
        } else {
          const abc = (seedIdx % 4) + 5;
          const nA = 40 + (seedIdx % 6);
          const nB = 35 + (seedIdx % 5);
          const nC = 30 + (seedIdx % 5);
          const nAB = abc + 6;
          const nAC = abc + 4;
          const nBC = abc + 5;
          const nUnion = nA + nB + nC - nAB - nAC - nBC + abc;
          qText = `[${cls} • ${bookTitle} — Chapter 5: Sets] Given $n(A)=${nA}, n(B)=${nB}, n(C)=${nC}, n(A\\cap B)=${nAB}, n(A\\cap C)=${nAC}, n(B\\cap C)=${nBC},$ and $n(A\\cap B\\cap C)=${abc}$, find $n(A \\cup B \\cup C)$.`;
          correctAns = `$${nUnion}$`;
          distractors = [`$${nUnion - abc}$`, `$${nUnion + abc}$`, `$${nA + nB + nC}$`];
          hint = 'Use $n(A \\cup B \\cup C) = n(A)+n(B)+n(C)-n(A\\cap B)-n(A\\cap C)-n(B\\cap C)+n(A\\cap B\\cap C)$.';
          explanation = `$n(A \\cup B \\cup C) = ${nA} + ${nB} + ${nC} - ${nAB} - ${nAC} - ${nBC} + ${abc} = ${nUnion}$.`;
        }
      } else if (formNum === 3) {
        if (mode === 0) {
          qText = `[${cls} • ${bookTitle} — Chapter 1: Sets] Simplify $(B - A)'$ and $(B \\cap C) \\cup (B \\cap C')$ using the laws of algebra of sets.`;
          correctAns = `$(B - A)' = A \\cup B'$ and $(B \\cap C) \\cup (B \\cap C') = B$`;
          distractors = [
            `$(B - A)' = A' \\cap B$ and $(B \\cap C) \\cup (B \\cap C') = C$`,
            `$(B - A)' = A \\cup B'$ and $(B \\cap C) \\cup (B \\cap C') = \\varnothing$`,
            `$(B - A)' = B \\cup A'$ and $(B \\cap C) \\cup (B \\cap C') = B \\cup C$`,
          ];
          hint = 'Use $B - A = B \\cap A\'$ and De Morgan’s law.';
          explanation = `$(B - A)' = (B \\cap A')' = A \\cup B'$, and $(B \\cap C) \\cup (B \\cap C') = B \\cap (C \\cup C') = B$.`;
        } else if (mode === 1) {
          const sumR = (seedIdx % 4) + 2;
          const prodR = (seedIdx % 3) + 1;
          const sumSq = sumR * sumR - 2 * prodR;
          qText = `[${cls} • ${bookTitle} — Chapter 2: Equation and Remainder Theorem] If $\\alpha$ and $\\beta$ are roots of $x^2 - ${sumR}x + ${prodR} = 0$, find $\\alpha^2 + \\beta^2$ and the remainder when $x^3 - 5x + 6$ is divided by $x - 2$.`;
          correctAns = `$\\alpha^2 + \\beta^2 = ${sumSq}$ and Remainder $= 4$`;
          distractors = [
            `$\\alpha^2 + \\beta^2 = ${sumR * sumR}$ and Remainder $= 4$`,
            `$\\alpha^2 + \\beta^2 = ${sumSq}$ and Remainder $= 8$`,
            `$\\alpha^2 + \\beta^2 = ${sumR * sumR + 2 * prodR}$ and Remainder $= 0$`,
          ];
          hint = 'Use $\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta$ and evaluate $p(2)$.';
          explanation = `$\\alpha^2 + \\beta^2 = ${sumR}^2 - 2(${prodR}) = ${sumSq}$, and $p(2) = 8 - 10 + 6 = 4$.`;
        } else if (mode === 2) {
          const v1 = (seedIdx % 3) + 1;
          const v2 = v1 + 3;
          const lead = (seedIdx % 4) + 2;
          qText = `[${cls} • ${bookTitle} — Chapter 3: Functions] Find the vertical and horizontal asymptotes of the rational function $f(x) = \\frac{${lead}x^2 - 1}{(x - ${v1})(x - ${v2})}$.`;
          correctAns = `Vertical: $x = ${v1}, x = ${v2}$ ; Horizontal: $y = ${lead}$`;
          distractors = [
            `Vertical: $x = -${v1}, x = -${v2}$ ; Horizontal: $y = 0$`,
            `Vertical: $x = ${v1}, x = ${v2}$ ; Horizontal: $y = \\frac{1}{${lead}}$`,
            `Vertical: None ; Horizontal: $y = ${lead}$`,
          ];
          hint = 'Set the denominator to zero for vertical asymptotes and take the ratio of leading $x^2$ coefficients for the horizontal asymptote.';
          explanation = `Denominator $(x-${v1})(x-${v2})=0$ gives $x=${v1}, ${v2}$, and ratio of $x^2$ coefficients gives $y=${lead}$.`;
        } else if (mode === 3) {
          qText = `[${cls} • ${bookTitle} — Chapter 5: Trigonometry] Simplify $\\tan x + \\frac{\\cos x}{1 + \\sin x}$ and find $\\sin 2\\theta$ if $\\sin\\theta = \\frac{1}{\\sqrt{5}}$ for acute $\\theta$.`;
          correctAns = `$\\sec x$ and $\\sin 2\\theta = \\frac{4}{5}$`;
          distractors = [
            `$\\csc x$ and $\\sin 2\\theta = \\frac{3}{5}$`,
            `$\\sec x$ and $\\sin 2\\theta = \\frac{2}{5}$`,
            `$\\cos x$ and $\\sin 2\\theta = \\frac{4}{5}$`,
          ];
          hint = 'Combine over $\\cos x(1 + \\sin x)$ using $\\sin^2 x + \\cos^2 x = 1$, and use $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$.';
          explanation = `$\\frac{\\sin x + \\sin^2 x + \\cos^2 x}{\\cos x(1+\\sin x)} = \\sec x$, and $\\sin 2\\theta = 2(\\frac{1}{\\sqrt{5}})(\\frac{2}{\\sqrt{5}}) = \\frac{4}{5}$.`;
        } else {
          const a = (seedIdx % 4) + 2;
          const b = (seedIdx % 5) + 1;
          const xVal = (seedIdx % 3) + 1;
          const grad = 2 * a * xVal + b;
          qText = `[${cls} • ${bookTitle} — Chapter 6: Differentiation] Find the gradient of the tangent to $y = ${a}x^2 + ${b}x - 3$ at $x = ${xVal}$.`;
          correctAns = `$${grad}$`;
          distractors = [`$${2 * a * xVal}$`, `$${a * xVal * xVal + b * xVal - 3}$`, `$${grad + a}$`];
          hint = 'Differentiate $\\frac{dy}{dx} = 2ax + b$ and substitute $x$.';
          explanation = `$\\frac{dy}{dx} = ${2 * a}x + ${b}$. At $x = ${xVal}$, gradient $= ${2 * a}(${xVal}) + ${b} = ${grad}$.`;
        }
      } else {
        const k = ((seedIdx % 4) + 1) * 2;
        const upper = (seedIdx % 3) + 2;
        const val = (k / 2) * upper * upper;
        qText = `[${cls} • ${bookTitle} — Definite Integration] Evaluate $\\int_0^{${upper}} ${k}x\\,dx$.`;
        correctAns = `$${val}$`;
        distractors = [`$${k * upper}$`, `$${val * 2}$`, `$${val + upper}$`];
        hint = 'Use $\\int_0^b kx\\,dx = \\left[\\frac{k}{2}x^2\\right]_0^b$.';
        explanation = `$\\left[${k / 2}x^2\\right]_0^{${upper}} = ${k / 2}(${upper}^2) = ${val}$.`;
      }
    } else if (isBasicMath) {
      const mode = seedIdx % 5;
      if (formNum === 1) {
        if (mode === 0) {
          const a = (seedIdx % 5) + 2;
          const xVal = (seedIdx % 6) + 2;
          const b = (seedIdx % 7) + 1;
          const rhs = a * xVal + b;
          qText = `[${cls} • ${bookTitle} — Chapter 5: Algebra] Solve for $x$ in the linear equation $${a}x + ${b} = ${rhs}$.`;
          correctAns = `$x = ${xVal}$`;
          distractors = [`$x = ${xVal + 2}$`, `$x = ${xVal - 1}$`, `$x = ${rhs - b}$`];
          hint = 'Subtract the constant term and divide by the coefficient of $x$.';
          explanation = `$${a}x = ${rhs} - ${b} = ${a * xVal} \\Rightarrow x = ${xVal}$.`;
        } else if (mode === 1) {
          const d1 = (seedIdx % 8) + 1;
          const d2 = ((seedIdx + 3) % 8) + 1;
          const num = d1 * 10 + d2;
          qText = `[${cls} • ${bookTitle} — Chapter 2: Numbers] Express the repeating decimal $0.\\dot{${d1}}\\dot{${d2}}$ as a rational fraction in the form $\\frac{a}{b}$.`;
          correctAns = `$\\frac{${num}}{99}$`;
          distractors = [`$\\frac{${num}}{100}$`, `$\\frac{${num}}{90}$`, `$\\frac{${num - d1}}{99}$`];
          hint = 'For a two-digit repeating block after the decimal point, place the two-digit number over $99$.';
          explanation = `Let $x = 0.${d1}${d2}${d1}${d2}\\dots \\Rightarrow 100x - x = ${num} \\Rightarrow 99x = ${num} \\Rightarrow x = \\frac{${num}}{99}$.`;
        } else if (mode === 2) {
          const x1 = 1;
          const y1 = (seedIdx % 4) + 1;
          const m = (seedIdx % 4) + 2;
          const x2 = 4;
          const y2 = y1 + m * (x2 - x1);
          qText = `[${cls} • ${bookTitle} — Chapter 6: Coordinate Geometry] Find the gradient (slope) of the straight line passing through $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
          correctAns = `$${m}$`;
          distractors = [`$${m + 1}$`, `$\\frac{1}{${m}}$`, `$${-m}$`];
          hint = 'Use $m = \\frac{y_2 - y_1}{x_2 - x_1}$.';
          explanation = `$m = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$.`;
        } else if (mode === 3) {
          const whole = (seedIdx % 8) + 2;
          const decStr = `${whole}.${(seedIdx % 7) + 1}86`;
          const val = parseFloat(decStr);
          qText = `[${cls} • ${bookTitle} — Chapter 3: Approximations] Round off $${decStr}$ correct to $2$ decimal places and $3$ significant figures.`;
          correctAns = `$${val.toFixed(2)}$ ($2$ d.p.) and $${val.toPrecision(3)}$ ($3$ s.f.)`;
          distractors = [
            `$${(val - 0.01).toFixed(2)}$ ($2$ d.p.) and $${(val - 0.01).toPrecision(3)}$ ($3$ s.f.)`,
            `$${val.toFixed(1)}$ ($2$ d.p.) and $${val.toFixed(3)}$ ($3$ s.f.)`,
            `$${(val + 0.02).toFixed(2)}$ ($2$ d.p.) and $${whole}.00$ ($3$ s.f.)`,
          ];
          hint = 'Check the 3rd decimal digit ($6 \\ge 5$) to round up the 2nd decimal place.';
          explanation = `Since the 3rd decimal digit is $6 \\ge 5$, $${decStr}$ rounds to $${val.toFixed(2)}$ ($2$ d.p.) and $${val.toPrecision(3)}$ ($3$ s.f.).`;
        } else {
          const g1 = (seedIdx % 4) + 2;
          const g2 = g1 + 1;
          const totalParts = g1 + g2;
          const mult = ((seedIdx % 5) + 2) * 1000;
          const totalAmount = totalParts * mult;
          qText = `[${cls} • ${bookTitle} — Chapter 4: Ratios and Proportions] Divide TZS $${totalAmount.toLocaleString()}$ in the ratio $${g1} : ${g2}$. What is the larger share?`;
          correctAns = `TZS $${(g2 * mult).toLocaleString()}$`;
          distractors = [
            `TZS $${(g1 * mult).toLocaleString()}$`,
            `TZS $${((g2 + 1) * mult).toLocaleString()}$`,
            `TZS $${(totalAmount / 2).toLocaleString()}$`,
          ];
          hint = 'Divide the total by the sum of ratio parts, then multiply by the larger part.';
          explanation = `Total parts $= ${g1} + ${g2} = ${totalParts}$. Larger share $= \\frac{${g2}}{${totalParts}} \\times ${totalAmount.toLocaleString()} = \\text{TZS } ${(g2 * mult).toLocaleString()}$.`;
        }
      } else if (formNum === 2) {
        if (mode === 0) {
          const r1 = (seedIdx % 5) + 1;
          const r2 = r1 + (seedIdx % 4) + 2;
          qText = `[${cls} • ${bookTitle} — Chapter 4: Algebra] Solve the quadratic equation $x^2 - ${r1 + r2}x + ${r1 * r2} = 0$ by factorisation.`;
          correctAns = `$x = ${r1}$ or $x = ${r2}$`;
          distractors = [
            `$x = -${r1}$ or $x = -${r2}$`,
            `$x = ${r1}$ or $x = -${r2}$`,
            `$x = ${r1 + 1}$ or $x = ${r2 - 1}$`,
          ];
          hint = 'Factorise as $(x - a)(x - b) = 0$.';
          explanation = `$x^2 - ${r1 + r2}x + ${r1 * r2} = (x - ${r1})(x - ${r2}) = 0 \\Rightarrow x = ${r1}$ or $x = ${r2}$.`;
        } else if (mode === 1) {
          const kPow = (seedIdx % 4) + 2;
          const rhs = Math.pow(2, kPow + 1);
          qText = `[${cls} • ${bookTitle} — Chapter 5: Exponents and Radicals] Solve for $x$ in $2^{x + 1} = ${rhs}$ and rationalise $\\frac{6}{\\sqrt{5} - \\sqrt{2}}$.`;
          correctAns = `$x = ${kPow}$ and $2(\\sqrt{5} + \\sqrt{2})$`;
          distractors = [
            `$x = ${kPow + 1}$ and $2(\\sqrt{5} - \\sqrt{2})$`,
            `$x = ${kPow}$ and $3(\\sqrt{5} + \\sqrt{2})$`,
            `$x = ${kPow - 1}$ and $\\sqrt{5} + \\sqrt{2}$`,
          ];
          hint = 'Express the RHS as a power of $2$ and multiply the surd denominator by its conjugate $(\\sqrt{5} + \\sqrt{2})$.';
          explanation = `$2^{x+1} = 2^{${kPow + 1}} \\Rightarrow x = ${kPow}$, and $\\frac{6(\\sqrt{5}+\\sqrt{2})}{5-2} = 2(\\sqrt{5}+\\sqrt{2})$.`;
        } else if (mode === 2) {
          const p2 = (seedIdx % 3) + 1;
          const p3 = (seedIdx % 2) + 1;
          const valN = Math.pow(2, p2) * Math.pow(3, p3);
          const ansLog = (p2 * 0.3010 + p3 * 0.4771).toFixed(4);
          qText = `[${cls} • ${bookTitle} — Chapter 6: Logarithms] Given $\\log_{10} 2 = 0.3010$ and $\\log_{10} 3 = 0.4771$, find $\\log_{10} ${valN}$.`;
          correctAns = `$${ansLog}$`;
          distractors = [
            `$${(parseFloat(ansLog) + 0.3010).toFixed(4)}$`,
            `$${(parseFloat(ansLog) - 0.1761).toFixed(4)}$`,
            `$${(p2 * 0.4771 + p3 * 0.3010).toFixed(4)}$`,
          ];
          hint = `Write $${valN} = 2^{${p2}} \\times 3^{${p3}}$ and apply the laws of logarithms.`;
          explanation = `$\\log_{10} ${valN} = ${p2}\\log_{10} 2 + ${p3}\\log_{10} 3 = ${ansLog}$.`;
        } else if (mode === 3) {
          const s1 = (seedIdx % 3) + 2;
          const s2 = s1 + 3;
          const a1 = s1 * s1 * 3;
          const a2 = s2 * s2 * 3;
          qText = `[${cls} • ${bookTitle} — Chapter 2 & 3: Congruence and Similarity] Two similar triangles have corresponding sides in the ratio $${s1} : ${s2}$. If the smaller triangle has area $${a1}\\text{ cm}^2$, find the area of the larger triangle.`;
          correctAns = `$${a2}\\text{ cm}^2$`;
          distractors = [`$${s1 * s2 * 3}\\text{ cm}^2$`, `$${a1 * 2}\\text{ cm}^2$`, `$${a2 + 15}\\text{ cm}^2$`];
          hint = 'Ratio of areas of similar figures equals the square of the ratio of their corresponding sides.';
          explanation = `$\\frac{A_1}{A_2} = \\left(\\frac{${s1}}{${s2}}\\right)^2 \\Rightarrow A_2 = \\frac{${a1} \\times ${s2 * s2}}{${s1 * s1}} = ${a2}\\text{ cm}^2$.`;
        } else {
          const d = ((seedIdx % 5) + 2) * 10;
          qText = `[${cls} • ${bookTitle} — Chapter 8: Trigonometry] From a point $${d}\\text{ m}$ from the foot of a vertical tower on level ground, the angle of elevation of the top of the tower is $60^\\circ$. Find the height of the tower.`;
          correctAns = `$${d}\\sqrt{3}\\text{ m}$`;
          distractors = [`$\\frac{${d}}{\\sqrt{3}}\\text{ m}$`, `$${d}\\text{ m}$`, `$${2 * d}\\text{ m}$`];
          hint = 'Use $\\tan 60^\\circ = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\sqrt{3}$.';
          explanation = `$\\tan 60^\\circ = \\frac{h}{${d}} \\Rightarrow h = ${d}\\tan 60^\\circ = ${d}\\sqrt{3}\\text{ m}$.`;
        }
      } else if (formNum === 3) {
        if (mode === 0) {
          const m = (seedIdx % 4) + 2;
          const c = (seedIdx % 5) + 1;
          qText = `[${cls} • ${bookTitle} — Chapter 1: Relations] Find the inverse relation $R^{-1}$ of $R = \\{(x, y) : y = ${m}x + ${c}\\}$ and the range of $S = \\{(x, y) : y = x^2 + ${c}\\}$.`;
          correctAns = `$R^{-1}: y = \\frac{x - ${c}}{${m}}$ and Range of $S$: $\\{y \\in \\mathbb{R} : y \\ge ${c}\\}$`;
          distractors = [
            `$R^{-1}: y = \\frac{x + ${c}}{${m}}$ and Range of $S$: $\\mathbb{R}$`,
            `$R^{-1}: y = ${m}x - ${c}$ and Range of $S$: $\\{y \\ge 0\\}$`,
            `$R^{-1}: y = \\frac{x - ${c}}{${m}}$ and Range of $S$: $\\{y \\le ${c}\\}$`,
          ];
          hint = 'Swap $x$ and $y$ to find $R^{-1}$, and note that $x^2 \\ge 0$ for all $x \\in \\mathbb{R}$.';
          explanation = `Swapping $x$ and $y$ gives $x = ${m}y + ${c} \\Rightarrow y = \\frac{x - ${c}}{${m}}$, and since $x^2 \\ge 0$, $y = x^2 + ${c} \\ge ${c}$.`;
        } else if (mode === 1) {
          const h = (seedIdx % 4) + 2;
          const k = (seedIdx % 5) + 1;
          qText = `[${cls} • ${bookTitle} — Chapter 2: Functions] Find the turning point (vertex) and axis of symmetry of $f(x) = x^2 - ${2 * h}x + ${h * h + k}$, and evaluate $\\lfloor 5.75 \\rfloor$.`;
          correctAns = `Vertex $(${h}, ${k})$, Axis $x = ${h}$, and $\\lfloor 5.75 \\rfloor = 5$`;
          distractors = [
            `Vertex $(-${h}, ${k})$, Axis $x = -${h}$, and $\\lfloor 5.75 \\rfloor = 6$`,
            `Vertex $(${h}, ${k})$, Axis $x = ${h}$, and $\\lfloor 5.75 \\rfloor = 6$`,
            `Vertex $(${h}, ${h * h + k})$, Axis $x = ${2 * h}$, and $\\lfloor 5.75 \\rfloor = 5$`,
          ];
          hint = 'Complete the square $f(x) = (x - h)^2 + k$.';
          explanation = `$f(x) = (x - ${h})^2 + ${k}$ has minimum vertex $(${h}, ${k})$ on axis $x = ${h}$, and $\\lfloor 5.75 \\rfloor = 5$.`;
        } else if (mode === 2) {
          qText = `[${cls} • ${bookTitle} — Chapter 3: Linear Programming] Maximize $f(x, y) = 2x + 3y$ subject to $x + 2y \\le 10,\\; 3x + y \\le 15,\\; x \\ge 0,\\; y \\ge 0$.`;
          correctAns = `Maximum value $= 17$ at $(4, 3)$`;
          distractors = [
            `Maximum value $= 15$ at $(0, 5)$`,
            `Maximum value $= 10$ at $(5, 0)$`,
            `Maximum value $= 20$ at $(4, 4)$`,
          ];
          hint = 'Find the intersection $(4, 3)$ of $x + 2y = 10$ and $3x + y = 15$ and test all corner points.';
          explanation = `Corner points are $(0,0), (5,0), (4,3), (0,5)$, and $f(4,3) = 2(4) + 3(3) = 17$ is maximum.`;
        } else if (mode === 3) {
          const a1 = (seedIdx % 5) + 3;
          const d = (seedIdx % 4) + 2;
          const a10 = a1 + 9 * d;
          const s10 = 5 * (a1 + a10);
          qText = `[${cls} • ${bookTitle} — Chapter 4: Sequences and Series] In an AP with $A_1 = ${a1}$ and $d = ${d}$, find $A_{10}$ and $S_{10}$.`;
          correctAns = `$A_{10} = ${a10},\\; S_{10} = ${s10}$`;
          distractors = [
            `$A_{10} = ${a1 + 10 * d},\\; S_{10} = ${s10 + 15}$`,
            `$A_{10} = ${a10},\\; S_{10} = ${10 * a10}$`,
            `$A_{10} = ${a10 - d},\\; S_{10} = ${s10 - a1}$`,
          ];
          hint = 'Use $A_n = A_1 + (n-1)d$ and $S_n = \\frac{n}{2}(A_1 + A_n)$.';
          explanation = `$A_{10} = ${a1} + 9(${d}) = ${a10}$ and $S_{10} = 5(${a1} + ${a10}) = ${s10}$.`;
        } else {
          const ang = 70 + (seedIdx % 5) * 5;
          const opp = 180 - ang;
          qText = `[${cls} • ${bookTitle} — Chapter 5: Circles] In a cyclic quadrilateral $ABCD$, $\\angle ABC = ${ang}^\\circ$; find $\\angle ADC$, and find the length of a chord $5\\text{ cm}$ from the centre of a circle of radius $13\\text{ cm}$.`;
          correctAns = `$\\angle ADC = ${opp}^\\circ$ and Chord length $= 24\\text{ cm}$`;
          distractors = [
            `$\\angle ADC = ${ang}^\\circ$ and Chord length $= 12\\text{ cm}$`,
            `$\\angle ADC = ${opp}^\\circ$ and Chord length $= 12\\text{ cm}$`,
            `$\\angle ADC = ${2 * ang}^\\circ$ and Chord length $= 24\\text{ cm}$`,
          ];
          hint = 'Opposite angles of a cyclic quadrilateral sum to $180^\\circ$, and half-chord $= \\sqrt{13^2 - 5^2} = 12\\text{ cm}$.';
          explanation = `$\\angle ADC = 180^\\circ - ${ang}^\\circ = ${opp}^\\circ$, and chord length $= 2\\sqrt{13^2 - 5^2} = 24\\text{ cm}$.`;
        }
      } else {
        const a = (seedIdx % 5) + 2;
        const b = a + (seedIdx % 4) + 1;
        qText = `[${cls} • ${bookTitle} — ${ch}] Solve for the positive root of $x^2 - ${a + b}x + ${a * b} = 0$ given $x > ${a}$.`;
        correctAns = `$x = ${b}$`;
        distractors = [`$x = ${a}$`, `$x = ${a + b}$`, `$x = ${a * b}$`];
        hint = 'Factorise $(x - a)(x - b) = 0$.';
        explanation = `$(x - ${a})(x - ${b}) = 0 \\Rightarrow x = ${b}$ (since $x > ${a}$).`;
      }
    } else {
      break;
    }

    const sig = computeServerQuestionSignature(qText);
    if (!sig || excludeSigs.has(sig) || results.some((r) => r.signature === sig)) continue;

    const opts: [string, string, string, string] = ['', '', '', ''];
    opts[correctIndex] = correctAns;
    let dPtr = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        opts[i] = distractors[dPtr++];
      }
    }

    results.push({
      id: `tb-gen-${Date.now()}-${results.length}`,
      signature: sig,
      cls,
      subject,
      topic: ch,
      subTopic: ch,
      question: qText,
      options: opts,
      correctIndex,
      hint,
      explanation,
      sourceBookTitle: bookTitle || `Official TIE ${cls} ${subject} Student's Book`,
      difficulty: results.length % 3 === 0 ? 'Easy' : results.length % 3 === 1 ? 'Medium' : 'Hard',
      createdAt: new Date().toISOString().split('T')[0],
    });
  }

  return results;
}

async function extractAndStoreQuestionsIntoServerBank(params: {
  cls: string;
  subject: string;
  topic?: string;
  bookTitle?: string;
  customContent?: string;
  paperUrl?: string;
  attachedFileBase64?: string;
  count?: number;
}): Promise<{
  addedCount: number;
  totalStoredForSubject: number;
  extractedQuestions: ServerStoredTextbookQuestion[];
}> {
  const cls = (params.cls || 'Form 1').trim();
  const subject = (params.subject || 'Basic Mathematics').trim();
  const topic = (params.topic || 'ALL').trim();
  const targetCount = Math.min(40, Math.max(5, Number(params.count) || 25));
  const tbInfo = getTieTextbookChapterContent(cls, subject, topic !== 'ALL' ? topic : '');
  const bookTitle = (params.bookTitle || tbInfo.bookTitle || `Official TIE ${cls} ${subject} Student's Book`).trim();

  let extractedPdfText = '';
  if (params.attachedFileBase64) {
    extractedPdfText = await Promise.race([
      extractBase64PdfText(params.attachedFileBase64, `${cls} ${subject} ${topic}`),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 8000)),
    ]);
  }
  if (!extractedPdfText && params.paperUrl) {
    extractedPdfText = await Promise.race([
      extractGoogleDrivePdfText(params.paperUrl, `${cls} ${subject} ${topic}`),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 8000)),
    ]);
  }

  const syllabusTopics = getSyllabusTopicsForClassSubject(cls, subject);
  const combinedSourceText = [
    params.customContent || '',
    extractedPdfText,
    `Official TIE Textbook: ${bookTitle}`,
    `Chapters: ${syllabusTopics.join('; ')}`,
    tbInfo.chapterSummaryMarkdown || '',
    tbInfo.chapterDeepNotes || '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 11000);

  const existingForSubject = getServerStoredQuestions(cls, subject);
  const existingSignatures = new Set(existingForSubject.map((q) => q.signature));

  const newlyExtracted: ServerStoredTextbookQuestion[] = [];
  const ai = getGenAIClient();

  if (ai) {
    try {
      const existingPreview = existingForSubject
        .slice(-20)
        .map((q) => `- ${q.question.slice(0, 90)}`)
        .join('\n');

      const promptText = `Extract and generate ${targetCount} distinct, authentic competence-based textbook exercises and problems for Tanzanian ${cls} ${subject} from the textbook "${bookTitle}"${topic && topic !== 'ALL' ? ` focusing on "${topic}"` : ` covering all chapters (${syllabusTopics.join(', ')})`}.

TEXTBOOK CONTENT & EXERCISES SOURCE:
${combinedSourceText}

${existingPreview ? `DO NOT REPEAT ANY OF THESE ALREADY-STORED QUESTIONS:\n${existingPreview}\n` : ''}
CRITICAL RULES:
1. Every question MUST be strictly at ${cls} ${subject} curriculum level (never mix Basic Mathematics with Additional Mathematics).
2. Format all mathematical formulas, fractions (\\frac{a}{b}), roots (\\sqrt{x}), exponents (x^2), sets, matrices, derivatives, and integrals inside $...$ inline LaTeX delimiters.
3. Provide 4 distinct options, correctIndex (0 to 3), a helpful "hint", a step-by-step worked "explanation", the chapter "topic", and "subTopic".`;

      const jsonText = await generateContentWithQuotaFallback(ai, {
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
                hint: { type: Type.STRING },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING },
                subTopic: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation', 'topic'],
            },
          },
        },
        enableThinking: false,
      });

      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
          for (const raw of parsed) {
            if (!raw || typeof raw.question !== 'string' || !Array.isArray(raw.options) || raw.options.length < 4) {
              continue;
            }
            const sig = computeServerQuestionSignature(raw.question);
            if (!sig || existingSignatures.has(sig) || newlyExtracted.some((n) => n.signature === sig)) {
              continue;
            }
            newlyExtracted.push({
              id: `tb-ai-${Date.now()}-${newlyExtracted.length}`,
              signature: sig,
              cls,
              subject,
              topic: raw.topic || (topic !== 'ALL' ? topic : syllabusTopics[0] || 'Chapter 1'),
              subTopic: raw.subTopic || raw.topic || 'Textbook Exercise',
              question: raw.question,
              options: [
                String(raw.options[0]),
                String(raw.options[1]),
                String(raw.options[2]),
                String(raw.options[3]),
              ],
              correctIndex:
                typeof raw.correctIndex === 'number' && raw.correctIndex >= 0 && raw.correctIndex <= 3
                  ? raw.correctIndex
                  : 0,
              hint: raw.hint || `Use the ${cls} ${subject} formula from ${bookTitle}.`,
              explanation: raw.explanation || 'Step-by-step TIE textbook solution.',
              sourceBookTitle: bookTitle,
              difficulty: newlyExtracted.length % 3 === 0 ? 'Easy' : newlyExtracted.length % 3 === 1 ? 'Medium' : 'Hard',
              createdAt: new Date().toISOString().split('T')[0],
            });
          }
        }
      }
    } catch {
      // Fall back to deterministic textbook extractor below
    }
  }

  if (newlyExtracted.length < targetCount) {
    const combinedExcludes = new Set([
      ...Array.from(existingSignatures),
      ...newlyExtracted.map((n) => n.signature),
    ]);
    const deterministicBatch = buildDeterministicTextbookQuestionsForBank(
      cls,
      subject,
      topic,
      bookTitle,
      targetCount - newlyExtracted.length,
      combinedExcludes
    );
    newlyExtracted.push(...deterministicBatch);
  }

  let addedCount = 0;
  for (const item of newlyExtracted) {
    const key = `${item.cls.toLowerCase()}__${item.subject.toLowerCase()}__${item.signature}`;
    if (!serverQuestionBank.has(key)) {
      serverQuestionBank.set(key, item);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    saveServerQuestionBankToDisk();
  }

  const updatedForSubject = getServerStoredQuestions(cls, subject);
  return {
    addedCount,
    totalStoredForSubject: updatedForSubject.length,
    extractedQuestions: newlyExtracted,
  };
}

// Get stored textbook questions from server bank
app.get('/api/question-bank', (req, res) => {
  const cls = req.query.cls ? String(req.query.cls) : undefined;
  const subject = req.query.subject ? String(req.query.subject) : undefined;
  const questions = getServerStoredQuestions(cls, subject);
  return res.json({
    questions,
    totalCount: questions.length,
  });
});

// Upload Textbook PDF / Drive Link / Text & Extract Questions into Persistent Question Bank
app.post('/api/question-bank/extract', async (req, res) => {
  try {
    const {
      cls = 'Form 1',
      subject = 'Basic Mathematics',
      topic = 'ALL',
      bookTitle,
      customContent,
      paperUrl,
      attachedFileBase64,
      attachedFileName,
      count = 25,
    } = req.body as {
      cls?: string;
      subject?: string;
      topic?: string;
      bookTitle?: string;
      customContent?: string;
      paperUrl?: string;
      attachedFileBase64?: string;
      attachedFileName?: string;
      count?: number;
    };

    // Also register the textbook in serverAttachedResources if a PDF or URL or content was provided
    if (attachedFileBase64 || paperUrl || (customContent && customContent.trim().length > 40)) {
      const resTitle =
        (bookTitle || '').trim() ||
        `Official TIE ${cls} ${subject} Student's Textbook`;
      const resId = `tb-upload-${cls.toLowerCase().replace(/\s+/g, '')}-${subject.toLowerCase().replace(/\s+/g, '')}`;
      serverAttachedResources.set(resId, {
        id: resId,
        title: resTitle,
        form: cls,
        subject,
        year: new Date().getFullYear().toString(),
        category: 'TIE Book',
        paperUrl: paperUrl || null,
        answersUrl: null,
        isBook: true,
        isSyllabus: false,
        customContent: customContent || '',
        attachedFileMimeType: attachedFileBase64 ? 'application/pdf' : undefined,
        attachedFileBase64,
        attachedFileName,
        isUserAttached: true,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    const result = await extractAndStoreQuestionsIntoServerBank({
      cls,
      subject,
      topic,
      bookTitle,
      customContent,
      paperUrl,
      attachedFileBase64,
      count,
    });

    return res.json({
      addedCount: result.addedCount,
      totalStoredForSubject: result.totalStoredForSubject,
      extractedQuestions: result.extractedQuestions,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to extract textbook questions',
    });
  }
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
          const imageSolverInstruction = `IMPORTANT MULTIMODAL EXAM/QUESTION PHOTO INSTRUCTION:
The user has attached an image or document containing examination or textbook question(s).
1. Carefully read and transcribe EVERY question and sub-question ((a), (b), (c), (i), (ii), (iii), tables, diagrams, etc.) visible in the attached image.
2. Solve EVERY visible question and sub-part completely, step-by-step, showing all formulas, substitutions, intermediate calculations, and the **Final Answer** for each part.
3. NEVER output generic syllabus notes or unrelated chapter examples—solve the exact questions printed in the attached photo!\n\n${fullPromptText}`;

          const multimodalRes = await generateContentWithQuotaFallback(ai, {
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: activeInlineFile.mimeType,
                    data: activeInlineFile.base64Data,
                  },
                },
                { text: imageSolverInstruction },
              ],
            },
            config: {
              systemInstruction,
            },
            useGoogleSearch: false,
            enableThinking: false,
            timeoutMs: 35000,
          });
          if (multimodalRes) return multimodalRes;
        }

        return generateContentWithQuotaFallback(ai, {
          contents: fullPromptText,
          config: {
            systemInstruction,
          },
          useGoogleSearch: needsWebGrounding,
          enableThinking: false,
          timeoutMs: 20000,
        });
      };

      const rawGenerationPromise = chatCacheKey
        ? withHighTrafficDedupe(
            chatCacheKey,
            runChatGeneration,
            (val) => Boolean(val && val.length > 0)
          )
        : runChatGeneration();

      const outerTimeoutMs = activeInlineFile ? 40000 : 24000;
      const replyText = await Promise.race([
        rawGenerationPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), outerTimeoutMs)),
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

// Moha AI Interactive Quiz & Game Question Generator Endpoint (integrates specific topic, subTopic & uploaded website books/past papers + Non-Repeating Question Bank)
app.post('/api/moha/quiz', async (req, res) => {
  const {
    cls = 'Form 1',
    subject = 'Basic Mathematics',
    topic,
    subTopic,
    sourceFilter = 'ALL',
    siteResources,
    count = 20,
    specificResourceTitle,
    excludeSignatures = [],
    variantOffset = 0,
  } = req.body as {
    cls?: string;
    subject?: string;
    topic?: string;
    subTopic?: string;
    sourceFilter?: 'ALL' | 'BOOK' | 'PAPER' | 'textbook' | 'past_paper';
    siteResources?: SiteResourceContext;
    count?: number;
    specificResourceTitle?: string;
    excludeSignatures?: string[];
    variantOffset?: number;
  };

  const targetCount = Math.min(25, Math.max(4, Number(count) || 20));
  const excludedSet = new Set(
    Array.isArray(excludeSignatures)
      ? excludeSignatures.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean)
      : []
  );

  // 1. Check Persistent Server Textbook Question Bank first for unseen questions!
  const parseTopicLabelServer = (raw: string) => {
    const cleaned = (raw || '').trim();
    const chMatch = cleaned.match(/^(?:Chapter|Topic)\s*(\d+)\s*[:.-]?\s*(.*)$/i);
    const chapterNum = chMatch ? chMatch[1] : null;
    const withoutPrefix = chMatch ? chMatch[2] : cleaned;
    const core = withoutPrefix
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/—.*$/, '')
      .trim()
      .toLowerCase();
    return { chapterNum, core };
  };

  const storedForClassSubject = getServerStoredQuestions(cls, subject).filter((q) => {
    if (topic && topic !== 'ALL') {
      const sel = parseTopicLabelServer(topic);
      const qTop = parseTopicLabelServer(q.topic || '');
      if (sel.chapterNum && qTop.chapterNum && sel.chapterNum !== qTop.chapterNum) {
        return false;
      }
      if (sel.core && qTop.core) {
        if (qTop.core === sel.core || qTop.core.includes(sel.core) || sel.core.includes(qTop.core)) {
          return true;
        }
      }
      const stopWords = new Set(['and', 'the', 'of', 'in', 'to', 'for', 'with', 'on', 'by', 'a', 'an', 'chapter', 'topic', 'introduction']);
      const selWords = sel.core.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3 && !stopWords.has(w));
      const qCombined = `${qTop.core} ${(q.subTopic || '').toLowerCase()}`.replace(/[^a-z0-9\s]/g, ' ');
      if (selWords.length > 0 && selWords.every((w) => qCombined.includes(w))) {
        return true;
      }
      return false;
    }
    return true;
  });

  const seenBankSigs = new Set<string>();
  const unseenFromBank = storedForClassSubject
    .filter((q) => {
      if (!q.signature || excludedSet.has(q.signature) || seenBankSigs.has(q.signature)) {
        return false;
      }
      seenBankSigs.add(q.signature);
      return true;
    })
    .map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      hint: q.hint,
      topic: q.topic,
      subTopic: q.subTopic,
      sourceRef: q.sourceBookTitle,
    }));

  if (unseenFromBank.length >= targetCount) {
    return res.json({
      questions: unseenFromBank.slice(0, targetCount),
      source: 'question_bank',
    });
  }
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
      const quizCacheKey = `quiz:v5:${cls}:${subject}:${topic || 'ALL'}:${subTopic || 'ALL'}:${sourceFilter}:${targetCount}:${effectiveResourceTitle || 'ALL'}:v${variantOffset}:ex${excludedSet.size}`;
      const jsonText = await withHighTrafficDedupe(
        quizCacheKey,
        async () => {
          const promptText = `Generate ${targetCount} distinct, authentic NECTA Competence-Based Assessment (CBA) questions for Tanzanian ${cls} ${subject} ${selectedTopicText} (Question Set Cycle #${Number(variantOffset) + 1}).
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
          // Persist newly generated textbook questions into serverQuestionBank so future games/quizzes have a larger non-repeating bank
          for (const qItem of questions) {
            if (qItem && typeof qItem.question === 'string' && Array.isArray(qItem.options) && qItem.options.length >= 4) {
              const sig = computeServerQuestionSignature(qItem.question);
              const key = `${cls.toLowerCase()}__${subject.toLowerCase()}__${sig}`;
              if (sig && !serverQuestionBank.has(key)) {
                serverQuestionBank.set(key, {
                  id: `tb-quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  signature: sig,
                  cls,
                  subject,
                  topic: qItem.topic || tbInfo.matchedChapter || 'Chapter 1',
                  subTopic: qItem.subTopic || qItem.topic || 'Exercise',
                  question: qItem.question,
                  options: [
                    String(qItem.options[0]),
                    String(qItem.options[1]),
                    String(qItem.options[2]),
                    String(qItem.options[3]),
                  ],
                  correctIndex: typeof qItem.correctIndex === 'number' ? qItem.correctIndex : 0,
                  hint: `Use the ${cls} ${subject} textbook method.`,
                  explanation: qItem.explanation || '',
                  sourceBookTitle: qItem.sourceRef || effectiveResourceTitle || tbInfo.bookTitle,
                  difficulty: 'Medium',
                  createdAt: new Date().toISOString().split('T')[0],
                });
              }
            }
          }
          saveServerQuestionBankToDisk();

          const merged = [
            ...unseenFromBank,
            ...questions.filter(
              (q: { question?: string }) =>
                q &&
                typeof q.question === 'string' &&
                !excludedSet.has(computeServerQuestionSignature(q.question)) &&
                !unseenFromBank.some((u) => u.question === q.question)
            ),
          ];

          if (merged.length < targetCount) {
            const padPool = buildDeterministicTextbookQuestionsForBank(
              cls,
              subject,
              topic || 'ALL',
              effectiveResourceTitle || tbInfo.bookTitle,
              targetCount,
              excludedSet
            );
            for (const p of padPool) {
              if (merged.length >= targetCount) break;
              if (!merged.some((m) => m.question === p.question)) {
                merged.push({
                  question: p.question,
                  options: p.options,
                  correctIndex: p.correctIndex,
                  explanation: p.explanation,
                  topic: p.topic,
                  subTopic: p.subTopic,
                  sourceRef: p.sourceBookTitle,
                });
              }
            }
          }
          return res.json({ questions: merged.slice(0, targetCount), source: 'gemini' });
        }
      }
    } catch {
      // Cleanly fall back to built-in NECTA topic quiz generator below
    }
  }

  const deterministicBankBatch = buildDeterministicTextbookQuestionsForBank(
    cls,
    subject,
    topic || 'ALL',
    effectiveResourceTitle || tbInfo.bookTitle,
    targetCount,
    excludedSet
  );
  const combinedFallback = [
    ...unseenFromBank,
    ...deterministicBankBatch.map((p) => ({
      question: p.question,
      options: p.options,
      correctIndex: p.correctIndex,
      explanation: p.explanation,
      topic: p.topic,
      subTopic: p.subTopic,
      sourceRef: p.sourceBookTitle,
    })),
  ];

  if (combinedFallback.length < targetCount) {
    const baseQuestions = buildFallbackTopicQuizQuestions(cls, subject, topic, siteResources, subTopic, sourceFilter);
    for (const bq of baseQuestions) {
      if (combinedFallback.length >= targetCount) break;
      if (!combinedFallback.some((c) => c.question === bq.question)) {
        combinedFallback.push(bq);
      }
    }
  }

  return res.json({
    questions: combinedFallback.slice(0, targetCount),
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
const ASSETLINKS_CONFIG_PATH = path.resolve(process.cwd(), '.aistudio', 'assetlinks-config.json');
let runtimePlayStorePackage = process.env.ANDROID_PACKAGE_NAME || 'online.elimika.twa';
let runtimePlayStoreSha256 =
  process.env.ANDROID_SHA256_FINGERPRINT ||
  '00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00';

try {
  if (fs.existsSync(ASSETLINKS_CONFIG_PATH)) {
    const saved = JSON.parse(fs.readFileSync(ASSETLINKS_CONFIG_PATH, 'utf-8'));
    if (saved.packageName) runtimePlayStorePackage = String(saved.packageName).trim();
    if (saved.sha256Fingerprint) runtimePlayStoreSha256 = String(saved.sha256Fingerprint).trim();
  }
} catch {
  // ignore read error
}

app.get('/.well-known/assetlinks.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: runtimePlayStorePackage,
        sha256_cert_fingerprints: [runtimePlayStoreSha256],
      },
    },
  ]);
});

app.post('/api/playstore/assetlinks', (req, res) => {
  const { packageName, sha256Fingerprint } = req.body || {};
  if (typeof packageName === 'string' && packageName.trim()) {
    runtimePlayStorePackage = packageName.trim();
  }
  if (typeof sha256Fingerprint === 'string' && sha256Fingerprint.trim()) {
    runtimePlayStoreSha256 = sha256Fingerprint.trim().toUpperCase();
  }
  try {
    const dir = path.dirname(ASSETLINKS_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      ASSETLINKS_CONFIG_PATH,
      JSON.stringify(
        {
          packageName: runtimePlayStorePackage,
          sha256Fingerprint: runtimePlayStoreSha256,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch {
    // ignore write error
  }
  res.json({
    ok: true,
    packageName: runtimePlayStorePackage,
    sha256Fingerprint: runtimePlayStoreSha256,
  });
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

app.get('/assets/aistudio/:filename', (req, res) => {
  const driveId = LEGACY_AISTUDIO_PDF_DRIVE_MAP[req.params.filename];
  if (driveId) {
    return res.redirect(302, `https://drive.google.com/file/d/${driveId}/view?usp=drive_link`);
  }
  return res.status(404).send('Not found');
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
