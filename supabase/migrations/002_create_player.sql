-- supabase/migrations/002_create_player.sql

CREATE TABLE player_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  display_name  TEXT NOT NULL DEFAULT 'Trader',
  avatar_url    TEXT,

  total_xp      INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  rank_title    TEXT NOT NULL DEFAULT 'Novice',

  total_trades   INTEGER NOT NULL DEFAULT 0,
  total_wins     INTEGER NOT NULL DEFAULT 0,
  total_losses   INTEGER NOT NULL DEFAULT 0,
  total_pnl      NUMERIC NOT NULL DEFAULT 0,
  best_streak    INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER player_profiles_updated_at
  BEFORE UPDATE ON player_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own profile"
  ON player_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────

CREATE TABLE player_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  profitability   NUMERIC NOT NULL DEFAULT 50,
  risk_management NUMERIC NOT NULL DEFAULT 50,
  consistency     NUMERIC NOT NULL DEFAULT 50,
  discipline      NUMERIC NOT NULL DEFAULT 50,
  emotional_ctrl  NUMERIC NOT NULL DEFAULT 50,
  execution       NUMERIC NOT NULL DEFAULT 50,

  overall_score   NUMERIC NOT NULL DEFAULT 50,
  last_computed   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own stats"
  ON player_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
