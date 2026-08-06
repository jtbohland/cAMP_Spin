import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

// Admin emails excluded from leaderboard and analytics
const ADMIN_EMAILS = [
  "jt.bohland@amplitude.com",
  "lisa.mullen@amplitude.com",
];

export default api({
  name: "WheelDealGetLeaderboard",
  description: "Gets the public leaderboard with role, geo, spins, peeks, and avg evaluations",
  integrations: {
    apps_database: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    leaderboard: z.array(z.object({
      userEmail: z.string(),
      userName: z.string(),
      role: z.string().nullable(),
      region: z.string().nullable(),
      totalSpins: z.coerce.number(),
      totalPeeks: z.coerce.number(),
      avgPitchTime: z.number().nullable(),
      avgSelfEval: z.number().nullable(),
      avgCoachEval: z.number().nullable(),
      avgAiCoach: z.number().nullable(),
    })),
    currentUserEmail: z.string(),
  }),
  async run(ctx) {
    const email = ctx.user.email ?? "unknown";

    const leaderboard = await ctx.integrations.apps_database.query(
      `SELECT
        s.user_email,
        s.user_name,
        p.role,
        p.region,
        COUNT(*) as total_spins,
        COUNT(*) FILTER (WHERE s.cheat_peek = true) as total_peeks,
        AVG(s.pitch_seconds)::float as avg_pitch_time,
        AVG(
          CASE WHEN s.self_clarity IS NOT NULL THEN
            COALESCE(s.self_clarity, 0) + COALESCE(s.self_conversational, 0) + COALESCE(s.self_credibility, 0) + COALESCE(s.self_close, 0)
          END
        )::float as avg_self_eval,
        (
          SELECT AVG(COALESCE(r.clarity_score, 0) + COALESCE(r.conversational_score, 0) + COALESCE(r.credibility_score, 0) + COALESCE(r.close_score, 0))::float
          FROM wheel_deal_peer_ratings r
          JOIN wheel_deal_spins s2 ON r.spin_id = s2.id
          WHERE s2.user_email = s.user_email
        ) as avg_coach_eval,
        AVG(
          CASE WHEN s.has_typed_pitch = true AND s.ai_score IS NOT NULL THEN s.ai_score END
        )::float as avg_ai_coach
      FROM wheel_deal_spins s
      LEFT JOIN wheel_deal_profiles p ON p.user_email = s.user_email
      WHERE s.user_email != ALL($1::text[])
      GROUP BY s.user_email, s.user_name, p.role, p.region
      ORDER BY total_spins DESC
      LIMIT 50`,
      z.object({
        user_email: z.string(),
        user_name: z.string(),
        role: z.string().nullable(),
        region: z.string().nullable(),
        total_spins: z.coerce.number(),
        total_peeks: z.coerce.number(),
        avg_pitch_time: z.coerce.number().nullable(),
        avg_self_eval: z.coerce.number().nullable(),
        avg_coach_eval: z.coerce.number().nullable(),
        avg_ai_coach: z.coerce.number().nullable(),
      }),
      [ADMIN_EMAILS],
      { label: "Fetch leaderboard with profiles and evaluations" }
    );

    return {
      leaderboard: leaderboard.map(r => ({
        userEmail: r.user_email,
        userName: r.user_name,
        role: r.role,
        region: r.region,
        totalSpins: r.total_spins,
        totalPeeks: r.total_peeks,
        avgPitchTime: r.avg_pitch_time !== null ? Math.round(r.avg_pitch_time) : null,
        avgSelfEval: r.avg_self_eval !== null ? parseFloat(r.avg_self_eval.toFixed(1)) : null,
        avgCoachEval: r.avg_coach_eval !== null ? parseFloat(r.avg_coach_eval.toFixed(1)) : null,
        avgAiCoach: r.avg_ai_coach !== null ? parseFloat(r.avg_ai_coach.toFixed(1)) : null,
      })),
      currentUserEmail: email,
    };
  },
});
