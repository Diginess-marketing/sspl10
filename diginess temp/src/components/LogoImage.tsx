import { forwardRef } from 'react';
import type { ForwardedRef, MutableRefObject } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_ICON_ALT = 'Southern Street Premier League T10 Logo';
const DEFAULT_ICON_SIZES = '(max-width: 640px) 44px, (max-width: 1024px) 56px, 64px';
const DESKTOP_MEDIA = '(min-width: 768px)';

type LogoImageProps = {
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

const LogoImage = forwardRef<HTMLImageElement, LogoImageProps>(
  (
    {
      className,
      priority = false,
      sizes = DEFAULT_ICON_SIZES,
      alt = DEFAULT_ICON_ALT,
      loading,
      width = 64,
      height = 64,
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
      <img
        src="/logo.png"
        alt={alt}
        className={cn('object-contain', className)}
        loading={mergedLoading}
        width={width}
        height={height}
        ref={handleRef}
      />
    );
  },
);

LogoImage.displayName = 'LogoImage';

export { LogoImage, DEFAULT_ICON_ALT as LOGO_IMAGE_ALT, DEFAULT_ICON_SIZES as LOGO_IMAGE_DEFAULT_SIZES };
export default LogoImage;
