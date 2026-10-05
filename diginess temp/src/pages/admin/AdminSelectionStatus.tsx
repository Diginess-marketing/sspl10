import { useMemo, useState } from 'react';
import { useEnrichedPlayerData } from '@/hooks/useEnrichedPlayerData';
import { RefreshCw, Trophy, Users, AlertCircle, Download } from 'lucide-react';
import { playerExportService } from '@/utils/playerExportService';
import { toast } from 'sonner';
import { ActionButton, DataTableShell, PageHeader, StatCard, StatusBadge } from '@/components/admin/ui';

type View = 'selected' | 'not-selected';

const AdminSelectionStatus = () => {
    const { players, isLoading, refresh } = useEnrichedPlayerData();
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<View>('selected');
    const [exporting, setExporting] = useState(false);

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
    const current = view === 'selected' ? filteredSelected : filteredNotSelected;

    const handleExport = async () => {
        const label = view === 'selected' ? 'Selected' : 'Not Selected';
        try {
            setExporting(true);
            await playerExportService.exportPlayerData(current, {
                format: 'csv',
                includeFields: ['name', 'mobile', 'state', 'city', 'status', 'proficiency'],
            });
            toast.success('Export successful', { description: `${current.length} ${label} records exported.` });
        } catch (error) {
            console.error(error);
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const rate = players.length ? ((selectedPlayers.length / players.length) * 100).toFixed(1) : '0.0';

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Results"
                title={<>Selection <em>status</em></>}
                description="Detailed breakdown of Selected vs Not Selected players."
                actions={<ActionButton variant="outline" icon={RefreshCw} onClick={refresh} loading={isLoading}>Refresh data</ActionButton>}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Total processed" value={players.length} icon={Users} loading={isLoading} hint="Players in result set" />
                <StatCard label="Selected" value={selectedPlayers.length} icon={Trophy} tone="green" loading={isLoading} hint={`${rate}% selection rate`} />
                <StatCard label="Not selected" value={notSelectedPlayers.length} icon={AlertCircle} tone="amber" loading={isLoading} hint="Keep encouraging them" />
            </div>

            <DataTableShell
                title="Players"
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search name, city, phone…"
                filters={[
                    { value: 'selected', label: 'Selected', count: filteredSelected.length },
                    { value: 'not-selected', label: 'Not selected', count: filteredNotSelected.length },
                ]}
                activeFilter={view}
                onFilterChange={(v) => setView(v as View)}
                actions={<ActionButton variant="primary" icon={Download} loading={exporting} disabled={current.length === 0} onClick={handleExport}>Export current view</ActionButton>}
                loading={isLoading}
                isEmpty={current.length === 0}
                emptyTitle="No players found"
                emptyDescription={searchQuery ? 'No players match your search.' : 'Nothing in this list yet.'}
            >
                <table className="admin-table">
                    <thead>
                        <tr><th>Name</th><th>Mobile</th><th>Location</th><th>Status</th><th>Proficiency</th></tr>
                    </thead>
                    <tbody>
                        {current.map((player, idx) => (
                            <tr key={player.id || idx}>
                                <td className="font-semibold text-[var(--admin-ink)]">{player.name}</td>
                                <td className="whitespace-nowrap">{player.mobile}</td>
                                <td>
                                    <p className="font-medium text-[var(--admin-ink)]">{player.city}</p>
                                    <p className="admin-muted">{player.state}</p>
                                </td>
                                <td><StatusBadge status={player.status} /></td>
                                <td className="max-w-[200px] truncate" title={player.proficiency}>{player.proficiency}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DataTableShell>
        </div>
    );
};

export default AdminSelectionStatus;
