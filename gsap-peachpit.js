/**
 * gsap-peachpit.js — Peach Pit theme only (index2 + body.theme-peachpit).
 *
 * Responsibilities:
 *   1) Page-load intro timeline (header, nav, chrome, sticky).
 *   2) window.peachPitGsap — hooks for script.js (window open/close animations).
 *   3) Instagram oEmbed injection + ScrollTrigger reveal on #ig-scroll-panel.
 *
 * Dependencies (load order in index2.html): gsap.min.js → ScrollTrigger → instagram-config.js → script.js → this file.
 * See PEACH_PIT.md for contracts and Next.js migration notes.
 *
 * @file
 */
(function peachPitGsapModule() {
  if (!document.body.classList.contains('theme-peachpit') || typeof gsap === 'undefined') {
    return;
  }

  // ── DOM ids (keep in sync with index2.html) ─────────────────────────────
  const ID = {
    IG_SCROLL_PANEL: 'ig-scroll-panel',
    IG_LATEST: 'ig-latest',
    IG_EMBED_ROOT: 'ig-embed-root',
    IG_EMBED_FALLBACK: 'ig-embed-fallback',
    LIGHTBOX: 'lightbox',
    LIGHTBOX_IMG: 'lightbox-img',
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const EASE = {
    out: 'power2.out',
    outStrong: 'power3.out',
    pop: 'back.out(1.35)',
    in: 'power2.in',
    navRelease: 'elastic.out(1, 0.35)',
  };

  const DUR = {
    overlay: 0.85,
    scanlines: 0.7,
    title: 0.75,
    tagline: 0.5,
    navBtn: 0.42,
    navStagger: 0.07,
    rule: 0.55,
    sticky: 0.55,
    mlBar: 0.5,
    ticker: 0.55,
    clock: 0.45,
    windowShell: 0.42,
    windowInner: 0.28,
    windowInnerStagger: 0.04,
    photo: 0.32,
    photoStagger: 0.06,
    close: 0.2,
    lightbox: 0.38,
    flicker: 0.08,
    igKicker: 0.5,
    igTitle: 0.6,
    igFrame: 0.65,
  };

  const WIN_PHOTOS = 'window-photos';

  const INNER_SELECTOR =
    '.photo-grid img, .track, .btn-link, .bio-text, .win-section, .contact-list, .ml-form';

  const TITLE_GLOW =
    '2px 2px 10px #000, 0 0 30px rgba(183,255,247,0.55), 0 0 2px rgba(249,240,134,0.9)';

  function queryInnerAnimated(bodyEl) {
    if (!bodyEl) return [];
    return bodyEl.querySelectorAll(INNER_SELECTOR);
  }

  function resetWindowStyles(win, innerEls) {
    gsap.set(win, { clearProps: 'opacity,scale,transformOrigin' });
    gsap.set(innerEls, { clearProps: 'opacity,y' });
  }

  // ── 1) Intro ───────────────────────────────────────────────────────────
  function runIntro() {
    if (prefersReducedMotion) return;

    gsap.set('.bg-overlay', { opacity: 0 });
    gsap.set('.scanlines', { opacity: 0 });
    gsap.set('.band-name', { opacity: 0, y: 28, filter: 'blur(6px)' });
    gsap.set('.tagline', { opacity: 0, y: 16 });
    gsap.set('.pp-btn', { opacity: 0, y: 22 });
    gsap.set('.pp-rule', { opacity: 0, letterSpacing: '0.2em' });
    gsap.set('.sticky', {
      opacity: 0,
      scale: 0.75,
      rotation: -6,
      transformOrigin: 'center center',
    });
    gsap.set('.ml-bar', { opacity: 0, y: 28 });
    gsap.set('.bottom-ticker', { opacity: 0, y: 20 });
    gsap.set('.corner-clock', { opacity: 0, y: 12, scale: 0.85 });

    const tl = gsap.timeline({ defaults: { ease: EASE.out } });

    tl.to('.bg-overlay', { opacity: 1, duration: DUR.overlay }, 0)
      .to('.scanlines', { opacity: 1, duration: DUR.scanlines }, 0.08)
      .to(
        '.band-name',
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: DUR.title, ease: EASE.pop },
        0.12
      )
      .to('.tagline', { opacity: 0.7, y: 0, duration: DUR.tagline }, 0.32)
      .to(
        '.pp-btn',
        { opacity: 1, y: 0, duration: DUR.navBtn, stagger: DUR.navStagger, ease: EASE.pop },
        0.38
      )
      .to(
        '.pp-rule',
        { opacity: 0.7, letterSpacing: '0.6em', duration: DUR.rule, ease: EASE.outStrong },
        0.52
      )
      .to(
        '.sticky',
        { opacity: 1, scale: 1, rotation: 2.8, duration: DUR.sticky, ease: EASE.pop },
        0.48
      )
      .to('.ml-bar', { opacity: 1, y: 0, duration: DUR.mlBar, ease: EASE.pop }, 0.62)
      .to('.bottom-ticker', { opacity: 1, y: 0, duration: DUR.ticker }, 0.68)
      .to(
        '.corner-clock',
        { opacity: 1, y: 0, scale: 1, duration: DUR.clock, ease: EASE.pop },
        0.75
      );

    tl.to(
      '.band-name',
      {
        textShadow: TITLE_GLOW,
        duration: DUR.flicker,
        yoyo: true,
        repeat: 1,
      },
      0.95
    );
  }

  function wireNavPress() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.pp-nav .pp-btn').forEach((btn) => {
      const release = () =>
        gsap.to(btn, { scale: 1, duration: 0.2, ease: EASE.navRelease });

      btn.addEventListener('pointerdown', () => {
        gsap.to(btn, { scale: 0.94, duration: 0.07, ease: EASE.out });
      });
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', (e) => {
        if (e.buttons) return;
        gsap.to(btn, { scale: 1, duration: 0.15, ease: EASE.out });
      });
    });
  }

  function wireLightbox() {
    const root = document.getElementById(ID.LIGHTBOX);
    const img = document.getElementById(ID.LIGHTBOX_IMG);
    if (!root || !img) return;

    const observer = new MutationObserver(() => {
      if (!root.classList.contains('open') || prefersReducedMotion) return;
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: DUR.lightbox, ease: EASE.pop }
      );
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  // ── 2) Public API for script.js (windows) ─────────────────────────────
  window.peachPitGsap = {
    prepareOpen(win) {
      if (prefersReducedMotion) return;
      gsap.set(win, {
        opacity: 0,
        scale: 0.91,
        transformOrigin: '50% 45%',
      });
    },

    animateOpen(win) {
      if (prefersReducedMotion) {
        gsap.set(win, { clearProps: 'opacity,scale' });
        return;
      }

      const bodyEl = win.querySelector('.window-body');
      const innerEls = queryInnerAnimated(bodyEl);

      const tl = gsap.timeline({
        defaults: { ease: EASE.pop },
        onComplete: () => resetWindowStyles(win, innerEls),
      });

      tl.to(win, { opacity: 1, scale: 1, duration: DUR.windowShell }, 0);

      if (win.id === WIN_PHOTOS && bodyEl) {
        const imgs = bodyEl.querySelectorAll('.photo-grid img');
        gsap.set(imgs, { opacity: 0, y: 14 });
        tl.to(
          imgs,
          {
            opacity: 1,
            y: 0,
            duration: DUR.photo,
            stagger: DUR.photoStagger,
            ease: EASE.out,
          },
          0.12
        );
      } else if (innerEls.length) {
        gsap.set(innerEls, { opacity: 0, y: 10 });
        tl.to(
          innerEls,
          {
            opacity: 1,
            y: 0,
            duration: DUR.windowInner,
            stagger: DUR.windowInnerStagger,
            ease: EASE.out,
          },
          0.1
        );
      }
    },

    animateClose(win, done) {
      if (prefersReducedMotion) {
        done();
        return;
      }

      const bodyEl = win.querySelector('.window-body');
      const innerEls = queryInnerAnimated(bodyEl);

      gsap.to(win, {
        opacity: 0,
        scale: 0.94,
        duration: DUR.close,
        ease: EASE.in,
        transformOrigin: '50% 50%',
        onComplete: () => {
          resetWindowStyles(win, innerEls);
          done();
        },
      });
    },
  };

  // ── 3) Instagram embed + ScrollTrigger ────────────────────────────────
  function setupInstagramEmbed() {
    const root = document.getElementById(ID.IG_EMBED_ROOT);
    const fallback = document.getElementById(ID.IG_EMBED_FALLBACK);
    if (!root || !fallback) return;

    const url = String(window.PEACH_PIT_INSTAGRAM_POST_URL || '').trim();
    if (!url) {
      fallback.hidden = false;
      return;
    }

    fallback.hidden = true;

    const block = document.createElement('blockquote');
    block.className = 'instagram-media';
    block.setAttribute('data-instgrm-captioned', '');
    block.setAttribute('data-instgrm-permalink', url);
    block.setAttribute('data-instgrm-version', '14');
    block.style.cssText =
      'background:#fff;border:0;border-radius:4px;max-width:540px;min-width:280px;width:100%;margin:0 auto;';
    root.appendChild(block);

    const runProcess = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
      if (typeof ScrollTrigger !== 'undefined') {
        requestAnimationFrame(() => ScrollTrigger.refresh());
        setTimeout(() => ScrollTrigger.refresh(), 800);
      }
    };

    const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existing) {
      runProcess();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    script.onload = runProcess;
    document.body.appendChild(script);
  }

  function setupInstagramScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const panel = document.getElementById(ID.IG_SCROLL_PANEL);
    const section = document.getElementById(ID.IG_LATEST);
    if (!panel || !section) return;

    const kicker = section.querySelector('.ig-section__kicker');
    const title = section.querySelector('.ig-section__title');
    const frame = section.querySelector('.ig-section__frame');
    if (!kicker || !title || !frame) return;

    if (prefersReducedMotion) {
      gsap.set([kicker, title, frame], { opacity: 1, y: 0 });
      return;
    }

    gsap.set(kicker, { opacity: 0, y: 40 });
    gsap.set(title, { opacity: 0, y: 44 });
    gsap.set(frame, { opacity: 0, y: 52, scale: 0.97, transformOrigin: '50% 0%' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 85%',
        once: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(kicker, { opacity: 0.7, y: 0, duration: DUR.igKicker, ease: EASE.out })
      .to(title, { opacity: 1, y: 0, duration: DUR.igTitle, ease: EASE.pop }, '-=0.32')
      .to(
        frame,
        { opacity: 1, y: 0, scale: 1, duration: DUR.igFrame, ease: EASE.pop },
        '-=0.38'
      );

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    runIntro();
    wireNavPress();
    wireLightbox();
    setupInstagramScrollAnimations();
    setupInstagramEmbed();
  });
})();
