// n8n Code node ("Run Once for All Items") — builds the daily Slack message of open orders.
// Same rules as the dashboard's ⏰ Open Orders page:
//   open = Order_Status not COMPLETED, not CANCELLED / TEMP_ORDER, and the confirmed date
//   (Confirmed_DateTime, else Booked_Slot) is before today (Asia/Dubai). UAE orders only.
// Excluded / dummy homecares are left out, as on the dashboard.
const DASH = 'https://nishantchaturvedi-arch.github.io/valeo-dashboard/dashboard.html#openorders';
const MAX_LINES = 40;                       // orders listed per country (oldest first); totals cover all
const EXCL = ['carezone home healthcare llc','dummy homecare','helpful agency','nifas hc','babysitting ksa','pyramid home health care'];
const COUNTRIES = [
  {code:'AE', name:'UAE',   cur:'AED', tz:'Asia/Dubai', match:['uae','ae','are','unitedarabemirates']},
];
const norm = v => String(v == null ? '' : v).toLowerCase().replace(/[\s_\-]+/g, '');
const todayIn = tz => new Intl.DateTimeFormat('en-CA', {timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());

let rows = $input.all().map(i => i.json);
if (rows.length === 1 && Array.isArray(rows[0])) rows = rows[0];                       // whole array in one item
if (rows.length && rows[0] && rows[0].json) rows = rows.map(r => r.json);               // [{json:{...}}] shape
if (rows.length === 1 && Array.isArray(rows[0].data)) rows = rows[0].data;              // {data:[...]} shape

function openOrders(c) {
  const today = todayIn(c.tz);
  return rows.filter(r => {
    const ck = Object.keys(r).filter(k => /country/i.test(k));
    if (ck.length ? !ck.some(k => c.match.includes(norm(r[k]))) : c.code !== 'AE') return false;
    const st = norm(r.Order_Status);
    if (st === 'completed' || st === 'cancelled' || st === 'temporder') return false;
    const hc = String(r.Homecare || '').replace(/ /g, ' ').trim();
    if (EXCL.includes(hc.toLowerCase()) || /dummy/i.test(hc)) return false;
    const d = String(r.Confirmed_DateTime || r.Booked_Slot || '').replace('T', ' ').slice(0, 10);
    return d && d < today;
  }).map(r => {
    const cd = String(r.Confirmed_DateTime || r.Booked_Slot || '').replace('T', ' ');
    const d = cd.slice(0, 10);
    return {date:d, time:cd.slice(11, 16), status:String(r.Order_Status || '').trim(), child:String(r.Child_Order_ID || ''), cart:String(r.Cart_Order_ID || ''),
      client:String(r['User Name'] || '').trim(), hc:String(r.Homecare || '').replace(/ /g, ' ').trim(), nurse:String(r.Nurse_Assigned || '').trim(),
      price:parseFloat(r.Final_Price || r.Order_Price || 0) || 0,
      overdue:Math.round((new Date(today + 'T12:00:00') - new Date(d + 'T12:00:00')) / 864e5)};
  }).sort((a, b) => a.date.localeCompare(b.date) || a.cart.localeCompare(b.cart) || a.child.localeCompare(b.child));
}

const n0 = x => Math.round(x || 0).toLocaleString('en-US');
const parts = [], counts = {};
for (const c of COUNTRIES) {
  const list = openOrders(c);
  counts[c.code] = list.length;
  if (!list.length) { if (c.code === 'AE') parts.push(`*${c.name}* ✅ No open orders — everything up to yesterday is completed.`); continue; }
  const parents = new Set(list.map(o => o.cart)).size, value = list.reduce((t, o) => t + o.price, 0), noNurse = list.filter(o => !o.nurse).length;
  const byS = {}, byHC = {};
  list.forEach(o => { byS[o.status] = (byS[o.status] || 0) + 1; const h = o.hc || 'No homecare'; byHC[h] = (byHC[h] || 0) + 1; });
  const lines = list.slice(0, MAX_LINES).map(o =>
    `• \`${o.date}${o.time ? ' ' + o.time : ''}\` *${o.overdue}d* · #${o.child} · ${o.client || 'Client'} · ${o.hc || '_no homecare_'} · ${o.nurse || '_no nurse_'} · ${o.status}`);
  parts.push(
    `*${c.name}* — *${list.length}* open order${list.length === 1 ? '' : 's'} (${parents} parent) · ${c.cur} ${n0(value)} · ${noNurse} without a nurse · oldest ${list[0].overdue} days\n` +
    `By status: ${Object.entries(byS).sort().map(([s, n]) => `${s.toLowerCase()} ${n}`).join(' · ')}\n` +
    `By homecare: ${Object.entries(byHC).sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h} ${n}`).join(' · ')}\n\n` +
    lines.join('\n') + (list.length > MAX_LINES ? `\n…and ${list.length - MAX_LINES} more — see the dashboard.` : ''));
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
const text = `:alarm_clock: *Open orders — not marked Completed* (${todayIn('Asia/Dubai')}, 10 PM)\n` +
  `Orders whose confirmed date has passed but the status is still not COMPLETED. Please complete them in the admin panel, or cancel if they did not happen.\n\n` +
  parts.join('\n\n') + `\n\n<${DASH}|Open the full list (download, filters) →>`;
return [{json:{text, total, counts}}];
