import React, { useState } from 'react';
import { getAvatarDataUrl, DEFAULT_AVATAR } from '../lib/utils';

interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  name?: string | null | undefined;
}

// Global cache for successfully loaded avatar image URLs to prevent repeated loading flashes
// We use sessionStorage to persist this cache across page refreshes in the same tab
const loadedAvatarUrls = (() => {
  try {
    const cached = sessionStorage.getItem('loaded_avatar_urls');
    return new Set<string>(cached ? JSON.parse(cached) : []);
  } catch {
    return new Set<string>();
  }
})();

function markUrlAsLoaded(url: string) {
  if (!url) return;
  try {
    loadedAvatarUrls.add(url);
    sessionStorage.setItem('loaded_avatar_urls', JSON.stringify(Array.from(loadedAvatarUrls)));
  } catch (e) {
    console.error("Failed to save loaded avatar URL to sessionStorage:", e);
  }
}

export function AvatarImage({ src, alt, className = "w-full h-full object-cover", name }: AvatarImageProps) {
  const isInitiallyCached = src ? loadedAvatarUrls.has(src) : false;
  const [loaded, setLoaded] = useState(isInitiallyCached);
  const [error, setError] = useState(false);

  // Reset states when src changes
  React.useEffect(() => {
    if (src && loadedAvatarUrls.has(src)) {
      setLoaded(true);
    } else {
      setLoaded(isInitiallyCached);
      setError(false);
    }
  }, [src, isInitiallyCached]);

  // Generate the dynamic alphabet/initials avatar data URL instantly
  const initialAvatarSrc = getAvatarDataUrl(name || alt || 'User');

  // If the user's photo is from an external source (like Google, starting with http),
  // we use the default grey silhouette as the fallback/loading placeholder, not the letter avatar.
  const isExternal = src && src.startsWith('http');
  const fallbackSrc = isExternal ? DEFAULT_AVATAR : initialAvatarSrc;

  // If there is no src or there is an image loading error, render the fallback
  if (!src || error) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
      />
    );
  }

  // If the src is itself a data URL (initial-letter, etc.), render it directly
  if (src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Otherwise, we load the external Google profile image.
  // While it loads, we keep the gray silhouette avatar visible in the background and fade-in the image once loaded.
  return (
    <div className="relative w-full h-full">
      {/* Instant Placeholder shown underneath */}
      {!loaded && (
        <img
          src={fallbackSrc}
          alt="Loading Placeholder"
          className={`${className} absolute inset-0 z-0`}
          referrerPolicy="no-referrer"
        />
      )}
      {/* Real profile image */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} relative z-10`}
        referrerPolicy="no-referrer"
        onLoad={() => {
          if (src) markUrlAsLoaded(src);
          setLoaded(true);
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}


