import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Package, Sparkles } from 'lucide-react';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import { SortDropdown } from '@/components/store/SortDropdown';
import { ProductCard } from '@/components/store/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs, EmptyState } from '@/components/ui/Misc';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { useDataStore } from '@/stores/dataStore';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { getFilteredProducts, filters, setFilters, categories, loadProducts, isLoading } = useDataStore();

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') ?? undefined,
      subCategory: searchParams.get('subCategory') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: 1,
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    void loadProducts(filters);
  }, [filters, loadProducts]);

  const { products, total, totalPages } = getFilteredProducts();
  const currentCategory = categories.find((category) => category.slug === filters.category);
  const search = searchParams.get('search');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Catalog', href: '/catalog' },
          ...(currentCategory ? [{ label: currentCategory.name }] : []),
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            {search ? `Search results for "${search}"` : currentCategory?.name ?? 'Complete Hardware Catalogue'}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">Showing {total} available products</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <SortDropdown
            value={filters.sort ?? 'newest'}
            onChange={(v) => setFilters({ sort: v, page: 1 })}
            options={sortOptions}
          />
        </div>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          isMobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        <div className="flex-1 min-w-0 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonLoader key={i} variant="product" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package className="w-16 h-16 text-slate-600" />}
              title="No products found"
              description="Try broadening your filters or searching for alternative tech terms"
              action={
                <Button onClick={() => {
                  setSearchParams({});
                  setFilters({ category: undefined, brand: undefined, minPrice: undefined, maxPrice: undefined, search: undefined, page: 1 });
                }}>
                  Reset All Filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Active filters bar */}
              {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {currentCategory && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-mono font-medium">
                      Category: {currentCategory.name}
                      <button onClick={() => {
                        setFilters({ category: undefined, subCategory: undefined });
                        const p = new URLSearchParams(searchParams);
                        p.delete('category');
                        p.delete('subCategory');
                        setSearchParams(p);
                      }}>
                        <X className="w-3.5 h-3.5 hover:text-white" />
                      </button>
                    </span>
                  )}
                  {filters.brand && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium">
                      Brand: {filters.brand}
                      <button onClick={() => setFilters({ brand: undefined })}>
                        <X className="w-3.5 h-3.5 hover:text-white" />
                      </button>
                    </span>
                  )}
                  {filters.minPrice !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium">
                      Min: ${filters.minPrice}
                      <button onClick={() => setFilters({ minPrice: undefined })}>
                        <X className="w-3.5 h-3.5 hover:text-white" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium">
                      Max: ${filters.maxPrice}
                      <button onClick={() => setFilters({ maxPrice: undefined })}>
                        <X className="w-3.5 h-3.5 hover:text-white" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    page={filters.page ?? 1}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setFilters({ page: p });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

