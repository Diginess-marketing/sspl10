import { useState, useMemo, type ReactNode } from 'react';
import { FileText, Download, BarChart3, MapPin, Lightbulb } from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { toast } from 'sonner';
import { StatusBadge, ActionButton, DataTableShell, StatCard } from '@/components/admin/ui';

const REPORT_TYPES = [
  { id: 'total_registrations', name: 'Total Registrations (Pool)', category: 'General' },
  { id: 'net_failed', name: 'Net Failed Registrations', category: 'General' },
  { id: 'finance', name: 'Captured Details (Finance)', category: 'Finance' },
  { id: 'call_for_trials', name: 'Call for Trials List', category: 'Trials' },
  { id: 'selection_sheet', name: 'Trial Selection Sheet', category: 'Trials' },
  { id: 'trial_assessment', name: 'Trials Assessment Sheet', category: 'Trials' },
];

const STATUS_WORDS = ['captured', 'success', 'paid', 'completed', 'selected', 'attended', 'present', 'failed', 'rejected', 'absent', 'pending', 'in_progress', 'not_selected'];

const renderCell = (key: string, value: unknown): ReactNode => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return <StatusBadge status={value ? 'active' : 'neutral'} label={value ? 'Yes' : 'No'} />;

  const v = String(value).toLowerCase();
  if (STATUS_WORDS.includes(v)) return <StatusBadge status={v === 'in_progress' ? 'pending' : v} />;

  if (key === 'amount' && typeof value === 'number') return `₹${value.toLocaleString('en-IN')}`;

  if (key.endsWith('_at') || key.endsWith('_date')) {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-IN');
  }
  return String(value);
};

export const TrialsReportViewer = () => {
  const [selectedReport, setSelectedReport] = useState<string>('trial_assessment');
  const [level, setLevel] = useState<string>('1');
  const [location, setLocation] = useState<string>('Bangalore');
  const [reportData, setReportData] = useState<any[]>([]);
  const [generated, setGenerated] = useState(false);
  const { getReportData, loading } = usePlayerWorkflow();

  const isLevelRequired = selectedReport === 'call_for_trials' || selectedReport === 'selection_sheet';
  const isLocationRequired = selectedReport === 'trial_assessment';

  const loadReport = async () => {
    const params: { level?: number; location?: string } = {};
    if (isLevelRequired) params.level = parseInt(level, 10);
    if (isLocationRequired) params.location = location;

    const data = await getReportData(selectedReport, params);
    setReportData(data || []);
    setGenerated(true);
    if (data && data.length > 0) toast.success(`Generated ${data.length} records`);
    else toast.info('No records found for the selected criteria');
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      const headers = Object.keys(reportData[0]);
      const csvContent = [
        headers.join(','),
        ...reportData.map((row) =>
          headers.map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','),
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sspl_report_${selectedReport}${isLevelRequired ? `_lvl${level}` : ''}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  const currentReport = useMemo(() => REPORT_TYPES.find((r) => r.id === selectedReport), [selectedReport]);
  const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      <section className="admin-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="admin-eyebrow">Reporting hub</p>
            <h2 className="admin-h3">Select and generate operational reports</h2>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="admin-label" htmlFor="report-type">Type</label>
              <select id="report-type" className="admin-select" value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
                {REPORT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.category} - {t.name}</option>)}
              </select>
            </div>

            {isLevelRequired && (
              <div>
                <label className="admin-label" htmlFor="report-level">Level</label>
                <select id="report-level" className="admin-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                </select>
              </div>
            )}

            {isLocationRequired && (
              <div>
                <label className="admin-label" htmlFor="report-location">Location</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-ink-soft)]" />
                  <input
                    id="report-location"
                    className="admin-input !pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or state"
                  />
                </div>
              </div>
            )}

            <ActionButton variant="primary" icon={BarChart3} loading={loading} onClick={loadReport}>Generate</ActionButton>
          </div>
        </div>
      </section>

      {generated && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Report" value={<span className="!text-[length:var(--brand-fs-h3)]">{currentReport?.name}</span>} icon={FileText} hint={currentReport?.category} />
          <StatCard label="Records" value={reportData.length.toLocaleString('en-IN')} icon={BarChart3} tone="lime" hint={reportData.length > 50 ? 'Preview shows the first 50' : 'All records shown'} />
        </div>
      )}

      <DataTableShell
        title={generated ? currentReport?.name : 'Report preview'}
        description={generated ? undefined : 'Pick a report type and press Generate to preview results.'}
        loading={loading}
        isEmpty={!generated || reportData.length === 0}
        emptyTitle={generated ? 'No records found' : 'No data generated yet'}
        emptyDescription={generated ? 'Nothing matches the selected criteria.' : 'Choose a report type above, then press Generate.'}
        actions={reportData.length > 0 ? <ActionButton variant="outline" icon={Download} onClick={handleExport}>Export full CSV</ActionButton> : undefined}
      >
        <table className="admin-table">
          <thead>
            <tr>{columns.map((h) => <th key={h} className="capitalize">{h.replace(/_/g, ' ')}</th>)}</tr>
          </thead>
          <tbody>
            {reportData.slice(0, 50).map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => <td key={col} className="whitespace-nowrap">{renderCell(col, row[col])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length > 50 && (
          <p className="admin-muted p-4 text-center">Viewing first 50 records. Download the CSV to see all {reportData.length}.</p>
        )}
      </DataTableShell>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="admin-card p-5">
          <p className="admin-eyebrow">Report descriptions</p>
          <ul className="admin-muted space-y-2">
            <li><strong>Total Registrations</strong>: every player who started registration on the platform.</li>
            <li><strong>Call for Trials</strong>: candidates eligible for Level 1, 2 or 3 calling.</li>
            <li><strong>Selection Sheet</strong>: results and evaluations for a trial level.</li>
            <li><strong>Assessment Sheet</strong>: location-based view of all candidates and their status from registration to selection.</li>
          </ul>
        </section>
        <section className="admin-hero flex items-center gap-4 p-5">
          <Lightbulb className="h-6 w-6 shrink-0" />
          <div>
            <p className="admin-h3 !text-inherit">Quick tip</p>
            <p className="admin-muted !text-inherit mt-1">
              Selection sheets include proficiency and state by default, so selectors can build balanced teams from the trial pool.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
