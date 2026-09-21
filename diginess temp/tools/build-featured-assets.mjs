// Generates responsive avif/webp variants for the "Featured selected players" panel artwork in public/assets/featured.
// Variants are trimmed to the visible panel (transparent margin removed) so the layout can size it exactly.
import sharp from 'sharp';
const DIR = 'public/assets/featured';
const SRC = `${DIR}/featured-selected-players.png`;
const trimmed = await sharp(SRC).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
console.log('trimmed size', trimmed.info.width, 'x', trimmed.info.height);
for (const w of [480, 768]) {
  const img = () => sharp(trimmed.data).resize({ width: w });
  await img().webp({ quality: 84, alphaQuality: 90 }).toFile(`${DIR}/featured-selected-players-${w}w.webp`);
  await img().avif({ quality: 62 }).toFile(`${DIR}/featured-selected-players-${w}w.avif`);
}
