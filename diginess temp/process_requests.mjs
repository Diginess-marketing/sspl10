import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizePhone(num) {
    if (!num) return '';
    return String(num).replace(/\D/g, '').slice(-10);
}

async function main() {
    console.log("1. Removing duplicate entries for 6381322174...");
    const { data: candNaveen } = await supabase.from('trial_candidates').select('id, name, created_at').like('mobile', '%6381322174%');
    console.log(`Found ${candNaveen?.length || 0} candidates for 6381322174`);
    if (candNaveen && candNaveen.length > 1) {
        // Sort by created_at (keep the first/oldest, delete the rest)
        // Wait, created_at might not be in the select. Let's just keep the first one.
        const toKeep = candNaveen[0];
        const toDelete = candNaveen.slice(1);
        for (const c of toDelete) {
            await supabase.from('trial_progress').delete().eq('candidate_id', c.id);
            await supabase.from('trial_candidates').delete().eq('id', c.id);
        }
        console.log(`Deleted ${toDelete.length} duplicates for 6381322174`);
    }

    console.log("\n2. Checking 9777321130...");
    const { data: candRam } = await supabase.from('trial_candidates').select('id, name').like('mobile', '%9777321130%');
    console.log(`Found ${candRam?.length || 0} candidates for 9777321130 (Ramakanta Jagat)`);

    console.log("\n3. Checking 6380141960...");
    const { data: reg638 } = await supabase.from('player_registrations').select('*').like('phone', '%6380141960%');
    console.log(`Found ${reg638?.length || 0} registrations for 6380141960`);
    if (reg638 && reg638.length > 0) {
        const { data: cand638 } = await supabase.from('trial_candidates').select('id').like('mobile', '%6380141960%');
        if (!cand638 || cand638.length === 0) {
            console.log("Not in candidates, inserting...");
            const reg = reg638[0];
            const { data: newCandidate, error: candError } = await supabase.from('trial_candidates').insert({
                name: reg.full_name,
                mobile: reg.phone,
                email: reg.email,
                state: reg.state,
                proficiency: reg.position,
                payment_status: reg.payment_status
            }).select().single();

            if (candError) {
                console.error("Error inserting candidate", candError);
            } else {
                const { error: progError } = await supabase.from('trial_progress').insert({
                    candidate_id: newCandidate.id,
                    l1_called: false,
                    l1_attendance: 'PENDING',
                    final_status: null
                });
                if (progError) console.error("Error inserting progress", progError);
                else console.log(`Successfully added candidate and progress for ${reg.full_name} (${reg.phone})`);
            }
        } else {
            console.log("Already exists in candidates.");
        }
    } else {
        console.log("No registration found for 6380141960!");
    }
}

main().catch(console.error);
