// Registry of admin-editable content collections.
// Field definitions only (no data), so any page can import it cheaply. Each cms_items row
// stores one item in `data`, in the same shape the site's components already consume.

export type CmsFieldType =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'number'
  | 'date'
  | 'datetime'
  | 'url'
  | 'image'
  | 'boolean'
  | 'select'
  | 'tags';

export interface CmsField {
  /** Key in the item; dotted paths ("homeTeam.name") address nested objects. */
  name: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  options?: readonly string[];
  help?: string;
}

export interface CmsCollectionDef {
  label: string;
  description: string;
  /** Field shown as the row title in the admin list. */
  titleField: string;
  /** Extra field shown next to the title (e.g. date, language). */
  subtitleField?: string;
  fields: CmsField[];
  /** Stable, unique key for an item (used for URLs and upserts). */
  slugOf: (item: Record<string, unknown>, index: number) => string;
}

const slugify = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/** Slug from an image's file name; the full URL would share one long storage prefix across items. */
const fileSlug = (value: unknown) => slugify(String(value ?? '').split('/').pop()?.replace(/\.[a-z0-9]+$/i, ''));

const byId = (item: Record<string, unknown>, index: number) =>
  String(item.id || slugify(item.title) || `item-${index + 1}`);

export const FAQ_LANGUAGES = ['en', 'hi', 'ta', 'te', 'ma', 'ka', 'ur'] as const;
export const FAQ_ICONS = ['BookOpen', 'CreditCard', 'FileSearch', 'HelpCircle', 'Layers', 'Trophy', 'UserPlus'] as const;

const teamFields = (prefix: 'homeTeam' | 'awayTeam', label: string): CmsField[] => [
  { name: `${prefix}.id`, label: `${label} team ID`, type: 'text', required: true, help: 'e.g. tn, ka' },
  { name: `${prefix}.name`, label: `${label} team name`, type: 'text', required: true },
  { name: `${prefix}.abbreviation`, label: `${label} abbreviation`, type: 'text', required: true },
  { name: `${prefix}.logo`, label: `${label} logo`, type: 'image' },
];

const scoreFields = (prefix: 'team_a_score' | 'team_b_score', label: string): CmsField[] => [
  { name: `${prefix}.runs`, label: `${label} runs`, type: 'number' },
  { name: `${prefix}.wickets`, label: `${label} wickets`, type: 'number' },
  { name: `${prefix}.overs`, label: `${label} overs`, type: 'number' },
];

