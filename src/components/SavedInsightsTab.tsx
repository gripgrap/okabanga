import React, { useState } from 'react';
import { SavedItem } from '../types';

interface SavedInsightsTabProps {
  onShowToast: (msg: string, icon?: string) => void;
  onSelectSavedItem: (id: string) => void;
}

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-1',
    title: 'Next.js 15 Server Action 캐시 무효화 전략 및 Redis 분산 락',
    roomName: '프론트엔드 실무 오픈카톡방',
    savedAt: '오늘 16:42',
    type: 'summary',
    contentSnippet: 'Idempotency-Key 헤더와 Redis 300ms 분산 락을 결합하여 백엔드 DB 캐시 스탬피드 위험 방지.',
  },
  {
    id: 'save-2',
    title: 'daangn/next-action-debounce-lock (오픈소스 라이브러리)',
    roomName: '프론트엔드 실무 오픈카톡방',
    savedAt: '오늘 15:15',
    type: 'resource',
    contentSnippet: '당근 테크팀에서 공개한 분산 환경 Server Action 락 데코레이터 유틸리티.',
  },
  {
    id: 'save-3',
    title: 'Turbopack vs 웹팩 빌드 속도 벤치마크 (1.2s 단축)',
    roomName: '프론트엔드 실무 오픈카톡방',
    savedAt: '어제 19:10',
    type: 'resource',
    contentSnippet: '초당 5,000 req 부하 테스트 시 p95 200ms 유지 실측 성능 데이터.',
  },
];

export const SavedInsightsTab: React.FC<SavedInsightsTabProps> = ({
  onShowToast,
  onSelectSavedItem,
}) => {
  const [items, setItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    onShowToast('보관함에서 항목이 삭제되었습니다.', 'delete');
  };

  const handleExportNotionAll = () => {
    onShowToast('보관된 알짜 인사이트 3건이 노션 데이터베이스로 동기화되었습니다!', 'task_alt');
  };

  const handleExportKakao = () => {
    onShowToast('나에게 카카오톡 메시지로 요약 리포트가 발송되었습니다!', 'chat');
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 flex items-center justify-center text-[#005236] dark:text-emerald-300">
              <span className="material-symbols-outlined text-[22px]">bookmark</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#161C25] dark:text-slate-100">내 저장소</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">스크랩한 핵심 요약과 실무 코드 아카이브</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#E9EEFB] dark:bg-slate-800 text-[#006C49] dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-slate-700">
            총 {items.length}개 보관
          </span>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handleExportNotionAll}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-150 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:scale-110">description</span>
            <span>노션 일괄 동기화</span>
          </button>
          <button
            type="button"
            onClick={handleExportKakao}
            className="py-2.5 px-3 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 hover:bg-[#8ee0be] dark:hover:bg-emerald-900 text-[#005236] dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all duration-150 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:scale-110">chat</span>
            <span>나에게 카톡 발송</span>
          </button>
        </div>
      </div>

      {/* List: Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {items.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-[36px] mb-2">bookmark_border</span>
            <p className="text-sm font-semibold">보관된 인사이트가 없습니다.</p>
            <p className="text-xs mt-1">대화 요약 또는 자료 카드에서 북마크 아이콘을 눌러보세요.</p>
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectSavedItem(item.id)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                    {item.roomName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.savedAt}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors active:scale-90 cursor-pointer"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-[#EFF4FF] dark:bg-slate-800/70 p-2.5 rounded-xl border border-[#E3E8F5] dark:border-slate-700/60 line-clamp-3">
                  {item.contentSnippet}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                  학습 완료됨
                </span>
                <span className="text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 font-medium flex items-center gap-0.5">
                  <span>원문 다시보기</span>
                  <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5">chevron_right</span>
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
