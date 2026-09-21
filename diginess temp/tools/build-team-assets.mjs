// Team / advisor portraits: the supplied files are 1920x1920 canvases with the portrait baked in as a small rounded rect on black.
// Find the portrait bbox, shave the rounded corners, crop a top-aligned square, write avif/webp -> public/Team-Advisors/sq/. Originals stay untouched.
import sharp from 'sharp';
import fs from 'fs';
const IN = 'public/Team-Advisors';
const OUT = `${IN}/sq`;
fs.mkdirSync(OUT, { recursive: true });
const NAMES = ['Nawab', 'ravi-mohan', 'Lt-anand', 'Dilip-Narayanan', 'cp-rao', 'Pugazhendi', 'Adv-Sheela'];
for (const n of NAMES) {
  const { data, info } = await sharp(`${IN}/${n}.avif`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const i = (y * W + x) * 3;
    if (Math.max(data[i], data[i + 1], data[i + 2]) > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const w = x1 - x0, h = y1 - y0, inset = Math.round(w * 0.045);           // shave the baked-in rounded corners
  const bw = w - 2 * inset, bh = h - 2 * inset;
  const side = Math.min(bw, bh);
  const left = x0 + inset + Math.round((bw - side) / 2), top = y0 + inset;   // top-aligned: keeps the head
  console.log(n, `bbox ${w}x${h} @${x0},${y0} -> crop ${side}px @${left},${top}`);
  const crop = () => sharp(`${IN}/${n}.avif`).removeAlpha().extract({ left, top, width: side, height: side });
  for (const s of [480, 880]) {
    await crop().resize(s, s).webp({ quality: 82 }).toFile(`${OUT}/${n}-${s}w.webp`);
    await crop().resize(s, s).avif({ quality: 60 }).toFile(`${OUT}/${n}-${s}w.avif`);
  }
}
