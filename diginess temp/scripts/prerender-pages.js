/**
 * Static Site Generation (SSG) Script for SSPL T10 Website
 * Generates static HTML files for all routes to improve SEO
 * Works with existing Vite + React setup
 */

import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
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

// Dynamic routes that need special handling
const DYNAMIC_ROUTES = [
  { pattern: '/qr/', examples: ['/qr/test'] }
];

class SSGGenerator {
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

  async launchBrowser() {
    console.log('🚀 Launching browser for prerendering...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for consistent rendering
    await this.page.setViewport({ width: 1280, height: 800 });
    
    console.log('✅ Browser launched successfully');
  }

  async prerenderRoute(route) {
    const url = `${this.baseUrl}${route}`;
    console.log(`📄 Rendering ${route}...`);
    
    try {
      // Navigate to the route
      await this.page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Wait for React to fully render
      await this.page.waitForSelector('#root', { timeout: 15000 });
      
      // Additional wait for dynamic content
      await this.page.waitForTimeout(2000);

      // Get the fully rendered HTML
      const html = await this.page.content();
      
      // Save the HTML file
      const fileName = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
      const filePath = path.join(this.outputDir, fileName);
      
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Generated: ${filePath}`);
      
      return { route, status: 'success', fileName };
    } catch (error) {
      console.error(`❌ Failed to render ${route}:`, error.message);
      return { route, status: 'error', error: error.message };
    }
  }

  async prerenderAllRoutes() {
    console.log('🔄 Starting SSG generation for all routes...');
    
    const results = [];
    
    for (const route of ROUTES_TO_PRERENDER) {
      const result = await this.prerenderRoute(route);
      results.push(result);
      
      // Small delay between requests
      await this.page.waitForTimeout(500);
    }
    
    // Handle dynamic routes
    for (const dynamicRoute of DYNAMIC_ROUTES) {
      for (const example of dynamicRoute.examples) {
        const result = await this.prerenderRoute(example);
        results.push(result);
        
        await this.page.waitForTimeout(500);
      }
    }
    
    return results;
  }

  async createSitemap() {
    console.log('🗺️ Generating sitemap.xml...');
    
    const baseUrl = 'https://www.ssplt10.co.in';
    const urls = ROUTES_TO_PRERENDER.map(route => 
      `<url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
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
    
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://www.ssplt10.co.in/sitemap.xml

# Allow all search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;
    
    const robotsPath = path.join(this.outputDir, 'robots.txt');
    await fs.writeFile(robotsPath, robotsTxt, 'utf8');
    console.log(`✅ Generated robots.txt: ${robotsPath}`);
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }

  async generateReport(results) {
    console.log('\n📊 SSG Generation Report:');
    console.log('='.repeat(50));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    
    if (errorCount > 0) {
      console.log('\n❌ Failed routes:');
      results.filter(r => r.status === 'error').forEach(r => {
        console.log(`   - ${r.route}: ${r.error}`);
      });
    }
    
    console.log('\n🎯 SEO Benefits:');
    console.log('- Search engines can now crawl static HTML content');
    console.log('- All pages will be indexable');
    console.log('- Better Core Web Vitals scores expected');
    console.log('- Improved page speed for crawlers');
  }

  async generate() {
    try {
      await this.ensureOutputDir();
      await this.launchBrowser();
      
      const results = await this.prerenderAllRoutes();
      await this.createSitemap();
      await this.createRobotsTxt();
      await this.closeBrowser();
      
      await this.generateReport(results);
      
      console.log('\n🎉 SSG generation completed successfully!');
      console.log(`📂 Static files ready in: ${this.outputDir}`);
      
      return results;
    } catch (error) {
      console.error('💥 SSG generation failed:', error);
      await this.closeBrowser();
      throw error;
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new SSGGenerator();
  generator.generate().catch(console.error);
}

export default SSGGenerator;