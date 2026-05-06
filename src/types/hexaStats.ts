export type HexaAxis =
  | 'profitability'
  | 'risk_management'
  | 'consistency'
  | 'discipline'
  | 'emotional_ctrl'
  | 'execution';

export type HexaScores = Record<HexaAxis, number>; // 0-100 each

export interface HexaConfig {
  windowSize: number; // how many recent trades to consider
}
