import { chromium } from 'playwright-core';
import sharp from 'sharp';
const width = +(process.argv[2] || 1342);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 140)));
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
await page.waitForSelector('.hero-banner__stage', { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].filter(i => i.closest('.hero-banner')).every(i => i.complete), null, { timeout: 20000 });
await page.addStyleTag({ content: '.header, [class*="25D366"], [class*="100001"] { display: none !important; }' });
await page.waitForTimeout(800);
const el = page.locator('.hero-banner__stage');
const box = await el.boundingBox();
console.log('stage box', JSON.stringify(box));
await el.screenshot({ path: 'shots/hero-render.png' });
await browser.close();
if (errs.length) console.log(errs.join('\n'));

// ---- measure ----
const load = async (f) => { const { data, info } = await sharp(f).removeAlpha().resize(1342, 474, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true }); return data; };
const mock = await load('mockup/hero-mockup.png'), mine = await load('shots/hero-render.png');
const W = 1342;
const navy = (r,g,b)=>r<95&&g<105&&b<170&&b>r+8, blue=(r,g,b)=>b>170&&r<110&&g<150&&b-r>90;
const bb = (d,x0,y0,x1,y1,pred)=>{let a=1e9,b=1e9,c=-1,e=-1;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*W+x)*3;if(pred(d[i],d[i+1],d[i+2])){if(x<a)a=x;if(x>c)c=x;if(y<b)b=y;if(y>e)e=y}}return c<0?null:{x0:a,y0:b,x1:c,y1:e,w:c-a+1,h:e-b+1}};
const items = { headline:[15,80,480,145,navy], tagline:[20,270,540,304,navy], circle:[20,320,92,400,navy], label:[95,340,290,385,navy], arrow:[270,340,345,385,blue] };
for (const [k,[x0,y0,x1,y1,p]] of Object.entries(items)) {
  const t = bb(mock,x0,y0,x1,y1,p), m = bb(mine,x0,y0,x1,y1,p);
  console.log(k.padEnd(9), 'target', t && `${t.x0},${t.y0} ${t.w}x${t.h}`, '| mine', m && `${m.x0},${m.y0} ${m.w}x${m.h}`, '| delta', t && m && `dx=${m.x0-t.x0} dy=${m.y0-t.y0} dw=${m.w-t.w} dh=${m.h-t.h}`);
}
// overall similarity
let sum=0,n=0; for (let i=0;i<mock.length;i+=3){const d=Math.abs(mock[i]-mine[i])+Math.abs(mock[i+1]-mine[i+1])+Math.abs(mock[i+2]-mine[i+2]); sum+=d/3; n++} console.log('mean abs diff (0-255):', (sum/n).toFixed(2));
// side by side + diff image
const diff = Buffer.alloc(mock.length); for (let i=0;i<mock.length;i++) diff[i]=Math.min(255, Math.abs(mock[i]-mine[i])*3);
await sharp(diff,{raw:{width:1342,height:474,channels:3}}).negate().png().toFile('shots/hero-diff.png');
await sharp({create:{width:1342,height:474*2+10,channels:3,background:'#888'}}).composite([{input:'mockup/hero-mockup.png',top:0,left:0},{input:'shots/hero-render.png',top:484,left:0}]).png().toFile('shots/hero-stack.png');
