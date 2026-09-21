// Generates responsive avif/webp variants for the mega-engagement-giveaway artwork in public/assets/giveaway
// Source PNGs live in ~/Documents/Client Folders/SSPLT10/Website Assets/Web banner
import sharp from 'sharp';
import os from 'os';
import path from 'path';
const SRC = path.join(os.homedir(), 'Documents/Client Folders/SSPLT10/Website Assets/Web banner');
const OUT = 'public/assets/giveaway';
const jobs = {
  'giveaway-title': { src: 'ssplt-10-mega-engagement-giveaway.png', widths: [480, 768] },
  'giveaway-prize': { src: 'grand-prize-1000rs.png', widths: [480, 768] },
  'giveaway-how-to-win': { src: 'how-to-win.png', widths: [480, 768, 1024] },
  'giveaway-bg': { src: 'bg-banner-1.png', widths: [768, 1280, 1672] },
};
for (const [name, { src, widths }] of Object.entries(jobs)) {
  for (const w of widths) {
    const img = () => sharp(path.join(SRC, src)).resize({ width: w });
    await img().webp({ quality: 82, alphaQuality: 90 }).toFile(`${OUT}/${name}-${w}w.webp`);
    await img().avif({ quality: 60 }).toFile(`${OUT}/${name}-${w}w.avif`);
  }
}
