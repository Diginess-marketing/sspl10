const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'Players Data.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const players = JSON.parse(rawData);

    const targetMobile = '8220099667';

    // Clean mobile numbers for comparison (remove spaces, etc if needed, though usually they are strings)
    const player = players.find(p => p.mobile && p.mobile.replace(/\D/g, '') === targetMobile);

    if (player) {
        console.log('FOUND:', JSON.stringify(player, null, 2));
    } else {
        console.log('NOT FOUND');
        // search for partial match
        const similar = players.filter(p => p.mobile && p.mobile.includes('8220099'));
        console.log('SIMILAR:', JSON.stringify(similar, null, 2));

        // search for name DEEPAK
        const byName = players.filter(p => p.name && p.name.toUpperCase().includes('DEEPAK'));
        console.log('BY NAME:', JSON.stringify(byName, null, 2));

    }

} catch (err) {
    console.error('Error:', err);
}
