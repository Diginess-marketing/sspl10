import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Image as ImageIcon, X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { highlights as builtInHighlights, MIN_HIGHLIGHTS, type Highlight } from '@/data/highlights';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import './SSPLHighlightsSection.css';

const SSPLHighlightsSection = () => {
  const [selectedImage, setSelectedImage] = useState<Highlight | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const cmsHighlights = useCmsCollection<Highlight>('highlights', builtInHighlights);
  // The preview grid addresses the first five items by index, so it needs at least that many.
  const allHighlightsData = cmsHighlights.length >= MIN_HIGHLIGHTS ? cmsHighlights : builtInHighlights;

  // Redefined Highlights for a Balanced 3-Column Layout
  // Center is Feature. Left/Right are stacked.
  // We strictly access them from the source of truth to guarantee correct indexing
  const featuredHighlight = allHighlightsData[2]; // Season Finale (Index 2)

  const leftHighlights = [
    allHighlightsData[0], // Star Player (Index 0)
    allHighlightsData[1],  // Top Field Action (Index 1)
  ];

  const rightHighlights = [
    allHighlightsData[3], // Victory Celebration (Index 3)
    allHighlightsData[4],  // Media Buzz (Index 4)
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
    // We can directly use the index since our local layouts map 1:1 to the start of allHighlightsData
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

  const ART = '/assets/highlights-section';

  // Tile order matches the modal indices: 0/1 left squares, 2 featured trophy, 3/4 right squares.
  const tiles = [
    { idx: 0, area: 'a', item: leftHighlights[0], alt: 'Quote from Nawabzada Mohammed Asif Ali, Chairman, SSPL' },
    { idx: 1, area: 'b', item: leftHighlights[1], alt: 'Quote from LT Anand, CEO/Director, SSPL' },
    { idx: 2, area: 't', item: featuredHighlight, alt: 'SSPL Season 1 winner trophy', featured: true },
    { idx: 3, area: 'c', item: rightHighlights[0], alt: 'Quote from Ravi Mohan, Star Patron, SSPL' },
    { idx: 4, area: 'd', item: rightHighlights[1], alt: 'SSPL in the newspapers' },
  ];

  return (
    <section className="hlx" id="highlights" aria-labelledby="hlx-title">
      <picture className="hlx__bg" aria-hidden="true">
        <source type="image/avif" srcSet={`${ART}/hl-bg-768w.avif 768w, ${ART}/hl-bg-1344w.avif 1344w`} sizes="100vw" />
        <source type="image/webp" srcSet={`${ART}/hl-bg-768w.webp 768w, ${ART}/hl-bg-1344w.webp 1344w`} sizes="100vw" />
        <img src={`${ART}/hl-bg-1344w.webp`} alt="" width={1344} height={752} loading="lazy" decoding="async" />
      </picture>

      <div className="brand-container">
        <header className="hlx__head">
          <div className="hlx__titles">
            <h2 className="hlx__title" id="hlx-title">
              <picture>
                <source type="image/avif" srcSet={`${ART}/hl-title-full.avif`} />
                <img src={`${ART}/hl-title-full.webp`} alt="SSPL Highlights" width={1211} height={494} loading="lazy" decoding="async" />
              </picture>
            </h2>
            <p className="hlx__lead">A curated visual timeline of moments that define the SSPL experience.</p>
          </div>
          <button type="button" className="brand-btn brand-btn--primary hlx__all" onClick={openGallery}>
            View All Highlights <ArrowRight size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="hlx__grid">
          {tiles.map(({ idx, area, item, alt, featured }) => (
            <button
              key={idx}
              type="button"
              className={`hlx__tile hlx__tile--${area}${featured ? ' hlx__tile--featured' : ''}`}
              onClick={() => openModal(idx)}
              aria-label={`Open photo: ${alt}`}
            >
              <img src={getImgSrc(item.image)} alt={alt} loading="lazy" decoding="async" />
              {featured && <span className="hlx__badge">Season 1 Champions</span>}
              <span className="hlx__zoom" aria-hidden="true"><ImageIcon size={20} /></span>
            </button>
          ))}
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
        document.body,
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
        document.body,
      )}
    </section>
  );
};

export default SSPLHighlightsSection;
