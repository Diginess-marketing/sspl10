// Generates responsive avif/webp variants for the form-page artwork in public/assets/forms
import sharp from 'sharp';
const DIR = 'public/assets/forms';
const widths = { 'form-headline': [480, 768, 1024], 'form-player': [480, 768] };
for (const [name, ws] of Object.entries(widths)) {
  for (const w of ws) {
    const img = () => sharp(`${DIR}/${name}.png`).resize({ width: w });
    await img().webp({ quality: 82, alphaQuality: 90 }).toFile(`${DIR}/${name}-${w}w.webp`);
    await img().avif({ quality: 60 }).toFile(`${DIR}/${name}-${w}w.avif`);
  }
  await sharp(`${DIR}/${name}.png`).webp({ quality: 85, alphaQuality: 92 }).toFile(`${DIR}/${name}.webp`);
  await sharp(`${DIR}/${name}.png`).avif({ quality: 62 }).toFile(`${DIR}/${name}.avif`);
}
