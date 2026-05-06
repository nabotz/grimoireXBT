import type { EmotionTag } from '../types/emotion';
import { EMOTION_WEIGHTS } from '../config/emotionTypes';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Converts emotion tags into a 0-100 score for the Emotional Control hexa axis.
 * Centered at 50 (neutral). Positive emotions push it up, negative push it down.
 */
export function computeEmotionScore(emotions: EmotionTag[], tradeCount: number): number {
  if (tradeCount === 0) return 50; // neutral default

  const totalWeight = emotions.reduce((sum, e) => {
    const weight = EMOTION_WEIGHTS[e.tag] ?? 0;
    // Multiply by intensity (1-10) normalized to 0.1-1.0 for proportional impact
    const intensityFactor = (e.intensity ?? 5) / 10;
    return sum + weight * intensityFactor;
  }, 0);

  // Normalize to tradeCount and center at 50
  const normalized = (totalWeight / tradeCount) * 10 + 50;
  return clamp(Math.round(normalized), 0, 100);
}

/**
 * Returns breakdown of emotion tag categories for a set of trades
 */
export function getEmotionBreakdown(emotions: EmotionTag[]) {
  const positiveCount = emotions.filter(e => (EMOTION_WEIGHTS[e.tag] ?? 0) > 0).length;
  const negativeCount = emotions.filter(e => (EMOTION_WEIGHTS[e.tag] ?? 0) < 0).length;
  const neutralCount  = emotions.length - positiveCount - negativeCount;

  return { positiveCount, negativeCount, neutralCount, total: emotions.length };
}
