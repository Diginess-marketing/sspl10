import fs from 'fs';
import path from 'path';

const filePaths = [
    String.raw`C:\Users\ADMIN\Desktop\Level 1 Trials\Level 2\CHN L2.md`,
    String.raw`C:\Users\ADMIN\Desktop\Level 1 Trials\Level 2\CMBT L2.md`,
    String.raw`C:\Users\ADMIN\Desktop\Level 1 Trials\Level 2\Luck L2.md`,
    String.raw`C:\Users\ADMIN\Desktop\Level 1 Trials\Level 2\Mum L2.md`,
    String.raw`C:\Users\ADMIN\Desktop\Level 1 Trials\Level 2\Pune L2.md`
];

interface Level2Player {
    name: string;
    mobile: string;
    proficiency: string;
    score: string;
    remarks: string;
    listName: string;
}

const parseFile = (filePath: string): Level2Player[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const players: Level2Player[] = [];
    const listName = path.basename(filePath).replace('.md', '');

    // Skip header and separator lines
    let startProcessing = false;

    for (const line of lines) {
        if (line.includes('|-')) {
            startProcessing = true;
            continue;
        }
        if (!startProcessing || !line.trim().startsWith('|')) continue;

        const parts = line.split('|').map(p => p.trim());
        // Markdown table split results in empty strings at start/end
        // | Name | Mobile | ... |
        // ["", "Name", "Mobile", ..., ""]

        if (parts.length < 5) continue;

        // Column mapping varies slightly by file, need to be careful
        // CHN: Name, Mobile, UniqueID, Proficiency, Score, Remarks
        // CMBT: Name, Mobile, Proficiency, Score, Remarks
        // Luck: Name, Contact, Proficiency, Marks, Remarks
        // Mum: Name, Phone, Proficiency, Marks, Remarks
        // Pune: Name, Mobile, Proficiency, Marks, Remarks

        let name = '';
        let mobile = '';
        let proficiency = '';
        let score = '';
        let remarks = '';

        if (filePath.includes('CHN')) {
            // | PLAYER NAME | CONTACT NUMBER | UNIQUE ID | PROFICIENCY | SCORE | REMARKS |
            // 1, 2, 3, 4, 5, 6
            name = parts[1];
            mobile = parts[2];
            // parts[3] is Unique ID (empty mostly)
            proficiency = parts[4];
            score = parts[5];
            remarks = parts[6];
        } else {
            // General format: Name, Mobile, Proficiency, Score/Marks, Remarks
            name = parts[1];
            mobile = parts[2];
            proficiency = parts[3];
            score = parts[4];
            remarks = parts[5];
        }

        // Clean up mobile numbers
        // Remove spaces, +91, hyphens
        let cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length > 10 && cleanMobile.startsWith('91')) {
            cleanMobile = cleanMobile.substring(cleanMobile.length - 10);
        }
        // If it starts with 0 and is 11 digits, take last 10
        if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
            cleanMobile = cleanMobile.substring(1);
        }

        if (cleanMobile.length === 10) {
            players.push({
                name,
                mobile: cleanMobile,
                proficiency,
                score,
                remarks,
                listName
            });
        } else if (cleanMobile.length > 0) {
            console.log(`Warning: Invalid mobile ${mobile} -> ${cleanMobile} for ${name} in ${listName}`);
            players.push({
                name,
                mobile: cleanMobile, // Keep it anyway, maybe partial match or manual fix needed
                proficiency,
                score,
                remarks,
                listName
            });
        }
    }
    return players;
};

const allPlayers: Level2Player[] = [];

filePaths.forEach(fp => {
    try {
        const p = parseFile(fp);
        allPlayers.push(...p);
        console.log(`Parsed ${p.length} records from ${path.basename(fp)}`);
    } catch (e) {
        console.error(`Error parsing ${fp}:`, e);
    }
});

// Output TS file content
const tsContent = `export interface Level2PlayerData {
    name: string;
    mobile: string;
    proficiency: string;
    score: string;
    remarks: string;
    listName: string;
}

export const LEVEL_2_DATA: Level2PlayerData[] = ${JSON.stringify(allPlayers, null, 2)};
`;

fs.writeFileSync('level2Data_generated.ts', tsContent);
console.log(`Generated level2Data_generated.ts with ${allPlayers.length} records.`);
