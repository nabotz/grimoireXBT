import { useQuery } from '@tanstack/react-query';
import { Swords, TrendingUp, BarChart2, Target, Flame, Zap, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useTradesList, useAllEmotions } from '../hooks/useTrades';
import { getLevelInfo, getXPProgress, getNextLevel } from '../engine/levelSystem';
import { computeAllAxes, computeOverallScore } from '../engine/hexaStatsAggregator';
import { TIER_COLORS } from '../config/levelThresholds';
import { formatCurrency } from '../lib/formatters';
import type { PlayerProfile } from '../types/player';

// ── Rank tier glow colors ─────────────────────────────────────────────────────

const TIER_GLOW: Record<string, string> = {
  bronze:   'shadow-[0_0_24px_rgba(205,127,50,0.25)]  border-[#CD7F32]/40',
  silver:   'shadow-[0_0_24px_rgba(192,192,192,0.25)] border-[#C0C0C0]/40',
  gold:     'shadow-[0_0_24px_rgba(255,215,0,0.30)]   border-[#FFD700]/40',
  platinum: 'shadow-[0_0_24px_rgba(229,228,226,0.25)] border-[#E5E4E2]/40',
  diamond:  'shadow-[0_0_32px_rgba(185,242,255,0.35)] border-[#B9F2FF]/50',
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold font-mono text-gray-100">{value}</p>
      </div>
    </div>
  );
}

// ── Hexa axis bar ─────────────────────────────────────────────────────────────

const AXIS_LABELS: Record<string, string> = {
  profitability:   'Profitability',
  risk_management: 'Risk Mgmt',
  consistency:     'Consistency',
  discipline:      'Discipline',
  emotional_ctrl:  'Emotion',
  execution:       'Execution',
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user } = useSupabaseAuth();
  const { data: trades = [] } = useTradesList();
  const { data: emotions = [] } = useAllEmotions();

  const { data: profile, isLoading } = useQuery<PlayerProfile>({
    queryKey: ['player', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Compute live hexa scores from trades (more up-to-date than DB cache)
  const hexaScores = computeAllAxes(trades, emotions);
  const overallScore = computeOverallScore(hexaScores);

  const totalXP    = profile?.total_xp ?? 0;
  const levelInfo  = getLevelInfo(totalXP);
  const xpProgress = getXPProgress(totalXP);
  const nextLevel  = getNextLevel(totalXP);
  const tierColor  = TIER_COLORS[levelInfo.rankTier] ?? '#a855f7';
  const tierGlow   = TIER_GLOW[levelInfo.rankTier] ?? '';

  const closed   = trades.filter(t => t.status === 'closed');
  const wins     = closed.filter(t => (t.pnl ?? 0) > 0);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winRate  = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Character Card ── */}
      <div className={`bg-gray-900/70 border rounded-2xl p-6 ${tierGlow}`}>
        <div className="flex items-center gap-5">

          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border-2"
            style={{ background: `${tierColor}18`, borderColor: `${tierColor}50` }}
          >
            <Swords size={36} style={{ color: tierColor }} />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-100 truncate">
                {profile?.display_name ?? user?.email?.split('@')[0] ?? 'Trader'}
              </h1>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                style={{ color: tierColor, borderColor: `${tierColor}50`, background: `${tierColor}15` }}
              >
                {levelInfo.rankTitle}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Level {levelInfo.level} · {levelInfo.rankTier.charAt(0).toUpperCase() + levelInfo.rankTier.slice(1)} Tier</p>

            {/* XP Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <Zap size={11} className="text-purple-400" />
                  {totalXP.toLocaleString()} XP
                </span>
                {nextLevel ? (
                  <span className="text-gray-600">{nextLevel.xpRequired.toLocaleString()} XP → Lv.{nextLevel.level}</span>
                ) : (
                  <span className="text-amber-400 text-xs">MAX LEVEL</span>
                )}
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${xpProgress.percent}%`,
                    background: `linear-gradient(90deg, ${tierColor}aa, ${tierColor})`,
                  }}
                />
              </div>
              {nextLevel && (
                <p className="text-xs text-gray-600 mt-1">
                  {xpProgress.current.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP to next level
                </p>
              )}
            </div>
          </div>

          {/* Overall score badge */}
          <div className="text-center shrink-0">
            <div
              className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border"
              style={{ background: `${tierColor}12`, borderColor: `${tierColor}40` }}
            >
              <span className="text-2xl font-bold" style={{ color: tierColor }}>{overallScore}</span>
              <span className="text-[10px] text-gray-500">score</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Hexa</p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total PnL"
          value={formatCurrency(totalPnl)}
          icon={<TrendingUp size={16} />}
          color={totalPnl >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}
        />
        <StatCard
          label="Win Rate"
          value={closed.length > 0 ? `${winRate}%` : '—'}
          icon={<Target size={16} />}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Total Trades"
          value={String(trades.length)}
          icon={<BarChart2 size={16} />}
          color="bg-purple-500/15 text-purple-400"
        />
        <StatCard
          label="Best Streak"
          value={profile?.best_streak ? `${profile.best_streak}W` : '—'}
          icon={<Flame size={16} />}
          color="bg-amber-500/15 text-amber-400"
        />
      </div>

      {/* ── Hexa Axis Breakdown ── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Star size={15} className="text-purple-400" />
          <h2 className="text-sm font-medium text-gray-300">Hexa Performance Axes</h2>
        </div>
        {Object.entries(hexaScores).map(([key, val]) => {
          const barColor = val >= 70 ? '#a855f7' : val >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-28 shrink-0">{AXIS_LABELS[key]}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${val}%`, background: barColor }}
                />
              </div>
              <span className="text-xs font-mono text-gray-400 w-8 text-right">{val}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
