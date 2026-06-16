import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealUpdateSpin",
  description: "Updates a spin record with self-assessment and timer data",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
    cheatPeek: z.boolean(),
    selfScore: z.number().nullable(),
    timerUsed: z.boolean(),
    timerExpired: z.boolean(),
  }),
  output: z.object({ success: z.boolean() }),
  async run(ctx, input) {
    await ctx.integrations.db.execute(
      `UPDATE wheel_deal_spins
       SET cheat_peek = $2, self_score = $3, timer_used = $4, timer_expired = $5
       WHERE id = $1`,
      [input.spinId, input.cheatPeek, input.selfScore, input.timerUsed, input.timerExpired],
      { label: "Update spin with assessment data" }
    );

    return { success: true };
  },
});
