let zTop = 200;

function prepareWindowReveal(win) {
  window.peachPitGsap?.prepareOpen?.(win);
}

function playWindowOpenAnimation(win) {
  window.peachPitGsap?.animateOpen?.(win);
}

function syncActiveNav() {
  const open = [...document.querySelectorAll('.window')].filter((w) => w.style.visibility === 'visible');
  if (!open.length) {
    clearActiveNav();
    return;
  }
  const top = open.reduce((a, b) =>
    parseInt(a.style.zIndex, 10) > parseInt(b.style.zIndex, 10) ? a : b
  );
  setActiveNav(top.id);
}

function finishWindowClose(id, win) {
  win.style.visibility = 'hidden';
  win.style.pointerEvents = 'none';
  removeTaskbarBtn(id);
  syncActiveNav();
}

window.addEventListener('DOMContentLoaded', () => {
  const pad = 20;
  const iconW = 210;
  const iconH = 230;
  const minX = pad;
  const maxX = window.innerWidth - iconW - pad;
  const minY = 30 + pad;
  const maxY = window.innerHeight - iconH - 40 - pad;

  document.querySelectorAll('.icon').forEach((icon) => {
    icon.style.left = Math.round(minX + Math.random() * (maxX - minX)) + 'px';
    icon.style.top = Math.round(minY + Math.random() * (maxY - minY)) + 'px';
  });

  document.querySelectorAll('[data-open-window]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-open-window');
      if (isWindowOpen(id)) {
        closeWindow(id);
      } else {
        openWindow(id);
      }
    });
  });
});

function makeDraggable(el, handle) {
  handle = handle || el;
  let dragging = false;
  let ox;
  let oy;
  let sl;
  let st;

  function onStart(cx, cy) {
    dragging = true;
    el._wasDragged = false;
    ox = cx;
    oy = cy;
    sl = parseInt(el.style.left, 10) || 0;
    st = parseInt(el.style.top, 10) || 0;
    el.style.zIndex = ++zTop;
    el.classList.add('is-dragging');
  }

  function onMove(cx, cy) {
    if (!dragging) return;
    const dx = cx - ox;
    const dy = cy - oy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) el._wasDragged = true;
    el.style.left = sl + dx + 'px';
    el.style.top = st + dy + 'px';
  }

  function onEnd() {
    dragging = false;
    el.classList.remove('is-dragging');
  }

  handle.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-close')) return;
    onStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  handle.addEventListener(
    'touchstart',
    (e) => {
      if (e.target.classList.contains('win-close')) return;
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  });
  document.addEventListener('touchend', onEnd);
}

const icons = document.querySelectorAll('.icon');

icons.forEach((icon) => {
  makeDraggable(icon);

  let clicks = 0;
  let clickTimer = null;

  icon.addEventListener('click', () => {
    if (icon._wasDragged) {
      icon._wasDragged = false;
      return;
    }

    clicks += 1;
    if (clicks === 1) {
      icons.forEach((i) => i.classList.remove('active'));
      icon.classList.add('active');
      clickTimer = setTimeout(() => {
        clicks = 0;
      }, 300);
    } else {
      clearTimeout(clickTimer);
      clicks = 0;

      if (icon.dataset.href) {
        window.open(icon.dataset.href, '_blank');
      } else if (icon.dataset.window) {
        openWindow('window-' + icon.dataset.window);
      }
    }
  });
});

const desktop = document.getElementById('desktop');
if (desktop) {
  desktop.addEventListener('click', (e) => {
    if (!e.target.closest('.icon')) {
      icons.forEach((i) => i.classList.remove('active'));
    }
  });
}

function isWindowOpen(id) {
  const win = document.getElementById(id);
  return win && win.style.visibility === 'visible';
}

function setActiveNav(id) {
  document.querySelectorAll('[data-open-window]').forEach((btn) => {
    btn.classList.toggle('pp-btn--active', btn.getAttribute('data-open-window') === id);
  });
}

