import React, { useState } from 'react';
import { CURATED_TOPICS } from '../data/mockData';

interface TopicCurationTabProps {
  onSelectTopic: (topicId: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const TopicCurationTab: React.FC<TopicCurationTabProps> = ({
  onSelectTopic,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = CURATED_TOPICS.filter((t) => {
    const matchesCat =
      activeCategory === 'all' ||
      (activeCategory === 'fe' && t.roomCategory.includes('개발')) ||
      (activeCategory === 'design' && (t.roomCategory.includes('디자인') || t.roomCategory.includes('PO'))) ||
      (activeCategory === 'growth' && t.roomCategory.includes('마케팅'));
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 flex items-center justify-center text-[#005236] dark:text-emerald-300">
            <span className="material-symbols-outlined text-[22px]">explore</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#161C25] dark:text-slate-100">주제별 AI 실무 큐레이션</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">카톡방별 가장 열띤 토론과 검증된 해법 아카이브</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="주제, 기술 스택, 키워드로 검색 (Next 15, Redis, 피그마...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#006C49] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            전체 주제
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('fe')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeCategory === 'fe'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            개발/엔지니어링
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('design')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeCategory === 'design'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            프로덕트/디자인
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('growth')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeCategory === 'growth'
                ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            그로스/마케팅
          </button>
        </div>
      </div>

      {/* Topics Feed: Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((topic) => (
          <article
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[11px] font-bold">
                  {topic.roomName}
                </span>
                <span className="text-xs font-bold text-[#006C49] dark:text-emerald-400">
                  AI 핵심도 {topic.confidenceScore}%
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span>자료 {topic.referenceCount}개</span>
                <span>·</span>
                <span>정제 토론 {topic.cleanedCount}건</span>
              </div>

              <span className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <span>요약 읽기</span>
                <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
