import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealRecordPeerRating",
  description: "Records a peer or manager rating for a spin session",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({
    spinId: z.number(),
    observerName: z.string().nullable(),
    clarityScore: z.number().min(1).max(3),
    conversationalScore: z.number().min(1).max(3),
    credibilityScore: z.number().min(1).max(3),
    closeScore: z.number().min(1).max(3),
  }),
  output: z.object({ success: z.boolean() }),
  async run(ctx, input) {
    const email = ctx.user.email ?? "anonymous";
    const name = input.observerName || ctx.user.name || "Anonymous Coach";

    await ctx.integrations.db.execute(
      `INSERT INTO wheel_deal_peer_ratings (spin_id, rater_email, rater_name, clarity_score, conversational_score, credibility_score, close_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [input.spinId, email, name, input.clarityScore, input.conversationalScore, input.credibilityScore, input.closeScore],
      { label: "Insert peer rating" }
    );

    return { success: true };
  },
});
