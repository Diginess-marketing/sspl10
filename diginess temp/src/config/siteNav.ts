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
      { group: 'SSPL', label: 'About SSPL', to: '/about-us' },
      { group: 'SSPL', label: 'Vision & Mission', to: '/about/vision-mission' },
      { group: 'SSPL', label: 'Organising Team', to: '/about-us' },
      { group: 'SSPL', label: 'League Constitution', to: '/about/league-constitution' },
      { group: 'The league', label: 'How It Works', to: '/how-it-works' },
      { group: 'The league', label: 'League Format', to: '/about/league-format' },
      { group: 'The league', label: 'Training & Mentors', to: '/league/training-mentors' },
      { group: 'The league', label: 'Cricket Development', to: '/league/cricket-development' },
    ],
  },
  {
    label: 'Players & Trials',
    to: '/register',
    children: [
      { group: 'Players', label: 'Player Registration', to: '/register' },
      { group: 'Players', label: 'Eligibility', to: '/players/eligibility' },
      { group: 'Players', label: 'Selection Process', to: '/players/selection-process' },
      { group: 'Players', label: 'Player Profiles', to: '/players/profiles' },
      { group: 'Players', label: 'Selected Players', to: '/players/selected' },
      { group: 'Trials', label: 'Trials', to: '/trials' },
      { group: 'Trials', label: 'Registration Process', to: '/trials/registration-process' },
      { group: 'Trials', label: 'Trial Schedule', to: '/trials/schedule' },
      { group: 'Trials', label: 'Trial Locations', to: '/trials/locations' },
      { group: 'Trials', label: 'Selection Results', to: '/trial-results' },
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
      { group: 'Matches', label: 'Fixtures & Match Centre', to: '/matches' },
      { group: 'Matches', label: 'Live Score', to: '/matches/live' },
      { group: 'Matches', label: 'Results', to: '/matches/results' },
      { group: 'Matches', label: 'Points Table', to: '/points-table' },
      { group: 'Matches', label: 'Stats', to: '/stats' },
      { group: 'Matches', label: 'Tickets', to: '/matches/tickets' },
    ],
  },
  {
    label: 'Media',
    to: '/articles-blogs',
    children: [
      { label: 'News', to: '/articles-blogs' },
      { label: 'Announcements', to: '/media/announcements' },
      { label: 'Videos', to: '/videos' },
      { label: 'Match Highlights', to: '/media/highlights' },
      { label: 'Photo Gallery', to: '/media/photos' },
    ],
  },
  {
    label: 'Tournament',
    to: '/tournament/schedule',
    inMore: true,
    children: [
      { label: 'Schedule', to: '/tournament/schedule' },
      { label: 'League Stage', to: '/tournament/league-stage' },
      { label: 'Playoffs', to: '/tournament/playoffs' },
      { label: 'Final', to: '/tournament/final' },
      { label: 'League Process', to: '/league/process' },
      { label: 'State League', to: '/league/state-league' },
      { label: 'National League', to: '/league/national-league' },
      { label: 'International & Tours', to: '/league/international' },
    ],
  },
  {
    label: 'Auction',
    to: '/auction',
    inMore: true,
    children: [
      { label: 'Auction Players', to: '/auction' },
      { label: 'Auction Results', to: '/auction/results' },
      { label: 'Sold Players', to: '/auction/sold' },
      { label: 'Unsold Players', to: '/auction/unsold' },
    ],
  },
  {
    label: 'Partners',
    to: '/partners/sponsors',
    inMore: true,
    children: [
      { label: 'Sponsors', to: '/partners/sponsors' },
      { label: 'Media Partners', to: '/partners/media' },
      { label: 'Franchise Partners', to: '/partners/franchise-partners' },
      { label: 'Franchise', to: '/partners/franchise' },
      { label: 'Franchise Registration', to: '/partners/franchise#register' },
    ],
  },
  {
    label: 'Information',
    to: '/terms-and-conditions',
    inMore: true,
    children: [
      { label: 'Rulebook', to: '/information/rulebook' },
      { label: 'Code of Conduct', to: '/dugout-code-of-conduct' },
      { label: 'Anti-Corruption', to: '/information/anti-corruption' },
      { label: 'Commercial Guidelines', to: '/commercial-guidelines' },
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
      { label: 'Support', to: '/support' },
      { label: 'App Download', to: '/app' },
      { label: 'Social Media', to: '/social' },
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
