import fs from 'fs';
import https from 'https';
import path from 'path';

const urls = [
  'https://www.dreamleagueindia.com/assets/img/social-media-F.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-X.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-inst.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-you.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-in.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-share%20chat.png',
  'https://www.dreamleagueindia.com/assets/img/social-media-moj.png',
  'https://www.dreamleagueindia.com/assets/img/home.png',
  'https://www.dreamleagueindia.com/assets/img/person.png'
];

const outDir = path.join(process.cwd(), 'public', 'assets', 'img');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const urlStr of urls) {
  const filename = decodeURIComponent(urlStr.split('/').pop());
  const filePath = path.join(outDir, filename);

  https.get(urlStr, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
      });
    } else {
      console.error(`Failed to download ${urlStr}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${urlStr}: ${err.message}`);
  });
}
