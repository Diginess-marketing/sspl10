import selectedPlayers from '@/data/selectedPlayers.json';
import selectedPlayers2 from '@/data/selectedPlayers2.json';

export type FeaturedRole = 'Bowler' | 'Batting' | 'All-rounder';

/** One card in the homepage "Featured selected players" carousel. */
export interface FeaturedPlayer {
  name: string;
  state: string;
  role: FeaturedRole;
  image: string;
  /** CSS object-position for the photo crop, e.g. "50% 0%" or "right top". */
  position?: string;
}

/**
 * Built-in selection: a hand-picked set of 12 from the full auction list
 * (spread across states, mixed roles). Everyone else lives on /auction.
 */
const FEATURED_IMAGES = [
  '/assets/players/ashish-yadav.webp',
  '/assets/players/balaji-s-srinivasan.webp',
  '/assets/players/david.webp',
  '/assets/players/dharshan-d.webp',
  '/assets/players/varun-suri.webp',
  '/assets/players/vijendra-kumar.webp',
  '/assets/players/pranav-jadav.webp',
  '/assets/players/sooraj-pk.webp',
  '/assets/players/kunchapa-narashima.webp',
  '/assets/players/md-shakir-khan.webp',
  '/assets/players2/miriyala-ravi-chandra.webp',
  '/assets/players/vipin-verma.webp',
];

// A few source rows spell states without a space; show them the way the reference does.
const STATE_FIX: Record<string, string> = {
  TAMILNADU: 'TAMIL NADU',
  MAHARASTRA: 'MAHARASHTRA',
  UTTARPRADESH: 'UTTAR PRADESH',
  ANDHRAPRADESH: 'ANDHRA PRADESH',
  MADHYAPRADESH: 'MADHYA PRADESH',
};

const roleOf = (raw: string): FeaturedRole => {
  const r = (raw || '').toUpperCase();
  if (r.startsWith('BOWL')) return 'Bowler';
  if (r === 'AR') return 'All-rounder';
  return 'Batting';
};

const stateOf = (location: string) => {
  const s = (location || '').split(',').pop()?.trim().toUpperCase() ?? '';
  return STATE_FIX[s] ?? s;
};

const byImage = new Map(
  [...selectedPlayers, ...selectedPlayers2].map((p) => [p.image, p] as const),
);

export const featuredPlayers: FeaturedPlayer[] = FEATURED_IMAGES.flatMap((image) => {
  const p = byImage.get(image);
  if (!p) return [];
  return [{
    name: p.name.split('-')[0].trim(),
    state: stateOf(p.location),
    role: roleOf(p.role),
    image,
    // Balaji stands to the right of frame in his source photo
    position: p.name.includes('BALAJI') ? 'right top' : '50% 0%',
  }];
});

export default featuredPlayers;
