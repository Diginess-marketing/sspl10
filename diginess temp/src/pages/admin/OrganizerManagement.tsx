import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RefreshCw, Users, Clock, Eye, Building2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { ActionButton, ConfirmDialog, DataTableShell, DetailDrawer, PageHeader, StatCard, StatusBadge } from '@/components/admin/ui';

interface Organizer {
    id: string;
    organisation_name: string;
    organiser_name: string;
    mobile_primary: string;
    city_district: string;
    state: string;
    tournament_type: string;
    expected_teams: string;
    status: string;
    created_at: string;
    email?: string | null;
    kit_status?: string | null;
    kit_tracking?: string | null;
    kit_updated_at?: string | null;
    event_results?: string | null;
}

const KIT_STEPS = ['approved', 'packed', 'dispatched', 'delivered'] as const;

const OrganizerManagement = () => {
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [detail, setDetail] = useState<Organizer | null>(null);
    const [pending, setPending] = useState<{ organizer: Organizer; status: 'approved' | 'rejected' } | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrganizers();
    }, []);

    const fetchOrganizers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tournament_organizers' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setOrganizers((data as any) || []);
        } catch (error: any) {
            console.error('Error fetching organizers:', error);
            toast.error('Failed to fetch organizers');
        } finally {
            setLoading(false);
        }
    };

    const [kitDraft, setKitDraft] = useState({ tracking: '', results: '' });
    useEffect(() => { setKitDraft({ tracking: detail?.kit_tracking || '', results: detail?.event_results || '' }); }, [detail?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveKit = async (changes: Record<string, unknown>, done: string) => {
        if (!detail) return;
        try {
            const saved = await adminApi.patch<Organizer>(`/admin/organizers/${detail.id}`, changes);
            setOrganizers((prev) => prev.map((o) => (o.id === saved.id ? { ...o, ...saved } : o)));
            setDetail((d) => (d ? { ...d, ...saved } : d));
            toast.success(done);
        } catch (error) {
            toast.error('Not saved', { description: (error as Error).message });
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdating(true);
        try {
            // Through the backend: approval emails the organiser a welcome message
            await adminApi.patch(`/admin/organizers/${id}`, { status: newStatus });

            setOrganizers((prev) => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            setDetail((d) => (d && d.id === id ? { ...d, status: newStatus } : d));
            toast.success(`Organizer ${newStatus}`);
            setPending(null);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status', { description: (error as Error).message });
        } finally {
            setUpdating(false);
        }
    };

    const counts = useMemo(() => ({
        approved: organizers.filter((o) => o.status === 'approved').length,
        rejected: organizers.filter((o) => o.status === 'rejected').length,
        pending: organizers.filter((o) => o.status !== 'approved' && o.status !== 'rejected').length,
    }), [organizers]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return organizers
            .filter((o) => (filter === 'all' ? true : filter === 'pending' ? o.status !== 'approved' && o.status !== 'rejected' : o.status === filter))
            .filter((o) => !q || [o.organisation_name, o.organiser_name, o.mobile_primary, o.city_district, o.state, o.tournament_type]
                .some((v) => (v || '').toLowerCase().includes(q)));
    }, [organizers, search, filter]);

    const RowActions = ({ o }: { o: Organizer }) => (
        <div className="flex justify-end gap-1">
            <ActionButton variant="ghost" size="sm" icon={Eye} aria-label="View details" onClick={() => setDetail(o)} />
            <ActionButton variant="soft" size="sm" icon={CheckCircle} aria-label="Approve" disabled={o.status === 'approved'} onClick={() => setPending({ organizer: o, status: 'approved' })} />
            <ActionButton variant="danger" size="sm" icon={XCircle} aria-label="Reject" disabled={o.status === 'rejected'} onClick={() => setPending({ organizer: o, status: 'rejected' })} />
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Partners"
                title={<>Organizer <em>management</em></>}
                description="Review tournament organisers and approve or reject their applications."
                actions={<ActionButton variant="outline" icon={RefreshCw} onClick={fetchOrganizers} loading={loading}>Refresh</ActionButton>}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Awaiting review" value={counts.pending} icon={Clock} tone="amber" loading={loading} hint="Applications to look at" />
                <StatCard label="Approved" value={counts.approved} icon={CheckCircle} tone="green" loading={loading} />
                <StatCard label="Total organisers" value={organizers.length} icon={Users} loading={loading} hint={`${counts.rejected} rejected`} />
            </div>

            <DataTableShell
                title="Registered organizers"
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search organiser, city, phone…"
                filters={[
                    { value: 'all', label: 'All', count: organizers.length },
                    { value: 'pending', label: 'Pending', count: counts.pending },
                    { value: 'approved', label: 'Approved', count: counts.approved },
                    { value: 'rejected', label: 'Rejected', count: counts.rejected },
                ]}
                activeFilter={filter}
                onFilterChange={setFilter}
                loading={loading}
                isEmpty={rows.length === 0}
                emptyTitle={organizers.length === 0 ? 'No organizers registered yet' : 'No organizers match'}
                emptyDescription={organizers.length === 0 ? 'New applications will appear here.' : 'Try a different search or filter.'}
            >
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Organisation</th><th>Organiser</th><th>Contact</th><th>Location</th><th>Tournament type</th><th>Status</th><th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((o) => (
                            <tr key={o.id}>
                                <td className="font-semibold text-[var(--admin-ink)]">{o.organisation_name}</td>
                                <td>{o.organiser_name}</td>
                                <td className="admin-num !text-[var(--brand-fs-body)] whitespace-nowrap">{o.mobile_primary}</td>
                                <td>{o.city_district}, {o.state}</td>
                                <td>{o.tournament_type}</td>
                                <td><StatusBadge status={o.status} /></td>
                                <td><RowActions o={o} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataTableShell>

            <DetailDrawer
                open={Boolean(detail)}
                onOpenChange={(open) => !open && setDetail(null)}
                eyebrow="Organizer"
                title={detail?.organisation_name || ''}
                footer={detail && (
                    <>
                        <ActionButton variant="danger" icon={XCircle} disabled={detail.status === 'rejected'} onClick={() => setPending({ organizer: detail, status: 'rejected' })}>Reject</ActionButton>
                        <ActionButton variant="primary" icon={CheckCircle} disabled={detail.status === 'approved'} onClick={() => setPending({ organizer: detail, status: 'approved' })}>Approve</ActionButton>
                    </>
                )}
            >
                {detail && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <span className="admin-avatar"><Building2 className="h-5 w-5" /></span>
                            <div className="min-w-0">
                                <p className="font-semibold text-[var(--admin-ink)]">{detail.organiser_name}</p>
                                <StatusBadge status={detail.status} />
                            </div>
                        </div>
                        <dl className="admin-kv">
                            <dt>Mobile</dt><dd>{detail.mobile_primary}</dd>
                            <dt>Location</dt><dd>{detail.city_district}, {detail.state}</dd>
                            <dt>Type</dt><dd>{detail.tournament_type}</dd>
                            <dt>Teams</dt><dd>{detail.expected_teams || '-'}</dd>
                            <dt>Applied</dt><dd>{detail.created_at ? new Date(detail.created_at).toLocaleDateString() : '-'}</dd>
                        </dl>
                        {detail.status === 'approved' && (
                            <div className="space-y-4 border-t border-[var(--admin-line)] pt-4">
                                <div>
                                    <p className="admin-label">Branding kit</p>
                                    <div className="flex flex-wrap gap-2" role="group" aria-label="Kit status">
                                        {KIT_STEPS.map((step) => (
                                            <button key={step} type="button" className="admin-chip capitalize" data-active={detail.kit_status === step} aria-pressed={detail.kit_status === step}
                                                onClick={() => saveKit({ kit_status: step, kit_tracking: kitDraft.tracking || null }, `Kit marked ${step}; the organiser is emailed`)}>
                                                {step}
                                            </button>
                                        ))}
                                    </div>
                                    {detail.kit_updated_at && <p className="admin-muted mt-1 text-xs">Updated {new Date(detail.kit_updated_at).toLocaleString('en-IN')}</p>}
                                </div>
                                <div>
                                    <label htmlFor="kit-tracking" className="admin-label">Courier tracking number</label>
                                    <input id="kit-tracking" className="admin-field" value={kitDraft.tracking} onChange={(e) => setKitDraft({ ...kitDraft, tracking: e.target.value })}
                                        onBlur={() => kitDraft.tracking !== (detail.kit_tracking || '') && saveKit({ kit_tracking: kitDraft.tracking }, 'Tracking number saved')} />
                                </div>
                                <div>
                                    <label htmlFor="event-results" className="admin-label">Event results shared by the organiser</label>
                                    <textarea id="event-results" className="admin-field !h-auto min-h-[90px] py-2" value={kitDraft.results} onChange={(e) => setKitDraft({ ...kitDraft, results: e.target.value })}
                                        onBlur={() => kitDraft.results !== (detail.event_results || '') && saveKit({ event_results: kitDraft.results }, 'Event results saved')} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DetailDrawer>

            <ConfirmDialog
                open={Boolean(pending)}
                onOpenChange={(open) => !open && setPending(null)}
                tone={pending?.status === 'rejected' ? 'danger' : 'default'}
                title={pending?.status === 'rejected' ? 'Reject this organizer?' : 'Approve this organizer?'}
                description={pending ? `${pending.organizer.organisation_name} (${pending.organizer.organiser_name}) will be marked ${pending.status}.` : undefined}
                confirmLabel={pending?.status === 'rejected' ? 'Reject' : 'Approve'}
                loading={updating}
                onConfirm={async () => { if (pending) await updateStatus(pending.organizer.id, pending.status); }}
            />
        </div>
    );
};

export default OrganizerManagement;
