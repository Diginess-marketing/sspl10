import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SelectorRegistrationForm from '@/components/SelectorRegistrationForm';
import SEO from '@/components/SEO';
import { googleAnalytics } from '@/utils/googleAnalytics';
import './SelectorRegistration.css';

const ART = '/assets/forms';

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

            <div id="selector-registration-page" className="selreg">
                <h1 className="selreg__sr-only">Selectors Registration</h1>

                <div className="selreg__grid">
                    <aside className="selreg__intro">
                        <picture>
                            <source
                                type="image/avif"
                                srcSet={`${ART}/form-headline-480w.avif 480w, ${ART}/form-headline-768w.avif 768w, ${ART}/form-headline-1024w.avif 1024w`}
                                sizes="(min-width: 1240px) 440px, 70vw"
                            />
                            <source
                                type="image/webp"
                                srcSet={`${ART}/form-headline-480w.webp 480w, ${ART}/form-headline-768w.webp 768w, ${ART}/form-headline-1024w.webp 1024w`}
                                sizes="(min-width: 1240px) 440px, 70vw"
                            />
                            <img
                                className="selreg__headline"
                                src={`${ART}/form-headline.png`}
                                width={1536}
                                height={1024}
                                alt="Be a part of bigger dreams"
                                decoding="async"
                            />
                        </picture>
                        <p className="selreg__tagline">
                            India&rsquo;s Grassroots
                            <br />
                            Cricket Movement
                        </p>
                    </aside>

                    <div className="selreg__form">
                        <SelectorRegistrationForm />
                    </div>

                    <div className="selreg__player" aria-hidden="true">
                        <picture>
                            <source
                                type="image/avif"
                                srcSet={`${ART}/form-player-480w.avif 480w, ${ART}/form-player-768w.avif 768w, ${ART}/form-player.avif 1024w`}
                                sizes="(min-width: 1240px) 34vw, 320px"
                            />
                            <source
                                type="image/webp"
                                srcSet={`${ART}/form-player-480w.webp 480w, ${ART}/form-player-768w.webp 768w, ${ART}/form-player.webp 1024w`}
                                sizes="(min-width: 1240px) 34vw, 320px"
                            />
                            <img
                                src={`${ART}/form-player.png`}
                                width={1024}
                                height={1536}
                                alt=""
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SelectorRegistration;
