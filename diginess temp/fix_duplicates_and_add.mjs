import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("1. Removing duplicate entries for 6381322174...");
    const { data: candNaveen, error: e1 } = await supabase.from('trial_candidates').select('id, name').like('mobile', '%6381322174%');
    if (e1) console.error(e1);
    
    if (candNaveen && candNaveen.length > 1) {
        const toDelete = candNaveen.slice(1);
        for (const c of toDelete) {
            await supabase.from('trial_progress').delete().eq('candidate_id', c.id);
            await supabase.from('trial_candidates').delete().eq('id', c.id);
        }
        console.log(`Deleted ${toDelete.length} duplicates for 6381322174. Kept one.`);
    }

    console.log("\n2. Adding new candidate record for 6380141960 (Sundarapandi)...");
    const { data: reg638, error: e2 } = await supabase.from('player_registrations')
        .select('*')
        .like('phone', '%6380141960%')
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (e2) console.error(e2);

    if (reg638 && reg638.length > 0) {
        const reg = reg638[0];
        console.log(`Found latest registration on ${reg.created_at}`);

        // Insert new candidate
        const { data: newCand, error: candErr } = await supabase.from('trial_candidates').insert({
            name: reg.full_name,
            mobile: reg.phone,
            email: reg.email,
            state: reg.state,
            proficiency: reg.position,
            payment_status: reg.payment_status
        }).select().single();

        if (candErr) console.error("Error inserting candidate", candErr);
        else {
            const { error: progErr } = await supabase.from('trial_progress').insert({
                candidate_id: newCand.id,
                l1_called: false,
                l1_attendance: 'PENDING',
                final_status: null
            });
            if (progErr) console.error("Error inserting progress", progErr);
            else console.log(`Successfully added NEW candidate and progress for ${reg.full_name}`);
        }
    }
}

main().catch(console.error);
