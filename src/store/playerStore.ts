import { create } from 'zustand';

interface PlayerStoreState {
  cachedLevel: number;
  cachedXP: number;
  cachedRankTitle: string;
  cachedRankTier: string;
  setPlayer: (data: Partial<Omit<PlayerStoreState, 'setPlayer'>>) => void;
}

export const usePlayerStore = create<PlayerStoreState>()((set) => ({
  cachedLevel: 1,
  cachedXP: 0,
  cachedRankTitle: 'Novice',
  cachedRankTier: 'bronze',
  setPlayer: (data) => set((s) => ({ ...s, ...data })),
}));
