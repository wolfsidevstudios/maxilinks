import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center pointer-events-none`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div className={`
        relative w-full max-w-lg bg-white rounded-t-[2rem] shadow-2xl 
        transform transition-transform duration-300 ease-out pointer-events-auto
        max-h-[92vh] flex flex-col
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        ${className}
      `}>
        {/* Header / Handle */}
        <div className="flex-none px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="flex-1">
                 {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
            </div>
            {/* Drag Handle Indicator for visual affordance */}
             <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />
             
            <button 
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2">
            {children}
        </div>
      </div>
    </div>
  );
};
