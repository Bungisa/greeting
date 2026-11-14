import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import os from 'os';
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
// Trust first reverse proxy hop (Cloud Run / Vercel) for accurate client IP rate limiting
app.set('trust proxy', 1);

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'elimika.online' ||
      host.endsWith('.elimika.online') ||
      host === 'elimika.co.tz' ||
      host.endsWith('.elimika.co.tz') ||
      host.endsWith('.run.app') ||
      host.endsWith('.ai.studio') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (req.path === '/.well-known/assetlinks.json') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && isAllowedCorsOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(express.json({ limit: '15mb' }));

// ==================== SLIDING-WINDOW DISTRIBUTED-READY RATE LIMITER ====================
interface RateLimitBucket {
  timestamps: number[];
  expiresAt: number;
}
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}): express.RequestHandler {
  const { windowMs, maxRequests, keyPrefix, message } = options;
  return (req, res, next) => {
    const now = Date.now();
    // Periodic cleanup of expired buckets to bound memory
    if (rateLimitBuckets.size > 5000) {
      for (const [k, v] of rateLimitBuckets.entries()) {
        if (now > v.expiresAt) rateLimitBuckets.delete(k);
      }
    }

    const clientKey = `${keyPrefix}:${getClientIp(req)}`;
    const existing = rateLimitBuckets.get(clientKey);
    const windowStart = now - windowMs;
    const validTimestamps = existing
      ? existing.timestamps.filter((ts) => ts > windowStart)
      : [];

    if (validTimestamps.length >= maxRequests) {
      const oldestInWindow = validTimestamps[0] || now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(Math.ceil((oldestInWindow + windowMs) / 1000)));
      return res.status(429).json({
        error:
          message ||
          `Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
        retryAfterSeconds,
      });
    }

    validTimestamps.push(now);
    rateLimitBuckets.set(clientKey, {
      timestamps: validTimestamps,
      expiresAt: now + windowMs,
    });

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - validTimestamps.length)));
    next();
  };
}

const adminLoginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'admin-login',
  message: 'Too many administrator login attempts. Please wait 15 minutes.',
});

const aiStandardRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  keyPrefix: 'ai-standard',
  message: 'AI tutor rate limit reached (30 requests/minute). Please wait a moment.',
});

const aiExtractRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'ai-extract',
  message: 'Textbook extraction rate limit reached (10 requests/minute). Please wait a moment.',
});

const videoGenerationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'ai-video',
  message: 'Video generation rate limit reached (5 videos per 10 minutes).',
});

const challengeMutationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyPrefix: 'challenge-mutate',
  message: 'Challenge submission rate limit reached. Please wait a minute.',
});

// ==================== SERVER-SIDE ADMINISTRATOR AUTHENTICATION ====================
const ADMIN_OWNER_EMAIL = 'mohamedshabani751@gmail.com';
const COMPROMISED_LEGACY_PINS = new Set(['elimika4045']);
const ADMIN_SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const ADMIN_HMAC_SECRET =
  process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.trim().length >= 16
    ? process.env.ADMIN_SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');
const revokedAdminJtis = new Set<string>();

interface AdminTokenPayload {
  sub: string;
  role: 'admin';
  iat: number;
  exp: number;
  jti: string;
}

function issueAdminSessionToken(identity: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  const payload: AdminTokenPayload = {
    sub: identity,
    role: 'admin',
    iat: now,
    exp: expiresAt,
    jti: crypto.randomBytes(12).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return {
    token: `${payloadB64}.${signature}`,
    expiresAt,
  };
}

function verifyAdminSessionToken(rawToken: string | undefined | null): AdminTokenPayload | null {
  if (!rawToken || typeof rawToken !== 'string') return null;
  const parts = rawToken.trim().split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const a = Buffer.from(providedSig, 'utf-8');
  const b = Buffer.from(expectedSig, 'utf-8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as AdminTokenPayload;
    if (
      parsed.role !== 'admin' ||
      typeof parsed.exp !== 'number' ||
      Date.now() > parsed.exp ||
      !parsed.jti ||
      revokedAdminJtis.has(parsed.jti)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function extractAdminTokenFromReq(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';');
    for (const c of cookies) {
      const [name, ...rest] = c.trim().split('=');
      if (name === 'elimika_admin_session') {
        return decodeURIComponent(rest.join('='));
      }
    }
  }
  return null;
}

const requireAdminAuth: express.RequestHandler = (req, res, next) => {
  const token = extractAdminTokenFromReq(req);
  const verified = verifyAdminSessionToken(token);
  if (!verified) {
    return res.status(401).json({
      error: 'Unauthorized: Valid administrator session required.',
    });
  }
  next();
};

app.post('/api/admin/login', adminLoginRateLimiter, async (req, res) => {
  const { passphrase, idToken } = (req.body || {}) as {
    passphrase?: string;
    idToken?: string;
  };

  if (typeof passphrase === 'string' && COMPROMISED_LEGACY_PINS.has(passphrase.trim().toLowerCase())) {
    return res.status(401).json({
      error: 'Compromised legacy PIN has been revoked. Use your rotated server passphrase or administrator Google account.',
    });
  }

  let verifiedIdentity: string | null = null;

  // Method 1: Verify server-only ADMIN_SECRET_PASSPHRASE via constant-time comparison
  if (typeof passphrase === 'string' && passphrase.trim().length > 0) {
    const configuredSecret = (process.env.ADMIN_SECRET_PASSPHRASE || '').trim();
    if (
      configuredSecret.length >= 8 &&
      !COMPROMISED_LEGACY_PINS.has(configuredSecret.toLowerCase())
    ) {
      const candidateHash = crypto.createHash('sha256').update(passphrase.trim()).digest();
      const secretHash = crypto.createHash('sha256').update(configuredSecret).digest();
      if (crypto.timingSafeEqual(candidateHash, secretHash)) {
        verifiedIdentity = 'admin:passphrase';
      }
    }
  }

  // Method 2: Verify Google OAuth2 / Firebase ID token for mohamedshabani751@gmail.com
  if (!verifiedIdentity && typeof idToken === 'string' && idToken.trim().length > 20) {
    try {
      const tokenRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`
      );
      if (tokenRes.ok) {
        const info = (await tokenRes.json()) as {
          email?: string;
          email_verified?: string | boolean;
        };
        const isEmailVerified = info.email_verified === true || info.email_verified === 'true';
        if (
          info.email &&
          info.email.toLowerCase() === ADMIN_OWNER_EMAIL &&
          isEmailVerified
        ) {
          verifiedIdentity = info.email.toLowerCase();
        }
      }
    } catch {
      // verification failed
    }
  }

  if (!verifiedIdentity) {
    return res.status(401).json({
      error:
        'Invalid administrator credentials. Configure ADMIN_SECRET_PASSPHRASE in server secrets or sign in as the verified owner.',
    });
  }

  const { token, expiresAt } = issueAdminSessionToken(verifiedIdentity);
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `elimika_admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${secureFlag}`
  );
  return res.json({
    ok: true,
    token,
    expiresAt,
  });
});

