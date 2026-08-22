import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface CarouselProps {
  children: ReactNode;
  title?: string;
  itemsClassName?: string;
}

export function Carousel({ children, title, itemsClassName }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="brutal-section-title">{title}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="brutal-border bg-white p-2 hover:bg-paper-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="brutal-border bg-white p-2 hover:bg-paper-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <div
        ref={scrollRef}
        className={`flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x ${itemsClassName ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
