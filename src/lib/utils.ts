import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><circle cx="100" cy="100" r="100" fill="%23E5E7EB"/><circle cx="100" cy="75" r="35" fill="%239CA3AF"/><path d="M40 170c0-33 27-60 60-60s60 27 60 60" fill="%239CA3AF"/></svg>`;

export function getAvatarDataUrl(name: string | null | undefined): string {
  const cleanName = (name || '').trim();
  
  // If there's no clean name, or it's an email address (contains @), or equals 'user',
  // return the default grey silhouette avatar icon.
  if (!cleanName || cleanName.includes('@') || cleanName.toLowerCase() === 'user') {
    return DEFAULT_AVATAR;
  }
  
  const firstLetter = cleanName.charAt(0).toUpperCase() || 'U';
  
  // Material Design colors
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
    '#607D8B', '#795548'
  ];

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="${backgroundColor}"/>
  <text x="100" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="110" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${firstLetter}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
