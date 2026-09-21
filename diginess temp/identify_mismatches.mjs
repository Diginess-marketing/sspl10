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
    return String(num).replace(/\D/g, '').slice(-10);
}

async function main() {
    // 1. Load Excel
    const fileBuffer = fs.readFileSync('C:\\Users\\ADMIN\\Downloads\\Net Captured v1 06-05-26.xlsx');
    const workbook = XLSX.read(fileBuffer, {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet);
    
    const excelMap = new Map();
    excelData.forEach(row => {
        const phone = normalizePhone(row['CONTACTV1'] || row['CONTACT']);
        if (phone) {
            excelMap.set(phone, {
                called: row['STATUS (CALLED FOR / NOT CALLED FOR)'],
                attendance: row['STATUS (PRESENT / ABSENT)'],
                level1: row['LEVEL 1'],
                level2: row['LEVEL 2'],
                level3: row['LEVEL 3'],
                inOut: row['IN / OUT']
            });
        }
    });

    // 2. Fetch candidates & progress
    let allCandidates = [];
    let from = 0;
    const limit = 1000;
    while (true) {
        const { data, error } = await supabase.from('trial_candidates').select('*').range(from, from + limit - 1);
        if (error) throw error;
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allProgress = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase.from('trial_progress').select('*').range(from, from + limit - 1);
        if (error) throw error;
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const progressMap = new Map();
    allProgress.forEach(p => progressMap.set(p.candidate_id, p));

    // 3. Find mismatches
    let mismatches = [];
    let missingInCandidates = [];

    for (const c of allCandidates) {
        const phone = normalizePhone(c.mobile);
        const p = progressMap.get(c.id);
        
        // Is pending in Uncalled Report?
        const isPending = !p || !p.l1_called || p.l1_attendance === 'PENDING';
        
        if (isPending && excelMap.has(phone)) {
            const excelInfo = excelMap.get(phone);
            
            // Check if Excel has it properly marked
            if (excelInfo.called === 'CALLED FOR' || excelInfo.attendance === 'PRESENT' || excelInfo.attendance === 'ABSENT' || excelInfo.inOut) {
                mismatches.push({
                    candidate: c,
                    progress: p,
                    excelInfo: excelInfo
                });
            }
        }
    }

    // What about players not even in candidates but in Excel?
    // Let's fetch registrations
    let allRegs = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase.from('player_registrations').select('*').range(from, from + limit - 1);
        if (error) throw error;
        allRegs = allRegs.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const candidateMobiles = new Set(allCandidates.map(c => normalizePhone(c.mobile)));
    for (const r of allRegs) {
        const phone = normalizePhone(r.phone);
        if (!candidateMobiles.has(phone) && excelMap.has(phone)) {
            const excelInfo = excelMap.get(phone);
            if (excelInfo.called === 'CALLED FOR' || excelInfo.attendance === 'PRESENT' || excelInfo.attendance === 'ABSENT' || excelInfo.inOut) {
                missingInCandidates.push({
                    reg: r,
                    excelInfo: excelInfo
                });
            }
        }
    }

    console.log(`Found ${mismatches.length} candidates with mismatched progress.`);
    if (mismatches.length > 0) {
        console.log("Sample mismatch:", mismatches[0]);
    }
    console.log(`Found ${missingInCandidates.length} registrations not in candidates but in Excel.`);
    if (missingInCandidates.length > 0) {
        console.log("Sample missing:", missingInCandidates[0]);
    }
    
    // Output mismatches to a file for easy viewing
    fs.writeFileSync('mismatches.json', JSON.stringify({mismatches, missingInCandidates}, null, 2));
}

main().catch(console.error);
