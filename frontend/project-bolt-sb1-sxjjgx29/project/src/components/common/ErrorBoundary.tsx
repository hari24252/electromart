import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _info: ErrorInfo): void {}

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen grid place-items-center bg-paper-100 px-4">
        <section className="max-w-md brutal-card bg-white p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-danger-600" />
          <h1 className="text-2xl font-bold uppercase">Something went wrong</h1>
          <p className="mt-2 text-sm text-ink-500">The page hit an unexpected issue. Your cart and account are still safe.</p>
          <button onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 brutal-border bg-accent-400 px-4 py-2 text-sm font-bold uppercase">
            <RefreshCw className="h-4 w-4" /> Reload page
          </button>
        </section>
      </main>
    );
  }
}
