import { useApiData } from "@/hooks/useApiData.js";

// --- Pill components matching cAMP Ascent spec ---

const ROLE_CLASSES: Record<string, string> = {
  "Velocity AE": "bg-blue-50 text-blue-700 border-blue-200",
  "Emerging AE": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Majors AE": "bg-purple-50 text-purple-700 border-purple-200",
  "Strat AE": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "SDR": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "PSM": "bg-orange-50 text-orange-700 border-orange-200",
  "Renewals": "bg-yellow-50 text-yellow-700 border-yellow-300",
  "Admin": "bg-gray-100 text-gray-600 border-gray-200",
};

function RolePill({ role }: { role: string }) {
  const classes = ROLE_CLASSES[role] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${classes}`}>
      {role}
    </span>
  );
}

const REGION_CLASSES: Record<string, { emoji: string; classes: string }> = {
  "NAMER": { emoji: "🌎", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  "EMEA": { emoji: "🌍", classes: "bg-red-50 text-red-700 border-red-200" },
  "AAPJ": { emoji: "🌏", classes: "bg-yellow-50 text-yellow-700 border-yellow-300" },
};

function RegionPill({ region }: { region: string }) {
  const config = REGION_CLASSES[region] || { emoji: "🌐", classes: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-0.5 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${config.classes}`}>
      {config.emoji} {region}
    </span>
  );
}

// --- Row styling ---

const RANK_STYLES: Record<number, { medal: string; bg: string; border: string }> = {
  1: { medal: "🥇", bg: "#BBF7D0", border: "#4ADE80" },
  2: { medal: "🥈", bg: "#DCFCE7", border: "#6EE7B7" },
  3: { medal: "🥉", bg: "#F0FDF4", border: "#86EFAC" },
};

interface LeaderboardRow {
  userEmail: string;
  userName: string;
  role: string | null;
  region: string | null;
  totalSpins: number;
  totalPeeks: number;
  avgPitchTime: number | null;
  avgSelfEval: number | null;
  avgCoachEval: number | null;
  avgAiCoach: number | null;
}

export default function LeaderboardTab() {
  const { data, loading, fetching } = useApiData("GetLeaderboard", {});

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="h-5 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const rows: LeaderboardRow[] = data?.leaderboard || [];
  const currentEmail = data?.currentUserEmail || "";

  return (
    <div className={fetching && !loading ? "opacity-70 transition-opacity" : ""}>
      {fetching && !loading && (
        <div className="text-xs text-muted-foreground mb-2">Updating…</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <span className="text-base">🎡</span>
          <span className="text-sm font-bold text-slate-900">Wheel & Deal Leaderboard</span>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🎡</span>
            <p className="text-sm text-gray-500">No spins recorded yet. Be the first to spin!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Role</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Geo</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Spins</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Avg. Pitch Time</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Avg. Self-Eval</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Avg. AI Coach</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Avg. Coach Eval</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Peeks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const rank = i + 1;
                  const isCurrentUser = row.userEmail === currentEmail;
                  const rankStyle = RANK_STYLES[rank];

                  // Build row classes
                  let rowClasses = "transition-colors";
                  if (isCurrentUser) {
                    rowClasses += " bg-indigo-50 ring-1 ring-inset ring-indigo-200";
                  } else if (rankStyle) {
                    rowClasses += ""; // styled via inline for exact hex colors
                  } else {
                    rowClasses += " hover:bg-slate-50";
                  }

                  return (
                    <tr
                      key={row.userEmail}
                      className={rowClasses}
                      style={
                        !isCurrentUser && rankStyle
                          ? { backgroundColor: rankStyle.bg, boxShadow: `inset 0 0 0 1px ${rankStyle.border}` }
                          : !isCurrentUser && !rankStyle
                          ? { borderBottom: "1px solid #E5E7EB" }
                          : undefined
                      }
                    >
                      {/* Rank */}
                      <td className="px-4 py-2.5 w-10">
                        {rankStyle ? (
                          <span className="text-base">{rankStyle.medal}</span>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">{rank}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-2.5">
                        <span className={`text-[13px] font-semibold ${isCurrentUser ? "text-indigo-900" : "text-slate-900"}`}>
                          {row.userName}
                        </span>
                        {isCurrentUser && (
                          <span className="ml-2 text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-medium">
                            You
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-2.5 text-center">
                        {row.role ? <RolePill role={row.role} /> : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* Geo */}
                      <td className="px-4 py-2.5 text-center">
                        {row.region ? <RegionPill region={row.region} /> : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* Spins */}
                      <td className={`px-4 py-2.5 text-center text-[13px] font-bold ${isCurrentUser ? "text-indigo-700" : "text-slate-900"}`}>
                        {row.totalSpins}
                      </td>

                      {/* Avg Pitch Time */}
                      <td className="px-4 py-2.5 text-center">
                        {row.avgPitchTime !== null
                          ? <span className="text-[13px] font-mono text-slate-600">{Math.floor(row.avgPitchTime / 60)}:{String(row.avgPitchTime % 60).padStart(2, "0")}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>

                      {/* Avg Self-Eval */}
                      <td className="px-4 py-2.5 text-center">
                        {row.avgSelfEval !== null
                          ? <span className="text-[13px] text-slate-600">{row.avgSelfEval}/12</span>
                          : <span className="inline-flex items-center whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-red-50 text-red-700 border-red-200">❌ Missing</span>
                        }
                      </td>

                      {/* Avg AI Coach */}
                      <td className="px-4 py-2.5 text-center">
                        {row.avgAiCoach !== null
                          ? <span className="text-[13px] text-slate-600">{row.avgAiCoach}/12</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>

                      {/* Avg Coach Eval */}
                      <td className="px-4 py-2.5 text-center">
                        {row.avgCoachEval !== null
                          ? <span className="text-[13px] text-slate-600">{row.avgCoachEval}/12</span>
                          : <span className="inline-flex items-center whitespace-nowrap px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-amber-50 text-amber-700 border-amber-200">⚠️ None</span>
                        }
                      </td>

                      {/* Peeks */}
                      <td className="px-4 py-2.5 text-center text-[13px] text-slate-600">
                        {row.totalPeeks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
