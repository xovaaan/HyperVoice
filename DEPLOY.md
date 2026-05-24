# HyperVoice — deploy step by step

Deploy **one project** (`apps/api`) to get:

- Landing page → `https://your-app.vercel.app/`
- API → `https://your-app.vercel.app/api/...`

---

## Before you start (gather these)

| Item | Where to get it |
|------|------------------|
| **GitHub account** | [github.com](https://github.com) |
| **Vercel account** | [vercel.com](https://vercel.com) (sign in with GitHub) |
| **DATABASE_URL** | [Neon](https://console.neon.tech) → your project → Connection string |
| **OPENROUTER_API_KEY** | [openrouter.ai](https://openrouter.ai/keys) |
| **Clerk keys** | [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys |

---

## Part 1 — Push code to GitHub

### 1.1 Create a repo on GitHub

1. GitHub → **New repository**
2. Name: `HyperVoice` (or any name)
3. **Do not** add README if you already have code locally
4. Copy the repo URL, e.g. `https://github.com/YOUR_USERNAME/HyperVoice.git`

### 1.2 Push from your PC (PowerShell)

```powershell
cd D:\HyperVoice

git init
git add .
git commit -m "Initial HyperVoice — API, mobile, landing page"

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/HyperVoice.git
git push -u origin main
```

**Important:** `.env` files should stay out of git. Confirm `.gitignore` includes:

```
.env
apps/api/.env
apps/mobile/.env
```

Never commit API keys or `DATABASE_URL`.

---

## Part 2 — Deploy on Vercel

### 2.1 Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your `HyperVoice` GitHub repo
3. Configure:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/api` ← click Edit, set this |
| **Build Command** | (leave default or use) `prisma generate && next build` |
| **Install Command** | `cd ../.. && npm install` |

4. Expand **Environment Variables** → add for **Production** (and Preview if you want):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `postgresql://...` from Neon (full string) |
| `OPENROUTER_API_KEY` | your OpenRouter secret key |
| `OPENROUTER_MODEL` | `deepseek/deepseek-v4-flash:free` |
| `OPENROUTER_FALLBACK_MODEL` | `qwen/qwen3-235b-a22b:free` |

5. Click **Deploy**
6. Wait ~2–5 minutes. Copy your URL, e.g. `https://hyper-voice-xxx.vercel.app`

### 2.2 Run database migrations (once)

On your PC, using the **same** Neon `DATABASE_URL` as Vercel:

```powershell
cd D:\HyperVoice\apps\api

$env:DATABASE_URL = "postgresql://YOUR_NEON_CONNECTION_STRING"
npx prisma migrate deploy
```

You should see migrations applied successfully.

### 2.3 Test the deployment

**Landing page** — open in browser:

```
https://YOUR-APP.vercel.app/
```

**API** — PowerShell:

```powershell
curl.exe -X POST "https://YOUR-APP.vercel.app/api/users/init" `
  -H "Content-Type: application/json" `
  -d '{\"deviceId\":\"deploy-test-001\"}'
```

Expected: JSON with `"user": { "id": "...", ... }` — not `"error"`.

---

## Part 3 — Clerk (production auth)

### 3.1 Production API keys

1. [Clerk Dashboard](https://dashboard.clerk.com) → your application
2. Top-left: switch **Development** → **Production** (when ready for real users)
3. **API keys** → copy **Publishable key** (`pk_live_...`)

### 3.2 OAuth redirect (Google sign-in)

1. Clerk → **Configure** → **Paths** or **OAuth**
2. Add **redirect URL**:

   ```
   hypervoice://oauth-native-callback
   ```

3. For Google: follow Clerk’s Google OAuth setup (Client ID/Secret in Google Cloud Console)

Development keys (`pk_test_...`) work for testing; use `pk_live_...` for APKs you give to others.

---

## Part 4 — Build production APK

Edit `D:\HyperVoice\apps\mobile\.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-APP.vercel.app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxx
```

Replace with your real Vercel URL and Clerk production key.

Build:

```powershell
cd D:\HyperVoice\apps\mobile
npm run build:apk
```

APK path:

```
D:\HyperVoice\apps\mobile\HyperVoice-release.apk
```

### Test on phone (mobile data, not home Wi‑Fi)

1. Uninstall old HyperVoice
2. Install new APK
3. Sign in → complete onboarding → enable keyboard
4. Open Messenger (or Notes), use HyperVoice keyboard, dictate

If it works on **4G/5G**, remote users will work too.

---

## Part 5 — APK download on landing page

### Option A — Host APK on Vercel (simple)

1. Copy APK to:

   ```
   D:\HyperVoice\apps\api\public\HyperVoice-release.apk
   ```

2. Commit and push:

   ```powershell
   git add apps/api/public/HyperVoice-release.apk
   git commit -m "Add APK download"
   git push
   ```

3. Vercel redeploys automatically.

4. Update `apps/api/src/app/page.tsx` — change download links from `#` to:

   ```
   /HyperVoice-release.apk
   ```

   (Search for `href="#"` on download buttons / `apk-download`.)

Users download from:

```
https://YOUR-APP.vercel.app/HyperVoice-release.apk
```

### Option B — Google Drive / Dropbox

Upload APK, get share link, put that URL in the download button `href`.

---

## Part 6 — Share with users

Send them:

1. **Website:** `https://YOUR-APP.vercel.app/`
2. **Direct APK** (if on Vercel): `https://YOUR-APP.vercel.app/HyperVoice-release.apk`
3. Short instructions: install APK → allow unknown sources → sign in → enable keyboard

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Vercel build fails | Check **Root Directory** = `apps/api`, Install = `cd ../.. && npm install` |
| API returns 500 | Verify `DATABASE_URL` and `OPENROUTER_API_KEY` in Vercel env vars |
| App can’t connect | APK must use `https://` Vercel URL, not `192.168.x.x` |
| Google sign-in fails | Add `hypervoice://oauth-native-callback` in Clerk |
| Prisma errors | Run `npx prisma migrate deploy` with production `DATABASE_URL` |

---

## After deploy — updating

| Change | What to do |
|--------|------------|
| API / landing only | `git push` → Vercel auto-redeploys |
| Database schema | `prisma migrate deploy` then push migration files |
| Mobile app | Rebuild APK, re-upload, update download link |

---

## Quick checklist

- [ ] Code on GitHub (no `.env` committed)
- [ ] Vercel deployed, Root Directory = `apps/api`
- [ ] Env vars set on Vercel
- [ ] `prisma migrate deploy` run
- [ ] `curl` test on `/api/users/init` works
- [ ] Landing page opens at `/`
- [ ] Clerk production key + OAuth redirect
- [ ] APK built with `EXPO_PUBLIC_API_BASE_URL=https://...`
- [ ] Phone test on mobile data
- [ ] Download button points to APK URL
