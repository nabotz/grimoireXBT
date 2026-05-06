export const XP_CONFIG = {
  // Base XP per closed trade
  baseXP: 20,

  // Win/loss modifiers
  winBonus: 30,
  lossConsolation: 10,

  // Risk:Reward bonuses
  rrExcellent: { threshold: 2.0, bonus: 25 },
  rrGood:      { threshold: 1.5, bonus: 15 },
  rrOk:        { threshold: 1.0, bonus: 5 },

  // Plan adherence (actual R:R / planned R:R within range)
  planAdherenceMin: 0.8,
  planAdherenceMax: 1.3,
  planAdherenceBonus: 20,

  // Emotional discipline
  zenTradeBonus: 15,       // no negatives + positives present
  emotionalPenalty: -10,   // any negative tag

  // Journaling
  notesMinLength: 50,
  notesBonus: 10,

  // Setup type
  setupBonus: 5,

  // Minimum XP floor
  minimumXP: 10,
};

export const XP_SOURCES = {
  trade:        { min: 10, max: 120 },
  achievement:  { min: 50, max: 500 },
  streakBonus:  'streak × 5',
  journalEntry: 15,
  dailyLogin:   5,
} as const;
