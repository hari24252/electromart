
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="brutal-border-3 bg-accent-400 px-8 py-4 mb-6 animate-bounce-in">
        <p className="text-6xl font-bold tracking-tighter">404</p>
      </div>
      <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-ink-500 mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex gap-2">
        <Link to="/"><Button variant="outline">Go Home</Button></Link>
        <Link to="/"><Button>Browse Products</Button></Link>
      </div>
    </div>
  );
}
