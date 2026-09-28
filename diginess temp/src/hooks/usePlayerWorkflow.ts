import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  TrialsSectionPlayer,
  TrialsAllocatedPlayer,
  WorkflowDashboardStats,
  BulkOperationResult,
  AttendanceStatus,
  SelectionStatus,
  PlayerRegistrationWithEmailStatus,
  WorkflowStage,
  TrialViewRecord,
} from '@/types/workflow';

// Hook for managing the player workflow system
export function usePlayerWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dashboard stats
  const getDashboardStats = useCallback(async (): Promise<WorkflowDashboardStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_workflow_dashboard_stats');

      // Fetch 'captured' count manually to patch the stats (since RPC might only count 'completed')
      const { count: capturedCount } = await supabase
        .from('player_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'captured');

      if (rpcError) {
        console.error('Error fetching dashboard stats:', rpcError);
        // Return default stats if RPC not available (migration not run yet)
        const { data: registrations } = await supabase
          .from('player_registrations')
          .select('payment_status');

        const total = registrations?.length || 0;
        const completed = registrations?.filter((r: any) => {
          const s = r.payment_status?.toLowerCase();
          return s === 'completed' || s === 'captured' || s === 'paid' || s === 'success';
        }).length || 0;

        return {
          total_registrations: total,
          pending_payments: total - completed,
          completed_payments: completed,
          emails_sent: 0,
          emails_pending: 0,
          in_trials_section: 0,
          trials_allocated: 0,
          attended: 0,
          absent: 0,
          selected: 0,
          not_selected: 0,
          waitlisted: 0,
        };
      }

      const stats = data?.[0] || null;
      if (stats && capturedCount) {
        // Add captured count to completed_payments
        // Note: This assumes RPC does NOT count captured. If it starts counting them, we might double count.
        // But currently it seems it doesn't.
        stats.completed_payments = (stats.completed_payments || 0) + capturedCount;
        // Adjust pending if total stays same? No, total should be correct.
        // Pending is usually total - completed.
        stats.pending_payments = Math.max(0, (stats.total_registrations || 0) - stats.completed_payments);
      }

      return stats;
    } catch (err: any) {
      console.error('Exception fetching dashboard stats:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all registrations with their workflow status
  const getRegistrationsWithWorkflowStatus = useCallback(async (): Promise<PlayerRegistrationWithEmailStatus[]> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching player_registrations...');
      console.log('🔍 Supabase client:', supabase ? 'initialized' : 'NULL');

      // Get all player registrations
      const { data: registrations, error: regError, status, statusText } = await supabase
        .from('player_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('🔍 Registrations query result:', {
        count: registrations?.length,
        error: regError?.message,
        errorCode: regError?.code,
        status,
        statusText,
        firstRecord: registrations?.[0],
      });

      if (regError) {
        console.error('❌ Error fetching registrations:', regError);
        setError(regError.message);
        return [];
      }

      if (!registrations || registrations.length === 0) {
        console.log('⚠️ No registrations found in database');
        return [];
      }

      console.log('✅ Found', registrations.length, 'registrations');

      // Get workflow records
      const { data: workflows, error: wfError } = await supabase
        .from('player_workflow')
        .select('*');

      if (wfError) {
        console.warn('Error fetching workflows:', wfError);
      }

      // Get email logs for confirmation emails
      const { data: emailLogs, error: emailError } = await supabase
        .from('email_logs')
        .select('registration_id, status, sent_at')
        .eq('email_type', 'registration_confirmation')
        .eq('status', 'success');

      if (emailError) {
        console.warn('Error fetching email logs:', emailError);
      }

      // Merge data
      const workflowMap = new Map((workflows || []).map(w => [w.registration_id, w]));
      const emailMap = new Map((emailLogs || []).map(e => [e.registration_id, e]));

      const result: PlayerRegistrationWithEmailStatus[] = (registrations || []).map(reg => {
        const workflow = workflowMap.get(reg.id);
        const emailLog = emailMap.get(reg.id);

        return {
          ...reg,
          workflow_id: workflow?.workflow_id,
          workflow_stage: (workflow?.workflow_stage || 'registration') as WorkflowStage,
          confirmation_email_sent: workflow?.confirmation_email_sent || Boolean(emailLog),
          confirmation_email_sent_at: workflow?.confirmation_email_sent_at || emailLog?.sent_at,
        };
      });

      return result;
    } catch (err: any) {
      console.error('Exception fetching registrations with workflow:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get players in trials section
  const getTrialsSectionPlayers = useCallback(async (): Promise<TrialsSectionPlayer[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try the view first
      const { data, error: viewError } = await supabase
        .from('v_trials_section_players' as any)
        .select('*')
        .order('moved_to_trials_at', { ascending: false });

      if (!viewError && data) {
        return data as unknown as TrialsSectionPlayer[];
      }

      // Fall back to manual join
      console.warn('View not available, using manual query');

      const { data: workflows, error: wfError } = await supabase
        .from('player_workflow')
        .select('*')
        .eq('workflow_stage', 'trials_section');

      if (wfError || !workflows?.length) {
        return [];
      }

      const regIds = workflows.map(w => w.registration_id);
      const { data: regs } = await supabase
        .from('player_registrations')
        .select('*')
        .in('id', regIds);

      const regMap = new Map((regs || []).map(r => [r.id, r]));

      return workflows.map(w => {
        const reg = regMap.get(w.registration_id);
        return {
          workflow_id: w.workflow_id,
          registration_id: w.registration_id,
          confirmation_email_sent: w.confirmation_email_sent ?? false,
          confirmation_email_sent_at: w.confirmation_email_sent_at ?? null,
          moved_to_trials_at: w.created_at,
          full_name: reg?.full_name || '',
          email: reg?.email || '',
          phone: reg?.phone || '',
          date_of_birth: reg?.date_of_birth || '',
          position: reg?.position || '',
          state: reg?.state || '',
          city: reg?.city || null,
          payment_status: reg?.payment_status || '',
          payment_amount: reg?.payment_amount || null,
          registration_date: reg?.created_at || '',
        };
      });
    } catch (err: any) {
      console.error('Exception fetching trials section players:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get players with trials allocated
  const getTrialsAllocatedPlayers = useCallback(async (): Promise<TrialsAllocatedPlayer[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try the view first
      const { data, error: viewError } = await supabase
        .from('v_trials_allocated_players' as any)
        .select('*')
        .order('allocated_at', { ascending: false });

      if (!viewError && data) {
        return data as unknown as TrialsAllocatedPlayer[];
      }

      // Fall back to manual join
      console.warn('View not available, using manual query');

      const { data: workflows, error: wfError } = await supabase
        .from('player_workflow')
        .select('*')
        .eq('workflow_stage', 'trials_allocated');

      if (wfError || !workflows?.length) {
        return [];
      }

      const wfIds = workflows.map(w => w.workflow_id);
      const regIds = workflows.map(w => w.registration_id);

      // Get allocations
      const { data: allocations } = await supabase
        .from('trials_allocations')
        .select('*')
        .in('workflow_id', wfIds);

      // Get registrations
      const { data: regs } = await supabase
        .from('player_registrations')
        .select('*')
        .in('id', regIds);

      // Get results
      const allocIds = (allocations || []).map(a => a.allocation_id);
      const { data: results } = allocIds.length > 0
        ? await supabase.from('trial_results').select('*').in('allocation_id', allocIds)
        : { data: [] };

      const regMap = new Map((regs || []).map(r => [r.id, r]));
      const allocMap = new Map((allocations || []).map(a => [a.workflow_id || '', a]));
      const resultMap = new Map((results || []).map(r => [r.allocation_id, r]));

      return workflows.map(w => {
        const reg = regMap.get(w.registration_id);
        const alloc = allocMap.get(w.workflow_id);
        const result = alloc ? resultMap.get(alloc.allocation_id) : null;

        return {
          workflow_id: w.workflow_id,
          registration_id: w.registration_id,
          allocation_id: alloc?.allocation_id || '',
          allocation_date: alloc?.allocation_date || '',
          allocation_time: alloc?.allocation_time || null,
          allocation_venue: alloc?.allocation_venue || null,
          allocation_batch: alloc?.allocation_batch || null,
          attendance_status: (alloc?.attendance_status || 'pending') as AttendanceStatus,
          attendance_marked_at: alloc?.attended_at || null,
          allocation_notes: alloc?.remarks || null, // Mapping remarks to notes if notes missing
          allocated_at: alloc?.created_at || '',
          full_name: reg?.full_name || '',
          email: reg?.email || '',
          phone: reg?.phone || '',
          date_of_birth: reg?.date_of_birth || '',
          position: reg?.position || '',
          state: reg?.state || '',
          city: reg?.city || null,
          payment_status: reg?.payment_status || '',
          registration_date: reg?.created_at || '',
          overall_score: result?.overall_score || null,
          selection_status: result?.selection_status as SelectionStatus | null || null,
          remarks: result?.remarks || null,
          evaluated_at: result?.evaluated_at || null,
        };
      });
    } catch (err: any) {
      console.error('Exception fetching trials allocated players:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Move players to trials section
  const moveToTrialsSection = useCallback(async (
    registrationIds: string[],
    adminId?: string,
  ): Promise<BulkOperationResult[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('move_to_trials_section', {
        p_registration_ids: registrationIds,
        p_admin_id: adminId,
      });

      if (rpcError) {
        console.error('Error moving to trials section:', rpcError);
        setError(rpcError.message);
        return registrationIds.map(id => ({
          registration_id: id,
          success: false,
          message: rpcError.message,
        }));
      }

      return data || [];
    } catch (err: any) {
      console.error('Exception moving to trials section:', err);
      setError(err.message);
      return registrationIds.map(id => ({
        registration_id: id,
        success: false,
        message: err.message,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Allocate players to trials
  const allocateToTrials = useCallback(async (
    workflowIds: string[],
    allocationDate: string,
    allocationTime?: string,
    allocationVenue?: string,
    allocationBatch?: string,
    adminId?: string,
  ): Promise<BulkOperationResult[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('allocate_to_trials', {
        p_workflow_ids: workflowIds,
        p_allocation_date: allocationDate,
        p_allocation_time: allocationTime,
        p_allocation_venue: allocationVenue,
        p_allocation_batch: allocationBatch,
        p_admin_id: adminId,
      });

      if (rpcError) {
        console.error('Error allocating to trials:', rpcError);
        setError(rpcError.message);
        return workflowIds.map(id => ({
          workflow_id: id,
          success: false,
          message: rpcError.message,
        }));
      }

      return data || [];
    } catch (err: any) {
      console.error('Exception allocating to trials:', err);
      setError(err.message);
      return workflowIds.map(id => ({
        workflow_id: id,
        success: false,
        message: err.message,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark attendance
  const markAttendance = useCallback(async (
    allocationId: string,
    attendanceStatus: AttendanceStatus,
    adminId?: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('mark_trial_attendance', {
        p_allocation_id: allocationId,
        p_attendance_status: attendanceStatus,
        p_admin_id: adminId,
      });

      if (rpcError) {
        console.error('Error marking attendance:', rpcError);
        setError(rpcError.message);
        return false;
      }

      return data || false;
    } catch (err: any) {
      console.error('Exception marking attendance:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trial results
  const updateTrialResults = useCallback(async (
    allocationId: string,
    battingScore?: number,
    bowlingScore?: number,
    fieldingScore?: number,
    overallScore?: number,
    selectionStatus: SelectionStatus = 'pending',
    remarks?: string,
    evaluatorNotes?: string,
    adminId?: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('update_trial_results', {
        p_allocation_id: allocationId,
        p_batting_score: battingScore,
        p_bowling_score: bowlingScore,
        p_fielding_score: fieldingScore,
        p_overall_score: overallScore,
        p_selection_status: selectionStatus,
        p_remarks: remarks,
        p_evaluator_notes: evaluatorNotes,
        p_admin_id: adminId,
      });

      if (rpcError) {
        console.error('Error updating trial results:', rpcError);
        setError(rpcError.message);
        return false;
      }

      return data || false;
    } catch (err: any) {
      console.error('Exception updating trial results:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send confirmation email manually
  const sendConfirmationEmail = useCallback(async (
    registrationId: string,
    playerName: string,
    email: string,
    amount: number,
    paymentId: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: emailError } = await supabase.functions.invoke('send-confirmation-mail', {
        body: {
          email,
          playerName,
          amount,
          paymentId,
          registrationId,
        },
      });

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
        setError(emailError.message);
        return false;
      }

      // Update workflow to mark email as sent
      // Using update with eq check instead of upsert to avoid type issues with missing required fields
      await supabase
        .from('player_workflow')
        .update({
          confirmation_email_sent: true,
          confirmation_email_sent_at: new Date().toISOString(),
        })
        .eq('registration_id', registrationId);

      return true;
    } catch (err: any) {
      console.error('Exception sending confirmation email:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize workflow for a registration (idempotent)
  const initializeWorkflow = useCallback(async (registrationId: string): Promise<string | null> => {
    try {
      const { data, error: rpcError } = await supabase.rpc('init_player_workflow', {
        p_registration_id: registrationId,
      });

      if (rpcError) {
        console.error('Error initializing workflow:', rpcError);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error('Exception initializing workflow:', err);
      return null;
    }
  }, []);

  // Revert players to registration (remove from trials workflow)
  const revertToRegistration = useCallback(async (
    workflowIds: string[],
    adminId?: string,
  ): Promise<BulkOperationResult[]> => {
    try {
      setLoading(true);
      setError(null);

      // We simply delete the workflow record, which effectively moves them back to registration stage
      const { error: deleteError } = await supabase
        .from('player_workflow')
        .delete()
        .in('workflow_id', workflowIds);

      if (deleteError) {
        console.error('Error reverting to registration:', deleteError);
        setError(deleteError.message);
        return workflowIds.map(id => ({
          registration_id: id,
          success: false,
          message: deleteError.message,
        }));
      }

      return workflowIds.map(id => ({
        registration_id: id,
        success: true,
        message: 'Reverted successfully',
      }));
    } catch (err: any) {
      console.error('Exception reverting to registration:', err);
      setError(err.message);
      return workflowIds.map(id => ({
        registration_id: id,
        success: false,
        message: err.message,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- L1-L3 trial tracker (trial_candidates + trial_progress) ----

  // Candidates who reached this level: everyone for L1, only those selected at the previous level after that.
  const getTrialLevelPlayers = useCallback(async (level: number): Promise<TrialViewRecord[]> => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: qErr } = await (supabase as any)
        .from('trial_candidates')
        .select('*, trial_progress(*)');
      if (qErr) throw qErr;

      const rows = (data || []).map((c: any): TrialViewRecord => {
        const p = Array.isArray(c.trial_progress) ? c.trial_progress[0] : c.trial_progress;
        return {
          id: c.id,
          name: c.name || '',
          phone: c.mobile || c.phone || '',
          email: c.email,
          city: c.city,
          state: c.state,
          proficiency: c.proficiency,
          current_level: p?.current_level ?? 1,
          remarks: p?.[`l${level}_remarks`] ?? null,
          l1_called: p?.l1_called ?? false, l1_attendance: p?.l1_attendance ?? null, l1_result: p?.l1_result ?? null,
          l2_called: p?.l2_called ?? false, l2_attendance: p?.l2_attendance ?? null, l2_result: p?.l2_result ?? null,
          l3_called: p?.l3_called ?? false, l3_attendance: p?.l3_attendance ?? null, l3_result: p?.l3_result ?? null,
          final_status: p?.final_status ?? null,
        };
      });
      if (level === 1) return rows;
      return rows.filter((r: TrialViewRecord) => level === 2 ? r.l1_result === 'SELECTED' : r.l2_result === 'SELECTED');
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Writes one level's fields for a candidate (creates the progress row if missing).
  const updateCandidateLevel = useCallback(async (candidateId: string, patch: Record<string, unknown>): Promise<boolean> => {
    try {
      setError(null);
      const { error: upErr } = await (supabase as any)
        .from('trial_progress')
        .upsert({ candidate_id: candidateId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'candidate_id' });
      if (upErr) throw upErr;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  // Toggles "called" for a level. Un-calling clears attendance and result for that level.
  const markCandidateCalled = useCallback(async (candidateId: string, level: number): Promise<boolean> => {
    const { data } = await (supabase as any).from('trial_progress').select('*').eq('candidate_id', candidateId).maybeSingle();
    const called = !(data as any)?.[`l${level}_called`];
    return updateCandidateLevel(candidateId, {
      [`l${level}_called`]: called,
      ...(called ? {} : { [`l${level}_attendance`]: null, [`l${level}_result`]: null }),
    });
  }, [updateCandidateLevel]);

  const markCandidateAttendance = useCallback(async (candidateId: string, level: number, status: string): Promise<boolean> => {
    return updateCandidateLevel(candidateId, { [`l${level}_attendance`]: status.toUpperCase() });
  }, [updateCandidateLevel]);

  // Selected at L1/L2 moves the candidate up a level; selected at L3 is final; rejected is final.
  const markCandidateResult = useCallback(async (candidateId: string, level: number, result: string): Promise<boolean> => {
    const r = result.toUpperCase();
    const patch: Record<string, unknown> = { [`l${level}_result`]: r === 'PENDING' ? null : r };
    if (r === 'SELECTED') {
      patch.current_level = Math.min(level + 1, 3);
      patch.final_status = level === 3 ? 'SELECTED' : null;
    } else if (r === 'REJECTED') {
      patch.final_status = 'REJECTED';
    } else {
      patch.final_status = null;
    }
    return updateCandidateLevel(candidateId, patch);
  }, [updateCandidateLevel]);

  // Adds a candidate for every paid registration that has none yet. Returns how many were added.
  const syncTrialCandidates = useCallback(async (): Promise<number> => {
    try {
      setError(null);
      const { data, error: rpcErr } = await (supabase as any).rpc('sync_trial_candidates');
      if (rpcErr) throw rpcErr;
      return Number(data) || 0;
    } catch (err: any) {
      setError(err.message);
      return 0;
    }
  }, []);

  // ---- Reports & analytics ----

  const PAID = ['captured', 'paid', 'completed', 'success'];
  const isPaid = (s: unknown) => PAID.includes(String(s || '').toLowerCase());
  const fmtDate = (v: unknown) => (v ? new Date(String(v)).toISOString().slice(0, 10) : '');

  // Rows for the Reporting Hub. reportType matches REPORT_TYPES in TrialsReportViewer.
  const getReportData = useCallback(async (
    reportType: string,
    params: { level?: number; location?: string } = {},
  ): Promise<Record<string, any>[]> => {
    try {
      setLoading(true);
      setError(null);
      const db = supabase as any;

      if (['total_registrations', 'net_failed', 'finance'].includes(reportType)) {
        const { data, error: qErr } = await db
          .from('player_registrations')
          .select('*')
          .order('created_at', { ascending: false });
        if (qErr) throw qErr;
        let rows: any[] = data || [];
        if (reportType === 'net_failed') rows = rows.filter((r) => !isPaid(r.payment_status));
        if (reportType === 'finance') rows = rows.filter((r) => isPaid(r.payment_status));
        return rows.map((r) => ({
          full_name: r.full_name,
          email: r.email,
          phone: r.phone,
          state: r.state,
          city: r.city,
          position: r.position,
          payment_status: r.payment_status,
          ...(reportType === 'finance'
            ? { amount: Number(r.payment_amount ?? r.amount ?? 0), payment_id: r.payment_id ?? r.razorpay_payment_id ?? '' }
            : {}),
          registered_at: r.created_at,
        }));
      }

      const { data, error: qErr } = await db.from('trial_view').select('*');
      if (qErr) throw qErr;
      const rows: any[] = data || [];

      if (reportType === 'call_for_trials' || reportType === 'selection_sheet') {
        const level = params.level || 1;
        const pool = rows.filter((r) => level === 1
          || (level === 2 ? r.l1_result === 'SELECTED' : r.l2_result === 'SELECTED'));
        return pool
          .filter((r) => reportType === 'call_for_trials' || r[`l${level}_result`] || r[`l${level}_attendance`])
          .map((r) => ({
            name: r.name,
            phone: r.mobile || r.phone,
            city: r.city,
            state: r.state,
            proficiency: r.proficiency,
            called: Boolean(r[`l${level}_called`]),
            attendance: r[`l${level}_attendance`],
            ...(reportType === 'selection_sheet'
              ? { marks: r[`l${level}_marks`], result: r[`l${level}_result`], remarks: r[`l${level}_remarks`] }
              : {}),
          }));
      }

      if (reportType === 'trial_assessment') {
        const q = (params.location || '').trim().toLowerCase();
        return rows
          .filter((r) => !q || `${r.city || ''} ${r.state || ''}`.toLowerCase().includes(q))
          .map((r) => ({
            name: r.name,
            phone: r.mobile || r.phone,
            city: r.city,
            state: r.state,
            proficiency: r.proficiency,
            current_level: r.current_level ?? 1,
            l1_result: r.l1_result,
            l2_result: r.l2_result,
            l3_result: r.l3_result,
            final_status: r.final_status,
            updated_at: fmtDate(r.updated_at),
          }));
      }
      return [];
    } catch (err: any) {
      console.error('Exception building report:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Funnel + attrition counts for the analytics dashboard, from trial_view.
  const getTrialOverallStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: qErr } = await (supabase as any).from('trial_view').select('*');
      if (qErr) throw qErr;
      const rows: any[] = data || [];
      const n = (fn: (r: any) => boolean) => rows.filter(fn).length;
      const att = (r: any, l: number) => ['ATTENDED', 'PRESENT'].includes(String(r[`l${l}_attendance`] || '').toUpperCase());
      return {
        funnel: {
          l1_pool: rows.length,
          l1_called: n((r) => r.l1_called),
          l1_attended: n((r) => att(r, 1)),
          l1_selected: n((r) => r.l1_result === 'SELECTED'),
          l2_attended: n((r) => att(r, 2)),
          l2_selected: n((r) => r.l2_result === 'SELECTED'),
          l3_attended: n((r) => att(r, 3)),
          l3_selected: n((r) => r.l3_result === 'SELECTED'),
          net_finalists: n((r) => r.final_status === 'SELECTED'),
        },
        attrition: {
          rejected: n((r) => r.final_status === 'REJECTED'),
          absent: n((r) => [1, 2, 3].some((l) => String(r[`l${l}_attendance`] || '').toUpperCase() === 'ABSENT')),
        },
      };
    } catch (err: any) {
      console.error('Exception fetching trial stats:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getReportData,
    getTrialOverallStats,
    getDashboardStats,
    getRegistrationsWithWorkflowStatus,
    getTrialsSectionPlayers,
    getTrialsAllocatedPlayers,
    moveToTrialsSection,
    allocateToTrials,
    markAttendance,
    updateTrialResults,
    sendConfirmationEmail,
    initializeWorkflow,
    revertToRegistration,
    getTrialLevelPlayers,
    markCandidateCalled,
    markCandidateAttendance,
    markCandidateResult,
    syncTrialCandidates,
  };
}
