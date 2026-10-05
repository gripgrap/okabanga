import React, { useState, useEffect } from 'react';
import { CategoryNotificationConfig, ThemeMode } from '../types';
import { SystemHealthWidget } from './SystemHealthWidget';

interface MyPageTabProps {
  onOpenKakaoModal: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: (enabled: boolean) => void;
  onNavigateToRooms?: () => void;
  isDarkMode?: boolean;
  themeMode?: ThemeMode;
  onSetThemeMode?: (mode: ThemeMode) => void;
  onToggleTheme?: (dark: boolean) => void;
}

const NOTIF_CONFIG_STORAGE_KEY = 'okabang_summary_notification_config_v1';
const LEGACY_NOTIF_KEY = 'okabang_notification_categories_v1';

// Unified, accessible, smooth-sliding toggle switch component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  ariaLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  activeColor = 'bg-[#006C49]',
  ariaLabel = '토글 스위치',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006C49]/40 ${
        checked ? activeColor : 'bg-slate-300 dark:bg-slate-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export const MyPageTab: React.FC<MyPageTabProps> = ({
  onOpenKakaoModal,
  onShowToast,
  isDemoMode = true,
  onToggleDemoMode,
  onNavigateToRooms,
  isDarkMode = false,
  themeMode = 'system',
  onSetThemeMode,
  onToggleTheme,
}) => {
  const [commuteTime, setCommuteTime] = useState<string>(() => {
    try {
      return localStorage.getItem('okabang_commute_time') || '18:30';
    } catch {
      return '18:30';
    }
  });
  const [audioSpeed, setAudioSpeed] = useState<string>(() => {
    try {
      return localStorage.getItem('okabang_audio_speed') || '1.2x';
    } catch {
      return '1.2x';
    }
  });
  const [masterPushEnabled, setMasterPushEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('okabang_master_push_enabled');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('okabang_commute_time', commuteTime);
      localStorage.setItem('okabang_audio_speed', audioSpeed);
      localStorage.setItem('okabang_master_push_enabled', String(masterPushEnabled));
    } catch {
      // ignore
    }
  }, [commuteTime, audioSpeed, masterPushEnabled]);

  // Live system OS preference detection
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Category-specific Summary Notification Configuration State (persisted to localStorage)
  const [notifConfig, setNotifConfig] = useState<CategoryNotificationConfig>(() => {
    try {
      const saved = localStorage.getItem(NOTIF_CONFIG_STORAGE_KEY) || localStorage.getItem(LEGACY_NOTIF_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      tech: true,
      trouble: true,
      issue: false,
      suppressNoise: true,
      customTagsOnly: true,
      highConfidenceOnly: true,
      deliveryMode: 'instant',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_CONFIG_STORAGE_KEY, JSON.stringify(notifConfig));
    } catch {
      // ignore
    }
  }, [notifConfig]);

  const toggleCategoryNotif = (key: keyof CategoryNotificationConfig, label: string) => {
    setNotifConfig((prev) => {
      const nextVal = !prev[key];
      const nextConfig = { ...prev, [key]: nextVal };
      onShowToast(
        nextVal ? `'${label}' 알림이 활성화되었습니다.` : `'${label}' 알림이 꺼졌습니다.`,
        nextVal ? 'notifications_active' : 'notifications_off'
      );
      return nextConfig;
    });
  };

  const handleSetDeliveryMode = (mode: 'instant' | 'digest') => {
    setNotifConfig((prev) => ({ ...prev, deliveryMode: mode }));
    onShowToast(
      mode === 'instant'
        ? '⚡ 실시간 즉시 푸시 모드가 설정되었습니다. 요약 생성 즉시 알림이 발송됩니다.'
        : `📦 퇴근길 다이제스트 모드가 설정되었습니다. 매일 ${commuteTime}에 묶음 발송됩니다.`,
      mode === 'instant' ? 'bolt' : 'schedule_send'
    );
  };

  // Test Notification Simulation based on current category settings
  const handleTestCategoryNotification = (category: 'tech' | 'trouble' | 'issue' | 'noise' | 'custom') => {
    if (!masterPushEnabled) {
      onShowToast('⚠️ 마스터 푸시 알림이 꺼져 있어 알림을 수신할 수 없습니다. 상단 스위치를 켜주세요.', 'notifications_off');
      return;
    }

    if (category === 'tech') {
      if (notifConfig.tech) {
        onShowToast(
          '🔔 [기술 요약 푸시 수신] Next 15 Server Action 동시성 이슈 및 분산 락 요약 완료! (신뢰도 98%)',
          'code'
        );
      } else {
        onShowToast(
          '🛡️ [기술 요약 차단] 사용자 설정에 의해 기술/개발 요약 푸시가 차단되었습니다.',
          'notifications_off'
        );
      }
    } else if (category === 'trouble') {
      if (notifConfig.trouble) {
        onShowToast(
          '🚨 [실무 긴급 푸시 수신] Redis 분산 락 스탬피드 장애 원인 및 3단계 대응법 도출!',
          'build'
        );
      } else {
        onShowToast(
          '🛡️ [실무 요약 차단] 사용자 설정에 의해 실무/트러블슈팅 푸시가 차단되었습니다.',
          'notifications_off'
        );
      }
    } else if (category === 'issue') {
      if (notifConfig.issue) {
        onShowToast(
          '📰 [시사동향 푸시 수신] 2025 상반기 주요 IT 기업 테크 채용 및 연봉 테이블 분석 완료!',
          'trending_up'
        );
      } else {
        onShowToast(
          '🛡️ [시사동향 차단] 설정 필터(시사/동향 OFF)에 따라 푸시 알림이 조용히 차단되었습니다.',
          'filter_alt_off'
        );
      }
    } else if (category === 'custom') {
      if (notifConfig.customTagsOnly) {
        onShowToast(
          '🏷️ [커스텀 태그 푸시 수신] 등록하신 커스텀 태그 (#필독아티클) 가 포함된 토론 요약이 감지되었습니다!',
          'sell'
        );
      } else {
        onShowToast(
          'ℹ️ 내 등록 커스텀 태그 우선 알림이 꺼져 있습니다.',
          'info'
        );
      }
    } else if (category === 'noise') {
      if (notifConfig.suppressNoise) {
        onShowToast(
          '🛡️ [노이즈 100% 무음 차단 성공] 점심 메뉴 추천 및 스티커 인사 47건이 무음 처리되었습니다.',
          'verified_user'
        );
      } else {
        onShowToast('⚠️ 잡담 알림 차단이 해제되어 있습니다.', 'warning');
      }
    }
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    if (onSetThemeMode) {
      onSetThemeMode(mode);
    } else if (onToggleTheme) {
      onToggleTheme(mode === 'dark');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. User Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#006C49] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            개발
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-[#161C25] dark:text-slate-100">카카오 프론트엔더</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[10px] font-bold">
                PRO 요약 플랜
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">kakao_user_84920 · 3개 오픈채팅 연동 중</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenKakaoModal}
          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="계정 및 오픈채팅 연동 설정"
        >
          <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
        </button>
      </div>

      {/* 2. Display Theme Settings (Light / Dark / System Auto Mode) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3.5 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] filled">
              palette
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">화면 테마 설정 (시스템 자동 모드 지원)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                기기 OS 설정에 맞춰 낮/밤 자동으로 전환되거나, 원하는 테마를 고정할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-bold text-[#006C49] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>OS 감지: {systemPrefersDark ? '다크 모드' : '라이트 모드'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {themeMode === 'system'
                ? `🖥️ 자동(${isDarkMode ? '다크' : '라이트'})`
                : isDarkMode
                ? '🌙 다크 모드'
                : '☀️ 라이트 모드'}
            </span>
          </div>
        </div>

        {/* 3 Theme Mode Radio Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between gap-2 ${
              themeMode === 'light'
                ? 'bg-emerald-50/80 border-[#006C49] ring-2 ring-[#006C49]/20 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
              </div>
              {themeMode === 'light' && (
                <span className="material-symbols-outlined text-[#006C49] text-[18px] filled">check_circle</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#161C25] dark:text-slate-200">라이트 모드</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">화사하고 선명한 기본 테마</p>
            </div>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between gap-2 ${
              themeMode === 'dark'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
              </div>
              {themeMode === 'dark' && (
                <span className="material-symbols-outlined text-emerald-400 text-[18px] filled">check_circle</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#161C25] dark:text-slate-200">다크 모드</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">눈의 피로를 덜어주는 어두운 테마</p>
            </div>
          </button>

          {/* System Auto Mode */}
          <button
            type="button"
            onClick={() => handleSelectTheme('system')}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between gap-2 ${
              themeMode === 'system'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-[#006C49] dark:border-emerald-500 ring-2 ring-[#006C49]/20 dark:ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#006C49] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">settings_brightness</span>
              </div>
              {themeMode === 'system' && (
                <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[18px] filled">
                  check_circle
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#161C25] dark:text-slate-200">시스템 동기화 (자동)</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">기기 OS 설정에 맞춰 자동 전환</p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. 요약 알림 설정 (Category-Specific Summary Push Notification Filters) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] filled">
              notifications_active
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">
                요약 알림 설정
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                원하는 특정 카테고리(기술, 트러블슈팅, 시사 등)의 요약이 완료되었을 때만 선별하여 푸시 알림을 발송합니다.
              </p>
            </div>
          </div>

          <ToggleSwitch
            checked={masterPushEnabled}
            onChange={(val) => {
              setMasterPushEnabled(val);
              onShowToast(
                val ? '전체 요약 푸시 알림이 켜졌습니다.' : '전체 요약 푸시 알림이 일시 중단되었습니다.',
                val ? 'notifications' : 'notifications_off'
              );
            }}
            ariaLabel="전체 요약 푸시 알림 마스터 스위치"
          />
        </div>

        {/* Category Notification Switches */}
        <div className={`space-y-2.5 transition-opacity ${masterPushEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {/* Tech/Dev Category */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#006C49] dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">code</span>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  ⚡ 기술/개발 카테고리 요약 알림
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Next 15, 아키텍처 토론, 성능 벤치마크, 상태관리 분석 완료 시
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifConfig.tech}
              onChange={() => toggleCategoryNotif('tech', '기술/개발')}
              ariaLabel="기술/개발 카테고리 요약 알림"
            />
          </div>

          {/* Trouble Category */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">build</span>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  🛠 실무/트러블슈팅 긴급 이슈 알림
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  동시성 락 스탬피드, 결제 오류, DB 커넥션 풀 고갈 해결책 도출 시
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifConfig.trouble}
              onChange={() => toggleCategoryNotif('trouble', '실무/트러블슈팅')}
              ariaLabel="실무/트러블슈팅 긴급 이슈 알림"
            />
          </div>

          {/* Issue/Trend Category */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  📰 시사/업계동향 리포트 알림
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  2025 상반기 테크 채용·연봉 테이블, 오픈소스 AI 라이선스 정책 동향
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifConfig.issue}
              onChange={() => toggleCategoryNotif('issue', '시사/업계동향')}
              ariaLabel="시사/업계동향 리포트 알림"
            />
          </div>

          {/* Suppress Noise Protected Switch */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    🛡️ 잡담/노이즈 알림 100% 무음 차단
                  </p>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[9px] font-black">
                    필수 보호
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  점심 메뉴, 인사, 이모티콘 등 1,392개 잡담 알림 원천 차단
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifConfig.suppressNoise}
              onChange={() => toggleCategoryNotif('suppressNoise', '잡담 알림 무음 차단')}
              activeColor="bg-amber-600"
              ariaLabel="잡담/노이즈 알림 무음 차단"
            />
          </div>

          {/* Quality Threshold Filter */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                🎯 AI 신뢰도 90% 이상 핵심 요약만 알림
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                참여자 공감도가 높고 팩트체크가 완료된 최고 품질 요약만 선별 수신
              </p>
            </div>
            <ToggleSwitch
              checked={notifConfig.highConfidenceOnly}
              onChange={() => toggleCategoryNotif('highConfidenceOnly', '신뢰도 90% 이상 핵심 요약')}
              ariaLabel="신뢰도 90% 이상 핵심 요약만 알림"
            />
          </div>

          {/* User Custom Tags Notification Filter */}
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">sell</span>
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-purple-950 dark:text-purple-200">
                    🏷️ 내 등록 커스텀 태그(#필독아티클 등) 우선 알림
                  </p>
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 text-[9px] font-black">
                    개인화
                  </span>
                </div>
                <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80">
                  직접 지정한 태그가 달린 토론은 카테고리 필터와 무관하게 최우선 푸시 수신
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifConfig.customTagsOnly}
              onChange={() => toggleCategoryNotif('customTagsOnly', '내 커스텀 태그 우선 알림')}
              activeColor="bg-purple-600"
              ariaLabel="내 등록 커스텀 태그 우선 알림"
            />
          </div>

          {/* Push Delivery Timing Mode */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#006C49] dark:text-emerald-400">
                  schedule_send
                </span>
                <span>알림 발송 시점 모드</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                핵심 토론 도출 즉시 실시간 수신할지, 퇴근길 지정 시간에 묶어 수신할지 선택합니다.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSetDeliveryMode('instant')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  notifConfig.deliveryMode === 'instant'
                    ? 'bg-[#006C49] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                ⚡ 실시간 즉시
              </button>
              <button
                type="button"
                onClick={() => handleSetDeliveryMode('digest')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  notifConfig.deliveryMode === 'digest'
                    ? 'bg-[#006C49] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                📦 퇴근길 다이제스트 ({commuteTime})
              </button>
            </div>
          </div>

          {/* Interactive Notification Simulation Tester */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500">science</span>
                <span>현재 필터 조건 기준 알림 수신 시뮬레이션 테스트</span>
              </span>
              <span className="text-[10px] text-slate-400">클릭하여 필터 동작 검증</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => handleTestCategoryNotification('tech')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-[11px] group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">⚡ 기술 요약</span>
                  <span className={`w-2 h-2 rounded-full ${notifConfig.tech ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{notifConfig.tech ? '수신 허용됨' : '차단됨'}</p>
              </button>

              <button
                type="button"
                onClick={() => handleTestCategoryNotification('trouble')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-red-400 dark:hover:border-red-600 transition-all text-[11px] group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">🛠 실무 이슈</span>
                  <span className={`w-2 h-2 rounded-full ${notifConfig.trouble ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{notifConfig.trouble ? '수신 허용됨' : '차단됨'}</p>
              </button>

              <button
                type="button"
                onClick={() => handleTestCategoryNotification('issue')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-blue-400 dark:hover:border-blue-600 transition-all text-[11px] group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">📰 시사 동향</span>
                  <span className={`w-2 h-2 rounded-full ${notifConfig.issue ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{notifConfig.issue ? '수신 허용됨' : '차단됨'}</p>
              </button>

              <button
                type="button"
                onClick={() => handleTestCategoryNotification('custom')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-purple-400 dark:hover:border-purple-600 transition-all text-[11px] group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">🏷️ 커스텀 태그</span>
                  <span className={`w-2 h-2 rounded-full ${notifConfig.customTagsOnly ? 'bg-purple-500' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{notifConfig.customTagsOnly ? '우선 수신' : '일반'}</p>
              </button>

              <button
                type="button"
                onClick={() => handleTestCategoryNotification('noise')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left hover:border-amber-400 dark:hover:border-amber-600 transition-all text-[11px] group cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">🛡️ 잡담 차단</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">100% 무음 필터</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core System API Health & Latency Monitor Widget */}
      <SystemHealthWidget onShowToast={onShowToast} />

      {/* 5. Demo Data Sandbox Mode Switch */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006C49] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px] filled">science</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">데모 데이터 모드 (Demo Sandbox)</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isDemoMode
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-[#005236] dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isDemoMode ? '체험 모드 ON' : '실제 연동 모드'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                실제 API 호출 없이 사전에 엄선된 네카라쿠배 샘플 토론 데이터셋으로 전체 서비스 흐름을 체험합니다.
              </p>
            </div>
          </div>

          <div className="shrink-0 ml-3">
            <ToggleSwitch
              checked={isDemoMode}
              onChange={(nextVal) => {
                onToggleDemoMode?.(nextVal);
                onShowToast(
                  nextVal
                    ? '🧪 데모 데이터 모드가 활성화되었습니다. 샘플 데이터로 테스트할 수 있습니다.'
                    : '실제 연동 모드로 전환되었습니다. 오픈채팅 연동을 진행해 주세요.',
                  nextVal ? 'science' : 'sync'
                );
              }}
              ariaLabel="데모 데이터 모드 전환 스위치"
            />
          </div>
        </div>

        {/* Demo Mode Details Card */}
        {isDemoMode ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#005236] dark:text-emerald-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>사전 정의된 고품질 샘플 토론 데이터 로드됨</span>
              </span>
              {onNavigateToRooms && (
                <button
                  type="button"
                  onClick={onNavigateToRooms}
                  className="px-2.5 py-1 rounded-xl bg-[#006C49] dark:bg-emerald-600 text-white text-[11px] font-bold hover:bg-[#005236] active:scale-95 transition-all duration-150 flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>샘플 토론 보러가기</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-1.5">
                <span className="text-[#006C49] dark:text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Next 15 Server Action 동시성 이슈 &amp; Redis 분산 락 아키텍처 다이어그램</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#006C49] dark:text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Turbopack vs Webpack 빌드 속도 1.2s 단축 벤치마크 실측표</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#006C49] dark:text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Recharts 기반 토론 분위기 &amp; 감정 변화 시간대별 시각화</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#006C49] dark:text-emerald-400 font-bold mt-0.5">✓</span>
                <span>노션(Notion) 원클릭 아카이빙 및 나에게 카톡 전송 시뮬레이션 지원</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>실제 오픈채팅방 연동이나 텍스트(.txt) 파일 업로드가 필요한 상태입니다.</span>
            <button
              type="button"
              onClick={onOpenKakaoModal}
              className="text-[#006C49] dark:text-emerald-400 font-bold hover:underline shrink-0 ml-2 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              지금 연동하기 →
            </button>
          </div>
        )}
      </section>

      {/* 5. Delivery Time & Audio Speed Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] filled">
            schedule_send
          </span>
          <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">퇴근길 브리핑 배달 스케줄</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200">퇴근길 다이제스트 발송 시간</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">설정한 시간에 3줄 요약 푸시 알림 도착</p>
            </div>
            <select
              value={commuteTime}
              onChange={(e) => {
                setCommuteTime(e.target.value);
                onShowToast(`브리핑 알림 시간이 ${e.target.value}로 변경되었습니다.`, 'schedule');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#006C49] cursor-pointer"
            >
              <option value="18:00">오후 6:00</option>
              <option value="18:30">오후 6:30 (권장)</option>
              <option value="19:00">오후 7:00</option>
              <option value="19:30">오후 7:30</option>
              <option value="20:00">오후 8:00</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200">오디오 브리핑 기본 재생 배속</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">3분 오디오 듣기 기본 템포</p>
            </div>
            <select
              value={audioSpeed}
              onChange={(e) => {
                setAudioSpeed(e.target.value);
                onShowToast(`재생 배속이 ${e.target.value}로 변경되었습니다.`, 'speed');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#006C49] cursor-pointer"
            >
              <option value="1.0x">1.0x (일반)</option>
              <option value="1.2x">1.2x (권장)</option>
              <option value="1.5x">1.5x (빠르게)</option>
              <option value="2.0x">2.0x (고속)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. External Knowledge Base Integrations */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px]">hub</span>
          외부 지식 베이스 연동
        </h3>

        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">노션(Notion) 워크스페이스</p>
                <p className="text-[10px] text-[#006C49] dark:text-emerald-400 font-semibold">연결됨 (오카방 인사이트 DB)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowToast('노션 연결 상태가 정상입니다.', 'check_circle')}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              연결 관리
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FEE500] text-[#191919] flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">카카오톡 나에게 보내기</p>
                <p className="text-[10px] text-[#006C49] dark:text-emerald-400 font-semibold">연결됨 (메시지 봇 승인 완료)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onShowToast('테스트 메시지가 나에게 카톡으로 전송되었습니다.', 'mark_chat_read')}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              테스트 발송
            </button>
          </div>
        </div>
      </div>

      {/* 7. Privacy & Security Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2.5 transition-colors">
        <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">개인정보 &amp; 보안 정책</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          오카방가방가는 개인 식별 가능한 메시지, 전화번호, 실명을 일절 저장하지 않으며 요약 생성 즉시 원본 대화는 메모리에서 완전 파기됩니다.
        </p>
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <span>버전 2.4.0 (최신 빌드)</span>
          <button
            type="button"
            onClick={() => onShowToast('오픈소스 라이선스 및 이용약관 문서입니다.', 'info')}
            className="hover:text-slate-700 dark:hover:text-slate-300 underline active:scale-95 transition-all duration-150 cursor-pointer"
          >
            약관 보기
          </button>
        </div>
      </div>
    </div>
  );
};
