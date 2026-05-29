let scheduleData = [];
let globalBannerData = {};

function refreshDisplayForCurrentTime() {
  if (!scheduleData || scheduleData.length === 0) return;

  const openDetailsIds = new Set();
  document.querySelectorAll('#schedule-container details.day[open]').forEach(detailsEl => {
    if (detailsEl.id) openDetailsIds.add(detailsEl.id);
  });

  const currentTime = getCurrentTime();

  renderSchedule(scheduleData);

  if (openDetailsIds.size > 0) {
    openDetailsIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.open = true;
    });
  } else {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const dayNum = String(currentTime.getDate()).padStart(2, '0');
    const currentDateKey = `${year}-${month}-${dayNum}`;
    const currentDayDetails = document.getElementById(currentDateKey);
    if (currentDayDetails) currentDayDetails.open = true;
  }

  updateNowNextFromHiddenData();
  applyBanner();
  updateDarkMode();
}


async function loadSchedule() {
  const container = document.getElementById('schedule-container');
  if (!container) return;

  const pageTypeMeta = document.querySelector('meta[name="page-type"]');
  const schedulePath = (pageTypeMeta && pageTypeMeta.content === 'faculty')
    ? '/data/faculty-schedule.json'
    : '/data/schedule.json';

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


function renderSchedule(scheduleData) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = '';

  for (const day of scheduleData) {
    const details = document.createElement('details');
    details.className = 'day';
    details.id = day.date;

    const summary = document.createElement('summary');
    const [year, month, dayNum] = day.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, dayNum);
    const weekdayName = localDate.toLocaleDateString('en-US', { weekday: 'long' });
    summary.innerHTML = `<span class="day-name">${weekdayName}</span>, ${formatDate(day.date)}`;
    details.appendChild(summary);

    if (day.themeDescription) {
      const theme = document.createElement('div');
      theme.className = 'theme-description';
      if (day.themeTitle) {
        theme.innerHTML = `<strong>${day.themeTitle}:</strong> ${day.themeDescription}`;
      } else {
        theme.textContent = day.themeDescription;
      }
      details.appendChild(theme);
    }

    const ul = document.createElement('ul');
    for (const act of day.activities) {
      const li = document.createElement('li');
      li.setAttribute('id', `activity-${day.date}-${act.time.replace(/[^a-zA-Z0-9]/g, '')}`);
      li.innerHTML = `<time>${act.time}</time> — <strong>${act.activity}</strong>`;
      if (act.location) li.innerHTML += ` @ ${act.location}`;
      if (act.mapUrl) li.innerHTML += ` <a href="${act.mapUrl}" target="_blank">(map)</a>`;

      if (act.notes && act.notes.length > 0) {
        const subUl = document.createElement('ul');
        act.notes.forEach(note => {
          const subLi = document.createElement('li');
          subLi.innerHTML = note;
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }

      ul.appendChild(li);
    }

    details.appendChild(ul);
    container.appendChild(details);
  }
}

function updateNowNextFromHiddenData() {
    const now = getCurrentTime();
    const todayDateString = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    const currentActivityEl = document.getElementById('current-activity');
    const nextActivityEl = document.getElementById('next-activity');

    currentActivityEl.innerHTML = '⌛ No current activity';
    currentActivityEl.removeAttribute('href'); currentActivityEl.onclick = null;
    nextActivityEl.innerHTML = '⏭️ Nothing upcoming';
    nextActivityEl.removeAttribute('href'); nextActivityEl.onclick = null;

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

    if (activityToDisplayAsNow && dayToDisplayAsNow) {
        const anchorId = `activity-${dayToDisplayAsNow.date}-${activityToDisplayAsNow.time.replace(/[^a-zA-Z0-9]/g, '')}`;
        currentActivityEl.innerHTML = `<a href="#${anchorId}">⌛ ${activityToDisplayAsNow.time}: ${activityToDisplayAsNow.activity}</a>`;
        addClickAndScroll(currentActivityEl, anchorId, dayToDisplayAsNow.date);
    }

    if (activityToDisplayAsNext && dayToDisplayAsNext) {
        const anchorId = `activity-${dayToDisplayAsNext.date}-${activityToDisplayAsNext.time.replace(/[^a-zA-Z0-9]/g, '')}`;
        let nextText = `⏭️ ${activityToDisplayAsNext.time}`;
        if (dayToDisplayAsNext.date !== todayDateString) {
            if (!dayToDisplayAsNow || dayToDisplayAsNext.date !== dayToDisplayAsNow.date) {
                nextText += ` (${formatDateShort(dayToDisplayAsNext.date)})`;
            }
        }
        nextText += `: ${activityToDisplayAsNext.activity}`;
        nextActivityEl.innerHTML = `<a href="#${anchorId}">${nextText}</a>`;
        addClickAndScroll(nextActivityEl, anchorId, dayToDisplayAsNext.date);
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
        document.querySelectorAll('details.day').forEach(detailsEl => {
          if (detailsEl.id === activityDateKey) {
            if (!detailsEl.open) detailsEl.open = true;
          }
        });
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
    noticeEl.textContent = globalBannerData.globalNotice.text;
    noticeEl.style.display = 'block';
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
  bannerEl.style.display = 'block';

  bannerEl.querySelector('.close-banner')?.addEventListener('click', () => {
    bannerEl.style.display = 'none';
    localStorage.setItem(dismissKey, 'true');
  });
}

// FOOTER FETCHER
fetch('/includes/footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-container').innerHTML = html;
  });

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
  document.body.classList.toggle('dark-mode', isDark);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) return;

  const isFacultyPage = document.querySelector('meta[name="page-type"]')?.content === 'faculty';
  if (isFacultyPage) {
    themeColorMeta.content = isDark ? '#333333' : '#555555';
  } else {
    themeColorMeta.content = isDark ? '#334b3c' : '#2b644a';
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

  document.getElementById('manual-dark-toggle')?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const toggledTo = isDark ? 'light' : 'dark';
    const currentPref = getUserDarkModePreference();
    if (currentPref === toggledTo) {
      setUserDarkModePreference(null);
    } else {
      setUserDarkModePreference(toggledTo);
    }
    updateDarkMode();
  });

  try {
    await loadSchedule();
    const bannerRes = await fetch('/data/banners.json');
    globalBannerData = await bannerRes.json();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }

  refreshDisplayForCurrentTime();

  // Only run the interval when not in ?time= test mode
  setInterval(() => {
    if (!new URLSearchParams(window.location.search).get('time')) {
      refreshDisplayForCurrentTime();
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
    const banner = document.getElementById('install-banner');
    const textElement = document.getElementById('install-text');
    const buttonsContainer = document.getElementById('install-banner-buttons');
    const dismissButton = document.getElementById('install-dismiss');

    if (!banner || !textElement || !buttonsContainer || !dismissButton) return;

    const existingInstallButton = document.getElementById('install-now');
    if (existingInstallButton) existingInstallButton.remove();

    if (type === 'ios') {
      textElement.textContent = '📲 To add this app to your home screen, tap the Share button and then "Add to Home Screen".';
    } else if (type === 'android' && window.deferredPrompt) {
      textElement.textContent = '📲 Install this app to your home screen for quicker access.';
      const installButton = document.createElement('button');
      installButton.id = 'install-now';
      installButton.textContent = 'Install';
      buttonsContainer.insertBefore(installButton, dismissButton);

      installButton.addEventListener('click', () => {
        if (window.deferredPrompt) {
          window.deferredPrompt.prompt();
          window.deferredPrompt.userChoice.finally(() => {
            banner.classList.remove('show');
            setTimeout(() => { banner.style.display = 'none'; }, 400);
            localStorage.setItem(INSTALL_BANNER_KEY, 'true');
            window.deferredPrompt = null;
          });
        }
      });
    } else if (type === 'android' && !window.deferredPrompt) {
      textElement.textContent = '📲 For quick access, you can add this site to your home screen via your browser menu.';
    }

    dismissButton.onclick = () => {
      banner.classList.remove('show');
      setTimeout(() => { banner.style.display = 'none'; }, 400);
      localStorage.setItem(INSTALL_BANNER_KEY, 'true');
    };

    banner.style.display = 'block';
    requestAnimationFrame(() => { banner.classList.add('show'); });

  }, INSTALL_BANNER_DELAY);
}

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;

if (isMobileDevice() && isIOS && !isInStandaloneMode) {
  showInstallBanner('ios');
}
