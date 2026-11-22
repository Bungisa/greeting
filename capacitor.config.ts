import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.elimika.ap',
  appName: 'Elimika Tanzania',
  webDir: 'dist',
  server: {
    // Loads your live Vercel production app directly so every website update
    // (past papers, TIE books, 3D simulations) appears instantly in Play Store installs.
    url: 'https://elimika.online',
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'elimika.online',
      'www.elimika.online',
      '*.elimika.online',
    ],
  },
  android: {
    // Lets Elimika detect the native Android Capacitor shell immediately so
    // Google AdSense is automatically suppressed and ONLY native Google AdMob runs.
    appendUserAgent: 'ElimikaCapacitorApp/1.0',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
  },
};

export default config;
