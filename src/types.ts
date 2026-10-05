/**
 * ==============================================================================
 * 오카방가방가 (Okabang) - Global TypeScript Type Definitions
 * ==============================================================================
 * 오픈카톡 요약, 노이즈 필터링, 팩트체크 타임라인, 리소스 및 사용자 설정 타입
 * ==============================================================================
 */

export type MainNavTab = 'home' | 'rooms' | 'curation' | 'saved' | 'my';
export type RoomSubTab = 'summary' | 'chat' | 'resources';
export type ResourceFilterType = 'all' | 'link' | 'media';
export type TopicFilterType = 'all' | 'tech' | 'career' | 'links';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CategoryNotificationConfig {
  tech: boolean; // 기술/개발
  trouble: boolean; // 실무/트러블슈팅
  issue: boolean; // 시사/업계동향
  suppressNoise: boolean; // 잡담 알림 100% 차단
  customTagsOnly: boolean; // 내 등록 커스텀 태그 매칭 시 즉시 알림
  highConfidenceOnly: boolean; // 신뢰도 90% 이상 핵심 요약만
  deliveryMode: 'instant' | 'digest'; // 실시간 즉시 푸시 vs 퇴근길 묶음 발송
}

export type DiscussionCategoryKey = 'all' | 'tech' | 'trouble' | 'issue' | 'chat';

export interface UserCustomTag {
  id: string;
  name: string; // e.g. '#필독아티클'
  color: 'purple' | 'amber' | 'emerald' | 'blue' | 'rose' | 'indigo';
  createdAt?: string;
  count?: number;
}

export interface CoreDiscussionItem {
  id: string;
  categoryName: string; // '기술/개발', '실무/트러블슈팅', '시사/업계동향', '잡담/노이즈'
  categoryKey: DiscussionCategoryKey;
  natureType: 'tech' | 'trouble' | 'issue' | 'chat'; // 토론의 성격 (AI 자동 분류)
  natureLabel: string; // '기술', '트러블슈팅', '시사동향', '잡담정제'
  title: string;
  summary: string;
  bullets: {
    label: string;
    text: string;
    factCheckBubbleId?: string;
  }[];
  timeRange: string;
  participantsCount: number;
  agreeRate?: number;
  aiTags: string[]; // 성격 기반 AI 자동 라벨링 태그
  userTags: string[]; // 사용자 커스텀 추가 태그
  codeSnippet?: string;
  codeLanguage?: string;
  codeDesc?: string;
  factCheckBubbleId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  filteredNoiseCount: number;
  unreadCount: number;
  statusText: string;
  icon: string;
  isVerified?: boolean;
  notificationEnabled: boolean;
  tags: string[];
}

export interface CuratedTopic {
  id: string;
  roomName: string;
  roomCategory: string;
  title: string;
  description: string;
  confidenceScore: number;
  image: string;
  tags: string[];
  referenceCount: number;
  cleanedCount: number;
}

export interface ResourceItem {
  id: string;
  type: 'link' | 'media';
  categoryBadge: string;
  title: string;
  subtitle: string;
  domain?: string;
  path?: string;
  url?: string;
  clicksCount: number;
  bookmarksCount: number;
  starsCount?: number;
  badgeLabel?: string;
  time?: string;
  authorName?: string;
  authorRole?: string;
  imageUrl?: string;
  aiSummary: string[];
  isPopular?: boolean;
}

export interface DiscussionBubble {
  id: string;
  author: string;
  roleBadge: string;
  roleType: 'question' | 'senior' | 'solution';
  avatarChar: string;
  avatarBg: string;
  time: string;
  content: string;
  likes: number;
  replies?: number;
  isBestAnswer?: boolean;
  codeSnippet?: string;
  codeDescription?: string;
  attachedDiagramUrl?: string;
  attachedDiagramTitle?: string;
  externalLink?: {
    title: string;
    url: string;
    desc: string;
  };
}

export interface NoiseBlock {
  id: string;
  title: string;
  count: number;
  timeRange: string;
  sampleItems: string[];
}

export interface SavedItem {
  id: string;
  title: string;
  roomName: string;
  savedAt: string;
  type: 'summary' | 'resource' | 'code';
  contentSnippet: string;
}
