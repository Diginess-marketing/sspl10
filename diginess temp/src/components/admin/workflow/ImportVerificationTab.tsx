import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, CheckCircle2, AlertCircle, RefreshCw, 
  ArrowRight, Download, FileSpreadsheet, Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import stagingData from '@/data/registration_import_staging.json';

interface StagingRecord {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  position: string;
  payment_status: string;
  status: string;
  import_batch: string;
}

export const ImportVerificationTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<(StagingRecord & { dbStatus?: 'new' | 'duplicate' | 'conflict'; existingData?: any })[]>([]);
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initialize records from staging JSON
    setRecords(stagingData as any);
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const phones = records.map(r => r.phone);
      // Batch check phones in Supabase
      const { data: existing, error } = await supabase
        .from('player_registrations')
        .select('phone, full_name, payment_status, status')
        .in('phone', phones);

      if (error) throw error;

      const existingMap = new Map(existing.map(e => [e.phone, e]));

      const updatedRecords = records.map(r => {
        const dbRecord = existingMap.get(r.phone);
        if (!dbRecord) return { ...r, dbStatus: 'new' as const };
        
        // Check for conflicts (e.g. name mismatch)
        const isConflict = dbRecord.full_name.toLowerCase() !== r.full_name.toLowerCase();
        return { 
          ...r, 
          dbStatus: isConflict ? 'conflict' as const : 'duplicate' as const,
          existingData: dbRecord
        };
      });

      setRecords(updatedRecords);
      toast.success('Database status check completed');
    } catch (err: any) {
      toast.error('Failed to check database status: ' + err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSync = async () => {
    const toSync = records.filter(r => selectedPhones.has(r.phone) && r.dbStatus === 'new');
    if (toSync.length === 0) {
      toast.error('No new records selected for sync');
      return;
    }

    setIsSyncing(true);
    try {
      let successCount = 0;
      for (const record of toSync) {
        const { full_name, phone, email, date_of_birth, city, state, position, payment_status, status } = record as any;
        
        // 1. Insert into player_registrations
        const { data: reg, error: regErr } = await supabase
          .from('player_registrations')
          .insert({
            full_name, phone, email, date_of_birth, city, state, position, payment_status, status
          })
          .select()
          .single();

        if (regErr) {
          console.error(`Error syncing ${phone}:`, regErr);
          continue;
        }

        // 2. Create player_workflow record (Important for trials system)
        await supabase
          .from('player_workflow')
          .insert({
            registration_id: reg.id,
            full_name,
            phone,
            state,
            city,
            payment_status,
            workflow_stage: status === 'absentee' ? 'absentee' : 'registered'
          });

        successCount++;
      }

      toast.success(`Successfully synced ${successCount} players to the database`);
      // Refresh status
      await checkStatus();
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.phone.includes(searchTerm) ||
    r.import_batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (phone: string) => {
    const next = new Set(selectedPhones);
    if (next.has(phone)) next.delete(phone);
    else next.add(phone);
    setSelectedPhones(next);
  };

  const selectAllNew = () => {
    const next = new Set<string>();
    records.forEach(r => {
      if (r.dbStatus === 'new') next.add(r.phone);
    });
    setSelectedPhones(next);
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Import Verification Hall
              </CardTitle>
              <CardDescription>
                Compare staging Excel data with current database before syncing.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={checkStatus} 
                disabled={isChecking}
                className="gap-2"
              >
                {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Check DB Status
              </Button>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing || selectedPhones.size === 0}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Sync Selected ({selectedPhones.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone, or batch..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={selectAllNew}>
              Select All New
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">New</Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">Duplicate</Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">Conflict</Badge>
            </div>
          </div>

          <ScrollArea className="h-[600px] border rounded-lg bg-card">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Excel Status</TableHead>
                  <TableHead>Batch File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No records found in staging. Run the extraction script first.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.phone} className={selectedPhones.has(record.phone) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedPhones.has(record.phone)}
                          onCheckedChange={() => toggleSelect(record.phone)}
                        />
                      </TableCell>
                      <TableCell>
                        {!record.dbStatus ? (
                          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                        ) : record.dbStatus === 'new' ? (
                          <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> New
                          </Badge>
                        ) : record.dbStatus === 'conflict' ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Conflict
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-100 border-amber-200">
                            Duplicate
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.full_name}
                        {record.dbStatus === 'conflict' && (
                          <div className="text-[10px] text-red-500 mt-0.5">DB: {record.existingData?.full_name}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.phone}</TableCell>
                      <TableCell>{record.city}, {record.state}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">{record.payment_status}</span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">{record.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                        {record.import_batch}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {filteredRecords.length} records in staging</div>
            <div>{selectedPhones.size} selected for sync</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
