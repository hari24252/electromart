import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import type { Category } from '@/types';

export function CategoryNav() {
  const getCategoryTree = useDataStore((s) => s.getCategoryTree);
  const tree = getCategoryTree();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="hidden lg:flex items-center gap-0">
      {tree.slice(0, 8).map((cat: Category) => (
        <div
          key={cat._id}
          className="relative"
          onMouseEnter={() => setOpenMenu(cat._id)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <Link
            to={`/catalog?category=${cat.slug}`}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600 whitespace-nowrap"
            onClick={() => setOpenMenu(null)}
          >
            {cat.name}
            {cat.children && cat.children.length > 0 && <ChevronDown className="w-3.5 h-3.5" />}
          </Link>

          {cat.children && cat.children.length > 0 && openMenu === cat._id && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[210px] rounded-xl border border-paper-300 bg-white p-1 shadow-lg">
              {cat.children.map((sub) => (
                <Link
                  key={sub._id}
                  to={`/catalog?category=${cat.slug}&subCategory=${sub.slug}`}
                  className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900"
                >
                  {sub.name}
                  <span className="float-right text-xs text-ink-400">{sub.productCount}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
