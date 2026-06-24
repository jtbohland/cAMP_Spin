import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

// Admin emails excluded from leaderboard and analytics
const ADMIN_EMAILS = [
  "jt.bohland@amplitude.com",
];

export default api({
  name: "WheelDealGetLeaderboard",
  description: "Gets the public leaderboard ranked by total spins",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    leaderboard: z.array(z.object({
      userEmail: z.string(),
      userName: z.string(),
      totalSpins: z.coerce.number(),
      productsCount: z.coerce.number(),
    })),
    currentUserEmail: z.string(),
  }),
  async run(ctx) {
    const email = ctx.user.email ?? "unknown";

    const leaderboard = await ctx.integrations.db.query(
      `SELECT 
        user_email,
        user_name,
        COUNT(*) as total_spins,
        COUNT(DISTINCT product_id) as products_count
      FROM wheel_deal_spins
      WHERE user_email != ALL($1::text[])
      GROUP BY user_email, user_name
      ORDER BY total_spins DESC
      LIMIT 50`,
      z.object({
        user_email: z.string(),
        user_name: z.string(),
        total_spins: z.coerce.number(),
        products_count: z.coerce.number(),
      }),
      [ADMIN_EMAILS],
      { label: "Fetch leaderboard" }
    );

    return {
      leaderboard: leaderboard.map(r => ({
        userEmail: r.user_email,
        userName: r.user_name,
        totalSpins: r.total_spins,
        productsCount: r.products_count,
      })),
      currentUserEmail: email,
    };
  },
});
