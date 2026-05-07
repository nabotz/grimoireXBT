import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useCreateTrade } from '../hooks/useTrades';
import { useUIStore } from '../store/uiStore';
import { calculateTradeXP } from '../engine/xpCalculator';
import type { EmotionTag } from '../types/emotion';
import TradeForm, { type TradeFormValues } from '../components/trade/TradeForm';

export default function TradeEntry() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const createTrade = useCreateTrade();
  const addToast = useUIStore(s => s.addToast);

  const handleSubmit = async (data: TradeFormValues, emotions: { tag: string; intensity: number }[]) => {
    if (!user) return;

    // Calculate XP for preview (recomputed server-side in a real flow)
    const mockTrade = {
      ...data, id: '', user_id: user.id, xp_earned: 0,
      created_at: '', updated_at: '',
      entry_date: new Date().toISOString(),
      entry_price: Number(data.entry_price),
      position_size: Number(data.position_size),
      pnl: data.pnl ? Number(data.pnl) : undefined,
      risk_reward: data.risk_reward ? Number(data.risk_reward) : undefined,
      planned_rr: data.planned_rr ? Number(data.planned_rr) : undefined,
    } as any;
    const mockEmotions = emotions.map(e => ({ id: '', user_id: user.id, trade_id: '', created_at: '', ...e })) as EmotionTag[];
    const { totalXP } = calculateTradeXP(mockTrade, mockEmotions);

    await createTrade.mutateAsync({
      trade: {
        token: data.token,
        network: data.network,
        category: data.category,
        asset_type: 'spot',
        entry_price: Number(data.entry_price),
        exit_price: data.exit_price ? Number(data.exit_price) : undefined,
        position_size: Number(data.position_size),
        leverage: Number(data.leverage ?? 1),
        pnl: data.pnl ? Number(data.pnl) : undefined,
        planned_rr: data.planned_rr ? Number(data.planned_rr) : undefined,
        setup_type: data.setup_type,
        notes: data.notes,
        status: data.status as any,
      },
      emotions,
      xpEarned: totalXP,
    });

    addToast({ type: 'xp', message: `+${totalXP} XP earned!` });
    navigate('/trades');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-600/20">
          <PlusCircle size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Log Trade</h1>
          <p className="text-sm text-gray-500">Record a new trade and earn XP</p>
        </div>
      </div>

      <TradeForm
        onSubmit={handleSubmit}
        loading={createTrade.isPending}
        submitLabel="Save Trade"
      />
    </div>
  );
}
