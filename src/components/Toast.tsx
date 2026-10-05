import React from 'react';

interface ToastProps {
  message: string;
  icon?: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, icon = 'check_circle', isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <aside 
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#161C25] text-white shadow-2xl transition-all duration-300 w-11/12 max-w-sm border border-white/10 animate-[fadeIn_0.2s_ease-out]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="material-symbols-outlined text-[#4EDEA3] text-[20px] shrink-0">
          {icon}
        </span>
        <span className="text-[13px] font-semibold text-white/95 truncate">
          {message}
        </span>
      </div>
      <button 
        type="button" 
        onClick={onClose}
        className="text-white/60 hover:text-white p-1 rounded-full shrink-0 transition-colors"
        aria-label="닫기"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </aside>
  );
};
