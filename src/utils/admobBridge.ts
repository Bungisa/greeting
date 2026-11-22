import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

export interface AdMobConfig {
  enabled: boolean;
  testMode: boolean;
  publisherId: string;
  androidAppId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  rewardedUnitId: string;
}

export type AdMobRuntimeType = 'capacitor' | 'android_webview' | 'web';

/**
 * Official Google AdMob Android test IDs.
 * Used automatically whenever `testMode` is enabled so developers never risk
 * invalid-traffic violations while testing APK/AAB builds.
 */
export const ADMOB_GOOGLE_TEST_IDS = {
  androidAppId: 'ca-app-pub-3940256099942544~3347511713',
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
} as const;

export const DEFAULT_ADMOB_CONFIG: AdMobConfig = {
  enabled: true,
  testMode: true,
  publisherId: 'pub-7814843623545511',
  androidAppId: '',
  bannerUnitId: '',
  interstitialUnitId: '',
  rewardedUnitId: '',
};

const ADMOB_STORAGE_KEY = 'elimika_admob_config_v1';
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes minimum between interstitials

let lastInterstitialShownAt = 0;
let bridgeInitialized = false;

export const ADMOB_PUBLISHER_REGEX = /^(ca-)?pub-\d{16}$/;
export const ADMOB_APP_ID_REGEX = /^ca-app-pub-\d{16}~\d{10}$/;
export const ADMOB_UNIT_ID_REGEX = /^ca-app-pub-\d{16}\/\d{10}$/;

export function normalizePublisherId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'pub-7814843623545511';
  return trimmed.startsWith('ca-') ? trimmed.slice(3) : trimmed;
}

export function isValidAdMobPublisherId(raw: string): boolean {
  return ADMOB_PUBLISHER_REGEX.test(raw.trim());
}

export function isValidAdMobAppId(raw: string): boolean {
  const trimmed = raw.trim();
  return trimmed === '' || ADMOB_APP_ID_REGEX.test(trimmed);
}

export function isValidAdMobUnitId(raw: string): boolean {
  const trimmed = raw.trim();
  return trimmed === '' || ADMOB_UNIT_ID_REGEX.test(trimmed);
}

interface AndroidWebViewAdMobBridge {
  init?: (configJson: string) => void;
  showBanner?: (adUnitId: string) => void;
  hideBanner?: () => void;
  showInterstitial?: (adUnitId: string) => void;
  showRewarded?: (adUnitId: string) => void;
}

interface WindowWithAdMob extends Window {
  ElimikaAdMob?: AndroidWebViewAdMobBridge;
  AndroidAdMob?: AndroidWebViewAdMobBridge;
}

function getWin(): WindowWithAdMob | null {
  return typeof window !== 'undefined' ? (window as WindowWithAdMob) : null;
}

export function detectAdMobRuntime(): AdMobRuntimeType {
  if (typeof window === 'undefined') return 'web';
  try {
    if (Capacitor.isNativePlatform()) {
      return 'capacitor';
    }
  } catch {
    // Fallback if Capacitor runtime is absent
  }
  const win = getWin();
  if (win?.ElimikaAdMob || win?.AndroidAdMob) return 'android_webview';
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('ElimikaCapacitorApp')) {
    return 'capacitor';
  }
  return 'web';
}

export function isNativeAdMobApp(): boolean {
  return detectAdMobRuntime() !== 'web';
}

export function loadLocalAdMobConfig(): AdMobConfig {
  try {
    const raw = localStorage.getItem(ADMOB_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ADMOB_CONFIG };
    const parsed = JSON.parse(raw) as Partial<AdMobConfig>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_ADMOB_CONFIG.enabled,
      testMode: typeof parsed.testMode === 'boolean' ? parsed.testMode : DEFAULT_ADMOB_CONFIG.testMode,
      publisherId:
        typeof parsed.publisherId === 'string' && isValidAdMobPublisherId(parsed.publisherId)
          ? normalizePublisherId(parsed.publisherId)
          : DEFAULT_ADMOB_CONFIG.publisherId,
      androidAppId:
        typeof parsed.androidAppId === 'string' && isValidAdMobAppId(parsed.androidAppId)
          ? parsed.androidAppId.trim()
          : '',
      bannerUnitId:
        typeof parsed.bannerUnitId === 'string' && isValidAdMobUnitId(parsed.bannerUnitId)
          ? parsed.bannerUnitId.trim()
          : '',
      interstitialUnitId:
        typeof parsed.interstitialUnitId === 'string' && isValidAdMobUnitId(parsed.interstitialUnitId)
          ? parsed.interstitialUnitId.trim()
          : '',
      rewardedUnitId:
        typeof parsed.rewardedUnitId === 'string' && isValidAdMobUnitId(parsed.rewardedUnitId)
          ? parsed.rewardedUnitId.trim()
          : '',
    };
  } catch {
    return { ...DEFAULT_ADMOB_CONFIG };
  }
}

