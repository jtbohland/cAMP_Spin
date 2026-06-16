import { useState, useCallback } from "react";
import { useApiData } from "@/hooks/useApiData.js";
import { PRODUCTS } from "@/lib/wheel-deal-data.js";

const ADMIN_PASSWORD = "smoreenablement";

export default function AnalyticsTab() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data, loading } = useApiData("GetAnalytics", { viewAll: true }, { enabled: authenticated });

  const handleLogin = useCallback(() => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Check with your enablement team.");
    }
  }, [password]);

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-4xl mb-4">🔒</span>
        <p className="text-sm font-semibold text-foreground mb-1">Analytics Dashboard</p>
        <p className="text-xs text-muted-foreground mb-5 text-center max-w-sm">
          This view is for managers and enablement only. Enter the password to access cohort analytics.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2962FF]/50"
          />
          <button
            onClick={handleLogin}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2962FF] hover:bg-[#1e50d4] transition-colors"
          >
            Unlock
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-60 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  const analytics = data || { totalSpins: 0, totalPeeks: 0, totalAssessments: 0, totalVisits: 0, uniqueVisitors: 0, productBreakdown: [], userBreakdown: [], peerGaps: [] };
  const maxSpins = Math.max(...(analytics.productBreakdown || []).map((p: any) => p.spins), 1);

  return (
    <div>
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-sm font-bold text-foreground mb-1">📊 Cohort Analytics</p>
        <p className="text-xs text-muted-foreground">Private to managers and enablement. Tracks where the team is confident and where to focus next.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[
          { label: "Total Visits", value: analytics.totalVisits },
          { label: "Unique Visitors", value: analytics.uniqueVisitors },
          { label: "Total Spins", value: analytics.totalSpins },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Cheat Peeks", value: analytics.totalPeeks },
          { label: "Self-Assessments", value: analytics.totalAssessments },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Spins by product */}
      <div className="bg-card border border-border rounded-xl p-4 mb-3">
        <div className="text-xs font-bold text-foreground mb-3">Spins by Product</div>
        {(analytics.productBreakdown || []).map((p: any) => {
          const product = PRODUCTS.find((pr) => pr.id === p.productId);
          if (!product) return null;
          const pct = Math.round((p.spins / maxSpins) * 100);
          return (
            <div key={p.productId} className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-foreground/90">{product.icon} {product.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {p.spins} spins{p.avgScore !== null ? ` · ${p.avgScore}/4 avg` : ""}{p.peeks > 0 ? ` · ${p.peeks} peeks` : ""}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted mb-2">
                <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: product.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence signals */}
      <div className="bg-card border border-border rounded-xl p-4 mb-3">
        <div className="text-xs font-bold text-foreground mb-3">Confidence Signals</div>
        {PRODUCTS.map((product) => {
          const pData = (analytics.productBreakdown || []).find((p: any) => p.productId === product.id);
          const spins = pData?.spins || 0;
          const peeks = pData?.peeks || 0;
          const peekRate = spins > 0 ? Math.round((peeks / spins) * 100) : null;
          const signal =
            peekRate === null
              ? { label: "Not practiced yet", color: "var(--color-muted-foreground)" }
              : peekRate === 0
              ? { label: "Flying solo \u2014 no peeks \ud83d\udd25", color: "#00C853" }
              : peekRate < 50
              ? { label: "Getting there \u2014 occasional peeks", color: "#FFB300" }
              : { label: "Still building \u2014 leaning on cheat sheet", color: "#FF6B35" };
          return (
            <div key={product.id} className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0">
              <span className="text-base shrink-0">{product.icon}</span>
              <span className="text-xs text-foreground/90 flex-1">{product.name}</span>
              <span className="text-[11px] font-semibold" style={{ color: signal.color }}>{signal.label}</span>
            </div>
          );
        })}
      </div>

      {/* Self vs Peer Rating Gaps */}
      {analytics.peerGaps && analytics.peerGaps.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-3">
          <div className="text-xs font-bold text-foreground mb-1">🎯 Self vs. Coach Rating Gaps</div>
          <p className="text-[11px] text-muted-foreground mb-3">How people see themselves vs. how their coaches rate them. Bigger gaps = blind spots.</p>
          <div className="space-y-2">
            {analytics.peerGaps.map((g: any, i: number) => {
              const gapColor = Math.abs(g.gap) <= 0.3 ? "#00C853" : Math.abs(g.gap) <= 0.7 ? "#FFB300" : "#E53935";
              const gapLabel = g.gap > 0.3 ? "Over-confident" : g.gap < -0.3 ? "Under-confident" : "Aligned";
              return (
                <div key={i} className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{g.userName}</p>
                    <p className="text-[10px] text-muted-foreground">Self: {g.avgSelfScore}/4 · Coach: {g.avgPeerScore}/3 · {g.ratingsCount} rating{g.ratingsCount > 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold" style={{ color: gapColor }}>{g.gap > 0 ? "+" : ""}{g.gap}</span>
                    <p className="text-[9px]" style={{ color: gapColor }}>{gapLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User breakdown */}
      {analytics.userBreakdown && analytics.userBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-bold text-foreground mb-3">👥 Cohort Activity</div>
          <p className="text-xs text-muted-foreground mb-2">All learners and their spin counts:</p>
          {analytics.userBreakdown.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0">
              <span className="text-xs text-foreground/80 flex-1">{u.userName}</span>
              <span className="text-[11px] text-muted-foreground">{u.totalSpins} spins</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
