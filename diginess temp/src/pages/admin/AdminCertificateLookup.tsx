import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, FileDown, Award, Users, Trophy, MapPin, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { playerDataService } from '@/services/playerDataService';
import { playerExportService } from '@/utils/playerExportService';
import { supabase } from '@/integrations/supabase/client';
import type { PlayerResult } from '@/types/playerData';
import { generateAndDownloadCertificate, generateAndDownloadAchievementCertificate } from '@/utils/certificateGenerator';
import { PageHeader, StatCard, StatusBadge, ActionButton, DataTableShell, DetailDrawer } from '@/components/admin/ui';

const PAGE_SIZE = 10;
const isSelected = (p: PlayerResult) => p.status?.toUpperCase() === 'SELECTED';

const AdminCertificateLookup = () => {
    const [players, setPlayers] = useState<PlayerResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [active, setActive] = useState<PlayerResult | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    // Load and enrich data
    const loadAndEnrichData = useCallback(async () => {
        setIsLoading(true);
        try {
            await playerDataService.loadPlayerData();
            const rawData = playerDataService.getRawData();

            if (rawData.length === 0) {
                setPlayers([]);
                return;
            }

            // Enrich with Supabase data (state/city)
            const mobileNumbers = rawData.map((p: PlayerResult) => p.mobile);
            const chunkSize = 500;
            const dbPlayersMap = new Map();

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
            toast.error('Failed to load player data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAndEnrichData(); }, [loadAndEnrichData]);

    const counts = useMemo(() => {
        const sel = players.filter(isSelected).length;
        return { all: players.length, selected: sel, other: players.length - sel };
    }, [players]);

    const filteredPlayers = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        return players.filter(p => {
            if (filter === 'selected' && !isSelected(p)) return false;
            if (filter === 'other' && isSelected(p)) return false;
            if (!lowerQuery) return true;
            return (
                p.name.toLowerCase().includes(lowerQuery) ||
                p.mobile.includes(lowerQuery) ||
                p.city?.toLowerCase().includes(lowerQuery) ||
                p.state.toLowerCase().includes(lowerQuery)
            );
        });
    }, [players, searchQuery, filter]);

    const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
    const displayedPlayers = filteredPlayers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, filter]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await playerExportService.exportPlayerData(filteredPlayers, {
                format: 'csv',
                includeFields: ['name', 'mobile', 'state', 'city', 'status', 'proficiency', 'timing', 'marks', 'remarks'],
            });
            toast.success(`${filteredPlayers.length} records exported`);
        } catch (error) {
            console.error(error);
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadCertificate = async (player: PlayerResult) => {
        const type = isSelected(player) ? 'achievement' : 'participation';
        const key = player.id || player.mobile;
        setDownloading(String(key));
        const tid = toast.loading(`Generating ${type} certificate for ${player.name}`);
        try {
            if (isSelected(player)) {
                await generateAndDownloadAchievementCertificate(player.name);
            } else {
                await generateAndDownloadCertificate(player.name);
            }
            toast.success(`${player.name}'s certificate downloaded`, { id: tid });
        } catch (error) {
            console.error('Certificate generation failed:', error);
            toast.error('Certificate generation failed. Please try again.', { id: tid });
        } finally {
            setDownloading(null);
        }
    };

    const copyMobile = async (mobile: string) => {
        try { await navigator.clipboard.writeText(mobile); toast.success('Mobile number copied'); } catch { toast.error('Could not copy'); }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Certificates"
                title={<>Certificate <em>management</em></>}
                description="View, search, and export player certificate details."
                actions={
                    <>
                        <ActionButton variant="outline" icon={RefreshCw} onClick={loadAndEnrichData} disabled={isLoading}>Refresh</ActionButton>
                        <ActionButton variant="primary" icon={FileDown} loading={isExporting} onClick={handleExport} disabled={players.length === 0}>
                            Export {searchQuery || filter !== 'all' ? 'results' : 'all'} CSV
                        </ActionButton>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Players" value={counts.all.toLocaleString('en-IN')} hint="In the results registry" icon={Users} loading={isLoading} />
                <StatCard label="Achievement" value={counts.selected.toLocaleString('en-IN')} hint="Selected players" icon={Trophy} tone="lime" loading={isLoading} />
                <StatCard label="Participation" value={counts.other.toLocaleString('en-IN')} hint="All other players" icon={Award} tone="green" loading={isLoading} />
            </div>

            <DataTableShell
                title="Player registry"
                description={`${filteredPlayers.length} players`}
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search name, phone, city"
                filters={[
                    { value: 'all', label: 'All', count: counts.all },
                    { value: 'selected', label: 'Selected', count: counts.selected },
                    { value: 'other', label: 'Others', count: counts.other },
                ]}
                activeFilter={filter}
                onFilterChange={setFilter}
                loading={isLoading}
                isEmpty={displayedPlayers.length === 0}
                emptyTitle="No players found"
                emptyDescription="Try a different search or filter."
            >
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th><th>Mobile</th><th>Location</th><th>Status</th><th>Proficiency</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedPlayers.map((player, idx) => (
                            <tr key={player.id || idx} className="cursor-pointer" onClick={() => setActive(player)}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <span className="admin-avatar">{(player.name || '?').slice(0, 1).toUpperCase()}</span>
                                        <span className="font-semibold text-[var(--admin-ink)]">{player.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <button type="button" title="Copy mobile" onClick={(e) => { e.stopPropagation(); copyMobile(player.mobile); }} className="inline-flex items-center gap-1.5 hover:text-[var(--admin-accent)]">
                                        {player.mobile}<Copy className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                                <td>
                                    <span className="block font-semibold text-[var(--admin-ink)]">{player.city}</span>
                                    <span className="admin-muted">{player.state}</span>
                                </td>
                                <td><StatusBadge status={isSelected(player) ? 'selected' : player.status} /></td>
                                <td><span className="block max-w-[180px] truncate" title={player.proficiency}>{player.proficiency}</span></td>
                                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <ActionButton
                                        variant="soft"
                                        size="sm"
                                        icon={Award}
                                        loading={downloading === String(player.id || player.mobile)}
                                        onClick={() => handleDownloadCertificate(player)}
                                    >
                                        <span className="hidden sm:inline">Certificate</span>
                                    </ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-line)] px-5 py-3">
                        <p className="admin-muted">Page {currentPage} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <ActionButton variant="outline" size="sm" icon={ChevronLeft} aria-label="Previous page" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
                            <ActionButton variant="outline" size="sm" icon={ChevronRight} aria-label="Next page" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
                        </div>
                    </div>
                )}
            </DataTableShell>

            <DetailDrawer
                open={!!active}
                onOpenChange={(o) => { if (!o) setActive(null); }}
                eyebrow="Player"
                title={active?.name || ''}
                description={active ? `${active.city}, ${active.state}` : undefined}
                footer={active && (
                    <ActionButton variant="primary" icon={Award} loading={downloading === String(active.id || active.mobile)} onClick={() => handleDownloadCertificate(active)}>
                        Download {isSelected(active) ? 'achievement' : 'participation'} certificate
                    </ActionButton>
                )}
            >
                {active && (
                    <div className="space-y-5">
                        <StatusBadge status={isSelected(active) ? 'selected' : active.status} />
                        <dl className="admin-kv">
                            <dt>Mobile</dt><dd>{active.mobile}</dd>
                            <dt><MapPin className="inline h-4 w-4" /> City</dt><dd>{active.city}</dd>
                            <dt>State</dt><dd>{active.state}</dd>
                            <dt>Proficiency</dt><dd>{active.proficiency || '-'}</dd>
                            <dt>Timing</dt><dd>{active.timing || '-'}</dd>
                            <dt>Marks</dt><dd>{active.marks ?? '-'}</dd>
                            <dt>Remarks</dt><dd>{active.remarks || '-'}</dd>
                        </dl>
                    </div>
                )}
            </DetailDrawer>
        </div>
    );
};

export default AdminCertificateLookup;
