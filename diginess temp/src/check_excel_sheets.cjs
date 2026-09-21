const xlsx = require('xlsx');

function checkFile(filePath) {
    try {
        console.log(`\n--- Checking ${filePath} ---`);
        const workbook = xlsx.readFile(filePath);
        console.log('Sheets:', workbook.SheetNames);
    } catch(e) {
        console.log('Error:', e.message);
    }
}

checkFile('C:\\Users\\ADMIN\\Downloads\\AUCTION SELECTED PLAYERS.xlsx');
checkFile('C:\\Users\\ADMIN\\Downloads\\2ns list for auction.xlsx');
