import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { MediaImage } from '@/components/ui/MediaImage';

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const setFilters = useDataStore((s) => s.setFilters);
  const products = useDataStore((s) => s.products);

  const suggestions = query
    ? products
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setFilters({ search: query.trim(), page: 1 });
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative flex-1 max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, brands, categories..."
          className="w-full rounded-lg border border-paper-400 bg-white py-2.5 pl-11 pr-10 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-paper-300 bg-white shadow-lg">
          {suggestions.map((p) => (
            <button
              key={p._id}
              onClick={() => {
                navigate(`/product/${p.slug}`);
                setQuery('');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-paper-100"
            >
              <MediaImage src={p.thumbnail} alt={p.name} fallbackLabel={p.name} className="h-10 w-10 rounded-md border border-paper-300 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-ink-500">{p.brand}</p>
              </div>
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full border-t border-paper-300 px-3 py-3 text-left text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            See all results
          </button>
        </div>
      )}
    </div>
  );
}
