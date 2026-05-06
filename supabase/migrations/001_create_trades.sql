-- supabase/migrations/001_create_trades.sql

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE trades (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Trade data
  pair          TEXT NOT NULL,
  side          TEXT NOT NULL CHECK (side IN ('long', 'short')),
  asset_type    TEXT NOT NULL CHECK (asset_type IN ('perp', 'spot', 'defi')),
  exchange      TEXT,

  -- Prices & sizing
  entry_price   NUMERIC NOT NULL,
  exit_price    NUMERIC,
  position_size NUMERIC NOT NULL,
  leverage      NUMERIC DEFAULT 1,

  -- Results
  pnl           NUMERIC,
  pnl_percent   NUMERIC,
  risk_reward   NUMERIC,
  planned_rr    NUMERIC,

  -- Meta
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  entry_date    TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_date     TIMESTAMPTZ,
  duration_mins INTEGER,

  -- Notes
  setup_type    TEXT,
  notes         TEXT,
  screenshot_url TEXT,

  -- RPG
  xp_earned     INTEGER DEFAULT 0,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trades_user_id   ON trades(user_id);
CREATE INDEX idx_trades_entry_date ON trades(user_id, entry_date DESC);
CREATE INDEX idx_trades_pair      ON trades(user_id, pair);
CREATE INDEX idx_trades_status    ON trades(user_id, status);

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
