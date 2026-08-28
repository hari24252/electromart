import { create } from 'zustand';
import type { Product, Category, ProductFilters } from '@/types';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';

interface DataState {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  compareProducts: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  loadCatalogue: () => Promise<void>;
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  getFilteredProducts: () => { products: Product[]; total: number; totalPages: number };
  getProductBySlug: (slug: string) => Product | undefined;
  getRelatedProducts: (slug: string) => Product[];
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryTree: () => Category[];
  getFeaturedProducts: () => Product[];
  getBrands: () => string[];
  getPriceRange: () => { min: number; max: number };
}

const defaultFilters: ProductFilters = {
  category: undefined,
  subCategory: undefined,
  brand: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  search: undefined,
  sort: 'newest',
  page: 1,
  limit: 12,
};

function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    { ...category, children: undefined },
    ...flattenCategories(category.children ?? []),
  ]);
}

export const useDataStore = create<DataState>((set, get) => ({
  products: [],
  categories: [],
  filters: { ...defaultFilters },
  compareProducts: [],
  isLoading: false,
  error: null,
  total: 0,
  totalPages: 1,

  toggleCompare: (product) => {
    const current = get().compareProducts;
    const exists = current.some((p) => p._id === product._id);
    if (exists) {
      set({ compareProducts: current.filter((p) => p._id !== product._id) });
    } else {
      if (current.length >= 4) return;
      set({ compareProducts: [...current, product] });
    }
  },

  clearCompare: () => set({ compareProducts: [] }),

  isInCompare: (productId) => get().compareProducts.some((p) => p._id === productId),

  loadCatalogue: async () => {
    set({ isLoading: true, error: null });
    try {
      const [categories, products] = await Promise.all([
        api.catalogue.categories(),
        api.catalogue.products({ page: 1, limit: 48, sort: 'newest' }),
      ]);
      set({
        categories: flattenCategories(categories),
        products: products.items,
        total: products.total,
        totalPages: products.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        categories: [],
        products: [],
        total: 0,
        totalPages: 1,
        isLoading: false,
        error: getApiErrorMessage(error, 'The catalogue could not be loaded. Please try again.'),
      });
    }
  },

  loadProducts: async (filters) => {
    const requestedFilters = { ...get().filters, ...filters };
    set({ isLoading: true, error: null });
    try {
      const result = await api.catalogue.products(requestedFilters);
      set({
        products: result.items,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        products: [],
        total: 0,
        totalPages: 1,
        isLoading: false,
        error: getApiErrorMessage(error, 'Products could not be loaded. Please try again.'),
      });
    }
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  getFilteredProducts: () => {
    return { products: get().products, total: get().total, totalPages: get().totalPages };
  },

  getProductBySlug: (slug) => get().products.find((p) => p.slug === slug),

  getRelatedProducts: (slug) => {
    const product = get().getProductBySlug(slug);
    if (!product) return [];
    const categoryId = typeof product.category === 'string' ? product.category : product.category._id;
    return get()
      .products.filter(
        (p) => (typeof p.category === 'string' ? p.category : p.category._id) === categoryId && p._id !== product._id && p.status === 'active',
      )
      .slice(0, 8);
  },

  getCategoryBySlug: (slug) => get().categories.find((c) => c.slug === slug),

  getCategoryTree: () => {
    const all = get().categories;
    const top = all.filter((c) => c.parentCategory === null);
    return top.map((c) => ({
      ...c,
      children: all.filter((s) => s.parentCategory === c._id),
    }));
  },

  getFeaturedProducts: () => {
    return get().products.filter((p) => p.isFeatured && p.status === 'active').slice(0, 8);
  },

  getBrands: () => [...new Set(get().products.map((p) => p.brand))].sort(),

  getPriceRange: () => {
    const products = get().products;
    if (!products.length) return { min: 0, max: 0 };
    const prices = products.map((p) => p.discountPrice ?? p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  },
}));
