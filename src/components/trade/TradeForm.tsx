import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import EmotionTagPicker from './EmotionTagPicker';
import { calculateTradeXP } from '../../engine/xpCalculator';
import type { Trade } from '../../types/trade';
import type { EmotionTag } from '../../types/emotion';

const schema = z.object({
  pair: z.string().min(1, 'Pair required'),
  side: z.enum(['long', 'short']),
  exchange: z.string().optional(),
  entry_price: z.coerce.number({ invalid_type_error: 'Enter a price' }).positive('Must be positive'),
  exit_price: z.coerce.number().positive().optional().or(z.literal('')),
  position_size: z.coerce.number({ invalid_type_error: 'Required' }).positive('Must be positive'),
  pnl: z.coerce.number().optional().or(z.literal('')),
  planned_rr: z.coerce.number().positive().optional().or(z.literal('')),
  risk_reward: z.coerce.number().positive().optional().or(z.literal('')),
  setup_type: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['open', 'closed', 'cancelled']).default('closed'),
});

export type TradeFormValues = z.infer<typeof schema>;

interface SelectedEmotion { tag: string; intensity: number; }

interface TradeFormProps {
  defaultValues?: Partial<TradeFormValues>;
  existingEmotions?: SelectedEmotion[];
  onSubmit: (data: TradeFormValues, emotions: SelectedEmotion[]) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const inputClass = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors';
const labelClass = 'block text-xs font-medium text-gray-400 mb-1';
const sectionClass = 'space-y-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800';

export default function TradeForm({ defaultValues, existingEmotions = [], onSubmit, submitLabel = 'Save Trade', loading }: TradeFormProps) {
  const [emotions, setEmotions] = useState<SelectedEmotion[]>(existingEmotions);
  const [xpPreview, setXpPreview] = useState<number>(0);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<TradeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { side: 'long', status: 'closed', ...defaultValues },
  });

  const watched = useWatch({ control });

  // Auto-calc PnL when entry/exit/size/side change
  useEffect(() => {
    const { entry_price, exit_price, position_size, side } = watched;
    if (entry_price && exit_price && position_size) {
      const dir = side === 'long' ? 1 : -1;
      const pnl = (Number(exit_price) - Number(entry_price)) * Number(position_size) * dir;
      setValue('pnl', Math.round(pnl * 100) / 100);
    }
  }, [watched.entry_price, watched.exit_price, watched.position_size, watched.side, setValue]);

  // XP preview
  useEffect(() => {
    if (watched.status !== 'closed') { setXpPreview(0); return; }
    const mockTrade = {
      ...watched,
      id: 'preview', user_id: '', created_at: '', updated_at: '',
      entry_date: new Date().toISOString(), xp_earned: 0, status: 'closed' as const,
      pnl: Number(watched.pnl) || undefined,
      risk_reward: Number(watched.risk_reward) || undefined,
      planned_rr: Number(watched.planned_rr) || undefined,
      entry_price: Number(watched.entry_price) || 0,
      position_size: Number(watched.position_size) || 0,
    } as Trade;
    const mockEmotions = emotions.map(e => ({
      id: '', user_id: '', trade_id: '', created_at: '', ...e,
    })) as EmotionTag[];
    const { totalXP } = calculateTradeXP(mockTrade, mockEmotions);
    setXpPreview(totalXP);
  }, [watched, emotions]);

  const submit = handleSubmit(async (data) => {
    await onSubmit(data, emotions);
  });

  const sideValue = useWatch({ control, name: 'side' });
  const statusValue = useWatch({ control, name: 'status' });

  return (
    <form onSubmit={submit} className="space-y-5">

      {/* ── Trade Info ── */}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Trade Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pair *</label>
            <input {...register('pair')} placeholder="BTC/USDT" className={inputClass} />
            {errors.pair && <p className="mt-1 text-xs text-red-400">{errors.pair.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Exchange</label>
            <input {...register('exchange')} placeholder="Binance" className={inputClass} />
          </div>
        </div>

        {/* Side toggle */}
        <div>
          <label className={labelClass}>Side</label>
          <Controller control={control} name="side" render={({ field }) => (
            <div className="flex gap-2">
              {(['long', 'short'] as const).map(s => (
                <button type="button" key={s} onClick={() => field.onChange(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    field.value === s
                      ? s === 'long' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'
                      : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                  }`}>
                  {s === 'long' ? '↑ Long' : '↓ Short'}
                </button>
              ))}
            </div>
          )} />
        </div>

      </div>

      {/* ── Prices & Size ── */}}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Prices & Size</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Entry Price *</label>
            <input {...register('entry_price')} type="number" step="any" placeholder="0.00" className={`${inputClass} font-mono`} />
            {errors.entry_price && <p className="mt-1 text-xs text-red-400">{errors.entry_price.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Exit Price</label>
            <input {...register('exit_price')} type="number" step="any" placeholder="0.00" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Position Size (in quote, e.g. USDT) *</label>
            <input {...register('position_size')} type="number" step="any" placeholder="0" className={`${inputClass} font-mono`} />
            {errors.position_size && <p className="mt-1 text-xs text-red-400">{errors.position_size.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Results</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>PnL (USD) <span className="text-gray-600">(auto-calc)</span></label>
            <input {...register('pnl')} type="number" step="any" placeholder="0.00" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Actual R:R</label>
            <input {...register('risk_reward')} type="number" step="any" placeholder="1.5" className={`${inputClass} font-mono`} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <Controller control={control} name="status" render={({ field }) => (
            <div className="flex gap-2">
              {(['closed', 'open', 'cancelled'] as const).map(s => (
                <button type="button" key={s} onClick={() => field.onChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize ${
                    field.value === s ? 'bg-purple-600/20 text-purple-400 border-purple-500/50' : 'bg-gray-800 text-gray-500 border-gray-700'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          )} />
        </div>
      </div>

      {/* ── Plan ── */}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Plan</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Planned R:R</label>
            <input {...register('planned_rr')} type="number" step="any" placeholder="2.0" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Setup Type</label>
            <input {...register('setup_type')} placeholder="breakout, pullback…" className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Emotions ── */}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Emotional State</h3>
        <EmotionTagPicker selected={emotions as any} onChange={setEmotions as any} />
      </div>

      {/* ── Notes ── */}
      <div className={sectionClass}>
        <h3 className="text-sm font-medium text-gray-300">Notes</h3>
        <textarea
          {...register('notes')}
          rows={4}
          placeholder="What was your reasoning? What did you learn?"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-2">
        {statusValue === 'closed' && xpPreview > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 rounded-lg border border-purple-500/20">
            <span className="text-xs text-gray-500">XP preview:</span>
            <span className="text-sm font-semibold text-purple-400">+{xpPreview} XP</span>
          </div>
        )}
        {!(statusValue === 'closed' && xpPreview > 0) && <div />}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
