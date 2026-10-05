import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import stagingData from '@/data/registration_import_staging.json';
import { PageHeader, StatCard, ActionButton, DataTableShell, StatusBadge, ConfirmDialog } from '@/components/admin/ui';

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
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      const existingMap = new Map((existing || []).map((e: any) => [e.phone, e]));

      const updatedRecords = records.map(r => {
        const dbRecord = existingMap.get(r.phone);
        if (!dbRecord) return { ...r, dbStatus: 'new' as const };
        
        // Check for conflicts (e.g. name mismatch)
        const isConflict = (dbRecord.full_name || '').toLowerCase() !== (r.full_name || '').toLowerCase();
        return { 
          ...r, 
          dbStatus: isConflict ? 'conflict' as const : 'duplicate' as const,
          existingData: dbRecord,
        };
      });

      setRecords(updatedRecords);
      toast.success('Database status check completed');
    } catch (err: any) {
      toast.error(`Failed to check database status: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const requestSync = () => {
    const n = records.filter(r => selectedPhones.has(r.phone) && r.dbStatus === 'new').length;
    if (n === 0) {
      toast.error('No new records selected for sync');
      return;
    }
    setConfirmOpen(true);
  };

  const handleSync = async () => {
    const toSync = records.filter(r => selectedPhones.has(r.phone) && r.dbStatus === 'new');
    if (toSync.length === 0) {
      toast.error('No new records selected for sync');
      return;
    }

    setConfirmOpen(false);
    setIsSyncing(true);
    try {
      let successCount = 0;
      for (const record of toSync) {
        const { full_name, phone, email, date_of_birth, city, state, position, payment_status, status } = record as any;
        
        // 1. Insert into player_registrations
        const { data: reg, error: regErr } = await supabase
          .from('player_registrations')
          .insert({
            full_name, phone, email, date_of_birth, city, state, position, payment_status, status,
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
            workflow_stage: status === 'absentee' ? 'absentee' : 'registered',
          });

        successCount++;
      }

      toast.success(`Successfully synced ${successCount} players to the database`);
      // Refresh status
      await checkStatus();
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRecords = records.filter(r =>
    (r.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.phone || '').includes(searchTerm) ||
    (r.import_batch || '').toLowerCase().includes(searchTerm.toLowerCase()),
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

  const countOf = (st: 'new' | 'duplicate' | 'conflict') => records.filter(r => r.dbStatus === st).length;
  const newSelected = records.filter(r => selectedPhones.has(r.phone) && r.dbStatus === 'new').length;

  const dbBadge = (st?: 'new' | 'duplicate' | 'conflict') =>
    !st ? <span className="admin-badge admin-badge--neutral">Not checked</span>
      : st === 'new' ? <span className="admin-badge admin-badge--ok">New</span>
      : st === 'conflict' ? <span className="admin-badge admin-badge--bad">Conflict</span>
      : <span className="admin-badge admin-badge--warn">Duplicate</span>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Import"
        title={<>Verification <em>hall</em></>}
        description="Compare staging Excel data with the current database before syncing."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="In staging" value={records.length} icon={FileSpreadsheet} tone="blue" />
        <StatCard label="New" value={countOf('new')} icon={CheckSquare} tone="green" />
        <StatCard label="Duplicate" value={countOf('duplicate')} icon={CheckSquare} tone="amber" />
        <StatCard label="Conflict" value={countOf('conflict')} icon={CheckSquare} tone="amber" />
      </div>

      <DataTableShell
        title="Staging records"
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, phone or batch"
        isEmpty={filteredRecords.length === 0}
        emptyTitle="No records found in staging"
        emptyDescription="Run the extraction script first, or adjust your search."
        selectedCount={selectedPhones.size}
        onClearSelection={() => setSelectedPhones(new Set())}
        actions={
          <>
            <ActionButton variant="ghost" onClick={selectAllNew}>Select all new</ActionButton>
            <ActionButton variant="outline" icon={RefreshCw} loading={isChecking} onClick={checkStatus}>Check DB status</ActionButton>
            <ActionButton variant="primary" icon={ArrowRight} loading={isSyncing} disabled={selectedPhones.size === 0} onClick={requestSync}>
              Sync selected ({selectedPhones.size})
            </ActionButton>
          </>
        }
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10"><span className="sr-only">Select</span></th>
              <th>Status</th>
              <th>Player name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Excel status</th>
              <th>Batch file</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.phone} data-selected={selectedPhones.has(record.phone)}>
                <td>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--brand-blue)]"
                    aria-label={`Select ${record.full_name}`}
                    checked={selectedPhones.has(record.phone)}
                    onChange={() => toggleSelect(record.phone)}
                  />
                </td>
                <td>{dbBadge(record.dbStatus)}</td>
                <td>
                  <span className="font-semibold">{record.full_name}</span>
                  {record.dbStatus === 'conflict' && (
                    <div className="admin-muted !text-[var(--admin-bad)]">DB: {record.existingData?.full_name}</div>
                  )}
                </td>
                <td className="whitespace-nowrap">{record.phone}</td>
                <td>{record.city}, {record.state}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={record.payment_status} />
                    <StatusBadge status={record.status} />
                  </div>
                </td>
                <td className="admin-muted max-w-[180px] truncate">{record.import_batch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>

      <p className="admin-muted">Showing {filteredRecords.length} records in staging - {selectedPhones.size} selected for sync.</p>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sync selected players?"
        description={`${newSelected} new player${newSelected === 1 ? '' : 's'} will be written to registrations and the trials workflow.`}
        confirmLabel="Sync players"
        loading={isSyncing}
        onConfirm={handleSync}
      />
    </div>
  );
};
