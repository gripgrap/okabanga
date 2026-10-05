import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  onDownload?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-4xl bg-[#161C25] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="text-base sm:text-lg font-bold text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs sm:text-sm text-white/60 truncate mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>저장</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center bg-black/40">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#1F2633] text-center text-xs text-white/70 border-t border-white/10">
          <span>💡 핀치 줌 또는 스크롤로 이미지를 확대할 수 있습니다. AI 정제 파이프라인에서 추출된 실무 원본 이미지입니다.</span>
        </div>
      </div>
    </div>
  );
};
