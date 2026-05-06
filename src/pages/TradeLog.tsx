import { useNavigate } from 'react-router-dom';
import { ListOrdered, Plus, Search, X } from 'lucide-react';
import { useTradesList } from '../hooks/useTrades';
import { useTradeStore } from '../store/tradeStore';
import Badge from '../components/shared/Badge';
import EmptyState from '../components/shared/EmptyState';
import { formatCurrency, formatPercent, formatDate, pnlColor } from '../lib/formatters';
import type { Trade } from '../types/trade';

function sideBadge(side: Trade['side']) {
  return <Badge variant={side === 'long' ? 'success' : 'danger'} size="sm">{side === 'long' ? '↑ Long' : '↓ Short'}</Badge>;
}

function statusBadge(status: Trade['status']) {
  const v = status === 'closed' ? 'neutral' : status === 'open' ? 'info' : 'warning';
  return <Badge variant={v} size="sm" className="capitalize">{status}</Badge>;
}

export default function TradeLog() {
  const navigate = useNavigate();
  const { filters, setFilter, resetFilters } = useTradeStore();
  const { data: trades = [], isLoading } = useTradesList(filters);

  const hasFilters = filters.side !== 'all' || filters.status !== 'all' || filters.asset_type !== 'all' || filters.search;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-600/20">
            <ListOrdered size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Trade Log</h1>
            <p className="text-sm text-gray-500">{trades.length} trade{trades.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => navigate('/trades/new')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Trade
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search pair…"
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Side filter */}
        <select value={filters.side} onChange={e => setFilter('side', e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500">
          <option value="all">All sides</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>

        {/* Status filter */}
        <select value={filters.status} onChange={e => setFilter('status', e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500">
          <option value="all">All status</option>
          <option value="closed">Closed</option>
          <option value="open">Open</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Asset type */}
        <select value={filters.asset_type} onChange={e => setFilter('asset_type', e.target.value as any)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500">
          <option value="all">All types</option>
          <option value="perp">Perp</option>
          <option value="spot">Spot</option>
          <option value="defi">DeFi</option>
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trades.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="No trades found"
          description={hasFilters ? 'Try clearing your filters' : 'Log your first trade to start earning XP'}
          action={{ label: 'Log a trade', onClick: () => navigate('/trades/new') }}
        />
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">PnL</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">R:R</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {trades.map(trade => (
                <tr key={trade.id}
                  onClick={() => navigate(`/trades/${trade.id}`)}
                  className="cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-100 font-mono">{trade.pair}</td>
                  <td className="px-4 py-3">{sideBadge(trade.side)}</td>
                  <td className="px-4 py-3">{statusBadge(trade.status)}</td>
                  <td className={`px-4 py-3 text-right font-mono ${pnlColor(trade.pnl)}`}>{formatCurrency(trade.pnl)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">
                    {trade.risk_reward ? `${trade.risk_reward.toFixed(1)}R` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {trade.xp_earned > 0 && (
                      <span className="text-purple-400 text-xs font-medium">+{trade.xp_earned}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(trade.entry_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
