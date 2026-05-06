import type { Trade } from './trade';
import type { EmotionTag } from './emotion';
import type { PlayerProfile, PlayerStats } from './player';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementContext {
  trades: Trade[];
  profile: PlayerProfile;
  stats: PlayerStats;
  emotions: EmotionTag[];
  recentTrade: Trade;
}

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string;       // Lucide icon name
  rarity: Rarity;
  xpReward: number;
  condition: (context: AchievementContext) => boolean;
}

export interface AchievementLog {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
  trigger_trade_id?: string;
}
