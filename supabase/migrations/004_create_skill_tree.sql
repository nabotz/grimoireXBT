-- supabase/migrations/004_create_skill_tree.sql

CREATE TABLE skill_tree_state (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  node_key    TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, node_key)
);

CREATE INDEX idx_skill_tree_user ON skill_tree_state(user_id);

ALTER TABLE skill_tree_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skill tree"
  ON skill_tree_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
