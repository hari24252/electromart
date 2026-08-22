import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Address, Admin } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isSessionReady: boolean;
  isAdmin: boolean;
  admin: Admin | null;
  adminAccessToken: string | null;
  login: (user: User) => void;
  setUserSession: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string | null) => void;
  markSessionReady: () => void;
  logout: () => void;
  adminLogin: (admin: Admin) => void;
  setAdminSession: (admin: Admin, accessToken: string) => void;
  setAdminAccessToken: (accessToken: string | null) => void;
  adminLogout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isSessionReady: false,
      isAdmin: false,
      admin: null,
      adminAccessToken: null,

      login: (user) => set({ user, isAuthenticated: true, isSessionReady: true }),

      setUserSession: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isSessionReady: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      markSessionReady: () => set({ isSessionReady: true }),

      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      adminLogin: (admin) => set({ admin, isAdmin: true, isSessionReady: true }),

      setAdminSession: (admin, adminAccessToken) => set({ admin, adminAccessToken, isAdmin: true, isSessionReady: true }),

      setAdminAccessToken: (adminAccessToken) => set({ adminAccessToken }),

      adminLogout: () => set({ admin: null, adminAccessToken: null, isAdmin: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addAddress: (address) =>
        set((state) => {
          if (!state.user) return state;
          const addresses = [...state.user.addresses];
          if (address.isDefault) {
            addresses.forEach((a) => (a.isDefault = false));
          }
          addresses.push(address);
          return { user: { ...state.user, addresses } };
        }),

      updateAddress: (id, updates) =>
        set((state) => {
          if (!state.user) return state;
          const addresses = state.user.addresses.map((a) =>
            a._id === id ? { ...a, ...updates } : a,
          );
          return { user: { ...state.user, addresses } };
        }),

      removeAddress: (id) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, addresses: state.user.addresses.filter((a) => a._id !== id) },
          };
        }),

      setDefaultAddress: (id) =>
        set((state) => {
          if (!state.user) return state;
          const addresses = state.user.addresses.map((a) => ({
            ...a,
            isDefault: a._id === id,
          }));
          return { user: { ...state.user, addresses } };
        }),
    }),
    // Access tokens must remain in memory. Refresh sessions are protected httpOnly cookies.
    { name: 'electromart-auth-v2', partialize: () => ({}) },
  ),
);
