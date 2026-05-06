-- supabase/migrations/005_create_emotions.sql

CREATE TABLE emotion_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id  UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,

  tag       TEXT NOT NULL CHECK (tag IN (
    'focused', 'patient', 'confident', 'calm',
    'fomo', 'revenge', 'tilt', 'oversize',
    'hesitant', 'anxious', 'greedy', 'bored'
  )),
  intensity INTEGER DEFAULT 5 CHECK (intensity BETWEEN 1 AND 10),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emotion_tags_trade ON emotion_tags(trade_id);
CREATE INDEX idx_emotion_tags_user  ON emotion_tags(user_id);

ALTER TABLE emotion_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own emotion tags"
  ON emotion_tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
