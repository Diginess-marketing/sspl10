#!/usr/bin/env node
// Convert render-blocking CSS link to async pattern in dist/index.html
// - Replaces <link rel="stylesheet" href="/assets/css/...css"> with
//   <link rel="preload" as="style" href="..." onload="this.onload=null;this.rel='stylesheet'">
//   <noscript><link rel="stylesheet" href="..."></noscript>

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadHtml } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distIndexPath = path.join(projectRoot, 'dist', 'index.html');

(async function main() {
  try {
    const html = await fs.readFile(distIndexPath, 'utf8');
    const $ = loadHtml(html, { decodeEntities: false });

    let changed = false;

    // Find blocking CSS <link rel="stylesheet" href="/assets/css/*.css">
    const links = $('link[rel="stylesheet"][href]');

    links.each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const rel = ($el.attr('rel') || '').toLowerCase();

      // Skip if not an assets CSS file
      if (!/\/assets\/.+\.css($|\?)/i.test(href)) return;

      // If already converted to async pattern, skip
      const alreadyAsync = $el.attr('as') === 'style' || $el.attr('media') === 'print';
      if (alreadyAsync) return;

      // Capture crossorigin if present
      const crossorigin = $el.attr('crossorigin');

      // Build preload link
      const preload = $('<link/>')
        .attr('rel', 'preload')
        .attr('as', 'style')
        .attr('href', href)
        .attr('onload', "this.onload=null;this.rel='stylesheet'");
      if (crossorigin) preload.attr('crossorigin', crossorigin);

      // noscript fallback
      const noscript = $('<noscript></noscript>').append(
        $('<link/>').attr('rel', 'stylesheet').attr('href', href)
      );

      // Replace original stylesheet link with preload + noscript
      $el.replaceWith(preload);
      preload.after('\n');
      preload.after(noscript);

      changed = true;
    });

    if (changed) {
      await fs.writeFile(distIndexPath, $.html());
      console.log('✓ Converted blocking CSS to async pattern in dist/index.html');
    } else {
      console.log('No blocking CSS link found or already optimized.');
    }
  } catch (e) {
    console.error('async-css.mjs error:', e.message);
    process.exit(1);
  }
})();
