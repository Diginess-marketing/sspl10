// usage: node tools/type-audit.mjs [path] [width]  -> groups every visible text element by role and lists the distinct computed type styles
import { chromium } from 'playwright-core';
const path = process.argv[2] || '/'; const w = +(process.argv[3] || 1440);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: w, height: 900 } });
await page.goto('http://127.0.0.1:5199' + path, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); await document.fonts.ready; });
await page.waitForTimeout(800);
const rows = await page.evaluate(() => {
  const out = [];
  const sec = (el) => { const s = el.closest('section,footer,header,nav,aside'); if (!s) return 'page'; return (s.id || s.className.toString().split(' ')[0] || s.tagName).slice(0, 22); };
  const role = (el) => { const t = el.tagName.toLowerCase(); if (/^h[1-6]$/.test(t)) return t; if (t === 'button' || el.classList.contains('brand-btn')) return 'button'; if (t === 'a') return 'link'; if (t === 'p') return 'p'; if (t === 'li') return 'li'; if (t === 'label') return 'label'; return null; };
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,li,label,summary').forEach((el) => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim(); if (!txt) return;
    const cs = getComputedStyle(el);
    out.push({ role: role(el), sec: sec(el), txt: txt.slice(0, 26), fam: cs.fontFamily.split(',')[0].replace(/["']/g, ''), size: Math.round(parseFloat(cs.fontSize)), wt: cs.fontWeight, tt: cs.textTransform, ls: cs.letterSpacing === 'normal' ? 0 : +parseFloat(cs.letterSpacing).toFixed(1), it: cs.fontStyle === 'italic' ? 'i' : '', col: cs.color });
  });
  return out;
});
await browser.close();
const by = {};
for (const r of rows) { const k = r.role; (by[k] ||= []).push(r); }
for (const [role, list] of Object.entries(by)) {
  const combos = {};
  for (const r of list) { const k = `${r.fam} | ${r.size}px | ${r.wt} | ${r.tt} | ls${r.ls} ${r.it} | ${r.col}`; (combos[k] ||= { n: 0, ex: [] }).n++; if (combos[k].ex.length < 2) combos[k].ex.push(`${r.sec}:"${r.txt}"`); }
  const keys = Object.keys(combos).sort((a, b) => combos[b].n - combos[a].n);
  console.log(`\n== ${role}  (${list.length} elements, ${keys.length} distinct styles)`);
  for (const k of keys.slice(0, 14)) console.log(`  ${String(combos[k].n).padStart(3)}×  ${k}   e.g. ${combos[k].ex.join('  ')}`);
  if (keys.length > 14) console.log(`  … +${keys.length - 14} more`);
}
