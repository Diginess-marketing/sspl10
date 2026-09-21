import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    console.log("Fetching player_registrations created on or before 2026-07-19...");
    let allRegistrations = [];
    let page = 0;
    let limit = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('player_registrations')
            .select('id, created_at')
            .lte('created_at', '2026-07-19T23:59:59.999Z')
            .range(page * limit, (page + 1) * limit - 1);

        if (error) {
            console.error(error);
            break;
        }

        if (data && data.length > 0) {
            allRegistrations = allRegistrations.concat(data);
            page++;
        } else {
            hasMore = false;
        }
    }

    console.log(`Found ${allRegistrations.length} registrations on or before 19th July 2026.`);

    const oldRegIds = allRegistrations.map(r => r.id);
    
    // Now fetch trial_progress for these candidate_ids where l1_called is false or null
    let allTrialProgress = [];
    page = 0;
    hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('id, candidate_id, l1_called, l1_attendance')
            .is('l1_called', false)
            .range(page * limit, (page + 1) * limit - 1);
            
        if (error) {
            console.error(error);
            break;
        }

        if (data && data.length > 0) {
            allTrialProgress = allTrialProgress.concat(data);
            page++;
        } else {
            hasMore = false;
        }
    }
    
    // Also fetch where l1_called is null
    page = 0;
    hasMore = true;
    while (hasMore) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('id, candidate_id, l1_called, l1_attendance')
            .is('l1_called', null)
            .range(page * limit, (page + 1) * limit - 1);
            
        if (error) {
            console.error(error);
            break;
        }

        if (data && data.length > 0) {
            allTrialProgress = allTrialProgress.concat(data);
            page++;
        } else {
            hasMore = false;
        }
    }

    const notCalledOldPlayers = allTrialProgress.filter(tp => oldRegIds.includes(tp.candidate_id));

    console.log(`Found ${notCalledOldPlayers.length} trial_progress records that are "Not Called" and registered on/before 19th July 2026.`);
    
    if (notCalledOldPlayers.length > 0) {
        console.log("Updating...");
        
        // Update in chunks
        const chunkSize = 100;
        let updatedCount = 0;
        
        for (let i = 0; i < notCalledOldPlayers.length; i += chunkSize) {
            const chunk = notCalledOldPlayers.slice(i, i + chunkSize);
            const idsToUpdate = chunk.map(p => p.id);
            
            const { error } = await supabase
                .from('trial_progress')
                .update({ l1_called: true, l1_attendance: 'ABSENT' })
                .in('id', idsToUpdate);
                
            if (error) {
                console.error("Error updating chunk:", error);
            } else {
                updatedCount += idsToUpdate.length;
                console.log(`Updated ${updatedCount}/${notCalledOldPlayers.length}`);
            }
        }
        
        console.log("Update completed.");
    }
}
main();
