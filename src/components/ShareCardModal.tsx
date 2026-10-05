import React, { useState } from 'react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `[오카방가방가 3줄 요약] 프론트엔드 실무 단톡방 오늘의 핵심 토론
📌 주제: Next.js 15 Server Action 캐시 무효화 전략 및 서버 부하 논쟁

1. 문제 제기: 대규모 트래픽 발생 시 revalidateTag의 동시 호출로 백엔드 DB 캐시 스탬피드 위험.
2. 실무 솔루션: Optimistic UI와 결합하되, 분산 Redis 락(300ms) 계층을 두어 중복 무효화 방지.
3. 합의점/결론: 완전한 서버 액션 의존보다는 TanStack Query v5 + Webhook 하이브리드 조합 권장 (실무진 89% 지지).

💡 잡담 98.1% 걷어내고 실무 인사이트만 3분 만에!
출처: 오카방가방가 (https://okabang.io)`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      onShowToast('SNS 공유 텍스트가 클립보드에 복사되었습니다!', 'content_copy');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadImage = () => {
    onShowToast('인스타그램/X 업로드용 요약 카드 이미지가 저장되었습니다.', 'download_done');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px]">ios_share</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">오늘의 요약 카드 공유</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Card Preview Container (Styled like a modern social card) */}
        <div className="p-5 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
          <div 
            id="shareable-digest-card"
            className="w-full bg-gradient-to-b from-[#10B981]/10 via-white to-white dark:via-slate-900 dark:to-slate-900 p-5 rounded-3xl border border-[#10B981]/30 shadow-md space-y-3.5 text-slate-900 dark:text-slate-100"
          >
            {/* Top Brand Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px]">forum</span>
                <span className="text-xs font-black tracking-tight text-[#006C49] dark:text-emerald-400">오카방가방가</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">| 알짜 다이제스트</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">오늘 18:30 기준</span>
            </div>

            {/* Room Name & Title */}
            <div>
              <span className="text-[11px] font-bold text-[#006C49] dark:text-emerald-400">프론트엔드 실무 오픈카톡방</span>
              <h4 className="text-sm sm:text-base font-extrabold text-[#161C25] dark:text-slate-100 leading-snug mt-0.5">
                Next.js 15 Server Action 캐시 무효화 전략 및 서버 부하 논쟁
              </h4>
            </div>

            {/* 3 Bullets */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 border border-[#E3E8F5] dark:border-slate-700 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#006C49] dark:bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-[#006C49] dark:text-emerald-400">문제:</strong> revalidateTag 동시 호출로 백엔드 DB 캐시 스탬피드 위험.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#006C49] dark:bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-[#006C49] dark:text-emerald-400">해결:</strong> Optimistic UI + 분산 Redis 락(300ms)으로 중복 무효화 차단.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#006C49] dark:bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-[#006C49] dark:text-emerald-400">결론:</strong> TanStack Query v5 + Webhook 조합 권장 (실무진 89% 지지).
                </p>
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                잡담 98.1% 제거 완료
              </span>
              <span className="font-semibold text-slate-400 dark:text-slate-500">okabang.io</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex-1 py-3 px-3 rounded-2xl bg-[#006C49] hover:bg-[#005236] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:scale-110">download</span>
            <span>이미지 카드 저장</span>
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:scale-110">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? '복사됨!' : '텍스트 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
