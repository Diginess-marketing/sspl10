import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(projectRoot, 'public', 'Website Banner Latest');
const OUTPUT_DIR = path.join(projectRoot, 'public', 'assets', 'banners');

const SIZES = [
    { width: 1920, suffix: '1920w' },
    { width: 1280, suffix: '1280w' },
    { width: 1080, suffix: '1080w' },
    { width: 768, suffix: '768w' },
    { width: 480, suffix: '480w' },
];

async function optimizeBanners() {
    await fs.ensureDir(OUTPUT_DIR);

    const files = await fs.readdir(SOURCE_DIR);
    const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`Found ${images.length} banner images to optimize...`);

    for (const file of images) {
        const inputPath = path.join(SOURCE_DIR, file);
        const filename = path.parse(file).name;

        console.log(`Optimizing ${file}...`);

        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Save original optimized version (max 1920w)
        // WebP
        await image
            .clone()
            .resize({ width: Math.min(metadata.width, 1920), withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toFile(path.join(OUTPUT_DIR, `${filename}.webp`));

        // AVIF
        await image
            .clone()
            .resize({ width: Math.min(metadata.width, 1920), withoutEnlargement: true })
            .avif({ quality: 65, effort: 4 })
            .toFile(path.join(OUTPUT_DIR, `${filename}.avif`));

        // Generate responsive sizes
        for (const size of SIZES) {
            if (metadata.width >= size.width) {
                // WebP
                await image
                    .clone()
                    .resize({ width: size.width })
                    .webp({ quality: 80, effort: 4 })
                    .toFile(path.join(OUTPUT_DIR, `${filename}-${size.suffix}.webp`));

                // AVIF
                await image
                    .clone()
                    .resize({ width: size.width })
                    .avif({ quality: 65, effort: 4 })
                    .toFile(path.join(OUTPUT_DIR, `${filename}-${size.suffix}.avif`));
            }
        }

        // Create a tiny placeholder for LQIP
        await image
            .clone()
            .resize({ width: 20 })
            .toFormat('jpg') // Use JPG for base64 compatibility if needed, or webp
            .blur(10)
            .toFile(path.join(OUTPUT_DIR, `${filename}-placeholder.jpg`));
    }

    console.log('Banner optimization complete!');
}

optimizeBanners().catch(err => {
    console.error('Error optimizing banners:', err);
    process.exit(1);
});
