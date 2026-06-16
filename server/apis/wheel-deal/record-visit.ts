import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "RecordVisit",
  description: "Records a page visit for the current user",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({ success: z.boolean() }),
  async run(ctx) {
    const email = ctx.user.email ?? "unknown";
    const name = ctx.user.name ?? "Unknown User";

    await ctx.integrations.db.execute(
      `INSERT INTO wheel_deal_visits (user_email, user_name) VALUES ($1, $2)`,
      [email, name],
      { label: "Record page visit" }
    );

    return { success: true };
  },
});
