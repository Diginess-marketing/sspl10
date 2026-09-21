import React, { useCallback, useMemo, useState } from 'react';

interface LiteYouTubeProps {
  id: string; // YouTube video id
  title?: string;
  className?: string;
  posterQuality?: 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault';
  params?: string; // extra query params like rel=0&modestbranding=1
  variant?: 'standard' | 'short';
}

function addPreconnect(href: string) {
  if (!document.querySelector(`link[rel=preconnect][href='${href}']`)) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
}

export const LiteYouTube: React.FC<LiteYouTubeProps> = ({
  id,
  title = 'YouTube video',
  className = '',
  posterQuality = 'hqdefault',
  params = 'rel=0&modestbranding=1&playsinline=1',
  variant = 'standard',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Shorts (9:16) need different poster URL logic sometimes, but maxresdefault usually works if available.
  // Standard (16:9) uses standard logic.

  const poster = useMemo(() => {
    // Use mqdefault for smaller size, upgrade to hqdefault for high DPI displays
    const lowResPoster = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    const highResPoster = `https://i.ytimg.com/vi/${id}/${posterQuality}.jpg`;

    return {
      lowRes: lowResPoster,
      highRes: highResPoster,
    };
  }, [id, posterQuality]);

  const warmConnections = useCallback(() => {
    addPreconnect('https://www.youtube-nocookie.com');
    addPreconnect('https://www.youtube.com');
    addPreconnect('https://i.ytimg.com');
    addPreconnect('https://s.ytimg.com');
  }, []);

  const onActivate = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // aspect-ratio padding
  // standard 16:9 = 56.25%
  // short 9:16 = 177.78%
  const paddingBottom = variant === 'short' ? '177.78%' : '56.25%';

  return (
    <div
      className={`relative w-full bg-black overflow-hidden rounded-xl ${className}`}
      onPointerOver={warmConnections}
      onFocus={warmConnections}
    >
      <div className="relative w-full h-0" style={{ paddingBottom }}>
        {!isPlaying ? (
          <button
            type="button"
            onClick={onActivate}
            className="group absolute inset-0 block w-full h-full focus:outline-none"
            aria-label={`Play: ${title}`}
          >
            {/* Poster */}
            <img
              src={poster.lowRes}
              srcSet={`${poster.lowRes} 320w, ${poster.highRes} 640w`}
              sizes="(max-width: 640px) 320px, 640px"
              alt="Video thumbnail preview"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" aria-hidden="true" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 group-hover:bg-white text-sport-dark shadow-xl transition-transform group-hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="sm:w-7 sm:h-7">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </span>
            </div>
          </button>
        ) : (
          <iframe
            className="absolute inset-0 w-full h-full"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&${params}`}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
    </div>
  );
};

export default LiteYouTube;
