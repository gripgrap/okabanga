import React from 'react';
import { MainNavTab } from '../types';

interface BottomNavProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, className = '' }) => {
  const tabs: { id: MainNavTab; label: string; icon: string }[] = [
    { id: 'home', label: '홈 요약', icon: 'bolt' },
    { id: 'rooms', label: '내 채팅방', icon: 'chat_bubble' },
    { id: 'curation', label: '주제 큐레이션', icon: 'explore' },
    { id: 'saved', label: '내 저장', icon: 'bookmark' },
    { id: 'my', label: '마이', icon: 'account_circle' },
  ];

  return (
    <nav className={`fixed bottom-0 inset-x-0 z-40 pb-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(22,28,37,0.06)] transition-colors ${className}`}>
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 gap-0.5 transition-all ${
                isActive ? 'text-[#006C49] dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
