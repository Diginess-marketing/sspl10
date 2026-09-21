import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1342, height: 900 } });
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
await page.waitForSelector('.hero-banner__watch');
await page.waitForTimeout(1200);
const info = await page.evaluate(() => ({
  h1Count: document.querySelectorAll('h1').length,
  heroH1: document.querySelector('.hero-banner__sr')?.textContent,
  watchHref: document.querySelector('.hero-banner__watch')?.getAttribute('href'),
  imgsBroken: [...document.querySelectorAll('.hero-banner img')].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src),
}));
console.log(JSON.stringify(info, null, 1));
// keyboard focus reaches the watch link and shows an outline
await page.locator('.hero-banner__watch').focus();
const outline = await page.evaluate(() => getComputedStyle(document.querySelector('.hero-banner__watch')).outlineStyle + ' ' + getComputedStyle(document.querySelector('.hero-banner__watch')).outlineWidth);
console.log('focus outline:', outline);
// click does not navigate away / crash
await page.locator('.hero-banner__watch').click({ force: true });
console.log('after click url:', page.url());
await browser.close();
