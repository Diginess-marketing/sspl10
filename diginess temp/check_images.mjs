import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const publicDir = path.join(process.cwd(), 'public');

function scanDir(dir, ext) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDir(fullPath, ext));
        } else if (fullPath.endsWith(ext)) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = scanDir(srcDir, '.tsx');
const images = new Set();
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /src=['`"]([^'`"]+)['`"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        images.add(match[1]);
    }
});

images.forEach(img => {
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('{')) return;
    
    let imgPath = img.split('?')[0].split('#')[0];
    
    if (imgPath.startsWith('/')) {
        const fullPath = path.join(publicDir, imgPath);
        if (!fs.existsSync(fullPath)) {
            console.log('Missing public file:', img);
        }
    }
});
