/**
 * Verify Integrity Script
 * Checks if all players from input markdown files are present in the JSON database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const publicPlayersDataPath = path.join(__dirname, '../public/Players_Data.json');
const batch1Path = path.join(__dirname, 'new_trial_data_2026.md');
const batch2Path = path.join(__dirname, 'new_trial_data_2026_batch2.md');
const missingPath = path.join(__dirname, 'temp_missing.md');

// Helper to normalize mobile
function normalizeMobile(mobile) {
    let cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length > 10 && cleaned.startsWith('91')) {
        cleaned = cleaned.substring(2);
    }
    return cleaned;
}

// Helper to parse markdown
function parseMarkdownTable(content) {
    const lines = content.split('\n');
    const players = [];
    for (const line of lines) {
        if (!line.trim().startsWith('|')) continue;
        if (line.includes('---')) continue;
        if (line.toUpperCase().includes('| NAME |')) continue;

        const parts = line.split('|').map(s => s.trim()).filter(s => s);
        if (parts.length >= 2) {
            const mobile = normalizeMobile(parts[1]);
            players.push({
                name: parts[0].trim(),
                mobile: mobile,
                originalLine: line
            });
        }
    }
    return players;
}

function verify() {
    console.log('Starting Verification...');

    // Load Database
    const db = JSON.parse(fs.readFileSync(publicPlayersDataPath, 'utf-8'));
    const dbMap = new Map();
    db.forEach(p => dbMap.set(p.mobile, p));

    console.log(`Database Size: ${db.length}`);

    // Load Inputs
    const files = [batch1Path, batch2Path, missingPath];
    let totalInput = 0;
    let missing = [];
    let mismatched = [];

    files.forEach(f => {
        if (fs.existsSync(f)) {
            const content = fs.readFileSync(f, 'utf-8');
            const players = parseMarkdownTable(content);
            totalInput += players.length;

            players.forEach(p => {
                const found = dbMap.get(p.mobile);
                if (!found) {
                    missing.push(p);
                } else {
                    // Optional: Check name mismatch warnings?
                    // normalize names for comparison
                    const dbName = found.name.toLowerCase().replace(/\s+/g, '');
                    const inputName = p.name.toLowerCase().replace(/\s+/g, '');
                    if (dbName !== inputName && !dbName.includes(inputName) && !inputName.includes(dbName)) {
                        // Just a warning, usually ignore minor spelling diffs
                        // mismatched.push({ input: p, db: found });
                    }
                }
            });
        }
    });

    console.log(`Total Input Records: ${totalInput}`);
    console.log(`Missing Records: ${missing.length}`);

    if (missing.length > 0) {
        console.log('\nMISSING PLAYERS DETECTED:');
        missing.forEach(m => console.log(`- ${m.name} (${m.mobile})`));

        // Generate a recovery markdown file
        const recoveryContent = `
# Recovery Batch
| NAME | MOBILE | CITY | PROFICIENCY | STATUS |
| --- | --- | --- | --- | --- |
` + missing.map(m => {
            // Extract details from original line (hacky but works since we have the line)
            // We need to parse the original line parts again to get all fields
            const parts = m.originalLine.split('|').map(s => s.trim()).filter(s => s);
            // Reconstruct row
            return `| ${parts[0]} | ${parts[1]} | ${parts[2] || ''} | ${parts[3] || ''} | ${parts[4] || ''} |`;
        }).join('\n');

        fs.writeFileSync(path.join(__dirname, 'recovery_batch.md'), recoveryContent);
        console.log('\nCreated scripts/recovery_batch.md with missing players.');
    } else {
        console.log('\nAll players are present in the database! ✅');
    }
}

verify();
