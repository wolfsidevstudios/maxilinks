
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Clipboard } from 'lucide-react';
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
  const [icon, setIcon] = useState('globe');
  const [color, setColor] = useState(COLORS[0].value);
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

  // Auto-fill title if empty when URL changes (basic)
  useEffect(() => {
    if (url && !title) {
        try {
            const validUrl = sanitizeUrl(url);
            const hostname = new URL(validUrl).hostname.replace('www.', '');
            if (hostname) {
                setTitle(hostname.charAt(0).toUpperCase() + hostname.slice(1));
            }
        } catch(e) {
            // Invalid URL, ignore
        }
    }
  }, [url]);

  const handleNext = () => {
    if (title.trim()) setStep(2);
  };

  const handleSmartSave = async () => {
     if (!url) return;
     const cleanUrl = sanitizeUrl(url);

     setIsProcessing(true);
     // If user hasn't enriched yet, do it now
     const enriched = await enrichLinkData(title, cleanUrl);
     
     const finalDesc = description || enriched.description;
     const finalTags = tags 
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : enriched.tags;

     onSave({
        url: cleanUrl, 
        title: title || cleanUrl, 
        description: finalDesc, 
        tags: finalTags, 
        enriched: true,
        icon,
        color
     });
     setIsProcessing(false);
  };

  const handleManualSave = () => {
    const cleanUrl = sanitizeUrl(url);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
        url: cleanUrl, 
        title: title || cleanUrl, 
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
            const cleanUrl = sanitizeUrl(text);
            setUrl(cleanUrl);
            // Try to extract domain as title if empty
            if (!title) {
                try {
                     const hostname = new URL(cleanUrl).hostname.replace('www.', '');
                     setTitle(hostname.charAt(0).toUpperCase() + hostname.slice(1));
                } catch {}
            }
        }
    } catch (err) {
        console.error('Failed to read clipboard', err);
    }
  };

  const SelectedIconComp = ICONS.find(i => i.id === icon)?.component || ICONS[0].component;

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      <div className="flex gap-2 mb-6 justify-center">
        <div className={`h-1 rounded-full flex-1 transition-colors ${step >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
        <div className={`h-1 rounded-full flex-1 transition-colors ${step >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      </div>

      {step === 1 ? (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {/* Visual Preview */}
            <div className="flex flex-col items-center">
                <div 
                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200"
                    style={{ backgroundColor: color }}
                >
                    <SelectedIconComp size={48} className="text-white" />
                </div>
                
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-center text-2xl font-bold bg-transparent border-b-2 border-slate-100 focus:border-slate-900 outline-none px-2 py-1 w-full max-w-xs transition-colors placeholder-slate-300"
                    placeholder="Enter Title"
                    autoFocus
                />
            </div>

            {/* Icon Picker */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Icon</label>
                <IconPicker selectedIcon={icon} selectedColor={color} onSelect={setIcon} />
            </div>

             {/* Color Picker */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Color</label>
                <ColorPicker selectedColor={color} onSelect={setColor} />
            </div>

            <Button onClick={handleNext} fullWidth disabled={!title.trim()} className="mt-auto">
                Next <ArrowRight size={18} className="ml-2" />
            </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
             <button onClick={() => setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors self-start">
                <ArrowLeft size={16} className="mr-1" /> Back
             </button>

             <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Link URL</label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400"
                        placeholder="https://..."
                        autoFocus
                    />
                    <button 
                        type="button"
                        onClick={handlePaste}
                        className="px-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-200"
                        title="Paste from Clipboard"
                    >
                        <Clipboard size={18} />
                        <span className="hidden sm:inline text-sm font-bold">Paste</span>
                    </button>
                </div>
            </div>

             <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400 resize-none"
                    placeholder="Add a note or summary..."
                />
            </div>

            <div className="mt-auto flex flex-col gap-3">
                 <Button 
                    type="button"
                    onClick={handleSmartSave} 
                    fullWidth 
                    disabled={isProcessing || !url}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                >
                {isProcessing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
                AI Smart Save
                </Button>
                <Button type="button" variant="ghost" onClick={handleManualSave} disabled={isProcessing} className="w-full">
                    Save without AI
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};
