/**
 * Strapi REST API Client
 * Connects the React frontend to a headless Strapi CMS instance.
 */

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN || '';
const API_BASE = `${STRAPI_URL}/api`;

// ─── Types ───────────────────────────────────────────────

export interface StrapiMeta {
    pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
}

export interface StrapiImage {
    id: number;
    url: string;
    alternativeText: string | null;
    width: number;
    height: number;
    formats?: {
        thumbnail?: { url: string; width: number; height: number };
        small?: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        large?: { url: string; width: number; height: number };
    };
}

export interface StrapiArticle {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    featuredImage?: StrapiImage | null;
    category?: string | null;
    author?: string | null;
}

export interface StrapiPage {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    content: string;
    publishedAt: string;
}

export interface StrapiAnnouncement {
    id: number;
    documentId: string;
    message: string;
    link: string | null;
    linkText: string | null;
    isActive: boolean;
}

export interface StrapiResponse<T> {
    data: T;
    meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
    data: T;
    meta: {};
}

// ─── Helpers ─────────────────────────────────────────────

function getImageUrl(image: StrapiImage | null | undefined): string | null {
    if (!image) return null;
    // Strapi v5 returns relative URLs — prefix with STRAPI_URL
    const url = image.url;
    if (url.startsWith('http')) return url;
    return `${STRAPI_URL}${url}`;
}

export { getImageUrl };

async function strapiRequest<T>(
    endpoint: string,
    params?: Record<string, string>,
): Promise<T> {
    const url = new URL(`${API_BASE}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (STRAPI_TOKEN) {
        headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
        throw new Error(
            `Strapi API error: ${response.status} ${response.statusText}`,
        );
    }

    return response.json();
}

// ─── API Functions ───────────────────────────────────────

/**
 * Fetch paginated articles from Strapi.
 */
export async function fetchArticles(options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    sort?: string;
}): Promise<StrapiResponse<StrapiArticle[]>> {
    const params: Record<string, string> = {
        'populate': '*',
        'sort': options?.sort || 'publishedAt:desc',
        'pagination[page]': String(options?.page || 1),
        'pagination[pageSize]': String(options?.pageSize || 12),
    };

    if (options?.category) {
        params['filters[category][$eq]'] = options.category;
    }

    return strapiRequest<StrapiResponse<StrapiArticle[]>>('/articles', params);
}

/**
 * Fetch a single article by slug.
 */
export async function fetchArticleBySlug(
    slug: string,
): Promise<StrapiSingleResponse<StrapiArticle[]>> {
    return strapiRequest<StrapiSingleResponse<StrapiArticle[]>>('/articles', {
        'filters[slug][$eq]': slug,
        'populate': '*',
    });
}

/**
 * Fetch a page by slug.
 */
export async function fetchPageBySlug(
    slug: string,
): Promise<StrapiSingleResponse<StrapiPage[]>> {
    return strapiRequest<StrapiSingleResponse<StrapiPage[]>>('/pages', {
        'filters[slug][$eq]': slug,
        'populate': '*',
    });
}

/**
 * Fetch active announcements.
 */
export async function fetchAnnouncements(): Promise<
    StrapiResponse<StrapiAnnouncement[]>
> {
    return strapiRequest<StrapiResponse<StrapiAnnouncement[]>>('/announcements', {
        'filters[isActive][$eq]': 'true',
        'sort': 'createdAt:desc',
    });
}

/**
 * Check if Strapi is reachable.
 */
export async function checkStrapiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${STRAPI_URL}/_health`, {
            signal: AbortSignal.timeout(3000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ─── Hero Section ────────────────────────────────────────

export interface StrapiHeroSection {
    id: number;
    documentId: string;
    headline: string;
    subheadline: string;
    ctaButtonText: string;
    ctaButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
    stat4Label: string;
    stat4Value: string;
    featuresHeading: string;
    features: string[];
    trialsHeading: string;
    trialsCities: string[];
    trialsAnnouncementText: string;
    trialsCtaText: string;
    trialsCtaLink: string;
    trialsPosterImage?: StrapiImage | null;
    publishedAt: string;
}

/**
 * Fetch the hero section single type.
 */
export async function fetchHeroSection(): Promise<StrapiSingleResponse<StrapiHeroSection>> {
    return strapiRequest<StrapiSingleResponse<StrapiHeroSection>>('/hero-section', {
        'populate': '*',
    });
}
