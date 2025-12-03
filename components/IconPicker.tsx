import React from 'react';
import { 
  Globe, Code, Book, Image, Video, Music, 
  Layout, Briefcase, Coffee, Heart, Star, 
  Zap, Award, Smile, ShoppingBag 
} from 'lucide-react';

export const ICONS = [
  { id: 'globe', component: Globe },
  { id: 'code', component: Code },
  { id: 'book', component: Book },
  { id: 'image', component: Image },
  { id: 'video', component: Video },
  { id: 'music', component: Music },
  { id: 'layout', component: Layout },
  { id: 'briefcase', component: Briefcase },
  { id: 'coffee', component: Coffee },
  { id: 'heart', component: Heart },
  { id: 'star', component: Star },
  { id: 'zap', component: Zap },
  { id: 'award', component: Award },
  { id: 'smile', component: Smile },
  { id: 'cart', component: ShoppingBag },
];

interface IconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onSelect: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, selectedColor, onSelect }) => {
  return (
    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
      {ICONS.map((item) => {
        const Icon = item.component;
        const isSelected = selectedIcon === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`
              flex-none w-16 h-16 rounded-2xl flex items-center justify-center transition-all snap-start
              ${isSelected ? 'bg-slate-100 ring-2 ring-slate-200' : 'bg-slate-50 hover:bg-slate-100'}
            `}
          >
            <Icon 
                size={28} 
                color={isSelected ? selectedColor : '#94a3b8'} 
                strokeWidth={isSelected ? 2.5 : 2}
            />
          </button>
        );
      })}
    </div>
  );
};
