import React, { useState, useEffect } from 'react';
import { CURATED_TOPICS, INITIAL_ROOMS } from '../data/mockData';
import { ChatRoom } from '../types';
import { OnboardingGuideTooltip } from './OnboardingGuideTooltip';

interface HomeDigestTabProps {
  onSelectRoom: (roomId: string) => void;
  onOpenKakaoModal: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  isDarkMode?: boolean;
}

export const HomeDigestTab: React.FC<HomeDigestTabProps> = ({
  onSelectRoom,
  onOpenKakaoModal,
  onShowToast,
  isDarkMode = false,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioSeconds, setAudioSeconds] = useState<number>(0);
  const [isLearned, setIsLearned] = useState<boolean>(false);
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);

  // Audio timer simulation & Web Speech API integration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAudioPlaying) {
      timer = setInterval(() => {
        setAudioSeconds((sec) => (sec >= 192 ? 0 : sec + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAudioPlaying]);

  const toggleAudio = () => {
    if (!isAudioPlaying) {
      setIsAudioPlaying(true);
      onShowToast('3분 퇴근길 핵심 다이제스트 음성 브리핑 재생 시작', 'play_circle');

      // Real Web Speech API TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = '퇴근길 3분 다이제스트입니다. 오늘 프론트엔드 단톡방의 핵심 이슈는 넥스트 제이에스 15 서버 액션 캐시 무효화 전략과 서버 부하 논쟁입니다. 첫째, 대규모 트래픽 발생 시 리밸리데이트 태그의 동시 호출로 백엔드 디비 커넥션 풀 고갈 위험이 있습니다. 둘째, 클라이언트 측 옵티미스틱 유아이와 결합하되 분산 레디스 락 계층을 두는 실무 솔루션을 제시했습니다. 셋째, 실무진 89%는 탄스택 쿼리와 웹훅 하이브리드 조합을 권장했습니다.';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.1;
        utterance.onend = () => {
          setIsAudioPlaying(false);
          setAudioSeconds(0);
        };
        utterance.onerror = () => {
          // fallback to timer simulation
        };
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setIsAudioPlaying(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      onShowToast('음성 브리핑 일시 정지', 'pause_circle');
    }
  };

  const formatAudioTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleRoomNotif = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, notificationEnabled: !r.notificationEnabled } : r
      )
    );
    const target = rooms.find((r) => r.id === roomId);
    onShowToast(
      target?.notificationEnabled
        ? `${target.name} 알림이 해제되었습니다.`
        : `${target?.name} 핫토픽 알림이 설정되었습니다.`,
      'notifications'
    );
  };

  const filteredTopics =
    selectedTag === 'all'
      ? CURATED_TOPICS
      : selectedTag === 'fe'
      ? CURATED_TOPICS.filter((t) => t.roomCategory.includes('개발'))
      : selectedTag === 'pm'
      ? CURATED_TOPICS.filter((t) => t.roomCategory.includes('디자인') || t.roomCategory.includes('PO'))
      : CURATED_TOPICS.filter((t) => t.roomCategory.includes('마케팅'));

  return (
    <div className="space-y-5">
      {/* 0. First-Visit Onboarding Guide Tooltip (카카오톡 연동 & AI 필터링 최적 활용 가이드) */}
      <OnboardingGuideTooltip
        onOpenKakaoModal={onOpenKakaoModal}
        onNavigateToRooms={() => onSelectRoom('room-fe')}
        onShowToast={onShowToast}
        isDarkMode={isDarkMode}
      />

      {/* 1. Realtime Status & Filter Metrics Bar */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 shrink-0">
            <span className="material-symbols-outlined text-[22px]">sync</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100 truncate">
                오픈카톡 3개 연동 중
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                알림 감지 중
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-[#006C49] dark:text-emerald-400">
                notifications_active
              </span>
              퇴근길 브리핑 18:30 예약됨
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 pl-2">
          <span className="text-[11px] text-[#006C49] dark:text-emerald-400 font-bold">잡담·스팸 차단</span>
          <span className="text-xl sm:text-2xl font-black text-[#161C25] dark:text-slate-100 tracking-tight">94.8%</span>
        </div>
      </section>

      {/* 2. Quick Action Banner Card with Audio TTS player */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#006C49] via-[#10B981] to-[#2B6954] rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-900/10">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
                <span className="material-symbols-outlined text-[14px]">directions_subway</span>
                퇴근길 3분 다이제스트
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 text-white text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[12px]">notifications_active</span>
                푸시 ON (매일 18:30)
              </span>
            </div>
            <span className="text-xs text-emerald-100 font-medium">오후 6:40 업데이트</span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
              카톡 잡담 2,740개 속<br />
              오늘의 핵심만 압축했어요
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              주요 방에서 언급된 아키텍처 토론과 실무 팁 3줄 요약
            </p>
          </div>

          {/* Interactive Audio Player Bar with Real Voice TTS Feedback */}
          {isAudioPlaying && (
            <div className="p-3 rounded-2xl bg-black/25 backdrop-blur-md flex items-center justify-between gap-3 border border-white/20 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-end gap-1 h-5 shrink-0">
                  <span className="w-1 bg-[#4EDEA3] rounded-full animate-[pulse_0.4s_infinite] h-4" />
                  <span className="w-1 bg-[#4EDEA3] rounded-full animate-[pulse_0.7s_infinite] h-2" />
                  <span className="w-1 bg-[#4EDEA3] rounded-full animate-[pulse_0.5s_infinite] h-5" />
                  <span className="w-1 bg-[#4EDEA3] rounded-full animate-[pulse_0.6s_infinite] h-3" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    AI 음성 브리핑 재생 중 (지하철 모드)
                  </span>
                  <span className="text-[10px] text-emerald-200">
                    {formatAudioTime(audioSeconds)} / 3:12
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAudio}
                className="w-8 h-8 rounded-full bg-white text-[#006C49] flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform shrink-0"
                title="일시 정지"
              >
                <span className="material-symbols-outlined text-[18px]">pause</span>
              </button>
            </div>
          )}

          {/* Banner Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={toggleAudio}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl bg-white text-[#006C49] font-bold text-xs sm:text-sm active:scale-[0.98] transition-all duration-150 shadow-md group"
            >
              <span className="material-symbols-outlined text-[20px] filled transition-transform duration-200 group-hover:scale-110">
                {isAudioPlaying ? 'pause_circle' : 'play_circle'}
              </span>
              <span>{isAudioPlaying ? '브리핑 일시 정지' : '지금 3분 오디오 듣기'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRoom('room-fe')}
              className="h-12 px-4 sm:px-5 flex items-center justify-center gap-1.5 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm active:scale-[0.98] transition-all hover:bg-white/30 group"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110">description</span>
              <span>텍스트 읽기</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Curated Topics & Horizontal Feed */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] filled">
              local_fire_department
            </span>
            <h3 className="text-base font-bold text-[#161C25] dark:text-slate-100">실시간 큐레이션 토픽</h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">오후 6:30 기준</span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              selectedTag === 'all'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setSelectedTag('fe')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              selectedTag === 'fe'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            개발/FE
          </button>
          <button
            type="button"
            onClick={() => setSelectedTag('pm')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              selectedTag === 'pm'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            프로덕트/기획
          </button>
          <button
            type="button"
            onClick={() => setSelectedTag('growth')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              selectedTag === 'growth'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            마케팅/성장
          </button>
        </div>

        {/* Topic Cards Carousel */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {filteredTopics.map((topic) => (
            <article
              key={topic.id}
              onClick={() => onSelectRoom('room-fe')}
              className="snap-start shrink-0 w-[290px] sm:w-[320px] bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[13px] filled">bolt</span>
                    핵심도 {topic.confidenceScore}%
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[120px]">
                    {topic.roomName}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#161C25] dark:text-slate-100 line-clamp-2 group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors">
                  {topic.title}
                </h4>

                <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-[#006C49] dark:text-emerald-400 font-semibold">
                  <span className="material-symbols-outlined text-[15px]">link</span>
                  <span>핵심 레퍼런스 {topic.referenceCount}개 정리</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full py-2.5 rounded-xl bg-[#EFF4FF] dark:bg-slate-800 group-hover:bg-[#ADEDD3] dark:group-hover:bg-emerald-900/60 text-[#161C25] dark:text-slate-200 group-hover:text-[#005236] dark:group-hover:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <span>다이제스트 읽기</span>
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">chevron_right</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* 4 & 5. Responsive Grid for Desktop: Connected Rooms & Today's Key Insight Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10 lg:gap-10 items-start pt-1">
        {/* Left Column on Desktop (7 cols): Today's Key Insight 3-Line Digest Card */}
        <section className="md:col-span-7 lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-100 dark:border-slate-800 flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ADEDD3] text-[#005236] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px] filled">auto_awesome</span>
                AI 집중 요약
              </span>
              <span className="text-xs text-slate-500">프론트엔드 실무방</span>
            </div>
            <span className="text-xs font-bold text-[#006C49]">신뢰도 98%</span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#161C25] leading-snug">
              Next.js 15 App Router 실무 마이그레이션 이슈와 해결책
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              오후 2시~5시 사이 48명의 개발자가 나눈 실무 논의를 3줄로 추렸습니다.
            </p>
          </div>

          {/* 3-Line Bullet Digest */}
          <div className="flex flex-col gap-2.5 bg-[#EFF4FF] rounded-2xl p-4 border border-[#E3E8F5]">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#006C49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <p className="text-xs sm:text-sm text-[#161C25] leading-relaxed">
                <span className="font-bold text-[#006C49]">캐싱 정책 기본값 비활성화:</span> fetch 요청이 더 이상 기본 캐시되지 않으므로, 정적 페이지는 명시적 <code className="bg-white px-1 py-0.5 rounded text-[11px] font-mono text-[#006C49] border border-slate-200">cache: 'force-cache'</code> 추가가 필수적입니다.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#006C49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="text-xs sm:text-sm text-[#161C25] leading-relaxed">
                <span className="font-bold text-[#006C49]">비동기 Request API 전환:</span> <code className="bg-white px-1 py-0.5 rounded text-[11px] font-mono text-[#006C49] border border-slate-200">cookies()</code> 및 <code className="bg-white px-1 py-0.5 rounded text-[11px] font-mono text-[#006C49] border border-slate-200">headers()</code>가 비동기로 바뀌어 점진적 코드 패치(Codemod 활용)가 가장 안전합니다.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#006C49] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="text-xs sm:text-sm text-[#161C25] leading-relaxed">
                <span className="font-bold text-[#006C49]">참여 개발자 85% 권장안:</span> 대규모 서비스는 즉시 마이그레이션 대신 서브 도메인 단위 Canary 테스트 후 v15.1 안정화 시점에 전면 도입을 제안합니다.
              </p>
            </div>
          </div>

          {/* Embedded Reference Card */}
          <div
            onClick={() => onSelectRoom('room-fe')}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2TVyN2lrNLFhyNJEBV2L2oSVInS11ShwLk8_OZ7cKCNWeHtOlKTnFierM0LP2B9a8mwKFqJUgVWvjDOsdtCh2UrhL2v93saUQcKXnHpPG-nUXUA6CxK-gHSswCG-ALAAyn-kXD1LfRMvxvZg-MwP-KrndkIHEc8cxFUxdmdUGt5bRgz5CtZHVwkEDy5RTK9oLKtf27OI4rAI0w85IVVdLhnpMoQE7ZR70c3RFwnwNwyqmmTF8Wqj_9A"
                alt="Next.js Upgrade Guide"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] text-[#006C49] font-bold">
                <span className="material-symbols-outlined text-[13px]">bookmark</span>
                <span>공식 레퍼런스 가이드</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#161C25] truncate">
                Next.js 15 Upgrade Guide &amp; Codemod
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                방 참여자들이 가장 많이 스크랩한 링크
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
              open_in_new
            </span>
          </div>

          {/* Bottom Interactive Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsLearned(!isLearned);
                onShowToast(
                  isLearned
                    ? '학습 상태가 초기화되었습니다.'
                    : '퇴근길 학습 완료! 내 저장소에 완료 체크되었습니다.',
                  'check_circle'
                );
              }}
              className={`flex-1 h-12 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                isLearned
                  ? 'bg-[#2B6954] text-white shadow-sm'
                  : 'bg-[#10B981] text-white shadow-md hover:bg-[#006C49]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLearned ? 'done_all' : 'check_circle'}
              </span>
              <span>{isLearned ? '학습 완료됨! 👏' : '퇴근길 학습 완료'}</span>
            </button>

            <button
              type="button"
              onClick={() => onShowToast('노션(Notion) 스크랩 워크스페이스로 3줄 요약이 내보내졌습니다!', 'task_alt')}
              className="w-12 h-12 rounded-2xl bg-[#ADEDD3] text-[#005236] flex items-center justify-center shrink-0 hover:bg-[#8ee0be] transition-colors"
              title="노션으로 내보내기"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </section>

        {/* Right Column on Desktop (5 cols): Connected OpenChat Rooms List */}
        <section className="md:col-span-5 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006C49] text-[20px]">
                chat_bubble_outline
              </span>
              <h3 className="text-base font-bold text-[#161C25]">연동된 오픈채팅방</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenKakaoModal}
                className="text-[#006C49] font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">notifications</span>
                알림 설정
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onOpenKakaoModal}
                className="text-slate-500 font-semibold hover:text-slate-800"
              >
                관리
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {rooms.slice(0, 3).map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-[#006C49]">
                    <span className="material-symbols-outlined text-[22px]">{room.icon}</span>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#161C25] truncate group-hover:text-[#006C49] transition-colors">
                      {room.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                      <span className="text-[#006C49] font-bold">
                        미확인 토론 {room.unreadCount}건
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 truncate">
                        잡담 {room.filteredNoiseCount.toLocaleString()}개 필터링
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleRoomNotif(room.id, e)}
                    className="p-1 rounded-full text-slate-400 hover:text-[#006C49] transition-colors"
                    title="알림 토글"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${room.notificationEnabled ? 'text-[#006C49] filled' : ''}`}>
                      {room.notificationEnabled ? 'notifications_active' : 'notifications_off'}
                    </span>
                  </button>
                  <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onOpenKakaoModal}
              className="w-full py-3 px-3 rounded-2xl border border-dashed border-[#10B981] bg-[#EFF4FF] flex items-center justify-center gap-2 text-xs font-bold text-[#006C49] hover:bg-[#ADEDD3]/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">autorenew</span>
              <span>새 오픈채팅방 연동 및 알림 감지 설정</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
