import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
}

const OrganizerManagement = () => {
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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
            toast({
                title: 'Error',
                description: 'Failed to fetch organizers.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('tournament_organizers' as any)
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setOrganizers(organizers.map(o => o.id === id ? { ...o, status: newStatus } : o));
            toast({
                title: 'Success',
                description: `Organizer status updated to ${newStatus}`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update status.',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Organizer Management</h2>
                <Button onClick={fetchOrganizers} variant="outline">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Organizers ({organizers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organisation</TableHead>
                                    <TableHead>Organiser</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Tournament Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            No organizers registered yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    organizers.map((organizer) => (
                                        <TableRow key={organizer.id}>
                                            <TableCell className="font-medium">{organizer.organisation_name}</TableCell>
                                            <TableCell>{organizer.organiser_name}</TableCell>
                                            <TableCell>{organizer.mobile_primary}</TableCell>
                                            <TableCell>{organizer.city_district}, {organizer.state}</TableCell>
                                            <TableCell>{organizer.tournament_type}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        organizer.status === 'approved' ? 'default' :
                                                            organizer.status === 'rejected' ? 'destructive' : 'secondary'
                                                    }
                                                    className={organizer.status === 'approved' ? 'bg-green-600' : ''}
                                                >
                                                    {organizer.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatus(organizer.id, 'approved')}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatus(organizer.id, 'rejected')}
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizerManagement;
