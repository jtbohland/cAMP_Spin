import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealGetAiScoreTrend",
  description: "Returns last 5 AI-scored pitch results for the current user",
  integrations: {
    apps_database: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    scores: z.array(z.object({
      spinId: z.number(),
      productId: z.string(),
      aiScore: z.number(),
      aiClarity: z.number(),
      aiConversational: z.number(),
      aiCredibility: z.number(),
      aiClose: z.number(),
      createdAt: z.string(),
    })),
  }),
  async run(ctx) {
    const email = ctx.user.email ?? "unknown";

    const rows = await ctx.integrations.apps_database.query(
      `SELECT id, product_id, ai_score, ai_clarity, ai_conversational, ai_credibility, ai_close, created_at
       FROM wheel_deal_spins
       WHERE user_email = $1 AND has_typed_pitch = TRUE AND ai_score IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 5`,
      z.object({
        id: z.coerce.number(),
        product_id: z.string(),
        ai_score: z.coerce.number(),
        ai_clarity: z.coerce.number(),
        ai_conversational: z.coerce.number(),
        ai_credibility: z.coerce.number(),
        ai_close: z.coerce.number(),
        created_at: z.string(),
      }),
      [email],
      { label: "Fetch last 5 AI-scored pitches for user" },
    );

    return {
      scores: rows.map((r) => ({
        spinId: r.id,
        productId: r.product_id,
        aiScore: r.ai_score,
        aiClarity: r.ai_clarity,
        aiConversational: r.ai_conversational,
        aiCredibility: r.ai_credibility,
        aiClose: r.ai_close,
        createdAt: r.created_at,
      })),
    };
  },
});
