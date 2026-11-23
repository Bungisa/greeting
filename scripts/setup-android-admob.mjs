import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
const stringsPath = path.join(androidDir, 'app', 'src', 'main', 'res', 'values', 'strings.xml');

const APP_ID_REGEX = /^ca-app-pub-\d{16}~\d{10}$/;
const envAppId = (process.env.ADMOB_ANDROID_APP_ID || '').trim();
const admobAppId = APP_ID_REGEX.test(envAppId)
  ? envAppId
  : 'ca-app-pub-3940256099942544~3347511713';

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: rootDir });
}

if (!fs.existsSync(path.join(rootDir, 'dist'))) {
  run('npm run build');
}

if (!fs.existsSync(androidDir)) {
  run('npx cap add android');
}

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf-8');
  if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
    manifest = manifest.replace(
      '</application>',
      `        <!-- Google AdMob App ID (edit @string/admob_app_id in res/values/strings.xml before Play Store release) -->\n        <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="@string/admob_app_id" />\n    </application>`
    );
  }
  if (!manifest.includes('com.google.android.gms.permission.AD_ID')) {
    manifest = manifest.replace(
      '</manifest>',
      `    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />\n</manifest>`
    );
  }
  fs.writeFileSync(manifestPath, manifest, 'utf-8');
  console.log('✓ Patched AndroidManifest.xml with Google AdMob meta-data & AD_ID permission.');
}

if (fs.existsSync(stringsPath)) {
  let stringsXml = fs.readFileSync(stringsPath, 'utf-8');
  if (!stringsXml.includes('name="admob_app_id"')) {
    stringsXml = stringsXml.replace(
      '</resources>',
      `    <!-- Replace with your real AdMob App ID (ca-app-pub-7814843623545511~XXXXXXXXXX) before Play Store release -->\n    <string name="admob_app_id">${admobAppId}</string>\n</resources>`
    );
    fs.writeFileSync(stringsPath, stringsXml, 'utf-8');
    console.log(`✓ Added admob_app_id (${admobAppId}) to strings.xml.`);
  }
}

run('npx cap sync android');
console.log('\n✅ Android Capacitor + AdMob project is ready! Run: npm run cap:open:android');
