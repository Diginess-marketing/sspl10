import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizePhone(num) {
    if (!num) return '';
    return num.replace(/\D/g, '').slice(-10);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}

async function main() {
    let allRegs = [];
    let from = 0;
    const limit = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('player_registrations')
            .select('id, full_name, email, phone, state, city, position, payment_status, created_at')
            .eq('payment_status', 'captured')
            .range(from, from + limit - 1);
        
        if (error) break;
        allRegs = allRegs.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allCandidates = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_candidates')
            .select('id, name, mobile, email, state, proficiency, payment_status, imported_at')
            .range(from, from + limit - 1);
        
        if (error) break;
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allProgress = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('candidate_id, l1_called, l1_attendance, final_status')
            .range(from, from + limit - 1);
        
        if (error) break;
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const progressMap = new Map();
    allProgress.forEach(p => {
        progressMap.set(p.candidate_id, p);
    });

    const regMap = new Map();
    allRegs.forEach(r => {
        regMap.set(normalizePhone(r.phone), r);
    });

    const notCalled = [];
    
    // 1. Players in trial_candidates who were NOT called
    const candidateMobiles = new Set();
    for (const c of allCandidates) {
        const normPhone = normalizePhone(c.mobile);
        candidateMobiles.add(normPhone);
        const p = progressMap.get(c.id);
        const matchedReg = regMap.get(normPhone);
        
        if (!p || !p.l1_called || p.l1_attendance === 'PENDING') {
            notCalled.push({
                'Source': 'trial_candidates',
                'Name': c.name,
                'Mobile': c.mobile,
                'Email': c.email,
                'State': c.state,
                'City': matchedReg ? matchedReg.city : 'N/A',
                'Position': c.proficiency,
                'Payment Status': c.payment_status,
                'Attendance': p ? p.l1_attendance : 'N/A',
                'Selection Status': p ? p.final_status : 'N/A',
                'Registration Date': matchedReg ? formatDate(matchedReg.created_at) : formatDate(c.imported_at),
                'Reason': 'l1_called is false or Attendance is PENDING'
            });
        }
    }

    // 2. Players in registrations who paid but are not in trial_candidates
    for (const r of allRegs) {
        if (!candidateMobiles.has(normalizePhone(r.phone))) {
            notCalled.push({
                'Source': 'player_registrations',
                'Name': r.full_name,
                'Mobile': r.phone,
                'Email': r.email,
                'State': r.state,
                'City': r.city,
                'Position': r.position,
                'Payment Status': r.payment_status,
                'Attendance': 'PENDING (Not Called)',
                'Selection Status': 'PENDING',
                'Registration Date': formatDate(r.created_at),
                'Reason': 'Registered and paid recently, not yet assigned to trials'
            });
        }
    }

    // Sort by Registration Date descending
    notCalled.sort((a, b) => new Date(b['Registration Date']) - new Date(a['Registration Date']));
    
    // Save to XLSX
    const worksheet = XLSX.utils.json_to_sheet(notCalled);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Not Called Players');
    const outFile = 'Accurate_Players_Not_Called_v2.xlsx';
    XLSX.writeFile(workbook, outFile);

    // Create a markdown file to read it
    let md = `# Uncalled Players Report\n\n`;
    md += `This list shows the ${notCalled.length} paid players who have not been assigned to or called for any trial. They are ordered by registration date (newest first).\n\n`;
    md += `| Registration Date | Name | Mobile | State | Status |\n`;
    md += `| --- | --- | --- | --- | --- |\n`;
    for (const player of notCalled) {
        md += `| ${player['Registration Date']} | ${player['Name']} | ${player['Mobile']} | ${player['State']} | ${player['Selection Status']} |\n`;
    }
    fs.writeFileSync('uncalled_players.md', md);
}

main();
