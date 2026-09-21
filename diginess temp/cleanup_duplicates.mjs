import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    let allCandidates = [];
    let from = 0;
    const limit = 1000;
    while (true) {
        const { data, error } = await supabase.from('trial_candidates').select('id, mobile').range(from, from + limit - 1);
        if (error) throw error;
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allProgress = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase.from('trial_progress').select('candidate_id').range(from, from + limit - 1);
        if (error) throw error;
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const progressSet = new Set(allProgress.map(p => p.candidate_id));

    // Group by mobile
    const candidatesByMobile = new Map();
    for (const c of allCandidates) {
        if (!candidatesByMobile.has(c.mobile)) candidatesByMobile.set(c.mobile, []);
        candidatesByMobile.get(c.mobile).push(c);
    }

    let deletedCount = 0;
    for (const [mobile, cands] of candidatesByMobile) {
        if (cands.length > 1) {
            // Find duplicates. Keep the one with progress, or the newest one
            const withProgress = cands.filter(c => progressSet.has(c.id));
            const withoutProgress = cands.filter(c => !progressSet.has(c.id));
            
            // Delete the ones without progress if there is at least one with progress, 
            // OR if all of them have no progress, just keep one
            let toDelete = [];
            if (withProgress.length > 0) {
                toDelete = withoutProgress;
                // If there are multiple with progress (from multiple successful script runs)
                if (withProgress.length > 1) {
                    toDelete = toDelete.concat(withProgress.slice(1));
                }
            } else {
                toDelete = withoutProgress.slice(1);
            }

            for (const cand of toDelete) {
                // await supabase.from('trial_progress').delete().eq('candidate_id', cand.id);
                await supabase.from('trial_candidates').delete().eq('id', cand.id);
                deletedCount++;
            }
        }
    }
    
    console.log(`Deleted ${deletedCount} duplicate candidates.`);
}

main().catch(console.error);
