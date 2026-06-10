let scheduleData = [];
let globalBannerData = {};

const _stripGuide = s => s ? s.replace(/<a href="\/rooms\.html[^"]*"[^>]*>.*?<\/a>/g, '').trim() : s;

const LARGE_ENSEMBLE_LOC = {
  symphonic: {location: 'Feasel Hall',   mapUrl: 'https://maps.app.goo.gl/5mDXBVoTABQhHF5L6'},
  concert:   {location: 'Tinsley Hall',  mapUrl: 'https://maps.app.goo.gl/wdAMPGnM3GRCCsnA8'}
};

const JAZZ_DATA = [
  {num: 1, instructor: 'Wilson',     room: 'Tinsley Hall'},
  {num: 2, instructor: 'Pyburn',     room: 'Presser 202'},
  {num: 3, instructor: 'Amann',      room: 'Presser 112'},
  {num: 4, instructor: 'Kolodinsky', room: 'Presser 349'},
  {num: 5, instructor: 'Murphy',     room: 'Presser 352'},
  {num: 6, instructor: 'Becker',     room: 'Presser 113'}
];

const CHAMBER_ROSTERS = {
  'amann-con':      {name: 'Amann',      type: 'Concert',   room: 'Presser 202',  students: []},
  'guthrie-con':    {name: 'Guthrie',    type: 'Concert',   room: 'Tinsley Hall', students: []},
  'hinote-con':     {name: 'Hinote',     type: 'Concert',   room: 'Presser 113',  students: []},
  'kolodinsky-con': {name: 'Kolodinsky', type: 'Concert',   room: 'Presser 352',  students: []},
  'murphy-con':     {name: 'Murphy',     type: 'Concert',   room: 'Presser 349',  students: []},
  'whitt-con':      {name: 'Whitt',      type: 'Concert',   room: 'Presser 112',  students: []},
  'amann-sym':      {name: 'Amann',      type: 'Symphonic', room: 'Presser 128 (Boyd Jones\'s Studio)', students: []},
  'becker-sym':     {name: 'Becker',     type: 'Symphonic', room: 'Presser 113',  students: []},
  'kalina-sym':     {name: 'Kalina',     type: 'Symphonic', room: 'Presser 202',  students: []},
  'leavitt-sym':    {name: 'Leavitt',    type: 'Symphonic', room: 'Feasel Hall',  students: []},
  'murphy-sym':     {name: 'Murphy',     type: 'Symphonic', room: 'Lee Chapel',   students: []},
  'pyburn-sym':     {name: 'Pyburn',     type: 'Symphonic', room: 'Presser 112',  students: []},
  'rosenberg-sym':  {name: 'Rosenberg',  type: 'Symphonic', room: 'Presser 349',  students: []},
  'wilson-sym':     {name: 'Wilson',     type: 'Symphonic', room: 'Feasel Hall',  students: []},
  'zelenak-sym':    {name: 'Zelenak',    type: 'Symphonic', room: 'Presser 352',  students: []},
};

function showRoster(key) {
  const data = CHAMBER_ROSTERS[key];
  if (!data) return;
  const overlay = document.getElementById('rosterOverlay');
  const detail  = document.getElementById('rosterDetail');
  if (!overlay || !detail) return;
  let html = `<div class="event-hd">${data.name}</div>`;
  html += `<div style="color:var(--text2);font-size:0.9em;margin-bottom:1rem">${data.type} Chamber · ${data.room}</div>`;
  if (data.students.length) {
    html += data.students.map(s => `<div class="event-note-line"><span>${s}</span></div>`).join('');
  } else {
    html += `<p style="color:var(--text2);font-style:italic;margin:0">Roster coming soon</p>`;
  }
  detail.innerHTML = html;
  overlay.classList.add('show');
}

function closeRoster() {
  document.getElementById('rosterOverlay')?.classList.remove('show');
}

const LARGE_ENSEMBLE_INFO = {
  concert:   {name: 'Concert Saxophones',   location: 'Tinsley Hall (inside Presser Hall)', grade: 'Rising 7th–9th grade',   conductors: ['Mr. Guthrie', 'Mr. Kolodinsky']},
  symphonic: {name: 'Symphonic Saxophones', location: 'Feasel Hall',                        grade: 'Rising 10th–12th grade', conductors: ['Dr. Wilson', 'Dr. Zelenak']}
};

function showLargeEnsemble(key) {
  const data = LARGE_ENSEMBLE_INFO[key];
  if (!data) return;
  const overlay = document.getElementById('rosterOverlay');
  const detail  = document.getElementById('rosterDetail');
  if (!overlay || !detail) return;
  let html = `<div class="event-hd">${data.name}</div>`;
  html += `<div style="color:var(--text2);font-size:0.9em;margin-bottom:1rem">${data.location}</div>`;
  html += `<p style="margin:0 0 0.35rem"><em>${data.grade}</em></p>`;
  html += `<p style="margin:0">Conductors: ${data.conductors.join(', ')}</p>`;
  detail.innerHTML = html;
  overlay.classList.add('show');
}

const FUNDAMENTALS_DATA = {
  soprano: {room: 'Presser 202',  instructor: 'Amann'},
  alto:    {concert:   {room: 'Presser 113',  instructor: 'Becker'},
            symphonic: {room: 'Presser 352',  instructor: 'Hinote'}},
  tenor:   {concert:   {room: 'Presser 349',  instructor: 'Pyburn'},
            symphonic: {room: 'Presser 112',  instructor: 'Kalina'}},
  bari:    {concert:   {room: 'Tinsley Hall', instructor: 'Whitt'},
            symphonic: {room: 'Feasel Hall',  instructor: 'Murphy'}}
};

const CHAMBER_DATA = {
  symphonic: [
    {coach: 'Amann',     room: 'Presser 128 (Boyd Jones\'s Studio)'},
    {coach: 'Becker',    room: 'Presser 113'},
    {coach: 'Kalina',    room: 'Presser 202'},
    {coach: 'Leavitt',   room: 'Feasel Hall'},
    {coach: 'Murphy',    room: 'Lee Chapel'},
    {coach: 'Pyburn',    room: 'Presser 112'},
    {coach: 'Rosenberg', room: 'Presser 349'},
    {coach: 'Wilson',    room: 'Feasel Hall'},
    {coach: 'Zelenak',   room: 'Presser 352'}
  ],
  concert: [
    {coach: 'Amann',      room: 'Presser 202'},
    {coach: 'Guthrie',    room: 'Tinsley Hall'},
    {coach: 'Hinote',     room: 'Presser 113'},
    {coach: 'Kolodinsky', room: 'Presser 352'},
    {coach: 'Murphy',     room: 'Presser 349'},
    {coach: 'Whitt',      room: 'Presser 112'}
  ]
};

