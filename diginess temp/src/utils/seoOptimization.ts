/**
 * SEO Meta Tags & Schema Markup Utilities
 * Provides comprehensive SEO configuration for pages
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterCreator?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * SEO Configuration presets for different page types
 */
export const SEO_PRESETS = {
  home: {
    title: 'SSPL T10 - India\'s Premier T10 Cricket League',
    description: 'Join India\'s premier street cricket tournament. Register now for SSPL T10 and showcase your cricket skills.',
    keywords: ['cricket tournament', 'SSPL T10', 'street cricket', 'sports event'],
    ogType: 'website',
  },

  register: {
    title: 'Register for SSPL T10 Cricket Tournament',
    description: 'Register your team for the SSPL T10 street cricket tournament. Fast, easy, and secure registration.',
    keywords: ['cricket registration', 'SSPL tournament', 'team registration', 'sports event registration'],
    ogType: 'website',
  },

  gallery: {
    title: 'SSPL T10 Gallery - Cricket Tournament Photos & Videos',
    description: 'Browse photos and videos from SSPL T10 cricket tournaments. View highlights and memorable moments.',
    keywords: ['cricket gallery', 'tournament photos', 'cricket videos', 'SSPL highlights'],
    ogType: 'website',
  },

  about: {
    title: 'About SSPL T10 - Cricket Tournament',
    description: 'Learn about SSPL T10 - India\'s premier street cricket tournament. Discover our mission and vision.',
    keywords: ['about SSPL', 'cricket tournament', 'cricket organization', 'sports'],
    ogType: 'website',
  },

  standings: {
    title: 'SSPL T10 Standings & Leaderboard',
    description: 'Check live standings and leaderboards for SSPL T10 cricket tournament.',
    keywords: ['cricket standings', 'leaderboard', 'tournament rankings', 'SSPL scores'],
    ogType: 'website',
  },

  teams: {
    title: 'Teams & Standings | SSPL T10 Cricket League',
    description: 'Meet all 6 teams in SSPL T10 Cricket League. Check team standings, player rosters, match schedules, and tournament statistics.',
    keywords: ['SSPL T10 teams', 'cricket team standings', 'T10 tournament teams', 'Chennai Champions', 'Bangalore Blasters', 'Kerala Warriors'],
    ogType: 'website',
  },

  players: {
    title: 'Players & Statistics | SSPL T10 Cricket League',
    description: 'View all players in SSPL T10 Cricket League with detailed statistics, batting records, bowling figures, and team information.',
    keywords: ['SSPL T10 players', 'cricket player statistics', 'T10 tournament players', 'cricket roster', 'player profiles'],
    ogType: 'website',
  },

  matches: {
    title: 'SSPL T10 Match Schedule & Results',
    description: 'View match schedules, live scores, and results for SSPL T10 cricket tournament.',
    keywords: ['cricket matches', 'match schedule', 'live scores', 'cricket results'],
    ogType: 'website',
  },

  news: {
    title: 'SSPL T10 News',
    description: 'Latest news, announcements, and analysis from SSPL T10.',
    keywords: ['SSPL news', 'cricket news', 'tournament updates', 'press releases'],
    ogType: 'website',
  },

  newsArticle: {
    title: 'SSPL T10 News Article',
    description: 'Read the latest SSPL T10 news article with official updates and announcements.',
    keywords: ['SSPL news article', 'cricket press release', 'league announcement'],
    ogType: 'article',
  },

  videos: {
    title: 'SSPL T10 Videos',
    description: 'Match highlights, interviews, and behind-the-scenes videos from SSPL T10.',
    keywords: ['SSPL videos', 'cricket highlights', 'tournament videos', 'interviews'],
    ogType: 'website',
  },
};

/**
 * Generate LocalBusiness Schema
 */
