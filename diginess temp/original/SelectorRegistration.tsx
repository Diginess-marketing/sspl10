import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import SelectorRegistrationForm from '@/components/SelectorRegistrationForm';
import SEO from '@/components/SEO';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { googleAnalytics } from '@/utils/googleAnalytics';
import SSPLWordmark from '@/components/SSPLWordmark';

const SelectorRegistration = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Track page view
        googleAnalytics.trackPageView(window.location.pathname);
    }, []);

    return (
        <>
            <SEO
                preset="register"
                config={{
                    title: 'Selector Registration - SSPL T10 Cricket Tournament',
                    description: 'Register as a selector for the Southern Street Premier League T10 Cricket Tournament. Join us in selecting the best talent.',
                    keywords: ['SSPL T10', 'cricket selector', 'selector registration', 'tournament selector', 'SSPL selector'],
                    ogType: 'website',
                    twitterCard: 'summary_large_image',
                }}
                canonical="https://ssplt10.com/register-selector"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.com/register-selector' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.com/register-selector' },
                ]}
                includeOrganizationSchema={true}
            />

            <div id="selector-registration-page" className="min-h-screen pt-16 pb-12 px-4 font-sans bg-transparent">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto">

                        <div className="animate-fade-in mt-4">
                            <SelectorRegistrationForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SelectorRegistration;
