import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "SaveProfile",
  description: "Saves a user's Wheel & Deal profile (registration)",
  integrations: {
    apps_db: postgres(APPS_DB),
  },
  input: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    manager: z.string().min(1),
    region: z.string().min(1),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  async run(ctx, { name, role, manager, region }) {
    const email = ctx.user.email;
    if (!email) {
      throw new Error("User email is required");
    }

    await ctx.integrations.apps_db.execute(
      `INSERT INTO wheel_deal_profiles (user_email, user_name, role, manager, region)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_email) DO UPDATE SET
         user_name = EXCLUDED.user_name,
         role = EXCLUDED.role,
         manager = EXCLUDED.manager,
         region = EXCLUDED.region`,
      [email, name, role, manager, region],
      { label: "Upsert user profile" }
    );

    return { success: true };
  },
});
