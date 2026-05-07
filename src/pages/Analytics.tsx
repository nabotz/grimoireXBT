import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTradesList } from '../hooks/useTrades';
import { formatCurrency, formatDate, pnlColor } from '../lib/formatters';

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function PnLTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl min-w-[180px]">
      <p className="text-xs text-gray-500 mb-1">{formatDate(d.date)}</p>
      <p className="text-xs text-gray-400 font-mono mb-2">{d.token}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500">Trade PnL</span>
        <span className={`text-sm font-mono font-semibold ${pnlColor(d.tradePnl)}`}>
          {formatCurrency(d.tradePnl)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-1">
        <span className="text-xs text-gray-500">Cumulative</span>
        <span className={`text-sm font-mono font-bold ${pnlColor(d.cumulative)}`}>
          {formatCurrency(d.cumulative)}
        </span>
      </div>
    </div>
  );
}

// ── Stat chip ──────────────────────────────────────────────────────────────────

function StatChip({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean | null }) {
  const color = positive === null || positive === undefined
    ? 'text-gray-100'
    : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex-1 min-w-[120px]">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { data: trades = [], isLoading } = useTradesList();

  // Only closed trades with PnL, sorted oldest→newest
  const closedSorted = useMemo(() =>
    trades
      .filter(t => t.status === 'closed' && t.pnl != null)
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()),
    [trades]
  );

  // Build cumulative PnL series
  const chartData = useMemo(() => {
    let running = 0;
    return closedSorted.map(t => {
      running += t.pnl ?? 0;
      return {
        date: t.entry_date,
        token: t.token,
        tradePnl: t.pnl,
        cumulative: Math.round(running * 100) / 100,
      };
    });
  }, [closedSorted]);

  // Summary stats
  const totalPnl = chartData.length > 0 ? chartData[chartData.length - 1].cumulative : 0;
  const wins = closedSorted.filter(t => (t.pnl ?? 0) > 0);
  const losses = closedSorted.filter(t => (t.pnl ?? 0) < 0);
  const winRate = closedSorted.length > 0 ? (wins.length / closedSorted.length) * 100 : null;
  const bestTrade = closedSorted.reduce<number | null>((best, t) => t.pnl != null && (best === null || t.pnl > best) ? t.pnl : best, null);
  const worstTrade = closedSorted.reduce<number | null>((worst, t) => t.pnl != null && (worst === null || t.pnl < worst) ? t.pnl : worst, null);

  // Max drawdown
  const maxDD = useMemo(() => {
    let peak = 0, dd = 0;
    for (const d of chartData) {
      if (d.cumulative > peak) peak = d.cumulative;
      const cur = peak > 0 ? ((peak - d.cumulative) / peak) * 100 : 0;
      if (cur > dd) dd = cur;
    }
    return dd;
  }, [chartData]);

  // Gradient: positive above zero = emerald, below = red
  const isPositive = totalPnl >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const areaColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-purple-600/20">
            <BarChart3 size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Analytics</h1>
            <p className="text-sm text-gray-500">Cumulative PnL, drawdown & performance breakdown</p>
          </div>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="flex flex-wrap gap-3">
        <StatChip
          label="Total PnL"
          value={formatCurrency(totalPnl)}
          sub={`${closedSorted.length} closed trades`}
          positive={closedSorted.length > 0 ? totalPnl >= 0 : null}
        />
        <StatChip
          label="Win Rate"
          value={winRate !== null ? `${winRate.toFixed(1)}%` : '—'}
          sub={closedSorted.length > 0 ? `${wins.length}W / ${losses.length}L` : 'No trades yet'}
          positive={winRate !== null ? winRate >= 50 : null}
        />
        <StatChip
          label="Best Trade"
          value={bestTrade !== null ? formatCurrency(bestTrade) : '—'}
          positive={bestTrade !== null ? bestTrade > 0 : null}
        />
        <StatChip
          label="Worst Trade"
          value={worstTrade !== null ? formatCurrency(worstTrade) : '—'}
          positive={worstTrade !== null ? worstTrade > 0 : null}
        />
        <StatChip
          label="Max Drawdown"
          value={maxDD > 0 ? `${maxDD.toFixed(1)}%` : '—'}
          positive={maxDD > 0 ? false : null}
        />
      </div>

      {/* ── Cumulative PnL Chart ── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          {isPositive
            ? <TrendingUp size={16} className="text-emerald-400" />
            : <TrendingDown size={16} className="text-red-400" />}
          <h2 className="text-sm font-medium text-gray-300">Cumulative PnL Over Time</h2>
        </div>
        <p className="text-xs text-gray-600 mb-5">Running total from first closed trade to latest</p>

        {isLoading ? (
          <div className="flex items-center justify-center h-56">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-56 text-gray-600">
            <Activity size={32} className="mb-2 opacity-40" />
            <p className="text-sm">Log at least 2 closed trades to see the curve</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={areaColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={d => {
                  const dt = new Date(d);
                  return `${dt.toLocaleString('en-US', { month: 'short' })} ${dt.getDate()}`;
                }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={v => `$${v >= 1000 || v <= -1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<PnLTooltip />} />
              <ReferenceLine y={0} stroke="#374151" strokeWidth={1} strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#pnlGradient)"
                dot={chartData.length <= 30 ? { r: 3, fill: lineColor, strokeWidth: 0 } : false}
                activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
