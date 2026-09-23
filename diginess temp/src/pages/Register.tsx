import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PlayerRegistrationForm from '@/components/PlayerRegistrationForm';
import SEO from '@/components/SEO';
import { googleAnalyticsService } from '@/services/googleAnalyticsService';
import { useUTMTracking } from '@/hooks/useUTMTracking';

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isTrackingEnabled } = useUTMTracking();

  useEffect(() => {
    // UTM tracking is initialized automatically by useUTMTracking hook

    // Track page view for analytics using the Google Analytics service
    googleAnalyticsService.trackPageView({
      page_title: 'Player Registration',
      page_path: '/register',
    });

    // Track registration page view event
    googleAnalyticsService.trackEvent('registration_page_view', {
      category: 'engagement',
      label: 'player_registration',
      page: 'registration',
    });
  }, []);

  return (
    <>
      <SEO
        preset="register"
        config={{
          title: 'Player Registration - SSPL T10 Cricket Tournament',
          description: 'Register now for the Southern Street Premier League T10 Cricket Tournament. Join the most exciting T10 tennis ball cricket league with prizes up to 3 crores.',
          keywords: ['SSPL T10', 'cricket registration', 'tennis ball cricket', 'tournament registration', 'SSPL registration'],
          ogType: 'website',
          twitterCard: 'summary_large_image',
        }}
        canonical="https://ssplt10.com/register"
        alternates={[
          { hrefLang: 'en', href: 'https://ssplt10.com/register' },
          { hrefLang: 'x-default', href: 'https://ssplt10.com/register' },
        ]}
        includeOrganizationSchema={true}
      />

      <div id="player-registration-page" className="min-h-screen bg-transparent">
        <main className="page-content max-w-4xl pt-12">
          {/* Registration Container */}
          <div className="bg-[#0047AB] p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 mt-8 mb-16">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>

            {/* Header Section */}
            <div className="text-center mb-12 relative z-10">
              <h1 className="text-3xl sm:text-5xl font-black mb-4 text-[#CCFF00] uppercase tracking-tight">
                Player Registration
              </h1>
              <div className="h-1.5 w-24 bg-white/20 mx-auto rounded-full mb-6"></div>

            </div>

            <div className="relative z-10">
              <PlayerRegistrationForm />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Register;