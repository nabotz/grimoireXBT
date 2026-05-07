import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, BarChart2, Zap, Plus } from 'lucide-react';
import { useTradesList, useAllEmotions } from '../hooks/useTrades';
import { computeAllAxes, computeOverallScore } from '../engine/hexaStatsAggregator';
import { formatCurrency, formatPercent, formatDate, pnlColor } from '../lib/formatters';
import Badge from '../components/shared/Badge';

// ── Metric card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ label, value, sub, icon, color }: MetricCardProps) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-100 font-mono truncate">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Hex axis labels ───────────────────────────────────────────────────────────

const AXIS_LABELS: Record<string, string> = {
  profitability:   'Profit',
  risk_management: 'Risk',
  consistency:     'Consistency',
  discipline:      'Discipline',
  emotional_ctrl:  'Emotion',
  execution:       'Execution',
};

const AXIS_ICONS: Record<string, React.ReactNode> = {
  profitability:   <TrendingUp size={12} />,
  risk_management: <Activity size={12} />,
  consistency:     <BarChart2 size={12} />,
  discipline:      <Target size={12} />,
  emotional_ctrl:  <Zap size={12} />,
  execution:       <Zap size={12} />,
};

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 70 ? '#a855f7' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-100">{score}</span>
        <p className="text-xs text-gray-500">/100</p>
      </div>
    </div>
  );
}

// ── Custom radar tooltip ──────────────────────────────────────────────────────

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { subject, value } = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 shadow-xl">
      <span className="text-gray-400">{subject}: </span>
      <span className="font-bold text-purple-300">{value}</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: trades = [], isLoading } = useTradesList();
  const { data: emotions = [] } = useAllEmotions();

  const hexaScores = useMemo(() => computeAllAxes(trades, emotions), [trades, emotions]);
  const overallScore = useMemo(() => computeOverallScore(hexaScores), [hexaScores]);

  const closed = trades.filter(t => t.status === 'closed' && t.pnl != null);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgRR = closed.filter(t => t.risk_reward).reduce((s, t, _, arr) =>
    s + (t.risk_reward ?? 0) / arr.length, 0);
  const recentTrades = trades.slice(0, 6);

  const radarData = Object.entries(hexaScores).map(([key, value]) => ({
    subject: AXIS_LABELS[key] ?? key,
    value,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500">Your trading performance at a glance</p>
        </div>
        <button
          onClick={() => navigate('/trades/new')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Log Trade
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total PnL"
          value={formatCurrency(totalPnl)}
          sub={`${closed.length} closed trades`}
          icon={totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          color={totalPnl >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}
        />
        <MetricCard
          label="Win Rate"
          value={closed.length > 0 ? formatPercent(winRate, 1).replace('+', '') : '—'}
          sub={`${wins.length}W / ${closed.length - wins.length}L`}
          icon={<Target size={16} />}
          color="bg-blue-500/15 text-blue-400"
        />
        <MetricCard
          label="Avg R:R"
          value={avgRR > 0 ? `${avgRR.toFixed(2)}R` : '—'}
          sub="Actual risk/reward"
          icon={<Activity size={16} />}
          color="bg-amber-500/15 text-amber-400"
        />
        <MetricCard
          label="Total Trades"
          value={String(trades.length)}
          sub={`${trades.filter(t => t.status === 'open').length} open`}
          icon={<BarChart2 size={16} />}
          color="bg-purple-500/15 text-purple-400"
        />
      </div>

      {/* ── Hexa Radar + Score ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Radar chart */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-1">Hexa Performance Radar</h2>
          <p className="text-xs text-gray-600 mb-4">Based on last {Math.min(trades.length, 50)} trades</p>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600">
              <BarChart2 size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Log your first trade to see radar stats</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#1f2937" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<RadarTooltip />} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score card + axis breakdown */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-4">Overall Score</h2>
            <div className="flex justify-center">
              <ScoreRing score={overallScore} />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {Object.entries(hexaScores).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-gray-500 w-4">{AXIS_ICONS[key]}</span>
                <span className="text-xs text-gray-400 flex-1">{AXIS_LABELS[key]}</span>
                <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${val}%`,
                      background: val >= 70 ? '#a855f7' : val >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-400 w-7 text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Trades ── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-medium text-gray-300">Recent Trades</h2>
          <button
            onClick={() => navigate('/trades')}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <p className="text-sm">No trades logged yet.</p>
            <button
              onClick={() => navigate('/trades/new')}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Log your first trade →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/60 bg-gray-900/40">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">PnL</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map(trade => (
                <tr
                  key={trade.id}
                  onClick={() => navigate(`/trades/${trade.id}`)}
                  className="border-b border-gray-800/40 hover:bg-gray-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-100 font-mono">{trade.token}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{trade.network || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(trade.entry_date)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={trade.status === 'closed' ? 'success' : trade.status === 'open' ? 'neutral' : 'danger'}
                      size="sm"
                      className="capitalize"
                    >
                      {trade.status}
                    </Badge>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-medium ${pnlColor(trade.pnl)}`}>
                    {formatCurrency(trade.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
