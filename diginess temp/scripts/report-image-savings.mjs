#!/usr/bin/env node
// Report estimated savings by comparing original PNG/JPG vs preferred next-gen (AVIF>WebP)
import path from 'node:path';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const IMAGE_GLOB = '**/*.{png,jpg,jpeg,PNG,JPG,JPEG}';
const IGNORE = ['**/node_modules/**', '**/dist/**', '**/assets/**'];

function toUnix(p) { return p.split(path.sep).join('/'); }

async function fileStatOrNull(p) {
  try { return await fs.stat(p); } catch { return null; }
}

async function main() {
  const patterns = [toUnix(path.join(projectRoot, IMAGE_GLOB))];
  const files = await fg(patterns, { onlyFiles: true, absolute: true, unique: true, ignore: IGNORE });
  if (files.length === 0) {
    console.log('No raster images found.');
    return;
  }

  let totalOrig = 0;
  let totalBest = 0;

  const rows = [];
  for (const orig of files) {
    const statOrig = await fileStatOrNull(orig);
    if (!statOrig) continue;
    totalOrig += statOrig.size;

    const ext = path.extname(orig);
    const base = orig.slice(0, -ext.length);
    const avif = await fileStatOrNull(`${base}.avif`);
    const webp = await fileStatOrNull(`${base}.webp`);
    const best = avif?.size ?? webp?.size ?? statOrig.size;
    totalBest += best;

    rows.push({
      file: toUnix(path.relative(projectRoot, orig)),
      orig: statOrig.size,
      avif: avif?.size ?? null,
      webp: webp?.size ?? null,
      best,
      savings: statOrig.size - best,
      savingsPct: statOrig.size > 0 ? ((statOrig.size - best) / statOrig.size) * 100 : 0,
    });
  }

  rows.sort((a, b) => b.savings - a.savings);

  const totalSavings = totalOrig - totalBest;
  const pct = totalOrig > 0 ? (totalSavings / totalOrig) * 100 : 0;
  console.log(`Images analyzed: ${rows.length}`);
  console.log(`Original total: ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Next-gen total: ${(totalBest / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Estimated savings if serving AVIF/WebP: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${pct.toFixed(1)}%)`);

  const reportPath = path.join(projectRoot, 'image-savings-report.json');
  await fs.writeFile(reportPath, JSON.stringify({ summary: { totalOrig, totalBest, totalSavings, pct }, rows }, null, 2));
  console.log(`Detailed report written to ${reportPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
