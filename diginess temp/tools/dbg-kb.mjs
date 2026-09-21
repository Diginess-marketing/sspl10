import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' }); await page.waitForSelector('.site-header'); await page.waitForTimeout(1200);
await page.focus('.site-nav > li:nth-child(2) > a');
await page.waitForTimeout(400);
console.log('after focus: menu visibility =', await page.evaluate(() => getComputedStyle(document.querySelector('.site-nav > li:nth-child(2) .site-nav__menu')).visibility));
await page.keyboard.press('Tab');
await page.waitForTimeout(400);
console.log('after Tab: active =', await page.evaluate(() => document.activeElement.textContent.trim() + ' | ' + document.activeElement.getAttribute('href')));
console.log('menu visibility =', await page.evaluate(() => getComputedStyle(document.querySelector('.site-nav > li:nth-child(2) .site-nav__menu')).visibility));
for (let i = 0; i < 7; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); console.log(' tab ->', await page.evaluate(() => document.activeElement.textContent.trim().slice(0, 24))); }
await browser.close();
