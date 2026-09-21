#!/usr/bin/env node
// Remove orphaned optimized images (.avif/.webp and -{bp}w variants) when source PNG/JPG is missing
import path from 'node:path';
import fs from 'node:fs/promises';
import fse from 'fs-extra';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const IGNORE = ['**/node_modules/**', '**/dist/**', '**/assets/**'];
const HASH_MAP_FILE = path.join(projectRoot, '.image-sources.hashmap.json');
const HASH_FILE = path.join(projectRoot, '.image-sources.hash.json');
const MANIFEST_FILE = path.join(projectRoot, 'optimize-manifest.json');

function toUnix(p) { return p.split(path.sep).join('/'); }

async function fileExists(p) { try { await fs.access(p); return true; } catch { return false; } }

function baseRootFromOptimized(file) {
  const ext = path.extname(file); // .avif/.webp
  const withoutExt = file.slice(0, -ext.length);
  // Strip -{bp}w if present
  return withoutExt.replace(/-\d+w$/, '');
}

async function cleanup() {
  const optimized = await fg([toUnix(path.join(projectRoot, '**/*.avif')), toUnix(path.join(projectRoot, '**/*.webp'))], {
    onlyFiles: true,
    absolute: true,
    unique: true,
    ignore: IGNORE,
  });

  if (optimized.length === 0) {
    console.log('No optimized images found.');
    return { deleted: 0 };
  }

  let deleted = 0;
  const visitedRoots = new Set();

  for (const opt of optimized) {
    const root = baseRootFromOptimized(opt);
    if (visitedRoots.has(root)) continue; // avoid repeating same family
    visitedRoots.add(root);

    // Check for any existing source extensions
    const candidates = [`.png`, `.jpg`, `.jpeg`, `.PNG`, `.JPG`, `.JPEG`].map((e) => `${root}${e}`);
    let hasSource = false;
    for (const c of candidates) { if (await fileExists(c)) { hasSource = true; break; } }
    if (hasSource) continue;

    // Delete all optimized siblings for this root
    const dir = path.dirname(root);
    const baseName = path.basename(root);
    const patterns = [
      toUnix(path.join(dir, `${baseName}.avif`)),
      toUnix(path.join(dir, `${baseName}.webp`)),
      toUnix(path.join(dir, `${baseName}-*w.avif`)),
      toUnix(path.join(dir, `${baseName}-*w.webp`)),
    ];
    const family = await fg(patterns, { onlyFiles: true, absolute: true, unique: true });
    for (const f of family) {
      try { await fs.unlink(f); deleted++; } catch {}
    }
  }

  // Clean manifest: remove entries for missing sources
  let manifest = {};
  try { manifest = JSON.parse(await fs.readFile(MANIFEST_FILE, 'utf8')); } catch {}
  let removedManifest = 0;
  for (const key of Object.keys(manifest)) {
    const abs = key.startsWith('/') || key.includes(':') ? key : path.join(projectRoot, key);
    if (!(await fileExists(abs))) { delete manifest[key]; removedManifest++; }
  }
  if (removedManifest > 0) {
    await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  }

  // Clean hash map: remove entries for missing sources
  let hashMap = {};
  try { hashMap = JSON.parse(await fs.readFile(HASH_MAP_FILE, 'utf8')); } catch {}
  let removedHash = 0;
  for (const rel of Object.keys(hashMap)) {
    const abs = path.join(projectRoot, rel.replace(/^[\\/]+/, ''));
    if (!(await fileExists(abs))) { delete hashMap[rel]; removedHash++; }
  }
  if (removedHash > 0) {
    await fs.writeFile(HASH_MAP_FILE, JSON.stringify(hashMap, null, 2));
  }

  // Also clean dist/: remove optimized files in dist without corresponding source images
  let distDeleted = 0;
  const distExists = await fileExists(distDir);
  if (distExists) {
    const distOptimized = await fg(
      [toUnix(path.join(distDir, '**/*.avif')), toUnix(path.join(distDir, '**/*.webp'))],
      { onlyFiles: true, absolute: true }
    );
    for (const dfile of distOptimized) {
      // map dist path back to project relative path
      const relFromDist = path.relative(distDir, dfile);
      const absProjectOptimized = path.join(projectRoot, relFromDist);
      const root = baseRootFromOptimized(absProjectOptimized);
      const candidates = [`.png`, `.jpg`, `.jpeg`, `.PNG`, `.JPG`, `.JPEG`].map((e) => `${root}${e}`);
      let hasSource = false;
      for (const c of candidates) { if (await fileExists(c)) { hasSource = true; break; } }
      if (!hasSource) {
        try { await fs.unlink(dfile); distDeleted++; } catch {}
      }
    }
  }

  console.log(
    `Cleanup complete. Deleted ${deleted} optimized file(s). Removed ${removedManifest} manifest entr(y/ies). Removed ${removedHash} hash entr(y/ies).` +
      (distExists ? ` Deleted ${distDeleted} file(s) from dist.` : '')
  );
  return { deleted, distDeleted };
}

cleanup().catch((e) => { console.error(e); process.exit(1); });
