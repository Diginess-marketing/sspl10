import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// Use VITE_SITE_URL or default
const BASE_URL = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://ssplt10.co.in').replace(/\/$/, '');

// 1. Static Navigable Routes (Visible in Header/Footer)
const STATIC_ROUTES = [
  '/',
  '/register',
  // '/trials', // User requested to hide
  // '/auction', // User requested to hide
  '/articles-blogs', // Main blog hub
  '/about-us',
  '/faqs',
  '/how-it-works',
  '/enquiry',
  '/trial-results',
  '/register-selector',
  '/tournament-organizer-registration',
  // Footer Policy Links
  '/terms-and-conditions',
  '/privacy-policy',
  '/cancellation-refund-policy',
  '/dugout-code-of-conduct',
  '/commercial-guidelines'
];

// 2. Dynamic Content Configuration
const CITIES = [
  { slug: 'mumbai', name: 'Mumbai' },
  { slug: 'delhi', name: 'Delhi' },
  { slug: 'bangalore', name: 'Bangalore' },
  { slug: 'kolkata', name: 'Kolkata' },
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'pune', name: 'Pune' },
  { slug: 'ahmedabad', name: 'Ahmedabad' },
  { slug: 'jaipur', name: 'Jaipur' },
  { slug: 'lucknow', name: 'Lucknow' }
];

const YEARS = [2026, 2027];

const ROLES = [
  'batsman',
  'bowler',
  'all-rounder',
  'wicket-keeper'
];

const BLOG_POSTS = [
  'ultimate-guide-t10-cricket',
  'power-hitting-tennis-ball-cricket',
  'bowling-variations-drills',
  'sharpening-fielding-skills'
];

// Generate Programmatic Routes
const PROGRAMMATIC_ROUTES = [];
CITIES.forEach(city => {
  YEARS.forEach(year => {
    // City + Year Page (e.g., /trials/mumbai-2026)
    const cityYearSlug = `${city.slug}-${year}`;
    PROGRAMMATIC_ROUTES.push(`/trials/${cityYearSlug}`);

    // City + Year + Role Pages (e.g., /trials/mumbai-2026/batsman)
    ROLES.forEach(role => {
      PROGRAMMATIC_ROUTES.push(`/trials/${cityYearSlug}/${role}`);
    });
  });
});

// 3. Helper Functions
function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generate() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Combine all routes
  const allRoutes = [
    ...STATIC_ROUTES,
    // ...PROGRAMMATIC_ROUTES, // User requested to hide programmatic pages for now
    ...BLOG_POSTS.map(slug => `/blog/${slug}`)
  ];

  console.log(`🔍 Generating sitemap for ${allRoutes.length} routes...`);

  const urls = allRoutes.map((route) => {
    const loc = `${BASE_URL}${route}`;
    // Assign higher priority to main pages
    const isHighPriority = route === '/' || route === '/register';
    const isMediumPriority = route.startsWith('/trials') || route === '/auction';

    const priority = isHighPriority ? '1.0' : (isMediumPriority ? '0.8' : '0.7');

    return `    <url>
      <loc>${xmlEscape(loc)}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${priority}</priority>
    </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  // Write sitemap.xml
  fs.writeFileSync(OUT_FILE, xml, 'utf8');
  console.log(`✅ Sitemap generated at ${OUT_FILE}`);

  // Generate robots.txt
  generateRobotsTxt();
}

function generateRobotsTxt() {
  const robotsTxt = `# robots.txt for SSPL T10 Cricket League
# Generated: ${new Date().toISOString().split('T')[0]}
# Allows all search engines to crawl the website

# Google specific rules
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Crawl-delay: 0

# Bing specific rules
User-agent: Bingbot
Allow: /
Disallow: /admin/
Crawl-delay: 1

# Social Media Crawlers
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Other good bots
User-agent: LinkedInBot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots and scrapers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Default rule for all other bots
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /*.json$

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Request rate
Request-rate: 30/1m
`;

  const publicRobotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  fs.writeFileSync(publicRobotsPath, robotsTxt, 'utf8');
  console.log(`✅ robots.txt generated at ${publicRobotsPath}`);
}

generate();
