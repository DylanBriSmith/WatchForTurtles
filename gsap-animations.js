window.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.from('.scanlines', { opacity: 0, duration: 0.35 }, 0)
    .from('.ticker-bar, .bottom-ticker', { opacity: 0, y: -10, duration: 0.4 }, 0.05);

  const taskbar = document.querySelector('.taskbar');
  if (taskbar) {
    tl.from(taskbar, { y: 52, duration: 0.45 }, 0.08);
  }
});
