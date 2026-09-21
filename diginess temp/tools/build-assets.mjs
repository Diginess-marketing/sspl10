import sharp from 'sharp';
import fs from 'node:fs';
const SRC = 'mockup/hero-mockup.png', OUT = 'public/assets/hero';
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const idx = (x, y) => (y * W + x) * 3;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (v, a, b) => clamp((v - a) / (b - a));

// ---------- 1. background: erase live-text elements on the left, keep photo/sky ----------
const bg = Buffer.from(data);
// each group: [x0,y0,x1,y1, topAnchorY, bottomAnchorY, featherEndX] – anchors are rows verified free of text
const erase = [
  [8, 0, 140, 22, null, 27, null],      // stray logo remnants cropped at the top edge
  [0, 78, 520, 266, 73, 270, null],     // FROM THE STREET. + TO THE STAGE. + lime stroke (overlay re-added)
  [520, 78, 548, 252, 73, 270, null],   // right end of the stroke, left of the light tower
  [548, 78, 592, 252, 73, 73, null],    // above the light tower panel: sky only (top anchor)
  [592, 78, 675, 252, 73, 270, 648],    // right end of the stroke, clear of the shirt
  [22, 275, 530, 303, 272, 307, null],  // tagline
  [22, 322, 345, 398, 318, 403, null],  // play button, label, arrow
];
const smooth = (arr, r) => arr.map((_, i) => { const acc = [0, 0, 0]; let n = 0; for (let k = Math.max(0, i - r); k <= Math.min(arr.length - 1, i + r); k++) { for (let c = 0; c < 3; c++) acc[c] += arr[k][c]; n++; } return acc.map(v => v / n); });
for (const [x0, y0, x1, y1, ta, ba, feather] of erase) {
  const xs = []; for (let x = x0; x <= x1; x++) xs.push(x);
  const topA = ta === null ? null : smooth(xs.map(x => [0, 1, 2].map(c => data[idx(x, ta) + c])), 14);
  const botA = smooth(xs.map(x => [0, 1, 2].map(c => data[idx(x, ba) + c])), 14);
  xs.forEach((x, k) => {
    const w = feather && x > feather ? 1 - (x - feather) / (x1 - feather) : 1;
    for (let y = y0; y <= y1; y++) {
      const t = topA ? (ba === ta ? 0 : (y - ta) / (ba - ta)) : 1;
      for (let c = 0; c < 3; c++) {
        const e = (topA ? topA[k][c] : botA[k][c]) * (1 - t) + botA[k][c] * t;
        bg[idx(x, y) + c] = Math.round(e * w + bg[idx(x, y) + c] * (1 - w));
      }
    }
  });
}
await sharp(bg, { raw: { width: W, height: H, channels: 3 } }).png().toFile(`${OUT}/hero-bg.png`);

// ---------- 2. keyed overlays (RGBA) ----------
const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
async function overlay(name, box, alphaFn, colourFn) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0, out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = idx(x0 + x, y0 + y), r = data[i], g = data[i + 1], b = data[i + 2];
    const a = alphaFn(x0 + x, y0 + y, r, g, b), o = (y * w + x) * 4;
    let [R, G, B] = colourFn ? colourFn(r, g, b, a) : [r, g, b];
    out[o] = R; out[o + 1] = G; out[o + 2] = B; out[o + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(`${OUT}/${name}`);
  console.log(name, `${w}x${h} at ${x0},${y0}`);
}
// unmix a pixel that was composited over white
const overWhite = (r, g, b, a) => a <= 0 ? [r, g, b] : [r, g, b].map(v => clamp(Math.round((v - (1 - a) * 255) / a), 0, 255));

// TO THE STAGE. + lime stroke (sits on near-white); keyed on saturation so pale sky is not picked up,
// and the tilted headline above (rebuilt as live text) is excluded
await overlay('hero-stage-title.png', [0, 118, 650, 270],
  (x, y, r, g, b) => (x < 470 && y < 142 - 0.0524 * (x - 26)) ? 0 : ramp(Math.max(r, g, b) - Math.min(r, g, b), 45, 100), overWhite);

// swoosh: saturated blue / lime, right of the player
const swooshPoly = [[1035, 474], [1085, 400], [1190, 285], [1225, 245], [1270, 200], [1342, 168], [1342, 474]];
await overlay('hero-swoosh.png', [1000, 160, 1342, 474],
  (x, y, r, g, b) => inPoly(x, y, swooshPoly) ? ramp(Math.max(r, g, b) - Math.min(r, g, b), 55, 125) : 0);

// script tagline: dark navy strokes only. Deep-blue swoosh pixels are dark too but far more saturated, so exclude by chroma;
// box stops at the text's right edge so no swoosh area is inside it
await overlay('hero-script.png', [1160, 300, 1316, 474],
  (x, y, r, g, b) => { const m = (r + g + b) / 3, chroma = Math.max(r, g, b) - Math.min(r, g, b); return b >= r ? ramp(150 - m, 0, 80) * (1 - ramp(chroma, 110, 165)) : 0; },
  () => [16, 24, 92]);
fs.writeFileSync('shots/.assets-built', new Date().toISOString());
