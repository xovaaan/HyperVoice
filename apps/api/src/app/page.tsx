import Image from "next/image";

const APK_DOWNLOAD_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/HyperVoice-release.apk";

const appLogos = [
  ["Facebook", "https://cdn.simpleicons.org/facebook/0866FF"],
  ["Instagram", "https://cdn.simpleicons.org/instagram/E4405F"],
  ["Messenger", "https://cdn.simpleicons.org/messenger/0866FF"],
  ["WhatsApp", "https://cdn.simpleicons.org/whatsapp/25D366"],
  ["Telegram", "https://cdn.simpleicons.org/telegram/26A5E4"],
  ["Gmail", "https://cdn.simpleicons.org/gmail/EA4335"],
  ["Outlook", "https://www.google.com/s2/favicons?domain=outlook.live.com&sz=64"],
  ["Slack", "https://www.google.com/s2/favicons?domain=slack.com&sz=64"],
  ["Discord", "https://www.google.com/s2/favicons?domain=discord.com&sz=64"],
  ["LinkedIn", "https://www.google.com/s2/favicons?domain=linkedin.com&sz=64"],
  ["X", "https://cdn.simpleicons.org/x/111111"],
  ["Reddit", "https://cdn.simpleicons.org/reddit/FF4500"],
  ["Notion", "https://cdn.simpleicons.org/notion/111111"],
  ["Google Docs", "https://cdn.simpleicons.org/googledocs/4285F4"],
  ["Google Keep", "https://cdn.simpleicons.org/googlekeep/FFBB00"],
  ["Evernote", "https://cdn.simpleicons.org/evernote/00A82D"],
  ["Trello", "https://cdn.simpleicons.org/trello/0052CC"],
  ["Asana", "https://cdn.simpleicons.org/asana/F06A6A"],
  ["Jira", "https://cdn.simpleicons.org/jira/0052CC"],
  ["Linear", "https://cdn.simpleicons.org/linear/5E6AD2"],
  ["ChatGPT", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg"],
  ["Claude", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/claude.svg"],
  ["Gemini", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/gemini.svg"],
  ["Perplexity", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/perplexity.svg"],
  ["Google Chrome", "https://cdn.simpleicons.org/googlechrome/4285F4"],
  ["Microsoft Edge", "https://www.google.com/s2/favicons?domain=microsoftedge.com&sz=64"],
  ["Shopify", "https://cdn.simpleicons.org/shopify/7AB55C"],
  ["WordPress", "https://cdn.simpleicons.org/wordpress/21759B"],
  ["YouTube", "https://cdn.simpleicons.org/youtube/FF0000"],
  ["TikTok", "https://cdn.simpleicons.org/tiktok/111111"],
  ["Snapchat", "https://cdn.simpleicons.org/snapchat/FFFC00"],
  ["GitHub", "https://cdn.simpleicons.org/github/181717"],
  ["Lovable", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/lovable.svg"],
  ["Cursor", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/cursor.svg"],
  ["Windsurf", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/windsurf.svg"],
  ["Codex", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg"],
  ["DeepSeek", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/deepseek.svg"],
  ["Manus", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/manus.svg"],
  ["Vercel", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/vercel.svg"],
  ["Neon", "https://cdn.simpleicons.org/neon/00E599"],
  ["Android", "https://cdn.simpleicons.org/android/3DDC84"],
  ["OpenRouter", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openrouter.svg"]
];

const modelLogos = [
  ["Whisper V3 Turbo", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg", "Fast multilingual speech recognition"],
  ["NVIDIA Nemotron", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/nvidia.svg", "High quality cleanup and rewriting"],
  ["Llama 3.3", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/meta.svg", "Reliable fallback editing model"],
  ["OpenRouter", "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openrouter.svg", "One API for model routing"]
];

const languageNames = [
  "English", "Bangla", "Hindi", "Spanish", "French", "German", "Italian", "Portuguese", "Arabic", "Chinese",
  "Japanese", "Korean", "Russian", "Turkish", "Indonesian", "Malay", "Thai", "Vietnamese", "Urdu", "Tamil",
  "Telugu", "Marathi", "Dutch", "Polish", "Ukrainian", "Greek", "Hebrew", "Persian", "Swedish", "Norwegian",
  "Danish", "Finnish", "Czech", "Romanian", "Hungarian", "Bulgarian", "Croatian", "Serbian", "Slovak", "Slovenian",
  "Lithuanian", "Latvian", "Estonian", "Filipino", "Swahili", "Afrikaans", "Albanian", "Amharic", "Armenian", "Azerbaijani",
  "Basque", "Belarusian", "Bosnian", "Burmese", "Catalan", "Cebuano", "Chichewa", "Corsican", "Esperanto", "Frisian",
  "Galician", "Georgian", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hmong", "Icelandic", "Igbo", "Irish",
  "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Kurdish", "Kyrgyz", "Lao", "Latin", "Luxembourgish",
  "Macedonian", "Malagasy", "Malayalam", "Maltese", "Maori", "Mongolian", "Nepali", "Odia", "Pashto", "Punjabi",
  "Samoan", "Scots Gaelic", "Sesotho", "Shona", "Sindhi", "Sinhala", "Somali", "Sundanese", "Tajik", "Uzbek",
  "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

const languageCountries = [
  "US", "BD", "IN", "ES", "FR", "DE", "IT", "BR", "SA", "CN",
  "JP", "KR", "RU", "TR", "ID", "MY", "TH", "VN", "PK", "IN",
  "IN", "IN", "NL", "PL", "UA", "GR", "IL", "IR", "SE", "NO",
  "DK", "FI", "CZ", "RO", "HU", "BG", "HR", "RS", "SK", "SI",
  "LT", "LV", "EE", "PH", "TZ", "ZA", "AL", "ET", "AM", "AZ",
  "ES", "BY", "BA", "MM", "ES", "PH", "MW", "FR", "001", "NL",
  "ES", "GE", "IN", "HT", "NG", "US", "CN", "IS", "NG", "IE",
  "ID", "IN", "KZ", "KH", "RW", "IQ", "KG", "LA", "VA", "LU",
  "MK", "MG", "IN", "MT", "NZ", "MN", "NP", "IN", "AF", "IN",
  "WS", "GB", "LS", "ZW", "PK", "LK", "SO", "ID", "TJ", "UZ",
  "GB", "ZA", "IL", "NG", "ZA"
];

const languages = languageNames.map((name, index) => ({
  name,
  country: languageCountries[index] ?? "US"
}));

const cleanupFeatures = [
  {
    title: "Cuts the noisy bits",
    body: "HyperVoice trims hesitation, repeated starts, and accidental side comments before the text appears.",
    before: "Okay so, I need the report by, wait, not report, the launch notes by Friday morning please.",
    after: "I need the launch notes by Friday morning, please.",
    color: "mint"
  },
  {
    title: "Understands questions",
    body: "When your voice sounds like a question, the final text lands with the right punctuation and wording.",
    before: "Can you check if the invoice has been approved",
    after: "Can you check if the invoice has been approved?",
    color: "blue"
  },
  {
    title: "Tidies changing thoughts",
    body: "If you correct yourself mid-sentence, HyperVoice keeps the final idea instead of the whole spoken trail.",
    before: "Book it for Thursday afternoon, actually make it Friday after lunch.",
    after: "Book it for Friday after lunch.",
    color: "gold"
  },
  {
    title: "Builds clean formats",
    body: "Notes, lists, emails, and updates can become structured text without opening another editor.",
    before: "Client update blockers design files pending next step send revised deck tomorrow",
    after: "Client update:\n\n- Blocker: design files pending\n- Next step: send revised deck tomorrow",
    color: "rose"
  }
];

const useCases = [
  ["Creators", "Draft captions, replies, hooks, and comments without tapping out every sentence."],
  ["Students", "Capture study notes, questions, and summaries while your thoughts are still fresh."],
  ["Sales teams", "Send polished follow-ups, CRM notes, and client messages between calls."],
  ["Founders", "Move from idea to message, email, task, or AI prompt while walking or commuting."],
  ["Support agents", "Answer common customer questions faster with cleaner tone and fewer typos."],
  ["Multilingual users", "Speak in one language and prepare a clean message in another."]
];

const faqs = [
  ["Do users need the same Wi-Fi?", "No. The APK talks to your public Vercel API, so users can use HyperVoice from any city with internet."],
  ["Is this a Play Store app?", "No. You can distribute the APK directly from your landing page or GitHub release."],
  ["Does it store audio?", "The app is designed around text cleanup. Audio is not saved by the landing page or API history."],
  ["Can it work inside any app?", "Yes. Once the Android keyboard is enabled, it can type into normal text fields across apps."],
  ["What powers the AI?", "The backend uses OpenRouter model routing, with speech and editing experiences presented around latest model workflows."],
  ["Can pricing change later?", "Yes. These tiers are landing-page packaging and can be connected to billing when you are ready."]
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
          <div className="nav-links">
            <a href="#anywhere">Use Anywhere</a>
            <a href="#languages">Languages</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark nav-download">APK</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="dither-bg" aria-hidden />
        <div className="hero-inner section-shell">
          <p className="eyebrow">AI keyboard for people who think out loud</p>
          <h1>
            Turn speech into polished text
            <span>before your thumb catches up.</span>
          </h1>
          <p className="hero-text">
            HyperVoice is an Android voice keyboard that drafts, cleans, translates, formats, and
            sends text anywhere you can type.
          </p>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark hero-download">Download HyperVoice APK</a>
          <div className="hero-proof">
            <span>Voice-first writing</span>
            <span>OpenRouter AI cleanup</span>
            <span>Direct APK install</span>
          </div>
          <HeroPhone />
        </div>
      </section>

      <section id="anywhere" className="marquee-section">
        <div className="section-heading section-shell">
          <p className="section-kicker">Use Anywhere</p>
          <h2>One keyboard. Your daily apps.</h2>
          <p>Chat, email, notes, AI tools, social posts, tasks, documents, and support replies all get the same voice-powered typing layer.</p>
        </div>
        <LogoMarquee direction="left" />
        <LogoMarquee direction="right" />
      </section>

      <section className="bento section-shell">
        <div className="bento-large">
          <p className="section-kicker">Speed without rough edges</p>
          <h2>Say it once. Ship the cleaned version.</h2>
          <p>HyperVoice removes the cleanup work that normally comes after dictation.</p>
          <div className="metric-row">
            <span><b>4x</b> faster drafting</span>
            <span><b>0</b> app switching</span>
            <span><b>1</b> keyboard</span>
          </div>
        </div>
        <div className="bento-card">
          <VoiceGlyph />
          <h3>Question-aware</h3>
          <p>Speech that asks something becomes a question, not a flat sentence.</p>
        </div>
        <div className="bento-card dark">
          <h3>Tap mic</h3>
          <div className="mini-wave">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
          <p>Animated waves show active listening while text is being prepared.</p>
        </div>
      </section>

      <section className="analytics-section section-shell">
        <div className="section-heading">
          <p className="section-kicker">Analytics</p>
          <h2>Know how much faster your voice is getting.</h2>
          <p>HyperVoice turns saved dictation history into simple momentum metrics for speed, volume, consistency, and time saved.</p>
        </div>
        <div className="analytics-bento">
          <div className="analytics-card primary">
            <span>Average speed</span>
            <strong>184 WPM</strong>
            <p>Voice sessions trend faster than normal mobile typing.</p>
          </div>
          <div className="analytics-card">
            <span>Words captured</span>
            <strong>12.8k</strong>
          </div>
          <div className="analytics-card">
            <span>Characters typed</span>
            <strong>64k</strong>
          </div>
          <div className="analytics-card">
            <span>Current streak</span>
            <strong>9 days</strong>
          </div>
          <div className="analytics-wave" aria-hidden>
            {Array.from({ length: 58 }).map((_, index) => <i key={index} />)}
          </div>
        </div>
      </section>

      <section id="features" className="feature-list">
        <div className="section-heading section-shell">
          <p className="section-kicker">AI cleanup</p>
          <h2>Different examples, same useful magic.</h2>
        </div>
        {cleanupFeatures.map((feature) => (
          <article key={feature.title} className="feature-row section-shell">
            <div className="feature-copy">
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </div>
            <div className={`feature-demo ${feature.color}`}>
              <div className="bubble before"><VoiceGlyph /><p>{feature.before}</p></div>
              <div className="bubble after"><p>{feature.after}</p></div>
            </div>
          </article>
        ))}
      </section>

      <section id="languages" className="languages section-shell">
        <div className="section-heading">
          <p className="section-kicker">100+ languages</p>
          <h2>Speak globally, write naturally.</h2>
          <p>Designed as a multilingual keyboard experience for global teams, creators, students, and families.</p>
        </div>
        <div className="language-cloud">
          {languages.map((language) => (
            <span key={language.name}>
              <b>{flagFromCountry(language.country)}</b>
              {language.name}
            </span>
          ))}
        </div>
      </section>

      <section className="workflow-showcase ai-workflow section-shell">
        <div className="workflow-copy">
          <p className="section-kicker">Faster work with AI Apps</p>
          <h2>Speak better prompts into ChatGPT, Claude, Gemini, and more.</h2>
          <p>HyperVoice sits inside the keyboard, so long prompts become clean instructions before they reach your AI tools.</p>
        </div>
        <StraightPhone variant="ai" />
      </section>

      <section className="workflow-showcase email-workflow section-shell">
        <StraightPhone variant="email" />
        <div className="workflow-copy">
          <p className="section-kicker">Faster work with Email</p>
          <h2>Talk through an email and watch it format itself.</h2>
          <p>Speak a rough reply, and HyperVoice shapes it into a Gmail-ready message with structure, tone, and next steps.</p>
        </div>
      </section>

      <section className="speak-wave section-shell">
        <div>
          <p className="section-kicker">Ditch typing, Start speaking</p>
          <h2>Let your voice carry the first draft.</h2>
          <p>Tap the mic, talk naturally, and watch HyperVoice turn a rough thought into text that is ready for the app you are already using.</p>
        </div>
        <div className="gradient-wave" aria-hidden>
          {Array.from({ length: 64 }).map((_, index) => <i key={index} />)}
        </div>
      </section>

      <section className="model-section section-shell">
        <div className="section-heading">
          <p className="section-kicker">Powered By Latest Models</p>
          <h2>Speech and rewriting on a modern AI stack.</h2>
        </div>
        <div className="model-grid">
          {modelLogos.map(([name, src, body]) => (
            <div className="model-card glass" key={name}>
              <img src={src} alt="" />
              <h3>{name}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="iphone-3d section-shell">
        <div className="iphone-scene">
          <div className="iphone-device">
            <span className="side-button side-button-one" />
            <span className="side-button side-button-two" />
            <span className="camera-button" />
            <div className="iphone-screen">
              <div className="dynamic-island" />
              <div className="screen-title">Type 4x faster</div>
              <p className="type-line">Type 4x faster in any tools...</p>
              <div className="screen-wave">{Array.from({ length: 28 }).map((_, index) => <i key={index} />)}</div>
              <div className="screen-output">Use HyperVoice in AI apps, email, chat, docs, task tools, and anywhere Android lets you type.</div>
            </div>
          </div>
        </div>
        <div className="iphone-copy">
          <p className="section-kicker">Animated voice typing</p>
          <h2>Type 4x faster in any tools.</h2>
          <p>A floating phone, live wave motion, and typewriting effect show how HyperVoice moves from speech to useful text inside everyday apps.</p>
        </div>
      </section>

      <section className="streaks section-shell">
        <div className="streak-copy">
          <p className="section-kicker">Streaks</p>
          <h2>Build a daily speaking habit.</h2>
          <p>HyperVoice tracks active writing days from saved entries so users can see consistency, momentum, and progress over time.</p>
        </div>
        <div className="streak-card">
          <span>Current streak</span>
          <strong>7 days</strong>
          <div className="streak-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <i key={`${day}-${index}`}>{day}</i>)}
          </div>
        </div>
      </section>

      <section className="use-cases section-shell">
        <div className="section-heading">
          <p className="section-kicker">Use cases</p>
          <h2>Useful wherever words are work.</h2>
        </div>
        <div className="use-grid use-bento">
          {useCases.map(([title, body]) => (
            <div className="use-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing section-shell">
        <div className="section-heading">
          <p className="section-kicker">Pricing</p>
          <h2>Start free. Upgrade when teams ask for it.</h2>
        </div>
        <div className="pricing-grid">
          <PriceCard name="Free" price="$0" body="For early testers and personal APK installs." items={["AI cleanup trial", "Basic history", "Direct APK access"]} />
          <PriceCard name="Starter" price="$5/user" body="For people who write and reply all day." items={["More cleanup usage", "Translations", "Personal dictionary"]} />
          <PriceCard name="Pro" price="$10/user" body="For power users and small teams." items={["Priority AI models", "Team-ready settings", "Advanced formatting"]} featured />
          <PriceCard name="Custom" price="Custom" body="For organizations that need volume, support, or private deployment." items={["Custom limits", "Admin support", "Deployment help"]} />
        </div>
      </section>

      <section id="download" className="download section-shell">
        <div className="download-panel glass">
          <div className="download-icon-wrap">
            <Image src="/logo.png" alt="" width={82} height={82} />
          </div>
          <div className="download-copy">
            <p className="section-kicker">Install without the Play Store</p>
            <h2>Share the APK from this page.</h2>
            <p>Users install HyperVoice, enable the Android keyboard, sign in, and start writing with your live Vercel backend.</p>
          </div>
          <a href={APK_DOWNLOAD_URL} className="btn btn-dark download-big">Download APK</a>
        </div>
      </section>

      <section id="faq" className="faq section-shell">
        <div className="section-heading">
          <p className="section-kicker">FAQ</p>
          <h2>Questions before launch.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map(([q, a]) => (
            <div className="faq-item" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="section-shell footer-grid">
          <div>
            <Image src="/logo.png" alt="" width={44} height={44} />
            <p>HyperVoice turns spoken thoughts into ready-to-send text across Android.</p>
          </div>
          <div>
            <a href="#anywhere">Use Anywhere</a>
            <a href="#languages">Languages</a>
            <a href="#pricing">Pricing</a>
            <a href={APK_DOWNLOAD_URL}>Download APK</a>
            <a href="#terms">Terms and Conditions</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <strong>HYPERVOICE</strong>
      </footer>
    </main>
  );
}

function LogoMarquee({ direction }: { direction: "left" | "right" }) {
  const list = direction === "left" ? appLogos : [...appLogos].reverse();
  return (
    <div className="logo-marquee" aria-label="Popular apps">
      <div className={`logo-track ${direction}`}>
        {[...list, ...list].map(([name, src], index) => (
          <span key={`${name}-${index}`}>
            <img src={src} alt="" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroPhone() {
  return (
    <div className="hero-phone-wrap">
      <div className="hero-phone-image" aria-label="HyperVoice iPhone preview">
        <span className="side-button side-button-one" />
        <span className="side-button side-button-two" />
        <span className="side-button side-button-three" />
        <span className="camera-button" />
        <div className="hero-phone-screen">
          <div className="hero-notch">
            <i />
          </div>
          <div className="phone-status"><span>9:41</span><span>5G 100%</span></div>
          <div className="chat-area">
            <div className="chat-title">Project chat</div>
            <div className="message sent">Please make this update sound confident.</div>
            <div className="message received">Sure. Speak naturally and I will clean it.</div>
            <div className="voice-chip"><VoiceGlyph /><span>Listening...</span></div>
          </div>
          <div className="keyboard-ui">
            <div className="keyboard-top"><strong>HyperVoice</strong><span><VoiceGlyph /> EN</span></div>
            <div className="keyboard-keys">
              {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((key) => <i key={key}>{key}</i>)}
              <button>123</button><button>EN</button><button>Enter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StraightPhone({ variant }: { variant: "ai" | "email" }) {
  const isEmail = variant === "email";
  return (
    <div className="straight-phone" aria-label={isEmail ? "Gmail typing preview" : "AI prompt typing preview"}>
      <div className="straight-phone-screen">
        <div className="straight-island" />
        <div className="app-topbar">
          {isEmail ? (
            <>
              <img src="https://cdn.simpleicons.org/gmail/EA4335" alt="" />
              <span>Gmail</span>
            </>
          ) : (
            <>
              <img src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg" alt="" />
              <span>AI workspace</span>
            </>
          )}
        </div>
        <div className={isEmail ? "gmail-card" : "ai-card"}>
          {isEmail ? (
            <>
              <span>To: client@example.com</span>
              <strong>Subject: Quick update on the launch</strong>
              <p>Hi team,</p>
              <p>The APK is ready, the landing page is live, and I will share the release link today.</p>
              <p>Thanks,<br />HyperVoice</p>
            </>
          ) : (
            <>
              <span>Prompt</span>
              <strong>Create a dashboard for my shop</strong>
              <p>Include revenue, orders, product alerts, customer messages, and weekly growth cards.</p>
            </>
          )}
        </div>
        <div className="phone-keyboard">
          <div className="phone-keyboard-top">
            <strong>HyperVoice</strong>
            <span><VoiceGlyph /> EN</span>
          </div>
          <div className="keyboard-wave">
            {Array.from({ length: 20 }).map((_, index) => <i key={index} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ name, price, body, items, featured }: { name: string; price: string; body: string; items: string[]; featured?: boolean }) {
  return (
    <div className={`price-card ${featured ? "featured" : ""}`}>
      <span>{name}</span>
      <h3>{price}</h3>
      <p>{body}</p>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      <a href={APK_DOWNLOAD_URL} className="btn btn-light">{featured ? "Choose Pro" : "Get started"}</a>
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

function flagFromCountry(country: string) {
  if (country === "001") return String.fromCodePoint(0x1F310);
  return country
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
