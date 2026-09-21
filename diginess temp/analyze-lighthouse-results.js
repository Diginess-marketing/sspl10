const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('lighthouse-image-optimization-test.json', 'utf8'));
  
  console.log('=== LIGHTHOUSE IMAGE OPTIMIZATION RESULTS ===\n');
  
  // Performance metrics
  console.log('📊 PERFORMANCE SCORE:', (data.categories.performance.score * 100).toFixed(0) + '/100\n');
  
  // Key image-related audits
  const imageAudits = {
    'uses-webp-images': 'Serve images in next-gen formats',
    'uses-responsive-images': 'Properly sized images', 
    'uses-optimized-images': 'Efficiently encode images'
  };
  
  console.log('🖼️  IMAGE OPTIMIZATION STATUS:\n');
  
  for (const [key, label] of Object.entries(imageAudits)) {
    const audit = data.audits[key];
    if (audit) {
      const score = audit.score === 1 ? '✅ PASS' : audit.score === 0 ? '❌ FAIL' : '⚠️  MANUAL';
      const displayValue = audit.displayValue || 'N/A';
      console.log(`${label}:`);
      console.log(`  Status: ${score}`);
      console.log(`  Details: ${displayValue}\n`);
    }
  }
  
  // Performance metrics
  const perfAudits = ['first-contentful-paint', 'largest-contentful-paint', 'speed-index'];
  console.log('⚡ PERFORMANCE METRICS:\n');
  
  perfAudits.forEach(audit => {
    if (data.audits[audit]) {
      console.log(`${audit.replace(/-/g, ' ').toUpperCase()}: ${data.audits[audit].displayValue}`);
    }
  });
  
  // Recommendations
  if (data.audits['uses-webp-images'] && data.audits['uses-webp-images'].score === 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    data.audits['uses-webp-images'].details?.forEach(item => {
      console.log(`- ${item}`);
    });
  }
  
} catch (error) {
  console.error('Error reading Lighthouse report:', error.message);
}