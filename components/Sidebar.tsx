
import React from 'react';
import { X, Home, Link as LinkIcon, Heart, Settings, Shield, Clock, LayoutGrid } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  linksCount: number;
  favoritesCount: number;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange,
  linksCount,
  favoritesCount,
  unreadCount
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, count: null },
    { id: 'links', label: 'All Links', icon: LinkIcon, count: linksCount },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesCount },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
  ];

  return (
    <>
      {/* Backdrop for mobile/tablet when sidebar overlays */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Floating Sidebar Container */}
      <div className={`
        fixed top-4 bottom-4 left-4 w-72 
        bg-white/80 backdrop-blur-2xl border border-white/50
        rounded-[2rem] shadow-2xl z-50
        transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
      `}>
        
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                    <Shield size={20} fill="currentColor" />
                </div>
                <h1 className="font-bold text-2xl text-slate-900 tracking-tight">LinkVault</h1>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-black/5 rounded-full text-slate-400 transition-colors md:hidden"
            >
                <X size={20} />
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 no-scrollbar">
            
            <div className="mb-6 px-4">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                 {menuItems.map((item) => {
                     const Icon = item.icon;
                     const isActive = activeTab === item.id;
                     return (
                         <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id as Tab);
                                if (window.innerWidth < 768) onClose();
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 mb-1
                                ${isActive 
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]' 
                                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                                }
                            `}
                         >
                             <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                             <span className="font-medium flex-1">{item.label}</span>
                             {item.count !== null && item.count > 0 && (
                                 <span className={`
                                    text-xs font-bold px-2 py-0.5 rounded-full
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}
                                 `}>
                                     {item.count}
                                 </span>
                             )}
                         </button>
                     );
                 })}
            </div>

            {/* Smart Filters (Visual Only for now matching Home View) */}
            <div className="px-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Smart Folders</p>
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-slate-600 hover:bg-white/50 transition-colors">
                        <Clock size={20} className="text-blue-500" />
                        <span className="font-medium">Recent</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-slate-600 hover:bg-white/50 transition-colors">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                        <span className="font-medium">Unread</span>
                        <span className="ml-auto text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                    </button>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
                <p className="font-bold text-sm mb-1">Upgrade to Pro</p>
                <p className="text-xs opacity-80 mb-3">Get unlimited AI summaries and cloud sync.</p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                    Coming Soon
                </button>
            </div>
        </div>

      </div>
    </>
  );
};
