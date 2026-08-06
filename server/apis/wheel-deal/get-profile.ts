import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

const ProfileSchema = z.object({
  user_email: z.string(),
  user_name: z.string(),
  role: z.string(),
  manager: z.string(),
  region: z.string(),
});

export default api({
  name: "GetProfile",
  description: "Gets the current user's Wheel & Deal profile",
  integrations: {
    apps_db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({
    profile: ProfileSchema.nullable(),
  }),
  async run(ctx) {
    const email = ctx.user.email;
    if (!email) {
      return { profile: null };
    }

    const rows = await ctx.integrations.apps_db.query(
      "SELECT user_email, user_name, role, manager, region FROM wheel_deal_profiles WHERE user_email = $1 LIMIT 1",
      ProfileSchema,
      [email],
      { label: "Look up user profile" }
    );

    return { profile: rows.length > 0 ? rows[0] : null };
  },
});
