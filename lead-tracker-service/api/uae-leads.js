import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleAuth } from 'google-auth-library';
import { authorizeAdmin, authorizeSync, DASHBOARD_ORIGIN, HttpError, SOURCE_ID, SOURCE_RANGE } from '../lib/core.js';
import { createService } from '../lib/service.js';

let dependencies;
function configured() {
  if (dependencies) return dependencies;
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(SOURCE_ID)) throw new HttpError(503, 'The lead source is not configured.');
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.FIRESTORE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID === '(default)') {
    throw new HttpError(503, 'The private lead database is not configured.');
  }
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const app = getApps().some(a => a.name === 'uae-leads-backend') ? getApp('uae-leads-backend') : initializeApp({ credential: cert(credentials) }, 'uae-leads-backend');
  const db = getFirestore(app, process.env.FIRESTORE_DATABASE_ID);
  const google = new GoogleAuth({ credentials: JSON.parse(process.env.SHEETS_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON), scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  const service = createService({ db, channel: process.env.SLACK_CHANNEL_ID,
    readSheet: async () => {
      const client = await google.getClient();
      const response = await client.request({ url: `https://sheets.googleapis.com/v4/spreadsheets/${SOURCE_ID}/values/${encodeURIComponent(SOURCE_RANGE)}`, params: { valueRenderOption: 'UNFORMATTED_VALUE' }, timeout: 15000 });
      return response.data.values || [];
    },
    postSlack: async payload => {
      if (!process.env.SLACK_BOT_TOKEN) throw new HttpError(503, 'Slack is not configured.');
      const res = await fetch('https://slack.com/api/chat.postMessage', { method: 'POST',
        headers: { Authorization: 'Bearer ' + process.env.SLACK_BOT_TOKEN, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.ts) {
        const error = new Error('Slack delivery failed.');
        error.retryAfterMs = Math.max(0, Number(res.headers.get('retry-after') || 0) * 1000);
        throw error;
      }
      return data;
    }
  });
  dependencies = { service, auth: getAuth(app) };
  return dependencies;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const origin = req.headers.origin;
  if (origin && origin !== DASHBOARD_ORIGIN) return res.status(403).json({ message: 'Origin not allowed.' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const url = new URL(req.url, 'https://backend.invalid');
    const action = url.searchParams.get('action') || 'list';
    if (action === 'sync' && req.method === 'POST') {
      authorizeSync(req.headers.authorization, process.env.LEAD_SYNC_SECRET);
      if (!process.env.SLACK_BOT_TOKEN) throw new HttpError(503, 'Configure Slack before initializing sync.');
      return res.status(200).json(await configured().service.sync());
    }
    if (!['GET', 'PATCH'].includes(req.method)) throw new HttpError(405, 'Method not allowed.');
    const { service, auth } = configured();
    await authorizeAdmin(req.headers.authorization, (token, revoked) => auth.verifyIdToken(token, revoked), process.env.VALEO_ADMIN_UID);
    if (req.method === 'GET' && action === 'list') return res.status(200).json(await service.list(url.searchParams.get('cursor')));
    if (req.method === 'GET' && action === 'lead') return res.status(200).json(await service.get(url.searchParams.get('id')));
    if (req.method === 'PATCH' && action === 'update') {
      if (Number(req.headers['content-length'] || 0) > 12000) throw new HttpError(413, 'Update is too large.');
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      return res.status(200).json(await service.update(body));
    }
    throw new HttpError(404, 'Unknown operation.');
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    // Never emit credentials, source rows, upstream responses, or ID tokens.
    if (status === 500) console.error('uae-leads request failed', { code: error.code || 'internal' });
    return res.status(status).json({ message: status === 500 ? 'Lead service is unavailable. Try again shortly.' : error.message });
  }
}
