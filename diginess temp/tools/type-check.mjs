// Typography rule check (docs/BRAND_GUIDE.md "Typography").  usage: node tools/type-check.mjs [--strict] /path ...
// Always fails on: font family outside IBM Plex Sans Condensed / Inter (Roboto Condensed only inside .hero-banner).
// --strict (use on redesigned pages) also fails on: font-size not in the token scale, uppercase tracking not in the token set.
import { chromium } from 'playwright-core';
const args = process.argv.slice(2); const strict = args.includes('--strict'); const paths = args.filter(a => !a.startsWith('--'));
const browser = await chromium.launch({ channel: 'chrome' });
let fails = 0;
for (const w of [1440, 390]) for (const path of paths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://127.0.0.1:5199' + path, { waitUntil: 'load', timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); await document.fonts.ready; });
  await page.waitForTimeout(600);
  const res = await page.evaluate((strict) => {
    const probe = (v) => { const d = document.createElement('span'); d.style.cssText = `position:absolute;visibility:hidden;font-size:${v}`; document.body.appendChild(d); const px = parseFloat(getComputedStyle(d).fontSize); d.remove(); return px; };
    const sizes = new Set(['--brand-fs-h2', '--brand-fs-h2-sub', '--brand-fs-h3', '--brand-fs-num', '--brand-fs-lead', '--brand-fs-body', '--brand-fs-small', '--brand-fs-label', '--brand-fs-label-lg', '--brand-fs-btn', '--brand-fs-btn-compact', '--brand-fs-numeral'].map(t => Math.round(probe(`var(${t})`))));
    const okLs = [0.04, 0.05, 0.14, 0.005, -0.005]; const bad = []; const seen = new Set();
    document.querySelectorAll('body *').forEach((el) => {
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
      if (el.closest('.hero-banner,script,style,noscript,svg')) return;
      const cs = getComputedStyle(el); const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); const px = parseFloat(cs.fontSize);
      const why = [];
      if (!/^(IBM Plex Sans Condensed|Inter)$/.test(fam)) why.push(`family ${fam}`);
      if (strict) {
        if (!sizes.has(Math.round(px))) why.push(`size ${Math.round(px)}px`);
        if (cs.textTransform === 'uppercase' && cs.letterSpacing !== 'normal') { const em = parseFloat(cs.letterSpacing) / px; if (!okLs.some(o => Math.abs(o - em) < 0.008)) why.push(`tracking ${em.toFixed(3)}em`); }
      }
      if (why.length) { const k = why.join(',') + '|' + (el.className || el.tagName).toString().slice(0, 30); if (!seen.has(k)) { seen.add(k); bad.push(`${why.join(', ')}  <${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 40)}"> "${el.textContent.trim().slice(0, 24)}"`); } }
    });
    return { bad, sizes: [...sizes].sort((a, b) => a - b) };
  }, strict);
  console.log(`\n${path} @${w}  ${res.bad.length ? 'FAIL' : 'ok'}${strict ? `   (scale ${res.sizes.join('/')}px)` : ''}`);
  res.bad.slice(0, 12).forEach(l => console.log('   ✗ ' + l)); fails += res.bad.length;
  await page.close();
}
await browser.close();
console.log(`\n${fails ? '✗ ' + fails + ' violation(s)' : '✓ no violations'}`);
process.exit(fails ? 1 : 0);
