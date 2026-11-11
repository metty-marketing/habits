(() => {
'use strict';

/* ---------- basics ---------- */
const KEY = 'habits.mmc.v1';
const ML_PER_OZ = 29.5735;
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOWL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const ALL = [0,1,2,3,4,5,6], WEEKDAYS = [1,2,3,4,5];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayKey = () => keyOf(new Date());
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const dowOf = k => parseKey(k).getDay();
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
const pct = x => x == null ? '–' : Math.round(x * 100) + '%';
const num = n => Math.round(n).toLocaleString('en-US');
const fmtDate = (k, o) => parseKey(k).toLocaleDateString('en-US', o);
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

const ICON = {
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  pill:'<g transform="rotate(-40 12 12)"><rect x="3" y="8.5" width="18" height="7" rx="3.5"/><path d="M12 8.5v7"/></g>',
  drop:'<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
  leaf:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18"/>',
  star:'<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  today:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8.5 15l2.3 2.2L15.5 13"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  sliders:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  dots:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  right:'<path d="M9 6l6 6-6 6"/>',
};
const ico = (n, cls = 'ico') => `<span class="${cls}"><svg viewBox="0 0 24 24">${ICON[n] || ICON.star}</svg></span>`;
const CAT_ICONS = ['sun','moon','pill','drop','leaf','brief','star','heart','book'];

/* ---------- data ---------- */
function defaultData() {
  const t = todayKey(), since = '2000-01-01';
  const h = (name, cat, days, extra = {}) => ({ id: uid(), name, cat, kind: 'check', created: since, sched: [{ from: since, days }], tag: '', notes: false, ...extra });
  return {
    v: 1,
    settings: {
      start: t,
      waterGoal: 2000, waterStretch: 3000, waterUnit: 'oz',
      servings: [{v:8,u:'oz'},{v:12,u:'oz'},{v:16,u:'oz'},{v:20,u:'oz'},{v:500,u:'ml'},{v:1000,u:'ml'}],
      stepGoal: 8000, stepStretch: 10000,
      streakPct: 70,
      shortcutName: 'Log Steps',
      plan: {
        0: { label: 'Gentle movement or rest', type: 'Gentle', rest: true },
        1: { label: 'Gym — strength + cardio', type: 'Gym', rest: false },
        2: { label: 'Walking + mobility', type: 'Walk', rest: false },
        3: { label: 'Gym — strength + cardio', type: 'Gym', rest: false },
        4: { label: 'Yoga, hiking, walking, or mobility', type: 'Yoga', rest: false },
        5: { label: 'Gym — strength + cardio', type: 'Gym', rest: false },
        6: { label: 'Flexible outdoor activity', type: 'Outdoor', rest: false },
      },
      activityTypes: ['Gym','Strength','Cardio','Walk','Mobility','Yoga','Hike','Outdoor','Gentle','Other'],
      lastBackup: null,
    },
    cats: [
      { id: 'am', name: 'Morning Hygiene & Skincare', short: 'Morning', icon: 'sun' },
      { id: 'pm', name: 'Evening Hygiene & Skincare', short: 'Evening', icon: 'moon' },
      { id: 'supp', name: 'Supplements', short: 'Supplements', icon: 'pill' },
      { id: 'water', name: 'Hydration', short: 'Hydration', icon: 'drop' },
      { id: 'move', name: 'Movement & Steps', short: 'Movement', icon: 'leaf' },
      { id: 'biz', name: 'Business', short: 'Business', icon: 'brief' },
    ],
    habits: [
      h('Brush teeth', 'am', ALL),
      h('Gentle cleanser', 'am', ALL),
      h('Vitamin C serum', 'am', ALL),
      h('Moisturizer', 'am', ALL),
      h('Sunscreen', 'am', ALL),
      h('Brush teeth', 'pm', ALL),
      h('Floss', 'pm', ALL),
      h('First cleanse', 'pm', ALL, { hint: 'Removes makeup, sunscreen and buildup' }),
      h('Second cleanse', 'pm', ALL, { hint: 'Gentle facial cleanser' }),
      h('Retinoid', 'pm', [1, 4]),
      h('Moisturizer', 'pm', ALL),
      h('Aquaphor', 'pm', ALL, { id: 'aquaphor' }),
      h('Electrolytes', 'supp', ALL, { tag: 'Morning' }),
      h('Creatine', 'supp', ALL, { tag: 'Morning' }),
      h('Omega-3 fish oil', 'supp', ALL, { tag: 'Afternoon' }),
      h('Multivitamin', 'supp', ALL, { tag: 'Afternoon' }),
      h('Magnesium', 'supp', ALL, { tag: 'Evening' }),
      { id: 'water', name: 'Drank 2–3 L of water', cat: 'water', kind: 'check', created: since, sched: [{ from: since, days: ALL }], tag: '', notes: false },
      { id: 'movement', name: 'Planned movement', cat: 'move', kind: 'movement', created: since, sched: [{ from: since, days: ALL }], tag: '', notes: false },
      { id: 'steps', name: 'Walked 8,000–10,000 steps', cat: 'move', kind: 'check', created: since, sched: [{ from: since, days: ALL }], tag: '', notes: false },
      h('Worked on my business', 'biz', WEEKDAYS, { id: 'biz-own', notes: true, hint: 'Business development, marketing MMC, website, offerings, networking, strategy' }),
      h('Worked on client projects', 'biz', WEEKDAYS, { id: 'biz-client', notes: true, hint: 'Climbing Realty and other clients' }),
    ],
    days: {},
  };
}

let fresh = false;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.habits && d.days) return migrate(d); }
  } catch (e) { console.warn(e); }
  fresh = true;
  const d = defaultData(); d.savedAt = 0; return d;
}
/* second copy in IndexedDB, in case localStorage is cleared */
const idb = (() => {
  let p = null;
  const open = () => p || (p = new Promise((res, rej) => {
    try { const r = indexedDB.open('habits', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); }
  }));
  return {
    get: () => open().then(db => new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(KEY); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })),
    set: v => open().then(db => new Promise((res, rej) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, KEY); t.oncomplete = res; t.onerror = () => rej(t.error); })),
  };
})();
function migrate(d) {
  const def = defaultData();
  d.settings = Object.assign({}, def.settings, d.settings || {});
  d.settings.plan = Object.assign({}, def.settings.plan, d.settings.plan || {});
  d.cats = d.cats || def.cats;
  // one-time rename of product names (2026-11-11)
  if (!d.renamed1) {
    const ren = { 'La Roche-Posay moisturizer': 'Moisturizer', 'EltaMD UV AOX SPF 50': 'Sunscreen', 'Differin 0.1% adapalene': 'Retinoid' };
    for (const h of d.habits) if (ren[h.name]) h.name = ren[h.name];
    d.renamed1 = true;
  }
  if (!d.renamed2) {
    const ren = { 'Ultima electrolytes': 'Electrolytes', 'GNC creatine': 'Creatine' };
    for (const h of d.habits) if (ren[h.name]) h.name = ren[h.name];
    d.renamed2 = true;
  }
  if (!d.tweak3) {
    // Aquaphor after evening moisturizer; creatine moves to morning (2026-11-11)
    if (!d.habits.some(h => h.id === 'aquaphor' || (h.cat === 'pm' && h.name === 'Aquaphor'))) {
      const aq = { id: 'aquaphor', name: 'Aquaphor', cat: 'pm', kind: 'check', created: '2026-11-11', sched: [{ from: '2026-11-11', days: ALL }], tag: '', notes: false };
      const i = d.habits.findIndex(h => h.cat === 'pm' && h.name === 'Moisturizer');
      const last = d.habits.map(h => h.cat).lastIndexOf('pm');
      d.habits.splice(i >= 0 ? i + 1 : last + 1, 0, aq);
    }
    const cr = d.habits.find(h => h.cat === 'supp' && h.name === 'Creatine');
    if (cr) {
      cr.tag = 'Morning';
      const el = d.habits.find(h => h.cat === 'supp' && h.name === 'Electrolytes');
      if (el) { d.habits.splice(d.habits.indexOf(cr), 1); d.habits.splice(d.habits.indexOf(el) + 1, 0, cr); }
    }
    d.tweak3 = true;
  }
  // v2: water and steps are simple check-offs ("hit my goal")
  for (const h of d.habits) {
    if (h.kind !== 'water' && h.kind !== 'steps') continue;
    const kind = h.kind; h.kind = 'check';
    if (kind === 'water' && h.name === 'Water goal') h.name = 'Drank 2–3 L of water';
    if (kind === 'steps' && h.name === 'Step goal') h.name = 'Walked 8,000–10,000 steps';
    for (const k in d.days) {
      const day = d.days[k]; if (!day) continue; day.h = day.h || {};
      if (day.h[h.id]) continue;
      const met = kind === 'water' ? (day.water || []).reduce((a, b) => a + b, 0) >= (d.settings.waterGoal || 2000) : (day.steps != null && day.steps >= (d.settings.stepGoal || 8000));
      if (met) day.h[h.id] = 'done';
    }
  }
  return d;
}
let S = load();
let memo = new Map();
const cfgStr = () => JSON.stringify([S.cats, S.habits, S.settings]);
let lastCfg = cfgStr();
function saveLocal() {
  memo = new Map();
  lastCfg = cfgStr();
  const json = JSON.stringify(S);
  try { localStorage.setItem(KEY, json); }
  catch (e) { toast('Couldn’t save. Storage may be full. Export a backup.'); }
  idb.set(json).catch(() => {});
}
function save(initial) {
  if (!initial) { S.savedAt = Date.now(); if (cfgStr() !== lastCfg) S.cfgU = Date.now(); }
  saveLocal();
  if (!initial) scheduleSync();
}
save(true);
idb.get().then(raw => {
  if (!raw) return;
  const d = JSON.parse(raw);
  if (d && d.habits && d.days && (fresh || (d.savedAt || 0) > (S.savedAt || 0))) { S = migrate(d); save(true); render(); }
}).catch(() => {});
window.addEventListener('pagehide', () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} });
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ---------- sync between devices (private GitHub gist) ---------- */
const SYNC_KEY = 'habits.sync', GIST_FILE = 'habits-data.json', GIST_DESC = 'Habits app sync (private)';
let sync = (() => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } })();
let syncState = sync.token ? 'idle' : 'off', syncBusy = false, syncAgain = false, syncTimer = null;
const saveSync = () => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) {} };
function scheduleSync(delay = 1200) { if (!sync.token || !sync.gistId) return; clearTimeout(syncTimer); syncTimer = setTimeout(runSync, delay); }
async function ghApi(path, opts = {}) {
  const r = await fetch('https://api.github.com' + path, { ...opts, cache: 'no-store', headers: { Authorization: 'Bearer ' + sync.token, Accept: 'application/vnd.github+json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
  if (r.status === 401 || r.status === 403) { const e = new Error('auth'); e.auth = true; throw e; }
  if (r.status === 404) { const e = new Error('missing'); e.missing = true; throw e; }
  if (!r.ok) throw new Error('http ' + r.status);
  return r.status === 204 ? null : r.json();
}
async function readGist() {
  const g = await ghApi('/gists/' + sync.gistId);
  const f = g.files && g.files[GIST_FILE]; if (!f) return null;
  let c = f.content;
  if (f.truncated) c = await fetch(f.raw_url, { cache: 'no-store' }).then(r => r.text());
  return JSON.parse(c);
}
const writeGist = () => ghApi('/gists/' + sync.gistId, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(S) } } }) });
function syncMerge(r) {
  r = migrate(r);
  let changed = false, ahead = false;
  if ((r.cfgU || 0) > (S.cfgU || 0)) { S.cats = r.cats; S.habits = r.habits; S.settings = r.settings; S.cfgU = r.cfgU; changed = true; }
  else if ((S.cfgU || 0) > (r.cfgU || 0)) ahead = true;
  for (const k of new Set([...Object.keys(S.days), ...Object.keys(r.days)])) {
    const a = S.days[k], b = r.days[k];
    if (b && (!a || (b.u || 0) > (a.u || 0))) { S.days[k] = b; changed = true; }
    else if (a && (!b || (a.u || 0) > (b.u || 0))) ahead = true;
  }
  return { changed, ahead };
}
let shownSyncState = null;
function setSyncState(st) {
  syncState = st;
  const el = document.getElementById('syncline'); if (el) el.outerHTML = syncLine();
  if (view === 'settings' && st !== 'syncing' && st !== shownSyncState && !(document.activeElement && document.activeElement.matches('input,textarea,select'))) render();
}
async function runSync() {
  if (!sync.token || !sync.gistId) return;
  if (syncBusy) { syncAgain = true; return; }
  syncBusy = true; setSyncState('syncing');
  try {
    const remote = await readGist();
    let push = !remote;
    if (remote) { const res = syncMerge(remote); if (res.changed) { saveLocal(); render(); } push = res.ahead; }
    if (push) await writeGist();
    sync.last = Date.now(); saveSync(); setSyncState('ok');
  } catch (e) {
    setSyncState(e.auth ? 'auth' : e.missing ? 'missing' : 'offline');
  }
  syncBusy = false;
  if (syncAgain) { syncAgain = false; scheduleSync(200); }
}
async function connectSync(token) {
  const prev = { ...sync };
  sync = { token: token.trim() };
  try {
    const list = await ghApi('/gists?per_page=100');
    const g = list.find(x => x.description === GIST_DESC && x.files && x.files[GIST_FILE]);
    if (g) {
      sync.gistId = g.id;
      const remote = await readGist();
      if (remote && remote.habits && remote.days) { const local = S; S = migrate(remote); mergeData(local); S.cfgU = Date.now(); saveLocal(); }
      await writeGist();
    } else {
      const c = await ghApi('/gists', { method: 'POST', body: JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: JSON.stringify(S) } } }) });
      sync.gistId = c.id;
    }
    sync.last = Date.now(); saveSync(); syncState = 'ok'; return true;
  } catch (e) {
    sync = prev; saveSync(); syncState = sync.token ? 'idle' : 'off';
    toast(e.auth ? 'GitHub didn’t accept that token. Make sure “gist” was checked.' : 'Couldn’t reach GitHub. Check your connection and try again.');
    return false;
  }
}
function syncLine() {
  const t = sync.last ? new Date(sync.last).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  const msg = { off: '<button class="brass" data-a="syncsetup">Turn on sync</button> to keep your Mac and iPhone in step', idle: 'Sync on', syncing: 'Syncing…', ok: `Synced across your devices${t ? ' · ' + t : ''}`, offline: 'Offline. Changes are saved here and will sync when you’re back online', auth: '<button class="brass" data-a="syncsetup">Sync needs a new token</button>', missing: '<button class="brass" data-a="syncsetup">Sync needs to be set up again</button>' }[syncState];
  return `<div id="syncline" class="center small faint" style="margin:14px 0 0">${msg}</div>`;
}

