import React from 'react';

interface DesktopFooterProps {
  onShowToast: (msg: string, icon?: string) => void;
}

export const DesktopFooter: React.FC<DesktopFooterProps> = ({ onShowToast }) => {
  return (
    <footer className="bg-slate-100/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 mt-16 pb-20 sm:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Logo & Copyright */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-xl">forum</span>
            <span className="text-base font-bold text-[#006C49] dark:text-emerald-400">오카방가방가</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            © 2024 오카방가방가. All rights reserved. 오픈채팅 잡담 필터링 &amp; 인사이트 다이제스트.
          </p>
        </div>

        {/* Right: Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => onShowToast('이용약관 안내 문서입니다.', 'info')}
            className="hover:text-[#006C49] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            이용약관
          </button>
          <button
            type="button"
            onClick={() => onShowToast('개인정보처리방침: 종단간 암호화 원칙 준수', 'verified_user')}
            className="hover:text-[#006C49] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            개인정보처리방침
          </button>
          <button
            type="button"
            onClick={() => onShowToast('카카오톡 1분 연동 가이드입니다.', 'help')}
            className="hover:text-[#006C49] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            연동 가이드
          </button>
          <button
            type="button"
            onClick={() => onShowToast('고객센터: support@okabang.io', 'support_agent')}
            className="hover:text-[#006C49] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            고객센터
          </button>
        </div>
      </div>
    </footer>
  );
};
