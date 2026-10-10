import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotValues } from './playerMessageService.js';
import { campaignName } from '../controller/campaign/campaignController.js';
import { ageOn } from '../controller/registration/registrationController.js';
import { can, staffRoleOf } from '../config/staffRoles.js';
import { splitGst, invoiceNumber, financialYear } from './invoiceService.js';

test('trial slot message values read naturally', () => {
  const v = slotValues({ allocation_date: '2026-10-12', allocation_time: '09:00:00', allocation_venue: 'Chennai', allocation_batch: 'Morning' });
  assert.equal(v.trial_date, 'Mon, 12 October 2026');
  assert.equal(v.trial_time, '09:00');
  assert.equal(v.venue, 'Chennai');
  assert.equal(slotValues({}).venue, 'to be confirmed');
});

test('campaign names follow one rule, so spellings do not split a campaign', () => {
  assert.equal(campaignName('divya  saravanan'), 'Divya-Saravanan');
  assert.equal(campaignName('Divya_Saravanan'), 'Divya-Saravanan');
  assert.equal(campaignName('Rajesh', 'coimbatore'), 'Rajesh-Coimbatore');
  assert.equal(campaignName('120241168778750354'), '120241168778750354');
});

test('age for the parent-consent rule', () => {
  assert.equal(ageOn('2008-10-10', '2026-10-09'), 17);
  assert.equal(ageOn('2008-10-09', '2026-10-09'), 18);
  assert.equal(ageOn('not a date'), null);
});

test('staff roles: finance cannot change trial results; no role means super admin', () => {
  assert.equal(can('finance', 'manage_trials'), false);
  assert.equal(can('finance', 'manage_payments'), true);
  assert.equal(can('viewer', 'manage_payments'), false);
  assert.equal(can('marketing', 'manage_campaigns'), true);
  assert.equal(staffRoleOf({ staff_role: null }), 'super_admin');
  assert.equal(staffRoleOf({ staff_role: 'operations' }), 'operations');
  assert.equal(can(staffRoleOf(null), 'manage_staff'), true);
});

test('GST split and invoice numbers', () => {
  assert.deepEqual(splitGst(1179, { gstPercent: 18, sameState: true }), { taxable: 999.15, cgst: 89.93, sgst: 89.92, igst: 0, total: 1179 });
  assert.equal(splitGst(1179, { gstPercent: 18, sameState: false }).igst, 179.85);
  assert.equal(financialYear(new Date('2026-03-31')), '2025-26');
  assert.equal(financialYear(new Date('2026-04-01')), '2026-27');
  assert.equal(invoiceNumber('pay_Ab12', new Date('2026-10-09')), 'SSPL/2026-27/AB12');
});

test('allocation plan: city first, then state, never above capacity, earliest trial first', async () => {
  const { buildAllocationPlan } = await import('../controller/workflow/workflowController.js');
  const trials = [
    { trial_id: 't1', trial_name: 'Chennai trial', trial_date: '2099-01-10', trial_venue: 'YMCA Ground', trial_address: 'Chennai, Tamil Nadu', trial_capacity: 2 },
    { trial_id: 't2', trial_name: 'Chennai day 2', trial_date: '2099-01-11', trial_venue: 'YMCA Ground', trial_address: 'Chennai, Tamil Nadu', trial_capacity: 1 },
    { trial_id: 't3', trial_name: 'Bengaluru', trial_date: '2099-01-12', trial_venue: 'KSCA', trial_address: 'Bengaluru, Karnataka', trial_capacity: null },
  ];
  const waiting = [
    { workflow_id: 'a', full_name: 'A', city: 'Chennai', state: 'Tamil Nadu' },
    { workflow_id: 'b', full_name: 'B', city: 'Chennai', state: 'Tamil Nadu' },
    { workflow_id: 'c', full_name: 'C', city: 'Chennai', state: 'Tamil Nadu' },
    { workflow_id: 'd', full_name: 'D', city: 'Madurai', state: 'Tamil Nadu' },
    { workflow_id: 'e', full_name: 'E', city: 'Mysuru', state: 'Karnataka' },
    { workflow_id: 'f', full_name: 'F', city: 'Kochi', state: 'Kerala' },
  ];
  const allocations = [{ allocation_date: '2099-01-10', allocation_venue: 'YMCA Ground, Chennai, Tamil Nadu' }];
  const plan = buildAllocationPlan({ trials, waiting, allocations });
  const by = Object.fromEntries(plan.trials.map((t) => [t.trial.trial_id, t.players.map((p) => p.workflow_id)]));
  assert.deepEqual(by.t1, ['a']);           // capacity 2, one already booked
  assert.deepEqual(by.t2, ['b']);           // next Chennai date, capacity 1
  assert.deepEqual(by.t3, ['e']);           // Mysuru: no city match, state Karnataka matches Bengaluru
  assert.deepEqual(plan.unassigned.map((p) => p.workflow_id).sort(), ['c', 'd', 'f']); // Chennai full; TN full; Kerala none
  assert.equal(plan.trials.find((t) => t.trial.trial_id === 't1').remaining, 0);
});
