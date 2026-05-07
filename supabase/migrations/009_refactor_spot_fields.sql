-- supabase/migrations/009_refactor_spot_fields.sql

ALTER TABLE trades RENAME COLUMN pair TO token;
ALTER TABLE trades RENAME COLUMN exchange TO network;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE trades DROP COLUMN IF EXISTS side;

-- Rename the index
ALTER INDEX IF EXISTS idx_trades_pair RENAME TO idx_trades_token;
