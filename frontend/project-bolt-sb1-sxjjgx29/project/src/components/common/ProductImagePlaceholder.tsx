import { useState, type FC } from 'react';
import { Laptop, Smartphone, Headphones, Watch, Gamepad2, Camera, Tv, Cpu, Package } from 'lucide-react';

interface ProductImagePlaceholderProps {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

const productIcon = (category: string) => {
  const label = category.toLowerCase();
  if (label.includes('laptop') || label.includes('computer')) return Laptop;
  if (label.includes('phone') || label.includes('mobile')) return Smartphone;
  if (label.includes('audio') || label.includes('headphone') || label.includes('earbud') || label.includes('speaker')) return Headphones;
  if (label.includes('watch') || label.includes('wearable') || label.includes('fitness')) return Watch;
  if (label.includes('game') || label.includes('console')) return Gamepad2;
  if (label.includes('camera') || label.includes('photo')) return Camera;
  if (label.includes('display') || label.includes('monitor') || label.includes('tv')) return Tv;
  if (label.includes('component') || label.includes('accessory')) return Cpu;
  return Package;
};

export const ProductImagePlaceholder: FC<ProductImagePlaceholderProps> = ({
  src,
  alt = 'Product image',
  category = 'electronics',
  className = 'h-full w-full object-cover',
  aspectRatio = 'square',
}) => {
  const [imageError, setImageError] = useState(false);
  const normalizedSrc = src ? (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/') ? src : `/${src}`) : null;

  if (normalizedSrc && !imageError) {
    return <img src={normalizedSrc} alt={alt} className={className} onError={() => setImageError(true)} loading="lazy" />;
  }

  const Icon = productIcon(category);
  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <div className={`grid ${aspectClass} place-items-center rounded-xl border border-paper-300 bg-paper-100 p-6 ${className}`}>
      <div className="grid place-items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-brand-500 shadow-sm">
          <Icon className="h-8 w-8 stroke-[1.5]" />
        </span>
        <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">{category}</span>
      </div>
    </div>
  );
};
