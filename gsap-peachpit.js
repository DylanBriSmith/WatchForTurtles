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

  function playBiteAnimation(onComplete) {
    if (window._biteRunning) return;
    window._biteRunning = true;

    if (reducedMotion) {
      window._biteRunning = false;
      onComplete?.();
      return;
    }

    const VW = window.innerWidth;
    const VH = window.innerHeight;
    const handSize = Math.min(VW * 0.55, 260);
    const biteSize = Math.min(VW, VH) * 0.25;
    const biteX = VW * 0.70;
    const biteY = VH * 0.14;

    // Giant hand — rotated 180° so palm faces down, reaching from above
    const hand = document.createElement('div');
    hand.setAttribute('aria-hidden', 'true');
    hand.style.cssText =
      'position:fixed;font-size:' + handSize + 'px;line-height:1;' +
      'top:' + (-handSize * 1.15) + 'px;left:50%;' +
      'transform:translateX(-50%) rotate(180deg);' +
      'z-index:10001;pointer-events:none;user-select:none;will-change:top;';
    hand.textContent = '🫴';
    document.body.appendChild(hand);

    // Bite circle — same colour as bg so it looks like missing page
    const bite = document.createElement('div');
    bite.setAttribute('aria-hidden', 'true');
    bite.style.cssText =
      'position:fixed;width:0;height:0;' +
      'border-radius:48% 52% 44% 56% / 52% 44% 56% 48%;' +
      'background:var(--bg,#0a0f0a);' +
      'box-shadow:inset 0 6px 18px rgba(0,0,0,0.95),inset 0 0 8px rgba(255,107,53,0.15),0 0 0 2px #1a1208;' +
      'top:' + biteY + 'px;left:' + biteX + 'px;' +
      'transform:translate(-50%,-50%);' +
      'z-index:10000;pointer-events:none;';
    document.body.appendChild(bite);

    gsap.set(document.body, { transformOrigin: '50% 50%' });

    function cleanup() {
      gsap.set(document.body, { clearProps: 'rotate,scale,transformOrigin' });
      hand.remove();
      bite.remove();
      window._biteRunning = false;
    }

    gsap.timeline()
      // Hand drops
      .to(hand, { top: -handSize * 0.05, duration: 0.52, ease: 'power3.in' })
      // Page grabbed — tilt + slight shrink
      .to(document.body, { rotate: -4, scale: 0.96, duration: 0.14, ease: 'power2.out' })
      // Bite opens
      .to(bite, { width: biteSize, height: biteSize, duration: 0.16, ease: 'back.out(2)' })
      // Chomp shake
      .to(document.body, { rotate: 3,  duration: 0.06 })
      .to(document.body, { rotate: -3, duration: 0.06 })
      .to(document.body, { rotate: 2,  duration: 0.05 })
      .to(document.body, { rotate: -4, duration: 0.05 }) // back to "held" tilt
      // Chewing pause
      .to({}, { duration: 0.42 })
      // Hand retreats, page placed back
      .to(hand, { top: -handSize * 0.95, duration: 0.44, ease: 'power2.in' }, '+=0.1')
      .to(document.body, { rotate: 0, scale: 1, duration: 0.52, ease: 'elastic.out(1, 0.55)' }, '<0.08')
      // Bite mark lingers — font changes here
      .to({}, { duration: 0.38 })
      .call(() => onComplete?.())
      // Bite heals
      .to(bite, { width: 0, height: 0, duration: 0.28, ease: 'power2.in' }, '+=0.05')
      // Small pop to punctuate
      .to(document.body, { scale: 1.018, duration: 0.09, ease: 'power2.out' })
      .to(document.body, { scale: 1, duration: 0.22, ease: 'elastic.out(1, 0.5)', onComplete: cleanup });
  }

  window.peachPitGsap = {
    playBiteAnimation,
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
  });
})();
