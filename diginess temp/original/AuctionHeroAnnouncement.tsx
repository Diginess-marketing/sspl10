import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronDown, ArrowRight, Sparkles, X, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuctionHeroAnnouncementProps {
  onScrollToResults?: () => void;
}

const AuctionHeroAnnouncement: React.FC<AuctionHeroAnnouncementProps> = ({ onScrollToResults }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleScrollDown = () => {
    if (onScrollToResults) {
      onScrollToResults();
      return;
    }
    const target = document.getElementById('auction-results');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isMinimized ? (
        // Minimized floating pill
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="w-full mb-2 flex justify-end"
        >
          <button
            onClick={() => setIsMinimized(false)}
            aria-label="Expand announcement"
            style={{
              backgroundColor: '#CCFF00',
              color: '#000000',
              fontFamily: 'Montserrat, system-ui, sans-serif',
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black border border-black/20 shadow-[0_4px_15px_rgba(204,255,0,0.4)] transition-all cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
            </span>
            <Trophy size={14} style={{ color: '#000000' }} className="group-hover:scale-110 transition-transform" />
            <span style={{ color: '#000000', fontWeight: 900 }}>Auction Results are out!</span>
            <ChevronDown size={14} style={{ color: '#000000' }} className="animate-bounce" />
          </button>
        </motion.div>
      ) : (
        // Full Hero Announcement Poster / Notification
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="relative w-full rounded-xl md:rounded-2xl overflow-hidden border border-black/15 shadow-[0_10px_25px_rgba(0,0,0,0.3),0_0_20px_rgba(204,255,0,0.35)]"
          style={{
            background: 'linear-gradient(135deg, #CCFF00 0%, #D8FF33 50%, #B8E600 100%)',
            color: '#000000',
            fontFamily: 'Montserrat, system-ui, sans-serif',
          }}
        >
          {/* Subtle decorative background pattern */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/25 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-xl pointer-events-none" />

          {/* Close / Minimize Button */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize announcement"
              style={{ color: '#000000' }}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
              title="Minimize"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative z-10 px-3.5 py-2.5 md:px-6 md:py-3.5 pl-14 sm:pl-16 md:pl-20 pr-12 md:pr-14 flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4">
            
            {/* Left side: Trophy Icon & Text Announcement */}
            <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
              {/* Poster Icon Box - Visible on sm and up */}
              <div className="hidden sm:flex flex-shrink-0 w-10 h-10 md:w-13 md:h-13 rounded-xl bg-black/10 border border-black/15 items-center justify-center shadow-inner relative">
                <Trophy className="w-5 h-5 md:w-7 md:h-7" style={{ color: '#000000' }} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
                </span>
              </div>

              {/* Phrased Announcement Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span
                    style={{
                      backgroundColor: '#000000',
                      color: '#CCFF00',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm"
                  >
                    <Sparkles size={11} style={{ color: '#CCFF00' }} />
                    SSPL T10
                  </span>
                  <span
                    style={{
                      color: '#1a1a1a',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                    }}
                    className="text-[11px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Gavel size={12} style={{ color: '#1a1a1a' }} /> Official Announcement
                  </span>
                </div>

                <h3
                  style={{
                    color: '#000000',
                    fontFamily: 'Montserrat, system-ui, sans-serif',
                    textTransform: 'none',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-base sm:text-lg md:text-xl font-black leading-tight"
                >
                  <Trophy size={16} className="sm:hidden inline-block mr-1 text-black -mt-0.5" />
                  Auction Results are out!{' '}
                  <span
                    style={{
                      color: '#262626',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                      fontWeight: 500,
                    }}
                    className="text-xs md:text-sm block sm:inline"
                  >
                    Shortlisted candidates are now live. Scroll down to view the selected players.
                  </span>
                </h3>
              </div>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end flex-shrink-0">
              {/* Primary: Scroll Down to Results Button */}
              <button
                onClick={handleScrollDown}
                style={{
                  backgroundColor: '#000000',
                  color: '#CCFF00',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-xs md:text-sm uppercase tracking-wider shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer group"
              >
                <span style={{ color: '#CCFF00' }}>Scroll to Results</span>
                <ChevronDown size={16} style={{ color: '#CCFF00' }} className="animate-bounce group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Secondary: View Full Auction List Button */}
              <button
                onClick={() => navigate('/auction')}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  color: '#000000',
                  borderColor: 'rgba(0, 0, 0, 0.25)',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 md:gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider border hover:bg-black/15 active:scale-95 transition-all cursor-pointer group"
              >
                <span style={{ color: '#000000' }}>Full List</span>
                <ArrowRight size={14} style={{ color: '#000000' }} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuctionHeroAnnouncement;
