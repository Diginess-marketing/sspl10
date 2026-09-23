import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, MessageSquare, Database, Trash2, CheckCircle2, Clock, PlayCircle, PauseCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';

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
    const { toast } = useToast();

    // New Campaign State
    const [newName, setNewName] = useState('');
    const [newTemplate, setNewTemplate] = useState('Hi {name}, this is South State Pro League! We have an update regarding your trial.');
    const [targetGroup, setTargetGroup] = useState('manual'); // manual, level1, level2, levels3
    const [csvFile, setCsvFile] = useState<File | null>(null);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('whatsapp_campaigns')
                .select(`
                    *,
                    whatsapp_campaign_recipients(count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted = (data || []).map(c => {
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
            toast({ title: 'Error', description: 'Name and Template are required', variant: 'destructive' });
            return;
        }

        try {
            setIsCreating(true);

            // 1. Create Campaign
            const { data: campaign, error: cError } = await supabase
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
                recipients = lines.slice(1).map(line => {
                    const [name, mobile] = line.split(',');
                    return {
                        campaign_id: campaign.id,
                        name: name?.trim(),
                        mobile: mobile?.trim(),
                    };
                }).filter(r => r.mobile);
            } else if (targetGroup.startsWith('level')) {
                const level = parseInt(targetGroup.replace('level', ''));
                // Use RPC or fetch from trial_candidates
                const { data: players, error: pError } = await supabase
                    .from('trial_candidates')
                    .select('name, mobile, trial_progress!inner(current_level)')
                    .eq('trial_progress.current_level', level);

                if (pError) throw pError;

                recipients = (players || []).map(p => ({
                    campaign_id: campaign.id,
                    name: p.name,
                    mobile: p.mobile || (p as any).phone, // Fallback to phone if mobile is null
                }));
            }

            // 3. Insert Recipients
            if (recipients.length > 0) {
                const { error: rError } = await supabase
                    .from('whatsapp_campaign_recipients')
                    .insert(recipients);
                if (rError) throw rError;
            }

            toast({ title: 'Success', description: `Campaign "${newName}" created with ${recipients.length} recipients.` });
            setNewName('');
            setCsvFile(null);
            loadCampaigns();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsCreating(false);
        }
    };

    const updateCampaignStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('whatsapp_campaigns')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            loadCampaigns();
            
            let description = '';
            if (newStatus === 'READY') description = 'Campaign resumed and ready for sending.';
            if (newStatus === 'PAUSED') description = 'Campaign paused.';
            
            toast({ title: `Campaign ${newStatus}`, description });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const markAsReady = (id: string) => updateCampaignStatus(id, 'READY');

    const deleteCampaign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const { error } = await supabase.from('whatsapp_campaigns').delete().eq('id', id);
            if (error) throw error;
            loadCampaigns();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">WhatsApp Marketing</h1>
                    <p className="text-muted-foreground mt-1">Create bulk message campaigns for your players.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Create Campaign Card */}
                <Card className="lg:col-span-1 shadow-md border-none">
                    <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-sport-orange" />
                            New Campaign
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label>Campaign Name</Label>
                            <Input placeholder="e.g., Level 2 Hyderabad Trials" value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Message Template</Label>
                            <Textarea 
                                className="min-h-[120px]" 
                                value={newTemplate} 
                                onChange={e => setNewTemplate(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Use {'{name}'} for personalization.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Recipient Source</Label>
                            <Select value={targetGroup} onValueChange={setTargetGroup}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual (CSV Upload)</SelectItem>
                                    <SelectItem value="level1">All level 1 Players</SelectItem>
                                    <SelectItem value="level2">All level 2 Players</SelectItem>
                                    <SelectItem value="level3">All level 3 Players</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {targetGroup === 'manual' && (
                            <div className="space-y-2">
                                <Label>CSV File (name, mobile)</Label>
                                <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                            </div>
                        )}

                        <Button className="w-full bg-cricket-blue hover:bg-cricket-dark-blue" onClick={handleCreateCampaign} disabled={isCreating}>
                            {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                            Create & Prepare
                        </Button>
                    </CardContent>
                </Card>

                {/* Campaigns List Card */}
                <Card className="lg:col-span-2 shadow-md border-none">
                    <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-cricket-blue" />
                            Active Campaigns
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <LoadingSpinner text="Loading campaigns..." />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Recipients</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No campaigns found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        campaigns.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>
                                                    <div className="font-medium">{c.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{c.message_template}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{c.recipient_count} total</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        c.status === 'READY' ? 'bg-green-100 text-green-800' :
                                                        c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                        c.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                                                        c.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {c.status === 'DRAFT' && (
                                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => markAsReady(c.id)}>
                                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Ready
                                                        </Button>
                                                    )}
                                                    {(c.status === 'IN_PROGRESS' || c.status === 'PAUSED') && (
                                                        <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700" onClick={() => markAsReady(c.id)}>
                                                            <PlayCircle className="w-4 h-4 mr-1" /> Resume
                                                        </Button>
                                                    )}
                                                    {(c.status === 'READY' || c.status === 'IN_PROGRESS') && (
                                                        <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700" onClick={() => updateCampaignStatus(c.id, 'PAUSED')}>
                                                            <PauseCircle className="w-4 h-4 mr-1" /> Pause
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCampaign(c.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Information Alert */}
            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4 flex gap-3 text-amber-800 text-sm">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <strong>Note:</strong> Once a campaign is marked as <strong>READY</strong>, open your <code>whatsapp-sender</code> desktop application 
                        on your computer to begin the automated sending process. Ensure you are logged into WhatsApp Web in your browser.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WhatsAppMarketing;
