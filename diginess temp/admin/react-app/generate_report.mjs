import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import fs from 'fs';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching all player registrations for UTM info...");
    let allRegistrations = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        const { data, error } = await supabase
            .from('player_registrations')
            .select(`phone, full_name, position, utm_source, utm_campaign`)
            .range(from, to);

        if (error) {
            console.error('Supabase error:', error);
            break;
        }

        if (data && data.length > 0) {
            allRegistrations = [...allRegistrations, ...data];
            page++;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }

    console.log(`Fetched ${allRegistrations.length} registrations.`);
    
    const dbMap = {};
    for (const reg of allRegistrations) {
        if (reg.phone) {
            const phoneStr = String(reg.phone).replace(/\D/g, '').slice(-10);
            dbMap[phoneStr] = {
                name: reg.full_name,
                position: reg.position,
                utm_source: reg.utm_source ? reg.utm_source.toLowerCase() : '',
                utm_campaign: reg.utm_campaign ? reg.utm_campaign.toLowerCase() : ''
            };
        }
    }

    const isKartikeyanCampaign = (dbInfo) => {
        if (!dbInfo) return false;
        const source = dbInfo.utm_source || '';
        const campaign = dbInfo.utm_campaign || '';
        if (source.includes('kartikeyan') || source.includes('karthikeyan')) return true;
        if (campaign.includes('coimbatore')) return true;
        return false;
    };

    const outputData = [];
    let sno = 1;

    // Process Net Captured
    console.log("Reading Net Captured Excel...");
    const netCapturedPath = 'C:\\Users\\ADMIN\\Downloads\\Net Captured v1 06-05-26.xlsx';
    const workbook = xlsx.readFile(netCapturedPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const netData = xlsx.utils.sheet_to_json(sheet);

    console.log(`Read ${netData.length} rows from Net Captured.`);

    for (const row of netData) {
        let contact = row['CONTACTV1'] || row['CONTACT'];
        if (!contact) continue;
        
        let contactStr = String(contact).replace(/\D/g, '').slice(-10);
        let dbInfo = dbMap[contactStr] || {};
        
        if (isKartikeyanCampaign(dbInfo)) {
            continue; // Exclude
        }

        let name = row['NAME'];
        if ((!name || name === 'NOT FOUND') && dbInfo.name) {
            name = dbInfo.name;
        }

        let role = dbInfo.position || 'NOT FOUND';

        const formatLevel = (val) => {
            if (!val) return '';
            const str = String(val).trim().toUpperCase();
            if (str === 'SELECTED') return 'Selected';
            if (str === 'NOT SELECTED') return 'Not Selected';
            if (str === 'ABSENTEES') return 'Absentee';
            return str;
        };

        outputData.push({
            'Sno': sno++,
            'Name': name,
            'Mobile No': contactStr,
            'Role': role,
            'Level 1': formatLevel(row['LEVEL 1']),
            'Level 2': formatLevel(row['LEVEL 2']),
            'Level 3': formatLevel(row['LEVEL 3']),
            'Level 4': '',
            'Level 5': ''
        });
    }

    // Now fetch the "Not Called For" players directly using the dashboard logic
    console.log("Fetching 'Not Called For' players based on dashboard logic...");
    const { data: latestImportData } = await supabase.from('trial_candidates').select('imported_at').order('imported_at', { ascending: false }).limit(1);
    const lastImportDate = latestImportData?.[0]?.imported_at || '1970-01-01T00:00:00.000Z';
    
    const [{ data: calledData }, { data: capturedData }, { data: notCalledTrialData }] = await Promise.all([
        supabase.from('trial_view').select('mobile, phone').eq('l1_called', true),
        supabase.from('player_registrations')
            .select('full_name, phone, email, state, city, position, utm_source, utm_campaign')
            .in('payment_status', ['captured', 'completed', 'paid', 'success', 'CAPTURED', 'COMPLETED', 'PAID', 'SUCCESS'])
            .gt('created_at', lastImportDate),
        supabase.from('trial_view').select('name, mobile, email, state, city, proficiency, l1_called').neq('l1_called', true)
    ]);
    
    const calledPhones = new Set();
    calledData?.forEach(d => {
        if (d.mobile) calledPhones.add(String(d.mobile).replace(/\D/g, '').slice(-10));
        if (d.phone) calledPhones.add(String(d.phone).replace(/\D/g, '').slice(-10));
    });
    
    const notCalledList = capturedData?.filter(d => {
        const pStr = String(d.phone).replace(/\D/g, '').slice(-10);
        return !calledPhones.has(pStr);
    }) || [];
    const notCalledTrialList = notCalledTrialData || [];

    const rawNotCalledPlayers = [...notCalledList, ...notCalledTrialList];
    console.log(`Found ${rawNotCalledPlayers.length} total players not called for.`);

    let addedNotCalled = 0;
    for (const player of rawNotCalledPlayers) {
        let contact = player.phone || player.mobile;
        if (!contact) continue;

        let contactStr = String(contact).replace(/\D/g, '').slice(-10);
        let dbInfo = dbMap[contactStr] || {
            name: player.full_name || player.name,
            position: player.position || player.proficiency,
            utm_source: player.utm_source ? player.utm_source.toLowerCase() : '',
            utm_campaign: player.utm_campaign ? player.utm_campaign.toLowerCase() : ''
        };

        if (isKartikeyanCampaign(dbInfo)) {
            console.log("Excluded Kartikeyan from Not Called For:", contactStr);
            continue; // Exclude
        }

        let name = player.full_name || player.name || dbInfo.name || 'NOT FOUND';
        let role = player.position || player.proficiency || dbInfo.position || 'NOT FOUND';

        outputData.push({
            'Sno': sno++,
            'Name': name,
            'Mobile No': contactStr,
            'Role': role,
            'Level 1': 'Not Called For',
            'Level 2': '',
            'Level 3': '',
            'Level 4': '',
            'Level 5': ''
        });
        addedNotCalled++;
    }

    console.log(`Added ${addedNotCalled} players from 'Not Called For' list.`);

    console.log(`Writing ${outputData.length} rows to Selection_Format excel...`);
    const targetPath = 'C:\\Users\\ADMIN\\Downloads\\Selection_Format for Trials on 18-07-2026.xlsx';
    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.json_to_sheet(outputData);
    xlsx.utils.book_append_sheet(newWb, newWs, "Selection");
    xlsx.writeFile(newWb, targetPath);
    console.log("Done.");
}

run();
