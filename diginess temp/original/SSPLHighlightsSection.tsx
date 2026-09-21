import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Image as ImageIcon, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import SportButton from '@/components/ui/design/SportButton';

interface Highlight {
  image: string;
  title: string;
  description: string;
  category?: string;
  isWide?: boolean; // New property to handle wide images
}

// Define Preview Highlights Data
const PREVIEW_HIGHLIGHTS_DATA: Highlight[] = [
  { image: '/image_13.avif', title: '', description: '', category: '' },
  { image: '/image_15.avif', title: '', description: '', category: '' },
  { image: '/image_30.avif', title: '', description: '', category: '', isWide: true },
  { image: '/image_29.avif', title: '', description: '', category: '' },
  { image: '/news paper cuttings.avif', title: '', description: '', category: '' }
];

// Generate all 44 highlight images from the highlights folder
const GENERATED_HIGHLIGHTS = Array.from({ length: 44 }, (_, i) => ({
  image: `/highlights/${i + 1}.avif`,
  title: `SSPL Highlight ${i + 1}`,
  description: `Exciting moment from SSPL T10 Tournament`,
  category: 'Tournament Action'
}));

// Combine them into a single reliable source of truth
const ALL_HIGHLIGHTS_DATA = [...PREVIEW_HIGHLIGHTS_DATA, ...GENERATED_HIGHLIGHTS];

