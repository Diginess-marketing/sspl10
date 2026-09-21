import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    const data = JSON.parse(fs.readFileSync('mismatches.json', 'utf8'));
    const { mismatches, missingInCandidates } = data;

    console.log(`To update: mismatches: ${mismatches.length}, missing: ${missingInCandidates.length}`);

    // If there were any mismatches in existing candidates, we would update trial_progress
    for (const m of mismatches) {
        const { candidate, excelInfo } = m;
        // Map excelInfo to progress fields
        const l1_called = excelInfo.called === 'CALLED FOR';
        let l1_attendance = 'PENDING';
        if (excelInfo.attendance === 'PRESENT') l1_attendance = 'ATTENDED';
        else if (excelInfo.attendance === 'ABSENT') l1_attendance = 'ABSENT';
        
        let final_status = 'PENDING';
        if (excelInfo.inOut === 'IN' || excelInfo.level1 === 'SELECTED') final_status = 'SELECTED';
        else if (excelInfo.inOut === 'OUT') final_status = 'REJECTED';
        
        const { error } = await supabase.from('trial_progress').update({
            l1_called,
            l1_attendance,
            final_status
        }).eq('candidate_id', candidate.id);
        
        if (error) console.error("Error updating progress for", candidate.id, error);
    }

    // Insert missing registrations into trial_candidates and then trial_progress
    for (const missing of missingInCandidates) {
        const { reg, excelInfo } = missing;
        
        // 1. Insert into trial_candidates
        const { data: newCandidate, error: candError } = await supabase.from('trial_candidates').insert({
            name: reg.full_name,
            mobile: reg.phone,
            email: reg.email,
            state: reg.state,
            proficiency: reg.position,
            payment_status: reg.payment_status
        }).select().single();

        if (candError) {
            console.error("Error inserting candidate for", reg.phone, candError);
            continue;
        }

        // 2. Insert into trial_progress
        const l1_called = excelInfo.called === 'CALLED FOR';
        let l1_attendance = 'PENDING';
        if (excelInfo.attendance === 'PRESENT') l1_attendance = 'ATTENDED';
        else if (excelInfo.attendance === 'ABSENT') l1_attendance = 'ABSENT';
        
        let final_status = 'PENDING';
        if (excelInfo.inOut === 'IN' || excelInfo.level1 === 'SELECTED') final_status = 'SELECTED';
        else if (excelInfo.inOut === 'OUT') final_status = 'REJECTED';
        // Some columns could be different but let's stick to standard mappings
        
        const { error: progError } = await supabase.from('trial_progress').insert({
            candidate_id: newCandidate.id,
            l1_called,
            l1_attendance,
            final_status
        });

        if (progError) {
            console.error("Error inserting progress for", newCandidate.id, progError);
        }
    }
    
    console.log("Update completed.");
}

main().catch(console.error);
