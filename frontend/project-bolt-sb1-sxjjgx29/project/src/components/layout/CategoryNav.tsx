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
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-ink-800 transition-colors whitespace-nowrap"
            onClick={() => setOpenMenu(null)}
          >
            {cat.name}
            {cat.children && cat.children.length > 0 && <ChevronDown className="w-3.5 h-3.5" />}
          </Link>

          {cat.children && cat.children.length > 0 && openMenu === cat._id && (
            <div className="absolute top-full left-0 bg-white brutal-border shadow-brutal min-w-[200px] z-50 animate-fade-in">
              {cat.children.map((sub) => (
                <Link
                  key={sub._id}
                  to={`/catalog?category=${cat.slug}&subCategory=${sub.slug}`}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-paper-100 transition-colors border-b border-ink-100 last:border-0"
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
