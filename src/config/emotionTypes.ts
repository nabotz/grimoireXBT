import type { EmotionType } from '../types/emotion';

export const EMOTION_WEIGHTS: Record<EmotionType, number> = {
  // Positive (add to score)
  focused:   +3,
  patient:   +3,
  confident: +2,
  calm:      +2,

  // Negative (subtract from score)
  fomo:      -4,
  revenge:   -5,
  tilt:      -5,
  oversize:  -3,
  greedy:    -3,

  // Neutral-negative (mild penalty)
  hesitant:  -1,
  anxious:   -2,
  bored:     -1,
};

export const POSITIVE_EMOTIONS: EmotionType[] = ['focused', 'patient', 'confident', 'calm'];
export const NEGATIVE_EMOTIONS: EmotionType[] = ['fomo', 'revenge', 'tilt', 'oversize', 'greedy'];
export const NEUTRAL_NEGATIVE_EMOTIONS: EmotionType[] = ['hesitant', 'anxious', 'bored'];