export function saveLocalAdMobConfig(config: AdMobConfig): void {
  try {
    localStorage.setItem(ADMOB_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota errors
  }
}

function resolveUnitId(configuredId: string, testFallback: string, testMode: boolean): string {
  if (testMode) return testFallback;
  return configuredId.trim();
}

export async function initAdMobBridge(config: AdMobConfig): Promise<AdMobRuntimeType> {
  const runtime = detectAdMobRuntime();
  if (!config.enabled || runtime === 'web') return runtime;

  const win = getWin();
  if (!win) return 'web';

  try {
    if (runtime === 'capacitor' && Capacitor.isNativePlatform()) {
      await AdMob.initialize({
        initializeForTesting: config.testMode,
      });
      bridgeInitialized = true;
    } else if (runtime === 'android_webview') {
      const bridge = win.ElimikaAdMob || win.AndroidAdMob;
      bridge?.init?.(
        JSON.stringify({
          appId: config.testMode ? ADMOB_GOOGLE_TEST_IDS.androidAppId : config.androidAppId,
          testMode: config.testMode,
        })
      );
      bridgeInitialized = true;
    }
  } catch {
    // Keep app fully resilient if native plugin is unavailable
  }

  return runtime;
}

export async function showAdMobBanner(config: AdMobConfig): Promise<boolean> {
  if (!config.enabled) return false;
  const runtime = detectAdMobRuntime();
  if (runtime === 'web') return false;

  const adId = resolveUnitId(config.bannerUnitId, ADMOB_GOOGLE_TEST_IDS.bannerUnitId, config.testMode);
  if (!adId) return false;

  const win = getWin();
  if (!win) return false;

  if (!bridgeInitialized) {
    await initAdMobBridge(config);
  }

  try {
    if (runtime === 'capacitor' && Capacitor.isNativePlatform()) {
      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: config.testMode,
      });
      document.documentElement.classList.add('elimika-admob-banner-active');
      return true;
    }
    if (runtime === 'android_webview') {
      const bridge = win.ElimikaAdMob || win.AndroidAdMob;
      bridge?.showBanner?.(adId);
      document.documentElement.classList.add('elimika-admob-banner-active');
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function hideAdMobBanner(): Promise<void> {
  const runtime = detectAdMobRuntime();
  const win = getWin();
  if (!win || runtime === 'web') return;

  try {
    if (runtime === 'capacitor' && Capacitor.isNativePlatform()) {
      await AdMob.hideBanner();
    } else if (runtime === 'android_webview') {
      (win.ElimikaAdMob || win.AndroidAdMob)?.hideBanner?.();
    }
    document.documentElement.classList.remove('elimika-admob-banner-active');
  } catch {
    // ignore
  }
}

export async function showAdMobInterstitial(config: AdMobConfig): Promise<boolean> {
  if (!config.enabled) return false;
  const runtime = detectAdMobRuntime();
  if (runtime === 'web') return false;

  const now = Date.now();
  if (now - lastInterstitialShownAt < INTERSTITIAL_COOLDOWN_MS) {
    return false;
  }

  const adId = resolveUnitId(
    config.interstitialUnitId,
    ADMOB_GOOGLE_TEST_IDS.interstitialUnitId,
    config.testMode
  );
  if (!adId) return false;

  const win = getWin();
  if (!win) return false;

  if (!bridgeInitialized) {
    await initAdMobBridge(config);
  }

  try {
    if (runtime === 'capacitor' && Capacitor.isNativePlatform()) {
      await AdMob.prepareInterstitial({ adId, isTesting: config.testMode });
      await AdMob.showInterstitial();
      lastInterstitialShownAt = Date.now();
      return true;
    } else if (runtime === 'android_webview') {
      const bridge = win.ElimikaAdMob || win.AndroidAdMob;
      if (bridge?.showInterstitial) {
        bridge.showInterstitial(adId);
        lastInterstitialShownAt = Date.now();
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

export async function showAdMobRewarded(config: AdMobConfig): Promise<{ rewarded: boolean }> {
  if (!config.enabled) return { rewarded: false };
  const runtime = detectAdMobRuntime();
  if (runtime === 'web') return { rewarded: false };

  const adId = resolveUnitId(
    config.rewardedUnitId,
    ADMOB_GOOGLE_TEST_IDS.rewardedUnitId,
    config.testMode
  );
  if (!adId) return { rewarded: false };

  const win = getWin();
  if (!win) return { rewarded: false };

  if (!bridgeInitialized) {
    await initAdMobBridge(config);
  }

  try {
    if (runtime === 'capacitor' && Capacitor.isNativePlatform()) {
      await AdMob.prepareRewardVideoAd({ adId, isTesting: config.testMode });
      await AdMob.showRewardVideoAd();
      return { rewarded: true };
    } else if (runtime === 'android_webview') {
      const bridge = win.ElimikaAdMob || win.AndroidAdMob;
      if (bridge?.showRewarded) {
        bridge.showRewarded(adId);
        return { rewarded: true };
      }
    }
  } catch {
    return { rewarded: false };
  }
  return { rewarded: false };
}

export function buildAppAdsTxtContent(publisherId: string): string {
  const pub = normalizePublisherId(publisherId);
  return `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;
}

export function buildAndroidManifestMetaTag(appId: string, testMode = false): string {
  const resolvedAppId =
    !appId.trim() || testMode ? ADMOB_GOOGLE_TEST_IDS.androidAppId : appId.trim();
  return `<!-- Add inside <application> in android/app/src/main/AndroidManifest.xml -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="${resolvedAppId}" />`;
}
