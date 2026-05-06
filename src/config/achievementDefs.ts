import type { AchievementDef } from '../types/achievement';

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── STREAK ──
  {
    key: 'hot_streak_3',
    name: 'Hot Streak',
    description: '3 winning trades in a row',
    icon: 'Flame',
    rarity: 'common',
    xpReward: 50,
    condition: (ctx) => ctx.profile.current_streak >= 3,
  },
  {
    key: 'hot_streak_5',
    name: 'On Fire',
    description: '5 winning trades in a row',
    icon: 'Flame',
    rarity: 'rare',
    xpReward: 100,
    condition: (ctx) => ctx.profile.current_streak >= 5,
  },
  {
    key: 'hot_streak_10',
    name: 'Unstoppable',
    description: '10 winning trades in a row',
    icon: 'Flame',
    rarity: 'epic',
    xpReward: 300,
    condition: (ctx) => ctx.profile.current_streak >= 10,
  },

  // ── DISCIPLINE ──
  {
    key: 'iron_discipline_10',
    name: 'Iron Discipline',
    description: '10 trades with R:R ≥ 1.5',
    icon: 'ShieldCheck',
    rarity: 'common',
    xpReward: 75,
    condition: (ctx) => {
      const goodRR = ctx.trades.filter(t => t.risk_reward && t.risk_reward >= 1.5);
      return goodRR.length >= 10;
    },
  },
  {
    key: 'plan_master',
    name: 'Plan Master',
    description: '20 trades with a defined setup type',
    icon: 'Map',
    rarity: 'rare',
    xpReward: 100,
    condition: (ctx) => ctx.trades.filter(t => t.setup_type).length >= 20,
  },

  // ── EMOTIONAL ──
  {
    key: 'zen_master',
    name: 'Zen Master',
    description: '20 trades with no negative emotion tags',
    icon: 'Brain',
    rarity: 'epic',
    xpReward: 200,
    condition: (ctx) => {
      const cleanTrades = ctx.trades.filter(t => {
        const tradeEmotions = ctx.emotions.filter(e => e.trade_id === t.id);
        if (tradeEmotions.length === 0) return false;
        return tradeEmotions.every(e =>
          ['focused', 'patient', 'calm', 'confident'].includes(e.tag)
        );
      });
      return cleanTrades.length >= 20;
    },
  },
  {
    key: 'no_fomo_week',
    name: 'FOMO Free',
    description: 'One week of trades with no FOMO tags',
    icon: 'EyeOff',
    rarity: 'rare',
    xpReward: 100,
    condition: (ctx) => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentTrades = ctx.trades.filter(t =>
        new Date(t.entry_date).getTime() > oneWeekAgo
      );
      if (recentTrades.length < 3) return false;
      const fomoTrades = ctx.emotions.filter(e =>
        e.tag === 'fomo' && recentTrades.some(t => t.id === e.trade_id)
      );
      return fomoTrades.length === 0;
    },
  },

  // ── PROFIT MILESTONES ──
  {
    key: 'first_blood',
    name: 'First Blood',
    description: 'Close your first winning trade',
    icon: 'Sword',
    rarity: 'common',
    xpReward: 50,
    condition: (ctx) => ctx.profile.total_wins >= 1,
  },
  {
    key: 'thousand_club',
    name: 'Thousand Club',
    description: 'Reach $1,000 total PnL',
    icon: 'Coins',
    rarity: 'rare',
    xpReward: 150,
    condition: (ctx) => ctx.profile.total_pnl >= 1000,
  },
  {
    key: 'ten_thousand',
    name: 'Five Figures',
    description: 'Reach $10,000 total PnL',
    icon: 'Gem',
    rarity: 'epic',
    xpReward: 500,
    condition: (ctx) => ctx.profile.total_pnl >= 10000,
  },

  // ── VOLUME ──
  {
    key: 'centurion',
    name: 'Centurion',
    description: 'Log 100 trades',
    icon: 'BarChart3',
    rarity: 'rare',
    xpReward: 150,
    condition: (ctx) => ctx.profile.total_trades >= 100,
  },
  {
    key: 'grinder',
    name: 'Grinder',
    description: 'Log 500 trades',
    icon: 'Hammer',
    rarity: 'epic',
    xpReward: 300,
    condition: (ctx) => ctx.profile.total_trades >= 500,
  },

  // ── JOURNALING ──
  {
    key: 'scribe',
    name: 'Scribe',
    description: 'Write notes on 10 consecutive trades',
    icon: 'PenLine',
    rarity: 'common',
    xpReward: 75,
    condition: (ctx) => {
      const sorted = [...ctx.trades].sort((a, b) =>
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );
      let streak = 0;
      for (const t of sorted) {
        if (t.notes && t.notes.length > 20) streak++;
        else break;
      }
      return streak >= 10;
    },
  },

  // ── LEGENDARY ──
  {
    key: 'trader_legend',
    name: 'Trader Legend',
    description: 'Reach level 20',
    icon: 'Crown',
    rarity: 'legendary',
    xpReward: 500,
    condition: (ctx) => ctx.profile.level >= 20,
  },
];
