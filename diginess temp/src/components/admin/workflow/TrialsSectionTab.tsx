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
  Trash2,
} from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { TrialsSectionPlayer } from '@/types/workflow';

interface TrialsSectionTabProps {
  onRefresh: () => void;
}

const BATCH_PRESETS = ['Morning Batch', 'Afternoon Batch', 'Evening Batch', 'Batch A', 'Batch B'];

/** "Sat, 24 Sep 2026 · 09:00 · Venue · Batch" for the allocation dialog's summary line. */
const describeAllocation = (date: string, time: string, venue: string, batch: string) => {
  if (!date) return '';
  const day = new Date(`${date}T00:00:00`);
  const dayLabel = Number.isNaN(day.getTime())
    ? date
    : day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return [dayLabel, time, venue.trim(), batch.trim()].filter(Boolean).join(' · ');
};

const TrialsSectionTab = ({ onRefresh }: TrialsSectionTabProps) => {
  const [players, setPlayers] = useState<TrialsSectionPlayer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Allocation form state
  const [allocationDate, setAllocationDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [allocationTime, setAllocationTime] = useState('09:00');
  const [allocationVenue, setAllocationVenue] = useState('');
  const [allocationBatch, setAllocationBatch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pastVenues, setPastVenues] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const selectedPlayers = players.filter((p) => selectedIds.has(p.workflow_id));
  const allocationSummary = describeAllocation(allocationDate, allocationTime, allocationVenue, allocationBatch);

  // Venues used in earlier allocations, offered as suggestions when the dialog opens.
  useEffect(() => {
    if (!showAllocationDialog) return;
    supabase
      .from('trials_allocations')
      .select('allocation_venue')
      .not('allocation_venue', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const venues = (data ?? []).map((row) => row.allocation_venue?.trim()).filter((v): v is string => Boolean(v));
        setPastVenues([...new Set(venues)].slice(0, 20));
      });
  }, [showAllocationDialog]);

  const { user } = useAuth();
  const {
    getTrialsSectionPlayers,
    allocateToTrials,
    revertToRegistration,
    error,
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
        user?.id,
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
      `Are you sure you want to remove ${selectedIds.size} player(s) from the Trials List? They will be moved back to the Registration list.`,
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
                          onCheckedChange={(checked) => handleSelectOne(player.workflow_id, Boolean(checked))}
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
        {/* admin-scope + explicit colours: dialogs render outside the admin layout, where the
            site's global heading/label styles would otherwise turn this text white. */}
        <DialogContent className="admin-scope bg-white p-0 gap-0 sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 text-left space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="!text-xl font-bold !text-slate-900 normal-case tracking-normal">
                  Allocate to Trials
                </DialogTitle>
                <DialogDescription className="!text-sm !text-slate-500">
                  Set the trial slot for {selectedIds.size} selected player{selectedIds.size === 1 ? '' : 's'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Who is being allocated */}
            <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-3">
              <p className="!text-xs font-semibold uppercase tracking-wide !text-purple-700 mb-2">Players</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPlayers.slice(0, 8).map((p) => (
                  <span key={p.workflow_id} className="rounded-full bg-white border border-purple-200 px-2.5 py-0.5 !text-xs font-medium !text-slate-700">
                    {p.full_name}
                  </span>
                ))}
                {selectedPlayers.length > 8 && (
                  <span className="rounded-full bg-purple-600 px-2.5 py-0.5 !text-xs font-semibold !text-white">
                    +{selectedPlayers.length - 8} more
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="!flex items-center gap-1.5 !text-sm font-semibold !text-slate-700">
                  <Calendar className="inline-block align-[-3px] mr-1.5 w-4 h-4 text-purple-600" />
                  Trial date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={allocationDate}
                  onChange={(e) => setAllocationDate(e.target.value)}
                  className="h-11 !text-slate-900"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="!flex items-center gap-1.5 !text-sm font-semibold !text-slate-700">
                  <Clock className="inline-block align-[-3px] mr-1.5 w-4 h-4 text-purple-600" />
                  Reporting time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={allocationTime}
                  onChange={(e) => setAllocationTime(e.target.value)}
                  className="h-11 !text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue" className="!flex items-center gap-1.5 !text-sm font-semibold !text-slate-700">
                <MapPin className="inline-block align-[-3px] mr-1.5 w-4 h-4 text-purple-600" />
                Venue
              </Label>
              <Input
                id="venue"
                list="trial-venue-options"
                placeholder="Ground name and city"
                value={allocationVenue}
                onChange={(e) => setAllocationVenue(e.target.value)}
                className="h-11 !text-slate-900"
              />
              <datalist id="trial-venue-options">
                {pastVenues.map((venue) => <option key={venue} value={venue} />)}
              </datalist>
              {pastVenues.length > 0 && (
                <p className="!text-xs !text-slate-500">Start typing to reuse a venue from earlier allocations.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="batch" className="!flex items-center gap-1.5 !text-sm font-semibold !text-slate-700">
                <Users className="inline-block align-[-3px] mr-1.5 w-4 h-4 text-purple-600" />
                Batch
              </Label>
              <Input
                id="batch"
                placeholder="e.g. Batch A, Morning Batch"
                value={allocationBatch}
                onChange={(e) => setAllocationBatch(e.target.value)}
                className="h-11 !text-slate-900"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BATCH_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAllocationBatch(preset)}
                    aria-pressed={allocationBatch === preset}
                    className={`!min-h-0 !min-w-0 rounded-full border px-3 py-1 !text-xs font-medium transition-colors ${allocationBatch === preset
                      ? 'border-purple-600 bg-purple-600 !text-white'
                      : 'border-slate-200 bg-white !text-slate-600 hover:border-purple-300 hover:bg-purple-50'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live summary of what will be saved */}
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <CalendarCheck className="w-4 h-4 mt-0.5 shrink-0 text-purple-600" />
              <p className="!text-sm !text-slate-700">
                <strong className="!text-slate-900">{selectedIds.size} player{selectedIds.size === 1 ? '' : 's'}</strong>
                {' → '}
                {allocationSummary || 'choose a trial date'}
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAllocationDialog(false)}
              disabled={processing}
              className="border-slate-300 bg-white !text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocate}
              disabled={processing || !allocationDate}
              className="![background-image:none] !bg-purple-600 hover:!bg-purple-700 !text-white normal-case tracking-normal"
            >
              {processing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Allocate {selectedIds.size} player{selectedIds.size === 1 ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrialsSectionTab;
