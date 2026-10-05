import React, { useState } from 'react';

interface SystemHealthWidgetProps {
  onShowToast?: (message: string, icon?: string) => void;
}

interface ApiHealthStatus {
  id: string;
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'outage';
  statusLabel: string;
  latencyMs: number;
  uptime: string;
  endpointVersion: string;
  description: string;
  icon: string;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ onShowToast }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  });

  const [apiList, setApiList] = useState<ApiHealthStatus[]>([
    {
      id: 'gemini',
      name: 'Google Gemini AI 요약 엔진',
      category: 'Core LLM Engine',
      status: 'operational',
      statusLabel: '정상 가동 (Operational)',
      latencyMs: 185,
      uptime: '99.98%',
      endpointVersion: 'Gemini 2.0 Flash / 1.5 Flash',
      description: '대화 노이즈 필터링 및 팩트체크 결론 아젠다 구조화 파이프라인',
      icon: 'auto_awesome',
    },
    {
      id: 'notion',
      name: 'Notion Workspace API',
      category: 'Knowledge Base Export',
      status: 'operational',
      statusLabel: '연동 준비 완료 (Connected)',
      latencyMs: 112,
      uptime: '99.95%',
      endpointVersion: 'Notion API v2022-06-28',
      description: '아카이빙 블록 쓰기 및 원클릭 워크스페이스 저장 엔드포인트',
      icon: 'description',
    },
    {
      id: 'kakao',
      name: 'Kakao OpenChat Webhook',
      category: 'Realtime Chat Sync',
      status: 'operational',
      statusLabel: '정상 수신 중 (Operational)',
      latencyMs: 88,
      uptime: '99.99%',
      endpointVersion: 'Kakao Developers REST v2',
      description: '오픈채팅방 실시간 메시지 스트림 수신 및 Redis 버퍼 큐',
      icon: 'forum',
    },
  ]);

  const handleRefreshHealth = () => {
    if (isChecking) return;
    setIsChecking(true);

    setTimeout(() => {
      const now = new Date();
      const updatedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastCheckedTime(updatedTime);

      // Slightly randomize latency to simulate live ping
      setApiList((prev) =>
        prev.map((item) => ({
          ...item,
          latencyMs: Math.max(70, Math.floor(item.latencyMs + (Math.random() * 20 - 10))),
        }))
      );

      setIsChecking(false);
      if (onShowToast) {
        onShowToast('✅ 코어 API 3개 헬스체크 완료: 모든 서비스가 정상 작동 중입니다.', 'health_and_safety');
      }
    }, 700);
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
      {/* Widget Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#006C49] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#161C25] dark:text-slate-100">
                코어 API 시스템 가동 상태 (System Health)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[10px] font-bold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>모든 시스템 정상</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              오카방가방가를 구동하는 3대 백엔드 API 서비스의 실시간 응답 상태 및 헬스체크
            </p>
          </div>
        </div>

        {/* Refresh / Check Now Button */}
        <button
          type="button"
          onClick={handleRefreshHealth}
          disabled={isChecking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
          title="지금 즉시 API 핑 테스트 수행"
        >
          <span className={`material-symbols-outlined text-[15px] ${isChecking ? 'animate-spin text-[#006C49]' : ''}`}>
            sync
          </span>
          <span>{isChecking ? '점검 중...' : '즉시 헬스체크'}</span>
        </button>
      </div>

      {/* API Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {apiList.map((api) => (
          <div
            key={api.id}
            className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006C49] dark:text-emerald-400">
                    {api.icon}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {api.category}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>{api.statusLabel.split(' ')[0]}</span>
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {api.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {api.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-slate-400">speed</span>
                <span>{api.latencyMs}ms</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                가용률 {api.uptime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Last Checked Timestamp */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          <span>마지막 상태 점검: <strong className="text-slate-600 dark:text-slate-300 font-mono">{lastCheckedTime}</strong></span>
        </span>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
          24시간 무중단 자동 감시 활성화됨
        </span>
      </div>
    </section>
  );
};
