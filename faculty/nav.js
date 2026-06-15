(function () {
  const slug = localStorage.getItem('faculty-slug');
  const schedHref = slug ? `schedule.html?name=${encodeURIComponent(slug)}` : 'schedule.html';
  const page = window.location.pathname.split('/').pop() || '';

  const items = [
    {
      href: schedHref,
      label: 'My Schedule',
      active: page === 'schedule.html',
      svg: '<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/><path d="M11 15h1"/><path d="M12 15v3"/></svg>'
    },
    {
      href: 'rooms.html',
      label: 'Rooms',
      active: page === 'rooms.html',
      svg: '<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 12v.01"/><path d="M3 21h18"/><path d="M6 21v-16a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v16"/></svg>'
    },
    {
      href: 'students.html',
      label: 'Students',
      active: page === 'students.html',
      svg: '<svg class="icon" viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/></svg>'
    }
  ];

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = items.map(item =>
    `<a href="${item.href}" class="nav-item${item.active ? ' active' : ''}">${item.svg}<span class="nav-lbl">${item.label}</span></a>`
  ).join('');

  const app = document.querySelector('.app');
  if (app) app.appendChild(nav);

  const hdrNav = document.createElement('nav');
  hdrNav.className = 'hdr-nav';
  hdrNav.innerHTML = items.map(item =>
    `<a href="${item.href}" class="hdr-nav-item${item.active ? ' active' : ''}">${item.label}</a>`
  ).join('');

  const hbtns = document.querySelector('.header .hbtns');
  if (hbtns) hbtns.parentElement.insertBefore(hdrNav, hbtns);
})();
