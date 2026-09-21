import fs from 'fs';

try {
    const data = JSON.parse(fs.readFileSync('public/Players Data.json', 'utf8'));

    // Find all occurrences
    const player1All = [];
    const player2All = [];

    data.forEach((p, index) => {
        if (p.mobile === '7204139143') {
            player1All.push({ index, ...p });
        }
        if (p.mobile === '9524262728') {
            player2All.push({ index, ...p });
        }
    });

    console.log('Player 7204139143:', player1All.length, 'entries');
    player1All.forEach(p => {
        console.log(JSON.stringify({ index: p.index, name: p.name, status: p.status }));
    });

    console.log('\nPlayer 9524262728:', player2All.length, 'entries');
    player2All.forEach(p => {
        console.log(JSON.stringify({ index: p.index, name: p.name, status: p.status }));
    });

} catch (error) {
    console.error('Error:', error.message);
}
