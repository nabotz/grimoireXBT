import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Lock,
  Flame, ShieldCheck, Map, Brain, EyeOff, Sword,
  Coins, Gem, BarChart3, Hammer, PenLine, Crown, Star, Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useTradesList, useAllEmotions } from '../hooks/useTrades';
import { getAllAchievements } from '../engine/achievementEngine';
import { formatDate } from '../lib/formatters';
import type { AchievementLog } from '../types/achievement';

// ── Icon map (Lucide name → component) ────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Flame:       <Flame size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
  Map:         <Map size={20} />,
  Brain:       <Brain size={20} />,
  EyeOff:      <EyeOff size={20} />,
  Sword:       <Sword size={20} />,
  Coins:       <Coins size={20} />,
  Gem:         <Gem size={20} />,
  BarChart3:   <BarChart3 size={20} />,
  Hammer:      <Hammer size={20} />,
  PenLine:     <PenLine size={20} />,
  Crown:       <Crown size={20} />,
};

// ── Rarity config ─────────────────────────────────────────────────────────────

const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#9ca3af', glow: 'shadow-[0_0_16px_rgba(156,163,175,0.2)]', border: 'border-gray-600/40',   bg: 'bg-gray-500/10' },
  rare:      { label: 'Rare',      color: '#60a5fa', glow: 'shadow-[0_0_16px_rgba(96,165,250,0.25)]', border: 'border-blue-500/40',   bg: 'bg-blue-500/10' },
  epic:      { label: 'Epic',      color: '#a855f7', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.30)]', border: 'border-purple-500/40', bg: 'bg-purple-500/10' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'shadow-[0_0_28px_rgba(245,158,11,0.40)]', border: 'border-amber-500/50',  bg: 'bg-amber-500/12' },
} as const;

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Achievements() {
  const { user } = useSupabaseAuth();
  const { data: trades = [] } = useTradesList();
  const { data: emotions = [] } = useAllEmotions();

  // Fetch unlocked achievements from DB
  const { data: logs = [], isLoading } = useQuery<AchievementLog[]>({
    queryKey: ['achievements_log', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements_log')
        .select('*')
        .eq('user_id', user!.id)
        .order('unlocked_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const unlockedKeys = useMemo(() => new Set(logs.map(l => l.achievement_key)), [logs]);
  const allDefs = getAllAchievements();

  // Sort: unlocked first (legendary → common), then locked (legendary → common)
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sorted = useMemo(() => {
    const unlocked = allDefs.filter(a => unlockedKeys.has(a.key)).sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    const locked   = allDefs.filter(a => !unlockedKeys.has(a.key)).sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    return [...unlocked, ...locked];
  }, [allDefs, unlockedKeys]);

  const unlockedCount = unlockedKeys.size;
  const totalCount    = allDefs.length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-600/20">
            <Trophy size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Achievements</h1>
            <p className="text-sm text-gray-500">Badge gallery & milestones</p>
          </div>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
          <Star size={14} className="text-amber-400" />
          <span className="text-sm font-mono text-gray-300">
            <span className="text-amber-400 font-bold">{unlockedCount}</span>
            <span className="text-gray-600"> / {totalCount}</span>
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">{totalCount - unlockedCount} achievements remaining</p>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Achievement grid ── */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map(achievement => {
            const isUnlocked = unlockedKeys.has(achievement.key);
            const log = logs.find(l => l.achievement_key === achievement.key);
            const cfg = RARITY_CONFIG[achievement.rarity];
            const icon = ICON_MAP[achievement.icon] ?? <Trophy size={20} />;

            return (
              <div
                key={achievement.key}
                className={`relative border rounded-xl p-4 transition-all duration-200 ${
                  isUnlocked
                    ? `${cfg.border} ${cfg.glow} bg-gray-900/60`
                    : 'border-gray-800/50 bg-gray-900/30 opacity-50 grayscale'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${isUnlocked ? cfg.bg : 'bg-gray-800/40'}`}
                    style={{ color: isUnlocked ? cfg.color : '#4b5563' }}
                  >
                    {isUnlocked ? icon : <Lock size={20} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${isUnlocked ? 'text-gray-100' : 'text-gray-500'}`}>
                        {achievement.name}
                      </p>
                      {/* Rarity badge */}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                        style={{
                          color: isUnlocked ? cfg.color : '#6b7280',
                          background: isUnlocked ? `${cfg.color}18` : '#374151',
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {achievement.description}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* XP reward */}
                      <div className="flex items-center gap-1 text-xs">
                        <Zap size={11} className={isUnlocked ? 'text-purple-400' : 'text-gray-600'} />
                        <span className={isUnlocked ? 'text-purple-400 font-mono' : 'text-gray-600 font-mono'}>
                          +{achievement.xpReward} XP
                        </span>
                      </div>

                      {/* Unlock date */}
                      {isUnlocked && log && (
                        <span className="text-xs text-gray-600">{formatDate(log.unlocked_at)}</span>
                      )}
                      {!isUnlocked && (
                        <span className="text-xs text-gray-700">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
