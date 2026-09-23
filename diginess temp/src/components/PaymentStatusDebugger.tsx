/**
 * Payment Status Update Debugger Component
 * 
 * This component provides a UI to test and debug payment status updates.
 * Use this to diagnose why updates aren't being persisted.
 */

import React, { useState } from 'react';
import {
  diagnosePaymentStatusUpdates,
  testPaymentStatusUpdate,
  verifyPaymentStatusPersistence,
} from '@/integrations/paymentDiagnostics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export const PaymentStatusDebugger: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [registrationId, setRegistrationId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [persistenceResult, setPersistenceResult] = useState<any>(null);

  const handleDiagnose = async () => {
    setLoading(true);
    try {
      const result = await diagnosePaymentStatusUpdates();
      setDiagnostics(result);
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUpdate = async () => {
    if (!registrationId) {
      alert('Please enter a registration ID');
      return;
    }

    setLoading(true);
    try {
      const result = await testPaymentStatusUpdate(
        registrationId,
        'completed',
      );
      setTestResult(result);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPersistence = async () => {
    if (!registrationId) {
      alert('Please enter a registration ID');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPaymentStatusPersistence(registrationId);
      setPersistenceResult(result);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Update Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diagnostics Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Run Diagnostics</h3>
            <Button
              onClick={handleDiagnose}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Running...' : 'Run Full Diagnostic'}
            </Button>

            {diagnostics && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={diagnostics.supabaseConnected ? 'default' : 'destructive'}>
                    {diagnostics.supabaseConnected ? '✅' : '❌'} Supabase
                  </Badge>
                  <span className="text-xs text-gray-600">{diagnostics.supabaseUrl}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={diagnostics.testTableAccessible ? 'default' : 'destructive'}>
                    {diagnostics.testTableAccessible ? '✅' : '❌'} Table Access
                  </Badge>
                  <span className="text-xs text-gray-600">{diagnostics.sampleRecords} records</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={diagnostics.canRead ? 'default' : 'destructive'}>
                    {diagnostics.canRead ? '✅' : '❌'} Read
                  </Badge>
                  <Badge variant={diagnostics.canWrite ? 'default' : 'destructive'}>
                    {diagnostics.canWrite ? '✅' : '❌'} Write
                  </Badge>
                </div>

                {diagnostics.recommendations.length > 0 && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <div className="font-semibold mb-2">Recommendations:</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {diagnostics.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-xs">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {diagnostics.lastError && (
                  <Alert variant="destructive">
                    <AlertDescription>Error: {diagnostics.lastError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <hr className="my-4" />

          {/* Test Update Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Test Single Payment Update</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter registration ID"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleTestUpdate}
                disabled={loading || !registrationId}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Update'}
              </Button>

              <Button
                onClick={handleVerifyPersistence}
                disabled={loading || !registrationId}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Persistence'}
              </Button>
            </div>

            {testResult && (
              <div className="mt-4">
                {testResult.success ? (
                  <Alert>
                    <AlertDescription>
                      <div className="text-sm">
                        <div className="font-semibold text-green-600">✅ Update Successful</div>
                        <div className="mt-2 space-y-1">
                          {testResult.data && (
                            <>
                              <div>ID: {testResult.data.id}</div>
                              <div>Status: {testResult.data.payment_status}</div>
                              <div>Updated: {testResult.data.updated_at}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="text-sm">
                        <div className="font-semibold">❌ Update Failed</div>
                        <div className="mt-2">{testResult.error}</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {persistenceResult && (
              <div className="mt-4">
                <Alert variant={persistenceResult.persistent ? 'default' : 'destructive'}>
                  <AlertDescription>
                    <div className="text-sm">
                      <div className="font-semibold">
                        {persistenceResult.persistent ? '✅' : '❌'} Persistence Check
                      </div>
                      <div className="mt-2 space-y-1">
                        <div>Current Status: {persistenceResult.currentStatus}</div>
                        <div>Last Updated: {persistenceResult.lastUpdated}</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <hr className="my-4" />

          {/* Console Output */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Console Output</h3>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-32 overflow-y-auto">
              <div>Check your browser DevTools Console (F12) for detailed logs</div>
              <div className="text-gray-500 mt-2">Press F12 → Console tab to see full diagnostic output</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatusDebugger;
