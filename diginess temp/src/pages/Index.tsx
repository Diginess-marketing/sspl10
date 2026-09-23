import HeroSection from '@/components/HeroSection';
import StreetToStadium from '@/components/StreetToStadium';
import SSPLAnthemSection from '@/components/SSPLAnthemSection';
import SSPLHighlightsSection from '@/components/SSPLHighlightsSection';
import OurPartnersSection from '@/components/OurPartnersSection';
import FAQContactSection from '@/components/FAQContactSection';
import GiveawayBanner from '@/components/GiveawayBanner';
import SEO from '@/components/SEO';


const Index = () => {
  return (
    <>
      <SEO preset="home" />

      <HeroSection />
      
      {/* Mega Engagement Giveaway */}
      <div className="my-8 md:my-12">
        <GiveawayBanner />
      </div>



      <StreetToStadium />

      <SSPLAnthemSection />

      <SSPLHighlightsSection />

      <OurPartnersSection />

      <FAQContactSection />
    </>
  );
};

export default Index;