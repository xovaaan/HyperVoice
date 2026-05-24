import Image from "next/image";

const APK_DOWNLOAD_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/HyperVoice-release.apk";

const apps = [
  "WhatsApp",
  "Messenger",
  "Telegram",
  "Gmail",
  "Notes",
  "Chrome",
  "Instagram",
  "Facebook",
  "Docs",
  "Forms",
  "Search",
  "SMS"
];

const features = [
  {
    eyebrow: "Dictate",
    title: "Speak naturally. HyperVoice cleans the sentence.",
    body: "Filler words, repetitions, loose grammar, and half-finished phrasing become polished text before it lands in the field.",
    points: ["Removes filler words", "Formats messages", "Works in English, Bangla, and Hindi"]
  },
  {
    eyebrow: "Rewrite",
    title: "Change tone without leaving the app.",
    body: "Turn a raw thought into a professional email, a casual reply, a shorter note, or a clean bullet list.",
    points: ["Professional", "Casual", "Shorter", "Email-ready"]
  },
  {
    eyebrow: "Personal",
    title: "Teach it the words that matter to you.",
    body: "Names, brands, local phrases, and repeated terms stay accurate with a personal dictionary tied to your account.",
    points: ["Custom dictionary", "Cloud settings", "Optional history"]
  }
];

const testimonials = [
  {
    quote: "I can reply faster in Bangla and English without fighting autocorrect.",
    name: "Beta user",
    role: "Android tester"
  },
  {
    quote: "The keyboard feels like dictation plus an editor sitting inside every chat app.",
    name: "Early adopter",
    role: "Creator"
  },
  {
    quote: "Installing the APK was simple, and the cloud API means it works away from my Wi-Fi.",
    name: "Remote tester",
    role: "Power user"
  }
];

export default function LandingPage() {
  return (
    <main className="page">
      <div className="ambient-grid" aria-hidden />

      <header className="site-header">
        <nav className="nav glass">
          <a href="#top" className="brand" aria-label="HyperVoice home">
            <Image src="/logo.png" alt="" width={40} height={40} priority />
            <span>HyperVoice</span>
          </a>
          <div className="nav-links" aria-label="Primary navigation">
            <a href="#everywhere">Everywhere</a>
            <a href="#features">Features</a>
            <a href="#privacy">Privacy</a>
            <a href="#download">Download</a>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark nav-cta">
            <DownloadIcon />
            APK
          </a>
        </nav>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <div className="pill">
            <span className="live-dot" />
            Android AI voice keyboard
          </div>
          <h1>
            Speak,
            <span>don&apos;t type</span>
          </h1>
          <p>
            HyperVoice turns natural speech into clean messages, emails, and notes across the
            Android apps you already use. Built for English, Bangla, and Hindi.
          </p>
          <div className="hero-actions">
            <a href={APK_DOWNLOAD_URL} className="btn btn-dark">
              <DownloadIcon />
              Download APK
            </a>
            <a href="#features" className="btn btn-glass">
              See features
            </a>
          </div>
          <div className="trust-row" aria-label="Product highlights">
            <span>No Play Store required</span>
            <span>Public HTTPS backend</span>
            <span>Android 8+</span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="HyperVoice product preview">
          <div className="speed-card qwerty">
            <span>QWERTY typing</span>
            <strong>45 wpm</strong>
            <div className="speed-line">
              <i />
            </div>
          </div>
          <div className="phone glass">
            <div className="phone-top">
              <Image src="/logo.png" alt="" width={38} height={38} />
              <div>
                <span>HyperVoice</span>
                <small>Voice mode active</small>
              </div>
            </div>
            <div className="dictation-panel">
              <div className="wave" aria-hidden>
                {Array.from({ length: 18 }).map((_, index) => (
                  <span key={index} style={{ animationDelay: `${index * 0.06}s` }} />
                ))}
              </div>
              <p className="spoken">Hey, make this sound more professional...</p>
              <p className="cleaned">
                Thank you for the update. I&apos;ll review everything today and send a polished
                response shortly.
              </p>
            </div>
            <div className="keyboard-preview" aria-hidden>
              {["Q", "W", "E", "R", "T", "Y", "U", "I", "O"].map((key) => (
                <span key={key}>{key}</span>
              ))}
              <button>mic</button>
            </div>
          </div>
          <div className="speed-card voice">
            <span>HyperVoice dictation</span>
            <strong>130 wpm</strong>
            <div className="speed-line">
              <i />
            </div>
          </div>
        </div>
      </section>

      <section id="everywhere" className="section-shell logo-section">
        <div className="section-kicker">Works everywhere you write</div>
        <h2>One keyboard for every text box.</h2>
        <div className="app-marquee" aria-label="Supported app examples">
          <div className="app-track">
            {[...apps, ...apps].map((app, index) => (
              <span key={`${app}-${index}`}>{app}</span>
            ))}
          </div>
        </div>
        <div className="platform-tabs" aria-label="Platform availability">
          <span className="active">Android</span>
          <span>APK beta</span>
          <span>Cloud sync</span>
          <span>Any city</span>
        </div>
      </section>

      <section id="features" className="feature-stack">
        {features.map((feature, index) => (
          <article key={feature.title} className="feature-row section-shell">
            <div className="feature-copy">
              <div className="section-kicker">{feature.eyebrow}</div>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
              <div className="chip-row">
                {feature.points.map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </div>
            </div>
            <div className="feature-visual glass">
              <div className={`mini-demo mini-demo-${index + 1}`}>
                <div className="demo-header">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="demo-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="demo-result">
                  <strong>{feature.eyebrow}</strong>
                  <p>{feature.points[0]}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section id="privacy" className="privacy section-shell">
        <div>
          <div className="section-kicker">Private by design</div>
          <h2>Your voice stays on your phone.</h2>
          <p>
            HyperVoice sends text to the API for cleanup. Audio is not stored on our server, and
            history can be turned off from the app.
          </p>
        </div>
        <div className="privacy-grid">
          <div className="glass">
            <ShieldIcon />
            <strong>Audio not stored</strong>
            <span>Only text is processed for cleanup.</span>
          </div>
          <div className="glass">
            <CloudIcon />
            <strong>HTTPS API</strong>
            <span>Production APKs use your public Vercel backend.</span>
          </div>
          <div className="glass">
            <UserIcon />
            <strong>User settings</strong>
            <span>Dictionary, tone, and history preferences sync securely.</span>
          </div>
        </div>
      </section>

      <section className="section-shell love-section">
        <div className="section-kicker">Early feedback</div>
        <h2>Built for people who reply all day.</h2>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <figure key={item.quote} className="glass testimonial">
              <blockquote>&quot;{item.quote}&quot;</blockquote>
              <figcaption>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="download" className="download section-shell">
        <div className="download-panel glass">
          <Image src="/logo.png" alt="" width={72} height={72} />
          <div>
            <div className="section-kicker">Download beta</div>
            <h2>Free yourself from the keyboard.</h2>
            <p>
              Share the APK link with anyone. They install HyperVoice, sign in, enable the keyboard,
              and use it from anywhere with internet access.
            </p>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark">
            <DownloadIcon />
            Download HyperVoice APK
          </a>
        </div>
      </section>

      <footer className="footer section-shell">
        <span>HyperVoice</span>
        <span>AI voice keyboard for Android</span>
      </footer>
    </main>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3 5 6v5c0 4.7 2.8 8.4 7 10 4.2-1.6 7-5.3 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.2-1.8A5 5 0 0 0 7 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
