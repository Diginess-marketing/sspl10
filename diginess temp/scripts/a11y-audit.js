#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * Tests pages for WCAG 2.1 AA compliance
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('♿ Accessibility (A11y) Audit Script');
console.log('====================================\n');

// Configuration
const WEBSITE_URL = 'https://ssplt10.com';
const LOCAL_URL = 'http://localhost:4174';
const DIST_FILE = process.argv[2] || 'dist/index.html';

// Function to check for accessibility issues in HTML
function auditHTML(html, filePath) {
  const issues = {
    critical: [],
    warnings: [],
    passed: [],
  };

  console.log(`📄 Auditing: ${filePath}`);
  console.log('='.repeat(50) + '\n');

  // 1. Check for page lang attribute
  if (/<html[^>]*lang=/.test(html)) {
    issues.passed.push('✅ HTML lang attribute present');
  } else {
    issues.critical.push('❌ Missing lang attribute on <html> tag (WCAG 3.1.1)');
  }

  // 2. Check for page title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  if (titleMatch && titleMatch[1].trim().length > 0) {
    issues.passed.push(`✅ Page title present: "${titleMatch[1]}"`);
  } else {
    issues.critical.push('❌ Missing or empty page title (WCAG 2.4.2)');
  }

  // 3. Check for h1 tag
  const h1Count = (html.match(/<h1/gi) || []).length;
  if (h1Count === 1) {
    issues.passed.push('✅ Exactly one <h1> tag found');
  } else if (h1Count === 0) {
    issues.critical.push('❌ No <h1> tag found (WCAG 1.3.1)');
  } else {
    issues.warnings.push(`⚠️ Multiple <h1> tags found (${h1Count}), should have only 1 (WCAG 1.3.1)`);
  }

  // 4. Check heading hierarchy
  const headings = html.match(/<h[1-6]/gi) || [];
  let lastHeadingLevel = 0;
  let hierarchyIssues = 0;
  for (const heading of headings) {
    const level = parseInt(heading[2]);
    if (level > lastHeadingLevel + 1) {
      hierarchyIssues++;
    }
    lastHeadingLevel = level;
  }
  if (hierarchyIssues === 0) {
    issues.passed.push('✅ Heading hierarchy is correct');
  } else {
    issues.warnings.push(
      `⚠️ Heading hierarchy issues detected (${hierarchyIssues} jumps) (WCAG 1.3.1)`
    );
  }

  // 5. Check for alt text on images
  const images = html.match(/<img[^>]*>/gi) || [];
  let missingAltCount = 0;
  images.forEach((img) => {
    if (!img.includes('alt=') && !img.includes('aria-label=')) {
      missingAltCount++;
    }
  });
  if (missingAltCount === 0) {
    issues.passed.push(`✅ All ${images.length} images have alt text or aria-label`);
  } else {
    issues.critical.push(
      `❌ ${missingAltCount} image(s) missing alt text (WCAG 1.1.1)`
    );
  }

  // 6. Check for form labels
  const inputs = html.match(/<input[^>]*>/gi) || [];
  const labels = html.match(/<label[^>]*>/gi) || [];
  if (labels.length > 0) {
    issues.passed.push(`✅ ${labels.length} form label(s) found`);
  } else if (inputs.length > 0) {
    issues.warnings.push(
      `⚠️ Form inputs found but no labels (WCAG 1.3.1, 2.4.6)`
    );
  } else {
    issues.passed.push('✅ No form inputs requiring labels');
  }

  // 7. Check for main content landmark
  if (/<main[^>]*>/i.test(html) || /id=["']main-content["']/i.test(html)) {
    issues.passed.push('✅ Main content landmark found');
  } else {
    issues.warnings.push('⚠️ No <main> landmark or main-content ID found (WCAG 1.3.1)');
  }

  // 8. Check for navigation landmark
  if (/<nav[^>]*>/i.test(html)) {
    issues.passed.push('✅ Navigation landmark found');
  } else {
    issues.warnings.push('⚠️ No <nav> landmark found (WCAG 1.3.1)');
  }

  // 9. Check for proper focus management (looking for specific patterns)
  if (/skip[^>]*href/i.test(html) || /skip[^>]*to[^>]*main/i.test(html)) {
    issues.passed.push('✅ Skip link found');
  } else {
    issues.warnings.push('⚠️ No skip link found (best practice for keyboard navigation)');
  }

  // 10. Check for ARIA attributes
  if (/aria-label/i.test(html) || /aria-labelledby/i.test(html)) {
    issues.passed.push('✅ ARIA labels/labelledby attributes found');
  } else {
    issues.warnings.push('⚠️ Limited ARIA attributes found');
  }

  // 11. Check for button accessibility
  const buttons = html.match(/<button[^>]*>/gi) || [];
  const links = html.match(/<a[^>]*>/gi) || [];
  if (buttons.length > 0) {
    issues.passed.push(`✅ ${buttons.length} button(s) found`);
  }
  if (links.length > 0) {
    // Check if links are used correctly
    const ariaButtons = (html.match(/role=["']button["']/gi) || []).length;
    if (ariaButtons > 0) {
      issues.warnings.push(
        `⚠️ Links with role="button" found (${ariaButtons}). Use <button> for actions instead.`
      );
    }
    issues.passed.push(`✅ ${links.length} link(s) found`);
  }

  // 12. Check for meta description
  if (/meta[^>]*name=["']description["'][^>]*content=/i.test(html)) {
    issues.passed.push('✅ Meta description present');
  } else {
    issues.warnings.push('⚠️ Meta description missing');
  }

  // 13. Check for viewport meta tag
  if (/meta[^>]*name=["']viewport["']/i.test(html)) {
    issues.passed.push('✅ Viewport meta tag present');
  } else {
    issues.critical.push('❌ Viewport meta tag missing (WCAG 1.4.4)');
  }

  // 14. Check for color contrast (visual inspection needed)
  if (/color:/i.test(html) || /background-color:/i.test(html)) {
    issues.warnings.push(
      '⚠️ Inline colors found - manual color contrast testing recommended (WCAG 1.4.3, 1.4.11)'
    );
  } else {
    issues.passed.push('✅ No problematic inline colors detected');
  }

  // 15. Check for keyboard accessibility patterns
  if (/onKeyDown|onKeyPress|tabIndex|role=["']button["']/i.test(html)) {
    issues.passed.push('✅ Keyboard interaction patterns detected');
  } else {
    issues.warnings.push('⚠️ Limited keyboard interaction patterns found');
  }

  return issues;
}

// Function to fetch webpage content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to print audit results
function printResults(issues) {
  console.log('📋 Accessibility Audit Results');
  console.log('==============================\n');

  if (issues.critical.length > 0) {
    console.log('🔴 Critical Issues (WCAG Violations):');
    issues.critical.forEach((issue) => console.log(`   ${issue}`));
    console.log('');
  }

  if (issues.warnings.length > 0) {
    console.log('🟡 Warnings (Best Practices):');
    issues.warnings.forEach((issue) => console.log(`   ${issue}`));
    console.log('');
  }

  if (issues.passed.length > 0) {
    console.log('✅ Passed Checks:');
    issues.passed.slice(0, 5).forEach((issue) => console.log(`   ${issue}`));
    if (issues.passed.length > 5) {
      console.log(`   ... and ${issues.passed.length - 5} more checks passed`);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Summary');
  console.log('==========');
  console.log(`Critical Issues: ${issues.critical.length}`);
  console.log(`Warnings: ${issues.warnings.length}`);
  console.log(`Passed: ${issues.passed.length}`);

  const score = Math.round(
    (issues.passed.length / (issues.passed.length + issues.warnings.length)) * 100
  );
  console.log(`\nAccessibility Score: ${score}%`);

  if (issues.critical.length === 0 && issues.warnings.length === 0) {
    console.log('\n🎉 Excellent! No accessibility issues found.');
  } else if (issues.critical.length === 0) {
    console.log('\n✅ Good! No critical issues, but consider addressing warnings.');
  } else {
    console.log('\n⚠️ Critical issues need to be resolved for WCAG compliance.');
  }

  return issues.critical.length === 0;
}

// Main execution
async function main() {
  try {
    // Try to load from dist file first
    let html;
    if (fs.existsSync(DIST_FILE)) {
      console.log(`📂 Reading HTML from: ${DIST_FILE}\n`);
      html = fs.readFileSync(DIST_FILE, 'utf8');
    } else {
      console.log(`📂 ${DIST_FILE} not found, fetching from live site...\n`);
      try {
        html = await fetchPage(WEBSITE_URL);
      } catch (error) {
        console.log('❌ Could not fetch from live site');
        console.log('Error:', error.message);
        console.log('\nUsage: node a11y-audit.js [path/to/index.html]');
        return;
      }
    }

    // Run audit
    const issues = auditHTML(html, DIST_FILE);

    // Print results
    const passed = printResults(issues);

    // Print recommendations
    console.log('\n💡 Recommendations');
    console.log('==================');
    console.log('1. Use the Web Accessibility Evaluator (WAE) tool');
    console.log('   https://wave.webaim.org/');
    console.log('2. Test with a screen reader (NVDA, JAWS, or VoiceOver)');
    console.log('3. Use keyboard-only navigation to test interactive elements');
    console.log('4. Test color contrast with: https://webaim.org/resources/contrastchecker/');
    console.log('5. Validate against WCAG 2.1 AA standards');

    console.log('\n🔗 Useful Resources');
    console.log('===================');
    console.log('• WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
    console.log('• Axe DevTools: https://www.deque.com/axe/devtools/');
    console.log('• ARIA Best Practices: https://www.w3.org/WAI/ARIA/apg/');

    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    process.exit(1);
  }
}

// Run if called directly
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  main();
}

export { auditHTML };
