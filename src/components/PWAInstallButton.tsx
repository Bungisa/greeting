import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, PlusSquare, QrCode, Share, Smartphone, X } from 'lucide-react';

// Official Google Play Store URL configuration for Android users.
export const PLAY_STORE_URL: string = (
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PLAY_STORE_URL) ||
  'https://play.google.com/store/apps/details?id=online.elimika.tanzania'
).trim();

export type DetectedDeviceType = 'ios' | 'android' | 'desktop';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function detectUserDevice(): {
  deviceType: DetectedDeviceType;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      deviceType: 'desktop',
      isIOS: false,
      isAndroid: false,
      isDesktop: true,
      isSafari: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isIPhoneOrIPod = /iPhone|iPod/i.test(ua);
  const isIPad =
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  const isIOS = isIPhoneOrIPod || isIPad;
  const isAndroid = !isIOS && /Android/i.test(ua);
  const isDesktop = !isIOS && !isAndroid;
  const isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  const deviceType: DetectedDeviceType = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  return { deviceType, isIOS, isAndroid, isDesktop, isSafari };
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(() => detectUserDevice());

  useEffect(() => {
    setDeviceInfo(detectUserDevice());

    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => checkStandalone();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    install,
    ...deviceInfo,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      Offline Mode — Cached syllabus &amp; revision data active
    </div>
  );
};

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.115 1.85-.99 2.97 1.08.08 2.14-.53 2.81-1.34z" />
  </svg>
);

const GooglePlayIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 0 1-.486-1.309V3.123c0-.51.186-.965.485-1.309zm11.258 11.258l2.768 2.768-11.09 6.398 8.322-9.166zm3.829-2.801l2.248 1.298c.742.428.742 1.5 0 1.928l-2.248 1.298-2.975-2.262 2.975-2.262zM6.545 1.77l11.09 6.398-2.768 2.768L6.545 1.77z" />
  </svg>
);

const AndroidRobotIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.523 15.341a.96.96 0 0 1-.958-.958c0-.529.43-.959.958-.959.529 0 .959.43.959.959a.96.96 0 0 1-.959.958m-11.046 0a.96.96 0 0 1-.959-.958c0-.529.43-.959.959-.959.528 0 .958.43.958.959a.96.96 0 0 1-.958.958m11.4-6.022l1.996-3.459a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.11 8.95C15.611 8.264 13.868 7.87 12 7.87c-1.868 0-3.611.394-5.11 1.08L4.847 5.445a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.996 3.459C2.688 11.186.343 14.658 0 18.761h24c-.343-4.103-2.688-7.575-6.123-9.442" />
  </svg>
);

export const IOSInstallGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  isSafari: boolean;
}> = ({ isOpen, onClose, isInstalled, isSafari }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/pwa-192x192.png';
              }}
              alt="Elimika App Icon"
              className="w-12 h-12 rounded-2xl border border-slate-200 shadow-xs shrink-0 object-cover"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                <AppleIcon className="w-3 h-3" />
                <span>iPhone &amp; iPad Installation</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                Add Elimika to Home Screen
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm font-bold">
              Elimika is already installed on your device. You can launch it anytime from your Home Screen!
            </div>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-2">
              <div>
                <strong className="font-black block mb-0.5">📱 Direct iPhone Download at www.elimika.online:</strong>
                iPhone and iPad users are directed to <strong>www.elimika.online</strong> where you can download and install the app directly to your phone.
              </div>
              <a
                href="https://www.elimika.online/?install=iphone"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <AppleIcon className="w-3.5 h-3.5" />
                <span>Go to www.elimika.online (Download to iPhone)</span>
              </a>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <span>Tap the Safari Share Icon</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-700">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Tap the <strong>Share</strong> button (<code className="font-bold">↑</code> inside a square) at the bottom or top of your Safari toolbar.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <span>Select &ldquo;Add to Home Screen&rdquo;</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700">
                      <PlusSquare className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Scroll down the Safari share sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-black text-slate-900">
                    Tap &ldquo;Add&rdquo; in the Top-Right Corner
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Tap <strong>Add</strong> to place the official <strong>Elimika</strong> app icon directly on your iPhone or iPad Home Screen.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer transition-colors"
        >
          Got It, Close Guide
        </button>
      </div>
    </div>
  );
};

