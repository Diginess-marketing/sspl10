import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  CalendarCheck, 
  RefreshCw,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Trophy,
  ClipboardCheck,
  Edit,
  AlertCircle,
  Clock
} from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { useAuth } from '@/hooks/useAuth';
import type { TrialsAllocatedPlayer, AttendanceStatus, SelectionStatus } from '@/types/workflow';

interface TrialsAllocatedTabProps {
  onRefresh: () => void;
}

const TrialsAllocatedTab = ({ onRefresh }: TrialsAllocatedTabProps) => {
  const [players, setPlayers] = useState<TrialsAllocatedPlayer[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<TrialsAllocatedPlayer | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Results form state
  const [battingScore, setBattingScore] = useState<string>('');
  const [bowlingScore, setBowlingScore] = useState<string>('');
  const [fieldingScore, setFieldingScore] = useState<string>('');
  const [overallScore, setOverallScore] = useState<string>('');
  const [selectionStatus, setSelectionStatus] = useState<SelectionStatus>('pending');
  const [remarks, setRemarks] = useState('');
  const [evaluatorNotes, setEvaluatorNotes] = useState('');

  const { user } = useAuth();
  const { 
    getTrialsAllocatedPlayers, 
    markAttendance,
    updateTrialResults,
    error 
  } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    setLocalLoading(true);
    try {
      const data = await getTrialsAllocatedPlayers();
      // Sort players: Selection Status > Attendance Status > Name
      const sortedData = [...data].sort((a, b) => {
        // 1. Selection Status Priority
        const resPriority: Record<string, number> = { 
          'selected': 1, 
          'SELECTED': 1,
          'pending': 2, 
          'PENDING': 2,
          'waitlisted': 3,
          'not_selected': 4,
          'REJECTED': 4,
          'NOT_SELECTED': 4
        };
        const pA = resPriority[a.selection_status || 'pending'] || 2;
        const pB = resPriority[b.selection_status || 'pending'] || 2;
        if (pA !== pB) return pA - pB;

        // 2. Attendance Status Priority
        const attPriority: Record<string, number> = { 
          'attended': 1, 
          'ATTENDED': 1,
          'pending': 2, 
          'PENDING': 2,
          'absent': 3,
          'ABSENT': 3
        };
        const aA = attPriority[a.attendance_status || 'pending'] || 2;
        const aB = attPriority[b.attendance_status || 'pending'] || 2;
        if (aA !== aB) return aA - aB;

        // 3. Name Alphabetical
        return a.full_name.localeCompare(b.full_name);
      });
      setPlayers(sortedData);
    } finally {
      setLocalLoading(false);
    }
  }, [getTrialsAllocatedPlayers]);

  useEffect(() => {
    loadPlayers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAttendance = async (player: TrialsAllocatedPlayer, status: AttendanceStatus) => {
    setProcessing(player.allocation_id);
    try {
      const success = await markAttendance(player.allocation_id, status, user?.id);
      if (success) {
        loadPlayers();
        onRefresh();
      } else {
        alert('Failed to update attendance');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleOpenResultsDialog = (player: TrialsAllocatedPlayer) => {
    setSelectedPlayer(player);
    // Pre-fill form with existing values
    setBattingScore(player.overall_score?.toString() || '');
    setBowlingScore('');
    setFieldingScore('');
    setOverallScore(player.overall_score?.toString() || '');
    setSelectionStatus(player.selection_status || 'pending');
    setRemarks(player.remarks || '');
    setEvaluatorNotes('');
    setShowResultsDialog(true);
  };

  const handleSaveResults = async () => {
    if (!selectedPlayer) return;

    setProcessing(selectedPlayer.allocation_id);
    try {
      const success = await updateTrialResults(
        selectedPlayer.allocation_id,
        battingScore ? parseFloat(battingScore) : undefined,
        bowlingScore ? parseFloat(bowlingScore) : undefined,
        fieldingScore ? parseFloat(fieldingScore) : undefined,
        overallScore ? parseFloat(overallScore) : undefined,
        selectionStatus,
        remarks || undefined,
        evaluatorNotes || undefined,
        user?.id
      );

      if (success) {
        alert('Trial results saved successfully!');
        setShowResultsDialog(false);
        loadPlayers();
        onRefresh();
      } else {
        alert('Failed to save trial results');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'attended':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Attended</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const getSelectionBadge = (status: SelectionStatus | null) => {
    switch (status) {
      case 'selected':
        return <Badge className="bg-green-100 text-green-700"><Trophy className="w-3 h-3 mr-1" /> Selected</Badge>;
      case 'not_selected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Not Selected</Badge>;
      case 'waitlisted':
        return <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1" /> Waitlisted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">Pending</Badge>;
    }
  };

  return (
    <>
      <Card className="shadow-elegant border-cricket-blue/10">
        <CardHeader className="border-b border-cricket-blue/10 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg">Trials Allocated</CardTitle>
                <p className="text-sm opacity-80 mt-1">
                  Mark attendance and record trial results
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
          {/* Stats */}
          <div className="p-4 border-b border-cricket-blue/10 bg-orange-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{players.length}</div>
              <div className="text-xs text-muted-foreground">Total Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {players.filter(p => p.attendance_status === 'attended').length}
              </div>
              <div className="text-xs text-muted-foreground">Attended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {players.filter(p => p.attendance_status === 'absent').length}
              </div>
              <div className="text-xs text-muted-foreground">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {players.filter(p => p.attendance_status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
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
              <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-muted-foreground">Loading allocated players...</span>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No trials allocated yet</p>
              <p className="text-sm">Allocate players from the Trials Section tab</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-100/50">
                    <TableHead className="font-semibold">Player</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Position</TableHead>
                    <TableHead className="font-semibold">Trial Details</TableHead>
                    <TableHead className="font-semibold">Attendance</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow 
                      key={player.workflow_id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-orange-50/30'} hover:bg-orange-100/50`}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-orange-700">{player.full_name}</div>
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
                        <Badge className="bg-orange-100 text-orange-700">
                          {player.position}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {player.allocation_date ? new Date(player.allocation_date).toLocaleDateString() : 'N/A'}
                          </div>
                          {player.allocation_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {player.allocation_time}
                            </div>
                          )}
                          {player.allocation_venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {player.allocation_venue}
                            </div>
                          )}
                          {player.allocation_batch && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {player.allocation_batch}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAttendanceBadge(player.attendance_status)}
                      </TableCell>
                      <TableCell>
                        {player.overall_score !== null ? (
                          <div className="font-bold text-lg text-orange-600">
                            {player.overall_score}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSelectionBadge(player.selection_status)}
                        {player.remarks && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-32 truncate" title={player.remarks}>
                            {player.remarks}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {player.attendance_status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAttendance(player, 'attended')}
                                disabled={processing === player.allocation_id}
                                className="text-xs border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-2"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAttendance(player, 'absent')}
                                disabled={processing === player.allocation_id}
                                className="text-xs border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-2"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          {player.attendance_status === 'attended' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenResultsDialog(player)}
                              disabled={processing === player.allocation_id}
                              className="text-xs border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              {player.selection_status && player.selection_status !== 'pending' ? 'Edit' : 'Enter'} Results
                            </Button>
                          )}
                          {processing === player.allocation_id && (
                            <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                          )}
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

      {/* Trial Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <ClipboardCheck className="w-5 h-5" />
              Trial Results - {selectedPlayer?.full_name}
            </DialogTitle>
            <DialogDescription>
              Enter scores and selection status for this player
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batting">Batting Score</Label>
                <Input
                  id="batting"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0-100"
                  value={battingScore}
                  onChange={(e) => setBattingScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bowling">Bowling Score</Label>
                <Input
                  id="bowling"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0-100"
                  value={bowlingScore}
                  onChange={(e) => setBowlingScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fielding">Fielding Score</Label>
                <Input
                  id="fielding"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0-100"
                  value={fieldingScore}
                  onChange={(e) => setFieldingScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overall">Overall Score *</Label>
                <Input
                  id="overall"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0-100"
                  value={overallScore}
                  onChange={(e) => setOverallScore(e.target.value)}
                />
              </div>
            </div>

            {/* Selection Status */}
            <div className="space-y-2">
              <Label>Selection Status *</Label>
              <Select value={selectionStatus} onValueChange={(v) => setSelectionStatus(v as SelectionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="selected">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-600" />
                      Selected
                    </span>
                  </SelectItem>
                  <SelectItem value="not_selected">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Not Selected
                    </span>
                  </SelectItem>
                  <SelectItem value="waitlisted">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      Waitlisted
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter remarks about the player's performance..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            {/* Evaluator Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Evaluator Notes (Internal)</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes for evaluators..."
                value={evaluatorNotes}
                onChange={(e) => setEvaluatorNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResultsDialog(false)}
              disabled={processing === selectedPlayer?.allocation_id}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveResults}
              disabled={processing === selectedPlayer?.allocation_id}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {processing === selectedPlayer?.allocation_id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Save Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrialsAllocatedTab;
