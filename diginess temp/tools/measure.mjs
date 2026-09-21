import sharp from 'sharp';
const { data, info } = await sharp('mockup/hero-mockup.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const px = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i+1], data[i+2]]; };
const isNavy = (x, y) => { const [r,g,b] = px(x,y); return r < 70 && g < 80 && b < 140 && b > r + 10; };
// row bands of navy pixels in x<640
const rows = [];
for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < 640; x++) if (isNavy(x, y)) c++; rows.push(c); }
let bands = [], cur = null;
rows.forEach((c, y) => { if (c > 0) { if (!cur) cur = { y0: y, y1: y }; cur.y1 = y; } else if (cur) { bands.push(cur); cur = null; } });
if (cur) bands.push(cur);
for (const b of bands) {
  let x0 = 9999, x1 = -1;
  for (let y = b.y0; y <= b.y1; y++) for (let x = 0; x < 640; x++) if (isNavy(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  console.log(`navy band y ${b.y0}-${b.y1} (h=${b.y1-b.y0+1})  x ${x0}-${x1} (w=${x1-x0+1})`);
}
// sample colours
const sample = (label, x, y) => { const [r,g,b] = px(x,y); console.log(label.padEnd(22), `rgb(${r},${g},${b})`, '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')); };
sample('bg top-left', 5, 30); sample('bg mid-left', 5, 240); sample('bg bottom-left', 5, 440);
sample('bg top-right', 1330, 20); sample('bg mid', 660, 40);
sample('play circle', 60, 358); sample('tagline navy', 40, 289);
sample('stage blue dark', 120, 200); sample('stage blue light', 185, 190);
sample('lime stroke', 480, 247);
