import type { SkillNodeDef } from '../types/skillTree';
import type { HexaScores } from '../types/hexaStats';
import { SKILL_TREE } from '../config/skillTreeDefs';

export interface UnlockResult {
  canUnlock: boolean;
  reasons: string[];
}

/**
 * Check whether a skill node can be unlocked by the player.
 * Validates: level requirement, hexa stat threshold, prerequisite chain.
 */
export function canUnlockNode(
  node: SkillNodeDef,
  playerLevel: number,
  hexaStats: HexaScores,
  unlockedNodes: string[]
): UnlockResult {
  const reasons: string[] = [];

  if (playerLevel < node.requiredLevel) {
    reasons.push(`Requires level ${node.requiredLevel} (you are level ${playerLevel})`);
  }

  if (node.requiredHexaStat) {
    const { axis, minScore } = node.requiredHexaStat;
    const current = hexaStats[axis];
    if (current < minScore) {
      const label = axis.replace('_', ' ');
      reasons.push(`Requires ${label} ≥ ${minScore} (yours: ${current})`);
    }
  }

  for (const prereq of node.prerequisiteKeys) {
    if (!unlockedNodes.includes(prereq)) {
      const prereqNode = SKILL_TREE.find(n => n.key === prereq);
      reasons.push(`Requires: ${prereqNode?.name ?? prereq}`);
    }
  }

  return { canUnlock: reasons.length === 0, reasons };
}

/**
 * Returns all nodes that are currently available to unlock
 * (not yet unlocked, and all conditions pass).
 */
export function getAvailableNodes(
  playerLevel: number,
  hexaStats: HexaScores,
  unlockedNodes: string[]
): SkillNodeDef[] {
  return SKILL_TREE.filter(
    node =>
      !unlockedNodes.includes(node.key) &&
      canUnlockNode(node, playerLevel, hexaStats, unlockedNodes).canUnlock
  );
}

/**
 * Returns all skill tree nodes grouped by branch.
 */
export function getNodesByBranch(): Record<string, SkillNodeDef[]> {
  return SKILL_TREE.reduce((acc, node) => {
    if (!acc[node.branch]) acc[node.branch] = [];
    acc[node.branch].push(node);
    return acc;
  }, {} as Record<string, SkillNodeDef[]>);
}

/**
 * Check if a specific feature is unlocked (used to gate UI features).
 */
export function isFeatureUnlocked(feature: string, unlockedNodes: string[]): boolean {
  const node = SKILL_TREE.find(n => n.feature === feature);
  if (!node) return true; // No gate = always available
  return unlockedNodes.includes(node.key);
}
