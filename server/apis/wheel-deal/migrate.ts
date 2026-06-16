import { api, z, postgres } from "@superblocksteam/sdk-api";

const APPS_DB = "c6e32cf4-ca66-42ae-aeb3-58c84ffae574";

export default api({
  name: "WheelDealMigrate",
  description: "Creates wheel_deal tables if they don't exist",
  integrations: {
    db: postgres(APPS_DB),
  },
  input: z.object({}),
  output: z.object({ success: z.boolean() }),
  async run(ctx) {
    await ctx.integrations.db.execute(
      `CREATE TABLE IF NOT EXISTS wheel_deal_spins (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        product_id TEXT NOT NULL,
        challenge_type TEXT NOT NULL,
        cheat_peek BOOLEAN DEFAULT FALSE,
        self_score INTEGER,
        timer_used BOOLEAN DEFAULT FALSE,
        timer_expired BOOLEAN DEFAULT FALSE,
        is_multiplayer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      undefined,
      { label: "Create wheel_deal_spins table" }
    );

    await ctx.integrations.db.execute(
      `CREATE TABLE IF NOT EXISTS wheel_deal_peer_ratings (
        id SERIAL PRIMARY KEY,
        spin_id INTEGER REFERENCES wheel_deal_spins(id),
        rater_email TEXT NOT NULL,
        rater_name TEXT NOT NULL,
        clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 3),
        conversational_score INTEGER CHECK (conversational_score BETWEEN 1 AND 3),
        close_score INTEGER CHECK (close_score BETWEEN 1 AND 3),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      undefined,
      { label: "Create wheel_deal_peer_ratings table" }
    );

    await ctx.integrations.db.execute(
      `CREATE INDEX IF NOT EXISTS idx_wheel_deal_spins_email ON wheel_deal_spins(user_email)`,
      undefined,
      { label: "Create email index" }
    );

    await ctx.integrations.db.execute(
      `CREATE INDEX IF NOT EXISTS idx_wheel_deal_spins_product ON wheel_deal_spins(product_id)`,
      undefined,
      { label: "Create product index" }
    );

    // Add credibility_score column if not exists
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_peer_ratings ADD COLUMN IF NOT EXISTS credibility_score INTEGER CHECK (credibility_score BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add credibility_score column" }
    );

    // Page visits tracking
    await ctx.integrations.db.execute(
      `CREATE TABLE IF NOT EXISTS wheel_deal_visits (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        visited_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      undefined,
      { label: "Create wheel_deal_visits table" }
    );

    await ctx.integrations.db.execute(
      `CREATE INDEX IF NOT EXISTS idx_wheel_deal_visits_email ON wheel_deal_visits(user_email)`,
      undefined,
      { label: "Create visits email index" }
    );

    return { success: true };
  },
});
