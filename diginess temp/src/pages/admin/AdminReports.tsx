import { TrialsReportViewer } from '@/components/admin/workflow/TrialsReportViewer';
import { FileStack, Download, Info, BarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminReports = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Export historical and operational data for registrations and trials.
                    </p>
                </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800 shadow-sm">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="font-bold">Data Privacy Notice</AlertTitle>
                <AlertDescription className="text-sm">
                    Reports contain sensitive player information (phone numbers, emails).
                    Ensure downloaded CSV files are stored securely and only shared with authorized personnel.
                </AlertDescription>
            </Alert>

            <TrialsReportViewer />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-sport-orange/10 flex items-center justify-center">
                        <FileStack className="w-6 h-6 text-sport-orange" />
                    </div>
                    <h3 className="font-bold text-slate-800">Operational Continuity</h3>
                    <p className="text-xs text-slate-500">
                        Reports are updated in real-time as selectors mark results in the Trials Section.
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Download className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">High Speed Export</h3>
                    <p className="text-xs text-slate-500">
                        CSV exports are generated on the fly, handling thousands of records efficiently.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <BarChart className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Audit Ready</h3>
                    <p className="text-xs text-slate-500">
                        Every report is linked to the core database views ensuring 100% data integrity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
