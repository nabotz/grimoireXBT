export type TradeSide = 'long' | 'short';
export type AssetType = 'perp' | 'spot' | 'defi';
export type TradeStatus = 'open' | 'closed' | 'cancelled';

export interface Trade {
  id: string;
  user_id: string;

  // Trade data
  pair: string;
  side: TradeSide;
  asset_type: AssetType;
  exchange?: string;

  // Prices & sizing
  entry_price: number;
  exit_price?: number;
  position_size: number;
  leverage: number;

  // Results
  pnl?: number;
  pnl_percent?: number;
  risk_reward?: number;
  planned_rr?: number;

  // Meta
  status: TradeStatus;
  entry_date: string;
  exit_date?: string;
  duration_mins?: number;

  // Notes
  setup_type?: string;
  notes?: string;
  screenshot_url?: string;

  // RPG
  xp_earned: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TradeInput {
  pair: string;
  side: TradeSide;
  asset_type: AssetType;
  exchange?: string;
  entry_price: number;
  exit_price?: number;
  position_size: number;
  leverage?: number;
  pnl?: number;
  planned_rr?: number;
  setup_type?: string;
  notes?: string;
  emotions?: string[];
}
