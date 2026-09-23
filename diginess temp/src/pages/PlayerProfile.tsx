
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, User, Activity, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with API fetch using useParams
const MOCK_PLAYER_DB = {
    'rahul-sharma': {
        name: 'Rahul Sharma',
        role: 'Batsman',
        team: 'Mumbai Mavericks',
        teamSlug: 'mumbai-mavericks',
        age: 24,
        city: 'Mumbai',
        stats: {
            matches: 12,
            runs: 450,
            strikeRate: 185.5,
            fifties: 3,
            highest: 89,
        },
        bio: 'Rahul Sharma is an explosive top-order batsman known for his power-hitting in powerplay overs. Represents Mumbai Mavericks in SSPL T10.',
    },
    // Default fallback
    'default': {
        name: 'Player Profile',
        role: 'All Rounder',
        team: 'Unassigned',
        teamSlug: 'unassigned',
        age: 0,
        city: 'Unknown',
        stats: { matches: 0, runs: 0, strikeRate: 0, fifties: 0, highest: 0 },
        bio: 'Player details not found or waiting for update.',
    },
};

const PlayerProfile = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const player = MOCK_PLAYER_DB[playerId as keyof typeof MOCK_PLAYER_DB] || MOCK_PLAYER_DB['default'];

    // SEO Schema
    const playerSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': player.name,
        'jobTitle': 'Cricketer',
        'athlete': {
            '@type': 'SportsTeam',
            'name': player.team,
        },
        'description': player.bio,
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <Helmet>
                <title>{player.name} - {player.team} | SSPL T10 Player Stats</title>
                <meta name="description" content={`Check detailed career stats, runs, and wickets for ${player.name} in SSPL T10 League. Player profile for ${player.team}.`} />
                <link rel="canonical" href={`https://ssplt10.co.in/players/${playerId}`} />
                <script type="application/ld+json">
                    {JSON.stringify(playerSchema)}
                </script>
            </Helmet>

            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link to="/players" className="flex items-center gap-2 text-gray-600">
                            <ArrowLeft className="w-4 h-4" /> Back to Players
                        </Link>
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-1">
                        <Card className="border-t-4 border-t-primary shadow-lg">
                            <CardContent className="pt-8 text-center">
                                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-sm">
                                    <User className="w-16 h-16 text-gray-400" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{player.name}</h1>
                                <p className="text-primary font-semibold mb-4">{player.role}</p>

                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                        <MapPin className="w-3 h-3 mr-1" /> {player.city}
                                    </Badge>
                                    <Badge variant="outline">{player.age} Years</Badge>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg text-left">
                                    <p className="text-sm text-gray-500 mb-1">Current Team</p>
                                    <Link to={`/teams/${player.teamSlug}`} className="font-bold text-gray-900 flex items-center justify-between hover:text-blue-600">
                                        {player.team}
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats & Bio */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Career Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Matches</p>
                                        <p className="text-2xl font-bold text-gray-900">{player.stats.matches}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Runs</p>
                                        <p className="text-2xl font-bold text-blue-600">{player.stats.runs}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Strike Rate</p>
                                        <p className="text-2xl font-bold text-orange-600">{player.stats.strikeRate}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Highest</p>
                                        <p className="text-2xl font-bold text-green-600">{player.stats.highest}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    About
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed">
                                    {player.bio}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;
