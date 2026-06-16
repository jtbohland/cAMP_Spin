import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const SpinRowSchema = z.object({
  id: z.coerce.number(),
  user_name: z.string(),
  product_id: z.string(),
  challenge_type: z.string(),
  self_score: z.coerce.number().nullable(),
  is_multiplayer: z.boolean(),
  created_at: z.string(),
});

export default api({
  name: "GetSpinDetails",
  description: "Fetches spin session details for the observer view",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
  }),
  output: z.object({
    spin: z.object({
      id: z.number(),
      presenterName: z.string(),
      productId: z.string(),
      challengeType: z.string(),
      selfScore: z.number().nullable(),
      isMultiplayer: z.boolean(),
      createdAt: z.string(),
    }).nullable(),
  }),
  async run(ctx, { spinId }) {
    const rows = await ctx.integrations.db.query(
      `SELECT id, user_name, product_id, challenge_type, self_score, is_multiplayer, created_at
       FROM wheel_deal_spins
       WHERE id = $1
       LIMIT 1`,
      SpinRowSchema,
      [spinId],
      { label: "Fetch spin details" }
    );

    if (rows.length === 0) {
      return { spin: null };
    }

    const r = rows[0];
    return {
      spin: {
        id: r.id,
        presenterName: r.user_name,
        productId: r.product_id,
        challengeType: r.challenge_type,
        selfScore: r.self_score,
        isMultiplayer: r.is_multiplayer,
        createdAt: r.created_at,
      },
    };
  },
});
