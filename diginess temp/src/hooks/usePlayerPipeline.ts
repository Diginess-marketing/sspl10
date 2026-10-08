import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// One row per registration with everything the Players screen shows: payment, workflow,
// trial slot, L1-L5 progress and email count. Trial candidates are matched to registrations
// by registration id, else by the last 10 digits of the mobile (most imported candidates).

const PAGE = 1000;
const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v: unknown) => String(v ?? '').replace(/\D/g, '').slice(-10);
const up = (v: unknown) => String(v ?? '').trim().toUpperCase();

async function fetchAll<T = any>(table: string, select: string, order: string): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await (supabase as any).from(table).select(select).order(order, { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE) return rows;
  }
}

export type PipelineStage = 'registered' | 'trial' | 'l4' | 'l5' | 'selected' | 'not_selected' | 'absent';

export interface LevelState { called: boolean; attendance: string | null; result: string | null; marks: number | null; remarks: string | null }

export interface Slot { allocationId: string; date: string | null; time: string | null; venue: string | null; batch: string | null; attendance: string | null }

export interface PipelinePlayer {
  id: string; // registration id
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  position: string | null;
  dob: string | null;
  registeredAt: string | null;
  paymentStatus: string;
  paid: boolean;
  amount: number | null;
  paymentId: string | null;
  workflowId: string | null;
  workflowStage: string | null;
  confirmationSent: boolean;
  slot: Slot | null;
  candidateId: string | null;
  currentLevel: number | null;
  finalStatus: string | null;
  levels: Record<number, LevelState>;
  stage: PipelineStage;
  emailCount: number;
}

const emptyLevel: LevelState = { called: false, attendance: null, result: null, marks: null, remarks: null };

/** Where the player is in the journey. L1-L3 count as one "trial" stage, as on the design. */
function stageOf(p: Pick<PipelinePlayer, 'candidateId' | 'finalStatus' | 'currentLevel' | 'levels' | 'workflowStage'>): PipelineStage {
  if (p.candidateId) {
    const final = up(p.finalStatus);
    if (final === 'SELECTED') return 'selected';
    if (final === 'REJECTED') return 'not_selected';
    if (final === 'ABSENT') return 'absent';
    if (up(p.levels[4]?.result) === 'SELECTED' || (p.currentLevel ?? 0) >= 5) return 'l5';
    if (up(p.levels[3]?.result) === 'SELECTED' || (p.currentLevel ?? 0) === 4) return 'l4';
    return 'trial';
  }
  if (p.workflowStage && !['registration', 'registration_completed'].includes(p.workflowStage)) return 'trial';
  return 'registered';
}

/** Same rule as the backend move: paid, and the workflow has not moved past registration. */
export const canMoveToTrials = (p: Pick<PipelinePlayer, 'paid' | 'workflowStage'>) =>
  p.paid && (!p.workflowStage || ['registration', 'registration_completed'].includes(p.workflowStage));

