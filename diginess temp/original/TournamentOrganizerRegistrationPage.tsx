import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import TournamentOrganizerRegistration from '@/components/TournamentOrganizerRegistration';
import SEO from '@/components/SEO';
import { Trophy, Gift } from 'lucide-react';
import { googleAnalytics } from '@/utils/googleAnalytics';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

const TournamentOrganizerRegistrationPage: React.FC = () => {
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
                    title: 'Tournament Organizer Registration - SSPL T10',
                    description: 'Register your cricket tournament for the SSPL T10 Free Tennis Ball Campaign. Join the largest cricket network in India.',
                    keywords: ['SSPL T10', 'tournament registration', 'cricket organizer', 'free tennis balls', 'cricket sponsorship'],
                    ogType: 'website',
                    twitterCard: 'summary_large_image',
                }}
                canonical="https://ssplt10.co.in/tournament-organizer-registration"
                alternates={[
                    { hrefLang: 'en', href: 'https://ssplt10.co.in/tournament-organizer-registration' },
                    { hrefLang: 'x-default', href: 'https://ssplt10.co.in/tournament-organizer-registration' },
                ]}
                includeOrganizationSchema={true}
            />

            <Header />
            <div id="tournament-organizer-registration-page" className="min-h-screen pt-44 pb-12 px-4 font-sans bg-white light-theme-forced">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        
                        {/* Left Column: Banner/Campaign Section (Sticky) */}
                        <div className="lg:sticky lg:top-32 order-1 lg:order-1">
                            <section className="relative overflow-hidden rounded-[2.5rem] p-1 bg-slate-50 border border-slate-200 shadow-2xl">
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-sspl-orange/10 rounded-full blur-[100px]" />
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]" />

                                <div className="relative z-10 p-8 md:p-12 flex flex-col items-center text-center lg:text-left lg:items-start">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8">
                                        <Trophy className="w-4 h-4 text-green-600" />
                                        <span className="text-gray-900 text-xs font-bold uppercase tracking-[0.2em]">Partner Program</span>
                                    </div>

                                    <h1 className="text-4xl md:text-6xl font-black !text-gray-900 uppercase tracking-tight mb-6 leading-[1.1]">
                                        Tournament <br /><span className="text-blue-700">Organizers</span>
                                    </h1>
                                    <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                                        Power your tournament with SSPL T10. Register now for our **Free Tennis Ball Campaign** and get exclusive sponsorship support across India.
                                    </p>

                                    <div className="w-full bg-blue-50 border-2 border-blue-200 px-8 py-6 rounded-3xl backdrop-blur-md shadow-xl">
                                        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                                            <div className="p-3 rounded-2xl bg-blue-100">
                                                <Gift className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-blue-900 font-black text-xl uppercase tracking-tighter mb-1">Free Tennis Balls</p>
                                                <p className="text-gray-900 font-bold text-sm">For your upcoming cricket event!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Registration Form */}
                        <div className="order-2 lg:order-2">
                            <div className="animate-fade-in shadow-2xl rounded-3xl overflow-hidden border border-navy/5">
                                <TournamentOrganizerRegistration />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <FooterSection />
        </>
    );
};

export default TournamentOrganizerRegistrationPage;
