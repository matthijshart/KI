// ClaimKompas v4 — dropdown nav + counters + hero demo + tabs
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

  // Smooth scroll
  document.documentElement.style.scrollBehavior = 'smooth';

  // Year
  qsa('#year').forEach(el => el.textContent = new Date().getFullYear());

  // Reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  qsa('.reveal').forEach(el => io.observe(el));

  // Counters
  const animateCount = (el, to) => {
    const dur = 750;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  qsa('[data-count]').forEach(el => {
    const to = parseInt(el.getAttribute('data-count') || '0', 10);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting){
          animateCount(el, to);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.7 });
    obs.observe(el);
  });

  // Mobile drawer
  const drawer = qs('#drawer');
  const burger = qs('#burger');
  const drawerClose = qs('#drawerClose');
  const dlinks = qsa('.dlink');

  const openDrawer = () => { drawer?.classList.add('open'); drawer?.setAttribute('aria-hidden','false'); };
  const closeDrawer = () => { drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden','true'); };

  burger?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  drawerClose?.addEventListener('click', closeDrawer);
  drawer?.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
  dlinks.forEach(a => a.addEventListener('click', () => closeDrawer()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeAllDropdowns(); } });

  // Dropdown nav (desktop)
  const dds = qsa('.dd');
  const closeAllDropdowns = () => {
    dds.forEach(dd => {
      dd.classList.remove('open');
      const btn = dd.querySelector('.ddBtn');
      if (btn) btn.setAttribute('aria-expanded','false');
    });
  };

  dds.forEach(dd => {
    const btn = dd.querySelector('.ddBtn');
    const pane = dd.querySelector('.ddPane');
    if (!btn || !pane) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dd.classList.contains('open');
      closeAllDropdowns();
      dd.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', (!isOpen).toString());
    });

    // open on hover (mouse)
    dd.addEventListener('mouseenter', () => {
      // don't steal focus; only open if not on touch
      if (window.matchMedia('(hover: hover)').matches){
        closeAllDropdowns();
        dd.classList.add('open');
        btn.setAttribute('aria-expanded','true');
      }
    });
    dd.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches){
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const within = e.target.closest('.dd');
    if (!within) closeAllDropdowns();
  });

  // Hero preview cases
  const heroRisk = qs('#heroRisk');
  const heroFill = qs('#heroFill');
  const heroRiskLabel = qs('#heroRiskLabel');
  const heroNBA = qs('#heroNBA');
  const cases = qsa('.case');

  const labelFor = (r) => {
    if (r >= 70) return ['hoog','high'];
    if (r >= 45) return ['middel','med'];
    return ['laag','low'];
  };

  const setHero = (risk, nba) => {
    const r = clamp(risk, 0, 100);
    const [txt, cls] = labelFor(r);

    if (heroRisk) heroRisk.textContent = `${Math.round(r)}%`;
    if (heroFill) heroFill.style.width = `${Math.round(r)}%`;
    if (heroNBA) heroNBA.textContent = nba;

    if (heroRiskLabel){
      heroRiskLabel.textContent = txt;
      heroRiskLabel.classList.remove('high','med','low');
      heroRiskLabel.classList.add(cls);
    }
  };

  cases.forEach(btn => {
    btn.addEventListener('click', () => {
      cases.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      const risk = parseInt(btn.getAttribute('data-risk') || '0', 10);
      const nba = btn.getAttribute('data-nba') || '—';
      setHero(risk, nba);
    });
  });

  // Tabs (product tour)
  const tabs = qsa('.tab');
  const panes = qsa('.pane');

  const setTab = (id) => {
    tabs.forEach(t => {
      const active = t.getAttribute('aria-controls') === id;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });
    panes.forEach(p => p.classList.toggle('active', p.id === id));
  };

  tabs.forEach(t => {
    t.addEventListener('click', () => setTab(t.getAttribute('aria-controls')));
    t.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(t);
      if (e.key === 'ArrowRight'){ e.preventDefault(); tabs[(idx+1)%tabs.length].focus(); }
      if (e.key === 'ArrowLeft'){ e.preventDefault(); tabs[(idx-1+tabs.length)%tabs.length].focus(); }
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); setTab(t.getAttribute('aria-controls')); }
    });
  });

})();