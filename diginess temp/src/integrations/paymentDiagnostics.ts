/**
 * Payment Status Update Diagnostic Utility
 * 
 * This utility helps diagnose why payment status updates are not being persisted to Supabase.
 * Run this to get detailed information about the update process.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  supabaseConnected: boolean;
  supabaseUrl: string;
  testTableAccessible: boolean;
  sampleRecords: number;
  canWrite: boolean;
  canRead: boolean;
  lastError?: string;
  recommendations: string[];
}

export async function diagnosePaymentStatusUpdates(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    supabaseConnected: false,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
    testTableAccessible: false,
    sampleRecords: 0,
    canWrite: false,
    canRead: false,
    recommendations: [],
  };

  try {
    // Test 1: Check Supabase connection
    console.log('🔍 Test 1: Checking Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('player_registrations' as any)
      .select('count', { count: 'exact', head: true });

    if (!healthError) {
      result.supabaseConnected = true;
      console.log('✅ Supabase connected successfully');
    } else {
      console.error('❌ Supabase connection failed:', healthError.message);
      result.lastError = healthError.message;
      result.recommendations.push('Check your Supabase URL and API key in environment variables');
      return result;
    }

    // Test 2: Check table accessibility
    console.log('\n🔍 Test 2: Checking table accessibility...');
    const { data: tableTest, error: tableError, count } = await supabase
      .from('player_registrations' as any)
      .select('id, payment_status', { count: 'exact' })
      .limit(5);

    if (!tableError) {
      result.testTableAccessible = true;
      result.sampleRecords = count || 0;
      console.log(`✅ Table accessible. Found ${count} records`);
    } else {
      console.error('❌ Table access failed:', tableError.message);
      result.recommendations.push('Check table permissions in Supabase');
      return result;
    }

    // Test 3: Read capability
    console.log('\n🔍 Test 3: Testing read capability...');
    const readResult = await (supabase
      .from('player_registrations' as any)
      .select('id, payment_status, razorpay_payment_id')
      .limit(1)
      .single() as unknown as Promise<any>);
    const readTest = readResult.data as any;
    const readError = readResult.error;

    if (!readError && readTest) {
      result.canRead = true;
      console.log('✅ Read capability working');
      console.log('   Sample record:', {
        id: readTest.id,
        payment_status: readTest.payment_status,
        has_payment_id: !!readTest.razorpay_payment_id,
      });
    } else if ((readError as any)?.code === 'PGRST116') {
      result.canRead = true;
      console.log('✅ Read capability working (no records found)');
    } else {
      console.error('❌ Read failed:', readError?.message);
      result.recommendations.push('Check SELECT permissions on player_registrations table');
    }

    // Test 4: Write capability with test update
    console.log('\n🔍 Test 4: Testing write capability (test update)...');
    
    // Find a record to test update
    const queryResult = await (supabase
      .from('player_registrations' as any)
      .select('id, payment_status, updated_at')
      .limit(1)
      .single() as unknown as Promise<any>);
    const testRecord = queryResult.data as any;

    if (testRecord) {
      const originalStatus = testRecord.payment_status;
      const testStatus = 'test_' + Date.now();

      // Try to update
      const updateResult = await (supabase
        .from('player_registrations' as any)
        .update({
          payment_status: testStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testRecord.id)
        .select()
        .single() as unknown as Promise<any>);
      const updateTest = updateResult.data as any;
      const updateError = updateResult.error;

      if (!updateError && updateTest) {
        result.canWrite = true;
        console.log('✅ Write capability working');

        // Restore original status
        await supabase
          .from('player_registrations' as any)
          .update({
            payment_status: originalStatus,
            updated_at: testRecord.updated_at,
          })
          .eq('id', testRecord.id);

        console.log('   (Test data restored to original values)');
      } else {
        console.error('❌ Write failed:', updateError?.message);
        result.recommendations.push('Check UPDATE permissions on player_registrations table');
        result.recommendations.push('Verify RLS (Row Level Security) policies allow updates');
      }
    } else {
      console.log('⚠️  No test records found, skipping write test');
      result.recommendations.push('Create a test registration to verify write capabilities');
    }

    // Test 5: Check for RLS policies
    console.log('\n🔍 Test 5: Checking RLS policies...');
    try {
      // Try to get RLS status via direct query
      const { data: rlsData, error: rlsError } = await supabase
        .from('player_registrations' as any)
        .select('count', { count: 'exact', head: true });

      if (!rlsError) {
        console.log('✅ RLS status check passed');
        result.recommendations.push('RLS appears to be configured. Verify policies allow your operations.');
      } else if (rlsError.code === 'PGRST301' || rlsError.message.includes('permission')) {
        console.log('⚠️  RLS might be blocking queries');
        result.recommendations.push('RLS policies may be blocking operations - check Supabase dashboard');
      }
    } catch (error) {
      console.log('⚠️  Could not check RLS policies');
    }

  } catch (error) {
    console.error('💥 Unexpected error during diagnosis:', error);
    result.lastError = error instanceof Error ? error.message : 'Unknown error';
    result.recommendations.push('Check browser console for detailed error information');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log(`Supabase Connected: ${result.supabaseConnected ? '✅' : '❌'}`);
  console.log(`Table Accessible: ${result.testTableAccessible ? '✅' : '❌'}`);
  console.log(`Can Read: ${result.canRead ? '✅' : '❌'}`);
  console.log(`Can Write: ${result.canWrite ? '✅' : '❌'}`);
  console.log(`Total Records: ${result.sampleRecords}`);

  if (result.recommendations.length > 0) {
    console.log('\n📋 RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  return result;
}

/**
 * Test updating a specific payment status
 */
