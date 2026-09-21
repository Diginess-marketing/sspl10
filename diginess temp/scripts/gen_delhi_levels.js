import fs from 'fs';

const delhiData = JSON.parse(
    fs.readFileSync('C:\\Users\\ADMIN\\Downloads\\CONSOLIDATED DELHI RESULTS.json', 'utf-8')
);

const l2 = [];
const l3 = [];

for (const p of delhiData) {
    const mobile = p['MOBILE NUMBER'].replace(/\D/g, '').slice(-10);
    const name = p['NAME'].trim();
    const proficiency = p['PROFICIENCY'];
    const marks = p['MARKS'];
    const lv2 = p['LEVEL2'];
    const lv3 = p['LEVEL3'];

    if (lv2 && lv2 !== '#N/A') {
        l2.push({ name, mobile, proficiency, score: marks, remarks: lv2 === 'SELECTED' ? 'GOOD' : 'AVERAGE', listName: 'CONSOLIDATED DELHI L2' });
    }
    if (lv3 && lv3 !== '#N/A') {
        l3.push({ name, mobile, proficiency, score: marks, remarks: lv3 === 'SELECTED' ? 'GOOD' : 'AVERAGE', listName: 'CONSOLIDATED DELHI L3' });
    }
}

const l2Lines = l2.map(e =>
    `    { "name": "${e.name}", "mobile": "${e.mobile}", "proficiency": "${e.proficiency}", "score": "${e.score}", "remarks": "${e.remarks}", "listName": "${e.listName}" },`
).join('\n');

const l3Lines = l3.map(e =>
    `    { "name": "${e.name}", "mobile": "${e.mobile}", "proficiency": "${e.proficiency}", "score": "${e.score}", "remarks": "${e.remarks}", "listName": "${e.listName}" },`
).join('\n');

fs.writeFileSync('scripts/delhi_l2_entries.txt', l2Lines);
fs.writeFileSync('scripts/delhi_l3_entries.txt', l3Lines);
console.log(`L2: ${l2.length} entries, L3: ${l3.length} entries`);
