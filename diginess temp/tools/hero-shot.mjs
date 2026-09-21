import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome' });
for (const spec of process.argv.slice(3)) {
  const [w, h] = spec.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
  await page.waitForSelector('.hero-banner', { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
  const m = await page.evaluate(() => { const r = document.querySelector('.hero-banner').getBoundingClientRect(); const hd = document.querySelector('.site-header')?.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), header: hd && Math.round(hd.height), vh: innerHeight, over: document.documentElement.scrollWidth - innerWidth }; });
  await page.screenshot({ path: `${out}/hero-${spec}.png` });
  console.log(spec, JSON.stringify(m), errs.length ? errs : 'no page errors');
  await page.close();
}
await browser.close();
