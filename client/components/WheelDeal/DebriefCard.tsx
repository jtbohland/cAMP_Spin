import { useState, useEffect, useRef } from "react";
import { executeApi } from "@/lib/executeApi.js";

type SelfScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
};

type DebriefCardProps = {
  spinId: number;
  selfScores: SelfScores | null;
  onDismiss: () => void;
};

type Rating = {
  id: number;
  raterName: string;
  clarity: number;
  conversational: number;
  credibility: number | null;
  close: number;
  createdAt: string;
};

const CATEGORIES = [
  { key: "clarity" as const, label: "Clarity" },
  { key: "conversational" as const, label: "Tone" },
  { key: "credibility" as const, label: "Credibility" },
  { key: "close" as const, label: "Close" },
];

function getCoachingPrompts(selfScores: SelfScores | null, coach: { clarity: number; conversational: number; credibility: number; close: number }): string[] {
  const prompts: string[] = [];
  const coachAvg = (coach.clarity + coach.conversational + coach.credibility + coach.close) / 4;
  const selfAvg = selfScores ? (selfScores.clarity + selfScores.conversational + selfScores.credibility + selfScores.close) / 4 : null;

  // Find the biggest gap categories
  if (selfScores) {
    const gaps = CATEGORIES.map((c) => ({
      label: c.label,
      selfVal: selfScores[c.key],
      coachVal: c.key === "credibility" ? coach.credibility : coach[c.key],
      diff: selfScores[c.key] - (c.key === "credibility" ? coach.credibility : coach[c.key]),
    }));

    const overconfident = gaps.filter((g) => g.diff >= 1).sort((a, b) => b.diff - a.diff);
    const underconfident = gaps.filter((g) => g.diff <= -1).sort((a, b) => a.diff - b.diff);

    for (const g of overconfident.slice(0, 1)) {
      prompts.push(`You rated your ${g.label} a ${g.selfVal} but your coach gave you a ${g.coachVal}. Ask them: "What specifically could I tighten up in ${g.label.toLowerCase()}?"`);
    }
    for (const g of underconfident.slice(0, 1)) {
      prompts.push(`Your coach rated your ${g.label} higher than you did (${g.coachVal} vs your ${g.selfVal}). You might be better than you think!`);
    }
  }

  if (coach.close <= 1) {
    prompts.push("Your coach rated your close low. Ask them: \"What would have made my ask feel more natural?\"");
  }
  if (coach.clarity <= 1 && !prompts.some((p) => p.includes("Clarity"))) {
    prompts.push("Clarity scored low. Try asking: \"Where exactly did I lose you?\"");
  }
  if (coach.conversational <= 1 && !prompts.some((p) => p.includes("Tone"))) {
    prompts.push("Tone felt scripted. Ask: \"What part felt like I was reading vs. talking?\"");
  }
  if (selfAvg !== null && selfAvg > coachAvg + 0.5 && !prompts.some((p) => p.includes("higher than you"))) {
    prompts.push("Overall you rated yourself higher than your coach did. Explore: \"What am I not seeing about my delivery?\"");
  }
  if (coachAvg >= 2.5 && (selfAvg === null || selfAvg >= 2)) {
    prompts.push("Strong scores across the board. What one thing would level it up from good to exceptional?");
  }
  if (prompts.length === 0) {
    prompts.push("Solid scores across the board. Discuss: what felt easiest and what took the most effort?");
  }
  return prompts.slice(0, 3);
}

export function DebriefCard({ spinId, selfScores, onDismiss }: DebriefCardProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRatings = async () => {
      try {
        const result = await executeApi("GetPeerRatings", { spinId });
        if (!cancelled && result && Array.isArray(result.ratings)) {
          setRatings(result.ratings);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    fetchRatings();
    intervalRef.current = setInterval(fetchRatings, 5000);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spinId]);

  if (ratings.length === 0) {
    return null;
  }

  const latest = ratings[0];
  const coachCredibility = latest.credibility ?? 2;
  const coachScores = { clarity: latest.clarity, conversational: latest.conversational, credibility: coachCredibility, close: latest.close };
  const coachAvg = ((coachScores.clarity + coachScores.conversational + coachScores.credibility + coachScores.close) / 4).toFixed(1);
  const selfAvg = selfScores
    ? ((selfScores.clarity + selfScores.conversational + selfScores.credibility + selfScores.close) / 4).toFixed(1)
    : null;

  const prompts = getCoachingPrompts(selfScores, coachScores);

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-lg mt-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Debrief</h3>
        <button onClick={onDismiss} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
      </div>

      {/* Overall averages — both on /3 scale now */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your Self-Score</p>
          <p className="text-2xl font-bold text-foreground">{selfAvg ?? "--"}<span className="text-sm text-muted-foreground">/3</span></p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Coach Avg</p>
          <p className="text-2xl font-bold text-primary">{coachAvg}<span className="text-sm text-muted-foreground">/3</span></p>
        </div>
      </div>

      {/* Per-category side-by-side comparison */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Coach: {latest.raterName}</p>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const selfVal = selfScores ? selfScores[cat.key] : null;
            const coachVal = coachScores[cat.key];
            const diff = selfVal !== null ? selfVal - coachVal : null;
            return (
              <div key={cat.key} className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground w-20">{cat.label}</span>
                {/* Self score */}
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground w-6 text-right">You</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                          selfVal !== null && n <= selfVal
                            ? "bg-amber-400 text-white"
                            : "bg-muted/50 text-muted-foreground/30"
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Coach score */}
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground w-8 text-right">Coach</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                          n <= coachVal
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground/30"
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Diff indicator */}
                <div className="w-12 text-right">
                  {diff !== null && diff !== 0 && (
                    <span className={`text-[10px] font-semibold ${diff > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {diff > 0 ? `+${diff} ↑` : `${diff} ↓`}
                    </span>
                  )}
                  {diff === 0 && (
                    <span className="text-[10px] font-semibold text-green-600">✓ match</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coaching prompts */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Conversation Starters</p>
        <ul className="space-y-2">
          {prompts.map((p, i) => (
            <li key={i} className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 italic">
              &ldquo;{p}&rdquo;
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
