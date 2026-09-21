import fs from 'fs';

try {
    const data = JSON.parse(fs.readFileSync('public/Players Data.json', 'utf8'));
    console.log('Original player count:', data.length);

    // Remove the NOT SELECTED duplicates
    // We need to remove indices 359 and 850
    // But we need to be careful about the order - remove from highest to lowest index
    const indicesToRemove = [850, 359]; // Sorted in descending order

    let filteredData = [...data];

    indicesToRemove.forEach(index => {
        const player = filteredData[index];
        console.log(`Removing index ${index}: ${player.name} (${player.mobile}) - ${player.status}`);
        filteredData.splice(index, 1);
    });

    console.log('New player count:', filteredData.length);

    // Write back to file
    fs.writeFileSync('public/Players Data.json', JSON.stringify(filteredData, null, 2), 'utf8');
    console.log('✓ File updated successfully!');

    // Verify the changes
    const player1 = filteredData.filter(p => p.mobile === '7204139143');
    const player2 = filteredData.filter(p => p.mobile === '9524262728');

    console.log('\nVerification:');
    console.log('Player 7204139143:', player1.length, 'entries');
    player1.forEach(p => console.log(`  - ${p.name}: ${p.status}`));

    console.log('Player 9524262728:', player2.length, 'entries');
    player2.forEach(p => console.log(`  - ${p.name}: ${p.status}`));

} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
