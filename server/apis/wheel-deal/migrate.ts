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

    // Add individual self-assessment score columns (4Cs)
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS self_clarity INTEGER CHECK (self_clarity BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add self_clarity column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS self_conversational INTEGER CHECK (self_conversational BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add self_conversational column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS self_credibility INTEGER CHECK (self_credibility BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add self_credibility column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS self_close INTEGER CHECK (self_close BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add self_close column" }
    );

    // Pitch duration in seconds (120 - remaining timer seconds when user clicked Done)
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS pitch_seconds INTEGER`,
      undefined,
      { label: "Add pitch_seconds column" }
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

    // User profiles table for registration
    await ctx.integrations.db.execute(
      `CREATE TABLE IF NOT EXISTS wheel_deal_profiles (
        user_email TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL,
        manager TEXT NOT NULL,
        region TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      undefined,
      { label: "Create wheel_deal_profiles table" }
    );

    // Backfill existing participants (INSERT ... ON CONFLICT DO NOTHING so it's idempotent)
    await ctx.integrations.db.execute(
      `INSERT INTO wheel_deal_profiles (user_email, user_name, role, manager, region) VALUES
        ('kabir.rai@amplitude.com', 'Kabir Rai', 'Majors AE', 'Matt Bennett', 'AAPJ'),
        ('benjamin.singh@amplitude.com', 'Benjamin Singh', 'Velocity AE', 'Kier Johnson', 'EMEA'),
        ('salim.alsabaa@amplitude.com', 'Salim Al Sabaa', 'Emerging AE', 'Tansu Yegen', 'EMEA'),
        ('chris.english@amplitude.com', 'Chris English', 'Majors AE', 'Rob Bow', 'NAMER'),
        ('rylan.holey@amplitude.com', 'Rylan Holey', 'PSM', 'Nick Iyengar', 'EMEA'),
        ('levi.verry@amplitude.com', 'Levi Verry', 'Emerging AE', 'Kevin Shain', 'NAMER'),
        ('gabi.kassatly@amplitude.com', 'Gabi Kassatly', 'Velocity AE', 'Kier Johnson', 'EMEA'),
        ('tristan.paule@amplitude.com', 'Tristan Paule', 'PSM', 'Nick Iyengar', 'NAMER'),
        ('katherine.ruane@amplitude.com', 'Kate Ruane', 'SDR', 'Lee Edwards', 'EMEA'),
        ('tyler.spaan@amplitude.com', 'Tyler Spaan', 'Emerging AE', 'Kevin Shain', 'NAMER'),
        ('andre.woodroffe@amplitude.com', 'Andre Woodroffe', 'Emerging AE', 'Kevin Shain', 'NAMER'),
        ('mo.rafati@amplitude.com', 'Mo Rafati', 'Majors AE', 'Joe Skupinsky', 'NAMER'),
        ('jt.bohland@amplitude.com', 'JT Bohland', 'Admin', 'N/A', 'NAMER')
      ON CONFLICT (user_email) DO NOTHING`,
      undefined,
      { label: "Backfill existing participant profiles" }
    );

    // AI scoring columns for typed pitch mode
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS pitch_text TEXT`,
      undefined,
      { label: "Add pitch_text column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS has_typed_pitch BOOLEAN DEFAULT FALSE`,
      undefined,
      { label: "Add has_typed_pitch column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_clarity INTEGER CHECK (ai_clarity BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add ai_clarity column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_conversational INTEGER CHECK (ai_conversational BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add ai_conversational column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_credibility INTEGER CHECK (ai_credibility BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add ai_credibility column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_close INTEGER CHECK (ai_close BETWEEN 1 AND 3)`,
      undefined,
      { label: "Add ai_close column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score BETWEEN 4 AND 12)`,
      undefined,
      { label: "Add ai_score column" }
    );
    await ctx.integrations.db.execute(
      `ALTER TABLE wheel_deal_spins ADD COLUMN IF NOT EXISTS ai_feedback TEXT`,
      undefined,
      { label: "Add ai_feedback column (JSON array of 5 bullets)" }
    );

    return { success: true };
  },
});
