import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { Save, Settings, RefreshCw } from 'lucide-react';
import DataInsertionTool from '@/components/admin/DataInsertionTool';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

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
            toast({
                title: 'Settings Saved',
                description: 'System configuration has been updated successfully.',
            });
        } catch (error) {
            console.error('Failed to save settings', error);
            toast({
                title: 'Error',
                description: 'Failed to save settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure global application parameters.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadSettings} disabled={loading || saving}>
                        <RefreshCw className={`h - 4 w - 4 ${loading ? 'animate-spin' : ''} `} />
                    </Button>
                    <Button onClick={handleSave} disabled={loading || saving} className="bg-sport-blue hover:bg-sport-blue/90">
                        {saving ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center">
                    <LoadingSpinner text="Loading settings..." />
                </div>
            ) : (
                <div className="grid gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-slate-100 rounded-full">
                                    <Settings className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <CardTitle>General Configuration</CardTitle>
                                    <CardDescription>Core platform settings and toggles.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg_fee">Registration Fee (₹)</Label>
                                        <Input
                                            id="reg_fee"
                                            type="number"
                                            value={generalSettings.registration_fee}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, registration_fee: parseInt(e.target.value) || 0 })}
                                        />
                                        <p className="text-xs text-muted-foreground">Amount charged per player registration.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_regs">Max Registrations</Label>
                                        <Input
                                            id="max_regs"
                                            type="number"
                                            value={generalSettings.max_registrations}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, max_registrations: parseInt(e.target.value) || 0 })}
                                        />
                                        <p className="text-xs text-muted-foreground">Limit total number of player registrations.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="support_email">Support Email</Label>
                                        <Input
                                            id="support_email"
                                            type="email"
                                            value={generalSettings.support_email}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Feature Toggles</h3>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Enable Registrations</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow new users to register for the tournament.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={generalSettings.enable_registrations}
                                        onCheckedChange={(c) => setGeneralSettings({ ...generalSettings, enable_registrations: c })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-red-600">Maintenance Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Restrict access to the site for all users except admins.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={generalSettings.maintenance_mode}
                                        onCheckedChange={(c) => setGeneralSettings({ ...generalSettings, maintenance_mode: c })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Tools for managing system data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataInsertionTool />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;

