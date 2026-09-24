import { useQuery } from '@tanstack/react-query';
import { fetchPublished } from './api';
import type { CmsCollectionKey } from './schema';

export const cmsQueryKey = (collection: CmsCollectionKey) => ['cms', collection] as const;

/**
 * Published items of an admin-editable collection.
 * Returns `fallback` (the site's built-in content) until the database answers, and keeps
 * returning it when the collection is empty or unreachable, so pages never render blank.
 */
export function useCmsCollection<T>(collection: CmsCollectionKey, fallback: T[]): T[] {
  const { data } = useQuery({
    queryKey: cmsQueryKey(collection),
    queryFn: () => fetchPublished(collection),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  return data && data.length > 0 ? (data as T[]) : fallback;
}
