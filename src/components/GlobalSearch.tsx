import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  INITIAL_ROOMS,
  INITIAL_CORE_DISCUSSIONS,
  MOCK_DISCUSSIONS,
  CURATED_TOPICS,
  MOCK_RESOURCES,
} from '../data/mockData';
import { MainNavTab, RoomSubTab } from '../types';

interface GlobalSearchProps {
  activeNav?: MainNavTab;
  currentSubTab?: RoomSubTab;
  onNavigateToRoom: (tab?: RoomSubTab, bubbleId?: string) => void;
  onNavigateToNav: (nav: MainNavTab) => void;
  onShowToast: (message: string, icon?: string) => void;
  isDarkMode?: boolean;
}

export type SearchFilterCategory = 'all' | 'summary' | 'chat' | 'resource' | 'room';

interface SearchResultItem {
  id: string;
  type: 'summary' | 'chat' | 'resource' | 'room' | 'curation';
  categoryLabel: string;
  badgeColor: string;
  icon: string;
  title: string;
  subtitle: string;
  targetNav: MainNavTab;
  targetSubTab?: RoomSubTab;
  bubbleId?: string;
  tags?: string[];
  relevanceScore: number;
  isPriorityMatch?: boolean;
  author?: string;
  roleBadge?: string;
  time?: string;
  snippet?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  activeNav = 'rooms',
  currentSubTab = 'summary',
  onNavigateToRoom,
  onNavigateToNav,
  onShowToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<SearchFilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, or / to open; Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedFilter('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Helper: compute relevance score with active-tab contextual weight
  const computeItemScore = (
    title: string,
    subtitle: string,
    body: string,
    tags: string[],
    itemType: 'summary' | 'chat' | 'resource' | 'room' | 'curation',
    trimmed: string
  ): { score: number; isPriority: boolean } => {
    let score = 0;
    const lowerTitle = title.toLowerCase();
    const lowerSub = subtitle.toLowerCase();
    const lowerBody = body.toLowerCase();

    // 1. Exact match / prefix boost
    if (lowerTitle.startsWith(trimmed)) {
      score += 130;
    } else if (lowerTitle.includes(trimmed)) {
      score += 80;
    }

    // 2. Tag match
    if (tags.some((t) => t.toLowerCase() === trimmed)) {
      score += 70;
    } else if (tags.some((t) => t.toLowerCase().includes(trimmed))) {
      score += 50;
    }

    // 3. Subtitle / Summary match
    if (lowerSub.includes(trimmed)) {
      score += 40;
    }

    // 4. Body / content match
    if (lowerBody.includes(trimmed)) {
      score += 25;
    }

    // 5. Context-Aware Priority Weight (Based on currently active tab!)
    // When viewing 'summary' tab -> summary items are boosted to the top
    // When viewing 'chat' tab -> direct conversation bubbles are boosted to the top
    // When viewing 'resources' tab -> architecture diagrams and links are boosted to the top
    let isPriority = false;
    if (activeNav === 'rooms') {
      if (currentSubTab === 'summary' && itemType === 'summary') {
        score += 150;
        isPriority = true;
      } else if (currentSubTab === 'chat' && itemType === 'chat') {
        score += 150;
        isPriority = true;
      } else if (currentSubTab === 'resources' && itemType === 'resource') {
        score += 150;
        isPriority = true;
      }
    } else if (activeNav === 'curation' && itemType === 'curation') {
      score += 150;
      isPriority = true;
    }

    return { score, isPriority };
  };

  // Compute all matched items with contextual weighting
  const allResults = useMemo<SearchResultItem[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const items: SearchResultItem[] = [];

    // 1. Core Summarized Discussions (Type: 'summary')
    INITIAL_CORE_DISCUSSIONS.forEach((disc) => {
      const combinedTags = [...disc.aiTags, ...disc.userTags];
      const bulletsText = disc.bullets.map((b) => b.text).join(' ');
      const match =
        disc.title.toLowerCase().includes(trimmed) ||
        disc.summary.toLowerCase().includes(trimmed) ||
        bulletsText.toLowerCase().includes(trimmed) ||
        combinedTags.some((t) => t.toLowerCase().includes(trimmed));

      if (match) {
        const { score, isPriority } = computeItemScore(
          disc.title,
          disc.summary,
          bulletsText,
          combinedTags,
          'summary',
          trimmed
        );

        items.push({
          id: `disc-${disc.id}`,
          type: 'summary',
          categoryLabel: disc.natureLabel || '토론요약',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: 'auto_awesome',
          title: disc.title,
          subtitle: disc.summary,
          targetNav: 'rooms',
          targetSubTab: 'summary',
          bubbleId: disc.factCheckBubbleId,
          tags: combinedTags,
          relevanceScore: score,
          isPriorityMatch: isPriority,
        });
      }
    });

    // 2. Chat Timeline Direct Bubbles (Type: 'chat')
    MOCK_DISCUSSIONS.forEach((bubble) => {
      const match =
        bubble.content.toLowerCase().includes(trimmed) ||
        bubble.author.toLowerCase().includes(trimmed) ||
        bubble.roleBadge.toLowerCase().includes(trimmed) ||
        (bubble.codeDescription && bubble.codeDescription.toLowerCase().includes(trimmed)) ||
        (bubble.attachedDiagramTitle && bubble.attachedDiagramTitle.toLowerCase().includes(trimmed));

      if (match) {
        const { score, isPriority } = computeItemScore(
          `${bubble.author} (${bubble.roleBadge})`,
          bubble.content.slice(0, 60),
          bubble.content,
          [bubble.roleBadge, bubble.author],
          'chat',
          trimmed
        );

        items.push({
          id: `chat-${bubble.id}`,
          type: 'chat',
          categoryLabel: '타임라인 발화',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
          icon: 'chat_bubble',
          title: `[${bubble.roleBadge}] ${bubble.author}: "${bubble.content.slice(0, 38)}..."`,
          subtitle: bubble.content,
          targetNav: 'rooms',
          targetSubTab: 'chat',
          bubbleId: bubble.id,
          author: bubble.author,
          roleBadge: bubble.roleBadge,
          time: bubble.time,
          tags: [bubble.roleBadge, bubble.time],
          relevanceScore: score,
          isPriorityMatch: isPriority,
        });
      }
    });

    // 3. Shared Resources, Diagrams & External Repos (Type: 'resource')
    MOCK_RESOURCES.forEach((res) => {
      const summaryText = res.aiSummary.join(' ');
      const match =
        res.title.toLowerCase().includes(trimmed) ||
        res.subtitle.toLowerCase().includes(trimmed) ||
        summaryText.toLowerCase().includes(trimmed) ||
        (res.domain && res.domain.toLowerCase().includes(trimmed));

      if (match) {
        const { score, isPriority } = computeItemScore(
          res.title,
          res.subtitle,
          summaryText,
          res.aiSummary,
          'resource',
          trimmed
        );

        items.push({
          id: `res-${res.id}`,
          type: 'resource',
          categoryLabel: res.type === 'media' ? '아키텍처 자료' : '링크 자료',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          icon: res.type === 'media' ? 'schema' : 'link',
          title: res.title,
          subtitle: res.subtitle,
          targetNav: 'rooms',
          targetSubTab: 'resources',
          tags: res.aiSummary.slice(0, 2),
          relevanceScore: score,
          isPriorityMatch: isPriority,
        });
      }
    });

    // 4. Chat Rooms (Type: 'room')
    INITIAL_ROOMS.forEach((room) => {
      const match =
        room.name.toLowerCase().includes(trimmed) ||
        room.category.toLowerCase().includes(trimmed) ||
        room.tags.some((t) => t.toLowerCase().includes(trimmed));

      if (match) {
        const { score, isPriority } = computeItemScore(
          room.name,
          room.category,
          room.tags.join(' '),
          room.tags,
          'room',
          trimmed
        );

        items.push({
          id: `room-${room.id}`,
          type: 'room',
          categoryLabel: '오픈채팅방',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: room.icon || 'forum',
          title: room.name,
          subtitle: `${room.category} · 멤버 ${room.memberCount}명 · 잡담 ${room.filteredNoiseCount}건 정제`,
          targetNav: 'rooms',
          targetSubTab: 'summary',
          tags: room.tags,
          relevanceScore: score,
          isPriorityMatch: isPriority,
        });
      }
    });

    // 5. Curated Topics (Type: 'curation')
    CURATED_TOPICS.forEach((topic) => {
      const match =
        topic.title.toLowerCase().includes(trimmed) ||
        topic.description.toLowerCase().includes(trimmed) ||
        topic.roomName.toLowerCase().includes(trimmed) ||
        topic.tags.some((t) => t.toLowerCase().includes(trimmed));

      if (match) {
        const { score, isPriority } = computeItemScore(
          topic.title,
          topic.description,
          topic.tags.join(' '),
          topic.tags,
          'curation',
          trimmed
        );

        items.push({
          id: `topic-${topic.id}`,
          type: 'curation',
          categoryLabel: '추천토픽',
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
          icon: 'explore',
          title: topic.title,
          subtitle: `${topic.roomName} · 신뢰도 ${topic.confidenceScore}%`,
          targetNav: 'curation',
          tags: topic.tags,
          relevanceScore: score,
          isPriorityMatch: isPriority,
        });
      }
    });

    // Sort strictly by relevanceScore descending
    return items.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [query, activeNav, currentSubTab]);

  // Filter items by user-selected sub-category
  const filteredResults = useMemo(() => {
    if (selectedFilter === 'all') return allResults;
    return allResults.filter((item) => item.type === selectedFilter);
  }, [allResults, selectedFilter]);

  // Category counts for tab bar
  const counts = useMemo(() => {
    const map = {
      all: allResults.length,
      summary: allResults.filter((i) => i.type === 'summary').length,
      chat: allResults.filter((i) => i.type === 'chat').length,
      resource: allResults.filter((i) => i.type === 'resource').length,
      room: allResults.filter((i) => i.type === 'room').length,
    };
    return map;
  }, [allResults]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.targetNav === 'rooms') {
      onNavigateToRoom(item.targetSubTab || 'summary', item.bubbleId);
    } else {
      onNavigateToNav(item.targetNav);
    }

    const contextPrefix =
      item.type === 'chat'
        ? `💬 [${item.author || '타임라인 발화'}]`
        : item.type === 'resource'
        ? '📁 [자료/링크]'
        : item.type === 'room'
        ? '🏠 [오픈채팅방]'
        : '💡 [토론요약]';

    onShowToast(
      `${contextPrefix} '${item.title.slice(0, 24)}...' 항목으로 즉시 이동했습니다.`,
      item.type === 'chat' ? 'chat' : item.type === 'resource' ? 'attachment' : 'search'
    );

    setIsOpen(false);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  const popularKeywords = ['Next 15', 'Redis 분산 락', '서버 액션', '토스 피그마', '캐시 스탬피드', 'FE 실무'];

  // Current Active Tab Context Description
  const currentContextLabel = useMemo(() => {
    if (activeNav === 'rooms') {
      if (currentSubTab === 'summary') {
        return {
          title: '현재 [요약 탭] 조회 중',
          desc: '핵심 요약 토론 및 결론 아젠다가 최상단에 우선 정렬됩니다.',
          badge: '요약 우선 모드',
          badgeColor: 'bg-emerald-500 text-white',
        };
      }
      if (currentSubTab === 'chat') {
        return {
          title: '현재 [채팅 타임라인 탭] 조회 중',
          desc: '현업자 실제 대화 발언 및 질문/답변 버블이 최상단에 우선 정렬됩니다.',
          badge: '타임라인 우선 모드',
          badgeColor: 'bg-blue-500 text-white',
        };
      }
      if (currentSubTab === 'resources') {
        return {
          title: '현재 [리소스 탭] 조회 중',
          desc: '아키텍처 구조도, 벤치마크 그래프 및 깃허브 링크가 최상단에 우선 정렬됩니다.',
          badge: '리소스 우선 모드',
          badgeColor: 'bg-amber-500 text-white',
        };
      }
    }
    return {
      title: '스마트 다차원 검색',
      desc: '채팅방, 요약문, 원문 대화, 공유 자료를 통합 검색합니다.',
      badge: '통합 검색',
      badgeColor: 'bg-slate-700 text-white',
    };
  }, [activeNav, currentSubTab]);

  return (
    <div ref={containerRef} className="relative">
      {/* 1. Header Trigger: Desktop Search Bar */}
      <div className="hidden md:flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all duration-150 active:scale-98 shadow-xs cursor-pointer group w-44 lg:w-60 xl:w-72 justify-between"
          aria-label="채팅방 및 요약 키워드 검색"
          title={`글로벌 검색 (${currentContextLabel.title})`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-slate-400 group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors">
              search
            </span>
            <span className="truncate group-hover:text-slate-700 dark:group-hover:text-slate-200">
              {currentSubTab === 'chat'
                ? '타임라인 발화 검색...'
                : currentSubTab === 'resources'
                ? '자료·아키텍처 검색...'
                : '채팅방·요약 키워드 검색...'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentSubTab === 'summary'
                  ? 'bg-emerald-500'
                  : currentSubTab === 'chat'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              title={currentContextLabel.badge}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* 2. Header Trigger: Mobile Search Icon Button */}
      <div className="flex md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-xs cursor-pointer"
          aria-label="글로벌 검색 열기"
          title="채팅방 및 요약 검색 (⌘K)"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span
            className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
              currentSubTab === 'summary'
                ? 'bg-emerald-500'
                : currentSubTab === 'chat'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            } ring-2 ring-white dark:ring-slate-900`}
          />
        </button>
      </div>

      {/* 3. Dropdown / Modal Palette */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 md:hidden animate-[fadeIn_0.15s_ease-out]"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed md:absolute top-16 md:top-full right-4 md:right-0 left-4 md:left-auto md:w-[520px] lg:w-[620px] z-50 mt-1 md:mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] md:max-h-[580px] transition-all animate-[slideDown_0.18s_cubic-bezier(0.16,1,0.3,1)]"
            role="dialog"
            aria-modal="true"
          >
            {/* Context Prioritization Banner */}
            <div className="px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${currentContextLabel.badgeColor}`}>
                  {currentContextLabel.badge}
                </span>
                <span className="font-semibold text-slate-200 text-[11px] truncate">
                  {currentContextLabel.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                선택된 탭에 맞춰 가중치 우선 정렬 적용 중
              </span>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[22px]">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInInput}
                placeholder={
                  currentSubTab === 'chat'
                    ? '발화자, 대화 내용, 팩트체크 질문 검색 (예: 테크리드, 커넥션 풀...)'
                    : currentSubTab === 'resources'
                    ? '아키텍처 다이어그램, 오픈소스 레포, 벤치마크 검색...'
                    : '토론 요약문, 핵심 아젠다, 기술 키워드 (예: Next 15, Redis...)'
                }
                className="flex-1 bg-transparent border-0 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
              >
                닫기 <kbd className="hidden sm:inline text-[10px] opacity-70">ESC</kbd>
              </button>
            </div>

            {/* Dynamic Filter Tab Bar */}
            {query.trim() && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    selectedFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>전체 (스마트 순위)</span>
                  <span className="text-[10px] opacity-75">({counts.all})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter('summary')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    selectedFilter === 'summary'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>💡 요약 토론</span>
                  <span className="text-[10px] opacity-75">({counts.summary})</span>
                  {currentSubTab === 'summary' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" title="현재 탭" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter('chat')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    selectedFilter === 'chat'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>💬 채팅 발화</span>
                  <span className="text-[10px] opacity-75">({counts.chat})</span>
                  {currentSubTab === 'chat' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300" title="현재 탭" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter('resource')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    selectedFilter === 'resource'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>📁 리소스</span>
                  <span className="text-[10px] opacity-75">({counts.resource})</span>
                  {currentSubTab === 'resources' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" title="현재 탭" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter('room')}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    selectedFilter === 'room'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>🏠 오픈채팅방</span>
                  <span className="text-[10px] opacity-75">({counts.room})</span>
                </button>
              </div>
            )}

            {/* Quick Suggestions when Query is Empty */}
            {!query.trim() && (
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="material-symbols-outlined text-[16px] text-[#006C49] dark:text-emerald-400">
                      tune
                    </span>
                    <span>탭 기반 지능형 우선순위 안내</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    현재 머물고 계신 <strong className="text-slate-700 dark:text-slate-200">[{currentContextLabel.title}]</strong>에 따라 관련된 검색 결과(요약문, 원문 발언, 다이어그램)가 가중치를 받아 상단에 배치됩니다.
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                    <span>실시간 인기 검색 토픽</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          setQuery(kw);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#ADEDD3]/40 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 transition-colors active:scale-95 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px] text-[#006C49] dark:text-emerald-400">
                          trending_up
                        </span>
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results List */}
            {query.trim() && (
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`pt-2.5 pb-2.5 px-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 relative ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800/90 ring-1 ring-[#006C49]/40 dark:ring-emerald-500/50 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        } ${
                          item.isPriorityMatch
                            ? 'border-l-4 border-l-[#006C49] dark:border-l-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10'
                            : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#006C49] dark:text-emerald-400 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">
                            {item.icon}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                            >
                              {item.categoryLabel}
                            </span>

                            {item.isPriorityMatch && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#006C49] text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-0.5 shadow-2xs">
                                <span className="material-symbols-outlined text-[10px]">bolt</span>
                                <span>현재 탭 맞춤 우선</span>
                              </span>
                            )}

                            {item.time && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.time}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.subtitle}
                          </p>

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.tags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] text-[#006C49] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 self-center">
                          <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[36px]">
                      search_off
                    </span>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      &apos;{query}&apos;에 대한 검색 결과가 없습니다.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      상단 카테고리 필터를 &apos;전체&apos;로 변경하거나 다른 키워드(예: Next 15, Redis, 카카오)로 검색해 보세요.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Footer Info */}
            <div className="p-2.5 sm:px-4 sm:py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">
                {filteredResults.length > 0
                  ? `검색 결과 ${filteredResults.length}건 (가중치 순)`
                  : '검색어를 입력하세요'}
              </span>
              <div className="flex items-center gap-3 ml-auto text-[10px]">
                <span className="hidden sm:inline">↑↓ 이동</span>
                <span className="hidden sm:inline">↵ 선택</span>
                <span>ESC 닫기</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
