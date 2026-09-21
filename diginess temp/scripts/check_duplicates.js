import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersDataPath = path.join(__dirname, '../Players Data.json');

try {
    const data = fs.readFileSync(playersDataPath, 'utf8');
    const players = JSON.parse(data);

    const mobileCounts = {};
    const mobileDetails = {};

    players.forEach((p, index) => {
        const mobile = p.mobile ? p.mobile.toString().trim() : 'UNKNOWN';
        if (mobile === 'UNKNOWN' || mobile === '') return;

        if (!mobileCounts[mobile]) {
            mobileCounts[mobile] = 0;
            mobileDetails[mobile] = [];
        }
        mobileCounts[mobile]++;
        mobileDetails[mobile].push({
            index: index,
            name: p.name,
            status: p.status,
            city: p.city
        });
    });

    const duplicates = Object.keys(mobileCounts).filter(m => mobileCounts[m] > 1);

    const report = {
        totalPlayers: players.length,
        totalUnique: Object.keys(mobileCounts).length,
        duplicateCount: duplicates.length,
        duplicates: duplicates.map(m => ({
            mobile: m,
            count: mobileCounts[m],
            details: mobileDetails[m]
        }))
    };

    fs.writeFileSync(path.join(__dirname, 'duplicates_report.json'), JSON.stringify(report, null, 2));
    console.log('Report saved to duplicates_report.json');

} catch (err) {
    console.error('Error reading file:', err);
}
