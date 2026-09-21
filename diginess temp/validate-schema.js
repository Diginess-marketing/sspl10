#!/usr/bin/env node

/**
 * Schema Markup Validation Script
 * Tests structured data using Google's Rich Results Test
 */

import https from 'https';
import http from 'http';

console.log('🔍 Schema Markup Validation Script');
console.log('===================================\n');

// Configuration
const WEBSITE_URL = 'https://ssplt10.com';
const LOCAL_URL = 'http://localhost:4174';

// Function to extract structured data from HTML
function extractStructuredData(html) {
  const schemaPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const schemas = [];
  let match;

  while ((match = schemaPattern.exec(html)) !== null) {
    try {
      const schemaContent = JSON.parse(match[1].trim());
      schemas.push(schemaContent);
    } catch (error) {
      console.error('❌ Invalid JSON in schema markup:', error.message);
    }
  }

  return schemas;
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

// Function to analyze schema markup
function analyzeSchemas(schemas) {
  console.log('📊 Schema Analysis Results');
  console.log('=========================\n');

  if (schemas.length === 0) {
    console.log('❌ No structured data found!');
    return false;
  }

  let hasLocalBusiness = false;
  let hasOrganization = false;
  let hasPressRelease = false;
  let hasBreadcrumb = false;
  let hasFAQ = false;
  let hasAggregateRating = false;
  let hasSportsEvent = false;
  let issues = [];
  let recommendations = [];

  schemas.forEach((schema, index) => {
    console.log(`${index + 1}. ${schema['@type']}`);
    
    // Check for LocalBusiness
    if (schema['@type'] === 'LocalBusiness') {
      hasLocalBusiness = true;
      console.log('   ✅ LocalBusiness schema found');
      
      // Check for telephone
      if (schema.telephone) {
        console.log('   ✅ Telephone field present:', schema.telephone);
      } else {
        console.log('   ❌ Telephone field missing');
        issues.push('LocalBusiness missing telephone');
      }
      
      // Check for address
      if (schema.address) {
        console.log('   ✅ Address present');
      } else {
        console.log('   ⚠️ Address missing');
        recommendations.push('Consider adding address to LocalBusiness schema');
      }
      
      // Check for aggregateRating
      if (schema.aggregateRating) {
        console.log('   ✅ AggregateRating present');
      } else {
        console.log('   ⚠️ AggregateRating missing (recommended for ratings/reviews)');
        recommendations.push('Add aggregateRating with ratings and review count');
      }
      
      // Check for contactPoint
      if (schema.contactPoint) {
        console.log('   ✅ ContactPoint present');
      } else {
        console.log('   ⚠️ ContactPoint missing');
        recommendations.push('Add contactPoint with customer support information');
      }
    }
    
    // Check for Organization
    if (schema['@type'] === 'Organization') {
      hasOrganization = true;
      console.log('   ✅ Organization schema found');
      
      // Check for recommended fields
      if (schema.telephone) {
        console.log('   ✅ Telephone field present:', schema.telephone);
      } else {
        console.log('   ❌ Telephone field missing');
        issues.push('Organization missing telephone');
      }
      
      if (schema.address) {
        console.log('   ✅ Address present');
      } else {
        console.log('   ⚠️ Address missing');
      }
      
      if (schema.aggregateRating) {
        console.log('   ✅ AggregateRating present');
      } else {
        console.log('   ⚠️ AggregateRating missing');
        recommendations.push('Add aggregateRating for brand reputation');
      }
      
      if (schema.contactPoint) {
        console.log('   ✅ ContactPoint present');
      } else {
        console.log('   ⚠️ ContactPoint missing');
      }
      
      if (schema.sameAs) {
        console.log('   ✅ Social media profiles present:', schema.sameAs.length, 'profiles');
      } else {
        console.log('   ⚠️ Social media profiles missing');
        recommendations.push('Add sameAs with social media profile links');
      }
    }

    // Check for SportsEvent
    if (schema['@type'] === 'SportsEvent') {
      hasSportsEvent = true;
      console.log('   ✅ SportsEvent schema found');
      
      if (schema.startDate && schema.endDate) {
        console.log('   ✅ Event dates present');
      } else {
        console.log('   ❌ Event dates missing');
        issues.push('SportsEvent missing dates');
      }
      
      if (schema.location) {
        console.log('   ✅ Event location present');
      } else {
        console.log('   ⚠️ Event location missing');
      }
    }

    // Check for BreadcrumbList
    if (schema['@type'] === 'BreadcrumbList') {
      hasBreadcrumb = true;
      console.log('   ✅ BreadcrumbList schema found');
      console.log(`   ✅ ${schema.itemListElement?.length || 0} breadcrumb items`);
    }

    // Check for FAQPage
    if (schema['@type'] === 'FAQPage') {
      hasFAQ = true;
      console.log('   ✅ FAQPage schema found');
      console.log(`   ✅ ${schema.mainEntity?.length || 0} FAQ items`);
    }

    // Check for NewsArticle (Press Release)
    if (schema['@type'] === 'NewsArticle') {
      hasPressRelease = true;
      console.log('   ✅ NewsArticle/Press Release schema found');
      
      if (schema.datePublished) {
        console.log('   ✅ Publication date present');
      } else {
        console.log('   ❌ Publication date missing');
      }
    }

    // Check for Event with aggregateRating
    if (schema['@type'] === 'Event' && schema.aggregateRating) {
      hasAggregateRating = true;
      console.log('   ✅ Event with AggregateRating found');
      console.log(`   ✅ Rating: ${schema.aggregateRating.ratingValue} (${schema.aggregateRating.reviewCount} reviews)`);
    }
    
    console.log('');
  });

  // Summary
  console.log('📋 Validation Summary');
  console.log('=====================');
  
  const schemaStatus = [
    { name: 'Organization', found: hasOrganization },
    { name: 'LocalBusiness', found: hasLocalBusiness },
    { name: 'SportsEvent', found: hasSportsEvent },
    { name: 'BreadcrumbList', found: hasBreadcrumb },
    { name: 'FAQPage', found: hasFAQ },
    { name: 'NewsArticle', found: hasPressRelease },
    { name: 'AggregateRating', found: hasAggregateRating },
  ];

  schemaStatus.forEach(({ name, found }) => {
    if (found) {
      console.log(`✅ ${name} schema: FOUND`);
    } else {
      console.log(`❌ ${name} schema: MISSING`);
      recommendations.push(`Add ${name} schema for enhanced search visibility`);
    }
  });

  if (issues.length > 0) {
    console.log('\n⚠️ Critical Issues:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  }

  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    recommendations.slice(0, 5).forEach(rec => console.log(`   • ${rec}`));
    if (recommendations.length > 5) {
      console.log(`   • ... and ${recommendations.length - 5} more recommendations`);
    }
  }

  if (issues.length === 0) {
    console.log('\n🎉 Schema markup is valid and comprehensive!');
    return true;
  } else {
    console.log('\n⚠️ Fix the critical issues above before submission');
    return false;
  }
}

// Function to test Rich Results Test URL
function getRichResultsTestUrl(url) {
  return `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
}

// Main execution
async function main() {
  try {
    console.log('🌐 Testing URL:', WEBSITE_URL);
    console.log('📱 Testing Rich Results: ', getRichResultsTestUrl(WEBSITE_URL));
    console.log('');
    
    // Try to fetch local version first
    let html;
    try {
      console.log('🔄 Attempting to fetch local version...');
      html = await fetchPage(LOCAL_URL);
      console.log('✅ Local version loaded successfully\n');
    } catch (error) {
      console.log('⚠️ Local version not available, trying live version...');
      try {
        html = await fetchPage(WEBSITE_URL);
        console.log('✅ Live version loaded successfully\n');
      } catch (liveError) {
        console.log('❌ Unable to fetch any version of the site');
        console.log('Error:', liveError.message);
        return;
      }
    }
    
    // Extract and analyze schemas
    const schemas = extractStructuredData(html);
    const isValid = analyzeSchemas(schemas);
    
    console.log('\n🔗 Google Rich Results Test Links');
    console.log('===================================');
    console.log('Manual testing recommended:');
    console.log(`Live site: ${getRichResultsTestUrl(WEBSITE_URL)}`);
    if (LOCAL_URL !== WEBSITE_URL) {
      console.log(`Local site: ${getRichResultsTestUrl(LOCAL_URL)}`);
    }
    
    console.log('\n💡 Next Steps');
    console.log('=============');
    if (isValid) {
      console.log('1. ✅ Run the Rich Results Test manually using the links above');
      console.log('2. ✅ Submit the site for indexing in Google Search Console');
      console.log('3. ✅ Monitor structured data in Search Console');
    } else {
      console.log('1. ⚠️ Fix the identified schema issues');
      console.log('2. 🔄 Re-run this validation script');
      console.log('3. ✅ Test with Rich Results Test once fixed');
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  main();
}

export { extractStructuredData, analyzeSchemas, fetchPage };