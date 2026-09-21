/**
 * Simple Static Site Generation (SSG) for SSPL T10 Website
 * Uses existing dependencies to generate static HTML for SEO
 */

import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to prerender for SEO
const ROUTES_TO_PRERENDER = [
  '/',
  '/register',
  '/about-us',
  '/how-it-works',
  '/enquiry',
  '/terms-and-conditions',
  '/privacy-policy',
  '/gallery'
];

class SimpleSSG {
  constructor() {
    this.baseUrl = 'http://localhost:4173'; // Vite dev server
    this.outputDir = path.join(process.cwd(), 'dist-ssg');
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`✅ Created SSG output directory: ${this.outputDir}`);
    }
  }

  async prerenderRoute(route) {
    const url = `${this.baseUrl}${route}`;
    console.log(`📄 Rendering ${route}...`);
    
    try {
      // Fetch the rendered HTML from the running dev server
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SSG-Bot/1.0 (Static Site Generator)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let html = await response.text();
      
      // Enhance the HTML for SEO
      const $ = cheerio.load(html);
      
      // Add prerendering meta tag
      $('head').prepend('<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">');
      
      // Ensure proper title and meta description
      if ($('title').length === 0) {
        $('head').append('<title>SSPL T10 Cricket League - Ultimate Tournament Platform</title>');
      }
      
      // Add JSON-LD structured data for better SEO
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": "SSPL T10 Cricket League 2025",
        "description": "Ultimate T10 tennis ball cricket tournament with professional players",
        "url": `https://www.ssplt10.co.in${route}`,
        "startDate": "2025-11-15",
        "endDate": "2025-12-31",
        "eventStatus": "EventScheduled",
        "sport": "Cricket",
        "organizer": {
          "@type": "Organization",
          "name": "SSPL T10 Cricket League",
          "url": "https://www.ssplt10.co.in"
        }
      };
      
      $('head').append(`<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`);
      
      // Save the enhanced HTML file
      const fileName = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
      const filePath = path.join(this.outputDir, fileName);
      
      await fs.writeFile(filePath, $.html(), 'utf8');
      console.log(`✅ Generated: ${filePath}`);
      
      return { route, status: 'success', fileName };
    } catch (error) {
      console.error(`❌ Failed to render ${route}:`, error.message);
      
      // Create a fallback HTML file
      await this.createFallbackHtml(route);
      return { route, status: 'fallback', error: error.message };
    }
  }

  async createFallbackHtml(route) {
    const fileName = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
    const filePath = path.join(this.outputDir, fileName);
    
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSPL T10 Cricket League - ${route === '/' ? 'Home' : route.charAt(1).toUpperCase() + route.slice(2)}</title>
  <meta name="description" content="Join SSPL T10 Cricket League 2025. Register your team and compete across India. T10 tournament with ₹699 entry fee.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.ssplt10.co.in${route}">
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #f9fafb; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .btn { background: #C1E303; color: black; padding: 12px 24px; border: none; border-radius: 6px; text-decoration: none; display: inline-block; margin: 1rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SSPL T10 Cricket League 2025</h1>
    <p>Join India's ultimate T10 cricket tournament. Register your team for professional T10 cricket competition across India.</p>
    <p><strong>Registration Fee:</strong> ₹699 + GST</p>
    <p><strong>Contact:</strong> support@ssplt10.co.in</p>
    <a href="/register" class="btn">Register Now</a>
    <p><small>This page is part of our Static Site Generation for better SEO. <a href="/">View full site</a></small></p>
  </div>
</body>
</html>`;

    await fs.writeFile(filePath, fallbackHtml, 'utf8');
    console.log(`✅ Created fallback: ${filePath}`);
  }

  async prerenderAllRoutes() {
    console.log('🔄 Starting Simple SSG generation...');
    
    const results = [];
    
    for (const route of ROUTES_TO_PRERENDER) {
      const result = await this.prerenderRoute(route);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  async createSitemap() {
    console.log('🗺️ Generating enhanced sitemap.xml...');
    
    const baseUrl = 'https://www.ssplt10.co.in';
    const urls = ROUTES_TO_PRERENDER.map(route => 
      `<url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq><priority>${route === '/' ? '1.0' : '0.8'}</priority></url>`
    ).join('\n      ');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
    
    const sitemapPath = path.join(this.outputDir, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Generated sitemap: ${sitemapPath}`);
  }

  async createRobotsTxt() {
    console.log('🤖 Generating robots.txt...');
    
    const robotsTxt = `# SSPL T10 Cricket League - Robots.txt
# Generated for better SEO

User-agent: *
Allow: /

# Sitemap location
Sitemap: https://www.ssplt10.co.in/sitemap.xml

# Crawl delay for politeness
Crawl-delay: 1

# Major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

# Block access to development files
Disallow: /src/
Disallow: /scripts/
Disallow: /.vscode/
Disallow: /node_modules/`;
    
    const robotsPath = path.join(this.outputDir, 'robots.txt');
    await fs.writeFile(robotsPath, robotsTxt, 'utf8');
    console.log(`✅ Generated robots.txt: ${robotsPath}`);
  }

  async createIndexPage() {
    console.log('📋 Creating SSG index page...');
    
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSG Generated Pages - SSPL T10</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #f9fafb; }
    .container { max-width: 1000px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .btn { background: #C1E303; color: black; padding: 8px 16px; border: none; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗂️ Static Site Generation Complete</h1>
    <p>All routes have been pre-rendered for optimal SEO and search engine crawling.</p>
    
    <h2>Generated Pages:</h2>
    <div class="grid">
      ${ROUTES_TO_PRERENDER.map(route => {
        const pageName = route === '/' ? 'Home' : route.slice(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<div class="card">
          <h3>${pageName}</h3>
          <p>Route: <code>${route}</code></p>
          <a href="${route}" class="btn">View Page</a>
        </div>`;
      }).join('')}
    </div>
    
    <h2>SEO Features:</h2>
    <ul>
      <li>✅ Pre-rendered HTML for all routes</li>
      <li>✅ Structured data (JSON-LD) for rich snippets</li>
      <li>✅ Optimized meta tags and descriptions</li>
      <li>✅ XML sitemap for search engines</li>
      <li>✅ Robots.txt for crawl directives</li>
    </ul>
    
    <p><strong>Next Steps:</strong> Deploy these static files to your web server for maximum SEO benefits.</p>
  </div>
</body>
</html>`;

    const indexPath = path.join(this.outputDir, 'ssg-index.html');
    await fs.writeFile(indexPath, indexHtml, 'utf8');
    console.log(`✅ Created SSG index: ${indexPath}`);
  }

  async generateReport(results) {
    console.log('\n📊 Simple SSG Generation Report:');
    console.log('='.repeat(50));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const fallbackCount = results.filter(r => r.status === 'fallback').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Successful: ${successCount}`);
    console.log(`🔄 Fallback: ${fallbackCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    
    console.log('\n🎯 SEO Improvements:');
    console.log('- All pages now have static HTML for search engines');
    console.log('- Enhanced with structured data for rich snippets');
    console.log('- Improved crawlability and indexing');
    console.log('- Better Core Web Vitals potential');
    console.log('- Fallback pages ensure no broken links');
    
    console.log('\n🚀 Benefits for SSPL T10:');
    console.log('- Better Google search rankings');
    console.log('- Faster page loads for search crawlers');
    console.log('- Rich snippets in search results');
    console.log('- Improved mobile search experience');
    console.log('- Enhanced social media sharing');
  }

  async generate() {
    try {
      await this.ensureOutputDir();
      const results = await this.prerenderAllRoutes();
      await this.createSitemap();
      await this.createRobotsTxt();
      await this.createIndexPage();
      
      await this.generateReport(results);
      
      console.log('\n🎉 Simple SSG generation completed!');
      console.log(`📂 Static files ready in: ${this.outputDir}`);
      
      return results;
    } catch (error) {
      console.error('💥 SSG generation failed:', error);
      throw error;
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SimpleSSG();
  generator.generate().catch(console.error);
}

export default SimpleSSG;