// Event detail sheet state
let selectedRow = null;
let currentAct   = null;
let nowActivity  = null;
let nowActivityDay = null;
let nowRowEl     = null;
let nextRowEl    = null;

const sunSVG  = `<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/></svg>`;
const moonSVG = `<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/></svg>`;

function updateStickyTop() {
  const header = document.querySelector('.header');
  const notice = document.getElementById('global-notice');
  const daily  = document.getElementById('daily-banner');
  let h = header ? header.getBoundingClientRect().height : 53;
  if (notice && notice.style.display !== 'none') h += notice.getBoundingClientRect().height;
  if (daily  && daily.style.display  !== 'none') h += daily.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--sticky-top', `${Math.ceil(h) + 12}px`);
}

function themeTag(theme) {
  const m = theme.match(/^(\p{Emoji_Presentation}️?\s*)(.*)/su);
  return m ? `${m[1]}<em>${m[2]}</em>` : `<em>${theme}</em>`;
}

function fmtTime(d) {
  if (!d) return '';
  let h = d.getHours(), m = d.getMinutes();
  const suf = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m === 0 ? `${h} ${suf}` : `${h}:${String(m).padStart(2,'0')} ${suf}`;
}

function parseActivityTimes(timeStr, dayDateStr) {
  const [year, month, dayNum] = dayDateStr.split('-').map(Number);
  const refDate = new Date(year, month - 1, dayNum);
  const parts = (timeStr || '').split('-').map(t => t.trim());
  const isRange = parts.length > 1;
  let startStr = parts[0];
  let endStr = isRange ? parts[parts.length - 1] : parts[0];
  if (isRange) {
    const startHasAmPm = /\s(AM|PM)$/i.test(startStr);
    const endHasAmPm   = /\s(AM|PM)$/i.test(endStr);
    if (!startHasAmPm && endHasAmPm) startStr += endStr.match(/\s(AM|PM)$/i)[0];
    else if (startHasAmPm && !endHasAmPm) endStr += startStr.match(/\s(AM|PM)$/i)[0];
  }
  const start = parseTime(startStr, refDate);
  let end = parseTime(endStr, refDate);
  if (!isRange && start) end = new Date(start.getTime() + 60000);
  return { start, end };
}

function updateDarkBtnIcon() {
  const btn = document.getElementById('darkBtn');
  if (!btn) return;
  const isDark = document.body.classList.contains('dark');
  btn.innerHTML = isDark ? sunSVG : moonSVG;
}

function showEvent(act, rowEl) {
  currentAct = act;
  if (selectedRow) selectedRow.classList.remove('selected');
  selectedRow = rowEl;
  if (rowEl) rowEl.classList.add('selected');

  const clockSVG = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 7v5l3 3"/></svg>`;
  const pinSVG  = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/></svg>`;

  let html = `<div class="event-hd">${act.activity}</div>`;
  html += `<div class="event-meta-row"><span class="c-icon">${clockSVG}</span><span>${act.time}</span></div>`;
  if (act.location) {
    const pillStyle = `display:inline-block;padding:2px 9px;background:var(--forest-mid);color:#fff;border-radius:var(--r-full);text-decoration:none;font-size:0.8em;margin-left:4px`;
    let locHTML = act.location.replace(/<a\s[^>]*href="([^"]+)"[^>]*>map<\/a>/gi,
      `<a href="$1" target="_blank" style="${pillStyle}">↗ Map</a>`);
    if (act.mapUrl) locHTML += ` <a href="${act.mapUrl}" target="_blank" style="${pillStyle}">↗ Map</a>`;
    html += `<div class="event-meta-row"><span class="c-icon">${pinSVG}</span><span>${locHTML}</span></div>`;
  }
  if (act.notes && act.notes.length && !(act.ensembleMap && localStorage.getItem('campEnsemble')) && !(act.fundamentalsClass && localStorage.getItem('campInstrument'))) {
    html += `<div class="event-notes"><div class="event-notes-lbl">Notes</div>`;
    html += act.notes.map(n => `<div class="event-note-line"><span>${n}</span></div>`).join('');
    html += `</div>`;
  }
  const mealMatch = /\b(breakfast|lunch|dinner)\b/i.exec(act.activity || '');
  if (mealMatch) {
    const meal = mealMatch[1].toLowerCase();
    const dayOfWeek = act._date ? new Date(act._date + 'T12:00:00').getDay() : -1;
    const isMonday = dayOfWeek === 1;
    const isThursday = dayOfWeek === 4;
    const isFriday = dayOfWeek === 5;
    let rallyLines;
    if (meal === 'breakfast') {
      rallyLines = [`After breakfast, meet at rally points outside the CUB.`];
    } else if (isThursday) {
      rallyLines = [];
    } else if (meal === 'lunch' && isMonday) {
      rallyLines = [`After lunch, meet at rally points outside the CUB.`];
    } else if (isMonday) {
      rallyLines = [`After dinner, meet at rally points outside the CUB.`];
    } else {
      const beforeLoc = isFriday ? 'Hatter' : 'Presser';
      rallyLines = [`Before ${meal}, meet at rally points outside ${beforeLoc}.`, `After ${meal}, meet at rally points outside the CUB.`];
    }
    if (rallyLines.length) {
      html += `<div class="event-notes" style="margin-top:0.6rem"><div class="event-notes-lbl">Rally Points</div>${rallyLines.map(l => `<div class="event-note-line"><span>${l}</span></div>`).join('')}</div>`;
    }
  }
  const actName = act.activity || '';
  if (/Chamber Music Dress Rehearsal/i.test(actName) || /Chamber Music Concert/i.test(actName) || /^Dress Rehearsals$/i.test(actName)) {
    const rallyNote = /Chamber Music Concert/i.test(actName)
      ? 'After the concert, meet at rally points outside Presser.'
      : 'After dress rehearsal, meet at rally points outside Presser.';
    html += `<div class="event-notes" style="margin-top:0.6rem"><div class="event-notes-lbl">Rally Points</div><div class="event-note-line"><span>${rallyNote}</span></div></div>`;
  }
  if (act.groupMap) {
    html += renderGroupSelector(act.groupMap);
  } else if (act.ensembleMap || act.ensemblePrompt) {
    html += renderEnsembleSelector(act.ensembleMap || act.ensemblePrompt);
  } else if (act.jazzClasses) {
    html += renderJazzSelector();
  } else if (act.fundamentalsClass) {
    html += renderFundamentalsSelector();
  } else if (act.detail) {
    html += `<div class="event-detail">${act.detail}</div>`;
  }

  document.getElementById('eventDetail').innerHTML = html;
  document.getElementById('eventOverlay').classList.add('show');
}

