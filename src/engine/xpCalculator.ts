import type { Trade } from '../types/trade';
import type { EmotionTag } from '../types/emotion';
import { XP_CONFIG } from '../config/xpTable';
import { NEGATIVE_EMOTIONS, POSITIVE_EMOTIONS } from '../config/emotionTypes';

export interface XPBonus {
  type: string;
  amount: number;
  reason: string;
}

export interface XPPenalty {
  type: string;
  amount: number;
  reason: string;
}

export interface XPCalculation {
  baseXP: number;
  bonuses: XPBonus[];
  penalties: XPPenalty[];
  totalXP: number;
}

export function calculateTradeXP(trade: Trade, emotions: EmotionTag[]): XPCalculation {
  const bonuses: XPBonus[] = [];
  const penalties: XPPenalty[] = [];

  // Only closed trades earn XP
  if (trade.status !== 'closed') {
    return { baseXP: 0, bonuses: [], penalties: [], totalXP: 0 };
  }

  const baseXP = XP_CONFIG.baseXP;

  // 1. Win / Loss modifier
  if (trade.pnl !== undefined && trade.pnl !== null) {
    if (trade.pnl > 0) {
      bonuses.push({ type: 'win', amount: XP_CONFIG.winBonus, reason: 'Winning trade' });
    } else {
      bonuses.push({ type: 'loss', amount: XP_CONFIG.lossConsolation, reason: 'Completed trade (loss)' });
    }
  }

  // 2. Risk:Reward quality
  if (trade.risk_reward !== undefined && trade.risk_reward !== null) {
    const rr = trade.risk_reward;
    if (rr >= XP_CONFIG.rrExcellent.threshold) {
      bonuses.push({ type: 'rr_excellent', amount: XP_CONFIG.rrExcellent.bonus, reason: `R:R ≥ ${XP_CONFIG.rrExcellent.threshold}` });
    } else if (rr >= XP_CONFIG.rrGood.threshold) {
      bonuses.push({ type: 'rr_good', amount: XP_CONFIG.rrGood.bonus, reason: `R:R ≥ ${XP_CONFIG.rrGood.threshold}` });
    } else if (rr >= XP_CONFIG.rrOk.threshold) {
      bonuses.push({ type: 'rr_ok', amount: XP_CONFIG.rrOk.bonus, reason: `R:R ≥ ${XP_CONFIG.rrOk.threshold}` });
    }
  }

  // 3. Plan adherence — actual R:R within ±20% of planned R:R
  if (trade.planned_rr && trade.risk_reward) {
    const adherence = trade.risk_reward / trade.planned_rr;
    if (adherence >= XP_CONFIG.planAdherenceMin && adherence <= XP_CONFIG.planAdherenceMax) {
      bonuses.push({ type: 'plan_followed', amount: XP_CONFIG.planAdherenceBonus, reason: 'Followed trade plan' });
    }
  }

  // 4. Emotional discipline
  const negatives = emotions.filter(e => NEGATIVE_EMOTIONS.includes(e.tag as typeof NEGATIVE_EMOTIONS[number]));
  const positives = emotions.filter(e => POSITIVE_EMOTIONS.includes(e.tag as typeof POSITIVE_EMOTIONS[number]));

  if (negatives.length === 0 && positives.length > 0) {
    bonuses.push({ type: 'zen_trade', amount: XP_CONFIG.zenTradeBonus, reason: 'Clean emotional state' });
  }
  if (negatives.length > 0) {
    penalties.push({ type: 'emotional', amount: XP_CONFIG.emotionalPenalty, reason: 'Negative emotional tags' });
  }

  // 5. Notes bonus (journaling = awareness)
  if (trade.notes && trade.notes.length > XP_CONFIG.notesMinLength) {
    bonuses.push({ type: 'journaled', amount: XP_CONFIG.notesBonus, reason: 'Detailed trade notes' });
  }

  // 6. Setup type bonus (structured = disciplined)
  if (trade.setup_type) {
    bonuses.push({ type: 'setup_defined', amount: XP_CONFIG.setupBonus, reason: 'Named setup type' });
  }

  const bonusTotal = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const penaltyTotal = penalties.reduce((sum, p) => sum + p.amount, 0);
  const totalXP = Math.max(XP_CONFIG.minimumXP, baseXP + bonusTotal + penaltyTotal);

  return { baseXP, bonuses, penalties, totalXP };
}
