import React from 'react';
import { MainNavTab, RoomSubTab, ThemeMode } from '../types';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  activeNav: MainNavTab;
  currentRoomSubTab?: RoomSubTab;
  onSelectNav: (nav: MainNavTab) => void;
  onOpenKakaoModal: () => void;
  notificationEnabled: boolean;
  onToggleNotification: () => void;
  isMobileShellMode: boolean;
  onToggleMobileShell: () => void;
  isDemoMode?: boolean;
  isDarkMode?: boolean;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme?: () => void;
  onNavigateToRoom?: (tab?: RoomSubTab, bubbleId?: string) => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  currentRoomSubTab = 'summary',
  onSelectNav,
  onOpenKakaoModal,
  notificationEnabled,
  onToggleNotification,
  isMobileShellMode,
  onToggleMobileShell,
  isDemoMode,
  isDarkMode = false,
  themeMode = 'system',
  onSetThemeMode,
  onToggleTheme,
  onNavigateToRoom,
  onShowToast,
}) => {
  const handleCycleTheme = () => {
    if (onSetThemeMode) {
      if (themeMode === 'system') onSetThemeMode('light');
      else if (themeMode === 'light') onSetThemeMode('dark');
      else onSetThemeMode('system');
    } else if (onToggleTheme) {
      onToggleTheme();
    }
  };
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-xs pt-safe transition-colors">
      <div className="max-w-7xl mx-auto h-14 sm:h-16 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => onSelectNav('home')}
            className="flex items-center gap-1.5 group text-left shrink-0"
          >
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[22px] sm:text-[24px]">forum</span>
            <span className="text-[16px] sm:text-[19px] text-[#161C25] dark:text-slate-100 font-bold tracking-tight">
              오카방가방가
            </span>
          </button>
          
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold shrink-0">
            <span className="material-symbols-outlined text-[12px] filled">auto_awesome</span>
            알짜 요약
          </span>

          {isDemoMode && (
            <span 
              onClick={() => onSelectNav('my')}
              className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#005236] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold shrink-0 cursor-pointer hover:bg-emerald-100 transition-colors"
              title="데모 모드 동작 중 (마이페이지에서 설정 변경)"
            >
              <span className="material-symbols-outlined text-[12px] filled text-[#006C49] dark:text-emerald-400">science</span>
              <span>체험 데이터 모드</span>
            </span>
          )}
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0">
          <button
            type="button"
            onClick={() => onSelectNav('home')}
            className={`text-sm font-semibold transition-colors pb-0.5 ${
              activeNav === 'home'
                ? 'text-[#006C49] dark:text-emerald-400 border-b-2 border-[#006C49] dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            서비스 소개
          </button>
          <button
            type="button"
            onClick={() => onSelectNav('curation')}
            className={`text-sm font-semibold transition-colors pb-0.5 ${
              activeNav === 'curation'
                ? 'text-[#006C49] dark:text-emerald-400 border-b-2 border-[#006C49] dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            추천 주제
          </button>
          <button
            type="button"
            onClick={() => onSelectNav('rooms')}
            className={`text-sm font-semibold transition-colors pb-0.5 ${
              activeNav === 'rooms'
                ? 'text-[#006C49] dark:text-emerald-400 border-b-2 border-[#006C49] dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            채팅방 분석
          </button>
          <button
            type="button"
            onClick={() => onSelectNav('saved')}
            className={`text-sm font-semibold transition-colors pb-0.5 ${
              activeNav === 'saved'
                ? 'text-[#006C49] dark:text-emerald-400 border-b-2 border-[#006C49] dark:border-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            내 저장소
          </button>
        </nav>

        {/* Global Search Component */}
        <div className="flex items-center shrink-0">
          <GlobalSearch
            activeNav={activeNav}
            currentSubTab={currentRoomSubTab}
            onNavigateToRoom={(tab, bubbleId) => {
              if (onNavigateToRoom) {
                onNavigateToRoom(tab, bubbleId);
              } else {
                onSelectNav('rooms');
              }
            }}
            onNavigateToNav={onSelectNav}
            onShowToast={onShowToast || (() => {})}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Dark / Light / System Mode Toggle Button */}
          {(onSetThemeMode || onToggleTheme) && (
            <button
              type="button"
              onClick={handleCycleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 shadow-xs cursor-pointer select-none group relative"
              title={
                themeMode === 'system'
                  ? `현재: 시스템 자동 (${isDarkMode ? '다크' : '라이트'}) · 클릭하여 라이트 모드로 전환`
                  : themeMode === 'light'
                  ? '현재: 라이트 모드 · 클릭하여 다크 모드로 전환'
                  : '현재: 다크 모드 · 클릭하여 시스템 모드로 전환'
              }
              aria-label="화면 테마 모드 전환"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-transform duration-300 group-hover:rotate-12">
                {themeMode === 'system'
                  ? 'settings_brightness'
                  : themeMode === 'dark'
                  ? 'dark_mode'
                  : 'light_mode'}
              </span>
              {themeMode === 'system' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          )}

          {/* Viewport Frame Toggle (Mobile App vs Desktop Responsive) */}
          <button
            type="button"
            onClick={onToggleMobileShell}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all duration-150 group cursor-pointer"
            title="모바일 뷰 프레임과 데스크톱 반응형 뷰를 전환합니다"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:scale-110">
              {isMobileShellMode ? 'desktop_windows' : 'smartphone'}
            </span>
            <span>{isMobileShellMode ? '와이드 뷰' : '모바일 뷰'}</span>
          </button>

          {/* Notification Button */}
          <button
            type="button"
            onClick={onToggleNotification}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-all duration-150 group cursor-pointer ${
              notificationEnabled
                ? 'bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            <span className={`material-symbols-outlined text-[15px] transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-105 ${notificationEnabled ? 'text-[#006C49] dark:text-emerald-400 filled' : ''}`}>
              {notificationEnabled ? 'notifications_active' : 'notifications_off'}
            </span>
            <span className="hidden sm:inline">알림 {notificationEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Kakao 1-Click Connect Button */}
          <button
            type="button"
            onClick={onOpenKakaoModal}
            className="flex items-center gap-1.5 bg-[#FEE500] text-[#191919] font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:brightness-95 active:scale-95 transition-all duration-150 shadow-xs group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] transition-transform duration-200 group-hover:scale-110">chat</span>
            <span>오픈채팅 연동</span>
          </button>

          {/* Profile Avatar */}
          <button
            type="button"
            onClick={() => onSelectNav('my')}
            className="w-8 h-8 rounded-full bg-[#006C49] text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all duration-150 group cursor-pointer"
            aria-label="마이페이지"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
