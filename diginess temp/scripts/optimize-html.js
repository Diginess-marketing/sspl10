/**
 * Post-build HTML optimization script
 * Adds critical CSS, defers scripts, and optimizes loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Critical CSS for above-the-fold content (no hardcoded hero background URLs)
const criticalCSS = `*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:Inter,Poppins,system-ui,sans-serif}body{margin:0;line-height:inherit;background:#fff;color:#111827}#root{min-height:100vh;display:flex;flex-direction:column}:root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--sport-orange:25 100% 50%;--sport-teal:217 91% 35%;--sport-dark:26 31% 10%;--sport-gold:45 100% 55%;--sport-green:142 76% 23%;--sport-white:0 0% 100%}.hero-background{background-attachment:scroll}.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.z-10{z-index:10}.z-20{z-index:20}.flex{display:flex}.hidden{display:none}.items-center{align-items:center}.justify-center{justify-content:center}.w-full{width:100%}.h-full{height:100%}.min-h-screen{min-height:100vh}.overflow-hidden{overflow:hidden}.text-white{color:#fff}.text-center{text-align:center}.font-bold{font-weight:700}.font-black{font-weight:900}.text-5xl{font-size:3rem;line-height:1}.text-6xl{font-size:3.75rem;line-height:1}.drop-shadow-2xl{filter:drop-shadow(0 25px 25px rgb(0 0 0/0.15))}.animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1)infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.from-black\\/10{--tw-gradient-from:rgb(0 0 0/0.1)}.to-black\\/10{--tw-gradient-to:rgb(0 0 0/0.1)}#root:empty::before{content:"Loading...";display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:1.5rem;color:#666}`;

const distDir = path.join(__dirname, '../dist');
const ssgDir = path.join(__dirname, '../dist-ssg');

// Resolve HTML file path with fallbacks (dist -> dist-ssg -> any html in those dirs)
let htmlFilePath = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlFilePath)) {
  const alt = path.join(ssgDir, 'index.html');
  if (fs.existsSync(alt)) {
    htmlFilePath = alt;
  } else {
    // try any .html file inside dist or dist-ssg
    const candidates = [];
    try {
      if (fs.existsSync(distDir)) {
        candidates.push(...fs.readdirSync(distDir).filter(f => f.endsWith('.html')).map(f => path.join(distDir, f)));
      }
      if (fs.existsSync(ssgDir)) {
        candidates.push(...fs.readdirSync(ssgDir).filter(f => f.endsWith('.html')).map(f => path.join(ssgDir, f)));
      }
    } catch (e) {
      // ignore read errors here
    }
    if (candidates.length > 0) {
      htmlFilePath = candidates[0];
    }
  }
}

console.log('🔧 Optimizing HTML for performance...');

try {
  if (!fs.existsSync(htmlFilePath)) {
    throw new Error(`No HTML file found to optimize. Tried: ${path.join(distDir, 'index.html')} and ${path.join(ssgDir, 'index.html')}`);
  }

  let html = fs.readFileSync(htmlFilePath, 'utf-8');
  
  // 1. Inject critical CSS before closing head tag
  if (!html.includes(criticalCSS.substring(0, 50))) {
    html = html.replace(
      '</head>',
      `<style>${criticalCSS}</style>\n</head>`
    );
    console.log('✅ Added critical CSS inline');
  }

  // Ensure canonical Tailwind v4 gradient utility is available inline
  const linearGradientRule = '.bg-linear-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}';
  if (!html.includes(linearGradientRule)) {
    html = html.replace(
      '</head>',
      `<style>${linearGradientRule}</style>\n</head>`
    );
    console.log('✅ Added canonical .bg-linear-to-br inline rule');
  }
  
  // 2. Add defer to Razorpay script
  html = html.replace(
    /<script src="https:\/\/checkout\.razorpay\.com\/v1\/checkout\.js"><\/script>/g,
    '<script defer src="https://checkout.razorpay.com/v1/checkout.js"></script>'
  );
  console.log('✅ Deferred Razorpay script');
  
  // 3. Make CSS load with preload + async pattern  
  html = html.replace(
    /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
    '<link rel="preload" as="style" href="$1"><link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\';this.onload=null"><noscript><link rel="stylesheet" href="$1"></noscript>'
  );
  console.log('✅ Made CSS load asynchronously');
  
  // 4. Add async font loading
  const fontLoading = `
    <!-- Async Font Loading (preload removed to avoid unused-preload warnings) -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700;800&display=swap" media="print" onload="this.media='all';this.onload=null">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700;800&display=swap"></noscript>
`;
  
  if (!html.includes('Async Font Loading')) {
    html = html.replace(/<link rel="stylesheet" crossorigin href="\/assets\/index-[^"]+\.css">/g, (match) => {
      return `${fontLoading}\n    ${match}`;
    });
    console.log('✅ Added async font loading');
  }
  
  // Write optimized HTML back
  fs.writeFileSync(htmlFilePath, html, 'utf-8');
  
  console.log('✅ HTML optimization complete!');
  console.log('📊 Optimizations applied:');
  console.log('  - Critical CSS inlined');
  console.log('  - Scripts deferred');
  console.log('  - CSS loads asynchronously');
  console.log('  - Fonts load asynchronously');
  
} catch (error) {
  console.error('❌ Error optimizing HTML:', error);
  process.exit(1);
}
