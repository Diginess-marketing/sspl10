import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, Database, Trash2, CheckCircle2, Clock, PlayCircle, PauseCircle } from 'lucide-react';
import { PageHeader, ActionButton, DataTableShell, ConfirmDialog } from '@/components/admin/ui';

interface Campaign {
    id: string;
    name: string | null;
    message_template: string | null;
    status: string | null;
    created_at: string;
    updated_at?: string | null;
    recipient_count?: number;
    total_sent?: number | null;
    total_failed?: number | null;
    instance_name?: string | null;
    daily_limit?: number | null;
    batch_size?: number | null;
    messages_sent_today?: number | null;
    min_delay_seconds?: number | null;
    max_delay_seconds?: number | null;
    started_at?: string | null;
    completed_at?: string | null;
    paused_at?: string | null;
    last_sent_at?: string | null;
    use_buttons?: boolean | null;
}

const WhatsAppMarketing = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const db = supabase as any;
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // New Campaign State
    const [newName, setNewName] = useState('');
    const [newTemplate, setNewTemplate] = useState('Hi {name}, this is South State Pro League! We have an update regarding your trial.');
    const [targetGroup, setTargetGroup] = useState('manual'); // manual, level1, level2, levels3
    const [csvFile, setCsvFile] = useState<File | null>(null);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const { data, error } = await db
                .from('whatsapp_campaigns')
                .select(`
                    *,
                    whatsapp_campaign_recipients(count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = (data || []).map((c: any) => {
                // Handle different structures of count returned by Supabase
                const recipientsData = c.whatsapp_campaign_recipients as any;
                const recipientCount = Array.isArray(recipientsData) 
                    ? (recipientsData[0]?.count || 0) 
                    : (recipientsData?.count || 0);

                return {
                    ...c,
                    recipient_count: recipientCount as number,
                };
            });

            setCampaigns(formatted);
        } catch (error) {
            console.error('Failed to load campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const handleCreateCampaign = async () => {
        if (!newName || !newTemplate) {
            toast.error('Name and template are required');
            return;
        }

        try {
            setIsCreating(true);

            // 1. Create Campaign
            const { data: campaign, error: cError } = await db
                .from('whatsapp_campaigns')
                .insert([{
                    name: newName,
                    message_template: newTemplate,
                    status: 'DRAFT',
                }])
                .select()
                .single();

            if (cError) throw cError;

            let recipients: any[] = [];

            // 2. Fetch/Parse Recipients
            if (targetGroup === 'manual' && csvFile) {
                // Simplified CSV parsing for demo - in real world use a library
                const text = await csvFile.text();
                const lines = text.split('\n').filter(l => l.trim());
                recipients = lines.slice(1).map((line: string) => {
                    const [name, mobile] = line.split(',');
                    return {
                        campaign_id: campaign.id,
                        name: name?.trim(),
                        mobile: mobile?.trim(),
                    };
                }).filter((r: any) => r.mobile);
            } else if (targetGroup.startsWith('level')) {
                const level = parseInt(targetGroup.replace('level', ''), 10);
                // Use RPC or fetch from trial_candidates
                const { data: players, error: pError } = await db
                    .from('trial_candidates')
                    .select('name, mobile, trial_progress!inner(current_level)')
                    .eq('trial_progress.current_level', level);

                if (pError) throw pError;

                recipients = (players || []).map((p: any) => ({
                    campaign_id: campaign.id,
                    name: p.name,
                    mobile: p.mobile || (p as any).phone, // Fallback to phone if mobile is null
                }));
            }

            // 3. Insert Recipients
            if (recipients.length > 0) {
                const { error: rError } = await db
                    .from('whatsapp_campaign_recipients')
                    .insert(recipients);
                if (rError) throw rError;
            }

            toast.success(`Campaign "${newName}" created with ${recipients.length} recipients.`);
            setNewName('');
            setCsvFile(null);
            loadCampaigns();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const updateCampaignStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await db
                .from('whatsapp_campaigns')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            loadCampaigns();
            
            let description = '';
            if (newStatus === 'READY') description = 'Campaign resumed and ready for sending.';
            if (newStatus === 'PAUSED') description = 'Campaign paused.';
            
            toast.success(description || `Campaign ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const markAsReady = (id: string) => updateCampaignStatus(id, 'READY');

    const deleteCampaign = async () => {
        if (!deleteId) return;
        try {
            setDeleting(true);
            const { error } = await db.from('whatsapp_campaigns').delete().eq('id', deleteId);
            if (error) throw error;
            toast.success('Campaign deleted');
            setDeleteId(null);
            loadCampaigns();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const statusTone = (status: string | null) =>
        status === 'READY' || status === 'COMPLETED' ? 'ok'
            : status === 'IN_PROGRESS' ? 'info'
            : status === 'PAUSED' ? 'warn'
            : 'neutral';


    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Marketing"
                title={<>WhatsApp <em>marketing</em></>}
                description="Create bulk message campaigns for your players."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="admin-card lg:col-span-1">
                    <header className="flex items-center gap-3 border-b border-[var(--admin-line)] p-5">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)]"><Send className="h-5 w-5" /></span>
                        <h2 className="admin-h3">New campaign</h2>
                    </header>
                    <div className="space-y-4 p-5">
                        <div>
                            <label className="admin-label" htmlFor="wa-name">Campaign name</label>
                            <input id="wa-name" className="admin-field" placeholder="e.g., Level 2 Hyderabad Trials" value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>

                        <div>
                            <label className="admin-label" htmlFor="wa-template">Message template</label>
                            <textarea
                                id="wa-template"
                                className="admin-field !h-auto min-h-[120px] py-3"
                                value={newTemplate}
                                onChange={e => setNewTemplate(e.target.value)}
                            />
                            <p className="admin-muted mt-1">Use {'{name}'} for personalization.</p>
                        </div>

                        <div>
                            <label className="admin-label" htmlFor="wa-source">Recipient source</label>
                            <select id="wa-source" className="admin-select w-full" value={targetGroup} onChange={e => setTargetGroup(e.target.value)}>
                                <option value="manual">Manual (CSV upload)</option>
                                <option value="level1">All level 1 players</option>
                                <option value="level2">All level 2 players</option>
                                <option value="level3">All level 3 players</option>
                            </select>
                        </div>

                        {targetGroup === 'manual' && (
                            <div>
                                <label className="admin-label" htmlFor="wa-csv">CSV file (name, mobile)</label>
                                <input id="wa-csv" type="file" accept=".csv" className="admin-field !h-auto py-2.5" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                            </div>
                        )}

                        <ActionButton variant="primary" icon={Database} loading={isCreating} onClick={handleCreateCampaign} className="w-full justify-center">
                            Create & prepare
                        </ActionButton>
                    </div>
                </section>

                <div className="lg:col-span-2">
                    <DataTableShell
                        title="Campaigns"
                        description="Draft, ready, running and finished campaigns."
                        loading={loading}
                        isEmpty={campaigns.length === 0}
                        emptyTitle="No campaigns found"
                        emptyDescription="Create your first campaign using the form."
                    >
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Campaign</th>
                                    <th>Recipients</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div className="font-semibold">{c.name}</div>
                                            <div className="admin-muted max-w-[220px] truncate">{c.message_template}</div>
                                        </td>
                                        <td><span className="admin-badge admin-badge--neutral">{c.recipient_count} total</span></td>
                                        <td><span className={`admin-badge admin-badge--${statusTone(c.status)}`}>{(c.status || 'DRAFT').replace(/_/g, ' ').toLowerCase()}</span></td>
                                        <td className="whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                {c.status === 'DRAFT' && (
                                                    <ActionButton size="sm" variant="soft" icon={CheckCircle2} onClick={() => markAsReady(c.id)}>Ready</ActionButton>
                                                )}
                                                {(c.status === 'IN_PROGRESS' || c.status === 'PAUSED') && (
                                                    <ActionButton size="sm" variant="soft" icon={PlayCircle} onClick={() => markAsReady(c.id)}>Resume</ActionButton>
                                                )}
                                                {(c.status === 'READY' || c.status === 'IN_PROGRESS') && (
                                                    <ActionButton size="sm" variant="outline" icon={PauseCircle} onClick={() => updateCampaignStatus(c.id, 'PAUSED')}>Pause</ActionButton>
                                                )}
                                                <ActionButton size="sm" variant="ghost" icon={Trash2} aria-label="Delete campaign" onClick={() => setDeleteId(c.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </DataTableShell>
                </div>
            </div>

            <div className="admin-summary">
                <Clock className="h-5 w-5 shrink-0 text-[var(--brand-blue)]" />
                <p className="admin-muted !text-[var(--admin-ink)]">
                    <strong>Note:</strong> Once a campaign is marked as <strong>READY</strong>, open your <code>whatsapp-sender</code> desktop application
                    on your computer to begin the automated sending process. Ensure you are logged into WhatsApp Web in your browser.
                </p>
            </div>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(o) => { if (!o) setDeleteId(null); }}
                title="Delete this campaign?"
                description="The campaign and its recipient list will be removed. This cannot be undone."
                confirmLabel="Delete"
                tone="danger"
                loading={deleting}
                onConfirm={deleteCampaign}
            />
        </div>
    );
};

export default WhatsAppMarketing;
