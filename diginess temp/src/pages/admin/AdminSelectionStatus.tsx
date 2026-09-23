import { useMemo, useState } from 'react';
import { useEnrichedPlayerData } from '@/hooks/useEnrichedPlayerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, Trophy, Users, AlertCircle } from 'lucide-react';
import { playerExportService } from '@/utils/playerExportService';
import { useToast } from '@/hooks/use-toast';

const AdminSelectionStatus = () => {
    const { players, isLoading, refresh } = useEnrichedPlayerData();
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    // Segmentation
    const selectedPlayers = useMemo(() => players.filter(p => p.status?.toUpperCase() === 'SELECTED'), [players]);
    const notSelectedPlayers = useMemo(() => players.filter(p => p.status?.toUpperCase() !== 'SELECTED'), [players]);

    // Filtering logic
    const filterData = (data: typeof players) => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.mobile.includes(lowerQuery) ||
            p.city?.toLowerCase().includes(lowerQuery) ||
            p.state.toLowerCase().includes(lowerQuery),
        );
    };

    const filteredSelected = useMemo(() => filterData(selectedPlayers), [selectedPlayers, searchQuery]);
    const filteredNotSelected = useMemo(() => filterData(notSelectedPlayers), [notSelectedPlayers, searchQuery]);

    const handleExport = async (data: typeof players, label: string) => {
        try {
            await playerExportService.exportPlayerData(data, {
                format: 'csv',
                includeFields: ['name', 'mobile', 'state', 'city', 'status', 'proficiency'],
            });
            toast({ title: 'Export Successful', description: `${data.length} ${label} records exported.` });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', variant: 'destructive' });
        }
    };

    const PlayerTable = ({ data }: { data: typeof players }) => (
        <div className="rounded-md border text-sm max-h-[600px] overflow-auto">
            <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Mobile</TableHead>
                        <TableHead className="font-semibold">Location</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Proficiency</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                No players found matching your search.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((player, idx) => (
                            <TableRow key={player.id || idx} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium">{player.name}</TableCell>
                                <TableCell className="text-slate-600 font-mono">{player.mobile}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs text-slate-600">
                                        <span className="font-medium text-slate-900">{player.city}</span>
                                        <span>{player.state}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={player.status === 'SELECTED' ? 'default' : 'secondary'}
                                        className={player.status === 'SELECTED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                    >
                                        {player.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 truncate max-w-[200px]" title={player.proficiency}>
                                    {player.proficiency}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                <p className="text-lg font-medium">Loading Player Data...</p>
                <p className="text-sm text-slate-400">Fetching details from registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selection Status</h1>
                    <p className="text-muted-foreground mt-2">
                        Detailed breakdown of Selected vs Not Selected players.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={refresh}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{players.length}</div>
                        <p className="text-xs text-muted-foreground">Players in result set</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Selected</CardTitle>
                        <Trophy className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{selectedPlayers.length}</div>
                        <p className="text-xs text-green-600 font-medium">
                            {((selectedPlayers.length / players.length) * 100).toFixed(1)}% selection rate
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Not Selected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-700">{notSelectedPlayers.length}</div>
                        <p className="text-xs text-slate-500">
                            Keep encouraging them!
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Name, City, Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="selected" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="grid w-[400px] grid-cols-2">
                                <TabsTrigger value="selected">Selected ({filteredSelected.length})</TabsTrigger>
                                <TabsTrigger value="not-selected">Not Selected ({filteredNotSelected.length})</TabsTrigger>
                            </TabsList>
                            <Button variant="outline" size="sm" onClick={() => {
                                const activeTab = document.querySelector('[role="tab"][data-state="active"]')?.textContent;
                                if (activeTab?.includes('Not Selected')) {
                                    handleExport(filteredNotSelected, 'Not Selected');
                                } else {
                                    handleExport(filteredSelected, 'Selected');
                                }
                            }}>
                                Export Current View
                            </Button>
                        </div>

                        <TabsContent value="selected" className="mt-0">
                            <PlayerTable data={filteredSelected} />
                        </TabsContent>
                        <TabsContent value="not-selected" className="mt-0">
                            <PlayerTable data={filteredNotSelected} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSelectionStatus;
