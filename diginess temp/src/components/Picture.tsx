import * as React from 'react';
import { cn } from '@/lib/utils';

export type PictureProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> & {
  src: string;
  alt: string;
  className?: string;
  /** If true, prepend <source> for .avif and .webp siblings of the src */
  useNextGen?: boolean;
  /** Force .avif/.webp URLs (if not simply sibling extension) */
  avifSrc?: string;
  webpSrc?: string;
  /** Sizes attribute for responsive layouts */
  sizes?: string;
};

/**
 * Simple <Picture> component that serves AVIF/WebP when available using sibling files.
 * Given foo.png, this will attempt foo.avif and foo.webp first.
 */
export const Picture = React.forwardRef<HTMLImageElement, PictureProps>(
  (
    {
      src,
      alt,
      className,
      useNextGen = true,
      avifSrc,
      webpSrc,
      sizes,
      loading = 'lazy',
      decoding = 'async',
      ...imgProps
    },
    ref,
  ) => {
    const makeSibling = React.useCallback(
      (targetExt: 'avif' | 'webp') => {
        const dot = src.lastIndexOf('.');
        if (dot <= 0) return '';
        return `${src.slice(0, dot)}.${targetExt}`;
      },
      [src],
    );

  const avif = avifSrc || (useNextGen ? makeSibling('avif') : '');
  const webp = webpSrc || (useNextGen ? makeSibling('webp') : '');
  const enc = (u: string) => (u ? encodeURI(u) : '');

    return (
      <picture className={cn(className)}>
        {useNextGen && avif ? (
          <source type="image/avif" srcSet={enc(avif)} sizes={sizes} />
        ) : null}
        {useNextGen && webp ? (
          <source type="image/webp" srcSet={enc(webp)} sizes={sizes} />
        ) : null}
        <img
          ref={ref}
          src={enc(src)}
          alt={alt}
          loading={loading}
          decoding={decoding as any}
          sizes={sizes}
          {...imgProps}
        />
      </picture>
    );
  },
);

Picture.displayName = 'Picture';

export default Picture;
