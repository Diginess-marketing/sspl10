// usage: node tools/page-shot.mjs <outdir> <name> <width> <path> [clipHeight]
import { chromium } from 'playwright-core';
const [,, out, name, w, path, clipH] = process.argv;
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 90)));
await p.goto('http://127.0.0.1:5199' + path, { waitUntil: 'load' }); await p.waitForTimeout(2500);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); await document.fonts.ready; }); await p.waitForTimeout(700);
const h = await p.evaluate(() => document.documentElement.scrollHeight);
await p.screenshot({ path: `${out}/${name}.png`, fullPage: true, clip: { x: 0, y: 0, width: +w, height: Math.min(h, +(clipH || 1400)) } });
console.log(name, 'pageHeight', h, errs.length ? errs : 'no page errors'); await b.close();
