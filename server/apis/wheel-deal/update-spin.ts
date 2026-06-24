import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealUpdateSpin",
  description: "Updates a spin record with self-assessment (4Cs) and timer data",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
    cheatPeek: z.boolean(),
    selfClarity: z.number().nullable(),
    selfConversational: z.number().nullable(),
    selfCredibility: z.number().nullable(),
    selfClose: z.number().nullable(),
    timerUsed: z.boolean(),
    timerExpired: z.boolean(),
  }),
  output: z.object({ success: z.boolean() }),
  async run(ctx, input) {
    // Compute average self_score from individual 4C scores
    const scores = [input.selfClarity, input.selfConversational, input.selfCredibility, input.selfClose].filter((s): s is number => s !== null);
    const selfScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null;

    await ctx.integrations.db.execute(
      `UPDATE wheel_deal_spins
       SET cheat_peek = $2, self_score = $3, timer_used = $4, timer_expired = $5,
           self_clarity = $6, self_conversational = $7, self_credibility = $8, self_close = $9
       WHERE id = $1`,
      [input.spinId, input.cheatPeek, selfScore, input.timerUsed, input.timerExpired,
       input.selfClarity, input.selfConversational, input.selfCredibility, input.selfClose],
      { label: "Update spin with 4C self-assessment" }
    );

    return { success: true };
  },
});
