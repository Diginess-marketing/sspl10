/**
 * Update Trials Script - January 2026
 * Adds new player data from trial results and generates certificates
 * 
 * This script:
 * 1. Reads existing player data (preserving all existing entries)
 * 2. Parses new trial data from markdown file
 * 3. Updates existing players or adds new ones
 * 4. Syncs both JSON files (root and public folder)
 * 5. Generates certificates for all processed players
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const publicPlayersDataPath = path.join(__dirname, '../public/Players_Data.json');
const rootPlayersDataPath = path.join(__dirname, '../Players Data.json');
const newDataPath = path.join(__dirname, 'temp_missing.md');
const outputDir = path.join(__dirname, '../public/generated_certificates');

// Certificate templates
const participationTemplatePath = path.join(__dirname, '../public/certificate-participation-template.png');
const achievementTemplatePath = path.join(__dirname, '../public/certificate-achievement-template.png');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// State mapping for cities
const cityStateMap = {
    'COIMBATORE': 'Tamil Nadu',
    'CHENNAI': 'Tamil Nadu',
    'THIRUCHENGODE': 'Tamil Nadu',
    'VIJAYAWADA': 'Andhra Pradesh',
    'TRICHY & COIMBATORE': 'Tamil Nadu',
    'COCHIN': 'Kerala'
};

/**
 * Normalize mobile number to 10-digit format
 */
function normalizeMobile(mobile) {
    // Remove all non-digit characters
    let cleaned = mobile.replace(/\D/g, '');

    // Strip 91 prefix if present (Indian country code)
    if (cleaned.length > 10 && cleaned.startsWith('91')) {
        cleaned = cleaned.substring(2);
    }

    return cleaned;
}

/**
 * Normalize status to consistent format
 */
function normalizeStatus(status) {
    const upperStatus = status.toUpperCase().trim();
    if (upperStatus === 'SELECTED') {
        return 'SELECTED';
    }
    // Handle both 'NOT SELECTED' and 'NOT-SELECTED'
    return 'NOT SELECTED';
}

/**
 * Parse markdown table into player objects
 */
function parseMarkdownTable(content) {
    const lines = content.split('\n');
    const players = [];

    for (const line of lines) {
        // Skip non-table lines, header, and separator
        if (!line.trim().startsWith('|')) continue;
        if (line.includes('---')) continue;
        if (line.toUpperCase().includes('| NAME |')) continue;

        const parts = line.split('|').map(s => s.trim()).filter(s => s);

        // Expected format: NAME | MOBILE | CITY | PROFICIENCY | STATUS
        if (parts.length >= 5) {
            const mobile = normalizeMobile(parts[1]);

            // Skip invalid mobile numbers
            if (mobile.length !== 10) {
                console.warn(`Skipping invalid mobile: ${parts[1]} for player ${parts[0]}`);
                continue;
            }

            players.push({
                name: parts[0].trim(),
                mobile: mobile,
                city: parts[2].trim().toUpperCase(),
                proficiency: parts[3].trim().toUpperCase(),
                status: normalizeStatus(parts[4])
            });
        }
    }

    return players;
}

/**
 * Generate certificate for a player
 */
