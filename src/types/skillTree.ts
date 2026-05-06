import type { HexaAxis } from './hexaStats';

export type SkillBranch = 'analysis' | 'risk' | 'psychology' | 'execution';

export interface SkillNodeDef {
  key: string;
  name: string;
  description: string;
  branch: SkillBranch;
  tier: 1 | 2 | 3 | 4 | 5;
  icon: string; // Lucide icon name
  requiredLevel: number;
  requiredHexaStat?: { axis: HexaAxis; minScore: number };
  prerequisiteKeys: string[];
  feature: string; // what app feature this unlocks
}

export interface SkillState {
  node_key: string;
  unlocked_at: string;
}
