type WelcomeTabProps = {
  onNavigate: (tab: string) => void;
};

export default function WelcomeTab({ onNavigate }: WelcomeTabProps) {
  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎡</span>
          <span className="text-base font-bold text-foreground">Welcome to Wheel & Deal</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
          This is a speaking exercise, not a reading exercise. Spin the wheel, land on a product, and give a real 1–2 minute answer in your own words — like you're explaining it to someone at happy hour who just asked. No slides. No script. No feature dumps.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { icon: "🎯", title: "What it is", text: "A pitch practice tool built around a live product wheel. Spin, land on a product, talk about it out loud." },
            { icon: "💪", title: "Why it matters", text: "You won't always have prep time. This builds the fluency to talk about Amplitude naturally — anywhere, anytime." },
            { icon: "🔄", title: "How to use it", text: "Spin the wheel. Get a challenge. Try your answer out loud first — then use the cheat sheet as a coach, not a script." },
            { icon: "✅", title: "What good looks like", text: "A clear story, a natural close, and a reason for them to want to hear more. Not a feature list — a conversation." },
          ].map((item, i) => (
            <div key={i} className="bg-background rounded-lg p-3 border border-border">
              <div className="text-xs font-bold text-foreground mb-1">{item.icon} {item.title}</div>
              <div className="text-xs text-muted-foreground leading-snug">{item.text}</div>
            </div>
          ))}
        </div>
        <div className="bg-background rounded-lg p-3 border" style={{ borderColor: "rgba(41,98,255,0.25)" }}>
          <span className="text-[11px] font-bold text-[#2962FF] uppercase tracking-wider">Expectations</span>
          <p className="text-xs text-muted-foreground leading-snug mt-1">You don't need a deck. You don't need to memorize the right answer. You need enough product fluency to tell a quick story, explain the value, and make someone want to hear more. Use the cheat sheets to get there — not to read from.</p>
        </div>
      </div>

      {/* How to use the app */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-bold text-foreground mb-3">Explore the Tabs</h2>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate("cheatsheet")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-[#2962FF]/40 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">📝 Cheat Sheets</div>
            <div className="text-xs text-muted-foreground">Pick a product and explore pitch angles, objection pivots, follow-up asks, and more. Your study guide before you spin.</div>
          </button>
          <button
            onClick={() => onNavigate("wheel")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-[#2962FF]/40 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">🎡 Spin the Wheel</div>
            <div className="text-xs text-muted-foreground">Spin to land on a random product and get a challenge — pitch it, handle an objection, or respond to a scenario. Practice out loud, then check the cheat sheet.</div>
          </button>
          <button
            onClick={() => onNavigate("leaderboard")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-[#2962FF]/40 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">🏆 Leaderboard</div>
            <div className="text-xs text-muted-foreground">See who's putting in the reps. Ranked by total spins — more practice = more fluency.</div>
          </button>
          <button
            onClick={() => onNavigate("analytics")}
            className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-[#2962FF]/40 transition-colors"
          >
            <div className="text-xs font-bold text-foreground mb-0.5">📊 Analytics</div>
            <div className="text-xs text-muted-foreground">Manager view — see team-wide practice patterns, product coverage, and engagement stats.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
