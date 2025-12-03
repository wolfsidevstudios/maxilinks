
import React from 'react';
import { Home, Link as LinkIcon, Heart, Settings, Plus } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onSearchClick: () => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onSearchClick, onAddClick }) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-3 px-4 pointer-events-none md:hidden">
      {/* Main Navigation Pill */}
      <nav className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl shadow-slate-300/40 rounded-full p-2 flex items-center gap-1 pointer-events-auto">
        <NavButton 
            active={activeTab === 'home'} 
            onClick={() => onTabChange('home')} 
            icon={<Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />}
            label="Home"
        />
        <NavButton 
            active={activeTab === 'links'} 
            onClick={() => onTabChange('links')} 
            icon={<LinkIcon size={22} strokeWidth={activeTab === 'links' ? 2.5 : 2} />}
            label="Links"
        />

        {/* Central Add Button */}
        <button
          onClick={onAddClick}
          className="mx-2 w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 flex items-center justify-center transform transition-transform active:scale-95 hover:bg-slate-800"
          aria-label="Add Link"
        >
            <Plus size={24} strokeWidth={3} />
        </button>

        <NavButton 
            active={activeTab === 'favorites'} 
            onClick={() => onTabChange('favorites')} 
            icon={<Heart size={22} strokeWidth={activeTab === 'favorites' ? 2.5 : 2} />}
            label="Favorites"
        />
        <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => onTabChange('settings')} 
            icon={<Settings size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />}
            label="Settings"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`
        relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
        ${active 
            ? 'text-slate-900 bg-slate-100' 
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
        }
        `}
        aria-label={label}
    >
        {icon}
    </button>
);
