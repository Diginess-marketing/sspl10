
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CricketPageLoader from '@/components/CricketPageLoader';
import { generateBreadcrumbSchema } from '@/utils/schema-generator';

const CityTrialsPage = () => {
    const { citySlug } = useParams<{ citySlug: string }>();

    // This would typically come from an API based on the slug
    // For now, we'll derive display name from slug
    const cityName = citySlug
        ? citySlug.split('-')[0].charAt(0).toUpperCase() + citySlug.split('-')[0].slice(1)
        : 'Unknown City';

    const year = citySlug ? citySlug.split('-').pop() : new Date().getFullYear();

    // Mock data - replace with React Query fetch
    const cityData = {
        name: cityName,
        venue: 'To Be Announced',
        date: 'Upcoming',
        status: 'Open',
        description: `Join the best tennis ball cricket talent in ${cityName}. Register now for SSPL T10 selection trials.`,
    };

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Trials', item: '/trials' },
        { name: cityData.name, item: `/trials/${citySlug}` },
    ]);

    if (!citySlug) return <CricketPageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <Helmet>
                <title>Cricket Selection Trials in {cityData.name} {year} | SSPL T10</title>
                <meta name="description" content={`Register for SSPL T10 cricket trials in ${cityData.name}. showcasing the best tennis ball cricket talent. Selection dates, venue, and registration details.`} />
                <link rel="canonical" href={`https://ssplt10.co.in/trials/${citySlug}`} />

                {/* Local Business / Event Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SportsEvent',
                        'name': `SSPL T10 Cricket Selection Trial - ${cityData.name}`,
                        'startDate': `${year}-01-01`,
                        'eventStatus': 'https://schema.org/EventScheduled',
                        'location': {
                            '@type': 'Place',
                            'name': cityData.venue,
                            'address': {
                                '@type': 'PostalAddress',
                                'addressLocality': cityData.name,
                                'addressCountry': 'IN',
                            },
                        },
                        'organizer': {
                            '@type': 'SportsOrganization',
                            'name': 'SSPL T10',
                            'url': 'https://ssplt10.co.in',
                        },
                    })}
                </script>
                {/* Breadcrumb Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6 text-gray-500">
                    <Link to="/" className="hover:text-primary">Home</Link> &gt;{' '}
                    <Link to="/trials" className="hover:text-primary">Trials</Link> &gt;{' '}
                    <span className="font-semibold text-gray-900">{cityData.name}</span>
                </nav>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <section className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-bebas">
                                CRICKET TRIALS IN <span className="text-primary">{cityData.name.toUpperCase()}</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-6">
                                Are you the next tennis ball cricket sensation from {cityData.name}?
                                The Southern Street Premier League (SSPL T10) is coming to your city to find the best talent.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-900">{cityData.date}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Venue</p>
                                        <p className="font-semibold text-gray-900">{cityData.venue}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the {cityData.name} Selection Trial</h2>
                                <p>
                                    The SSPL T10 selection trials in {cityData.name} are designed to identify raw talent.
                                    Whether you are a power hitter, a express pacer, or a mystery spinner, this is your platform
                                    to showcase your skills and get a chance to play in India's premier tennis ball cricket league.
                                </p>
                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Selection Process</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Phase 1:</strong> Online Registration (Mandatory)</li>
                                    <li><strong>Phase 2:</strong> Physical Trials at {cityData.venue || 'designated venue'}</li>
                                    <li><strong>Phase 3:</strong> Shortlisting for Auction</li>
                                    <li><strong>Phase 4:</strong> Player Auction & Team Allocation</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-primary/20 shadow-md">
                            <CardHeader className="bg-primary/5 pb-4">
                                <CardTitle className="text-xl text-primary flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Register Now
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                                    <p className="text-gray-500 text-sm">Registration Status</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mt-1">
                                        {cityData.status}
                                    </span>
                                </div>
                                <Button className="w-full text-lg h-12 bg-primary hover:bg-primary/90" asChild>
                                    <Link to="/register">Register as Player</Link>
                                </Button>
                                <p className="text-xs text-center text-gray-500">
                                    Limited slots available for {cityData.name} trials.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Other Nearby Cities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    <li><Link to="/trials/mumbai-2026" className="text-blue-600 hover:underline">Mumbai Trials</Link></li>
                                    <li><Link to="/trials/pune-2026" className="text-blue-600 hover:underline">Pune Trials</Link></li>
                                    <li><Link to="/trials/bangalore-2026" className="text-blue-600 hover:underline">Bangalore Trials</Link></li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityTrialsPage;
