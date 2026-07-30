import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08111F] text-[#F8FAFC] flex items-center justify-center p-6 font-sans">
          <Card className="max-w-md w-full p-8 border border-white/5 bg-[#0F172A] text-center space-y-6 rounded-[24px] shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold tracking-tight">Something went wrong</h1>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                An unexpected interface rendering crash was intercepted. You can safely reload the page or return to the main dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <pre className="text-left text-[10px] bg-slate-950 p-4 rounded-xl overflow-x-auto border border-white/5 font-mono max-h-40 text-red-400 select-text">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={this.handleReload} className="flex-1 py-3 font-bold rounded-custom">
                Reload Interface
              </Button>
              <a href="/dashboard" className="flex-1">
                <Button variant="secondary" className="w-full py-3 font-bold rounded-custom">
                  Dashboard
                </Button>
              </a>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
