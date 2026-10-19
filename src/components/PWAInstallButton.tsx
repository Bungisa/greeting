import React, { useEffect, useState } from 'react';
import { Download, Globe, Smartphone, CheckCircle2, X, ExternalLink, Copy, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

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
    isIOS,
    install,
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

interface PWAInstallButtonProps {
  customDomain: string;
  onSaveCustomDomain: (domain: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  customDomain,
  onSaveCustomDomain,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [domainInput, setDomainInput] = useState(customDomain);
  const [copiedAssetLink, setCopiedAssetLink] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setDomainInput(customDomain);
      setShowPublishModal(true);
    }
  };

  const assetLinksUrl = `${(customDomain || window.location.origin).replace(/\/+$/, '')}/.well-known/assetlinks.json`;

  return (
    <>
      <div className="flex items-center gap-1.5">
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Install Elimika App on Phone/PC or View Play Store & Custom Domain Setup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isIOS ? 'Install on iOS' : 'Install App'}</span>
          </button>
        )}

        <button
          onClick={() => {
            setDomainInput(customDomain);
            setShowPublishModal(true);
          }}
          className="px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Play Store APK/AAB & Custom Domain Setup (Remove .ai.studio)"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Play Store &amp; Domain</span>
        </button>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black">
                    Google Play Store &amp; Custom Domain Setup
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Your app is now PWA-compliant with Manifest, 512px Icons &amp; Digital Asset Links
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
              {/* Direct Phone/PC Installation */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-black text-emerald-950 flex items-center gap-1.5 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Install (Android, iPhone &amp; Desktop PWA)</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    {isIOS
                      ? 'On iPhone/iPad Safari: tap the Share icon in the toolbar, then tap "Add to Home Screen".'
                      : 'In Chrome/Edge on Android or PC: click "Install Now" or open browser menu (⋮) → "Install app / Add to Home screen".'}
                  </p>
                </div>
                {isInstallable && (
                  <button
                    onClick={install}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shrink-0 cursor-pointer"
                  >
                    📲 Install Now
                  </button>
                )}
              </div>

              {/* Part 1: Remove .ai.studio / .run.app with Custom Domain */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Step 1: How to Remove .ai.studio / .run.app URL (Use Your Own Domain)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                  <li>
                    Click <strong>Deploy</strong> in the top-right of AI Studio to deploy your app to <strong>Google Cloud Run</strong>.
                  </li>
                  <li>
                    Open <a href="https://console.cloud.google.com/run/domains" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Google Cloud Console → Cloud Run → Manage Custom Domains</a>.
                  </li>
                  <li>
                    Click <strong>Add Mapping</strong>, select your deployed Elimika service, and enter your own domain (e.g. <code className="bg-white px-1.5 py-0.5 rounded border font-mono">elimika.co.tz</code> or <code className="bg-white px-1.5 py-0.5 rounded border font-mono">elimika.com</code>). Cloud Run automatically provisions a free HTTPS SSL certificate.
                  </li>
                </ol>

                {/* Save Custom Domain for Share Links */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    Set Your Custom Domain for Quiz &amp; WhatsApp Share Links:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="https://elimika.co.tz"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={() => {
                        const cleaned = domainInput.trim().replace(/\/+$/, '');
                        onSaveCustomDomain(cleaned);
                        setDomainSaved(true);
                        setTimeout(() => setDomainSaved(false), 2500);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0"
                    >
                      {domainSaved ? '✓ Saved!' : 'Save Domain'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Part 2: Publish to Google Play Store */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                    <span>Step 2: Publish Elimika to Google Play Store (.AAB / .APK)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase">
                    PWA Ready ✓
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  We have already configured your app with a Play Store compliant <strong>Web App Manifest</strong>, <strong>192px &amp; 512px Maskable Icons</strong>, <strong>Offline Service Worker</strong>, and <strong>Android Digital Asset Links</strong> (<code className="font-mono bg-white px-1 rounded">/.well-known/assetlinks.json</code>):
                </p>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                  <li>
                    Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-3 h-3" /></a> and paste your deployed app URL (or custom domain).
                  </li>
                  <li>
                    Click <strong>Package for stores</strong> → choose <strong>Android (Google Play)</strong> → download the signed <code className="bg-white px-1 rounded font-mono">.aab</code> (Android App Bundle) and <code className="bg-white px-1 rounded font-mono">.apk</code> files.
                  </li>
                  <li>
                    Copy the <strong>SHA-256 certificate fingerprint</strong> generated by PWABuilder / Google Play Console into your environment variables (<code className="bg-white px-1 rounded font-mono">ANDROID_PACKAGE_NAME</code> &amp; <code className="bg-white px-1 rounded font-mono">ANDROID_SHA256_FINGERPRINT</code>) so your Play Store app runs full-screen with zero browser bar.
                  </li>
                  <li>
                    Upload the <code className="bg-white px-1 rounded font-mono">.aab</code> file to <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline">Google Play Console</a> to publish on the Play Store.
                  </li>
                </ol>

                <div className="pt-2 border-t border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    Asset Links Endpoint: <strong>{assetLinksUrl}</strong>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(assetLinksUrl).catch(() => {});
                      setCopiedAssetLink(true);
                      setTimeout(() => setCopiedAssetLink(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedAssetLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAssetLink ? 'Copied!' : 'Copy assetlinks.json URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
