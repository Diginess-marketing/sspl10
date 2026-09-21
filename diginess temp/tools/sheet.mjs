import { chromium } from 'playwright-core';
const t = process.argv[2] || 'headline';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 960, height: 900 } });
await page.goto('http://127.0.0.1:5199/_fontsheet.html?t=' + t);
await page.waitForFunction(() => document.title === 'done', null, { timeout: 60000 });
await page.screenshot({ path: `shots/sheet-${t}.png`, fullPage: true });
await browser.close();
