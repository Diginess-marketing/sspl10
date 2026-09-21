import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const files = globSync('src/components/**/*.tsx', { cwd: process.cwd() });
let replacedCount = 0;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('https://www.dreamleagueindia.com/assets/img/')) {
    const newContent = content.replace(/https:\/\/www\.dreamleagueindia\.com\/assets\/img\//g, '/assets/img/');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Replaced in ${file}`);
    replacedCount++;
  }
}
console.log(`Replacement complete. Modified ${replacedCount} files.`);
