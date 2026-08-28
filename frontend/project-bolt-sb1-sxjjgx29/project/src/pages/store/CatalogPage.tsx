import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Package } from 'lucide-react';
import { FilterSidebar } from '@/components/store/FilterSidebar';
import { SortDropdown } from '@/components/store/SortDropdown';
import { ProductCard } from '@/components/store/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/Misc';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useDataStore } from '@/stores/dataStore';

const sortableValues = new Set(['newest', 'price_asc', 'price_desc', 'rating', 'popular']);

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { getFilteredProducts, filters, setFilters, categories, loadProducts, isLoading, error } = useDataStore();

  useEffect(() => {
    const requestedSort = searchParams.get('sort');
    setFilters({
      category: searchParams.get('category') ?? undefined,
      subCategory: searchParams.get('subCategory') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sort: requestedSort && sortableValues.has(requestedSort) ? requestedSort : 'newest',
      page: 1,
      limit: 24,
    });
  }, [searchParams, setFilters]);

  useEffect(() => {
    void loadProducts(filters);
  }, [filters, loadProducts]);

  const { products, total, totalPages } = getFilteredProducts();
  const currentCategory = categories.find((category) => category.slug === filters.category);
  const search = searchParams.get('search');
  const topCategories = categories.filter((category) => category.parentCategory === null).slice(0, 8);
  const hasActiveFilters = Boolean(filters.category || filters.subCategory || filters.brand || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.search);
  const pageTitle = search
    ? `Results for “${search}”`
    : currentCategory?.name ?? 'Shop all products';

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'rating', label: 'Top rated' },
    { value: 'popular', label: 'Most popular' },
  ];

  const clearAll = () => {
    setSearchParams({});
    setFilters({
      category: undefined,
      subCategory: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      search: undefined,
      page: 1,
    });
  };

  return (
    <div className="min-h-full bg-paper-50 pb-16">
      <section className="border-b border-paper-300 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <p className="text-sm font-medium text-brand-600">ElectroMart</p>
          <div className="mt-2 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">The everyday electronics store.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-600 sm:text-base">Thoughtfully selected technology, clear prices, and a simpler way to shop.</p>
            </div>
            <p className="shrink-0 text-sm text-ink-500">{total} {total === 1 ? 'product' : 'products'} available</p>
          </div>

          {topCategories.length > 0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Link to="/catalog" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${!filters.category ? 'border-ink-900 bg-ink-900 text-white' : 'border-paper-400 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900'}`}>All products</Link>
              {topCategories.map((category) => (
                <Link
                  key={category._id}
                  to={`/catalog?category=${category.slug}`}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${filters.category === category.slug ? 'border-ink-900 bg-ink-900 text-white' : 'border-paper-400 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900'}`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-paper-300 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">{pageTitle}</h2>
            <p className="mt-1 text-sm text-ink-500">{isLoading ? 'Finding the latest products…' : `${total} ${total === 1 ? 'item' : 'items'} to explore`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-paper-400 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-paper-100 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <SortDropdown value={filters.sort ?? 'newest'} onChange={(sort) => setFilters({ sort, page: 1 })} options={sortOptions} />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            {currentCategory && <FilterChip label={currentCategory.name} onClear={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('category');
              params.delete('subCategory');
              setSearchParams(params);
            }} />}
            {filters.subCategory && <FilterChip label="Subcategory" onClear={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('subCategory');
              setSearchParams(params);
            }} />}
            {filters.brand && <FilterChip label={filters.brand} onClear={() => setFilters({ brand: undefined })} />}
            {filters.minPrice !== undefined && <FilterChip label={`From ₹${filters.minPrice}`} onClear={() => setFilters({ minPrice: undefined })} />}
            {filters.maxPrice !== undefined && <FilterChip label={`Up to ₹${filters.maxPrice}`} onClear={() => setFilters({ maxPrice: undefined })} />}
            {search && <FilterChip label={`“${search}”`} onClear={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('search');
              setSearchParams(params);
            }} />}
            <button type="button" onClick={clearAll} className="px-2 py-1 text-sm font-medium text-brand-600 hover:text-brand-700">Clear all</button>
          </div>
        )}

        <div className="mt-6 flex gap-8">
          <FilterSidebar isMobileOpen={mobileFiltersOpen} onMobileClose={() => setMobileFiltersOpen(false)} />

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => <SkeletonLoader key={index} variant="product" />)}
              </div>
            ) : error ? (
              <Alert variant="error" title="Catalogue unavailable">
                <p>{error}</p>
                <Button className="mt-3" size="sm" onClick={() => void loadProducts(filters)}>Try again</Button>
              </Alert>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="No products found"
                description="Try changing your search or removing a filter to see more products."
                action={<Button onClick={clearAll}>Clear filters</Button>}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {products.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination
                      page={filters.page ?? 1}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setFilters({ page });
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
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-paper-200 py-1 pl-3 pr-1.5 text-sm text-ink-700">
      {label}
      <button type="button" aria-label={`Remove ${label} filter`} onClick={onClear} className="rounded-full p-1 text-ink-500 transition-colors hover:bg-white hover:text-ink-900">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