const getDay = (k, create) => {
  let d = S.days[k];
  if (!d && create) d = S.days[k] = { h: {}, n: {}, water: [], steps: null, mv: {}, away: false };
  if (d && create) d.u = Date.now();
  if (d) { d.h = d.h || {}; d.n = d.n || {}; d.water = d.water || []; d.mv = d.mv || {}; }
  return d;
};
const habit = id => S.habits.find(h => h.id === id);
const cat = id => S.cats.find(c => c.id === id);
const waterTotal = d => d && d.water ? d.water.reduce((a, b) => a + b, 0) : 0;
function startKey() {
  if (memo.has('start')) return memo.get('start');
  let s = S.settings.start || todayKey();
  for (const k in S.days) if (k < s) s = k;
  memo.set('start', s); return s;
}

/* ---------- scheduling & scoring ---------- */
function schedDays(h, k) {
  let days = h.sched[0].days;
  for (const e of h.sched) { if (e.from <= k) days = e.days; else break; }
  return days;
}
const isPaused = h => schedDays(h, todayKey()).length === 0 && h.paused;
function applicable(h, k) { return k >= h.created; }

function evalItem(h, k, day) {
  if (!applicable(h, k)) return null;
  const dow = dowOf(k);
  const sched = schedDays(h, k).includes(dow);
  const st = day && day.h ? day.h[h.id] : undefined;
  let credit = 0, status = 'none', neutral = false;
  if (h.kind === 'check') {
    if (st === 'done') { credit = 1; status = 'done'; }
    else if (st === 'partial') { credit = .5; status = 'partial'; }
  } else if (h.kind === 'water') {
    const ml = waterTotal(day);
    credit = Math.min(1, ml / S.settings.waterGoal);
    status = credit >= 1 ? 'done' : ml > 0 ? 'partial' : 'none';
  } else if (h.kind === 'steps') {
    const s = day && day.steps;
    if (s != null) { credit = Math.min(1, s / S.settings.stepGoal); status = credit >= 1 ? 'done' : s > 0 ? 'partial' : 'none'; }
  } else if (h.kind === 'movement') {
    if (st === 'done') { credit = 1; status = 'done'; }
    else if (st === 'rest') {
      status = 'rest';
      if (S.settings.plan[dow] && S.settings.plan[dow].rest) credit = 1; else neutral = true;
    }
  }
  if (st === 'skip') { status = 'skip'; credit = 0; neutral = true; }
  const away = !!(day && day.away);
  const counted = sched && !away && !neutral;
  return { sched, status, credit, counted, bonus: !sched && credit > 0 };
}

function dayScore(k, catId) {
  const mk = 'd' + k + (catId || '');
  if (memo.has(mk)) return memo.get(mk);
  const day = S.days[k];
  let c = 0, n = 0;
  let res;
  if (day && day.away) res = { pct: null, c: 0, n: 0, away: true };
  else {
    for (const h of S.habits) {
      if (catId && h.cat !== catId) continue;
      const r = evalItem(h, k, day);
      if (r && r.counted) { n++; c += r.credit; }
    }
    res = { pct: n ? c / n : null, c, n };
  }
  memo.set(mk, res); return res;
}

function pastKeys(n) { // excludes today
  const t = todayKey(), s = startKey();
  let from = n === 'all' ? s : addDays(t, -n);
  if (from < s) from = s;
  const out = [];
  for (let k = from; k < t; k = addDays(k, 1)) out.push(k);
  return out;
}
function keysBack(n, includeToday = true) {
  const t = todayKey(), out = [];
  for (let i = n - 1; i >= (includeToday ? 0 : 1); i--) out.push(addDays(t, -i));
  return out;
}
function pooled(keys, catId) {
  let c = 0, n = 0;
  for (const k of keys) { const s = dayScore(k, catId); c += s.c; n += s.n; }
  return { rate: n ? c / n : null, n };
}
function habitStats(h, keys) {
  let c = 0, n = 0, done = 0, bonus = 0;
  for (const k of keys) {
    const r = evalItem(h, k, S.days[k]);
    if (!r) continue;
    if (r.counted) { n++; c += r.credit; if (r.credit >= 1) done++; }
    else if (r.bonus) bonus++;
  }
  return { rate: n ? c / n : null, n, done, bonus };
}
function streak(fn) {
  const t = todayKey(), s = startKey();
  const val = k => { const r = fn(k); return (k === t && r === false) ? null : r; };
  let cur = 0;
  for (let k = t; k >= s; k = addDays(k, -1)) { const r = val(k); if (r === false) break; if (r === true) cur++; }
  let best = 0, run = 0;
  for (let k = s; k <= t; k = addDays(k, 1)) { const r = val(k); if (r === true) { run++; if (run > best) best = run; } else if (r === false) run = 0; }
  return { cur, best };
}
const thr = () => S.settings.streakPct / 100;
function dayOK(k, catId) { const s = dayScore(k, catId); if (s.away || s.pct == null) return null; return s.pct >= thr() - 1e-9; }
function habitOK(h) {
  return k => {
    const r = evalItem(h, k, S.days[k]);
    if (!r) return null;
    const need = (h.kind === 'water' || h.kind === 'steps') ? 1 : .5;
    if (r.counted) return r.credit >= need;
    if (r.bonus && r.credit >= need) return true;
    return null;
  };
}
function overallStreak() { const k = 'streak'; if (!memo.has(k)) memo.set(k, streak(k2 => dayOK(k2))); return memo.get(k); }

/* ---------- state ---------- */
let view = 'today', cur = todayKey(), range = 30, openCats = {}, sheetFn = null, awaitingSteps = false;

/* ---------- render: shell ---------- */
function render() {
  const y = window.scrollY;
  if (view === 'settings') shownSyncState = syncState;
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === view));
  $('#main').innerHTML = view === 'today' ? renderToday() : view === 'progress' ? renderProgress() : renderSettings();
  window.scrollTo(0, y);
  if (view === 'progress') { const w = $('.yearwrap'); if (w) w.scrollLeft = w.scrollWidth; }
  if (sheetFn) $('#sheet').innerHTML = '<div class="grab"></div>' + sheetFn();
}
function go(v) { view = v; render(); window.scrollTo(0, 0); }

