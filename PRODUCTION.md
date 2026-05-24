# HyperVoice — production (no Play Store)

Today the app talks to your **PC on the local network** (`192.168.x.x`). That only works on the same Wi‑Fi. For anyone in another city, the phone must reach a **public API on the internet**.

## How it works for remote users

```
User's phone (APK)
    → Clerk (cloud login) — already global
    → Your API (HTTPS, e.g. Vercel) — you must deploy this
    → Neon PostgreSQL (cloud DB) — you already use this
    → OpenRouter (AI cleanup) — API key on the server only
```

1. User installs your **APK** (download link you share).
2. User signs in with **Clerk** (email / Google).
3. App registers them in your DB via `POST /api/users/init`.
4. App syncs `apiBaseUrl` + `userId` to the **keyboard** over SharedPreferences.
5. Voice dictation calls `https://your-api.com/api/ai/cleanup` from the keyboard — works from anywhere.

**Clerk** and **Neon** are already cloud-hosted. The missing piece is deploying **`apps/api`** to a public HTTPS URL and rebuilding the APK with that URL.

---

## Step 1 — Deploy the API (recommended: Vercel)

### Prerequisites

- [Neon](https://neon.tech) `DATABASE_URL` (you have this)
- [OpenRouter](https://openrouter.ai) `OPENROUTER_API_KEY`
- [Clerk](https://clerk.com) account (for auth; keys stay in the mobile app)

### Vercel

1. Push the repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add Project** → import the repo.
3. Set **Root Directory** to `apps/api`.
4. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Your Neon connection string |
   | `OPENROUTER_API_KEY` | Your OpenRouter key |
   | `OPENROUTER_MODEL` | e.g. `deepseek/deepseek-v4-flash:free` |
   | `OPENROUTER_FALLBACK_MODEL` | e.g. `qwen/qwen3-235b-a22b:free` |

5. Deploy. Note the URL, e.g. `https://hypervoice-api.vercel.app`.

6. Run migrations once (from your PC):

   ```bash
   cd apps/api
   set DATABASE_URL=your_neon_url
   npx prisma migrate deploy
   ```

The same deployment serves the **marketing landing page** at `/` (glassmorphic UI with download button). API routes stay under `/api/*`.

### Smoke test

```bash
curl https://YOUR-API.vercel.app/api/users/init -X POST -H "Content-Type: application/json" -d "{\"deviceId\":\"test-device-123\"}"
```

You should get JSON with a `user` object, not an error.

---

## Step 2 — Clerk (production)

1. Clerk Dashboard → your app → **API Keys** → use **Production** publishable key (`pk_live_...`).
2. **OAuth** → add redirect URL: `hypervoice://oauth-native-callback`
3. Google sign-in: configure OAuth client as Clerk docs describe.

---

## Step 3 — Build a “worldwide” APK

Edit `apps/mobile/.env` **before** building:

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-API.vercel.app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxx
```

Then build:

```powershell
cd apps\mobile
npm run build:apk
```

Output: `apps/mobile/HyperVoice-release.apk` (copy to `HyperVoice-release.apk` at repo root).

Every user’s app and keyboard will use that HTTPS API after they sign in once.

---

## Step 4 — Distribute without Play Store

Pick one:

| Method | Notes |
|--------|--------|
| **Google Drive / Dropbox** | Share link; users download APK |
| **GitHub Releases** | Upload `HyperVoice-release.apk` per version |
| **Firebase App Distribution** | Email invites, good for testers |
| **Your website** | Simple download button |

Users must:

1. Allow **Install unknown apps** for their browser/files app.
2. Install the APK.
3. Enable **HyperVoice keyboard** + microphone (onboarding in app).

---

## Costs (rough)

| Service | Role |
|---------|------|
| Vercel | API hosting (free tier may be enough for MVP) |
| Neon | Database (free tier available) |
| Clerk | Auth (free tier for moderate MAU) |
| OpenRouter | Pay per AI request |

---

## Security notes for real users

- API routes trust `userId` in the body; for stronger production security, add Clerk JWT verification on the API later.
- Never put `OPENROUTER_API_KEY` in the mobile app — only on the server.
- Use **HTTPS** only in production (`https://` in `EXPO_PUBLIC_API_BASE_URL`).
- Rotate keys if an APK or `.env` leaks.

---

## Updating the app later

1. Deploy new API version on Vercel (usually automatic on git push).
2. If API URL unchanged, users only need a **new APK** when the mobile app changes.
3. Share the new APK link; ask users to install over the old version.

---

## Quick checklist

- [ ] API live on HTTPS
- [ ] `prisma migrate deploy` run against production DB
- [ ] Clerk production keys + OAuth redirect
- [ ] `.env` uses production API URL + `pk_live_...`
- [ ] New APK built and shared
- [ ] Test on phone **without Wi‑Fi to your PC** (mobile data only)
