import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Teams = () => {
  // Sample teams data - in a real app, this would come from an API
  const teams = [
    {
      id: '1',
      name: 'Chennai Champions',
      city: 'Chennai',
      captain: 'Rahul Sharma',
      logo: '/Explore the teams/Tamil-Nadu.avif',
      founded: 2023,
      stats: { wins: 12, losses: 3, matches: 15 },
      players: ['Rahul Sharma', 'Ravi Kumar', 'Suresh Raina', 'Jadeja', 'Ashwin'],
    },
    {
      id: '2',
      name: 'Bangalore Blasters',
      city: 'Bangalore',
      captain: 'Virat Kohli',
      logo: '/Explore the teams/Karnataka.avif',
      founded: 2023,
      stats: { wins: 10, losses: 5, matches: 15 },
      players: ['Virat Kohli', 'AB de Villiers', 'Maxwell', 'Chahal', 'Siraj'],
    },
    {
      id: '3',
      name: 'Kerala Warriors',
      city: 'Kochi',
      captain: 'Sanju Samson',
      logo: '/Explore the teams/Kerala.avif',
      founded: 2023,
      stats: { wins: 8, losses: 7, matches: 15 },
      players: ['Sanju Samson', 'Ishan Kishan', 'Varun Chakravarthy', 'Bumrah', 'Prasidh Krishna'],
    },
    {
      id: '4',
      name: 'Andhra Eagles',
      city: 'Visakhapatnam',
      captain: 'Rohit Sharma',
      logo: '/Explore the teams/Andra-Pradesh.avif',
      founded: 2023,
      stats: { wins: 9, losses: 6, matches: 15 },
      players: ['Rohit Sharma', 'Hardik Pandya', 'Bhuvneshwar Kumar', 'Naveen', 'David Warner'],
    },
    {
      id: '5',
      name: 'Telangana Titans',
      city: 'Hyderabad',
      captain: 'Kane Williamson',
      logo: '/Explore the teams/Telangana.avif',
      founded: 2023,
      stats: { wins: 11, losses: 4, matches: 15 },
      players: ['Kane Williamson', 'Warner', 'Bhuvneshwar Kumar', 'Rashid Khan', 'Nagarjuna'],
    },
    {
      id: '6',
      name: 'Puducherry Panthers',
      city: 'Puducherry',
      captain: 'Shubman Gill',
      logo: '/Explore the teams/Pudhucherry.avif',
      founded: 2023,
      stats: { wins: 7, losses: 8, matches: 15 },
      players: ['Shubman Gill', 'Ruturaj Gaikwad', 'Washington Sundar', 'Thakur', 'Axar Patel'],
    },

  ];

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SEO
        preset="teams"
        config={{
          canonical: 'https://ssplt10.com/teams',
          ogImage: 'https://ssplt10.com/teams-banner.jpg',
        }}
        includeOrganizationSchema={true}
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': 'SSPL T10 Teams',
            'description': 'Official teams and standings for SSPL T10 Cricket League',
            'url': 'https://ssplt10.com/teams',
            'mainEntity': {
              '@type': 'SportsEvent',
              'name': 'SSPL T10 Cricket League',
              'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
              'eventStatus': 'https://schema.org/EventScheduled',
              'startDate': '2024-01-15',
              'location': {
                '@type': 'Place',
                'name': 'Multiple Venues',
                'address': {
                  '@type': 'PostalAddress',
                  'addressCountry': 'IN',
                },
              },
              'organizer': {
                '@type': 'Organization',
                'name': 'SSPL T10',
                'url': 'https://ssplt10.com',
              },
            },
          },
        ]}
      />

      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/">
                <Button variant="outline" size="sm" className="hover:bg-slate-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#001f3f' }}>
                  Teams & Standings
                </h1>
                <p className="text-slate-600">
                  Complete team roster, standings, and tournament statistics • Last updated: {currentDate}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Teams</p>
                      <p className="text-xl font-bold text-slate-900">{teams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Players</p>
                      <p className="text-xl font-bold text-slate-900">{teams.length * 5}+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sport-orange/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-lime-700" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Matches</p>
                      <p className="text-xl font-bold text-slate-900">{teams.reduce((sum, team) => sum + team.stats.matches, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  {/* Team Logo/Image */}
                  <div className="aspect-video bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-4xl">🏏</div>';
                        }
                      }}
                    />
                  </div>

                  {/* Team Rank Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-slate-900 text-white">
                      #{team.id}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{team.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Captain</p>
                      <p className="text-sm font-medium text-slate-900">{team.captain}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{team.stats.wins}</p>
                      <p className="text-xs text-slate-500">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{team.stats.losses}</p>
                      <p className="text-xs text-slate-500">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{team.stats.matches}</p>
                      <p className="text-xs text-slate-500">Matches</p>
                    </div>
                  </div>

                  {/* Win Percentage */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-600">Win Rate</span>
                      <span className="text-sm font-medium">
                        {Math.round((team.stats.wins / team.stats.matches) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-linear-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(team.stats.wins / team.stats.matches) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Players */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Key Players</p>
                    <div className="flex flex-wrap gap-1">
                      {team.players.slice(0, 3).map((player, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                      {team.players.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{team.players.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link to={`/teams/${team.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    {/* Players link disabled - uncomment when Players page is enabled */}
                    {/* <Button size="sm" variant="outline" asChild>
                      <Link to="/players">
                        <Users className="w-4 h-4 mr-2" />
                        Players
                      </Link>
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-2xl mx-auto">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#001f3f' }}>
                Ready to Join the League?
              </h2>
              <p className="text-slate-600 mb-6">
                Register now to become part of SSPL T10 and compete with the best teams in South India.
              </p>
              <Button size="lg" className="bg-linear-to-r from-sport-orange to-sport-teal" asChild>
                <Link to="/register">
                  Register Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teams;