(function () {
  'use strict';
  const root = document.getElementById('uae-lead-root');
  const tab = document.getElementById('uae-leads-tab');
  if (!root || !tab) return;
  const statuses = ['New', 'Contacted', 'No answer', 'Follow-up', 'Profile shared', 'Trial booked', 'Converted', 'Lost', 'Invalid', 'Duplicate'];
  const heats = ['', 'Hot', 'Warm', 'Cold', 'Dead'];
  const config = window.UAELeadsConfig || {};
  let auth, authLoading, rows = [], nextCursor = null, sync = {}, dialog, editing, busy = false, pageReady = false;
  let refreshTimer, generation = 0;
  const filters = { search: '', status: '', heat: '', due: false };
  const sessionAllowed = () => typeof _session !== 'undefined' && _session && _session.username === 'valeo_admin' && _session.role === 'master';
  const isActive = () => document.getElementById('page-uae-leads').classList.contains('active');
  const safeId = value => /^[a-f0-9]{64}$/.test(value || '');
  const date = value => value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
      else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) if (child != null) node.append(child.nodeType ? child : document.createTextNode(String(child)));
    return node;
  }
  const button = (label, fn, style) => el('button', { type: 'button', class: style || '', onClick: fn }, label);
  function message(value, error) {
    const target = root.querySelector('#ual-message');
    if (target) { target.textContent = value || ''; target.className = error ? 'ual-error' : 'ual-muted'; }
  }
  function closeDialog() { if (dialog) { dialog.close(); dialog.remove(); dialog = null; editing = null; } }
  function clearSession() {
    generation++; rows = []; nextCursor = null; pageReady = false; busy = false;
    clearInterval(refreshTimer); refreshTimer = null; closeDialog(); root.replaceChildren();
    if (auth) return auth.signOut();
  }
  function syncSession() {
    tab.hidden = !sessionAllowed();
    if (!sessionAllowed()) { clearSession(); return; }
    if (location.hash.startsWith('#uae-leads/')) window.switchTab('uae-leads');
  }

  async function initAuth() {
    if (auth) return auth;
    if (authLoading) return authLoading;
    authLoading = (async () => {
      if (!window.firebase) throw new Error('Sign-in could not load. Check your connection and refresh.');
      if (!firebase.auth) await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';
        script.onload = resolve; script.onerror = () => reject(new Error('Unable to load secure sign-in.'));
        document.head.append(script);
      });
      const options = config.firebase || firebase.app().options;
      const app = firebase.apps.find(item => item.name === 'uae-lead-tracker') || firebase.initializeApp(options, 'uae-lead-tracker');
      auth = firebase.auth(app);
      // Lead access is independent of the legacy, browser-only dashboard session.
      await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
      return auth;
    })();
    try { return await authLoading; } finally { authLoading = null; }
  }

  async function request(action, { method = 'GET', body, params = {} } = {}) {
    if (!sessionAllowed() || !auth || !auth.currentUser) throw new Error('Sign in to the lead tracker.');
    const url = new URL(config.apiUrl);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('A secure service address is required.');
    url.searchParams.set('action', action);
    for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(url.toString(), { method, cache: 'no-store', signal: AbortSignal.timeout(20000),
      headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    let data;
    try { data = await response.json(); } catch { throw new Error('The lead service returned an unreadable response.'); }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) { await clearSession(); renderLogin(); }
      throw new Error(data.message || 'Could not reach the lead service.');
    }
    return data;
  }

  function state(title, description) {
    root.className = 'ual';
    const box = el('div', { class: 'ual-state' }, el('div', { class: 'ual-eyebrow' }, 'UAE babysitting'), el('h2', {}, title), el('p', { class: 'ual-muted' }, description));
    root.replaceChildren(box);
    return box;
  }
  function renderLogin() {
    pageReady = false;
    const box = state('Sign in to your lead tracker', 'This workspace is reserved for valeo_admin. Verify your admin account to view lead details.');
    const email = el('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'Your admin email', 'aria-label': 'Admin email' });
    const password = el('input', { type: 'password', required: true, autocomplete: 'current-password', 'aria-label': 'Admin password' });
    const submit = el('button', { type: 'submit', class: 'ual-primary' }, 'Verify admin access');
    const form = el('form', {}, el('label', {}, 'Admin email', email), el('label', {}, 'Password', password), submit, el('div', { id: 'ual-message', role: 'status', 'aria-live': 'polite' }));
    form.addEventListener('submit', async event => {
      event.preventDefault(); submit.disabled = true; message('Signing in…');
      try {
        const current = await initAuth();
        await current.signInWithEmailAndPassword(email.value.trim(), password.value);
        password.value = '';
        await load(false);
        if (pageReady) await openHashLead();
      } catch (error) {
        message(error.code && error.code.startsWith('auth/') ? 'Unable to verify your admin account. Check your email and password.' : error.message, true);
      } finally { submit.disabled = false; }
    });
    box.append(form);
  }

  async function open() {
    if (!sessionAllowed()) { clearSession(); return; }
    root.className = 'ual';
    if (!config.apiUrl) {
      state('Lead connection setup pending', 'The tracker is prepared. Connect the private lead service and Slack channel to start receiving new UAE babysitting leads.');
      return;
    }
    if (!auth || !auth.currentUser) { renderLogin(); return; }
    if (!pageReady) await load(false);
    if (pageReady) await openHashLead();
  }

  function select(label, values, value, change) {
    const input = el('select', { onChange: event => change(event.target.value) }, values.map(v => el('option', { value: v.value ?? v }, (v.label ?? v) || 'Not set')));
    input.value = value;
    return el('label', {}, label, input);
  }
  const due = row => row.tracking.followUpAt && Date.parse(row.tracking.followUpAt) <= Date.now() && !['Converted', 'Lost', 'Invalid', 'Duplicate'].includes(row.tracking.status);
  function renderShell() {
    root.className = 'ual';
    const search = el('input', { type: 'search', placeholder: 'Search name, phone, city or campaign', 'aria-label': 'Search leads', onInput: event => { filters.search = event.target.value; renderTable(); } });
    search.value = filters.search;
    const dueInput = el('input', { type: 'checkbox', onChange: event => { filters.due = event.target.checked; renderTable(); } });
    dueInput.checked = filters.due;
    root.replaceChildren(
      el('div', { class: 'ual-top' }, el('div', {}, el('div', { class: 'ual-eyebrow' }, 'Snapchat · UAE_babysitting'), el('h2', {}, 'UAE Babysitting Leads'), el('div', { class: 'ual-muted' }, 'Call, record the outcome, and keep the next follow-up clear.')),
        el('div', { class: 'ual-actions' }, button('Refresh', () => load(false)), button('Lock tracker', async () => { await clearSession(); renderLogin(); }))),
      el('div', { id: 'ual-sync', class: 'ual-muted' }), el('div', { id: 'ual-message', role: 'status', 'aria-live': 'polite' }),
      el('div', { id: 'ual-kpis', class: 'ual-kpis' }),
      el('div', { class: 'ual-controls' }, el('label', { class: 'ual-search' }, 'Find a lead', search),
        select('Status', [{ value: '', label: 'All statuses' }, ...statuses], filters.status, v => { filters.status = v; renderTable(); }),
        select('Classification', [{ value: '', label: 'All classifications' }, ...heats.filter(Boolean)], filters.heat, v => { filters.heat = v; renderTable(); }),
        el('label', {}, 'Follow-up', el('span', { class: 'ual-actions' }, dueInput, 'Due now'))),
      el('div', { id: 'ual-table', class: 'ual-table-wrap' }),
      el('div', { class: 'ual-footer' }, el('div', { id: 'ual-count', class: 'ual-muted' }), button('Load earlier leads', () => load(true)))
    );
    pageReady = true; renderTable();
    if (!refreshTimer) refreshTimer = setInterval(() => {
      if (isActive() && !document.hidden && !dialog && !busy && auth?.currentUser) load(false, true);
    }, 30000);
  }

  async function load(append, quiet) {
    if (busy) return;
    busy = true;
    const currentGeneration = generation;
    try {
      if (!quiet) message('Loading leads…');
      const data = await request('list', { params: { cursor: append ? nextCursor : '' } });
      if (currentGeneration !== generation || !sessionAllowed()) return;
      const combined = append || quiet ? new Map(rows.map(row => [row.id, row])) : new Map();
      data.leads.forEach(row => combined.set(row.id, row));
      rows = [...combined.values()].sort((a,b) => b.source.submittedAt.localeCompare(a.source.submittedAt) || b.id.localeCompare(a.id));
      if (!quiet || rows.length <= 100) nextCursor = data.nextCursor;
      sync = data.sync || {};
      if (!pageReady) renderShell(); else renderTable();
      message('');
    } catch (error) { message(error.message, true); }
    finally { busy = false; }
  }

  function renderTable() {
    if (!pageReady || !sessionAllowed()) return;
    const kpis = [['Loaded leads', rows.length], ['New', rows.filter(r => r.tracking.status === 'New').length], ['Follow-ups due', rows.filter(due).length], ['Converted', rows.filter(r => r.tracking.status === 'Converted').length]];
    root.querySelector('#ual-kpis').replaceChildren(...kpis.map(([label, value]) => el('div', { class: 'ual-kpi' }, el('span', { class: 'ual-muted' }, label), el('strong', {}, value))));
    const syncText = sync.lastSyncedAt ? `Sheet synced ${date(sync.lastSyncedAt)} · Times shown in Dubai time` : 'Waiting for the first sheet sync';
    const stale = sync.lastSyncedAt && Date.now() - sync.lastSyncedAt > 300000;
    const warnings = [stale ? 'Sync is more than 5 minutes old.' : '', sync.lastSyncError || '', sync.notificationFailures ? 'Slack delivery needs attention; retries are queued.' : '', sync.incompleteRows ? `${sync.incompleteRows} incomplete source row(s) will be checked again.` : ''].filter(Boolean).join(' ');
    root.querySelector('#ual-sync').textContent = syncText + (warnings ? ' — ' + warnings : '');
    const query = filters.search.trim().toLowerCase();
    const filtered = rows.filter(row => (!filters.status || row.tracking.status === filters.status) && (!filters.heat || row.tracking.heat === filters.heat) && (!filters.due || due(row)) && (!query || [row.source.name, row.source.rawPhone, row.source.phone, row.source.city, row.source.campaign].join(' ').toLowerCase().includes(query)));
    const table = el('table', {}, el('thead', {}, el('tr', {}, ['Lead', 'Care required', 'City / Language', 'Status', 'Follow-up', 'Actions'].map(title => el('th', { scope: 'col' }, title)))),
      el('tbody', {}, filtered.map(row => {
        const source = row.source, tracking = row.tracking;
        const actions = el('div', { class: 'ual-actions' }, button('Open', () => showLead(row.id)));
        if (/^\+[1-9]\d{7,14}$/.test(source.phone)) actions.prepend(el('a', { class: 'ual-call', href: 'tel:' + source.phone, 'aria-label': 'Call ' + source.name }, 'Call'));
        return el('tr', {},
          el('td', {}, el('div', { class: 'ual-name', dir: 'auto' }, source.name), el('div', { class: 'ual-phone', dir: 'ltr' }, source.rawPhone), el('div', { class: 'ual-muted' }, date(source.submittedAt))),
          el('td', {}, el('div', { dir: 'auto' }, source.package || 'Not supplied'), el('div', { class: 'ual-muted', dir: 'auto' }, [source.childAge, source.careType].filter(Boolean).join(' · '))),
          el('td', {}, el('div', { dir: 'auto' }, source.city || '—'), el('div', { class: 'ual-muted' }, source.language || '—')),
          el('td', {}, el('span', { class: 'ual-badge', 'data-status': tracking.status }, tracking.status), el('div', { class: 'ual-muted' }, [tracking.heat, tracking.agent].filter(Boolean).join(' · '))),
          el('td', { class: due(row) ? 'ual-due' : '' }, date(tracking.followUpAt), due(row) ? el('div', {}, 'Due') : null), el('td', {}, actions));
      })));
    root.querySelector('#ual-table').replaceChildren(filtered.length ? table : el('div', { class: 'ual-empty' }, rows.length ? 'No leads match these filters.' : 'No UAE babysitting leads have been imported yet.'));
    root.querySelector('#ual-count').textContent = `Showing ${filtered.length} of ${rows.length} loaded leads. Filters and totals apply to loaded records.`;
    const more = root.querySelector('.ual-footer button'); more.hidden = !nextCursor;
  }

  function toDubaiInput(value) {
    if (!value) return '';
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value)).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  }

  async function showLead(id) {
    if (!safeId(id)) return;
    const currentGeneration = generation;
    message('Opening lead…');
    try {
      const result = await request('lead', { params: { id } });
      if (!sessionAllowed() || !auth?.currentUser || currentGeneration !== generation) return;
      closeDialog(); editing = result.lead;
      const source = editing.source, tracking = editing.tracking;
      const title = el('h3', { id: 'ual-dialog-title', dir: 'auto' }, source.name);
      const call = /^\+[1-9]\d{7,14}$/.test(source.phone) ? el('a', { class: 'ual-call ual-primary', href: 'tel:' + source.phone }, 'Call ' + source.phone) : el('span', { class: 'ual-muted' }, 'Check phone number: ' + source.rawPhone);
      dialog = el('dialog', { class: 'ual ual-dialog', 'aria-labelledby': 'ual-dialog-title' },
        el('div', { class: 'ual-top' }, el('div', {}, el('div', { class: 'ual-eyebrow' }, 'UAE babysitting lead'), title, el('div', { class: 'ual-muted' }, date(source.submittedAt))), button('Close', closeDialog)), call);
      const details = [['Phone', source.rawPhone], ['Email', source.email], ['City', source.city], ['Language', source.language], ['Child age', source.childAge], ['Care type', source.careType], ['Package', source.package], ['Campaign', source.campaign], ['Source remarks', source.sourceRemarks]];
      dialog.append(el('dl', { class: 'ual-details' }, details.map(([label, value]) => el('div', {}, el('dt', {}, label), el('dd', { dir: 'auto' }, value || '—')))));
      const draft = { ...tracking };
      const agent = el('input', { type: 'text', maxlength: '100', name: 'agent' }); agent.value = draft.agent;
      const followUp = el('input', { type: 'datetime-local', name: 'followUpAt' }); followUp.value = toDubaiInput(draft.followUpAt);
      const notes = el('textarea', { maxlength: '4000', rows: '4', name: 'notes', placeholder: 'Call outcome, requirement, and agreed next step', dir: 'auto' }); notes.value = draft.notes;
      const errorBox = el('div', { class: 'ual-error ual-full', role: 'status', 'aria-live': 'polite' });
      const submit = el('button', { type: 'submit', class: 'ual-primary' }, 'Save update');
      const form = el('form', { class: 'ual-form' },
        select('Status', statuses, draft.status, value => { draft.status = value; }),
        select('Classification', heats, draft.heat, value => { draft.heat = value; }),
        el('label', {}, 'Assigned to', agent), el('label', {}, 'Next follow-up (Dubai time)', followUp),
        el('label', { class: 'ual-full' }, 'Notes', notes), errorBox,
        el('div', { class: 'ual-actions ual-full' }, submit, button('Cancel', closeDialog)));
      const savedVersion = editing.version;
      form.addEventListener('submit', async event => {
        event.preventDefault(); submit.disabled = true; errorBox.textContent = '';
        try {
          const result = await request('update', { method: 'PATCH', body: { id, version: savedVersion, ...draft, agent: agent.value, notes: notes.value, followUpAt: followUp.value ? new Date(followUp.value + '+04:00').toISOString() : '' } });
          if (currentGeneration !== generation || !sessionAllowed()) return;
          const i = rows.findIndex(row => row.id === id);
          if (i >= 0) rows[i] = result.lead;
          else rows.unshift(result.lead);
          closeDialog(); renderTable(); message('Lead updated.');
        } catch (error) { errorBox.textContent = error.message; }
        finally { submit.disabled = false; }
      });
      dialog.append(form);
      if (editing.history.length) dialog.append(el('details', { class: 'ual-history' }, el('summary', {}, 'Recent update history'), el('ul', {}, editing.history.slice(-10).reverse().map(item => el('li', {}, `${date(item.at)} · ${item.by} · ${item.from} → ${item.to}`, el('div', { class: 'ual-muted' }, Object.entries(item.changes).map(([key,value]) => `${key}: ${value || 'cleared'}`).join(' · ')))))));
      document.body.append(dialog); dialog.showModal();
      const openedDialog = dialog;
      openedDialog.addEventListener('close', () => { openedDialog.remove(); if (dialog === openedDialog) { dialog = null; editing = null; } });
      history.replaceState(null, '', '#uae-leads/' + id); message('');
    } catch (error) { message(error.message, true); }
  }

  async function openHashLead() {
    const id = location.hash.slice('#uae-leads/'.length);
    if (location.hash.startsWith('#uae-leads/') && safeId(id) && !dialog) await showLead(id);
  }
  window.addEventListener('hashchange', () => { if (sessionAllowed() && location.hash.startsWith('#uae-leads/')) window.switchTab('uae-leads'); });
  window.UAELeads = Object.freeze({ open, syncSession, clearSession });
  syncSession();
})();
