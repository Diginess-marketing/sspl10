import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function extractProficienciesFromTS(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const profs = {};
  
  const blocks = content.split('}');
  blocks.forEach(block => {
    let mobileMatch = block.match(/mobile["'\s:]+([0-9]{10})/i);
    let profMatch = block.match(/proficiency["'\s:]+([^"'\n,]+)/i);
    
    if (mobileMatch && profMatch) {
      let prof = profMatch[1].trim().replace(/['"]/g, '');
      profs[mobileMatch[1]] = prof;
    }
  });
  return profs;
}

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
  console.log("Loading offline sources...");
  const t1 = extractProficienciesFromTS('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\src\\data\\level2Data.ts');
  const t2 = extractProficienciesFromTS('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\src\\data\\level3Data.ts');
  const p1 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\Paid_registrations.json');
  const p2 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\Players Data.json');
  const p3 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\public\\Paid_registrations.json');
  const p4 = extractJsonProf('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\public\\Players Data.json');

  const allOfflineProfs = { ...t1, ...t2, ...p1, ...p2, ...p3, ...p4 };
  console.log('Total unique offline proficiencies loaded:', Object.keys(allOfflineProfs).length);

  console.log("Fetching player_registrations from Supabase...");
  const { data: pr } = await supabase.from('player_registrations').select('email, phone, full_name, position');

  // Fetch missing proficiencies for absent players
  const { data: missing, error: missErr } = await supabase.from('trial_view')
    .select('mobile, email, candidate_id, name, l1_attendance, l2_attendance, l3_attendance')
    .or('proficiency.is.null,proficiency.eq.,proficiency.eq.NA,proficiency.ilike.N/A%');
    
  if (missErr) return console.error('Error fetching missing:', missErr);

  // Filter for players who were absent in at least one level
  const absentPlayers = missing.filter(m => 
    m.l1_attendance === 'ABSENT' || 
    m.l2_attendance === 'ABSENT' || 
    m.l3_attendance === 'ABSENT'
  );

  console.log(`Found ${absentPlayers.length} ABSENT players missing proficiency out of ${missing.length} total players missing proficiency.`);

  let updatedCount = 0;
  
  for (const m of absentPlayers) {
    let foundProf = null;

    // 1. Check player_registrations
    if (pr) {
      const match = pr.find(p => 
        (p.email && m.email && p.email.toLowerCase() === m.email.toLowerCase()) ||
        (p.phone && m.mobile && (p.phone === m.mobile || p.phone === '+91'+m.mobile)) ||
        (p.full_name && m.name && p.full_name.toLowerCase() === m.name.toLowerCase())
      );
      if (match && match.position && match.position.trim() !== '' && match.position !== 'NA' && !match.position.includes('N/A')) {
        foundProf = match.position.trim();
      }
    }

    // 2. Check offline sources
    if (!foundProf) {
      const offlineMatch = allOfflineProfs[m.mobile] || allOfflineProfs['91'+m.mobile];
      if (offlineMatch && offlineMatch.trim() !== '' && offlineMatch !== 'NA' && !offlineMatch.includes('N/A')) {
        foundProf = offlineMatch.trim();
      }
    }
    
    // Update if found
    if (foundProf) {
      const { error: updateErr } = await supabase.from('trial_candidates')
        .update({ proficiency: foundProf })
        .eq('id', m.candidate_id);
      
      if (!updateErr) {
        // console.log(`Updated ABSENT player ${m.name} (${m.mobile}) to proficiency: ${foundProf}`);
        updatedCount++;
      } else {
        console.error('Failed to update', m.name, updateErr.message);
      }
    }
  }
  
  console.log(`\nFinished updating ${updatedCount} out of ${absentPlayers.length} ABSENT players missing proficiency.`);
}
fix();
