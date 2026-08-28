import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { getEffectivePrice } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
  selectedAddressId?: string;
  isOpen: boolean;
  lastError: string | null;
  isHydrating: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ code: string; discount: number }>;
  removeCoupon: () => Promise<void>;
  setAddressId: (id?: string) => void;
  reset: () => void;
  clearError: () => void;
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
      selectedAddressId: undefined,
      isOpen: false,
      lastError: null,
      isHydrating: false,

      addItem: async (product, quantity = 1) => {
        if (product.stock < 1 || quantity < 1) {
          set({ lastError: 'This product is currently out of stock.' });
          return;
        }
        const items = get().items;
        const effectivePrice = getEffectivePrice(product);
        const existing = items.find((i) => i.productId === product._id);

        const nextItems = existing ? (
          items.map((i) =>
            i.productId === product._id ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i,
          )
        ) : (
          [
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
          ]
        );
        set({ items: nextItems, lastError: null });
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          const cart = await api.cart.add(product._id, quantity);
          set({ items: cart.items });
        } catch (error) {
          set({ items, lastError: getApiErrorMessage(error, 'The item could not be added to your cart.') });
          throw error;
        }
      },

      removeItem: async (productId) => {
        const items = get().items;
        const nextItems = items.filter((item) => item.productId !== productId);
        set({ items: nextItems, lastError: null });
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          const cart = await api.cart.remove(productId);
          set({ items: cart.items });
        } catch (error) {
          set({ items, lastError: getApiErrorMessage(error, 'The item could not be removed from your cart.') });
          throw error;
        }
      },

      updateQuantity: async (productId, quantity) => {
        const items = get().items;
        const nextItems = items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }
            : item,
        );
        set({ items: nextItems, lastError: null });
        if (!useAuthStore.getState().isAuthenticated || quantity <= 0) return;
        try {
          const cart = await api.cart.update(productId, quantity);
          set({ items: cart.items });
        } catch (error) {
          set({ items, lastError: getApiErrorMessage(error, 'The cart quantity could not be updated.') });
          throw error;
        }
      },

      clearCart: async () => {
        const previous = { items: get().items, couponCode: get().couponCode, couponDiscount: get().couponDiscount };
        set({ items: [], couponCode: undefined, couponDiscount: 0, lastError: null });
        if (!useAuthStore.getState().isAuthenticated) return;
        try {
          await api.cart.clear();
        } catch (error) {
          set({ ...previous, lastError: getApiErrorMessage(error, 'The cart could not be cleared.') });
          throw error;
        }
      },

      reset: () => set({ items: [], couponCode: undefined, couponDiscount: 0, selectedAddressId: undefined, isOpen: false, lastError: null, isHydrating: false }),
      clearError: () => set({ lastError: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getTotals: () => {
        const items = get().items;
        return {
          itemsTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        };
      },

      applyCoupon: async (code) => {
        const snapshot = { couponCode: get().couponCode, couponDiscount: get().couponDiscount };
        set({ couponCode: code.trim() });
        try {
          const result = await api.coupons.apply(code.trim().toUpperCase());
          set({ couponCode: result.code, couponDiscount: result.discount, lastError: null });
          return result;
        } catch (error) {
          set({ ...snapshot, lastError: getApiErrorMessage(error, 'The coupon could not be applied.') });
          throw error;
        }
      },

      removeCoupon: async () => {
        const snapshot = { couponCode: get().couponCode, couponDiscount: get().couponDiscount };
        try {
          set({ couponCode: undefined, couponDiscount: 0, lastError: null });
        } catch (error) {
          set({ ...snapshot });
          throw error;
        }
      },

      setAddressId: (id) => {
        set({ selectedAddressId: id });
      },

      /* The guest cart remains only in this browser session. When a user signs in,
       * merge it through the existing cart API and then use the server response. */
      hydrate: async () => {
        if (!useAuthStore.getState().isAuthenticated) return;
        const guestItems = get().items;
        set({ isHydrating: true, lastError: null });
        try {
          for (const item of guestItems) {
            await api.cart.add(item.productId, item.quantity);
          }
          const cart = await api.cart.get();
          set({ items: cart.items, isHydrating: false });
        } catch (error) {
          set({ isHydrating: false, lastError: getApiErrorMessage(error, 'Your cart could not be synchronized.') });
        }
      },

      replaceFromServer: (items) => set({ items, lastError: null }),
      setCoupon: (couponCode, couponDiscount = 0) => set({ couponCode, couponDiscount }),
    }),
    { name: 'electromart-cart-v2', partialize: () => ({}) },
  ),
);
