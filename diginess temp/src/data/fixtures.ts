import type { SSPLMatch } from '@/types/sspl';

export interface FixtureTeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
}

export interface EnrichedFixture extends SSPLMatch {
  homeTeam: FixtureTeamInfo;
  awayTeam: FixtureTeamInfo;
}

// Temporary MVP fixtures data. Replace with API/Supabase source later.
export const fixtures: EnrichedFixture[] = [
  {
    id: 'match-001',
    match_number: 1,
    season: '2025',
    date: new Date().toISOString().slice(0, 10),
    time: '18:30',
    venue: 'Chennai Ground A',
    team_a_id: 'tn',
    team_b_id: 'ka',
    result: 'upcoming',
    match_type: 'league',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    homeTeam: {
      id: 'tn',
      name: 'Tamil Nadu',
      abbreviation: 'TN',
      logo: '/Explore the teams/Tamil Nadu.png',
    },
    awayTeam: {
      id: 'ka',
      name: 'Karnataka',
      abbreviation: 'KA',
      logo: '/Explore the teams/Karnataka.png',
    },
  },
  {
    id: 'match-002',
    match_number: 2,
    season: '2025',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '19:30',
    venue: 'Chennai Ground B',
    team_a_id: 'ke',
    team_b_id: 'ap',
    result: 'upcoming',
    match_type: 'league',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    homeTeam: {
      id: 'ke',
      name: 'Kerala',
      abbreviation: 'KE',
      logo: '/Explore the teams/Kerala.png',
    },
    awayTeam: {
      id: 'ap',
      name: 'Andhra Pradesh',
      abbreviation: 'AP',
      logo: '/Explore the teams/Andra Pradesh.png',
    },
  },
  {
    id: 'match-003',
    match_number: 3,
    season: '2025',
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    time: '17:00',
    venue: 'Puducherry Arena',
    team_a_id: 'py',
    team_b_id: 'ts',
    team_a_score: { runs: 112, wickets: 6, overs: 10 },
    team_b_score: { runs: 108, wickets: 8, overs: 10 },
    winner_id: 'py',
    result: 'completed',
    match_type: 'league',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    homeTeam: {
      id: 'py',
      name: 'Puducherry',
      abbreviation: 'PY',
      logo: '/Explore the teams/Pudhucherry.png',
    },
    awayTeam: {
      id: 'ts',
      name: 'Telangana',
      abbreviation: 'TS',
      logo: '/Explore the teams/Telangana.png',
    },
  },
];

export default fixtures;
