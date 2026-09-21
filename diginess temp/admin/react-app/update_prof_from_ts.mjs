import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function extractProficiencies(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const profs = {};
  
  // Basic parsing for the JSON objects inside the TS array
  // Example: { "mobile": "8248840324", "proficiency": "BATSMAN" }
  // We can just use a global regex matching mobile and proficiency anywhere inside an object
  // Since objects are inside `{ }`, we can just match `mobile...` and `proficiency...` inside a line or block
  
  const blocks = content.split('}');
  
  blocks.forEach(block => {
    let mobileMatch = block.match(/mobile["'\s:]+([0-9]{10})/i);
    let profMatch = block.match(/proficiency["'\s:]+([^"'\n,]+)/i);
    
    if (mobileMatch && profMatch) {
      let prof = profMatch[1].trim();
      // Clean up any stray quotes
      prof = prof.replace(/['"]/g, '');
      profs[mobileMatch[1]] = prof;
    }
  });
  
  return profs;
}

async function fix() {
  const l2 = extractProficiencies('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\src\\data\\level2Data.ts');
  const l3 = extractProficiencies('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\src\\data\\level3Data.ts');

  const allProfs = { ...l2, ...l3 };
  console.log('Extracted proficiencies count:', Object.keys(allProfs).length);

  const { data: missing, error: missErr } = await supabase.from('trial_view')
    .select('mobile, email, candidate_id, name')
    .or('proficiency.is.null,proficiency.eq.,proficiency.eq.NA,proficiency.ilike.N/A%')
    .eq('l1_result', 'SELECTED')
    .eq('l2_result', 'SELECTED')
    .eq('l3_result', 'SELECTED');
    
  if (missErr) return console.error('Error fetching missing:', missErr);
  
  console.log(`Found ${missing.length} players missing proficiency.`);

  let updatedCount = 0;
  
  for (const m of missing) {
    let foundProf = allProfs[m.mobile];
    
    if (foundProf && foundProf.trim() !== '' && foundProf !== 'NA') {
      const { error: updateErr } = await supabase.from('trial_candidates')
        .update({ proficiency: foundProf.trim() })
        .eq('id', m.candidate_id);
      
      if (updateErr) {
        console.error('Failed to update', m.name, updateErr.message);
      } else {
        console.log(`Updated ${m.name} (${m.mobile}) to proficiency: ${foundProf.trim()}`);
        updatedCount++;
      }
    } else {
      console.log(`Could not find proficiency for ${m.name} (${m.mobile}) in TS files.`);
    }
  }
  
  console.log(`\nFinished updating ${updatedCount} out of ${missing.length} players.`);
}

fix();
