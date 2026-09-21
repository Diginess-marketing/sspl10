export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  publishedAt: string;
  duration?: string; // ISO 8601 duration e.g., PT1M30S
  description?: string;
}

export const videos: VideoItem[] = [
  {
    id: 'v1',
    title: 'SSPL Highlights — Opening Week',
    youtubeId: 'dQw4w9WgXcQ',
    publishedAt: new Date().toISOString(),
    duration: 'PT1M45S',
    description: 'Opening week highlights featuring top batting and bowling moments from SSPL T10.'
  },
  {
    id: 'v2',
    title: 'Top Batting Performances',
    youtubeId: '9bZkp7q19f0',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration: 'PT2M10S',
    description: 'A compilation of the most explosive batting displays in the tournament.'
  },
  {
    id: 'v3',
    title: 'Unplayable Yorkers — Best Bowling',
    youtubeId: '3JZ_D3ELwOQ',
    publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    duration: 'PT1M30S',
    description: 'Deadly yorkers and pinpoint accuracy—watch the best bowling spells.'
  },
];

export default videos;
