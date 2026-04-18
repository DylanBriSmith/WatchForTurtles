// ── Inject styles ──
const style = document.createElement('style');
style.textContent = `
  .turtle {
    position: fixed;
    font-size: 1.6rem;
    pointer-events: none;
    z-index: 8;
    line-height: 1;
    will-change: transform, left, top;
  }

  .cursor-trail {
    position: fixed;
    pointer-events: none;
    z-index: 9000;
    font-size: 0.55rem;
    color: rgba(249,240,134,0.75);
    animation: trail-fade 0.7s ease-out forwards;
    transform: translate(-50%, -50%);
  }

  @keyframes trail-fade {
    0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(1.1); }
    100% { opacity: 0;   transform: translate(-50%, -50%) scale(0.2); }
  }
`;
document.head.appendChild(style);


// ── Turtle packs ──
function spawnPack(startX, direction) {
  const yBase = window.innerHeight - 50;
  const spacing = 46;

  const turtles = [];
  for (let i = 0; i < 3; i++) {
    const el = document.createElement('span');
    el.className = 'turtle';
    el.textContent = '🐢';
    document.body.appendChild(el);

    const yOff = (Math.random() - 0.5) * 14;
    // stagger each turtle's step phase so they don't all bob in sync
    turtles.push({ el, x: startX + i * spacing, y: yBase + yOff, yBase: yBase + yOff, frame: i * 8 });
  }

  const baseSpeed = 0.16 + Math.random() * 0.10;
  let vx = direction * baseSpeed;

  function tick() {
    turtles.forEach(t => {
      t.frame++;

      // walking bob: hits ground every ~half cycle, rises between steps
      const bob = Math.abs(Math.sin(t.frame * 0.14)) * -5;

      t.x += vx;
      const flip = vx > 0 ? 'scaleX(-1)' : 'scaleX(1)';
      t.el.style.transform = `${flip} translateY(${bob}px)`;
      t.el.style.left = t.x + 'px';
      t.el.style.top  = t.y + 'px';
    });

    // whole pack bounces together
    const pad = 40;
    const xs  = turtles.map(t => t.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    if (minX < pad) {
      const shift = pad - minX;
      turtles.forEach(t => t.x += shift);
      vx = Math.abs(vx);
    } else if (maxX > window.innerWidth - pad) {
      const shift = maxX - (window.innerWidth - pad);
      turtles.forEach(t => t.x -= shift);
      vx = -Math.abs(vx);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


// ── Cursor trail ──
function initCursorTrail() {
  const chars = ['✦', '·', '✧', '⋆', '·', '·'];
  let last = 0;

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < 40) return;
    last = now;

    const dot = document.createElement('span');
    dot.className = 'cursor-trail';
    dot.textContent = chars[Math.floor(Math.random() * chars.length)];
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    document.body.appendChild(dot);

    setTimeout(() => dot.remove(), 700);
  });
}


// ── Init (Peach Pit theme uses GSAP only — skip decorative effects) ──
window.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('theme-peachpit')) return;

  spawnPack(80, 1);
  setTimeout(() => spawnPack(window.innerWidth - 220, -1), 1600);
  initCursorTrail();
});
