import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'achievement' | 'xp';
  message: string;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toastQueue: Toast[];

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toastQueue: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) =>
    set((s) => ({
      toastQueue: [
        ...s.toastQueue,
        { ...toast, id: `${Date.now()}-${Math.random()}` },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toastQueue: s.toastQueue.filter((t) => t.id !== id) })),
}));
