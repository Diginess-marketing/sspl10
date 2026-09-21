// usage: node tools/type-audit-pages.mjs /a /b ...  -> per page: font families used (by element count) and paragraph size spread
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
for (const path of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto('http://127.0.0.1:5199' + path, { waitUntil: 'load', timeout: 20000 }); await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const fam = {}, psz = {}, h = {};
      document.querySelectorAll('h1,h2,h3,h4,p,a,button,li,label,span,td,th').forEach((el) => {
        const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const cs = getComputedStyle(el); const f = cs.fontFamily.split(',')[0].replace(/["']/g, '');
        fam[f] = (fam[f] || 0) + 1;
        if (el.tagName === 'P') psz[Math.round(parseFloat(cs.fontSize))] = (psz[Math.round(parseFloat(cs.fontSize))] || 0) + 1;
        if (/^H[1-3]$/.test(el.tagName)) { const k = `${el.tagName}:${f.split(' ')[0]}/${Math.round(parseFloat(cs.fontSize))}`; h[k] = (h[k] || 0) + 1; }
      });
      return { fam, psz, h, title: document.title.slice(0, 30) };
    });
    console.log(`\n${path}  ->  fonts ${JSON.stringify(r.fam)}\n   p sizes ${JSON.stringify(r.psz)}\n   headings ${JSON.stringify(r.h)}`);
  } catch (e) { console.log(`\n${path} -> ERR ${e.message.slice(0, 60)}`); }
  await page.close();
}
await browser.close();
