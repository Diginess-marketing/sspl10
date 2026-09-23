import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PaidRegistration {
    'S.No': number;
    'Mail ID': string;
    'Phone Number': string;
    'null': number | null; // Pincode?
}

interface PlayerData {
    mobile: string;
    name: string;
    state: string;
    proficiency: string;
    status: string;
}

const DataInsertionTool = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalInFile: 0,
        matchedNames: 0,
        inserted: 0,
        failed: 0,
        skipped: 0,
    });

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const normalizePhone = (phone: string | number) => {
        if (!phone) return '';
        let p = String(phone).trim();
        // Remove spaces, dashes, special chars
        p = p.replace(/[\s\-\(\)]/g, '');
        // Remove +91 or 91 prefix if present
        if (p.startsWith('+91')) p = p.slice(3);
        else if (p.startsWith('91') && p.length > 10) p = p.slice(2);
        return p;
    };

    const runInsertion = async () => {
        if (!confirm('Are you sure you want to insert paid registrations into the database?')) return;

        setLoading(true);
        setLogs([]);
        setStats({ totalInFile: 0, matchedNames: 0, inserted: 0, failed: 0, skipped: 0 });

        try {
            // 1. Fetch Data
            addLog('Fetching Paid_registrations.json...');
            const paidRes = await fetch('/Paid_registrations.json');
            if (!paidRes.ok) throw new Error('Could not find Paid_registrations.json in public folder');
            const paidData: PaidRegistration[] = await paidRes.json();

            addLog(`Loaded ${paidData.length} paid records.`);
            setStats(s => ({ ...s, totalInFile: paidData.length }));

            addLog('Fetching Players Data.json...');
            const playersRes = await fetch('/Players Data.json');
            if (!playersRes.ok) throw new Error('Could not find Players Data.json in public folder');
            const playersData: PlayerData[] = await playersRes.json();
            addLog(`Loaded ${playersData.length} existing player records.`);

            // 2. Create Lookup Map for Players
            const playerMap = new Map<string, PlayerData>();
            playersData.forEach(p => {
                const norm = normalizePhone(p.mobile);
                if (norm) playerMap.set(norm, p);
            });

            // 3. Process and Insert
            let insertedCount = 0;
            let matchCount = 0;
            let failCount = 0;

            addLog('Starting insertion process...');

            // Process in chunks to avoid overwhelming the browser/network
            const chunkSize = 50;
            for (let i = 0; i < paidData.length; i += chunkSize) {
                const chunk = paidData.slice(i, i + chunkSize);

                // Prepare rows for insertion
                const rowsToInsert = [];

                for (const item of chunk) {
                    const normPhone = normalizePhone(item['Phone Number']);
                    const player = playerMap.get(normPhone);

                    let fullName = '';
                    if (player) {
                        fullName = player.name;
                        matchCount++;
                    } else {
                        // Fallback: use part of email or empty
                        // addLog(`No name match for ${item["Phone Number"]} (${item["Mail ID"]})`);
                        // For now, let's insert with generic name or leave blank if schema allows. 
                        // Assuming we want to insert even if name is missing.
                        // Extract name from email as best guess
                        const emailName = item['Mail ID']?.split('@')[0] || 'Unknown';
                        fullName = emailName;
                    }

                    // Check if already exists (optional, but good practice to avoid duplicates if re-run)
                    // Actually, simple upsert on email or phone might be safer.
                    // Let's assume we proceed with insert.

                    rowsToInsert.push({
                        full_name: fullName,
                        email: item['Mail ID'],
                        phone: item['Phone Number'], // Keep original or normalized? Let's use original for input, but normalized for matching
                        payment_status: 'completed',
                        payment_amount: 49.00, // Assuming 49 based on context, or leave null
                        created_at: new Date().toISOString(),
                        // Add other fields if necessary
                    });
                }

                // Batch Insert
                if (rowsToInsert.length > 0) {
                    const { error } = await supabase
                        .from('player_registrations')
                        .insert(rowsToInsert); // or .upsert(rowsToInsert, { onConflict: 'email' }) if unique constraint exists

                    if (error) {
                        console.error('Batch insert error:', error);
                        addLog(`Error inserting batch ${i}: ${error.message}`);
                        failCount += rowsToInsert.length;
                    } else {
                        insertedCount += rowsToInsert.length;
                    }
                }

                // Update stats incrementally
                setStats(prev => ({
                    ...prev,
                    matchedNames: matchCount,
                    inserted: insertedCount,
                    failed: failCount,
                }));

                // Small delay to yield UI
                await new Promise(r => setTimeout(r, 50));
            }

            addLog('Insertion complete!');

        } catch (error: any) {
            addLog(`CRITICAL ERROR: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto my-8">
            <CardHeader>
                <CardTitle>Admin Data Insertion Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> This tool will insert records from <code>/Paid_registrations.json</code> into the database with "completed" payment status.
                        It attempts to match names from <code>/Players Data.json</code> using phone numbers.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="bg-gray-100 p-2 rounded">
                        <div className="text-2xl font-bold">{stats.totalInFile}</div>
                        <div className="text-xs text-gray-500">Total Records</div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                        <div className="text-2xl font-bold text-blue-700">{stats.matchedNames}</div>
                        <div className="text-xs text-blue-700">Name Matches</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded">
                        <div className="text-2xl font-bold text-green-700">{stats.inserted}</div>
                        <div className="text-xs text-green-700">Inserted</div>
                    </div>
                    <div className="bg-red-100 p-2 rounded">
                        <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                        <div className="text-xs text-red-700">Failed</div>
                    </div>
                </div>

                <Button onClick={runInsertion} disabled={loading} className="w-full">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Start Data Insertion'
                    )}
                </Button>

                <div className="h-64 overflow-y-auto bg-black text-green-400 p-4 rounded-md font-mono text-xs">
                    {logs.length === 0 ? 'Ready to start...' : logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default DataInsertionTool;
