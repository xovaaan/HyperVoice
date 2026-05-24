# HyperVoice

HyperVoice is an Android-first MVP for an AI voice typing keyboard. The mobile app is built with React Native and Expo development builds, the Android keyboard is a Kotlin `InputMethodService`, and the backend is a Next.js API using Prisma with Neon PostgreSQL.

## Product scope

- Android only.
- No Docker.
- No payment system.
- Audio is never stored.
- Audio is processed temporarily on-device by Android `SpeechRecognizer`.
- Only transcript/final text is sent to the backend.
- Text history and personal dictionary are stored in Neon PostgreSQL.
- OpenRouter free chat models handle cleanup and rewrite.

## Structure

```text
apps/
  api/
    prisma/schema.prisma
    src/app/api/...
    src/lib/openrouter.ts
    src/lib/prisma.ts
  mobile/
    App.tsx
    screens/
    components/
    lib/
    plugins/withHyperVoiceIme.js
    native/android/
```

## Backend setup

```bash
cd apps/api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Set `apps/api/.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
OPENROUTER_API_KEY="your_openrouter_key"
OPENROUTER_MODEL="meta-llama/llama-3.3-70b-instruct:free"
OPENROUTER_FALLBACK_MODEL="qwen/qwen3-235b-a22b:free"
```

The API runs on `http://localhost:3001`. Android emulators reach this as `http://10.0.2.2:3001`.

## Mobile setup

```bash
cd apps/mobile
cp .env.example .env
npm install
npx expo prebuild --platform android --clean
npx expo run:android
```

Set `apps/mobile/.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001
```

For a physical Android device, replace `10.0.2.2` with your computer's LAN IP and keep the phone on the same network.

## Enabling the keyboard

1. Open the HyperVoice app once so it creates a device user and syncs keyboard settings.
2. Go to the Onboarding tab.
3. Grant microphone permission.
4. Tap **Open keyboard settings** and enable HyperVoice.
5. Select HyperVoice as the active keyboard.
6. In any Android text field, tap the mic, speak, wait for cleanup, and tap Insert.

## API routes

- `POST /api/users/init`
- `POST /api/ai/cleanup`
- `POST /api/ai/rewrite`
- `GET /api/history?userId=`
- `DELETE /api/history/:id`
- `DELETE /api/history/clear?userId=`
- `GET /api/dictionary?userId=`
- `POST /api/dictionary`
- `DELETE /api/dictionary/:id`
- `PATCH /api/settings`

## Privacy notes

The Android IME calls Android `SpeechRecognizer` directly. HyperVoice does not write audio files, does not upload audio, and does not store audio metadata. The backend accepts text only. If history is disabled, cleanup/rewrite responses are returned without creating `TextEntry` rows.

## Known limitations

- `SpeechRecognizer` availability depends on Android device services and microphone permission.
- Free OpenRouter models may have rate limits, downtime, or availability changes.
- Speak-to-edit MVP uses a manual copy/provided-text flow before deeper Android selected-text integration.
- The IME stores only local settings in `SharedPreferences`; cross-app selected-text capture is intentionally not attempted in this MVP.
