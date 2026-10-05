import React, { useState } from 'react';

interface KakaoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (connectedCount: number, syncMethod: string) => void;
}

export const KakaoSyncModal: React.FC<KakaoSyncModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Sync Method Tab: 'notification' vs 'export_file' vs 'custom_api'
  const [syncMethod, setSyncMethod] = useState<'notification' | 'export_file' | 'custom_api'>('notification');
  const [showComparison, setShowComparison] = useState<boolean>(true);

  // States for Method 1: Notification Listener
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'room-fe',
    'room-pm',
    'room-networking',
  ]);
  const [eveningBriefing, setEveningBriefing] = useState(true);
  const [hotTopics, setHotTopics] = useState(true);

  // States for Method 2: Text Export
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // States for Method 3: Custom API
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl] = useState('https://api.okabang.io/v1/webhook/openchat-sync');
  const [isApiKeyVerified, setIsApiKeyVerified] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);
  const [isCopiedWebhook, setIsCopiedWebhook] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleRoom = (roomId: string) => {
    setInlineError(null);
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleToggleAll = () => {
    setInlineError(null);
    if (selectedRooms.length === 3) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(['room-fe', 'room-pm', 'room-networking']);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInlineError(null);
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  // Real-time API Key Format Validation
  const validateApiKey = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return {
        status: 'empty' as const,
        title: 'API Key 입력 필요',
        message: "카카오 오픈빌더 관리자 센터에서 발급받은 'kakao_ob_live_' 형식의 키를 입력해 주세요.",
        detail: '최소 24자 이상의 영문, 숫자, 특수기호(-, _) 조합',
      };
    }
    if (!trimmed.startsWith('kakao_ob_live_')) {
      return {
        status: 'invalid' as const,
        title: '접두사 불일치 오류',
        message: "⚠️ API 키는 반드시 'kakao_ob_live_'로 시작해야 합니다. 발급 형식을 확인해 주세요.",
        detail: '오픈빌더 라이브 환경 키만 연동 가능합니다.',
      };
    }
    if (trimmed.length < 24) {
      return {
        status: 'invalid' as const,
        title: '키 길이 부족 경고',
        message: `⚠️ API 키 길이가 부족합니다. (현재 ${trimmed.length}자 / 최소 24자 이상 필요)`,
        detail: `${24 - trimmed.length}자를 더 입력해야 유효합니다.`,
      };
    }
    if (!/^kakao_ob_live_[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        status: 'invalid' as const,
        title: '허용되지 않는 문자 감지',
        message: '⚠️ 공백이나 특수기호는 밑줄(_)과 하이픈(-)만 포함되어야 합니다.',
        detail: '공백 또는 특수문자를 제거해 주세요.',
      };
    }
    return {
      status: 'valid' as const,
      title: '유효한 키 형식',
      message: '✓ 올바른 카카오 비즈니스 오픈빌더 라이브 API Key 형식입니다. 웹훅 연결 검증이 가능합니다.',
      detail: '인증 서버 통신 준비 완료',
    };
  };

  const keyValidation = validateApiKey(apiKey);

  const handleVerifyApiKey = () => {
    setInlineError(null);
    setVerifySuccessMsg(null);
    if (keyValidation.status !== 'valid') {
      setInlineError(keyValidation.message);
      return;
    }
    setIsVerifyingKey(true);
    setTimeout(() => {
      setIsVerifyingKey(false);
      setIsApiKeyVerified(true);
      setVerifySuccessMsg('카카오 비즈니스 웹훅 엔드포인트 연결 검증에 성공했습니다! (응답 시간: 28ms, HTTP 200 OK)');
    }, 650);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setIsCopiedWebhook(true);
    setTimeout(() => {
      setIsCopiedWebhook(false);
    }, 2000);
  };

  const handleStartSync = () => {
    setInlineError(null);

    if (!termsAgreed) {
      setInlineError('서비스 이용약관 및 개인정보 처리방침에 동의해 주세요.');
      return;
    }

    if (syncMethod === 'notification' && selectedRooms.length === 0) {
      setInlineError('실시간 감지할 채팅방을 최소 1개 이상 선택해 주세요.');
      return;
    }

    if (syncMethod === 'export_file' && !uploadedFileName) {
      setInlineError('카카오톡 대화 텍스트(.txt) 파일을 먼저 선택해 주세요.');
      return;
    }

    if (syncMethod === 'custom_api') {
      if (keyValidation.status !== 'valid') {
        setInlineError(keyValidation.message);
        return;
      }
      if (!isApiKeyVerified) {
        setInlineError('먼저 [웹훅 연결 테스트 및 인증] 버튼을 눌러 키 검증을 완료해 주세요.');
        return;
      }
    }

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const methodName =
        syncMethod === 'notification'
          ? '알림 수신 동기화'
          : syncMethod === 'export_file'
          ? '대화 내보내기'
          : '커스텀 API 웹훅';
      onSuccess(syncMethod === 'notification' ? selectedRooms.length : 1, methodName);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <section className="relative z-10 w-full sm:max-w-2xl lg:max-w-4xl max-h-[94vh] sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)] border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Pull Handle (Mobile) */}
        <div className="w-full flex items-center justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <header className="px-4 sm:px-6 pt-2.5 sm:pt-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[20px] sm:text-[22px] filled">
                sync_saved_locally
              </span>
              <h2 className="text-sm sm:text-base md:text-lg text-[#161C25] dark:text-slate-100 font-bold">
                카카오톡 연동 &amp; AI 정제 파이프라인
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              내 사용 환경(Android / iOS / PC / 방장)에 맞는 최적의 연동 방식을 선택하세요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all duration-150 cursor-pointer"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">close</span>
          </button>
        </header>

        {/* Quick Recommendation Chips */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-[#006C49] dark:text-emerald-400">lightbulb</span>
              빠른 선택:
            </span>
            <button
              type="button"
              onClick={() => setSyncMethod('notification')}
              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                syncMethod === 'notification'
                  ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>📱 안드로이드 실시간 요약 (추천)</span>
            </button>
            <button
              type="button"
              onClick={() => setSyncMethod('export_file')}
              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                syncMethod === 'export_file'
                  ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>🍏 아이폰 / PC 몰아보기</span>
            </button>
            <button
              type="button"
              onClick={() => setSyncMethod('custom_api')}
              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 ${
                syncMethod === 'custom_api'
                  ? 'bg-[#006C49] dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>👑 오픈채팅 방장·운영진</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="text-[11px] text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-0.5 hover:underline shrink-0 ml-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
            <span>비교 표 {showComparison ? '접기' : '펼치기'}</span>
            <span className={`material-symbols-outlined text-[14px] transition-transform ${showComparison ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>

        {/* Method Switcher 3 Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 pb-1 shrink-0">
          <div className="p-1 rounded-2xl bg-[#E9EEFB] dark:bg-slate-800 grid grid-cols-3 gap-1 shadow-inner text-center">
            <button
              type="button"
              onClick={() => setSyncMethod('notification')}
              className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                syncMethod === 'notification'
                  ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">notifications_active</span>
              <span className="truncate">1. 알림 수신 동기화</span>
              <span className="hidden md:inline px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-[#005236] dark:text-emerald-300 text-[9px]">추천</span>
            </button>

            <button
              type="button"
              onClick={() => setSyncMethod('export_file')}
              className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                syncMethod === 'export_file'
                  ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">upload_file</span>
              <span className="truncate">2. 텍스트 내보내기</span>
              <span className="hidden md:inline px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px]">iOS/PC</span>
            </button>

            <button
              type="button"
              onClick={() => setSyncMethod('custom_api')}
              className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                syncMethod === 'custom_api'
                  ? 'bg-white dark:bg-slate-900 text-[#006C49] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">api</span>
              <span className="truncate">3. 커스텀 API 키</span>
              <span className="hidden md:inline px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px]">방장</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2.5 sm:py-3 space-y-3.5 no-scrollbar">
          {/* ================= COMPREHENSIVE 3-WAY COMPARISON TABLE ================= */}
          {showComparison && (
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#EFF4FF] border border-[#BBCAFF]/60 space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006C49] text-[18px] filled">balance</span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    연동 방식별 상세 비교 (난이도 · 실시간성 · 추천 대상)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline">행을 클릭하면 해당 방식으로 즉시 전환됩니다</span>
              </div>

              {/* Responsive Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="py-2.5 px-3 font-bold">연동 방식</th>
                      <th className="py-2.5 px-3 font-bold text-center">설정 난이도 (상/중/하)</th>
                      <th className="py-2.5 px-3 font-bold text-center">데이터 실시간성 (낮음/보통/높음)</th>
                      <th className="py-2.5 px-3 font-bold">추천 대상</th>
                      <th className="py-2.5 px-3 font-bold text-center w-20">선택</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Method 1: Notification Listener */}
                    <tr 
                      onClick={() => setSyncMethod('notification')}
                      className={`cursor-pointer transition-colors ${
                        syncMethod === 'notification' 
                          ? 'bg-[#ADEDD3]/25 ring-1 ring-inset ring-[#006C49]/40' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="material-symbols-outlined text-[#006C49] text-[16px]">notifications_active</span>
                          <span>알림 수신 동기화</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[#005236] text-[9px] font-bold">1순위</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          방장 불필요 · Android OS 표준 알림 감지
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#005236] font-extrabold text-[11px]">
                          🟢 하 (초급)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">30초 / 권한 허용 1회</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006C49] font-extrabold text-[11px] border border-emerald-200">
                          ⚡ 높음 (실시간)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">메시지 수신 즉시 로컬 정제</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        <strong className="text-[#005236]">안드로이드 폰 유저</strong>, 실시간 핫토픽 &amp; 매일 퇴근길(18:30) 3줄 요약 자동 수신 희망자
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          syncMethod === 'notification'
                            ? 'bg-[#006C49] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                          {syncMethod === 'notification' ? '선택됨 ✓' : '선택'}
                        </span>
                      </td>
                    </tr>

                    {/* Method 2: Text Export */}
                    <tr 
                      onClick={() => setSyncMethod('export_file')}
                      className={`cursor-pointer transition-colors ${
                        syncMethod === 'export_file' 
                          ? 'bg-[#ADEDD3]/25 ring-1 ring-inset ring-[#006C49]/40' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="material-symbols-outlined text-slate-700 text-[16px]">upload_file</span>
                          <span>텍스트 내보내기</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[9px] font-bold">전기기</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          기기 제약 없음 · 과거 대화 소급 요약
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#005236] font-extrabold text-[11px]">
                          🟢 하 (초급)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">1분 / 파일 선택</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-extrabold text-[11px] border border-slate-200">
                          ⏳ 낮음 (배치)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">원할 때 수동 업로드 분석</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        <strong className="text-slate-900">아이폰(iOS) 유저</strong>, PC 카톡 사용자, 지난 수일 치 대화를 한 번에 몰아보고 싶은 분
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          syncMethod === 'export_file'
                            ? 'bg-[#006C49] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                          {syncMethod === 'export_file' ? '선택됨 ✓' : '선택'}
                        </span>
                      </td>
                    </tr>

                    {/* Method 3: Custom API */}
                    <tr 
                      onClick={() => setSyncMethod('custom_api')}
                      className={`cursor-pointer transition-colors ${
                        syncMethod === 'custom_api' 
                          ? 'bg-[#ADEDD3]/25 ring-1 ring-inset ring-[#006C49]/40' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="material-symbols-outlined text-amber-700 text-[16px]">api</span>
                          <span>커스텀 API 키</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">방장</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          서버단 웹훅 · 단톡방 전원 영구 지식베이스
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                          🟡 중 ~ 상 (고급)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">5~10분 / 웹훅·키 발급</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006C49] font-extrabold text-[11px] border border-emerald-200">
                          ⚡ 높음 (실시간)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">24시간 무인 영구 동기화</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        <strong className="text-slate-900">오픈채팅방 방장(Host)</strong>, 개발 커뮤니티 운영진, 사내 스터디 채널 리더
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                          syncMethod === 'custom_api'
                            ? 'bg-[#006C49] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                          {syncMethod === 'custom_api' ? '선택됨 ✓' : '선택'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 1: 알림 수신 동기화 ================= */}
          {syncMethod === 'notification' && (
            <div className="space-y-3">
              {/* Method Quick Spec Bar */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-[#006C49]">
                    <span className="material-symbols-outlined text-[15px]">bolt</span>
                    데이터 실시간성: <strong>높음</strong> (즉시 감지)
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="material-symbols-outlined text-[15px]">timer</span>
                    설정 난이도: <strong>하</strong> (30초)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#005236] font-bold text-[10px]">
                  Android 스마트폰 권장
                </span>
              </div>

              {/* Chatroom Selection Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#161C25]">감지할 오픈채팅방 선택</span>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="text-xs text-[#006C49] font-bold hover:underline"
                  >
                    {selectedRooms.length === 3 ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                {/* Room 1 */}
                <label className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <span className="material-symbols-outlined text-[17px] sm:text-[18px]">code</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">프론트엔드 실무 &amp; 채용방</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[9px] font-medium shrink-0">1,480명</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">일평균 1,840개 메시지 감지 중</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes('room-fe')}
                    onChange={() => handleToggleRoom('room-fe')}
                    className="w-4 h-4 rounded text-[#006C49] focus:ring-[#006C49] ml-2 accent-[#006C49]"
                  />
                </label>

                {/* Room 2 */}
                <label className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ADEDD3] flex items-center justify-center text-[#005236] shrink-0">
                      <span className="material-symbols-outlined text-[17px] sm:text-[18px]">rocket_launch</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">스타트업 PO / PM 라운지</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[9px] font-medium shrink-0">920명</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">일평균 920개 메시지 감지 중</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes('room-pm')}
                    onChange={() => handleToggleRoom('room-pm')}
                    className="w-4 h-4 rounded text-[#006C49] focus:ring-[#006C49] ml-2 accent-[#006C49]"
                  />
                </label>

                {/* Room 3 */}
                <label className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <span className="material-symbols-outlined text-[17px] sm:text-[18px]">apartment</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">판교 개발자 네트워킹 &amp; 잡담</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[9px] font-medium shrink-0">1,500명</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">일평균 3,200개 메시지 감지 중</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes('room-networking')}
                    onChange={() => handleToggleRoom('room-networking')}
                    className="w-4 h-4 rounded text-[#006C49] focus:ring-[#006C49] ml-2 accent-[#006C49]"
                  />
                </label>
              </div>

              {/* Notification Timing Settings */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EFF4FF] space-y-2">
                <span className="text-xs font-bold text-[#161C25] block">스마트 브리핑 발송 시간</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white text-xs">
                  <span className="font-semibold text-slate-800">퇴근길 핵심 브리핑 (오후 6:30)</span>
                  <input
                    type="checkbox"
                    checked={eveningBriefing}
                    onChange={(e) => setEveningBriefing(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006C49] focus:ring-[#006C49] accent-[#006C49]"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white text-xs">
                  <span className="font-semibold text-slate-800">실시간 핫토픽 &amp; 장애 트러블슈팅 알림</span>
                  <input
                    type="checkbox"
                    checked={hotTopics}
                    onChange={(e) => setHotTopics(e.target.checked)}
                    className="w-4 h-4 rounded text-[#006C49] focus:ring-[#006C49] accent-[#006C49]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: 대화 내보내기 (.txt) ================= */}
          {syncMethod === 'export_file' && (
            <div className="space-y-3">
              {/* Method Quick Spec Bar */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <span className="material-symbols-outlined text-[15px]">history</span>
                    데이터 실시간성: <strong>낮음</strong> (수동 파일 업로드)
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="material-symbols-outlined text-[15px]">timer</span>
                    설정 난이도: <strong>하</strong> (1분)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  iOS / Mac / Windows / Android 100% 호환
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF4FF] border border-[#E3E8F5] space-y-1.5">
                <h4 className="text-xs font-bold text-[#006C49] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                  <span>아이폰(iOS) 및 PC 카카오톡 1분 내보내기 방법</span>
                </h4>
                <ol className="text-xs text-slate-700 space-y-1 pl-4 list-decimal leading-relaxed">
                  <li>카카오톡 오픈채팅방 우측 상단 메뉴(≡) 클릭</li>
                  <li>설정(⚙️) → <strong>'대화 내용 내보내기'</strong> 선택</li>
                  <li><strong>'텍스트 메시지만 보내기'</strong>로 저장된 <code>.txt</code> 파일 선택</li>
                </ol>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-5 sm:p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="txt-upload"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="txt-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#ADEDD3] text-[#005236] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px] sm:text-[24px]">cloud_upload</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {uploadedFileName ? uploadedFileName : '카카오톡 대화 텍스트(.txt) 파일 선택'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      최근 수일 치 대화까지 10초 만에 완벽 정제 요약
                    </p>
                  </div>
                  <span className="mt-1 px-3.5 py-1.5 rounded-full bg-[#006C49] text-white text-xs font-bold shadow-xs">
                    내 기기에서 파일 찾기
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ================= TAB 3: 커스텀 API & 웹훅 (방장 전용) ================= */}
          {syncMethod === 'custom_api' && (
            <div className="space-y-3">
              {/* Method Quick Spec Bar */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-[#006C49]">
                    <span className="material-symbols-outlined text-[15px]">all_inclusive</span>
                    데이터 실시간성: <strong>높음</strong> (24시간 무인 실시간)
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-amber-800">
                    <span className="material-symbols-outlined text-[15px]">timer</span>
                    설정 난이도: <strong>중 ~ 상</strong> (5~10분)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  오픈채팅방 방장 권한 필수
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFF4FF] border border-[#E3E8F5] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006C49]">
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  <span>오픈채팅방 방장 전용 자동화 연동 가이드</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  카카오 비즈니스 오픈빌더 챗봇 또는 웹훅 서버를 통해 단톡방 메시지를 오카방가방가 엔진으로 직접 포워딩합니다. 방 전체 참여자가 실시간 지식베이스를 공유할 수 있습니다.
                </p>
              </div>

              <div className="space-y-3">
                {/* API Key Input Section with Real-time Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>카카오 오픈빌더 라이브 API Key</span>
                      <span className="text-rose-500">*</span>
                    </label>

                    {/* Quick Tester Sandbox Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInlineError(null);
                          setVerifySuccessMsg(null);
                          setApiKey('kakao_ob_live_fe89a204bc910d8e71a99');
                          setIsApiKeyVerified(false);
                        }}
                        className="text-[10px] sm:text-[11px] text-[#006C49] font-bold hover:underline flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors border border-emerald-200/60"
                        title="정상 형식의 샘플 키를 채웁니다"
                      >
                        <span className="material-symbols-outlined text-[13px]">input</span>
                        <span>🧪 정상 키 채우기</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInlineError(null);
                          setVerifySuccessMsg(null);
                          setApiKey('invalid_short_test_123');
                          setIsApiKeyVerified(false);
                        }}
                        className="text-[10px] sm:text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition-colors border border-rose-200/60"
                        title="형식 오류 및 경고 피드백을 테스트합니다"
                      >
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                        <span>⚠️ 오류 키 테스트</span>
                      </button>

                      {apiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setApiKey('');
                            setIsApiKeyVerified(false);
                            setVerifySuccessMsg(null);
                            setInlineError(null);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5"
                          title="입력 내용 지우기"
                        >
                          지우기
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Box with Dynamic Feedback Styling */}
                  <div className="relative">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsApiKeyVerified(false);
                        setVerifySuccessMsg(null);
                        setInlineError(null);
                      }}
                      placeholder="kakao_ob_live_xxxxxxxxxxxxxxxx"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all pr-9 ${
                        keyValidation.status === 'valid'
                          ? 'bg-emerald-50/40 border-2 border-emerald-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40'
                          : keyValidation.status === 'invalid'
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-950 focus:outline-none focus:ring-2 focus:ring-rose-300/40'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#006C49] focus:bg-white'
                      }`}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                      {keyValidation.status === 'valid' && (
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                      )}
                      {keyValidation.status === 'invalid' && (
                        <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
                      )}
                      {keyValidation.status === 'empty' && (
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">key</span>
                      )}
                    </div>
                  </div>

                  {/* Input Validation Feedback & Warning Message UI */}
                  <div
                    className={`mt-1.5 p-2.5 rounded-xl border text-[11px] transition-all space-y-0.5 ${
                      keyValidation.status === 'valid'
                        ? 'bg-emerald-50/80 border-emerald-200 text-[#005236]'
                        : keyValidation.status === 'invalid'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-700'
                        : 'bg-slate-50 border-slate-200/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          {keyValidation.status === 'valid'
                            ? 'task_alt'
                            : keyValidation.status === 'invalid'
                            ? 'warning'
                            : 'info'}
                        </span>
                        <span>{keyValidation.title}</span>
                      </span>
                      <span className="font-mono text-[10px] opacity-80">
                        {apiKey.trim().length > 0 ? `${apiKey.trim().length}자 / 최소 24자` : '24자 이상 필요'}
                      </span>
                    </div>
                    <p className="leading-relaxed pl-4 font-medium">{keyValidation.message}</p>
                    {keyValidation.detail && (
                      <p className="text-[10px] opacity-75 pl-4 font-normal">{keyValidation.detail}</p>
                    )}
                  </div>
                </div>

                {/* Webhook Endpoint */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    오카방가방가 수신 웹훅 엔드포인트 URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        isCopiedWebhook
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isCopiedWebhook ? 'check' : 'content_copy'}
                      </span>
                      <span>{isCopiedWebhook ? '복사됨 ✓' : '복사'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    카카오 i 오픈빌더 &gt; 스킬 설정 &gt; URL에 위 주소를 붙여넣기 하세요.
                  </p>
                </div>

                {/* Verify Connection Button & Result */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleVerifyApiKey}
                    disabled={isVerifyingKey || keyValidation.status !== 'valid'}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isApiKeyVerified
                        ? 'bg-emerald-100 text-[#005236] border border-emerald-300'
                        : keyValidation.status !== 'valid'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-[#006C49] hover:bg-[#005236] text-white active:scale-95'
                    }`}
                  >
                    {isVerifyingKey ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>웹훅 연결 검증 통신 중...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          {isApiKeyVerified ? 'verified' : 'network_check'}
                        </span>
                        <span>
                          {isApiKeyVerified
                            ? '웹훅 연결 검증 완료됨 ✓'
                            : '웹훅 연결 테스트 및 인증'}
                        </span>
                      </>
                    )}
                  </button>

                  {verifySuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#005236] text-[11px] font-bold flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                      <span>{verifySuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2-Stage AI Pipeline Explanation Card (LLM Cost Protection) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#161C25] flex items-center gap-1">
                <span className="material-symbols-outlined text-[#006C49] text-[15px] filled">bolt</span>
                LLM 비용 방지 2-Stage 정제 파이프라인
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006C49]">
                API 비용 98% 절감
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-slate-800">1단계: 로컬 룰베이스 필터</p>
                <p className="text-slate-500 mt-0.5">ㅋㅋ, 인사, 메뉴, 이모티콘 95% 선제거 (비용 $0)</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <p className="font-bold text-[#006C49]">2단계: LLM 구조화 요약</p>
                <p className="text-slate-500 mt-0.5">선별된 핵심 토론 28건만 Gemini로 전달 요약</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className="px-4 sm:px-6 pt-2.5 sm:pt-3 pb-4 sm:pb-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 shrink-0 transition-colors">
          {/* Real-time Inline Error Alert Callout (Replaces annoying browser alert) */}
          {inlineError && (
            <div className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-rose-500 shrink-0">error</span>
                <span className="truncate">{inlineError}</span>
              </div>
              <button
                type="button"
                onClick={() => setInlineError(null)}
                className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-0.5 rounded-md shrink-0 cursor-pointer"
                aria-label="닫기"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartSync}
            disabled={isSyncing}
            className="w-full py-2.5 sm:py-3 px-6 rounded-2xl bg-[#006C49] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[#005236] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] filled">bolt</span>
            <span>
              {isSyncing
                ? '정제 파이프라인 연결 중...'
                : syncMethod === 'notification'
                ? `선택한 ${selectedRooms.length}개 오픈채팅방 실시간 감지 시작`
                : syncMethod === 'export_file'
                ? uploadedFileName
                  ? `${uploadedFileName} 파일 정제 요약 시작`
                  : '대화 파일 업로드 및 분석 시작'
                : '커스텀 API 웹훅 연동 완료'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 pt-0.5">
            <input
              id="consent-check"
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#006C49] cursor-pointer"
            />
            <label htmlFor="consent-check" className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              [필수] 서비스 이용약관 및 알림/개인정보 처리방침 동의
            </label>
          </div>
        </footer>
      </section>
    </div>
  );
};
