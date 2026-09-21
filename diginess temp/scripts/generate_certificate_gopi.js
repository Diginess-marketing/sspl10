
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playerName = 'Gopi Krishna';
const templatePath = path.join(__dirname, '../public/certificate-participation-template.png');
const outputDir = path.join(__dirname, '../public/generated_certificates');
const outputPath = path.join(outputDir, 'Gopi_Krishna.png');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateCertificate() {
    try {

        const metadata = await sharp(templatePath).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Create SVG text overlay
        const svgImage = `
    <svg width="${width}" height="${height}">
      <style>
      .title { fill: #000; font-size: ${Math.floor(width * 0.04)}px; font-weight: bold; font-family: Arial, sans-serif; text-anchor: middle; }
      </style>
      <text x="50%" y="58%" text-anchor="middle" class="title">${playerName}</text>
    </svg>
    `;

        await sharp(templatePath)
            .composite([{
                input: Buffer.from(svgImage),
                top: 0,
                left: 0,
            }])
            .toFile(outputPath);

        console.log(`Certificate generated successfully at: ${outputPath}`);
    } catch (error) {
        console.error('Error generating certificate:', error);
    }
}

generateCertificate();
