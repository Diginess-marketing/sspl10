import sharp from 'sharp';
const d = 'public/assets/hero';
await sharp(`${d}/hero-bg.png`).composite([
  { input: `${d}/hero-stage-title.png`, left: 0, top: 118 },
  { input: `${d}/hero-swoosh.png`, left: 1000, top: 160 },
  { input: `${d}/hero-script.png`, left: 1160, top: 300 },
]).png().toFile('shots/layers-composite.png');
console.log('ok');
