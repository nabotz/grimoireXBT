import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Star } from 'lucide-react';
import { useState } from 'react';
import { useTrade, useEmotionTags, useUpdateTrade, useDeleteTrade } from '../hooks/useTrades';
import { useUIStore } from '../store/uiStore';
import Badge from '../components/shared/Badge';
import TradeForm, { type TradeFormValues } from '../components/trade/TradeForm';
import { formatCurrency, formatDate, formatPercent, pnlColor } from '../lib/formatters';

export default function TradeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const addToast = useUIStore(s => s.addToast);

  const { data: trade, isLoading } = useTrade(id);
  const { data: emotions = [] } = useEmotionTags(id);
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Trade not found.</p>
        <button onClick={() => navigate('/trades')} className="mt-4 text-purple-400 text-sm hover:underline">Back to trades</button>
      </div>
    );
  }

  const handleUpdate = async (data: TradeFormValues) => {
    await updateTrade.mutateAsync({ id: trade.id, updates: { ...data } as any });
    addToast({ type: 'success', message: 'Trade updated' });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trade? This cannot be undone.')) return;
    await deleteTrade.mutateAsync(trade.id);
    navigate('/trades');
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-gray-100">Edit Trade</h1>
        </div>
        <TradeForm
          defaultValues={{ ...trade, status: trade.status }}
          existingEmotions={emotions.map(e => ({ tag: e.tag, intensity: e.intensity }))}
          onSubmit={handleUpdate}
          loading={updateTrade.isPending}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/trades')} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-100 font-mono">{trade.token}</h1>
            <p className="text-xs text-gray-500">{formatDate(trade.entry_date)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'PnL', value: formatCurrency(trade.pnl), color: pnlColor(trade.pnl) },
          { label: 'PnL %', value: formatPercent(trade.pnl_percent), color: pnlColor(trade.pnl_percent) },
          { label: 'Actual R:R', value: trade.risk_reward ? `${trade.risk_reward.toFixed(1)}R` : '—', color: 'text-gray-100' },
          { label: 'Planned R:R', value: trade.planned_rr ? `${trade.planned_rr.toFixed(1)}R` : '—', color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800/50 rounded-xl border border-gray-700 p-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-lg font-semibold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-300">Details</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            { label: 'Status', value: <Badge variant="neutral" size="sm" className="capitalize">{trade.status}</Badge> },
            { label: 'Network', value: <span className="text-gray-300 capitalize">{trade.network ?? '—'}</span> },
            { label: 'Category', value: <span className="text-gray-300">{trade.category ?? '—'}</span> },
            { label: 'Entry', value: <span className="text-gray-300 font-mono">{trade.entry_price}</span> },
            { label: 'Exit', value: <span className="text-gray-300 font-mono">{trade.exit_price ?? '—'}</span> },
            { label: 'Size', value: <span className="text-gray-300 font-mono">{trade.position_size}</span> },
            { label: 'Setup', value: <span className="text-gray-300">{trade.setup_type ?? '—'}</span> },
            { label: 'XP Earned', value: <span className="text-purple-400 font-medium">+{trade.xp_earned} XP</span> },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1 border-b border-gray-800/50 col-span-1">
              <span className="text-gray-500">{label}</span>{value}
            </div>
          ))}
        </div>
      </div>

      {/* Emotions */}
      {emotions.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-sm font-medium text-gray-300">Emotional State</h2>
          <div className="flex flex-wrap gap-2">
            {emotions.map(e => (
              <div key={e.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                <span className="capitalize">{e.tag}</span>
                <span className="text-gray-600">·{e.intensity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {trade.notes && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-300">Notes</h2>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}
    </div>
  );
}
