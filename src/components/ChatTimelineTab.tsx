import React, { useState, useEffect, useRef } from 'react';
import { MOCK_DISCUSSIONS, MOCK_NOISE_BLOCKS } from '../data/mockData';
import { DiscussionBubble } from '../types';

interface ChatTimelineTabProps {
  onShowToast: (msg: string, icon?: string) => void;
  onOpenDiagramModal: (imgUrl: string, title: string, subtitle?: string) => void;
  highlightedBubbleId?: string | null;
}

export const ChatTimelineTab: React.FC<ChatTimelineTabProps> = ({
  onShowToast,
  onOpenDiagramModal,
  highlightedBubbleId,
}) => {
  const [discussions, setDiscussions] = useState<DiscussionBubble[]>(MOCK_DISCUSSIONS);
  const [expandedNoise, setExpandedNoise] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    'disc-2': true,
  });
  const [selectedVote, setSelectedVote] = useState<'hybrid' | 'pure'>('hybrid');
  const [hybridVotes, setHybridVotes] = useState(64);
  const [pureVotes, setPureVotes] = useState(8);

  const bubbleRefs = useRef<Record<string, HTMLElement | null>>({});

  // When navigated from a Fact-Check anchor, scroll and flash highlight
  useEffect(() => {
    if (highlightedBubbleId) {
      const timer = setTimeout(() => {
        const el = bubbleRefs.current[highlightedBubbleId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          onShowToast('요약에 연결된 원문 발언으로 이동했습니다 (팩트체크 완료)', 'verified');
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [highlightedBubbleId]);

  const toggleNoise = (id: string) => {
    setExpandedNoise((prev) => ({ ...prev, [id]: !prev[id] }));
    onShowToast('필터링된 일상 잡담 접기/펼치기', 'cleaning_services');
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLike = (id: string) => {
    setDiscussions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, likes: d.likes + 1 } : d))
    );
    onShowToast('발언에 공감을 표시했습니다.', 'thumb_up');
  };

  const handleVote = (choice: 'hybrid' | 'pure') => {
    if (choice === selectedVote) return;
    if (choice === 'hybrid') {
      setHybridVotes((v) => v + 1);
      setPureVotes((v) => Math.max(0, v - 1));
    } else {
      setPureVotes((v) => v + 1);
      setHybridVotes((v) => Math.max(0, v - 1));
    }
    setSelectedVote(choice);
    onShowToast('투표가 반영되었습니다!', 'how_to_vote');
  };

  const totalVotes = hybridVotes + pureVotes;
  const hybridPercent = Math.round((hybridVotes / totalVotes) * 100);
  const purePercent = 100 - hybridPercent;

  return (
    <div className="space-y-4">
      {/* 1. Fact-Check Status Banner if navigated from Anchor */}
      {highlightedBubbleId && (
        <div className="p-3 rounded-2xl bg-[#ADEDD3]/50 border border-[#006C49]/30 flex items-center justify-between text-xs animate-[fadeIn_0.2s_ease-out]">
          <span className="text-[#005236] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] filled">fact_check</span>
            <span>팩트체크 모드: 요약 문항과 일치하는 원문 발언 하이라이트</span>
          </span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#006C49]">
            AI 원문 일치율 99%
          </span>
        </div>
      )}

      {/* 2. Noise Indicator Strip */}
      <section className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-[#006C49] dark:text-emerald-400">
            잡담 98.1% 정제 완료
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            · 1,420개 중 28개 핵심 추출
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
          AI Signal Guard
        </span>
      </section>

      {/* 3. Main Discussion Debrief & Conclusion Card */}
      <section className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px] filled">local_fire_department</span>
            오늘의 메인 논쟁 주제
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>85분간 토론</span>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-[#161C25] dark:text-slate-100 leading-snug">
            Next.js 15 Server Action 캐시 무효화 및 서버 부하 논쟁
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            블랙프라이데이 대규모 트래픽 대비 중 발생 가능한 DB 커넥션 풀 고갈 이슈
          </p>
        </div>

        <details className="group bg-[#EFF4FF] dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-[#E3E8F5] dark:border-slate-700" open>
          <summary className="flex items-center justify-between p-3.5 cursor-pointer list-none select-none text-xs font-bold text-[#006C49] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] filled">lightbulb</span>
              <span>핵심 결론: 하이브리드 패턴 지지 (89%)</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700">
            <div className="flex items-start gap-2 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 font-bold text-[10px] shrink-0 mt-0.5">
                결론 도출
              </span>
              <p className="leading-relaxed">
                완전한 서버 액션(<code>revalidateTag</code>) 연쇄 호출은 고트래픽 시 동기 인스턴스 점유로 DB 커넥션 풀 고갈을 유발합니다.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-[#006C49] text-white font-bold text-[10px] shrink-0 mt-0.5">
                실무 가이드
              </span>
              <p className="leading-relaxed">
                분산 락(Redis Lock 300ms) 적용과 브라우저 TanStack Query 조합의 <strong className="text-[#006C49] dark:text-emerald-400">하이브리드 패턴</strong>이 최적이라는 실무진 <strong>89% 지지 합의</strong> 도출.
              </p>
            </div>
          </div>
        </details>
      </section>

      {/* 4. Timeline Stream Section Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px]">forum</span>
          <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100">정제된 실무 발언 타임라인</h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">실시간 동기화 완료</span>
      </div>

      {/* 5. Folded Noise Accordion 1 */}
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleNoise('noise-1')}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">coffee</span>
            <span className="text-xs sm:text-sm font-semibold">
              점심 메뉴 논의 &amp; 출근 인사 (182개 잡담 자동 생략)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>12:10 - 13:45</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform ${expandedNoise['noise-1'] ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>
        </button>

        {expandedNoise['noise-1'] && (
          <div className="p-3 bg-white/70 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">AI가 필터링한 일상 대화 샘플:</p>
            {MOCK_NOISE_BLOCKS[0].sampleItems.map((item, idx) => (
              <p key={idx} className="truncate">· {item}</p>
            ))}
          </div>
        )}
      </div>

      {/* 6. Discussion Bubble 1: Junior FE (Anchor disc-1) */}
      <article
        ref={(el) => { bubbleRefs.current['disc-1'] = el; }}
        className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-3 transition-all duration-300 ${
          highlightedBubbleId === 'disc-1'
            ? 'ring-2 ring-[#006C49] dark:ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 border-[#006C49] dark:border-emerald-500'
            : 'border-slate-100 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
              FE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100">FE 3년차 주니어</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                  질의
                </span>
                {highlightedBubbleId === 'disc-1' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#006C49] text-white text-[9px] font-bold">
                    팩트체크 대상
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">오후 14:22</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onShowToast('질의 발언 링크가 복사되었습니다.', 'link')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer"
            title="링크 복사"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed border border-[#E3E8F5] dark:border-slate-700">
          "저희가 다음달 블랙프라이데이 프로모션 트래픽 대비 중인데, Next 15 Server Action과{' '}
          <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[11px] text-[#006C49] dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-900/60">
            revalidateTag
          </code>
          를 주문/장바구니 플로우에 전면 도입하려 합니다. 혹시 실제 대규모 트래픽에서 커넥션 풀 마르거나 서버 지연 겪으신 분 계실까요?"
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleLike('disc-1')}
              className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400 hover:text-[#006C49] dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#006C49] dark:text-emerald-400">thumb_up</span>
              <span>공감 {discussions[0]?.likes}</span>
            </button>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">reply</span>
              <span>답변 5</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
            논쟁 촉발 포인트
          </span>
        </div>
      </article>

      {/* 7. Discussion Bubble 2: Senior Architect (Anchor disc-2) */}
      <article
        ref={(el) => { bubbleRefs.current['disc-2'] = el; }}
        className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-3 transition-all duration-300 ${
          highlightedBubbleId === 'disc-2'
            ? 'ring-2 ring-[#006C49] dark:ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 border-[#006C49] dark:border-emerald-500'
            : 'border-emerald-100 dark:border-emerald-900/50 ring-1 ring-[#10B981]/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#006C49] text-white flex items-center justify-center font-bold text-xs">
              TL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100">네카라 테크리드</span>
                <span className="px-2 py-0.5 rounded-full bg-[#006C49] text-white text-[10px] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">verified</span>
                  시니어 아키텍트
                </span>
                {highlightedBubbleId === 'disc-2' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#006C49] text-white text-[9px] font-bold">
                    팩트체크 대상
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">오후 14:28</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px] filled">workspace_premium</span>
            베스트 답변
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed border border-emerald-100 dark:border-emerald-900/60">
          <p>
            "그거 바로 병목 납니다! 서버 액션은 기본적으로 동기적 Node 런타임 인스턴스를 점유하기 때문에, 쓰기 트래픽 스파이크 시 DB 커넥션이 순식간에 고갈돼요. 결제/쿠폰 진입은{' '}
            <strong className="text-[#006C49] dark:text-emerald-400 font-bold">API Route + Kafka 큐</strong>로 격리하시고 UI 상태만 폴링 또는 SSE로 푸시하는 게 안전합니다."
          </p>
        </div>

        {/* Expandable Technical Guide & Diagram Snippet */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleDetails('disc-2')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[16px]">terminal</span>
              <span>Redis Debounce 락 래퍼 &amp; 아키텍처 다이어그램</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform ${expandedDetails['disc-2'] ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {expandedDetails['disc-2'] && (
            <div className="p-3 pt-0 space-y-2.5 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between pt-2 text-[11px]">
                <span className="font-bold text-slate-700 dark:text-slate-300">Redis Debounce 락 래퍼 코드</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('await debounceInvalidate(\'posts:feed\', 300);\nrevalidateTag(\'posts:feed\');');
                    onShowToast('스니펫이 복사되었습니다.', 'content_copy');
                  }}
                  className="text-[#006C49] dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  <span>복사</span>
                </button>
              </div>

              <pre className="font-mono text-[11px] leading-relaxed text-slate-100 bg-[#161C25] p-2.5 rounded-xl overflow-x-auto border border-slate-800">
                <code>
                  {'// revalidateTag 직접 호출 대신 300ms 분산 락 부여\n'}
                  {'const res = await redis.set(`lock:tag:${tag}`, "1", "NX", "PX", 300);\n'}
                  {'if (res) { revalidateTag(tag); }'}
                </code>
              </pre>

              {/* Clickable Diagram Thumbnail preview */}
              <div
                onClick={() =>
                  onOpenDiagramModal(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBFc8rPydyG9sCiwOHecCb7_0D1zAMMuy2OtuGlB76JYft1kKXb3SzI83QempfpAGzuMlqFEUOBrZTs4s6QnPQXVGzQPCblUklv6V5KuGo4nGhVp8l10RURLU-zAiwA8ksxBvbIrh5YyWdXkORHE0jABQdHbCC6D2px0IjF-jXVWPWw7PaHayYW21kpQIdz2oqnDkpcr7cxGGpYFPy5fq3_fbl6pZkmQ-vMzFdD74IzS21HU3XjaRN4sw',
                    'Next.js 15 Server Action 캐시 무효화 아키텍처 다이어그램',
                    'Redis 분산 락 & TanStack Query 하이브리드 파이프라인'
                  )
                }
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-[#006C49] dark:hover:border-emerald-500 transition-all group"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFc8rPydyG9sCiwOHecCb7_0D1zAMMuy2OtuGlB76JYft1kKXb3SzI83QempfpAGzuMlqFEUOBrZTs4s6QnPQXVGzQPCblUklv6V5KuGo4nGhVp8l10RURLU-zAiwA8ksxBvbIrh5YyWdXkORHE0jABQdHbCC6D2px0IjF-jXVWPWw7PaHayYW21kpQIdz2oqnDkpcr7cxGGpYFPy5fq3_fbl6pZkmQ-vMzFdD74IzS21HU3XjaRN4sw"
                    alt="Architecture Diagram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[18px]">zoom_in</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    아키텍처: Redis Lock + TanStack Query 구조도
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    클릭하여 고해상도 전체 다이어그램 확대 보기
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110">
                  open_in_full
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleLike('disc-2')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold hover:bg-[#8ee0be] dark:hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px] filled">check_circle</span>
              <span>채택 {discussions[1]?.likes}</span>
            </button>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
              현장 적용 검증됨
            </span>
          </div>

          <button
            type="button"
            onClick={() => onShowToast('이 솔루션을 내 메모에 스크랩했습니다.', 'bookmark_add')}
            className="text-xs text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-0.5 hover:underline active:scale-95 transition-all cursor-pointer"
          >
            <span>스크랩</span>
            <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
          </button>
        </div>
      </article>

      {/* 8. Folded Noise Accordion 2 */}
      <div className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleNoise('noise-2')}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-200/70 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <span className="material-symbols-outlined text-[18px] text-slate-500">sentiment_satisfied</span>
            <span className="text-xs sm:text-sm font-semibold">
              스티커 및 감사 인사 (19개 메시지 자동 접힘)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>14:48 - 14:52</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform ${expandedNoise['noise-2'] ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>
        </button>

        {expandedNoise['noise-2'] && (
          <div className="p-3 bg-white/70 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 mb-1">AI가 필터링한 리액션 샘플:</p>
            {MOCK_NOISE_BLOCKS[1].sampleItems.map((item, idx) => (
              <p key={idx} className="truncate">· {item}</p>
            ))}
          </div>
        )}
      </div>

      {/* 9. Discussion Bubble 3: Commerce Infra Lead (Anchor disc-3) */}
      <article
        ref={(el) => { bubbleRefs.current['disc-3'] = el; }}
        className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-sm space-y-3 transition-all duration-300 ${
          highlightedBubbleId === 'disc-3'
            ? 'ring-2 ring-[#006C49] dark:ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 border-[#006C49] dark:border-emerald-500'
            : 'border-slate-100 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
              INF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100">커머스 인프라 리드</span>
                <span className="px-2 py-0.5 rounded-full bg-[#006C49] text-white text-[10px] font-bold">
                  트러블슈팅 해결
                </span>
                {highlightedBubbleId === 'disc-3' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#006C49] text-white text-[9px] font-bold">
                    팩트체크 대상
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">오후 15:10</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">실사례 공유</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed border border-[#E3E8F5] dark:border-slate-700">
          "저희도 작년 블프 때 같은 실수로 장애 났었어요. 결론적으로 <strong className="text-slate-900 dark:text-slate-100 font-bold">Idempotency-Key(멱등성 키)</strong> 헤더 강제하고 Redis에 3초 TTL 락 거는 유틸리티 라이브러리 만들어서 해결했습니다. 아래 아티클 레포 링크 참고하세요!"
        </div>

        {/* Curated Repo Link Preview */}
        <div
          onClick={() => onShowToast('깃허브 오픈소스 저장소로 이동합니다.', 'code')}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-[0.99] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#006C49] dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">code_blocks</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors">
              github.com/commerce-infra/next-action-lock
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Next.js 15 Server Action 동시성 제어 유틸리티 오픈소스
            </span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">chevron_right</span>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => handleLike('disc-3')}
            className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-[#006C49] dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#006C49] dark:text-emerald-400">thumb_up</span>
            <span>도움됨 {discussions[2]?.likes}</span>
          </button>
          <button
            type="button"
            onClick={() => onShowToast('자료가 보관함에 저장되었습니다.', 'bookmark')}
            className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">bookmark</span>
            <span>자료 보관</span>
          </button>
        </div>
      </article>

      {/* 10. Live Poll Result Card */}
      <article className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[18px]">how_to_vote</span>
            <span className="text-xs sm:text-sm font-bold text-[#161C25] dark:text-slate-100">실무진 긴급 투표 결과</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[10px] font-bold">
              1위 {hybridPercent}%
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            {totalVotes}명 참여
          </span>
        </div>

        {/* Option 1: Hybrid */}
        <div
          onClick={() => handleVote('hybrid')}
          className={`p-3 rounded-2xl relative overflow-hidden cursor-pointer border transition-all active:scale-[0.99] ${
            selectedVote === 'hybrid'
              ? 'border-[#006C49] dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div
            className="absolute inset-y-0 left-0 bg-[#ADEDD3]/40 dark:bg-emerald-500/20 rounded-2xl pointer-events-none transition-all duration-300"
            style={{ width: `${hybridPercent}%` }}
          />
          <div className="flex items-center justify-between relative z-10 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${selectedVote === 'hybrid' ? 'text-[#006C49] dark:text-emerald-400 filled' : 'text-slate-400'}`}>
                {selectedVote === 'hybrid' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                하이브리드 패턴 (REST API + 분산 락 캐시)
              </span>
            </div>
            <span className="text-[#006C49] dark:text-emerald-400 font-bold">
              {hybridPercent}% ({hybridVotes}표)
            </span>
          </div>
        </div>

        {/* Option 2: Pure Server Action */}
        <div
          onClick={() => handleVote('pure')}
          className={`p-3 rounded-2xl relative overflow-hidden cursor-pointer border transition-all active:scale-[0.99] ${
            selectedVote === 'pure'
              ? 'border-[#006C49] dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div
            className="absolute inset-y-0 left-0 bg-slate-200/50 dark:bg-slate-700/50 rounded-2xl pointer-events-none transition-all duration-300"
            style={{ width: `${purePercent}%` }}
          />
          <div className="flex items-center justify-between relative z-10 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${selectedVote === 'pure' ? 'text-[#006C49] dark:text-emerald-400 filled' : 'text-slate-400'}`}>
                {selectedVote === 'pure' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                서버 액션 전면 단독 적용
              </span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              {purePercent}% ({pureVotes}표)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
          💡 카드를 탭하여 투표에 참여할 수 있습니다.
        </p>
      </article>
    </div>
  );
};
