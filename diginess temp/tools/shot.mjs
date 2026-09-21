import { chromium } from 'playwright-core';
const [,, url, out, w = '1342', h = '900', sel = ''] = process.argv;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message.slice(0, 160)));
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => errors.push('GOTO ' + e.message));
await page.waitForTimeout(1500);
if (sel) { await page.locator(sel).first().screenshot({ path: out }); } else { await page.screenshot({ path: out }); }
console.log('saved', out); console.log('errors:', errors.length); errors.slice(0, 8).forEach(e => console.log(' -', e));
await browser.close();
