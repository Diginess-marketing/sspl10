#!/usr/bin/env node
// Copy optimized image variants (avif/webp and responsive -{bp}w.*) into dist/
import path from 'node:path';
import fs from 'node:fs/promises';
import fse from 'fs-extra';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

function toUnix(p) { return p.split(path.sep).join('/'); }

async function main() {
	// Ensure dist exists
	await fse.ensureDir(distDir);

	const patterns = [
		toUnix(path.join(projectRoot, '**/*.avif')),
		toUnix(path.join(projectRoot, '**/*.webp')),
	];

	const ignore = [
		toUnix(path.join(projectRoot, 'node_modules/**')),
		toUnix(path.join(projectRoot, 'dist/**')),
		toUnix(path.join(projectRoot, 'assets/**')), // built assets
		toUnix(path.join(projectRoot, 'android-pwa/**')),
		toUnix(path.join(projectRoot, '.*/**')),
	];

	const files = await fg(patterns, { onlyFiles: true, absolute: true, unique: true, ignore });
	let copied = 0;

	for (const abs of files) {
		// Compute destination within dist preserving relative path from project root
		const rel = path.relative(projectRoot, abs);
		const dest = path.join(distDir, rel);
		await fse.ensureDir(path.dirname(dest));
		// If file already exists with same size, skip
		let doCopy = true;
		try {
			const [srcStat, dstStat] = await Promise.all([fs.stat(abs), fs.stat(dest)]);
			if (srcStat.size === dstStat.size) doCopy = false;
		} catch {
			// dest likely missing -> copy
		}
		if (doCopy) {
			await fse.copy(abs, dest);
			copied++;
		}
	}

	console.log(`Copied ${copied} optimized image(s) to dist.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
