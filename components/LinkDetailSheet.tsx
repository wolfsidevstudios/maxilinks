
import React, { useState } from 'react';
import { LinkItem } from '../types';
import { Button } from './Button';
import { ICONS } from './IconPicker';
import { 
  ExternalLink, Sparkles, Trash2, Calendar, 
  Star, CheckCircle, Clock, Copy
} from 'lucide-react';
import { enrichLinkData } from '../services/geminiService';

interface LinkDetailSheetProps {
  link: LinkItem;
  onUpdate: (updatedLink: LinkItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const LinkDetailSheet: React.FC<LinkDetailSheetProps> = ({ link, onUpdate, onDelete, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const isImageIcon = link.icon?.startsWith('http');
  const IconComp = !isImageIcon ? (ICONS.find(i => i.id === link.icon)?.component || ICONS[0].component) : null;
  
  let domain = link.url;
  try {
    domain = new URL(link.url).hostname.replace('www.', '');
  } catch (e) {
    // Fallback gracefully
  }

  const handleToggleFavorite = () => {
    onUpdate({ ...link, isFavorite: !link.isFavorite });
  };

  const handleToggleRead = () => {
    onUpdate({ ...link, isRead: !link.isRead });
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const enriched = await enrichLinkData(link.title, link.url);
    onUpdate({
        ...link,
        description: enriched.description || link.description,
        tags: [...new Set([...link.tags, ...enriched.tags])],
        aiEnriched: true
    });
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link.url);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-100 overflow-hidden relative"
            style={{ backgroundColor: link.color || '#3b82f6' }}
        >
            {isImageIcon ? (
                <img src={link.icon} alt="" className="w-10 h-10 object-contain" />
            ) : (
                IconComp && <IconComp size={40} className="text-white" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-1 line-clamp-2">{link.title}</h2>
            <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-slate-400 truncate block hover:text-blue-500 hover:underline">
                {domain}
            </a>
            <div className="flex items-center gap-2 mt-3">
                 <button 
                    onClick={copyToClipboard}
                    className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
                 >
                    <Copy size={16} />
                 </button>
                 <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
                 >
                    Open <ExternalLink size={14} />
                 </a>
            </div>
        </div>
      </div>

      {/* Action Toggles */}
      <div className="grid grid-cols-2 gap-3">
        <button 
            onClick={handleToggleFavorite}
            className={`
                flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all
                ${link.isFavorite 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
            `}
        >
            <Star size={18} fill={link.isFavorite ? "currentColor" : "none"} />
            {link.isFavorite ? 'Favorited' : 'Favorite'}
        </button>

        <button 
            onClick={handleToggleRead}
            className={`
                flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all
                ${link.isRead 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
            `}
        >
            {link.isRead ? <CheckCircle size={18} /> : <Clock size={18} />}
            {link.isRead ? 'Read' : 'Mark Read'}
        </button>
      </div>

      {/* Meta Data */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-1">
        <Calendar size={14} />
        Created {new Date(link.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      {/* Description / AI Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Description</h3>
            <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
                {isGenerating ? 'Thinking...' : (
                    <><Sparkles size={12} /> Generate AI</>
                )}
            </button>
        </div>
        
        {link.description ? (
            <p className="text-slate-600 leading-relaxed text-sm p-4 bg-slate-50 rounded-xl border border-slate-100">
                {link.description}
            </p>
        ) : (
             <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-400 text-sm italic">No description available.</p>
             </div>
        )}
      </div>

       {/* Notes Placeholder */}
       <div className="space-y-3">
            <h3 className="font-bold text-slate-900">Notes</h3>
             <p className="text-slate-400 text-sm italic">No notes added.</p>
       </div>
       
       <div className="mt-auto pt-4 border-t border-slate-100">
            <Button 
                variant="ghost" 
                onClick={() => {
                    if (window.confirm("Delete this link?")) {
                        onDelete(link.id);
                        onClose();
                    }
                }}
                className="w-full !text-red-500 hover:!bg-red-50 hover:!text-red-600"
            >
                <Trash2 size={18} className="mr-2" /> Delete Link
            </Button>
       </div>
    </div>
  );
};
