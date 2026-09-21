import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

// Types
interface CricketTrialsAnnouncement {
  title: string;
  venue: string;
  date: string;
  body: string;
  callout: string;
  ctaText: string;
}

interface CricketTrialsBannerProps {
  announcement: CricketTrialsAnnouncement;
  onRegister: () => void;
  onClose?: () => void;
  isVisible?: boolean;
  showCloseButton?: boolean;
  apiEndpoint?: string;
  className?: string;
}

// SVG Components
const CricketBallIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    aria-hidden="true"
    role="img"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth="2"
    />
    <path
      d="M50 5 L50 95 M5 50 L95 50"
      stroke="#991b1b"
      strokeWidth="3"
      opacity="0.8"
    />
    <path
      d="M25 25 L75 75 M75 25 L25 75"
      stroke="#991b1b"
      strokeWidth="2"
      opacity="0.6"
    />
    <circle cx="50" cy="50" r="8" fill="#991b1b" opacity="0.9" />
  </svg>
);

const CricketBatIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 200"
    className={className}
    aria-hidden="true"
    role="img"
  >
    <ellipse
      cx="50"
      cy="180"
      rx="25"
      ry="15"
      fill="#8b4513"
      stroke="#654321"
      strokeWidth="2"
    />
    <rect
      x="35"
      y="20"
      width="30"
      height="160"
      rx="15"
      fill="#a0522d"
      stroke="#8b4513"
      strokeWidth="2"
    />
    <rect
      x="40"
      y="30"
      width="20"
      height="140"
      rx="10"
      fill="#cd853f"
      opacity="0.8"
    />
    <path
      d="M30 40 Q50 35 70 40"
      stroke="#8b4513"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 60 Q50 55 70 60"
      stroke="#8b4513"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const CricketTrialsBanner: React.FC<CricketTrialsBannerProps> = ({
  announcement,
  onRegister,
  onClose,
  isVisible: controlledIsVisible,
  showCloseButton = true,
  apiEndpoint,
  className = '',
}) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Use controlled visibility if provided, otherwise use internal state
  const isVisible = controlledIsVisible !== undefined ? controlledIsVisible : internalIsVisible;

  // Handle close button click
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsVisible(false);
    }
  };

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setInternalIsVisible(true);
    }, 100);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  const animationClass = prefersReducedMotion ? 'opacity-100' : 'animate-fade-in';
  const ballAnimationClass = prefersReducedMotion ? 'opacity-100' : 'animate-bounce-in';
  const textAnimationClass = prefersReducedMotion ? 'opacity-100' : 'animate-slide-in';
  const ctaAnimationClass = prefersReducedMotion ? 'opacity-100 scale-100' : 'animate-scale-in';

  return (
    <>
      {/* Main animated component */}
      <section
        className={`w-full ${className} ${isVisible ? animationClass : 'opacity-0'}`}
        aria-label="Cricket Trials Announcement"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl glass-card animate-modal-appear"
            role="banner"
            aria-labelledby="trials-title"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-90">
              <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-400 rounded-full blur-xl" />
            </div>

            {/* Close Button - Positioned to avoid overlap with Players awaiting badge */}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Close banner"
              >
                <svg
                  className="w-5 h-5 text-gray-600 hover:text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Background overlay for modal effect */}
            <div className="absolute inset-0 bg-linear-to-br from-white/95 via-sspl-orange/5 to-sspl-navy/5 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-2xl"></div>

            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-4 h-4 bg-sspl-orange rounded-full opacity-20 animate-pulse-gentle"></div>
              <div className="absolute top-20 right-20 w-6 h-6 bg-sspl-navy rounded-full opacity-15 animate-pulse-gentle animation-delay-[1000ms]"></div>
              <div className="absolute bottom-10 left-20 w-3 h-3 bg-sspl-orange rounded-full opacity-25 animate-pulse-gentle animation-delay-[2000ms]"></div>
            </div>

            {/* Centered bouncing cricket ball */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 animate-bounce z-0 opacity-10">
              <img
                src="/image_3.png"
                alt="Cricket Ball"
                className="w-full h-full object-contain animate-slow-spin drop-shadow-xl"
              />
            </div>

            <div className="relative p-6 sm:p-8 lg:p-10 text-center space-y-6 z-10">
              {/* Content - Center */}
              <div className="space-y-4">
                <div className={`transition-all duration-500 ${isVisible ? textAnimationClass : 'opacity-0'}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sspl-orange/10 border border-sspl-orange/20 text-sspl-orange text-sm font-bold tracking-wider uppercase mb-3 shadow-sm">
                    <Users className="w-4 h-4" />
                    {announcement.callout}
                  </div>
                </div>

                <h2
                  id="trials-title"
                  className={`text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight transition-all duration-500 drop-shadow-sm ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  {announcement.title}
                </h2>

                <div
                  className={`space-y-2 text-slate-600 transition-all duration-500 delay-100 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-sspl-orange">
                    <MapPin className="w-5 h-5 text-slate-700" />
                    {announcement.venue}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg font-bold text-sspl-navy">
                    <Calendar className="w-5 h-5 text-slate-700" />
                    {announcement.date}
                  </div>
                </div>

                <p
                  className={`text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto transition-all duration-500 delay-200 ${isVisible ? textAnimationClass : 'opacity-0'}`}
                >
                  {announcement.body}
                </p>

                {/* CTA Button */}
                <div
                  className={`flex justify-center transition-all duration-500 delay-300 ${isVisible ? ctaAnimationClass : 'opacity-0 scale-75'}`}
                >
                  <button
                    onClick={onRegister}
                    className="group relative bg-sspl-orange text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sspl-orange/50 min-w-40 text-center hover:scale-105 active:scale-95"
                    aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                  >
                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
                      <span className="hidden sm:inline">{announcement.ctaText}</span>
                      <span className="sm:hidden">Register</span>
                    </span>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-full bg-slate-900 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NoScript fallback */}
      <noscript>
        <section className={`w-full ${className}`} role="banner" aria-labelledby="trials-title-fallback">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-sspl-navy border border-sspl-orange/30 shadow-xl rounded-2xl p-6 sm:p-8 lg:p-10">
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg transition-all duration-200"
                  aria-label="Close banner"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  {announcement.callout}
                </div>

                <h2 id="trials-title-fallback" className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
                  Upcoming Trials!
                </h2>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-700">
                    <MapPin className="w-5 h-5" />
                    Coming Soon
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-green-700">
                    <Calendar className="w-5 h-5" />
                    Dates to be announced
                  </div>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  {announcement.body}
                </p>

                <button
                  onClick={onRegister}
                  className="bg-linear-to-r from-blue-600 to-green-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                  aria-label={`Register for ${announcement.title} at ${announcement.venue}`}
                >
                  {announcement.ctaText}
                </button>
              </div>
            </div>
          </div>
        </section>
      </noscript>
    </>
  );
};

export default CricketTrialsBanner;

// Export types for reuse
export type { CricketTrialsAnnouncement, CricketTrialsBannerProps };

// Export SVG components for reuse
export { CricketBallIcon, CricketBatIcon };