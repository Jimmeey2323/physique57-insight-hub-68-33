
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GlobalLoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress: number;
  loadingStartTime: number | null;
  setLoading: (loading: boolean, message?: string) => void;
  setProgress: (progress: number) => void;
  resetProgress: () => void;
}

export const useGlobalLoading = create<GlobalLoadingState>()(
  subscribeWithSelector((set, get) => ({
    isLoading: false,
    loadingMessage: 'Loading...',
    progress: 0,
    loadingStartTime: null,
    setLoading: (loading, message = 'Loading...') => {
      set({ 
        isLoading: loading, 
        loadingMessage: message,
        loadingStartTime: loading ? Date.now() : null,
        progress: loading ? 0 : 100 // Reset progress when starting new load
      });
    },
    setProgress: (progress) => set({ progress: Math.min(Math.max(progress, 0), 100) }),
    resetProgress: () => set({ progress: 0 }),
  }))
);
