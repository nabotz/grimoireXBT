-- supabase/migrations/007_create_xp_history.sql

CREATE TABLE xp_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  amount      INTEGER NOT NULL,
  source      TEXT NOT NULL CHECK (source IN (
    'trade', 'achievement', 'streak_bonus', 'daily_login', 'journal'
  )),
  source_id   UUID,
  description TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_history_user ON xp_history(user_id, created_at DESC);

ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own XP history"
  ON xp_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
