export interface BattingLeader {
  id: string;
  name: string;
  team_id: string;
  runs: number;
  strike_rate: number;
  highest: number;
}

export interface BowlingLeader {
  id: string;
  name: string;
  team_id: string;
  wickets: number;
  economy: number;
  best: string;
}

export const topBatting: BattingLeader[] = [
  { id: 'p1', name: 'A. Kumar', team_id: 'tn', runs: 176, strike_rate: 168.5, highest: 72 },
  { id: 'p2', name: 'R. Singh', team_id: 'ka', runs: 153, strike_rate: 158.1, highest: 65 },
  { id: 'p3', name: 'F. Rahman', team_id: 'ke', runs: 140, strike_rate: 150.0, highest: 60 },
  { id: 'p4', name: 'M. Iyer', team_id: 'ts', runs: 128, strike_rate: 146.2, highest: 58 },
];

export const topBowling: BowlingLeader[] = [
  { id: 'p5', name: 'S. Nair', team_id: 'ke', wickets: 9, economy: 6.2, best: '4/14' },
  { id: 'p6', name: 'K. Varma', team_id: 'tn', wickets: 8, economy: 6.8, best: '3/10' },
  { id: 'p7', name: 'H. Reddy', team_id: 'ap', wickets: 7, economy: 7.1, best: '3/12' },
  { id: 'p8', name: 'G. Rao', team_id: 'ka', wickets: 6, economy: 6.5, best: '3/16' },
];
