// Flow test for level emails with the database and Microsoft Graph replaced by in-memory fakes.
// Run with: node --test --experimental-test-module-mocks
import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const state = { templates: {}, emails: [], log: [], certificates: [], sent: [], candidate: null };

mock.module('../model/trialProgressModel.js', {
  namedExports: {
    findCandidate: async () => state.candidate,
    findLevelEmail: async (id, level, outcome) => state.log.find((r) => r.candidate_id === id && r.level === level && r.outcome === outcome) || null,
    recordLevelEmail: async (entry) => {
      state.log = state.log.filter((r) => !(r.candidate_id === entry.candidate_id && r.level === entry.level && r.outcome === entry.outcome));
      state.log.push(entry);
    },
    findOrCreateCertificate: async ({ candidateId, level, kind, playerName, newNumber }) => {
      let c = state.certificates.find((x) => x.candidate_id === candidateId && x.level === level && x.kind === kind);
      if (!c) {
        c = { certificate_no: newNumber(), candidate_id: candidateId, level, kind, player_name: playerName, issued_at: '2026-10-05T00:00:00Z' };
        state.certificates.push(c);
      }
      return c;
    },
  },
});
mock.module('../model/emailTemplateModel.js', { namedExports: { findByKey: async (key) => state.templates[key] || null } });
mock.module('../model/emailLogModel.js', { namedExports: { insert: async () => {} } });
mock.module('./emailService.js', {
  namedExports: { sendEmail: async (message) => { state.sent.push(message); return { success: true }; } },
});

const { notifyLevelOutcome } = await import('./trialNotificationService.js');

const template = (key, attach) => ({
  key, subject: 'Level {{level}} – {{name}}', body_html: '<p>Dear {{first_name}}, cert {{certificate_no}}</p>', enabled: true, attach_certificate: attach,
});

beforeEach(() => {
  state.templates = {
    trial_l2_selected: template('trial_l2_selected', true),
    trial_l2_not_selected: template('trial_l2_not_selected', true),
    trial_l2_absent: template('trial_l2_absent', false),
  };
  state.log = []; state.certificates = []; state.sent = [];
  state.candidate = { candidate: { id: 'c1' }, progress: {}, contact: { name: 'Ravi Kumar', email: 'ravi@example.com', phone: '98765', city: 'Chennai' } };
});

test('selected: email with achievement certificate PDF and inline logo', async () => {
  const r = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected' });
  assert.equal(r.status, 'sent');
  assert.match(r.certificateNo, /^SSPL-L2-A-/);
  const [mail] = state.sent;
  assert.equal(mail.to, 'ravi@example.com');
  assert.equal(mail.subject, 'Level 2 – Ravi Kumar');
  assert.match(mail.html, new RegExp(`Dear Ravi, cert ${r.certificateNo}`));
  const pdf = mail.attachments.find((a) => a.contentType === 'application/pdf');
  assert.ok(pdf, 'certificate attached');
  assert.equal(Buffer.from(pdf.contentBytes, 'base64').subarray(0, 4).toString(), '%PDF');
  assert.match(pdf.name, /Level-2-Achievement/);
  assert.ok(mail.attachments.some((a) => a.isInline && a.contentId === 'sspl-logo'), 'logo inline');
  assert.equal(state.log[0].status, 'sent');
});

test('not selected: participation certificate', async () => {
  const r = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'not_selected' });
  assert.match(r.certificateNo, /^SSPL-L2-P-/);
  assert.match(state.sent[0].attachments.find((a) => a.contentType === 'application/pdf').name, /Participation/);
});

test('absent: email without certificate', async () => {
  const r = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'absent' });
  assert.equal(r.status, 'sent');
  assert.equal(state.sent[0].attachments.filter((a) => a.contentType === 'application/pdf').length, 0);
});

test('same result is not emailed twice; resend (force) does, with the same certificate number', async () => {
  const first = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected' });
  const second = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected' });
  assert.equal(second.status, 'skipped');
  assert.equal(state.sent.length, 1);
  const resent = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected', force: true });
  assert.equal(resent.status, 'sent');
  assert.equal(resent.certificateNo, first.certificateNo);
  assert.equal(state.sent.length, 2);
});

test('switched-off template sends nothing', async () => {
  state.templates.trial_l2_selected.enabled = false;
  const r = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected' });
  assert.equal(r.status, 'skipped');
  assert.equal(state.sent.length, 0);
});

test('player without an email address is skipped and logged', async () => {
  state.candidate.contact.email = '';
  const r = await notifyLevelOutcome({ candidateId: 'c1', level: 2, outcome: 'selected' });
  assert.equal(r.status, 'skipped');
  assert.equal(state.log[0].error, 'No email address on file');
});
