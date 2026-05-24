const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function copyTemplate(projectRoot, relativeSource, relativeTarget) {
  const source = path.join(projectRoot, relativeSource);
  const target = path.join(projectRoot, "android", "app", "src", "main", relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function patchMainApplicationReleaseEntry(projectRoot) {
  const appPath = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "java",
    "com",
    "hypervoice",
    "MainApplication.kt"
  );
  if (!fs.existsSync(appPath)) {
    return;
  }

  let source = fs.readFileSync(appPath, "utf8");
  const releaseEntry =
    'override fun getJSMainModuleName(): String =\n' +
    '            if (BuildConfig.DEBUG) ".expo/.virtual-metro-entry" else "index"';
  if (source.includes('.expo/.virtual-metro-entry"') && !source.includes('BuildConfig.DEBUG')) {
    source = source.replace(
      /override fun getJSMainModuleName\(\): String = "\.expo\/\.virtual-metro-entry"/,
      releaseEntry
    );
    fs.writeFileSync(appPath, source);
  }
}

function patchMainApplication(projectRoot) {
  const appPath = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "java",
    "com",
    "hypervoice",
    "MainApplication.kt"
  );
  if (!fs.existsSync(appPath)) {
    return;
  }

  let source = fs.readFileSync(appPath, "utf8");
  if (!source.includes("import com.hypervoice.HyperVoicePackage")) {
    source = source.replace(
      /import com\.facebook\.react\.ReactPackage\n/,
      "import com.facebook.react.ReactPackage\nimport com.hypervoice.HyperVoicePackage\n"
    );
  }
  if (!source.includes("packages.add(HyperVoicePackage())")) {
    source = source.replace(
      /val packages = PackageList\(this\)\.packages\n/,
      "val packages = PackageList(this).packages\n          packages.add(HyperVoicePackage())\n"
    );
  }
  fs.writeFileSync(appPath, source);
}

function ensurePermission(manifest, permission) {
  if (manifest.includes(`android:name="${permission}"`)) {
    return manifest;
  }
  return manifest.replace(
    /<manifest([^>]*)>/,
    `<manifest$1>\n  <uses-permission android:name="${permission}"/>`
  );
}

function patchAndroidManifest(projectRoot) {
  const manifestPath = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  let manifest = fs.readFileSync(manifestPath, "utf8");
  manifest = ensurePermission(manifest, "android.permission.RECORD_AUDIO");
  manifest = ensurePermission(manifest, "android.permission.INTERNET");

  if (!manifest.includes(".ime.AiVoiceKeyboardService")) {
    const service = `
    <service
      android:name=".ime.AiVoiceKeyboardService"
      android:exported="true"
      android:permission="android.permission.BIND_INPUT_METHOD">
      <intent-filter>
        <action android:name="android.view.InputMethod" />
      </intent-filter>
      <meta-data
        android:name="android.view.im"
        android:resource="@xml/method" />
    </service>`;
    manifest = manifest.replace("</application>", `${service}\n  </application>`);
  }

  manifest = manifest.replace(
    /<application\b(?![^>]*android:usesCleartextTraffic=)/,
    '<application android:usesCleartextTraffic="true"'
  );

  if (!manifest.includes('android:host="oauth-native-callback"')) {
    const oauthFilter = `
      <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="hypervoice" android:host="oauth-native-callback"/>
        <data android:scheme="exp+hypervoice" android:host="oauth-native-callback"/>
      </intent-filter>`;
    manifest = manifest.replace(
      /<\/activity>\s*\n\s*<\/application>/,
      `${oauthFilter}\n    </activity>\n  </application>`
    );
  }

  fs.writeFileSync(manifestPath, manifest);
}

function patchGradleProperties(projectRoot) {
  const gradlePath = path.join(projectRoot, "android", "gradle.properties");
  if (!fs.existsSync(gradlePath)) {
    return;
  }
  let source = fs.readFileSync(gradlePath, "utf8");
  source = source.replace(/newArchEnabled=true/g, "newArchEnabled=false");
  fs.writeFileSync(gradlePath, source);
}

module.exports = function withHyperVoiceIme(config) {
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const files = [
        ["native/android/AiVoiceKeyboardService.kt", "java/com/hypervoice/ime/AiVoiceKeyboardService.kt"],
        ["native/android/HyperVoiceSettingsModule.kt", "java/com/hypervoice/HyperVoiceSettingsModule.kt"],
        ["native/android/HyperVoicePackage.kt", "java/com/hypervoice/HyperVoicePackage.kt"],
        ["native/android/keyboard_view.xml", "res/layout/keyboard_view.xml"],
        ["native/android/ime_key_bg.xml", "res/drawable/ime_key_bg.xml"],
        ["native/android/ime_action_key_bg.xml", "res/drawable/ime_action_key_bg.xml"],
        ["native/android/ime_toggle_bg.xml", "res/drawable/ime_toggle_bg.xml"],
        ["native/android/ime_toggle_active.xml", "res/drawable/ime_toggle_active.xml"],
        ["native/android/ime_mic_button.xml", "res/drawable/ime_mic_button.xml"],
        ["native/android/ime_preview_bg.xml", "res/drawable/ime_preview_bg.xml"],
        ["native/android/ic_mic.xml", "res/drawable/ic_mic.xml"],
        ["native/android/ime_mic_button_circle.xml", "res/drawable/ime_mic_button_circle.xml"],
        ["native/android/ime_pulse_ring.xml", "res/drawable/ime_pulse_ring.xml"],
        ["native/android/ime_wave_bar.xml", "res/drawable/ime_wave_bar.xml"],
        ["native/android/method.xml", "res/xml/method.xml"],
        ["native/android/ime_strings.xml", "res/values/ime_strings.xml"]
      ];

      for (const [source, target] of files) {
        copyTemplate(mod.modRequest.projectRoot, source, target);
      }
      patchAndroidManifest(mod.modRequest.projectRoot);
      patchGradleProperties(mod.modRequest.projectRoot);
      patchMainApplication(mod.modRequest.projectRoot);
      patchMainApplicationReleaseEntry(mod.modRequest.projectRoot);

      return mod;
    }
  ]);
};
