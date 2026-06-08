const SLUG_ALIASES = {
  'rosenberg':     'tim',
  'dr-rosenberg':  'tim',
  'dr. rosenberg': 'tim'
};

const DISPLAY_NAMES = {
  'tim':      'Dr. Rosenberg',
  'steve':    'Steve Amann',
  'andrew':   'Andrew Becker',
  'bill':     'Bill Guthrie',
  'david':    'David Hinote',
  'kaia':     'Kaia Leavitt',
  'michelle': 'Michelle Lugo',
  'matt':     'Matt Murphy',
  'sara':     'Sara Pyburn',
  'sage':     'Sage Whitt',
  'marc':     'Marc Kolodinsky',
  'kristen':  'Kristen Zelenak',
  'chandler': 'Chandler Wilson',
  'kate':     'Kate Kalina'
};

const CAMP_START = '2026-06-22';
const CAMP_END   = '2026-06-27';

const sunSVG  = `<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/></svg>`;
const moonSVG = `<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/></svg>`;

// --- Slug resolution ---

const params = new URLSearchParams(window.location.search);
let slug = (params.get('name') || '').toLowerCase().trim();
slug = SLUG_ALIASES[slug] || slug;
const displayName = DISPLAY_NAMES[slug] || (slug ? slug : null);

// --- Dark mode ---

function getCurrentTimeForDark() {
  const p = new URLSearchParams(window.location.search).get('time');
  if (!p) return new Date();
  const d = new Date(p);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
}

function getTimeBlock() {
  const h = getCurrentTimeForDark().getHours();
  return (h >= 6 && h < 20) ? 'day' : 'night';
}

function getUserDarkPref() {
  return localStorage.getItem('dark-mode-preference');
}

function setUserDarkPref(val) {
  if (val === null) {
    localStorage.removeItem('dark-mode-preference');
    localStorage.removeItem('manual-set-at');
  } else {
    localStorage.setItem('dark-mode-preference', val);
    localStorage.setItem('manual-set-at', new Date().toISOString());
  }
}

function setDarkMode(isDark) {
  document.body.classList.toggle('dark', isDark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = isDark ? '#252525' : '#404040';
  const btn = document.getElementById('darkBtn');
  if (btn) btn.innerHTML = isDark ? sunSVG : moonSVG;
}

function updateDarkMode() {
  const pref = getUserDarkPref();
  if (pref === 'dark')  { setDarkMode(true);  return; }
  if (pref === 'light') { setDarkMode(false); return; }
  setDarkMode(getTimeBlock() === 'night');
}

// --- Day selection ---

function getActiveDate() {
  const now   = new Date();
  const today = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  if (today < CAMP_START) return CAMP_START;
  if (today > CAMP_END)   return CAMP_END;
  return today;
}

// --- Theme tag ---

function themeTag(theme) {
  const m = theme.match(/^(\p{Emoji_Presentation}️?\s*)(.*)/su);
  return m ? `${m[1]}<em>${m[2]}</em>` : `<em>${theme}</em>`;
}

// --- Skeleton detection ---

function isSkeleton(act) {
  const a = act.activity || '';
  return /Breakfast|Lunch|Dinner/i.test(a) ||
         /Lights Out/i.test(a) ||
         /Concert|Recital/i.test(a) ||
         /Opening Meeting|Closing/i.test(a) ||
         /Wake up/i.test(a);
}

// --- Assignment formatting ---

function formatAssignment(asgn) {
  switch (asgn.role) {
    case 'coach':
      return `Coaching: ${asgn.group} — ${asgn.room}`;
    case 'teach':
      return `Teaching: ${asgn.detail || asgn.group}${asgn.room ? ' — ' + asgn.room : ''}`;
    case 'conduct':
      return `Conducting: ${asgn.ensemble === 'symphonic' ? 'Symphonic' : 'Concert'} Saxophones`;
    case 'monitor':
      return `Monitor: ${asgn.detail}`;
    case 'nightwatch':
      return "Night's Watch";
    case 'floormgr':
      return 'Floor Monitor';
    case 'ranger':
      return 'Ranger (off campus)';
    case 'task':
    case 'duty':
      return asgn.detail || '';
    default:
      return asgn.detail || '';
  }
}

// --- Time helpers ---

let _scheduleData = null;
let _activeDayEl  = null;

function parseT(str, base) {
  const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  if (!ap && h < 6) h += 12; // no AM/PM: 1–5 → PM (camp schedule never starts before 6 AM)
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, min);
}

