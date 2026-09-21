import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://fazpykekypcktcmniwbj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM');

async function generateList() {
  const missingFilter = 'proficiency.is.null,proficiency.eq.,proficiency.eq.NA,proficiency.ilike.N/A%';

  const { data: cat1 } = await supabase.from('trial_view').select('name, mobile, proficiency').or(missingFilter).eq('l1_attendance', 'ABSENT').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT');
  const { data: cat2 } = await supabase.from('trial_view').select('name, mobile, proficiency').or(missingFilter).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_result', 'SELECTED');
  const { data: cat3 } = await supabase.from('trial_view').select('name, mobile, proficiency').or(missingFilter).eq('l1_result', 'SELECTED').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT');
  const { data: cat4 } = await supabase.from('trial_view').select('name, mobile, proficiency').or(missingFilter).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_attendance', 'ABSENT');

  let output = '# Missed Players (Missing Proficiency)\n\n';
  output += 'This document lists the players belonging to the `IN Players Split` categories who are currently missing their proficiency data. The database has **not** been modified.\n\n';

  output += `## 1. Fully Selected (${cat2 ? cat2.length : 0} players)\n`;
  if (cat2) cat2.forEach(m => output += `- ${m.name} (${m.mobile})\n`);

  output += `\n## 2. Selected L1 & L2, Absent L3 (${cat4 ? cat4.length : 0} players)\n`;
  if (cat4) cat4.forEach(m => output += `- ${m.name} (${m.mobile})\n`);

  output += `\n## 3. L1 Selected, L2 Absent (${cat3 ? cat3.length : 0} players)\n`;
  if (cat3) cat3.forEach(m => output += `- ${m.name} (${m.mobile})\n`);

  output += `\n## 4. Completely Absent (${cat1 ? cat1.length : 0} players)\n`;
  if (cat1) cat1.forEach(m => output += `- ${m.name} (${m.mobile})\n`);

  fs.writeFileSync('C:/Users/ADMIN/.gemini/antigravity-ide/brain/dea6ff93-692d-43b0-bdc6-250676faba79/missed_players.md', output);
  console.log('Artifact created successfully.');
}
generateList();
