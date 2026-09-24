// The site's built-in (hardcoded) content per collection, used by the content admin's
// "Import current content" action. Admin-only: importing this pulls every dataset into the bundle.
import { blogPosts } from '@/data/blogs';
import featuredPlayers from '@/data/featuredPlayers';
import fixtures from '@/data/fixtures';
import highlights from '@/data/highlights';
import news from '@/data/news';
import partners from '@/data/partners';
import standings from '@/data/standings';
import { topBatting, topBowling } from '@/data/stats';
import videos from '@/data/videos';
import { FAQ_FALLBACK_ROWS } from './faq';
import type { CmsData } from './api';
import type { CmsCollectionKey } from './schema';

const asData = (items: readonly object[]) => items.map((item) => JSON.parse(JSON.stringify(item)) as CmsData);

export const BUILT_IN_CONTENT: Record<CmsCollectionKey, () => CmsData[]> = {
  blogs: () => asData(blogPosts),
  news: () => asData(news),
  videos: () => asData(videos),
  faq: () => asData(FAQ_FALLBACK_ROWS),
  fixtures: () => asData(fixtures),
  standings: () => asData(standings),
  batting_leaders: () => asData(topBatting),
  bowling_leaders: () => asData(topBowling),
  featured_players: () => asData(featuredPlayers),
  highlights: () => asData(highlights),
  partners: () => asData(partners),
};
