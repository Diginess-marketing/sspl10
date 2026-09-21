import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, CheckCircle, XCircle, FileText } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from 'lucide-react';

interface Selector {
    id: string;
    full_name: string;
    age: number; // Changed to number to match likely DB type
    email: string;
    contact_number: string;
    city_state: string;
    years_of_experience: string;
    highest_level_played: string;
    previously_worked_as_selector: string;
    availability: string[]; // Assuming array or JSON
    preferred_region: string;
    status: string;
    document_url?: string;
    created_at: string;
}

const SelectorManagement = () => {
    const [selectors, setSelectors] = useState<Selector[]>([]);
    const [selectedSelector, setSelectedSelector] = useState<Selector | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchSelectors();
    }, []);

    const fetchSelectors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('selectors' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setSelectors((data as any) || []);
        } catch (error: any) {
            console.error('Error fetching selectors:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch selectors.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('selectors' as any)
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setSelectors(selectors.map(s => s.id === id ? { ...s, status: newStatus } : s));
            toast({
                title: 'Success',
                description: `Selector status updated to ${newStatus}`,
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
                <h2 className="text-3xl font-bold tracking-tight">Selector Management</h2>
                <Button onClick={fetchSelectors} variant="outline">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Selectors ({selectors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No selectors registered yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    selectors.map((selector) => (
                                        <TableRow key={selector.id}>
                                            <TableCell className="font-medium">{selector.full_name}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{selector.email}</div>
                                                <div className="text-xs text-gray-500">{selector.contact_number}</div>
                                            </TableCell>
                                            <TableCell>{selector.years_of_experience}</TableCell>
                                            <TableCell>{selector.highest_level_played}</TableCell>
                                            <TableCell>{selector.city_state}</TableCell>
                                            <TableCell>
                                                {selector.document_url ? (
                                                    <a
                                                        href={selector.document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        selector.status === 'approved' ? 'default' :
                                                            selector.status === 'rejected' ? 'destructive' : 'secondary'
                                                    }
                                                    className={selector.status === 'approved' ? 'bg-green-600' : ''}
                                                >
                                                    {selector.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => {
                                                            setSelectedSelector(selector);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatus(selector.id, 'approved')}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatus(selector.id, 'rejected')}
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

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Selector Details</DialogTitle>
                        <DialogDescription>Full registration information for {selectedSelector?.full_name}</DialogDescription>
                    </DialogHeader>

                    {selectedSelector && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg border-b pb-2">Personal Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p>{selectedSelector.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Age</p>
                                        <p>{selectedSelector.age}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">City & State</p>
                                        <p>{selectedSelector.city_state}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contact</p>
                                        <p>{selectedSelector.contact_number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p>{selectedSelector.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg border-b pb-2">Professional Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                                        <p>{selectedSelector.years_of_experience}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Highest Level Played</p>
                                        <p>{selectedSelector.highest_level_played}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Previous Selector Experience</p>
                                        <p className="capitalize">{selectedSelector.previously_worked_as_selector}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Preferred Region</p>
                                        <p>{selectedSelector.preferred_region}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-4">
                                <h4 className="font-semibold text-lg border-b pb-2">Availability & Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Availability</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(selectedSelector.availability) ? (
                                                selectedSelector.availability.map((day, index) => (
                                                    <Badge key={index} variant="outline" className="capitalize">
                                                        {day}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">No availability specified</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Attached Document</p>
                                        {selectedSelector.document_url ? (
                                            <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                                                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate">Document Upload</p>
                                                    <p className="text-xs text-gray-500">Click to view/download</p>
                                                </div>
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={selectedSelector.document_url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        View
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No document attached</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SelectorManagement;
