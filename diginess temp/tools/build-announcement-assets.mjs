// Generates responsive avif/webp variants for the auction-announcement artwork in public/assets/announcement
import sharp from 'sharp';
const DIR = 'public/assets/announcement';
const widths = { 'helmet-ball': [480, 768, 1024], 'total-prize-pool-3crores': [480, 768, 1024], 'are-out-3d': [480, 768, 1024] };
for (const [name, ws] of Object.entries(widths)) {
  for (const w of ws) {
    const img = () => sharp(`${DIR}/${name}.png`).resize({ width: w });
    await img().webp({ quality: 82, alphaQuality: 90 }).toFile(`${DIR}/${name}-${w}w.webp`);
    await img().avif({ quality: 60 }).toFile(`${DIR}/${name}-${w}w.avif`);
  }
}
