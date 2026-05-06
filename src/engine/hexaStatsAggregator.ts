import type { Trade } from '../types/trade';
import type { EmotionTag } from '../types/emotion';
import type { HexaScores } from '../types/hexaStats';
import { HEXA_CONFIG, HEXA_WEIGHTS } from '../config/hexaWeights';
import { NEGATIVE_EMOTIONS, POSITIVE_EMOTIONS } from '../config/emotionTypes';

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
}

function scoreProfitability(trades: Trade[]): number {
  const w = HEXA_WEIGHTS.profitability;
  const closed = trades.filter(t => t.status === 'closed' && t.pnl != null);
  if (!closed.length) return 50;
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(closed.filter(t => (t.pnl ?? 0) < 0).reduce((s, t) => s + (t.pnl ?? 0), 0));
  const pf = grossLoss === 0 ? (grossProfit > 0 ? 4 : 1) : grossProfit / grossLoss;
  const wr = wins.length / closed.length;
  const avgW = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgL = closed.length - wins.length > 0 ? grossLoss / (closed.length - wins.length) : 0;
  const exp = wr * avgW - (1 - wr) * avgL;
  const expNorm = clamp(exp / Math.max(avgW, 1), 0, 1);
  const q = Math.max(1, Math.floor(closed.length / 4));
  const trendBonus = closed.slice(-q).reduce((s, t) => s + (t.pnl ?? 0), 0) > closed.slice(0, q).reduce((s, t) => s + (t.pnl ?? 0), 0) ? w.trendBonus : 0;
  return clamp(Math.round(clamp(pf * 25, 0, w.profitFactorMax) + clamp(expNorm * w.expectancyMax, 0, w.expectancyMax) + trendBonus), 0, 100);
}

function scoreRiskManagement(trades: Trade[]): number {
  const w = HEXA_WEIGHTS.riskManagement;
  const closed = trades.filter(t => t.status === 'closed' && t.pnl != null);
  if (!closed.length) return 50;
  let peak = 0, run = 0, maxDD = 0;
  for (const t of closed) { run += t.pnl ?? 0; if (run > peak) peak = run; const dd = peak > 0 ? (peak - run) / peak : 0; if (dd > maxDD) maxDD = dd; }
  const pnls = closed.map(t => t.pnl ?? 0);
  const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const sharpe = clamp(stdDev(pnls) === 0 ? 0 : mean / stdDev(pnls), -2, 4);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) < 0);
  const avgW = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 1;
  const avgL = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
  const lossRatio = clamp(avgL / Math.max(avgW, 1), 0, 2);
  return clamp(Math.round(clamp((1 - maxDD) * w.drawdownMax, 0, w.drawdownMax) + clamp(sharpe * (w.sharpeMax / 4), 0, w.sharpeMax) + clamp((1 - lossRatio / 2) * w.lossRatioMax, 0, w.lossRatioMax)), 0, 100);
}

function scoreConsistency(trades: Trade[]): number {
  const w = HEXA_WEIGHTS.consistency;
  const closed = trades.filter(t => t.status === 'closed');
  if (!closed.length) return 50;
  const wr = closed.filter(t => (t.pnl ?? 0) > 0).length / closed.length;
  let cur = 0; const streaks: number[] = [];
  for (const t of closed) { if ((t.pnl ?? 0) > 0) { cur++; } else { if (cur > 0) streaks.push(cur); cur = 0; } }
  if (cur > 0) streaks.push(cur);
  const stability = clamp(1 - (streaks.length > 1 ? stdDev(streaks) : 0) / 10, 0, 1);
  const dates = closed.map(t => new Date(t.entry_date).getTime()).sort((a, b) => a - b);
  let freq = 0.5;
  if (dates.length > 2) { const gaps = dates.slice(1).map((d, i) => d - dates[i]); const gm = gaps.reduce((a, b) => a + b, 0) / gaps.length; freq = clamp(1 - (gm === 0 ? 0 : stdDev(gaps) / gm) / 2, 0, 1); }
  return clamp(Math.round(clamp(wr * w.winRateMax * 2, 0, w.winRateMax) + clamp(stability * w.streakStabilityMax, 0, w.streakStabilityMax) + clamp(freq * w.frequencyMax, 0, w.frequencyMax)), 0, 100);
}

