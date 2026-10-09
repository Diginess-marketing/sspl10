import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotValues } from './playerMessageService.js';
import { campaignName } from '../controller/campaign/campaignController.js';
import { ageOn } from '../controller/registration/registrationController.js';
import { can, staffRoleOf } from '../config/staffRoles.js';

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
