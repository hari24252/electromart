import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/api/services';
import { useAuthStore } from './authStore';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  hydrate: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (useAuthStore.getState().isAuthenticated) {
            const request = exists ? api.wishlist.remove(productId) : api.wishlist.add(productId);
            void request
              .then((products) => {
                if (products) set({ productIds: products.map((product) => product._id) });
              })
              .catch(() => undefined);
          }
          return {
            productIds: exists
              ? state.productIds.filter((id) => id !== productId)
              : [...state.productIds, productId],
          };
        }),

      add: (productId) =>
        set((state) =>
          state.productIds.includes(productId)
            ? state
            : { productIds: [...state.productIds, productId] },
        ),

      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),

      has: (productId) => get().productIds.includes(productId),

      clear: () => set({ productIds: [] }),

      hydrate: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        const products = await api.wishlist.list();
        set({ productIds: products.map((product) => product._id) });
      },
    }),
    { name: 'electromart-wishlist' },
  ),
);
