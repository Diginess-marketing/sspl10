import { useQuery } from '@tanstack/react-query';
import { fetchPublished } from './api';
import type { CmsCollectionKey } from './schema';

export const cmsQueryKey = (collection: CmsCollectionKey) => ['cms', collection] as const;

/**
 * Set VITE_CMS_ENABLED=false while the database has no cms_items table (e.g. local dev
 * against a project where the cms_items migration is not applied yet): pages then use
 * their built-in content without querying.
 */
export const CMS_ENABLED = import.meta.env.VITE_CMS_ENABLED !== 'false';

/** PostgREST "table not found": retrying cannot help until the migration is applied. */
const isMissingTable = (error: unknown) => (error as { code?: string } | null)?.code === 'PGRST205';

/**
 * Published items of an admin-editable collection.
 * Returns `fallback` (the site's built-in content) until the database answers, and keeps
 * returning it when the collection is empty or unreachable, so pages never render blank.
 */
export function useCmsCollection<T>(collection: CmsCollectionKey, fallback: T[]): T[] {
  const { data } = useQuery({
    queryKey: cmsQueryKey(collection),
    queryFn: () => fetchPublished(collection),
    enabled: CMS_ENABLED,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => !isMissingTable(error) && failureCount < 1,
  });
  return data && data.length > 0 ? (data as T[]) : fallback;
}
