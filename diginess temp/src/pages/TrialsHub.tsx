
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateBreadcrumbSchema } from '@/utils/schema-generator';

const TrialsHub = () => {
    const cities = [
        { name: 'Mumbai', slug: 'mumbai-2026', date: 'Upcoming', venue: 'Shivaji Park' },


        { name: 'Bangalore', slug: 'bangalore-2026', date: 'Upcoming', venue: 'Chinnaswamy Stadium (Nets)' },
        { name: 'Kolkata', slug: 'kolkata-2026', date: 'Upcoming', venue: 'Eden Gardens (Practice Area)' },

        { name: 'Hyderabad', slug: 'hyderabad-2026', date: 'Upcoming', venue: 'Rajiv Gandhi Intl Stadium' },
        { name: 'Pune', slug: 'pune-2026', date: 'Upcoming', venue: 'MCA Stadium' },
        { name: 'Ahmedabad', slug: 'ahmedabad-2026', date: 'Upcoming', venue: 'Narendra Modi Stadium (Annex)' },
        { name: 'Jaipur', slug: 'jaipur-2026', date: 'Upcoming', venue: 'Sawai Mansingh Stadium' },
        { name: 'Lucknow', slug: 'lucknow-2026', date: 'Upcoming', venue: 'Ekana Stadium' },
    ];

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Trials', item: '/trials' },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <Helmet>
                <title>Cricket Selection Trials 2026 | SSPL T10 Registration Locations</title>
                <meta name="description" content="Register for SSPL T10 cricket selection trials in your city. View dates, venues and registration details for Mumbai, Bangalore, and more." />
                <meta name="robots" content="noindex, nofollow" />
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="bg-sspl-navy text-white py-16 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 opacity-30 pattern-grid-lg"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black font-bebas mb-4 tracking-wider">
                        SELECTION <span className="text-sspl-orange">TRIALS</span> 2026
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-manrope">
                        Join India's biggest tennis ball cricket talent hunt. Register now to showcase your skills and get a chance to play in the SSPL T10.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button size="lg" className="bg-sspl-orange text-white font-bold hover:bg-sspl-orange-hover" asChild>
                            <Link to="/register">Register Now</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Trial Locations Grid */}
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-bebas">FIND YOUR NEAREST TRIAL</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map((city) => (
                        <Card key={city.slug} className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl flex justify-between items-center">
                                    <span>{city.name}</span>
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{city.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span>{city.venue}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full justify-between group" asChild>
                                    <Link to={`/trials/${city.slug}`}>
                                        View Details
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <h3 className="text-2xl font-bold mb-4">Can't Find Your City?</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        We are constantly adding new locations based on demand. Register your interest now and we'll notify you when trials open near you.
                    </p>
                    <Button variant="secondary" asChild>
                        <Link to="/enquiry">Request a City</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrialsHub;
