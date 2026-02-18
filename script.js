let zTop = 200;

// ── Randomise icon positions on load ──
window.addEventListener('DOMContentLoaded', () => {
  const pad = 20;
  const iconW = 210;
  const iconH = 230;
  const minX = pad;
  const maxX = window.innerWidth  - iconW - pad;
  const minY = 30 + pad;           // below ticker
  const maxY = window.innerHeight - iconH - 40 - pad; // above taskbar

  document.querySelectorAll('.icon').forEach(icon => {
    icon.style.left = Math.round(minX + Math.random() * (maxX - minX)) + 'px';
    icon.style.top  = Math.round(minY + Math.random() * (maxY - minY)) + 'px';
  });

});

// ── Generic drag (mouse + touch) ──
// Sets el._wasDragged = true if the element was moved more than 4px
function makeDraggable(el, handle) {
  handle = handle || el;
  let dragging = false;
  let ox, oy, sl, st;

  function onStart(cx, cy) {
    dragging = true;
    el._wasDragged = false;
    ox = cx; oy = cy;
    sl = parseInt(el.style.left) || 0;
    st = parseInt(el.style.top)  || 0;
    el.style.zIndex = ++zTop;
  }

  function onMove(cx, cy) {
    if (!dragging) return;
    const dx = cx - ox, dy = cy - oy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) el._wasDragged = true;
    el.style.left = (sl + dx) + 'px';
    el.style.top  = (st + dy) + 'px';
  }

  function onEnd() { dragging = false; }

  handle.addEventListener('mousedown', e => {
    if (e.target.classList.contains('win-close')) return;
    onStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup',   onEnd);

  handle.addEventListener('touchstart', e => {
    if (e.target.classList.contains('win-close')) return;
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchend', onEnd);
}

// ── Icons ──
const icons = document.querySelectorAll('.icon');

icons.forEach(icon => {
  makeDraggable(icon);

  let clicks = 0, clickTimer = null;

  icon.addEventListener('click', () => {
    // Don't activate if the icon was just dragged
    if (icon._wasDragged) { icon._wasDragged = false; return; }

    clicks++;
    if (clicks === 1) {
      icons.forEach(i => i.classList.remove('active'));
      icon.classList.add('active');
      clickTimer = setTimeout(() => { clicks = 0; }, 300);
    } else {
      clearTimeout(clickTimer);
      clicks = 0;

      if (icon.dataset.href) {
        // External link icon — open in new tab
        window.open(icon.dataset.href, '_blank');
      } else if (icon.dataset.window) {
        openWindow('window-' + icon.dataset.window);
      }
    }
  });
});

document.getElementById('desktop').addEventListener('click', e => {
  if (!e.target.closest('.icon')) {
    icons.forEach(i => i.classList.remove('active'));
  }
});

// ── Window management ──
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
      const w = 380;
      const h = 320;
      win.style.left = Math.max(0, Math.round((window.innerWidth  - w) / 2) + offset) + 'px';
      win.style.top  = Math.max(26, Math.round((window.innerHeight - h) / 2) + offset) + 'px';
    }
  }

  win.style.display = 'flex';
  win.style.zIndex  = ++zTop;

  addTaskbarBtn(id);
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  removeTaskbarBtn(id);
}

document.querySelectorAll('.win-close').forEach(btn => {
  btn.addEventListener('click', () => closeWindow(btn.dataset.target));
});

document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => { win.style.zIndex = ++zTop; });
});

// ── Taskbar ──
function titleFor(id) {
  const bar = document.querySelector(`#${id} .window-titlebar span`);
  if (!bar) return id;
  return bar.textContent.replace('.exe', '').replace('.txt', '').trim();
}

function addTaskbarBtn(id) {
  const container = document.getElementById('taskbar-wins');
  if (!container) return;
  if (document.getElementById('tbtn-' + id)) return;
  const btn = document.createElement('button');
  btn.className   = 'taskbar-btn';
  btn.id          = 'tbtn-' + id;
  btn.textContent = titleFor(id);
  btn.addEventListener('click', () => {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    win.style.zIndex  = ++zTop;
  });
  container.appendChild(btn);
}

function removeTaskbarBtn(id) {
  const btn = document.getElementById('tbtn-' + id);
  if (btn) btn.remove();
}

// ── Lightbox ──
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.photo-grid img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
  });
});

lightbox.addEventListener('click', () => lightbox.classList.remove('open'));

// ── Mailing list AJAX submit ──
const mlForm = document.querySelector('.ml-form');
if (mlForm) {
  mlForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = mlForm.querySelector('[name="email"]').value;
    const name  = mlForm.querySelector('[name="name"]').value;

    try {
      const res = await fetch('http://155.138.196.203:9000/api/public/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          list_uuids: ['d81106be-7064-40ab-a299-68d67a687b43']
        })
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

// ── Clock ──
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();
