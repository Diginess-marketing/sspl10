
/**
 * Utility functions for generating and parsing SEO-friendly slugs.
 */

/**
 * Converts a string into an SEO-friendly slug.
 * Rules:
 * - Lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Removes common stop words (optional, but good for SEO short URLs)
 * 
 * @param text The text to slugify
 * @returns The slugified string
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};

/**
 * Common stop words to remove from slugs if needed for very short URLs.
 * Use with caution as it might change meaning.
 */
export const removeStopWords = (text: string): string => {
    const stopWords = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    const words = text.split('-');
    return words.filter(word => !stopWords.includes(word)).join('-');
};

/**
 * Geneates a city trial slug: /trials/{city}-{year}
 */
export const generateCityTrialSlug = (city: string, year: string | number = new Date().getFullYear()): string => {
    return slugify(`${city}-${year}`);
};
