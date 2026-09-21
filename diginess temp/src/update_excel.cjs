const xlsx = require('xlsx');

function main() {
    try {
        const sourceFile = 'C:\\Users\\ADMIN\\Downloads\\ONLY 5TH LEVEL SELECTED LIST_UPDATED v1.xlsx';
        const targetFile = 'C:\\Users\\ADMIN\\Downloads\\AUCTION SELECTED PLAYERS.xlsx';

        // 1. Read source
        const srcWb = xlsx.readFile(sourceFile);
        const srcData = xlsx.utils.sheet_to_json(srcWb.Sheets[srcWb.SheetNames[0]]);
        
        // Find the players
        const shiek = srcData.find(r => JSON.stringify(r).toUpperCase().includes('SHIEK KHADAR') || JSON.stringify(r).toUpperCase().includes('SHAIK KHADAR'));
        const mustkim = srcData.find(r => JSON.stringify(r).toUpperCase().includes('MUSTKIM BAREZA SINDHI'));

        // 2. Read target
        const tgtWb = xlsx.readFile(targetFile);
        const targetSheetName = 'LIST 1- DIRECT SELECTED PLAYERS';
        const tgtSheet = tgtWb.Sheets[targetSheetName];
        let tgtData = xlsx.utils.sheet_to_json(tgtSheet);

        let shiekFound = false;
        let mustkimFound = false;

        // 3. Update target data
        for (let row of tgtData) {
            const rowStr = JSON.stringify(row).toUpperCase();
            if (rowStr.includes('SHIEK KHADAR') || rowStr.includes('SHAIK KHADAR')) {
                // Delete incorrectly added column
                if ('Mobile No' in row) delete row['Mobile No'];
                
                row['MOBILE NO'] = shiek['Mobile No'];
                row['LOCATION'] = shiek['Location'];
                if ('Location' in row) delete row['Location']; // Clean up
                shiekFound = true;
            }
            if (rowStr.includes('MUSTKIM BAREZA SINDHI')) {
                // Delete incorrectly added column
                if ('Mobile No' in row) delete row['Mobile No'];
                
                row['MOBILE NO'] = mustkim['Mobile No'];
                row['LOCATION'] = mustkim['Location'];
                if ('Location' in row) delete row['Location']; // Clean up
                mustkimFound = true;
            }
        }

        if (shiekFound || mustkimFound) {
            // 4. Write back
            const newSheet = xlsx.utils.json_to_sheet(tgtData);
            tgtWb.Sheets[targetSheetName] = newSheet;
            xlsx.writeFile(tgtWb, targetFile);
            console.log(`Successfully fixed and updated ${targetFile}`);
        }

    } catch (e) {
        console.error(e);
    }
}
main();
