
import React from 'react';
import { LinkItem } from '../types';
import { ICONS } from './IconPicker';

interface LinkCardProps {
  item: LinkItem;
  onClick: (item: LinkItem) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ item, onClick }) => {
  let domain = item.url;
  try {
    domain = new URL(item.url).hostname.replace('www.', '');
  } catch (e) {
    domain = item.url;
  }
  
  const isImageIcon = item.icon?.startsWith('http');
  const IconComp = !isImageIcon ? (ICONS.find(i => i.id === item.icon)?.component || ICONS[0].component) : null;

  return (
    <div 
        onClick={() => onClick(item)}
        className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 cursor-pointer active:scale-[0.99] border border-slate-100/50 h-full"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 text-white shadow-sm overflow-hidden relative"
        style={{ backgroundColor: item.color || '#3b82f6' }}
      >
        {isImageIcon ? (
            <img src={item.icon} alt="" className="w-6 h-6 object-contain" />
        ) : (
            IconComp && <IconComp size={24} strokeWidth={2.5} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-medium truncate">
                {domain}
            </span>
             {item.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium hidden sm:inline-block">
                    #{tag}
                </span>
            ))}
        </div>
      </div>
      
      {item.isFavorite && (
         <div className="text-yellow-400">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
                 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
             </svg>
         </div>
      )}
    </div>
  );
};
