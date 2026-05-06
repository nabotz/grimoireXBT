import type { AchievementDef, AchievementContext } from '../types/achievement';
import { ACHIEVEMENTS } from '../config/achievementDefs';

/**
 * Check which achievements are newly triggered.
 * Returns only achievements that are NOT already unlocked and whose condition passes.
 */
export function checkAchievements(
  context: AchievementContext,
  alreadyUnlocked: string[]
): AchievementDef[] {
  return ACHIEVEMENTS.filter(
    a => !alreadyUnlocked.includes(a.key) && a.condition(context)
  );
}

/**
 * Returns all achievement definitions (for display in the Achievements page).
 */
export function getAllAchievements(): AchievementDef[] {
  return ACHIEVEMENTS;
}

/**
 * Returns unlocked achievements sorted by rarity (legendary first).
 */
export function getSortedUnlocked(unlocked: string[]): AchievementDef[] {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  return ACHIEVEMENTS
    .filter(a => unlocked.includes(a.key))
    .sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
}
