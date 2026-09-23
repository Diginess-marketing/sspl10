import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  Settings,
  BarChart3,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
// import { format, subDays } from 'date-fns'; // Temporarily disabled for build

// Simple replacements for date-fns functions
const format = (date: Date, formatStr: string) => {
  const options: Intl.DateTimeFormatOptions = {};
  if (formatStr.includes('yyyy')) options.year = 'numeric';
  if (formatStr.includes('MMM')) options.month = 'short';
  if (formatStr.includes('MM')) options.month = '2-digit';
  if (formatStr.includes('dd')) options.day = '2-digit';
  if (formatStr.includes('d ')) options.day = 'numeric';
  return date.toLocaleDateString('en-US', options);
};

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};
import { useToast } from '@/hooks/use-toast';

interface ReportType {
  id: string;
  name: string;
  description: string;
  defaultMetrics: string[];
  defaultDimensions: string[];
}

interface DatePreset {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  mimeType: string;
  extension: string;
}

interface ReportConfiguration {
  reportTypes: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  exportFormat: string;
  propertyId: string;
  dimensions: string[];
  metrics: string[];
  title: string;
  filename: string;
}

const GoogleAnalyticsReportDownload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<ReportConfiguration>({
    reportTypes: ['pageViews'],
    dateRange: {
      from: subDays(new Date(), 30) as Date,
      to: new Date() as Date,
    },
    exportFormat: 'csv',
    propertyId: '',
    dimensions: [],
    metrics: [],
    title: '',
    filename: '',
  });

  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [datePresets, setDatePresets] = useState<DatePreset[]>([]);
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([]);
  const [gaConfig, setGaConfig] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load report types, date presets, and export formats from backend
      const [reportTypesRes, datePresetsRes, exportFormatsRes, gaConfigRes] = await Promise.all([
        fetch('/api/ga/report-types'),
        fetch('/api/ga/date-presets'),
        fetch('/api/ga/export-formats'),
        fetch('/api/ga/config'),
      ]);

      if (reportTypesRes.ok) {
        setReportTypes(await reportTypesRes.json());
      }

      if (datePresetsRes.ok) {
        setDatePresets(await datePresetsRes.json());
      }

      if (exportFormatsRes.ok) {
        setExportFormats(await exportFormatsRes.json());
      }

      if (gaConfigRes.ok) {
        const config = await gaConfigRes.json();
        setGaConfig(config);
        if (config && config.measurement_id) {
          setConfig(prev => ({ ...prev, propertyId: config.measurement_id }));
        }
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeToggle = (reportTypeId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      reportTypes: checked
        ? [...prev.reportTypes, reportTypeId]
        : prev.reportTypes.filter(type => type !== reportTypeId),
    }));
  };

  const handleDatePresetSelect = (presetId: string) => {
    const preset = datePresets.find(p => p.id === presetId);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        dateRange: {
          from: new Date(preset.startDate) as Date,
          to: new Date(preset.endDate) as Date,
        },
      }));
    }
  };

  const handleGenerateReport = async () => {
    if (!config.propertyId) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure Google Analytics property ID first.',
        variant: 'destructive',
      });
      return;
    }

    if (config.reportTypes.length === 0) {
      toast({
        title: 'Report Types Required',
        description: 'Please select at least one report type.',
        variant: 'destructive',
      });
      return;
    }

    if (!config.dateRange.from || !config.dateRange.to) {
      toast({
        title: 'Date Range Required',
        description: 'Please select a valid date range.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/ga/generate-and-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          startDate: format(config.dateRange.from!, 'yyyy-MM-dd'),
          endDate: format(config.dateRange.to!, 'yyyy-MM-dd'),
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      setProgress(100);

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `ga-report-${Date.now()}.${config.exportFormat}`;

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report Generated',
        description: `Your ${config.exportFormat.toUpperCase()} report has been downloaded successfully.`,
      });

    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to generate report.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const getSelectedReportTypeNames = () => {
    return config.reportTypes.map(typeId => {
      const reportType = reportTypes.find(rt => rt.id === typeId);
      return reportType ? reportType.name : typeId;
    });
  };

  const getSelectedFormat = () => {
    return exportFormats.find(format => format.id === config.exportFormat);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Google Analytics Report Download</h2>
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Google Analytics Report Download</h2>
          <p className="text-gray-600">Generate and download comprehensive analytics reports</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleGenerateReport}
            disabled={generating || config.reportTypes.length === 0}
            className="min-w-32"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {generating && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating Report...</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Alert */}
      {!gaConfig && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Google Analytics is not configured. Please configure it in the admin panel to generate reports.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property ID */}
            <div className="space-y-2">
              <Label htmlFor="propertyId">Google Analytics Property ID</Label>
              <Input
                id="propertyId"
                value={config.propertyId}
                onChange={(e) => setConfig(prev => ({ ...prev, propertyId: e.target.value }))}
                placeholder="GA_MEASUREMENT_ID"
              />
            </div>

            {/* Date Range Selection */}
            <div className="space-y-4">
              <Label>Date Range</Label>

              {/* Date Presets */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Quick Select</Label>
                <div className="grid grid-cols-2 gap-2">
                  {datePresets.map(preset => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDatePresetSelect(preset.id)}
                      className="justify-start"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Custom Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {config.dateRange.from ? format(config.dateRange.from, 'MMM dd, yyyy') : 'Select start date'} - {config.dateRange.to ? format(config.dateRange.to, 'MMM dd, yyyy') : 'Select end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: config.dateRange.from, to: config.dateRange.to }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          const fromDate: Date = range.from;
                          const toDate: Date = range.to;
                          setConfig(prev => ({
                            ...prev,
                            dateRange: {
                              from: fromDate,
                              to: toDate,
                            },
                          }));
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={config.exportFormat} onValueChange={(value) => setConfig(prev => ({ ...prev, exportFormat: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map(format => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center gap-2">
                        {format.id === 'csv' && <FileSpreadsheet className="w-4 h-4" />}
                        {format.id === 'pdf' && <FileText className="w-4 h-4" />}
                        {format.id === 'excel' && <FileSpreadsheet className="w-4 h-4" />}
                        <div>
                          <div className="font-medium">{format.name}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Types Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Report Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportTypes.map(reportType => (
                <div key={reportType.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={reportType.id}
                    checked={config.reportTypes.includes(reportType.id)}
                    onCheckedChange={(checked) => handleReportTypeToggle(reportType.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={reportType.id} className="font-medium cursor-pointer">
                      {reportType.name}
                    </Label>
                    <p className="text-sm text-gray-600">{reportType.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {reportType.defaultMetrics.length} metrics
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {reportType.defaultDimensions.length} dimensions
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Selected Reports</Label>
              <div className="flex flex-wrap gap-1">
                {getSelectedReportTypeNames().map(name => (
                  <Badge key={name} variant="default">{name}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Date Range</Label>
              <p className="text-sm">
                {config.dateRange.from ? format(config.dateRange.from, 'MMM dd, yyyy') : 'Not selected'} - {config.dateRange.to ? format(config.dateRange.to, 'MMM dd, yyyy') : 'Not selected'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Export Format</Label>
              <div className="flex items-center gap-2">
                {config.exportFormat === 'csv' && <FileSpreadsheet className="w-4 h-4" />}
                {config.exportFormat === 'pdf' && <FileText className="w-4 h-4" />}
                {config.exportFormat === 'excel' && <FileSpreadsheet className="w-4 h-4" />}
                <span className="text-sm">{getSelectedFormat()?.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Options (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Custom report title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={config.filename}
                    onChange={(e) => setConfig(prev => ({ ...prev, filename: e.target.value }))}
                    placeholder="custom-report-name"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customization" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Advanced customization options will be available in future updates.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAnalyticsReportDownload;