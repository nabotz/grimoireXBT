-- supabase/migrations/003_create_achievements.sql

CREATE TABLE achievements_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  achievement_key  TEXT NOT NULL,
  unlocked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger_trade_id UUID REFERENCES trades(id),

  UNIQUE(user_id, achievement_key)
);

CREATE INDEX idx_achievements_user ON achievements_log(user_id);

ALTER TABLE achievements_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own achievements"
  ON achievements_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
