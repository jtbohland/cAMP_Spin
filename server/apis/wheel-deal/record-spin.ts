import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealRecordSpin",
  description: "Records a wheel spin session with optional self-assessment",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    productId: z.string(),
    challengeType: z.string(),
    cheatPeek: z.boolean(),
    selfScore: z.number().nullable(),
    timerUsed: z.boolean(),
    timerExpired: z.boolean(),
    isMultiplayer: z.boolean(),
  }),
  output: z.object({ spinId: z.coerce.number() }),
  async run(ctx, input) {
    const email = ctx.user.email ?? "unknown";
    const name = ctx.user.name ?? "Unknown User";

    const result = await ctx.integrations.db.query(
      `INSERT INTO wheel_deal_spins (user_email, user_name, product_id, challenge_type, cheat_peek, self_score, timer_used, timer_expired, is_multiplayer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      z.object({ id: z.coerce.number() }),
      [email, name, input.productId, input.challengeType, input.cheatPeek, input.selfScore, input.timerUsed, input.timerExpired, input.isMultiplayer],
      { label: "Insert spin record" }
    );

    return { spinId: result[0].id };
  },
});
