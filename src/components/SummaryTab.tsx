import React, { useState } from 'react';
import { DiscussionCategoryKey, RoomSubTab } from '../types';
import { DiscussionAtmosphereChart } from './DiscussionAtmosphereChart';
import { CoreDiscussionsTagSection, CATEGORY_TABS } from './CoreDiscussionsTagSection';

interface SummaryTabProps {
  onSwitchTab: (tab: RoomSubTab) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onNavigateToFactCheck: (bubbleId: string) => void;
  onOpenShareCard: () => void;
  isDarkMode?: boolean;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({
  onSwitchTab,
  onShowToast,
  onNavigateToFactCheck,
  onOpenShareCard,
  isDarkMode = false,
}) => {
  // Category state controlled from the top of SummaryTab
  const [activeCategory, setActiveCategory] = useState<DiscussionCategoryKey>('all');

  return (
    <div className="space-y-4">
      {/* 0. Top Category Navigation Bar (토론 성격 기반: 전체 / 기술 / 트러블슈팅 / 시사 / 잡담) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <span>오픈카톡 요약 카테고리</span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                (AI 성격 기반 자동 분류)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenShareCard}
              className="px-2.5 py-1 rounded-full bg-[#EFF4FF] dark:bg-slate-800 hover:bg-[#ADEDD3]/50 dark:hover:bg-slate-700 text-[#006C49] dark:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 group cursor-pointer"
              title="요약 카드 SNS 공유"
            >
              <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:scale-110">ios_share</span>
              <span>카드 공유</span>
            </button>
          </div>
        </div>

        {/* Top Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key);
                  onShowToast(`'${cat.label}' 카테고리로 필터링되었습니다.`, cat.icon);
                }}
                className={`shrink-0 px-3 sm:px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isActive
                    ? cat.key === 'chat'
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/30'
                      : 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700'
                }`}
                title={cat.desc}
              >
                <span className={`material-symbols-outlined text-[15px] ${isActive ? 'filled' : ''}`}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 1. Key Metrics & Filtering Efficiency Card */}
      <section className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#ADEDD3]/30 dark:bg-emerald-900/20 pointer-events-none blur-2xl" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#006C49] dark:text-emerald-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
            잡담 98.1% 제거 완료
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">오늘 18:30 기준</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#006C49] dark:text-emerald-400 tracking-tight">28</span>
          <span className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100">개 알짜 인사이트</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 line-through ml-1">1,420개 대화 중</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3.5 leading-relaxed">
          점심 메뉴, 인사, 이모티콘 핑퐁을 걷어내고 실무 아키텍처와 트러블슈팅 28건을 엄선했습니다.
        </p>

        {/* Signal Ratio Visualizer Bar */}
        <div className="w-full bg-[#E9EEFB] dark:bg-slate-800 rounded-full h-2.5 flex overflow-hidden p-0.5">
          <div className="bg-[#006C49] dark:bg-emerald-500 h-full rounded-full transition-all duration-500 w-[22%]" />
          <div className="bg-slate-300 dark:bg-slate-700 h-full rounded-full ml-1 flex-1 opacity-40" />
        </div>

        <div className="flex justify-between items-center mt-2 text-xs">
          <span className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006C49] dark:bg-emerald-400" />
            핵심 토론 28건
          </span>
          <span className="text-slate-400 dark:text-slate-500">필터링된 노이즈 1,392개</span>
        </div>
      </section>

      {/* 2. Recharts 기반 토론 분위기 & 감정 변화 시각화 */}
      <DiscussionAtmosphereChart
        isDarkMode={isDarkMode}
        onNavigateToFactCheck={onNavigateToFactCheck}
      />

      {/* 3. 핵심 토론 자동 분류 태그 시스템 & 커스텀 태그 관리 UI */}
      <CoreDiscussionsTagSection
        onSwitchTab={onSwitchTab}
        onShowToast={onShowToast}
        onNavigateToFactCheck={onNavigateToFactCheck}
        isDarkMode={isDarkMode}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* 4. Slim Link Delegation Banner */}
      <section 
        onClick={() => onSwitchTab('resources')}
        className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100 truncate">
              관련 공유 자료 6건 (다이어그램 · 깃허브 · 공식문서)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              daangn 분산 락 레포, Next 15 공식문서 및 Turbopack 벤치마크
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-[#EFF4FF] dark:bg-slate-800 text-[#006C49] dark:text-emerald-400 text-xs font-bold shrink-0 group-hover:bg-[#ADEDD3] dark:group-hover:bg-emerald-900/60 transition-colors flex items-center gap-1">
          <span>자료 탭 열기</span>
          <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
        </span>
      </section>
    </div>
  );
};
