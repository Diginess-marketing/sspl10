import { forwardRef } from 'react';
import type { ForwardedRef, MutableRefObject } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_WORDMARK_ALT = 'Southern Street Premier League T10 Logo';
const DEFAULT_WORDMARK_SIZES = '(max-width: 640px) 96px, (max-width: 1024px) 128px, 160px';
const DESKTOP_MEDIA = '(min-width: 1024px)';

type WordmarkProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
};

function assignRef<T>(ref: ForwardedRef<T>, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    (ref as MutableRefObject<T>).current = value;
  }
}

const SSPLWordmark = forwardRef<HTMLImageElement, WordmarkProps>(
  (
    {
      className,
      priority = false,
      sizes = DEFAULT_WORDMARK_SIZES,
      alt = DEFAULT_WORDMARK_ALT,
      loading,
      width = 160,
      height = 146,
    },
    ref,
  ) => {
    const mergedLoading = priority ? 'eager' : loading ?? 'lazy';

    const handleRef = (node: HTMLImageElement | null) => {
      assignRef(ref, node);
      if (node && priority) {
        node.setAttribute('fetchpriority', 'high');
      }
    };

    return (
      <picture>
        <source
          type="image/avif"
          srcSet="/ssplt10-logo-96w.avif 96w, /ssplt10-logo-128w.avif 128w, /ssplt10-logo-192w.avif 192w, /ssplt10-logo-480w.avif 480w, /ssplt10-logo-768w.avif 768w, /ssplt10-logo.avif 1280w"
          sizes={sizes}
        />
        <source
          type="image/webp"
          srcSet="/ssplt10-logo-96w.webp 96w, /ssplt10-logo-128w.webp 128w, /ssplt10-logo-192w.webp 192w, /ssplt10-logo-480w.webp 480w, /ssplt10-logo-768w.webp 768w, /ssplt10-logo.webp 1280w"
          sizes={sizes}
        />
        <source
          type="image/png"
          srcSet="/ssplt10-logo-96w.png 96w, /ssplt10-logo-128w.png 128w, /ssplt10-logo-192w.png 192w, /ssplt10-logo-480w.png 480w, /ssplt10-logo-768w.png 768w, /ssplt10-logo.png 1280w"
          sizes={sizes}
        />
        <img
          src="/ssplt10-logo-96w.png"
          alt={alt}
          className={cn('object-contain', className)}
          loading={mergedLoading}
          width={width}
          height={height}
          ref={handleRef}
        />
      </picture>
    );
  },
);

SSPLWordmark.displayName = 'SSPLWordmark';

export {
  SSPLWordmark,
  DEFAULT_WORDMARK_ALT as SSPL_WORDMARK_ALT,
  DEFAULT_WORDMARK_SIZES as SSPL_WORDMARK_DEFAULT_SIZES,
};
export default SSPLWordmark;
