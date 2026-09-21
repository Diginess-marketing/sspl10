import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trophy, MapPin, Activity } from 'lucide-react';
import selectedPlayers from '@/data/selectedPlayers.json';
import selectedPlayers2 from '@/data/selectedPlayers2.json';

const PlayerCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex1, setHoveredIndex1] = useState<number | null>(null);
  const [hoveredIndex2, setHoveredIndex2] = useState<number | null>(null);

  // Group players for desktop vs mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playersPerView = isMobile ? 1 : 4;
  const maxIndex1 = Math.max(0, selectedPlayers.length - playersPerView);
  const maxIndex2 = Math.max(0, selectedPlayers2.length - playersPerView);

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      if (hoveredIndex1 === null) {
        setCurrentIndex1(prev => (prev >= maxIndex1 ? 0 : prev + 1));
      }
      if (hoveredIndex2 === null) {
        setCurrentIndex2(prev => (prev >= maxIndex2 ? 0 : prev + 1));
      }
    }, 2500); // Scroll every 2.5 seconds

    return () => clearInterval(timer);
  }, [maxIndex1, maxIndex2, hoveredIndex1, hoveredIndex2]);

  const nextSlide1 = () => setCurrentIndex1(prev => (prev >= maxIndex1 ? 0 : prev + 1));
  const prevSlide1 = () => setCurrentIndex1(prev => (prev <= 0 ? maxIndex1 : prev - 1));

  const nextSlide2 = () => setCurrentIndex2(prev => (prev >= maxIndex2 ? 0 : prev + 1));
  const prevSlide2 = () => setCurrentIndex2(prev => (prev <= 0 ? maxIndex2 : prev - 1));

  // Helper for rendering a single track
  const renderCarouselTrack = (
      playersList: any[], 
      currentIndex: number, 
      maxIndex: number, 
      prevSlide: () => void, 
      nextSlide: () => void, 
      setHoveredIndex: (idx: number | null) => void
  ) => {
      if (!playersList || playersList.length === 0) return null;
      return (
        <div className="relative group mb-12">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#00F0FF]/40 bg-black/80 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black hover:scale-110"
          >
            <ChevronLeft size={36} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-[#CCFF00]/40 bg-black/80 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black hover:scale-110"
          >
            <ChevronRight size={36} />
          </button>

          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-700 ease-in-out"
              style={{ 
                transform: `translateX(calc(-${currentIndex * (100 / playersPerView)}% - ${currentIndex * (1.5 / playersPerView)}rem))` 
              }}
            >
            {playersList.map((player, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / playersPerView}% - ${isMobile ? 0 : 1.5 * (playersPerView - 1) / playersPerView}rem)` }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div 
                  className={`group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-400 ease-out h-[400px] flex flex-col cursor-pointer
                    hover:scale-[1.05] hover:border-[#CCFF00] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)]
                  `}
                >
                  {/* Image Container */}
                  <div className="relative flex-1 overflow-hidden bg-black">
                    {player.image ? (
                      <img 
                        src={player.image} 
                        alt={player.name}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                        loading={idx < 8 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={idx < 4 ? "high" : "auto"}
                        style={{
                          objectPosition: player.name === "SWAMINATHAN" ? "center 25%" : 
                                          (player.name === "HIMANSHU HANS" || player.name === "GUMPARTHI NAVEEN") ? "center 40%" :
                                          player.name.includes("BALAJI") ? "right top" : "top"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-white bg-black/50">
                        <Trophy size={48} className="mb-4" />
                        <span className="text-sm font-semibold tracking-widest uppercase text-center px-4">No Photo</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent z-10 pointer-events-none" />

                    {/* Compact Auction Badge */}
                    <div className="absolute top-2 right-2 z-30 transform transition-transform duration-500 group-hover:scale-110">
                      <div className="relative group/badge" title="Selected for Auction">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#CCFF00] rounded-full blur-sm opacity-60 animate-pulse transition-opacity duration-300 group-hover/badge:opacity-100 scale-110"></div>
                        <div className="relative flex items-center gap-1.5 bg-[#050814]/90 backdrop-blur-md border border-[#00F0FF]/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                          <Trophy size={10} className="text-[#00F0FF]" />
                          <span className="text-[8px] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#CCFF00]">
                            Auction
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-[#050814] via-[#050814]/80 to-transparent">
                    <h3 className="text-2xl font-bold text-white/90 uppercase tracking-tight mb-3 transition-colors duration-300 group-hover:text-[#CCFF00]">
                      {player.name}
                    </h3>
                    
                    <div className="flex flex-col gap-2 font-mono text-[10px] tracking-[0.15em] uppercase">
                      <div className="flex items-center gap-2 text-white/60">
                        <span className="text-[#00F0FF] font-black">LOC //</span>
                        <span className="group-hover:text-white transition-colors truncate">{(player.location || "CHENNAI, IN").split(',').pop()?.trim()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <span className="text-[#CCFF00] font-black">ROLE //</span>
                        <span className="group-hover:text-white transition-colors">{player.role || "PLAYER"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      );
  };

  return (
    <div className="relative w-full py-12 overflow-hidden bg-[#050814] scroll-mt-24" id="auction-results">
      <div className="w-full max-w-[1480px] mx-auto px-[clamp(16px,4vw,40px)] relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-4">
          <div className="space-y-2 mb-4 md:mb-0">
            <h2 className="text-[#CCFF00] text-sm font-black tracking-[0.2em] uppercase flex items-center gap-2">
              <Trophy size={16} /> Selected for Auction
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              LATEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#CCFF00]">SELECTED PLAYERS</span>
            </h3>
          </div>
        </div>

        {/* Carousel Tracks */}
        {renderCarouselTrack(selectedPlayers, currentIndex1, maxIndex1, prevSlide1, nextSlide1, setHoveredIndex1)}
        {renderCarouselTrack(selectedPlayers2, currentIndex2, maxIndex2, prevSlide2, nextSlide2, setHoveredIndex2)}

        {/* See All Players Button */}
        <div className="flex justify-center mt-12 relative z-20">
          <button 
            onClick={() => navigate('/auction')}
            className="group relative overflow-hidden bg-transparent border-2 border-white/20 text-white font-bold tracking-widest uppercase px-10 py-4 rounded-full transition-all hover:border-[#CCFF00] hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] cursor-pointer"
          >
            <span className="relative z-10 transition-colors group-hover:text-black">View all photos of the players</span>
            <div className="absolute inset-0 bg-[#CCFF00] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlayerCarousel;