export const AndroidPlayStoreModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onDirectInstall: () => void;
}> = ({ isOpen, onClose, isInstallable, onDirectInstall }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/pwa-192x192.png';
              }}
              alt="Elimika App Icon"
              className="w-12 h-12 rounded-2xl border border-slate-200 shadow-xs shrink-0 object-cover"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider">
                <AndroidRobotIcon className="w-3.5 h-3.5" />
                <span>Android Installation</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                Google Play Store — Coming Soon
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
          <div className="font-black text-sm flex items-center gap-1.5">
            <GooglePlayIcon className="w-4 h-4 text-emerald-700" />
            <span>Official Google Play Listing Coming Soon!</span>
          </div>
          <p>
            The official <strong>Elimika Tanzania</strong> Android application is currently being prepared for publication on the Google Play Store.
          </p>
          <p className="font-semibold text-amber-900">
            In the meantime, you can install Elimika directly to your Android home screen from Chrome for full-screen offline access!
          </p>
        </div>

        {isInstallable ? (
          <button
            type="button"
            onClick={async () => {
              await onDirectInstall();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Install Elimika App to Home Screen Now</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-black text-slate-900">How to Add to Android Home Screen right now:</div>
            <p>
              Tap the <strong>Chrome menu (⋮)</strong> in the top-right corner and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isSafari, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidSoonModal, setShowAndroidSoonModal] = useState(false);

  const configuredPlayStoreUrl =
    PLAY_STORE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('elimika_playstore_url') || '' : '');

  const handleHeaderInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isAndroid) {
      if (configuredPlayStoreUrl) {
        window.open(configuredPlayStoreUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (isInstallable) {
        const installed = await install();
        if (installed) return;
      }
      setShowAndroidSoonModal(true);
      return;
    }
    if (isInstallable) {
      await install();
      return;
    }
    const section = document.getElementById('get-elimika-app-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleHeaderInstallClick}
        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
        title={
          isInstalled
            ? 'Elimika is installed'
            : isIOS
            ? 'Add Elimika to iPhone / iPad Home Screen'
            : isAndroid
            ? 'Download Elimika on Android'
            : 'Get Elimika App'
        }
      >
        {isInstalled ? (
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        ) : isIOS ? (
          <AppleIcon className="w-3.5 h-3.5 shrink-0" />
        ) : isAndroid ? (
          <GooglePlayIcon className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="inline">
          {isInstalled ? 'Installed' : 'Get App'}
        </span>
      </button>

      <IOSInstallGuideModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isInstalled={isInstalled}
        isSafari={isSafari}
      />

      <AndroidPlayStoreModal
        isOpen={showAndroidSoonModal}
        onClose={() => setShowAndroidSoonModal(false)}
        isInstallable={isInstallable}
        onDirectInstall={install}
      />
    </>
  );
};

export const GetElimikaAppSection: React.FC = () => {
  const { deviceType, isIOS, isSafari, isInstalled, isInstallable, install } = usePWAInstall();
  const [previewOverride, setPreviewOverride] = useState<'auto' | DetectedDeviceType>('auto');
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidSoonModal, setShowAndroidSoonModal] = useState(false);

  const activeDevice: DetectedDeviceType =
    previewOverride === 'auto' ? deviceType : previewOverride;

  const configuredPlayStoreUrl =
    PLAY_STORE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('elimika_playstore_url') || '' : '');

  return (
    <section
      id="get-elimika-app-section"
      className="bg-[#24132F] text-white border-t border-[#493751] py-8 sm:py-10 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-[#30223A] border border-[#493751] p-5 sm:p-7 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Column: Branding & App Icon */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 max-w-xl">
            <img
              src="/pwa-192x192.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/pwa-192x192.png';
              }}
              alt="Elimika Tanzania App Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#D6B56D]/60 shadow-lg shrink-0 object-cover"
            />
            <div className="space-y-2">
              <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#7047A3] text-white font-black text-[10px] uppercase tracking-wider">
                  Get Elimika App
                </span>
                <span className="text-[11px] font-bold text-[#D6B56D]">
                  {previewOverride === 'auto'
                    ? isIOS
                      ? '📱 Detected: iPhone / iPad (iOS)'
                      : deviceType === 'android'
                      ? '🤖 Detected: Android Device'
                      : '💻 Detected: Desktop Browser'
                    : `🔍 Previewing: ${
                        activeDevice === 'ios'
                          ? 'iPhone / iPad'
                          : activeDevice === 'android'
                          ? 'Android'
                          : 'Desktop'
                      }`}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                Study Anytime with the Official Elimika App
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Fast access to NECTA Past Papers, Marking Schemes, TIE Student Books, Interactive 3D STEM Games, and Moha AI Tutor on iPhone, iPad, Android, and Desktop.
              </p>

              {/* Device Mode Switcher for Testing iOS, Android & Desktop */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px]">
                <span className="text-slate-400 font-semibold mr-1">Platform:</span>
                {(
                  [
                    { id: 'auto', label: 'Auto Detect' },
                    { id: 'ios', label: 'iPhone / iPad' },
                    { id: 'android', label: 'Android' },
                    { id: 'desktop', label: 'Desktop QR' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewOverride(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                      previewOverride === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Automatic Device-Specific Installation Option */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center lg:items-end justify-center">
            {isInstalled && previewOverride === 'auto' ? (
              <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 flex items-center gap-3 text-emerald-200 max-w-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="font-black text-sm text-white">
                    Elimika is already installed
                  </div>
                  <div className="text-xs text-emerald-300">
                    You are running the installed Elimika application.
                  </div>
                </div>
              </div>
            ) : activeDevice === 'ios' ? (
              /* iOS (iPhone & iPad) Installation Box — Directed to www.elimika.online */
              <div className="w-full sm:w-80 p-4 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <AppleIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>iPhone Users Only (www.elimika.online)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  iPhone users are directed to <strong>www.elimika.online</strong> to download the app directly to your phone.
                </p>
                <a
                  href="https://www.elimika.online/?install=iphone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  <AppleIcon className="w-4 h-4" />
                  <span>Download at www.elimika.online</span>
                </a>
              </div>
            ) : activeDevice === 'android' ? (
              /* Android Installation Box — Google Play Store with Coming Soon fallback */
              <div className="w-full sm:w-80 p-4 rounded-2xl bg-slate-950/90 border border-slate-700 space-y-3 text-left">
                <div className="flex items-center justify-between gap-2 text-xs font-black text-white">
                  <span className="flex items-center gap-2">
                    <AndroidRobotIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Android Smartphone &amp; Tablet</span>
                  </span>
                  {!configuredPlayStoreUrl && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold">
                      Coming Soon
                    </span>
                  )}
                </div>

                {configuredPlayStoreUrl ? (
                  <a
                    href={configuredPlayStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <GooglePlayIcon className="w-4 h-4" />
                    <span>Download on Google Play</span>
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAndroidSoonModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                    >
                      <GooglePlayIcon className="w-4 h-4" />
                      <span>Download on Google Play</span>
                    </button>
                    <p className="text-[11px] text-amber-300 font-semibold leading-snug">
                      Google Play listing is coming soon! Tap above to install the web app to your Android Home Screen now.
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Desktop Installation Box — QR Code + Mobile Visit Link */
              <div className="w-full sm:w-96 p-4 rounded-2xl bg-slate-950/90 border border-slate-700 flex items-center gap-4 text-left">
                <div className="p-2 rounded-xl bg-white shrink-0 shadow-xs">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=https%3A%2F%2Felimika.online"
                    alt="QR Code for https://elimika.online"
                    className="w-20 h-20 rounded-lg block"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Scan on iPhone or Android</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Scan with your phone camera or visit <strong>https://elimika.online</strong> on your mobile device to install the app.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="https://elimika.online"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Visit elimika.online</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {isInstallable && (
                      <button
                        type="button"
                        onClick={install}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install Desktop App</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <IOSInstallGuideModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isInstalled={isInstalled}
        isSafari={isSafari}
      />

      <AndroidPlayStoreModal
        isOpen={showAndroidSoonModal}
        onClose={() => setShowAndroidSoonModal(false)}
        isInstallable={isInstallable}
        onDirectInstall={install}
      />
    </section>
  );
};
