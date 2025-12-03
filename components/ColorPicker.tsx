import React from 'react';
import { Check } from 'lucide-react';

export const COLORS = [
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'purple', value: '#a855f7', label: 'Purple' },
  { id: 'red', value: '#ef4444', label: 'Red' },
  { id: 'orange', value: '#f97316', label: 'Orange' },
  { id: 'yellow', value: '#eab308', label: 'Yellow' },
  { id: 'green', value: '#22c55e', label: 'Green' },
  { id: 'teal', value: '#14b8a6', label: 'Teal' },
  { id: 'indigo', value: '#6366f1', label: 'Indigo' },
  { id: 'gray', value: '#64748b', label: 'Gray' },
  { id: 'pink', value: '#ec4899', label: 'Pink' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'lime', value: '#84cc16', label: 'Lime' },
  { id: 'sky', value: '#0ea5e9', label: 'Sky' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
  { id: 'rose', value: '#f43f5e', label: 'Rose' },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-4 py-2">
      {COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onSelect(color.value)}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105
            ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : ''}
          `}
          style={{ backgroundColor: color.value }}
          aria-label={color.label}
        >
          {selectedColor === color.value && <Check size={20} className="text-white drop-shadow-md" />}
        </button>
      ))}
    </div>
  );
};
