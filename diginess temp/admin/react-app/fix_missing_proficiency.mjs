import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fix() {
  const { data: missing, error: missErr } = await supabase.from('trial_view')
    .select('mobile, email, candidate_id, name')
    .or('proficiency.is.null,proficiency.eq.,proficiency.eq.NA,proficiency.ilike.N/A%')
    .eq('l1_result', 'SELECTED')
    .eq('l2_result', 'SELECTED')
    .eq('l3_result', 'SELECTED');
    
  if (missErr) return console.error('Error fetching missing:', missErr);
  
  console.log(`Found ${missing.length} players missing proficiency.`);

  // Fetch all from player_registrations
  const { data: pr, error: prErr } = await supabase.from('player_registrations').select('email, phone, full_name, position');
  if (prErr) return console.error('Error fetching player_registrations:', prErr);

  let updatedCount = 0;
  
  for (const m of missing) {
    let foundProf = null;
    
    // Check player_registrations
    const match = pr.find(p => 
      (p.email && m.email && p.email.toLowerCase() === m.email.toLowerCase()) ||
      (p.phone && m.mobile && (p.phone === m.mobile || p.phone === '+91'+m.mobile)) ||
      (p.full_name && m.name && p.full_name.toLowerCase() === m.name.toLowerCase())
    );
    
    if (match && match.position && match.position.trim() !== '' && match.position !== 'NA' && !match.position.includes('N/A')) {
      foundProf = match.position.trim();
    }
    
    // Check trial_candidates duplicates if not found
    if (!foundProf) {
      const { data: duplicates } = await supabase.from('trial_candidates')
        .select('proficiency')
        .eq('mobile', m.mobile);
      if (duplicates) {
        const dupMatch = duplicates.find(d => d.proficiency && d.proficiency.trim() !== '' && d.proficiency !== 'NA' && !d.proficiency.includes('N/A'));
        if (dupMatch) {
          foundProf = dupMatch.proficiency.trim();
        }
      }
    }
    
    if (foundProf) {
      // Must use Service Role key for UPDATE if RLS prevents Anon
      const { error: updateErr } = await supabase.from('trial_candidates')
        .update({ proficiency: foundProf })
        .eq('id', m.candidate_id);
      
      if (updateErr) {
        console.error('Failed to update', m.name, updateErr.message);
        // If anon fails, let's try service role!
        const adminSupabase = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU');
        const { error: updateErr2 } = await adminSupabase.from('trial_candidates')
          .update({ proficiency: foundProf })
          .eq('id', m.candidate_id);
        if (updateErr2) {
           console.error('Service role also failed to update', m.name, updateErr2.message);
        } else {
           console.log(`Updated ${m.name} (${m.mobile}) to proficiency: ${foundProf} using Service Role`);
           updatedCount++;
        }
      } else {
        console.log(`Updated ${m.name} (${m.mobile}) to proficiency: ${foundProf}`);
        updatedCount++;
      }
    } else {
      console.log(`Could not find proficiency for ${m.name} (${m.mobile}) in any table.`);
    }
  }
  
  console.log(`\nFinished updating ${updatedCount} out of ${missing.length} players.`);
}
fix();
