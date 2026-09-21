const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

function updateLocations() {
    try {
        const jsonPath = path.join(__dirname, 'data', 'selectedPlayers.json');
        let players = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        let updatedCount = 0;

        for (let player of players) {
            if (player.name === 'SATISH') {
                if (player.location !== 'TAMILNADU') {
                    console.log(`Updating ${player.name}: ${player.location} -> TAMILNADU`);
                    player.location = 'TAMILNADU';
                    updatedCount++;
                }
            }
        }

        fs.writeFileSync(jsonPath, JSON.stringify(players, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedCount} player locations in selectedPlayers.json.`);

    } catch(e) {
        console.error("Error:", e);
    }
}

updateLocations();
