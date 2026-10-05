import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Save, Settings, RefreshCw, Database, Power, Wrench } from 'lucide-react';
import DataInsertionTool from '@/components/admin/DataInsertionTool';
import { ActionButton, ConfirmDialog, PageHeader } from '@/components/admin/ui';

const SWITCH_CLS = 'data-[state=checked]:bg-[var(--brand-blue)] data-[state=unchecked]:bg-[var(--brand-sky-2)]';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmMaintenance, setConfirmMaintenance] = useState(false);

    const [generalSettings, setGeneralSettings] = useState({
        registration_fee: 499,
        maintenance_mode: false,
        enable_registrations: true,
        support_email: 'support@ssplt10.co.in',
        max_registrations: 1000,
    });

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await adminService.getSettings('general_settings');
            if (data && data.content) {
                setGeneralSettings({ ...generalSettings, ...data.content });
            }
        } catch (error) {
            console.error('Failed to load settings', error);
            // Don't show error toast on first load if settings don't exist yet (will use defaults)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await adminService.updateSettings('general_settings', generalSettings);
            toast.success('Settings saved', { description: 'System configuration has been updated successfully.' });
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error('Failed to save settings', { description: 'Please try again.' });
        } finally {
            setSaving(false);
            setConfirmMaintenance(false);
        }
    };

    // Turning maintenance mode on locks the public site, so saving with it on needs a confirmation.
    const requestSave = () => {
        if (generalSettings.maintenance_mode) setConfirmMaintenance(true);
        else handleSave();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Configuration"
                title={<>System <em>settings</em></>}
                description="Configure global application parameters."
                actions={
                    <>
                        <ActionButton variant="outline" icon={RefreshCw} onClick={loadSettings} disabled={loading || saving} aria-label="Reload settings" />
                        <ActionButton variant="primary" icon={Save} loading={saving} disabled={loading} onClick={requestSave}>Save changes</ActionButton>
                    </>
                }
            />

            {loading ? (
                <div className="space-y-4" aria-busy="true">
                    {[...Array(2)].map((_, i) => <div key={i} className="h-56 animate-pulse rounded-[18px] bg-[var(--brand-sky)]" />)}
                </div>
            ) : (
                <div className="grid gap-6">
                    <section className="admin-card p-5 md:p-6">
                        <div className="flex items-center gap-3">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)]"><Settings className="h-5 w-5" /></span>
                            <div>
                                <h2 className="admin-h3">General configuration</h2>
                                <p className="admin-muted">Core platform settings and toggles.</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label htmlFor="reg_fee" className="admin-label">Registration fee (₹)</label>
                                <input id="reg_fee" type="number" className="admin-field" value={generalSettings.registration_fee}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, registration_fee: parseInt(e.target.value) || 0 })} />
                                <p className="admin-muted mt-1.5">Amount charged per player registration.</p>
                            </div>
                            <div>
                                <label htmlFor="max_regs" className="admin-label">Max registrations</label>
                                <input id="max_regs" type="number" className="admin-field" value={generalSettings.max_registrations}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, max_registrations: parseInt(e.target.value) || 0 })} />
                                <p className="admin-muted mt-1.5">Limit total number of player registrations.</p>
                            </div>
                            <div className="md:col-span-2 md:max-w-[calc(50%-10px)]">
                                <label htmlFor="support_email" className="admin-label">Support email</label>
                                <input id="support_email" type="email" className="admin-field" value={generalSettings.support_email}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })} />
                            </div>
                        </div>

                        <h3 className="admin-label mt-8">Feature toggles</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--admin-line)] bg-[var(--brand-sky)] p-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    <Power className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-accent)]" />
                                    <div>
                                        <p className="font-semibold text-[var(--admin-ink)]">Enable registrations</p>
                                        <p className="admin-muted">Allow new users to register for the tournament.</p>
                                    </div>
                                </div>
                                <Switch className={SWITCH_CLS} aria-label="Enable registrations" checked={generalSettings.enable_registrations}
                                    onCheckedChange={(c) => setGeneralSettings({ ...generalSettings, enable_registrations: c })} />
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--admin-bad)]/25 bg-[var(--admin-bad-bg)] p-4">
                                <div className="flex min-w-0 items-start gap-3">
                                    <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-bad)]" />
                                    <div>
                                        <p className="font-semibold text-[var(--admin-bad)]">Maintenance mode</p>
                                        <p className="admin-muted">Restrict access to the site for all users except admins.</p>
                                    </div>
                                </div>
                                <Switch className={SWITCH_CLS} aria-label="Maintenance mode" checked={generalSettings.maintenance_mode}
                                    onCheckedChange={(c) => setGeneralSettings({ ...generalSettings, maintenance_mode: c })} />
                            </div>
                        </div>
                    </section>

                    <section className="admin-card min-w-0 p-5 md:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)]"><Database className="h-5 w-5" /></span>
                            <div>
                                <h2 className="admin-h3">Data management</h2>
                                <p className="admin-muted">Tools for managing system data.</p>
                            </div>
                        </div>
                        <div className="max-w-full overflow-x-auto"><DataInsertionTool /></div>
                    </section>
                </div>
            )}

            <ConfirmDialog
                open={confirmMaintenance}
                onOpenChange={setConfirmMaintenance}
                tone="danger"
                title="Save with maintenance mode on?"
                description="The public site will be restricted for everyone except admins until you turn this off."
                confirmLabel="Save and lock site"
                loading={saving}
                onConfirm={handleSave}
            />
        </div>
    );
};

export default SettingsPage;
