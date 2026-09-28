import { useState, useEffect, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { adminService, AdminReward } from '@/services/adminService';
import { Trophy, Plus, Trash2, Pencil, Coins, Gift, CheckCircle } from 'lucide-react';
import { ActionButton, ConfirmDialog, DetailDrawer, EmptyState, PageHeader, StatCard, StatusBadge } from '@/components/admin/ui';

const EMPTY_FORM = { title: '', description: '', points_cost: 100, is_active: true };

const RewardsManager = () => {
    const [rewards, setRewards] = useState<AdminReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingReward, setEditingReward] = useState<AdminReward | null>(null);
    const [deleting, setDeleting] = useState<AdminReward | null>(null);
    const [deletingBusy, setDeletingBusy] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);

    const loadRewards = async () => {
        try {
            setLoading(true);
            const data = await adminService.getRewards();
            setRewards(data);
        } catch (error) {
            console.error('Failed to load rewards', error);
            toast.error('Failed to load rewards list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRewards();
    }, []);

    const stats = useMemo(() => ({
        active: rewards.filter((r) => r.is_active).length,
        avg: rewards.length ? Math.round(rewards.reduce((s, r) => s + (r.points_cost || 0), 0) / rewards.length) : 0,
    }), [rewards]);

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            setDeletingBusy(true);
            await adminService.deleteReward(deleting.id);
            toast.success('Reward deleted');
            setDeleting(null);
            loadRewards();
        } catch (error) {
            toast.error('Failed to delete reward');
        } finally {
            setDeletingBusy(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (editingReward) {
                await adminService.updateReward(editingReward.id, formData);
                toast.success('Reward updated');
            } else {
                await adminService.createReward(formData);
                toast.success('Reward created');
            }
            closeDrawer();
            loadRewards();
        } catch (error) {
            toast.error('Failed to save reward');
        } finally {
            setSaving(false);
        }
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setFormData(EMPTY_FORM);
        setEditingReward(null);
    };

    const openCreate = () => {
        setEditingReward(null);
        setFormData(EMPTY_FORM);
        setDrawerOpen(true);
    };

    const openEdit = (reward: AdminReward) => {
        setEditingReward(reward);
        setFormData({
            title: reward.title,
            description: reward.description,
            points_cost: reward.points_cost,
            is_active: reward.is_active,
        });
        setDrawerOpen(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Loyalty"
                title={<>Rewards <em>manager</em></>}
                description="Configure redeemable rewards for users."
                actions={<ActionButton variant="primary" icon={Plus} onClick={openCreate}>Add reward</ActionButton>}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total rewards" value={rewards.length} icon={Gift} loading={loading} />
                <StatCard label="Active" value={stats.active} icon={CheckCircle} tone="green" loading={loading} hint={`${rewards.length - stats.active} in draft`} />
                <StatCard label="Avg. cost" value={`${stats.avg} pts`} icon={Coins} tone="amber" loading={loading} />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-[18px] bg-[var(--brand-sky)]" />)}
                </div>
            ) : rewards.length === 0 ? (
                <div className="admin-card">
                    <EmptyState icon={Trophy} title="No rewards yet" description="Create your first reward to get started."
                        action={<ActionButton variant="outline" icon={Plus} onClick={openCreate}>Add reward</ActionButton>} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {rewards.map((reward) => (
                        <article key={reward.id} className="admin-card admin-card--lift flex flex-col gap-4 p-5">
                            <div className="flex items-start justify-between gap-3">
                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-lime)] text-[var(--brand-navy)]">
                                    <Trophy className="h-5 w-5" />
                                </span>
                                <div className="flex gap-1">
                                    <ActionButton variant="soft" size="sm" icon={Pencil} aria-label={`Edit ${reward.title}`} onClick={() => openEdit(reward)} />
                                    <ActionButton variant="danger" size="sm" icon={Trash2} aria-label={`Delete ${reward.title}`} onClick={() => setDeleting(reward)} />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="admin-h3">{reward.title}</h2>
                                <p className="admin-muted mt-1 line-clamp-2">{reward.description}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-[var(--admin-line)] pt-4">
                                <span className="admin-num inline-flex items-center gap-2 !text-[var(--admin-accent)]">
                                    <Coins className="h-4 w-4" />{reward.points_cost} pts
                                </span>
                                <StatusBadge status={reward.is_active ? 'active' : 'pending'} label={reward.is_active ? 'Active' : 'Draft'} />
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <DetailDrawer
                open={drawerOpen}
                onOpenChange={(open) => { if (!open) closeDrawer(); }}
                eyebrow="Rewards"
                title={editingReward ? 'Edit reward' : 'Create new reward'}
                footer={
                    <>
                        <ActionButton variant="ghost" onClick={closeDrawer} disabled={saving}>Cancel</ActionButton>
                        <ActionButton variant="primary" type="submit" form="reward-form" loading={saving}>Save changes</ActionButton>
                    </>
                }
            >
                <form id="reward-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="title" className="admin-label">Title</label>
                        <input id="title" className="admin-field" value={formData.title} required
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label htmlFor="description" className="admin-label">Description</label>
                        <textarea id="description" rows={3} className="admin-field !h-auto py-3" value={formData.description} required
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label htmlFor="points" className="admin-label">Points cost</label>
                        <input id="points" type="number" min={0} className="admin-field" value={Number.isNaN(formData.points_cost) ? '' : formData.points_cost} required
                            onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) })} />
                    </div>
                    <div className="admin-summary items-center justify-between">
                        <label htmlFor="reward-active" className="admin-label !mb-0">Active (visible to users)</label>
                        <Switch id="reward-active" className="data-[state=checked]:bg-[var(--brand-blue)] data-[state=unchecked]:bg-[var(--brand-sky-2)]"
                            checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                    </div>
                </form>
            </DetailDrawer>

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                tone="danger"
                title="Delete this reward?"
                description={`“${deleting?.title ?? ''}” will be permanently removed. This cannot be undone.`}
                confirmLabel="Delete"
                loading={deletingBusy}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default RewardsManager;
