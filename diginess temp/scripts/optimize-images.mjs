#!/usr/bin/env node
// Convert images to AVIF and WebP and compress originals where beneficial
// Non-destructive: writes .avif and .webp siblings next to the source files
// Outputs an optimize-manifest.json with a map of original -> generated files

import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import fse from 'fs-extra';
import sharp from 'sharp';
import crypto from 'node:crypto';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Directories to scan for images
const SEARCH_DIRS = [
  projectRoot, // root (contains index.html and some pngs)
  path.join(projectRoot, 'public'),
  path.join(projectRoot, 'src', 'assets'),
];

const IMAGE_GLOB = '**/*.{png,jpg,jpeg,JPG,JPEG,PNG}';
// Do not ignore assets now; we want to optimize src/assets as well for CSS references
const IGNORE = ['**/node_modules/**', '**/dist/**'];

const HASH_FILE = path.join(projectRoot, '.image-sources.hash.json');
const HASH_MAP_FILE = path.join(projectRoot, '.image-sources.hashmap.json');

const DEFAULTS = {
  // Reasonable defaults balancing size and quality
  jpegQuality: 72,
  pngQuality: 72,
  webpQuality: 72,
  avifQuality: 45,
  maxWidth: 2560, // don’t upscale; downscale anything wider
  maxHeight: 2560,
  effort: 4, // CPU effort for WebP/AVIF
  breakpoints: [480, 768, 1024, 1280, 1920],
};

const manifest = {};

