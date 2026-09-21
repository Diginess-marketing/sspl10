import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.goto('http://127.0.0.1:5199/_fontlab2.html');
await page.waitForFunction(() => document.title === 'done', null, { timeout: 240000 });
const r = await page.evaluate(() => window.__RESULTS);
for (const [k, v] of Object.entries(r)) { console.log('\n== ' + k); v.forEach(x => console.log(JSON.stringify(x))); }
await browser.close();
