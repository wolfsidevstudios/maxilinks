
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Clipboard, Image as ImageIcon } from 'lucide-react';
import { enrichLinkData } from '../services/geminiService';
import { ColorPicker, COLORS } from './ColorPicker';
import { IconPicker, ICONS } from './IconPicker';

interface AddLinkFormProps {
  initialUrl?: string;
  initialTitle?: string;
  onSave: (data: { url: string; title: string; description: string; tags: string[]; enriched: boolean; icon: string; color: string }) => void;
  onCancel: () => void;
}

export const AddLinkForm: React.FC<AddLinkFormProps> = ({ 
  initialUrl = '', 
  initialTitle = '', 
  onSave,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');
  
  // Visuals
  const [icon, setIcon] = useState('globe');
  const [color, setColor] = useState(COLORS[0].value);
  const [fetchedFavicon, setFetchedFavicon] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to ensure URL has protocol
  const sanitizeUrl = (input: string) => {
      if (!input) return '';
      // If it starts with www., or just has no protocol, add https://
      if (!/^https?:\/\//i.test(input)) {
          return `https://${input}`;
      }
      return input;
  };

  const handleNext = () => {
    if (!url) return;
    const cleanUrl = sanitizeUrl(url);
    setUrl(cleanUrl);

    // 1. Try to auto-generate title if missing
    if (!title) {
        try {
            const hostname = new URL(cleanUrl).hostname.replace('www.', '');
            if (hostname) {
                const autoTitle = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                setTitle(autoTitle);
            }
        } catch(e) { /* ignore */ }
    }

    // 2. Fetch Google Favicon
    try {
        const hostname = new URL(cleanUrl).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        setFetchedFavicon(faviconUrl);
    } catch (e) { /* ignore */ }

    setStep(2);
  };

  const handleSmartSave = async () => {
     setIsProcessing(true);
     // If user hasn't enriched yet, do it now
     const enriched = await enrichLinkData(title, url);
     
     const finalDesc = description || enriched.description;
     const finalTags = tags 
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : enriched.tags;

     onSave({
        url, 
        title: title || url, 
        description: finalDesc, 
        tags: finalTags, 
        enriched: true,
        icon,
        color
     });
     setIsProcessing(false);
  };

  const handleManualSave = () => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
        url, 
        title: title || url, 
        description, 
        tags: tagArray, 
        enriched: false,
        icon,
        color
    });
  };

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            setUrl(sanitizeUrl(text));
        }
    } catch (err) {
        console.error('Failed to read clipboard', err);
    }
  };

  const handleUseFavicon = () => {
      if (fetchedFavicon) {
          setIcon(fetchedFavicon);
      }
  };

  // Determine what to render in the preview box
  const isImageIcon = icon.startsWith('http');
  const SelectedIconComp = !isImageIcon ? (ICONS.find(i => i.id === icon)?.component || ICONS[0].component) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      <div className="flex gap-2 mb-6 justify-center">
        <div className={`h-1 rounded-full flex-1 transition-colors ${step >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
        <div className={`h-1 rounded-full flex-1 transition-colors ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      </div>

      {step === 1 ? (
        <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
            <div className="mt-8">
                <label className="block text-2xl font-bold text-slate-900 mb-4 text-center">What's the link?</label>
                
                <div className="relative">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none transition-all text-slate-900 placeholder-slate-400 text-lg shadow-inner"
                        placeholder="https://example.com"
                        autoFocus
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && url) handleNext();
                        }}
                    />
                    <button 
                        type="button"
                        onClick={handlePaste}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shadow-sm border border-slate-100"
                        title="Paste"
                    >
                        <Clipboard size={20} />
                    </button>
                </div>
                <p className="text-center text-slate-400 text-sm mt-4">
                    Paste a URL to get started. We'll automatically fetch details.
                </p>
            </div>

            <Button onClick={handleNext} fullWidth disabled={!url} className="mt-auto !py-4 !text-lg !rounded-2xl">
                Continue <ArrowRight size={20} className="ml-2" />
            </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col overflow-y-auto no-scrollbar -mx-4 px-4">
             <button onClick={() => setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors self-start mb-2">
                <ArrowLeft size={16} className="mr-1" /> Change Link
             </button>

             {/* Visual Preview & Customization */}
             <div className="flex flex-col items-center">
                <div 
                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200 transition-all duration-300"
                    style={{ backgroundColor: color }}
                >
                    {isImageIcon ? (
                        <img src={icon} alt="Favicon" className="w-12 h-12 object-contain drop-shadow-md" />
                    ) : (
                        SelectedIconComp && <SelectedIconComp size={40} className="text-white drop-shadow-md" />
                    )}
                </div>

                <div className="w-full space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-center text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 outline-none px-2 py-1 transition-colors placeholder-slate-300 text-slate-900"
                        placeholder="Link Title"
                    />

                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Icon</label>
                             {fetchedFavicon && (
                                 <button 
                                    type="button"
                                    onClick={handleUseFavicon}
                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                                 >
                                     <img src={fetchedFavicon} alt="" className="w-3 h-3" />
                                     Use Website Logo
                                 </button>
                             )}
                        </div>
                        <IconPicker selectedIcon={icon} selectedColor={color} onSelect={setIcon} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Color</label>
                        <ColorPicker selectedColor={color} onSelect={setColor} />
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm text-slate-900 placeholder-slate-400 resize-none"
                            placeholder="Add a note..."
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
                 <Button 
                    type="button"
                    onClick={handleSmartSave} 
                    fullWidth 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 !py-3.5"
                >
                {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
                Save with AI Summary
                </Button>
                <Button type="button" variant="ghost" onClick={handleManualSave} disabled={isProcessing} className="w-full">
                    Save Manually
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};
