import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

// Admin emails excluded from analytics
const ADMIN_EMAILS = [
  "jt.bohland@amplitude.com",
];

export default api({
  name: "WheelDealGetAnalytics",
  description: "Gets analytics data including self vs peer rating gaps",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    viewAll: z.boolean(),
  }),
  output: z.object({
    totalSpins: z.coerce.number(),
    totalPeeks: z.coerce.number(),
    totalAssessments: z.coerce.number(),
    totalVisits: z.coerce.number(),
    uniqueVisitors: z.coerce.number(),
    productBreakdown: z.array(z.object({
      productId: z.string(),
      spins: z.coerce.number(),
      peeks: z.coerce.number(),
      avgScore: z.number().nullable(),
      timerExpiredCount: z.coerce.number(),
    })),
    userBreakdown: z.array(z.object({
      userEmail: z.string(),
      userName: z.string(),
      totalSpins: z.coerce.number(),
      lastSpinAt: z.string().nullable(),
    })),
    peerGaps: z.array(z.object({
      userName: z.string(),
      userEmail: z.string(),
      avgSelfScore: z.number(),
      avgPeerScore: z.number(),
      gap: z.number(),
      ratingsCount: z.number(),
    })),
  }),
  async run(ctx, { viewAll }) {
    const email = ctx.user.email ?? "unknown";
    const adminFilter = "AND user_email != ALL($" + (viewAll ? "1" : "2") + "::text[])";
    const whereClause = viewAll ? `WHERE 1=1 ${adminFilter}` : `WHERE user_email = $1 ${adminFilter}`;
    const params = viewAll ? [ADMIN_EMAILS] : [email, ADMIN_EMAILS];

    // Summary stats
    const stats = await ctx.integrations.db.query(
      `SELECT 
        COUNT(*) as total_spins,
        COUNT(*) FILTER (WHERE cheat_peek = true) as total_peeks,
        COUNT(*) FILTER (WHERE self_score IS NOT NULL) as total_assessments
      FROM wheel_deal_spins ${whereClause}`,
      z.object({
        total_spins: z.coerce.number(),
        total_peeks: z.coerce.number(),
        total_assessments: z.coerce.number(),
      }),
      params,
      { label: "Fetch summary stats" }
    );

    // Product breakdown
    const productBreakdown = await ctx.integrations.db.query(
      `SELECT 
        product_id,
        COUNT(*) as spins,
        COUNT(*) FILTER (WHERE cheat_peek = true) as peeks,
        AVG(self_score) as avg_score,
        COUNT(*) FILTER (WHERE timer_expired = true) as timer_expired_count
      FROM wheel_deal_spins ${whereClause}
      GROUP BY product_id
      ORDER BY spins DESC`,
      z.object({
        product_id: z.string(),
        spins: z.coerce.number(),
        peeks: z.coerce.number(),
        avg_score: z.coerce.number().nullable(),
        timer_expired_count: z.coerce.number(),
      }),
      params,
      { label: "Fetch product breakdown" }
    );

    // User breakdown (only for viewAll)
    let userBreakdown: { userEmail: string; userName: string; totalSpins: number; lastSpinAt: string | null }[] = [];
    if (viewAll) {
      const users = await ctx.integrations.db.query(
        `SELECT 
          user_email,
          user_name,
          COUNT(*) as total_spins,
          MAX(created_at)::text as last_spin_at
        FROM wheel_deal_spins
        WHERE user_email != ALL($1::text[])
        GROUP BY user_email, user_name
        ORDER BY total_spins DESC
        LIMIT 50`,
        z.object({
          user_email: z.string(),
          user_name: z.string(),
          total_spins: z.coerce.number(),
          last_spin_at: z.string().nullable(),
        }),
        [ADMIN_EMAILS],
        { label: "Fetch user breakdown" }
      );
      userBreakdown = users.map(u => ({
        userEmail: u.user_email,
        userName: u.user_name,
        totalSpins: u.total_spins,
        lastSpinAt: u.last_spin_at,
      }));
    }

    // Peer rating gaps: self-assessment vs peer avg per user
    let peerGaps: { userName: string; userEmail: string; avgSelfScore: number; avgPeerScore: number; gap: number; ratingsCount: number }[] = [];
    const gapFilter = viewAll ? "WHERE s.user_email != ALL($1::text[])" : "WHERE s.user_email = $1 AND s.user_email != ALL($2::text[])";
    const gapParams = viewAll ? [ADMIN_EMAILS] : [email, ADMIN_EMAILS];
    const gapRows = await ctx.integrations.db.query(
      `SELECT
        s.user_name,
        s.user_email,
        AVG(s.self_score)::float as avg_self_score,
        AVG((r.clarity_score + r.conversational_score + r.close_score) / 3.0)::float as avg_peer_score,
        COUNT(r.id) as ratings_count
      FROM wheel_deal_spins s
      JOIN wheel_deal_peer_ratings r ON r.spin_id = s.id
      ${gapFilter}
      AND s.self_score IS NOT NULL
      GROUP BY s.user_name, s.user_email
      HAVING COUNT(r.id) > 0
      ORDER BY COUNT(r.id) DESC
      LIMIT 50`,
      z.object({
        user_name: z.string(),
        user_email: z.string(),
        avg_self_score: z.coerce.number(),
        avg_peer_score: z.coerce.number(),
        ratings_count: z.coerce.number(),
      }),
      gapParams,
      { label: "Fetch self vs peer gaps" }
    );
    peerGaps = gapRows.map(g => ({
      userName: g.user_name,
      userEmail: g.user_email,
      avgSelfScore: parseFloat((g.avg_self_score).toFixed(2)),
      avgPeerScore: parseFloat((g.avg_peer_score).toFixed(2)),
      gap: parseFloat((g.avg_self_score - g.avg_peer_score).toFixed(2)),
      ratingsCount: g.ratings_count,
    }));

    // Visit stats
    const visitStats = await ctx.integrations.db.query(
      `SELECT
        COUNT(*) as total_visits,
        COUNT(DISTINCT user_email) as unique_visitors
      FROM wheel_deal_visits
      WHERE user_email != ALL($1::text[])`,
      z.object({
        total_visits: z.coerce.number(),
        unique_visitors: z.coerce.number(),
      }),
      [ADMIN_EMAILS],
      { label: "Fetch visit stats" }
    );

    return {
      totalSpins: stats[0]?.total_spins ?? 0,
      totalPeeks: stats[0]?.total_peeks ?? 0,
      totalAssessments: stats[0]?.total_assessments ?? 0,
      totalVisits: visitStats[0]?.total_visits ?? 0,
      uniqueVisitors: visitStats[0]?.unique_visitors ?? 0,
      productBreakdown: productBreakdown.map(p => ({
        productId: p.product_id,
        spins: p.spins,
        peeks: p.peeks,
        avgScore: p.avg_score,
        timerExpiredCount: p.timer_expired_count,
      })),
      userBreakdown,
      peerGaps,
    };
  },
});
