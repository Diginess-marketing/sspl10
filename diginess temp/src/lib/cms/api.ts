import { supabase } from '@/integrations/supabase/client';
import { CMS_COLLECTIONS, type CmsCollectionKey } from './schema';

// cms_items is not in the generated Database types yet (regenerate types.ts after
// applying the migration to production), so it is accessed untyped in this one module.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cmsTable = () => (supabase as any).from('cms_items');

export type CmsData = Record<string, unknown>;

export interface CmsRow {
  id: string;
  collection: CmsCollectionKey;
  slug: string;
  sort_order: number;
  is_published: boolean;
  data: CmsData;
  updated_at: string;
}

export const CMS_MEDIA_BUCKET = 'cms-media';

/** Published items of a collection, in display order. */
export async function fetchPublished(collection: CmsCollectionKey): Promise<CmsData[]> {
  const { data, error } = await cmsTable()
    .select('data')
    .eq('collection', collection)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) {
    throw error;
  }
  return (data as { data: CmsData }[]).map((row) => row.data);
}

/** Every row of a collection, including drafts (editors only, enforced by RLS). */
export async function fetchAllRows(collection: CmsCollectionKey): Promise<CmsRow[]> {
  const { data, error } = await cmsTable()
    .select('*')
    .eq('collection', collection)
    .order('sort_order', { ascending: true });
  if (error) {
    throw error;
  }
  return data as CmsRow[];
}

export async function saveRow(
  collection: CmsCollectionKey,
  row: { id?: string; data: CmsData; sort_order: number; is_published: boolean },
): Promise<void> {
  const payload = {
    collection,
    slug: CMS_COLLECTIONS[collection].slugOf(row.data, row.sort_order),
    data: row.data,
    sort_order: row.sort_order,
    is_published: row.is_published,
  };
  const { error } = row.id
    ? await cmsTable().update(payload).eq('id', row.id)
    : await cmsTable().insert(payload);
  if (error) {
    throw error;
  }
}

export async function updateRowFields(id: string, fields: Partial<Pick<CmsRow, 'sort_order' | 'is_published'>>) {
  const { error } = await cmsTable().update(fields).eq('id', id);
  if (error) {
    throw error;
  }
}

export async function deleteRow(id: string): Promise<void> {
  const { error } = await cmsTable().delete().eq('id', id);
  if (error) {
    throw error;
  }
}

/** Seeds a collection from the site's built-in content. Existing slugs are left untouched. */
export async function importItems(collection: CmsCollectionKey, items: CmsData[]): Promise<number> {
  const { slugOf } = CMS_COLLECTIONS[collection];
  const seen = new Set<string>();
  const rows = items
    .map((data, index) => ({ collection, slug: slugOf(data, index), data, sort_order: (index + 1) * 10, is_published: true }))
    .filter((row) => !seen.has(row.slug) && seen.add(row.slug));
  const { error } = await cmsTable().upsert(rows, { onConflict: 'collection,slug', ignoreDuplicates: true });
  if (error) {
    throw error;
  }
  return rows.length;
}

export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(CMS_MEDIA_BUCKET).upload(path, file, { cacheControl: '31536000' });
  if (error) {
    throw error;
  }
  return supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
