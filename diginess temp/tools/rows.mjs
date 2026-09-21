import sharp from 'sharp';
const { data, info } = await sharp('mockup/hero-mockup.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
// for x-range, list rows in [y0,y1] that have any pixel darker than white by > thr (max channel deficit)
const [,, x0, x1, y0, y1, thr='30'] = process.argv;
const out = [];
for (let y = +y0; y <= +y1; y++) { let n = 0; for (let x = +x0; x <= +x1; x++) { const i = (y*W+x)*3; if (255 - Math.min(data[i],data[i+1],data[i+2]) > +thr) n++; } out.push(`${y}:${n}`); }
console.log(out.join(' '));
