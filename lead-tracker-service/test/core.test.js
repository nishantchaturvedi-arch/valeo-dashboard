import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAdmin, authorizeSync, mapSheetRows, normalizePhone, slackMessage, validateUpdate } from '../lib/core.js';

import { headers, row } from './fixtures.js';

test('admin identity is checked on the server, including token revocation', async () => {
  let checked;
  const verifier = async (token, revoked) => { checked = [token, revoked]; return { uid: 'admin-uid' }; };
  assert.equal((await authorizeAdmin('Bearer valid', verifier, 'admin-uid')).uid, 'admin-uid');
  assert.deepEqual(checked, ['valid', true]);
  await assert.rejects(authorizeAdmin('Bearer forged', async () => ({ uid: 'partner', role: 'master', username: 'valeo_admin' }), 'admin-uid'), { status: 403 });
  await assert.rejects(authorizeAdmin('', verifier, 'admin-uid'), { status: 401 });
  await assert.rejects(authorizeAdmin('Bearer revoked', async () => { throw new Error('revoked'); }, 'admin-uid'), { status: 401 });
  await assert.rejects(authorizeAdmin('Bearer valid', verifier, ''), { status: 503 });
});

test('sync has its own credential and fails closed', () => {
  const secret = 'a'.repeat(48);
  assert.doesNotThrow(() => authorizeSync('Bearer ' + secret, secret));
  assert.throws(() => authorizeSync('Bearer other', secret), { status: 401 });
  assert.throws(() => authorizeSync(undefined, secret), { status: 401 });
  assert.throws(() => authorizeSync('Bearer short', 'short'), { status: 503 });
});

test('phone normalization preserves international numbers and supports Arabic digits', () => {
  assert.equal(normalizePhone('050 000 0001'), '+971500000001');
  assert.equal(normalizePhone('٠٥٠٠٠٠٠٠٠١'), '+971500000001');
  assert.equal(normalizePhone('00966 50 000 0001'), '+966500000001');
  assert.equal(normalizePhone('971500000001'), '+971500000001');
  assert.equal(normalizePhone('not a phone'), '');
});

test('English and Arabic questions map to the same tracker fields', () => {
  const en = mapSheetRows([headers, row()]).records[0];
  const ar = mapSheetRows([headers, row({ language: 'ar', 'How old is the child who needs care?': '', 'Do you need a live-in or live-out babysitter?': '', 'Which babysitting package are you looking for?': '', 'كم عمر الطفل اللي يحتاج الرعاية؟': 'شهر', 'تحتاجين جليسة مقيمة في البيت أو غير مقيمة؟': 'غير مقيمة', 'أي باقة جليسات أطفال تبحثين عنها؟': 'شهرية' })]).records[0];
  assert.equal(en.source.package, 'Monthly');
  assert.equal(ar.source.package, 'شهرية');
  assert.equal(ar.source.careType, 'غير مقيمة');
  assert.equal(ar.source.childAge, 'شهر');
  assert.equal(ar.id, en.id);
});

test('identity survives sorting, formatting, campaign edits and duplicate rows', () => {
  const other = row({ Time: 1792669230277, 'phone number': '0500000002' });
  const a = mapSheetRows([headers, row(), other]);
  const b = mapSheetRows([headers, other, row({ 'phone number': '+971 50 000 0001', Campaign: 'Updated campaign' })]);
  assert.equal(a.records[0].id, b.records[1].id);
  const duplicate = mapSheetRows([headers, row(), row()]);
  assert.equal(duplicate.records.length, 1);
  assert.equal(duplicate.duplicates, 1);
  assert.notEqual(a.records[0].id, mapSheetRows([headers, row({ Time: 1792669430277 })]).records[0].id);
});

test('partial rows are deferred and malformed headers fail visibly', () => {
  assert.equal(mapSheetRows([headers, row({ Name: '' })]).incomplete, 1);
  assert.throws(() => mapSheetRows([['Name']]), { status: 502 });
});

test('updates cannot change source data, identity or authorization', () => {
  const body = { id: 'a'.repeat(64), version: 1, status: 'Follow-up', heat: 'Warm', agent: 'Nishant', notes: 'Called', followUpAt: '2026-10-22T18:00:00.000Z' };
  assert.equal(validateUpdate(body).status, 'Follow-up');
  assert.throws(() => validateUpdate({ ...body, source: {} }), { status: 400 });
  assert.throws(() => validateUpdate({ ...body, status: 'Invented' }), { status: 400 });
  assert.throws(() => validateUpdate({ ...body, notes: 'x'.repeat(4001) }), { status: 400 });
  assert.throws(() => validateUpdate({ ...body, followUpAt: 'tomorrow' }), { status: 400 });
});

test('Slack uses a stable deep link and does not interpret names as mentions', () => {
  const { id, source } = mapSheetRows([headers, row({ Name: '<!channel>' })]).records[0];
  const payload = slackMessage(id, source, 'C_TEST');
  assert.equal(payload.blocks[1].fields[0].type, 'plain_text');
  assert.ok(payload.blocks[2].elements[0].url.endsWith('#uae-leads/' + id));
  assert.equal(payload.client_msg_id, slackMessage(id, source, 'C_TEST').client_msg_id);
});
