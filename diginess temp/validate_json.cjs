const fs = require('fs');
try {
    const content = fs.readFileSync('d:/ssplt10.cloud-prod-sync-20251006/httpdocs/admin/react-app/src/Players_Data.json', 'utf8');
    JSON.parse(content);
    console.log('JSON is valid');
} catch (e) {
    console.error('JSON is invalid:', e.message);
}
