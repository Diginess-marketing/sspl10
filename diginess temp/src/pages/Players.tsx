import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Search, Trophy, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Sample players data - in a real app, this would come from an API
  const players = [
    {
      id: '1',
      name: 'Rahul Sharma',
      position: 'Captain/Batsman',
      team: 'Chennai Champions',
      teamId: '1',
      age: 32,
      matches: 15,
      runs: 450,
      wickets: 5,
      average: 32.5,
      stats: { batting: 85, bowling: 60, fielding: 90 },
    },
    {
      id: '2',
      name: 'Virat Kohli',
      position: 'Batsman',
      team: 'Bangalore Blasters',
      teamId: '2',
      age: 35,
      matches: 15,
      runs: 520,
      wickets: 0,
      average: 38.2,
      stats: { batting: 95, bowling: 30, fielding: 85 },
    },
    {
      id: '3',
      name: 'Ravindra Jadeja',
      position: 'All-rounder',
      team: 'Chennai Champions',
      teamId: '1',
      age: 34,
      matches: 15,
      runs: 280,
      wickets: 18,
      average: 24.8,
      stats: { batting: 75, bowling: 90, fielding: 95 },
    },
    {
      id: '4',
      name: 'Yuzvendra Chahal',
      position: 'Bowler',
      team: 'Bangalore Blasters',
      teamId: '2',
      age: 33,
      matches: 15,
      runs: 85,
      wickets: 22,
      average: 12.3,
      stats: { batting: 45, bowling: 95, fielding: 80 },
    },
    {
      id: '5',
      name: 'Sanju Samson',
      position: 'Wicket-keeper/Batsman',
      team: 'Kerala Warriors',
      teamId: '3',
      age: 29,
      matches: 15,
      runs: 380,
      wickets: 0,
      average: 28.7,
      stats: { batting: 80, bowling: 20, fielding: 85 },
    },
    {
      id: '6',
      name: 'Jasprit Bumrah',
      position: 'Bowler',
      team: 'Kerala Warriors',
      teamId: '3',
      age: 30,
      matches: 14,
      runs: 45,
      wickets: 20,
      average: 8.9,
      stats: { batting: 35, bowling: 98, fielding: 75 },
    },
  ];

  const teams = [
    { id: '1', name: 'Chennai Champions' },
    { id: '2', name: 'Bangalore Blasters' },
    { id: '3', name: 'Kerala Warriors' },
    { id: '4', name: 'Andhra Eagles' },
    { id: '5', name: 'Telangana Titans' },
    { id: '6', name: 'Puducherry Panthers' },
  ];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || player.teamId === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SEO
        preset="players"
        config={{
          canonical: 'https://ssplt10.com/players',
          ogImage: 'https://ssplt10.com/players-roster.jpg',
          robots: 'noindex, nofollow',
        }}
        includeOrganizationSchema={false}
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
                  Players & Statistics
                </h1>
                <p className="text-slate-600">
                  Complete player roster with detailed statistics • Last updated: {currentDate}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Players</p>
                      <p className="text-xl font-bold text-slate-900">{players.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Teams</p>
                      <p className="text-xl font-bold text-slate-900">{teams.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sport-orange/10 rounded-lg">
                      <Star className="w-5 h-5 text-lime-700" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Top Scorer</p>
                      <p className="text-xl font-bold text-slate-900">520 Runs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search players by name, position, or team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-64">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No players found</h3>
              <p className="text-slate-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 mb-1">
                          {player.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{player.team}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {player.position}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Age</p>
                        <p className="text-sm font-medium text-slate-900">{player.age}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Match Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{player.runs}</p>
                        <p className="text-xs text-slate-500">Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{player.wickets}</p>
                        <p className="text-xs text-slate-500">Wickets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-lime-700">{player.average}</p>
                        <p className="text-xs text-slate-500">Avg</p>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Performance</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Batting</span>
                          <span>{player.stats.batting}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${player.stats.batting}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span>Bowling</span>
                          <span>{player.stats.bowling}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${player.stats.bowling}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span>Fielding</span>
                          <span>{player.stats.fielding}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-sport-orange h-1.5 rounded-full"
                            style={{ width: `${player.stats.fielding}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link to={`/teams/${player.teamId}`}>
                        View Team
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-2xl mx-auto">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#001f3f' }}>
                Join the League
              </h2>
              <p className="text-slate-600 mb-6">
                Ready to showcase your cricket skills? Register now to become part of SSPL T10 and compete with the best players in South India.
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

export default Players;