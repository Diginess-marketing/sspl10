import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const p of ['/about-us', '/faqs', '/register', '/tournament-organizer-registration', '/videos', '/teams', '/enquiry']) {
  await page.goto('http://127.0.0.1:5199' + p, { waitUntil: 'load' });
  const has = await page.waitForSelector('.site-header', { timeout: 9000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(800);
  const r = has ? await page.evaluate(() => { const hb = document.querySelector('.site-header').getBoundingClientRect().bottom; const cand = [...document.querySelectorAll('main h1, main h2, main p, main img, #root h1, #root h2')].find(e => e.getBoundingClientRect().height > 16 && e.getBoundingClientRect().top >= 0); return { hb: Math.round(hb), firstTop: cand ? Math.round(cand.getBoundingClientRect().top) : null, tag: cand?.tagName }; }) : null;
  console.log(p.padEnd(38), has ? JSON.stringify(r) : 'NO HEADER (' + (await page.title()) + ')');
  await page.screenshot({ path: 'shots/pg' + p.replace(/\//g, '_') + '.png' });
}
await browser.close();
