/** One partner logo. Logos sharing a `category` are shown together, in list order. */
export interface PartnerItem {
  category: string;
  /** Width of the category box in the 6-column desktop grid. */
  span: '2' | '4';
  alt: string;
  image: string;
}

export interface PartnerCategory {
  title: string;
  span: 2 | 4;
  partners: PartnerItem[];
}

// Same partners and grouping as the live site.
export const partners: PartnerItem[] = [
  { category: 'Media Partners', span: '4', alt: 'Radio City', image: '/Our-Sponsors/Radio-city.avif' },
  { category: 'Media Partners', span: '4', alt: 'Edge Media', image: '/Our-Sponsors/Edge-media.avif' },
  { category: 'Media Partners', span: '4', alt: 'Maalai Murasu', image: '/Our-Sponsors/Malai-Murasu.avif' },
  { category: 'Match Ball Partner', span: '2', alt: 'Sixit Sports', image: '/Our-Sponsors/Sixit.avif' },
  { category: 'Banking Partner', span: '2', alt: 'Equitas Bank', image: '/Our-Sponsors/Equitas-Bank.avif' },
  { category: 'Sports Partners', span: '4', alt: 'Zportify', image: '/images/zportify-logo.png' },
  { category: 'Sports Partners', span: '4', alt: 'OVP', image: '/Our-Sponsors/Odi-Vilayadu-Papa.avif' },
  { category: 'Sports Partners', span: '4', alt: 'Football Makka', image: '/Our-Sponsors/Football-Makka.avif' },
  { category: 'Community Partners', span: '2', alt: 'Lions Club International', image: '/Our-Sponsors/Lions-International-.avif' },
  { category: 'Associate Partners', span: '2', alt: 'Astro Messiah - SSPL Partner', image: '/Our-Sponsors/Astro-Messiah.jpeg' },
  { category: 'Associate Partners', span: '2', alt: 'Reflect Media - SSPL Partner', image: '/Our-Sponsors/Reflect-Media.avif' },
];

/** Groups logos by category, keeping the order in which categories first appear. */
export const groupPartners = (items: PartnerItem[]): PartnerCategory[] => {
  const categories: PartnerCategory[] = [];
  for (const item of items) {
    let category = categories.find((c) => c.title === item.category);
    if (!category) {
      category = { title: item.category, span: String(item.span) === '4' ? 4 : 2, partners: [] };
      categories.push(category);
    }
    category.partners.push(item);
  }
  return categories;
};

export default partners;
