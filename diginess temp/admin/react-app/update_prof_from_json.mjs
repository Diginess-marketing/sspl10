import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function extractJsonProf(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch(e) {
    return {};
  }
  const profs = {};
  data.forEach(item => {
    const mobile = item.mobile || item.Mobile || item['Phone Number'] || item.Phone;
    const prof = item.proficiency || item.Proficiency || item.role || item.Role || item.position;
    if (mobile && prof) {
      profs[String(mobile).replace(/\D/g, '')] = prof;
    }
  });
  return profs;
}

async function fix() {
  const p1 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\Paid_registrations.json');
  const p2 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\Players Data.json');
  const p3 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\public\\Paid_registrations.json');
  const p4 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\public\\Players Data.json');

  const allProfs = { ...p1, ...p2, ...p3, ...p4 };

  const { data: missing, error: missErr } = await supabase.from('trial_view')
    .select('mobile, email, candidate_id, name')
    .or('proficiency.is.null,proficiency.eq.,proficiency.eq.NA,proficiency.ilike.N/A%')
    .eq('l1_result', 'SELECTED')
    .eq('l2_result', 'SELECTED')
    .eq('l3_result', 'SELECTED');

  let updatedCount = 0;
  
  if (missing) {
    for (const m of missing) {
      let foundProf = allProfs[m.mobile] || allProfs['91'+m.mobile];
      
      if (foundProf && foundProf.trim() !== '' && foundProf !== 'NA' && !foundProf.includes('N/A')) {
        const { error: updateErr } = await supabase.from('trial_candidates')
          .update({ proficiency: foundProf.trim() })
          .eq('id', m.candidate_id);
        
        if (!updateErr) {
          console.log(`Updated ${m.name} (${m.mobile}) to proficiency: ${foundProf.trim()}`);
          updatedCount++;
        }
      }
    }
  }
  console.log('Updated from JSONs:', updatedCount);
}
fix();
