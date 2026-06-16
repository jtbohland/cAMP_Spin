import { useState, useEffect, useRef } from "react";
import { executeApi } from "@/lib/executeApi.js";

type DebriefCardProps = {
  spinId: number;
  selfScore: number | null;
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

function getCoachingPrompts(selfScore: number | null, clarity: number, conversational: number, credibility: number, close: number): string[] {
  const prompts: string[] = [];
  const peerAvg = (clarity + conversational + credibility + close) / 4;
  const selfNorm = selfScore !== null ? (selfScore / 4) * 3 : null;

  if (close <= 1) {
    prompts.push("Your observer rated your close low. Ask them: \"What would have made my ask feel more natural?\"");
  }
  if (clarity <= 1) {
    prompts.push("Clarity scored low. Try asking: \"Where exactly did I lose you?\"");
  }
  if (conversational <= 1) {
    prompts.push("Tone felt scripted. Ask: \"What part felt like I was reading vs. talking?\"");
  }
  if (credibility <= 1) {
    prompts.push("Credibility scored low. Ask: \"Where did I lose you \u2014 did it sound like I don't know the product?\"");
  }
  if (selfNorm !== null && selfNorm > peerAvg + 0.5) {
    prompts.push("You rated yourself higher than your coach did. Explore: \"What am I not seeing about my delivery?\"");
  }
  if (selfNorm !== null && peerAvg > selfNorm + 0.5) {
    prompts.push("Your coach rated you higher than you rated yourself! You might be better than you think.");
  }
  if (peerAvg >= 2.5 && (selfNorm === null || selfNorm >= 2)) {
    prompts.push("You both agree this was strong. What one thing would level it up from good to exceptional?");
  }
  if (prompts.length === 0) {
    prompts.push("Solid scores across the board. Discuss: what felt easiest and what took the most effort?");
  }
  return prompts;
}

export function DebriefCard({ spinId, selfScore, onDismiss }: DebriefCardProps) {
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
  const credibility = latest.credibility ?? 2;
  const prompts = getCoachingPrompts(selfScore, latest.clarity, latest.conversational, credibility, latest.close);
  const peerAvg = ((latest.clarity + latest.conversational + credibility + latest.close) / 4).toFixed(1);

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-lg mt-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Debrief</h3>
        <button onClick={onDismiss} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
      </div>

      {/* Scores comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your Self-Score</p>
          <p className="text-2xl font-bold text-foreground">{selfScore ?? "--"}<span className="text-sm text-muted-foreground">/4</span></p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Coach Avg</p>
          <p className="text-2xl font-bold text-primary">{peerAvg}<span className="text-sm text-muted-foreground">/3</span></p>
        </div>
      </div>

      {/* Coach breakdown */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Coach: {latest.raterName}</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{latest.clarity}</p>
            <p className="text-[10px] text-muted-foreground">Clarity</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{latest.conversational}</p>
            <p className="text-[10px] text-muted-foreground">Tone</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{credibility}</p>
            <p className="text-[10px] text-muted-foreground">Credibility</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{latest.close}</p>
            <p className="text-[10px] text-muted-foreground">Close</p>
          </div>
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
