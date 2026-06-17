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
  'kate':     'Kate Chevalier'
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
      return "⚑ Night's Watch";
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

// --- Event overlay ---

let _selectedRow = null;

const _clockSVG = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7v5l3 3"/></svg>`;
const _pinSVG   = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/></svg>`;

const WALKING_GROUP_STUDENTS = {
  A: ['Benjamin Krayter','Oliver Esquivel Novek','Ian Stack-Thomas','Ethan Boniello','Connor Reed','Carley Moore','Cooper Katz','Sophia Kazi','Roberto "Jett" Ruiz','Jimmy Kim','Alexandra Lang'],
  B: ['Maximillian Threatt','Maci Fetherolf','Brendon Gandy','Ariel Meyer','Isabella Scheffing','Ethan Rodriguez','Thomas Willadsen','Skylar Mathson','Kai Miyazato','Thaddeus Rodziewicz','Joshua Baker','John Michalak'],
  C: ['Riley Bredesen','Giray Selman','Addison Talley','Sarah Meyer','Dominic Novero','Lucas Lively','Jonathan Nevarez','Aidan Lane','Caitlyn Shaffer','Rashad Barrett','Enzo Ward','Alexys Rodea-Carbajal'],
  D: ['Ian Monreal','Caeden Rojas','Anthony Barron','Sophia Scarpinato','Jeramiah Clark','Kalil Alejandro Ortiz Rivera','Hannah OLeary','Ava Foltak','Mason Miller','Charlie Battaglia','Justus Peyton'],
  E: ['Mia Castillo','Evey Heilmann','Ella Barajas','Alexander Incardona','Landon Layton','Jonathan Passales','Alyssa De León','Kelis Turner','Graham Vincent','Garrett Spiers','Linken Walker'],
  F: ['Maci Walser','Caleb Kizewski','Isaac Leslie','Jonna Jacob','Ian Cintron','Rachel Mosquera','Finn Carriere','Jada Bartley','Adrian Font','Samuel Campen','Lucas Peliwo','Luca Gorgone'],
  G: ['Hope Fuentes','Elliot Magley','Derek Mundrean','Nathan Renninger','Raylen Watts','Croix Bello','Angelina Yu','Oluwabunmi Oni','Miles Springer','Hailey Megargee','Juan Argotte','Isaac Sadik'],
  H: ['Elliot Webster','Griffin Tucker','Jack Vincent','Owen Plotkin','Lucas Johnson','Dominic Byrd','Kevin Jiang','Abigail Cuevas','Ethan Koesler','Maddelyn Mirino','Valencia Jaco','Devyn Novotny'],
};

function _walkingGroupMapUrl(groupLetter, act) {
  const haystack = (act.location || '') + (act.activity || '');
  if (/presser/i.test(haystack)) return '/assets/images/music-rally.png';
  return ['A','B','C','D'].includes((groupLetter || '').toUpperCase())
    ? '/assets/images/hatter-floor-1-rally.png'
    : '/assets/images/hatter-floor-2-rally.png';
}

function _floorNumber(asgn, act) {
  if (asgn.role === 'nightwatch') return 1;
  const fmList = (act.assignments || []).filter(a => a.role === 'floormgr');
  const idx = fmList.findIndex(a => a.person === asgn.person);
  return idx + 2;
}

function openStaffMap(url) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = '<img id="lightbox-img">';
    lb.addEventListener('click', () => lb.classList.remove('show'));
    document.body.appendChild(lb);
  }
  document.getElementById('lightbox-img').src = url;
  lb.classList.add('show');
}

function showStaffEvent(act, myAssignment, rowEl) {
  if (_selectedRow) _selectedRow.classList.remove('selected');
  _selectedRow = rowEl;
  if (rowEl) rowEl.classList.add('selected');

  let html = `<div class="event-hd">${act.activity}</div>`;
  html += `<div class="event-meta-row"><span class="c-icon">${_clockSVG}</span><span>${act.time}</span></div>`;
  if (act.location) {
    const mapPill = act.mapUrl
      ? ` <a href="${act.mapUrl}" target="_blank" style="display:inline-block;padding:2px 10px;background:var(--forest-mid);color:#fff;border-radius:var(--r-full);font-size:0.82em;text-decoration:none;margin-left:6px">↗ Map</a>`
      : '';
    const locWithStaffGuide = act.location.replace(/href="\/rooms\.html([^"]*)"/g, 'href="/faculty/rooms.html$1"');
    html += `<div class="event-meta-row"><span class="c-icon">${_pinSVG}</span><span>${locWithStaffGuide}${mapPill}</span></div>`;
  }

  if (myAssignment) {
    const role = myAssignment.role;

    // Room as prominent pin row for coaching and teaching
    if ((role === 'coach' || role === 'teach') && myAssignment.room) {
      html += `<div class="event-meta-row"><span class="c-icon">${_pinSVG}</span><strong>${myAssignment.room}</strong></div>`;
    }

    // Duty label and body
    const isTransit      = role === 'duty' && /Walking Group ([A-H])/i.test(myAssignment.detail || '');
    const isFloor        = role === 'floormgr' || role === 'nightwatch';
    const isPresserFloor = role === 'monitor' && /Presser Floor (\d)/i.test(myAssignment.detail || '');

    // Build duty text — for coach/teach, omit the room since it's shown above
    let dutyText = '';
    if (role === 'coach') {
      dutyText = `Coaching: ${myAssignment.group}`;
    } else if (role === 'teach') {
      dutyText = `Teaching: ${myAssignment.detail || myAssignment.group}`;
    } else {
      dutyText = formatAssignment(myAssignment);
    }

    if (dutyText || isTransit) {
      html += `<div class="event-notes"><div class="event-notes-lbl">Your duty</div>`;
      if (dutyText) html += `<div class="event-note-line"><span>${dutyText}</span></div>`;

      if (isPresserFloor) {
        const floorNum = (myAssignment.detail.match(/(\d)/) || [])[1] || '';
        html += `<div class="event-note-line" style="margin-top:8px;color:var(--text2);font-size:0.9em"><span>At the end of your shift: send "Floor ${floorNum} Clear" in the staff channel.</span></div>`;
      }

      if (isTransit) {
        const groupLetter = ((myAssignment.detail.match(/Group ([A-H])/i) || [])[1] || '').toUpperCase();
        const mapUrl = _walkingGroupMapUrl(groupLetter, act);
        if (mapUrl) {
          const btnStyle = "display:inline-block;padding:3px 11px;background:var(--forest-mid);color:#fff;border-radius:var(--r-full);font-size:0.85em;cursor:pointer;border:none;font-family:inherit;margin-top:6px";
          html += `<div class="event-note-line"><button onclick="openStaffMap('${mapUrl}')" style="${btnStyle}">↗ Rally point map</button></div>`;
        }
        const students = (WALKING_GROUP_STUDENTS[groupLetter] || [])
          .slice().sort((a, b) => {
            const lastName = n => n.trim().split(/\s+/).slice(-1)[0].toLowerCase();
            return lastName(a).localeCompare(lastName(b));
          });
        if (students.length) {
          html += `<div class="event-note-line" style="margin-top:10px"><span style="font-size:0.8em;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text3)">Your students</span></div>`;
          html += students.map(n => `<div class="event-note-line"><span>${n}</span></div>`).join('');
        }
      }

      if (isFloor) {
        const floor = _floorNumber(myAssignment, act);
        html += `<div class="event-note-line" style="margin-top:8px;color:var(--text2);font-size:0.9em"><span>At lights out: send "Floor ${floor} Clear" in the staff channel.</span></div>`;
      }

      html += `</div>`;
    }
  }

  document.getElementById('eventDetail').innerHTML = html;
  document.getElementById('eventOverlay').classList.add('show');
}

function closeStaffEvent() {
  if (_selectedRow) { _selectedRow.classList.remove('selected'); _selectedRow = null; }
  document.getElementById('eventOverlay')?.classList.remove('show');
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
      if (nowItem.act.location) parts.push(`<span>${nowItem.act.location.replace(/<a href="\/rooms\.html[^"]*"[^>]*>.*?<\/a>/g, '').trim()}</span><span class="now-sep">·</span>`);
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

  document.getElementById('eventClose')?.addEventListener('click', closeStaffEvent);
  document.getElementById('eventOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeStaffEvent();
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
    const msg = slug ? `No schedule found for "<strong>${slug}</strong>".` : 'No name provided.';
    const links = [...allPersons].sort().map(s => {
      const label = DISPLAY_NAMES[s] || s.charAt(0).toUpperCase() + s.slice(1);
      return `<a href="schedule.html?name=${encodeURIComponent(s)}" style="display:block;padding:10px 0;border-bottom:1px solid var(--border);color:var(--text)">${label}</a>`;
    }).join('');
    container.innerHTML = `
      <div class="error-state">
        <p>${msg}</p>
        <p style="margin-bottom:0.25rem;font-size:0.85em;color:var(--text2)">Select your name:</p>
        ${links}
        <p style="margin-top:1rem"><a href="/faculty/">← Back to Faculty Dashboard</a></p>
      </div>`;
    return;
  }

  // Remember this slug so other faculty pages can link back here
  localStorage.setItem('faculty-slug', slug);

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

      const _ts = act.time.split(/\s*[-–]\s*/)[0].trim();
      const timeStart = /AM|PM/i.test(_ts) ? _ts : (m => m ? _ts + ' ' + m[0].toUpperCase() : _ts)(act.time.match(/AM|PM/i));

      let html = `<div class="act-time">${timeStart}</div>`;
      html += `<div class="act-body">`;
      html += `<div class="act-name">${myAssignment ? '<span class="assign-star">★</span> ' : ''}${act.activity}</div>`;
      if (act.location) html += `<div class="act-loc">${act.location.replace(/<a href="\/rooms\.html[^"]*"[^>]*>.*?<\/a>/g, '').trim()}</div>`;
      if (myAssignment) {
        const detail = formatAssignment(myAssignment);
        if (detail) html += `<div class="assignment-detail">${detail}</div>`;
      }
      html += `</div>`;
      li.innerHTML = html;
      li.addEventListener('click', () => showStaffEvent(act, myAssignment || null, li));
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