function openLightbox(url) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = '<img id="lightbox-img">';
    lb.addEventListener('click', closeLightbox);
    document.body.appendChild(lb);
  }
  document.getElementById('lightbox-img').src = url;
  lb.classList.add('show');
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('show');
}

function closeEvent() {
  if (selectedRow) { selectedRow.classList.remove('selected'); selectedRow = null; }
  document.getElementById('eventOverlay').classList.remove('show');
}

function renderGroupSelector(groupMap) {
  const saved = localStorage.getItem('campGroup');
  const mapBtnStyle = "display:inline-block;padding:2px 9px;background:var(--forest-mid);color:#fff;border-radius:var(--r-full);text-decoration:none;font-size:0.8em;margin-left:6px;cursor:pointer";
  const grpBtnStyle = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.9em;cursor:pointer;font-family:inherit;font-weight:600";

  if (saved) {
    const entry = groupMap.find(f => f.groups.includes(saved));
    const rallyText = entry?.rallyPoints?.[saved];
    const floorLabel = rallyText ? ` — ${rallyText}` : (entry?.floor ? ` → ${entry.floor}` : '');
    const mapUrl = entry ? entry.mapUrl : groupMap[0].mapUrl;
    const mapLink = mapUrl ? `<a onclick='openLightbox("${mapUrl}")' style='${mapBtnStyle}'>↗ Map</a>` : '';
    return `<div class="event-detail"><p><strong>Your group: ${saved}</strong>${floorLabel}${mapLink}</p><button onclick='clearCampGroup()' style='background:none;border:none;color:var(--text3);font-size:0.8em;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit'>Change group</button></div>`;
  }

  const multiFloor = groupMap.length > 1;
  let html = `<div class="event-detail"><p style='font-style:italic;color:var(--text2);margin:0 0 0.5rem'>Tap your group for customized instructions.</p>`;
  groupMap.forEach(entry => {
    html += `<div style='margin-bottom:0.35rem'>`;
    if (multiFloor && entry.floor) html += `<span style='font-size:0.82em;color:var(--text2);margin-right:4px'>${entry.floor}:</span>`;
    if (multiFloor && entry.mapUrl) html += `<a onclick='openLightbox("${entry.mapUrl}")' style='${mapBtnStyle};margin-left:0;margin-bottom:4px;display:inline-block'>↗ Map</a><br>`;
    entry.groups.forEach(g => {
      html += `<button onclick='selectCampGroup("${g}")' style='${grpBtnStyle}'>${g}</button>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  return html;
}

function selectCampGroup(group) {
  localStorage.setItem('campGroup', group);
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
  initRallyCard();
}

function clearCampGroup() {
  localStorage.removeItem('campGroup');
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
  initRallyCard();
}

async function initRallyCard() {
  const card = document.getElementById('rally-card');
  if (!card) return;

  const saved = localStorage.getItem('campGroup');
  const now = getCurrentTime();
  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  let data;
  try {
    const res = await fetch('/data/schedule.json');
    data = await res.json();
  } catch (e) {
    return;
  }

  const todayData = data.find(d => d.date === todayStr);

  const nextRally = todayData?.activities.find(act => {
    if (!act.groupMap) return false;
    const { start } = parseActivityTimes(act.time, todayData.date);
    return start && start >= now;
  });

  if (!nextRally) {
    card.innerHTML = '';
    return;
  }

  const { start } = parseActivityTimes(nextRally.time, todayData.date);
  const timeLabel = start ? fmtTime(start) : nextRally.time.split(/\s*-\s*/)[0].trim();
  const headerStyle = 'font-size:0.82em;color:var(--text2);margin-bottom:0.25rem';

  card.innerHTML = `<div style="margin-bottom:1rem;padding:0.75rem 1rem;background:var(--surface2);border-radius:var(--r);border:1px solid var(--border)"><div style="${headerStyle}">${timeLabel} — ${nextRally.activity}</div>${renderGroupSelector(nextRally.groupMap)}</div>`;
}

function renderEnsembleSelector(ensembleMap) {
  const ens   = localStorage.getItem('campEnsemble');
  const coach = localStorage.getItem('campChamber');

  const mapBtnStyle    = "display:inline-block;padding:2px 9px;background:var(--forest-mid);color:#fff;border-radius:var(--r-full);text-decoration:none;font-size:0.8em;margin-left:6px";
  const ensBtnStyle    = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.85em;cursor:pointer;font-family:inherit";
  const coachBtnStyle  = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.9em;cursor:pointer;font-family:inherit;font-weight:600";
  const changeBtnStyle = "background:none;border:none;color:var(--text3);font-size:0.8em;cursor:pointer;text-decoration:underline;padding:4px 0 0;display:block;font-family:inherit";

  let html = '<div class="event-detail">';

  if (!ens) {
    html += `<p style='font-style:italic;color:var(--text2);margin:0 0 0.5rem'>Which ensemble are you in?</p>`;
    html += `<button onclick='selectEnsemble("concert")' style='${ensBtnStyle}'>Concert — 7th–9th</button> `;
    html += `<button onclick='selectEnsemble("symphonic")' style='${ensBtnStyle}'>Symphonic — 10th–12th</button>`;
    return html + '</div>';
  }

  const ensLabel     = ens === 'symphonic' ? 'Symphonic Saxophones' : 'Concert Saxophones';
  const slotActivity = ensembleMap[ens];
  const le           = LARGE_ENSEMBLE_LOC[ens];
  const chamberList  = CHAMBER_DATA[ens];
  const chamberEntry = coach ? chamberList.find(c => c.coach === coach) : null;

  html += `<p style='margin:0 0 0.35rem'><strong>${ensLabel}</strong></p>`;

  if (slotActivity === 'large') {
    const mapLink = le.mapUrl ? `<a href='${le.mapUrl}' target='_blank' style='${mapBtnStyle}'>↗ Map</a>` : '';
    html += `<p style='margin:0 0 0.5rem'>Large Ensemble — ${le.location}${mapLink}</p>`;
  } else {
    if (chamberEntry) {
      html += `<p style='margin:0 0 0.5rem'>Chamber Ensemble — ${chamberEntry.room} (${coach})</p>`;
    } else {
      html += `<p style='margin:0 0 0.25rem;color:var(--text2);font-size:0.9em'>Chamber Ensemble — pick yours below</p>`;
    }
  }

  if (!coach) {
    html += `<p style='font-style:italic;color:var(--text2);margin:0 0 0.35rem;font-size:0.9em'>Which chamber ensemble are you in?</p>`;
    chamberList.forEach(c => {
      html += `<button onclick='selectChamber("${c.coach}")' style='${coachBtnStyle}'>${c.coach}</button>`;
    });
  } else {
    if (slotActivity === 'large' && chamberEntry) {
      html += `<p style='margin:0;color:var(--text2);font-size:0.85em'>Chamber: ${coach} — ${chamberEntry.room}</p>`;
    }
    html += `<button onclick='clearEnsemble()' style='${changeBtnStyle}'>Change</button>`;
  }

  return html + '</div>';
}

function selectEnsemble(ens) {
  localStorage.setItem('campEnsemble', ens);
  localStorage.removeItem('campChamber');
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function selectChamber(coach) {
  localStorage.setItem('campChamber', coach);
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function clearEnsemble() {
  localStorage.removeItem('campEnsemble');
  localStorage.removeItem('campChamber');
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function getPersonalizedLocation(act) {
  const ens   = localStorage.getItem('campEnsemble');
  const coach = localStorage.getItem('campChamber');
  const jazz  = localStorage.getItem('campJazz');

  if (act.groupMap) {
    const saved = localStorage.getItem('campGroup');
    if (saved) {
      const entry = act.groupMap.find(f => f.groups.includes(saved));
      if (entry?.rallyPoints?.[saved]) return entry.rallyPoints[saved];
    }
  }

  if (act.ensembleMap && ens) {
    const slotActivity = act.ensembleMap[ens];
    if (slotActivity === 'large') return LARGE_ENSEMBLE_LOC[ens].location;
    if (slotActivity === 'chamber' && coach) {
      const entry = CHAMBER_DATA[ens].find(c => c.coach === coach);
      return entry ? entry.room : null;
    }
  }
  if (act.jazzClasses && jazz) {
    const entry = JAZZ_DATA.find(j => String(j.num) === jazz);
    return entry ? entry.room : null;
  }
  if (act.fundamentalsClass) {
    const info = getFundamentalsInfo();
    return info ? info.room : null;
  }
  return null;
}

function getEnsembleActivityName(act) {
  const ens = localStorage.getItem('campEnsemble');
  if (!ens || !act.ensembleMap) return null;
  const slotActivity = act.ensembleMap[ens];
  const ensLabel = ens === 'symphonic' ? 'Symphonic' : 'Concert';
  return slotActivity === 'large' ? `${ensLabel} Saxophone Ensemble` : `${ensLabel} Chamber Ensemble`;
}

function getEnsemblePills(act) {
  const ens   = localStorage.getItem('campEnsemble');
  const coach = localStorage.getItem('campChamber');
  if (!ens || !act.ensembleMap) return null;
  const slotActivity = act.ensembleMap[ens];
  const le = LARGE_ENSEMBLE_LOC[ens];
  if (slotActivity === 'large') return [`Large Ensemble — ${le.location}`];
  if (coach) {
    const entry = CHAMBER_DATA[ens].find(c => c.coach === coach);
    return [entry ? `Chamber — ${entry.room} (${coach})` : 'Chamber Ensemble'];
  }
  return ['Chamber Ensemble'];
}

function renderJazzSelector() {
  const saved = localStorage.getItem('campJazz');
  const btnStyle    = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.9em;cursor:pointer;font-family:inherit;font-weight:600";
  const changeBtnStyle = "background:none;border:none;color:var(--text3);font-size:0.8em;cursor:pointer;text-decoration:underline;padding:4px 0 0;display:block;font-family:inherit";

  if (saved) {
    const entry = JAZZ_DATA.find(j => String(j.num) === saved);
    return `<div class="event-detail"><p style='margin:0 0 0.25rem'>Jazz — ${entry.instructor} · ${entry.room}</p><button onclick='clearJazz()' style='${changeBtnStyle}'>Change</button></div>`;
  }

  let html = `<div class="event-detail"><p style='font-style:italic;color:var(--text2);margin:0 0 0.5rem'>Who is your jazz instructor?</p>`;
  JAZZ_DATA.forEach(j => {
    html += `<button onclick='selectJazz(${j.num})' style='${btnStyle}'>${j.instructor}</button>`;
  });
  return html + '</div>';
}

function selectJazz(num) {
  localStorage.setItem('campJazz', String(num));
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function clearJazz() {
  localStorage.removeItem('campJazz');
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function getFundamentalsInfo() {
  const instrument = localStorage.getItem('campInstrument');
  if (!instrument) return null;
  const data = FUNDAMENTALS_DATA[instrument];
  if (!data) return null;
  if (data.room) return data;
  const ens = localStorage.getItem('campEnsemble');
  return ens ? data[ens] : null;
}

function renderFundamentalsSelector() {
  const instrument = localStorage.getItem('campInstrument');
  const ens        = localStorage.getItem('campEnsemble');
  const btnStyle        = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.9em;cursor:pointer;font-family:inherit;font-weight:600";
  const ensBtnStyle     = "margin:2px;padding:5px 11px;background:var(--surface2);color:var(--text);border:1.5px solid var(--border);border-radius:var(--r-full);font-size:0.85em;cursor:pointer;font-family:inherit";
  const changeBtnStyle  = "background:none;border:none;color:var(--text3);font-size:0.8em;cursor:pointer;text-decoration:underline;padding:4px 0 0;display:block;font-family:inherit";
  const LABELS = {soprano: 'Soprano', alto: 'Alto', tenor: 'Tenor', bari: 'Baritone'};

  if (instrument) {
    const info = getFundamentalsInfo();
    if (info) {
      return `<div class="event-detail"><p style='margin:0 0 0.25rem'>${LABELS[instrument]} — ${info.room} (${info.instructor})</p><button onclick='clearInstrument()' style='${changeBtnStyle}'>Change</button></div>`;
    }
    return `<div class="event-detail"><p style='margin:0 0 0.35rem;color:var(--text2);font-size:0.9em'>Your room depends on your ensemble — set it below.</p>` +
      `<button onclick='selectEnsemble("concert")' style='${ensBtnStyle}'>Concert — 7th–9th</button> ` +
      `<button onclick='selectEnsemble("symphonic")' style='${ensBtnStyle}'>Symphonic — 10th–12th</button>` +
      `<button onclick='clearInstrument()' style='${changeBtnStyle}'>Change instrument</button></div>`;
  }

  let html = `<div class="event-detail"><p style='font-style:italic;color:var(--text2);margin:0 0 0.5rem'>What instrument do you play?</p>`;
  Object.entries(LABELS).forEach(([key, label]) => {
    html += `<button onclick='selectInstrument("${key}")' style='${btnStyle}'>${label}</button>`;
  });
  return html + '</div>';
}

function selectInstrument(instrument) {
  localStorage.setItem('campInstrument', instrument);
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function clearInstrument() {
  localStorage.removeItem('campInstrument');
  if (currentAct && selectedRow) showEvent(currentAct, selectedRow);
}

function getFundamentalsActivityName(act) {
  if (!act.fundamentalsClass) return null;
  const info = getFundamentalsInfo();
  return info ? `Fundamentals — ${info.room}` : null;
}

function getFundamentalsPills(act) {
  if (!act.fundamentalsClass) return null;
  const info = getFundamentalsInfo();
  return info ? [`Fundamentals — ${info.room} (${info.instructor})`] : null;
}

function getJazzActivityName(act) {
  const saved = localStorage.getItem('campJazz');
  if (!saved || !act.jazzClasses) return null;
  const entry = JAZZ_DATA.find(j => String(j.num) === saved);
  return entry ? `Jazz — ${entry.instructor}` : null;
}

function getJazzPills(act) {
  const saved = localStorage.getItem('campJazz');
  if (!saved || !act.jazzClasses) return null;
  const entry = JAZZ_DATA.find(j => String(j.num) === saved);
  return entry ? [`Jazz — ${entry.instructor} (${entry.room})`] : null;
}

function refreshDisplayForCurrentTime() {
  if (!scheduleData || scheduleData.length === 0) return;

  const openCardIds = new Set();
  document.querySelectorAll('#schedule-container .day-card.open').forEach(card => {
    if (card.id) openCardIds.add(card.id);
  });

  const currentTime = getCurrentTime();

  renderSchedule(scheduleData, { animate: false });

  if (openCardIds.size > 0) {
    openCardIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('open');
    });
  } else {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const dayNum = String(currentTime.getDate()).padStart(2, '0');
    const currentDateKey = `${year}-${month}-${dayNum}`;
    const currentDayCard = document.getElementById(currentDateKey);
    if (currentDayCard) currentDayCard.classList.add('open');
  }

  updateNowNextFromHiddenData();
  applyBanner();
  updateStickyTop();
  updateDarkMode();
}


async function loadSchedule() {
  const container = document.getElementById('schedule-container');
  if (!container) return;

  const pageTypeMeta = document.querySelector('meta[name="page-type"]');
  const schedulePath = '/data/schedule.json';

  try {
    const res = await fetch(schedulePath);
    if (!res.ok) throw new Error(`Failed to fetch ${schedulePath}: ${res.statusText}`);
    scheduleData = await res.json();
    renderSchedule(scheduleData);
  } catch (error) {
    console.error("Error loading schedule data:", error);
    container.innerHTML = `<p style="color: red; text-align: center;">Could not load the schedule. Please try again later.</p>`;
  }
}


function renderSchedule(scheduleData, { animate = true } = {}) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = '';
  nowActivity = null; nowActivityDay = null; nowRowEl = null; nextRowEl = null;

  const now = getCurrentTime();
  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  scheduleData.forEach(day => {
    const isToday = day.date === todayStr;

    let curIdx = -1;
    if (isToday) {
      day.activities.forEach((act, i) => {
        const { start, end } = parseActivityTimes(act.time, day.date);
        if (start && end && now >= start && now < end) curIdx = i;
      });
    }

    const card = document.createElement('div');
    card.className = 'day-card' + (isToday ? ' open' : '') + (animate ? '' : ' no-animate');
    card.id = day.date;

    const [year, month, dayNum] = day.date.split('-').map(Number);
    const weekdayName = new Date(year, month - 1, dayNum).toLocaleDateString('en-US', { weekday: 'long' });

    const tog = document.createElement('button');
    tog.className = 'day-toggle';
    tog.type = 'button';
    tog.innerHTML = `
      <div class="chevron"></div>
      <div class="day-hd"><div class="day-name">${weekdayName}</div></div>
      <div class="day-tags">
        ${isToday ? '<span class="tag tag-today">Today</span>' : ''}
        ${day.themeTitle ? `<span class="tag tag-theme">${themeTag(day.themeTitle)}</span>` : ''}
      </div>`;
    tog.addEventListener('click', () => card.classList.toggle('open'));
    card.appendChild(tog);

    const ul = document.createElement('ul');
    ul.className = 'act-list';

    const isFacultyPage = document.querySelector('meta[name="page-type"]')?.content === 'faculty';
    day.activities.forEach((act, i) => {
      act._date = day.date;
      if (act.audience === 'faculty' && !isFacultyPage) return;
      const isCur = isToday && i === curIdx;
      let isPast = false;
      if (isToday && !isCur) {
        const { end } = parseActivityTimes(act.time, day.date);
        isPast = !!(end && end <= now);
      }

      const { start } = parseActivityTimes(act.time, day.date);
      const timeDisplay = start ? fmtTime(start) : act.time.split(/\s*-\s*/)[0].trim();

      const li = document.createElement('li');
      li.id = `activity-${day.date}-${act.time.replace(/[^a-zA-Z0-9]/g, '')}`;
      li.className = 'act-row' + (isCur ? ' current' : '') + (isPast ? ' past' : '');
      li.innerHTML = `
        <div class="act-time">${timeDisplay}</div>
        <div class="act-body">
          <div class="act-name">${getEnsembleActivityName(act) || getJazzActivityName(act) || getFundamentalsActivityName(act) || act.activity}</div>
          ${(() => { const loc = _stripGuide(getPersonalizedLocation(act) || act.location); return loc ? `<div class="act-loc">${loc}</div>` : ''; })()}
        </div>`;

      if (isCur) { nowActivity = act; nowActivityDay = day; nowRowEl = li; }
      if (isToday && i === curIdx + 1) nextRowEl = li;

      li.addEventListener('click', () => showEvent(act, li));
      ul.appendChild(li);
    });

    card.appendChild(ul);
    container.appendChild(card);
  });
}

function updateNowNextFromHiddenData() {
    const now = getCurrentTime();
    const todayDateString = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    let foundNowActivity = null;
    let nowActivityDayDetails = null;
    let firstFutureOfToday = null;
    let firstFutureOfToday_DayDetails = null;
    let firstFutureOfToday_IndexInActivities = -1;

    const todayIndexInSchedule = scheduleData.findIndex(day => day.date === todayDateString);

    if (todayIndexInSchedule !== -1) {
        const currentDayData = scheduleData[todayIndexInSchedule];

        for (let i = 0; i < currentDayData.activities.length; i++) {
            const activity = currentDayData.activities[i];
            const [year, month, dayVal] = currentDayData.date.split('-').map(Number);
            const activitysActualDate = new Date(year, month - 1, dayVal);

            let parsedStartStr;
            let parsedEndStr;
            const timeActivityStr = activity.time || "";
            const timeParts = timeActivityStr.split('-').map(t => t.trim());
            const isOriginalRange = timeParts.length > 1;

            parsedStartStr = timeParts[0];
            if (isOriginalRange) {
                parsedEndStr = timeParts[1];
            } else {
                parsedEndStr = parsedStartStr;
            }

            if (isOriginalRange) {
                const startHasAmPm = /\s(AM|PM)$/i.test(parsedStartStr);
                const endHasAmPm = /\s(AM|PM)$/i.test(parsedEndStr);
                if (!startHasAmPm && endHasAmPm) {
                    parsedStartStr += parsedEndStr.match(/\s(AM|PM)$/i)[0];
                } else if (startHasAmPm && !endHasAmPm) {
                    parsedEndStr += parsedStartStr.match(/\s(AM|PM)$/i)[0];
                }
            }
            const isSinglePoint = !isOriginalRange;

            const startTime = parseTime(parsedStartStr, activitysActualDate);
            let endTime = parseTime(parsedEndStr, activitysActualDate);

            if (isSinglePoint && startTime) {
                endTime = new Date(startTime.getTime() + 60000);
            }

            if (!foundNowActivity && startTime && endTime && now >= startTime && now < endTime) {
                foundNowActivity = activity;
                nowActivityDayDetails = currentDayData;
                break;
            }

            if (!foundNowActivity && startTime && now < startTime) {
                if (!firstFutureOfToday) {
                    firstFutureOfToday = activity;
                    firstFutureOfToday_DayDetails = currentDayData;
                    firstFutureOfToday_IndexInActivities = i;
                }
            }
        }
    }

    let activityToDisplayAsNow = null;
    let dayToDisplayAsNow = null;
    let activityToDisplayAsNext = null;
    let dayToDisplayAsNext = null;

    if (foundNowActivity) {
        activityToDisplayAsNow = foundNowActivity;
        dayToDisplayAsNow = nowActivityDayDetails;
        const nowIndex = nowActivityDayDetails.activities.indexOf(foundNowActivity);
        if (nowIndex !== -1 && nowIndex + 1 < nowActivityDayDetails.activities.length) {
            activityToDisplayAsNext = nowActivityDayDetails.activities[nowIndex + 1];
            dayToDisplayAsNext = nowActivityDayDetails;
        }
    } else if (firstFutureOfToday) {
        activityToDisplayAsNow = firstFutureOfToday;
        dayToDisplayAsNow = firstFutureOfToday_DayDetails;
        if (firstFutureOfToday_IndexInActivities !== -1 && firstFutureOfToday_IndexInActivities + 1 < firstFutureOfToday_DayDetails.activities.length) {
            activityToDisplayAsNext = firstFutureOfToday_DayDetails.activities[firstFutureOfToday_IndexInActivities + 1];
            dayToDisplayAsNext = firstFutureOfToday_DayDetails;
        }
    }

    if (!activityToDisplayAsNow || !activityToDisplayAsNext) {
        let searchStartDayIndex = 0;

        if (dayToDisplayAsNow) {
            const lastProcessedDayIndex = scheduleData.findIndex(d => d.date === dayToDisplayAsNow.date);
            searchStartDayIndex = (lastProcessedDayIndex !== -1) ? lastProcessedDayIndex + 1 : 0;
        } else {
            const firstRelevantDayIndex = scheduleData.findIndex(d => d.date >= todayDateString);
            searchStartDayIndex = (firstRelevantDayIndex !== -1) ? firstRelevantDayIndex : scheduleData.length;
        }

        for (let i = searchStartDayIndex; i < scheduleData.length; i++) {
            const day = scheduleData[i];
            if (day.activities && day.activities.length > 0) {
                if (!activityToDisplayAsNow) {
                    activityToDisplayAsNow = day.activities[0];
                    dayToDisplayAsNow = day;
                    if (day.activities.length > 1) {
                        activityToDisplayAsNext = day.activities[1];
                        dayToDisplayAsNext = day;
                    }
                    if (activityToDisplayAsNext || day.activities.length === 1) break;
                } else if (!activityToDisplayAsNext) {
                    activityToDisplayAsNext = day.activities[0];
                    dayToDisplayAsNext = day;
                    break;
                }
            }
            if (activityToDisplayAsNow && activityToDisplayAsNext) break;
        }
    }

    // Update Now card
    const nowNameEl  = document.getElementById('nowName');
    const nowMetaEl  = document.getElementById('nowMeta');
    const nowPillsEl = document.getElementById('nowPills');

    if (nowNameEl && activityToDisplayAsNow && dayToDisplayAsNow) {
        nowNameEl.textContent = getEnsembleActivityName(activityToDisplayAsNow) || getJazzActivityName(activityToDisplayAsNow) || getFundamentalsActivityName(activityToDisplayAsNow) || activityToDisplayAsNow.activity;

        const { start, end } = parseActivityTimes(activityToDisplayAsNow.time, dayToDisplayAsNow.date);
        let metaParts = [];
        const nowLoc = _stripGuide(getPersonalizedLocation(activityToDisplayAsNow) || activityToDisplayAsNow.location);
        if (nowLoc) metaParts.push(`<span>${nowLoc}</span><span class="now-sep">·</span>`);
        if (start) metaParts.push(`<span>${fmtTime(start)}${end ? ' – ' + fmtTime(end) : ''}</span>`);
        if (nowMetaEl) nowMetaEl.innerHTML = metaParts.join('');

        if (nowPillsEl) {
            const ensemblePills = getEnsemblePills(activityToDisplayAsNow) || getJazzPills(activityToDisplayAsNow) || getFundamentalsPills(activityToDisplayAsNow);
            if (ensemblePills) {
                nowPillsEl.innerHTML = ensemblePills.map(n => `<span class="now-pill"><span>${n}</span></span>`).join('');
            } else if (activityToDisplayAsNow.notes && activityToDisplayAsNow.notes.length) {
                nowPillsEl.innerHTML = activityToDisplayAsNow.notes.map(n =>
                    `<span class="now-pill"><span>${_stripGuide(n)}</span></span>`).join('');
            } else {
                nowPillsEl.innerHTML = '';
            }
        }

        // Store for tap handler — look up row after renderSchedule has run
        nowActivity    = activityToDisplayAsNow;
        nowActivityDay = dayToDisplayAsNow;
        const actId = `activity-${dayToDisplayAsNow.date}-${activityToDisplayAsNow.time.replace(/[^a-zA-Z0-9]/g, '')}`;
        nowRowEl = document.getElementById(actId);
    }

    // Update Next row
    const nextNameEl = document.getElementById('nextName');
    const nextTimeEl = document.getElementById('nextTime');

    if (nextNameEl && activityToDisplayAsNext && dayToDisplayAsNext) {
        nextNameEl.textContent = getEnsembleActivityName(activityToDisplayAsNext) || getJazzActivityName(activityToDisplayAsNext) || getFundamentalsActivityName(activityToDisplayAsNext) || activityToDisplayAsNext.activity;
        const { start } = parseActivityTimes(activityToDisplayAsNext.time, dayToDisplayAsNext.date);
        if (nextTimeEl) nextTimeEl.textContent = start ? fmtTime(start) : activityToDisplayAsNext.time.split(/\s*-\s*/)[0].trim();

        const actId = `activity-${dayToDisplayAsNext.date}-${activityToDisplayAsNext.time.replace(/[^a-zA-Z0-9]/g, '')}`;
        nextRowEl = document.getElementById(actId);
    }
}

function formatDateShort(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
}

function addClickAndScroll(element, anchorId, activityDateKey) {
  const link = element.querySelector('a');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const elToScroll = document.getElementById(anchorId);
      if (elToScroll) {
        const dayCard = document.getElementById(activityDateKey);
        if (dayCard) dayCard.classList.add('open');
        setTimeout(() => {
            elToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elToScroll.classList.add('blink-highlight');
            setTimeout(() => elToScroll.classList.remove('blink-highlight'), 800);
            setTimeout(() => elToScroll.classList.add('blink-highlight'), 1400);
            setTimeout(() => elToScroll.classList.remove('blink-highlight'), 2200);
        }, 50);
      }
    });
  }
}

function parseTime(timeStr, refDateForDay) {
  if (!timeStr) return null;

  const date = new Date(refDateForDay.getFullYear(), refDateForDay.getMonth(), refDateForDay.getDate());
  const parts = timeStr.split(' ');
  const timeParts = parts[0].split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10) || 0;
  const modifier = parts[1] ? parts[1].toLowerCase() : '';

  if (modifier.includes('pm') && hours < 12) hours += 12;
  if (modifier.includes('am') && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getCurrentTime() {
  const param = new URLSearchParams(window.location.search).get('time');
  if (!param) return new Date();
  const d = new Date(param);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
}

function applyBanner() {
  const noticeEl = document.getElementById('global-notice');
  if (globalBannerData.globalNotice?.text) {
    const noticeTextEl = noticeEl?.querySelector('#global-notice-text');
    if (noticeTextEl) noticeTextEl.textContent = globalBannerData.globalNotice.text;
    if (noticeEl) noticeEl.style.display = 'flex';
  }

  const bannerEl = document.getElementById('daily-banner');
  const bannerText = document.getElementById('banner-text');

  const param = new URLSearchParams(window.location.search).get('time');
  const now = param ? new Date(param) : new Date();
  const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  const year = estNow.getFullYear();
  const month = String(estNow.getMonth() + 1).padStart(2, '0');
  const day = String(estNow.getDate()).padStart(2, '0');
  const key = `${year}-${month}-${day}`;

  let bannerEntry = globalBannerData.banners?.[key];
  if (!bannerEntry) return;

  if (Array.isArray(bannerEntry)) {
    bannerEntry = [...bannerEntry]
      .filter(b => b.enabled !== false)
      .sort((a, b) => a.time.localeCompare(b.time))
      .reverse()
      .find(b => {
        const [h, m] = b.time.split(':').map(Number);
        const t = new Date(estNow);
        t.setHours(h, m, 0, 0);
        return estNow >= t;
      });
    if (!bannerEntry) return;
  }

  const dismissKey = `bannerDismissed-${key}-${bannerEntry.time}-${bannerEntry.version || 'v1'}`;
  if (localStorage.getItem(dismissKey)) return;

  bannerText.textContent = bannerEntry.message || bannerEntry;
  bannerEl.style.display = 'flex';

  bannerEl.querySelector('.close-banner')?.addEventListener('click', () => {
    bannerEl.style.display = 'none';
    localStorage.setItem(dismissKey, 'true');
    updateStickyTop();
  });
}

// FOOTER FETCHER
const _footerContainer = document.getElementById('footer-container');
if (_footerContainer) {
  fetch('/includes/footer.html')
    .then(res => res.text())
    .then(html => { _footerContainer.innerHTML = html; });
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getCurrentTimeForDarkMode() {
  const param = new URLSearchParams(window.location.search).get('time');
  if (!param) return new Date();
  const d = new Date(param);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
}

function getTimeBlock() {
  const hour = getCurrentTimeForDarkMode().getHours();
  return (hour >= 6 && hour < 20) ? 'day' : 'night';
}

function getUserDarkModePreference() {
  return localStorage.getItem('dark-mode-preference');
}

function setUserDarkModePreference(value) {
  if (value === null) {
    localStorage.removeItem('dark-mode-preference');
    localStorage.removeItem('manual-set-at');
  } else {
    localStorage.setItem('dark-mode-preference', value);
    localStorage.setItem('manual-set-at', new Date().toISOString());
  }
}

function setDarkMode(isDark) {
  document.body.classList.toggle('dark', isDark);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) return;

  const isFacultyPage = document.querySelector('meta[name="page-type"]')?.content === 'faculty';
  if (isFacultyPage) {
    themeColorMeta.content = isDark ? '#333333' : '#555555';
  } else {
    themeColorMeta.content = isDark ? '#0E2018' : '#1B4035';
  }
}

function updateDarkMode() {
  const pref = getUserDarkModePreference();
  const block = getTimeBlock();
  const now = getCurrentTimeForDarkMode();
  const hour = now.getHours();

  if (pref === 'dark') {
    setDarkMode(true);
    if (block === 'day' && hour >= 20) {
      setUserDarkModePreference(null);
      updateDarkMode();
    }
    return;
  }

  if (pref === 'light') {
    setDarkMode(false);
    if (block === 'night' && hour >= 6 && hour < 20) {
      setUserDarkModePreference(null);
      updateDarkMode();
    }
    return;
  }

  setDarkMode(block === 'night');
}

async function loadRooms() {
  const container = document.getElementById('room-list-container');
  if (!container) return;

  const res = await fetch('/data/rooms.json');
  const sections = await res.json();

  container.innerHTML = sections.map(section => {
    const sectionId = section.section.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `
    <div class="day-card open" id="${sectionId}">
      <button class="day-toggle" onclick="this.closest('.day-card').classList.toggle('open')">
        <span class="chevron"></span>
        <span class="day-hd"><span class="day-name">${section.section}</span></span>
      </button>
      <ul class="act-list">
        ${section.items.map(item => {
          const clickAttr = item.roster
            ? ` style="cursor:pointer" onclick="showRoster('${item.roster}')"`
            : item.ensemble
            ? ` style="cursor:pointer" onclick="showLargeEnsemble('${item.ensemble}')"`
            : '';
          return `<li class="act-row"${clickAttr}>
            <div class="act-body">
              <div class="act-name">${item.name}</div>
              <div class="act-loc">${item.loc}</div>
            </div>
          </li>`;
        }).join('')}
      </ul>
    </div>
  `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const includePromises = Array.from(document.querySelectorAll("[data-include]")).map(async (el) => {
    const file = el.getAttribute("data-include");
    if (!file) return;

    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Failed to load ${file}`);
      const content = await res.text();
      el.innerHTML = content;

      if (file.includes('nav-faculty.html') || file.includes('nav.html')) {
        const hamburger = el.querySelector('.hamburger');
        const navLinks = el.querySelector('.nav-links');
        if (hamburger && navLinks) {
          hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.toggle('active');
          });
        }
      }
    } catch (err) {
      console.error(err);
      el.innerHTML = `<p style="color:red;">Error loading ${file}</p>`;
    }
  });

  await Promise.all(includePromises);
  initRallyCard();
  await loadRooms();

  updateDarkMode();

  // Supporting pages: contact dropdown + hamburger nav
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('contact-menu')?.classList.toggle('show');
  });
  document.addEventListener('click', (event) => {
    const menu = document.getElementById('contact-menu');
    const toggle = document.getElementById('menu-toggle');
    if (menu && toggle && !menu.contains(event.target) && !toggle.contains(event.target)) {
      menu.classList.remove('show');
    }
  });

  // Supporting pages: dark mode toggle
  document.getElementById('manual-dark-toggle')?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const toggledTo = isDark ? 'light' : 'dark';
    const currentPref = getUserDarkModePreference();
    if (currentPref === toggledTo) setUserDarkModePreference(null);
    else setUserDarkModePreference(toggledTo);
    updateDarkMode();
  });

  // Main page: dark mode toggle
  document.getElementById('darkBtn')?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const toggledTo = isDark ? 'light' : 'dark';
    const currentPref = getUserDarkModePreference();
    if (currentPref === toggledTo) setUserDarkModePreference(null);
    else setUserDarkModePreference(toggledTo);
    updateDarkMode();
    updateDarkBtnIcon();
  });

  // Main page: contact sheet
  const contactOverlay = document.getElementById('overlay');
  document.getElementById('contactBtn')?.addEventListener('click', () => contactOverlay?.classList.add('show'));
  contactOverlay?.addEventListener('click', e => { if (e.target === contactOverlay) contactOverlay.classList.remove('show'); });

  // Main page: event detail sheet
  document.getElementById('eventClose')?.addEventListener('click', () => closeEvent());
  document.getElementById('eventOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeEvent(); });

  // Main page: daily banner dismiss
  document.getElementById('bannerX')?.addEventListener('click', () => {
    document.getElementById('daily-banner').style.display = 'none';
    updateStickyTop();
  });

  // Main page: next-pane scroll
  document.getElementById('nextPane')?.addEventListener('click', () => {
    if (!nextRowEl) return;
    nextRowEl.closest('.day-card')?.classList.add('open');
    nextRowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    nextRowEl.classList.remove('flash');
    void nextRowEl.offsetWidth;
    nextRowEl.classList.add('flash');
  });

  // Main page: now-pane tap
  document.getElementById('nowPane')?.addEventListener('click', () => {
    if (nowActivity) showEvent(nowActivity, nowRowEl);
  });

  try {
    await loadSchedule();
    const bannerRes = await fetch('/data/banners.json');
    globalBannerData = await bannerRes.json();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }

  refreshDisplayForCurrentTime();
  updateDarkBtnIcon();

  window.addEventListener('resize', updateStickyTop);

  // Only run the interval when not in ?time= test mode
  setInterval(() => {
    if (!new URLSearchParams(window.location.search).get('time')) {
      refreshDisplayForCurrentTime();
      updateDarkBtnIcon();
    }
  }, 60000);
});


