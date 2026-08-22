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
      navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
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
          className="w-full brutal-border bg-white pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:shadow-brutal focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
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
        <div className="absolute top-full mt-1 w-full bg-white brutal-border shadow-brutal z-50 animate-fade-in">
          {suggestions.map((p) => (
            <button
              key={p._id}
              onClick={() => {
                navigate(`/product/${p.slug}`);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2.5 hover:bg-paper-100 transition-colors text-left"
            >
              <MediaImage src={p.thumbnail} alt={p.name} fallbackLabel={p.name} className="w-10 h-10 object-cover brutal-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-ink-500">{p.brand}</p>
              </div>
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full p-2.5 border-t-2 border-ink-900 bg-ink-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-ink-800 transition-colors"
          >
            See all results
          </button>
        </div>
      )}
    </div>
  );
}
