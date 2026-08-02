/**
 * GSAP animations for the main band page (body.theme-peachpit).
 * Hooks into script.js via window.peachPitGsap.
 */
(function initPeachPitAnimations() {
  if (!document.body.classList.contains('theme-peachpit') || typeof gsap === 'undefined') {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ease = {
    out: 'power2.out',
    outStrong: 'power3.out',
    pop: 'back.out(1.35)',
    in: 'power2.in',
    navRelease: 'elastic.out(1, 0.35)',
  };

  const duration = {
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
  };

  const PHOTOS_WINDOW = 'window-photos';
  const windowContentSelector =
    '.photo-grid img, .track, .btn-link, .bio-text, .win-section, .contact-list, .ml-form';

  const titleGlow =
    '2px 2px 10px #000, 0 0 24px rgba(200,230,201,0.55), 0 0 8px rgba(255,107,53,0.4)';

  let backgroundTween = null;

  function clearWindowAnimationStyles(win, innerElements) {
    gsap.set(win, { clearProps: 'opacity,scale,transformOrigin' });
    gsap.set(innerElements, { clearProps: 'opacity,y' });
  }

  function runPageIntro() {
    if (reducedMotion) return;

    gsap.set('.bg-photo', { scale: 1.14 });
    gsap.set('.bg-overlay', { opacity: 0 });
    gsap.set('.scanlines', { opacity: 0 });
    gsap.set('.band-name', { opacity: 0, y: 28, filter: 'blur(6px)' });
    gsap.set('.tagline', { opacity: 0, y: 16 });
    gsap.set('.pp-btn', { opacity: 0, y: 22 });
    gsap.set('.pp-rule', { opacity: 0, letterSpacing: '0.2em' });
    gsap.set('.sticky', { opacity: 0, scale: 0.8, transformOrigin: 'top right' });
    gsap.set('.scroll-hint', { opacity: 0 });
    gsap.set('.ml-bar', { opacity: 0, y: 28 });
    gsap.set('.bottom-ticker', { opacity: 0, y: 20 });
    gsap.set('.corner-clock', { opacity: 0, y: 12, scale: 0.85 });

    const intro = gsap.timeline({ defaults: { ease: ease.out } });

    intro
      .to('.bg-photo', { scale: 1.06, duration: 14, ease: 'power1.out' }, 0)
      .to('.bg-overlay', { opacity: 1, duration: duration.overlay }, 0)
      .to('.scanlines', { opacity: 1, duration: duration.scanlines }, 0.08)
      .to(
        '.band-name',
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: duration.title, ease: ease.pop },
        0.12
      )
      .to('.tagline', { opacity: 0.7, y: 0, duration: duration.tagline }, 0.32)
      .to(
        '.pp-btn',
        { opacity: 1, y: 0, duration: duration.navBtn, stagger: duration.navStagger, ease: ease.pop },
        0.38
      )
      .to(
        '.pp-rule',
        { opacity: 0.7, letterSpacing: '0.6em', duration: duration.rule, ease: ease.outStrong },
        0.52
      )
      .to('.sticky', { opacity: 1, scale: 1, duration: duration.sticky, ease: ease.pop }, 0.48)
      .to('.scroll-hint', { opacity: 0.75, duration: 0.5 }, 0.9)
      .to('.ml-bar', { opacity: 1, y: 0, duration: duration.mlBar, ease: ease.pop }, 0.62)
      .to('.bottom-ticker', { opacity: 1, y: 0, duration: duration.ticker }, 0.68)
      .to(
        '.corner-clock',
        { opacity: 1, y: 0, scale: 1, duration: duration.clock, ease: ease.pop },
        0.75
      )
      .to(
        '.band-name',
        { textShadow: titleGlow, duration: duration.flicker, yoyo: true, repeat: 1 },
        0.95
      );

    document.querySelector('.bg-photo')?.classList.add('is-animating');

    backgroundTween = gsap.to('.bg-photo', {
      scale: 1.1,
      duration: 28,
      ease: 'none',
      repeat: -1,
      yoyo: true,
      delay: 2,
    });

    document.addEventListener('visibilitychange', () => {
      if (!backgroundTween) return;
      document.hidden ? backgroundTween.pause() : backgroundTween.resume();
    });
  }

  function setupNavButtonPress() {
    if (reducedMotion) return;

    document.querySelectorAll('.pp-nav .pp-btn').forEach((btn) => {
      const release = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: ease.navRelease });

      btn.addEventListener('pointerdown', () => {
        gsap.to(btn, { scale: 0.94, duration: 0.07, ease: ease.out });
      });
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', (e) => {
        if (e.buttons) return;
        gsap.to(btn, { scale: 1, duration: 0.15, ease: ease.out });
      });
    });
  }

  function setupLightboxAnimation() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lightbox || !img) return;

    new MutationObserver(() => {
      if (!lightbox.classList.contains('open') || reducedMotion) return;
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: duration.lightbox, ease: ease.pop }
      );
    }).observe(lightbox, { attributes: true, attributeFilter: ['class'] });
  }

  function setupTurtleLoreScroll() {
    const lore = document.getElementById('turtle-lore');
    const track = document.getElementById('lore-photos');
    const pin = document.querySelector('.lore-pin');
    if (!lore || !track || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Clear previous lore triggers if photos reload
    ScrollTrigger.getAll().forEach((st) => {
      const id = String(st.vars.id || '');
      if (id.startsWith('lore-') || st.trigger?.closest?.('#turtle-lore')) st.kill();
    });
    gsap.set(track, { clearProps: 'transform' });
    gsap.set('.lore-wiki-links li', { clearProps: 'opacity,transform' });

    if (reducedMotion) {
      document.body.classList.add('is-in-lore');
      return;
    }

    // Hide menu once you leave the first screen (plain scroll check — reliable)
    const spacer = document.querySelector('.first-fold-spacer');
    const updateLoreChrome = () => {
      if (!spacer) return;
      const pastFirstScreen = spacer.getBoundingClientRect().bottom < window.innerHeight * 0.8;
      document.body.classList.toggle('is-in-lore', pastFirstScreen);
    };
    window.addEventListener('scroll', updateLoreChrome, { passive: true });
    updateLoreChrome();

    // Fade the scroll hint as you leave the first screen
    const hint = document.querySelector('.scroll-hint');
    if (hint) {
      gsap.to(hint, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          id: 'lore-hint',
          trigger: '.first-fold-spacer',
          start: 'center center',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Pin photos and scrub them horizontally (classic ScrollTrigger pattern)
    const photos = gsap.utils.toArray('#lore-photos .lore-photo');
    if (pin && photos.length > 1) {
      gsap.to(track, {
        x: () => {
          const viewport = pin.querySelector('.lore-photos-viewport');
          const viewW = viewport ? viewport.clientWidth : window.innerWidth;
          return Math.min(0, viewW - track.scrollWidth);
        },
        ease: 'none',
        scrollTrigger: {
          id: 'lore-photos',
          trigger: pin,
          start: 'top top',
          end: () => '+=' + Math.max(track.scrollWidth, window.innerHeight),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }

    // Wiki links: animate in as a group (stay visible + clickable after)
    const links = gsap.utils.toArray('.lore-wiki-links li');
    if (links.length) {
      gsap.from(links, {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.06,
        ease: ease.out,
        scrollTrigger: {
          id: 'lore-links',
          trigger: '.lore-wiki-links',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }
  }

  window.peachPitGsap = {
    setupTurtleLoreScroll,
    prepareOpen(win) {
      if (reducedMotion) return;
      gsap.set(win, { opacity: 0, scale: 0.91, transformOrigin: '50% 45%' });
    },

    animateOpen(win) {
      if (reducedMotion) {
        gsap.set(win, { clearProps: 'opacity,scale' });
        return;
      }

      const body = win.querySelector('.window-body');
      const inner = body ? body.querySelectorAll(windowContentSelector) : [];

      const tl = gsap.timeline({
        defaults: { ease: ease.pop },
        onComplete: () => clearWindowAnimationStyles(win, inner),
      });

      tl.to(win, { opacity: 1, scale: 1, duration: duration.windowShell }, 0);

      if (win.id === PHOTOS_WINDOW && body) {
        const photos = body.querySelectorAll('.photo-grid img');
        gsap.set(photos, { opacity: 0, y: 14 });
        tl.to(
          photos,
          {
            opacity: 1,
            y: 0,
            duration: duration.photo,
            stagger: duration.photoStagger,
            ease: ease.out,
          },
          0.12
        );
      } else if (inner.length) {
        gsap.set(inner, { opacity: 0, y: 10 });
        tl.to(
          inner,
          {
            opacity: 1,
            y: 0,
            duration: duration.windowInner,
            stagger: duration.windowInnerStagger,
            ease: ease.out,
          },
          0.1
        );
      }
    },

    animateClose(win, onDone) {
      if (reducedMotion) {
        onDone();
        return;
      }

      const body = win.querySelector('.window-body');
      const inner = body ? body.querySelectorAll(windowContentSelector) : [];

      gsap.to(win, {
        opacity: 0,
        scale: 0.94,
        duration: duration.close,
        ease: ease.in,
        transformOrigin: '50% 50%',
        onComplete: () => {
          clearWindowAnimationStyles(win, inner);
          onDone();
        },
      });
    },
  };

  window.addEventListener('DOMContentLoaded', () => {
    runPageIntro();
    setupNavButtonPress();
    setupLightboxAnimation();
    // Turtle lore scroll is started after photos load (see script.js)
  });
})();
