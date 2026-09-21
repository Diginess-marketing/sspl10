import { useCallback } from 'react';
import HeroBanner from './HeroBanner';
import PlayerCarousel from './PlayerCarousel';
import AuctionHeroAnnouncement from './AuctionHeroAnnouncement';

const HeroSection: React.FC = () => {
  const scrollToAuctionResults = useCallback(() => {
    const target = document.getElementById('auction-results');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section className="relative w-full flex flex-col items-center justify-start overflow-hidden bg-transparent" id="hero">
      {/* New hero (mockup build) */}
      <HeroBanner />

      {/* Auction results announcement (brand-guide section) */}
      <AuctionHeroAnnouncement onScrollToResults={scrollToAuctionResults} />

      <div className="w-full">
        <PlayerCarousel />
      </div>
    </section>
  );
};

HeroSection.displayName = 'HeroSection';

export default HeroSection;
