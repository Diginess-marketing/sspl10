import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import HorizontalStatCards from './HorizontalStatCards';
import PlayerCarousel from './PlayerCarousel';
import AuctionHeroAnnouncement from './AuctionHeroAnnouncement';

// Banner data with responsive sources
const bannerSets = [
  {
    id: 'banner-1',
    alt: 'SSPL T10 Banner 1',
    desktop: {
      avif: [
        '/assets/banners/1-480w.avif 480w',
        '/assets/banners/1-768w.avif 768w',
        '/assets/banners/1-1080w.avif 1080w',
        '/assets/banners/1-1280w.avif 1280w',
        '/assets/banners/1-1920w.avif 1920w',
      ].join(', '),
      webp: [
        '/assets/banners/1-480w.webp 480w',
        '/assets/banners/1-768w.webp 768w',
        '/assets/banners/1-1080w.webp 1080w',
        '/assets/banners/1-1280w.webp 1280w',
        '/assets/banners/1-1920w.webp 1920w',
      ].join(', '),
      fallback: '/assets/banners/1.webp',
    },
    mobile: {
      avif: [
        '/assets/banners/hero-mobile-1-480w.avif 480w',
        '/assets/banners/hero-mobile-1-768w.avif 768w',
        '/assets/banners/hero-mobile-1-1024w.avif 1024w',
      ].join(', '),
      webp: [
        '/assets/banners/hero-mobile-1-480w.webp 480w',
        '/assets/banners/hero-mobile-1-768w.webp 768w',
        '/assets/banners/hero-mobile-1-1024w.webp 1024w',
      ].join(', '),
      fallback: '/assets/banners/hero-mobile-1.webp',
    },
  },
  {
    id: 'banner-2',
    alt: 'SSPL T10 Banner 2',
    desktop: {
      avif: [
        '/assets/banners/2-480w.avif 480w',
        '/assets/banners/2-768w.avif 768w',
        '/assets/banners/2-1080w.avif 1080w',
        '/assets/banners/2-1280w.avif 1280w',
        '/assets/banners/2-1920w.avif 1920w',
      ].join(', '),
      webp: [
        '/assets/banners/2-480w.webp 480w',
        '/assets/banners/2-768w.webp 768w',
        '/assets/banners/2-1080w.webp 1080w',
        '/assets/banners/2-1280w.webp 1280w',
        '/assets/banners/2-1920w.webp 1920w',
      ].join(', '),
      fallback: '/assets/banners/2.webp',
    },
    mobile: {
      avif: [
        '/assets/banners/hero-mobile-2-480w.avif 480w',
        '/assets/banners/hero-mobile-2-768w.avif 768w',
        '/assets/banners/hero-mobile-2-1024w.avif 1024w',
      ].join(', '),
      webp: [
        '/assets/banners/hero-mobile-2-480w.webp 480w',
        '/assets/banners/hero-mobile-2-768w.webp 768w',
        '/assets/banners/hero-mobile-2-1024w.webp 1024w',
      ].join(', '),
      fallback: '/assets/banners/hero-mobile-2.webp',
    },
  },
  {
    id: 'banner-3',
    alt: 'SSPL T10 Voucher Banner',
    desktop: {
      avif: [
        '/assets/banners/3-480w.avif 480w',
        '/assets/banners/3-768w.avif 768w',
        '/assets/banners/3-1280w.avif 1280w',
        '/assets/banners/3-1920w.avif 1920w',
      ].join(', '),
      webp: [
        '/assets/banners/3-480w.webp 480w',
        '/assets/banners/3-768w.webp 768w',
        '/assets/banners/3-1280w.webp 1280w',
        '/assets/banners/3-1920w.webp 1920w',
      ].join(', '),
      fallback: '/assets/banners/3-desktop.jpg',
    },
    mobile: {
      avif: [
        '/assets/banners/hero-mobile-3-480w.avif 480w',
        '/assets/banners/hero-mobile-3-768w.avif 768w',
        '/assets/banners/hero-mobile-3-1024w.avif 1024w',
      ].join(', '),
      webp: [
        '/assets/banners/hero-mobile-3-480w.webp 480w',
        '/assets/banners/hero-mobile-3-768w.webp 768w',
        '/assets/banners/hero-mobile-3-1024w.webp 1024w',
      ].join(', '),
      fallback: '/assets/banners/hero-mobile-3.webp',
    },
  },
  {
    id: 'desktop-1',
    alt: 'SSPL T10 Desktop Banner',
    desktop: {
      avif: [
        '/assets/banners/desktop-1-1080w.avif 1080w',
        '/assets/banners/desktop-1-1280w.avif 1280w',
        '/assets/banners/desktop-1-1920w.avif 1920w',
      ].join(', '),
      webp: [
        '/assets/banners/desktop-1-1080w.webp 1080w',
        '/assets/banners/desktop-1-1280w.webp 1280w',
        '/assets/banners/desktop-1-1920w.webp 1920w',
      ].join(', '),
      fallback: '/assets/banners/desktop-1-1920w.webp',
    },
    mobile: {
      avif: [
        '/assets/banners/mobile-1-480w.avif 480w',
        '/assets/banners/mobile-1-768w.avif 768w',
      ].join(', '),
      webp: [
        '/assets/banners/mobile-1-480w.webp 480w',
        '/assets/banners/mobile-1-768w.webp 768w',
      ].join(', '),
      fallback: '/assets/banners/mobile-1-768w.webp',
    },
  },
  {
    id: 'desktop-2',
    alt: 'SSPL T10 Desktop Banner 2',
    desktop: {
      avif: [
        '/assets/banners/desktop-2-1080w.avif 1080w',
        '/assets/banners/desktop-2-1280w.avif 1280w',
        '/assets/banners/desktop-2-1920w.avif 1920w',
      ].join(', '),
      webp: [
        '/assets/banners/desktop-2-1080w.webp 1080w',
        '/assets/banners/desktop-2-1280w.webp 1280w',
        '/assets/banners/desktop-2-1920w.webp 1920w',
      ].join(', '),
      fallback: '/assets/banners/desktop-2-1920w.webp',
    },
    mobile: {
      avif: [
        '/assets/banners/mobile-2-480w.avif 480w',
        '/assets/banners/mobile-2-768w.avif 768w',
      ].join(', '),
      webp: [
        '/assets/banners/mobile-2-480w.webp 480w',
        '/assets/banners/mobile-2-768w.webp 768w',
      ].join(', '),
      fallback: '/assets/banners/mobile-2-768w.webp',
    },
  },
];

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayBanners = bannerSets;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  }, [displayBanners.length]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const scrollToAuctionResults = useCallback(() => {
    const target = document.getElementById('auction-results');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section
      className="relative w-full pt-1 pb-2 md:pt-2 md:pb-3 flex flex-col items-center justify-start overflow-hidden bg-transparent"
      id="hero"
    >
      {/* Cobalt Blue Semi-Transparent Unified Container */}
      <div
        className="relative z-10 w-[96%] max-w-[1536px] mx-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(0, 71, 171, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Inner padding for the unified container */}
        <div className="p-3 md:p-5">
          {/* Auction Results Announcement Poster / Notification - Top of Hero */}
          <div className="relative z-20 w-full mb-3 md:mb-4">
            <AuctionHeroAnnouncement onScrollToResults={scrollToAuctionResults} />
          </div>

          {/* Hero Carousel Container */}
          <div className="relative w-full aspect-[3/4] md:aspect-[21/9] overflow-hidden rounded-xl shadow-2xl border border-white/15 bg-[#0b0e14]">
            <motion.div
              className="flex h-full w-full"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              {displayBanners.map((banner, idx) => {
                const source = isMobile ? banner.mobile : banner.desktop;
                return (
                  <div key={banner.id} className="w-full h-full flex-shrink-0">
                    <picture>
                      <source
                        srcSet={source.avif}
                        type="image/avif"
                        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 95vw, 1500px"
                      />
                      <source
                        srcSet={source.webp}
                        type="image/webp"
                        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 95vw, 1500px"
                      />
                      <img
                        src={source.fallback}
                        alt={banner.alt}
                        className={cn(
                          "w-full h-full",
                          banner.id === 'banner-3' ? "object-contain bg-black" : "object-cover"
                        )}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        decoding={idx === 0 ? 'sync' : 'async'}
                      />
                    </picture>
                  </div>
                );
              })}
            </motion.div>

            {/* HUD - Next Previews & Index */}
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-30 flex items-end gap-4 pointer-events-none">
              {/* Index Indicator */}
              <div className="flex flex-col items-center mb-0 md:mb-1">
                <span className="text-[40px] md:text-[80px] font-black leading-none opacity-10 tracking-tighter text-white select-none">
                  0{currentSlide + 1}
                </span>
              </div>

              {/* Preview Thumbnails */}
              <div className="flex gap-2 md:gap-4 pointer-events-auto">
                {[1, 2].map((offset) => {
                  const nextIdx = (currentSlide + offset) % displayBanners.length;
                  const thumbSource = isMobile ? displayBanners[nextIdx].mobile : displayBanners[nextIdx].desktop;
                  return (
                    <motion.div
                      key={displayBanners[nextIdx].id}
                      whileHover={{ scale: 1.05, translateY: -5 }}
                      onClick={() => setCurrentSlide(nextIdx)}
                      className="relative w-24 h-14 md:w-44 md:h-28 rounded-xl overflow-hidden border border-white/20 cursor-pointer shadow-2xl group transition-all"
                    >
                      <img
                        src={thumbSource.fallback}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                        alt={`Preview ${nextIdx + 1}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 border border-white/0 group-hover:border-[#CCFF00]/50 rounded-xl transition-colors" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={goToPreviousSlide}
              aria-label="Previous banner"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/55 border border-white/25 text-white flex items-center justify-center transition-colors shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              aria-label="Next banner"
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/55 border border-white/25 text-white flex items-center justify-center transition-colors shadow-lg"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Carousel Indicators - Hidden on mobile */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 z-20">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'bg-[#CCFF00] w-6' : 'bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Cards - Moved slightly upwards */}
          <div className="relative z-20 w-full mt-3 md:mt-4">
            <HorizontalStatCards />
          </div>

          {/* Features List Section - Brought upwards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full mt-1 md:mt-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8 px-2">
              {[
                "Get discovered by top teams",
                "Age 12 years & Above",
                "Massive cash prizes up for grabs",
                "Exclusive chance to go pro",
                "Play in Sharjah's world-class stadium",
                "Showcase sports league"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 text-white/95">
                  <div className="flex-shrink-0 w-5 h-5 rounded-md bg-[#CCFF00]/20 flex items-center justify-center border border-[#CCFF00]/40">
                    <svg width="12" height="9" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.5L4.66667 9.5L13 1" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[15px] md:text-[16px] font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="w-full mt-4">
        <PlayerCarousel />
      </div>
    </section>
  );
};

HeroSection.displayName = 'HeroSection';

export default HeroSection;
