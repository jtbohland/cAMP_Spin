import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealRecordAiScore",
  description: "Updates a spin record with AI scoring results and pitch text",
  integrations: {
    apps_database: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
    pitchText: z.string(),
    aiClarity: z.number(),
    aiConversational: z.number(),
    aiCredibility: z.number(),
    aiClose: z.number(),
    aiScore: z.number(),
    aiFeedback: z.array(z.string()),
    completionScore: z.number(),
  }),
  output: z.object({ success: z.boolean() }),
  async run(ctx, input) {
    await ctx.integrations.apps_database.execute(
      `UPDATE wheel_deal_spins
       SET pitch_text = $2,
           has_typed_pitch = TRUE,
           ai_clarity = $3,
           ai_conversational = $4,
           ai_credibility = $5,
           ai_close = $6,
           ai_score = $7,
           ai_feedback = $8,
           completion_score = $9
       WHERE id = $1`,
      [
        input.spinId,
        input.pitchText,
        input.aiClarity,
        input.aiConversational,
        input.aiCredibility,
        input.aiClose,
        input.aiScore,
        JSON.stringify(input.aiFeedback),
        input.completionScore,
      ],
      { label: "Record AI scores, completion score, and pitch text for spin" },
    );

    return { success: true };
  },
});