/* ---------- Today ---------- */
function message(p, n) {
  if (n === 0) return 'Nothing scheduled. Enjoy the day.';
  if (p == null || p === 0) return 'Pick one easy win to start.';
  if (p < .34) return 'You’ve started. That’s the hardest part.';
  if (p < .67) return 'Nice momentum. Keep it easy.';
  if (p < 1) return 'Almost there, or call it a good day.';
  return 'Everything done. Thank you for showing up for you.';
}
function ring(p, size = 104, stroke = 9) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p || 0));
  return `<svg viewBox="0 0 ${size} ${size}"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0c389"/><stop offset="1" stop-color="#8a6d40"/></linearGradient></defs>
  <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#2f251d" stroke-width="${stroke}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - v)}" style="transition:stroke-dashoffset .5s ease"/></svg>`;
}
function renderToday() {
  const t = todayKey(), k = cur, day = getDay(k), sc = dayScore(k), isToday = k === t;
  const dsub = isToday ? 'Today' : daysBetween(k, t) === 1 ? 'Yesterday' : fmtDate(k, { year: 'numeric' });
  let html = `<div class="datebar">
    <button class="nav" data-a="prev" aria-label="Previous day">‹</button>
    <label class="datepick"><span class="dsub">${dsub}</span><span class="dl">${fmtDate(k, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
      <input type="date" data-f="date" max="${t}" value="${k}" aria-label="Pick a date"></label>
    <button class="nav" data-a="next" ${isToday ? 'disabled' : ''} aria-label="Next day">›</button></div>`;
  if (!isToday) html += `<div class="center" style="margin:6px 0 10px"><button class="pill brass" data-a="gotoday">Back to today</button> <span class="small faint">&nbsp;Editing a past day</span></div>`;
  else html += '<div style="height:10px"></div>';

  if (sc.away) {
    html += `<div class="banner">This is marked as a pause day (travel, recovery, appointments, life). Nothing here counts against you, and streaks stay safe.</div>`;
  } else {
    const st = overallStreak();
    html += `<section class="card hero"><div class="ring">${ring(sc.pct)}<div class="v"><span>${sc.pct == null ? '–' : Math.round(sc.pct * 100) + '<small>%</small>'}</span></div></div>
      <div><div class="msg">${message(sc.pct, sc.n)}</div>
      <div class="meta">${sc.n ? `${fullDone(k)} of ${sc.n} done` : ''}${st.cur ? ` · ${plural(st.cur, 'day')} consistent` : ''}</div></div></section>`;
  }

  for (const c of S.cats) {
    const hs = S.habits.filter(h => h.cat === c.id && applicable(h, k) && (schedDays(h, k).length || (day && day.h[h.id])));
    if (!hs.length) continue;
    const items = hs.map(h => ({ h, r: evalItem(h, k, day) }));
    const sched = items.filter(x => x.r.sched || x.h.kind !== 'check');
    const extra = items.filter(x => !x.r.sched && x.h.kind === 'check');
    const counted = items.filter(x => x.r.counted);
    const done = counted.reduce((a, x) => a + x.r.credit, 0), full = counted.filter(x => x.r.credit >= 1).length;
    const allDone = counted.length > 0 && counted.every(x => x.r.credit >= 1);
    const closed = openCats[c.id] === undefined ? (allDone && !sc.away) : !openCats[c.id];
    if (!sched.length && !extra.some(x => x.r.status !== 'none')) {
      // nothing scheduled in this category: show compact
    }
    html += `<section class="card cat ${closed ? 'closed' : ''} ${allDone ? 'alldone' : ''}">
      <button class="cat-h" data-a="togglecat" data-c="${c.id}">${ico(c.icon)}
        <div class="t"><h3>${esc(c.short || c.name)}</h3>${counted.length ? `<div class="minibar"><i style="width:${done / counted.length * 100}%"></i></div>` : ''}</div>
        <span class="cnt">${allDone ? 'All done' : counted.length ? `${full}/${counted.length}` : 'Optional'}</span>${ico('chev', 'ico chev')}</button>`;
    html += `<div class="cat-b">`;
    const checks = sched.filter(x => x.h.kind === 'check');
    if (checks.length) html += `<ul class="hl">${checks.map(x => row(x.h, x.r, k)).join('')}</ul>`;
    for (const x of sched) {
      if (x.h.kind === 'water') html += waterWidget(x.h, x.r, k, day);
      if (x.h.kind === 'movement') html += moveWidget(x.h, x.r, k, day);
      if (x.h.kind === 'steps') html += stepsWidget(x.h, x.r, k, day);
    }
    if (extra.length) html += `<div class="extra-h">${checks.length ? 'Not scheduled today' : 'Not scheduled today, tap if you did it anyway'}</div><ul class="hl">${extra.map(x => row(x.h, x.r, k, true)).join('')}</ul>`;
    html += `</div></section>`;
  }
  html += `<section class="card pausecard"><button class="row" style="width:100%;text-align:left" data-a="away">
      <div class="grow"><b style="font-weight:500">Pause day</b><div class="small muted">Travel, sick, recovery or a day off. Nothing counts as missed.</div></div>
      <span class="switch ${day && day.away ? 'on' : ''}"></span></button></section>` + syncLine();
  return html;
}
const fullDone = k => { const day = S.days[k]; return S.habits.filter(h => { const r = evalItem(h, k, day); return r && r.counted && r.credit >= 1; }).length; };
const fmtNum1 = n => Number.isInteger(n) ? n : n.toFixed(1);
function statusText(h, r, k) {
  if (r.status === 'partial') return 'Partly done';
  if (r.status === 'skip') return 'Skipped on purpose';
  return '';
}
function row(h, r, k, extra) {
  const day = S.days[k], note = day && day.n[h.id];
  const sub = [h.tag ? `<span class="tag">${esc(h.tag)}</span>` : '', statusText(h, r, k) || esc(h.hint || '')].join('');
  return `<li class="hr s-${r.status} ${extra ? 'extra' : ''}">
    <button class="hm" data-a="tap" data-h="${h.id}"><span class="ck"><svg viewBox="0 0 24 24">${ICON.check}</svg></span>
      <span class="hn"><b>${esc(h.name)}</b>${sub ? `<small>${sub}</small>` : ''}</span></button>
    <button class="hmore" data-a="more" data-h="${h.id}" aria-label="More options">${ico('dots')}</button></li>
    ${note ? `<div class="note-prev">“${esc(note)}”</div>` : (h.notes && r.status === 'done' ? `<div class="note-prev"><button class="small brass" data-a="more" data-h="${h.id}">+ Add a note (optional)</button></div>` : '')}`;
}
function fmtWater(ml) {
  const oz = ml / ML_PER_OZ;
  return { oz: (Math.round(oz * 10) / 10).toLocaleString('en-US') + ' oz', ml: num(ml) + ' ml', l: (ml / 1000).toFixed(2).replace(/\.?0+$/, '') + ' L' };
}
const servingMl = s => s.u === 'oz' ? s.v * ML_PER_OZ : s.v;
const servingLabel = s => s.u === 'oz' ? `${s.v} oz` : (s.v >= 1000 ? `${s.v / 1000} L` : `${s.v} ml`);
function goalLabel() {
  const g = S.settings.waterGoal, x = S.settings.waterStretch;
  if (S.settings.waterUnit === 'oz') return `${Math.round(g / ML_PER_OZ)}–${Math.round(x / ML_PER_OZ)} oz`;
  return `${g / 1000}–${x / 1000} L`;
}
function waterWidget(h, r, k, day) {
  const ml = waterTotal(day), f = fmtWater(ml), g = S.settings.waterGoal, x = Math.max(S.settings.waterStretch, g);
  const main = S.settings.waterUnit === 'oz' ? f.oz : f.ml;
  const alt = S.settings.waterUnit === 'oz' ? `${f.ml} · ${f.l}` : `${f.oz} · ${f.l}`;
  const msg = ml >= x ? 'Stretch goal reached' : ml >= g ? 'Goal reached' : ml ? `${S.settings.waterUnit === 'oz' ? Math.ceil((g - ml) / ML_PER_OZ) + ' oz' : num(g - ml) + ' ml'} to your goal` : 'Tap a glass to log water';
  return `<div class="widget">
    <div class="row between"><div><div class="big">${main}</div><div class="small muted">${alt}</div></div>
    <div class="small ${ml >= g ? 'brass' : 'muted'}" style="text-align:right">${msg}<br><span class="faint">Goal ${goalLabel()}</span></div></div>
    <div class="track"><i style="width:${Math.min(100, ml / x * 100)}%"></i><span class="mk" style="left:${g / x * 100}%"></span></div>
    <div class="tlabels"><span>0</span><span style="margin-left:${g / x * 100 - 18}%">${S.settings.waterUnit === 'oz' ? Math.round(g / ML_PER_OZ) + ' oz' : g / 1000 + ' L'}</span><span>${S.settings.waterUnit === 'oz' ? Math.round(x / ML_PER_OZ) + ' oz' : x / 1000 + ' L'}</span></div>
    <div class="chips">${S.settings.servings.map((s, i) => `<button class="chip water" data-a="water" data-i="${i}">+ ${servingLabel(s)}</button>`).join('')}
      <button class="chip ghost" data-a="watercustom">Custom</button>
      ${day && day.water.length ? `<button class="chip ghost" data-a="waterundo">Undo last</button>` : ''}</div></div>`;
}
function moveWidget(h, r, k, day) {
  const dow = dowOf(k), plan = S.settings.plan[dow] || { label: '' }, st = day && day.h.movement, mv = (day && day.mv) || {};
  const types = S.settings.activityTypes;
  const sel = mv.type || '';
  const mins = [15, 20, 30, 45, 60];
  let sub = '';
  if (st === 'rest') sub = plan.rest ? 'Rest is part of today’s plan, so this counts.' : 'Intentional rest. It won’t count against you.';
  else if (st === 'skip') sub = 'Skipped on purpose. No penalty.';
  return `<div class="widget">
    <div class="plan"><div><div class="wt">${DOWL[dow]}’s plan</div><b>${esc(plan.label || 'Anything that feels good')}</b></div></div>
    <div class="seg">
      <button class="${st === 'done' ? 'on good' : ''}" data-a="mv" data-v="done">I moved</button>
      <button class="${st === 'rest' ? 'on' : ''}" data-a="mv" data-v="rest">Rest day</button>
      <button class="${st === 'skip' ? 'on' : ''}" data-a="mv" data-v="skip">Not today</button></div>
    ${sub ? `<div class="small muted" style="margin-top:8px">${sub}</div>` : ''}
    ${st === 'done' ? `<div class="chips"><button class="chip ${mv.lighter ? 'on' : ''}" data-a="mvlighter">Shorter or lighter version${mv.lighter ? ' ✓' : ''}</button></div>
      <div class="small faint" style="margin-top:6px">Swapped or shortened workouts still count as done.</div>` : ''}
    ${st === 'done' ? `<span class="lbl">Activity</span>
    <div class="chips" style="margin-top:0">${types.map(t => `<button class="chip ${sel === t ? 'on' : ''}" data-a="mvtype" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>
    <span class="lbl">Minutes</span>
    <div class="row wrap" style="gap:8px">${mins.map(m => `<button class="chip ${mv.min === m ? 'on' : ''}" data-a="mvmin" data-v="${m}">${m}</button>`).join('')}
      <input class="inp" style="width:90px" type="number" inputmode="numeric" min="0" placeholder="Other" data-f="mvmin" value="${mv.min && !mins.includes(mv.min) ? mv.min : ''}"></div>
    <span class="lbl">Notes (optional)</span>
    <textarea class="inp" data-f="mvnote" placeholder="How it went, what you did…">${esc(mv.note || '')}</textarea>` : `<div class="small faint" style="margin-top:10px">Tap “I moved” to add the activity, minutes and notes.</div>`}
    <div class="row between" style="margin-top:14px"><div><b style="font-weight:500">Extra walks & movement breaks</b><div class="small muted">Bonus, never required</div></div>
      <div class="stepper"><button data-a="extra" data-v="-1" aria-label="Fewer">−</button><b>${mv.extra || 0}</b><button data-a="extra" data-v="1" aria-label="More">+</button></div></div>
  </div>`;
}
function stepsWidget(h, r, k, day) {
  const s = day && day.steps, g = S.settings.stepGoal, x = Math.max(S.settings.stepStretch, g);
  const msg = s == null ? 'Not logged yet' : s >= x ? 'Stretch goal reached' : s >= g ? 'Goal reached' : `${num(g - s)} to go`;
  return `<div class="widget">
    <div class="row between"><div><div class="wt">Steps</div><div class="big">${s == null ? '—' : num(s)}</div></div>
      <div class="small ${s >= g ? 'brass' : 'muted'}" style="text-align:right">${msg}<br><span class="faint">Goal ${num(g)}–${num(x)}</span>${day && day.stepsSrc ? `<br><span class="faint">From ${esc(day.stepsSrc)}</span>` : ''}</div></div>
    <div class="track st"><i style="width:${Math.min(100, (s || 0) / x * 100)}%"></i><span class="mk" style="left:${g / x * 100}%"></span></div>
    <div class="row" style="margin-top:12px"><input class="inp grow" type="number" inputmode="numeric" min="0" placeholder="Type today’s steps" data-f="steps" value="${s ?? ''}">
      </div>
    <div class="row wrap" style="margin-top:10px;gap:8px">
      ${k === todayKey() ? `<button class="chip on" data-a="stepsync">Get from Apple Health</button>` : ''}
      <button class="chip" data-a="steppaste">Paste</button>
      <button class="chip ghost" data-a="stephelp">How this works</button></div>
    ${awaitingSteps && k === todayKey() ? `<div class="banner brass" style="margin:12px 0 0">Back from Shortcuts? Tap <b>Paste</b> to drop in your steps.</div>` : ''}
  </div>`;
}

/* ---------- Progress ---------- */
const LEVELS = ['var(--h1)', 'var(--h2)', 'var(--h3)', 'var(--h4)', 'var(--h5)'];
function heatColor(p) {
  if (p == null) return 'var(--h0)';
  if (p <= 0) return 'var(--h0)';
  return LEVELS[Math.min(4, Math.floor(p * 4.999))];
}
function cellInfo(k) {
  const t = todayKey(), s = startKey();
  if (k > t) return { cls: 'fut', bg: '' };
  const sc = dayScore(k);
  if (sc.away) return { cls: 'away', bg: '' };
  if (k < s && !S.days[k]) return { cls: 'empty', bg: '' };
  return { cls: k === t ? 'today' : '', bg: heatColor(sc.pct), p: sc.pct };
}
function monthHeat() {
  const t = todayKey();
  const end = addDays(t, 6 - dowOf(t));
  const start = addDays(end, -34);
  let html = `<div class="cal">${DOW.map(d => `<div class="dh">${d[0]}</div>`).join('')}`;
  for (let k = start; k <= end; k = addDays(k, 1)) {
    const c = cellInfo(k);
    html += `<button class="c ${c.cls}" ${c.cls === 'fut' ? 'disabled' : `data-a="daydetail" data-k="${k}"`} style="${c.bg ? `background:${c.bg}` : ''}" aria-label="${fmtDate(k, { month: 'short', day: 'numeric' })}">${parseKey(k).getDate()}</button>`;
  }
  return html + '</div>' + legend();
}
function legend() {
  return `<div class="legend">Less ${['var(--h0)', ...LEVELS].map(c => `<i style="background:${c}"></i>`).join('')} More &nbsp;<i style="background:#3a332c"></i> Pause</div>`;
}
function yearHeat() {
  const t = todayKey();
  const end = addDays(t, 6 - dowOf(t));
  const start = addDays(end, -7 * 53 + 1);
  let html = '<div class="yearwrap"><div class="year">';
  let col = 0;
  for (let w = start; w <= end; w = addDays(w, 7)) {
    col++;
    for (let i = 0; i < 7; i++) {
      const dk = addDays(w, i);
      if (parseKey(dk).getDate() === 1 && col < 53) { html += `<span class="m" style="grid-column:${col}/span 3">${fmtDate(dk, { month: 'short' })}</span>`; break; }
    }
    for (let i = 0; i < 7; i++) {
      const k = addDays(w, i), c = cellInfo(k);
      html += `<button class="y ${c.cls}" style="grid-column:${col};grid-row:${i + 2};${c.bg ? `background:${c.bg}` : ''}" ${c.cls === 'fut' ? 'disabled' : `data-a="daydetail" data-k="${k}"`}></button>`;
    }
  }
  return html + '</div></div>' + legend();
}
function bars(series, { h = 120, goal = null, labels = [], fmt = v => v, colors = ['var(--brass)'], max = null, labelEvery = 1 } = {}) {
  const W = 340, H = h, n = series[0].length, groups = series.length;
  const all = series.flat().filter(v => v != null);
  const m = max || Math.max(goal || 0, ...all, 1) * 1.12;
  const bw = W / n;
  let g = '';
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < groups; s++) {
      const v = series[s][i];
      const inner = bw * .72, w = inner / groups, x = i * bw + (bw - inner) / 2 + s * w;
      if (v == null) continue;
      const bh = Math.max(v > 0 ? 2 : 0, v / m * (H - 6));
      g += `<rect x="${x.toFixed(1)}" y="${(H - bh).toFixed(1)}" width="${Math.max(1, w - (groups > 1 ? 1.5 : 0)).toFixed(1)}" height="${bh.toFixed(1)}" rx="${Math.min(3, w / 3).toFixed(1)}" fill="${colors[s]}"><title>${esc(labels[i] || '')}: ${esc(fmt(v))}</title></rect>`;
    }
    if (labels[i] && (n - 1 - i) % labelEvery === 0) g += `<text x="${(i * bw + bw / 2).toFixed(1)}" y="${H + 13}" text-anchor="middle">${esc(labels[i])}</text>`;
  }
  let gl = '';
  if (goal) { const y = H - goal / m * (H - 6); gl = `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--cream)" stroke-opacity=".45" stroke-dasharray="3 4"/><text x="${W}" y="${y - 4}" text-anchor="end">${esc(fmt(goal))}</text>`; }
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 18}"><line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--line)"/>${g}${gl}</svg>`;
}
function weekStarts(n) { // Monday-based weeks, oldest first
  const t = todayKey(); const off = (dowOf(t) + 6) % 7; const thisMon = addDays(t, -off);
  const out = []; for (let i = n - 1; i >= 0; i--) out.push(addDays(thisMon, -7 * i)); return out;
}
const weekKeys = mon => { const t = todayKey(), out = []; for (let i = 0; i < 7; i++) { const k = addDays(mon, i); if (k <= t) out.push(k); } return out; };
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

function insights() {
  const out = [], t = todayKey(), s = startKey();
  const tracked = daysBetween(s, t);
  const last7 = keysBack(7).filter(k => k >= s);
  const completedDays = (keys, catId) => keys.filter(k => { const d = dayScore(k, catId); return d.n > 0 && d.c >= d.n - 1e-9; });
  const eligible = (keys, catId) => keys.filter(k => { const d = dayScore(k, catId); return d.n > 0 && (k !== t || d.c >= d.n - 1e-9); });
  if (tracked >= 2) {
    for (const [id, label] of [['am', 'morning skincare routine'], ['pm', 'evening routine'], ['supp', 'supplements']]) {
      if (!cat(id)) continue;
      const el = eligible(last7, id), done = completedDays(last7, id);
      if (el.length >= 3) out.push({ t: id === 'supp' ? `You took all your supplements ${done.length} of the last ${el.length} days.` : `You completed your full ${label} ${done.length} of the last ${el.length} days.`, tone: done.length / el.length >= .7 ? 'good' : '' });
    }
  }
  const p30 = pastKeys(30);
  const wh = habit('water');
  if (wh && p30.length >= 5) {
    const st = p30.map(k => evalItem(wh, k, S.days[k])).filter(r => r && r.counted);
    if (st.length >= 5) { const met = st.filter(r => r.credit >= 1).length; out.push({ t: `You reached your water goal on ${Math.round(met / st.length * 100)}% of the past ${st.length} days.`, tone: met / st.length >= .7 ? 'good' : '' }); }
  }
  const sh = habit('steps');
  if (sh && p30.length >= 5) {
    const st = p30.map(k => evalItem(sh, k, S.days[k])).filter(r => r && r.counted);
    if (st.length >= 5) { const met = st.filter(r => r.credit >= 1).length; out.push({ t: `You hit your step goal on ${met} of the past ${st.length} days.`, tone: met / st.length >= .6 ? 'good' : '' }); }
    const r2 = (from, to) => { const ks = []; for (let i = from; i > to; i--) ks.push(addDays(t, -i)); return habitStats(sh, ks.filter(k => k >= startKey())).rate; };
    const now = r2(30, 0), before = r2(60, 30);
    if (now != null && before != null && pastKeys(60).length >= 45 && now - before >= .15) out.push({ t: 'You’re hitting your step goal more often than the month before.', tone: 'good' });
  }
  const mon = weekStarts(1)[0], wk = weekKeys(mon);
  const bizDone = id => wk.filter(k => S.days[k] && S.days[k].h[id] === 'done').length;
  if (habit('biz-own') && wk.length >= 2) {
    const n = bizDone('biz-own');
    out.push({ t: n ? `You worked on your own business ${plural(n, 'day')} this week.` : `No business-building days logged yet this week. Even 15 minutes counts.`, tone: n >= 3 ? 'good' : n ? '' : 'gentle' });
  }
  const mv = habit('movement');
  if (mv && wk.length >= 2) {
    const moved = wk.filter(k => S.days[k] && S.days[k].h.movement === 'done');
    const mins = moved.reduce((x, k) => x + (S.days[k].mv.min || 0), 0);
    if (moved.length) out.push({ t: `You moved on ${plural(moved.length, 'day')} this week${mins ? `, about ${mins} minutes in total` : ''}.`, tone: 'good' });
  }
  const ho = habit('biz-own'), hc = habit('biz-client');
  if (ho && hc && tracked >= 14) {
    const r = (h, from, to) => { const ks = []; for (let i = from; i > to; i--) ks.push(addDays(t, -i)); return habitStats(h, ks.filter(k => k >= s)).rate; };
    const o1 = r(ho, 14, 0), o0 = r(ho, 28, 14), c1 = r(hc, 14, 0), c0 = r(hc, 28, 14);
    if (o1 != null && o0 != null && c1 != null && c0 != null) {
      if (c1 >= .6 && o0 - o1 >= .2) out.push({ t: 'Client work has been consistent, but business development has dipped over the past two weeks.', tone: 'gentle' });
      else if (o1 >= .6 && c0 - c1 >= .2) out.push({ t: 'You’ve been investing in your own business, while client work has been lighter the past two weeks.', tone: 'gentle' });
      else if (o1 >= .6 && c1 >= .6) out.push({ t: 'You’re balancing business development and client work well over the past two weeks.', tone: 'good' });
      else if (o1 - o0 >= .2) out.push({ t: 'Business development is picking up compared with two weeks ago.', tone: 'good' });
    }
  }
  if (p30.length >= 7) {
    const rows = S.habits.filter(h => h.kind === 'check').map(h => ({ h, s: habitStats(h, p30) })).filter(x => x.s.n >= 5 && x.s.rate != null);
    rows.sort((x, y) => y.s.rate - x.s.rate);
    if (rows.length) {
      const best = rows[0];
      if (best.s.rate >= .7) out.push({ t: `Most consistent lately: ${best.h.name} (${pct(best.s.rate)}).`, tone: 'good' });
      const low = rows[rows.length - 1];
      if (low !== best && low.s.rate < .6) out.push({ t: `${low.h.name} has been the trickiest lately (${low.s.done} of ${low.s.n} days). Pairing it with something you already do can help.`, tone: 'gentle' });
    }
  }
  const st = overallStreak();
  if (st.cur >= 2) out.push({ t: `You’re on a ${st.cur}-day consistency streak${st.best > st.cur ? ` (your best is ${st.best})` : ' — your best yet'}.`, tone: 'good' });
  return out;
}

function renderProgress() {
  const t = todayKey(), s = startKey(), today = dayScore(t), st = overallStreak();
  const r7 = pooled(pastKeys(7)), r30 = pooled(pastKeys(30)), r90 = pooled(pastKeys(90)), rAll = pooled(pastKeys('all'));
  let html = `<h1 style="margin:6px 2px 16px">Progress</h1>`;
  const noHistory = !pastKeys('all').length;
  html += `<div class="tiles">
    <div class="tile"><div class="k">Today</div><div class="v">${today.away ? 'Pause' : pct(today.pct)}</div><div class="s">${today.n ? `${fullDone(t)} of ${today.n} done` : ''}</div></div>
    <div class="tile"><div class="k">Past 7 days</div><div class="v">${pct(r7.rate)}</div><div class="s">avg completion</div></div>
    <div class="tile"><div class="k">Past 30 days</div><div class="v">${pct(r30.rate)}</div><div class="s">avg completion</div></div>
    <div class="tile"><div class="k">Past 90 days</div><div class="v">${pct(r90.rate)}</div><div class="s">avg completion</div></div>
  </div>
  <div class="streaks">
    <div class="tile"><div class="k">Current streak</div><div class="v">${st.cur}<small> ${st.cur === 1 ? 'day' : 'days'}</small></div><div class="s">days at ${S.settings.streakPct}%+</div></div>
    <div class="tile"><div class="k">Longest streak</div><div class="v">${st.best}<small> ${st.best === 1 ? 'day' : 'days'}</small></div><div class="s">All time: ${pct(rAll.rate)}</div></div>
  </div>`;
  if (noHistory) html += `<div class="banner brass" style="margin-top:12px">Averages start filling in after your first full day. Today’s progress is above, and the heatmaps update as you go.</div>`;
  const dataDays = Object.keys(S.days).length;
  const lb = S.settings.lastBackup;
  if (dataDays >= 7 && (!lb || daysBetween(lb, t) > 30)) html += `<div class="banner brass" style="margin-top:12px">Your records live on this phone. <button class="brass" style="text-decoration:underline" data-a="exportjson">Save a backup to Files</button> ${lb ? `(last one ${fmtDate(lb, { month: 'short', day: 'numeric' })})` : ''}</div>`;

  const ins = insights();
  html += `<h2>Insights</h2><section class="card">${ins.length ? `<ul class="ins">${ins.map(i => `<li class="${i.tone}"><span class="dot"></span><span>${esc(i.t)}</span></li>`).join('')}</ul>` : `<div class="muted">Observations about your patterns appear here after a few days of check-ins.</div>`}</section>`;

  html += `<h2>Last 5 weeks</h2><section class="card">${monthHeat()}<div class="small faint" style="margin-top:6px">Tap a day to see what you did.</div></section>`;
  html += `<h2>Your year</h2><section class="card">${yearHeat()}</section>`;

  // weekly completion trend
  const ws = weekStarts(12);
  const wr = ws.map(m => { const ks = weekKeys(m).filter(k => k >= s && k < t); return ks.length ? pooled(ks).rate : null; });
  html += `<h2>Weekly completion</h2><section class="card">${bars([wr.map(v => v == null ? null : v * 100)], { max: 100, labels: ws.map(m => fmtDate(m, { month: 'numeric', day: 'numeric' })), fmt: v => Math.round(v) + '%', labelEvery: 3 })}<div class="small faint" style="margin-top:4px">Each bar is one week (Mon–Sun), today not included.</div></section>`;

  html += `<div class="ranges"><div class="seg">${[[7, '7D'], [30, '30D'], [90, '90D'], [365, '1Y'], ['all', 'All']].map(([v, l]) => `<button class="${range === v ? 'on' : ''}" data-a="range" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  const keys = pastKeys(range);
  const keysT = [...keys, t];
  const rl = range === 'all' ? 'all time' : range === 365 ? 'past year' : `past ${range} days`;

  // categories
  html += `<h2>By category <span class="small faint">· ${rl}</span></h2><section class="card">`;
  for (const c of S.cats) {
    const p = pooled(keys, c.id); if (!p.n) continue;
    const cs = streak(k => dayOK(k, c.id));
    html += `<div class="barrow"><span class="nm">${esc(c.short || c.name)}</span><span class="pc">${pct(p.rate)}</span><div class="minibar"><i style="width:${(p.rate || 0) * 100}%"></i></div><span class="sub">Streak ${cs.cur} · best ${cs.best}</span></div>`;
  }
  html += keys.length ? '' : `<div class="muted small">Comes alive after your first day.</div>`;
  html += `</section>`;

  // habits
  html += `<h2>Each habit</h2><section class="card">`;
  for (const c of S.cats) {
    const hs = S.habits.filter(h => h.cat === c.id);
    const rows = hs.map(h => ({ h, s: habitStats(h, keys), k: streak(habitOK(h)) })).filter(x => x.s.n || x.s.bonus || x.k.best);
    if (!rows.length) continue;
    html += `<div class="hgroup">${esc(c.short || c.name)}</div>`;
    for (const x of rows) html += `<div class="barrow"><span class="nm">${esc(x.h.name)}${x.h.tag ? ` <span class="faint small">· ${esc(x.h.tag)}</span>` : ''}</span><span class="pc">${pct(x.s.rate)}</span><div class="minibar"><i style="width:${(x.s.rate || 0) * 100}%"></i></div><span class="sub">${x.s.done} of ${x.s.n} scheduled days${x.s.bonus ? ` · +${x.s.bonus} extra` : ''} · streak ${x.k.cur} · best ${x.k.best}</span></div>`;
  }
  html += keys.length ? '' : `<div class="muted small">Habit-by-habit consistency shows here after your first day.</div>`;
  html += `</section>`;

  // water & steps
  const months = []; { const d = parseKey(t); for (let i = 5; i >= 0; i--) months.push(new Date(d.getFullYear(), d.getMonth() - i, 1)); }
  const goalHabits = [['water', 'Water goal', 'var(--water)'], ['steps', 'Step goal', 'var(--sage)']].map(([id, label, color]) => ({ h: habit(id), label, color })).filter(x => x.h);
  if (goalHabits.length) {
    html += `<h2>Water & steps</h2><section class="card">`;
    const wsG = weekStarts(12);
    goalHabits.forEach((x, idx) => {
      const hs = habitStats(x.h, keys), sk = streak(habitOK(x.h));
      const hitDays = keysT.filter(k => S.days[k] && S.days[k].h[x.h.id] === 'done').length;
      const perWeek = wsG.map(m => weekKeys(m).filter(k => S.days[k] && S.days[k].h[x.h.id] === 'done').length);
      html += `${idx ? '<div style="height:18px"></div>' : ''}<div class="hgroup">${esc(x.h.name)}</div>
        <div class="stats3"><div><div class="k">Goal hit</div><div class="v">${pct(hs.rate)}</div></div>
        <div><div class="k">Days hit</div><div class="v">${hitDays}</div></div>
        <div><div class="k">Streak</div><div class="v">${sk.cur}<span class="small muted"> / ${sk.best}</span></div></div></div>
        ${bars([perWeek], { h: 70, max: 7, colors: [x.color], labels: wsG.map(m => fmtDate(m, { month: 'numeric', day: 'numeric' })), labelEvery: 3, fmt: v => plural(v, 'day') })}`;
    });
    html += `<div class="small faint" style="margin-top:6px">Bars show the days you hit each goal per week. Goal hit is ${rl}.</div></section>`;
  }

  // movement
  const mh = habit('movement');
  const mvDays = keysT.filter(k => S.days[k] && S.days[k].h.movement === 'done');
  const mvMins = mvDays.map(k => S.days[k].mv.min).filter(Boolean);
  const mst = mh ? habitStats(mh, keys) : null;
  const typesCount = {}; mvDays.forEach(k => { const ty = S.days[k].mv.type || 'Unlabeled'; typesCount[ty] = (typesCount[ty] || 0) + 1; });
  const extraWalks = keysT.reduce((a, k) => a + ((S.days[k] && S.days[k].mv.extra) || 0), 0);
  const wsM = weekStarts(12);
  const weekSessions = wsM.map(m => weekKeys(m).filter(k => S.days[k] && S.days[k].h.movement === 'done').length);
  const weekMinutes = wsM.map(m => weekKeys(m).reduce((a, k) => a + ((S.days[k] && S.days[k].h.movement === 'done' && S.days[k].mv.min) || 0), 0));
  html += `<h2>Movement</h2><section class="card"><div class="stats3">
    <div><div class="k">Active days</div><div class="v">${mvDays.length}</div></div>
    <div><div class="k">Avg length</div><div class="v">${mvMins.length ? Math.round(avg(mvMins)) + 'm' : '–'}</div></div>
    <div><div class="k">Consistency</div><div class="v">${mst ? pct(mst.rate) : '–'}</div></div></div>
    <span class="lbl" style="margin-top:0">Active days per week</span>
    ${bars([weekSessions], { h: 80, max: 7, colors: ['var(--brass)'], labels: wsM.map(m => fmtDate(m, { month: 'numeric', day: 'numeric' })), labelEvery: 3, fmt: v => plural(v, 'day') })}
    <span class="lbl">Minutes per week</span>
    ${bars([weekMinutes], { h: 80, colors: ['var(--clay)'], labels: wsM.map(m => fmtDate(m, { month: 'numeric', day: 'numeric' })), labelEvery: 3, fmt: v => v + ' min' })}
    ${Object.keys(typesCount).length ? `<span class="lbl">What you did</span><div class="chips" style="margin-top:0">${Object.entries(typesCount).sort((a, b) => b[1] - a[1]).map(([k2, v]) => `<span class="chip">${esc(k2)} · ${v}</span>`).join('')}</div>` : ''}
    <div class="small faint" style="margin-top:10px">${mvMins.length ? `${num(mvMins.reduce((a, b) => a + b, 0))} minutes total · ` : ''}${plural(extraWalks, 'extra walk')} (${rl}). Rest days don’t lower consistency.</div></section>`;

  // business
  const ho = habit('biz-own'), hc = habit('biz-client');
  const bizHabits = S.habits.filter(h => h.cat === 'biz' && h.kind === 'check');
  if (bizHabits.length) {
    html += `<h2>Business</h2><section class="card">`;
    const own = ho || bizHabits[0], cl = hc || bizHabits[1];
    const dd = h => h ? keysT.filter(k => S.days[k] && S.days[k].h[h.id] === 'done').length : 0;
    const so = own ? habitStats(own, keys) : null, sc = cl ? habitStats(cl, keys) : null;
    html += `<div class="grid2">
      <div class="tile" style="background:var(--bg2)"><div class="k">My business</div><div class="v">${dd(own)}<small> days</small></div><div class="s">${so && so.n ? `${pct(so.done / so.n)} of scheduled weekdays` : '&nbsp;'}</div></div>
      <div class="tile" style="background:var(--bg2)"><div class="k">Client work</div><div class="v">${dd(cl)}<small> days</small></div><div class="s">${sc && sc.n ? `${pct(sc.done / sc.n)} of scheduled weekdays` : '&nbsp;'}</div></div></div>`;
    const wsB = weekStarts(12);
    const wo = wsB.map(m => own ? weekKeys(m).filter(k => S.days[k] && S.days[k].h[own.id] === 'done').length : 0);
    const wc = wsB.map(m => cl ? weekKeys(m).filter(k => S.days[k] && S.days[k].h[cl.id] === 'done').length : 0);
    html += `<span class="lbl">Days per week</span>${bars([wo, wc], { h: 90, max: 7, colors: ['var(--brass)', 'var(--sage)'], labels: wsB.map(m => fmtDate(m, { month: 'numeric', day: 'numeric' })), labelEvery: 3, fmt: v => plural(v, 'day') })}
      <div class="legend2"><span><i style="background:var(--brass)"></i>My business</span><span><i style="background:var(--sage)"></i>Client work</span></div>`;
    const mo = months.slice(-3).map(m => { const ks = keysT.filter(() => true); const all = []; for (let d = new Date(m); d.getMonth() === m.getMonth() && keyOf(d) <= t; d.setDate(d.getDate() + 1)) all.push(keyOf(d)); return { m, o: own ? all.filter(k => S.days[k] && S.days[k].h[own.id] === 'done').length : 0, c: cl ? all.filter(k => S.days[k] && S.days[k].h[cl.id] === 'done').length : 0 }; });
    html += `<span class="lbl">By month</span>${mo.map(x => `<div class="row between small" style="padding:4px 0"><span>${x.m.toLocaleDateString('en-US', { month: 'long' })}</span><span class="muted">${plural(x.o, 'business day')} · ${plural(x.c, 'client day')}</span></div>`).join('')}
      <div class="small faint" style="margin-top:8px">Weekend work counts toward your day totals but never lowers your weekday percentage.</div></section>`;
  }
  return html;
}

function dayDetail(k) {
  const day = S.days[k], sc = dayScore(k);
  let html = `<h3>${fmtDate(k, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
    <div class="muted" style="margin-top:4px">${sc.away ? 'Pause day' : sc.n ? `${pct(sc.pct)} · ${fullDone(k)} of ${sc.n} done` : 'Nothing scheduled'}</div>`;
  for (const c of S.cats) {
    const items = S.habits.filter(h => h.cat === c.id).map(h => ({ h, r: evalItem(h, k, day) })).filter(x => x.r && (x.r.sched || x.r.status !== 'none'));
    if (!items.length) continue;
    html += `<div class="hgroup" style="margin-top:16px">${esc(c.short || c.name)}</div><ul class="dl-list">`;
    for (const { h, r } of items) {
      let extra = '';
      if (h.kind === 'water') extra = ` · ${fmtWater(waterTotal(day)).oz} (${fmtWater(waterTotal(day)).l})`;
      if (h.kind === 'steps') extra = day && day.steps != null ? ` · ${num(day.steps)}` : ' · not logged';
      if (h.kind === 'movement' && day) { const mv = day.mv; extra = [r.status === 'rest' ? 'rest day' : '', mv.type, mv.min ? mv.min + ' min' : '', mv.lighter ? 'lighter' : '', mv.extra ? `${plural(mv.extra, 'extra walk')}` : ''].filter(Boolean).join(' · '); extra = extra ? ' · ' + esc(extra) : ''; }
      const cls = r.status === 'done' || (r.status === 'rest' && r.credit) ? 'done' : r.status === 'partial' ? 'partial' : r.status === 'skip' || r.status === 'rest' ? 'skip' : '';
      const note = day && day.n[h.id] ? `<div class="small muted">“${esc(day.n[h.id])}”</div>` : '';
      html += `<li class="${cls ? '' : 'miss'}"><span class="st ${cls}">${cls === 'done' ? `<svg viewBox="0 0 24 24">${ICON.check}</svg>` : ''}</span><div>${esc(h.name)}${extra}${!r.sched && r.status !== 'none' ? ' <span class="faint small">(extra)</span>' : ''}${note}</div></li>`;
    }
    html += '</ul>';
  }
  if (day && day.mv && day.mv.note) html += `<div class="hgroup" style="margin-top:16px">Workout notes</div><div class="small" style="white-space:pre-wrap">${esc(day.mv.note)}</div>`;
  html += `<div style="margin-top:20px"><button class="btn primary block" data-a="editday" data-k="${k}">Edit this day</button></div>`;
  return html;
}

/* ---------- Settings ---------- */
function schedLabel(days) {
  if (!days.length) return 'Paused';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && WEEKDAYS.every(d => days.includes(d))) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  return [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(d => DOW[d]).join(', ');
}
function renderSettings() {
  const t = todayKey(), st = S.settings;
  let html = `<h1 style="margin:6px 2px 6px">Routines</h1><div class="muted small" style="margin:0 2px 8px">Changes apply from today forward. Your history stays as it was.</div>`;
  html += `<h2>Sync between devices</h2><section class="card">${sync.token && sync.gistId ? `
    <div class="row between"><div><b style="font-weight:500">Sync is on</b><div class="small muted">${syncState === 'ok' && sync.last ? 'Last synced ' + new Date(sync.last).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : syncState === 'offline' ? 'Offline right now. Changes will sync later.' : syncState === 'auth' ? 'The token stopped working. Set up again with a new one.' : syncState === 'syncing' ? 'Syncing…' : 'Waiting to sync'}</div></div><span class="switch on"></span></div>
    <div class="grid2" style="margin-top:12px"><button class="btn" data-a="syncnow">Sync now</button><button class="btn" data-a="syncoff">Turn off</button></div>
    <div class="small faint" style="margin-top:10px">Your Mac and iPhone share one private copy on your GitHub account. Every change syncs within a few seconds and whenever you open the app.</div>`
    : `<div class="small muted">Keep your Mac and iPhone in step. Check something off on one and it shows up on the other. Setup takes about 2 minutes, once per device.</div>
    <button class="btn primary block" style="margin-top:12px" data-a="syncsetup">Set up sync</button>`}</section>`;
  html += `<h2>Habits</h2>`;
  for (const c of S.cats) {
    const hs = S.habits.filter(h => h.cat === c.id);
    html += `<section class="card"><div class="row between" style="margin-bottom:4px"><div class="row">${ico(c.icon)}<h3>${esc(c.name)}</h3></div><button class="small brass" data-a="editcat" data-c="${c.id}">Edit</button></div>`;
    for (const h of hs) {
      const days = schedDays(h, t);
      html += `<button class="set-row" data-a="edithabit" data-h="${h.id}"><div class="grow"><b>${esc(h.name)}${h.kind !== 'check' ? ' <span class="faint small">· built-in</span>' : ''}</b><small>${schedLabel(days)}${h.tag ? ' · ' + esc(h.tag) : ''}${h.notes ? ' · notes' : ''}</small></div>${ico('right', 'ico chev')}</button>`;
    }
    html += `<button class="btn sm" style="margin-top:8px" data-a="addhabit" data-c="${c.id}">+ Add habit</button></section>`;
  }
  html += `<button class="btn block" data-a="addcat">+ Add category</button>`;

  html += `<h2>Streaks</h2><section class="card">
    <span class="lbl" style="margin-top:0">A day counts toward your streak at</span>
    <div class="row"><input type="range" min="50" max="100" step="5" class="grow" data-f="streakPct" value="${st.streakPct}" style="accent-color:var(--brass)"><b id="spv" style="width:48px;text-align:right">${st.streakPct}%</b></div>
    <div class="small faint">Consistency, not perfection. ${st.streakPct}% of scheduled habits keeps the streak going.</div>
  </section>`;

  html += `<h2>Weekly movement plan</h2><section class="card">`;
  for (const d of [1, 2, 3, 4, 5, 6, 0]) {
    const p = st.plan[d] || { label: '', rest: false };
    html += `<div class="planrow"><span class="d">${DOW[d]}</span><input class="inp" data-f="plan" data-d="${d}" value="${esc(p.label)}"><button class="restbtn ${p.rest ? 'on' : ''}" data-a="planrest" data-d="${d}">${p.rest ? 'Rest OK ✓' : 'Rest OK'}</button></div>`;
  }
  html += `<div class="small faint" style="margin-top:8px">“Rest OK” means choosing rest on that day counts as completing your movement. On other days, rest is neutral and never a miss.</div>
    <span class="lbl">Activity types</span><input class="inp" data-f="types" value="${esc(st.activityTypes.join(', '))}"></section>`;

  html += `<h2>Backup & data</h2><section class="card">
    <div class="small muted" style="margin-bottom:12px">Everything saves automatically on this phone. Backups let you keep a copy in Files or iCloud Drive, and restore it on a new phone.${st.lastBackup ? ` Last backup: ${fmtDate(st.lastBackup, { month: 'short', day: 'numeric', year: 'numeric' })}.` : ' No backup yet.'}</div>
    <div class="grid2"><button class="btn" data-a="exportjson">Backup (JSON)</button><button class="btn" data-a="exportcsv">Export CSV</button></div>
    <span class="lbl">Move data between devices</span>
    <div class="small muted" style="margin-bottom:10px">Safari, Chrome and the Home Screen app each keep their own separate copy. To bring entries over, tap Copy on the device that has them, then Paste on the other one. On an iPhone and Mac signed in to the same Apple Account, the clipboard carries over by itself. Days get merged, so nothing on either side is lost.</div>
    <div class="grid2"><button class="btn" data-a="copydata">Copy my data</button><button class="btn" data-a="pastedata">Paste data</button></div>
    <label class="btn block" style="margin-top:10px">Import backup or CSV<input type="file" accept=".json,.csv,application/json,text/csv" data-f="import" hidden></label>
    <div class="small faint" style="margin-top:12px">JSON restores everything. CSV opens in Excel or Numbers, and can be imported back to update days.</div>
    <button class="btn danger block" style="margin-top:18px" data-a="reset">Erase all data</button></section>
    <div class="center small faint" style="margin:24px 0 0">Habits · made for showing up, not perfection</div>`;
  return html;
}

function habitSheet(id, catId) {
  const h = id ? habit(id) : null, t = todayKey();
  const days = h ? schedDays(h, t) : ALL;
  draft = draft || { name: h ? h.name : '', cat: h ? h.cat : catId, days: [...(h && h.paused ? (h.lastDays || ALL) : days)], tag: h ? h.tag : '', notes: h ? !!h.notes : false };
  const builtin = h && h.kind !== 'check';
  return `<h3>${h ? 'Edit habit' : 'New habit'}</h3>
    <span class="lbl">Name</span><input class="inp" data-f="d-name" value="${esc(draft.name)}" placeholder="e.g. Stretch for 5 minutes">
    ${builtin ? '' : `<span class="lbl">Category</span><select class="inp" data-f="d-cat">${S.cats.map(c => `<option value="${c.id}" ${c.id === draft.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`}
    <span class="lbl">Scheduled days</span>
    <div class="days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="${draft.days.includes(d) ? 'on' : ''}" data-a="d-day" data-d="${d}">${DOW[d][0]}${DOW[d][1]}</button>`).join('')}</div>
    <div class="row" style="gap:8px;margin-top:8px"><button class="chip" data-a="d-days" data-v="all">Every day</button><button class="chip" data-a="d-days" data-v="wk">Weekdays</button><button class="chip" data-a="d-days" data-v="we">Weekends</button></div>
    <div class="small faint" style="margin-top:6px">On other days it shows as optional and never counts as missed.</div>
    ${builtin ? '' : `<span class="lbl">Label (optional)</span><input class="inp" data-f="d-tag" value="${esc(draft.tag)}" placeholder="e.g. Morning, Afternoon">
    <button class="row between" style="width:100%;margin-top:16px" data-a="d-notes"><span>Show “add a note” after checking off</span><span class="switch ${draft.notes ? 'on' : ''}"></span></button>`}
    <div class="acts"><button class="btn" data-a="closesheet">Cancel</button><button class="btn primary" data-a="d-save" data-h="${h ? h.id : ''}">Save</button></div>
    ${h ? `<div class="acts">
      <button class="btn sm" data-a="d-move" data-h="${h.id}" data-v="-1">Move up</button><button class="btn sm" data-a="d-move" data-h="${h.id}" data-v="1">Move down</button>
      <button class="btn sm" data-a="d-pause" data-h="${h.id}">${h.paused ? 'Resume habit' : 'Pause habit'}</button>
      ${builtin ? '' : `<button class="btn sm danger" data-a="d-delete" data-h="${h.id}">Delete forever</button>`}</div>
      <div class="small faint" style="margin-top:10px">Pausing keeps its history and stops it from being scheduled. Deleting removes its history too.</div>` : ''}`;
}
let draft = null;

function stepHelp() {
  const url = location.origin + location.pathname;
  const name = S.settings.shortcutName;
  return `<div class="steps-help"><h3>Steps from Apple Health</h3>
    <p class="small muted">iPhone doesn’t let websites read Apple Health directly. A tiny Shortcut bridges the gap: it reads today’s steps from Health and hands them to this app. One-time setup, about 3 minutes.</p>
    <span class="lbl">Build the Shortcut</span>
    <ol class="small">
      <li>Open the <b>Shortcuts</b> app, tap <b>+</b>, and name it <code>${esc(name)}</code>.</li>
      <li>Add <b>Find Health Samples</b>. Set: Type is <b>Steps</b>, Start Date is <b>Today</b>. Tap <b>Group By</b> and choose <b>Day</b> (this avoids double-counting iPhone + Watch).</li>
      <li>Add <b>Calculate Statistics</b>, choose <b>Sum</b> of Health Samples.</li>
      <li>Add <b>Round Number</b> (Ones place).</li>
      <li>Add <b>Copy to Clipboard</b>.</li>
      <li>Run it once and tap <b>Allow</b> when it asks for Health access.</li>
    </ol>
    <span class="lbl">Daily use</span>
    <ol class="small">
      <li>Tap <b>Get from Apple Health</b> on the Today screen. Shortcuts runs.</li>
      <li>Tap <b>◀ Habits</b> in the top-left corner to come back.</li>
      <li>Tap <b>Paste</b>, then <b>Paste</b> again in the iPhone bubble. Done.</li>
    </ol>
    <span class="lbl">Using Safari instead of the Home Screen app?</span>
    <p class="small muted">Replace “Copy to Clipboard” with <b>Open URLs</b> using <code>${esc(url)}#steps=</code> followed by the Rounded Number. Steps fill in automatically. (The Home Screen app keeps its own storage, so the clipboard route is the one to use there.)</p>
    <button class="btn block" data-a="closesheet" style="margin-top:8px">Got it</button></div>`;
}

/* ---------- sheet & toast ---------- */
function openSheet(fn) { sheetFn = fn; $('#sheet').innerHTML = '<div class="grab"></div>' + fn(); $('#sheet').classList.add('open'); $('#backdrop').classList.add('open'); $('#sheet').scrollTop = 0; }
function closeSheet() { sheetFn = null; draft = null; $('#sheet').classList.remove('open'); $('#backdrop').classList.remove('open'); }
let toastT;
function toast(msg, undo) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button data-a="undo">Undo</button>' : ''}`;
  el.classList.add('show'); toastUndo = undo || null;
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), undo ? 4500 : 2600);
}
let toastUndo = null;
function snapshot() { return JSON.stringify(S); }
function restore(snap) { S = JSON.parse(snap); save(); render(); }

/* ---------- import / export ---------- */
async function shareFile(name, text, type) {
  const file = new File([text], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  return true;
}
const colName = h => `${(cat(h.cat) || {}).short || h.cat}: ${h.name}`;
function toCSV() {
  const keys = Object.keys(S.days).sort();
  const checks = S.habits.filter(h => h.kind === 'check');
  const head = ['date', 'weekday', 'completion_pct', 'pause_day', 'water_ml', 'water_oz', 'steps', 'movement', 'movement_lighter', 'activity', 'minutes', 'extra_walks', 'workout_notes'];
  for (const h of checks) { head.push(colName(h)); if (h.notes || keys.some(k => S.days[k].n && S.days[k].n[h.id])) head.push(colName(h) + ' (note)'); }
  const q = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const rows = [head.map(q).join(',')];
  for (const k of keys) {
    const d = getDay(k), sc = dayScore(k), ml = waterTotal(d);
    const r = [k, DOW[dowOf(k)], sc.pct == null ? '' : Math.round(sc.pct * 100), d.away ? 'yes' : '', ml || '', ml ? Math.round(ml / ML_PER_OZ) : '', d.steps ?? '', d.h.movement || '', d.mv.lighter ? 'yes' : '', d.mv.type || '', d.mv.min || '', d.mv.extra || '', d.mv.note || ''];
    for (const h of checks) {
      const ev = evalItem(h, k, d);
      r.push(!ev ? '' : d.h[h.id] || (ev.sched ? (d.away ? '' : 'missed') : 'not scheduled'));
      if (head.includes(colName(h) + ' (note)')) r.push(d.n[h.id] || '');
    }
    rows.push(r.map(q).join(','));
  }
  return rows.join('\n');
}
function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}
function importCSV(text) {
  const rows = parseCSV(text); if (rows.length < 2) throw new Error('empty');
  const head = rows[0], idx = n => head.indexOf(n);
  if (idx('date') < 0) throw new Error('no date column');
  const map = {}; S.habits.filter(h => h.kind === 'check').forEach(h => { map[colName(h)] = h.id; });
  let n = 0;
  for (const r of rows.slice(1)) {
    const k = r[idx('date')]; if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
    const d = getDay(k, true); n++;
    const g = name => { const i = idx(name); return i < 0 ? '' : (r[i] || '').trim(); };
    if (g('pause_day')) d.away = g('pause_day') === 'yes';
    if (g('water_ml')) d.water = [Number(g('water_ml'))];
    if (g('steps')) d.steps = Number(g('steps'));
    if (['done', 'rest', 'skip'].includes(g('movement'))) d.h.movement = g('movement');
    if (g('movement_lighter')) d.mv.lighter = g('movement_lighter') === 'yes';
    if (g('activity')) d.mv.type = g('activity');
    if (g('minutes')) d.mv.min = Number(g('minutes'));
    if (g('extra_walks')) d.mv.extra = Number(g('extra_walks'));
    if (g('workout_notes')) d.mv.note = g('workout_notes');
    head.forEach((col, i) => {
      const v = (r[i] || '').trim();
      if (map[col] && ['done', 'partial', 'skip'].includes(v)) d.h[map[col]] = v;
      const m = col.match(/^(.*) \(note\)$/); if (m && map[m[1]] && v) d.n[map[m[1]]] = v;
    });
  }
  return n;
}

/* ---------- actions ---------- */
function setStatus(id, v) { const d = getDay(cur, true); if (v) d.h[id] = v; else delete d.h[id]; }
function parseServings(str) {
  return str.split(',').map(s => s.trim().toLowerCase()).map(s => { const m = s.match(/^([\d.]+)\s*(oz|ml|l)?$/); if (!m) return null; let v = Number(m[1]), u = m[2] || 'oz'; if (u === 'l') { v = v * 1000; u = 'ml'; } return v > 0 ? { v, u } : null; }).filter(Boolean);
}
function setSteps(n, src) {
  if (!(n >= 0) || n > 200000) { toast('That doesn’t look like a step count'); return; }
  const d = getDay(todayKey(), true); d.steps = Math.round(n); d.stepsSrc = src || ''; save(); awaitingSteps = false;
  cur = todayKey(); view = 'today'; render(); toast(`${num(n)} steps saved`);
}
const A = {
  tab: el => { if (el.dataset.v === 'today' && view === 'today') { cur = todayKey(); } go(el.dataset.v); },
  prev: () => { cur = addDays(cur, -1); render(); },
  next: () => { if (cur < todayKey()) cur = addDays(cur, 1); render(); },
  gotoday: () => { cur = todayKey(); render(); },
  togglecat: el => { const c = el.dataset.c; const sec = el.closest('.cat'); openCats[c] = sec.classList.contains('closed'); render(); },
  tap: el => {
    const id = el.dataset.h, d = getDay(cur, true), was = d.h[id];
    setStatus(id, was === 'done' ? null : 'done'); save();
    if (navigator.vibrate) navigator.vibrate(8);
    const h = habit(id), c = h && h.cat;
    if (c && openCats[c] === undefined) { /* auto-collapse handled in render */ }
    render();
  },
  more: el => { const id = el.dataset.h; openSheet(() => moreSheet(id)); },
  st: el => { setStatus(el.dataset.h, el.dataset.v || null); save(); closeSheet(); render(); },
  water: el => { const s = S.settings.servings[+el.dataset.i]; getDay(cur, true).water.push(Math.round(servingMl(s))); save(); if (navigator.vibrate) navigator.vibrate(8); render(); },
  watercustom: () => openSheet(() => `<h3>Add water</h3><span class="lbl">Amount</span><div class="row"><input class="inp grow" id="wamt" type="number" inputmode="decimal" placeholder="Amount"><div class="seg" style="width:150px"><button class="${S.settings.waterUnit === 'oz' ? 'on' : ''}" data-a="wu" data-v="oz">oz</button><button class="${S.settings.waterUnit === 'ml' ? 'on' : ''}" data-a="wu" data-v="ml">ml</button></div></div><div class="small faint" style="margin-top:6px">Use a negative number to subtract.</div><div class="acts"><button class="btn" data-a="closesheet">Cancel</button><button class="btn primary" data-a="wadd">Add</button></div>`),
  wu: el => { el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); },
  wadd: () => { const v = Number($('#wamt').value); const u = $('#sheet .seg button.on').dataset.v; if (v) { getDay(cur, true).water.push(Math.round(u === 'oz' ? v * ML_PER_OZ : v)); save(); } closeSheet(); render(); },
  waterundo: () => { const d = getDay(cur, true); d.water.pop(); save(); render(); },
  mv: el => { const d = getDay(cur, true), v = el.dataset.v; d.h.movement = d.h.movement === v ? undefined : v; if (!d.h.movement) delete d.h.movement; if (v === 'done' && !d.mv.type) d.mv.type = (S.settings.plan[dowOf(cur)] || {}).type || ''; save(); render(); },
  mvlighter: () => { const d = getDay(cur, true); d.mv.lighter = !d.mv.lighter; save(); render(); },
  mvtype: el => { const d = getDay(cur, true); d.mv.type = d.mv.type === el.dataset.v ? '' : el.dataset.v; if (d.mv.type && !d.h.movement) d.h.movement = 'done'; save(); render(); },
  mvmin: el => { const d = getDay(cur, true), m = +el.dataset.v; d.mv.min = d.mv.min === m ? null : m; if (d.mv.min && !d.h.movement) d.h.movement = 'done'; save(); render(); },
  extra: el => { const d = getDay(cur, true); d.mv.extra = Math.max(0, (d.mv.extra || 0) + +el.dataset.v); save(); render(); },
  away: () => { const d = getDay(cur, true); d.away = !d.away; save(); render(); if (d.away) toast('Pause day. Rest well.'); },
  stepsync: () => { awaitingSteps = true; render(); location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent(S.settings.shortcutName); },
  steppaste: async () => {
    try {
      const txt = await navigator.clipboard.readText();
      const m = (txt || '').replace(/,/g, '').match(/\d+(\.\d+)?/);
      if (!m) { toast('No number on the clipboard yet'); return; }
      const n = Math.round(Number(m[0]));
      if (cur !== todayKey()) { const d = getDay(cur, true); d.steps = n; d.stepsSrc = 'Apple Health'; save(); render(); toast(`${num(n)} steps saved`); }
      else setSteps(n, 'Apple Health');
    } catch (e) { toast('Paste isn’t available here. Type the number instead.'); const i = document.querySelector('[data-f="steps"]'); if (i) i.focus(); }
  },
  stephelp: () => openSheet(stepHelp),
  range: el => { range = el.dataset.v === 'all' ? 'all' : +el.dataset.v; render(); },
  daydetail: el => { const k = el.dataset.k; openSheet(() => dayDetail(k)); },
  editday: el => { cur = el.dataset.k; closeSheet(); go('today'); },
  closesheet: () => closeSheet(),
  undo: () => { if (toastUndo) { toastUndo(); toastUndo = null; $('#toast').classList.remove('show'); } },
  // settings
  edithabit: el => { draft = null; const id = el.dataset.h; openSheet(() => habitSheet(id)); },
  addhabit: el => { draft = null; const c = el.dataset.c; openSheet(() => habitSheet(null, c)); },
  'd-day': el => { const d = +el.dataset.d; draft.days = draft.days.includes(d) ? draft.days.filter(x => x !== d) : [...draft.days, d]; render(); },
  'd-days': el => { draft.days = el.dataset.v === 'all' ? [...ALL] : el.dataset.v === 'wk' ? [...WEEKDAYS] : [0, 6]; render(); },
  'd-notes': () => { draft.notes = !draft.notes; render(); },
  'd-save': el => {
    const name = draft.name.trim(); if (!name) { toast('Give it a name'); return; }
    if (!draft.days.length) { toast('Pick at least one day, or pause it instead'); return; }
    const t = todayKey(); const days = [...draft.days].sort();
    let h = el.dataset.h ? habit(el.dataset.h) : null;
    if (!h) { h = { id: uid(), name, cat: draft.cat, kind: 'check', created: t, sched: [{ from: t, days }], tag: draft.tag.trim(), notes: draft.notes }; S.habits.push(h); }
    else {
      h.name = name; if (h.kind === 'check') { h.cat = draft.cat; h.tag = draft.tag.trim(); h.notes = draft.notes; }
      if (!h.paused) setSched(h, days); else h.lastDays = days;
    }
    save(); closeSheet(); render(); toast('Saved');
  },
  'd-move': el => { const h = habit(el.dataset.h), list = S.habits.filter(x => x.cat === h.cat), i = list.indexOf(h), j = i + +el.dataset.v; if (j < 0 || j >= list.length) return; const a = S.habits.indexOf(h), b = S.habits.indexOf(list[j]); [S.habits[a], S.habits[b]] = [S.habits[b], S.habits[a]]; save(); render(); },
  'd-pause': el => {
    const h = habit(el.dataset.h);
    if (h.paused) { h.paused = false; setSched(h, h.lastDays || ALL); toast('Habit resumed'); }
    else { h.lastDays = schedDays(h, todayKey()); h.paused = true; setSched(h, []); toast('Paused. History kept.'); }
    save(); closeSheet(); render();
  },
  'd-delete': el => {
    const h = habit(el.dataset.h);
    if (!confirm(`Delete “${h.name}” and all of its history? This can’t be undone. Pausing keeps history instead.`)) return;
    const snap = snapshot();
    S.habits = S.habits.filter(x => x !== h); for (const k in S.days) { delete S.days[k].h[h.id]; if (S.days[k].n) delete S.days[k].n[h.id]; }
    save(); closeSheet(); render(); toast('Habit deleted', () => restore(snap));
  },
  editcat: el => { const c = cat(el.dataset.c); openSheet(() => catSheet(c)); },
  addcat: () => openSheet(() => catSheet(null)),
  'c-icon': el => { $('#sheet').querySelectorAll('[data-a="c-icon"]').forEach(b => b.classList.toggle('on', b === el)); },
  'c-save': el => {
    const name = $('#cname').value.trim(), short = $('#cshort').value.trim() || name, icon = ($('#sheet [data-a="c-icon"].on') || {}).dataset?.v || 'star';
    if (!name) { toast('Give it a name'); return; }
    let c = el.dataset.c ? cat(el.dataset.c) : null;
    if (!c) { c = { id: uid(), name, short, icon }; S.cats.push(c); } else Object.assign(c, { name, short, icon });
    save(); closeSheet(); render();
  },
  'c-move': el => { const c = cat(el.dataset.c), i = S.cats.indexOf(c), j = i + +el.dataset.v; if (j < 0 || j >= S.cats.length) return; [S.cats[i], S.cats[j]] = [S.cats[j], S.cats[i]]; save(); render(); },
  'c-delete': el => { const c = cat(el.dataset.c); if (S.habits.some(h => h.cat === c.id)) { toast('Move or delete its habits first'); return; } S.cats = S.cats.filter(x => x !== c); save(); closeSheet(); render(); },
  unit: el => { S.settings.waterUnit = el.dataset.v; save(); render(); },
  planrest: el => { const p = S.settings.plan[el.dataset.d]; p.rest = !p.rest; save(); render(); },
  exportjson: async () => { const ok = await shareFile(`habits-backup-${todayKey()}.json`, JSON.stringify(S, null, 1), 'application/json'); if (ok) { S.settings.lastBackup = todayKey(); save(); render(); toast('Backup created'); } },
  syncsetup: () => openSheet(syncSheet),
  syncconnect: async el => {
    const tok = ($('#synctoken') || {}).value || '';
    if (!/^(ghp_|github_pat_|gho_)/.test(tok.trim())) { toast('That doesn’t look like a GitHub token. It starts with ghp_'); return; }
    el.disabled = true; el.textContent = 'Connecting…';
    const ok = await connectSync(tok);
    if (ok) { closeSheet(); render(); toast('Sync is on'); } else { el.disabled = false; el.textContent = 'Connect'; }
  },
  syncnow: () => runSync(),
  syncoff: () => { sync = {}; saveSync(); syncState = 'off'; render(); toast('Sync turned off on this device. Your data stays here.'); },
  copydata: async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(S)); toast('Copied. Now tap Paste data on your other device.'); }
    catch (e) { toast('Copying isn’t allowed here. Use Backup (JSON) instead.'); }
  },
  pastedata: async () => {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch (e) { toast('Paste isn’t available here. Use Import instead.'); return; }
    offerImport(text);
  },
  'imp-merge': () => { const snap = snapshot(); const n = mergeData(pendingImport); pendingImport = null; save(); closeSheet(); render(); toast(`Merged ${plural(n, 'day')}`, () => restore(snap)); },
  'imp-replace': () => { const snap = snapshot(); S = migrate(pendingImport); pendingImport = null; save(); closeSheet(); render(); toast('Replaced with the backup', () => restore(snap)); },
  exportcsv: async () => { await shareFile(`habits-${todayKey()}.csv`, toCSV(), 'text/csv'); },
  reset: () => {
    if (!confirm('Erase every habit and record on this phone? Make a backup first if you might want it.')) return;
    if (prompt('Type ERASE to confirm') !== 'ERASE') return;
    sync = {}; saveSync(); syncState = 'off';
    S = defaultData(); save(); cur = todayKey(); go('today'); toast('Fresh start');
  },
};
function setSched(h, days) {
  const t = todayKey(), last = h.sched[h.sched.length - 1];
  if (JSON.stringify([...last.days].sort()) === JSON.stringify([...days].sort())) return;
  if (last.from === t) { last.days = days; if (h.sched.length > 1 && JSON.stringify(h.sched[h.sched.length - 2].days) === JSON.stringify(days)) h.sched.pop(); }
  else h.sched.push({ from: t, days });
}
function syncSheet() {
  const link = 'https://github.com/settings/tokens/new?scopes=gist&description=Habits%20app%20sync';
  return `<div class="steps-help"><h3>Set up sync</h3>
    <p class="small muted">Your habits are saved to one private file on your GitHub account, and both devices read and write it. You need a GitHub token, which works like a key only this app uses. Make it once and use the same one on both devices.</p>
    <ol class="small">
      <li>On your Mac, open <a class="brass" href="${link}" target="_blank" rel="noopener">this GitHub page</a>. It has the right settings filled in.</li>
      <li>Set <b>Expiration</b> to <b>No expiration</b>. Make sure only <b>gist</b> is checked.</li>
      <li>Scroll down, click <b>Generate token</b>, and copy the token (it starts with <code>ghp_</code>).</li>
      <li>Paste it below and tap <b>Connect</b>.</li>
      <li>On your iPhone, open Habits → Routines → Set up sync and paste the <b>same token</b>. If your Mac and iPhone use the same Apple Account, copying on the Mac lets you paste on the iPhone.</li>
    </ol>
    <span class="lbl">GitHub token</span>
    <input class="inp" id="synctoken" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ghp_…">
    <div class="small faint" style="margin-top:6px">The token stays on your devices. It can only read and write your private gists, not your repos.</div>
    <div class="acts"><button class="btn" data-a="closesheet">Cancel</button><button class="btn primary" data-a="syncconnect">Connect</button></div>
    <div class="small faint" style="margin-top:10px">Anything already checked off on this device is merged in, so nothing is lost.</div></div>`;
}
let pendingImport = null;
function offerImport(text) {
  let d = null;
  try { d = JSON.parse(text); } catch (e) {}
  if (!d || !d.habits || !d.days || !d.settings) { toast('That isn’t Habits data. Copy it again on the other device.'); return; }
  pendingImport = d;
  const n = Object.keys(d.days).length;
  openSheet(() => `<h3>Bring in ${plural(n, 'day')}</h3>
    <p class="small muted">Merging keeps everything already here and adds anything checked off in the other copy. Replacing makes this device match the other copy exactly.</p>
    <button class="btn primary block" data-a="imp-merge">Merge (recommended)</button>
    <button class="btn block" style="margin-top:8px" data-a="imp-replace">Replace everything here</button>
    <button class="btn block" style="margin-top:8px" data-a="closesheet">Cancel</button>`);
}
const RANK = { done: 4, partial: 3, rest: 3, skip: 2 };
function mergeData(inc) {
  inc = migrate(inc);
  const norm = x => (x || '').trim().toLowerCase();
  const catMap = {};
  for (const c of inc.cats) {
    let m = S.cats.find(x => x.id === c.id) || S.cats.find(x => norm(x.name) === norm(c.name));
    if (!m) { m = { ...c }; S.cats.push(m); }
    catMap[c.id] = m.id;
  }
  const hMap = {};
  for (const h of inc.habits) {
    const cid = catMap[h.cat] || h.cat;
    let m = S.habits.find(x => x.id === h.id) || S.habits.find(x => x.cat === cid && norm(x.name) === norm(h.name));
    if (!m) { m = { ...h, cat: cid }; S.habits.push(m); }
    hMap[h.id] = m.id;
  }
  let n = 0;
  for (const k in inc.days) {
    const src = inc.days[k]; if (!src) continue;
    const before = JSON.stringify(S.days[k] || null);
    const d = getDay(k, true);
    for (const id in (src.h || {})) { const to = hMap[id] || id, v = src.h[id]; if ((RANK[v] || 0) > (RANK[d.h[to]] || 0)) d.h[to] = v; }
    for (const id in (src.n || {})) { const to = hMap[id] || id; if (src.n[id] && !d.n[to]) d.n[to] = src.n[id]; }
    if ((src.water || []).length > d.water.length) d.water = [...src.water];
    if (src.steps != null && (d.steps == null || src.steps > d.steps)) { d.steps = src.steps; d.stepsSrc = src.stepsSrc || ''; }
    const mv = src.mv || {};
    for (const f of ['type', 'min', 'note', 'lighter']) if (mv[f] && !d.mv[f]) d.mv[f] = mv[f];
    if ((mv.extra || 0) > (d.mv.extra || 0)) d.mv.extra = mv.extra;
    if (src.away) d.away = true;
    if (JSON.stringify(d) !== before) n++;
  }
  const st = inc.settings.start; if (st && st < S.settings.start) S.settings.start = st;
  return n;
}
function moreSheet(id) {
  const h = habit(id), d = getDay(cur), r = evalItem(h, cur, d), st = d && d.h[id];
  return `<h3>${esc(h.name)}</h3><div class="small muted" style="margin-top:4px">${fmtDate(cur, { weekday: 'long', month: 'short', day: 'numeric' })} · ${r.sched ? 'Scheduled' : 'Not scheduled, optional'}</div>
    <div class="acts">
      <button class="btn ${st === 'done' ? 'primary' : ''}" data-a="st" data-h="${id}" data-v="done">Done</button>
      <button class="btn ${st === 'partial' ? 'primary' : ''}" data-a="st" data-h="${id}" data-v="partial">Partly done</button>
      <button class="btn ${st === 'skip' ? 'primary' : ''}" data-a="st" data-h="${id}" data-v="skip">Skip on purpose</button>
      <button class="btn" data-a="st" data-h="${id}" data-v="">Clear</button></div>
    <div class="small faint" style="margin-top:8px">Partly done counts as half. Skipping on purpose doesn’t count against you.</div>
    <span class="lbl">Note (optional)</span><textarea class="inp" data-f="hnote" data-h="${id}" placeholder="${h.cat === 'biz' ? 'What did you work on?' : 'Anything worth remembering'}">${esc(d && d.n[id] || '')}</textarea>
    <button class="btn block" style="margin-top:12px" data-a="closesheet">Done</button>`;
}
function catSheet(c) {
  return `<h3>${c ? 'Edit category' : 'New category'}</h3>
    <span class="lbl">Name</span><input class="inp" id="cname" value="${esc(c ? c.name : '')}" placeholder="e.g. Mindfulness">
    <span class="lbl">Short name (Today screen)</span><input class="inp" id="cshort" value="${esc(c ? c.short : '')}">
    <span class="lbl">Icon</span><div class="chips" style="margin-top:0">${CAT_ICONS.map(i => `<button class="chip ${(c ? c.icon : 'star') === i ? 'on' : ''}" data-a="c-icon" data-v="${i}">${ico(i)}</button>`).join('')}</div>
    <div class="acts"><button class="btn" data-a="closesheet">Cancel</button><button class="btn primary" data-a="c-save" data-c="${c ? c.id : ''}">Save</button></div>
    ${c ? `<div class="acts"><button class="btn sm" data-a="c-move" data-c="${c.id}" data-v="-1">Move up</button><button class="btn sm" data-a="c-move" data-c="${c.id}" data-v="1">Move down</button><button class="btn sm danger" data-a="c-delete" data-c="${c.id}">Delete category</button></div>` : ''}`;
}

