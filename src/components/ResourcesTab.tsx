import React, { useState } from 'react';
import { MOCK_RESOURCES } from '../data/mockData';
import { ResourceFilterType, ResourceItem } from '../types';

interface ResourcesTabProps {
  onShowToast: (msg: string, icon?: string) => void;
  onOpenDiagramModal: (imgUrl: string, title: string, subtitle?: string) => void;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  onShowToast,
  onOpenDiagramModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<ResourceFilterType>('all');
  const [resources, setResources] = useState<ResourceItem[]>(MOCK_RESOURCES);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({
    'res-diagram-1': true,
    'res-benchmark-1': true,
    'res-link-1': true,
    'res-link-2': true,
  });

  const toggleSummary = (id: string) => {
    setExpandedSummaries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefresh = () => {
    onShowToast('자료 목록을 새로고침했습니다.', 'sync');
  };

  const handleDownload = (title: string) => {
    onShowToast(`${title} 이미지 파일이 다운로드되었습니다.`, 'download_done');
  };

  const filteredMedia = resources.filter((r) => r.type === 'media');
  const filteredLinks = resources.filter((r) => r.type === 'link');

  return (
    <div className="space-y-4">
      {/* 1. Shared Resources Overview Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 flex items-center justify-center text-[#005236] dark:text-emerald-300 shrink-0">
              <span className="material-symbols-outlined text-[22px]">folder_special</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-[#161C25] dark:text-slate-100">정제된 공유 자료</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 dark:bg-emerald-950 text-[#006C49] dark:text-emerald-300 text-xs font-bold">
                  총 6건
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">잡담 속에서 AI가 자동 검출한 핵심 레퍼런스</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 group cursor-pointer"
            aria-label="새로고침"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-180">refresh</span>
          </button>
        </div>

        {/* Info Pill Banner */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 border border-[#E3E8F5] dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
          <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[18px] filled">insights</span>
          <span>
            이 대화에서 공유된 <strong className="text-slate-900 dark:text-slate-100 font-bold">알짜 링크 4개</strong>,{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">다이어그램 1개</strong>,{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">벤치마크 1개</strong>
          </span>
        </div>

        {/* Filter Segment Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              onShowToast('전체 공유 자료를 표시합니다.', 'filter_list');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>전체</span>
            <span className="opacity-80">6</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('link');
              onShowToast('URL 링크만 필터링했습니다.', 'link');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer ${
              activeFilter === 'link'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">link</span>
            <span>URL 링크</span>
            <span className={activeFilter === 'link' ? 'text-emerald-200' : 'text-[#006C49] dark:text-emerald-400'}>4</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('media');
              onShowToast('미디어 및 다이어그램만 필터링했습니다.', 'image');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer ${
              activeFilter === 'media'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">image</span>
            <span>미디어/다이어그램</span>
            <span className={activeFilter === 'media' ? 'text-emerald-200' : 'text-[#006C49] dark:text-emerald-400'}>2</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: Media Resources (Diagrams & Benchmarks) */}
      {(activeFilter === 'all' || activeFilter === 'media') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] filled">
                photo_library
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100">미디어 &amp; 실증 자료</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">2개의 시각 자료</span>
          </div>

          {filteredMedia.map((media) => (
            <article
              key={media.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[13px] filled">schema</span>
                  {media.categoryBadge}
                </span>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] dark:bg-emerald-400" />
                  <span>{media.time}</span>
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 leading-snug">
                {media.title}
              </h4>

              {/* Graphic Visual Preview */}
              <div
                onClick={() =>
                  onOpenDiagramModal(
                    media.imageUrl || '',
                    media.title,
                    media.subtitle
                  )
                }
                className="relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[16/9] group cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={media.imageUrl}
                  alt={media.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <span className="text-xs text-white/90 font-medium">클릭하여 전체화면 확대</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-xs font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[15px]">fullscreen</span>
                    고해상도 보기
                  </span>
                </div>

                {media.id === 'res-benchmark-1' && (
                  <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-emerald-400">speed</span>
                      p95: 200ms 유지
                    </span>
                  </div>
                )}
              </div>

              {/* Collapsible AI Analysis Details */}
              <div className="bg-[#EFF4FF] dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-[#E3E8F5] dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => toggleSummary(media.id)}
                  className="w-full p-3 flex items-center justify-between text-xs font-bold text-[#006C49] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                    <span>AI 다이어그램 판독 해설 보기</span>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${expandedSummaries[media.id] ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {expandedSummaries[media.id] && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-700 space-y-1">
                    {media.aiSummary.map((bullet, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] dark:bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Metadata & Action */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#006C49] flex items-center justify-center text-white text-xs font-bold">
                    {media.authorName ? media.authorName[0] : '리'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#161C25] dark:text-slate-100">{media.authorName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{media.authorRole}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {media.id === 'res-benchmark-1' ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(media.title)}
                      className="px-3 py-1.5 rounded-xl bg-[#006C49] text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all hover:bg-[#005236] group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] transition-transform duration-200 group-hover:scale-110">download</span>
                      <span>다운로드</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenDiagramModal(
                          media.imageUrl || '',
                          media.title,
                          media.subtitle
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] transition-transform duration-200 group-hover:scale-110">open_in_full</span>
                      <span>확대 보기</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* SECTION 2: Curated Link Cards */}
      {(activeFilter === 'all' || activeFilter === 'link') && (
        <section className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px]">link</span>
              <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100">공유된 핵심 URL</h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">4개 정제 완료</span>
          </div>

          {filteredLinks.map((link) => (
            <article
              key={link.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs truncate">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                    <span className="material-symbols-outlined text-[11px]">language</span>
                  </span>
                  <span className="font-bold text-[#006C49] dark:text-emerald-400">{link.domain}</span>
                  <span className="text-slate-400 dark:text-slate-500 truncate">{link.path}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold shrink-0">
                  {link.categoryBadge}
                </span>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 leading-snug">
                  {link.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{link.subtitle}</p>
              </div>

              {/* Collapsible AI 3-Point Bullets */}
              <div className="bg-[#EFF4FF] dark:bg-slate-800/80 rounded-2xl overflow-hidden border border-[#E3E8F5] dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => toggleSummary(link.id)}
                  className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-[#006C49] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">psychology</span>
                    <span>핵심 AI 요약 펼치기</span>
                  </div>
                  <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform ${expandedSummaries[link.id] ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {expandedSummaries[link.id] && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                    {link.aiSummary.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] dark:bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meta stats & Action button */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {link.starsCount ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="material-symbols-outlined text-[15px] filled">star</span>
                      {link.starsCount} stars
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">touch_app</span>
                    {link.clicksCount}회 클릭
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006C49] dark:text-emerald-400 filled">bookmark</span>
                    {link.bookmarksCount}명 저장
                  </span>
                </div>

                <a
                  href={link.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onShowToast(`${link.domain} 원문 웹사이트를 엽니다.`, 'open_in_new')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-xs font-bold flex items-center gap-1 hover:bg-[#8ee0be] dark:hover:bg-emerald-900 active:scale-95 transition-all group"
                >
                  <span>{link.badgeLabel === 'GITHUB' ? '깃허브 방문' : '원문 열기'}</span>
                  <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">arrow_outward</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};
