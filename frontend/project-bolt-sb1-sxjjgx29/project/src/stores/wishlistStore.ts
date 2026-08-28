import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useAuthStore } from './authStore';

interface WishlistState {
  productIds: string[];
  lastError: string | null;
  toggle: (productId: string) => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  clear: () => void;
  clearError: () => void;
  hydrate: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      lastError: null,

      toggle: async (productId) => {
        const productIds = get().productIds;
        const exists = productIds.includes(productId);
        set({ productIds: exists ? productIds.filter((id) => id !== productId) : [...productIds, productId], lastError: null });
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          if (exists) {
            await api.wishlist.remove(productId);
          } else {
            const products = await api.wishlist.add(productId);
            set({ productIds: products.map((product) => product._id) });
          }
        } catch (error) {
          set({ productIds, lastError: getApiErrorMessage(error, 'The wishlist could not be updated.') });
          throw error;
        }
      },

      add: async (productId) => {
        if (get().productIds.includes(productId)) return;
        await get().toggle(productId);
      },

      remove: async (productId) => {
        if (!get().productIds.includes(productId)) return;
        await get().toggle(productId);
      },

      has: (productId) => get().productIds.includes(productId),

      clear: () => set({ productIds: [], lastError: null }),
      clearError: () => set({ lastError: null }),

      hydrate: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          const products = await api.wishlist.list();
          set({ productIds: products.map((product) => product._id), lastError: null });
        } catch (error) {
          set({ lastError: getApiErrorMessage(error, 'Your wishlist could not be synchronized.') });
        }
      },
    }),
    { name: 'electromart-wishlist-v2', partialize: () => ({}) },
  ),
);
