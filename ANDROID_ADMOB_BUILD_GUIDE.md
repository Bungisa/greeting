# Elimika Tanzania — Android Capacitor + Google AdMob Build Guide

Your native Android project (`online.elimika.ap`) is **already generated and wired** with **Capacitor** and **`@capacitor-community/admob`**, loading **`https://elimika.online`** in fullscreen (zero Chrome address bar) while serving **Google AdMob** natively on Android and **Google AdSense** only in web browsers.

---

## 1. Prerequisites on Your PC
- **Node.js 20+**
- **Android Studio** (with Android SDK 34/35 installed)
- Your **Google Play Upload Keystore** (the `.keystore` / `.jks` file from PWABuilder for `online.elimika.ap`)

---

## 2. Sync & Open in Android Studio
From the project folder on your PC:

```bash
npm install
npm run cap:sync
npm run cap:open:android
```

---

## 3. Paste Your Real AdMob App ID (One Line!)
`AndroidManifest.xml` already includes the AdMob `<meta-data>` tag and `AD_ID` permission.

Open `android/app/src/main/res/values/strings.xml` and replace the Google Test App ID with your real Android App ID from **AdMob → Apps → Elimika Tanzania → App settings**:

```xml
<string name="admob_app_id">ca-app-pub-7814843623545511~YOUR_APP_ID_SUFFIX</string>
```

---

## 4. Bump `versionCode` for Google Play
Open `android/app/build.gradle` and set `versionCode` to a number **higher** than your current PWABuilder version on Google Play (e.g., if Play Console shows `versionCode 5`, change it to `versionCode 6` and `versionName "2.0.0"`).

---

## 5. Paste Your Ad Unit IDs in Elimika Admin
1. Open `https://elimika.online` and unlock your Admin **Google Ads** tab.
2. Paste your **Android AdMob App ID**, **Banner Ad Unit ID**, and **Interstitial Ad Unit ID**.
3. Keep **Google Test Ads Mode ON** while testing on your own phone, then turn it **OFF** and click **Save AdMob Config & Update `/app-ads.txt`** right before releasing to Google Play.

---

## 6. Build & Upload Your Signed `.aab`
In **Android Studio**:
1. Test first on your Android phone (**Run ▶**) — verify zero Chrome bar and Google Test Ads appearing cleanly at the bottom.
2. When ready to publish: **Build → Generate Signed App Bundle / APK → Android App Bundle (`.aab`)**.
3. Sign with your existing **PWABuilder keystore** so Google Play accepts it as an update to `online.elimika.ap`.
4. Upload the `.aab` to **Google Play Console → Production → Create new release**.
5. In **Google Play Console → App content → Advertising ID**, select **Yes (Advertising or marketing)**.
