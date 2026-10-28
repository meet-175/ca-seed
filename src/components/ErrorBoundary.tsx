import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);

    // Auto-reload on chunk load failures (common when new version is deployed and old chunk hashes are purged)
    const isChunkLoadError = 
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkLoadError) {
      const storageKey = 'chartered_seeds_chunk_reload_attempt';
      const lastAttempt = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Only auto-reload if not already reloaded in the last 10 seconds to prevent reload loops
      if (!lastAttempt || now - parseInt(lastAttempt, 10) > 10000) {
        sessionStorage.setItem(storageKey, now.toString());
        console.warn('Chunk load error detected; automatically refreshing to load latest assets...');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load this section
          </h2>
          <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
            The page could not be displayed, possibly due to a temporary network issue or a newly updated version of the site.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
