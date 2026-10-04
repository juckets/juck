(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Year ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Nav: mobile toggle + scrolled state + current section ----------
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('is-open', !open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

  // ---------- Project filters ----------
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.project');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.classList.toggle('is-active', c === chip));
    projects.forEach((p) => {
      const tags = p.dataset.tags.split(' ');
      p.classList.toggle('is-hidden', !(f === 'all' || tags.includes(f) || tags.includes('all')));
    });
  }));

  // ---------- Copy email ----------
  document.querySelectorAll('.copy').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied ✓';
    } catch {
      btn.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => (btn.textContent = 'Copy'), 1800);
  }));

  // ---------- Reveal on scroll ----------
  const revealTargets = document.querySelectorAll('.section__head, .prose, .project, .timeline__item, .skill-card, .cv-band, .contact');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => { el.classList.add('reveal'); revealObserver.observe(el); });
  }

  // ---------- Hero: particle tracers in potential flow past a cylinder ----------
  // A nod to PIV: seeded particles advected by an analytic velocity field.
  const canvas = document.querySelector('.hero__flow');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff8a3d';
  let W, H, dpr, cx, cy, R, particles = [], running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wide = W > 760;
    cx = wide ? W * 0.72 : W * 0.75;
    cy = wide ? H * 0.45 : H * 0.86;
    R = Math.min(W, H) * (wide ? 0.13 : 0.09);
    const n = Math.round(Math.min(900, (W * H) / 1400));
    particles = Array.from({ length: n }, () => spawn(true));
    ctx.fillStyle = '#0b0e12'; ctx.fillRect(0, 0, W, H);
  }

  function spawn(anywhere) {
    let x, y;
    do {
      x = anywhere ? Math.random() * W : -Math.random() * 40;
      y = Math.random() * H;
    } while (Math.hypot(x - cx, y - cy) < R * 1.02);
    return { x, y, hot: Math.random() < 0.08 };
  }

  function velocity(x, y) {
    const dx = x - cx, dy = y - cy;
    const r2 = dx * dx + dy * dy, r4 = r2 * r2, R2 = R * R;
    const U = 1.1;
    return [U * (1 - (R2 * (dx * dx - dy * dy)) / r4), -U * (2 * R2 * dx * dy) / r4];
  }

  function frame() {
    if (!running) return;
    ctx.fillStyle = 'rgba(11,14,18,0.08)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const [u, v] = velocity(p.x, p.y);
      const nx = p.x + u, ny = p.y + v;
      const speed = Math.hypot(u, v);
      ctx.strokeStyle = p.hot ? accent : `rgba(160,175,195,${Math.min(0.55, 0.18 + speed * 0.15)})`;
      ctx.lineWidth = p.hot ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      if (p.x > W + 10 || p.y < -10 || p.y > H + 10 || Math.hypot(p.x - cx, p.y - cy) < R) particles[i] = spawn(false);
    }
    // cylinder outline
    ctx.strokeStyle = 'rgba(255,138,61,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    requestAnimationFrame(frame);
  }

  // Pause when hero is off-screen to save battery
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(resize, 150); });
  resize();
  requestAnimationFrame(frame);
})();
