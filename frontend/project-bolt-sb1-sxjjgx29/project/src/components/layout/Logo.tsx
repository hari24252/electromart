import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-lg' },
    md: { icon: 'w-7 h-7', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-3xl' },
  };

  return (
    <Link to="/" className={`flex items-center gap-2 font-bold ${className}`}>
      <span className={`${sizes[size].icon} brutal-border bg-accent-400 flex items-center justify-center`}>
        <Zap className="w-3/4 h-3/4 text-ink-900" fill="currentColor" />
      </span>
      <span className={`${sizes[size].text} font-bold tracking-tight uppercase`}>
        Electro<span className="text-primary-600">Mart</span>
      </span>
    </Link>
  );
}
