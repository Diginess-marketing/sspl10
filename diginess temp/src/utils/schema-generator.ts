
/**
 * Utility functions for generating JSON-LD Structured Data Schema
 */

export const ORGANIZATION_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    'name': 'SSPL T10 - Southern Street Premier League',
    'alternateName': 'SSPL T10',
    'url': 'https://ssplt10.co.in',
    'logo': 'https://ssplt10.co.in/logo.png',
    'sameAs': [
        'https://facebook.com/ssplt10',
        'https://instagram.com/ssplt10',
        'https://twitter.com/ssplt10',
        'https://youtube.com/@ssplt10',
    ],
    'description': "India's premier tennis ball T10 cricket league providing a platform for street cricketers.",
    'sport': 'Cricket',
    'location': {
        '@type': 'Place',
        'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'IN',
        },
    },
};

export const WEBSITE_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'SSPL T10',
    'url': 'https://ssplt10.co.in/',
    'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://ssplt10.co.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
    },
};

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.item.startsWith('http') ? item.item : `https://ssplt10.co.in${item.item}`,
        })),
    };
};

export const generateEventSchema = (event: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    locationName: string;
    city: string;
    image?: string;
    offers?: {
        url: string;
        price: string;
        priceCurrency: string;
        availability: string;
        validFrom?: string;
    };
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        'name': event.name,
        'description': event.description,
        'startDate': event.startDate,
        'endDate': event.endDate || event.startDate,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'location': {
            '@type': 'Place',
            'name': event.locationName,
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': event.city,
                'addressCountry': 'IN',
            },
        },
        'image': event.image || 'https://ssplt10.co.in/og-image.jpg',
        'organizer': {
            '@type': 'SportsOrganization',
            'name': 'SSPL T10',
            'url': 'https://ssplt10.co.in',
        },
        'offers': event.offers || {
            '@type': 'Offer',
            'url': 'https://ssplt10.co.in/register',
            'price': '499',
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
        },
    };
};

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer,
            },
        })),
    };
};
