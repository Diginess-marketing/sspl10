const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

function updateLocations() {
    try {
        const excelPath = 'C:\\Users\\ADMIN\\Downloads\\ONLY 5TH LEVEL SELECTED LIST_UPDATED v1.xlsx';
        const workbook = xlsx.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = xlsx.utils.sheet_to_json(sheet);
        
        const jsonPath = path.join(__dirname, 'data', 'selectedPlayers.json');
        let players = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        let updatedCount = 0;

        for (let player of players) {
            let matchedExcelPlayer = null;

            // Manual overrides for tricky names based on our findings
            let searchName = player.name.trim().toUpperCase();
            if (searchName === 'AJITH' && player.image.includes('ajith-mukunda-bagadi')) {
                searchName = 'AJIT MUKUNDA BAGADI';
            } else if (searchName === 'AJITH' && player.image.includes('g-ajith')) {
                searchName = 'G.AJITH';
            } else if (searchName === 'MOHAMMED ABHI VAKKAS') {
                searchName = 'MOHAMED ABHI VAKKAS';
            } else if (searchName === 'NITHISH KUMAR') {
                searchName = 'NITHISH KUMAR B';
            } else if (searchName === 'VISHNU') {
                searchName = 'VISHNU M U';
            } else if (searchName === 'YUVA') {
                searchName = 'YUVARAJ';
            } else if (searchName === 'SATISH') {
                searchName = 'SATISH V'; // Guessing
            }

            matchedExcelPlayer = excelData.find(e => {
                if(!e.Name) return false;
                const eName = String(e.Name).trim().toUpperCase();
                return eName === searchName || eName.includes(searchName) || searchName.includes(eName);
            });

            if (matchedExcelPlayer && matchedExcelPlayer.Location) {
                const newLoc = String(matchedExcelPlayer.Location).trim();
                if (player.location !== newLoc) {
                    console.log(`Updating ${player.name}: ${player.location} -> ${newLoc}`);
                    player.location = newLoc;
                    updatedCount++;
                }
            } else {
                console.log(`Could not find Excel match for JSON player: ${player.name} (searched for ${searchName})`);
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
