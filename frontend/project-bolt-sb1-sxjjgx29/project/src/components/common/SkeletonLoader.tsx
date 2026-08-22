import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'product' | 'text' | 'card' | 'avatar';
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', className }) => {
  if (variant === 'product') {
    return (
      <div className={cn('glass-card p-4 space-y-4 animate-pulse rounded-2xl border border-slate-800/80', className)}>
        <div className="aspect-square bg-slate-800/60 rounded-xl" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-800/80 rounded w-1/3" />
          <div className="h-4 bg-slate-800/90 rounded w-3/4" />
          <div className="h-5 bg-slate-800 rounded w-1/2 pt-2" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={cn('w-10 h-10 rounded-full bg-slate-800/80 animate-pulse', className)} />;
  }

  if (variant === 'text') {
    return <div className={cn('h-4 bg-slate-800/80 rounded w-full animate-pulse', className)} />;
  }

  return (
    <div className={cn('glass-panel p-6 space-y-3 animate-pulse rounded-xl border border-slate-800', className)}>
      <div className="h-4 bg-slate-800 rounded w-1/4" />
      <div className="h-8 bg-slate-800/60 rounded w-full" />
    </div>
  );
};
