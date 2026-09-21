const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('public/Players Data.json', 'utf8'));
    console.log('✓ JSON is valid!');
    console.log('Total players:', data.length);

    const newPlayers = data.filter(p =>
        ['9032311982', '7204139143', '9524262728'].includes(p.mobile)
    );

    console.log('\nNew players found:', newPlayers.length);
    newPlayers.forEach(p => {
        console.log(`- ${p.name} (${p.mobile}): ${p.status}`);
    });

    process.exit(0);
} catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
}
