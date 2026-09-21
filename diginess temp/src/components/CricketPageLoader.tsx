import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import SSPLWordmark from '@/components/SSPLWordmark';
import './CricketPageLoader.css';

/**
 * CricketPageLoader Component - Futuristic Design
 *
 * An innovative cricket-themed page loader featuring:
 * - SSPL logo with holographic effects
 * - Ball image with orbital animations
 * - Futuristic particle system
 * - Dynamic color transitions
 * - Responsive design
 * - Accessibility features
 * - Performance optimizations
 */

interface CricketPageLoaderProps {
  /** Whether the loader is currently visible */
  isLoading?: boolean;
  /** Custom message to display */
  message?: string;
  /** Custom className for styling */
  className?: string;
  /** Size variant for different contexts */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show the stadium background */
  showStadium?: boolean;
  /** Custom logo URL (defaults to SSPL logo) */
  logoUrl?: string;
}

const DEFAULT_LOADER_LOGO = '/logo-192w.png';
const PARTICLE_INDICES = Array.from({ length: 20 }, (_, i) => i);

const CricketPageLoader: React.FC<CricketPageLoaderProps> = ({
  isLoading = true,
  message = 'Preparing the arena...',
  className,
  size = 'lg',
  showStadium = true,
  logoUrl = DEFAULT_LOADER_LOGO,
}) => {
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Memoized size configurations with responsive breakpoints
  const sizeConfig = useMemo(() => ({
    sm: {
      container: 'h-32 sm:h-40',
      logo: 'w-8 h-8 sm:w-10 sm:h-10',
      ball: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
      wicket: 'w-16 h-8 sm:w-20 sm:h-10',
    },
    md: {
      container: 'h-48 sm:h-56 md:h-64',
      logo: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
      ball: 'w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5',
      wicket: 'w-24 h-12 sm:w-28 sm:h-14 md:w-32 md:h-16',
    },
    lg: {
      container: 'h-64 sm:h-72 md:h-80 lg:h-96',
      logo: 'w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24',
      ball: 'w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 lg:w-6.5 lg:h-6.5',
      wicket: 'w-32 h-16 sm:w-36 sm:h-18 md:w-40 md:h-20 lg:w-44 lg:h-22',
    },
    xl: {
      container: 'h-96 sm:h-112 md:h-128 lg:h-144 xl:h-160',
      logo: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40',
      ball: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10',
      wicket: 'w-40 h-20 sm:w-48 sm:h-24 md:w-56 md:h-28 lg:w-64 lg:h-32 xl:w-72 xl:h-36',
    },
  }), []);

  // Progress animation with performance optimization
  useEffect(() => {
    if (!isLoading) return;

    let animationFrame: number;
    let startTime: number;
    const duration = 3000; // 3 seconds for smooth loading

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until actually loaded

      setProgress(progress);

      if (elapsed < duration && isLoading) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isLoading]);

  // Reset progress when loading starts
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty('--cricket-loader-progress', `${progress}%`);
  }, [progress]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    return () => {
      root.style.removeProperty('--cricket-loader-progress');
    };
  }, []);

  if (!isLoading) return null;

  const config = sizeConfig[size];
  const loaderLogoSizes = '(max-width: 640px) 80px, (max-width: 768px) 96px, 112px';
  const logoContent = logoUrl === DEFAULT_LOADER_LOGO ? (
    <SSPLWordmark
      className={cn(
        'relative z-10 object-contain drop-shadow-2xl',
        'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
      )}
      sizes={loaderLogoSizes}
      priority
    />
  ) : (
    <img
      src={logoUrl}
      alt="Southern Street Premier League T10 Logo"
      className={cn(
        'relative z-10 object-contain drop-shadow-2xl',
        'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
      )}
      sizes={loaderLogoSizes}
      loading="eager"
    />
  );

  return (
    <div
      className={cn(
        'fixed inset-0 z-max flex items-center justify-center',
        'bg-linear-to-br from-slate-900 via-purple-900 to-slate-900',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading cricket content"
    >
      {/* Futuristic Background with Animated Grid */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 animate-pulse" />
        
        {/* Grid pattern overlay */}
        <div
          className={cn(
            'absolute inset-0 loader-grid-overlay',
            !isReducedMotion && 'loader-grid-overlay-animated',
          )}
        />

        {/* Floating particles */}
        {!isReducedMotion && (
          <div className="loader-particles absolute inset-0 overflow-hidden">
            {PARTICLE_INDICES.map((index) => (
              <div key={index} className="loader-particle" />
            ))}
          </div>
        )}

        {/* Radial gradient glow effect */}
        <div
          className={cn(
            'absolute inset-0 opacity-20 loader-radial-glow',
            !isReducedMotion && 'loader-radial-glow-animated',
          )}
        />
      </div>

      {/* Main Loader Container - Futuristic */}
      <div className={cn(
        'relative flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10',
        'p-8 sm:p-12 md:p-16 rounded-3xl',
        'backdrop-blur-xl bg-linear-to-br from-white/5 via-purple-500/5 to-white/5',
        'border border-purple-400/30 shadow-2xl',
        'max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto',
        config.container,
      )}>
        {/* Holographic Ring Effect */}
        <div className="absolute inset-0 rounded-3xl border border-purple-400/20 animate-spin animation-duration-[20000ms] [animation-direction:reverse]" />
        <div className="absolute inset-2 rounded-3xl border border-blue-400/10 animate-spin animation-duration-[15000ms]" />

        {/* Central Orbital System */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
          
          {/* Outer Orbital Ring 1 */}
          <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-spin animation-duration-[8000ms]">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
          </div>

          {/* Outer Orbital Ring 2 */}
          <div className="absolute inset-4 border border-blue-500/30 rounded-full animate-spin animation-duration-[10000ms] [animation-direction:reverse]">
            <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
          </div>

          {/* Outer Orbital Ring 3 */}
          <div className="absolute inset-8 border border-cyan-500/30 rounded-full animate-spin animation-duration-[12000ms]">
            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
          </div>

          {/* Center Circle - SSPL Logo */}
          <div className="relative z-20 flex flex-col items-center justify-center space-y-4">
            {/* Logo Container with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-60 animate-[pulse_2s_ease-in-out_infinite]" />
              {logoContent}
            </div>

            {/* Ball Image with Pulse Animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-40 animate-[pulse_1500ms_ease-in-out_infinite]" />
              <picture>
                <source
                  srcSet={`
                    /image_3-480w.avif 480w,
                    /image_3-768w.avif 768w,
                    /image_3-1024w.avif 1024w,
                    /image_3-1280w.avif 1280w,
                    /image_3-1920w.avif 1920w
                  `}
                  type="image/avif"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                />
                <source
                  srcSet={`
                    /image_3-480w.webp 480w,
                    /image_3-768w.webp 768w,
                    /image_3-1024w.webp 1024w,
                    /image_3-1280w.webp 1280w,
                    /image_3-1920w.webp 1920w
                  `}
                  type="image/webp"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                />
                <img
                  src="/image_3.webp"
                  alt="SSPL T10 Tennis Ball"
                  className={cn(
                    'relative z-10 object-contain drop-shadow-2xl',
                    'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
                  )}
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  loading="eager"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Loading Message with Typing Animation */}
        <div className="text-center space-y-4 px-4 relative z-10">
          <p className={cn(
            'text-lg sm:text-xl md:text-2xl font-bold',
            'bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent',
            !isReducedMotion && 'animate-pulse',
          )}>
            {message}
          </p>

          {/* Animated Progress Bar */}
          <div className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-1.5 bg-linear-to-r from-purple-900/50 to-blue-900/50 rounded-full overflow-hidden mx-auto border border-purple-500/30">
            <div
              className="loader-progress-fill h-full bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full transition-all duration-300 ease-out transform-gpu shadow-lg shadow-purple-400/50"
            />
          </div>

          {/* Progress Text */}
          <p className="text-sm sm:text-base text-purple-300/80 font-semibold">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Animated Loading Dots */}
        <div className="flex items-center justify-center space-x-3 relative z-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full bg-linear-to-r from-purple-400 to-blue-400 shadow-lg shadow-purple-400/50 ${!isReducedMotion ? `animate-[bounce_1.4s_ease-in-out_infinite] animation-delay-[${Math.round(i * 200)}ms]` : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        Loading cricket content, please wait... {Math.round(progress)}% complete
      </div>

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sport-orange text-white px-4 py-2 rounded-lg z-50 font-medium"
        onClick={(e) => {
          e.preventDefault();
          // Find main content and focus it
          const mainContent = document.getElementById('main-content') || document.querySelector('main');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        Skip loading screen
      </a>
    </div>
  );
};

export default CricketPageLoader;