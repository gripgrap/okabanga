import React, { useState, useEffect } from 'react';
import { CoreDiscussionItem, DiscussionCategoryKey, RoomSubTab, UserCustomTag } from '../types';
import { INITIAL_CORE_DISCUSSIONS, INITIAL_USER_TAGS, MOCK_NOISE_BLOCKS } from '../data/mockData';
import { CustomTagManagerModal } from './CustomTagManagerModal';

interface CoreDiscussionsTagSectionProps {
  onSwitchTab: (tab: RoomSubTab) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onNavigateToFactCheck: (bubbleId: string) => void;
  isDarkMode?: boolean;
  activeCategory?: DiscussionCategoryKey;
  onSelectCategory?: (category: DiscussionCategoryKey) => void;
}

export const CATEGORY_TABS: { key: DiscussionCategoryKey; label: string; icon: string; desc: string }[] = [
  { key: 'all', label: '전체 토론', icon: 'apps', desc: '모든 핵심 토론 28건' },
  { key: 'tech', label: '기술/개발', icon: 'code', desc: '아키텍처, 서버액션, 성능최적화' },
  { key: 'trouble', label: '실무/트러블슈팅', icon: 'build', desc: '동시성 락, 장애 대응, 멱등성' },
  { key: 'issue', label: '시사/업계동향', icon: 'trending_up', desc: '채용/연봉 트렌드, 오픈소스 AI' },
  { key: 'chat', label: '잡담/노이즈(정제됨)', icon: 'filter_alt_off', desc: '98.1% 차단된 스몰토크 아카이브' },
];

const USER_TAGS_STORAGE_KEY = 'okabang_user_custom_tags_registry_v1';
const DISCUSSION_TAGS_STORAGE_KEY = 'okabang_user_discussion_tags_v1';

