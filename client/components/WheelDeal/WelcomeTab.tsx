type WelcomeTabProps = {
  onNavigate: (tab: string) => void;
};

export default function WelcomeTab({ onNavigate }: WelcomeTabProps) {
  return (
    <div className="space-y-5">
      {/* ─── HERO BANNER ─── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.15),transparent_60%)]" />
        <div className="relative">
          <div className="text-4xl mb-2">🎰</div>
          <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
            Welcome to Wheel & Deal
          </h1>
          <p className="text-sm text-white/70 mb-4 max-w-md mx-auto">
            Spin. Pitch. Get scored. Build the product fluency to talk about Amplitude anywhere, anytime — no slides, no script.
          </p>
          <button
            onClick={() => onNavigate("wheel")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/25 hover:scale-105 transition-transform"
          >
            🎡 Start Spinning
          </button>
        </div>
      </div>

      {/* ─── HOW TO PLAY (3 Steps) ─── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🕹️</span> How to Play
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              step: 1,
              emoji: "📖",
              title: "Study",
              color: "from-blue-500/20 to-blue-600/10",
              border: "border-blue-500/30",
              text: "Spin the wheel, land on a product, and get 30 seconds to peek at the cheat sheet. Cram like it's finals week.",
            },
            {
              step: 2,
              emoji: "✍️",
              title: "Pitch",
              color: "from-purple-500/20 to-purple-600/10",
              border: "border-purple-500/30",
              text: "2 minutes on the clock. Write your pitch — no copy-paste, no AI. Your words, your voice, your story. Minimum 25 words to submit.",
            },
            {
              step: 3,
              emoji: "⭐",
              title: "Get Scored",
              color: "from-amber-500/20 to-amber-600/10",
              border: "border-amber-500/30",
              text: "Rate yourself, then get AI Coach feedback instantly. In multiplayer, a peer coach scores you too. Total score out of /15.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`relative rounded-lg p-4 border ${item.border} bg-gradient-to-br ${item.color}`}
            >
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black shadow-md">
                {item.step}
              </div>
              <div className="text-2xl mb-2 mt-1">{item.emoji}</div>
              <div className="text-sm font-bold text-foreground mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground leading-snug">{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TWO WAYS TO PLAY ─── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🎮</span> Two Ways to Play
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-sm font-bold text-foreground mb-2">Solo Mode</div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">▸</span>
                <span>Type your pitch in a text box (no copy-paste!)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">▸</span>
                <span>AI Coach scores you instantly on 4 categories</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">▸</span>
                <span>Get 5 personalized coaching tips</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">▸</span>
                <span>Practice anytime — no partner needed</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-4">
            <div className="text-lg mb-1">👥</div>
            <div className="text-sm font-bold text-foreground mb-2">Multiplayer Mode</div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>Present your pitch verbally to a coach</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>Coach rates you live on the same rubric</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>Real-time feedback from a human perspective</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-violet-500 mt-0.5">▸</span>
                <span>Great for team sessions & practice pairs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── THE TIMER ─── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">⏱️</span> The Timer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xs font-bold text-foreground">30 sec</div>
            <div className="text-[11px] text-muted-foreground">Study phase — peek the cheat sheet</div>
          </div>
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <div className="text-2xl mb-1">✍️</div>
            <div className="text-xs font-bold text-foreground">2 min</div>
            <div className="text-[11px] text-muted-foreground">Pitch phase — write your answer</div>
          </div>
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs font-bold text-foreground">25 words</div>
            <div className="text-[11px] text-muted-foreground">Minimum to submit your pitch</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/25 p-3">
          <div className="text-xs text-foreground">
            <span className="font-bold">⏰ Time's up?</span>{" "}
            <span className="text-muted-foreground">
              If you have 25+ words when the timer hits zero, your pitch auto-submits. If you're under 25 words, you'll see a "Time's Up!" banner — finish your thought and submit when ready. Either way, completion score = 1 (see below).
            </span>
          </div>
        </div>
      </div>

      {/* ─── HOW YOU'RE SCORED ─── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-extrabold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🏆</span> How You're Scored
        </h2>

        {/* Scoring categories */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {[
            { emoji: "💬", name: "Clarity", desc: "Clear & easy to follow" },
            { emoji: "🗣️", name: "Tone", desc: "Natural & conversational" },
            { emoji: "🎓", name: "Credibility", desc: "Knows the product" },
            { emoji: "🤝", name: "Close", desc: "Ends with a next step" },
            { emoji: "⚡", name: "Completion", desc: "Submitted on time" },
          ].map((cat) => (
            <div key={cat.name} className="rounded-lg bg-background border border-border p-2.5 text-center">
              <div className="text-lg">{cat.emoji}</div>
              <div className="text-[11px] font-bold text-foreground mt-0.5">{cat.name}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{cat.desc}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-foreground/10 text-foreground font-bold text-[10px]">1-3 scale</span>
            <span className="text-muted-foreground">Each category scored 1 (needs work) to 3 (nailed it)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-bold text-[10px]">/15 total</span>
            <span className="text-muted-foreground">5 categories × 3 points max = 15 possible</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold text-[10px]">AUTO</span>
            <span className="text-muted-foreground">Completion is auto-scored: 3 = 30+ sec left, 2 = under 30 sec, 1 = timer ran out</span>
          </div>
        </div>

        {/* Three scorer types */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-blue-500/25 bg-blue-500/5 p-3">
            <div className="text-xs font-bold text-foreground mb-1">🪞 Self-Eval</div>
            <div className="text-[11px] text-muted-foreground leading-snug">
              You rate yourself on 4 categories after pitching. Completion is auto-filled — you can't change it. Be honest! The AI will keep you accountable.
            </div>
          </div>
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
            <div className="text-xs font-bold text-foreground mb-1">🤖 AI Coach</div>
            <div className="text-[11px] text-muted-foreground leading-snug">
              In Solo mode, AI reads your typed pitch and scores all 4 categories + gives 5 coaching tips. Your Completion score is shared with the AI total.
            </div>
          </div>
          <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-3">
            <div className="text-xs font-bold text-foreground mb-1">👥 Peer Coach</div>
            <div className="text-[11px] text-muted-foreground leading-snug">
              In Multiplayer, your coach scores you on the same 4 categories after hearing your verbal pitch. Their score shows up as "Coach Eval" on the leaderboard.
            </div>
          </div>
        </div>
      </div>

      {/* ─── EXPLORE THE TABS ─── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">🗺️</span> Explore the Tabs
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate("cheatsheet")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">📝 Cheat Sheets</div>
            <div className="text-xs text-muted-foreground">Your pre-game playbook. Pick a product and study pitch angles, objection pivots, and killer follow-up questions.</div>
          </button>
          <button
            onClick={() => onNavigate("wheel")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">🎡 Spin the Wheel</div>
            <div className="text-xs text-muted-foreground">The main event! Spin, get a random challenge, and prove you can pitch any product on the spot.</div>
          </button>
          <button
            onClick={() => onNavigate("leaderboard")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">🏆 Leaderboard</div>
            <div className="text-xs text-muted-foreground">Who's grinding the most reps? See total spins, average scores, and how you stack up against the team.</div>
          </button>
          <button
            onClick={() => onNavigate("analytics")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">📊 Analytics</div>
            <div className="text-xs text-muted-foreground">Manager HQ — team practice patterns, product coverage gaps, and engagement trends at a glance.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
