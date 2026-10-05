import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyLevelChange, deriveStatus, TrialRuleError } from './trialLevelRules.js';

const selectedThrough = (n) => {
  const p = {};
  for (let l = 1; l <= n; l += 1) Object.assign(p, { [`l${l}_called`]: true, [`l${l}_attendance`]: 'ATTENDED', [`l${l}_result`]: 'SELECTED' });
  return p;
};

test('selecting at L1 moves the player to L2 and emails "selected"', () => {
  const { update, outcome } = applyLevelChange({}, 1, { result: 'selected' });
  assert.equal(update.l1_result, 'SELECTED');
  assert.equal(update.l1_attendance, 'ATTENDED');
  assert.equal(update.l1_called, true);
  assert.equal(update.current_level, 2);
  assert.equal(update.final_status, 'IN_PROGRESS');
  assert.equal(outcome, 'selected');
});

test('selecting at L5 is a final selection', () => {
  const { update, outcome } = applyLevelChange(selectedThrough(4), 5, { result: 'SELECTED' });
  assert.equal(update.current_level, 5);
  assert.equal(update.final_status, 'SELECTED');
  assert.equal(outcome, 'selected');
});

test('rejecting stops the player and clears later levels', () => {
  const { update, outcome } = applyLevelChange(selectedThrough(3), 2, { result: 'REJECTED' });
  assert.equal(update.l2_result, 'REJECTED');
  assert.equal(update.l3_result, null);
  assert.equal(update.l3_called, false);
  assert.equal(update.current_level, 2);
  assert.equal(update.final_status, 'REJECTED');
  assert.equal(outcome, 'not_selected');
});

test('absent clears the result and emails "absent"', () => {
  const { update, outcome } = applyLevelChange({ l1_called: true }, 1, { attendance: 'absent' });
  assert.equal(update.l1_attendance, 'ABSENT');
  assert.equal(update.l1_result, null);
  assert.equal(update.final_status, 'ABSENT');
  assert.equal(update.current_level, 1);
  assert.equal(outcome, 'absent');
});

test('undoing a selection (back to pending) pulls the player back and sends nothing', () => {
  const { update, outcome } = applyLevelChange(selectedThrough(2), 1, { result: 'PENDING' });
  assert.equal(update.l1_result, null);
  assert.equal(update.l2_result, null);
  assert.equal(update.current_level, 1);
  assert.equal(update.final_status, 'IN_PROGRESS');
  assert.equal(outcome, null);
});

test('setting the same result again does not re-notify', () => {
  const { outcome } = applyLevelChange(selectedThrough(1), 1, { result: 'SELECTED' });
  assert.equal(outcome, null);
});

test('a level is locked until the previous level is selected', () => {
  assert.throws(() => applyLevelChange({ l1_result: 'REJECTED' }, 2, { result: 'SELECTED' }), TrialRuleError);
  assert.throws(() => applyLevelChange({}, 6, { result: 'SELECTED' }), TrialRuleError);
});

test('un-calling clears the level', () => {
  const { update } = applyLevelChange({ l1_called: true, l1_attendance: 'ATTENDED' }, 1, { called: false });
  assert.equal(update.l1_called, false);
  assert.equal(update.l1_attendance, null);
});

test('invalid values are rejected', () => {
  assert.throws(() => applyLevelChange({}, 1, { result: 'maybe' }), TrialRuleError);
  assert.throws(() => applyLevelChange({}, 1, { foo: 1 }), TrialRuleError);
});

test('deriveStatus matches the imported data cases', () => {
  // absent at L1 used to be stored as current_level 3 / IN_PROGRESS
  assert.deepEqual(deriveStatus({ l1_attendance: 'ABSENT', l1_result: 'PENDING' }), { current_level: 1, final_status: 'ABSENT' });
  assert.deepEqual(deriveStatus(selectedThrough(3)), { current_level: 4, final_status: 'IN_PROGRESS' });
  assert.deepEqual(deriveStatus(selectedThrough(5)), { current_level: 5, final_status: 'SELECTED' });
});
