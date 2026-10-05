import React, { useState } from 'react';
import { UserCustomTag } from '../types';

interface CustomTagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTags: UserCustomTag[];
  onAddTag: (name: string, color: UserCustomTag['color']) => void;
  onEditTag: (oldName: string, newName: string, color: UserCustomTag['color']) => void;
  onDeleteTag: (tagName: string) => void;
  aiTags: string[];
  selectedFilterTag: string | null;
  onSelectFilterTag: (tag: string | null) => void;
  isDarkMode?: boolean;
}

const COLOR_OPTIONS: { key: UserCustomTag['color']; label: string; bgClass: string; textClass: string; ringClass: string }[] = [
  { key: 'purple', label: '보라', bgClass: 'bg-purple-100 dark:bg-purple-950/60', textClass: 'text-purple-700 dark:text-purple-300', ringClass: 'ring-purple-500' },
  { key: 'indigo', label: '인디고', bgClass: 'bg-indigo-100 dark:bg-indigo-950/60', textClass: 'text-indigo-700 dark:text-indigo-300', ringClass: 'ring-indigo-500' },
  { key: 'emerald', label: '에메랄드', bgClass: 'bg-emerald-100 dark:bg-emerald-950/60', textClass: 'text-emerald-700 dark:text-emerald-300', ringClass: 'ring-emerald-500' },
  { key: 'amber', label: '앰버', bgClass: 'bg-amber-100 dark:bg-amber-950/60', textClass: 'text-amber-700 dark:text-amber-300', ringClass: 'ring-amber-500' },
  { key: 'rose', label: '로즈', bgClass: 'bg-rose-100 dark:bg-rose-950/60', textClass: 'text-rose-700 dark:text-rose-300', ringClass: 'ring-rose-500' },
  { key: 'blue', label: '블루', bgClass: 'bg-blue-100 dark:bg-blue-950/60', textClass: 'text-blue-700 dark:text-blue-300', ringClass: 'ring-blue-500' },
];

export const CustomTagManagerModal: React.FC<CustomTagManagerModalProps> = ({
  isOpen,
  onClose,
  customTags,
  onAddTag,
  onEditTag,
  onDeleteTag,
  aiTags,
  selectedFilterTag,
  onSelectFilterTag,
}) => {
  // New Tag form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<UserCustomTag['color']>('purple');

  // Edit tag state
  const [editingTagName, setEditingTagName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedColor, setEditedColor] = useState<UserCustomTag['color']>('purple');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let clean = newTagName.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = '#' + clean;

    onAddTag(clean, newTagColor);
    setNewTagName('');
  };

  const startEdit = (tag: UserCustomTag) => {
    setEditingTagName(tag.name);
    setEditedName(tag.name.replace(/^#/, ''));
    setEditedColor(tag.color);
  };

  const handleSaveEdit = (oldName: string) => {
    let clean = editedName.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = '#' + clean;

    onEditTag(oldName, clean, editedColor);
    setEditingTagName(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-[scaleUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] filled">label</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                커스텀 태그 관리 &amp; 필터 연동
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                나만의 맞춤 태그를 생성·수정하고, AI 라벨링과 함께 모아보세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* 1. Add New Custom Tag Form */}
          <section className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-3">
            <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] filled">add_circle</span>
              <span>새 커스텀 태그 생성</span>
            </h4>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    #
                  </span>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="태그명 입력 (예: 월요일리뷰, 팀공유필독)"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newTagName.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  태그 추가
                </button>
              </div>

              {/* Color Preset Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  색상 뱃지:
                </span>
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => setNewTagColor(col.key)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${col.bgClass} ${col.textClass} ${
                        newTagColor === col.key
                          ? `ring-2 ${col.ringClass} shadow-xs scale-105`
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </section>

          {/* 2. Registered Custom Tags List (수정 & 삭제) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">
                  person
                </span>
                <span>내가 등록한 커스텀 태그 ({customTags.length}개)</span>
              </h4>
              <span className="text-[11px] text-slate-400">수정 시 모든 토론에 일괄 반영됩니다.</span>
            </div>

            {customTags.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                아직 등록된 커스텀 태그가 없습니다. 위에서 태그를 추가해 보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {customTags.map((tag) => {
                  const isEditing = editingTagName === tag.name;
                  const isFiltered = selectedFilterTag === tag.name;
                  const colorOption = COLOR_OPTIONS.find((c) => c.key === tag.color) || COLOR_OPTIONS[0];

                  if (isEditing) {
                    return (
                      <div
                        key={tag.id}
                        className="p-3 rounded-xl bg-purple-50/50 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#</span>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(tag.name)}
                            className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTagName(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                          >
                            취소
                          </button>
                        </div>

                        {/* Color Selector during edit */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {COLOR_OPTIONS.map((col) => (
                            <button
                              key={col.key}
                              type="button"
                              onClick={() => setEditedColor(col.key)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.bgClass} ${col.textClass} ${
                                editedColor === col.key ? `ring-2 ${col.ringClass}` : 'opacity-60'
                              }`}
                            >
                              {col.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={tag.id}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colorOption.bgClass} ${colorOption.textClass}`}
                        >
                          <span className="material-symbols-outlined text-[13px] opacity-80">person</span>
                          <span className="truncate max-w-[140px] sm:max-w-[200px]">{tag.name}</span>
                        </span>

                        <span className="text-[11px] text-slate-400">
                          {tag.count !== undefined ? `${tag.count}개 토론 연결` : ''}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Filter by this tag button */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectFilterTag(isFiltered ? null : tag.name);
                            onClose();
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            isFiltered
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                          }`}
                          title="이 태그로 요약 탭 필터링"
                        >
                          {isFiltered ? '필터 해제' : '필터링 적용'}
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => startEdit(tag)}
                          className="p-1 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="태그명 수정"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteTag(tag.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="태그 삭제"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. AI Automatic Labeling Reference Section */}
          <section className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 filled">
                  auto_awesome
                </span>
                <span>AI 자동 라벨링 태그 연동 현황 ({aiTags.length}개)</span>
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                AI 실시간 동기화
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              AI가 토론 성격(기술/트러블슈팅/시사동향/잡담)과 핵심 키워드를 자동 분석하여 부여한 태그들입니다. 클릭하면 해당 태그로 즉시 필터링됩니다.
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar pt-1">
              {aiTags.map((tag) => {
                const isFiltered = selectedFilterTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onSelectFilterTag(isFiltered ? null : tag);
                      onClose();
                    }}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                      isFiltered
                        ? 'bg-emerald-600 text-white font-bold ring-1 ring-emerald-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[11px] opacity-70">auto_awesome</span>
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <footer className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            필터 탭 상단에서 커스텀 태그가 AI 라벨과 함께 표시됩니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  );
};
