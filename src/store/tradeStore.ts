import { create } from 'zustand';

interface TradeFilters {
  search: string;
  status: 'all' | 'open' | 'closed' | 'cancelled';
  dateFrom: string;
  dateTo: string;
}

interface TradeStoreState {
  filters: TradeFilters;
  setFilter: <K extends keyof TradeFilters>(key: K, value: TradeFilters[K]) => void;
  resetFilters: () => void;
}

const defaultFilters: TradeFilters = {
  search: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const useTradeStore = create<TradeStoreState>()((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
