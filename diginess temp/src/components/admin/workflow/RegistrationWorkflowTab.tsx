import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Mail,
  MailCheck,
  ArrowRight,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { useAuth } from '@/hooks/useAuth';
import type { PlayerRegistrationWithEmailStatus, WorkflowStage } from '@/types/workflow';

interface RegistrationWorkflowTabProps {
  onRefresh: () => void;
}

const RegistrationWorkflowTab = ({ onRefresh }: RegistrationWorkflowTabProps) => {
  console.log('🔄 RegistrationWorkflowTab component rendered');

  const [players, setPlayers] = useState<PlayerRegistrationWithEmailStatus[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmail, setFilterEmail] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterAttendance, setFilterAttendance] = useState<string>('all');
  const [processing, setProcessing] = useState(false);
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const { user } = useAuth();
  const {
    moveToTrialsSection,
    sendConfirmationEmail,
  } = usePlayerWorkflow();

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(players.map(p => p.city).filter((city): city is string => Boolean(city)))).sort();

  console.log('🔄 Component state:', {
    playersCount: players.length,
    localLoading,
    localError,
    hasUser: Boolean(user),
  });

  // Reload function that can be called from anywhere
  const reloadData = useCallback(() => {
    console.log('🔄 Reload triggered');
    setReloadTrigger(prev => prev + 1);
  }, []);

  // Load data on mount and when reloadTrigger changes
  useEffect(() => {
    console.log('📋 useEffect triggered, reloadTrigger:', reloadTrigger);
    let isMounted = true;

    const loadPlayers = async () => {
      console.log('📋 [RegistrationWorkflowTab] Starting to load player registrations...');
      console.log('📋 [Auth State]', { hasUser: Boolean(user), userEmail: user?.email });
      console.log('📋 [Supabase Client]', { exists: Boolean(supabase) });

      setLocalLoading(true);
      setLocalError(null);

      try {
        // Check authentication session FIRST with timeout
        console.log('📋 Step 1: Checking session...');
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 3000),
        );

        let sessionData, sessionError;
        try {
          const result = await Promise.race([sessionPromise, sessionTimeout]) as any;
          sessionData = result.data;
          sessionError = result.error;
          console.log('📋 Session check completed:', {
            hasSession: Boolean(sessionData?.session),
            user: sessionData?.session?.user?.email,
            userId: sessionData?.session?.user?.id,
            error: sessionError?.message,
          });
        } catch (timeoutErr) {
          console.warn('⚠️ Session check timed out, proceeding with user prop');
          // Use the user prop from context as fallback
          if (!user) {
            if (isMounted) {
              setLocalError('Session check failed. Please refresh the page.');
              setLocalLoading(false);
            }
            return;
          }
          // Continue with user from context
          console.log('📋 Using user from context:', user.email);
        }

        // If no session and no user, stop here
        if (!sessionData?.session && !user) {
          console.warn('⚠️ No authenticated session - cannot load player registrations');
          if (isMounted) {
            setLocalError('Authentication required. Please log in to view player registrations.');
            setLocalLoading(false);
          }
          return;
        }

        // Test with direct REST API call to bypass Supabase client issues
        console.log('📋 Step 2: Testing with direct API call...');
        try {
          const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
          const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

          console.log('📋 Making direct fetch to:', `${supabaseUrl}/rest/v1/player_registrations`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(`${supabaseUrl}/rest/v1/player_registrations?select=id&limit=1`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'count=exact',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log('📋 Direct API response:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Direct API error:', errorText);
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          console.log('✅ Direct API success! Data sample:', data);

        } catch (testErr: any) {
          console.error('❌ Direct API test failed:', testErr.message);
          if (testErr.name === 'AbortError') {
            if (isMounted) {
              setLocalError('Network timeout. Cannot reach Supabase database. Check your internet connection.');
              setLocalLoading(false);
            }
            return;
          }
        }

        // Use direct fetch since Supabase client is timing out - fetch ALL records
        console.log('📋 Step 3: Fetching ALL data via direct API...');
        const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const fields = 'id,full_name,email,phone,payment_status,payment_amount,razorpay_order_id,razorpay_payment_id,created_at,updated_at,position,date_of_birth,city,state,status';
        // Remove limit to fetch all records
        const url = `${supabaseUrl}/rest/v1/player_registrations?select=${fields}&order=created_at.desc`;

        console.log('📋 Fetching ALL records from:', url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout for large dataset

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('📋 API response:', { status: response.status, ok: response.ok });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const playerRegs = await response.json();
        const count = response.headers.get('content-range')?.split('/')[1] || playerRegs.length;
        console.log('📋 Query completed:', {
          success: true,
          rowCount: playerRegs?.length || 0,
          totalCount: count,
        });

        console.log('📋 Query result:', {
          count: playerRegs?.length || 0,
          firstRecord: playerRegs?.[0] ? {
            id: playerRegs[0].id,
            name: playerRegs[0].full_name,
            email: playerRegs[0].email,
            payment_status: playerRegs[0].payment_status,
          } : null,
        });

        if (!playerRegs || playerRegs.length === 0) {
          console.log('⚠️ No registrations found - this could be due to:');
          console.log('  1. No data in player_registrations table');
          console.log('  2. RLS policies blocking access');
          console.log('  3. User not authenticated properly');
          if (isMounted) {
            setPlayers([]);
            setLocalLoading(false);
          }
          return;
        }

        // Get workflow records via direct fetch
        console.log('📋 Fetching player_workflow data...');
        let workflows: any[] = [];
        try {
          const workflowResponse = await fetch(`${supabaseUrl}/rest/v1/player_workflow?select=*`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          });
          if (workflowResponse.ok) {
            workflows = await workflowResponse.json();
            console.log('📋 Workflow records:', workflows.length);
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch workflow data:', err);
        }

        // Get email logs via direct fetch
        console.log('📋 Fetching email_logs data...');
        let emailLogs: any[] = [];
        try {
          const emailResponse = await fetch(`${supabaseUrl}/rest/v1/email_logs?select=registration_id,status,sent_at&email_type=eq.registration_confirmation&status=eq.success`, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          });
          if (emailResponse.ok) {
            emailLogs = await emailResponse.json();
            console.log('📋 Email logs:', emailLogs.length);
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch email logs:', err);
        }

        // Merge workflow data
        const workflowMap = new Map((workflows || []).map((w: any) => [w.registration_id, w]));
        const emailMap = new Map((emailLogs || []).map((e: any) => [e.registration_id, e]));

        const result = playerRegs.map((reg: any) => {
          const workflow = workflowMap.get(reg.id);
          const emailLog = emailMap.get(reg.id);

          return {
            ...reg,
            status: reg.status || 'pending',
            payment_status: reg.payment_status || 'pending',
            workflow_id: workflow?.id,
            workflow_stage: (workflow?.workflow_stage || 'registration') as WorkflowStage,
            confirmation_email_sent: workflow?.confirmation_email_sent || Boolean(emailLog),
            confirmation_email_sent_at: workflow?.confirmation_email_sent_at || emailLog?.sent_at,
          } as PlayerRegistrationWithEmailStatus;
        });

        console.log('📋 Processed registrations:', result.length);
        console.log('📋 First 3 records:', result.slice(0, 3));

        // Debug: Check payment statuses
        const paymentStatuses = result.reduce((acc: Record<string, number>, p: PlayerRegistrationWithEmailStatus) => {
          acc[p.payment_status || 'null'] = (acc[p.payment_status || 'null'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('📋 Payment status breakdown:', paymentStatuses);

        const completedCount = result.filter((p: PlayerRegistrationWithEmailStatus) => {
          const s = p.payment_status?.toLowerCase();
          return s === 'completed' || s === 'captured' || s === 'paid' || s === 'success';
        }).length;
        console.log('📋 Players with completed payment:', completedCount);

        if (isMounted) {
          console.log('✅ Setting players state with', result.length, 'records');
          setPlayers(result);
          setLocalLoading(false);
        } else {
          console.warn('⚠️ Component unmounted, not setting state');
        }
      } catch (err: any) {
        console.error('❌ Error loading players:', err);
        if (isMounted) {
          setLocalError(err.message || 'Failed to load registrations');
          setLocalLoading(false);
        }
      }
    };

    loadPlayers();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  // Debug log
  console.log('📋 Render state:', { playersCount: players.length, localLoading, localError });

  // Filter players based on payment status, email status, city and attendance
  const filteredPlayers = players.filter(player => {
    // Show players in registration stage OR registration_completed (paid but not yet moved to trials)
    const stage = player.workflow_stage;
    const isInRegistration = stage === 'registration' || stage === 'registration_completed' || stage === undefined;
    if (!isInRegistration) {
      return false;
    }

    // Filter out cancelled registrations
    if (player.status === 'cancelled') {
      return false;
    }

    // Filter by payment status
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        const status = player.payment_status?.toLowerCase();
        if (status !== 'completed' && status !== 'captured' && status !== 'paid' && status !== 'success') {
          return false;
        }
      } else if (player.payment_status !== filterStatus) {
        return false;
      }
    }

    // Filter by email status
    if (filterEmail === 'sent' && !player.confirmation_email_sent) {
      return false;
    }
    if (filterEmail === 'not_sent' && player.confirmation_email_sent) {
      return false;
    }

    // Filter by City
    if (filterCity !== 'all' && player.city !== filterCity) {
      return false;
    }

    // Filter by Attendance
    if (filterAttendance !== 'all') {
      if (filterAttendance === 'absentee' && player.status !== 'absentee') return false;
      if (filterAttendance === 'registered' && player.status !== 'registered' && player.status !== 'pending') return false;
    }

    return true;
  });

  // Get count of players ready for trials (paid + email sent)
  const readyForTrialsCount = filteredPlayers.filter(
    p => isEligibleForSelection(p) && p.confirmation_email_sent,
  ).length;

  const handleSelectAll = (checked: boolean) => {
    console.log('📋 handleSelectAll called with:', checked);
    console.log('📋 filteredPlayers count:', filteredPlayers.length);
    console.log('📋 Sample payment statuses:', filteredPlayers.slice(0, 5).map(p => ({ name: p.full_name, status: p.payment_status })));

    if (checked) {
      const eligibleIds = filteredPlayers
        .filter(isEligibleForSelection)
        .map(p => p.id);
      console.log('📋 Selecting', eligibleIds.length, 'eligible players:', eligibleIds.slice(0, 5));
      setSelectedIds(new Set(eligibleIds));
    } else {
      console.log('📋 Clearing all selections');
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    console.log('📋 handleSelectOne called - Player ID:', id, 'Checked:', checked);
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
      console.log('📋 Added to selection. Total selected:', newSet.size);
    } else {
      newSet.delete(id);
      console.log('📋 Removed from selection. Total selected:', newSet.size);
    }
    setSelectedIds(newSet);
  };

  const handleMoveToTrials = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one player');
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to move ${selectedIds.size} player(s) to the Trials Section?`,
    );
    if (!confirm) return;

    setProcessing(true);
    try {
      const results = await moveToTrialsSection(Array.from(selectedIds), user?.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount > 0) {
        alert(`Moved ${successCount} player(s). ${failCount} failed.`);
      } else {
        alert(`Successfully moved ${successCount} player(s) to Trials Section!`);
      }

      setSelectedIds(new Set());
      reloadData();
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async (player: PlayerRegistrationWithEmailStatus) => {
    if (!isEligibleForSelection(player)) {
      alert('Cannot send confirmation email - payment not completed');
      return;
    }

    setSendingEmailFor(player.id);
    try {
      const success = await sendConfirmationEmail(
        player.id,
        player.full_name,
        player.email,
        player.payment_amount || 0,
        player.razorpay_payment_id || '',
      );

      if (success) {
        alert('Confirmation email sent successfully!');
        reloadData();
      } else {
        alert('Failed to send confirmation email');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingEmailFor(null);
    }
  };

  const isEligibleForSelection = (player: PlayerRegistrationWithEmailStatus) => {
    const status = player.payment_status?.toLowerCase();
    return status === 'completed' || status === 'paid' || status === 'success' || status === 'captured';
  };

  return (
    <Card className="shadow-elegant border-cricket-blue/10">
      <CardHeader className="border-b border-cricket-blue/10 bg-linear-to-r from-cricket-blue to-cricket-dark-blue text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <CardTitle className="text-lg">Player Registrations</CardTitle>
              <p className="text-sm opacity-80 mt-1">
                Select paid players to move to Trials Section
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Manual Refresh Button */}
            <Button
              onClick={reloadData}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white h-8"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-white/10 rounded-lg p-2">
              <Filter className="w-4 h-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-28 h-8 text-[11px] bg-white text-black border-0">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="completed">Paid Only</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-28 h-8 text-[11px] bg-white text-black border-0">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterAttendance} onValueChange={setFilterAttendance}>
                <SelectTrigger className="w-28 h-8 text-[11px] bg-white text-black border-0">
                  <SelectValue placeholder="Attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Attendance</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="absentee">Absentee</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEmail} onValueChange={setFilterEmail}>
                <SelectTrigger className="w-28 h-8 text-[11px] bg-white text-black border-0">
                  <SelectValue placeholder="Email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emails</SelectItem>
                  <SelectItem value="sent">Email Sent</SelectItem>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Action Bar */}
        <div className="p-4 border-b border-cricket-blue/10 bg-cricket-light-blue/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cricket-blue" />
              <span className="text-sm font-medium text-cricket-blue">
                {selectedIds.size} of {filteredPlayers.filter(isEligibleForSelection).length} selected
              </span>
            </div>
            {readyForTrialsCount > 0 && (
              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {readyForTrialsCount} ready for trials
              </Badge>
            )}
            {selectedIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear Selection
              </Button>
            )}
          </div>
          <Button
            onClick={handleMoveToTrials}
            disabled={selectedIds.size === 0 || processing}
            className="bg-cricket-blue hover:bg-cricket-dark-blue text-white disabled:opacity-50"
          >
            {processing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Move to Trials Section ({selectedIds.size})
          </Button>
        </div>

        {/* Error display */}
        {localError && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{localError}</span>
          </div>
        )}

        {/* Loading state */}
        {localLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-cricket-blue" />
            <span className="ml-3 text-muted-foreground">Loading registrations...</span>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No registrations found</p>
            <p className="text-sm">Adjust filters or wait for new registrations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-cricket-light-blue/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size > 0 && selectedIds.size === filteredPlayers.filter(isEligibleForSelection).length}
                      onCheckedChange={(checked) => {
                        console.log('📋 Select All clicked, checked value:', checked, 'type:', typeof checked);
                        handleSelectAll(checked === true);
                      }}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Player</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Email Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-cricket-light-blue/5'} hover:bg-cricket-light-blue/20`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(player.id)}
                        onCheckedChange={(checked) => {
                          console.log('📋 Checkbox clicked for', player.full_name, 'checked value:', checked, 'type:', typeof checked);
                          handleSelectOne(player.id, checked === true);
                        }}
                        disabled={!isEligibleForSelection(player)}
                        aria-label={`Select ${player.full_name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-cricket-blue">{player.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.position} • {player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : 'N/A'}
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
                      <div className="space-y-1">
                        <Badge
                          className={`${isEligibleForSelection(player)
                            ? 'bg-green-100 text-green-700'
                            : player.payment_status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          {isEligibleForSelection(player) && <CheckCircle className="w-3 h-3 mr-1" />}
                          {player.payment_status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {player.payment_status}
                        </Badge>
                        {player.payment_amount && (
                          <div className="text-sm font-medium">₹{player.payment_amount}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {player.confirmation_email_sent ? (
                        <Badge className="bg-green-100 text-green-700">
                          <MailCheck className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          Not Sent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {!player.confirmation_email_sent && isEligibleForSelection(player) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEmail(player)}
                            disabled={sendingEmailFor === player.id}
                            className="text-xs border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                          >
                            {sendingEmailFor === player.id ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3 mr-1" />
                            )}
                            Send Email
                          </Button>
                        )}
                        {isEligibleForSelection(player) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedIds(new Set([player.id]));
                              handleMoveToTrials();
                            }}
                            disabled={processing}
                            className="text-xs border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            To Trials
                          </Button>
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
  );
};

export default RegistrationWorkflowTab;