const F = {
  date: (el, ev) => { if (ev === 'change' && el.value && el.value <= todayKey()) { cur = el.value; render(); } },
  hnote: (el) => { const d = getDay(cur, true); const v = el.value; if (v.trim()) d.n[el.dataset.h] = v; else delete d.n[el.dataset.h]; save(); if (view === 'today') { const y = scrollY; $('#main').innerHTML = renderToday(); scrollTo(0, y); } },
  mvmin: (el, ev) => { if (ev !== 'change') return; const d = getDay(cur, true); const v = Math.max(0, Math.round(+el.value)); d.mv.min = v || null; if (v && !d.h.movement) d.h.movement = 'done'; save(); render(); },
  mvnote: (el) => { const d = getDay(cur, true); d.mv.note = el.value; save(); },
  steps: (el, ev) => { if (ev !== 'change') return; const d = getDay(cur, true); if (el.value === '') { d.steps = null; } else { const v = Math.round(+el.value); if (!(v >= 0) || v > 200000) { toast('That doesn’t look like a step count'); return; } d.steps = v; d.stepsSrc = ''; } save(); render(); },
  'd-name': el => { draft.name = el.value; }, 'd-tag': el => { draft.tag = el.value; }, 'd-cat': el => { draft.cat = el.value; },
  waterGoal: (el, ev) => { if (ev !== 'change') return; const v = +el.value; if (v > 0) { S.settings.waterGoal = Math.round(v * 1000); save(); render(); } },
  waterStretch: (el, ev) => { if (ev !== 'change') return; const v = +el.value; if (v > 0) { S.settings.waterStretch = Math.round(v * 1000); save(); render(); } },
  stepGoal: (el, ev) => { if (ev !== 'change') return; const v = +el.value; if (v > 0) { S.settings.stepGoal = Math.round(v); save(); render(); } },
  stepStretch: (el, ev) => { if (ev !== 'change') return; const v = +el.value; if (v > 0) { S.settings.stepStretch = Math.round(v); save(); render(); } },
  servings: (el, ev) => { if (ev !== 'change') return; const s = parseServings(el.value); if (s.length) { S.settings.servings = s; save(); render(); } else toast('Couldn’t read those amounts'); },
  streakPct: (el, ev) => { S.settings.streakPct = +el.value; const b = $('#spv'); if (b) b.textContent = el.value + '%'; if (ev === 'change') { save(); render(); } },
  plan: (el, ev) => { if (ev !== 'change') return; S.settings.plan[el.dataset.d].label = el.value.trim(); save(); },
  types: (el, ev) => { if (ev !== 'change') return; const v = el.value.split(',').map(s => s.trim()).filter(Boolean); if (v.length) { S.settings.activityTypes = v; save(); } },
  shortcutName: (el, ev) => { if (ev !== 'change') return; S.settings.shortcutName = el.value.trim() || 'Log Steps'; save(); },
  import: async (el, ev) => {
    if (ev !== 'change' || !el.files[0]) return;
    const file = el.files[0], text = await file.text(); el.value = '';
    const snap = snapshot();
    try {
      if (file.name.toLowerCase().endsWith('.csv') || /^\s*date,/.test(text)) {
        const n = importCSV(text); save(); render(); toast(`Imported ${plural(n, 'day')}`, () => restore(snap));
      } else {
        offerImport(text);
      }
    } catch (e) { toast('That file couldn’t be imported'); }
  },
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t || t.disabled) return;
  const fn = A[t.dataset.a]; if (fn) { e.preventDefault(); fn(t, e); }
});
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target.closest && e.target.closest('[data-f]'); if (!t) return;
  const fn = F[t.dataset.f]; if (fn) fn(t, ev);
}));
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input[data-f="steps"],input[data-f="mvmin"]')) e.target.blur(); });
$('#backdrop').addEventListener('click', closeSheet);

