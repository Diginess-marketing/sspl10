#!/usr/bin/env node
// Rewrite <img> tags to <picture> with AVIF/WebP sources when generated siblings exist

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { load as loadHtml } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const HTML_GLOB = ['**/*.html'];
const IGNORE = ['**/node_modules/**', '**/dist/**', '**/assets/**'];

function toUnix(p) {
  return p.split(path.sep).join('/');
}

function resolvePublicPath(src) {
  // src may be absolute (/foo.png) or relative
  if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:')) return null;

  // Try absolute from project root
  const abs1 = path.join(projectRoot, src.startsWith('/') ? src.slice(1) : src);
  // Try public/ prefix
  const abs2 = path.join(projectRoot, 'public', src.startsWith('/') ? src.slice(1) : src);
  return { abs1, abs2 };
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function findOptimizedSiblings(imgPath) {
  const ext = path.extname(imgPath);
  const base = imgPath.slice(0, -ext.length);
  const avif = `${base}.avif`;
  const webp = `${base}.webp`;
  const [hasAvif, hasWebp] = await Promise.all([fileExists(avif), fileExists(webp)]);
  return { avif: hasAvif ? avif : null, webp: hasWebp ? webp : null };
}

function toWebPath(absPath) {
  // Turn an absolute path into a web path relative to project root or public root
  const relFromRoot = path.relative(projectRoot, absPath);
  const parts = relFromRoot.split(path.sep);
  if (parts[0] === 'public') {
    return '/' + parts.slice(1).join('/');
  }
  return '/' + parts.join('/');
}

async function processHtml(file) {
  const srcHtml = await fs.readFile(file, 'utf8');
  const $ = loadHtml(srcHtml, { decodeEntities: false });
  let changed = false;

  $('img').each((_, el) => {
    const $img = $(el);
    if ($img.attr('data-optimized') === 'true') return; // already done

    const src = $img.attr('src');
    if (!src) return;

    // Skip external or data URIs
    if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return;

    const resolved = resolvePublicPath(src);
    if (!resolved) return;

    const candidates = [resolved.abs1, resolved.abs2];
    let foundAbs = null;
    for (const c of candidates) {
      if (c && fs.access(c).then(() => true).catch(() => false)) {
        // Note: access is async; we handle properly below
      }
    }

    // Because cheerio .each doesn't handle async well, we mark nodes and handle after
  });

  // Collect imgs for async processing
  const targets = [];
  $('img').each((_, el) => {
    const $img = $(el);
    if ($img.attr('data-optimized') === 'true') return;
    const src = $img.attr('src');
    if (!src || /^https?:\/\//i.test(src) || src.startsWith('data:')) return;
    targets.push($img);
  });

  for (const $img of targets) {
    const src = $img.attr('src');
    const { abs1, abs2 } = resolvePublicPath(src);
    let abs = null;
    if (abs1 && await fileExists(abs1)) abs = abs1;
    else if (abs2 && await fileExists(abs2)) abs = abs2;
    if (!abs) continue;

    const { avif, webp } = await findOptimizedSiblings(abs);
    if (!avif && !webp) continue;

    // Build <picture>
  const picture = $('<picture></picture>');
    if (avif) picture.append(`<source type="image/avif" srcset="${toWebPath(avif)}">`);
    if (webp) picture.append(`<source type="image/webp" srcset="${toWebPath(webp)}">`);

    // Keep all attributes of <img>
    const attrs = $img.attr();
    const newImg = $('<img/>');
    Object.entries(attrs).forEach(([k, v]) => newImg.attr(k, v));
    newImg.attr('data-optimized', 'true');

    picture.append(newImg);
    $img.replaceWith(picture);
    changed = true;
  }

  if (changed) {
    // Backup original
    await fs.copyFile(file, `${file}.bak`);
    await fs.writeFile(file, $.html());
    return true;
  }
  return false;
}

async function main() {
  const files = await fg(HTML_GLOB, { cwd: projectRoot, ignore: IGNORE, onlyFiles: true, absolute: true });
  if (files.length === 0) {
    console.log('No HTML files found to rewrite.');
    return;
  }
  let updated = 0;
  for (const f of files) {
    const ok = await processHtml(f);
    if (ok) {
      updated++;
      console.log('Rewrote', toUnix(path.relative(projectRoot, f)));
    }
  }
  console.log(`HTML rewrite complete. Updated ${updated} file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