const collections = {
  blogs: {
    label: 'Blogs',
    description: 'Articles on /articles-and-blogs and the homepage blog preview.',
    titleField: 'title',
    subtitleField: 'date',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'URL slug', type: 'text', required: true, help: 'Used in the article URL. Lowercase-with-dashes.' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
      { name: 'content', label: 'Content (Markdown)', type: 'markdown', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true, help: 'As shown on the site, e.g. Dec 01, 2025' },
      { name: 'readTime', label: 'Read time', type: 'text', help: 'e.g. 8 min read' },
      { name: 'image', label: 'Cover image', type: 'image', required: true },
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },
  news: {
    label: 'News',
    description: 'News list on /news and article pages.',
    titleField: 'title',
    subtitleField: 'publishedAt',
    slugOf: (item, index) => String(item.slug || slugify(item.title) || `news-${index + 1}`),
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
      { name: 'content', label: 'Content', type: 'markdown', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'publishedAt', label: 'Published at', type: 'datetime', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'thumbnail', label: 'Thumbnail', type: 'image' },
    ],
  },
  videos: {
    label: 'Videos',
    description: 'Fallback list on /videos when YouTube cannot be reached.',
    titleField: 'title',
    subtitleField: 'publishedAt',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'youtubeId', label: 'YouTube video ID', type: 'text', required: true, help: 'The part after watch?v=' },
      { name: 'publishedAt', label: 'Published at', type: 'datetime', required: true },
      { name: 'duration', label: 'Duration', type: 'text', help: 'ISO 8601, e.g. PT1M45S' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  faq: {
    label: 'FAQ',
    description: 'FAQ page, homepage FAQ preview and chat widget. One row per question.',
    titleField: 'question',
    subtitleField: 'language',
    slugOf: (item, index) => `${item.language}-${item.categoryId}-${slugify(item.question) || index + 1}`,
    fields: [
      { name: 'language', label: 'Language', type: 'select', options: FAQ_LANGUAGES, required: true },
      { name: 'categoryId', label: 'Category ID', type: 'text', required: true, help: 'Questions with the same ID are grouped together.' },
      { name: 'categoryTitle', label: 'Category title', type: 'text', required: true },
      { name: 'icon', label: 'Category icon', type: 'select', options: FAQ_ICONS, required: true },
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      { name: 'videoId', label: 'Video ID', type: 'text' },
    ],
  },
  fixtures: {
    label: 'Fixtures',
    description: 'Matches on the match centre.',
    titleField: 'id',
    subtitleField: 'date',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'Match ID', type: 'text', required: true, help: 'Used in the match URL, e.g. match-001' },
      { name: 'match_number', label: 'Match number', type: 'number', required: true },
      { name: 'season', label: 'Season', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'text', required: true, help: '24h, e.g. 18:30' },
      { name: 'venue', label: 'Venue', type: 'text', required: true },
      { name: 'match_type', label: 'Match type', type: 'select', options: ['league', 'playoff', 'final'], required: true },
      { name: 'result', label: 'Status', type: 'select', options: ['upcoming', 'live', 'completed', 'cancelled'], required: true },
      { name: 'team_a_id', label: 'Team A ID', type: 'text', required: true },
      { name: 'team_b_id', label: 'Team B ID', type: 'text', required: true },
      ...teamFields('homeTeam', 'Home'),
      ...teamFields('awayTeam', 'Away'),
      ...scoreFields('team_a_score', 'Team A'),
      ...scoreFields('team_b_score', 'Team B'),
      { name: 'winner_id', label: 'Winner team ID', type: 'text' },
      { name: 'man_of_the_match', label: 'Player of the match', type: 'text' },
    ],
  },
  standings: {
    label: 'Points table',
    description: 'Rows of the points table on /points-table.',
    titleField: 'team_id',
    subtitleField: 'position',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'team_id', label: 'Team ID', type: 'text', required: true },
      { name: 'season', label: 'Season', type: 'text', required: true },
      { name: 'position', label: 'Position', type: 'number', required: true },
      { name: 'matches_played', label: 'Played', type: 'number', required: true },
      { name: 'wins', label: 'Wins', type: 'number', required: true },
      { name: 'losses', label: 'Losses', type: 'number', required: true },
      { name: 'draws', label: 'Draws', type: 'number', required: true },
      { name: 'points', label: 'Points', type: 'number', required: true },
      { name: 'net_run_rate', label: 'Net run rate', type: 'number', required: true },
    ],
  },
  batting_leaders: {
    label: 'Top batters',
    description: 'Batting tab of the stats section.',
    titleField: 'name',
    subtitleField: 'runs',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Player name', type: 'text', required: true },
      { name: 'team_id', label: 'Team ID', type: 'text', required: true },
      { name: 'runs', label: 'Runs', type: 'number', required: true },
      { name: 'strike_rate', label: 'Strike rate', type: 'number', required: true },
      { name: 'highest', label: 'Highest score', type: 'number', required: true },
    ],
  },
  bowling_leaders: {
    label: 'Top bowlers',
    description: 'Bowling tab of the stats section.',
    titleField: 'name',
    subtitleField: 'wickets',
    slugOf: byId,
    fields: [
      { name: 'id', label: 'ID', type: 'text', required: true },
      { name: 'name', label: 'Player name', type: 'text', required: true },
      { name: 'team_id', label: 'Team ID', type: 'text', required: true },
      { name: 'wickets', label: 'Wickets', type: 'number', required: true },
      { name: 'economy', label: 'Economy', type: 'number', required: true },
      { name: 'best', label: 'Best figures', type: 'text', required: true, help: 'e.g. 4/14' },
    ],
  },
  featured_players: {
    label: 'Featured players',
    description: 'Player cards in the homepage "Featured selected players" carousel, in display order.',
    titleField: 'name',
    subtitleField: 'state',
    slugOf: (item, index) => fileSlug(item.image) || slugify(item.name) || `player-${index + 1}`,
    fields: [
      { name: 'name', label: 'Player name', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true, help: 'Shown in capitals, e.g. TAMIL NADU' },
      { name: 'role', label: 'Role', type: 'select', options: ['Bowler', 'Batting', 'All-rounder'], required: true },
      { name: 'image', label: 'Photo', type: 'image', required: true, help: 'Portrait photo, about 500×600.' },
      { name: 'position', label: 'Photo crop position', type: 'text', help: 'Optional. Which part of the photo stays visible, e.g. "50% 0%" (top centre) or "right top".' },
    ],
  },
  highlights: {
    label: 'Homepage highlights',
    description: 'Photo gallery in the homepage highlights section. The first five are the preview grid.',
    titleField: 'image',
    subtitleField: 'title',
    slugOf: (item, index) => fileSlug(item.image) || `highlight-${index + 1}`,
    fields: [
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'isWide', label: 'Wide tile in preview grid', type: 'boolean' },
    ],
  },
  partners: {
    label: 'Partners',
    description: 'Logos in the homepage partners section, grouped by category.',
    titleField: 'alt',
    subtitleField: 'category',
    slugOf: (item, index) => slugify(`${item.category}-${item.alt}`) || `partner-${index + 1}`,
    fields: [
      { name: 'category', label: 'Category', type: 'text', required: true, help: 'e.g. Media Partners. Logos with the same category are grouped.' },
      { name: 'span', label: 'Category width', type: 'select', options: ['2', '4'], required: true, help: 'Width of the category box on desktop (out of 6).' },
      { name: 'alt', label: 'Partner name', type: 'text', required: true },
      { name: 'image', label: 'Logo', type: 'image', required: true },
    ],
  },
} satisfies Record<string, CmsCollectionDef>;

export type CmsCollectionKey = keyof typeof collections;

export const CMS_COLLECTIONS: Record<CmsCollectionKey, CmsCollectionDef> = collections;

export const CMS_COLLECTION_KEYS = Object.keys(CMS_COLLECTIONS) as CmsCollectionKey[];

export const getPath = (obj: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);

export const setPath = (obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
  const [head, ...rest] = path.split('.');
  if (!rest.length) {
    return { ...obj, [head]: value };
  }
  const child = (obj[head] && typeof obj[head] === 'object' ? obj[head] : {}) as Record<string, unknown>;
  return { ...obj, [head]: setPath(child, rest.join('.'), value) };
};
