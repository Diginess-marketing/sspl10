/**
 * React Query hooks for Strapi CMS data fetching.
 * Provides type-safe access to articles, pages, and announcements.
 */

import { useQuery } from '@tanstack/react-query';
import {
    fetchArticles,
    fetchArticleBySlug,
    fetchPageBySlug,
    fetchAnnouncements,
    fetchHeroSection,
    checkStrapiHealth,
    type StrapiArticle,
    type StrapiPage,
    type StrapiAnnouncement,
    type StrapiResponse,
    type StrapiSingleResponse,
} from '@/cms/strapi';

// ─── Query Keys ──────────────────────────────────────────

export const strapiKeys = {
    all: ['strapi'] as const,
    health: () => [...strapiKeys.all, 'health'] as const,
    articles: () => [...strapiKeys.all, 'articles'] as const,
    articlesList: (params?: { page?: number; pageSize?: number; category?: string }) =>
        [...strapiKeys.articles(), params] as const,
    article: (slug: string) => [...strapiKeys.articles(), slug] as const,
    pages: () => [...strapiKeys.all, 'pages'] as const,
    page: (slug: string) => [...strapiKeys.pages(), slug] as const,
    announcements: () => [...strapiKeys.all, 'announcements'] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Check if Strapi CMS is available.
 */
export function useStrapiHealth() {
    return useQuery({
        queryKey: strapiKeys.health(),
        queryFn: checkStrapiHealth,
        staleTime: 60 * 1000, // Check every 60s
        retry: false,
    });
}

/**
 * Fetch paginated articles from Strapi.
 * Returns undefined data when Strapi is unreachable (for fallback handling).
 */
export function useStrapiArticles(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    sort?: string;
    enabled?: boolean;
}) {
    const { enabled = true, ...queryParams } = params || {};

    return useQuery<StrapiResponse<StrapiArticle[]>>({
        queryKey: strapiKeys.articlesList(queryParams),
        queryFn: () => fetchArticles(queryParams),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

/**
 * Fetch a single article by slug.
 */
export function useStrapiArticle(slug: string) {
    return useQuery<StrapiSingleResponse<StrapiArticle[]>>({
        queryKey: strapiKeys.article(slug),
        queryFn: () => fetchArticleBySlug(slug),
        enabled: Boolean(slug),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

/**
 * Fetch a single page by slug.
 */
export function useStrapiPage(slug: string) {
    return useQuery<StrapiSingleResponse<StrapiPage[]>>({
        queryKey: strapiKeys.page(slug),
        queryFn: () => fetchPageBySlug(slug),
        enabled: Boolean(slug),
        staleTime: 10 * 60 * 1000,
        retry: 1,
    });
}

/**
 * Fetch active announcements.
 */
export function useStrapiAnnouncements() {
    return useQuery<StrapiResponse<StrapiAnnouncement[]>>({
        queryKey: strapiKeys.announcements(),
        queryFn: fetchAnnouncements,
        staleTime: 2 * 60 * 1000,
        retry: 1,
    });
}

/**
 * Fetch the hero section single type content.
 * Returns null data when Strapi is unreachable — component uses hardcoded fallback.
 */
export function useStrapiHeroSection() {
    return useQuery({
        queryKey: [...strapiKeys.all, 'hero-section'] as const,
        queryFn: async () => {
            const response = await fetchHeroSection();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}
