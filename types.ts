export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: number;
  aiEnriched: boolean;
  isFavorite?: boolean;
  // New fields for customization
  icon?: string;
  color?: string; // Hex code or tailwind class reference
  isRead?: boolean;
  notes?: string;
  thumbnail?: string; // URL to thumbnail image
}

export interface ShareTargetParams {
  title?: string;
  text?: string;
  url?: string;
}

export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  AZ = 'AZ'
}

export type Tab = 'home' | 'links' | 'favorites' | 'settings';
