export interface Highlight {
  image: string;
  title: string;
  description: string;
  category?: string;
  isWide?: boolean; // wide tile in the preview grid
}

// The first five items fill the homepage preview grid (index 2 is the wide featured tile).
const PREVIEW_HIGHLIGHTS: Highlight[] = [
  { image: '/image_13.avif', title: '', description: '', category: '' },
  { image: '/image_15.avif', title: '', description: '', category: '' },
  { image: '/image_30.avif', title: '', description: '', category: '', isWide: true },
  { image: '/image_29.avif', title: '', description: '', category: '' },
  { image: '/news paper cuttings.avif', title: '', description: '', category: '' },
];

const GALLERY_HIGHLIGHTS: Highlight[] = Array.from({ length: 44 }, (_, i) => ({
  image: `/highlights/${i + 1}.avif`,
  title: `SSPL Highlight ${i + 1}`,
  description: 'Exciting moment from SSPL T10 Tournament',
  category: 'Tournament Action',
}));

export const highlights: Highlight[] = [...PREVIEW_HIGHLIGHTS, ...GALLERY_HIGHLIGHTS];

/** The preview grid needs this many items; with fewer, the built-in list is used. */
export const MIN_HIGHLIGHTS = PREVIEW_HIGHLIGHTS.length;

export default highlights;
