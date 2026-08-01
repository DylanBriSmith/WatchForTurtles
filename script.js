/**
 * Main site logic: draggable windows, nav, lightbox, mailing list, clock.
 * Depends on: config.js (optional SITE constants), gsap-peachpit.js (optional animations).
 */

// --- Settings ----------------------------------------------------------------

const MOBILE_MAX = typeof SITE !== 'undefined' ? SITE.mobileMaxWidth : 768;
const WINDOW_OFFSET = 22;
const DRAG_THRESHOLD = 4;

let topZIndex = 200;

// --- Window open / close -----------------------------------------------------

function isWindowOpen(windowId) {
  const el = document.getElementById(windowId);
  return el && el.style.visibility === 'visible';
}

function openWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  setupDesktopWindow(win);

  window.peachPitGsap?.prepareOpen?.(win);

  win.style.visibility = 'visible';
  win.style.pointerEvents = 'auto';
  win.style.zIndex = ++topZIndex;

  addTaskbarButton(windowId);
  setActiveNavButton(windowId);
  window.peachPitGsap?.animateOpen?.(win);

  if (windowId === 'window-shows') {
    loadInstagramEmbed();
  }
}

function closeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;

  const finish = () => {
    win.style.visibility = 'hidden';
    win.style.pointerEvents = 'none';
    removeTaskbarButton(windowId);
    syncActiveNavButton();
  };

  const animateClose = window.peachPitGsap?.animateClose;
  if (animateClose) {
    animateClose(win, finish);
  } else {
    finish();
  }
}

function setupDesktopWindow(win) {
  if (window.innerWidth <= MOBILE_MAX) return;

  if (!win.dataset.dragReady) {
    win.dataset.dragReady = '1';
    makeDraggable(win, win.querySelector('.window-titlebar'));
  }

  if (!win.dataset.positioned) {
    win.dataset.positioned = '1';
    const index = [...document.querySelectorAll('.window')].indexOf(win);
    const offset = index * WINDOW_OFFSET;
    const w = win.offsetWidth || 380;
    const h = win.offsetHeight || 320;
    win.style.left = Math.max(0, Math.round((window.innerWidth - w) / 2) + offset) + 'px';
    win.style.top = Math.max(26, Math.round((window.innerHeight - h) / 2) + offset) + 'px';
  }
}

function bringWindowToFront(win) {
  win.style.zIndex = ++topZIndex;
  syncActiveNavButton();
}

// --- Nav buttons -------------------------------------------------------------

function setActiveNavButton(windowId) {
  document.querySelectorAll('[data-open-window]').forEach((btn) => {
    btn.classList.toggle('pp-btn--active', btn.getAttribute('data-open-window') === windowId);
  });
}

function syncActiveNavButton() {
  const openWindows = [...document.querySelectorAll('.window')].filter(
    (w) => w.style.visibility === 'visible'
  );

  if (!openWindows.length) {
    document.querySelectorAll('[data-open-window]').forEach((btn) => {
      btn.classList.remove('pp-btn--active');
    });
    return;
  }

  const topWindow = openWindows.reduce((a, b) =>
    parseInt(a.style.zIndex, 10) > parseInt(b.style.zIndex, 10) ? a : b
  );
  setActiveNavButton(topWindow.id);
}

function setupNavButtons() {
  document.querySelectorAll('[data-open-window]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const windowId = btn.getAttribute('data-open-window');
      if (isWindowOpen(windowId)) {
        closeWindow(windowId);
      } else {
        openWindow(windowId);
      }
    });
  });
}

// --- Drag (mouse + touch) ----------------------------------------------------

function makeDraggable(element, handle) {
  handle = handle || element;
  let dragging = false;
  let startX;
  let startY;
  let startLeft;
  let startTop;

  function pointerDown(clientX, clientY) {
    dragging = true;
    element._wasDragged = false;
    startX = clientX;
    startY = clientY;
    startLeft = parseInt(element.style.left, 10) || 0;
    startTop = parseInt(element.style.top, 10) || 0;
    element.style.zIndex = ++topZIndex;
    element.classList.add('is-dragging');
  }

  function pointerMove(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      element._wasDragged = true;
    }
    element.style.left = startLeft + dx + 'px';
    element.style.top = startTop + dy + 'px';
  }

  function pointerUp() {
    dragging = false;
    element.classList.remove('is-dragging');
  }

  handle.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('win-close')) return;
    pointerDown(e.clientX, e.clientY);
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', pointerUp);

  handle.addEventListener(
    'touchstart',
    (e) => {
      if (e.target.classList.contains('win-close')) return;
      const touch = e.touches[0];
      pointerDown(touch.clientX, touch.clientY);
      e.preventDefault();
    },
    { passive: false }
  );
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    pointerMove(touch.clientX, touch.clientY);
  });
  document.addEventListener('touchend', pointerUp);
}