export const CoreDiscussionsTagSection: React.FC<CoreDiscussionsTagSectionProps> = ({
  onSwitchTab,
  onShowToast,
  onNavigateToFactCheck,
  isDarkMode = false,
  activeCategory: controlledCategory,
  onSelectCategory: controlledSelectCategory,
}) => {
  // Category State (Controlled or Uncontrolled)
  const [internalCategory, setInternalCategory] = useState<DiscussionCategoryKey>('all');
  const activeCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const setActiveCategory = (cat: DiscussionCategoryKey) => {
    if (controlledSelectCategory) {
      controlledSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  // Tag Manager Modal State
  const [isTagManagerOpen, setIsTagManagerOpen] = useState<boolean>(false);

  // User Custom Tags Registry (persisted)
  const [customTags, setCustomTags] = useState<UserCustomTag[]>(() => {
    try {
      const saved = localStorage.getItem(USER_TAGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_TAGS;
  });

  // Discussions with User Tags (persisted)
  const [discussions, setDiscussions] = useState<CoreDiscussionItem[]>(() => {
    try {
      const saved = localStorage.getItem(DISCUSSION_TAGS_STORAGE_KEY);
      if (saved) {
        const parsedTags: Record<string, string[]> = JSON.parse(saved);
        return INITIAL_CORE_DISCUSSIONS.map((item) => ({
          ...item,
          userTags: parsedTags[item.id] || item.userTags || [],
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_CORE_DISCUSSIONS;
  });

  // Selected tag filter
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyUserTags, setOnlyUserTags] = useState<boolean>(false);

  // Tag filter row expand/collapse (Show primary <= 5 tags, collapse remainder)
  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);

  // Per-card expanded tags tracking (if card has > 4 tags)
  const [expandedCardTagIds, setExpandedCardTagIds] = useState<Record<string, boolean>>({});

  const toggleCardTagExpand = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardTagIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Inline tag add input state per discussion
  const [addingTagItemId, setAddingTagItemId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Persist custom tags registry to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USER_TAGS_STORAGE_KEY, JSON.stringify(customTags));
    } catch {
      // ignore
    }
  }, [customTags]);

  // Persist discussion-tag mappings to localStorage
  useEffect(() => {
    try {
      const tagMap: Record<string, string[]> = {};
      discussions.forEach((d) => {
        if (d.userTags && d.userTags.length > 0) {
          tagMap[d.id] = d.userTags;
        }
      });
      localStorage.setItem(DISCUSSION_TAGS_STORAGE_KEY, JSON.stringify(tagMap));
    } catch {
      // ignore
    }
  }, [discussions]);

  // Calculate tag counts for custom tags registry
  const customTagsWithCounts = React.useMemo(() => {
    return customTags.map((tag) => {
      let count = 0;
      discussions.forEach((d) => {
        if (d.userTags.includes(tag.name)) count += 1;
      });
      return { ...tag, count };
    });
  }, [customTags, discussions]);

  // AI Unique Tags List
  const allAiTags = React.useMemo(() => {
    const set = new Set<string>();
    discussions.forEach((d) => d.aiTags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [discussions]);

  // Combined Tag Cloud with counts & user/AI distinction
  const allTagsWithCounts = React.useMemo(() => {
    const map: Record<string, { tag: string; count: number; isUserTag: boolean; color?: UserCustomTag['color'] }> = {};

    // 1. AI tags
    discussions.forEach((item) => {
      item.aiTags.forEach((t) => {
        if (!map[t]) {
          map[t] = { tag: t, count: 0, isUserTag: false };
        }
        map[t].count += 1;
      });
    });

    // 2. User tags from registry or items
    customTags.forEach((ct) => {
      if (!map[ct.name]) {
        map[ct.name] = { tag: ct.name, count: 0, isUserTag: true, color: ct.color };
      } else {
        map[ct.name].isUserTag = true;
        map[ct.name].color = ct.color;
      }
    });

    discussions.forEach((item) => {
      item.userTags.forEach((t) => {
        if (!map[t]) {
          map[t] = { tag: t, count: 0, isUserTag: true, color: 'purple' };
        }
        map[t].count += 1;
      });
    });

    return Object.values(map).sort((a, b) => {
      // User tags first, then by frequency
      if (a.isUserTag && !b.isUserTag) return -1;
      if (!a.isUserTag && b.isUserTag) return 1;
      return b.count - a.count;
    });
  }, [discussions, customTags]);

  // Major primary tags limiting (show maximum 5 tags initially, remainder collapsed)
  const MAX_PRIMARY_TAGS = 5;

  const { visibleTags, hiddenTags, hasMoreTags } = React.useMemo(() => {
    if (allTagsWithCounts.length <= MAX_PRIMARY_TAGS) {
      return {
        visibleTags: allTagsWithCounts,
        hiddenTags: [],
        hasMoreTags: false,
      };
    }

    // Keep active selectedTag visible in the primary group so user maintains filter context
    let prioritized = [...allTagsWithCounts];
    if (selectedTag) {
      const selectedIndex = prioritized.findIndex((t) => t.tag === selectedTag);
      if (selectedIndex >= MAX_PRIMARY_TAGS) {
        const [activeItem] = prioritized.splice(selectedIndex, 1);
        prioritized.splice(MAX_PRIMARY_TAGS - 1, 0, activeItem);
      }
    }

    return {
      visibleTags: prioritized.slice(0, MAX_PRIMARY_TAGS),
      hiddenTags: prioritized.slice(MAX_PRIMARY_TAGS),
      hasMoreTags: true,
    };
  }, [allTagsWithCounts, selectedTag]);

  // Filtered discussions
  const filteredDiscussions = discussions.filter((item) => {
    // 1. Category filter
    if (activeCategory !== 'all' && item.categoryKey !== activeCategory) {
      return false;
    }
    // 2. Only user tags filter
    if (onlyUserTags && item.userTags.length === 0) {
      return false;
    }
    // 3. Selected tag filter
    if (selectedTag) {
      const hasAi = item.aiTags.includes(selectedTag);
      const hasUser = item.userTags.includes(selectedTag);
      if (!hasAi && !hasUser) return false;
    }
    return true;
  });

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = { all: discussions.length };
    CATEGORY_TABS.forEach((cat) => {
      if (cat.key !== 'all') {
        map[cat.key] = discussions.filter((d) => d.categoryKey === cat.key).length;
      }
    });
    return map;
  }, [discussions]);

  // Tag Management Handlers
  const handleAddGlobalCustomTag = (name: string, color: UserCustomTag['color']) => {
    if (customTags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      onShowToast(`'${name}' 태그가 이미 존재합니다.`, 'info');
      return;
    }
    const newTag: UserCustomTag = {
      id: `tag-${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomTags((prev) => [newTag, ...prev]);
    onShowToast(`'${name}' 커스텀 태그가 생성되었습니다. 필터 탭에 연동됩니다.`, 'sell');
  };

  const handleEditGlobalCustomTag = (oldName: string, newName: string, color: UserCustomTag['color']) => {
    // Update in registry
    setCustomTags((prev) =>
      prev.map((t) => (t.name === oldName ? { ...t, name: newName, color } : t))
    );
    // Update across all discussions
    setDiscussions((prev) =>
      prev.map((item) => ({
        ...item,
        userTags: item.userTags.map((t) => (t === oldName ? newName : t)),
      }))
    );
    // If selected tag was oldName, update to newName
    if (selectedTag === oldName) {
      setSelectedTag(newName);
    }
    onShowToast(`'${oldName}' 태그가 '${newName}'(으)로 일괄 수정되었습니다.`, 'edit');
  };

  const handleDeleteGlobalCustomTag = (tagName: string) => {
    // Remove from registry
    setCustomTags((prev) => prev.filter((t) => t.name !== tagName));
    // Remove from all discussions
    setDiscussions((prev) =>
      prev.map((item) => ({
        ...item,
        userTags: item.userTags.filter((t) => t !== tagName),
      }))
    );
    if (selectedTag === tagName) {
      setSelectedTag(null);
    }
    onShowToast(`'${tagName}' 태그가 삭제되었습니다.`, 'delete');
  };

  // Inline Tag Add on a Card
  const handleInlineAddTag = (itemId: string) => {
    let clean = newTagInput.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = '#' + clean;

    // Check if tag already exists in custom registry, if not add it
    if (!customTags.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      const newTag: UserCustomTag = {
        id: `tag-${Date.now()}`,
        name: clean,
        color: 'purple',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomTags((prev) => [newTag, ...prev]);
    }

    setDiscussions((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (item.userTags.includes(clean) || item.aiTags.includes(clean)) {
            onShowToast(`'${clean}' 태그가 이미 존재합니다.`, 'info');
            return item;
          }
          onShowToast(`'${clean}' 태그가 추가되었습니다!`, 'sell');
          return {
            ...item,
            userTags: [...item.userTags, clean],
          };
        }
        return item;
      })
    );

    setNewTagInput('');
    setAddingTagItemId(null);
  };

  // Remove tag from single card
  const handleRemoveTagFromCard = (itemId: string, tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiscussions((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            userTags: item.userTags.filter((t) => t !== tagToRemove),
          };
        }
        return item;
      })
    );
    onShowToast(`'${tagToRemove}' 태그가 이 토론에서 제거되었습니다.`, 'remove_circle_outline');
  };

  // Copy code helper
  const handleCopyCode = (snippet: string, title?: string) => {
    navigator.clipboard.writeText(snippet).then(() => {
      onShowToast(`${title || '코드 패턴'}이 클립보드에 복사되었습니다!`, 'content_copy');
    }).catch(() => {
      onShowToast('코드가 클립보드에 복사되었습니다!', 'content_copy');
    });
  };

  return (
    <section className="space-y-4">
      {/* Tag Management Modal */}
      <CustomTagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        customTags={customTagsWithCounts}
        onAddTag={handleAddGlobalCustomTag}
        onEditTag={handleEditGlobalCustomTag}
        onDeleteTag={handleDeleteGlobalCustomTag}
        aiTags={allAiTags}
        selectedFilterTag={selectedTag}
        onSelectFilterTag={(tag) => setSelectedTag(tag)}
        isDarkMode={isDarkMode}
      />

      {/* 1. Header with Category Tabs & Tag Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#006C49] dark:text-emerald-300">
                <span className="material-symbols-outlined text-[18px] filled">auto_awesome</span>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#161C25] dark:text-slate-100">
                토론 성격 자동 분류 &amp; 태그 시스템
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AI가 토론의 성격(기술/트러블슈팅/시사/잡담)을 자동 감지해 라벨링하고, 커스텀 태그를 추가·수정할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsTagManagerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="커스텀 태그 추가/수정/삭제 관리"
            >
              <span className="material-symbols-outlined text-[15px] filled">tune</span>
              <span>🏷️ 커스텀 태그 관리</span>
            </button>
          </div>
        </div>

        {/* 2. Contextual Category Status & Discussion Count (Integrated with Top Category Bar) */}
        <div className="pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">현재 필터:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeCategory === 'chat'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006C49] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              <span className="material-symbols-outlined text-[15px] filled">
                {CATEGORY_TABS.find((c) => c.key === activeCategory)?.icon || 'apps'}
              </span>
              <span>{CATEGORY_TABS.find((c) => c.key === activeCategory)?.label || '전체 토론'}</span>
            </span>

            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="text-[11px] text-slate-400 hover:text-[#006C49] dark:hover:text-emerald-400 font-semibold flex items-center gap-0.5 underline transition-colors"
                title="전체 토론으로 초기화"
              >
                <span>전체 토론 보기</span>
              </button>
            )}
          </div>

          <span className="text-slate-500 dark:text-slate-400 font-medium">
            총 {filteredDiscussions.length}개 토론 표시 중
          </span>
        </div>

        {/* 3. Combined Filter Row: AI Labeling + User Custom Tags */}
        <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="material-symbols-outlined text-[16px] text-[#006C49] dark:text-emerald-400">
                filter_list
              </span>
              <span>태그 필터링 (AI 라벨 &amp; 커스텀 태그)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyUserTags(!onlyUserTags)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                  onlyUserTags
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                }`}
              >
                <span className="material-symbols-outlined text-[13px] filled">person</span>
                <span>내 커스텀 태그만 ({customTags.length})</span>
              </button>

              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center gap-0.5 hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <span>태그 필터 해제</span>
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="mb-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#006C49] dark:text-emerald-300 font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>선택된 태그:</span>
                <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-extrabold">
                  {selectedTag}
                </span>
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  결과 {filteredDiscussions.length}건
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Tag Chips Row (AI and Custom Tags) - Major <= 5 Tags + Expand/Collapse */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTag === null
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              #전체태그
            </button>

            {(isTagsExpanded ? allTagsWithCounts : visibleTags).map(({ tag, count, isUserTag }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                    isSelected
                      ? isUserTag
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'bg-[#10B981] text-white font-bold shadow-xs'
                      : isUserTag
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100'
                      : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] opacity-70">
                    {isUserTag ? 'person' : 'auto_awesome'}
                  </span>
                  <span>{tag}</span>
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Expand / Collapse Toggle Button */}
            {hasMoreTags && (
              <button
                type="button"
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  isTagsExpanded
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006C49] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={isTagsExpanded ? '주요 5개 태그만 보기' : `추가 ${hiddenTags.length}개 태그 펼치기`}
              >
                <span>{isTagsExpanded ? '접기' : `+더보기 (${hiddenTags.length}개)`}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {isTagsExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Special View when 'chat' (잡담/노이즈 정제됨) is active */}
      {activeCategory === 'chat' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
              </span>
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  AI 잡담 필터링 &amp; 노이즈 정제 아카이브
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  오픈카톡방 1,420개 대화 중 1,392개(98.1%)의 일상 잡담과 인사가 안전하게 걸러졌습니다.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-xs font-black">
              잡담 98.1% 차단
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOCK_NOISE_BLOCKS.map((block) => (
              <div
                key={block.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {block.title}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {block.count}개 정제됨
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  <span>{block.timeRange}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">정제된 대화 샘플:</span>
                  {block.sampleItems.map((sample, sIdx) => (
                    <p key={sIdx} className="text-xs text-slate-600 dark:text-slate-300 italic truncate">
                      "{sample}"
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
              <span>잡담으로 분류된 대화는 핵심 요약에서 제외되지만 원문 대화 탭에서 전체 확인 가능합니다.</span>
            </span>
            <button
              type="button"
              onClick={() => onSwitchTab('chat')}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0 flex items-center gap-0.5 ml-2"
            >
              <span>원문 전체 보기</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Filtered Core Discussions List */}
      <div className="space-y-3.5">
        {filteredDiscussions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-400">filter_alt_off</span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              선택한 카테고리 또는 태그에 해당하는 토론이 없습니다.
            </h4>
            <p className="text-xs text-slate-500">
              필터 조건을 변경하거나 초기화해 보세요.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSelectedTag(null);
                setOnlyUserTags(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#006C49] text-white text-xs font-bold hover:bg-[#005236]"
            >
              모든 필터 초기화
            </button>
          </div>
        ) : (
          filteredDiscussions.map((item) => (
            <article
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md flex flex-col gap-3.5"
            >
              {/* Card Meta Top: Category Badge, Nature Badge, Time, Participants */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006C49] dark:bg-emerald-400" />
                    <span>{item.categoryName}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#006C49] dark:text-emerald-400">
                      psychology
                    </span>
                    <span>AI 성격: {item.natureLabel}</span>
                  </span>

                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {item.timeRange}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px] text-[#006C49] dark:text-emerald-400">
                      groups
                    </span>
                    <span>참여 {item.participantsCount}명</span>
                  </span>
                  {item.agreeRate && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#006C49] dark:text-emerald-300 font-bold text-[11px]">
                      공감 {item.agreeRate}%
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* 3-Point Bullets */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 border border-[#E3E8F5] dark:border-slate-700/80">
                {item.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between gap-2 ${
                      idx > 0 ? 'pt-2 border-t border-slate-200/50 dark:border-slate-700/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#ADEDD3] dark:bg-emerald-900 text-[#005236] dark:text-emerald-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#161C25] dark:text-slate-200 leading-relaxed">
                        <strong className="font-bold text-[#006C49] dark:text-emerald-400 mr-1">
                          {bullet.label}:
                        </strong>
                        {bullet.text}
                      </p>
                    </div>

                    {bullet.factCheckBubbleId && (
                      <button
                        type="button"
                        onClick={() => onNavigateToFactCheck(bullet.factCheckBubbleId!)}
                        className="text-[11px] text-[#006C49] dark:text-emerald-400 font-bold shrink-0 hover:underline flex items-center gap-0.5 pt-0.5"
                        title="원문 발언으로 이동하여 팩트체크"
                      >
                        <span>원문</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Code Snippet Box (if available) */}
              {item.codeSnippet && (
                <div className="p-3 rounded-2xl bg-[#161C25] dark:bg-black text-white font-mono text-xs leading-relaxed relative overflow-hidden border dark:border-slate-800">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-slate-300 font-sans">{item.codeDesc || '코드 패턴'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(item.codeSnippet!, item.codeDesc)}
                      className="text-[#4EDEA3] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                      <span>복사</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] font-mono text-slate-100 py-0.5">
                    <code>{item.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Tag System Row: AI Tags + User Tags + Add Tag Button */}
              <div className="pt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[15px] text-[#006C49] dark:text-emerald-400">
                      sell
                    </span>
                    <span>토론 태그</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (addingTagItemId === item.id) {
                          setAddingTagItemId(null);
                          setNewTagInput('');
                        } else {
                          setAddingTagItemId(item.id);
                          setNewTagInput('');
                        }
                      }}
                      className="text-xs text-[#006C49] dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {addingTagItemId === item.id ? 'close' : 'add'}
                      </span>
                      <span>{addingTagItemId === item.id ? '취소' : '+ 태그 달기'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTagManagerOpen(true)}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">tune</span>
                      <span>태그 관리</span>
                    </button>
                  </div>
                </div>

                {/* Inline Tag Adding Input */}
                {addingTagItemId === item.id && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center gap-2 animate-[fadeIn_0.15s_ease-out]">
                    <span className="text-xs font-bold text-slate-400 pl-1">#</span>
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInlineAddTag(item.id);
                        }
                      }}
                      placeholder="추가할 태그명 입력 (예: 월요일리뷰, 팀공유)"
                      className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineAddTag(item.id)}
                      className="px-3 py-1 rounded-lg bg-[#006C49] text-white text-xs font-bold hover:bg-[#005236] transition-colors"
                    >
                      추가
                    </button>
                  </div>
                )}

                {/* Tags Badges (AI tags + User tags) - Clean card layout */}
                {(() => {
                  const combinedCardTags = [
                    ...item.userTags.map((t) => ({ tag: t, isUser: true })),
                    ...item.aiTags.map((t) => ({ tag: t, isUser: false })),
                  ];
                  const isCardExpanded = Boolean(expandedCardTagIds[item.id]);
                  const displayedTags = isCardExpanded ? combinedCardTags : combinedCardTags.slice(0, 4);
                  const remainingCount = combinedCardTags.length - 4;

                  return (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayedTags.map(({ tag, isUser }) => {
                        const isSelected = selectedTag === tag;
                        if (isUser) {
                          return (
                            <span
                              key={tag}
                              onClick={() => setSelectedTag(isSelected ? null : tag)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-purple-600 text-white font-bold ring-1 ring-purple-400 shadow-xs'
                                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                              }`}
                              title="사용자 커스텀 태그 (클릭 시 필터)"
                            >
                              <span className="material-symbols-outlined text-[11px] opacity-80">person</span>
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveTagFromCard(item.id, tag, e)}
                                className="hover:text-red-500 transition-colors ml-0.5"
                                title="태그 삭제"
                              >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </span>
                          );
                        }

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(isSelected ? null : tag)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-[#10B981] text-white font-bold ring-1 ring-emerald-500 shadow-xs'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006C49] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100'
                            }`}
                            title="AI 자동 감지 태그 (클릭 시 필터)"
                          >
                            <span className="material-symbols-outlined text-[11px] opacity-70">auto_awesome</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}

                      {/* Card Tag Overflow Toggle */}
                      {remainingCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => toggleCardTagExpand(item.id, e)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200/60 dark:border-slate-700 transition-colors"
                          title={isCardExpanded ? '태그 접기' : `태그 ${remainingCount}개 더보기`}
                        >
                          {isCardExpanded ? '접기' : `+${remainingCount}`}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Card Footer: Jump to Fact-Check & Chat Timeline */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSwitchTab('chat')}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#006C49] dark:hover:text-emerald-400 font-semibold flex items-center gap-0.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">forum</span>
                  <span>단톡방 대화 맥락 보기</span>
                </button>

                {item.factCheckBubbleId && (
                  <button
                    type="button"
                    onClick={() => onNavigateToFactCheck(item.factCheckBubbleId!)}
                    className="text-xs font-bold text-[#006C49] dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
                  >
                    <span>원문 팩트체크</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
