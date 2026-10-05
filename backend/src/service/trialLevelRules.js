// Trial level rules (L1 -> L5). Pure functions: no database access.
// The migration 20261005000000_trial_levels_certificates_email.sql applies the same
// current_level / final_status rule to existing rows.

export const LEVELS = [1, 2, 3, 4, 5];
export const MAX_LEVEL = 5;

const ATTENDANCE = ['PENDING', 'ATTENDED', 'ABSENT'];
const RESULTS = ['PENDING', 'SELECTED', 'REJECTED'];
const FIELDS = ['called', 'attendance', 'result', 'marks', 'remarks'];

const col = (level, field) => `l${level}_${field}`;
const norm = (v) => String(v ?? '').trim().toUpperCase();

/** Empty values for one level. */
function clearedLevel(level) {
  return {
    [col(level, 'called')]: false,
    [col(level, 'attendance')]: null,
    [col(level, 'result')]: null,
    [col(level, 'marks')]: null,
    [col(level, 'remarks')]: null,
  };
}

/** current_level / final_status for a full progress row. */
export function deriveStatus(progress) {
  for (const level of LEVELS) {
    const result = norm(progress[col(level, 'result')]);
    if (result === 'SELECTED' && level < MAX_LEVEL) continue;
    const attendance = norm(progress[col(level, 'attendance')]);
    let finalStatus = 'IN_PROGRESS';
    if (result === 'SELECTED') finalStatus = 'SELECTED';
    else if (result === 'REJECTED') finalStatus = 'REJECTED';
    else if (attendance === 'ABSENT') finalStatus = 'ABSENT';
    return { current_level: level, final_status: finalStatus };
  }
  return { current_level: MAX_LEVEL, final_status: 'SELECTED' };
}

/** A level can be edited once the previous level is SELECTED. */
export function canEditLevel(progress, level) {
  return level === 1 || norm(progress[col(level - 1, 'result')]) === 'SELECTED';
}

export class TrialRuleError extends Error {}

/**
 * Apply an admin change to one level.
 * @param {Object} progress current trial_progress row ({} when none exists)
 * @param {number} level 1-5
 * @param {{called?:boolean, attendance?:string, result?:string, marks?:number|null, remarks?:string|null}} change
 * @returns {{update:Object, outcome:'selected'|'not_selected'|'absent'|null}}
 *   update: columns to write; outcome: the player-facing event to notify, if any
 */
export function applyLevelChange(progress, level, change) {
  if (!LEVELS.includes(level)) throw new TrialRuleError('Level must be 1-5');
  if (!canEditLevel(progress, level)) {
    throw new TrialRuleError(`Level ${level} opens once the player is selected at level ${level - 1}`);
  }
  const unknown = Object.keys(change).filter((k) => !FIELDS.includes(k));
  if (unknown.length) throw new TrialRuleError(`Unknown field(s): ${unknown.join(', ')}`);

  const before = {
    attendance: norm(progress[col(level, 'attendance')]) || 'PENDING',
    result: norm(progress[col(level, 'result')]) || 'PENDING',
  };
  const update = {};
  let clearLater = false;

  if (change.marks !== undefined) update[col(level, 'marks')] = change.marks === '' ? null : change.marks;
  if (change.remarks !== undefined) update[col(level, 'remarks')] = change.remarks || null;

  if (change.called !== undefined) {
    update[col(level, 'called')] = Boolean(change.called);
    if (!change.called) {
      // Not called: nothing can have happened at this level or after it.
      update[col(level, 'attendance')] = null;
      update[col(level, 'result')] = null;
      clearLater = true;
    }
  }

  if (change.attendance !== undefined) {
    const attendance = norm(change.attendance);
    if (!ATTENDANCE.includes(attendance)) throw new TrialRuleError('Attendance must be PENDING, ATTENDED or ABSENT');
    update[col(level, 'called')] = true;
    update[col(level, 'attendance')] = attendance === 'PENDING' ? null : attendance;
    if (attendance !== 'ATTENDED') {
      // No result without attendance
      update[col(level, 'result')] = null;
      clearLater = true;
    }
  }

  if (change.result !== undefined) {
    const result = norm(change.result);
    if (!RESULTS.includes(result)) throw new TrialRuleError('Result must be PENDING, SELECTED or REJECTED');
    update[col(level, 'result')] = result === 'PENDING' ? null : result;
    if (result !== 'PENDING') {
      // A result means the player was called and attended
      update[col(level, 'called')] = true;
      update[col(level, 'attendance')] = 'ATTENDED';
    }
    if (result !== 'SELECTED') clearLater = true;
  }

  if (clearLater) {
    for (let later = level + 1; later <= MAX_LEVEL; later += 1) Object.assign(update, clearedLevel(later));
  }

  Object.assign(update, deriveStatus({ ...progress, ...update }));

  const after = {
    attendance: norm(update[col(level, 'attendance')] ?? progress[col(level, 'attendance')]) || 'PENDING',
    result: norm(update[col(level, 'result')] ?? progress[col(level, 'result')]) || 'PENDING',
  };
  if (col(level, 'result') in update && update[col(level, 'result')] === null) after.result = 'PENDING';
  if (col(level, 'attendance') in update && update[col(level, 'attendance')] === null) after.attendance = 'PENDING';

  let outcome = null;
  if (after.result !== before.result && after.result === 'SELECTED') outcome = 'selected';
  else if (after.result !== before.result && after.result === 'REJECTED') outcome = 'not_selected';
  else if (after.attendance !== before.attendance && after.attendance === 'ABSENT') outcome = 'absent';

  return { update, outcome };
}
