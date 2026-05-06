export type EmotionType =
  // Positive
  | 'focused' | 'patient' | 'confident' | 'calm'
  // Negative
  | 'fomo' | 'revenge' | 'tilt' | 'oversize'
  // Neutral-negative
  | 'hesitant' | 'anxious' | 'greedy' | 'bored';

export interface EmotionTag {
  id: string;
  user_id: string;
  trade_id: string;
  tag: EmotionType;
  intensity: number; // 1-10
  created_at: string;
}
