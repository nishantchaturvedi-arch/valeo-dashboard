import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminSessions, passwordHash } from '../lib/admin-session.js';
function memoryDb() {
  const records = new Map();
  const db = { collection: name => ({ doc: id => ({
    get: async () => ({ data: () => records.get(name + '/' + id) }),
    set: async value => records.set(name + '/' + id, value),
    delete: async () => records.delete(name + '/' + id)
  }) }), runTransaction: async fn => fn({ get: ref => ref.get(), set: (ref, value) => ref.set(value) }) };
  return db;
}
test('one dashboard login issues a protected, revocable, expiring lead session', async () => {
  const db = memoryDb(); let now = 10000;
  const password = 'synthetic-test-password-only';
  const encoded = await passwordHash(password);
  const auth = createAdminSessions(db, encoded, () => now);
  await assert.rejects(auth.authorize('Bearer ' + '0'.repeat(64)), { status: 401 });
  await assert.rejects(auth.login({username: 'partner', password}), { status: 401 });
  await assert.rejects(auth.login({username: 'valeo_admin', password: 'wrong-password-123'}), { status: 401 });
  const session = await auth.login({username: 'valeo_admin', password});
  await auth.authorize('Bearer ' + session.token);
  await assert.rejects(auth.authorize('Bearer ' + session.token.slice(1) + 'x'), { status: 401 });
  await auth.logout('Bearer ' + session.token);
  await assert.rejects(auth.authorize('Bearer ' + session.token), { status: 401 });
  const next = await auth.login({username: 'valeo_admin', password});
  const rotated = createAdminSessions(db, await passwordHash('another-test-password'), () => now);
  await assert.rejects(rotated.authorize('Bearer ' + next.token), { status: 401 });
  now = next.expiresAt;
  await assert.rejects(auth.authorize('Bearer ' + next.token), { status: 401 });
});
test('admin login fails closed without configuration and enforces a shared attempt limit', async () => {
  const db = memoryDb();
  await assert.rejects(createAdminSessions(db, '').login({}), { status: 503 });
  await db.collection('system').doc('adminLoginRate').set({count: 20, until: Date.now() + 60000});
  const auth = createAdminSessions(db, 'a'.repeat(32) + ':' + 'b'.repeat(64));
  await assert.rejects(auth.login({username: 'valeo_admin', password: 'some-test-password'}), { status: 429 });
});
