import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Trade, TradeInput } from '../types/trade';
import type { EmotionTag } from '../types/emotion';

// ── Fetch trades list ────────────────────────────────────────────────────────

export function useTradesList(filters?: {
  status?: string;
  dateFrom?: string; dateTo?: string; search?: string;
}) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: async () => {
      let q = supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false })
        .limit(200);

      if (filters?.status && filters.status !== 'all') q = q.eq('status', filters.status);
      if (filters?.dateFrom) q = q.gte('entry_date', filters.dateFrom);
      if (filters?.dateTo) q = q.lte('entry_date', filters.dateTo);
      if (filters?.search) q = q.ilike('token', `%${filters.search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Trade[];
    },
  });
}

// ── Fetch single trade ───────────────────────────────────────────────────────

export function useTrade(id: string | undefined) {
  return useQuery({
    queryKey: ['trade', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('trades').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Trade;
    },
    enabled: !!id,
  });
}

// ── Fetch emotion tags for a trade ──────────────────────────────────────────

export function useEmotionTags(tradeId: string | undefined) {
  return useQuery({
    queryKey: ['emotions', tradeId],
    queryFn: async () => {
      if (!tradeId) return [];
      const { data, error } = await supabase.from('emotion_tags').select('*').eq('trade_id', tradeId);
      if (error) throw error;
      return (data ?? []) as EmotionTag[];
    },
    enabled: !!tradeId,
  });
}

// ── Fetch ALL emotion tags for dashboard ─────────────────────────────────────

export function useAllEmotions() {
  return useQuery({
    queryKey: ['emotions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('emotion_tags').select('*');
      if (error) throw error;
      return (data ?? []) as EmotionTag[];
    },
  });
}

// ── Create trade ─────────────────────────────────────────────────────────────

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trade, emotions, xpEarned }: {
      trade: TradeInput; emotions: { tag: string; intensity: number }[]; xpEarned: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: tradeData, error } = await supabase
        .from('trades')
        .insert({ ...trade, user_id: user.id, xp_earned: xpEarned })
        .select()
        .single();
      if (error) throw error;

      // Insert emotion tags
      if (emotions.length > 0) {
        const tags = emotions.map(e => ({ user_id: user.id, trade_id: tradeData.id, tag: e.tag, intensity: e.intensity }));
        const { error: emoErr } = await supabase.from('emotion_tags').insert(tags);
        if (emoErr) throw emoErr;
      }

      return tradeData as Trade;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] });
      qc.invalidateQueries({ queryKey: ['player'] });
    },
  });
}

// ── Update trade ─────────────────────────────────────────────────────────────

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Trade> }) => {
      const { data, error } = await supabase.from('trades').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Trade;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['trades'] });
      qc.invalidateQueries({ queryKey: ['trade', vars.id] });
    },
  });
}

// ── Delete trade ─────────────────────────────────────────────────────────────

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}
