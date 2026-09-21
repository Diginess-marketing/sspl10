import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Simple test component to verify player_registrations table access
 * Add this temporarily to diagnose data loading issues
 */
const TestPlayerRegistrationsQuery = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-run test on mount
  useEffect(() => {
    console.log('🔧 TestPlayerRegistrationsQuery mounted');
    runTest();
  }, []);

  const runTest = async () => {
    console.log('🔧 Starting database tests...');
    setLoading(true);
    setResult(null);

    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Check session
      console.log('🔍 Test 1: Checking session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      testResults.tests.session = {
        success: !sessionError,
        hasSession: !!sessionData?.session,
        user: sessionData?.session?.user?.email || 'Not logged in',
        error: sessionError?.message
      };

      // Test 2: Simple count query
      console.log('🔍 Test 2: Count query...');
      const { count, error: countError } = await supabase
        .from('player_registrations')
        .select('*', { count: 'exact', head: true });
      
      testResults.tests.count = {
        success: !countError,
        count: count,
        error: countError?.message,
        errorCode: countError?.code,
        errorHint: countError?.hint
      };

      // Test 3: Fetch first 5 rows
      console.log('🔍 Test 3: Fetch 5 rows...');
      const { data, error: fetchError } = await supabase
        .from('player_registrations')
        .select(`
          id,
          full_name,
          email,
          phone,
          payment_status,
          payment_amount,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      testResults.tests.fetch = {
        success: !fetchError,
        rowCount: data?.length || 0,
        data: data?.map(r => ({
          id: r.id,
          name: r.full_name,
          email: r.email,
          payment_status: r.payment_status
        })),
        error: fetchError?.message,
        errorCode: fetchError?.code,
        errorDetails: fetchError?.details
      };

      // Test 4: Check for paid registrations
      console.log('🔍 Test 4: Check paid registrations...');
      const { data: paidData, error: paidError } = await supabase
        .from('player_registrations')
        .select('id, full_name, payment_status')
        .eq('payment_status', 'completed')
        .limit(3);

      testResults.tests.paidRegistrations = {
        success: !paidError,
        count: paidData?.length || 0,
        data: paidData,
        error: paidError?.message
      };

      console.log('✅ All tests completed:', testResults);
      setResult(testResults);

    } catch (err: any) {
      console.error('❌ Test error:', err);
      testResults.error = err.message;
      setResult(testResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Player Registrations Database Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Test run at: {result.timestamp}
            </div>

            {/* Session Test */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">
                1. Session Check {result.tests.session?.success ? '✅' : '❌'}
              </h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.tests.session, null, 2)}
              </pre>
            </div>

            {/* Count Test */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">
                2. Count Query {result.tests.count?.success ? '✅' : '❌'}
              </h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.tests.count, null, 2)}
              </pre>
            </div>

            {/* Fetch Test */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">
                3. Fetch Rows {result.tests.fetch?.success ? '✅' : '❌'}
              </h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.tests.fetch, null, 2)}
              </pre>
            </div>

            {/* Paid Registrations Test */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">
                4. Paid Registrations {result.tests.paidRegistrations?.success ? '✅' : '❌'}
              </h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.tests.paidRegistrations, null, 2)}
              </pre>
            </div>

            {result.error && (
              <div className="border border-red-500 rounded p-4 bg-red-50">
                <h3 className="font-bold mb-2 text-red-700">Overall Error</h3>
                <pre className="text-xs text-red-600">{result.error}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestPlayerRegistrationsQuery;
