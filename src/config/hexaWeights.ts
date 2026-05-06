import type { HexaConfig } from '../types/hexaStats';

export const HEXA_CONFIG: HexaConfig = {
  windowSize: 50,
};

// Score formula weights per axis
export const HEXA_WEIGHTS = {
  profitability: {
    profitFactorMax: 60,   // PF of 2.0 = 50 pts
    expectancyMax: 25,
    trendBonus: 15,
  },
  riskManagement: {
    drawdownMax: 40,
    sharpeMax: 30,
    lossRatioMax: 30,
  },
  consistency: {
    winRateMax: 50,        // 50% WR = 50 pts
    streakStabilityMax: 30,
    frequencyMax: 20,
  },
  discipline: {
    rrAdherenceMax: 40,
    planFollowMax: 30,
    notesRateMax: 30,
  },
  emotionalCtrl: {
    negativeRateMax: 50,
    positiveRateMax: 25,
    tiltFreeBonus: 15,
    fomoControlledBonus: 10,
  },
  execution: {
    entryQualityMax: 35,
    exitQualityMax: 35,
    sizingConsistencyMax: 30,
  },
} as const;