function parseActTime(timeStr, dateStr) {
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const base = new Date(yr, mo - 1, dy);
  const parts = timeStr.split(/\s*[–-]\s*/); // en-dash or hyphen
  const start = parseT(parts[0], base);
  let end = null;
  if (parts[1]) {
    let endStr = parts[1].trim();
    if (!/AM|PM/i.test(endStr) && /AM|PM/i.test(parts[0])) {
      endStr += ' ' + parts[0].match(/AM|PM/i)[0];
    }
    end = parseT(endStr, base);
  }
  if (!end && start) end = new Date(start.getTime() + 60000);
  return { start, end };
}

function fmtT(d) {
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

// --- Now/Next ---

function updateNowNext() {
  if (!_scheduleData || !slug) return;
  const now = new Date();
  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  // Flatten visible activities for this person
  const items = [];
  _scheduleData.forEach(day => {
    day.activities.forEach(act => {
      const myAsgnArr = (act.assignments || []).filter(a => a.person === slug);
      if (act.audience === 'faculty' && myAsgnArr.length === 0) return;
      items.push({ act, day, myAsgnArr });
    });
  });

  let nowItem = null, nextItem = null;

  // Check today
  const todayItems = items.filter(v => v.day.date === todayStr);
  for (let i = 0; i < todayItems.length; i++) {
    const { start, end } = parseActTime(todayItems[i].act.time, todayItems[i].day.date);
    if (start && end && now >= start && now < end) {
      nowItem = todayItems[i]; nextItem = todayItems[i + 1] || null; break;
    }
    if (start && now < start && !nowItem) {
      nowItem = todayItems[i]; nextItem = todayItems[i + 1] || null;
    }
  }

  // Before camp: first future item; after camp: last item
  if (!nowItem) {
    const idx = items.findIndex(v => v.day.date >= todayStr);
    if (idx !== -1) { nowItem = items[idx]; nextItem = items[idx + 1] || null; }
    else if (items.length)  { nowItem = items[items.length - 1]; }
  }

  const nowNameEl  = document.getElementById('nowName');
  const nowMetaEl  = document.getElementById('nowMeta');
  const nowPillsEl = document.getElementById('nowPills');
  const nextNameEl = document.getElementById('nextName');
  const nextTimeEl = document.getElementById('nextTime');

  if (nowItem && nowNameEl) {
    nowNameEl.textContent = nowItem.act.activity;
    if (nowMetaEl) {
      const { start, end } = parseActTime(nowItem.act.time, nowItem.day.date);
      const parts = [];
      if (nowItem.act.location) parts.push(`<span>${nowItem.act.location}</span><span class="now-sep">·</span>`);
      if (start) parts.push(`<span>${fmtT(start)}${end ? ' – ' + fmtT(end) : ''}</span>`);
      nowMetaEl.innerHTML = parts.join('');
    }
    if (nowPillsEl) {
      nowPillsEl.innerHTML = nowItem.myAsgnArr
        .map(a => { const d = formatAssignment(a); return d ? `<span class="now-pill"><span>${d}</span></span>` : ''; })
        .join('');
    }
  }

  if (nextNameEl) {
    if (nextItem) {
      nextNameEl.textContent = nextItem.act.activity;
      if (nextTimeEl) {
        const { start } = parseActTime(nextItem.act.time, nextItem.day.date);
        nextTimeEl.textContent = start ? fmtT(start) : '';
      }
    } else {
      nextNameEl.textContent = '—';
      if (nextTimeEl) nextTimeEl.textContent = '';
    }
  }
}

// --- Main init ---

async function init() {
  updateDarkMode();

  document.getElementById('darkBtn')?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setUserDarkPref(isDark ? 'light' : 'dark');
    setDarkMode(!isDark);
  });

  document.getElementById('nowPane')?.addEventListener('click', () => {
    if (_activeDayEl) _activeDayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const container = document.getElementById('schedule-container');

  try {
    const res = await fetch('/data/schedule.json');
    if (!res.ok) throw new Error('Failed to fetch');
    _scheduleData = await res.json();
  } catch {
    container.innerHTML = `<p style="color:red;text-align:center;padding:2rem">Could not load schedule. Please try again.</p>`;
    return;
  }

  // Collect all known person slugs from data
  const allPersons = new Set();
  _scheduleData.forEach(day => {
    day.activities.forEach(act => {
      (act.assignments || []).forEach(a => allPersons.add(a.person));
    });
  });

  // Validate slug
  if (!slug || !allPersons.has(slug)) {
    const validList = [...allPersons].sort().join(', ');
    const msg = slug ? `No schedule found for "<strong>${slug}</strong>".` : 'No name provided.';
    container.innerHTML = `
      <div class="error-state">
        <p>${msg}</p>
        <p>Valid names: ${validList}</p>
        <p><a href="/faculty/">← Back to Faculty Dashboard</a></p>
      </div>`;
    return;
  }

  // Update page title and header
  document.title = `${displayName}'s Schedule – Saxophone Workshop 2026`;
  document.getElementById('page-title').textContent = `${displayName}'s Schedule`;

  const activeDate = getActiveDate();
  container.innerHTML = '';
  const sched = document.createElement('div');
  sched.className = 'sched';
  container.appendChild(sched);

  _scheduleData.forEach(day => {
    const isActive = day.date === activeDate;
    const [yr, mo, dy] = day.date.split('-').map(Number);
    const weekday = new Date(yr, mo - 1, dy).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    const card = document.createElement('div');
    card.className = 'day-card' + (isActive ? ' open' : '');
    card.id = day.date;

    const tog = document.createElement('button');
    tog.className = 'day-toggle';
    tog.type = 'button';
    tog.innerHTML = `
      <div class="chevron"></div>
      <div class="day-hd"><div class="day-name">${weekday}</div></div>
      <div class="day-tags">
        ${isActive ? '<span class="tag tag-today">Today</span>' : ''}
        ${day.themeTitle ? `<span class="tag tag-theme">${themeTag(day.themeTitle)}</span>` : ''}
      </div>`;
    tog.addEventListener('click', () => card.classList.toggle('open'));
    card.appendChild(tog);

    const ul = document.createElement('ul');
    ul.className = 'act-list';

    day.activities.forEach(act => {
      const myAssignment = (act.assignments || []).find(a => a.person === slug);
      const isFacultyOnly = act.audience === 'faculty';

      if (isFacultyOnly && !myAssignment) return;

      const li = document.createElement('li');
      li.className = 'act-row' + (myAssignment ? ' personal-assignment' : '');

      const timeStart = act.time.split(/\s*[-–]\s*/)[0].trim();

      let html = `<div class="act-time">${timeStart}</div>`;
      html += `<div class="act-body">`;
      html += `<div class="act-name">${myAssignment ? '<span class="assign-star">★</span> ' : ''}${act.activity}</div>`;
      if (act.location) html += `<div class="act-loc">${act.location}</div>`;
      if (myAssignment) {
        const detail = formatAssignment(myAssignment);
        if (detail) html += `<div class="assignment-detail">${detail}</div>`;
      }
      html += `</div>`;
      li.innerHTML = html;
      ul.appendChild(li);
    });

    card.appendChild(ul);
    sched.appendChild(card);

    if (isActive) _activeDayEl = card;
  });

  updateNowNext();
  setInterval(updateNowNext, 60000);

  if (_activeDayEl) {
    setTimeout(() => _activeDayEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }
}

document.addEventListener('DOMContentLoaded', init);
