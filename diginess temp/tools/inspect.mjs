import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1342, height: 900 } });
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
await page.waitForSelector('.hero-banner__line1', { timeout: 30000 });
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => {
  const cs = (s) => { const e = document.querySelector(s); const c = getComputedStyle(e); return { fontSize: c.fontSize, ls: c.letterSpacing, ff: c.fontFamily.slice(0, 40), fw: c.fontWeight, tf: c.transform, lh: c.lineHeight, w: e.getBoundingClientRect().width }; };
  const fixed = [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); return c.position === 'fixed' && e.getBoundingClientRect().width > 0; }).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 60), id: e.id, r: [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] }));
  return { line1: cs('.hero-banner__line1'), tag: cs('.hero-banner__tagline'), u: getComputedStyle(document.querySelector('.hero-banner__stage')).getPropertyValue('--u'), fixed };
}), null, 1));
await browser.close();