export const generateLocalBusinessSchema = (baseUrl: string): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SSPL - Southern Street Premier League',
    url: baseUrl,
    logo: `${baseUrl}/ssplt10-logo.png`,
    description: 'India\'s premier street cricket tournament organizing body',
    telephone: '+918807775960',
    email: 'customercare@ssplt10.co.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chennai, Tamil Nadu',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'India',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.0827',
      longitude: '80.2707',
    },
    openingHours: 'Mo-Su 09:00-18:00',
    sameAs: [
      'https://www.facebook.com/ssplt10',
      'https://www.instagram.com/ssplt10',
      'https://www.twitter.com/ssplt10',
      'https://www.youtube.com/@ssplt10',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'customercare@ssplt10.co.in',
      telephone: '+918807775960',
      availableLanguage: ['English', 'Tamil'],
    },
    priceRange: '₹₹',
    serviceArea: {
      '@type': 'Country',
      name: 'India',
    },
    foundingDate: '2023',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50',
    },
  };
};

/**
 * Generate Organization Schema with enhanced metadata
 * Use this to help search engines understand your organization
 */
export const generateOrganizationSchema = (baseUrl: string): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SSPL - Southern Street Premier League',
    alternateName: 'SSPL T10',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/ssplt10-logo.png`,
      width: 1200,
      height: 630,
    },
    image: `${baseUrl}/ssplt10-logo.png`,
    description: 'India\'s premier street cricket tournament organizing body. Join the ultimate T10 cricket league and showcase your skills.',
    telephone: '+918807775960',
    email: 'customercare@ssplt10.co.in',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chennai, Tamil Nadu',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.0827',
      longitude: '80.2707',
    },
    sameAs: [
      'https://www.facebook.com/ssplt10',
      'https://www.instagram.com/ssplt10',
      'https://www.twitter.com/ssplt10',
      'https://www.youtube.com/@ssplt10',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'customercare@ssplt10.co.in',
      telephone: '+918807775960',
      availableLanguage: ['English', 'Tamil', 'Hindi'],
      areaServed: 'IN',
    },
    foundingDate: '2023',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50',
    },
    industry: 'Sports Organization',
    knowsAbout: ['Cricket', 'Sports Events', 'Tournament Organization', 'Street Cricket', 'T10 Cricket'],
    keywords: 'cricket tournament, SSPL T10, street cricket, sports event, T10 league, tennis ball cricket',
    hasCredential: 'Registered Sports Organization',
    slogan: 'From Gully to Glory',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '250',
      bestRating: '5',
      worstRating: '1',
    },
  };
};

/**
 * Generate SportsEvent Schema with enhanced metadata
 * Use this for tournament pages, match listings, and event announcements
 */
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
  url?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
    validFrom?: string;
  };
}): SchemaMarkup => {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Chennai',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
    },
    sport: 'Cricket',
    organizer: {
      '@type': 'Organization',
      name: 'SSPL - Southern Street Premier League',
      url: event.url || 'https://ssplt10.co.in',
    },
  };

  // Add image if provided
  if (event.image) {
    schema.image = event.image;
  }

  // Add URL if provided
  if (event.url) {
    schema.url = event.url;
  }

  // Add offers if provided
  if (event.offers) {
    schema.offers = {
      '@type': 'Offer',
      price: event.offers.price,
      priceCurrency: event.offers.priceCurrency,
      availability: event.offers.availability,
      url: event.url,
      validFrom: event.offers.validFrom,
    };
  }

  return schema;
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (
  breadcrumbs: { name: string; url: string }[],
): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
};

/**
 * Generate FAQ Schema
 */
export const generateFAQSchema = (
  faqs: { question: string; answer: string }[],
): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate Image Schema
 */
export const generateImageSchema = (images: {
  url: string;
  description: string;
  name?: string;
}[]): SchemaMarkup[] => {
  return images.map((image) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: image.url,
    name: image.name || image.description,
    description: image.description,
  }));
};

/**
 * Generate Video Schema
 */
export const generateVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
  };
};

/**
 * Generate Article Schema
 */
export const generateArticleSchema = (article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    ...(article.dateModified && { dateModified: article.dateModified }),
    ...(article.author && {
      author: {
        '@type': 'Person',
        name: article.author,
      },
    }),
  };
};

/**
 * Generate Press Release Schema
 * Use this for announcements, tournament updates, and press releases
 */
export const generatePressReleaseSchema = (release: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': release.url,
    headline: release.headline,
    description: release.description,
    image: release.image,
    datePublished: release.datePublished,
    ...(release.dateModified && { dateModified: release.dateModified }),
    ...(release.author && {
      author: {
        '@type': 'Person',
        name: release.author,
      },
    }),
  };
};

/**
 * Generate AggregateRating Schema
 * Use this for tournaments, events, and teams with ratings/reviews
 */
export const generateAggregateRatingSchema = (data: {
  name: string;
  description?: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
  url?: string;
  image?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    ...(data.description && { description: data.description }),
    ...(data.url && { url: data.url }),
    ...(data.image && { image: data.image }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
      bestRating: data.bestRating || 5,
      worstRating: data.worstRating || 1,
    },
  };
};

/**
 * Generate Thing Schema with aggregate rating
 * Generic schema for any entity with ratings
 */
export const generateRatingSchema = (data: {
  name: string;
  url?: string;
  description?: string;
  ratingValue: number;
  reviewCount: number;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: data.name,
    ...(data.url && { url: data.url }),
    ...(data.description && { description: data.description }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
    },
  };
};

/**
 * Generate Review Schema
 * Use this for individual user reviews and testimonials
 */
export const generateReviewSchema = (review: {
  reviewBody: string;
  name: string;
  ratingValue: number;
  author: string;
  datePublished: string;
  itemReviewed?: string;
  reviewAspect?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: review.name,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    ...(review.itemReviewed && { itemReviewed: review.itemReviewed }),
    ...(review.reviewAspect && { reviewAspect: review.reviewAspect }),
  };
};

/**
 * Generate ListItem Schema
 * Use this for rankings, leaderboards, and team lists
 */
export const generateListItemSchema = (items: Array<{
  position: number;
  name: string;
  url?: string;
  score?: string | number;
  image?: string;
}>): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      ...(item.url && { url: item.url }),
      ...(item.score && { score: item.score }),
      ...(item.image && { image: item.image }),
    })),
  };
};

/**
 * Generate WebPage Schema
 * Use this for page-level metadata
 */
export const generateWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}): SchemaMarkup => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
    ...(page.image && { image: page.image }),
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
  };
};

/**
 * Create meta tags object for Helmet
 */
export const createMetaTags = (config: SEOConfig) => {
  const tags: any[] = [];

  // Basic meta tags
  if (config.description) {
    tags.push({ name: 'description', content: config.description });
  }

  if (config.keywords && config.keywords.length > 0) {
    tags.push({ name: 'keywords', content: config.keywords.join(', ') });
  }

  if (config.author) {
    tags.push({ name: 'author', content: config.author });
  }

  // Robots meta tag
  const robotsContent = [
    config.noindex ? 'noindex' : 'index',
    config.nofollow ? 'nofollow' : 'follow',
  ].join(', ');
  tags.push({ name: 'robots', content: robotsContent });

  // Open Graph tags
  if (config.ogTitle) {
    tags.push({ property: 'og:title', content: config.ogTitle });
  }

  if (config.ogDescription) {
    tags.push({ property: 'og:description', content: config.ogDescription });
  }

  if (config.ogImage) {
    tags.push({ property: 'og:image', content: config.ogImage });
  }

  if (config.ogType) {
    tags.push({ property: 'og:type', content: config.ogType });
  }

  // Twitter card tags
  if (config.twitterCard) {
    tags.push({ name: 'twitter:card', content: config.twitterCard });
  }

  if (config.twitterCreator) {
    tags.push({ name: 'twitter:creator', content: config.twitterCreator });
  }

  // Publish date tags
  if (config.publishedDate) {
    tags.push({ name: 'article:published_time', content: config.publishedDate });
  }

  if (config.modifiedDate) {
    tags.push({ name: 'article:modified_time', content: config.modifiedDate });
  }

  return tags;
};

/**
 * Merge SEO configurations
 */
export const mergeSEOConfig = (
  preset: Partial<SEOConfig>,
  override: Partial<SEOConfig>,
): SEOConfig => {
  return {
    title: override.title || preset.title || 'SSPL T10',
    description: override.description || preset.description || '',
    keywords: override.keywords || preset.keywords,
    canonical: override.canonical || preset.canonical,
    ogTitle: override.ogTitle || preset.ogTitle,
    ogDescription: override.ogDescription || preset.ogDescription,
    ogImage: override.ogImage || preset.ogImage,
    ogType: override.ogType || preset.ogType || 'website',
    twitterCard: override.twitterCard || preset.twitterCard || 'summary_large_image',
    twitterCreator: override.twitterCreator || preset.twitterCreator,
    author: override.author || preset.author,
    publishedDate: override.publishedDate || preset.publishedDate,
    modifiedDate: override.modifiedDate || preset.modifiedDate,
    robots: override.robots || preset.robots,
    noindex: override.noindex || preset.noindex || false,
    nofollow: override.nofollow || preset.nofollow || false,
  };
};

/**
 * Build Organization Schema with custom parameters
 * @param {Object} params - Organization parameters
 * @param {string} params.name - Organization name
 * @param {string} params.url - Organization website URL
 * @param {string} params.logo - Organization logo URL
 * @param {string} [params.description] - Organization description
 * @param {string} [params.email] - Contact email
 * @param {string} [params.telephone] - Contact phone number
 * @returns {SchemaMarkup} Schema.org Organization JSON-LD object
 */
export function buildOrganizationSchema({
  name,
  url,
  logo,
  description,
  email,
  telephone,
}: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  email?: string;
  telephone?: string;
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
      width: 1200,
      height: 630,
    },
  };

  if (description) {
    schema.description = description;
  }

  if (email) {
    schema.email = email;
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  return schema;
}

/**
 * Build SportsEvent Schema with event details
 * @param {Object} event - Event parameters
 * @param {string} event.name - Event name
 * @param {string} event.description - Event description
 * @param {string} event.startDate - Event start date (ISO 8601 format)
 * @param {string} event.endDate - Event end date (ISO 8601 format)
 * @param {string} event.location - Event location name
 * @param {string} [event.url] - Event URL
 * @param {string} [event.image] - Event image URL
 * @param {string} [event.organizer] - Organizer name
 * @param {string} [event.organizerUrl] - Organizer URL
 * @returns {SchemaMarkup} Schema.org SportsEvent JSON-LD object
 */
export function buildSportsEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  url?: string;
  image?: string;
  organizer?: string;
  organizerUrl?: string;
}): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
    },
    sport: 'Cricket',
  };

  if (event.url) {
    schema.url = event.url;
  }

  if (event.image) {
    schema.image = event.image;
  }

  if (event.organizer || event.organizerUrl) {
    schema.organizer = {
      '@type': 'Organization',
      name: event.organizer || 'SSPL T10',
      url: event.organizerUrl || 'https://ssplt10.co.in',
    };
  }

  return schema;
}

export default {
  SEO_PRESETS,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateEventSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateImageSchema,
  generateVideoSchema,
  generateArticleSchema,
  generatePressReleaseSchema,
  generateAggregateRatingSchema,
  generateRatingSchema,
  generateReviewSchema,
  generateListItemSchema,
  generateWebPageSchema,
  createMetaTags,
  mergeSEOConfig,
  buildOrganizationSchema,
  buildSportsEventSchema,
};
