import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome' });
for (const w of process.argv.slice(3).map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
  await page.waitForSelector('#street-to-stadium', { timeout: 30000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); await document.fonts.ready; });
  await page.waitForTimeout(1200);
  const box = await page.evaluate(() => { const a = document.querySelector('#street-to-stadium').getBoundingClientRect(); const s = document.querySelector('.sts-journey, #player-journey, .sts__journey'); return { top: a.top + scrollY, h: a.height, over: document.documentElement.scrollWidth - innerWidth }; });
  await page.locator('#street-to-stadium').screenshot({ path: `${out}/sts-${w}.png` });
  console.log(w, JSON.stringify(box), errs.length ? errs : 'no page errors');
  await page.close();
}
await browser.close();
