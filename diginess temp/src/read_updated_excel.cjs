const xlsx = require('xlsx');

try {
    const workbook = xlsx.readFile('C:\\Users\\ADMIN\\Downloads\\ONLY 5TH LEVEL SELECTED LIST_UPDATED v1.xlsx');
    const sheetNames = workbook.SheetNames;
    console.log('Sheet Names:', sheetNames);

    for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(`\n--- Sheet: ${sheetName} (Total Rows: ${data.length}) ---`);
        console.log('First few rows:');
        console.log(data.slice(0, 3));
        
        // Let's specifically look for SHIEK KHADAR and MUSTKIM BAREZA SINDHI
        const found = data.filter(row => {
            const str = JSON.stringify(row).toUpperCase();
            return str.includes('SHIEK KHADAR') || str.includes('SHAIK KHADAR') || str.includes('MUSTKIM') || str.includes('BAREZA') || str.includes('SINDHI');
        });
        if (found.length > 0) {
            console.log('\nFound specific players in this sheet:');
            console.log(found);
        }
    }
} catch (e) {
    console.error('Error reading excel:', e.message);
}
