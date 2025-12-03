
import React from 'react';
import { Menu, Plus, Search } from 'lucide-react';

interface TopNavProps {
  onMenuClick: () => void;
  onAddClick: () => void;
  onSearchClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, onAddClick, onSearchClick }) => {
  return (
    <div className="fixed top-6 left-0 right-0 z-30 flex justify-center pointer-events-none md:flex hidden">
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-full p-1.5 flex items-center gap-2 pointer-events-auto">
        
        <button 
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Open Menu"
        >
            <Menu size={20} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button 
            onClick={onSearchClick}
            className="flex items-center gap-2 px-4 h-10 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all bg-slate-50/50 border border-transparent hover:border-slate-200 w-64 group"
        >
            <Search size={16} />
            <span className="text-sm font-medium">Search links...</span>
            <div className="ml-auto flex gap-0.5">
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
            onClick={onAddClick}
            className="h-10 px-5 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 flex items-center gap-2 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 transition-all active:scale-95"
        >
            <Plus size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">New Link</span>
        </button>

      </div>
    </div>
  );
};
