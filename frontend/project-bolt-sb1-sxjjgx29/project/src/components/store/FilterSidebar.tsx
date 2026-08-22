import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Switch';

interface FilterSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterSidebar({ isMobileOpen, onMobileClose }: FilterSidebarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, getBrands, getPriceRange, filters, setFilters, resetFilters } = useDataStore();
  const brands = getBrands();
  const priceRange = getPriceRange();

  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? '');
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? '');
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
  });

  useEffect(() => {
    const cat = searchParams.get('category') ?? undefined;
    const sub = searchParams.get('subCategory') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    setFilters({ category: cat, subCategory: sub, search });
  }, [searchParams, setFilters]);

  const topCategories = categories.filter((c) => c.parentCategory === null);
  const selectedCategory = categories.find((category) => category.slug === filters.category);
  const subCategories = selectedCategory
    ? categories.filter((category) => category.parentCategory === selectedCategory._id)
    : [];

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleCategoryClick = (categorySlug: string | undefined) => {
    setFilters({ category: categorySlug, subCategory: undefined, page: 1 });
    const params = new URLSearchParams(searchParams);
    if (categorySlug) params.set('category', categorySlug);
    else params.delete('category');
    params.delete('subCategory');
    setSearchParams(params);
  };

  const handleSubCategoryClick = (subcategorySlug: string | undefined) => {
    setFilters({ subCategory: subcategorySlug, page: 1 });
    const params = new URLSearchParams(searchParams);
    if (subcategorySlug) params.set('subCategory', subcategorySlug);
    else params.delete('subCategory');
    setSearchParams(params);
  };

  const handleBrandClick = (brand: string) => {
    const newBrand = filters.brand === brand ? undefined : brand;
    setFilters({ brand: newBrand, page: 1 });
  };

  const applyPrice = () => {
    setFilters({
      minPrice: localMin ? Number(localMin) : undefined,
      maxPrice: localMax ? Number(localMax) : undefined,
      page: 1,
    });
  };

  const handleReset = () => {
    resetFilters();
    setLocalMin('');
    setLocalMax('');
    setSearchParams({});
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wide">Filters</h3>
        </div>
        {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
          <button
            onClick={handleReset}
            className="text-xs font-bold uppercase text-danger-600 hover:text-danger-700"
          >
            Reset
          </button>
        )}
        {isMobileOpen && onMobileClose && (
          <button onClick={onMobileClose} className="brutal-border bg-white p-1 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category */}
      <div className="brutal-border bg-white">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between p-3 font-semibold text-xs uppercase tracking-wide"
        >
          Category
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.category && 'rotate-180')} />
        </button>
        {expandedSections.category && (
          <div className="p-3 border-t-2 border-ink-900 space-y-1">
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={cn(
                'block w-full text-left px-2 py-1.5 text-sm rounded-none hover:bg-paper-100 transition-colors',
                !filters.category && 'bg-ink-900 text-white hover:bg-ink-900',
              )}
            >
              All Categories
            </button>
            {topCategories.map((cat) => (
              <div key={cat._id}>
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={cn(
                    'block w-full text-left px-2 py-1.5 text-sm hover:bg-paper-100 transition-colors',
                    filters.category === cat.slug && 'font-bold text-primary-600',
                  )}
                >
                  {cat.name}
                  <span className="float-right text-xs text-ink-400">{cat.productCount}</span>
                </button>
                {filters.category === cat.slug && subCategories.length > 0 && (
                  <div className="ml-3 border-l-2 border-ink-200 pl-2 mt-1 space-y-0.5">
                    {subCategories.map((sub) => (
                      <button
                        key={sub._id}
                        onClick={() => handleSubCategoryClick(sub.slug)}
                        className={cn(
                          'block w-full text-left px-2 py-1 text-xs hover:bg-paper-100 transition-colors',
                          filters.subCategory === sub.slug && 'font-bold text-primary-600',
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="brutal-border bg-white">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between p-3 font-semibold text-xs uppercase tracking-wide"
        >
          Brand
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.brand && 'rotate-180')} />
        </button>
        {expandedSections.brand && (
          <div className="p-3 border-t-2 border-ink-900 max-h-60 overflow-y-auto space-y-1">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 px-2 py-1.5 hover:bg-paper-100 cursor-pointer">
                <Checkbox
                  checked={filters.brand === brand}
                  onChange={() => handleBrandClick(brand)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="brutal-border bg-white">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-3 font-semibold text-xs uppercase tracking-wide"
        >
          Price Range
          <ChevronDown className={cn('w-4 h-4 transition-transform', expandedSections.price && 'rotate-180')} />
        </button>
        {expandedSections.price && (
          <div className="p-3 border-t-2 border-ink-900 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder="Min"
                className="w-full brutal-border px-2 py-1.5 text-sm focus:outline-none focus:shadow-brutal"
              />
              <span className="text-ink-400">—</span>
              <input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder="Max"
                className="w-full brutal-border px-2 py-1.5 text-sm focus:outline-none focus:shadow-brutal"
              />
            </div>
            <p className="text-xs text-ink-500">
              Range: {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
            </p>
            <Button size="sm" fullWidth onClick={applyPrice}>Apply Price</Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32">{content}</div>
      </aside>

      {/* Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70" onClick={onMobileClose} />
          <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white brutal-border-l border-l-2 border-ink-900 p-4 overflow-y-auto animate-slide-in-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
