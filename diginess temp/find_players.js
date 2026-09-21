const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'Players Data.json');
console.log('Reading file from:', filePath);

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const players = JSON.parse(data);

    const targets = [
        { type: 'mobile', value: '9940513638' }, // Rockson (wrong)
        { type: 'mobile', value: '9940513628' }, // Rockson (correct - maybe already there?)
        { type: 'mobile', value: '9150760149' }, // Saran.S
        { type: 'mobile', value: '9005069369' }, // Aman Yadav
        { type: 'mobile', value: '9491682365' }, // NAGARAJU
        { type: 'mobile', value: '9833608952' }, // VIVEK
        { type: 'mobile', value: '9342768415' }, // DINESH
        { type: 'name', value: 'Rockson' },
        { type: 'name', value: 'Saran' },
        { type: 'name', value: 'Aman' },
        { type: 'name', value: 'Vivek' },
        { type: 'name', value: 'Dinesh' }
    ];

    console.log(`Searching ${players.length} players...`);

    const foundIndices = new Set();

    targets.forEach(target => {
        players.forEach((p, index) => {
            let match = false;
            if (target.type === 'mobile' && p.mobile && String(p.mobile).includes(target.value)) {
                match = true;
            } else if (target.type === 'name' && p.name && p.name.toLowerCase().includes(target.value.toLowerCase())) {
                match = true;
            }

            if (match) {
                console.log(`Found match for ${target.value}: Index ${index}`);
                console.log(JSON.stringify(p, null, 2));
                foundIndices.add(index);
            }
        });
    });

    if (foundIndices.size === 0) {
        console.log('No matches found.');
    }

} catch (err) {
    console.error('Error:', err);
}
