// About Us title lettering (Higgsfield gpt_image_2_5, source in tools/assets-src) -> public/assets/about-section
// The title is on flat white: key white to transparent (alpha from distance to white), trim, then avif/webp variants.
import sharp from 'sharp';
const OUT = 'public/assets/about-section';
const SRC = 'tools/assets-src';

const { data, info } = await sharp(`${SRC}/about-title.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const m = Math.min(data[i], data[i + 1], data[i + 2]);
  data[i + 3] = Math.min(255, Math.round(((255 - m) / 130) * 255));
}
const keyed = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
const trimmed = await sharp(keyed).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const tm = await sharp(trimmed).metadata();
console.log('title trimmed', tm.width, tm.height);
for (const w of [tm.width]) {
  const img = () => sharp(trimmed).resize({ width: Math.min(w, tm.width) });
  await img().webp({ quality: 85, alphaQuality: 92 }).toFile(`${OUT}/about-title-${w === tm.width ? 'full' : w + 'w'}.webp`);
  await img().avif({ quality: 65 }).toFile(`${OUT}/about-title-${w === tm.width ? 'full' : w + 'w'}.avif`);
}
