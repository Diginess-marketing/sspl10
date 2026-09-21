// usage: node tools/sec-shot.mjs <outdir> <selector> <name> <widths...>
import { chromium } from 'playwright-core';
const [,, out, sel, name, ...ws] = process.argv;
const browser = await chromium.launch({ channel: 'chrome' });
for (const w of ws.map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  await page.goto('http://127.0.0.1:5199' + (process.env.SHOT_PATH || '/'), { waitUntil: 'load' });
  await page.waitForSelector(sel, { timeout: 30000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } await document.fonts.ready; });
  await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
  const m = { h: Math.round((await page.locator(sel).first().boundingBox()).height), over: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) };
  await page.locator(sel).first().screenshot({ path: `${out}/${name}-${w}.png` });
  console.log(w, JSON.stringify(m), errs.length ? errs : 'no page errors');
  await page.close();
}
await browser.close();
