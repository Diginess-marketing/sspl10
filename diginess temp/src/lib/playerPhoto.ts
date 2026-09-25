import { supabase } from '@/integrations/supabase/client';

/** Private bucket: registrants may upload, only admins may read (see the player_photos migration). */
export const PLAYER_PHOTO_BUCKET = 'player-photos';

export const PLAYER_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Largest file accepted from the device, before it is downscaled. */
export const PLAYER_PHOTO_MAX_INPUT_BYTES = 15 * 1024 * 1024;

const MAX_EDGE = 1000;

/** Downscales a phone photo to at most 1000px on its long edge, as JPEG, so uploads stay small. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process the photo');
  }
  ctx.fillStyle = '#fff'; // PNG transparency would turn black in JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo'))), 'image/jpeg', 0.85),
  );
}

/** Returns an error message for an unacceptable photo, or null if it can be uploaded. */
export function checkPlayerPhoto(file: File): string | null {
  if (!PLAYER_PHOTO_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG or WEBP photo.';
  }
  if (file.size > PLAYER_PHOTO_MAX_INPUT_BYTES) {
    return 'Photo is too large. Please choose one under 15 MB.';
  }
  return null;
}

/** Uploads a registration photo and returns its storage path (store this, not a URL: the bucket is private). */
export async function uploadPlayerPhoto(file: File): Promise<string> {
  const path = `registrations/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(PLAYER_PHOTO_BUCKET)
    .upload(path, await shrink(file), { contentType: 'image/jpeg', upsert: false });
  if (error) {
    throw error;
  }
  return path;
}

/** Short-lived link for admins to view a registration photo. */
export async function playerPhotoUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(PLAYER_PHOTO_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) {
    throw error;
  }
  return data.signedUrl;
}
