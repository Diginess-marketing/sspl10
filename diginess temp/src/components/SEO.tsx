import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SEO_PRESETS,
  mergeSEOConfig,
  createMetaTags,
  generateOrganizationSchema,
  generateEventSchema,
  generateLocalBusinessSchema,
  type SEOConfig,
  type SchemaMarkup,
} from '@/utils/seoOptimization';

// Environment variables with fallback defaults
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://ssplt10.co.in';
const SITE_TITLE = import.meta.env.VITE_SITE_TITLE || 'SSPL T10 - Southern Street Premier League';
const SITE_IMAGE = `${SITE_URL}/ssplt10-logo.png`;

type PresetKey = keyof typeof SEO_PRESETS;

interface SEOProps {
  preset?: PresetKey;
  config?: Partial<SEOConfig>;
  canonical?: string;
  schemas?: SchemaMarkup[];
  alternates?: Array<{ hrefLang: string; href: string }>;
  includeOrganizationSchema?: boolean;
  includeEventSchema?: boolean;
  includeLocalBusinessSchema?: boolean;
  eventDetails?: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    image?: string;
    url?: string;
  };
}

/**
 * Enhanced SEO component with comprehensive meta tags and schema injection
 * 
 * Features:
 * - Title, description, canonical, robots meta tags
 * - OpenGraph (og:title, og:description, og:image, og:url, etc.)
 * - Twitter Cards (twitter:card, twitter:title, twitter:description, etc.)
 * - JSON-LD schema injection for Organization + SportsEvent
 * - Environment variable support for SITE_TITLE and SITE_URL
 * - Ensures only one <title> and canonical tag appear
 */
const SEO: React.FC<SEOProps> = ({
  preset = 'home',
  config = {},
  canonical,
  schemas = [],
  alternates = [],
  includeOrganizationSchema = true,
  includeEventSchema = false,
  includeLocalBusinessSchema = false,
  eventDetails,
}) => {
  // Merge preset config with custom config
  const merged = mergeSEOConfig(SEO_PRESETS[preset] || {}, config);

  // Generate meta tags from merged config
  const metaTags = createMetaTags(merged as any);

  // Determine final canonical URL
  const finalCanonical = canonical || merged.canonical || SITE_URL;

  // Ensure OpenGraph and Twitter metadata defaults
  const ogTitle = merged.ogTitle || merged.title || SITE_TITLE;
  const ogDescription = merged.ogDescription || merged.description || 'Join India\'s premier street cricket tournament. Register now for SSPL T10 and showcase your cricket skills.';
  const ogImage = merged.ogImage || SITE_IMAGE;
  const ogUrl = finalCanonical;

  // Auto-generate schemas based on flags
  const allSchemas = [...schemas];

  if (includeOrganizationSchema) {
    allSchemas.push(generateOrganizationSchema(SITE_URL));
  }

  if (includeLocalBusinessSchema) {
    allSchemas.push(generateLocalBusinessSchema(SITE_URL));
  }

  if (includeEventSchema && eventDetails) {
    allSchemas.push(generateEventSchema(eventDetails));
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{merged.title || SITE_TITLE}</title>

      {/* Standard Meta Tags */}
      {metaTags.map((tag: any, idx: number) => {
        if (tag.name) return <meta key={idx} name={tag.name} content={tag.content} />;
        if (tag.property) return <meta key={idx} property={tag.property} content={tag.content} />;
        return null;
      })}

      {/* Canonical URL - Ensure only one */}
      <link rel="canonical" href={finalCanonical} />

      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      {/* OpenGraph Meta Tags */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={merged.ogType || 'website'} />
      <meta property="og:site_name" content={SITE_TITLE} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="ta_IN" />
      <meta property="og:locale:alternate" content="hi_IN" />

      {/* OpenGraph Image Dimensions */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_TITLE} Logo`} />
      <meta property="og:image:type" content="image/png" />

      {/* Twitter Card Meta Tags - Enhanced */}
      <meta name="twitter:card" content={merged.twitterCard || 'summary_large_image'} />
      <meta name="twitter:site" content="@ssplt10" />
      <meta name="twitter:creator" content={merged.twitterCreator || '@ssplt10'} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${SITE_TITLE} Logo`} />
      <meta name="twitter:domain" content="ssplt10.co.in" />

      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="app-mobile-web-app-title" content="SSPL T10" />

      {/* Accessibility Meta Tags */}
      <meta name="color-scheme" content="light dark" />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=no" />

      {/* Robots Meta Tag with enhanced directives */}
      <meta name="robots" content={merged.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Alternate Language Links */}
      {alternates.map((alt, i) => (
        <link key={`alt-${i}-${alt.hrefLang}`} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* JSON-LD Schema Markup */}
      {allSchemas.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