async function generateCertificate(playerName, isSelected) {
    try {
        const templatePath = isSelected ? achievementTemplatePath : participationTemplatePath;
        const typeSuffix = isSelected ? 'Achievement' : 'Participation';

        if (!fs.existsSync(templatePath)) {
            console.warn(`Template not found: ${templatePath}`);
            return false;
        }

        const image = sharp(templatePath);
        const metadata = await image.metadata();

        const width = metadata.width;
        const height = metadata.height;

        // Font sizing and positioning from certificateGenerator.ts
        const fontSize = Math.floor(width * 0.045);
        const yPos = Math.floor(height * 0.435);

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
            <text x="50%" y="${yPos}" class="title">${playerName.toUpperCase()}</text>
        </svg>`;

        const buffer = Buffer.from(svgText);

        // Generate filename
        const date = new Date().toISOString().split('T')[0];
        const sanitizedName = playerName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `SSPL_Certificate_${typeSuffix}_${sanitizedName}_${date}.png`;
        const outputPath = path.join(outputDir, filename);

        await image
            .composite([{ input: buffer, top: 0, left: 0 }])
            .toFile(outputPath);

        return true;
    } catch (err) {
        console.error(`Failed to generate certificate for ${playerName}:`, err.message);
        return false;
    }
}

async function main() {
    console.log('========================================');
    console.log('SSPL Trial Data Update - January 2026');
    console.log('========================================\n');

    // 1. Load existing player data
    console.log('Step 1: Loading existing player data...');
    let existingPlayers = [];

    try {
        const fileContent = fs.readFileSync(publicPlayersDataPath, 'utf-8');
        existingPlayers = JSON.parse(fileContent);
        console.log(`   ✓ Loaded ${existingPlayers.length} existing players\n`);
    } catch (e) {
        console.error('   ✗ Error reading Players_Data.json:', e.message);
        return;
    }

    // Create a map for faster lookup (by mobile number)
    const playerMap = new Map();
    for (let i = 0; i < existingPlayers.length; i++) {
        playerMap.set(existingPlayers[i].mobile, i);
    }

    // 2. Parse new trial data
    console.log('Step 2: Parsing new trial data...');
    let newTrialData;

    try {
        const tableData = fs.readFileSync(newDataPath, 'utf-8');
        newTrialData = parseMarkdownTable(tableData);
        console.log(`   ✓ Parsed ${newTrialData.length} players from trial data\n`);
    } catch (e) {
        console.error('   ✗ Error reading trial data:', e.message);
        return;
    }

    // 3. Update or add players (preserving existing data)
    console.log('Step 3: Updating player database...');
    let updatedCount = 0;
    let newCount = 0;
    const processedPlayers = []; // Track for certificate generation

    for (const player of newTrialData) {
        const existingIndex = playerMap.get(player.mobile);

        if (existingIndex !== undefined) {
            // Player exists - update status while preserving other data
            const existing = existingPlayers[existingIndex];

            // Only update if status is different or we have new info
            const statusChanged = existing.status !== player.status;

            if (statusChanged) {
                existing.status = player.status;
                // Optionally update city if not set
                if (!existing.city && player.city) {
                    existing.city = player.city;
                    existing.state = cityStateMap[player.city] || '';
                }
                updatedCount++;
            }

            processedPlayers.push({
                name: existing.name || player.name,
                status: player.status
            });
        } else {
            // New player - add to database
            const newPlayer = {
                name: player.name,
                mobile: player.mobile,
                status: player.status,
                proficiency: player.proficiency || 'N/A',
                city: player.city,
                state: cityStateMap[player.city] || ''
            };

            existingPlayers.push(newPlayer);
            playerMap.set(player.mobile, existingPlayers.length - 1);
            newCount++;

            processedPlayers.push({
                name: player.name,
                status: player.status
            });
        }
    }

    console.log(`   ✓ Updated: ${updatedCount} players`);
    console.log(`   ✓ Added: ${newCount} new players`);
    console.log(`   ✓ Total players now: ${existingPlayers.length}\n`);

    // 4. Save updated JSON files
    console.log('Step 4: Saving updated player data...');

    try {
        // Save to public folder
        fs.writeFileSync(publicPlayersDataPath, JSON.stringify(existingPlayers, null, 2));
        console.log(`   ✓ Saved to: public/Players_Data.json`);

        // Copy to root folder for sync
        fs.writeFileSync(rootPlayersDataPath, JSON.stringify(existingPlayers, null, 2));
        console.log(`   ✓ Synced to: Players Data.json\n`);
    } catch (e) {
        console.error('   ✗ Error saving files:', e.message);
        return;
    }

    // 5. Generate certificates (DISABLED to speed up deployment - frontend generates on demand)
    /*
    console.log('Step 5: Generating certificates...');
    let achievementCerts = 0;
    let participationCerts = 0;
    let failedCerts = 0;
    
    for (const player of processedPlayers) {
        const isSelected = player.status === 'SELECTED';
        const success = await generateCertificate(player.name, isSelected);
        
        if (success) {
            if (isSelected) achievementCerts++;
            else participationCerts++;
        } else {
            failedCerts++;
        }
    }
    
    console.log(`   ✓ Achievement certificates: ${achievementCerts}`);
    console.log(`   ✓ Participation certificates: ${participationCerts}`);
    if (failedCerts > 0) {
        console.log(`   ⚠ Failed: ${failedCerts}`);
    }
    */
    console.log('Step 5: Certificate generation skipped (Client-side generation enabled)');

    console.log('\n========================================');
    console.log('Update Complete!');
    console.log('========================================');
    console.log(`\nSummary:`);
    console.log(`  - Players updated: ${updatedCount}`);
    console.log(`  - Players added: ${newCount}`);
    console.log(`\nCertificates saved to: ${outputDir}`);
}

main().catch(console.error);
