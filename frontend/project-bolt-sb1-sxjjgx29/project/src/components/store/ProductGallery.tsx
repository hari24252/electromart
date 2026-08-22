import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  category?: string;
}

export function ProductGallery({ images, alt, category }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [''];

  const goPrev = () => setActiveIdx((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  const goNext = () => setActiveIdx((i) => (i === displayImages.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible no-scrollbar">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition-all',
                  activeIdx === i
                    ? 'border-brand-500 ring-2 ring-brand-500/30 opacity-100 shadow-glow-blue'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                )}
              >
                <ProductImagePlaceholder
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  category={category}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative">
          <div className="relative aspect-square glass-panel overflow-hidden group border-slate-800">
            <ProductImagePlaceholder
              src={displayImages[activeIdx]}
              alt={alt}
              category={category}
              className="w-full h-full object-cover"
            />

            {/* Zoom button */}
            <button
              onClick={() => setZoomOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Nav arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      activeIdx === i ? 'bg-brand-500 w-6' : 'bg-slate-700 w-2'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-scale-in"
          onClick={() => setZoomOpen(false)}
        >
          <button
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            onClick={() => setZoomOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <ProductImagePlaceholder
              src={displayImages[activeIdx]}
              alt={alt}
              category={category}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

