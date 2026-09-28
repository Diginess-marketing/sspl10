import { TrialsReportViewer } from '@/components/admin/workflow/TrialsReportViewer';
import { FileStack, Download, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';

const NOTES = [
    { icon: FileStack, title: 'Operational continuity', text: 'Reports are updated in real-time as selectors mark results in the Trials Section.' },
    { icon: Download, title: 'High speed export', text: 'CSV exports are generated on the fly, handling thousands of records efficiently.' },
    { icon: ShieldCheck, title: 'Audit ready', text: 'Every report is linked to the core database views ensuring 100% data integrity.' },
];

const AdminReports = () => (
    <div className="space-y-6">
        <PageHeader
            eyebrow="Exports"
            title={<>System <em>reports</em></>}
            description="Export historical and operational data for registrations and trials."
        />

        <div className="admin-summary" role="note">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-accent)]" />
            <div>
                <h2 className="admin-h3">Data privacy notice</h2>
                <p className="admin-muted mt-1">
                    Reports contain sensitive player information (phone numbers, emails). Ensure downloaded CSV files are
                    stored securely and only shared with authorized personnel.
                </p>
            </div>
        </div>

        <div className="min-w-0"><TrialsReportViewer /></div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {NOTES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="admin-card flex items-start gap-4 p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)]">
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="admin-h3">{title}</h3>
                        <p className="admin-muted mt-1">{text}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default AdminReports;
