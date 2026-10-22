import { randomUUID } from 'node:crypto';
import { HttpError, initialRecord, mapSheetRows, slackMessage, validId, validateUpdate } from './core.js';

export function createService({ db, readSheet, postSlack, channel, clock = Date.now }) {
  const leads = db.collection('leads');
  const outbox = db.collection('notificationOutbox');
  const stateRef = db.collection('system').doc('sync');
  const leaseRef = db.collection('system').doc('lease');
  const publicRecord = snap => {
    const data = snap.data();
    return { id: snap.id, source: data.source, tracking: data.tracking, version: data.version,
      firstSeenAt: data.firstSeenAt, updatedAt: data.updatedAt, updatedBy: data.updatedBy, history: data.history || [] };
  };

  async function list(cursor) {
    let query = leads.orderBy('source.submittedAt', 'desc').orderBy('__name__', 'desc');
    if (cursor) {
      if (!validId(cursor)) throw new HttpError(400, 'Invalid page cursor.');
      const last = await leads.doc(cursor).get();
      if (!last.exists) throw new HttpError(400, 'Page cursor no longer exists. Refresh the list.');
      query = query.startAfter(last);
    }
    const [snapshot, syncState] = await Promise.all([query.limit(101).get(), stateRef.get()]);
    const docs = snapshot.docs.slice(0, 100);
    return { leads: docs.map(publicRecord), nextCursor: snapshot.docs.length > 100 ? docs.at(-1).id : null,
      sync: syncState.exists ? syncState.data() : { initialized: false } };
  }

  async function get(id) {
    if (!validId(id)) throw new HttpError(400, 'Invalid lead.');
    const doc = await leads.doc(id).get();
    if (!doc.exists) throw new HttpError(404, 'Lead not found.');
    return { lead: publicRecord(doc) };
  }

  async function update(body) {
    const tracking = validateUpdate(body), ref = leads.doc(body.id);
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpError(404, 'Lead not found.');
      const old = snap.data();
      if (old.version !== body.version) throw new HttpError(409, 'This lead changed in another window. Reopen it before saving.');
      const now = clock();
      const change = { at: now, by: 'valeo_admin', from: old.tracking.status, to: tracking.status,
        changes: Object.fromEntries(Object.keys(tracking).filter(k => tracking[k] !== old.tracking[k]).map(k => [k, tracking[k]])) };
      tx.update(ref, { tracking, version: old.version + 1, updatedAt: now, updatedBy: 'valeo_admin', history: [...(old.history || []), change].slice(-50) });
    });
    return get(body.id);
  }

  async function sync() {
    if (!channel || !/^[CG][A-Z0-9]+$/.test(channel)) throw new HttpError(503, 'Choose and configure the Slack channel before initializing sync.');
    const owner = randomUUID(), deadline = clock() + 45000;
    const acquired = await db.runTransaction(async tx => {
      const snap = await tx.get(leaseRef);
      if (snap.exists && snap.data().expiresAt > clock()) return false;
      tx.set(leaseRef, { owner, expiresAt: clock() + 120000 });
      return true;
    });
    if (!acquired) return { busy: true };
    try {
      const parsed = mapSheetRows(await readSheet());
      const state = await stateRef.get();
      const baseline = !state.exists || !state.data().initialized;
      let added = 0;
      // Source updates never overwrite tracking, audit history, or save versions.
      for (let offset = 0; offset < parsed.records.length; offset += 150) {
        const rows = parsed.records.slice(offset, offset + 150);
        const existing = await db.getAll(...rows.map(r => leads.doc(r.id)));
        const batch = db.batch();
        rows.forEach((row, i) => {
          const ref = leads.doc(row.id);
          if (existing[i].exists) {
            if (JSON.stringify(existing[i].data().source) !== JSON.stringify(row.source)) batch.update(ref, { source: row.source });
          } else {
            const now = clock();
            batch.create(ref, initialRecord(row.source, baseline, now));
            if (!baseline) batch.create(outbox.doc(row.id), { nextAttemptAt: now, attempts: 0 });
            added++;
          }
        });
        await batch.commit();
      }
      const now = clock();
      await stateRef.set({ initialized: true, lastSyncedAt: now, sourceRecords: parsed.records.length,
        incompleteRows: parsed.incomplete, duplicateRows: parsed.duplicates, lastImportAdded: added,
        lastSyncError: null }, { merge: true });
      const delivery = await drainOutbox(deadline);
      await stateRef.set({ lastNotificationCheckAt: clock(), notificationFailures: delivery.failed, alertsSentLastRun: delivery.sent }, { merge: true });
      return { baseline, added, ...delivery, incomplete: parsed.incomplete, duplicates: parsed.duplicates };
    } catch (error) {
      await stateRef.set({ lastSyncError: 'The latest sync failed. Check the backend and n8n execution logs.', lastSyncErrorAt: clock() }, { merge: true }).catch(() => {});
      throw error;
    } finally {
      await db.runTransaction(async tx => {
        const snap = await tx.get(leaseRef);
        if (snap.exists && snap.data().owner === owner) tx.delete(leaseRef);
      });
    }
  }

  async function drainOutbox(deadline) {
    let sent = 0, failed = 0;
    const queued = await outbox.where('nextAttemptAt', '<=', clock()).orderBy('nextAttemptAt').limit(10).get();
    for (const pending of queued.docs) {
      if (clock() + 9000 > deadline) break;
      const leadRef = leads.doc(pending.id), snap = await leadRef.get();
      if (!snap.exists || snap.data().notification.state === 'sent') { await pending.ref.delete(); continue; }
      try {
        const response = await postSlack(slackMessage(pending.id, snap.data().source, channel));
        const batch = db.batch();
        batch.update(leadRef, { notification: { state: 'sent', sentAt: clock(), messageTs: response.ts } });
        batch.delete(pending.ref);
        await batch.commit();
        sent++;
      } catch (error) {
        const attempts = pending.data().attempts + 1;
        const wait = Math.max(error.retryAfterMs || 0, Math.min(3600000, 60000 * 2 ** Math.min(attempts - 1, 6)));
        await pending.ref.update({ attempts, nextAttemptAt: clock() + wait });
        failed++;
      }
      // Slack normally permits about one message per second per channel.
      if (pending !== queued.docs.at(-1)) await new Promise(resolve => setTimeout(resolve, 1100));
    }
    return { sent, failed };
  }
  return { list, get, update, sync };
}
