import { chromium } from 'playwright-core';
const out = process.argv[2] || '/tmp';
const browser = await chromium.launch({ channel: 'chrome' });
for (const w of process.argv.slice(3).map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
  await page.waitForSelector('#giveaway', { timeout: 30000 });
  await page.locator('#giveaway').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
  const m = await page.evaluate(() => { const r = document.querySelector('#giveaway').getBoundingClientRect(); return { h: Math.round(r.height), over: document.documentElement.scrollWidth - innerWidth }; });
  await page.locator('#giveaway').screenshot({ path: `${out}/giveaway-${w}.png` });
  console.log(w, JSON.stringify(m), errs.length ? errs : 'no page errors');
  await page.close();
}
await browser.close();
