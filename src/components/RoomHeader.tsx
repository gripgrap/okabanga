import React from 'react';
import { RoomSubTab } from '../types';

interface RoomHeaderProps {
  currentTab: RoomSubTab;
  onSelectTab: (tab: RoomSubTab) => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  currentTab,
  onSelectTab,
  onBack,
  onOpenSettings,
}) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-2.5 space-y-2.5 sm:space-y-3">
        {/* Room Identity Sub-Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 shrink-0 group cursor-pointer"
              aria-label="뒤로가기"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="text-[15px] sm:text-[17px] md:text-[18px] text-[#161C25] dark:text-slate-100 font-bold truncate">
                  프론트엔드 실무 오픈카톡방
                </h1>
                <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[16px] sm:text-[18px] filled shrink-0">
                  verified
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-slate-400">group</span>
                  840명 참여 중
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="inline-flex items-center gap-1 font-semibold text-[#006C49] dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  실시간 AI 정제 중
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              카카오 계정 동기화 중
            </span>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all duration-150 group cursor-pointer"
              aria-label="채팅방 알림 및 옵션"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:rotate-45">tune</span>
            </button>
          </div>
        </div>

        {/* Segmented Control (iOS Native Pill Bar) */}
        <div className="p-1 rounded-2xl bg-[#E9EEFB] dark:bg-slate-800 flex items-center shadow-inner transition-colors">
          <button
            type="button"
            onClick={() => onSelectTab('summary')}
            className={`flex-1 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
              currentTab === 'summary'
                ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[15px] sm:text-[16px] ${currentTab === 'summary' ? 'text-[#006C49] dark:text-emerald-400 filled' : ''}`}>
              auto_awesome
            </span>
            <span className="truncate">핵심 요약</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('chat')}
            className={`flex-1 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
              currentTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">forum</span>
            <span className="truncate">실시간 토론</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[9px] sm:text-[10px] font-extrabold">
              28
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('resources')}
            className={`flex-1 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
              currentTab === 'resources'
                ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">attach_file</span>
            <span className="truncate">공유 자료</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] dark:bg-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
