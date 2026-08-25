import { useEffect, useState } from 'react';
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
  const [localMin, setLocalMin] = useState(filters.minPrice?.toString() ?? '');
  const [localMax, setLocalMax] = useState(filters.maxPrice?.toString() ?? '');
  const [expandedSections, setExpandedSections] = useState({ category: true, brand: true, price: true });
  const brands = getBrands();
  const priceRange = getPriceRange();
  const topCategories = categories.filter((category) => category.parentCategory === null);
  const selectedCategory = categories.find((category) => category.slug === filters.category);
  const subCategories = selectedCategory ? categories.filter((category) => category.parentCategory === selectedCategory._id) : [];

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') ?? undefined,
      subCategory: searchParams.get('subCategory') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });
  }, [searchParams, setFilters]);

  const toggleSection = (key: keyof typeof expandedSections) => setExpandedSections((current) => ({ ...current, [key]: !current[key] }));

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

  const applyPrice = () => setFilters({
    minPrice: localMin ? Number(localMin) : undefined,
    maxPrice: localMax ? Number(localMax) : undefined,
    page: 1,
  });

  const handleReset = () => {
    resetFilters();
    setLocalMin('');
    setLocalMax('');
    setSearchParams({});
  };

  const sectionButton = 'flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-ink-900';
  const sectionBody = 'border-t border-paper-300 p-3';
  const openIcon = (open: boolean) => <ChevronDown className={cn('h-4 w-4 text-ink-500 transition-transform', open && 'rotate-180')} />;

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900"><SlidersHorizontal className="h-4 w-4" /> Filters</div>
        <div className="flex items-center gap-2">
          {(filters.category || filters.brand || filters.minPrice !== undefined || filters.maxPrice !== undefined) && <button type="button" onClick={handleReset} className="text-xs font-medium text-brand-600 hover:text-brand-700">Reset</button>}
          {isMobileOpen && onMobileClose && <button type="button" aria-label="Close filters" onClick={onMobileClose} className="rounded-md p-1 text-ink-500 hover:bg-paper-100 lg:hidden"><X className="h-4 w-4" /></button>}
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-paper-300 bg-white">
        <button type="button" onClick={() => toggleSection('category')} className={sectionButton}>Category {openIcon(expandedSections.category)}</button>
        {expandedSections.category && (
          <div className={cn(sectionBody, 'space-y-1')}>
            <button type="button" onClick={() => handleCategoryClick(undefined)} className={cn('w-full rounded-lg px-3 py-2 text-left text-sm transition-colors', !filters.category ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900')}>All categories</button>
            {topCategories.map((category) => (
              <div key={category._id}>
                <button type="button" onClick={() => handleCategoryClick(category.slug)} className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors', filters.category === category.slug ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900')}>
                  <span>{category.name}</span><span className="text-xs text-ink-400">{category.productCount ?? 0}</span>
                </button>
                {filters.category === category.slug && subCategories.length > 0 && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-paper-300 pl-2">
                    {subCategories.map((subcategory) => <button key={subcategory._id} type="button" onClick={() => handleSubCategoryClick(subcategory.slug)} className={cn('block w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors', filters.subCategory === subcategory.slug ? 'font-medium text-brand-700' : 'text-ink-500 hover:bg-paper-100 hover:text-ink-900')}>{subcategory.name}</button>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-paper-300 bg-white">
        <button type="button" onClick={() => toggleSection('brand')} className={sectionButton}>Brand {openIcon(expandedSections.brand)}</button>
        {expandedSections.brand && (
          <div className={cn(sectionBody, 'max-h-60 space-y-1 overflow-y-auto')}>
            {brands.length ? brands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-paper-100">
                <Checkbox checked={filters.brand === brand} onChange={() => setFilters({ brand: filters.brand === brand ? undefined : brand, page: 1 })} /> {brand}
              </label>
            )) : <p className="px-2 py-1 text-sm text-ink-500">Brands appear as products load.</p>}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-paper-300 bg-white">
        <button type="button" onClick={() => toggleSection('price')} className={sectionButton}>Price {openIcon(expandedSections.price)}</button>
        {expandedSections.price && (
          <div className={cn(sectionBody, 'space-y-3')}>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0" value={localMin} onChange={(event) => setLocalMin(event.target.value)} placeholder="Minimum" className="w-full rounded-lg border border-paper-400 px-3 py-2 text-sm outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
              <input type="number" min="0" value={localMax} onChange={(event) => setLocalMax(event.target.value)} placeholder="Maximum" className="w-full rounded-lg border border-paper-400 px-3 py-2 text-sm outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
            </div>
            <p className="text-xs text-ink-500">{formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}</p>
            <Button size="sm" fullWidth onClick={applyPrice}>Apply price</Button>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 lg:block"><div className="sticky top-32">{content}</div></aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink-900/30" onClick={onMobileClose} />
          <aside className="absolute inset-y-0 right-0 w-80 max-w-[88vw] overflow-y-auto rounded-l-2xl bg-paper-50 p-4 shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
