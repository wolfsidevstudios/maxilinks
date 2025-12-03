import { LinkItem } from '../types';

const STORAGE_KEY = 'linkvault_items';

export const getLinks = (): LinkItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    // Migration helper: ensure new fields exist on old data if needed
    const parsed: LinkItem[] = data ? JSON.parse(data) : [];
    return parsed.map(item => ({
        ...item,
        icon: item.icon || 'globe',
        color: item.color || '#3b82f6',
        isRead: item.isRead || false
    }));
  } catch (e) {
    console.error("Failed to load links", e);
    return [];
  }
};

export const saveLink = (link: LinkItem): LinkItem[] => {
  const current = getLinks();
  const updated = [link, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteLink = (id: string): LinkItem[] => {
  const current = getLinks();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateLink = (updatedLink: LinkItem): LinkItem[] => {
  const current = getLinks();
  const updated = current.map(item => item.id === updatedLink.id ? updatedLink : item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
