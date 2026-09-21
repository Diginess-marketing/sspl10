import HeroSection from "@/components/HeroSection";
import StreetToStadium from "@/components/StreetToStadium";
import SSPLAnthemSection from "@/components/SSPLAnthemSection";
import SSPLHighlightsSection from "@/components/SSPLHighlightsSection";
import OurPartnersSection from "@/components/OurPartnersSection";
import FAQContactSection from "@/components/FAQContactSection";
import SEO from "@/components/SEO";


const Index = () => {
  return (
    <>
      <SEO preset="home" />

      <HeroSection />
      
      {/* Voucher Banner Section */}
      <div className="w-full max-w-[1480px] mx-auto px-[var(--brand-gutter,16px)] my-8 md:my-12">
        <img 
          src="/assets/voucher_banner.jpg" 
          alt="SSPL T10 Voucher" 
          className="w-full h-auto rounded-xl md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        />
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