/* ---------- lifecycle ---------- */
let lastToday = todayKey();
function onWake() {
  const t = todayKey();
  if (t !== lastToday) { if (cur === lastToday) cur = t; lastToday = t; memo = new Map(); render(); }
  else if (awaitingSteps && view === 'today') render();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) onWake(); });
window.addEventListener('focus', onWake);
window.addEventListener('storage', e => { if (e.key === KEY) { S = load(); memo = new Map(); render(); } });

function readStepsFromURL() {
  const src = (location.hash || '').replace(/^#/, '') || (location.search || '').replace(/^\?/, '');
  const p = new URLSearchParams(src);
  if (p.has('steps')) {
    const n = Number(String(p.get('steps')).replace(/,/g, ''));
    history.replaceState(null, '', location.pathname);
    if (n >= 0) setSteps(n, 'Apple Health');
    return true;
  }
  return false;
}
window.addEventListener('hashchange', readStepsFromURL);
if (!readStepsFromURL()) render();
scheduleSync(300);
document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleSync(100); });
window.addEventListener('online', () => scheduleSync(100));
setInterval(() => { if (!document.hidden) scheduleSync(0); }, 60000);
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; save(); location.reload(); } });
  navigator.serviceWorker.register('sw.js').then(r => { document.addEventListener('visibilitychange', () => { if (!document.hidden) r.update().catch(() => {}); }); }).catch(() => {});
}
window.__habits = { get S() { return S; }, set S(v) { S = v; save(); render(); }, render };
})();