const SSPLHighlightsSection = () => {
  const [selectedImage, setSelectedImage] = useState<Highlight | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  // Use the global constant directly
  const allHighlightsData = ALL_HIGHLIGHTS_DATA;

  // Redefined Highlights for a Balanced 3-Column Layout
  // Center is Feature. Left/Right are stacked.
  // We strictly access them from the source of truth to guarantee correct indexing
  const featuredHighlight = ALL_HIGHLIGHTS_DATA[2]; // Season Finale (Index 2)

  const leftHighlights = [
    ALL_HIGHLIGHTS_DATA[0], // Star Player (Index 0)
    ALL_HIGHLIGHTS_DATA[1]  // Top Field Action (Index 1)
  ];

  const rightHighlights = [
    ALL_HIGHLIGHTS_DATA[3], // Victory Celebration (Index 3)
    ALL_HIGHLIGHTS_DATA[4]  // Media Buzz (Index 4)
  ];

  // Combined for modal navigation
  const previewHighlights = [...leftHighlights, featuredHighlight, ...rightHighlights];

  // Helper to get image path with fallback logic handled in UI
  // Improved to strict check for extension
  const getImgSrc = (path: string) => (path.startsWith('/') && !path.includes('.')) ? `${path}.png` : path;


  // Map preview image clicks to gallery - since preview images are different from gallery,
  // clicking a preview opens the gallery starting at index 0
  const getFullGalleryIndex = (previewIndex: number): number => {
    // Preview images are now at the start of allHighlightsData
    // The mapping logic in the original code for `openModal` passed an index based on the layout
    // Left: 0, 1. Center: left.length (2). Right: left.length + 1 + idx (3, 4).
    // So the indices passed from UI are:
    // Left 0 -> 0
    // Left 1 -> 1
    // Center -> 2
    // Right 0 -> 3
    // Right 1 -> 4
    // Since we prepended previewHighlightsData exactly in this order (0,1,2,3,4), the index matches directly!
    return previewIndex;
  };

  // ... (keeping existing modal handlers) ...
  // Modal Handlers - Always use full gallery for navigation
  const openModal = (index: number) => {
    // We can directly use the index since our local layouts map 1:1 to the start of the ALL_HIGHLIGHTS_DATA array
    if (index >= 0 && index < allHighlightsData.length) {
      setSelectedImage(allHighlightsData[index]);
      setCurrentImageIndex(index);
      setShowGallery(true); // Always show full gallery context
    }
  };

  const closeModal = () => setSelectedImage(null);
  const openGallery = () => setShowGallery(true);
  const closeGallery = () => {
    setShowGallery(false);
    setSelectedImage(null);
  };

  // Always navigate through all 44 images
  const nextImage = useCallback(() => {
    const nextIndex = (currentImageIndex + 1) % allHighlightsData.length;
    setSelectedImage(allHighlightsData[nextIndex]);
    setCurrentImageIndex(nextIndex);
  }, [currentImageIndex, allHighlightsData]);

  const prevImage = useCallback(() => {
    const prevIndex = (currentImageIndex - 1 + allHighlightsData.length) % allHighlightsData.length;
    setSelectedImage(allHighlightsData[prevIndex]);
    setCurrentImageIndex(prevIndex);
  }, [currentImageIndex, allHighlightsData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage && !showGallery) return;
      if (e.key === 'Escape') selectedImage ? closeModal() : closeGallery();
      if (selectedImage) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    if (selectedImage || showGallery) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, showGallery, nextImage, prevImage]);

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-[#0047AB]">
      {/* Custom Sporty Cobalt Background Texture */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/assets/highlights-bg-texture.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7
        }}
      />
      <div className="absolute top-[-12%] right-[-6%] w-[34%] h-[34%] rounded-full bg-[#00B4D8]/12 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-14%] left-[-8%] w-[36%] h-[36%] rounded-full bg-[#CCFF00]/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-3 font-heading">
            SSPL Highlights
          </h2>
          <p className="text-white/90 text-lg max-w-3xl mx-auto">
            A curated visual timeline of moments that define the SSPL experience.
          </p>
          <div className="h-1 w-16 bg-[#CCFF00] mx-auto rounded-full mt-4"></div>
        </div>

        <div className="relative rounded-3xl border border-white/15 bg-[#05205a]/45 backdrop-blur-xl p-3 md:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>

        {/* Improved Masonry Grid Layout - "Full Image" Mode */}
        {/* Changed to 3 Equal Columns for Vertical Center Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">

          {/* Left Column (Stack of 2 Squares) */}
          <div className="flex flex-col gap-3">
            {leftHighlights.map((item, idx) => (
              <div
                key={`left-${idx}`}
                className="group relative w-full aspect-square overflow-hidden rounded-xl border border-white/15 hover:border-[#CCFF00] transition-all cursor-pointer shadow-lg hover:shadow-[#CCFF00]/25 bg-white/8"
                onClick={() => openModal(idx)}
              >
                <img
                  src={getImgSrc(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 z-20 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider">{item.category}</span>
                  <h4 className="text-white font-heading uppercase leading-tight font-bold">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Vertical Rectangular Trophy - approx 1:2) */}
          <div className="h-full">
            <div
              className="group relative w-full h-full overflow-hidden rounded-xl border border-white/15 hover:border-[#CCFF00] transition-all cursor-pointer shadow-2xl hover:shadow-[#CCFF00]/30 bg-white/8"
              onClick={() => openModal(leftHighlights.length)}
            >
              {/* Featured Badge */}
              <div className="absolute top-4 left-4 z-30 bg-sspl-orange text-sspl-navy px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md">
                Season 1 Champions
              </div>

              {/* Backdrop Blur for Full Trophy Display */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-125 transition-opacity group-hover:opacity-60"
                style={{ backgroundImage: `url(${getImgSrc(featuredHighlight.image)})` }}
              ></div>

              <img
                src={getImgSrc(featuredHighlight.image)}
                alt={featuredHighlight.title}
                className="relative z-20 w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105 drop-shadow-2xl"
                loading="lazy"
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 z-20 bg-linear-to-t from-sspl-navy via-transparent to-transparent opacity-80"></div>

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 text-center">
                <h3 className="text-3xl md:text-5xl font-heading font-black text-white uppercase leading-none mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {featuredHighlight.title}
                </h3>
                <div className="h-1 w-16 bg-[#CCFF00] mx-auto rounded-full group-hover:w-32 transition-all duration-500"></div>
              </div>
            </div>
          </div>

          {/* Right Column (Stack of 2 Squares) */}
          <div className="flex flex-col gap-3">
            {rightHighlights.map((item, idx) => (
              <div
                key={`right-${idx}`}
                className="group relative w-full aspect-square overflow-hidden rounded-xl border border-white/15 hover:border-[#00B4D8] transition-all cursor-pointer shadow-lg hover:shadow-[#00B4D8]/25 bg-white/8"
                onClick={() => openModal(leftHighlights.length + 1 + idx)}
              >
                <img
                  src={getImgSrc(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[#CCFF00] text-sm font-bold uppercase tracking-wider">{item.category}</span>
                  <h4 className="text-white font-heading uppercase leading-tight font-bold">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <SportButton
            glow
            onClick={openGallery}
            sx={{
              fontSize: '1rem',
              px: 4.5,
              py: 2.2,
              borderRadius: '2rem', // Pill shape for modern look
              background: 'rgba(3, 20, 52, 0.45)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#dffb7b',
              '&:hover': {
                background: 'linear-gradient(90deg, rgba(0,180,216,0.18), rgba(193,255,0,0.16))',
                borderColor: '#CCFF00',
                color: '#ffffff'
              }
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              View All Highlights <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </SportButton>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showGallery && !selectedImage && createPortal(
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto"
          onClick={closeGallery}
        >
          <div className="container mx-auto px-4 py-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 backdrop-blur-sm py-4 px-2 -mx-2 z-10">
              <div className="flex items-center space-x-3">
                <Camera className="w-6 h-6 text-[#CCFF00]" />
                <h2 className="text-xl md:text-2xl font-bold text-white font-display uppercase tracking-wider">SSPL Highlight</h2>
                <span className="text-white/75 text-sm">({allHighlightsData.length} photos)</span>
              </div>
              <button
                type="button"
                onClick={closeGallery}
                className="text-white hover:text-sspl-orange transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {allHighlightsData.map((highlight, index) => (
                <div
                  key={index}
                  className="group cursor-pointer aspect-square relative rounded-lg overflow-hidden bg-gray-800 border border-white/5 hover:border-[#CCFF00] transition-all duration-300"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={highlight.image}
                    alt={highlight.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Modal */}
      {selectedImage && createPortal(
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-6xl w-full max-h-screen flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>

            <button
              type="button"
              onClick={closeModal}
              className="absolute -top-10 right-0 md:-right-10 text-white hover:text-sspl-orange transition-colors z-20 p-2"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              type="button"
              onClick={prevImage}
              className="absolute left-0 md:-left-20 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-sspl-orange text-white p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-md"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-0 md:-right-20 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-sspl-orange text-white p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-md"
            >
              <ChevronRight className="w-8 h-8" />
            </button>


            <div className="relative w-full max-h-[85vh] flex justify-center items-center rounded-lg overflow-hidden bg-sspl-navy shadow-2xl border border-white/10">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>

            <div className="mt-4 text-center max-w-2xl">
              <h3 className="text-2xl font-bold font-display text-white uppercase tracking-wider">{selectedImage.title}</h3>
              <p className="text-white/80 mt-1">{selectedImage.description}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default SSPLHighlightsSection;
