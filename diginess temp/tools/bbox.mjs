import sharp from 'sharp';
const { data, info } = await sharp('mockup/hero-mockup.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const bbox = (x0,y0,x1,y1,pred) => { let a=1e9,b=1e9,c=-1,d=-1,n=0; for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*W+x)*3;if(pred(data[i],data[i+1],data[i+2])){n++;if(x<a)a=x;if(x>c)c=x;if(y<b)b=y;if(y>d)d=y;}} return {x0:a,y0:b,x1:c,y1:d,w:c-a+1,h:d-b+1,n}; };
const navy=(r,g,b)=>r<95&&g<105&&b<170&&b>r+8;
const blue=(r,g,b)=>b>170&&r<110&&g<150&&b-r>90;
console.log('circle', bbox(20,320,92,400,navy));
console.log('label ', bbox(95,340,290,385,navy));
console.log('arrow ', bbox(270,340,345,385,blue));
console.log('tagline', bbox(20,270,540,304,navy));
console.log('headline', bbox(15,80,480,145,navy));
// headline per-letter-column baseline: bottom-most navy pixel in vertical slabs -> tilt
for (const [xa,xb] of [[26,50],[120,150],[250,280],[380,410],[440,461]]) { const b=bbox(xa,80,xb,145,navy); console.log('slab',xa,xb,'top',b.y0,'bottom',b.y1); }
// 'H' of tagline (INDIA) cap height: first letter I column
console.log('tag I', bbox(33,270,38,304,navy));
console.log('label W', bbox(95,340,118,385,navy));
