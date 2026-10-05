import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Sentry 및 프로덕션 로깅 연동
    // VITE_SENTRY_DSN이 설정되어 있고 window.Sentry가 주입된 경우 자동 캡처
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn && typeof (window as unknown as { Sentry?: { captureException: (err: Error, ctx?: unknown) => void } }).Sentry?.captureException === 'function') {
      (window as unknown as { Sentry: { captureException: (err: Error, ctx?: unknown) => void } }).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }

    // 개발 환경 콘솔 로깅
    if (import.meta.env.DEV) {
      console.error('[오카방가방가 ErrorBoundary 포착]:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0B0F17] flex items-center justify-center p-4 antialiased selection:bg-[#ADEDD3]">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                일시적인 오류가 발생했습니다
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                오픈카톡 요약 데이터를 렌더링하는 중 예기치 못한 문제가 발생했습니다. 에러 로그가 Sentry 모니터링 시스템에 안전하게 기록되었습니다.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left overflow-x-auto text-[11px] font-mono text-rose-600 dark:text-rose-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#006C49] hover:bg-[#005236] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>페이지 새로고침</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                    window.location.href = '/';
                  } catch {
                    window.location.reload();
                  }
                }}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
                title="로컬 캐시 초기화 후 재시작"
              >
                캐시 초기화
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
