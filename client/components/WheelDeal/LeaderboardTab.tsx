import { useApiData } from "@/hooks/useApiData.js";
import { PRODUCTS } from "@/lib/wheel-deal-data.js";

export default function LeaderboardTab() {
  const { data, loading } = useApiData("GetLeaderboard", {});

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const rows = data?.leaderboard || [];

  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Practice reps — ranked by spins completed. This leaderboard shows volume, not scores, because more reps = more fluency.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">🎡</span>
          <p className="text-sm text-muted-foreground">No spins recorded yet. Be the first to spin!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row: any, i: number) => {
            const productCount = row.productsCount || 0;
            return (
              <div
                key={row.userEmail}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors"
                style={{
                  background: i === 0 ? "rgba(41,98,255,0.06)" : "var(--color-card)",
                  borderColor: i === 0 ? "rgba(41,98,255,0.25)" : "var(--color-border)",
                }}
              >
                <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                <span className="text-sm font-semibold text-foreground flex-1">{row.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {productCount} product{productCount !== 1 ? "s" : ""} · {row.totalSpins} spin{row.totalSpins !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
