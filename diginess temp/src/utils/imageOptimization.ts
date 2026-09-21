/**
 * Comprehensive Image Optimization Utility
 * Handles format conversion, compression, responsive sizing, and CDN integration
 */

export interface ImageOptimizationConfig {
  formats: ('webp' | 'avif' | 'jpg' | 'png' | 'svg')[];
  quality: number;
  sizes: number[];
  lazy: boolean;
  placeholder: 'blur' | 'empty' | 'data';
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
}

// Image format presets for different use cases
export const IMAGE_PRESETS = {
  thumbnail: {
    formats: ['webp', 'jpg'] as const,
    quality: 75,
    sizes: [150, 300],
    lazy: true,
    placeholder: 'blur' as const,
  },
  hero: {
    formats: ['avif', 'webp', 'jpg'] as const,
    quality: 85,
    sizes: [640, 1280, 1920],
    lazy: false,
    placeholder: 'blur' as const,
  },
  gallery: {
    formats: ['webp', 'jpg'] as const,
    quality: 80,
    sizes: [400, 800, 1200],
    lazy: true,
    placeholder: 'blur' as const,
  },
  card: {
    formats: ['webp', 'jpg'] as const,
    quality: 78,
    sizes: [300, 600],
    lazy: true,
    placeholder: 'empty' as const,
  },
  icon: {
    formats: ['svg', 'webp'] as const,
    quality: 90,
    sizes: [32, 64, 128],
    lazy: true,
    placeholder: 'empty' as const,
  },
  avatar: {
    formats: ['webp', 'jpg'] as const,
    quality: 80,
    sizes: [64, 128, 256],
    lazy: true,
    placeholder: 'empty' as const,
  },
};

// CDN and Image Optimization Configuration
export const IMAGE_CDN_CONFIG = {
  // Cloudinary configuration (use environment variables)
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ssplt10',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  } as CloudinaryConfig,

  // Image transformation settings
  transformations: {
    quality: 'auto',
    fetch_format: 'auto',
    gravity: 'auto',
    dpr: 'auto',
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1920,
  },

  // Image size presets
  sizes: {
    hero: { width: 1920, height: 600 },
    banner: { width: 1200, height: 400 },
    card: { width: 400, height: 300 },
    thumbnail: { width: 200, height: 200 },
    avatar: { width: 100, height: 100 },
    icon: { width: 64, height: 64 },
  },
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (
  basePath: string,
  sizes: number[],
  format: string,
): string => {
  return sizes
    .map((size) => `${basePath}?w=${size}&format=${format} ${size}w`)
    .join(', ');
};

/**
 * Calculate aspect ratio percentage for padding-bottom technique
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return (height / width) * 100;
};

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 */
export const generateLQIP = (imagePath: string): string => {
  return `${imagePath}?w=20&q=10&blur=10`;
};

/**
 * Generate Cloudinary URL with transformations
 */
export const generateCloudinaryUrl = (
  publicId: string,
  options: Record<string, any> = {},
): string => {
  if (!IMAGE_CDN_CONFIG.cloudinary.cloudName) {
    return publicId;
  }

  const baseUrl = `https://res.cloudinary.com/${IMAGE_CDN_CONFIG.cloudinary.cloudName}/image/upload`;

  const transformations = {
    ...IMAGE_CDN_CONFIG.transformations,
    ...options,
  };

  const transformString = Object.entries(transformations)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return `${baseUrl}/${transformString}/${publicId}`;
};

/**
 * Generate responsive image URL with specific width and quality
 */
export const generateResponsiveImageUrl = (
  publicId: string,
  width: number,
  quality: number = 85,
): string => {
  return generateCloudinaryUrl(publicId, {
    width,
    quality,
    fetch_format: 'auto',
  });
};

/**
 * Generate picture element for multi-format support
 */
export const generatePictureElement = (
  basePath: string,
  config: ImageOptimizationConfig,
  alt: string,
): string => {
  const formats = Array.isArray(config.formats)
    ? config.formats
    : [config.formats];

  let html = '<picture>';

  // Add source elements for each format (in order of preference)
  formats.forEach((format) => {
    if (format === 'svg') return; // SVG doesn't need srcset

    const srcSet = generateSrcSet(basePath, config.sizes, format);
    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    html += `\n  <source srcset="${srcSet}" type="${mimeType}" />`;
  });

  // Fallback image
  const fallbackSrcSet = generateSrcSet(basePath, config.sizes, 'jpg');
  html += `\n  <img src="${basePath}" srcset="${fallbackSrcSet}" alt="${alt}" loading="${config.lazy ? 'lazy' : 'eager'}" decoding="async" />`;
  html += '\n</picture>';

  return html;
};

/**
 * Get responsive image sizes string for picture element
 */
export const getResponsiveSizes = (preset: keyof typeof IMAGE_PRESETS = 'gallery'): string => {
  const breakpoints = IMAGE_CDN_CONFIG.breakpoints;

  const sizesMap: Record<string, string> = {
    thumbnail: '(max-width: 480px) 100px, 150px',
    hero: `(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 100vw, ${breakpoints.desktop}px`,
    gallery: `(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 50vw, 33vw`,
    card: `(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 50vw, 33vw`,
    icon: '64px',
    avatar: '(max-width: 480px) 64px, 100px',
  };

  return sizesMap[preset] || sizesMap.gallery;
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string, as: 'image' = 'image'): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.type = 'image/webp';
  document.head.appendChild(link);
};

/**
 * Prefetch images for likely next pages
 */
export const prefetchImages = (imagePaths: string[]): void => {
  if (typeof document === 'undefined') return;

  imagePaths.forEach((path) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
};

/**
 * Get image dimensions from URL
 */
export const getImageDimensions = (
  src: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();

    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };

    webP.src =
      'data:image/webp;base64,UklGRjoIAABXRUJQVlA4IC4BAAAQAQACDE+QRgEP/v+QAAA=';
  });
};

/**
 * Check if AVIF is supported
 */
export const isAVIFSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();

    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };

    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZGEA7K7KAAA/7QEUGQgaZgEADgfQ//wA/v+QAAA=';
  });
};

/**
 * Get supported image formats for current browser
 */
export const getSupportedFormats = async (): Promise<
  ('webp' | 'avif' | 'jpg')[]
> => {
  const formats: ('webp' | 'avif' | 'jpg')[] = ['jpg'];

  try {
    if (await isWebPSupported()) {
      formats.push('webp');
    }
  } catch {
  }

  try {
    if (await isAVIFSupported()) {
      formats.push('avif');
    }
  } catch {
  }

  return formats;
};

export default {
  IMAGE_PRESETS,
  IMAGE_CDN_CONFIG,
  generateSrcSet,
  calculateAspectRatio,
  generateLQIP,
  generateCloudinaryUrl,
  generateResponsiveImageUrl,
  generatePictureElement,
  getResponsiveSizes,
  preloadImage,
  prefetchImages,
  getImageDimensions,
  isWebPSupported,
  isAVIFSupported,
  getSupportedFormats,
};
