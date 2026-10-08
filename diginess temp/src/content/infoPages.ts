// Copy for the league information pages (rendered by src/pages/league/InfoPage.tsx).
// Facts come from what the site already publishes (FAQ, How It Works, About). Pages marked
// `draft` are policy text that SSPL must approve; they show a "Draft" banner until then.

export interface InfoSection {
  heading: string;
  text?: string[];
  bullets?: string[];
  steps?: { title: string; text: string }[];
  cards?: { title: string; text: string }[];
  links?: { to: string; label: string }[];
}

export interface InfoPageContent {
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  draft?: boolean;
  sections: InfoSection[];
  cta?: { to: string; label: string };
}

const REGISTER = { to: '/register', label: 'Register for trials' };

export const INFO_PAGES: InfoPageContent[] = [
  {
    path: '/about/vision-mission',
    eyebrow: 'About SSPL',
    title: 'Vision & Mission',
    intro: 'Taking street cricket from the gully to the stadium.',
    sections: [
      { heading: 'Our vision', text: ['To elevate the potential of street cricket to form the next generation of game-changers, and to officially standardise gully cricket and take it to the next level.'] },
      { heading: 'Our mission', text: ['Scouting street champs. Launching future stars.'] },
      {
        heading: 'What we stand for',
        cards: [
          { title: 'Talent first', text: 'Selection is based on performance at the trials — not on contacts, club or background.' },
          { title: 'Open to everyone', text: 'Any player aged 12 or above can register, with no upper age limit, from any state.' },
          { title: 'Fair, tech-assisted selection', text: 'Advanced trial levels use AI-based assessment of batting and bowling alongside expert selectors.' },
          { title: 'A real stage', text: 'A professional T10 tennis ball league, with the final played in an international stadium.' },
        ],
      },
    ],
    cta: REGISTER,
  },
  {
    path: '/about/league-format',
    eyebrow: 'About SSPL',
    title: 'League Format',
    intro: 'SSPL is a T10 tennis ball cricket league played by franchise teams from across India.',
    sections: [
      {
        heading: 'Format at a glance',
        cards: [
          { title: 'T10 tennis ball cricket', text: 'Ten overs per side, played with the Sixit Lite tennis ball in every match and trial.' },
          { title: '12 franchise teams', text: 'Twelve franchisees representing different states, each with a squad of 25 players.' },
          { title: 'League then playoffs', text: 'Teams play a league stage; the top 4 qualify for the playoffs.' },
          { title: 'Final at Sharjah', text: 'The final is played at Sharjah Stadium — the first tennis ball league from South India to play in an international stadium.' },
        ],
      },
      { heading: 'Every player gets a game', text: ['Each player in a squad plays at least one match in the league.'] },
      { heading: 'How players get into a team', text: ['Players come through the trials (Levels 1–5) and the player auction, where franchisees bid for selected players.'], links: [{ to: '/league/process', label: 'See the full league process' }] },
    ],
    cta: REGISTER,
  },
  {
    path: '/players/eligibility',
    eyebrow: 'Players',
    title: 'Eligibility',
    intro: 'Who can register for the SSPL trials, and what to bring.',
    sections: [
      {
        heading: 'Who can register',
        bullets: [
          'Players aged 12 or above on the date of registration. There is no upper age limit.',
          'Professional, club-level and street cricketers are all welcome — selection is purely on talent.',
          'You can register in any state and attend trials in a different state from where you live.',
          'Groups can register together using Team Registration; each player is still assessed individually.',
          'Overseas players can register with a fee of USD 60.',
        ],
      },
      {
        heading: 'What you need',
        bullets: [
          'At registration: name, mobile number, date of birth, email, state and playing role (batting, bowling or all-rounder). No documents are uploaded online.',
          'At the trial: proof of date of birth for verification.',
          'Your own cricket kit, sports clothing and proper sports shoes. Balls are provided.',
        ],
      },
      {
        heading: 'Fees',
        bullets: [
          'The registration fee is paid online at registration (UPI, Google Pay, cards or net banking). Cash is not accepted.',
          'The registration fee is non-refundable and non-transferable.',
        ],
      },
    ],
    cta: REGISTER,
  },
  {
    path: '/players/selection-process',
    eyebrow: 'Players',
    title: 'Selection Process',
    intro: 'Five trial levels decide who reaches the player auction.',
    sections: [
      {
        heading: 'The five trial levels',
        steps: [
          { title: 'Levels 1–3 · Nets trials', text: 'Batting and bowling in the nets, judged by selectors. Selected players move up one level at a time.' },
          { title: 'Level 4 · AI assessment', text: 'An AI-based assessment of your batting and bowling.' },
          { title: 'Level 5 · Ground match', text: 'A 10-over match on the ground, the final test before the auction.' },
        ],
      },
      {
        heading: 'After each level',
        bullets: [
          'You are emailed your result at every level — selected, not selected or absent.',
          'Selected players get a Certificate of Achievement for that level; players who are not selected get a Certificate of Participation.',
          'You can check your results any time on the Results page with your registered mobile number.',
        ],
        links: [{ to: '/trial-results', label: 'Check your results' }],
      },
      { heading: 'After Level 5', text: ['Players selected at the final level enter the player auction, where franchisees bid for them.'], links: [{ to: '/auction', label: 'About the auction' }] },
    ],
    cta: REGISTER,
  },
  {
    path: '/trials/registration-process',
    eyebrow: 'Trials',
    title: 'Registration Process',
    intro: 'From signing up to standing at the crease — step by step.',
    sections: [
      {
        heading: 'How to register',
        steps: [
          { title: 'Fill in the form', text: 'Click Register and enter your name, mobile number, date of birth, email, state and playing role.' },
          { title: 'Pay online', text: 'Pay the registration fee by UPI, Google Pay, card or net banking. Cash is not accepted.' },
          { title: 'Get your confirmation', text: 'You receive a confirmation email once the payment succeeds.' },
          { title: 'Receive your trial details', text: 'Venue, date and time are shared about 5 days before your trial, based on your state.' },
          { title: 'Attend the trial', text: 'Bring proof of date of birth, your kit and sports shoes.' },
        ],
      },
      {
        heading: 'Good to know',
        bullets: [
          'Spot registration is available at trial venues.',
          'You can register for trials in more than one state to improve your chances.',
          'Paid but no confirmation? Send a screenshot of the payment to our WhatsApp number +91 88077 75960.',
        ],
      },
    ],
    cta: REGISTER,
  },
  {
    path: '/league/process',
    eyebrow: 'League',
    title: 'League Process',
    intro: 'The journey from registration to the final.',
    sections: [
      {
        heading: 'Step by step',
        steps: [
          { title: 'Registration', text: 'Players aged 12+ register online from anywhere in India.' },
          { title: 'Trials · Levels 1–5', text: 'Nets trials (1–3), AI assessment (4) and a 10-over ground match (5).' },
          { title: 'Player auction', text: 'Franchisees bid for the players selected at the final trial level.' },
          { title: 'League stage', text: '12 franchise teams of 25 players play T10 tennis ball cricket.' },
          { title: 'Playoffs', text: 'The top 4 teams from the league stage qualify.' },
          { title: 'Final', text: 'The final is played at Sharjah Stadium.' },
        ],
      },
    ],
    cta: REGISTER,
  },
  {
    path: '/league/state-league',
    eyebrow: 'League',
    title: 'State League',
    intro: 'Where players from each state come through.',
    draft: true,
    sections: [
      { heading: 'State-wise trials', text: ['SSPL holds trials across states so that talent from every region gets a fair chance. Players are allotted a trial venue near them based on the state they register in.'] },
      { heading: 'Franchises by state', text: ['Each of the 12 franchise teams represents a state. State-level fixtures, venues and team line-ups will be published here when they are announced.'] },
    ],
    cta: { to: '/trials', label: 'See trial venues' },
  },
  {
    path: '/league/national-league',
    eyebrow: 'League',
    title: 'National League',
    intro: 'Twelve franchises, one title.',
    draft: true,
    sections: [
      { heading: 'The national stage', text: ['The SSPL league brings together the 12 franchise teams for the league stage, playoffs and final. Schedules and results are published on the Matches pages.'], links: [{ to: '/matches', label: 'Fixtures' }, { to: '/points-table', label: 'Points table' }] },
    ],
  },
  {
    path: '/league/international',
    eyebrow: 'League',
    title: 'International & Tours',
    intro: 'Taking street cricket beyond India.',
    draft: true,
    sections: [
      { heading: 'Final at Sharjah', text: ['The SSPL final is played at Sharjah Stadium, giving tennis ball cricketers the experience of an international venue.'] },
      { heading: 'Overseas players', text: ['Players from outside India can register for the trials with a fee of USD 60.'] },
      { heading: 'Tours', text: ['Details of tours and exhibition matches will be announced here.'] },
    ],
  },
  {
    path: '/league/training-mentors',
    eyebrow: 'League',
    title: 'Training & Mentors',
    intro: 'Guidance for the players who come through SSPL.',
    draft: true,
    sections: [
      { heading: 'Programme', text: ['SSPL plans to support selected players with coaching and mentoring from experienced cricketers. Mentors, sessions and venues will be listed here once confirmed.'] },
    ],
  },
  {
    path: '/league/cricket-development',
    eyebrow: 'League',
    title: 'Cricket Development',
    intro: 'Growing tennis ball cricket from the grassroots.',
    draft: true,
    sections: [
      {
        heading: 'Our approach',
        bullets: [
          'Trials in every region, so talent is found wherever it is.',
          'A clear pathway from street cricket to a professional league.',
          'Standardised rules, equipment (Sixit Lite tennis ball) and fair, tech-assisted selection.',
        ],
      },
    ],
    cta: REGISTER,
  },
  {
    path: '/about/league-constitution',
    eyebrow: 'About SSPL',
    title: 'League Constitution',
    intro: 'How the Southern Street Premier League is organised and governed.',
    draft: true,
    sections: [
      { heading: '1. The league', text: ['The Southern Street Premier League (SSPL) is a T10 tennis ball cricket league organised by Royal Peacocks League Limited, Chennai.'] },
      { heading: '2. Governance', text: ['The league is overseen by its management committee, led by the Chairman and the Managing Director, who approve the rules, schedules and disciplinary decisions.'] },
      { heading: '3. Franchises', text: ['The league is contested by franchise teams representing different states. Franchise rights, obligations and squad rules are set out in each franchise agreement and the Rulebook.'] },
      { heading: '4. Players', text: ['Players enter through registration, the trial levels and the player auction. All players agree to the Code of Conduct and the Anti-Corruption policy.'], links: [{ to: '/dugout-code-of-conduct', label: 'Code of Conduct' }, { to: '/information/anti-corruption', label: 'Anti-Corruption' }] },
      { heading: '5. Amendments', text: ['The management committee may amend this constitution. Changes are published on this page.'] },
    ],
  },
  {
    path: '/information/rulebook',
    eyebrow: 'Information',
    title: 'Rulebook',
    intro: 'Playing rules for SSPL matches and trials.',
    draft: true,
    sections: [
      {
        heading: 'Match format',
        bullets: [
          'T10: each side bats a maximum of 10 overs.',
          'All matches and trials use the Sixit Lite tennis ball.',
          'Players must wear proper sports clothing and sports shoes.',
        ],
      },
      {
        heading: 'Squads',
        bullets: [
          'Each franchise squad has 25 players.',
          'Every squad player plays at least one league match.',
        ],
      },
      {
        heading: 'Competition',
        bullets: [
          'Teams play a league stage; the top 4 teams qualify for the playoffs.',
          'The final is played at Sharjah Stadium.',
          'Points, tie-break and weather rules will be published before the season.',
        ],
      },
      { heading: 'Conduct', text: ['Players and officials must follow the Code of Conduct and the Anti-Corruption policy.'], links: [{ to: '/dugout-code-of-conduct', label: 'Code of Conduct' }, { to: '/information/anti-corruption', label: 'Anti-Corruption' }] },
    ],
  },
  {
    path: '/information/anti-corruption',
    eyebrow: 'Information',
    title: 'Anti-Corruption',
    intro: 'Protecting the integrity of the game.',
    draft: true,
    sections: [
      {
        heading: 'Prohibited',
        bullets: [
          'Fixing or contriving any part of a match, or the result of a trial.',
          'Betting on any SSPL match or trial, directly or through others.',
          'Sharing inside information (team selections, injuries, tactics) for betting or gain.',
          'Offering or accepting money, gifts or favours to influence a selection or performance.',
        ],
      },
      {
        heading: 'Duty to report',
        text: ['Anyone approached to take part in corruption must report it to SSPL immediately. Reports are handled confidentially.'],
        links: [{ to: '/enquiry', label: 'Report to SSPL' }],
      },
      { heading: 'Consequences', text: ['Breaches can lead to disqualification from trials, removal from the league and reporting to the authorities.'] },
    ],
  },
  {
    path: '/support',
    eyebrow: 'Contact',
    title: 'Support',
    intro: 'Help with registration, payments, trials and results.',
    sections: [
      {
        heading: 'Fastest ways to reach us',
        cards: [
          { title: 'WhatsApp', text: '+91 88077 75960 · 10:00 AM – 7:00 PM' },
          { title: 'Email', text: 'customercare@ssplt10.co.in' },
          { title: 'Phone', text: '+91 88077 75960' },
        ],
      },
      {
        heading: 'Common issues',
        bullets: [
          'Paid but no confirmation email: WhatsApp us a screenshot of the payment.',
          'Checking your trial result: use the Results page with your registered mobile number.',
          'Trial venue and time: shared about 5 days before your trial.',
        ],
        links: [{ to: '/trial-results', label: 'Check results' }, { to: '/faqs', label: 'Read the FAQ' }, { to: '/enquiry', label: 'Send an enquiry' }],
      },
    ],
  },
];

export const findInfoPage = (path: string) => INFO_PAGES.find((p) => p.path === path);
