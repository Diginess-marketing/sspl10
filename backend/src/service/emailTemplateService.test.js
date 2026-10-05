import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fillPlaceholders, logoAttachment, renderTemplate, trialPlaceholderValues, wrapInLayout } from './emailTemplateService.js';

test('placeholders are filled and HTML-escaped', () => {
  const out = fillPlaceholders('<p>Hi {{name}}, level {{ level }}</p>', { name: '<b>Ravi</b> & co', level: '2' });
  assert.equal(out, '<p>Hi &lt;b&gt;Ravi&lt;/b&gt; &amp; co, level 2</p>');
});

test('unknown placeholders stay visible so typos show up in the test email', () => {
  assert.equal(fillPlaceholders('{{nmae}}', { name: 'Ravi' }), '{{nmae}}');
});

test('subject placeholders are not HTML-escaped', () => {
  const { subject } = renderTemplate({ subject: 'Level {{level}} for {{name}}', body_html: '' }, { level: '3', name: 'A & B' });
  assert.equal(subject, 'Level 3 for A & B');
});

test('player values: first name, next level capped at 5, results link', () => {
  const v = trialPlaceholderValues({ name: '  Ravi Kumar ', level: 5, certificateNo: 'SSPL-L5-A-XYZ' });
  assert.equal(v.first_name, 'Ravi');
  assert.equal(v.next_level, '5');
  assert.match(v.results_url, /\/trial-results$/);
});

test('layout embeds the logo inline (cid) by default and accepts a preview source', () => {
  assert.match(wrapInLayout('<p>x</p>'), /src="cid:sspl-logo"/);
  assert.match(wrapInLayout('<p>x</p>', { logoSrc: 'data:image/png;base64,AAA' }), /src="data:image\/png;base64,AAA"/);
});

test('logo attachment is an inline PNG matching the cid', () => {
  const a = logoAttachment();
  assert.equal(a.isInline, true);
  assert.equal(a.contentId, 'sspl-logo');
  assert.equal(a.contentType, 'image/png');
  assert.ok(Buffer.from(a.contentBytes, 'base64').subarray(1, 4).toString() === 'PNG');
});

test('preview samples match the template level and outcome', async () => {
  const { sampleValuesFor } = await import('./emailTemplateService.js');
  const ns = sampleValuesFor('trial_l1_not_selected');
  assert.equal(ns.level, '1');
  assert.equal(ns.certificate_no, 'SSPL-L1-P-SAMPLE');
  assert.equal(sampleValuesFor('trial_l4_selected').certificate_no, 'SSPL-L4-A-SAMPLE');
  assert.equal(sampleValuesFor('trial_l3_absent').certificate_no, '');
});
