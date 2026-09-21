import { chromium } from 'playwright-core';
import sharp from 'sharp';
const widths = (process.argv[2] || '320,360,375,390,414,480,560,640,767,768,820,1024,1100,1280,1440,1920').split(',').map(Number);
const KEYS = { headline: '.hero-banner__line1', title: '.hero-banner__stage-title', tagline: '.hero-banner__tagline', watch: '.hero-banner__watch', script: '.hero-banner__script' };
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
await page.waitForSelector('.hero-banner__stage', { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].filter(i => i.closest('.hero-banner')).every(i => i.complete));
let problems = 0;
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);
  const info = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const stage = r('.hero-banner__stage');
    const widgets = [...document.querySelectorAll('.fixed')].filter(e => /25D366|100001|100002/.test(e.className + e.outerHTML.slice(0, 200))).map(e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    return { stage, widgets, headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom, docOverflow: document.documentElement.scrollWidth - innerWidth };
  });
  const clip = { x: Math.max(0, info.stage.x), y: info.stage.y, width: Math.min(info.stage.w, w), height: info.stage.h };
  const masks = {};
  for (const [k, sel] of Object.entries(KEYS)) {
    await page.addStyleTag({ content: `#iso{}` }).catch(() => {});
    await page.evaluate((sel) => {
      document.getElementById('iso')?.remove();
      const s = document.createElement('style'); s.id = 'iso';
      s.textContent = `html,body,#root,main,.hero-banner,.hero-banner__stage,#hero{background:#00ff00!important;background-image:none!important}
        .fixed{display:none!important}
        .site-header,.hero-banner__art{visibility:hidden!important}
        .hero-banner__copy *{visibility:hidden!important}
        ${sel}, ${sel} *{visibility:visible!important}`;
      document.head.appendChild(s);
    }, sel);
    const buf = await page.screenshot({ clip });
    const { data, info: im } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    masks[k] = { data, w: im.width, h: im.height };
  }
  await page.evaluate(() => document.getElementById('iso')?.remove());
  const keys = Object.keys(masks); const out = [];
  const ink = (m, i) => (m.data[i * 4] + Math.abs(255 - m.data[i * 4 + 1]) + m.data[i * 4 + 2]) > 150; // anything that is not the green backdrop
  for (let a = 0; a < keys.length; a++) for (let b = a + 1; b < keys.length; b++) {
    const A = masks[keys[a]], B = masks[keys[b]]; let n = 0; const N = Math.min(A.w * A.h, B.w * B.h);
    for (let i = 0; i < N; i++) if (ink(A, i) && ink(B, i)) n++;
    if (n > 25) out.push(`${keys[a]}x${keys[b]}=${n}px`);
  }
  // floating widgets vs any copy ink
  for (const wg of info.widgets) for (const k of keys) {
    const m = masks[k]; let n = 0;
    for (let y = Math.max(0, Math.floor(wg.y - clip.y)); y < Math.min(m.h, Math.ceil(wg.y + wg.h - clip.y)); y++) for (let x = Math.max(0, Math.floor(wg.x - clip.x)); x < Math.min(m.w, Math.ceil(wg.x + wg.w - clip.x)); x++) if (ink(m, y * m.w + x)) n++;
    if (n > 10) out.push(`widget over ${k}=${n}px`);
  }
  // copy must not spill past viewport edges
  for (const k of keys) { const m = masks[k]; let edge = 0; for (let y = 0; y < m.h; y++) { if (ink(m, y * m.w) || ink(m, y * m.w + m.w - 1)) edge++; } if (edge > 3) out.push(`${k} touches viewport edge x${edge}`); }
  if (info.docOverflow > 0) out.push(`horizontal overflow ${info.docOverflow}px`);
  if (out.length) problems += out.length;
  console.log(String(w).padStart(4), out.length ? '❌ ' + out.join(' | ') : '✅ clean', `(hero ${Math.round(info.stage.w)}x${Math.round(info.stage.h)}, header bottom ${Math.round(info.headerBottom)} = hero top ${Math.round(info.stage.y)})`);
}
console.log(problems ? `\n${problems} issue(s)` : '\nno overlaps at any tested width');
await browser.close();