function scoreDiscipline(trades: Trade[]): number {
  const w = HEXA_WEIGHTS.discipline;
  const closed = trades.filter(t => t.status === 'closed');
  if (!closed.length) return 50;
  const planned = closed.filter(t => t.planned_rr && t.risk_reward);
  const rrAdh = planned.length > 0 ? planned.filter(t => { const r = (t.risk_reward ?? 0) / (t.planned_rr ?? 1); return r >= 0.8 && r <= 1.3; }).length / planned.length : 0.5;
  const planRate = closed.filter(t => t.setup_type).length / closed.length;
  const notesRate = closed.filter(t => t.notes && t.notes.length > 20).length / closed.length;
  return clamp(Math.round(clamp(rrAdh * w.rrAdherenceMax, 0, w.rrAdherenceMax) + clamp(planRate * w.planFollowMax, 0, w.planFollowMax) + clamp(notesRate * w.notesRateMax, 0, w.notesRateMax)), 0, 100);
}

function scoreEmotionalControl(trades: Trade[], emotions: EmotionTag[]): number {
  const w = HEXA_WEIGHTS.emotionalCtrl;
  const closed = trades.filter(t => t.status === 'closed');
  if (!closed.length) return 50;
  const ids = new Set(closed.map(t => t.id));
  const rel = emotions.filter(e => ids.has(e.trade_id));
  const negIds = new Set(rel.filter(e => NEGATIVE_EMOTIONS.includes(e.tag as typeof NEGATIVE_EMOTIONS[number])).map(e => e.trade_id));
  const posIds = new Set(rel.filter(e => POSITIVE_EMOTIONS.includes(e.tag as typeof POSITIVE_EMOTIONS[number])).map(e => e.trade_id));
  let tiltFree = true, consec = 0;
  for (const t of closed) { if (negIds.has(t.id)) { if (++consec >= 2) { tiltFree = false; break; } } else consec = 0; }
  const fomoIds = new Set(rel.filter(e => e.tag === 'fomo').map(e => e.trade_id));
  let fomoOk = true;
  if (fomoIds.size > 0) { const avg = closed.reduce((s, t) => s + (t.pnl ?? 0), 0) / closed.length; const fa = closed.filter(t => fomoIds.has(t.id)).reduce((s, t) => s + (t.pnl ?? 0), 0) / fomoIds.size; fomoOk = fa >= avg * 0.8; }
  return clamp(Math.round(clamp((1 - negIds.size / closed.length) * w.negativeRateMax, 0, w.negativeRateMax) + clamp(posIds.size / closed.length * w.positiveRateMax, 0, w.positiveRateMax) + (tiltFree ? w.tiltFreeBonus : 0) + (fomoOk ? w.fomoControlledBonus : 0)), 0, 100);
}

function scoreExecution(trades: Trade[]): number {
  const w = HEXA_WEIGHTS.execution;
  const closed = trades.filter(t => t.status === 'closed' && t.entry_price && t.exit_price);
  if (!closed.length) return 50;
  const planned = closed.filter(t => t.planned_rr);
  const entryQ = planned.length > 0 ? clamp(planned.filter(t => (t.risk_reward ?? 0) > 0).length / planned.length, 0, 1) : 0.5;
  const exitQ = planned.length > 0 ? clamp(planned.reduce((s, t) => s + clamp((t.risk_reward ?? 0) / (t.planned_rr ?? 1), 0, 1.5), 0) / planned.length / 1.5, 0, 1) : 0.5;
  const sizes = closed.map(t => t.position_size);
  const sm = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const sizeCons = clamp(1 - (sm === 0 ? 1 : stdDev(sizes) / sm), 0, 1);
  return clamp(Math.round(clamp(entryQ * w.entryQualityMax, 0, w.entryQualityMax) + clamp(exitQ * w.exitQualityMax, 0, w.exitQualityMax) + clamp(sizeCons * w.sizingConsistencyMax, 0, w.sizingConsistencyMax)), 0, 100);
}

export function computeAllAxes(allTrades: Trade[], emotions: EmotionTag[], windowSize = HEXA_CONFIG.windowSize): HexaScores {
  const trades = [...allTrades].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()).slice(0, windowSize);
  return {
    profitability:   scoreProfitability(trades),
    risk_management: scoreRiskManagement(trades),
    consistency:     scoreConsistency(trades),
    discipline:      scoreDiscipline(trades),
    emotional_ctrl:  scoreEmotionalControl(trades, emotions),
    execution:       scoreExecution(trades),
  };
}

export function computeOverallScore(scores: HexaScores): number {
  return Math.round((Object.values(scores) as number[]).reduce((a, b) => a + b, 0) / 6);
}
