import Image from "next/image";

const APK_DOWNLOAD_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/HyperVoice-release.apk";

const logoCloud = [
  { name: "OpenRouter", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openrouter.svg" },
  { name: "NVIDIA", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/nvidia.svg" },
  { name: "Meta", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/meta.svg" },
  { name: "Google", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/google.svg" },
  { name: "Vercel", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/vercel.svg" },
  { name: "Neon", src: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/neon.svg" },
  { name: "Android", src: "https://cdn.simpleicons.org/android/3DDC84" },
  { name: "GitHub", src: "https://cdn.simpleicons.org/github/181717" }
];

const features = [
  {
    title: "Removes filler words",
    body: "Automatically removes filler words like um, uh, like, and you know, making your transcriptions clear and professional.",
    before: "Um, what's the plan for today, um, like, just to confirm?",
    after: "What's the plan for today? Just to confirm.",
    color: "mint"
  },
  {
    title: "Removes repetition",
    body: "Detects repeated words and repeated thoughts in your speech, keeping the final sentence concise and easy to understand.",
    before: "I think we should maybe we should move it to tomorrow because today is kind of, kind of packed.",
    after: "I think we should move it to tomorrow because today is kind of packed.",
    color: "blue"
  },
  {
    title: "Auto-edits when you change your mind",
    body: "Recognizes mid-sentence corrections and keeps only your final intended message.",
    before: "How about we meet tomorrow at, um, 7 am? Oh, actually, let's do 3 pm.",
    after: "How about we meet tomorrow at 3 pm.",
    color: "gold"
  },
  {
    title: "Auto-formats",
    body: "Turns spoken lists, steps, phone numbers, and short messages into structured text that reads like you typed it carefully.",
    before: "Hi Anna my new phone number is 4081234567 thanks Jack",
    after: "Hi Anna,\n\nMy new phone number is (408) 123-4567.\n\nThanks,\nJack",
    color: "rose"
  },
  {
    title: "Translates as you speak",
    body: "Translate speech into your chosen language with phrasing that reads like a local would write it.",
    before: "Here's the product info, the price is 9 dollars, the size is 30, and we offer free returns.",
    after: "Aqui tienes la informacion del producto:\n\n1. El precio es de $9\n2. El tamano es 30\n3. Ofrecemos devoluciones gratuitas",
    color: "sand"
  }
];

export default function LandingPage() {
  return (
    <main className="page">
      <header className="site-header">
        <nav className="nav glass">
          <a href="#top" className="brand" aria-label="HyperVoice home">
            <Image src="/logo.png" alt="" width={38} height={38} priority />
            <span>HyperVoice</span>
          </a>
          <div className="nav-links" aria-label="Primary navigation">
            <a href="#speed">Speed</a>
            <a href="#features">AI editing</a>
            <a href="#voice">Voice</a>
            <a href="#download">Download</a>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark">
            Download APK
          </a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="dither-bg" aria-hidden />
        <div className="hero-inner section-shell">
          <div className="hero-copy">
            <p className="eyebrow">Android AI voice keyboard</p>
            <h1>
              Type 4x faster
              <span>with your voice.</span>
            </h1>
            <p className="hero-text">
              HyperVoice turns natural speech into clean messages, questions, lists, translations,
              and polished replies inside every Android text box.
            </p>
            <div className="hero-actions">
              <a href={APK_DOWNLOAD_URL} className="btn btn-dark">Download HyperVoice</a>
              <a href="#features" className="btn btn-light">See AI cleanup</a>
            </div>
            <div className="hero-proof">
              <span>220 WPM dictation</span>
              <span>23 languages</span>
              <span>No Play Store needed</span>
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      <section className="logo-section section-shell" aria-label="Works with popular apps">
        <p className="section-kicker">Powered by modern production tools</p>
        <div className="logo-cloud">
          {logoCloud.map((item) => (
            <span key={item.name}>
              <img src={item.src} alt="" />
              {item.name}
            </span>
          ))}
        </div>
        <p className="logo-note">
          AI and infrastructure logos use the Lobe Icons static CDN; Android and GitHub use public Simple Icons fallbacks.
        </p>
      </section>

      <section id="speed" className="speed-section section-shell">
        <div className="speed-card qwerty-card">
          <div className="speed-head">
            <strong>QWERTY keyboard</strong>
            <span><b>45</b> wpm</span>
          </div>
          <div className="small-note">You speak faster than you type</div>
          <div className="tiny-keyboard" aria-hidden>
            {Array.from({ length: 24 }).map((_, index) => <i key={index} />)}
          </div>
        </div>
        <div className="speed-card voice-card">
          <div className="speed-head">
            <strong>HyperVoice voice keyboard</strong>
            <span><b>220</b> wpm</span>
            <strong>Save</strong>
            <span><b>1 day</b> / week</span>
          </div>
          <div className="speed-message">
            You speak faster than you type. You think faster when you speak. HyperVoice removes the friction so your thoughts flow freely.
          </div>
          <div className="pill-recorder" aria-hidden>
            {Array.from({ length: 11 }).map((_, index) => <i key={index} />)}
          </div>
        </div>
      </section>

      <section id="features" className="feature-list">
        {features.map((feature) => (
          <article key={feature.title} className="feature-row section-shell">
            <div className="feature-copy">
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </div>
            <div className={`feature-demo ${feature.color}`}>
              <div className="bubble before">
                <VoiceGlyph />
                <p>{feature.before}</p>
              </div>
              <div className="bubble after">
                <p>{feature.after}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section id="voice" className="voice-section section-shell">
        <div>
          <p className="section-kicker">Live voice waves</p>
          <h2>Tap the mic. Watch speech become finished text.</h2>
          <p>
            While you speak, HyperVoice shows active voice waves, streams partial text, then uses
            OpenRouter AI to remove filler words, fix punctuation, and format the final message.
          </p>
        </div>
        <div className="large-wave" aria-hidden>
          {Array.from({ length: 46 }).map((_, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.035}s` }} />
          ))}
        </div>
      </section>

      <section className="iphone-section section-shell">
        <div className="iphone-copy">
          <p className="section-kicker">Keyboard-first UX</p>
          <h2>A normal-size keyboard with AI inside.</h2>
          <p>
            The Android keyboard now stays closer to Gboard height on common phones, scales with the
            screen, supports long-press delete, and includes 23 speech languages.
          </p>
        </div>
        <div className="iphone-frame" aria-label="Phone preview with keyboard">
          <div className="phone-doc">
            <strong>Goals & Success Metrics</strong>
            <p>Enable users to manage work faster with short voice sessions.</p>
            <ul>
              <li>DAU above 25% of total installs</li>
              <li>At least 3 sessions per active user</li>
              <li>Questions and exclamations auto-punctuated</li>
            </ul>
          </div>
          <div className="phone-input">Message</div>
          <div className="voice-pad">
            <div className="round-mic"><VoiceGlyph /></div>
          </div>
          <div className="keyboard-large">
            {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((key) => <span key={key}>{key}</span>)}
            <button>123</button><button>EN</button><button>Return</button>
          </div>
        </div>
      </section>

      <section id="download" className="download section-shell">
        <div className="download-panel glass">
          <Image src="/logo.png" alt="" width={68} height={68} />
          <div>
            <p className="section-kicker">Production-ready sharing</p>
            <h2>Deploy the API, share the APK, and anyone can use it.</h2>
            <p>
              Users do not need your Wi-Fi. They install the shared APK, sign in, enable the
              keyboard, and HyperVoice talks to your public Vercel backend.
            </p>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark">Download APK</a>
        </div>
      </section>

      <footer className="footer">
        <div className="section-shell footer-inner">
          <span>AI voice keyboard for Android</span>
          <span>Built with OpenRouter cleanup and cloud sync.</span>
        </div>
        <strong>HYPERVOICE</strong>
      </footer>
    </main>
  );
}

function PhoneMock() {
  return (
    <div className="phone-mock glass" aria-label="HyperVoice keyboard preview">
      <div className="phone-status"><span>9:41</span><span>5G 100%</span></div>
      <div className="chat-area">
        <div className="chat-title">HyperVoice</div>
        <div className="message sent">Can you format this as a client update?</div>
        <div className="message received">Absolutely. Tap mic and speak naturally.</div>
        <div className="voice-chip">
          <VoiceGlyph />
          <span>Listening...</span>
        </div>
      </div>
      <div className="keyboard-ui">
        <div className="keyboard-top">
          <strong>HyperVoice</strong>
          <span><VoiceGlyph /> EN</span>
        </div>
        <div className="keyboard-keys">
          {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((key) => <i key={key}>{key}</i>)}
          <button>123</button><button>EN</button><button>Enter</button>
        </div>
      </div>
    </div>
  );
}

function VoiceGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M5 15v-4M9 18V8M13 21V5M17 18V8M21 15v-4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
