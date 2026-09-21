import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const ok = (c, m, extra = '') => console.log((c ? '✅' : '❌'), m, extra);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 100)));
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' });
await page.waitForSelector('.site-header');
await page.waitForTimeout(1200);

// ---- desktop bar ----
const links = await page.$$eval('.site-nav > li > a', a => a.map(x => [x.textContent.trim(), x.getAttribute('href')]));
console.log('nav:', JSON.stringify(links));
ok(links.length === 4, 'four top-level items (Home, About Us, Associates, Contact Us)');
ok(await page.locator('.site-nav__link.is-active').first().textContent().then(t => t.trim() === 'Home'), 'Home is active on /');
await page.hover('.site-nav > li:nth-child(2)');
await page.waitForTimeout(300);
const about = await page.$$eval('.site-nav > li:nth-child(2) .site-nav__menu a', a => a.map(x => x.getAttribute('href')));
ok(await page.locator('.site-nav > li:nth-child(2) .site-nav__menu').isVisible(), 'About Us dropdown opens on hover', JSON.stringify(about));
await page.hover('.site-nav > li:nth-child(3)');
await page.waitForTimeout(300);
const assoc = await page.$$eval('.site-nav > li:nth-child(3) .site-nav__menu a', a => a.map(x => x.getAttribute('href')));
ok(assoc.length === 2, 'Associates dropdown has its 2 pages', JSON.stringify(assoc));
const ytHref = await page.getAttribute('.site-header__youtube', 'href');
ok(/youtube\.com\/@Southernstreetpremierleague/.test(ytHref), 'YouTube icon links to the channel');
ok(await page.locator('.site-header a[href*="instagram"]').count() === 0, 'no Instagram icon in the bar (replaced by Results + Registration)');
ok(await page.locator('.site-header__actions .site-btn').count() === 2, 'Results + Registration buttons in the bar');

// ---- keyboard: tab reaches dropdown links ----
await page.mouse.move(700, 400);
await page.focus('.site-nav > li:nth-child(2) > a');
await page.keyboard.press('Tab');
ok(await page.locator('.site-nav > li:nth-child(2) .site-nav__menu').isVisible(), 'dropdown opens with keyboard focus');

// ---- menu (hamburger) ----
await page.click('.site-header__burger');
await page.waitForTimeout(450);
ok(await page.locator('#site-drawer').isVisible(), 'hamburger opens the menu');
ok(await page.evaluate(() => document.body.style.overflow === 'hidden'), 'page scroll locked while open');
ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Close menu'), 'focus moves into the menu');
ok(await page.locator('.site-drawer__social a').count() === 7, 'all 7 social links kept in the menu');
ok(await page.locator('.site-drawer .notranslate').count() > 0, 'language selector kept in the menu');
await page.screenshot({ path: 'shots/h-drawer-desktop.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(450);
ok(!(await page.locator('#site-drawer').isVisible()), 'Escape closes the menu');
ok(await page.evaluate(() => document.activeElement?.classList.contains('site-header__burger')), 'focus returns to the hamburger');
ok(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'scroll unlocked after close');
await page.click('.site-header__burger'); await page.waitForTimeout(400);
await page.mouse.click(60, 400); await page.waitForTimeout(450);
ok(!(await page.locator('#site-drawer').isVisible()), 'clicking outside closes the menu');
await page.click('.site-header__burger'); await page.waitForTimeout(400);
await page.click('.site-drawer__nav a[href="/videos"]'); await page.waitForTimeout(700);
ok(page.url().endsWith('/videos') && !(await page.locator('#site-drawer').isVisible()), 'menu link navigates and closes', page.url());

// ---- buttons navigate ----
await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' }); await page.waitForSelector('.site-header');
await page.click('.site-header__actions a[href="/trial-results"]'); await page.waitForTimeout(700);
ok(page.url().endsWith('/trial-results'), 'Results button -> /trial-results');
await page.click('.site-header__actions a[href="/register"]'); await page.waitForTimeout(700);
ok(page.url().endsWith('/register'), 'Registration button -> /register');

// ---- phones: no overflow, everything fits ----
for (const w of [320, 360, 390]) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.goto('http://127.0.0.1:5199/', { waitUntil: 'load' }); await page.waitForSelector('.site-header'); await page.waitForTimeout(500);
  const m = await page.evaluate(() => { const r = (s) => document.querySelector(s).getBoundingClientRect(); const a = r('.site-header__actions'), l = r('.site-header__logo'); return { over: document.documentElement.scrollWidth - innerWidth, actionsRight: Math.round(a.right), logoRight: Math.round(l.right), actionsLeft: Math.round(a.left), h: Math.round(r('.site-header').height) }; });
  ok(m.over <= 0 && m.actionsRight <= w && m.actionsLeft > m.logoRight, `${w}px: header fits, no horizontal scroll`, JSON.stringify(m));
}
await page.click('.site-header__burger'); await page.waitForTimeout(450);
await page.screenshot({ path: 'shots/h-drawer-mobile.png' });

// ---- other pages: header never overlaps content ----
await page.setViewportSize({ width: 1440, height: 900 });
for (const p of ['/about-us', '/faqs', '/register', '/tournament-organizer-registration', '/videos', '/teams']) {
  await page.goto('http://127.0.0.1:5199' + p, { waitUntil: 'load' }); await page.waitForTimeout(1300);
  const r = await page.evaluate(() => { const hb = document.querySelector('.site-header').getBoundingClientRect().bottom; const el = document.querySelector('main') || document.body; const first = [...el.querySelectorAll('h1,h2,p,img,section > div')].find(e => e.getBoundingClientRect().height > 20 && getComputedStyle(e).visibility !== 'hidden'); return { hb: Math.round(hb), firstTop: first ? Math.round(first.getBoundingClientRect().top) : null, stickyOk: getComputedStyle(document.querySelector('.site-header')).position === 'sticky' }; });
  ok(r.firstTop === null || r.firstTop >= r.hb - 1, `${p}: content starts below header`, JSON.stringify(r));
}
console.log('page errors:', errs.length ? errs : 'none');
await browser.close();
