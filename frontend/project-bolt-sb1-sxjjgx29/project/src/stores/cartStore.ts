import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { getEffectivePrice } from '@/lib/utils';
import { api } from '@/api/services';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotals: () => { itemsTotal: number; totalItems: number };
  hydrate: () => Promise<void>;
  replaceFromServer: (items: CartItem[]) => void;
  setCoupon: (couponCode?: string, couponDiscount?: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      couponDiscount: 0,
      isOpen: false,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const effectivePrice = getEffectivePrice(product);
        const existing = items.find((i) => i.productId === product._id);

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, product.stock);
          set({
            items: items.map((i) =>
              i.productId === product._id ? { ...i, quantity: newQty } : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                name: product.name,
                slug: product.slug,
                price: effectivePrice,
                priceAtAdd: effectivePrice,
                image: product.thumbnail || product.images[0],
                quantity: Math.min(quantity, product.stock),
                stock: product.stock,
                maxStock: product.stock,
                priceChanged: false,
                outOfStock: product.stock === 0,
              },
            ],
          });
        }
        if (useAuthStore.getState().isAuthenticated) {
          void api.cart.add(product._id, quantity)
            .then((cart) => set({ items: cart.items }))
            .catch(() => undefined);
        }
      },

      removeItem: (productId) =>
        set((state) => {
          if (useAuthStore.getState().isAuthenticated) {
            void api.cart.remove(productId)
              .then((cart) => set({ items: cart.items }))
              .catch(() => undefined);
          }
          return { items: state.items.filter((item) => item.productId !== productId) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (useAuthStore.getState().isAuthenticated && quantity > 0) {
            void api.cart.update(productId, quantity)
              .then((cart) => set({ items: cart.items }))
              .catch(() => undefined);
          }
          return {
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i,
          ),
          };
        }),

      clearCart: () => {
        if (useAuthStore.getState().isAuthenticated) void api.cart.clear().catch(() => undefined);
        set({ items: [], couponCode: undefined, couponDiscount: 0 });
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotals: () => {
        const items = get().items;
        const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        return { itemsTotal, totalItems };
      },

      hydrate: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        const cart = await api.cart.get();
        set({ items: cart.items });
      },

      replaceFromServer: (items) => set({ items }),

      setCoupon: (couponCode, couponDiscount = 0) => set({ couponCode, couponDiscount }),
    }),
    { name: 'electromart-cart' },
  ),
);
