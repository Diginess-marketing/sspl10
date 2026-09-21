import fs from 'fs';

try {
    const data = JSON.parse(fs.readFileSync('public/Players Data.json', 'utf8'));
    console.log('Total players:', data.length);

    // Find all occurrences of the two players
    const player1 = data.filter(p => p.mobile === '7204139143');
    const player2 = data.filter(p => p.mobile === '9524262728');

    console.log('\n=== Player 7204139143 (MITHUN JADAV) ===');
    console.log('Found:', player1.length, 'times');
    player1.forEach((p, i) => {
        console.log(`  [${i + 1}] Name: ${p.name}, Status: ${p.status}`);
    });

    console.log('\n=== Player 9524262728 (ARIVAZHAGAN MURUGESAN) ===');
    console.log('Found:', player2.length, 'times');
    player2.forEach((p, i) => {
        console.log(`  [${i + 1}] Name: ${p.name}, Status: ${p.status}`);
    });

    process.exit(0);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
