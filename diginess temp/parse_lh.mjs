import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./lighthouse-report.json', 'utf8'));

console.log("Categories:");
for (const [key, value] of Object.entries(data.categories)) {
  console.log(`- ${value.title}: Math.round(${value.score} * 100)`);
}

console.log("\nTop Performance Audits to fix:");
const audits = Object.values(data.audits)
  .filter(a => a.score !== null && a.score < 0.9 && a.details && a.details.type === 'opportunity')
  .sort((a, b) => (a.details.overallSavingsMs || 0) > (b.details.overallSavingsMs || 0) ? -1 : 1);

for (const audit of audits.slice(0, 10)) {
  console.log(`\n### ${audit.title} (Score: ${audit.score})`);
  console.log(`Savings: ${audit.displayValue}`);
  console.log(`Description: ${audit.description}`);
  if (audit.details && audit.details.items) {
    audit.details.items.slice(0, 3).forEach(item => {
      console.log(` - ${item.url || item.node?.snippet || 'Item'}: ${item.totalBytes ? Math.round(item.totalBytes/1024) + 'KB' : ''} ${item.wastedMs ? item.wastedMs + 'ms wasted' : ''}`);
    });
  }
}

console.log("\nTop Diagnostic Audits to fix:");
const diagnostics = Object.values(data.audits)
  .filter(a => a.score !== null && a.score < 0.9 && a.details && (a.details.type === 'table' || !a.details.type) && !a.id.includes('screenshot'))
  .sort((a, b) => a.score - b.score);

for (const audit of diagnostics.slice(0, 10)) {
  console.log(`\n### ${audit.title} (Score: ${audit.score})`);
  console.log(`Display: ${audit.displayValue || 'N/A'}`);
  console.log(`Description: ${audit.description}`);
}