app.get('/api/admin/session', (req, res) => {
  const token = extractAdminTokenFromReq(req);
  const verified = verifyAdminSessionToken(token);
  if (!verified) {
    return res.json({ authenticated: false, expiresAt: null });
  }
  return res.json({ authenticated: true, expiresAt: verified.exp });
});

app.post('/api/admin/logout', (req, res) => {
  const token = extractAdminTokenFromReq(req);
  const verified = verifyAdminSessionToken(token);
  if (verified?.jti) {
    revokedAdminJtis.add(verified.jti);
  }
  res.setHeader(
    'Set-Cookie',
    'elimika_admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
  );
  return res.json({ ok: true });
});

function getGenAIClient(): GoogleGenAI | null {
  // Never read VITE_GEMINI_API_KEY so secret keys are never exposed in client bundles
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
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
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
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
  const totalModels = GEMINI_FALLBACK_MODELS.length;
  const primaryTimeoutMs = params.timeoutMs || 16000;
  const now = Date.now();

  for (let idx = 0; idx < totalModels; idx++) {
    const modelName = GEMINI_FALLBACK_MODELS[idx];
    const cooldown = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldown) {
      continue;
    }
    try {
      const baseConfig: Record<string, unknown> = { ...(params.config || {}) };
      delete baseConfig.temperature;
      if (modelName === 'gemini-3.1-flash-lite') {
        baseConfig.thinkingConfig = {
          thinkingLevel: ThinkingLevel.MINIMAL,
        };
      } else if (modelName.startsWith('gemini-3')) {
        baseConfig.thinkingConfig = {
          thinkingLevel: ThinkingLevel.LOW,
        };
      }

      const configWithTools =
        params.useGoogleSearch && !baseConfig.responseMimeType
          ? { ...baseConfig, tools: [{ googleSearch: {} }] }
          : baseConfig;

      const response = await withPromiseTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: params.contents as never,
          config: configWithTools as never,
        }),
        primaryTimeoutMs
      );

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
        const isDailyQuota =
          msg.includes('PerDay') || msg.includes('free_tier_requests') || msg.includes('limit: 20');
        modelCooldownUntil.set(
          modelName,
          Date.now() + (isDailyQuota ? 2 * 60 * 60 * 1000 : 60 * 1000)
        );
        continue;
      }
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('Timeout')) {
        modelCooldownUntil.set(modelName, Date.now() + 5 * 60 * 1000);
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

const HEAVY_SCANNED_TEXTBOOK_DRIVE_IDS = new Set<string>(
  Object.values(LEGACY_AISTUDIO_PDF_DRIVE_MAP)
);

async function fetchGoogleDriveInlinePdf(
  rawUrl?: string | null
): Promise<{ mimeType: string; base64Data: string } | null> {
  const driveId = extractDriveFileIdFromUrl(rawUrl);
  if (!driveId || HEAVY_SCANNED_TEXTBOOK_DRIVE_IDS.has(driveId)) return null;

  const cached = drivePdfCache.get(driveId);
  if (cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) {
    return { mimeType: cached.mimeType, base64Data: cached.base64Data };
  }

  const MAX_PDF_BYTES = 8 * 1024 * 1024;
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

app.post('/api/attached-resources', requireAdminAuth, async (req, res) => {
  const body = (req.body || {}) as Partial<AttachedResourceServerItem>;
  const title = String(body.title || '').trim().slice(0, 300);
  const form = String(body.form || 'Form 4').trim().slice(0, 60);
  const subject = String(body.subject || 'Basic Mathematics').trim().slice(0, 120);
  if (!title) {
    return res.status(400).json({ error: 'Resource title is required' });
  }
  if (body.attachedFileBase64 && String(body.attachedFileBase64).length > 14_000_000) {
    return res.status(400).json({ error: 'Attached file exceeds maximum size (10 MB).' });
  }
  const category = String(body.category || 'NECTA').trim().slice(0, 80);
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
    year: String(body.year || new Date().getFullYear().toString()).trim().slice(0, 20),
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

app.delete('/api/attached-resources/:id', requireAdminAuth, (req, res) => {
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

const QUESTION_BANK_FILE_PATH = path.join(os.tmpdir(), 'elimika-question-bank-v8.json');
const serverQuestionBank = new Map<string, ServerStoredTextbookQuestion>();
const builtinSeedIds = new Set<string>(FULL_EXTRACTED_TEXTBOOK_BANK.map((s) => s.id));
let isQuestionBankSeeded = false;

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

function ensureServerQuestionBankSeeded(): void {
  if (isQuestionBankSeeded) return;
  isQuestionBankSeeded = true;
  seedBuiltinExtractedBankOnServer();
}

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
  ensureServerQuestionBankSeeded();
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
app.post('/api/question-bank/extract', aiExtractRateLimiter, async (req, res) => {
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
    } = (req.body || {}) as {
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

    if (typeof customContent === 'string' && customContent.length > 100_000) {
      return res.status(400).json({ error: 'Custom content exceeds maximum length (100,000 characters).' });
    }
    if (typeof attachedFileBase64 === 'string' && attachedFileBase64.length > 14_000_000) {
      return res.status(400).json({ error: 'Attached file exceeds maximum size (10 MB).' });
    }

    // Only register global textbook in serverAttachedResources if caller has a valid admin session
    const isAdminCaller = Boolean(verifyAdminSessionToken(extractAdminTokenFromReq(req)));
    if (
      isAdminCaller &&
      (attachedFileBase64 || paperUrl || (customContent && customContent.trim().length > 40))
    ) {
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
      cls: String(cls).slice(0, 60),
      subject: String(subject).slice(0, 120),
      topic: String(topic).slice(0, 200),
      bookTitle: bookTitle ? String(bookTitle).slice(0, 300) : undefined,
      customContent,
      paperUrl,
      attachedFileBase64,
      count: Math.min(35, Math.max(1, Number(count) || 25)),
    });

    return res.json({
      addedCount: result.addedCount,
      totalStoredForSubject: result.totalStoredForSubject,
      extractedQuestions: result.extractedQuestions,
      questions: result.extractedQuestions,
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to extract textbook questions',
    });
  }
});

// Extract Chapters / Table of Contents from Attached Textbook PDF
app.post('/api/moha/extract-book-chapters', aiStandardRateLimiter, async (req, res) => {
  try {
    const {
      paperUrl = '',
      cls = 'Form 2',
      subject = 'Basic Mathematics',
      customContent = '',
    } = (req.body || {}) as {
      paperUrl?: string;
      cls?: string;
      subject?: string;
      customContent?: string;
    };

    const baseTopics = getSyllabusTopicsForClassSubject(cls, subject);
    const rawText = String(customContent || '').slice(0, 100_000);

    const extracted = rawText ? extractTextbookChaptersFromText(rawText) : [];
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

const ALLOWED_AI_ATTACHMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
]);

// Moha AI Chat & Multimodal Textbook / Past Paper Solver Endpoint
app.post('/api/moha/chat', aiStandardRateLimiter, async (req, res) => {
  const {
    prompt,
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    image,
    history = [],
    learnedMemory = [],
    siteResources,
    systemPromptContext = '',
  } = (req.body || {}) as {
    prompt?: string;
    cls?: string;
    subject?: string;
    image?: { mimeType: string; base64Data: string; fileName?: string } | null;
    history?: Array<{ id?: string; role: 'user' | 'ai'; text: string }>;
    learnedMemory?: LearnedMemoryItem[];
    siteResources?: SiteResourceContext;
    systemPromptContext?: string;
  };

  if (prompt !== undefined && typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt format: expected string.' });
  }
  if (typeof prompt === 'string' && prompt.length > 4000) {
    return res.status(400).json({
      error: 'Prompt exceeds maximum allowed length (4,000 characters). Please shorten your question.',
    });
  }
  if (image && typeof image === 'object') {
    const mime = String(image.mimeType || '').toLowerCase().trim();
    if (!ALLOWED_AI_ATTACHMENT_MIME_TYPES.has(mime)) {
      return res.status(400).json({
        error: 'Unsupported attachment MIME type. Allowed types: JPEG, PNG, WebP, GIF, PDF, TXT, CSV.',
      });
    }
    if (typeof image.base64Data === 'string' && image.base64Data.length > 14_000_000) {
      return res.status(400).json({
        error: 'Attachment exceeds maximum allowed size (10 MB).',
      });
    }
  }

  const sanitizedHistory = Array.isArray(history)
    ? history.slice(-10).map((h) => ({
        id: h?.id ? String(h.id).slice(0, 60) : undefined,
        role: (h?.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
        text: String(h?.text || '').slice(0, 3000),
      }))
    : [];

  const sanitizedLearnedMemory: LearnedMemoryItem[] = Array.isArray(learnedMemory)
    ? learnedMemory.slice(0, 20).map((item) => ({
        cls: String(item?.cls || cls || 'Form 3').slice(0, 60),
        subject: String(item?.subject || subject || 'Basic Mathematics').slice(0, 120),
        topic: String(item?.topic || '').slice(0, 200),
        content: String(item?.content || '').slice(0, 2000),
        timestamp: String(item?.timestamp || '').slice(0, 60),
      }))
    : [];

  const userPrompt = (prompt || 'Solve this question step-by-step and show the NECTA Marking Scheme.').trim();

  // Check if user is explicitly querying a learned item first
  const lower = userPrompt.toLowerCase();
  for (const item of sanitizedLearnedMemory) {
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
    sanitizedLearnedMemory.length > 0
      ? `\n\nTeacher/Student Custom Learned Memory:\n${sanitizedLearnedMemory
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
        sanitizedHistory.length <= 2 && !activeInlineFile
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

        const recentHistoryParts = sanitizedHistory
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
            timeoutMs: 28000,
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
          timeoutMs: 16000,
        });
      };

      const rawGenerationPromise = chatCacheKey
        ? withHighTrafficDedupe(
            chatCacheKey,
            runChatGeneration,
            (val) => Boolean(val && val.length > 0)
          )
        : runChatGeneration();

      const outerTimeoutMs = activeInlineFile ? 30000 : 18000;
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
    sanitizedLearnedMemory,
    enrichedSiteResources,
    sanitizedHistory
  );
  return res.json({
    reply: fallbackReply,
    source: 'local',
    parsedTarget,
    quizQuestions: topicQuizQuestions,
  });
});

const ALLOWED_DOC_TYPES = new Set<OfficialDocType>([
  'lessonplan',
  'schemeofwork',
  'exampaper',
  'blueprint',
  'markingscheme',
  'lessonnotes',
  'logbook',
]);

// Moha AI Official TIE / PO-RALG / NECTA Document & Lesson Notes Generator Endpoint
app.post('/api/moha/generate-doc', aiStandardRateLimiter, async (req, res) => {
  const { type, meta } = (req.body || {}) as {
    type?: OfficialDocType;
    meta?: TeacherMetadata;
  };

  if (!type || !ALLOWED_DOC_TYPES.has(type) || !meta || typeof meta !== 'object') {
    return res.status(400).json({ error: 'Invalid document generation request payload.' });
  }

  const tbInfo = getTieTextbookChapterContent(
    String(meta.cls || 'Form 3').slice(0, 60),
    String(meta.subject || 'Basic Mathematics').slice(0, 120),
    `${String(meta.topic || '').slice(0, 200)} ${String(meta.subTopic || '').slice(0, 200)}`,
    meta.siteResources
  );

  const resourceSummary = meta.siteResources
    ? `Attached Textbook: "${tbInfo.bookTitle}" (Matched Chapter: ${tbInfo.matchedChapter}; Sub-topics: ${tbInfo.subTopicsList.join(', ')}${tbInfo.attachedExcerpt ? `; Excerpt: ${tbInfo.attachedExcerpt.slice(0, 1500)}` : ''}). Uploaded Website Books: ${(meta.siteResources.books || []).map((b) => b.title).join(', ')}. Uploaded Syllabuses: ${(meta.siteResources.syllabuses || []).map((s) => s.title).join(', ')}. Uploaded Past Papers: ${(meta.siteResources.papers || []).map((p) => `${p.title} (${p.year})`).join(', ')}.`
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
app.post('/api/moha/quiz', aiStandardRateLimiter, async (req, res) => {
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
  } = (req.body || {}) as {
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

  return res.json({
    questions: unseenFromBank.slice(0, targetCount),
    source: 'question_bank',
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
app.post('/api/challenges/create', challengeMutationRateLimiter, (req, res) => {
  const {
    cls = 'Form 3',
    subject = 'Basic Mathematics',
    topic = 'Core Competence',
    createdBy = 'Student',
    school = 'Elimika Secondary',
    questions,
    creatorScore,
    creatorTimeSeconds = 45,
  } = (req.body || {}) as {
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
    String(subject)
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'QUIZ';
  const randNum = Math.floor(100 + Math.random() * 900);
  const id = `${prefix}-${randNum}`;

  const quizQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions.slice(0, 25)
      : buildFallbackTopicQuizQuestions(cls, subject, topic);

  const leaderboard: ChallengeLeaderboardEntry[] = [];
  if (typeof creatorScore === 'number') {
    leaderboard.push({
      id: `entry-${Date.now()}`,
      playerName: String(createdBy).trim().slice(0, 80) || 'Challenger',
      school: String(school).trim().slice(0, 120) || 'Elimika Secondary',
      score: Math.max(0, Math.min(quizQuestions.length, creatorScore)),
      total: quizQuestions.length,
      percentage: Math.round((Math.max(0, Math.min(quizQuestions.length, creatorScore)) / Math.max(1, quizQuestions.length)) * 100),
      timeSeconds: Math.max(5, Number(creatorTimeSeconds) || 40),
      completedAt: new Date().toISOString().split('T')[0],
    });
  }

  const newChallenge: TopicQuizChallenge = {
    id,
    cls: String(cls).slice(0, 60),
    subject: String(subject).slice(0, 120),
    topic: String(topic).slice(0, 200),
    createdBy: String(createdBy).trim().slice(0, 80) || 'Student',
    createdAt: new Date().toISOString().split('T')[0],
    questions: quizQuestions,
    leaderboard: sortLeaderboard(leaderboard),
  };

  challengesStore.set(id, newChallenge);
  return res.json({ challenge: newChallenge });
});

// Submit a score to a Challenge Leaderboard
app.post('/api/challenges/:id/submit', challengeMutationRateLimiter, (req, res) => {
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
  } = (req.body || {}) as {
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
      cls: String(cls).slice(0, 60),
      subject: String(subject).slice(0, 120),
      topic: String(topic).slice(0, 200),
      createdBy: String(playerName).slice(0, 80),
      createdAt: new Date().toISOString().split('T')[0],
      questions: buildFallbackTopicQuizQuestions(cls, subject, topic),
      leaderboard: [],
    };
    challengesStore.set(code, challenge);
  }

  const cleanName = String(playerName).trim().slice(0, 80) || 'Anonymous Student';
  const cleanSchool = String(school).trim().slice(0, 120) || 'Elimika Secondary';
  const boundedTotal = Math.max(1, Math.min(100, Number(total) || 20));
  const boundedScore = Math.max(0, Math.min(boundedTotal, Number(score) || 0));
  const pct = Math.round((boundedScore / boundedTotal) * 100);
  const newEntry: ChallengeLeaderboardEntry = {
    id: `score-${Date.now()}`,
    playerName: cleanName,
    school: cleanSchool,
    score: boundedScore,
    total: boundedTotal,
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
app.post('/api/moha/flashcards', aiStandardRateLimiter, async (req, res) => {
  const { cls = 'Form 3', subject = 'Basic Mathematics' } = (req.body || {}) as {
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
const ASSETLINKS_CONFIG_PATH = path.join(os.tmpdir(), 'elimika-assetlinks-config.json');
const DEFAULT_PLAY_STORE_SHA256_FINGERPRINTS: string[] = [
  'AF:36:16:F9:1A:D7:5F:B0:F4:BC:13:6C:EB:F3:F0:20:C8:B2:F5:2C:27:E7:15:98:08:0B:7D:A2:63:EB:17:84',
  '0E:F7:F5:2A:AD:EA:10:C4:F9:5E:BE:08:1F:A4:61:EC:15:D0:11:19:D7:36:0B:84:AE:43:F9:85:D1:5D:1C:39',
  '28:C5:33:47:35:D2:92:50:EA:30:BC:F2:26:AF:A8:FD:DF:B2:75:01:C3:0D:08:E0:4A:CF:EF:93:B1:55:72:9B',
  'BD:01:CB:07:B7:1E:E8:B5:E0:86:6D:AE:A1:81:9B:CC:A0:F3:49:8E:21:2C:F2:60:0B:3C:B7:07:EC:29:70:FC',
];

function parseSha256Fingerprints(raw: unknown): string[] {
  const combined: string[] = [...DEFAULT_PLAY_STORE_SHA256_FINGERPRINTS];
  const addToken = (token: string) => {
    const cleaned = token.replace(/["'\s]/g, '').toUpperCase();
    if (cleaned && cleaned !== '00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00' && !combined.includes(cleaned)) {
      combined.push(cleaned);
    }
  };
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (typeof item === 'string') {
        item.split(/[\n,]+/).forEach(addToken);
      }
    });
  } else if (typeof raw === 'string') {
    raw.split(/[\n,]+/).forEach(addToken);
  }
  return combined;
}

let runtimePlayStorePackage = process.env.ANDROID_PACKAGE_NAME || 'online.elimika.twa';
let runtimePlayStoreSha256List: string[] = parseSha256Fingerprints(process.env.ANDROID_SHA256_FINGERPRINT);

try {
  if (fs.existsSync(ASSETLINKS_CONFIG_PATH)) {
    const saved = JSON.parse(fs.readFileSync(ASSETLINKS_CONFIG_PATH, 'utf-8'));
    if (saved.packageName) runtimePlayStorePackage = String(saved.packageName).trim();
    if (saved.sha256Fingerprints || saved.sha256Fingerprint) {
      runtimePlayStoreSha256List = parseSha256Fingerprints(saved.sha256Fingerprints || saved.sha256Fingerprint);
    }
  }
} catch {
  // ignore read error
}

app.get('/.well-known/assetlinks.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const packageNames = Array.from(
    new Set([runtimePlayStorePackage, 'online.elimika.twa', 'online.elimika.tanzania'].filter(Boolean))
  );
  res.json(
    packageNames.map((pkg) => ({
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: pkg,
        sha256_cert_fingerprints: runtimePlayStoreSha256List,
      },
    }))
  );
});

const ANDROID_PACKAGE_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/;
const SHA256_FINGERPRINT_REGEX = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i;

app.post('/api/playstore/assetlinks', requireAdminAuth, (req, res) => {
  const { packageName, sha256Fingerprint, sha256Fingerprints } = (req.body || {}) as {
    packageName?: unknown;
    sha256Fingerprint?: unknown;
    sha256Fingerprints?: unknown;
  };

  if (packageName !== undefined) {
    if (
      typeof packageName !== 'string' ||
      packageName.trim().length > 120 ||
      !ANDROID_PACKAGE_REGEX.test(packageName.trim())
    ) {
      return res.status(400).json({
        error: 'Invalid Android package name format (expected e.g. online.elimika.twa).',
      });
    }
    runtimePlayStorePackage = packageName.trim();
  }

  const rawFpInput = sha256Fingerprints ?? sha256Fingerprint;
  if (rawFpInput !== undefined) {
    const candidateTokens: string[] = [];
    if (Array.isArray(rawFpInput)) {
      rawFpInput.forEach((item) => {
        if (typeof item === 'string') {
          item
            .split(/[\n,]+/)
            .map((t) => t.replace(/["'\s]/g, '').toUpperCase())
            .filter(Boolean)
            .forEach((t) => candidateTokens.push(t));
        }
      });
    } else if (typeof rawFpInput === 'string') {
      rawFpInput
        .split(/[\n,]+/)
        .map((t) => t.replace(/["'\s]/g, '').toUpperCase())
        .filter(Boolean)
        .forEach((t) => candidateTokens.push(t));
    } else {
      return res.status(400).json({ error: 'Invalid SHA-256 fingerprint format.' });
    }

    for (const token of candidateTokens) {
      if (!SHA256_FINGERPRINT_REGEX.test(token)) {
        return res.status(400).json({
          error: `Invalid SHA-256 certificate fingerprint: ${token}`,
        });
      }
    }
    runtimePlayStoreSha256List = parseSha256Fingerprints(rawFpInput);
  }

  try {
    const dir = path.dirname(ASSETLINKS_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      ASSETLINKS_CONFIG_PATH,
      JSON.stringify(
        {
          packageName: runtimePlayStorePackage,
          sha256Fingerprints: runtimePlayStoreSha256List,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch {
    // ignore write error
  }
  return res.json({
    ok: true,
    packageName: runtimePlayStorePackage,
    sha256Fingerprints: runtimePlayStoreSha256List,
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ==================== VEO 3.1 PHOTO-TO-VIDEO 3-STEP ENDPOINTS ====================
app.post('/api/generate-video', videoGenerationRateLimiter, async (req, res) => {
  const {
    prompt = 'Animate this image with smooth cinematic motion',
    imageBase64,
    imageMimeType = 'image/png',
    aspectRatio = '16:9',
  } = (req.body || {}) as {
    prompt?: string;
    imageBase64?: string;
    imageMimeType?: string;
    aspectRatio?: '16:9' | '9:16';
  };

  if (typeof prompt === 'string' && prompt.length > 1000) {
    return res.status(400).json({ error: 'Video prompt exceeds maximum length (1,000 characters).' });
  }
  if (typeof imageBase64 === 'string' && imageBase64.length > 10_000_000) {
    return res.status(400).json({ error: 'Video reference image exceeds maximum size.' });
  }

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
      prompt: String(prompt).slice(0, 1000),
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

app.post('/api/video-status', aiStandardRateLimiter, async (req, res) => {
  const { operationName } = (req.body || {}) as { operationName?: string };
  if (!operationName || typeof operationName !== 'string' || operationName.length > 300) {
    return res.status(400).json({ error: 'Missing or invalid operationName' });
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

app.post('/api/video-download', aiStandardRateLimiter, async (req, res) => {
  const { operationName } = (req.body || {}) as { operationName?: string };
  if (!operationName || typeof operationName !== 'string' || operationName.length > 300) {
    return res.status(400).json({ error: 'Missing or invalid operationName' });
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
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
  res.send('google.com, pub-7814843623545511, DIRECT, f08c47fec0942fa0\n');
});

app.get('/assets/aistudio/:filename', (req, res) => {
  const localAssetPath = path.join(__dirname, 'public', 'assets', 'aistudio', req.params.filename);
  if (fs.existsSync(localAssetPath)) {
    return res.sendFile(localAssetPath);
  }
  const driveId = LEGACY_AISTUDIO_PDF_DRIVE_MAP[req.params.filename];
  if (driveId) {
    return res.redirect(302, `https://drive.google.com/file/d/${driveId}/view?usp=drive_link`);
  }
  return res.status(404).send('Not found');
});

// Direct PDF binary download proxy so mobile & desktop browsers save straight to internal storage
app.get('/api/download-pdf', async (req, res) => {
  const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  const rawFilename = typeof req.query.filename === 'string' ? req.query.filename.trim() : 'Elimika-Document.pdf';
  const cleanFilename =
    rawFilename
      .replace(/[^a-zA-Z0-9_.\- ()]+/g, '_')
      .replace(/\.pdf$/i, '')
      .slice(0, 110) + '.pdf';

  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing PDF URL' });
  }

  // 1. Check if it maps to a local file in public/
  if (rawUrl.startsWith('/')) {
    const cleanRel = rawUrl.replace(/^\/+/, '').split('?')[0];
    const candidatePath = path.resolve(__dirname, 'public', cleanRel);
    const publicRoot = path.resolve(__dirname, 'public');
    if (candidatePath.startsWith(publicRoot) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      return res.sendFile(candidatePath);
    }
  }

  // 2. Check if it is a Google Drive URL or legacy mapped Drive ID
  const driveId = extractDriveFileIdFromUrl(rawUrl);
  if (driveId) {
    // Check in-memory cache first
    const cached = drivePdfCache.get(driveId);
    if (cached && cached.base64Data) {
      const cachedBuf = Buffer.from(cached.base64Data, 'base64');
      if (cachedBuf.byteLength > 100 && cachedBuf.slice(0, 5).toString('ascii') === '%PDF-') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
        res.setHeader('Content-Length', String(cachedBuf.byteLength));
        return res.status(200).end(cachedBuf);
      }
    }

    const candidateUrls = [
      `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`,
      `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}&confirm=t`,
      `https://docs.google.com/document/d/${encodeURIComponent(driveId)}/export?format=pdf`,
    ];

    for (const dlUrl of candidateUrls) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);
        let upstream = await fetch(dlUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal,
        });
        const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('text/html')) {
          const html = await upstream.text();
          const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/i);
          const atMatch = html.match(/name="at"\s+value="([^"]+)"/i);
          if (uuidMatch && uuidMatch[1]) {
            let confirmUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t&uuid=${encodeURIComponent(uuidMatch[1])}`;
            if (atMatch && atMatch[1]) {
              confirmUrl += `&at=${encodeURIComponent(atMatch[1])}`;
            }
            upstream = await fetch(confirmUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: controller.signal,
            });
          } else {
            clearTimeout(timer);
            continue;
          }
        }

        if (!upstream.ok) {
          clearTimeout(timer);
          continue;
        }

        const buf = Buffer.from(await upstream.arrayBuffer());
        clearTimeout(timer);

        // Strictly verify that the downloaded payload is a real PDF binary (%PDF-) and NEVER HTML
        if (buf.byteLength < 100 || buf.slice(0, 5).toString('ascii') !== '%PDF-') {
          continue;
        }

        if (buf.byteLength <= 8 * 1024 * 1024) {
          drivePdfCache.set(driveId, {
            mimeType: 'application/pdf',
            base64Data: buf.toString('base64'),
            fetchedAt: Date.now(),
          });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
        res.setHeader('Content-Length', String(buf.byteLength));
        return res.status(200).end(buf);
      } catch {
        // try next candidate
      }
    }

    return res.status(422).json({ error: 'Upstream Google Drive file did not return a direct PDF binary.' });
  }

  // 3. Direct external HTTPS PDF URL
  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      const upstream = await fetch(rawUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (upstream.ok) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        if (buf.byteLength > 100 && buf.slice(0, 5).toString('ascii') === '%PDF-') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
          res.setHeader('Content-Length', String(buf.byteLength));
          return res.status(200).end(buf);
        }
      }
    } catch {
      // ignore error
    }
  }

  return res.status(404).json({ error: 'PDF binary resource not found' });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.join(__dirname, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const rootIndexPath = path.join(__dirname, 'index.html');
  const isDevLifecycle = process.env.npm_lifecycle_event === 'dev';
  const isProduction =
    !isDevLifecycle &&
    (process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start') &&
    fs.existsSync(distIndexPath);

  app.use(express.static(path.join(__dirname, 'public')));

  if (!isProduction) {
    const vitePromise = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      })
    );
    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        return vite.middlewares(req, res, next);
      } catch (err) {
        return next(err);
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res, next) => {
      if (fs.existsSync(distIndexPath)) {
        return res.sendFile(distIndexPath, (err) => {
          if (err) next();
        });
      }
      if (fs.existsSync(rootIndexPath)) {
        return res.sendFile(rootIndexPath);
      }
      return res.status(404).send('Not found');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Elimika Tanzania server listening on http://0.0.0.0:${PORT}`);
    setImmediate(() => {
      try {
        ensureServerQuestionBankSeeded();
      } catch {
        // ignore background seed errors
      }
    });
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export { app };
export default app;
