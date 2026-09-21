
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateCertificate(playerName) {
    try {
        const templatePath = path.join(__dirname, '../public/certificate-achievement-template.png');
        const outputDir = path.join(__dirname, '../public/generated_certificates');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const safeName = playerName.replace(/[^a-zA-Z0-9]/g, '_');
        const outputPath = path.join(outputDir, `SSPL_Certificate_Achievement_${safeName}_${timestamp}.png`);

        // Load image metadata to get dimensions
        const metadata = await sharp(templatePath).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Calculate position
        const fontSize = Math.floor(width * 0.045);
        const yPos = Math.floor(height * 0.435);

        // Create SVG text overlay
        const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: #8B7355; font-size: ${fontSize}px; font-weight: bold; font-family: serif; text-anchor: middle; }
        </style>
        <text x="50%" y="${yPos}" class="title">${playerName.toUpperCase()}</text>
      </svg>
    `;

        await sharp(templatePath)
            .composite([
                {
                    input: Buffer.from(svgText),
                    top: 0,
                    left: 0,
                },
            ])
            .toFile(outputPath);

        console.log(`Certificate generated successfully at: ${outputPath}`);
    } catch (error) {
        console.error('Error generating certificate:', error);
        process.exit(1);
    }
}

// Get player name from args
const playerName = process.argv[2];
if (!playerName) {
    console.error('Please provide a player name');
    process.exit(1);
}

generateCertificate(playerName);
