export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
}

export const news: NewsItem[] = [
  {
    id: 'n1',
    slug: 'season-2025-announced',
    title: 'SSPL T10 Season 2025 Announced',
    excerpt: 'Tournament dates, venues, and expanded team roster revealed for an electrifying season.',
    content:
      'The Southern Street Premier League T10 returns in 2025 with more teams, high-octane fixtures, and fan engagement initiatives across the region. Stay tuned for registration details, full schedule, and ticketing updates.',
    author: 'SSPL Media Team',
    publishedAt: new Date().toISOString(),
    category: 'League',
    tags: ['announcement', 'season-2025', 'fixtures'],
    thumbnail: '/Gallery/image_21.png',
  },
  {
    id: 'n2',
    slug: 'auction-preview-top-talent',
    title: 'Auction Preview: Top Talent to Watch',
    excerpt: 'A look at emerging stars and proven performers ahead of the season auctions.',
    content:
      'With the player auction around the corner, scouts have flagged several standout batters and bowlers set to make a mark. Team strategies indicate a blend of power-hitting and economy bowling will dominate the draft boards.',
    author: 'Analyst Desk',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    category: 'Auction',
    tags: ['auction', 'players', 'analysis'],
    thumbnail: '/Gallery/image_25.png',
  },
];

export default news;
