import React from 'react';

type Format = 'avif' | 'webp' | 'png' | 'jpg' | 'jpeg';

export interface ResponsivePictureProps {
  baseName: string; // e.g., "/ravi mohan home with bg"
  widths?: number[]; // e.g., [480, 768, 1024, 1280, 1920]
  formats?: Format[]; // default: ["avif", "webp"]
  // Use string to preserve original case (e.g., PNG vs png) when needed
  fallbackExt?: string; // default: "webp"
  sizes?: string; // default: "100vw"
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean; // eager load if true
  width?: number;
  height?: number;
  /** Optional error handler for the fallback <img> */
  onError?: React.ReactEventHandler<HTMLImageElement>;
  /** Optional load handler for debugging */
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  /** Optional debug mode to log image loading details */
  debug?: boolean;
}

/**
 * Responsive <picture> builder that assumes files follow the pattern:
 *   `${baseName}-${width}w.${format}` and `${baseName}.${fallbackExt}`
 * baseName should be a public path beginning with '/'.
 */
const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  baseName,
  widths = [480, 768, 1024, 1280, 1920],
  formats = ['webp', 'avif'],
  fallbackExt = 'webp',
  sizes = '100vw',
  alt = '',
  className = '',
  imgClassName = '',
  priority = false,
  width,
  height,
  onError,
  onLoad,
  debug = false,
}) => {
  // Sanitize baseName: replace spaces with dashes to match Vite build output
  const safeBaseName = baseName.replace(/\s+/g, '-');

  if (debug) {
  }

  const makeSrcSet = (ext: Format) =>
    widths
      .map((w) => `${encodeURI(`${safeBaseName}-${w}w.${ext}`)} ${w}w`)
      .join(', ');

  const loading = priority ? 'eager' : 'lazy';
  const fetchpriority = priority ? 'high' : (undefined as any);

  if (debug) {
  }

  return (
    <picture className={className}>
      {/* AVIF first - best compression (50% smaller than WebP) */}
      {formats.includes('avif') && (
        <source type="image/avif" srcSet={makeSrcSet('avif')} sizes={sizes} />
      )}
      {/* WebP second - good compression, wide support */}
      {formats.includes('webp') && (
        <source type="image/webp" srcSet={makeSrcSet('webp')} sizes={sizes} />
      )}
      {/* Fallback img - widest compatibility */}
      <img
        src={encodeURI(`${safeBaseName}.${fallbackExt}`)}
        alt={alt}
        className={imgClassName}
        loading={loading as any}
        decoding="async"
        {...(fetchpriority ? { fetchpriority } : {})}
        {...(width ? { width } : {})}
        {...(height ? { height } : {})}
        onError={onError}
        onLoad={onLoad}
        aria-hidden={alt ? undefined : true}
        draggable={false}
      />
    </picture>
  );
};

export default ResponsivePicture;
