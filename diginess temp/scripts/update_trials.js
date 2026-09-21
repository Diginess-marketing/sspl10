
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersDataPath = path.join(__dirname, '../public/Players Data.json');
const newDataPath = path.join(__dirname, 'new_trial_data.md');
const outputDir = path.join(__dirname, '../public/generated_certificates');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function main() {
    console.log('Starting Update Process...');

    // 1. Read Data
    let playersData = [];
    try {
        const fileContent = fs.readFileSync(playersDataPath, 'utf-8');
        playersData = JSON.parse(fileContent);
    } catch (e) {
        console.error('Error reading Players Data.json:', e);
        return;
    }

    const tableData = fs.readFileSync(newDataPath, 'utf-8');

    // 2. Parse Markdown Table
    const lines = tableData.split('\n').filter(l => l.trim().startsWith('|') && !l.includes('---') && !l.includes('PLAYER NAME'));
    const updates = lines.map(line => {
        const parts = line.split('|').map(s => s.trim());
        // | SNO | NAME | MOBILE | STATUS |
        // Parts: [0]='', [1]=SNO, [2]=NAME, [3]=MOBILE, [4]=STATUS, [5]=''
        return {
            sno: parts[1],
            name: parts[2],
            mobile: parts[3],
            status: parts[4] // 'SELECTED' or 'NOT-SELECTED'
        };
    });

    console.log(`Parsed ${updates.length} updates from input.`);

    // 3. Update Players Data
    let updatedCount = 0;
    let newCount = 0;

    for (const update of updates) {
        // Clean mobile number (remove spaces if any, though input looks clean)
        const mobile = update.mobile.replace(/\s/g, '');

        // Find player
        let playerIndex = playersData.findIndex(p => p.mobile === mobile);

        // Map status to file format (SELECTED / NOT SELECTED)
        // User input status: 'SELECTED' / 'NOT-SELECTED'
        // File format seems to be 'SELECTED' / 'NOT SELECTED' (with space) or 'NOT-SELECTED'?
        // Looking at file snippet: "status": "SELECTED", "status": "NOT SELECTED"
        // So I should map 'NOT-SELECTED' to 'NOT SELECTED'
        const normalizedStatus = update.status === 'SELECTED' ? 'SELECTED' : 'NOT SELECTED';

        if (playerIndex !== -1) {
            playersData[playerIndex].status = normalizedStatus;
            // Update name? User provided specific names, maybe better formatted.
            // Let's keep original name to avoid conflicts unless name is missing or drastically different?
            // User requested "add the following data", implying this is the truth.
            playersData[playerIndex].name = update.name;
            updatedCount++;
        } else {
            playersData.push({
                mobile: mobile,
                state: "", // Unknown
                name: update.name,
                proficiency: "", // Unknown
                status: normalizedStatus
            });
            newCount++;
        }
    }

    // 4. Save JSON
    fs.writeFileSync(playersDataPath, JSON.stringify(playersData, null, 2));
    console.log(`Database updated: ${updatedCount} entries updated, ${newCount} entries added.`);

    // 5. Generate Certificates
    console.log('Generating certificates...');

    // Load Templates Metadata to get dimensions
    const participationTemplatePath = path.join(__dirname, '../public/certificate-participation-template.png');
    const achievementTemplatePath = path.join(__dirname, '../public/certificate-achievement-template.png');

    // Check if templates exist
    if (!fs.existsSync(participationTemplatePath)) console.error('Participation template not found!');
    if (!fs.existsSync(achievementTemplatePath)) console.error('Achievement template not found!');

    for (const update of updates) {
        try {
            const isSelected = update.status === 'SELECTED';
            const type = isSelected ? 'achievement' : 'participation';
            const templatePath = isSelected ? achievementTemplatePath : participationTemplatePath;

            if (!fs.existsSync(templatePath)) {
                console.warn(`Template not found for ${update.name} (${type}), skipping.`);
                continue;
            }

            const image = sharp(templatePath);
            const metadata = await image.metadata();

            const width = metadata.width;
            const height = metadata.height;

            // Logic from certificateGenerator.ts:
            // Font Size: width * 0.045
            // Y Position: height * 0.435
            // Color: #8B7355

            const fontSize = Math.floor(width * 0.045);
            const yPos = Math.floor(height * 0.435);
            // SVG text y is usually baseline. "middle" baseline might vary.
            // In canvas "textBaseline = 'middle'" uses the middle of the em square.
            // In SVG, dominant-baseline="middle" centers it vertically.

            const svgText = `
            <svg width="${width}" height="${height}">
                <style>
                    .title { 
                        fill: #8B7355; 
                        font-size: ${fontSize}px; 
                        font-family: serif; 
                        font-weight: bold;
                        text-anchor: middle;
                        dominant-baseline: middle;
                    }
                </style>
                <text x="50%" y="${yPos}" class="title">${update.name.toUpperCase()}</text>
            </svg>`;

            const buffer = Buffer.from(svgText);

            // Filename
            const date = new Date().toISOString().split('T')[0];
            const sanitizedName = update.name.replace(/[^a-zA-Z0-9]/g, '_');
            const typeSuffix = isSelected ? 'Achievement' : 'Participation';
            const filename = `SSPL_Certificate_${typeSuffix}_${sanitizedName}_${date}.png`;
            const outputPath = path.join(outputDir, filename);

            await image
                .composite([{ input: buffer, top: 0, left: 0 }])
                .toFile(outputPath);

            // console.log(`Generated: ${filename}`);
        } catch (err) {
            console.error(`Failed to generate certificate for ${update.name}:`, err);
        }
    }

    console.log(`Certificates generated in ${outputDir}`);
}

main().catch(console.error);
