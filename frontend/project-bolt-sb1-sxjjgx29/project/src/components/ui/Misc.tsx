import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center flex-wrap gap-1', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wide text-ink-900">{item.label}</span>
            )}
            {!isLast && <span className="text-ink-300 text-xs">/</span>}
          </div>
        );
      })}
    </nav>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-ink-300">{icon}</div>}
      <h3 className="text-xl font-bold uppercase tracking-tight mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4 flex-wrap', className)}>
      <div>
        <h2 className="brutal-section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-paper-300', className)} />;
}