export function usePlayerPipeline() {
  const [players, setPlayers] = useState<PipelinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [regs, workflows, allocations, trialRows, emails] = await Promise.all([
          fetchAll('player_registrations', 'id,full_name,phone,email,city,state,position,date_of_birth,created_at,payment_status,payment_amount,amount_paid,razorpay_payment_id', 'id'),
          fetchAll('player_workflow', 'workflow_id,registration_id,workflow_stage,confirmation_email_sent', 'workflow_id'),
          fetchAll('trials_allocations', 'allocation_id,workflow_id,allocation_date,allocation_time,allocation_venue,allocation_batch,attendance_status', 'allocation_id'),
          fetchAll('trial_view', '*', 'candidate_id'),
          fetchAll('email_logs', 'registration_id', 'id').catch(() => [] as any[]),
        ]);

        const wfByReg = new Map(workflows.map((w: any) => [w.registration_id, w]));
        const allocByWf = new Map(allocations.map((a: any) => [a.workflow_id, a]));
        const trialByReg = new Map<string, any>();
        const trialByPhone = new Map<string, any>();
        for (const t of trialRows) {
          if (t.registration_id) trialByReg.set(t.registration_id, t);
          const m = last10(t.mobile || t.phone);
          if (m && !trialByPhone.has(m)) trialByPhone.set(m, t);
        }
        const emailCount = new Map<string, number>();
        for (const e of emails) if (e.registration_id) emailCount.set(e.registration_id, (emailCount.get(e.registration_id) || 0) + 1);

        const rows: PipelinePlayer[] = regs.map((r: any) => {
          const wf: any = wfByReg.get(r.id);
          const alloc: any = wf ? allocByWf.get(wf.workflow_id) : null;
          const paid = PAID.includes(String(r.payment_status || '').toLowerCase());
          // Phone matching only for paid registrations: an unpaid duplicate (same mobile)
          // must not inherit the paid registration's trial progress.
          const t: any = trialByReg.get(r.id) || (paid ? trialByPhone.get(last10(r.phone)) : null) || null;
          const levels: Record<number, LevelState> = {};
          for (let l = 1; l <= 5; l += 1) {
            levels[l] = t ? {
              called: Boolean(t[`l${l}_called`]),
              attendance: t[`l${l}_attendance`] ?? null,
              result: t[`l${l}_result`] ?? (l >= 4 ? t.metadata?.[`l${l}_result`] ?? null : null),
              marks: t[`l${l}_marks`] ?? null,
              remarks: t[`l${l}_remarks`] ?? null,
            } : emptyLevel;
          }
          const base = {
            candidateId: t?.candidate_id ?? null,
            finalStatus: t?.final_status ?? null,
            currentLevel: t?.current_level ?? null,
            levels,
            workflowStage: wf?.workflow_stage ?? null,
          };
          return {
            id: r.id,
            name: r.full_name || 'Unnamed player',
            phone: r.phone || '',
            email: r.email,
            city: r.city,
            state: r.state,
            position: r.position,
            dob: r.date_of_birth,
            registeredAt: r.created_at,
            paymentStatus: String(r.payment_status || 'pending').toLowerCase(),
            paid,
            amount: r.amount_paid ?? r.payment_amount ?? null,
            paymentId: r.razorpay_payment_id,
            workflowId: wf?.workflow_id ?? null,
            confirmationSent: Boolean(wf?.confirmation_email_sent) || (emailCount.get(r.id) || 0) > 0,
            slot: alloc ? {
              allocationId: alloc.allocation_id,
              date: alloc.allocation_date,
              time: alloc.allocation_time,
              venue: alloc.allocation_venue,
              batch: alloc.allocation_batch,
              attendance: alloc.attendance_status,
            } : null,
            emailCount: emailCount.get(r.id) || 0,
            ...base,
            stage: stageOf(base),
          };
        });
        rows.sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)));
        if (active) { setPlayers(rows); setError(null); }
      } catch (err: any) {
        if (active) setError(err.message || 'Could not load players');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [version]);

  return { players, loading, error, reload };
}

/** Email and activity history for one player (loaded when the panel opens). */
export async function fetchPlayerHistory(p: PipelinePlayer) {
  const db = supabase as any;
  const [emails, levelEmails, history, audit] = await Promise.all([
    db.from('email_logs').select('email_type,status,sent_at,error_message').eq('registration_id', p.id).order('sent_at', { ascending: false }),
    p.candidateId ? db.from('trial_level_emails').select('level,outcome,status,sent_at,error,certificate_no').eq('candidate_id', p.candidateId).order('sent_at', { ascending: false }) : { data: [] },
    p.workflowId ? db.from('workflow_history').select('previous_stage,new_stage,action_type,action_details,performed_at').eq('workflow_id', p.workflowId).order('performed_at', { ascending: false }) : { data: [] },
    p.candidateId ? db.from('trial_audit_logs').select('modified_level,action_type,changed_fields,created_at').eq('candidate_id', p.candidateId).order('created_at', { ascending: false }).limit(50) : { data: [] },
  ]);
  return {
    emails: [
      ...(emails.data || []).map((e: any) => ({ when: e.sent_at, what: String(e.email_type).replace(/_/g, ' '), status: e.status, detail: e.error_message })),
      ...(levelEmails.data || []).map((e: any) => ({ when: e.sent_at, what: `Level ${e.level} – ${String(e.outcome).replace('_', ' ')}`, status: e.status, detail: e.certificate_no ? `Certificate ${e.certificate_no}` : e.error })),
    ].sort((a, b) => String(b.when).localeCompare(String(a.when))),
    activity: [
      ...(history.data || []).map((h: any) => ({ when: h.performed_at, what: String(h.action_type || 'update').replace(/_/g, ' '), detail: [h.previous_stage, h.new_stage].filter(Boolean).join(' → ') })),
      ...(audit.data || []).map((a: any) => ({ when: a.created_at, what: `${String(a.action_type || 'update').replace(/_/g, ' ')}${a.modified_level ? ` · L${a.modified_level}` : ''}`, detail: Array.isArray(a.changed_fields) ? a.changed_fields.join(', ') : '' })),
    ].sort((a, b) => String(b.when).localeCompare(String(a.when))),
  };
}
