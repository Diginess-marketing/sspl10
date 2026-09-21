import sharp from 'sharp';
const { data, info } = await sharp('mockup/hero-mockup.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, hex = (r,g,b) => '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
const mean = (pts) => { let r=0,g=0,b=0; pts.forEach(([x,y]) => { const i=(y*W+x)*3; r+=data[i]; g+=data[i+1]; b+=data[i+2]; }); return hex(r/pts.length,g/pts.length,b/pts.length); };
const patch = (cx,cy,rad) => { const p=[]; for(let y=cy-rad;y<=cy+rad;y++)for(let x=cx-rad;x<=cx+rad;x++)p.push([x,y]); return p; };
console.log('circle fill  ', mean(patch(42,345,4)), mean(patch(75,372,3)));
// darkest 15% of pixels in headline / tagline / label bboxes = ink colour
const ink = (x0,y0,x1,y1) => { const px=[]; for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*W+x)*3;px.push([data[i]+data[i+1]+data[i+2],i]);} px.sort((a,b)=>a[0]-b[0]); const n=Math.floor(px.length*0.08); let r=0,g=0,b=0; for(let k=0;k<n;k++){const i=px[k][1];r+=data[i];g+=data[i+1];b+=data[i+2];} return hex(r/n,g/n,b/n); };
console.log('headline ink ', ink(26,87,461,137));
console.log('tagline ink  ', ink(32,279,517,296));
console.log('label ink    ', ink(103,353,266,364));
const bl = (x0,y0,x1,y1) => { const px=[]; for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*W+x)*3;px.push([data[i]+data[i+1]+data[i+2],i]);} px.sort((a,b)=>a[0]-b[0]); const n=Math.max(3,Math.floor(px.length*0.15)); let r=0,g=0,b=0; for(let k=0;k<n;k++){const i=px[k][1];r+=data[i];g+=data[i+1];b+=data[i+2];} return hex(r/n,g/n,b/n); };
console.log('arrow blue   ', bl(282,355,328,365));
console.log('sky right edge top/mid/bottom', mean(patch(1338,10,3)), mean(patch(1338,200,3)), mean(patch(1338,440,3)));
console.log('left edge    ', mean(patch(3,30,2)), mean(patch(3,440,2)));
console.log('bottom row   ', mean(patch(300,471,1)), mean(patch(1000,471,1)));
