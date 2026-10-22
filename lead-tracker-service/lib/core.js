import { createHash, timingSafeEqual } from 'node:crypto';

export const SOURCE_ID = process.env.LEAD_SOURCE_SPREADSHEET_ID || '';
export const SOURCE_TAB = 'UAE_babysitting';
export const SOURCE_RANGE = "'UAE_babysitting'!A:W";
export const DASHBOARD_URL = 'https://nishantchaturvedi-arch.github.io/valeo-dashboard/dashboard.html';
export const DASHBOARD_ORIGIN = new URL(DASHBOARD_URL).origin;
export const STATUSES = ['New', 'Contacted', 'No answer', 'Follow-up', 'Profile shared', 'Trial booked', 'Converted', 'Lost', 'Invalid', 'Duplicate'];
export const HEATS = ['', 'Hot', 'Warm', 'Cold', 'Dead'];

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const text = value => String(value ?? '').trim();
const hash = value => createHash('sha256').update(value).digest('hex');
export const validId = id => typeof id === 'string' && /^[a-f0-9]{64}$/.test(id);

export function normalizePhone(value) {
  let digits = text(value).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^05\d{8}$/.test(digits)) digits = '971' + digits.slice(1);
  else if (/^5\d{8}$/.test(digits)) digits = '971' + digits;
  return /^[1-9]\d{7,14}$/.test(digits) ? '+' + digits : '';
}

function submissionTime(row) {
  const epoch = Number(row.Time);
  if (Number.isFinite(epoch) && epoch > 946684800000 && epoch < 4102444800000) return new Date(epoch).toISOString();
  const value = text(row['Time submitted']);
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return '';
  const [, d, mo, y, h, mi, sec = '00'] = m;
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${mi}:${sec}+04:00`;
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
}

export function mapSheetRows(values) {
  if (!Array.isArray(values) || !values.length) throw new HttpError(502, 'Source sheet has no header row.');
  const headers = values[0].map(text);
  for (const required of ['Time submitted', 'Time', 'Name', 'phone number', 'Platform']) {
    if (headers.filter(h => h === required).length !== 1) throw new HttpError(502, `Source header missing or duplicated: ${required}`);
  }
  const records = new Map();
  let incomplete = 0, duplicates = 0;
  for (let index = 1; index < values.length; index++) {
    const cells = values[index];
    if (!cells.some(v => text(v))) continue;
    const row = Object.fromEntries(headers.map((h, i) => [h, text(cells[i])]));
    const submittedAt = submissionTime(row);
    const rawPhone = row['phone number'];
    const phone = normalizePhone(rawPhone);
    // Do not ingest a partially appended row. Full snapshots reconsider it next run.
    if (!submittedAt || !rawPhone || !row.Name) { incomplete++; continue; }
    const platform = row.Platform.toLowerCase();
    const id = hash(JSON.stringify([SOURCE_ID, SOURCE_TAB, submittedAt, phone || rawPhone, platform]));
    const source = {
      spreadsheetId: SOURCE_ID, tab: SOURCE_TAB, row: index + 1,
      submittedAt, submittedDisplay: row['Time submitted'], platform,
      name: row.Name, email: row.email || '', phone, rawPhone,
      campaign: row.Campaign || '', language: row.language || '',
      childAge: row['How old is the child who needs care?'] || row['كم عمر الطفل اللي يحتاج الرعاية؟'] || '',
      careType: row['Do you need a live-in or live-out babysitter?'] || row['تحتاجين جليسة مقيمة في البيت أو غير مقيمة؟'] || '',
      package: row['Which babysitting package are you looking for?'] || row['أي باقة جليسات أطفال تبحثين عنها؟'] || row.package || '',
      city: row.City || '', sourceAgent: row.Agent || '', sourceRemarks: row.Remarks || ''
    };
    if (Object.values(source).some(v => typeof v === 'string' && v.length > 8000)) {
      throw new HttpError(502, 'A source cell exceeds the supported length.');
    }
    if (records.has(id)) duplicates++;
    records.set(id, { id, source });
  }
  return { records: [...records.values()], incomplete, duplicates };
}

export function initialRecord(source, baseline, now) {
  return {
    source,
    tracking: { status: 'New', heat: '', agent: source.sourceAgent, notes: '', followUpAt: '' },
    version: 1, firstSeenAt: now, updatedAt: now, updatedBy: 'import', history: [],
    notification: { state: baseline ? 'baseline' : 'pending', sentAt: null }
  };
}

export function validateUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Invalid update.');
  const keys = ['id', 'version', 'status', 'heat', 'agent', 'notes', 'followUpAt'];
  if (Object.keys(body).some(k => !keys.includes(k))) throw new HttpError(400, 'Unsupported field.');
  if (!validId(body.id) || !Number.isSafeInteger(body.version) || body.version < 1) throw new HttpError(400, 'Invalid record or version.');
  if (!STATUSES.includes(body.status) || !HEATS.includes(body.heat)) throw new HttpError(400, 'Invalid status or classification.');
  for (const [key, max] of [['agent', 100], ['notes', 4000], ['followUpAt', 30]]) {
    if (typeof body[key] !== 'string' || body[key].length > max) throw new HttpError(400, `Invalid ${key}.`);
  }
  if (body.followUpAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(body.followUpAt) || !Number.isFinite(Date.parse(body.followUpAt)))) throw new HttpError(400, 'Invalid follow-up date.');
  return Object.fromEntries(['status', 'heat', 'agent', 'notes', 'followUpAt'].map(k => [k, body[k].trim()]));
}

export async function authorizeAdmin(header, verifyToken, adminUid) {
  if (!adminUid) throw new HttpError(503, 'Admin access is not configured.');
  if (typeof header !== 'string' || !header.startsWith('Bearer ') || header.length > 8192) throw new HttpError(401, 'Sign in to the lead tracker.');
  let claims;
  try { claims = await verifyToken(header.slice(7), true); }
  catch { throw new HttpError(401, 'Your admin session has expired. Sign in again.'); }
  if (!claims || claims.uid !== adminUid) throw new HttpError(403, 'This tracker is restricted to valeo_admin.');
  return claims;
}

export function authorizeSync(header, secret) {
  if (!secret || secret.length < 32) throw new HttpError(503, 'Lead sync is not configured.');
  const given = typeof header === 'string' ? header : '';
  if (!timingSafeEqual(Buffer.from(hash(given)), Buffer.from(hash('Bearer ' + secret)))) throw new HttpError(401, 'Invalid sync credential.');
}

export function slackMessage(id, source, channel) {
  const field = (label, value) => ({ type: 'plain_text', text: `${label}\n${text(value).slice(0,400) || 'Not supplied'}`, emoji: false });
  const stableUuid = `${id.slice(0,8)}-${id.slice(8,12)}-4${id.slice(13,16)}-a${id.slice(17,20)}-${id.slice(20,32)}`;
  return {
    channel, text: 'New UAE babysitting lead — open the secure dashboard to call and update status.',
    client_msg_id: stableUuid, unfurl_links: false, unfurl_media: false,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'New UAE babysitting lead', emoji: false } },
      { type: 'section', fields: [field('Name', source.name), field('City', source.city), field('Child age', source.childAge), field('Package', source.package), field('Care type', source.careType), field('Language', source.language)] },
      { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Open lead & update status' }, url: `${DASHBOARD_URL}#uae-leads/${id}`, action_id: 'open_uae_lead' }] }
    ]
  };
}
