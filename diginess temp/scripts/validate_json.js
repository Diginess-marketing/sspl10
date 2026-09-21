import fs from 'fs';
try {
    const data = fs.readFileSync('public/Players_Data.json', 'utf8');
    JSON.parse(data);
    console.log('JSON is valid.');
} catch (e) {
    console.error('JSON Error:', e.message);
    process.exit(1);
}