// ADD TO HOMESCREEN
const INSTALL_BANNER_DELAY = 2000;
const INSTALL_BANNER_KEY = 'install-banner-dismissed';

function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  if (!isMobileDevice()) return;
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner('android');
});

function showInstallBanner(type) {
  if (localStorage.getItem(INSTALL_BANNER_KEY)) return;

  setTimeout(() => {
    const overlay = document.getElementById('install-overlay');
    const textElement = document.getElementById('install-text');
    const buttonsContainer = document.getElementById('install-banner-buttons');
    const dismissButton = document.getElementById('install-dismiss');

    if (!overlay || !textElement || !buttonsContainer || !dismissButton) return;

    const existingInstallButton = document.getElementById('install-now');
    if (existingInstallButton) existingInstallButton.remove();

    if (type === 'ios') {
      textElement.textContent = 'Tap the Share button then "Add to Home Screen" to install this app.';
    } else if (type === 'android' && window.deferredPrompt) {
      textElement.textContent = 'Install this app to your home screen for quicker access.';
      const installButton = document.createElement('button');
      installButton.id = 'install-now';
      installButton.textContent = 'Install';
      buttonsContainer.insertBefore(installButton, dismissButton);

      installButton.addEventListener('click', () => {
        if (window.deferredPrompt) {
          window.deferredPrompt.prompt();
          window.deferredPrompt.userChoice.finally(() => {
            overlay.classList.remove('show');
            localStorage.setItem(INSTALL_BANNER_KEY, 'true');
            window.deferredPrompt = null;
          });
        }
      });
    } else if (type === 'android' && !window.deferredPrompt) {
      textElement.textContent = 'For quick access, add this site to your home screen via your browser menu.';
    }

    dismissButton.onclick = () => {
      overlay.classList.remove('show');
      localStorage.setItem(INSTALL_BANNER_KEY, 'true');
    };

    overlay.classList.add('show');

  }, INSTALL_BANNER_DELAY);
}

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;

if (isMobileDevice() && isIOS && !isInStandaloneMode) {
  showInstallBanner('ios');
}

// NOTIFICATION PERMISSION BANNER
const NOTIF_BANNER_KEY = 'notif-banner-dismissed';

function showNotifBanner() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'default') return;
  if (localStorage.getItem(NOTIF_BANNER_KEY)) return;
  // iOS requires the app to be installed as a PWA before push works
  if (isIOS && !isInStandaloneMode) return;

  setTimeout(() => {
    const overlay = document.getElementById('notif-overlay');
    if (!overlay) return;

    document.getElementById('notif-allow').onclick = () => {
      overlay.classList.remove('show');
      localStorage.setItem(NOTIF_BANNER_KEY, 'true');
      // Call without await — preserves iOS user gesture context while letting
      // OneSignal handle the native dialog and service worker subscription.
      if (window.OneSignal) window.OneSignal.Notifications.requestPermission();
    };

    document.getElementById('notif-dismiss').onclick = () => {
      overlay.classList.remove('show');
      localStorage.setItem(NOTIF_BANNER_KEY, 'true');
    };

    overlay.classList.add('show');
  }, 4000);
}

showNotifBanner();
