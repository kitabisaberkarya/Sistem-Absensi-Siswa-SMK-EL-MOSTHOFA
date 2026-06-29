
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertOctagon } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan Tak Terduga</h2>
          <p className="text-gray-500 text-sm mb-6">
            Aplikasi mengalami error. Detail kesalahan telah dicatat. Coba muat ulang halaman atau laporkan ke administrator.
          </p>
          {this.state.error && (
            <pre className="text-xs text-left bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 overflow-auto max-h-32 text-red-600">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }
}
