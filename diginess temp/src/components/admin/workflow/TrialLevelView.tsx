import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  MapPin, 
  RefreshCw,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import type { TrialViewRecord } from '@/types/workflow';

interface TrialLevelViewProps {
  level: number;
  onRefresh?: () => void;
}

export const TrialLevelView = ({ level, onRefresh }: TrialLevelViewProps) => {
  const [players, setPlayers] = useState<TrialViewRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { getTrialLevelPlayers, markCandidateCalled, markCandidateAttendance, markCandidateResult, loading } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    const data = await getTrialLevelPlayers(level);
    setPlayers(data);
  }, [getTrialLevelPlayers, level]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleToggleCalled = async (candidateId: string) => {
    setProcessingId(candidateId);
    try {
      const success = await markCandidateCalled(candidateId, level);
      if (success) {
        await loadPlayers();
        onRefresh?.();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleAttendanceChange = async (candidateId: string, status: string) => {
    setProcessingId(candidateId);
    try {
      const success = await markCandidateAttendance(candidateId, level, status);
      if (success) {
        await loadPlayers();
        onRefresh?.();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleResultChange = async (candidateId: string, result: string) => {
    setProcessingId(candidateId);
    try {
      const success = await markCandidateResult(candidateId, level, result);
      if (success) {
        // If result changed, player might move to next level and leave this view
        await loadPlayers();
        onRefresh?.();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPlayers = players
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.phone.includes(searchQuery);
      const matchesCity = filterCity === 'all' || p.city === filterCity;
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      // 1. Selection Result Priority (Selected > Pending > Rejected)
      const resA = (getResultStatus(a) || 'pending').toLowerCase();
      const resB = (getResultStatus(b) || 'pending').toLowerCase();
      const resPriority: Record<string, number> = { 'selected': 1, 'pending': 2, 'rejected': 3, 'not_selected': 3 };
      const pA = resPriority[resA] || 2;
      const pB = resPriority[resB] || 2;
      if (pA !== pB) return pA - pB;

      // 2. Attendance Priority (Attended > Pending > Absent)
      const attA = (getAttendanceStatus(a) || 'pending').toLowerCase();
      const attB = (getAttendanceStatus(b) || 'pending').toLowerCase();
      const attPriority: Record<string, number> = { 'attended': 1, 'pending': 2, 'absent': 3 };
      const aA = attPriority[attA] || 2;
      const aB = attPriority[attB] || 2;
      if (aA !== aB) return aA - aB;

      // 3. Called Status Priority (Called > Not Called)
      const callA = getCalledStatus(a) ? 1 : 2;
      const callB = getCalledStatus(b) ? 1 : 2;
      if (callA !== callB) return callA - callB;

      // 4. Name Alphabetical
      return a.name.localeCompare(b.name);
    });

  const uniqueCities = Array.from(new Set(players.map(p => p.city).filter(Boolean))).sort() as string[];

  const getCalledStatus = (p: TrialViewRecord) => {
    const called = level === 1 ? p.l1_called : level === 2 ? p.l2_called : p.l3_called;
    return called;
  };

  const getAttendanceStatus = (p: TrialViewRecord) => {
    const status = level === 1 ? p.l1_attendance : level === 2 ? p.l2_attendance : p.l3_attendance;
    return status || 'pending';
  };

  const getResultStatus = (p: TrialViewRecord) => {
    let status = level === 1 ? p.l1_result : level === 2 ? p.l2_result : p.l3_result;

    // Apply dynamic business logic
    if (p.l3_result === 'SELECTED') {
      status = 'SELECTED';
    } else if (p.l1_result === 'REJECTED' || p.l2_result === 'REJECTED' || p.l3_result === 'REJECTED') {
      if (status !== 'SELECTED') status = 'REJECTED';
    } else if (p.l1_attendance === 'ABSENT' || p.l2_attendance === 'ABSENT' || p.l3_attendance === 'ABSENT') {
      if (!status || status === 'PENDING') status = 'PENDING';
    }

    return status || 'pending';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Called', 'Attendance', 'Result'];
    const rows = filteredPlayers.map(p => [
      p.name,
      p.phone,
      p.email,
      p.city || '',
      getCalledStatus(p) ? 'Yes' : 'No',
      getAttendanceStatus(p),
      getResultStatus(p),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sspl_trials_l${level}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-elegant border-cricket-blue/10">
      <CardHeader className="border-b border-cricket-blue/10 bg-linear-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle>Level {level} Management</CardTitle>
            <p className="text-sm opacity-80 mt-1">Track attendance and results for trial level {level}</p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-9"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={exportToCSV}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-9"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadPlayers} 
              disabled={loading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-9"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b border-cricket-blue/10 bg-slate-50 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-40 h-8 text-xs bg-white">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-slate-500 ml-auto">
            Showing {filteredPlayers.length} of {players.length} candidates
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="font-semibold">Candidate</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Remarks</TableHead>
                <TableHead className="font-semibold text-center">Called</TableHead>
                <TableHead className="font-semibold">Attendance</TableHead>
                <TableHead className="font-semibold">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    {loading ? 'Loading...' : 'No candidates found for this level'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const isCalled = getCalledStatus(player);
                  const attendance = (getAttendanceStatus(player) || 'pending').toLowerCase();
                  const result = (getResultStatus(player) || 'pending').toLowerCase();

                  return (
                    <TableRow key={player.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <TableCell>
                        <div className="font-semibold text-slate-800">{player.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{player.id.split('-')[0]}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {player.phone}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-40">{player.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {player.city || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-500 italic max-w-40 truncate">
                          {player.metadata?.excel_remarks || player.remarks || '---'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={isCalled} 
                          onCheckedChange={() => handleToggleCalled(player.id)}
                          disabled={processingId === player.id}
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={attendance.toLowerCase()} 
                          onValueChange={(val) => handleAttendanceChange(player.id, val)}
                          disabled={!isCalled || processingId === player.id}
                        >
                          <SelectTrigger className={`w-32 h-8 text-xs ${
                            attendance === 'attended' ? 'text-green-600 bg-green-50 border-green-200' :
                            attendance === 'absent' ? 'text-red-600 bg-red-50 border-red-200' : ''
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={result.toLowerCase()} 
                          onValueChange={(val) => handleResultChange(player.id, val)}
                          disabled={attendance.toLowerCase() !== 'attended' || processingId === player.id}
                        >
                          <SelectTrigger className={`w-32 h-8 text-xs ${
                            result === 'selected' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                            result === 'rejected' ? 'text-slate-600 bg-slate-100 border-slate-200' : ''
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
