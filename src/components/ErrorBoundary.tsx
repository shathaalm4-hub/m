import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#34202B] text-[#FFFFFF] flex items-center justify-center p-6 text-center">
          <div className="bg-[#34202B] border-2 border-[#922D50] rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-2xl font-black text-[#FFFFFF]">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-sm text-[#F5DDE2]/80">قد تكون البيانات المخزنة مؤقتاً غير صالحة. سنقوم بإعادة ضبط البيانات لتتمكن من المتابعة.</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-3 rounded-2xl bg-[#922D50] text-[#FFFFFF] font-black text-sm shadow-xl hover:bg-[#922D50]/90 transition-all cursor-pointer"
            >
              إعادة ضبط وتشغيل اللعبة 🔄
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
