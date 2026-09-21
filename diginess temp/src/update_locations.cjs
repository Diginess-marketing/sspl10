const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

function updateLocations() {
    try {
        // Read the excel file
        const excelPath = 'C:\\Users\\ADMIN\\Downloads\\ONLY 5TH LEVEL SELECTED LIST_UPDATED v1.xlsx';
        const workbook = xlsx.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Read the JSON file
        const jsonPath = path.join(__dirname, 'data', 'selectedPlayers.json');
        let players = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        let updatedCount = 0;

        for (let player of players) {
            // Find the player in excel data by name
            const excelPlayer = data.find(p => p.Name && p.Name.trim().toUpperCase() === player.name.trim().toUpperCase());
            
            if (excelPlayer && excelPlayer.Location) {
                if (player.location !== excelPlayer.Location.trim()) {
                    console.log(`Updating ${player.name}: ${player.location} -> ${excelPlayer.Location.trim()}`);
                    player.location = excelPlayer.Location.trim();
                    updatedCount++;
                }
            } else {
                console.log(`Could not find location for ${player.name} in Excel.`);
            }
        }

        // Write the updated JSON back to the file
        fs.writeFileSync(jsonPath, JSON.stringify(players, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedCount} player locations in selectedPlayers.json.`);

    } catch(e) {
        console.error("Error:", e);
    }
}

updateLocations();
