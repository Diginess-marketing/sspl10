import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, FileDown, Loader2, Search, Award } from 'lucide-react';
import { playerDataService } from '@/services/playerDataService';
import { playerExportService } from '@/utils/playerExportService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlayerResult } from '@/types/playerData';
import { generateAndDownloadCertificate, generateAndDownloadAchievementCertificate } from '@/utils/certificateGenerator';

const AdminCertificateLookup = () => {
    const [players, setPlayers] = useState<PlayerResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    // Pagination
    const PAGE_SIZE = 10;

    // Load and Enrich Data on Mount
    useEffect(() => {
        const loadAndEnrichData = async () => {
            setIsLoading(true);
            try {
                // 1. Load basic JSON data
                await playerDataService.loadPlayerData();
                const rawData = playerDataService.getRawData();

                if (rawData.length === 0) {
                    setPlayers([]);
                    setIsLoading(false);
                    return;
                }

                // 2. Enrich with Supabase Data (State/City)
                const mobileNumbers = rawData.map((p: PlayerResult) => p.mobile);
                const chunkSize = 500;
                const dbPlayersMap = new Map();

                // Fetch in chunks
                for (let i = 0; i < mobileNumbers.length; i += chunkSize) {
                    const chunk = mobileNumbers.slice(i, i + chunkSize);
                    const { data: dbPlayers, error } = await supabase
                        .from('player_registrations')
                        .select('phone, city, state')
                        .in('phone', chunk);

                    if (error) console.error('Supabase fetch error:', error);

                    if (dbPlayers) {
                        dbPlayers.forEach((p: any) => dbPlayersMap.set(p.phone, p));
                    }
                }

                // 3. Merge Data
                const enriched = rawData.map((player: PlayerResult) => {
                    const dbPlayer = dbPlayersMap.get(player.mobile);
                    return {
                        ...player,
                        city: dbPlayer?.city || player.city || 'N/A',
                        state: (player.state && player.state.trim() !== '') ? player.state : (dbPlayer?.state || 'N/A'),
                    };
                });

                setPlayers(enriched);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load player data.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadAndEnrichData();
    }, [toast]);

    // Filtering
    const filteredPlayers = useMemo(() => {
        if (!searchQuery) return players;
        const lowerQuery = searchQuery.toLowerCase();
        return players.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.mobile.includes(lowerQuery) ||
            p.city?.toLowerCase().includes(lowerQuery) ||
            p.state.toLowerCase().includes(lowerQuery)
        );
    }, [players, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
    const displayedPlayers = filteredPlayers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Actions
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await playerExportService.exportPlayerData(filteredPlayers, {
                format: 'csv',
                includeFields: ['name', 'mobile', 'state', 'city', 'status', 'proficiency', 'timing', 'marks', 'remarks']
            });
            toast({ title: 'Export Successful', description: `${filteredPlayers.length} records exported.` });
        } catch (error) {
            console.error(error);
            toast({ title: 'Export Failed', variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadCertificate = async (player: PlayerResult) => {
        const isSelected = player.status?.toUpperCase() === 'SELECTED';
        const type = isSelected ? 'achievement' : 'participation';

        toast({
            title: "Generating Certificate",
            description: `Please wait while we generate the ${type} certificate for ${player.name}...`,
        });

        try {
            if (isSelected) {
                await generateAndDownloadAchievementCertificate(player.name);
            } else {
                await generateAndDownloadCertificate(player.name);
            }

            toast({
                title: "Download Complete",
                description: `${player.name}'s certificate has been downloaded.`,
                className: "bg-green-600 text-white border-green-700",
            });
        } catch (error) {
            console.error('Certificate generation failed:', error);
            toast({
                title: "Download Failed",
                description: "There was an error generating the certificate. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Certificate Management</h1>
                    <p className="text-muted-foreground mt-2">
                        View, search, and export player certificate details.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || players.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                        Export {searchQuery ? 'Results' : 'All'} CSV
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Player Registry ({filteredPlayers.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search Name, Phone, City..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto rounded-md border text-sm">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold">Mobile</TableHead>
                                    <TableHead className="font-semibold">Location</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Proficiency</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                                Loading and Enriching Data... (This may take a moment)
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : displayedPlayers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No players found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedPlayers.map((player, idx) => (
                                        <TableRow key={player.id || idx} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900">{player.name}</TableCell>
                                            <TableCell className="text-slate-600">{player.mobile}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs text-slate-600">
                                                    <span className="font-medium text-slate-900">{player.city}</span>
                                                    <span>{player.state}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={player.status === 'SELECTED' ? 'default' : 'secondary'} className={player.status === 'SELECTED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                                    {player.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600 max-w-[150px] truncate" title={player.proficiency}>
                                                {player.proficiency}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-2 text-blue-600 border-blue-200 bg-white hover:bg-blue-50"
                                                    style={{ backgroundColor: '#ffffff' }}
                                                    onClick={() => handleDownloadCertificate(player)}
                                                >
                                                    <Award className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Download Cert</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 p-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCertificateLookup;
