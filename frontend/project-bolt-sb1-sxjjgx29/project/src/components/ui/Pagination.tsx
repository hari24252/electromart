import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-paper-400 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ←
      </button>
      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              p === page ? 'border-ink-900 bg-ink-900 text-white' : 'border-paper-400 bg-white text-ink-700 hover:bg-paper-100',
            )}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="px-2 text-ink-400">
            {p}
          </span>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-paper-400 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}