function clearActiveNav() {
  document.querySelectorAll('[data-open-window]').forEach((btn) => {
    btn.classList.remove('pp-btn--active');
  });
}

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  if (window.innerWidth > 768) {
    if (!win.dataset.dragReady) {
      win.dataset.dragReady = '1';
      makeDraggable(win, win.querySelector('.window-titlebar'));
    }

    if (!win.dataset.positioned) {
      win.dataset.positioned = '1';
      const offset = [...document.querySelectorAll('.window')].indexOf(win) * 22;
      const w = win.offsetWidth || 380;
      const h = win.offsetHeight || 320;
      win.style.left = Math.max(0, Math.round((window.innerWidth - w) / 2) + offset) + 'px';
      win.style.top = Math.max(26, Math.round((window.innerHeight - h) / 2) + offset) + 'px';
    }
  }

  prepareWindowReveal(win);

  win.style.visibility = 'visible';
  win.style.pointerEvents = 'auto';
  win.style.zIndex = ++zTop;

  addTaskbarBtn(id);
  setActiveNav(id);
  playWindowOpenAnimation(win);
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const done = () => finishWindowClose(id, win);
  const closeAnim = window.peachPitGsap?.animateClose;

  if (closeAnim) {
    closeAnim(win, done);
  } else {
    done();
  }
}

document.querySelectorAll('.win-close').forEach((btn) => {
  btn.addEventListener('click', () => closeWindow(btn.dataset.target));
});

document.querySelectorAll('.window').forEach((win) => {
  win.addEventListener('mousedown', () => {
    win.style.zIndex = ++zTop;
  });
});

function titleFor(id) {
  const bar = document.getElementById(id)?.querySelector('.window-titlebar span');
  if (!bar) return id;
  return bar.textContent.replace('.exe', '').replace('.txt', '').trim();
}

function addTaskbarBtn(id) {
  const container = document.getElementById('taskbar-wins');
  if (!container) return;
  if (document.getElementById('tbtn-' + id)) return;

  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'tbtn-' + id;
  btn.textContent = titleFor(id);
  btn.addEventListener('click', () => {
    const win = document.getElementById(id);
    if (!win) return;

    prepareWindowReveal(win);
    win.style.visibility = 'visible';
    win.style.pointerEvents = 'auto';
    win.style.zIndex = ++zTop;
    playWindowOpenAnimation(win);
  });
  container.appendChild(btn);
}

function removeTaskbarBtn(id) {
  document.getElementById('tbtn-' + id)?.remove();
}

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

if (lightbox && lightboxImg) {
  document.querySelectorAll('.photo-grid img').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
    });
  });

  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (lightbox.classList.contains('open')) {
      lightbox.classList.remove('open');
      return;
    }
    const openWins = [...document.querySelectorAll('.window')].filter(
      (w) => w.style.visibility === 'visible'
    );
    if (!openWins.length) return;
    const top = openWins.reduce((a, b) =>
      parseInt(a.style.zIndex, 10) > parseInt(b.style.zIndex, 10) ? a : b
    );
    closeWindow(top.id);
  });
}

const mlForm = document.querySelector('.ml-form');
if (mlForm) {
  mlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = mlForm.querySelector('[name="email"]').value;
    const name = mlForm.querySelector('[name="name"]').value;

    try {
      const res = await fetch('https://listmonk.watchforturtles.ca/api/public/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          list_uuids: ['d81106be-7064-40ab-a299-68d67a687b43'],
        }),
      });

      if (res.ok) {
        mlForm.innerHTML = '<span class="ml-msg">✦ check your email to confirm ✦</span>';
      } else {
        mlForm.innerHTML = '<span class="ml-msg ml-err">something went wrong — try again</span>';
      }
    } catch {
      mlForm.innerHTML = '<span class="ml-msg ml-err">something went wrong — try again</span>';
    }
  });
}

function updateClock() {
  const clockEl = document.querySelector('.clock-time');
  if (!clockEl) return;
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  clockEl.innerHTML = h + '<span class="clock-colon">:</span>' + m;
}
setInterval(updateClock, 1000);
updateClock();