// --- Win95 desktop icons (legacy pages only) ---------------------------------

function setupLegacyIcons() {
  const icons = document.querySelectorAll('.icon');
  if (!icons.length) return;

  const pad = 20;
  const iconW = 210;
  const iconH = 230;
  const minX = pad;
  const maxX = window.innerWidth - iconW - pad;
  const minY = 30 + pad;
  const maxY = window.innerHeight - iconH - 40 - pad;

  icons.forEach((icon) => {
    icon.style.left = Math.round(minX + Math.random() * (maxX - minX)) + 'px';
    icon.style.top = Math.round(minY + Math.random() * (maxY - minY)) + 'px';
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
}

// --- Taskbar (Win95 page only) -----------------------------------------------

function taskbarTitle(windowId) {
  const label = document.getElementById(windowId)?.querySelector('.window-titlebar span');
  if (!label) return windowId;
  return label.textContent.replace('.exe', '').replace('.txt', '').trim();
}

function addTaskbarButton(windowId) {
  const container = document.getElementById('taskbar-wins');
  if (!container || document.getElementById('tbtn-' + windowId)) return;

  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'tbtn-' + windowId;
  btn.textContent = taskbarTitle(windowId);
  btn.addEventListener('click', () => openWindow(windowId));
  container.appendChild(btn);
}

function removeTaskbarButton(windowId) {
  document.getElementById('tbtn-' + windowId)?.remove();
}

// --- Photo lightbox ----------------------------------------------------------

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!lightbox || !lightboxImg) return;

  const photos = [...document.querySelectorAll('.photo-grid img')];
  let currentIndex = 0;

  function showPhoto(index) {
    if (!photos.length) return;
    currentIndex = (index + photos.length) % photos.length;
    const img = photos[currentIndex];
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
  }

  function openLightbox(index) {
    showPhoto(index);
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
  }

  photos.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
  });

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showPhoto(currentIndex - 1);
  });
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    showPhoto(currentIndex + 1);
  });

  lightboxImg.addEventListener('click', (e) => e.stopPropagation());
  lightbox.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowLeft') {
        showPhoto(currentIndex - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        showPhoto(currentIndex + 1);
        return;
      }
      return;
    }

    if (e.key !== 'Escape') return;

    const openWindows = [...document.querySelectorAll('.window')].filter(
      (w) => w.style.visibility === 'visible'
    );
    if (!openWindows.length) return;

    const topWindow = openWindows.reduce((a, b) =>
      parseInt(a.style.zIndex, 10) > parseInt(b.style.zIndex, 10) ? a : b
    );
    closeWindow(topWindow.id);
  });
}

// --- Instagram (loads only when Shows window opens) --------------------------

let instagramRequested = false;

function loadInstagramEmbed() {
  if (instagramRequested) {
    window.instgrm?.Embeds?.process();
    return;
  }
  instagramRequested = true;

  const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
  if (existing) {
    existing.addEventListener('load', () => window.instgrm?.Embeds?.process());
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.instagram.com/embed.js';
  script.onload = () => window.instgrm?.Embeds?.process();
  document.body.appendChild(script);
}

// --- Mailing list ------------------------------------------------------------

function setupMailingListForm() {
  const form = document.querySelector('.ml-form');
  if (!form) return;

  const listUuid =
    typeof SITE !== 'undefined' ? SITE.mailingList.listUuid : form.querySelector('[name="l"]')?.value;
  const apiUrl =
    typeof SITE !== 'undefined'
      ? SITE.mailingList.apiUrl
      : 'https://listmonk.watchforturtles.ca/api/public/subscription';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"]').value;
    const name = form.querySelector('[name="name"]').value;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, list_uuids: [listUuid] }),
      });

      if (res.ok) {
        form.innerHTML = '<span class="ml-msg">✦ check your email to confirm ✦</span>';
      } else {
        form.innerHTML = '<span class="ml-msg ml-err">something went wrong — try again</span>';
      }
    } catch {
      form.innerHTML = '<span class="ml-msg ml-err">something went wrong — try again</span>';
    }
  });
}

