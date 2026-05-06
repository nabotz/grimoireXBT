import type { RankTier } from '../types/player';

export interface LevelDef {
  level: number;
  xpRequired: number;
  rankTitle: string;
  rankTier: RankTier;
}

export const LEVEL_TABLE: LevelDef[] = [
  { level: 1,  xpRequired: 0,     rankTitle: 'Novice',      rankTier: 'bronze'   },
  { level: 2,  xpRequired: 100,   rankTitle: 'Novice',      rankTier: 'bronze'   },
  { level: 3,  xpRequired: 250,   rankTitle: 'Novice',      rankTier: 'bronze'   },
  { level: 4,  xpRequired: 500,   rankTitle: 'Apprentice',  rankTier: 'bronze'   },
  { level: 5,  xpRequired: 800,   rankTitle: 'Apprentice',  rankTier: 'bronze'   },
  { level: 6,  xpRequired: 1200,  rankTitle: 'Apprentice',  rankTier: 'silver'   },
  { level: 7,  xpRequired: 1700,  rankTitle: 'Journeyman',  rankTier: 'silver'   },
  { level: 8,  xpRequired: 2300,  rankTitle: 'Journeyman',  rankTier: 'silver'   },
  { level: 9,  xpRequired: 3000,  rankTitle: 'Journeyman',  rankTier: 'silver'   },
  { level: 10, xpRequired: 3800,  rankTitle: 'Adept',       rankTier: 'silver'   },
  { level: 11, xpRequired: 4800,  rankTitle: 'Adept',       rankTier: 'gold'     },
  { level: 12, xpRequired: 6000,  rankTitle: 'Adept',       rankTier: 'gold'     },
  { level: 13, xpRequired: 7500,  rankTitle: 'Specialist',  rankTier: 'gold'     },
  { level: 14, xpRequired: 9200,  rankTitle: 'Specialist',  rankTier: 'gold'     },
  { level: 15, xpRequired: 11200, rankTitle: 'Specialist',  rankTier: 'gold'     },
  { level: 16, xpRequired: 13500, rankTitle: 'Expert',      rankTier: 'platinum' },
  { level: 17, xpRequired: 16200, rankTitle: 'Expert',      rankTier: 'platinum' },
  { level: 18, xpRequired: 19500, rankTitle: 'Expert',      rankTier: 'platinum' },
  { level: 19, xpRequired: 23500, rankTitle: 'Master',      rankTier: 'platinum' },
  { level: 20, xpRequired: 28000, rankTitle: 'Master',      rankTier: 'diamond'  },
  { level: 21, xpRequired: 33500, rankTitle: 'Grandmaster', rankTier: 'diamond'  },
  { level: 22, xpRequired: 40000, rankTitle: 'Grandmaster', rankTier: 'diamond'  },
  { level: 23, xpRequired: 48000, rankTitle: 'Legend',      rankTier: 'diamond'  },
  { level: 24, xpRequired: 58000, rankTitle: 'Legend',      rankTier: 'diamond'  },
  { level: 25, xpRequired: 70000, rankTitle: 'Mythic',      rankTier: 'diamond'  },
];

export const TIER_COLORS: Record<RankTier, string> = {
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#FFD700',
  platinum: '#E5E4E2',
  diamond:  '#B9F2FF',
};
