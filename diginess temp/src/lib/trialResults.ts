import { supabase } from '@/integrations/supabase/client';
import type { PlayerResult } from '@/types/playerData';

const PAGE_SIZE = 1000;

const normalizeStatus = (value: unknown): string => {
  const status = String(value || '').trim().toUpperCase();
  if (!status) return 'PENDING';
  if (status === 'REJECTED' || status === 'NOT SELECTED') return 'NOT_SELECTED';
  return status;
};

// Maps a trial_view row to the result shape the lookup UI renders.
// Levels 1-5 come from trial_progress columns (levels 4-5 fall back to metadata for older rows).
export const mapTrialRowToPlayerResult = (row: any): PlayerResult => {
  const meta = row.metadata || {};

  const l1_att = row.l1_attendance?.toUpperCase();
  const l2_att = row.l2_attendance?.toUpperCase();
  const l3_att = row.l3_attendance?.toUpperCase();

  const isCompletelyAbsent =
    l1_att === 'ABSENT' &&
    (l2_att === 'ABSENT' || !l2_att) &&
    (l3_att === 'ABSENT' || !l3_att);

  let l1Status = normalizeStatus(row.l1_result);
  if (l1Status === 'PENDING' && l1_att === 'ABSENT') l1Status = 'ABSENT';

  let l2Status = normalizeStatus(row.l2_result);
  if (l2Status === 'PENDING' && l2_att === 'ABSENT') l2Status = 'ABSENT';

  let l3Status = normalizeStatus(row.l3_result);
  if (l3Status === 'PENDING' && l3_att === 'ABSENT') l3Status = 'ABSENT';

  // Levels 4-5: columns since the 2026-10 migration; older rows only have metadata
  const l4_att = row.l4_attendance?.toUpperCase();
  const l5_att = row.l5_attendance?.toUpperCase();
  let l4Status = normalizeStatus(row.l4_result ?? meta.l4_result);
  if (l4Status === 'PENDING' && l4_att === 'ABSENT') l4Status = 'ABSENT';
  let l5Status = normalizeStatus(row.l5_result ?? meta.l5_result);
  if (l5Status === 'PENDING' && l5_att === 'ABSENT') l5Status = 'ABSENT';

  // Cascading logic
  if (l1Status === 'ABSENT') {
    l2Status = 'ABSENT'; l3Status = 'ABSENT'; l4Status = 'ABSENT'; l5Status = 'ABSENT';
  } else if (l1Status === 'NOT_SELECTED') {
    l2Status = 'NOT_SELECTED'; l3Status = 'NOT_SELECTED'; l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
  } else if (l1Status === 'PENDING') {
    l2Status = 'PENDING'; l3Status = 'PENDING';
  } else if (l1Status === 'SELECTED') {
    if (l2Status === 'ABSENT') {
      l3Status = 'ABSENT'; l4Status = 'ABSENT'; l5Status = 'ABSENT';
    } else if (l2Status === 'NOT_SELECTED') {
      l3Status = 'NOT_SELECTED'; l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
    } else if (l2Status === 'PENDING') {
      l3Status = 'PENDING';
    } else if (l2Status === 'SELECTED') {
      if (l3Status === 'ABSENT') {
        l4Status = 'ABSENT'; l5Status = 'ABSENT';
      } else if (l3Status === 'NOT_SELECTED') {
        l4Status = 'NOT_SELECTED'; l5Status = 'NOT_SELECTED';
      } else if (l3Status === 'SELECTED') {
        if (l4Status === 'ABSENT') {
          l5Status = 'ABSENT';
        } else if (l4Status === 'NOT_SELECTED') {
          l5Status = 'NOT_SELECTED';
        }
      }
    }
  }

  return {
    id: row.candidate_id || row.mobile,
    mobile: row.mobile || row.phone || '',
    state: row.state || '',
    city: row.city || '',
    name: row.name || '',
    proficiency: row.proficiency || '',
    status: l1Status, // maps to level 1 status
    marks: row.l1_marks || 0,
    createdAt: row.created_at || row.imported_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    level: 'Both',
    level2Data: {
      status: l2Status,
      score: row.l2_marks ? String(row.l2_marks) : '',
      remarks: row.l2_remarks || meta.l2_remarks || '',
      listName: 'Level 2',
    },
    level3Data: {
      status: l3Status,
      score: row.l3_marks ? String(row.l3_marks) : '',
      remarks: row.l3_remarks || meta.l3_remarks || '',
      listName: 'Level 3',
    },
    level4Data: {
      status: l4Status,
      score: row.l4_marks != null ? String(row.l4_marks) : meta.l4_score || '',
      remarks: row.l4_remarks || meta.l4_remarks || '',
      listName: 'Level 4',
    },
    level5Data: {
      status: l5Status,
      score: row.l5_marks != null ? String(row.l5_marks) : meta.l5_score || '',
      remarks: row.l5_remarks || meta.l5_remarks || '',
      listName: 'Level 5',
    },
    isCompletelyAbsent,
  };
};

// Loads every registered trial candidate with their results.
export async function fetchAllTrialResults(): Promise<PlayerResult[]> {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await (supabase as any)
      .from('trial_view')
      .select('*')
      .order('imported_at', { ascending: true })
      .order('candidate_id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows.map(mapTrialRowToPlayerResult);
}
