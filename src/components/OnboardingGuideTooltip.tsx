import React, { useState, useEffect } from 'react';

interface OnboardingGuideTooltipProps {
  onOpenKakaoModal: () => void;
  onNavigateToRooms: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  isDarkMode?: boolean;
}

const STORAGE_KEY = 'okabang_onboarding_dismissed_v1';

export const OnboardingGuideTooltip: React.FC<OnboardingGuideTooltipProps> = ({
  onOpenKakaoModal,
  onNavigateToRooms,
  onShowToast,
  isDarkMode = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isNeverShowAgain, setIsNeverShowAgain] = useState<boolean>(true);

  // Check if first visit or dismissed in localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (permanent: boolean) => {
    setIsVisible(false);
    if (permanent) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      onShowToast('온보딩 가이드가 닫혔습니다. (상단 메뉴에서 언제든 다시 볼 수 있습니다)', 'info');
    }
  };

  const steps = [
    {
      stepNumber: 1,
      badge: '카카오톡 연동 설정',
      icon: 'chat',
      title: '개인정보 걱정 없는 3가지 오픈카톡 연동',
      description:
        '카카오톡 로그인 정보나 계정 비밀번호 없이, [알림 수신 동기화], [대화 텍스트 내보내기], 또는 [오픈빌더 커스텀 API] 3가지 방식 중 원하는 방식으로 대화방을 안전하게 연동할 수 있습니다.',
      tips: [
        '알림 수신: 카톡 상단 알림 바를 백그라운드에서 실시간 분석',
        '텍스트 내보내기: 단톡방 [대화 내용 내보내기] .txt 파일 1초 드롭',
        '커스텀 API: 챗봇 웹훅 및 오픈빌더 키로 딜레이 0초 연동',
      ],
      actionLabel: '지금 카카오톡 연동하기',
      actionIcon: 'sync',
      actionHandler: () => {
        onOpenKakaoModal();
      },
    },
    {
      stepNumber: 2,
      badge: 'AI 필터링 최적 활용',
      icon: 'auto_awesome',
      title: '잡담 98%는 자동 차단하고 알짜 기술 토론만 압축',
      description:
        '수천 개의 점심 메뉴, 출퇴근 인사, 이모티콘 핑퐁을 2-Stage LLM이 실시간 분리합니다. 현업 개발자들의 아키텍처 토론, 버그 해결책, 공유된 공식 레퍼런스만 깔끔하게 추려집니다.',
      tips: [
        'AI 자동 라벨링: 토론 맥락을 분석해 기술/트러블슈팅/성능 태그 자동 부여',
        '원문 팩트체크: AI 요약 항목을 클릭하면 단톡방 원문 발언으로 1초 점프',
        '커스텀 태그: 내 프로젝트에 필요한 태그를 직접 추가하고 모아보기',
      ],
      actionLabel: '정제된 핵심 토론 보러가기',
      actionIcon: 'forum',
      actionHandler: () => {
        onNavigateToRooms();
      },
    },
    {
      stepNumber: 3,
      badge: '스마트 브리핑 & 보관',
      icon: 'directions_subway',
      title: '퇴근길 3분 음성 브리핑과 원클릭 노션 아카이빙',
      description:
        '매일 오후 6시 30분, 퇴근길 지하철에서 오늘 쏟아진 단톡방 알짜 정보를 3분 음성(TTS)으로 편하게 청취하세요. 보관하고 싶은 내용은 노션이나 카카오톡 나에게 보내기로 1클릭 저장됩니다.',
      tips: [
        '지하철 모드: Web Speech API 기반 자연스러운 한국어 음성 브리핑',
        '감정 분위기 시각화: Recharts로 톡방의 건설적 논쟁 추이를 한눈에 파악',
        '요약 카드 공유: 팀원들과 SNS나 사내 메신저로 1초 만에 인사이트 공유',
      ],
      actionLabel: '온보딩 완료하고 시작하기',
      actionIcon: 'rocket_launch',
      actionHandler: () => {
        handleDismiss(true);
        onShowToast('오픈카톡 알짜 요약 오카방에 오신 것을 환영합니다! 🎉', 'verified');
      },
    },
  ];

  if (!isVisible) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsVisible(true);
            setCurrentStep(0);
          }}
          className="text-[11px] text-[#006C49] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 py-0.5"
        >
          <span className="material-symbols-outlined text-[14px]">help_outline</span>
          <span>온보딩 가이드 다시 보기</span>
        </button>
      </div>
    );
  }

  const activeStepData = steps[currentStep];

  return (
    <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004D34] via-[#006C49] to-[#0A3D2A] text-white p-5 sm:p-6 shadow-lg shadow-emerald-950/20 border border-emerald-400/30 animate-[fadeIn_0.25s_ease-out]">
      {/* Decorative background glow elements */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#ADEDD3]/10 blur-xl pointer-events-none" />

      {/* Header bar: Badge, Step Counter & Close Button */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-xs">
            <span className="material-symbols-outlined text-[14px] text-[#ADEDD3] filled">
              {activeStepData.icon}
            </span>
            <span>첫 방문 온보딩 가이드 ({currentStep + 1}/{steps.length})</span>
          </span>
          <span className="text-[11px] font-bold text-[#ADEDD3] bg-black/25 px-2.5 py-0.5 rounded-full">
            {activeStepData.badge}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleDismiss(isNeverShowAgain)}
          className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          title="온보딩 가이드 닫기"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Step Content */}
      <div className="relative z-10 space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            {activeStepData.title}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            {activeStepData.description}
          </p>
        </div>

        {/* Bullet Tips */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/15 space-y-1.5">
          {activeStepData.tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-emerald-50">
              <span className="material-symbols-outlined text-[14px] text-[#ADEDD3] shrink-0 mt-0.5 filled">
                check_circle
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        {/* Step Navigation & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx
                    ? 'w-7 bg-[#ADEDD3]'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                title={`${idx + 1}단계로 이동`}
              />
            ))}
          </div>

          {/* Buttons: Prev, Next / Action */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors active:scale-95"
              >
                이전
              </button>
            )}

            <button
              type="button"
              onClick={activeStepData.actionHandler}
              className="px-4 py-2 rounded-xl bg-white text-[#005236] hover:bg-emerald-50 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px] filled">
                {activeStepData.actionIcon}
              </span>
              <span>{activeStepData.actionLabel}</span>
            </button>

            {currentStep < steps.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3.5 py-2 rounded-xl bg-[#ADEDD3] text-[#005236] hover:bg-emerald-200 text-xs font-extrabold flex items-center gap-1 transition-colors active:scale-95"
              >
                <span>다음</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Checkbox: Never Show Again */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-emerald-200/80">
          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={isNeverShowAgain}
              onChange={(e) => setIsNeverShowAgain(e.target.checked)}
              className="rounded accent-[#10B981] w-3.5 h-3.5"
            />
            <span>다음 방문 시 이 가이드 다시 보지 않기</span>
          </label>

          <button
            type="button"
            onClick={() => handleDismiss(isNeverShowAgain)}
            className="hover:text-white underline"
          >
            가이드 건너뛰기
          </button>
        </div>
      </div>
    </aside>
  );
};
