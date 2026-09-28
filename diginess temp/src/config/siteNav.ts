// Site map for the public header and slide-in menu.
// Links marked `comingSoon` have no page yet: App.tsx routes them to the Coming Soon page,
// so every menu link works. Build the page, add its route, then drop the flag.

export interface SiteNavLink {
  label: string;
  to: string;
  comingSoon?: boolean;
  // Optional heading: links that share a group are listed together under it in menus
  group?: string;
}

export interface SiteNavSection {
  label: string;
  to: string;
  end?: boolean;
  // Sections past the first few live under "More" on desktop
  inMore?: boolean;
  children?: SiteNavLink[];
}

export const SITE_NAV: SiteNavSection[] = [
  { label: 'Home', to: '/', end: true },
  {
    label: 'About',
    to: '/about-us',
    children: [
      { label: 'About SSPL', to: '/about-us' },
      { label: 'Vision & Mission', to: '/about/vision-mission', comingSoon: true },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'League Format', to: '/about/league-format', comingSoon: true },
      { label: 'League Constitution', to: '/about/league-constitution', comingSoon: true },
      { label: 'Organising Team', to: '/about/organising-team', comingSoon: true },
    ],
  },
  {
    label: 'Players & Trials',
    to: '/register',
    children: [
      { group: 'Players', label: 'Player Registration', to: '/register' },
      { group: 'Players', label: 'Eligibility', to: '/players/eligibility', comingSoon: true },
      { group: 'Players', label: 'Selection Process', to: '/players/selection-process', comingSoon: true },
      { group: 'Players', label: 'Player Profiles', to: '/players/profiles', comingSoon: true },
      { group: 'Trials', label: 'Trial Schedule', to: '/trials/schedule', comingSoon: true },
      { group: 'Trials', label: 'Trial Locations', to: '/trials/locations', comingSoon: true },
      { group: 'Trials', label: 'Selection Results', to: '/trial-results' },
      { group: 'Trials', label: 'Selected Players', to: '/players/selected', comingSoon: true },
    ],
  },
  {
    label: 'Teams & Matches',
    to: '/teams',
    children: [
      { group: 'Teams', label: 'Teams', to: '/teams' },
      { group: 'Teams', label: 'Team Profiles', to: '/teams/profiles', comingSoon: true },
      { group: 'Teams', label: 'Owners', to: '/teams/owners', comingSoon: true },
      { group: 'Teams', label: 'Captains', to: '/teams/captains', comingSoon: true },
      { group: 'Teams', label: 'Squads', to: '/teams/squads', comingSoon: true },
      { group: 'Matches', label: 'Fixtures', to: '/matches' },
      { group: 'Matches', label: 'Points Table', to: '/points-table' },
      { group: 'Matches', label: 'Live Matches', to: '/matches/live', comingSoon: true },
      { group: 'Matches', label: 'Results', to: '/matches/results', comingSoon: true },
      { group: 'Matches', label: 'Match Centre', to: '/matches/centre', comingSoon: true },
      { group: 'Matches', label: 'Scorecard', to: '/matches/scorecard', comingSoon: true },
      { group: 'Matches', label: 'Commentary', to: '/matches/commentary', comingSoon: true },
    ],
  },
  {
    label: 'Media',
    to: '/articles-blogs',
    children: [
      { label: 'News', to: '/articles-blogs' },
      { label: 'Videos', to: '/videos' },
      { label: 'Match Highlights', to: '/media/highlights', comingSoon: true },
      { label: 'Photos', to: '/media/photos', comingSoon: true },
      { label: 'Announcements', to: '/media/announcements', comingSoon: true },
    ],
  },
  {
    label: 'Tournament',
    to: '/tournament/schedule',
    inMore: true,
    children: [
      { label: 'Schedule', to: '/tournament/schedule', comingSoon: true },
      { label: 'League Stage', to: '/tournament/league-stage', comingSoon: true },
      { label: 'Playoffs', to: '/tournament/playoffs', comingSoon: true },
      { label: 'Final', to: '/tournament/final', comingSoon: true },
    ],
  },
  {
    label: 'Auction',
    to: '/auction',
    inMore: true,
    children: [
      { label: 'Auction Players', to: '/auction' },
      { label: 'Auction Results', to: '/auction/results', comingSoon: true },
      { label: 'Sold Players', to: '/auction/sold', comingSoon: true },
      { label: 'Unsold Players', to: '/auction/unsold', comingSoon: true },
    ],
  },
  {
    label: 'Partners',
    to: '/partners/sponsors',
    inMore: true,
    children: [
      { label: 'Sponsors', to: '/partners/sponsors', comingSoon: true },
      { label: 'Franchise Partners', to: '/partners/franchise', comingSoon: true },
      { label: 'Media Partners', to: '/partners/media', comingSoon: true },
    ],
  },
  {
    label: 'Information',
    to: '/terms-and-conditions',
    inMore: true,
    children: [
      { label: 'Rules & Regulations', to: '/information/rules', comingSoon: true },
      { label: 'Rulebook', to: '/information/rulebook', comingSoon: true },
      { label: 'Code of Conduct', to: '/dugout-code-of-conduct' },
      { label: 'Anti-Corruption', to: '/information/anti-corruption', comingSoon: true },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
    ],
  },
  {
    label: 'Contact',
    to: '/enquiry',
    inMore: true,
    children: [
      { label: 'Contact Us', to: '/enquiry' },
      { label: 'FAQ', to: '/faqs' },
      { label: 'Support', to: '/support', comingSoon: true },
    ],
  },
];

// One entry per Coming Soon path (Trial Schedule appears under both Players and Trials)
export const COMING_SOON_PAGES: SiteNavLink[] = [
  ...new Map(
    SITE_NAV.flatMap((section) => section.children ?? [])
      .filter((link) => link.comingSoon)
      .map((link) => [link.to, link] as const),
  ).values(),
];

export const findNavLink = (path: string) =>
  SITE_NAV.flatMap((section) => (section.children ?? []).map((link) => ({ ...link, section: section.label })))
    .find((link) => link.to === path);
