import { create } from 'zustand';
import type { Product, Category, ProductFilters } from '@/types';
import {
  mockProducts,
  mockCategories,
} from '@/lib/mockData';
import { api } from '@/api/services';

interface DataState {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  compareProducts: Product[];
  isLoading: boolean;
  isUsingMockData: boolean;
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
  products: mockProducts,
  categories: mockCategories,
  filters: { ...defaultFilters },
  compareProducts: [],
  isLoading: false,
  isUsingMockData: true,
  total: mockProducts.length,
  totalPages: Math.ceil(mockProducts.length / (defaultFilters.limit ?? 12)),

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
    set({ isLoading: true });
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
        isUsingMockData: false,
      });
    } catch {
      set({
        categories: mockCategories,
        products: mockProducts,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / (defaultFilters.limit ?? 12)),
        isLoading: false,
        isUsingMockData: true,
      });
    }
  },

  loadProducts: async (filters) => {
    const requestedFilters = { ...get().filters, ...filters };
    set({ isLoading: true });
    try {
      const result = await api.catalogue.products(requestedFilters);
      set({
        products: result.items,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
        isUsingMockData: false,
      });
    } catch {
      set({ isLoading: false, isUsingMockData: true });
    }
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  getFilteredProducts: () => {
    const { products, filters } = get();
    if (!get().isUsingMockData) {
      return { products, total: get().total, totalPages: get().totalPages };
    }
    let filtered = [...products];

    if (filters.category) {
      const categoryId = get().categories.find((category) => category.slug === filters.category)?._id ?? filters.category;
      filtered = filtered.filter((product) => product.category === categoryId);
    }
    if (filters.subCategory) {
      const subCategoryId = get().categories.find((category) => category.slug === filters.subCategory)?._id ?? filters.subCategory;
      filtered = filtered.filter((product) => product.subCategories?.includes(subCategoryId));
    }
    if (filters.brand) {
      filtered = filtered.filter((p) => p.brand === filters.brand);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
        return price >= filters.minPrice!;
      });
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
        return price <= filters.maxPrice!;
      });
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }

    filtered = filtered.filter((p) => p.status === 'active');

    switch (filters.sort) {
      case 'price-low':
      case 'price_asc':
        filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price-high':
      case 'price_desc':
        filtered.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.ratingsAvg ?? 0) - (a.ratingsAvg ?? 0));
        break;
      case 'discount':
      case 'popular':
        filtered.sort(
          (a, b) =>
            ((b.price - (b.discountPrice ?? b.price)) / b.price) -
            ((a.price - (a.discountPrice ?? a.price)) / a.price),
        );
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;
    const limit = filters.limit ?? 12;
    const totalPages = Math.ceil(total / limit);
    const page = filters.page ?? 1;
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    return { products: paginated, total, totalPages };
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
    const featured = get().products.filter((p) => p.isFeatured && p.status === 'active').slice(0, 8);
    return featured.length > 0 ? featured : get().products.filter((p) => p.status === 'active').slice(0, 8);
  },

  getBrands: () => [...new Set(get().products.map((p) => p.brand))].sort(),

  getPriceRange: () => {
    const products = get().products;
    if (!products.length) return { min: 0, max: 0 };
    const prices = products.map((p) => p.discountPrice ?? p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  },
}));
