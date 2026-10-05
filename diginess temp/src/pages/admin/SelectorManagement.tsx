import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, CheckCircle, XCircle, FileText, Eye, RefreshCw, Users, Clock, ClipboardList, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, StatCard, StatusBadge, ActionButton, DataTableShell, DetailDrawer, ConfirmDialog } from '@/components/admin/ui';

interface Selector {
    id: string;
    full_name: string;
    age: number;
    email: string;
    contact_number: string;
    city_state: string;
    years_of_experience: string;
    highest_level_played: string;
    previously_worked_as_selector: string;
    availability: string[];
    preferred_region: string;
    status: string;
    document_url?: string;
    created_at: string;
}

type Decision = 'approved' | 'rejected';

const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${what} copied`); } catch { toast.error('Could not copy'); }
};

const SelectorManagement = () => {
    const [selectors, setSelectors] = useState<Selector[]>([]);
    const [active, setActive] = useState<Selector | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [pending, setPending] = useState<{ ids: string[]; decision: Decision } | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => { fetchSelectors(); }, []);

    const fetchSelectors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('selectors' as any)
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSelectors((data as any) || []);
            setSelectedIds([]);
        } catch (error: any) {
            console.error('Error fetching selectors:', error);
            toast.error('Failed to fetch selectors');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (ids: string[], newStatus: string) => {
        setBusy(true);
        try {
            const { error } = await supabase
                .from('selectors' as any)
                .update({ status: newStatus })
                .in('id', ids);
            if (error) throw error;

            setSelectors(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: newStatus } : s));
            setActive(prev => (prev && ids.includes(prev.id) ? { ...prev, status: newStatus } : prev));
            setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
            toast.success(`${ids.length} selector${ids.length > 1 ? 's' : ''} ${newStatus}`);
            setPending(null);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setBusy(false);
        }
    };

    const counts = useMemo(() => ({
        all: selectors.length,
        pending: selectors.filter(s => s.status === 'pending').length,
        approved: selectors.filter(s => s.status === 'approved').length,
        rejected: selectors.filter(s => s.status === 'rejected').length,
    }), [selectors]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return selectors.filter(s => {
            if (filter !== 'all' && s.status !== filter) return false;
            if (!q) return true;
            return [s.full_name, s.email, s.contact_number, s.city_state].some(v => v?.toLowerCase().includes(q));
        });
    }, [selectors, search, filter]);

    const allChecked = filtered.length > 0 && filtered.every(s => selectedIds.includes(s.id));
    const toggleAll = () => setSelectedIds(allChecked ? [] : filtered.map(s => s.id));
    const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const pendingNames = pending ? selectors.filter(s => pending.ids.includes(s.id)).map(s => s.full_name) : [];

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Selectors"
                title={<>Selector <em>management</em></>}
                description="Review selector applications, then approve or reject them."
                actions={<ActionButton variant="outline" icon={RefreshCw} onClick={fetchSelectors} disabled={loading}>Refresh</ActionButton>}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Applications" value={counts.all} hint="Total registered" icon={ClipboardList} loading={loading} />
                <StatCard label="Awaiting review" value={counts.pending} hint="Need a decision" icon={Clock} tone="amber" loading={loading} />
                <StatCard label="Approved" value={counts.approved} hint={`${counts.rejected} rejected`} icon={Users} tone="green" loading={loading} />
            </div>

            <DataTableShell
                title="Registered selectors"
                description={`${filtered.length} of ${selectors.length} shown`}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search name, email, city"
                filters={[
                    { value: 'all', label: 'All', count: counts.all },
                    { value: 'pending', label: 'Pending', count: counts.pending },
                    { value: 'approved', label: 'Approved', count: counts.approved },
                    { value: 'rejected', label: 'Rejected', count: counts.rejected },
                ]}
                activeFilter={filter}
                onFilterChange={setFilter}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                bulkActions={
                    <>
                        <ActionButton variant="primary" size="sm" icon={CheckCircle} onClick={() => setPending({ ids: selectedIds, decision: 'approved' })}>Approve</ActionButton>
                        <ActionButton variant="danger" size="sm" icon={XCircle} onClick={() => setPending({ ids: selectedIds, decision: 'rejected' })}>Reject</ActionButton>
                    </>
                }
                loading={loading}
                isEmpty={filtered.length === 0}
                emptyTitle={selectors.length === 0 ? 'No selectors registered yet' : 'No matching selectors'}
                emptyDescription={selectors.length === 0 ? 'Applications will appear here once submitted.' : 'Try a different search or filter.'}
            >
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th className="w-10"><input type="checkbox" aria-label="Select all" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-[var(--brand-blue)]" /></th>
                            <th>Name</th><th>Contact</th><th>Experience</th><th>Level</th><th>Location</th><th>Document</th><th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} data-selected={selectedIds.includes(s.id)}>
                                <td><input type="checkbox" aria-label={`Select ${s.full_name}`} checked={selectedIds.includes(s.id)} onChange={() => toggleOne(s.id)} className="h-4 w-4 accent-[var(--brand-blue)]" /></td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <span className="admin-avatar">{(s.full_name || '?').slice(0, 1).toUpperCase()}</span>
                                        <span className="font-semibold text-[var(--admin-ink)]">{s.full_name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="block">{s.email}</span>
                                    <span className="admin-muted">{s.contact_number}</span>
                                </td>
                                <td>{s.years_of_experience}</td>
                                <td>{s.highest_level_played}</td>
                                <td>{s.city_state}</td>
                                <td>
                                    {s.document_url ? (
                                        <a href={s.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[var(--admin-accent)] hover:underline">
                                            <Download className="h-4 w-4" />View
                                        </a>
                                    ) : <span className="admin-muted">N/A</span>}
                                </td>
                                <td><StatusBadge status={s.status} /></td>
                                <td>
                                    <div className="flex justify-end gap-1">
                                        <ActionButton variant="ghost" size="sm" icon={Eye} title="View details" aria-label="View details" onClick={() => setActive(s)} />
                                        <ActionButton variant="ghost" size="sm" icon={CheckCircle} title="Approve" aria-label="Approve" disabled={s.status === 'approved'} className="!text-[var(--admin-ok)]" onClick={() => setPending({ ids: [s.id], decision: 'approved' })} />
                                        <ActionButton variant="ghost" size="sm" icon={XCircle} title="Reject" aria-label="Reject" disabled={s.status === 'rejected'} className="!text-[var(--admin-bad)]" onClick={() => setPending({ ids: [s.id], decision: 'rejected' })} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataTableShell>

            <DetailDrawer
                open={!!active}
                onOpenChange={(o) => { if (!o) setActive(null); }}
                eyebrow="Selector application"
                title={active?.full_name || ''}
                description={active ? `${active.city_state} · applied ${new Date(active.created_at).toLocaleDateString()}` : undefined}
                footer={active && (
                    <>
                        <ActionButton variant="danger" icon={XCircle} disabled={active.status === 'rejected'} onClick={() => setPending({ ids: [active.id], decision: 'rejected' })}>Reject</ActionButton>
                        <ActionButton variant="primary" icon={CheckCircle} disabled={active.status === 'approved'} onClick={() => setPending({ ids: [active.id], decision: 'approved' })}>Approve</ActionButton>
                    </>
                )}
            >
                {active && (
                    <div className="space-y-6">
                        <StatusBadge status={active.status} />
                        <section>
                            <h3 className="admin-h3 mb-3">Personal information</h3>
                            <dl className="admin-kv">
                                <dt>Age</dt><dd>{active.age}</dd>
                                <dt>City</dt><dd>{active.city_state}</dd>
                                <dt>Contact</dt><dd><button type="button" onClick={() => copy(active.contact_number, 'Contact number')} className="inline-flex items-center gap-1.5 hover:text-[var(--admin-accent)]">{active.contact_number}<Copy className="h-3.5 w-3.5" /></button></dd>
                                <dt>Email</dt><dd><button type="button" onClick={() => copy(active.email, 'Email')} className="inline-flex items-center gap-1.5 text-left hover:text-[var(--admin-accent)]">{active.email}<Copy className="h-3.5 w-3.5 shrink-0" /></button></dd>
                            </dl>
                        </section>
                        <section>
                            <h3 className="admin-h3 mb-3">Professional details</h3>
                            <dl className="admin-kv">
                                <dt>Experience</dt><dd>{active.years_of_experience}</dd>
                                <dt>Highest level</dt><dd>{active.highest_level_played}</dd>
                                <dt>Was selector</dt><dd className="capitalize">{active.previously_worked_as_selector}</dd>
                                <dt>Region</dt><dd>{active.preferred_region}</dd>
                            </dl>
                        </section>
                        <section>
                            <h3 className="admin-h3 mb-3">Availability</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(active.availability) && active.availability.length > 0 ? (
                                    active.availability.map((day, i) => <span key={i} className="admin-badge admin-badge--info capitalize before:hidden">{day}</span>)
                                ) : <span className="admin-muted">No availability specified</span>}
                            </div>
                        </section>
                        <section>
                            <h3 className="admin-h3 mb-3">Attached document</h3>
                            {active.document_url ? (
                                <div className="admin-summary items-center">
                                    <FileText className="h-6 w-6 shrink-0 text-[var(--admin-accent)]" />
                                    <span className="min-w-0 flex-1">Document upload</span>
                                    <a href={active.document_url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline admin-btn--sm"><Download className="h-4 w-4" />View</a>
                                </div>
                            ) : <p className="admin-muted">No document attached</p>}
                        </section>
                    </div>
                )}
            </DetailDrawer>

            <ConfirmDialog
                open={!!pending}
                onOpenChange={(o) => { if (!o && !busy) setPending(null); }}
                title={pending?.decision === 'approved' ? 'Approve selectors?' : 'Reject selectors?'}
                description={pending ? `${pending.ids.length} application${pending.ids.length > 1 ? 's' : ''} will be marked ${pending.decision}.` : undefined}
                confirmLabel={pending?.decision === 'approved' ? 'Approve' : 'Reject'}
                tone={pending?.decision === 'rejected' ? 'danger' : 'default'}
                loading={busy}
                onConfirm={() => pending ? updateStatus(pending.ids, pending.decision) : undefined}
            >
                {pendingNames.length > 0 && (
                    <p className="admin-muted">{pendingNames.slice(0, 5).join(', ')}{pendingNames.length > 5 ? ` and ${pendingNames.length - 5} more` : ''}</p>
                )}
            </ConfirmDialog>
        </div>
    );
};

export default SelectorManagement;
