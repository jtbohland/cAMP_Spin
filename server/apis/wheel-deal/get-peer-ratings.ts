import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const RatingRowSchema = z.object({
  id: z.coerce.number(),
  rater_name: z.string(),
  clarity_score: z.coerce.number(),
  conversational_score: z.coerce.number(),
  credibility_score: z.coerce.number().nullable(),
  close_score: z.coerce.number(),
  created_at: z.string(),
});

export default api({
  name: "GetPeerRatings",
  description: "Fetches peer ratings for a specific spin session",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
  }),
  output: z.object({
    ratings: z.array(z.object({
      id: z.number(),
      raterName: z.string(),
      clarity: z.number(),
      conversational: z.number(),
      credibility: z.number().nullable(),
      close: z.number(),
      createdAt: z.string(),
    })),
  }),
  async run(ctx, { spinId }) {
    const rows = await ctx.integrations.db.query(
      `SELECT id, rater_name, clarity_score, conversational_score, credibility_score, close_score, created_at
       FROM wheel_deal_peer_ratings
       WHERE spin_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      RatingRowSchema,
      [spinId],
      { label: "Fetch peer ratings for spin" }
    );

    return {
      ratings: rows.map((r) => ({
        id: r.id,
        raterName: r.rater_name,
        clarity: r.clarity_score,
        conversational: r.conversational_score,
        credibility: r.credibility_score,
        close: r.close_score,
        createdAt: r.created_at,
      })),
    };
  },
});
