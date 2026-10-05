import React, { useState } from 'react';
import { INITIAL_ROOMS } from '../data/mockData';
import { ChatRoom } from '../types';

interface MyChatRoomsTabProps {
  onSelectRoom: (roomId: string) => void;
  onOpenKakaoModal: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const MyChatRoomsTab: React.FC<MyChatRoomsTabProps> = ({
  onSelectRoom,
  onOpenKakaoModal,
  onShowToast,
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [filterSensitivity, setFilterSensitivity] = useState<number>(95);

  const handleToggleNotif = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, notificationEnabled: !r.notificationEnabled } : r
      )
    );
    onShowToast('채팅방 알림 설정이 변경되었습니다.', 'notifications');
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ADEDD3] dark:bg-emerald-950 flex items-center justify-center text-[#005236] dark:text-emerald-300">
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#161C25] dark:text-slate-100">연동된 내 오픈채팅방</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">실시간 백그라운드 잡담 필터링 파이프라인 가동 중</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenKakaoModal}
            className="px-3.5 py-1.5 rounded-full bg-[#FEE500] text-[#191919] font-bold text-xs flex items-center gap-1 hover:brightness-95 active:scale-95 transition-all duration-150 group cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px] transition-transform duration-200 group-hover:rotate-90">add</span>
            <span>방 추가</span>
          </button>
        </div>

        {/* Sensitivity Slider */}
        <div className="p-3.5 rounded-2xl bg-[#EFF4FF] dark:bg-slate-800/80 border border-[#E3E8F5] dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[16px]">tune</span>
              AI 잡담 필터링 감도
            </span>
            <span className="text-[#006C49] dark:text-emerald-400 font-extrabold text-sm">{filterSensitivity}%</span>
          </div>
          <input
            type="range"
            min="80"
            max="99"
            value={filterSensitivity}
            onChange={(e) => setFilterSensitivity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#006C49] dark:accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>80% (느슨하게)</span>
            <span>95% (권장 표준)</span>
            <span>99% (핵심만 극단적 압축)</span>
          </div>
        </div>
      </div>

      {/* Rooms List: Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {rooms.map((room) => (
          <article
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#E9EEFB] dark:bg-slate-800 flex items-center justify-center text-[#006C49] dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{room.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-[#161C25] dark:text-slate-100 group-hover:text-[#006C49] dark:group-hover:text-emerald-400 transition-colors truncate">
                        {room.name}
                      </h3>
                      {room.isVerified && (
                        <span className="material-symbols-outlined text-[#006C49] dark:text-emerald-400 text-[16px] filled shrink-0">
                          verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{room.category}</span>
                      <span>·</span>
                      <span>{room.memberCount.toLocaleString()}명</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleNotif(room.id);
                  }}
                  className={`p-2 rounded-full transition-all shrink-0 active:scale-90 cursor-pointer ${
                    room.notificationEnabled
                      ? 'bg-[#ADEDD3] dark:bg-emerald-950 text-[#005236] dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="알림 설정"
                >
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-rotate-12 ${room.notificationEnabled ? 'filled' : ''}`}>
                    {room.notificationEnabled ? 'notifications_active' : 'notifications_off'}
                  </span>
                </button>
              </div>

              {/* Room Tags */}
              <div className="flex flex-wrap gap-1.5">
                {room.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/60 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                필터링 잡담{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">
                  {room.filteredNoiseCount.toLocaleString()}개
                </strong>
              </span>

              <span className="text-[#006C49] dark:text-emerald-400 font-bold flex items-center gap-0.5 text-xs">
                <span>{room.unreadCount > 0 ? `새 인사이트 ${room.unreadCount}건` : '최신 유지됨'}</span>
                <span className="material-symbols-outlined text-[14px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
