import fs from 'fs';

try {
    const data = JSON.parse(fs.readFileSync('public/Players Data.json', 'utf8'));

    console.log('='.repeat(60));
    console.log('FINAL VERIFICATION - All Three Players');
    console.log('='.repeat(60));
    console.log('Total players in database:', data.length);
    console.log('');

    const targetPlayers = [
        { mobile: '9032311982', name: 'BAGANA LEELA KRISHNA' },
        { mobile: '7204139143', name: 'MITHUN JADAV' },
        { mobile: '9524262728', name: 'ARIVAZHAGAN MURUGESAN' }
    ];

    targetPlayers.forEach((target, i) => {
        const found = data.filter(p => p.mobile === target.mobile);
        console.log(`${i + 1}. ${target.name}`);
        console.log(`   Mobile: ${target.mobile}`);
        console.log(`   Found: ${found.length} entry/entries`);

        if (found.length === 0) {
            console.log('   ❌ ERROR: Player not found!');
        } else if (found.length > 1) {
            console.log('   ⚠️  WARNING: Duplicate entries found!');
            found.forEach((p, idx) => {
                console.log(`      [${idx + 1}] Status: ${p.status}`);
            });
        } else {
            const player = found[0];
            if (player.status === 'SELECTED') {
                console.log(`   ✅ Status: ${player.status}`);
                console.log(`   ✅ Proficiency: ${player.proficiency}`);
                console.log(`   ✅ Can download Achievement Certificate`);
            } else {
                console.log(`   ❌ ERROR: Status is "${player.status}" (should be "SELECTED")`);
            }
        }
        console.log('');
    });

    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const allCorrect = targetPlayers.every(target => {
        const found = data.filter(p => p.mobile === target.mobile);
        return found.length === 1 && found[0].status === 'SELECTED';
    });

    if (allCorrect) {
        console.log('✅ All three players are correctly configured!');
        console.log('✅ Each player has exactly ONE entry with SELECTED status');
        console.log('✅ Certificate download functionality is ready');
    } else {
        console.log('❌ Some issues found - please review above');
    }

} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
