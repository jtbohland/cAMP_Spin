import { useApiData } from "@/hooks/useApiData.js";
import type { Product } from "@/lib/wheel-deal-data.js";

type SelfScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
  completion: number;
};

type AiScores = {
  clarity: number;
  conversational: number;
  credibility: number;
  close: number;
  completion: number;
  totalScore: number;
  feedbackBullets: string[];
  isCopied: boolean;
};

type AiDebriefCardProps = {
  selfScores: SelfScores;
  aiScores: AiScores;
  product: Product;
};

const CATEGORIES = [
  { key: "clarity" as const, label: "Clarity" },
  { key: "conversational" as const, label: "Tone" },
  { key: "credibility" as const, label: "Credibility" },
  { key: "close" as const, label: "Close" },
  { key: "completion" as const, label: "Completion" },
];

export function AiDebriefCard({ selfScores, aiScores, product }: AiDebriefCardProps) {
  const selfTotal = selfScores.clarity + selfScores.conversational + selfScores.credibility + selfScores.close + selfScores.completion;

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🤖</span>
        <h3 className="text-lg font-bold text-foreground">AI Coach Debrief</h3>
      </div>

      {aiScores.isCopied && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-4">
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">
            ⚠️ Copy detected — your pitch closely mirrored the cheat sheet. Try putting it in your own words next time.
          </p>
        </div>
      )}

      {/* Overall scores side-by-side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your Self-Score</p>
          <p className="text-2xl font-bold text-foreground">{selfTotal}<span className="text-sm text-muted-foreground">/15</span></p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">AI Coach</p>
          <p className="text-2xl font-bold text-primary">{aiScores.totalScore + aiScores.completion}<span className="text-sm text-muted-foreground">/15</span></p>
        </div>
      </div>

      {/* Per-category comparison */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <div className="space-y-2">
          {CATEGORIES.map((cat) => {
            const selfVal = selfScores[cat.key];
            const aiVal = aiScores[cat.key];
            const diff = selfVal - aiVal;
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
                          n <= selfVal
                            ? "bg-amber-400 text-white"
                            : "bg-muted/50 text-muted-foreground/30"
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                {/* AI score */}
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground w-6 text-right">AI</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                          n <= aiVal
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
                  {diff !== 0 && (
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

      {/* Feedback bullets */}
      {aiScores.feedbackBullets.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">What to Work On Next</p>
          <ul className="space-y-1.5">
            {aiScores.feedbackBullets.map((bullet, i) => (
              <li key={i} className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 leading-snug">
                <span className="font-medium text-foreground mr-1">{i + 1}.</span> {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Score Trend */}
      <AiScoreTrend />

      {/* Study before you spin again */}
      {product.resources && product.resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
            <span>📚</span> Study before you spin again
          </p>
          <p className="text-[11px] text-muted-foreground mb-2 italic">
            Go deeper on {product.name} before your next round.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {product.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2 transition-all hover:border-primary/40 hover:bg-muted/50"
              >
                <span className="text-xs shrink-0">🔗</span>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {r.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AiScoreTrend() {
  const { data, loading } = useApiData("GetAiScoreTrend", {});

  if (loading || !data || data.scores.length < 2) return null;

  // Reverse so oldest is first (left) and newest is last (right)
  const scores = [...data.scores].reverse();
  const maxScore = 15;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-semibold text-foreground mb-2">Your AI Score Trend (Last {scores.length})</p>
      <div className="flex items-end gap-1.5 h-16">
        {scores.map((s, i) => {
          const height = Math.max(12, (s.aiScore / maxScore) * 64);
          const isLatest = i === scores.length - 1;
          return (
            <div key={s.spinId} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-bold text-muted-foreground">{s.aiScore}</span>
              <div
                className={`w-full rounded-t-sm transition-all ${isLatest ? "bg-primary" : "bg-primary/40"}`}
                style={{ height: `${height}px` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