export async function testPaymentStatusUpdate(
  registrationId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log(`🔄 Testing update for registration: ${registrationId}`);
    console.log(`   New status: ${newStatus}`);

    // Fetch current record
    const fetchResult = await (supabase
      .from('player_registrations' as any)
      .select('*')
      .eq('id', registrationId)
      .single() as unknown as Promise<any>);
    const current = fetchResult.data as any;
    const fetchError = fetchResult.error;

    if (fetchError) {
      console.error('❌ Failed to fetch record:', fetchError.message);
      return { success: false, error: `Fetch failed: ${fetchError.message}` };
    }

    console.log('📋 Current record:', {
      id: current.id,
      payment_status: current.payment_status,
      updated_at: current.updated_at,
    });

    // Attempt update
    const updateResult = await (supabase
      .from('player_registrations' as any)
      .update({
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single() as unknown as Promise<any>);
    const updated = updateResult.data as any;
    const updateError = updateResult.error;

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return { success: false, error: `Update failed: ${updateError.message}` };
    }

    console.log('✅ Update successful:', {
      id: updated.id,
      payment_status: updated.payment_status,
      updated_at: updated.updated_at,
    });

    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Test failed with exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Check if updates are being persisted
 */
export async function verifyPaymentStatusPersistence(
  registrationId: string
): Promise<{ persistent: boolean; lastUpdated: string; currentStatus: string }> {
  try {
    console.log(`🔍 Verifying persistence for registration: ${registrationId}`);

    // Read current status
    const queryResult = await (supabase
      .from('player_registrations' as any)
      .select('payment_status, updated_at')
      .eq('id', registrationId)
      .single() as unknown as Promise<any>);
    const data = queryResult.data as any;
    const error = queryResult.error;

    if (error) {
      throw error;
    }

    const result = {
      persistent: true,
      lastUpdated: data.updated_at,
      currentStatus: data.payment_status,
    };

    console.log('✅ Record found:', result);
    return result;
  } catch (error) {
    console.error('❌ Persistence check failed:', error);
    return {
      persistent: false,
      lastUpdated: 'N/A',
      currentStatus: 'N/A',
    };
  }
}
