import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../lib/service.js';
import { headers, row } from './fixtures.js';

// A small in-memory Firestore adapter exercises state transitions without real leads,
// credentials, Slack messages, or production database writes.
function memoryDb() {
  const data = new Map();
  const clone = value => value === undefined ? undefined : structuredClone(value);
  const field = (value, key) => key.split('.').reduce((v,k) => v?.[k], value);
  const ref = path => ({ path, id: path.split('/').at(-1),
    get: async () => snapshot(path),
    set: async (value, opts) => data.set(path, opts?.merge ? { ...data.get(path), ...clone(value) } : clone(value)),
    update: async value => { assert.ok(data.has(path)); data.set(path, { ...data.get(path), ...clone(value) }); },
    delete: async () => data.delete(path)
  });
  const snapshot = path => ({ id: path.split('/').at(-1), exists: data.has(path), data: () => clone(data.get(path)), ref: ref(path) });
  const batch = () => {
    const ops = [];
    return {
      create: (r, v) => ops.push(() => { assert.ok(!data.has(r.path)); data.set(r.path, clone(v)); }),
      update: (r, v) => ops.push(() => r.update(v)),
      set: (r, v, options) => ops.push(() => r.set(v, options)),
      delete: r => ops.push(() => r.delete()),
      commit: async () => { for (const op of ops) await op(); }
    };
  };
  const collection = (name, filters = [], orders = [], limit = Infinity, after) => {
    const q = { doc: id => ref(name + '/' + id),
      where: (key, operation, value) => collection(name, [...filters, [key,operation,value]], orders, limit, after),
      orderBy: (key, dir = 'asc') => collection(name, filters, [...orders, [key,dir]], limit, after),
      startAfter: snap => collection(name, filters, orders, limit, snap),
      limit: n => collection(name, filters, orders, n, after),
      get: async () => {
        let items = [...data.keys()].filter(p => p.startsWith(name + '/')).map(snapshot);
        items = items.filter(s => filters.every(([key,op,value]) => op === '<=' ? field(s.data(),key) <= value : field(s.data(),key) === value));
        items.sort((a,b) => { for (const [key,dir] of orders) { const av = key === '__name__' ? a.id : field(a.data(),key), bv = key === '__name__' ? b.id : field(b.data(),key); if (av !== bv) return (av > bv ? 1 : -1) * (dir === 'desc' ? -1 : 1); } return 0; });
        if (after) items = items.slice(items.findIndex(s => s.id === after.id) + 1);
        return { docs: items.slice(0,limit) };
      }
    };
    return q;
  };
  return { collection, batch, getAll: (...refs) => Promise.all(refs.map(r => r.get())),
    runTransaction: async callback => { const tx = batch(); const result = await callback({ ...tx, get: r => r.get() }); await tx.commit(); return result; } };
}

test('baseline is quiet; new leads alert once; refresh preserves notes and status', async () => {
  let source = [headers, row()], time = 1800000000000;
  const messages = [], db = memoryDb();
  const service = createService({ db, clock: () => time, channel: 'C12345', readSheet: async () => source, postSlack: async message => { messages.push(message); return { ts: '1.001' }; } });
  assert.equal((await service.sync()).baseline, true);
  assert.equal(messages.length, 0);
  let lead = (await service.list()).leads[0];
  await service.update({ id: lead.id, version: lead.version, status: 'Follow-up', heat: 'Warm', agent: 'Nishant', notes: 'Agreed to call tomorrow.', followUpAt: '2026-10-23T06:00:00.000Z' });
  source = [headers, row({ Name: 'Corrected name', Campaign: 'New campaign' }), row({ Time: 1792669230277, 'phone number': '0500000002' })];
  time += 60000;
  const run = await service.sync();
  assert.equal(run.added, 1); assert.equal(run.sent, 1); assert.equal(messages.length, 1);
  lead = (await service.get(lead.id)).lead;
  assert.equal(lead.source.name, 'Corrected name');
  assert.equal(lead.tracking.status, 'Follow-up');
  assert.equal(lead.tracking.notes, 'Agreed to call tomorrow.');
  assert.equal(lead.version, 2);
  assert.equal(lead.history.length, 1);
  await service.sync(); assert.equal(messages.length, 1);
  assert.equal((await service.list()).leads[0].source.phone, '+971500000002');
  await assert.rejects(service.update({ id: lead.id, version: 1, ...lead.tracking }), { status: 409 });
});

test('failed Slack deliveries stay queued and retry without losing leads', async () => {
  let source = [headers, row()], time = 1800000000000, fail = true, attempts = 0;
  const service = createService({ db: memoryDb(), clock: () => time, channel: 'C12345', readSheet: async () => source,
    postSlack: async () => { attempts++; if (fail) throw new Error('Temporary Slack failure'); return { ts: '2.002' }; } });
  await service.sync();
  source.push(row({ Time: 1792669230277, 'phone number': '0500000002' }));
  assert.equal((await service.sync()).failed, 1);
  assert.equal((await service.list()).leads.length, 2);
  await service.sync(); assert.equal(attempts, 1);
  fail = false; time += 61000;
  assert.equal((await service.sync()).sent, 1);
  await service.sync(); assert.equal(attempts, 2);
});

test('a broken source schema does not initialize a silent baseline', async () => {
  const service = createService({ db: memoryDb(), channel: 'C12345', readSheet: async () => [['wrong header']], postSlack: async () => { throw new Error('Should not send'); } });
  await assert.rejects(service.sync(), { status: 502 });
  assert.notEqual((await service.list()).sync.initialized, true);
});

test('missing alert destination blocks setup rather than choosing recipients', async () => {
  const service = createService({ db: memoryDb(), channel: '', readSheet: async () => [headers, row()], postSlack: async () => ({ ts: 'x' }) });
  await assert.rejects(service.sync(), { status: 503 });
  assert.equal((await service.list()).leads.length, 0);
});
