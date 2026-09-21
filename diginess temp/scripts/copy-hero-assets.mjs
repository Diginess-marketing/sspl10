#!/usr/bin/env node
// Copy hero image variants (avif/webp) from public to dist
import path from 'node:path';
import fse from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

async function main() {
	await fse.ensureDir(distDir);
	
	// Pattern to match hero image files
	const heroPattern = /^ravi-mohan-home-with-bg(-\d+w)?\.(avif|webp)$/;
	
	const files = await fse.readdir(publicDir);
	let copied = 0;
	
	for (const file of files) {
		if (heroPattern.test(file)) {
			const src = path.join(publicDir, file);
			const dest = path.join(distDir, file);
			await fse.copy(src, dest, { overwrite: true });
			copied++;
		}
	}
	
	console.log(`✅ Copied ${copied} hero image file(s) to dist`);
}

main().catch((e) => {
	console.error('❌ Error copying hero assets:', e);
	process.exit(1);
});
