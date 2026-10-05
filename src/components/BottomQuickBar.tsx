import React from 'react';

interface BottomQuickBarProps {
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSaveNotion: () => void;
  onSendKakao: () => void;
  isNotionCooldown?: boolean;
  notionCooldownLeft?: number;
  isKakaoCooldown?: boolean;
  kakaoCooldownLeft?: number;
}

export const BottomQuickBar: React.FC<BottomQuickBarProps> = ({
  isBookmarked,
  onToggleBookmark,
  onSaveNotion,
  onSendKakao,
  isNotionCooldown = false,
  notionCooldownLeft = 0,
  isKakaoCooldown = false,
  kakaoCooldownLeft = 0,
}) => {
  return (
    <aside className="sticky bottom-20 md:bottom-6 z-30 w-full pt-1 pb-2 px-1">
      <div className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-900/10 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 max-w-md mx-auto transition-colors">
        {/* Notion Save Button with Cooldown Feedback */}
        <button
          type="button"
          onClick={onSaveNotion}
          disabled={isNotionCooldown}
          className={`flex-1 py-2.5 sm:py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all group ${
            isNotionCooldown
              ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 active:scale-95 cursor-pointer'
          }`}
          title={isNotionCooldown ? `과도한 요청 방지: ${notionCooldownLeft}초 후 다시 시도 가능` : '노션 워크스페이스에 요약 저장'}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
              isNotionCooldown
                ? 'animate-pulse text-amber-500'
                : 'text-[#006C49] dark:text-emerald-400 group-hover:scale-110'
            }`}
          >
            {isNotionCooldown ? 'hourglass_top' : 'description'}
          </span>
          <span>{isNotionCooldown ? `쿨다운 (${notionCooldownLeft}s)` : '노션 저장'}</span>
        </button>

        {/* Kakao Push Button with Cooldown Feedback */}
        <button
          type="button"
          onClick={onSendKakao}
          disabled={isKakaoCooldown}
          className={`flex-1 py-2.5 sm:py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all group ${
            isKakaoCooldown
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-400/60 dark:text-emerald-700 cursor-not-allowed'
              : 'bg-[#ADEDD3] dark:bg-emerald-950 hover:bg-[#8ee0be] dark:hover:bg-emerald-900 text-[#005236] dark:text-emerald-300 active:scale-95 cursor-pointer'
          }`}
          title={isKakaoCooldown ? `과도한 요청 방지: ${kakaoCooldownLeft}초 후 다시 시도 가능` : '나에게 카카오톡 메시지로 발송'}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
              isKakaoCooldown
                ? 'animate-pulse text-amber-500'
                : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
            }`}
          >
            {isKakaoCooldown ? 'hourglass_top' : 'send'}
          </span>
          <span>{isKakaoCooldown ? `쿨다운 (${kakaoCooldownLeft}s)` : '나에게 카톡'}</span>
        </button>

        {/* Bookmark Icon Button */}
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-label="북마크 토글"
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md active:scale-90 transition-all group cursor-pointer ${
            isBookmarked
              ? 'bg-[#006C49] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] sm:text-[22px] transition-transform duration-200 group-hover:scale-110 ${isBookmarked ? 'filled' : ''}`}>
            {isBookmarked ? 'bookmark' : 'bookmark_add'}
          </span>
        </button>
      </div>
    </aside>
  );
};
