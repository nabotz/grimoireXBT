export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface PlayerProfile {
  id: string;
  user_id: string;

  // Identity
  display_name: string;
  avatar_url?: string;

  // Level system
  total_xp: number;
  level: number;
  rank_title: string;

  // Cumulative stats
  total_trades: number;
  total_wins: number;
  total_losses: number;
  total_pnl: number;
  best_streak: number;
  current_streak: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;

  // Hexa axes (0-100)
  profitability: number;
  risk_management: number;
  consistency: number;
  discipline: number;
  emotional_ctrl: number;
  execution: number;

  overall_score: number;
  last_computed: string;
  updated_at: string;
}
