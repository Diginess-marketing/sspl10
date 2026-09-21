import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersDataPath = path.join(__dirname, '../Players Data.json');

// Raw markdown table data provided by the user
const rawTableData = `
| 47        | LAKSHMANAN             | 6381818369 | SELECTED |   |
| 48        | KARTHIKEYAN            | 9629195349 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 49        | SANTHOSH               | 8220037457 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 50        | RAVISHANKAR            | 8789912170 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 51        | GOPINATH               | 7695863439 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 52        | ARUNKUMAR              | 9791435682 | SELECTED |   |
| 53        | DEEPAK                 | 8220099667 | SELECTED |   |
| 54        | RAJKUMAR               | 8754238212 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 55        | PREM. S                | 8072604479 | SELECTED |   |
| 56        | SHAH REHMAN            | 7012710759 | SELECTED |   |
| 57        | SAMEER AHAMED          | 8248209897 | SELECTED |   |
| 58        | Dharshan               | 9600488768 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 59        | Riaz Ahamed K          | 9944453777 | SELECTED |   |
| 60        | BALAJI.J               | 7871830718 | SELECTED |   |
| 61        | Visakan M              | 7339584041 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 62        | A.venkatesan           | 9344446425 | SELECTED |   |
| 63        | M Bill Clinton         | 9003504450 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 64        | Govindaraj c           | 8056055463 | SELECTED |   |
| 65        | Karthick.C C           | 9080770700 | SELECTED |   |
| 66        | A.elyas                | 8072617548 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 67        | M SANJEEVI KUMAR       | 7708274246 | SELECTED |   |
| 68        | S.Thirupathiraja       | 9943310037 | SELECTED |   |
| 69        | Udhaya Muthusamy       | 9500465540 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 70        | SRIRAM RAJU            | 9578202580 | SELECTED |   |
| 71        | SREERAM                | 8248086846 | SELECTED |   |
| 72        | Vinoth Kumar k         | 9487430121 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 73        | Imran Khan             | 9952680478 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 74        | m rajeshkumar          | 9789818016 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 75        | S.Dheepak              | 9789178789 | SELECTED |   |
| 76        | Santharkumar           | 7094775572 | SELECTED |   |
| 77        | K.KAMALRAJ             | 8838869329 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 78        | P.ALAGURAJA            | 9600301390 | SELECTED |   |
| 79        | Purandara              | 9789781704 | SELECTED |   |
| 80        | Yokesh.S               | 7550379470 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 81        | S.WINSTON              |            |          |   |
| CHURCHILL | 8838278160             | SELECTED   |          |   |
| 82        | Thirupathi k           | 8248301856 | SELECTED |   |
| 83        | SHANKAR J              | 9944449577 | SELECTED |   |
| 84        | Y. Sree anish          | 6385540152 | SELECTED |   |
| 85        | Samji                  | 6385913642 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 86        | Ligindhan. A           | 9361431607 | SELECTED |   |
| 87        | Loganathan Gurumoorthi | 8637659831 | SELECTED |   |
| 88        | Ragul                  | 9894637808 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 89        | Hariharan              | 8883611368 | SELECTED |   |
| 90        | Manoranjith            | 9087296679 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 91        | MUNIYANDI RAHUL        | 8939127109 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 92        | S. MURALIDHARAN        | 9600879247 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 93        | B. PRASANNA            |            |          |   |
| KRISHNAN  | 6383446103             | SELECTED   |          |   |
| 94        | M. LAKSHY              | 9092542845 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 95        | M.MOHAMMED ASIF        | 6380892910 | SELECTED |   |
| 96        | M C GOPALA KRISHNA     | 8825408798 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 97        | S. PRASANTH            | 9865449559 | SELECTED |   |
| 98        | A. MUFITH              | 9786790375 | SELECTED |   |
| 99        | SURESH KANNAN          | 8838059445 | SELECTED |   |
| 100       | MOHAMMED JILAN         | 7795748426 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 101       | VENKATACHALAPATHI      | 9944312886 | SELECTED |   |
| 102       | MOHAMMED RAHEEL        | 9597922390 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 103       | M.DHINESH KUMAR        | 9489952681 | SELECTED |   |
| 104       | M.YUVARAJ              | 9344831870 | SELECTED |   |
| 105       | K.SARAVANAN            | 9345669508 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 106       | S.SIVANESAN            | 8220682567 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 107       | R.P. BALAMURUGAN       | 9965146895 | NOT      |   |
| SELECTED  |                        |            |          |   |
| 108       | K.SARANRAJ             | 9585829864 | SELECTED |   |
| 109       | SYED AHMED             | 7904275465 | SELECTED |   |
`;

function parseTableData(raw) {
    let lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let players = [];
    let currentRecord = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.match(/^\|-+\|/)) continue;

        let parts = line.split('|').map(p => p.trim());
        if (parts[0] === '') parts.shift();
        if (parts[parts.length - 1] === '') parts.pop();

        let idMatch = parts[0]?.match(/^\d+$/);

        if (idMatch) {
            if (currentRecord) {
                players.push(currentRecord);
            }

            currentRecord = {
                id: parts[0],
                name: parts[1] || '',
                mobile: parts[2] || '',
                status: parts[3] || ''
            };
        } else {
            if (!currentRecord) continue;
            if (parts[1]) currentRecord.name += ' ' + parts[1];
            if (parts[2]) currentRecord.mobile += parts[2];
            if (parts[3]) currentRecord.status += ' ' + parts[3];
        }
    }
    if (currentRecord) players.push(currentRecord);

    return players.map(p => {
        let name = p.name.replace(/\s+/g, ' ').trim();
        let mobile = p.mobile.replace(/\s+/g, '').trim();
        let status = p.status.replace(/\s+/g, ' ').trim();

        return {
            name: name,
            mobile: mobile,
            status: status,
            proficiency: "N/A",
            city: "Trichy & Coimbatore",
            state: "Tamil Nadu"
        };
    });
}

const newPlayers = parseTableData(rawTableData);

console.log(`Parsed ${newPlayers.length} new players.`);

try {
    const data = fs.readFileSync(playersDataPath, 'utf8');
    const json = JSON.parse(data);

    const uniqueNewPlayers = [];
    const seenMobiles = new Set();

    newPlayers.forEach(p => {
        if (!seenMobiles.has(p.mobile)) {
            uniqueNewPlayers.push(p);
            seenMobiles.add(p.mobile);
        } else {
            console.log(`Duplicate in new set skipped: ${p.name} (${p.mobile})`);
        }
    });

    const updatedData = [...json, ...uniqueNewPlayers];

    fs.writeFileSync(playersDataPath, JSON.stringify(updatedData, null, 2));
    console.log('Successfully updated Players Data.json');

} catch (err) {
    console.error('Error updating file:', err);
}
