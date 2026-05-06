import { LEVEL_TABLE, type LevelDef } from '../config/levelThresholds';

export type { LevelDef };

/** Get the current level definition for a given total XP amount */
export function getLevelInfo(totalXP: number): LevelDef {
  let current = LEVEL_TABLE[0];
  for (const level of LEVEL_TABLE) {
    if (totalXP >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

/** Get XP progress within the current level bracket */
export function getXPProgress(totalXP: number): {
  current: number;   // XP earned within this level
  needed: number;    // XP needed to reach next level
  percent: number;   // 0-100
} {
  const currentLevel = getLevelInfo(totalXP);
  const currentIndex = LEVEL_TABLE.findIndex(l => l.level === currentLevel.level);
  const nextLevel = LEVEL_TABLE[currentIndex + 1];

  if (!nextLevel) {
    // Max level reached
    return { current: 0, needed: 0, percent: 100 };
  }

  const xpIntoLevel = totalXP - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const percent = Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100));

  return {
    current: xpIntoLevel,
    needed: xpNeededForNext,
    percent,
  };
}

/** Returns the new LevelDef if a level-up occurred, null otherwise */
export function checkLevelUp(previousXP: number, newXP: number): LevelDef | null {
  const prevLevel = getLevelInfo(previousXP);
  const newLevel = getLevelInfo(newXP);
  return newLevel.level > prevLevel.level ? newLevel : null;
}

/** Get the next level definition (null if at max level) */
export function getNextLevel(totalXP: number): LevelDef | null {
  const current = getLevelInfo(totalXP);
  const idx = LEVEL_TABLE.findIndex(l => l.level === current.level);
  return LEVEL_TABLE[idx + 1] ?? null;
}
