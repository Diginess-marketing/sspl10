
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateBreadcrumbSchema, generateEventSchema, generateFAQSchema } from '@/utils/schema-generator';
import { CITIES, EVENTS, ROLES } from '@/data/programmatic-mock';
import { ContentEngine } from '@/utils/content-engine';

const ProgrammaticCityPage = () => {
    const { cityYear, role } = useParams<{ cityYear: string; role?: string }>();

    // Parse city and year from slug (e.g., "mumbai-2026")
    const parts = cityYear?.split('-') || [];
    const yearStr = parts.pop();
    const citySlug = parts.join('-');
    const year = parseInt(yearStr || '2026');

    // Fetch Data
    const cityData = CITIES.find(c => c.slug === citySlug);
    const eventData = EVENTS.find(e => e.cityId === citySlug && e.year === year);
    const roleData = role ? ROLES.find(r => r.slug === role) : null;

    // Initialize Content Engine Memoized
    const contentEngine = useMemo(() => {
        if (cityData) {
            return new ContentEngine(cityData, year, roleData || null);
        }
        return null;
    }, [cityData, year, roleData]);

    if (!cityData || !contentEngine) {
        return <div className="p-10 text-center">City not found. <Link to="/trials" className="text-blue-500">View all trials</Link></div>;
    }

    // Generate Dynamic Content
    const pageTitle = contentEngine.getMetaTitle();
    const introText = contentEngine.getIntroText();
    const processText = contentEngine.getProcessText();
    const ctaHeading = contentEngine.getCTAHeading();
    const faqs = contentEngine.getFAQs();
    const registrationStat = contentEngine.getRegistrationStats();

    const description = roleData
        ? `Looking for ${roleData.name} trials in ${cityData.name}? Register for the SSPL T10 ${year} selection trials at ${cityData.venue}. High performance scouting.`
        : `Join the biggest tennis ball cricket league in ${cityData.name}. SSPL T10 ${year} selection trials happening at ${cityData.venue}. Register now!`;

    const breadcrumbItems = [
        { name: 'Home', item: '/' },
        { name: 'Trials', item: '/trials' },
        { name: `${cityData.name} ${year}`, item: `/trials/${cityYear}` },
    ];

    if (roleData) {
        breadcrumbItems.push({ name: roleData.name, item: `/trials/${cityYear}/${role}` });
    }

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    // Use Generator Functions
    const faqSchema = generateFAQSchema(faqs);

    const eventSchema = eventData ? generateEventSchema({
        name: `SSPL T10 Selection Trials - ${cityData.name}`,
        description,
        startDate: `${eventData.date}T08:00`,
        locationName: cityData.venue,
        city: cityData.name,
        offers: {
            url: 'https://ssplt10.co.in/register',
            price: '499',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            validFrom: new Date().toISOString(),
        },
    }) : null;

    // Indexation Control
    const baseUrl = 'https://ssplt10.co.in';
    const roleSlug = roleData ? roleData.slug : '';
    const currentPath = roleSlug
        ? `/trials/${cityYear}/${roleSlug}`
        : `/trials/${cityYear}`;
    const canonicalUrl = `${baseUrl}${currentPath}`;
    const metaRobots = 'index, follow';

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                <meta name="robots" content={metaRobots} />
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
                {eventSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(eventSchema)}
                    </script>
                )}
            </Helmet>

            {/* Hero Section */}
            <section className="bg-sspl-navy text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block bg-sspl-orange text-white px-3 py-1 rounded-sm text-sm font-bold mb-4 uppercase tracking-wider">
                            {roleData ? `${roleData.name} Selection` : 'Official Selection Trials'}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black font-bebas mb-6 leading-tight">
                            {cityData.name.toUpperCase()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sspl-orange to-sspl-orange-hover">CRICKET TRIALS</span> {year}
                        </h1>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                            {introText}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="bg-sspl-orange text-white font-bold hover:bg-sspl-orange-hover hover:scale-105 transition-all" asChild>
                                <Link to="/register">Register Now</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                                <Link to="#details">View Details</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Grid */}
            <div className="container mx-auto px-4 py-12 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-xl border-t-4 border-t-sspl-orange">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Venue</p>
                                    <p className="font-bold text-gray-900">{cityData.venue}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-t-4 border-t-sspl-orange">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-50 p-3 rounded-full">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Date</p>
                                    <p className="font-bold text-gray-900">{eventData?.date || 'To Be Announced'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl border-t-4 border-t-sspl-orange">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Interest</p>
                                    <p className="font-bold text-gray-900">{registrationStat}+ Players Interested</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-12" id="details">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About Section */}
                        <section className="content-visibility-auto contain-intrinsic-size-[500px]">
                            <h2 className="text-3xl font-bold font-bebas mb-6">About {cityData.name} Selection Trials</h2>
                            <div className="prose max-w-none text-gray-700">
                                <p className="mb-4">
                                    The Southern Street Premier League (SSPL) is bringing high-octane T10 cricket to <strong>{cityData.name}</strong>.
                                    We are looking for the most talented {roleData ? `${roleData.name.toLowerCase()  }s` : 'players'} to join the league.
                                </p>
                                <p>
                                    {processText}
                                </p>
                            </div>
                        </section>

                        {/* Selection Process */}
                        <section>
                            <h2 className="text-3xl font-bold font-bebas mb-6">Selection Metrics</h2>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <ol className="space-y-4">
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-sspl-navy text-white rounded-full flex items-center justify-center font-bold">1</span>
                                        <div>
                                            <h4 className="font-bold">Online Registration</h4>
                                            <p className="text-sm text-gray-600">Complete your profile and pay the registration fee.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-sspl-navy text-white rounded-full flex items-center justify-center font-bold">2</span>
                                        <div>
                                            <h4 className="font-bold">Venue Reporting</h4>
                                            <p className="text-sm text-gray-600">Report to {cityData.venue} at 8:00 AM with your kit.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-sspl-navy text-white rounded-full flex items-center justify-center font-bold">3</span>
                                        <div>
                                            <h4 className="font-bold">Skill Assessment</h4>
                                            <p className="text-sm text-gray-600">Selectors will evaluate your {roleData ? roleData.name.toLowerCase() : 'cricketing'} skills.</p>
                                        </div>
                                    </li>
                                </ol>
                            </div>
                        </section>

                        {/* FAQ */}
                        <section className="content-visibility-auto contain-intrinsic-size-[500px]">
                            <h2 className="text-3xl font-bold font-bebas mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{faq.question}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">

                        {/* CTA Box */}
                        <div className="bg-sspl-navy text-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold font-bebas mb-2 text-sspl-orange">{ctaHeading}</h3>
                            <p className="text-gray-300 mb-6 text-sm">Registrations are closing soon for {cityData.name}. Secure your spot today.</p>
                            <Button className="w-full bg-sspl-orange text-white font-bold hover:bg-sspl-orange-hover" asChild>
                                <Link to="/register">Register Now</Link>
                            </Button>
                        </div>

                        {/* Other Roles */}
                        {roleData ? (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold mb-4">Other Categories</h3>
                                <ul className="space-y-2">
                                    {ROLES.filter(r => r.slug !== roleData.slug).map(r => (
                                        <li key={r.id}>
                                            <Link to={`/trials/${citySlug}-${year}/${r.slug}`} className="flex items-center justify-between text-gray-600 hover:text-blue-600">
                                                <span>{r.name}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold mb-4">Select Your Role</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map(r => (
                                        <Link key={r.id} to={`/trials/${citySlug}-${year}/${r.slug}`}>
                                            <div className="border hover:border-blue-500 hover:bg-blue-50 p-2 rounded text-center text-sm transition-colors cursor-pointer">
                                                {r.name}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nearby Cities - Logic to be improved in Phase 3 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold mb-4">Nearby Trials</h3>
                            <ul className="space-y-2">
                                {CITIES.filter(c => c.slug !== cityData.slug).slice(0, 3).map(c => (
                                    <li key={c.id}>
                                        <Link to={`/trials/${c.slug}-${year}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{c.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ProgrammaticCityPage;
