import React, { useState } from 'react';
import { Laptop, Smartphone, Headphones, Watch, Gamepad2, Camera, Tv, Cpu, Package } from 'lucide-react';

interface ProductImagePlaceholderProps {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  src,
  alt = 'Product image',
  category = 'electronics',
  className = 'w-full h-full object-cover',
  aspectRatio = 'square',
}) => {
  const [imageError, setImageError] = useState(false);

  // Normalize image source (handles relative assets, uploads, and placeholders)
  const normalizedSrc = src ? (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/') ? src : `/${src}`) : null;

  if (normalizedSrc && !imageError) {
    return (
      <img
        src={normalizedSrc}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback high-tech SVG illustration based on category title
  const cat = category.toLowerCase();
  const getCategoryConfig = () => {
    if (cat.includes('laptop') || cat.includes('macbook') || cat.includes('computer')) {
      return {
        icon: Laptop,
        gradient: 'from-blue-600/20 via-cyan-500/10 to-indigo-900/40',
        accentColor: 'text-cyan-400',
        badge: 'LAPTOP / WORKSTATION',
      };
    }
    if (cat.includes('phone') || cat.includes('mobile') || cat.includes('iphone')) {
      return {
        icon: Smartphone,
        gradient: 'from-purple-600/20 via-pink-500/10 to-slate-900/40',
        accentColor: 'text-purple-400',
        badge: 'SMARTPHONE',
      };
    }
    if (cat.includes('audio') || cat.includes('headphone') || cat.includes('earbud') || cat.includes('speaker')) {
      return {
        icon: Headphones,
        gradient: 'from-amber-500/20 via-orange-500/10 to-rose-950/40',
        accentColor: 'text-amber-400',
        badge: 'PRO AUDIO',
      };
    }
    if (cat.includes('watch') || cat.includes('wearable') || cat.includes('fitness')) {
      return {
        icon: Watch,
        gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-950/40',
        accentColor: 'text-emerald-400',
        badge: 'WEARABLE TECH',
      };
    }
    if (cat.includes('game') || cat.includes('console') || cat.includes('gaming')) {
      return {
        icon: Gamepad2,
        gradient: 'from-violet-600/25 via-indigo-600/15 to-slate-950/50',
        accentColor: 'text-violet-400',
        badge: 'GAMING HARDWARE',
      };
    }
    if (cat.includes('camera') || cat.includes('photo') || cat.includes('lens')) {
      return {
        icon: Camera,
        gradient: 'from-sky-500/20 via-blue-600/10 to-slate-950/40',
        accentColor: 'text-sky-400',
        badge: 'OPTICS & CAMERA',
      };
    }
    if (cat.includes('display') || cat.includes('monitor') || cat.includes('tv')) {
      return {
        icon: Tv,
        gradient: 'from-blue-600/20 via-cyan-400/10 to-slate-950/40',
        accentColor: 'text-blue-400',
        badge: 'ULTRAWIDE DISPLAY',
      };
    }
    if (cat.includes('component') || cat.includes('processor') || cat.includes('storage') || cat.includes('accessory')) {
      return {
        icon: Cpu,
        gradient: 'from-cyan-500/20 via-blue-500/10 to-slate-950/40',
        accentColor: 'text-cyan-400',
        badge: 'HARDWARE COMPONENT',
      };
    }
    return {
      icon: Package,
      gradient: 'from-slate-800/40 via-slate-900/60 to-slate-950/80',
      accentColor: 'text-brand-400',
      badge: 'PREMIUM ELECTRONICS',
    };
  };

  const config = getCategoryConfig();
  const IconComponent = config.icon;

  const aspectClass =
    aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <div
      className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-gradient-to-br ${config.gradient} border border-slate-800/80 flex flex-col items-center justify-center p-6 group select-none ${className}`}
    >
      {/* Dynamic Background Tech Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all duration-500" />
      
      {/* Central Tech Graphic */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3 group-hover:scale-105 transition-transform duration-300">
        <div className={`p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-xl backdrop-blur-md ${config.accentColor}`}>
          <IconComponent className="w-10 h-10 stroke-[1.5]" />
        </div>
        
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
          {config.badge}
        </span>
      </div>

      {/* Grid Corner Flourishes */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-slate-700" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-slate-700" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-slate-700" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-slate-700" />
    </div>
  );
};
