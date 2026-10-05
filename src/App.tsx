/**
 * ==============================================================================
 * 오카방가방가 (Okabang) - Main Application Root Component
 * ==============================================================================
 * 역할 및 전역 상태 관리:
 *  - 5대 메인 네비게이션 탭 (Home, Rooms, Curation, Saved, MyPage)
 *  - 채팅방 서브탭 (Summary 요약, Chat 타임라인, Resources 리소스)
 *  - 3단 테마 시스템 (Light, Dark, System Auto Mode with OS matchMedia Listener)
 *  - 스마트 탭 인식 글로벌 검색 및 팩트체크 앵커 스크롤 연동
 *  - 모바일 폰 쉘 시뮬레이터 ↔ 데스크톱 반응형 와이드 뷰포트 토글
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoomHeader } from './components/RoomHeader';
import { SummaryTab } from './components/SummaryTab';
import { ChatTimelineTab } from './components/ChatTimelineTab';
import { ResourcesTab } from './components/ResourcesTab';
import { HomeDigestTab } from './components/HomeDigestTab';
import { MyChatRoomsTab } from './components/MyChatRoomsTab';
import { TopicCurationTab } from './components/TopicCurationTab';
import { SavedInsightsTab } from './components/SavedInsightsTab';
import { MyPageTab } from './components/MyPageTab';
import { BottomQuickBar } from './components/BottomQuickBar';
import { BottomNav } from './components/BottomNav';
import { KakaoSyncModal } from './components/KakaoSyncModal';
import { ShareCardModal } from './components/ShareCardModal';
import { ImageModal } from './components/ImageModal';
import { Toast } from './components/Toast';
import { DesktopFooter } from './components/DesktopFooter';
import { useThrottledAction } from './hooks/useThrottledAction';
import { MainNavTab, RoomSubTab, ThemeMode } from './types';

export default function App() {
  // Navigation States
  const [activeNav, setActiveNav] = useState<MainNavTab>('rooms');
  const [roomSubTab, setRoomSubTab] = useState<RoomSubTab>('summary');
  const [isMobileShellMode, setIsMobileShellMode] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [highlightedBubbleId, setHighlightedBubbleId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // System Theme Preference Listener & State
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Theme Mode: 'light' | 'dark' | 'system' (Default 'system')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('okabang_theme_mode') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      const oldSaved = localStorage.getItem('okabang_theme');
      if (oldSaved === 'dark') return 'dark';
      if (oldSaved === 'light') return 'light';
    } catch {
      // LocalStorage access fallback
    }
    return 'system';
  });

  // Toast Notification State
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    icon: string;
  }>({
    isVisible: false,
    message: '',
    icon: 'check_circle',
  });

  const showToast = (message: string, icon = 'check_circle') => {
    setToast({ isVisible: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 2800);
  };

  // Ref to track current themeMode inside event listeners without stale closures
  const themeModeRef = React.useRef<ThemeMode>(themeMode);
  useEffect(() => {
    themeModeRef.current = themeMode;
  }, [themeMode]);

  // Listen for OS system theme changes and notify user via toast if in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
      if (themeModeRef.current === 'system') {
        showToast(
          `🖥️ 시스템 설정 동기화: OS 테마 변경이 감지되어 ${e.matches ? '다크 모드' : '라이트 모드'}로 자동 전환되었습니다.`,
          'settings_brightness'
        );
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Computed effective dark mode boolean
  const isDarkMode = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  // Apply dark class and persist theme mode
  useEffect(() => {
    try {
      localStorage.setItem('okabang_theme_mode', themeMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('okabang_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('okabang_theme', 'light');
      }
    } catch {
      // LocalStorage access fallback
    }
  }, [themeMode, isDarkMode]);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode === 'system') {
      const currentOSDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      showToast(
        `🖥️ 시스템 설정 동기화: 기기 설정에 따라 ${currentOSDark ? '다크 모드' : '라이트 모드'}로 자동 전환됩니다.`,
        'settings_brightness'
      );
    } else if (mode === 'dark') {
      showToast('🌙 다크 모드가 적용되었습니다.', 'dark_mode');
    } else {
      showToast('☀️ 라이트 모드가 적용되었습니다.', 'light_mode');
    }
  };

  // Modals & Overlay States
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState<boolean>(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState<boolean>(false);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: '',
  });

  const handleOpenDiagram = (imageUrl: string, title: string, subtitle?: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      showToast(
        next ? '내 저장소에 보관되었습니다.' : '북마크가 해제되었습니다.',
        next ? 'bookmark_added' : 'bookmark_remove'
      );
      return next;
    });
  };

  // Request Throttling Hooks for Save & Sync Actions (3s Cooldown)
  const notionThrottle = useThrottledAction({
    cooldownSeconds: 3,
    onBlocked: (remaining) => {
      showToast(`⏳ 노션 동기화 쿨다운 중입니다 (${remaining}초 후 재시도 가능)`, 'hourglass_top');
    },
  });

  const kakaoThrottle = useThrottledAction({
    cooldownSeconds: 3,
    onBlocked: (remaining) => {
      showToast(`⏳ 카카오 메시지 전송 쿨다운 중입니다 (${remaining}초 후 재시도 가능)`, 'hourglass_top');
    },
  });

  const handleSaveNotion = () => {
    notionThrottle.trigger(() => {
      showToast('노션(Notion) 워크스페이스에 요약이 동기화되었습니다!', 'task_alt');
    });
  };

  const handleSendKakao = () => {
    kakaoThrottle.trigger(() => {
      showToast('나에게 카카오톡 메시지로 발송 완료!', 'mark_chat_read');
    });
  };

  const handleSelectRoom = () => {
    setActiveNav('rooms');
    setRoomSubTab('summary');
    setHighlightedBubbleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToFactCheck = (bubbleId: string) => {
    setHighlightedBubbleId(bubbleId);
    setRoomSubTab('chat');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0B0F17] text-[#F1F5F9]' : 'bg-[#F8F9FF] text-[#161C25]'} flex flex-col antialiased selection:bg-[#ADEDD3] transition-colors`}>
      {/* Global Top App Bar */}
      <Header
        activeNav={activeNav}
        currentRoomSubTab={roomSubTab}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          setHighlightedBubbleId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenKakaoModal={() => setIsKakaoModalOpen(true)}
        notificationEnabled={notificationEnabled}
        onToggleNotification={() => {
          setNotificationEnabled(!notificationEnabled);
          showToast(
            notificationEnabled
              ? '핫토픽 알림이 비활성화되었습니다.'
              : '퇴근길 핵심 요약 브리핑 알림이 활성화되었습니다. (매일 18:30)',
            'notifications'
          );
        }}
        isMobileShellMode={isMobileShellMode}
        onToggleMobileShell={() => {
          setIsMobileShellMode(!isMobileShellMode);
          showToast(
            isMobileShellMode
              ? '반응형 와이드 데스크톱 뷰로 전환되었습니다.'
              : '모바일 앱 화면 뷰로 전환되었습니다.',
            'aspect_ratio'
          );
        }}
        isDemoMode={isDemoMode}
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onSetThemeMode={handleSetThemeMode}
        onToggleTheme={() => handleSetThemeMode(isDarkMode ? 'light' : 'dark')}
        onNavigateToRoom={(tab = 'summary', bubbleId) => {
          setActiveNav('rooms');
          setRoomSubTab(tab);
          if (bubbleId) {
            setHighlightedBubbleId(bubbleId);
          } else {
            setHighlightedBubbleId(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onShowToast={showToast}
      />

      {/* Main View Container */}
      <main className={`flex-1 w-full pt-14 sm:pt-16 ${isMobileShellMode ? 'pb-8' : 'pb-24 md:pb-12'}`}>
        {/* Responsive Layout Shell Wrapper */}
        {isMobileShellMode ? (
          /* Mobile Phone Simulator Shell (Framed Mockup for previewing on desktop) */
          <div className="mx-auto my-4 max-w-[420px] rounded-[48px] shadow-[0_25px_70px_rgba(22,28,37,0.22)] border-[8px] border-slate-800 dark:border-slate-700 bg-[#F8F9FF] dark:bg-slate-900 overflow-hidden relative flex flex-col min-h-[820px] transition-colors">
            {/* Phone Dynamic Island / Speaker Pill */}
            <div className="w-full bg-[#F8F9FF] dark:bg-slate-900 pt-3 pb-1 flex items-center justify-between px-7 shrink-0 select-none">
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">9:41</span>
              <div className="w-20 h-4 bg-slate-800 dark:bg-slate-700 rounded-full" />
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[14px]">wifi</span>
                <span className="material-symbols-outlined text-[14px]">battery_full</span>
              </div>
            </div>

            {/* Mobile Inner Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
              {activeNav === 'rooms' ? (
                <div className="flex flex-col">
                  <RoomHeader
                    currentTab={roomSubTab}
                    onSelectTab={(tab) => {
                      setRoomSubTab(tab);
                      if (tab !== 'chat') setHighlightedBubbleId(null);
                    }}
                    onBack={() => setActiveNav('home')}
                    onOpenSettings={() => setIsKakaoModalOpen(true)}
                  />

                  <div className="p-4 space-y-4">
                    {roomSubTab === 'summary' && (
                      <SummaryTab
                        onSwitchTab={(tab) => setRoomSubTab(tab)}
                        onShowToast={showToast}
                        onNavigateToFactCheck={handleNavigateToFactCheck}
                        onOpenShareCard={() => setIsShareCardOpen(true)}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {roomSubTab === 'chat' && (
                      <ChatTimelineTab
                        onShowToast={showToast}
                        onOpenDiagramModal={handleOpenDiagram}
                        highlightedBubbleId={highlightedBubbleId}
                      />
                    )}
                    {roomSubTab === 'resources' && (
                      <ResourcesTab
                        onShowToast={showToast}
                        onOpenDiagramModal={handleOpenDiagram}
                      />
                    )}

                    <BottomQuickBar
                      isBookmarked={isBookmarked}
                      onToggleBookmark={handleToggleBookmark}
                      onSaveNotion={handleSaveNotion}
                      onSendKakao={handleSendKakao}
                      isNotionCooldown={notionThrottle.isCooldown}
                      notionCooldownLeft={notionThrottle.cooldownLeft}
                      isKakaoCooldown={kakaoThrottle.isCooldown}
                      kakaoCooldownLeft={kakaoThrottle.cooldownLeft}
                    />
                  </div>
                </div>
              ) : activeNav === 'home' ? (
                <div className="p-4">
                  <HomeDigestTab
                    onSelectRoom={handleSelectRoom}
                    onOpenKakaoModal={() => setIsKakaoModalOpen(true)}
                    onShowToast={showToast}
                    isDarkMode={isDarkMode}
                  />
                </div>
              ) : activeNav === 'curation' ? (
                <div className="p-4">
                  <TopicCurationTab
                    onSelectTopic={() => handleSelectRoom()}
                    onShowToast={showToast}
                  />
                </div>
              ) : activeNav === 'saved' ? (
                <div className="p-4">
                  <SavedInsightsTab
                    onShowToast={showToast}
                    onSelectSavedItem={() => handleSelectRoom()}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <MyPageTab
                    onOpenKakaoModal={() => setIsKakaoModalOpen(true)}
                    onShowToast={showToast}
                    isDemoMode={isDemoMode}
                    onToggleDemoMode={(val) => setIsDemoMode(val)}
                    onNavigateToRooms={() => {
                      setActiveNav('rooms');
                      setRoomSubTab('summary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isDarkMode={isDarkMode}
                    themeMode={themeMode}
                    onSetThemeMode={handleSetThemeMode}
                    onToggleTheme={() => handleSetThemeMode(isDarkMode ? 'light' : 'dark')}
                  />
                </div>
              )}
            </div>

            {/* Mobile Shell Fixed Bottom Nav */}
            <BottomNav
              activeTab={activeNav}
              onSelectTab={(tab) => {
                setActiveNav(tab);
                setHighlightedBubbleId(null);
              }}
              className="absolute bottom-0 inset-x-0 !border-t !border-slate-200 dark:!border-slate-800"
            />
          </div>
        ) : (
          /* Full Responsive Mode: Native on Mobile, Premier Dashboard on Tablet & Desktop */
          <div className="w-full">
            {activeNav === 'rooms' ? (
              <div className="w-full">
                {/* Full-width Room Sub-header */}
                <RoomHeader
                  currentTab={roomSubTab}
                  onSelectTab={(tab) => {
                    setRoomSubTab(tab);
                    if (tab !== 'chat') setHighlightedBubbleId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onBack={() => setActiveNav('home')}
                  onOpenSettings={() => setIsKakaoModalOpen(true)}
                />

                {/* Main Content Area with Optimized Paddings & Centered Alignment */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6">
                  {/* Responsive Grid: md(768px) and lg(1024px) with exact 2.5rem (gap-10) spacing */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10 lg:gap-10 items-start">
                    {/* Main Content Column (7 cols on md tablet, 8 cols on desktop) */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-4">
                      {roomSubTab === 'summary' && (
                        <SummaryTab
                          onSwitchTab={(tab) => {
                            setRoomSubTab(tab);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          onShowToast={showToast}
                          onNavigateToFactCheck={handleNavigateToFactCheck}
                          onOpenShareCard={() => setIsShareCardOpen(true)}
                          isDarkMode={isDarkMode}
                        />
                      )}

                      {roomSubTab === 'chat' && (
                        <ChatTimelineTab
                          onShowToast={showToast}
                          onOpenDiagramModal={handleOpenDiagram}
                          highlightedBubbleId={highlightedBubbleId}
                        />
                      )}

                      {roomSubTab === 'resources' && (
                        <ResourcesTab
                          onShowToast={showToast}
                          onOpenDiagramModal={handleOpenDiagram}
                        />
                      )}

                      {/* Mobile only quick action bar (hidden on md & lg where sticky sidebar is docked) */}
                      <div className="block md:hidden mt-3 sm:mt-4">
                        <BottomQuickBar
                          isBookmarked={isBookmarked}
                          onToggleBookmark={handleToggleBookmark}
                          onSaveNotion={handleSaveNotion}
                          onSendKakao={handleSendKakao}
                          isNotionCooldown={notionThrottle.isCooldown}
                          notionCooldownLeft={notionThrottle.cooldownLeft}
                          isKakaoCooldown={kakaoThrottle.isCooldown}
                          kakaoCooldownLeft={kakaoThrottle.cooldownLeft}
                        />
                      </div>
                    </div>

                    {/* Sticky Sidebar Action Panel (5 cols on md, 4 cols on lg, sticky top-20) */}
                    <aside className="hidden md:flex flex-col gap-4 md:col-span-5 lg:col-span-4 sticky top-20">
                      {/* Action Card */}
                      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[18px] filled">
                              bookmark_manager
                            </span>
                            <span>원클릭 아카이빙</span>
                          </h3>
                          <span className="text-[11px] text-[#006C49] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950">
                            동기화 준비완료
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          이 방의 정제된 핵심 토론을 내 업무 지식베이스에 바로 저장하세요.
                        </p>

                        <div className="space-y-2">
                          {/* Notion Save Button with Cooldown Feedback */}
                          <button
                            type="button"
                            onClick={handleSaveNotion}
                            disabled={notionThrottle.isCooldown}
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              notionThrottle.isCooldown
                                ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 active:scale-95 cursor-pointer'
                            }`}
                            title={notionThrottle.isCooldown ? `과도한 요청 방지: ${notionThrottle.cooldownLeft}초 후 다시 시도 가능` : '노션 워크스페이스에 요약 저장'}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${notionThrottle.isCooldown ? 'animate-pulse text-amber-500' : 'text-[#006C49] dark:text-emerald-400'}`}>
                              {notionThrottle.isCooldown ? 'hourglass_top' : 'description'}
                            </span>
                            <span>{notionThrottle.isCooldown ? `노션 쿨다운 (${notionThrottle.cooldownLeft}s)` : '노션(Notion) 워크스페이스 저장'}</span>
                          </button>

                          {/* Kakao Push Button with Cooldown Feedback */}
                          <button
                            type="button"
                            onClick={handleSendKakao}
                            disabled={kakaoThrottle.isCooldown}
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              kakaoThrottle.isCooldown
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-400/60 dark:text-emerald-700 cursor-not-allowed'
                                : 'bg-[#ADEDD3] dark:bg-emerald-900 hover:bg-[#8ee0be] dark:hover:bg-emerald-800 text-[#005236] dark:text-emerald-100 active:scale-95 cursor-pointer'
                            }`}
                            title={kakaoThrottle.isCooldown ? `과도한 요청 방지: ${kakaoThrottle.cooldownLeft}초 후 다시 시도 가능` : '나에게 카카오톡 메시지로 발송'}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${kakaoThrottle.isCooldown ? 'animate-pulse text-amber-500' : ''}`}>
                              {kakaoThrottle.isCooldown ? 'hourglass_top' : 'send'}
                            </span>
                            <span>{kakaoThrottle.isCooldown ? `카카오톡 쿨다운 (${kakaoThrottle.cooldownLeft}s)` : '나에게 카카오톡 메시지 발송'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleToggleBookmark}
                            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                              isBookmarked
                                ? 'bg-[#006C49] dark:bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[16px] ${isBookmarked ? 'filled' : ''}`}>
                              {isBookmarked ? 'bookmark' : 'bookmark_add'}
                            </span>
                            <span>{isBookmarked ? '내 저장소 보관됨' : '이 토픽 내 저장소에 북마크'}</span>
                          </button>
                        </div>
                      </div>

                      {/* AI Pipeline Card */}
                      <div className="p-5 rounded-3xl bg-[#EFF4FF] dark:bg-slate-800/80 border border-[#E3E8F5] dark:border-slate-700 space-y-2.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#006C49] dark:text-emerald-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] filled">bolt</span>
                            <span>2-Stage AI 정제 파이프라인</span>
                          </span>
                          <span className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full text-[#005236] dark:text-emerald-300 font-bold">
                            98.1% 노이즈 차단
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          불필요한 스몰토크와 이모티콘 1,392개를 선제거하고 검증된 기술 토론 28건만 구조화했습니다.
                        </p>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6">
                {activeNav === 'home' ? (
                  <HomeDigestTab
                    onSelectRoom={handleSelectRoom}
                    onOpenKakaoModal={() => setIsKakaoModalOpen(true)}
                    onShowToast={showToast}
                    isDarkMode={isDarkMode}
                  />
                ) : activeNav === 'curation' ? (
                  <TopicCurationTab
                    onSelectTopic={() => handleSelectRoom()}
                    onShowToast={showToast}
                  />
                ) : activeNav === 'saved' ? (
                  <SavedInsightsTab
                    onShowToast={showToast}
                    onSelectSavedItem={() => handleSelectRoom()}
                  />
                ) : (
                  <MyPageTab
                    onOpenKakaoModal={() => setIsKakaoModalOpen(true)}
                    onShowToast={showToast}
                    isDemoMode={isDemoMode}
                    onToggleDemoMode={(val) => setIsDemoMode(val)}
                    onNavigateToRooms={() => {
                      setActiveNav('rooms');
                      setRoomSubTab('summary');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isDarkMode={isDarkMode}
                    themeMode={themeMode}
                    onSetThemeMode={handleSetThemeMode}
                    onToggleTheme={() => handleSetThemeMode(isDarkMode ? 'light' : 'dark')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation: Strictly for Mobile screens (< md) when not in simulator */}
      {!isMobileShellMode && (
        <BottomNav
          activeTab={activeNav}
          onSelectTab={(tab) => {
            setActiveNav(tab);
            setHighlightedBubbleId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="md:hidden"
        />
      )}

      {/* Desktop Footer (shown when not in restricted mobile container) */}
      {!isMobileShellMode && <DesktopFooter onShowToast={showToast} />}

      {/* Kakao 1-Click Sync Modal (Bottom Sheet with Notification Listener vs Text Export) */}
      <KakaoSyncModal
        isOpen={isKakaoModalOpen}
        onClose={() => setIsKakaoModalOpen(false)}
        onSuccess={(count, method) => {
          showToast(`카카오톡 [${method}] 기반 ${count}개 오픈채팅방 연동이 완료되었습니다! 2-Stage AI 정제가 시작됩니다.`, 'task_alt');
        }}
      />

      {/* SNS Share Card Preview Modal */}
      <ShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        onShowToast={showToast}
      />

      {/* High-Resolution Diagram & Benchmark Viewer Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
        subtitle={imageModal.subtitle}
        onDownload={() => {
          showToast('이미지 파일 저장이 완료되었습니다.', 'download_done');
        }}
      />

      {/* Micro-interaction Feedback Toast */}
      <Toast
        message={toast.message}
        icon={toast.icon}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
