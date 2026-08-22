import { create } from 'zustand';

interface UiState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
