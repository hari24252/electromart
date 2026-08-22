import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { label: string; content: ReactNode; icon?: ReactNode }[];
  defaultIndex?: number;
  className?: string;
}

import { useState } from 'react';

export function Tabs({ tabs, defaultIndex = 0, className }: TabsProps) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-0 brutal-border bg-paper-100 p-1">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-semibold text-sm uppercase tracking-wide transition-all duration-150',
              active === i
                ? 'bg-ink-900 text-white shadow-brutal-sm'
                : 'bg-transparent text-ink-600 hover:bg-paper-200',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 animate-fade-in">{tabs[active].content}</div>
    </div>
  );
}
