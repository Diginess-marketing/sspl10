import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  UserCheck,
  CalendarCheck,
  ArrowRight,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Undo2,
  Trash2
} from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { useAuth } from '@/hooks/useAuth';
import type { TrialsSectionPlayer } from '@/types/workflow';

interface TrialsSectionTabProps {
  onRefresh: () => void;
}

const TrialsSectionTab = ({ onRefresh }: TrialsSectionTabProps) => {
  const [players, setPlayers] = useState<TrialsSectionPlayer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Allocation form state
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [allocationTime, setAllocationTime] = useState('09:00');
  const [allocationVenue, setAllocationVenue] = useState('');
  const [allocationBatch, setAllocationBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const {
    getTrialsSectionPlayers,
    allocateToTrials,
    revertToRegistration,
    error
  } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    setLocalLoading(true);
    try {
      const data = await getTrialsSectionPlayers();
      setPlayers(data);
    } finally {
      setLocalLoading(false);
    }
  }, [getTrialsSectionPlayers]);

  useEffect(() => {
    loadPlayers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(players.map(p => p.workflow_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleOpenAllocationDialog = () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one player');
      return;
    }
    setShowAllocationDialog(true);
  };

  const handleAllocate = async () => {
    if (!allocationDate) {
      alert('Please select an allocation date');
      return;
    }

    setProcessing(true);
    try {
      const results = await allocateToTrials(
        Array.from(selectedIds),
        allocationDate,
        allocationTime || undefined,
        allocationVenue || undefined,
        allocationBatch || undefined,
        user?.id
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`Allocated ${successCount} player(s). ${failCount} failed.`);
      } else {
        alert(`Successfully allocated ${successCount} player(s) to trials!`);
      }

      setSelectedIds(new Set());
      setShowAllocationDialog(false);
      loadPlayers();
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRevert = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one player');
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to remove ${selectedIds.size} player(s) from the Trials List? They will be moved back to the Registration list.`
    );
    if (!confirm) return;

    setProcessing(true);
    try {
      const results = await revertToRegistration(Array.from(selectedIds), user?.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`Removed ${successCount} player(s). ${failCount} failed.`);
      } else {
        alert(`Successfully removed ${successCount} player(s) from Trials List!`);
      }

      setSelectedIds(new Set());
      loadPlayers();
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      player.full_name.toLowerCase().includes(s) ||
      player.email.toLowerCase().includes(s) ||
      player.phone.includes(s)
    );
  });

  return (
    <>
      <Card className="shadow-elegant border-cricket-blue/10">
        <CardHeader className="border-b border-cricket-blue/10 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg">Trials Section</CardTitle>
                <p className="text-sm opacity-80 mt-1">
                  Players ready for trial allocation
                </p>
              </div>
            </div>
            <Button
              onClick={loadPlayers}
              variant="outline"
              size="sm"
              disabled={localLoading}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${localLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Action Bar */}
          <div className="p-4 border-b border-cricket-blue/10 bg-purple-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-purple-700">
                {selectedIds.size} of {filteredPlayers.length} selected
              </span>
              <div className="relative ml-4">
                <Input
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 h-9 w-64 text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 mr-2 uppercase tracking-wider">Actions:</span>
              <Button
                size="sm"
                onClick={handleRevert}
                disabled={selectedIds.size === 0 || processing}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove ({selectedIds.size})
              </Button>
              <Button
                onClick={handleOpenAllocationDialog}
                disabled={selectedIds.size === 0 || processing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CalendarCheck className="w-4 h-4 mr-2" />
                )}
                Allocate ({selectedIds.size})
              </Button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Loading state */}
          {localLoading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-muted-foreground">Loading players...</span>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No players in Trials Section</p>
              <p className="text-sm">Move players from Registrations tab to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-100/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === players.length && selectedIds.size > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Position</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Moved to Trials</TableHead>
                    <TableHead className="font-semibold w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player, index) => (
                    <TableRow
                      key={player.workflow_id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'} hover:bg-purple-100/50`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(player.workflow_id)}
                          onCheckedChange={(checked) => handleSelectOne(player.workflow_id, !!checked)}
                          aria-label={`Select ${player.full_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-purple-700">{player.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            DOB: {player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>📧 {player.email}</div>
                          <div>📱 {player.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {player.city && player.state
                            ? `${player.city}, ${player.state}`
                            : player.state || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-100 text-purple-700">
                          {player.position}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className="bg-green-100 text-green-700">
                            ₹{player.payment_amount || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(player.moved_to_trials_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedIds(new Set([player.workflow_id]));
                              setShowAllocationDialog(true);
                            }}
                            disabled={processing}
                            className="text-xs border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                          >
                            <CalendarCheck className="w-3 h-3 mr-1" />
                            Allocate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${player.full_name} from the Trials List?`)) {
                                revertToRegistration([player.workflow_id], user?.id)
                                  .then(() => {
                                    loadPlayers();
                                    onRefresh();
                                  });
                              }
                            }}
                            disabled={processing}
                            className="text-xs border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                            title="Remove from Trials List"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <CalendarCheck className="w-5 h-5" />
              Allocate to Trials
            </DialogTitle>
            <DialogDescription>
              Set trial details for {selectedIds.size} selected player(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Trial Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={allocationDate}
                onChange={(e) => setAllocationDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Trial Time
              </Label>
              <Input
                id="time"
                type="time"
                value={allocationTime}
                onChange={(e) => setAllocationTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Venue
              </Label>
              <Input
                id="venue"
                placeholder="Enter trial venue"
                value={allocationVenue}
                onChange={(e) => setAllocationVenue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Batch
              </Label>
              <Input
                id="batch"
                placeholder="e.g., Batch A, Morning Batch"
                value={allocationBatch}
                onChange={(e) => setAllocationBatch(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllocationDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocate}
              disabled={processing || !allocationDate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {processing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Allocate ({selectedIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrialsSectionTab;
