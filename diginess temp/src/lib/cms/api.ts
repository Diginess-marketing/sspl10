import { supabase } from '@/integrations/supabase/client';
import { CMS_COLLECTIONS, getPath, setPath, type CmsCollectionKey } from './schema';

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

/**
 * Copies an image the site serves from public/ (e.g. /assets/players/x.webp) into the media
 * bucket. The object path mirrors the site path, so importing again overwrites instead of duplicating.
 */
async function copySiteImageToMedia(sitePath: string): Promise<string> {
  const res = await fetch(encodeURI(sitePath));
  const type = res.headers.get('content-type') ?? '';
  // A missing file comes back as the SPA's index.html, so check the type, not just the status.
  if (!res.ok || !type.startsWith('image/')) {
    throw new Error(`${sitePath} is not an image on this site`);
  }
  const path = `imported${sitePath}`;
  const { error } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .upload(path, await res.blob(), { cacheControl: '31536000', contentType: type, upsert: true });
  if (error) {
    throw error;
  }
  return supabase.storage.from(CMS_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Points every image field of an item that uses a site path at its copy in the media bucket. */
async function moveImagesToMedia(collection: CmsCollectionKey, data: CmsData): Promise<{ data: CmsData; failed: string[] }> {
  const failed: string[] = [];
  let result = data;
  for (const field of CMS_COLLECTIONS[collection].fields) {
    const value = getPath(result, field.name);
    if (field.type !== 'image' || typeof value !== 'string' || !value.startsWith('/')) {
      continue;
    }
    try {
      result = setPath(result, field.name, await copySiteImageToMedia(value));
    } catch {
      failed.push(value); // keep the site path; the item still displays
    }
  }
  return { data: result, failed };
}

/**
 * Seeds a collection from the site's built-in content, copying its images into the media
 * bucket. Existing slugs are left untouched. Returns how many items were added and which
 * images could not be copied (those items keep their original site path).
 */
export async function importItems(collection: CmsCollectionKey, items: CmsData[]): Promise<{ count: number; failed: string[] }> {
  const { slugOf } = CMS_COLLECTIONS[collection];
  const { data: existing, error: readError } = await cmsTable().select('slug').eq('collection', collection);
  if (readError) {
    throw readError;
  }
  const seen = new Set((existing as { slug: string }[]).map((row) => row.slug));
  const fresh = items
    .map((data, index) => ({ slug: slugOf(data, index), data, sort_order: (index + 1) * 10 }))
    .filter((item) => !seen.has(item.slug) && seen.add(item.slug));

  const moved = await Promise.all(fresh.map((item) => moveImagesToMedia(collection, item.data)));
  const rows = fresh.map((item, i) => ({ collection, ...item, data: moved[i].data, is_published: true }));
  if (rows.length) {
    const { error } = await cmsTable().upsert(rows, { onConflict: 'collection,slug', ignoreDuplicates: true });
    if (error) {
      throw error;
    }
  }
  return { count: rows.length, failed: moved.flatMap((m) => m.failed) };
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
