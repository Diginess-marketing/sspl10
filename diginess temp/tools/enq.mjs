import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 220))); page.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION_REFUSED|WebSocket/.test(m.text())) errs.push('console: ' + m.text().slice(0, 220)); });
await page.goto('http://127.0.0.1:5199/enquiry', { waitUntil: 'load' }); await page.waitForTimeout(3500);
console.log('errors:', JSON.stringify(errs, null, 1));
console.log('body text start:', (await page.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n/g, ' | '));
await browser.close();
