import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminService, AdminReward } from '@/services/adminService';
import { Trophy, Plus, Trash2, Edit2, Coins } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { Badge } from '@/components/ui/badge'; // Added missing import for Badge

const RewardsManager = () => {
    const [rewards, setRewards] = useState<AdminReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<AdminReward | null>(null);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points_cost: 100,
        is_active: true,
    });

    const loadRewards = async () => {
        try {
            setLoading(true);
            const data = await adminService.getRewards();
            setRewards(data);
        } catch (error) {
            console.error('Failed to load rewards', error);
            toast({
                title: 'Error',
                description: 'Failed to load rewards list',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRewards();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this reward?')) return;

        try {
            await adminService.deleteReward(id);
            toast({ title: 'Success', description: 'Reward deleted successfully' });
            loadRewards();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete reward', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingReward) {
                await adminService.updateReward(editingReward.id, formData);
                toast({ title: 'Updated', description: 'Reward updated successfully' });
            } else {
                await adminService.createReward(formData);
                toast({ title: 'Created', description: 'New reward created successfully' });
            }
            setIsDialogOpen(false);
            resetForm();
            loadRewards();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save reward', variant: 'destructive' });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            points_cost: 100,
            is_active: true,
        });
        setEditingReward(null);
    };

    const openEdit = (reward: AdminReward) => {
        setEditingReward(reward);
        setFormData({
            title: reward.title,
            description: reward.description,
            points_cost: reward.points_cost,
            is_active: reward.is_active,
        });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rewards Manager</h1>
                    <p className="text-muted-foreground mt-1">Configure redeemable rewards for users.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-sport-blue hover:bg-sport-blue/90 text-white gap-2">
                            <Plus className="h-4 w-4" /> Add Reward
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingReward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="points">Points Cost</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    value={formData.points_cost}
                                    onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center">
                    <LoadingSpinner text="Loading rewards..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                        <Card key={reward.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                        <Trophy className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEdit(reward)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(reward.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-4 text-xl">{reward.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{reward.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 border-t border-slate-100 bg-white">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-sport-blue font-bold">
                                        <Coins className="h-4 w-4" />
                                        {reward.points_cost} Pts
                                    </div>
                                    <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                                        {reward.is_active ? 'Active' : 'Draft'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {rewards.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            No rewards found. Create your first reward to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RewardsManager;

