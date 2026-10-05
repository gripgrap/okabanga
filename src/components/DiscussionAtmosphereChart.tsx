import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface SentimentDataPoint {
  time: string;
  constructive: number; // 0 - 100 (해결책, 기술 공유, 합의)
  intensity: number;    // 0 - 100 (논쟁 열기, 반론, 우려)
  noise: number;        // 0 - 100 (잡담, 인사 등 선제거 대상)
  eventTitle: string;
  author: string;
  stage: '의문 제기' | '열띤 반론' | '아키텍처 제안' | '실무 검증' | '최종 합의';
  bubbleId?: string;
}

const SENTIMENT_TIMELINE: SentimentDataPoint[] = [
  {
    time: '14:15',
    constructive: 42,
    intensity: 38,
    noise: 48,
    eventTitle: 'Next 15 Server Action 대규모 트래픽 도입 질문',
    author: 'FE 3년차 주니어',
    stage: '의문 제기',
    bubbleId: 'disc-1',
  },
  {
    time: '14:28',
    constructive: 28,
    intensity: 89,
    noise: 18,
    eventTitle: '동기 Node 점유로 인한 DB 커넥션 고갈 위험 경고',
    author: '네카라 테크리드',
    stage: '열띤 반론',
    bubbleId: 'disc-2',
  },
  {
    time: '14:42',
    constructive: 68,
    intensity: 72,
    noise: 10,
    eventTitle: 'Redis Debounce 락 래퍼 및 Kafka 격리 파이프라인 제시',
    author: '네카라 테크리드',
    stage: '아키텍처 제안',
    bubbleId: 'disc-2',
  },
  {
    time: '15:10',
    constructive: 86,
    intensity: 48,
    noise: 6,
    eventTitle: '블프 장애 해결사례 & Idempotency-Key 오픈소스 공유',
    author: '커머스 인프라 리드',
    stage: '실무 검증',
    bubbleId: 'disc-3',
  },
  {
    time: '15:35',
    constructive: 94,
    intensity: 22,
    noise: 4,
    eventTitle: '하이브리드(TanStack Query + Webhook) 운영 합의 및 투표',
    author: '오픈채팅 참여자 일동',
    stage: '최종 합의',
  },
];

interface DiscussionAtmosphereChartProps {
  isDarkMode?: boolean;
  onNavigateToFactCheck?: (bubbleId: string) => void;
}

export const DiscussionAtmosphereChart: React.FC<DiscussionAtmosphereChartProps> = ({
  isDarkMode = false,
  onNavigateToFactCheck,
}) => {
  const [filterView, setFilterView] = useState<'all' | 'constructive' | 'intensity'>('all');
  const [activePoint, setActivePoint] = useState<SentimentDataPoint | null>(SENTIMENT_TIMELINE[2]);

  return (
    <section className="p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors space-y-4">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006C49] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[19px] filled">monitoring</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100">
                  토론 분위기 및 감정 변화 시각화
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#005236] dark:text-emerald-300 text-[10px] font-extrabold">
                  Recharts AI 분석
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                대화 흐름에 따른 건설적 해결도 · 논쟁 열기 · 노이즈 비율의 시간대별 변화 추이
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterView === 'all'
                ? 'bg-white dark:bg-slate-700 text-[#006C49] dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            전체 추이
          </button>
          <button
            type="button"
            onClick={() => setFilterView('constructive')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterView === 'constructive'
                ? 'bg-white dark:bg-slate-700 text-[#006C49] dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            건설적 해결도
          </button>
          <button
            type="button"
            onClick={() => setFilterView('intensity')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterView === 'intensity'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            논쟁 열기
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">
            최종 합의/건설도
          </span>
          <span className="text-lg font-extrabold text-[#005236] dark:text-emerald-200 mt-0.5 block">
            94% <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400">(매우 높음)</span>
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
            최대 논쟁 피크
          </span>
          <span className="text-lg font-extrabold text-amber-800 dark:text-amber-200 mt-0.5 block">
            14:28 <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(DB 병목 논쟁)</span>
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
          <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold block">
            전환 포인트
          </span>
          <span className="text-lg font-extrabold text-blue-800 dark:text-blue-200 mt-0.5 block">
            14:42 <span className="text-[10px] font-normal text-blue-700 dark:text-blue-400">(분산락 제안)</span>
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">
            토론 참여자 공감률
          </span>
          <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
            89% <span className="text-[10px] font-normal text-slate-500">(72명 지지)</span>
          </span>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="w-full h-56 sm:h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={SENTIMENT_TIMELINE}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const point = state.activePayload[0].payload as SentimentDataPoint;
                setActivePoint(point);
              }
            }}
          >
            <defs>
              {/* Constructive Emerald Gradient */}
              <linearGradient id="colorConstructive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006C49" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#006C49" stopOpacity={0.0} />
              </linearGradient>

              {/* Intensity Amber Gradient */}
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>

              {/* Noise Slate Gradient */}
              <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDarkMode ? '#334155' : '#E2E8F0'}
            />

            <XAxis
              dataKey="time"
              tickLine={false}
              stroke={isDarkMode ? '#64748B' : '#94A3B8'}
              fontSize={11}
              fontWeight={600}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              stroke={isDarkMode ? '#64748B' : '#94A3B8'}
              fontSize={10}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as SentimentDataPoint;
                  return (
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1.5 min-w-[210px] animate-[fadeIn_0.15s_ease-out]">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="font-extrabold text-[#006C49] dark:text-emerald-400">
                          {data.time} ({data.stage})
                        </span>
                        <span className="text-[10px] text-slate-400">{data.author}</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {data.eventTitle}
                      </p>
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          💡 건설도: {data.constructive}%
                        </span>
                        <span className="text-amber-700 dark:text-amber-300 font-semibold">
                          ⚡ 논쟁열기: {data.intensity}%
                        </span>
                        <span className="text-slate-500 font-medium">
                          🔇 잡담비율: {data.noise}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {(filterView === 'all' || filterView === 'constructive') && (
              <Area
                type="monotone"
                dataKey="constructive"
                name="건설적 해결도"
                stroke="#006C49"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorConstructive)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            )}

            {(filterView === 'all' || filterView === 'intensity') && (
              <Area
                type="monotone"
                dataKey="intensity"
                name="논쟁 열기"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIntensity)"
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
              />
            )}

            {filterView === 'all' && (
              <Area
                type="monotone"
                dataKey="noise"
                name="잡담/노이즈"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorNoise)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Active Timestamp Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3.5 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006C49]" />
            <span>건설적 해결도</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>논쟁 열기</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2.5 h-0.5 bg-slate-400 border-dashed" />
            <span>노이즈/잡담</span>
          </span>
        </div>

        {activePoint && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-[#006C49] dark:text-emerald-400 shrink-0">
              선택 시점 ({activePoint.time}):
            </span>
            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[260px]">
              {activePoint.eventTitle}
            </span>
            {activePoint.bubbleId && onNavigateToFactCheck && (
              <button
                type="button"
                onClick={() => onNavigateToFactCheck(activePoint.bubbleId!)}
                className="text-[10px] font-bold text-[#006C49] dark:text-emerald-300 hover:underline shrink-0 flex items-center"
              >
                <span>발언 확인</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
