import { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  BarChart, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { id: 'total_registrations', name: 'Total Registrations (Pool)', category: 'General' },
  { id: 'net_failed', name: 'Net Failed Registrations', category: 'General' },
  { id: 'finance', name: 'Captured Details (Finance)', category: 'Finance' },
  { id: 'call_for_trials', name: 'Call for Trials List', category: 'Trials' },
  { id: 'selection_sheet', name: 'Trial Selection Sheet', category: 'Trials' },
  { id: 'trial_assessment', name: 'Trials Assessment Sheet', category: 'Trials' },
];

export const TrialsReportViewer = () => {
  const [selectedReport, setSelectedReport] = useState<string>('trial_assessment');
  const [level, setLevel] = useState<string>('1');
  const [location, setLocation] = useState<string>('Bangalore');
  const [reportData, setReportData] = useState<any[]>([]);
  const { getReportData, loading } = usePlayerWorkflow();

  const isLevelRequired = selectedReport === 'call_for_trials' || selectedReport === 'selection_sheet';
  const isLocationRequired = selectedReport === 'trial_assessment';

  const loadReport = async () => {
    const params: any = {};
    if (isLevelRequired) params.level = parseInt(level);
    if (isLocationRequired) params.location = location;
    
    const data = await getReportData(selectedReport, params);
    setReportData(data || []);
    if (data?.length > 0) {
      toast.success(`Generated ${data.length} records`);
    } else {
      toast.info('No records found for the selected criteria');
    }
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = Object.keys(reportData[0]);
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => 
          headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','),
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sspl_report_${selectedReport}_lvl${level}_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      toast.success('Report downloaded successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const currentReportName = useMemo(() => 
    REPORT_TYPES.find(r => r.id === selectedReport)?.name || 'Report'
  , [selectedReport]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cricket-blue" />
                Reporting Hub
              </CardTitle>
              <CardDescription>Select and generate operational reports</CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Type:</span>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger className="w-[240px] bg-white">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                  {REPORT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 uppercase opacity-60">
                          {type.category}
                        </Badge>
                        {type.name}
                      </span>
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              {isLevelRequired && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Level:</span>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-[110px] bg-white">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isLocationRequired && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Search:</span>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location (e.g. Bangalore)"
                      className="pl-9 w-[200px] bg-white"
                    />
                  </div>
                </div>
              )}

              <Button onClick={loadReport} disabled={loading} className="bg-cricket-blue hover:bg-cricket-dark-blue min-w-[120px]">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BarChart className="w-4 h-4 mr-2" />}
                Generate
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="p-12"
              >
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[95%]" />
                </div>
                <div className="text-center mt-6 text-slate-400 animate-pulse">
                  Aggregating data points...
                </div>
              </motion.div>
            ) : reportData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto"
              >
                <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-800">
                      Showing preview for <strong>{currentReportName}</strong>
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {reportData.length} records
                    </Badge>
                  </div>
                  <Button size="sm" onClick={handleExport} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export Full CSV
                  </Button>
                </div>
                
                <div className="max-h-[500px] overflow-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                      <tr>
                        {Object.keys(reportData[0]).map(header => (
                          <th key={header} className="px-4 py-3 font-semibold text-slate-700 capitalize">
                            {header.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                          {Object.keys(reportData[0]).map(col => (
                            <td key={col} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                              {renderCell(col, row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.length > 50 && (
                    <div className="p-4 text-center bg-slate-50 text-slate-500 italic text-xs">
                      Viewing first 50 records. Download CSV to see all {reportData.length} records.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">No data generated yet</h4>
                  <p className="text-sm text-slate-500">Pick a report type and click "Generate" to preview results</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed border-slate-200 shadow-none">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs text-slate-400 uppercase tracking-wider">Report Descriptions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2 text-xs text-slate-500 italic">
            <p>• <strong>Total Registrations</strong>: Full list of players who initiated registration on the platform.</p>
            <p>• <strong>Call for Trials</strong>: Unified list of candidates eligible for Level 1, 2, or 3 calling.</p>
            <p>• <strong>Selection Sheet</strong>: Results and evaluations for specific trial levels.</p>
            <p>• <strong>Assessment Sheet</strong>: Location-based view of all candidates (Karnataka/Bangalore), mapping their current status from registration to selection.</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-100 bg-slate-900 text-slate-400 shadow-none">
          <CardContent className="p-6 flex items-center justify-center text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white mb-2">💡 Quick Tip</div>
              <p className="text-xs">
                Selection sheets include <strong>Proficiency</strong> and <strong>State</strong> by default
                to help selectors build balanced teams from the trial pool.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper to render cell value with specific styling if needed
const renderCell = (key: string, value: any) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') {
    return value ? (
      <Badge className="bg-blue-100 text-blue-700 border-none">YES</Badge>
    ) : (
      <Badge className="bg-slate-100 text-slate-400 border-none">NO</Badge>
    );
  }

  const v = String(value).toLowerCase();

  if (v === 'captured' || v === 'success' || v === 'selected' || v === 'attended') {
    return <span className="flex items-center gap-1.5 text-green-600 font-medium saturate-150"><CheckCircle className="w-3.5 h-3.5" /> {String(value)}</span>;
  }
  if (v === 'failed' || v === 'rejected' || v === 'absent') {
    return <span className="flex items-center gap-1.5 text-red-500 font-medium"><XCircle className="w-3.5 h-3.5" /> {String(value)}</span>;
  }
  if (v === 'pending' || v === 'in_progress') {
    return <span className="flex items-center gap-1.5 text-amber-500 font-medium"><Clock className="w-3.5 h-3.5 animate-pulse" /> {String(value)}</span>;
  }

  // Formatting for amount
  if (key === 'amount' && typeof value === 'number') {
    return `₹${value.toLocaleString()}`;
  }

  // Formatting for dates
  if (key.includes('_at') || key.includes('_date')) {
    try {
      return new Date(value).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(value);
    }
  }

  return String(value);
};
