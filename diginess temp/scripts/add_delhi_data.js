import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Delhi data
const delhiData = JSON.parse(
    fs.readFileSync('C:\\Users\\ADMIN\\Downloads\\CONSOLIDATED DELHI RESULTS.json', 'utf-8')
);

console.log(`Loaded ${delhiData.length} Delhi players`);

// === 1. Generate Players_Data.json entries (Level 1) ===
const playersJsonPath = path.join(__dirname, '..', 'public', 'Players_Data.json');
const existingPlayers = JSON.parse(fs.readFileSync(playersJsonPath, 'utf-8'));

// Check for duplicates by mobile
const existingMobiles = new Set(existingPlayers.map(p => p.mobile.replace(/\D/g, '').slice(-10)));

const newPlayers = [];
const l2Entries = [];
const l3Entries = [];

for (const player of delhiData) {
    const mobile = player['MOBILE NUMBER'].replace(/\D/g, '').slice(-10);
    const name = player['NAME'].trim();
    const proficiency = player['PROFICIENCY'];
    const marks = player['MARKS'];
    const remarks = player['REMARKS'];
    const level1 = player['LEVEL1'];
    const level2 = player['LEVEL2'];
    const level3 = player['LEVEL3'];

    // Skip if already exists
    if (existingMobiles.has(mobile)) {
        console.log(`⚠️  Skipping duplicate mobile: ${mobile} (${name})`);
        continue;
    }

    // Level 1 entry for Players_Data.json
    const status = level1 === 'SELECTED' ? 'SELECTED' : 'NOT SELECTED';
    newPlayers.push({
        mobile,
        state: 'Delhi',
        name,
        proficiency,
        status
    });

    // Level 2 entry (only if not #N/A)
    if (level2 && level2 !== '#N/A') {
        const l2Remarks = level2 === 'SELECTED' ? 'GOOD' : 'AVERAGE';
        l2Entries.push({
            name,
            mobile,
            proficiency,
            score: marks,
            remarks: l2Remarks,
            listName: 'CONSOLIDATED DELHI L2'
        });
    }

    // Level 3 entry (only if not #N/A)
    if (level3 && level3 !== '#N/A') {
        const l3Remarks = level3 === 'SELECTED' ? 'GOOD' : 'AVERAGE';
        l3Entries.push({
            name,
            mobile,
            proficiency,
            score: marks,
            remarks: l3Remarks,
            listName: 'CONSOLIDATED DELHI L3'
        });
    }
}

console.log(`\n📊 Summary:`);
console.log(`  New Level 1 entries: ${newPlayers.length}`);
console.log(`  New Level 2 entries: ${l2Entries.length}`);
console.log(`  New Level 3 entries: ${l3Entries.length}`);

// === Write Players_Data.json ===
const updatedPlayers = [...existingPlayers, ...newPlayers];
fs.writeFileSync(playersJsonPath, JSON.stringify(updatedPlayers, null, 2));
console.log(`\n✅ Updated Players_Data.json: ${existingPlayers.length} → ${updatedPlayers.length} entries`);

// === Generate level2Data.ts entries ===
const l2Lines = l2Entries.map(e =>
    `    { "name": "${e.name}", "mobile": "${e.mobile}", "proficiency": "${e.proficiency}", "score": "${e.score}", "remarks": "${e.remarks}", "listName": "${e.listName}" },`
).join('\n');

// === Generate level3Data.ts entries ===
const l3Lines = l3Entries.map(e =>
    `    { "name": "${e.name}", "mobile": "${e.mobile}", "proficiency": "${e.proficiency}", "score": "${e.score}", "remarks": "${e.remarks}", "listName": "${e.listName}" },`
).join('\n');

// Write the generated lines to temp files
fs.writeFileSync(path.join(__dirname, 'delhi_l2_entries.txt'), l2Lines);
fs.writeFileSync(path.join(__dirname, 'delhi_l3_entries.txt'), l3Lines);

console.log(`\n📝 Level 2 entries written to scripts/delhi_l2_entries.txt`);
console.log(`📝 Level 3 entries written to scripts/delhi_l3_entries.txt`);
