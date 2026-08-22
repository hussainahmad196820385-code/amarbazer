import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught App Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('amarbazar_products_store');
      localStorage.removeItem('amarbazar_categories_store');
      localStorage.removeItem('amarbazar_sellers_store');
      localStorage.removeItem('amarbazar_orders_store');
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    window.location.href = window.location.pathname;
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center animate-fade-in">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
              কিছু সমস্যা হয়েছে (Something went wrong)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              অ্যাপ্লিকেশনের পৃষ্ঠা লোড হতে একটি সাময়িক ত্রুটি হয়েছে। নিচের বোতাম চেপে পৃষ্ঠাটি আবার রিলোড করুন বা হোমপেজে ফিরে যান।
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় লোড করুন (Reload Page)</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>হোমপেজে যান (Go to Home)</span>
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full py-2.5 px-4 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ক্যাশ পরিষ্কার করে রিস্টার্ট করুন (Clear Cache & Reset)</span>
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 overflow-x-auto">
                <summary className="cursor-pointer font-bold mb-1">প্রযুক্তিগত বিস্তারিত (Technical Details)</summary>
                <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
