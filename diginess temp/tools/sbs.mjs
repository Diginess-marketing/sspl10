import sharp from 'sharp';
const [,, l, t, w, h, z = '2', out = 'shots/sbs.png'] = process.argv;
const ext = async (f) => sharp(f).extract({ left: +l, top: +t, width: +w, height: +h }).resize({ width: Math.round(+w * +z), kernel: 'lanczos3' }).png().toBuffer();
const a = await ext('mockup/hero-mockup.png'), b = await ext('shots/hero-render.png');
const W = Math.round(+w * +z), H = Math.round(+h * +z);
await sharp({ create: { width: W * 2 + 8, height: H, channels: 3, background: '#e33' } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: W + 8, top: 0 }]).png().toFile(out);
console.log(out);