function toUnix(p) {
  return p.split(path.sep).join('/');
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fsSync.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

async function optimizeOne(file) {
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);
  const outWebp = `${base}.webp`;
  const outAvif = `${base}.avif`;

  const input = sharp(file, { failOn: 'none' }).rotate();

  // Probe metadata to optionally resize
  const meta = await input.metadata();
  let pipeline = input.clone();
  if (meta.width && meta.height) {
    const w = meta.width;
    const h = meta.height;
    if (w > DEFAULTS.maxWidth || h > DEFAULTS.maxHeight) {
      pipeline = pipeline.resize({
        width: Math.min(w, DEFAULTS.maxWidth),
        height: Math.min(h, DEFAULTS.maxHeight),
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // Generate WebP
  const tasks = [];
  tasks.push(
    pipeline
      .clone()
      .webp({ quality: DEFAULTS.webpQuality, effort: DEFAULTS.effort })
      .toFile(outWebp)
      .then(() => ({ type: 'webp', path: outWebp }))
  );

  // Generate AVIF
  tasks.push(
    pipeline
      .clone()
      .avif({ quality: DEFAULTS.avifQuality, effort: DEFAULTS.effort })
      .toFile(outAvif)
      .then(() => ({ type: 'avif', path: outAvif }))
  );

  // Generate responsive variants for breakpoints (only if image is wide enough)
  if (meta.width) {
    for (const bp of DEFAULTS.breakpoints) {
      if (meta.width < bp) continue; // skip upscaling small images

      const outWebpBp = `${base}-${bp}w.webp`;
      const outAvifBp = `${base}-${bp}w.avif`;

      tasks.push(
        input
          .clone()
          .resize({ width: bp, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: DEFAULTS.webpQuality, effort: DEFAULTS.effort })
          .toFile(outWebpBp)
          .then(() => ({ type: 'webp', path: outWebpBp, width: bp }))
      );

      tasks.push(
        input
          .clone()
          .resize({ width: bp, fit: 'inside', withoutEnlargement: true })
          .avif({ quality: DEFAULTS.avifQuality, effort: DEFAULTS.effort })
          .toFile(outAvifBp)
          .then(() => ({ type: 'avif', path: outAvifBp, width: bp }))
      );
    }
  }

  const results = await Promise.all(tasks);
  const entry = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push({ path: toUnix(path.relative(projectRoot, r.path)), width: r.width || null });
    return acc;
  }, {});

  // Sort by width with base (null width) first
  for (const k of Object.keys(entry)) {
    entry[k].sort((a, b) => {
      if (a.width == null && b.width != null) return -1;
      if (a.width != null && b.width == null) return 1;
      if (a.width == null && b.width == null) return 0;
      return a.width - b.width;
    });
  }

  manifest[toUnix(file)] = entry;
}

async function main() {
  const patterns = SEARCH_DIRS.map((d) => toUnix(path.join(d, IMAGE_GLOB)));
  let files = await fg(patterns, { ignore: IGNORE, dot: false, onlyFiles: true, unique: true });
  // Ensure deterministic ordering for stable hashing
  files = files.sort((a, b) => toUnix(a).localeCompare(toUnix(b)));

  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  // Compute a combined hash of source images (path + size)
  const digest = crypto.createHash('sha256');
  const stats = await Promise.all(files.map(async (f) => ({ f, s: await fs.stat(f) })));
  for (const { f, s } of stats) {
    digest.update(toUnix(path.relative(projectRoot, f)));
    digest.update('\0');
    digest.update(String(s.size));
    digest.update('\n');
  }
  const combinedHash = digest.digest('hex');

  // Load previous hash (if any) to skip work when unchanged
  let previous = null;
  try {
    previous = JSON.parse(await fs.readFile(HASH_FILE, 'utf8'));
  } catch { }

  // Load previous per-file hash map if available
  let prevMap = {};
  try {
    prevMap = JSON.parse(await fs.readFile(HASH_MAP_FILE, 'utf8'));
  } catch { }

  // Build new hash map and decide which files changed
  const newMap = {};
  const changed = [];
  for (const { f, s } of stats) {
    const rel = toUnix(path.relative(projectRoot, f));
    const h = await hashFile(f);
    newMap[rel] = { hash: h, size: s.size };
    const prev = prevMap[rel];
    let isChanged = !prev || prev.hash !== h;
    if (!isChanged) {
      // Ensure base outputs exist; if missing, treat as changed
      const ext = path.extname(f);
      const base = f.slice(0, -ext.length);
      const needBase = !(await fileExists(`${base}.avif`)) || !(await fileExists(`${base}.webp`));
      if (needBase) isChanged = true;
    }
    if (isChanged) changed.push(f);
  }

  if (previous?.combinedHash === combinedHash && previous?.count === files.length && changed.length === 0) {
    console.log('No changes detected in source images. Skipping optimization.');
    return;
  }

  console.log(`Found ${files.length} images. ${changed.length} changed; generating AVIF/WebP for changed files...`);

  // Ensure output directories exist for changed files
  for (const f of changed) {
    await fse.ensureDir(path.dirname(f));
  }

  let ok = 0;
  let fail = 0;

  // Simple concurrency control
  const CONCURRENCY = 2; // Reduced to prevent hanging
  const queue = [...changed];
  const total = changed.length;
  let processed = 0;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const f = queue.shift();
      try {
        await optimizeOne(f);
        ok++;
      } catch (err) {
        fail++;
        console.warn('Failed to optimize', f, err?.message || err);
      } finally {
        processed++;
        if (processed % 5 === 0 || processed === total) {
          console.log(`Progress: ${processed}/${total} images processed...`);
        }
      }
    }
  });

  await Promise.all(workers);

  const manifestPath = path.join(projectRoot, 'optimize-manifest.json');
  // Merge with previous manifest so unchanged files retain their entries
  let prevManifest = {};
  try {
    prevManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch { }
  const mergedManifest = { ...prevManifest };
  // Map changed absolute paths to relative web paths used as keys
  for (const abs of Object.keys(manifest)) {
    // manifest uses keys as toUnix(file) absolute; adjust to use that as key consistently
  }
  // Our manifest keys are toUnix(file) absolute paths; keep as-is but prefer new entries
  Object.assign(mergedManifest, manifest);
  await fs.writeFile(manifestPath, JSON.stringify(mergedManifest, null, 2));
  console.log(`Optimization complete: ${ok} succeeded, ${fail} failed.`);
  console.log(`Manifest written to ${manifestPath}`);

  // Save the new combined hash
  await fs.writeFile(HASH_FILE, JSON.stringify({ combinedHash, count: files.length, date: new Date().toISOString() }, null, 2));
  // Save per-file hashes
  await fs.writeFile(HASH_MAP_FILE, JSON.stringify(newMap, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