// --- Clock -------------------------------------------------------------------

function setupClock() {
  const clockEl = document.querySelector('.clock-time');
  if (!clockEl) return;

  function tick() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    clockEl.innerHTML = h + '<span class="clock-colon">:</span>' + m;
  }

  tick();
  setInterval(tick, 1000);
}

// --- Band name font cycler ---------------------------------------------------

function cycleBandFont() {
  const fonts = window.BAND_FONTS;
  if (!fonts || window._fontSwapping) return;
  window._fontSwapping = true;

  const h1 = document.querySelector('.band-name');
  const other = fonts.filter((f) => f[0] !== window._currentBandFont);
  if (!other.length) { window._fontSwapping = false; return; }
  const pick = other[Math.floor(Math.random() * other.length)];
  window._currentBandFont = pick[0];

  const fontUrl = `https://fonts.googleapis.com/css2?family=${pick[1]}&display=swap`;

  if (h1) h1.style.opacity = '0';

  let applied = false;
  const apply = () => {
    if (applied) return;
    applied = true;
    const val = `'${pick[0]}', serif`;
    document.documentElement.style.setProperty('--band-font', val);
    document.documentElement.style.setProperty('--font-serif', val);
    if (h1) h1.style.opacity = '';
    window._fontSwapping = false;
  };

  // Get or create the stylesheet link, attach load listener before setting href
  const existing = document.querySelector('link[data-band-font]');
  const fontLink = existing || (() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.dataset.bandFont = '1';
    document.head.appendChild(l);
    return l;
  })();

  fontLink.addEventListener('load', () => {
    document.fonts.load(`1em '${pick[0]}'`).then(apply, apply);
  }, { once: true });
  fontLink.addEventListener('error', apply, { once: true });
  fontLink.href = fontUrl;

  // Hard fallback: always restore the text within 2s
  setTimeout(apply, 2000);
}

function setupBandNameCycler() {
  const h1 = document.querySelector('.band-name');
  if (!h1) return;
  h1.addEventListener('click', cycleBandFont);
}

// --- Startup -----------------------------------------------------------------

function setupWindows() {
  document.querySelectorAll('.win-close').forEach((btn) => {
    btn.addEventListener('click', () => closeWindow(btn.dataset.target));
  });

  document.querySelectorAll('.window').forEach((win) => {
    win.addEventListener('mousedown', () => bringWindowToFront(win));
  });
}

function setupShowsEmbed() {
  const embed = document.querySelector('.instagram-embed');
  if (embed && typeof SITE !== 'undefined' && SITE.showsInstagramUrl) {
    embed.setAttribute('data-instgrm-permalink', SITE.showsInstagramUrl);
  }
}

// --- Turtle lore photos (from Wikipedia) -------------------------------------

const LORE_PHOTO_TITLES = [
  'Turtle',
  'Painted_turtle',
  'Snapping_turtle',
  "Blanding's_turtle",
  'Sea_turtle',
  'Tortoise',
];

async function fetchWikiSummary(title) {
  const url =
    'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const res = await fetch(url);
  if (!res.ok) throw new Error('wiki ' + res.status);
  return res.json();
}

async function setupTurtleLoreContent() {
  const grid = document.getElementById('lore-photos');
  if (!grid) return;

  const results = await Promise.all(
    LORE_PHOTO_TITLES.map(async (title) => {
      try {
        return await fetchWikiSummary(title);
      } catch {
        return null;
      }
    })
  );

  results.forEach((data) => {
    if (!data?.thumbnail?.source) return;

    const figure = document.createElement('figure');
    figure.className = 'lore-photo';

    const img = document.createElement('img');
    img.src = data.thumbnail.source;
    img.alt = data.title || 'Turtle';
    img.loading = 'lazy';
    img.decoding = 'async';

    const caption = document.createElement('figcaption');
    const link = document.createElement('a');
    link.href = data.content_urls?.desktop?.page || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = data.title || 'Turtle';
    caption.appendChild(link);

    figure.appendChild(img);
    figure.appendChild(caption);
    grid.appendChild(figure);
  });

  window.ScrollTrigger?.refresh();
}

window.addEventListener('DOMContentLoaded', () => {
  setupShowsEmbed();
  setupLegacyIcons();
  setupNavButtons();
  setupWindows();
  setupLightbox();
  setupMailingListForm();
  setupClock();
  setupBandNameCycler();
  setupTurtleLoreContent();
});
