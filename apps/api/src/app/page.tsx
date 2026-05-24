import Image from "next/image";

const APK_DOWNLOAD_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/HyperVoice-release.apk";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#stats", label: "Impact" },
  { href: "#privacy", label: "Privacy" },
  { href: "#apps", label: "Use anywhere" },
  { href: "#download", label: "Download" }
];

export default function LandingPage() {
  return (
    <div className="page">
      <div className="mesh" aria-hidden />
      <div className="orb orb-1" aria-hidden />
      <div className="orb orb-2" aria-hidden />
      <div className="orb orb-3" aria-hidden />

      <header className="wrap">
        <nav className="nav glass">
          <a href="#" className="nav-brand">
            <Image src="/logo.png" alt="HyperVoice" width={36} height={36} priority />
            HyperVoice
          </a>
          <div className="nav-links">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <a href="#download" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
            Get APK
          </a>
        </nav>
      </header>

      <main>
        {/* 1 — Hero */}
        <section id="hero" className="hero wrap">
          <div className="hero-inner glass">
            <div className="hero-badge">
              <span>✦</span> Android · AI voice keyboard · Free MVP
            </div>
            <div className="hero-visual">
              <Image src="/logo.png" alt="" width={120} height={120} className="hero-logo" priority />
            </div>
            <h1>Speak. We write it perfectly.</h1>
            <p>
              HyperVoice turns your voice into polished text in Messenger, WhatsApp, email, and every
              app you use — with real-time AI cleanup in English, Bangla, and Hindi.
            </p>
            <div className="hero-actions">
              <a href="#download" className="btn btn-primary">
                <DownloadIcon />
                Download for Android
              </a>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
          </div>
        </section>

        {/* 2 — Features bento */}
        <section id="features" className="wrap">
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for how you actually type</h2>
          <p className="section-desc">
            A full keyboard plus a voice layer that understands context, language, and your custom
            dictionary.
          </p>
          <div className="bento" style={{ marginTop: 40 }}>
            <article className="bento-card glass bento-highlight span-8">
              <div className="bento-icon">🎤</div>
              <h3>Voice → AI → Insert</h3>
              <p>
                Tap the mic, speak naturally, and get cleaned text inserted straight into the field
                you&apos;re typing in — no copy-paste.
              </p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">✨</div>
              <h3>Smart cleanup</h3>
              <p>Removes filler words, fixes grammar, and formats sentences instantly.</p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">🌐</div>
              <h3>3 languages</h3>
              <p>English, Bangla, and Hindi with one-tap switching on the keyboard.</p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">📖</div>
              <h3>Custom dictionary</h3>
              <p>Teach HyperVoice names, brands, and terms so spellings stay yours.</p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">🔄</div>
              <h3>Rewrite modes</h3>
              <p>Professional, casual, shorter, email-ready, and more — powered by AI.</p>
            </article>
          </div>
        </section>

        {/* 3 — How it works */}
        <section id="how" className="wrap">
          <span className="section-label">How it works</span>
          <h2 className="section-title">Up and running in minutes</h2>
          <p className="section-desc">Four steps from install to your first perfect message.</p>
          <div className="steps">
            {[
              { n: "1", title: "Install APK", desc: "Download and open HyperVoice on your Android phone." },
              { n: "2", title: "Sign in", desc: "Create an account — your settings sync to the cloud." },
              { n: "3", title: "Enable keyboard", desc: "Turn on HyperVoice in system input settings." },
              { n: "4", title: "Speak anywhere", desc: "Open any chat app, switch keyboard, tap mic." }
            ].map((step) => (
              <article key={step.n} className="step glass">
                <div className="step-num">{step.n}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 4 — Stats / impact */}
        <section id="stats" className="wrap">
          <span className="section-label">Impact</span>
          <h2 className="section-title">Type at the speed of speech</h2>
          <p className="section-desc">
            Track dictation time, words detected, WPM, and time saved versus thumb-typing.
          </p>
          <div className="stats-row">
            {[
              { value: "3×", label: "Faster than typing" },
              { value: "130", label: "Voice WPM target" },
              { value: "0", label: "Audio stored" },
              { value: "∞", label: "Apps supported" }
            ].map((stat) => (
              <article key={stat.label} className="stat-card glass">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </article>
            ))}
          </div>
          <div className="bento" style={{ marginTop: 24 }}>
            <article className="bento-card glass span-12" style={{ flexDirection: "row", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div className="bento-icon">📊</div>
              <div>
                <h3>Live stats in the app</h3>
                <p style={{ margin: 0 }}>
                  Total dictation time, words detected, average WPM, and estimated minutes saved —
                  all in your dashboard after each session.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* 5 — Privacy */}
        <section id="privacy" className="wrap">
          <span className="section-label">Privacy</span>
          <h2 className="section-title">Your voice stays yours</h2>
          <p className="section-desc">
            Designed with a clear rule: audio never hits our servers. Only text you choose to process.
          </p>
          <div className="privacy-grid">
            {[
              {
                icon: "🔒",
                title: "Audio never stored",
                desc: "Speech is processed on-device for recognition. We never save recordings."
              },
              {
                icon: "📝",
                title: "Optional history",
                desc: "Save cleaned text only if you turn history on. Delete anytime."
              },
              {
                icon: "☁️",
                title: "Secure accounts",
                desc: "Sign in with Clerk. Your profile and preferences live in an encrypted database."
              }
            ].map((card) => (
              <article key={card.title} className="bento-card glass">
                <div className="bento-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 6 — Use anywhere bento */}
        <section id="apps" className="wrap use-bento">
          <span className="section-label">Everywhere</span>
          <h2 className="section-title">One keyboard, every app</h2>
          <p className="section-desc">
            If it has a text field, HyperVoice works there.
          </p>
          <div className="bento" style={{ marginTop: 40 }}>
            <article className="bento-card glass span-6">
              <div className="bento-icon">💬</div>
              <h3>Messaging</h3>
              <p>WhatsApp, Messenger, Telegram, SMS — speak replies without switching apps.</p>
            </article>
            <article className="bento-card glass span-6">
              <div className="bento-icon">📧</div>
              <h3>Email & notes</h3>
              <p>Draft formal emails and long notes with AI polish built in.</p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">🔍</div>
              <h3>Search & forms</h3>
              <p>Fill forms and search boxes hands-free.</p>
            </article>
            <article className="bento-card glass span-4">
              <div className="bento-icon">🧪</div>
              <h3>Playground</h3>
              <p>Test cleanup and rewrite modes inside the app before you dictate.</p>
            </article>
            <article className="bento-card glass span-4 bento-highlight">
              <div className="bento-icon">🌍</div>
              <h3>Works worldwide</h3>
              <p>Cloud sync — use from any city once you install the APK.</p>
            </article>
          </div>
        </section>

        {/* 7 — Download CTA */}
        <section id="download" className="download-section wrap">
          <div className="cta-panel glass">
            <span className="section-label">Download</span>
            <h2>Ready to type with your voice?</h2>
            <p>
              Get the Android APK and join the HyperVoice beta. No Play Store required — install
              directly and start dictating in minutes.
            </p>
            <a href={APK_DOWNLOAD_URL} className="btn btn-primary" id="apk-download">
              <DownloadIcon />
              Download HyperVoice APK
            </a>
            <p className="cta-note">
              Android 8+ · Microphone permission required · Install from trusted sources
            </p>
          </div>
        </section>
      </main>

      <footer className="wrap">
        <p>© {new Date().getFullYear()} HyperVoice · AI voice keyboard for Android</p>
      </footer>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 3v12m0 0l4-4m-4 4L8 11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
    </svg>
  );
}
