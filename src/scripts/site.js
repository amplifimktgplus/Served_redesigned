/* Served. site script: chrome, motion, discovery, booking. No dependencies. Every URL comes from HTML attributes. */
(() => {
  'use strict';
  const d = document, W = window, root = d.documentElement;
  W.__srv = true;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
  const TZ = 'Asia/Manila';
  const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const nowHour = () => +new Date().toLocaleString('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false });
  const addDays = (iso, n) => { const t = new Date(iso + 'T12:00:00+08:00'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const fmt = (iso, o) => new Date(iso + 'T12:00:00+08:00').toLocaleDateString('en-PH', { timeZone: TZ, ...o });
  const peso = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pesoI = (n) => '₱' + Number(n).toLocaleString('en-PH');
  const hh = (h) => { const x = h % 24; const s = x >= 12 ? 'PM' : 'AM'; const k = x % 12 || 12; return `${k}:00 ${s}`; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------------------------------------------------------- toast
  const toastEl = $('[data-toast]'); let toastT;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200); }
  // shared with the accounts script that follows this one in the bundle (it adds W.__srv.acct)
  W.__srv = { $, $$, esc, toast, fmt, peso, pesoI, hh, ss, RM, todayISO, nowHour };

  // ---------------------------------------------------------------- installable app
  // The service worker (sw.js) plus the web app manifest make the site installable. The install prompt itself
  // comes from the browser: Chromium browsers fire beforeinstallprompt, which is held here and shown when
  // Install App is pressed. Safari and Firefox have no prompt to show, so the button explains their steps.
  if ('serviceWorker' in navigator && W.isSecureContext) {
    W.addEventListener('load', () => {
      const base = new URL(root.dataset.root || './', d.baseURI);
      navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname }).catch(() => { /* site still works without it */ });
    });
  }
  const installBtns = $$('[data-install]');
  if (installBtns.length) {
    const hint = $('[data-install-hint]');
    let held = null;
    const standalone = () => W.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const hideAll = () => { installBtns.forEach((b) => { b.hidden = true; }); if (hint) hint.textContent = ''; };
    if (standalone()) hideAll();
    W.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); held = e; if (hint) hint.textContent = ''; });
    W.addEventListener('appinstalled', () => { held = null; hideAll(); toast('Served. is installed. Open it from your home screen or apps.'); });
    const steps = () => {
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'On iPhone or iPad, tap Share, then Add to Home Screen.';
      if (/Firefox\//.test(ua)) return /Android/.test(ua) ? 'Open the Firefox menu and tap Install.' : 'Firefox on a computer does not install web apps. Open this page in Chrome, Edge or Safari to install Served.';
      if (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/.test(ua)) return 'In Safari, open the File menu and choose Add to Dock.';
      if (/Android/.test(ua)) return 'Open your browser menu and tap Install app or Add to Home screen.';
      return 'Use the install icon at the right of the address bar, or open the browser menu and choose Install Served.';
    };
    installBtns.forEach((b) => b.addEventListener('click', async () => {
      if (held) {
        const e = held; held = null;
        try { await e.prompt(); const choice = await e.userChoice; if (choice && choice.outcome === 'accepted') hideAll(); } catch (err) { if (hint) hint.textContent = steps(); }
        return;
      }
      if (hint) hint.textContent = standalone() ? 'Served. is already installed on this device.' : steps();
    }));
  }

  // ---------------------------------------------------------------- splash (once per session, skippable)
  const ready = () => { root.classList.add('is-ready'); };
  const splash = $('[data-splash]');
  if (root.classList.contains('splash-on') && splash) {
    let done = false;
    const end = () => {
      if (done) return; done = true; ss.set('srv.splash', '1');
      splash.classList.add('is-out');
      setTimeout(() => { root.classList.remove('splash-on'); }, 700);
      setTimeout(ready, 250);
      ['keydown', 'pointerdown', 'wheel', 'touchstart'].forEach((e) => W.removeEventListener(e, end));
    };
    ['keydown', 'pointerdown', 'wheel', 'touchstart'].forEach((e) => W.addEventListener(e, end, { passive: true }));
    setTimeout(end, 1500);
  } else { root.classList.remove('splash-on'); requestAnimationFrame(ready); }

  // the logo's full stop: pointing at or focusing the logo tosses it like a serve, and a toss always finishes
  if (!RM) $$('.logo').forEach((lg) => {
    const dot = $('.logo__d', lg); if (!dot) return;
    const toss = () => dot.classList.add('is-toss');
    lg.addEventListener('pointerenter', toss); lg.addEventListener('focus', toss);
    dot.addEventListener('animationend', () => dot.classList.remove('is-toss'));
  });

  // ---------------------------------------------------------------- header, mega menus, drawer
  const hdr = $('[data-hdr]'); const drawer = $('[data-drawer]'); const burger = $('[data-burger]');
  let lastY = W.scrollY, megaOpen = null;
  function closeMega() { if (!megaOpen) return; const b = $('.nav__btn', megaOpen); b.setAttribute('aria-expanded', 'false'); $('.mega', megaOpen).hidden = true; megaOpen = null; hdr.classList.remove('is-mega'); }
  function openMega(li) { if (megaOpen === li) return; closeMega(); megaOpen = li; $('.nav__btn', li).setAttribute('aria-expanded', 'true'); $('.mega', li).hidden = false; hdr.classList.add('is-mega', 'is-solid'); }
  $$('[data-mega]').forEach((li) => {
    const b = $('.nav__btn', li); let t;
    b.addEventListener('click', () => (megaOpen === li ? closeMega() : openMega(li)));
    if (FINE) {
      li.addEventListener('pointerenter', () => { clearTimeout(t); t = setTimeout(() => openMega(li), 90); });
      li.addEventListener('pointerleave', () => { clearTimeout(t); t = setTimeout(() => { if (megaOpen === li) closeMega(); }, 220); });
    }
  });
  d.addEventListener('click', (e) => { if (megaOpen && !megaOpen.contains(e.target)) closeMega(); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (megaOpen) { const b = $('.nav__btn', megaOpen); closeMega(); b.focus(); } if (drawer && !drawer.hidden) setDrawer(false); } });
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open; burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.classList.toggle('drawer-open', open); hdr.classList.toggle('is-open', open); evalBar();
    if (open) { const f = $('input', drawer); if (f && FINE) f.focus(); }
  }
  if (burger) burger.addEventListener('click', () => setDrawer(drawer.hidden));
  if (drawer) drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
  W.addEventListener('resize', () => { if (W.innerWidth > 1100 && drawer && !drawer.hidden) setDrawer(false); }, { passive: true });

  // ---------------------------------------------------------------- sticky bar (past the hero, gone at the footer, while typing, or for the session)
  const bar = $('[data-stick]'); const ftr = $('[data-ftr]');
  let footerIn = false, typing = false, barOff = ss.get('srv.bar') === 'off', barWant = false;
  function evalBar() {
    if (!bar || barOff) return;
    const sheetOpen = !!$('.sheet:not([hidden]), .lb, .filters.is-open');
    const on = W.scrollY > W.innerHeight * 0.72 && !footerIn && !typing && (!drawer || drawer.hidden) && !sheetOpen;
    barWant = on;
    if (on) { bar.hidden = false; requestAnimationFrame(() => { if (barWant) bar.classList.add('is-on'); }); root.style.setProperty('--bottom-stack', (bar.offsetHeight || 76) + 'px'); }
    else { bar.classList.remove('is-on'); root.style.setProperty('--bottom-stack', '0px'); }
  }
  if (bar) {
    bar.hidden = false;
    $('[data-stick-x]', bar).addEventListener('click', () => { barOff = true; ss.set('srv.bar', 'off'); bar.classList.remove('is-on'); root.style.setProperty('--bottom-stack', '0px'); });
    if (ftr && 'IntersectionObserver' in W) new IntersectionObserver((en) => { footerIn = en[0].isIntersecting; evalBar(); }, { rootMargin: '0px 0px -25% 0px' }).observe(ftr);
    d.addEventListener('focusin', (e) => { if (e.target.matches('input, textarea, select')) { typing = true; evalBar(); } });
    d.addEventListener('focusout', (e) => { if (e.target.matches('input, textarea, select')) { typing = false; setTimeout(evalBar, 140); } });
  }

  // ---------------------------------------------------------------- scroll loop: header state, bar, parallax
  const depthEls = (!RM && W.innerWidth > 760) ? $$('[data-depth]') : [];
  const inView = new Set();
  if (depthEls.length && 'IntersectionObserver' in W) {
    const io = new IntersectionObserver((en) => en.forEach((x) => (x.isIntersecting ? inView.add(x.target) : inView.delete(x.target))), { rootMargin: '20% 0px' });
    depthEls.forEach((el) => io.observe(el));
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = W.scrollY;
      if (hdr) {
        // the header stays in view the whole way down (client, 27 Nov 2026); it only turns solid off the top
        hdr.classList.toggle('is-solid', y > 24 || !!megaOpen);
      }
      lastY = y;
      evalBar();
      const vh = W.innerHeight;
      inView.forEach((el) => {
        const r = el.getBoundingClientRect(); const k = parseFloat(el.dataset.depth) || 0.1;
        const off = (r.top + r.height / 2 - vh / 2) * k;
        el.style.translate = `0 ${(-off).toFixed(1)}px`;
      });
    });
  }
  W.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------------- reveals, line draws, masks, counters, bounces
  function countUp(el) {
    const end = parseFloat(el.dataset.count); if (isNaN(end) || RM) return;
    const t0 = performance.now(), dur = 1200;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in W) {
    const rio = new IntersectionObserver((en) => en.forEach((x) => {
      if (!x.isIntersecting) return;
      const el = x.target;
      if (el.matches('[data-reveal], [data-mask], .cdiv')) el.classList.add('is-in');
      if (el.matches('[data-draw]')) el.classList.add('is-drawn');
      if (el.matches('[data-count]')) countUp(el);
      if (el.matches('[data-bounce]')) el.classList.add('is-bouncing');
      rio.unobserve(el);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal], [data-mask], [data-draw], [data-count], [data-bounce], .cdiv').forEach((el) => { if (!el.closest('.hero') || el.matches('[data-count]')) rio.observe(el); });
  } else root.classList.add('reveal-all');
  setTimeout(() => $$('.hero [data-draw]').forEach((p) => p.classList.add('is-drawn')), 400);

  // ---------------------------------------------------------------- pointer effects: hero light, tilt, spotlight, magnetic, click spark
  if (FINE && !RM) {
    $$('[data-spot]').forEach((el) => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }));
    d.addEventListener('pointermove', (e) => {
      const t = e.target.closest && e.target.closest('[data-tilt]');
      if (t) {
        const r = t.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 8).toFixed(2)}deg)`;
        t.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      }
      const s = e.target.closest && e.target.closest('[data-spotlight]');
      if (s) { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
    d.addEventListener('pointerout', (e) => {
      const t = e.target.closest && e.target.closest('[data-tilt]');
      if (t && !t.contains(e.relatedTarget)) t.style.transform = '';
    });
    $$('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.translate = `${(x * 0.12).toFixed(1)}px ${(y * 0.22).toFixed(1)}px`; });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }
  if (!RM) d.addEventListener('click', (e) => {
    const b = e.target.closest('.btn--accent, .slot, .dpill, .cpk');
    if (!b || !e.clientX) return;
    for (let i = 0; i < 8; i++) {
      const s = d.createElement('i'); s.className = 'spark';
      const ang = (i / 8) * 360;
      s.style.left = e.clientX + W.scrollX + 'px'; s.style.top = e.clientY + W.scrollY + 'px';
      d.body.appendChild(s);
      s.animate([{ transform: `rotate(${ang}deg) translateY(-6px) scaleY(1)`, opacity: 1 }, { transform: `rotate(${ang}deg) translateY(-26px) scaleY(.2)`, opacity: 0 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => s.remove();
    }
  });

  // ---------------------------------------------------------------- hero options: the photo answers the pointer
  if (FINE && !RM) $$('[data-hx]').forEach((hx) => {
    let raf = 0, nx = 0, ny = 0;
    hx.addEventListener('pointermove', (e) => { const r = hx.getBoundingClientRect(); nx = ((e.clientX - r.left) / r.width - 0.5) * 2; ny = ((e.clientY - r.top) / r.height - 0.5) * 2; if (!raf) raf = requestAnimationFrame(() => { raf = 0; hx.style.setProperty('--px', nx.toFixed(3)); hx.style.setProperty('--py', ny.toFixed(3)); }); });
    hx.addEventListener('pointerleave', () => { hx.style.setProperty('--px', 0); hx.style.setProperty('--py', 0); });
  });

  // ---------------------------------------------------------------- rotating sport word
  $$('[data-rotate]').forEach((el) => {
    const words = el.dataset.rotate.split('|'), tones = (el.dataset.tones || '').split('|'); let i = 0;
    const set = () => { el.style.setProperty('--tone', `var(--${tones[i] || 'accent'})`); };
    set(); if (RM) return;
    setInterval(() => { if (d.hidden) return; i = (i + 1) % words.length; el.textContent = words[i]; set(); el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }, 2400);
  });

  // ---------------------------------------------------------------- marquee whose speed follows scroll velocity
  $$('[data-marquee]').forEach((mq) => {
    const track = $('.mq__track', mq); const run = $('.mq__run', mq);
    if (RM || !track || !run) return;
    const k = parseFloat(mq.dataset.marquee) || 1; // speed multiple: data-marquee="0.3" runs at 0.3x, scroll boost included
    let x = 0, v = 0, lastS = W.scrollY, visible = false, last = performance.now(), dir = 1, hover = false;
    mq.addEventListener('pointerenter', () => { hover = true; }); mq.addEventListener('pointerleave', () => { hover = false; });
    mq.addEventListener('focusin', () => { hover = true; }); mq.addEventListener('focusout', () => { hover = false; });
    if ('IntersectionObserver' in W) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(mq); else visible = true;
    const loop = (t) => {
      const dt = Math.min(64, t - last) / 1000; last = t;
      const s = W.scrollY; const ds = s - lastS; lastS = s;
      if (ds) dir = ds > 0 ? 1 : -1;
      v += (Math.abs(ds) * 14 - v) * 0.08;
      if (visible && !d.hidden && !hover) {
        const w = run.offsetWidth || 1;
        x -= (60 + v) * k * dt * dir;
        if (x <= -w) x += w; if (x > 0) x -= w;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  // ---------------------------------------------------------------- split-flap board: every tile clacks through random characters
  // and lands on its own letter, the tiles starting left to right. Each tile: a still upper and lower half, and two flaps
  // that turn over them (the old letter's top falls to the hinge, then the new letter's bottom falls into place).
  // Without script or with reduced motion the markup already reads the final word.
  $$('[data-flap]').forEach((board) => {
    const tiles = $$('.flap__t', board);
    if (!tiles.length || RM || !board.animate) return;
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', DUR = 120, STAG = 60, FLIPS = 8;
    const face = (ch) => (ch === '.' ? '<b class="flap__ball"></b>' : ch === ' ' ? '' : esc(ch));
    const put = (t, k, ch) => { $(`.flap__${k} > i`, t).innerHTML = face(ch); };
    const turn = (t, to) => new Promise((done) => {
      const from = t.dataset.now || ' ';
      put(t, 'u', to); put(t, 'l', from); put(t, 'fu', from); put(t, 'fl', to);
      const up = $('.flap__fu', t).animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: DUR / 2, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
      const lo = $('.flap__fl', t).animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: DUR / 2, delay: DUR / 2, easing: 'cubic-bezier(0,.55,.45,1)', fill: 'forwards' });
      const end = () => { put(t, 'l', to); put(t, 'fu', to); up.cancel(); lo.cancel(); t.dataset.now = to; done(); };
      lo.finished.then(end, end);
    });
    let busy = false;
    const play = async () => {
      if (busy) return; busy = true;
      await Promise.all(tiles.map(async (t, i) => {
        await new Promise((r) => setTimeout(r, i * STAG));
        const n = FLIPS + i; // the later tiles turn a little longer, so the word lands left to right
        for (let k = 1; k <= n; k++) await turn(t, k === n ? t.dataset.ch : CH[(Math.random() * CH.length) | 0]);
      }));
      busy = false;
    };
    tiles.forEach((t) => { ['u', 'l', 'fu', 'fl'].forEach((k) => put(t, k, ' ')); t.dataset.now = ' '; }); // blank until it is seen
    if ('IntersectionObserver' in W) { const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.4 }); io.observe(board); } else play();
    if (FINE) board.addEventListener('pointerenter', play);
  });

  // ---------------------------------------------------------------- dates for the hero search and discovery
  const dayName = (iso, i) => (i === 0 ? 'Today' : i === 1 ? 'Tmrw' : fmt(iso, { weekday: 'short' }));
  $$('[data-dchips]').forEach((box) => {
    const t = todayISO();
    for (let i = 0; i < 7; i++) {
      const iso = addDays(t, i);
      box.insertAdjacentHTML('beforeend', `<label><input type="radio" name="date" value="${iso}"><span><b>${fmt(iso, { day: 'numeric' })}</b><small>${dayName(iso, i)}</small></span></label>`);
    }
  });
  $$('[data-date-select]').forEach((sel) => {
    const t = todayISO();
    for (let i = 0; i < 21; i++) { const iso = addDays(t, i); sel.insertAdjacentHTML('beforeend', `<option value="${iso}">${i === 0 ? 'Today, ' : i === 1 ? 'Tomorrow, ' : ''}${fmt(iso, { weekday: 'short', day: 'numeric', month: 'short' })}</option>`); }
  });

  // next open date on cards and bars, relative to today
  const nextOpen = (list) => { const t = todayISO(); return list.split(',').find((x) => x >= t); };
  $$('[data-next]').forEach((el) => { const n = nextOpen(el.dataset.next); const b = $('b', el); if (b) b.textContent = n ? fmt(n, { weekday: 'short', day: 'numeric', month: 'short' }) : 'see calendar'; });
  $$('[data-next-short]').forEach((el) => { const n = nextOpen(el.dataset.nextShort); el.textContent = n ? 'Next: ' + fmt(n, { weekday: 'short', day: 'numeric', month: 'short' }) : 'Open the calendar'; });

  // ---------------------------------------------------------------- tabs
  $$('[data-tabs]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach((t) => { const on = t === tab; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; const p = d.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on; });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true); } });
    });
  });

  // ---------------------------------------------------------------- demo forms, password eye, role from the query
  $$('[data-demo-form]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    toast('Preview build: nothing was sent. On the live site this goes straight through.');
  }));
  $$('[data-eye]').forEach((b) => b.addEventListener('click', () => { const i = b.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); }));
  const qs = new URLSearchParams(location.search);
  if (qs.get('role') === 'owner') { const r = $('input[name="role"][value="owner"]'); if (r) r.checked = true; }
  // contact?subject=Listing my court picks that subject, as the current site does
  const subjQ = (qs.get('subject') || '').trim().toLowerCase(); const subjSel = $('select[name="subject"]');
  if (subjQ && subjSel) { const o = [...subjSel.options].find((x) => x.text.trim().toLowerCase() === subjQ); if (o) subjSel.value = o.value; }

  // ---------------------------------------------------------------- payout calculator
  $$('[data-calc]').forEach((c) => {
    const inp = $('[data-calc-rate]', c), rng = $('[data-calc-range]', c), out = (k) => $(`[data-calc-o="${k}"]`, c);
    const paint = (v) => { const r = Math.max(0, +v || 0); const fee = Math.round(r * 5) / 100; out('rate').textContent = peso(r); out('fee').textContent = '+ ' + peso(fee); out('pays').textContent = peso(r + fee); out('you').textContent = peso(r); };
    inp.addEventListener('input', () => { rng.value = inp.value; paint(inp.value); });
    rng.addEventListener('input', () => { inp.value = rng.value; paint(rng.value); });
  });

  // ---------------------------------------------------------------- help search + topics
  const hq = $('[data-help-q]');
  if (hq) {
    const items = $$('.faq--help .faq__item'); const empty = $('[data-help-empty]'); let cat = '';
    const run = () => {
      const q = hq.value.trim().toLowerCase(); let n = 0;
      items.forEach((it) => { const ok = (!cat || it.dataset.cat === cat) && (!q || it.textContent.toLowerCase().includes(q)); it.hidden = !ok; if (ok) n++; if (q && ok) it.open = true; });
      empty.hidden = n > 0;
    };
    hq.addEventListener('input', run);
    $$('[data-help-cat]').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.helpCat; $$('[data-help-cat]').forEach((x) => x.classList.toggle('is-on', x === b)); run(); }));
  }

  // ---------------------------------------------------------------- concave carousel: a gallery wall that curves around you
  // Photos hang on the inside of a drum: the further one sits from the middle, the more it turns toward you and comes
  // forward (x = R sin a, z = R (1 - cos a)). A native scroller still does the moving, so touch, trackpad, keys and the
  // buttons all work. The set is repeated either side so a slow drift can turn the wall for ever; the drift stops
  // whenever someone hovers, touches, drags, focuses or opens a photo, and the wall settles with a photo centred.
  function initCC(cc) {
    if (!cc) return;
    const tr = $('[data-cc-track]', cc); if (!tr || tr.dataset.ccOn) return; tr.dataset.ccOn = '1';
    const orig = $$('[data-cc-slide]', tr); const n = orig.length; if (!n) return;
    const count = $('[data-cc-count]', cc); const loop = n > 2;
    if (loop) {
      const copies = () => orig.map((s) => { const c = s.cloneNode(true); c.removeAttribute('data-cc-slide'); c.setAttribute('aria-hidden', 'true'); $$('button, a', c).forEach((b) => b.setAttribute('tabindex', '-1')); return c; });
      copies().forEach((c) => tr.insertBefore(c, orig[0])); copies().forEach((c) => tr.appendChild(c));
    }
    const all = $$('.cc__s', tr); const home = loop ? n : 0;
    const centreOf = (s) => s.offsetLeft - (tr.clientWidth - s.offsetWidth) / 2;
    const period = () => (loop ? all[n].offsetLeft - all[0].offsetLeft : 0);
    const step = () => (all[1] ? all[1].offsetLeft - all[0].offsetLeft : tr.clientWidth);
    const pad = (k) => String(k).padStart(2, '0');
    let raf = 0, cur = home;
    const paint = () => {
      raf = 0; const W2 = tr.clientWidth; const mid = tr.scrollLeft + W2 / 2; const R = W2 * 0.95; let best = home, bestD = Infinity;
      all.forEach((s, i) => {
        const dx = s.offsetLeft + s.offsetWidth / 2 - mid; const ad = Math.abs(dx);
        if (ad < bestD) { bestD = ad; best = i; }
        if (ad > W2 * 1.4) return;
        s.style.setProperty('--cc-a', Math.min(1, ad / (W2 * 0.5)).toFixed(3));
        if (RM) return;
        const a = Math.max(-1.2, Math.min(1.2, dx / R));
        s.style.transform = `translate3d(${(R * Math.sin(a) - dx).toFixed(1)}px,0,${(R * (1 - Math.cos(a)) * 0.62).toFixed(1)}px) rotateY(${(-a * 51.6).toFixed(2)}deg)`;
      });
      cur = best; all.forEach((s, i) => s.classList.toggle('is-mid', i === best));
      if (count) count.textContent = `${pad((best % n) + 1)} / ${pad(n)}`;
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(paint); };
    // keep the middle copy centred: jumping by one whole set looks identical, so the wall never runs out
    const wrap = () => { if (!loop) return; const P = period(), base = centreOf(all[home]), half = step() / 2; if (tr.scrollLeft < base - half) { tr.scrollLeft += P; acc += P; } else if (tr.scrollLeft > base + P - half) { tr.scrollLeft -= P; acc -= P; } };
    let settleT = 0;
    tr.addEventListener('scroll', () => { req(); clearTimeout(settleT); settleT = setTimeout(() => { if (!tr.classList.contains('is-drift')) wrap(); }, 140); }, { passive: true });
    W.addEventListener('resize', req);
    const go = (i, smooth = !RM) => tr.scrollTo({ left: centreOf(all[Math.max(0, Math.min(all.length - 1, i))]), behavior: smooth ? 'smooth' : 'auto' });
    // drift: about a sixth of a photo a second, and only while nobody is interacting
    let acc = 0, last = 0, hold = 0, hovering = false, dragging = false, visible = true;
    const holdFor = (ms) => { hold = performance.now() + ms; };
    const tick = (t) => {
      const dt = last ? Math.min(64, t - last) / 1000 : 0; last = t;
      const busy = hovering || dragging || t < hold || !visible || d.hidden || cc.contains(d.activeElement) || $('.lb');
      if (loop && !RM && !busy) { if (!tr.classList.contains('is-drift')) { tr.classList.add('is-drift'); acc = tr.scrollLeft; } acc += step() * 0.16 * dt; tr.scrollLeft = acc; wrap(); }
      else if (tr.classList.contains('is-drift')) { tr.classList.remove('is-drift'); go(cur); }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in W) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(cc);
    cc.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
    cc.addEventListener('pointerleave', () => { hovering = false; holdFor(800); });
    ['touchstart', 'wheel', 'keydown'].forEach((ev) => tr.addEventListener(ev, () => holdFor(3500), { passive: true }));
    const prev = $('[data-cc-prev]', cc), next = $('[data-cc-next]', cc);
    if (prev) prev.addEventListener('click', () => { holdFor(4000); go(cur - 1); });
    if (next) next.addEventListener('click', () => { holdFor(4000); go(cur + 1); });
    tr.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    // mouse drag (touch and trackpads scroll natively); a drag never opens a photo, and a side photo turns the wall to it
    let drag = null, suppress = false;
    tr.addEventListener('click', (ev) => {
      if (suppress) { suppress = false; ev.stopPropagation(); ev.preventDefault(); return; }
      const s = ev.target.closest('.cc__s'); if (s && !s.classList.contains('is-mid')) { ev.stopPropagation(); ev.preventDefault(); holdFor(4000); go(all.indexOf(s)); }
    }, true);
    tr.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag = { x: e.clientX, s: tr.scrollLeft, moved: false }; dragging = true; });
    W.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; tr.classList.add('is-drag'); } if (drag.moved) tr.scrollLeft = drag.s - dx; });
    W.addEventListener('pointerup', () => {
      if (!drag) return; const moved = drag.moved; drag = null; dragging = false; holdFor(3000);
      if (moved) { tr.classList.remove('is-drag'); paint(); go(cur); suppress = true; setTimeout(() => { suppress = false; }, 0); }
    });
    requestAnimationFrame(() => { tr.scrollLeft = centreOf(all[home]); acc = tr.scrollLeft; paint(); requestAnimationFrame(tick); });
  }
  $$('[data-cc]').forEach(initCC);
  W.__srv.cc = initCC;

  // ---------------------------------------------------------------- gallery filter + lightbox
  const gf = $('[data-gal-filter]');
  if (gf) $$('button', gf).forEach((b) => b.addEventListener('click', () => {
    const g = b.dataset.g; $$('button', gf).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    $$('.mz[data-g]').forEach((m) => m.classList.toggle('is-hide', g !== 'All' && m.dataset.g !== g));
  }));
  d.addEventListener('click', (e) => {
    const t = e.target.closest('[data-lightbox]'); if (!t) return;
    const lb = d.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo');
    const alt = ($('img', t) || {}).alt || '';
    lb.innerHTML = `<img src="${esc(t.dataset.lightbox)}" alt="${esc(alt)}"><button class="iconbtn" type="button" aria-label="Close photo"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>`;
    const close = () => { lb.remove(); d.removeEventListener('keydown', key); t.focus(); evalBar(); };
    const key = (ev) => { if (ev.key === 'Escape') close(); };
    lb.addEventListener('click', (ev) => { if (ev.target === lb || ev.target.closest('button')) close(); });
    d.addEventListener('keydown', key); d.body.appendChild(lb); $('button', lb).focus(); evalBar();
  });

  // ---------------------------------------------------------------- click-to-load map embed
  $$('[data-load-map]').forEach((b) => b.addEventListener('click', () => {
    const box = b.closest('[data-mapembed]'); const f = d.createElement('iframe');
    f.src = box.dataset.src; f.loading = 'lazy'; f.title = 'Map'; f.referrerPolicy = 'no-referrer-when-downgrade';
    box.appendChild(f); b.remove();
  }));

  // ---------------------------------------------------------------- footer link columns fold on phones
  const cols = $$('.ftr__col');
  if (cols.length) { const mq = W.matchMedia('(max-width: 640px)'); const fold = () => cols.forEach((c) => { c.open = !mq.matches; }); fold(); mq.addEventListener ? mq.addEventListener('change', fold) : mq.addListener(fold); }

  // ================================================================ DISCOVERY
  const disc = $('[data-disc]');
  if (disc) {
    const list = $('[data-list]', disc), items = $$('[data-item]', disc), form = $('[data-filters]', disc), mapBox = $('[data-map]', disc), empty = $('[data-empty]', disc);
    const loader = $('[data-loader]', disc), countOut = $('[data-count-out]', disc), chipsOut = $('[data-active-chips]', disc), fbtn = $('[data-open-filters]', disc), fcount = $('[data-fcount]', disc);
    const pins = JSON.parse(disc.dataset.pins);
    let st = { sport: '', city: '', surface: '', max_price: '', date: '', q: '', sort: 'rating', view: 'list' };
    let user = null;
    const p = new URLSearchParams(location.search);
    for (const k of Object.keys(st)) if (p.get(k)) st[k] = p.get(k);
    if (st.sport) st.sport = st.sport[0].toUpperCase() + st.sport.slice(1).toLowerCase();
    const sportR = $$('input[name="fsport"]', disc), viewR = $$('input[name="view"]', disc);
    function syncForm() {
      sportR.forEach((r) => { r.checked = r.value === st.sport; });
      viewR.forEach((r) => { r.checked = r.value === st.view; });
      ['city', 'surface', 'max_price', 'date', 'q', 'sort'].forEach((k) => { const el = form.elements[k]; if (el) el.value = st[k]; });
    }
    function readForm() { ['city', 'surface', 'max_price', 'date', 'q', 'sort'].forEach((k) => { const el = form.elements[k]; if (el) st[k] = el.value; }); }
    const km = (a, b) => { const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
    function apply(flash = true) {
      const q = st.q.trim().toLowerCase(); let shown = [];
      items.forEach((it) => {
        const soon = it.hasAttribute('data-soon');
        let ok = true;
        if (st.sport && !it.dataset.sport.split(' ').includes(st.sport)) ok = false;
        if (st.city && it.dataset.city !== st.city) ok = false;
        if (st.surface && it.dataset.surface !== st.surface) ok = false;
        if (st.max_price && +it.dataset.rate > +st.max_price) ok = false;
        if (q && !it.dataset.name.includes(q)) ok = false;
        if (st.date && (soon || !(it.dataset.open || '').split(',').includes(st.date))) ok = false;
        if (soon && (st.surface || st.max_price)) ok = false; // a venue opening soon still shows under its own city
        it.hidden = !ok; if (ok) shown.push(it);
        const vc = $('.vcard', it);
        let sl = $('.vcard__slots', it);
        if (st.date && ok && !soon) { if (!sl) { sl = d.createElement('p'); sl.className = 'vcard__slots'; $('.vcard__meta', it).after(sl); } sl.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Open on ${fmt(st.date, { weekday: 'short', day: 'numeric', month: 'short' })}`; } else if (sl) sl.remove();
        let dist = $('.vcard__dist', it);
        if (user && !soon && it.dataset.lat) { const k = km(user, { lat: +it.dataset.lat, lng: +it.dataset.lng }); it.dataset.km = k; if (!dist) { dist = d.createElement('span'); dist.className = 'vcard__dist'; $('.vcard__media', vc).appendChild(dist); } dist.textContent = `about ${k < 10 ? k.toFixed(1) : Math.round(k)} km`; }
      });
      const by = { rating: (a, b) => (+b.dataset.rating) - (+a.dataset.rating), price: (a, b) => (+a.dataset.rate) - (+b.dataset.rate), near: (a, b) => (+(a.dataset.km || 1e9)) - (+(b.dataset.km || 1e9)) }[st.sort] || (() => 0);
      items.slice().sort(by).forEach((it) => list.appendChild(it));
      const n = shown.filter((x) => !x.hasAttribute('data-soon')).length;
      countOut.innerHTML = `<b>${n}</b> court${n === 1 ? '' : 's'} available`;
      empty.hidden = shown.length > 0;
      list.hidden = st.view === 'map' || shown.length === 0; mapBox.hidden = st.view !== 'map' || shown.length === 0;
      const act = [];
      if (st.sport) act.push(['sport', st.sport]); if (st.city) act.push(['city', st.city]); if (st.surface) act.push(['surface', st.surface]);
      if (st.max_price) act.push(['max_price', 'Up to ₱' + (+st.max_price).toLocaleString('en-PH')]); if (st.date) act.push(['date', fmt(st.date, { weekday: 'short', day: 'numeric', month: 'short' })]); if (st.q) act.push(['q', '“' + st.q + '”']);
      chipsOut.innerHTML = act.map(([k, t]) => `<button class="chip" type="button" data-clear="${k}" aria-label="Remove filter ${esc(t)}">${esc(t)}<svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>`).join('');
      const nf = act.filter(([k]) => k !== 'sport').length; fcount.hidden = !nf; fcount.textContent = nf;
      const url = new URLSearchParams(); for (const [k, v] of Object.entries(st)) if (v && !(k === 'sort' && v === 'rating') && !(k === 'view' && v === 'list')) url.set(k, v);
      history.replaceState(null, '', location.pathname + (url.toString() ? '?' + url : ''));
      if (st.view === 'map') drawMap(shown);
      if (flash && !RM) { list.classList.add('is-loading'); loader.hidden = false; setTimeout(() => { list.classList.remove('is-loading'); loader.hidden = true; shown.forEach((it, i) => { it.classList.remove('is-flash'); void it.offsetWidth; if (i < 6) it.classList.add('is-flash'); }); }, 320); }
    }
    chipsOut.addEventListener('click', (e) => { const b = e.target.closest('[data-clear]'); if (!b) return; st[b.dataset.clear] = ''; syncForm(); apply(); });
    sportR.forEach((r) => r.addEventListener('change', () => { st.sport = r.value; apply(); }));
    viewR.forEach((r) => r.addEventListener('change', () => { st.view = r.value; apply(false); }));
    const openF = (o) => { form.classList.toggle('is-open', o); fbtn.setAttribute('aria-expanded', String(o)); root.classList.toggle('drawer-open', o && W.innerWidth <= 1100); evalBar(); if (o) { const f = form.querySelector('select, input'); if (f && FINE) f.focus(); } };
    fbtn.addEventListener('click', () => openF(true));
    $('[data-close-filters]', form).addEventListener('click', () => openF(false));
    form.addEventListener('submit', (e) => { e.preventDefault(); readForm(); apply(); openF(false); });
    form.addEventListener('change', () => { if (W.innerWidth > 1100) { readForm(); apply(); } });
    form.addEventListener('input', (e) => { if (e.target.name === 'q' && W.innerWidth > 1100) { readForm(); apply(false); } });
    $$('[data-reset]', disc).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); st = { sport: '', city: '', surface: '', max_price: '', date: '', q: '', sort: 'rating', view: st.view }; syncForm(); apply(); openF(false); }));
    $('[data-near]', disc).addEventListener('click', (e) => {
      const b = e.currentTarget;
      if (!navigator.geolocation) { toast('Location is not available in this browser.'); return; }
      b.disabled = true;
      navigator.geolocation.getCurrentPosition((pos) => { user = { lat: pos.coords.latitude, lng: pos.coords.longitude }; st.sort = 'near'; syncForm(); apply(); b.disabled = false; toast('Sorted by distance. Distances are approximate, city to city.'); },
        () => { b.disabled = false; toast('No location shared. Pick a city instead.'); }, { timeout: 8000, maximumAge: 600000 });
    });
    // stylised map: abstract grid, city labels, branded pins. Pins mark the city, not the address.
    const svg = $('.map__svg', disc); let mapBuilt = false;
    const proj = (lat, lng) => { if (lng < 120.95) return [52, 676]; return [((lng - 120.97) / 0.17) * 1000, ((14.71 - lat) / 0.33) * 720]; };
    function buildMap() {
      if (mapBuilt) return; mapBuilt = true;
      const g = $('.map__grid', svg); let s = '';
      for (let x = 0; x <= 1000; x += 50) s += `<line x1="${x}" y1="0" x2="${x}" y2="720"/>`;
      for (let y = 0; y <= 720; y += 50) s += `<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`;
      g.innerHTML = s;
      $('.map__roads', svg).innerHTML = '<path class="river" d="M80 300C220 290 300 330 380 300S520 250 600 280 760 330 1000 300"/><path d="M60 660 120 600" stroke-dasharray="6 10"/>';
      const labels = [['Quezon City', 560, 70], ['Marikina', 770, 160], ['Pasig', 560, 235], ['Taguig', 360, 400], ['Muntinlupa', 300, 690], ['Nasugbu', 70, 712]];
      $('.map__labels', svg).innerHTML = labels.map(([t, x, y]) => `<text x="${x}" y="${y}">${t}</text>`).join('') + '<text x="40" y="580" style="fill:var(--aqua);font-size:11px">Batangas, south west</text>';
    }
    const card = $('[data-map-card]', disc);
    function drawMap(shown) {
      buildMap();
      const slugs = new Set(shown.map((x) => x.dataset.slug));
      const vis = pins.filter((pn) => slugs.has(pn.slug));
      const tone = (t) => `var(--${t})`;
      $('.map__pins', svg).innerHTML = vis.map((pn, i) => { const [x, y] = proj(pn.lat, pn.lng); const off = vis.slice(0, i).filter((o) => o.city === pn.city).length * 34; const lbl = pesoI(pn.rate); return `<g class="pin" style="--tone:${tone(pn.tone)}" transform="translate(${x.toFixed(0)} ${(y + off).toFixed(0)})" tabindex="0" role="button" aria-label="${esc(pn.name)}, ${lbl} an hour" data-pin="${pn.slug}"><circle class="pin__ring" r="18"/><circle class="pin__dot" r="10"/><g class="pin__tag" transform="translate(16 -34)"><rect width="${lbl.length * 9 + 18}" height="28" rx="14"/><text x="10" y="19">${lbl}</text></g></g>`; }).join('');
      card.hidden = true;
    }
    function showPin(slug) {
      const pn = pins.find((x) => x.slug === slug); if (!pn) return;
      $$('.pin', svg).forEach((g) => g.classList.toggle('is-on', g.dataset.pin === slug));
      card.innerHTML = `<b>${esc(pn.name)}</b><p>${esc(pn.city)} <span class="sep">/</span> ${pesoI(pn.rate)} / hr</p><div class="ctas"><a class="btn btn--accent btn--sm" href="${esc(pn.href)}"><span>Book Now</span></a><a class="btn btn--ghost btn--sm" href="${esc(pn.page)}"><span>View Court</span></a></div>`;
      card.hidden = false;
    }
    svg.addEventListener('click', (e) => { const g = e.target.closest('.pin'); if (g) showPin(g.dataset.pin); });
    svg.addEventListener('keydown', (e) => { const g = e.target.closest('.pin'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showPin(g.dataset.pin); } });
    syncForm(); apply(false);
  }

  // ================================================================ BOOKING
  $$('[data-book]').forEach((el) => {
    const B = JSON.parse(el.dataset.book); const mode = el.dataset.mode;
    const today = todayISO();
    const openSet = new Set(B.open), fullSet = new Set(B.full || []);
    const st = { date: null, court: B.courts[0] && B.courts[0].id, picks: {}, total: 0 };
    const rail = $('[data-rail]', el), cal = $('[data-cal]', el), calGrid = $('[data-cal-grid]', el), calTitle = $('[data-cal-title]', el), courtsBox = $('[data-courts]', el), slotsBox = $('[data-slots]', el);
    const steps = $$('[data-steps] li', el), sum = $('[data-sum]', el), go = $('[data-continue]', el);
    const pay = $('[data-pay]', el), done = $('[data-done]', el);
    let calMonth = null;
    const setStep = (n) => steps.forEach((s, i) => { s.classList.toggle('is-on', i === n - 1); s.classList.toggle('is-done', i < n - 1); });
    const status = (iso) => (iso < today ? 'past' : openSet.has(iso) ? 'open' : fullSet.has(iso) ? 'full' : 'none');
    const firstOpen = () => B.open.find((x) => x >= today);
    // date rail: the next 21 days
    const days = Array.from({ length: 21 }, (_, i) => addDays(today, i));
    rail.innerHTML = days.map((iso, i) => { const s = status(iso); const ok = s === 'open'; return `<button class="dpill${i === 0 ? ' is-today' : ''}${ok ? '' : ' is-full'}" type="button" role="radio" aria-checked="false" data-date="${iso}"${ok ? '' : ' aria-disabled="true"'} aria-label="${fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' })}, ${ok ? 'slots available' : 'no slots'}"><small>${fmt(iso, { weekday: 'short' })}</small><b>${fmt(iso, { day: 'numeric' })}</b><small>${fmt(iso, { month: 'short' })}</small><i></i></button>`; }).join('');
    rail.addEventListener('click', (e) => { const b = e.target.closest('.dpill'); if (!b) return; if (b.getAttribute('aria-disabled') === 'true') { toast('No slots that day. Orange days are open.'); return; } pickDate(b.dataset.date, true); });
    rail.addEventListener('keydown', (e) => { if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault(); const bs = $$('.dpill:not([aria-disabled])', rail); const i = bs.indexOf(d.activeElement); const n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length]; if (n) { n.focus(); pickDate(n.dataset.date, true); } });
    // month calendar
    const calBtn = $('[data-cal-toggle]', el);
    function drawCal() {
      const [y, m] = calMonth.split('-').map(Number);
      const first = new Date(Date.UTC(y, m - 1, 1, 4)); const dow = first.getUTCDay(); const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
      calTitle.textContent = first.toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      let h = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((x) => `<span class="cal__dow">${x}</span>`).join('');
      for (let i = 0; i < dow; i++) h += '<span></span>';
      for (let dd = 1; dd <= n; dd++) {
        const iso = `${calMonth}-${String(dd).padStart(2, '0')}`; const s = status(iso);
        h += s === 'open' ? `<button class="cal__d" type="button" data-date="${iso}" aria-pressed="${iso === st.date}" aria-label="${fmt(iso, { day: 'numeric', month: 'long' })}, slots available">${dd}</button>` : `<span class="cal__d${s === 'full' ? ' is-full' : ''}" aria-label="${fmt(iso, { day: 'numeric', month: 'long' })}, ${s === 'full' ? 'fully booked' : 'no slots'}">${dd}</span>`;
      }
      calGrid.innerHTML = h;
    }
    calGrid.addEventListener('click', (e) => { const b = e.target.closest('button.cal__d'); if (b) pickDate(b.dataset.date, true); });
    $('[data-cal-prev]', el).addEventListener('click', () => { const [y, m] = calMonth.split('-').map(Number); const t = new Date(Date.UTC(y, m - 2, 1)); calMonth = t.toISOString().slice(0, 7); drawCal(); });
    $('[data-cal-next]', el).addEventListener('click', () => { const [y, m] = calMonth.split('-').map(Number); const t = new Date(Date.UTC(y, m, 1)); calMonth = t.toISOString().slice(0, 7); drawCal(); });
    const setCal = (open) => { cal.hidden = !open; calBtn.setAttribute('aria-expanded', String(open)); if (open) drawCal(); };
    calBtn.addEventListener('click', () => setCal(cal.hidden));
    // courts + slots
    const rateOf = (h) => (B.rates && B.rates[h]) ? B.rates[h] : { rate: B.rate, label: 'Standard' };
    // the venue's court lines, drawn server side; a venue with more than one sport has a drawing per sport (court.sport)
    const tpls = {}; $$('[data-court-tpl]').forEach((t, i) => { tpls[t.dataset.sport || ''] = t.innerHTML; if (!i) tpls[''] = t.innerHTML; });
    function drawCourts() {
      courtsBox.innerHTML = B.courts.map((c) => { const n = (st.picks[c.id] || new Set()).size; return `<button class="cpk" type="button" role="radio" aria-checked="${c.id === st.court}" data-court="${c.id}" aria-label="${esc(c.name)}${n ? `, ${n} hour${n > 1 ? 's' : ''} picked` : ''}">${tpls[c.sport] || tpls['']}<b>${esc(c.name.replace(/^Court\s*/i, ''))}</b>${n ? `<span class="cpk__n">${n}</span>` : ''}</button>`; }).join('');
    }
    courtsBox.addEventListener('click', (e) => { const b = e.target.closest('.cpk'); if (!b) return; st.court = b.dataset.court; drawCourts(); drawSlots(); });
    // whole day: every open hour left on the picked court that day (taken and past hours are skipped)
    const wd = $('[data-wholeday]', el);
    const freeHours = () => { if (!st.date) return []; const taken = (B.taken[st.date] && B.taken[st.date][st.court]) || []; const nowH = st.date === today ? nowHour() : -1; return B.hours.filter((h) => !taken.includes(h) && h > nowH); };
    const syncWD = () => {
      if (!wd) return; const free = freeHours(); const mine = st.picks[st.court] || new Set(); const full = free.length > 0 && free.every((h) => mine.has(h));
      wd.setAttribute('aria-pressed', String(full)); $('span', wd).textContent = full ? 'Clear this court' : 'Whole day on this court'; wd.disabled = !st.date || free.length === 0;
    };
    if (wd) wd.addEventListener('click', () => {
      if (!st.date) { toast('Choose a date first.'); return; }
      const free = freeHours(); if (!free.length) { toast('No open hours left on this court that day.'); return; }
      const set = st.picks[st.court] || (st.picks[st.court] = new Set());
      if (free.every((h) => set.has(h))) { set.clear(); toast('Cleared this court.'); }
      else { free.forEach((h) => set.add(h)); const gone = B.hours.length - free.length; toast(`Whole day: ${free.length} hours on this court${gone ? `, ${gone} already taken or past` : ''}.`); }
      drawCourts(); drawSlots(); paintSum();
    });
    function drawSlots() {
      if (!st.date) { slotsBox.innerHTML = '<p class="slots__empty">Choose a date to see times.</p>'; syncWD(); return; }
      const taken = (B.taken[st.date] && B.taken[st.date][st.court]) || [];
      const mine = st.picks[st.court] || new Set();
      const nowH = st.date === today ? nowHour() : -1;
      slotsBox.innerHTML = B.hours.map((h) => {
        const r = rateOf(h); const off = taken.includes(h) || h <= nowH; const eve = r.label !== 'Standard';
        return `<button class="slot${eve ? ' is-eve' : ''}" type="button" data-h="${h}" aria-pressed="${mine.has(h)}"${off ? ' disabled' : ''} aria-label="${hh(h)} to ${hh(h + 1)}, ${pesoI(r.rate)}, ${r.label}${off ? ', taken' : ''}"><b>${hh(h)}</b><span class="slot__to">to ${hh(h + 1)}</span><small>${eve ? '<svg class="ico" aria-hidden="true"><use href="#i-moon"/></svg>' : ''}${pesoI(r.rate)} <span class="sep">/</span> ${r.label}</small></button>`;
      }).join('');
      syncWD();
    }
    slotsBox.addEventListener('click', (e) => {
      const b = e.target.closest('.slot'); if (!b || b.disabled) return;
      const h = +b.dataset.h; const set = st.picks[st.court] || (st.picks[st.court] = new Set());
      if (set.has(h)) set.delete(h); else { if (B.max && set.size >= B.max) { b.classList.remove('is-max'); void b.offsetWidth; b.classList.add('is-max'); toast(`Up to ${B.max} hours on a court. Pick another court to add more.`); return; } set.add(h); }
      b.setAttribute('aria-pressed', String(set.has(h)));
      drawCourts(); paintSum(); syncWD();
    });
    // summary
    const out = (k) => $(`[data-sum-${k}]`, el);
    function lines() { const L = []; B.courts.forEach((c) => { const s = st.picks[c.id]; if (s && s.size) L.push({ court: c.name, hours: [...s].sort((a, b) => a - b) }); }); return L; }
    function animNum(node, from, to) {
      if (RM) { node.textContent = peso(to); return; }
      const t0 = performance.now(); const step = (t) => { const p = Math.min(1, (t - t0) / 420); const e = 1 - Math.pow(1 - p, 3); node.textContent = peso(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    }
    function paintSum() {
      const L = lines(); const hours = L.reduce((n, l) => n + l.hours.length, 0);
      const sub = L.reduce((n, l) => n + l.hours.reduce((m, h) => m + rateOf(h).rate, 0), 0);
      const fee = Math.round(sub * B.fee * 100) / 100; const total = sub + fee;
      out('date').textContent = st.date ? fmt(st.date, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a date';
      out('picks').innerHTML = L.length ? L.map((l) => `<span>${esc(l.court)}: ${l.hours.map((h) => hh(h)).join(', ')}</span>`).join('') : 'Select a time';
      out('hrs').textContent = `${hours} hour${hours === 1 ? '' : 's'}`; out('hours').textContent = `${hours} hour${hours === 1 ? '' : 's'}`;
      out('sub').textContent = peso(sub); out('fee').textContent = peso(fee);
      animNum(out('total'), st.total, total); animNum(out('total-mini'), st.total, total);
      st.total = total; st.sub = sub; st.fee = fee; st.hours = hours;
      go.disabled = hours === 0;
      setStep(hours ? 2 : st.date ? 2 : 1);
    }
    const sumT = $('[data-sum-toggle]', el);
    sumT.addEventListener('click', () => { const o = !sum.classList.contains('is-open'); sum.classList.toggle('is-open', o); sumT.setAttribute('aria-expanded', String(o)); });
    function pickDate(iso, user) {
      st.date = iso;
      $$('.dpill', rail).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.date === iso)));
      const sel = $(`.dpill[data-date="${iso}"]`, rail); if (sel && user) sel.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      calMonth = iso.slice(0, 7); if (!cal.hidden) drawCal();
      drawCourts(); drawSlots(); paintSum();
      const selD = $('[data-sel-date]'); if (selD) selD.textContent = fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' });
      if (mode === 'slots') history.replaceState(null, '', location.pathname + '?date=' + iso);
    }
    // payment + confirmation (preview only: nothing is charged or booked)
    const trap = (box) => { const f = $$('button, [href], input', box).filter((x) => !x.disabled); return f; };
    function openSheet(sh) { sh.hidden = false; evalBar(); const f = trap(sh); if (f[0]) f[0].focus(); }
    function closeSheet(sh) { sh.hidden = true; evalBar(); }
    // booking needs an account: a guest is asked to register or sign in, and their picks wait for them
    const acct = () => (W.__srv.acct ? W.__srv.acct.me() : null);
    const siteBase = new URL(root.dataset.root || './', d.baseURI).pathname;
    const here = location.pathname.startsWith(siteBase) ? location.pathname.slice(siteBase.length) : '';
    function holdPicks() { ss.set('srv.pending', JSON.stringify({ path: location.pathname, date: st.date, court: st.court, picks: Object.fromEntries(Object.entries(st.picks).map(([k, s]) => [k, [...s]])) })); }
    let gateEl = null;
    function gate() {
      if (gateEl) return gateEl;
      const R = root.dataset.root || './'; const next = encodeURIComponent(here);
      gateEl = d.createElement('div'); gateEl.className = 'sheet'; gateEl.hidden = true;
      gateEl.setAttribute('role', 'dialog'); gateEl.setAttribute('aria-modal', 'true'); gateEl.setAttribute('aria-labelledby', 'gate-h');
      gateEl.innerHTML = `<div class="sheet__in board gate"><button class="iconbtn sheet__x" type="button" data-gate-close aria-label="Close"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button><p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>One quick step</p><h2 class="d3" id="gate-h">How would you like to book?</h2><p class="gate__p">Sign in or create a free account to keep your bookings in one place. Or book as a guest with your name, mobile number and email. Your date and times are kept either way.</p><div class="ctas"><a class="btn btn--accent" href="${R}sign-up/?next=${next}"><span>Sign up</span><svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></a><a class="btn btn--ghost" href="${R}sign-in/?next=${next}"><span>Sign in</span></a></div><p class="gate__or"><span>or book as a guest</span></p><form class="gate__guest" data-guest novalidate><div class="cform__row"><label class="field"><span class="field__l">Full name</span><input name="gname" required maxlength="60" autocomplete="name"></label><label class="field"><span class="field__l">Mobile number</span><input name="gphone" type="tel" required pattern="[0-9+ \\(\\)]{7,16}" maxlength="16" autocomplete="tel" placeholder="09XX XXX XXXX"></label></div><label class="field"><span class="field__l">Email for your booking</span><input name="gemail" type="email" required maxlength="80" autocomplete="email"></label><button class="btn btn--line btn--block" type="submit"><span>Continue as guest</span><svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></button></form><p class="demo-note"><svg class="ico" aria-hidden="true"><use href="#i-info"/></svg>Preview: accounts and bookings live in this browser only.</p></div>`;
      el.appendChild(gateEl);
      $('[data-gate-close]', gateEl).addEventListener('click', () => { closeSheet(gateEl); go.focus(); });
      gateEl.addEventListener('click', (e) => { if (e.target === gateEl) closeSheet(gateEl); });
      $$('a', gateEl).forEach((a) => a.addEventListener('click', holdPicks));
      const gf = $('[data-guest]', gateEl);
      gf.addEventListener('submit', (e) => {
        e.preventDefault(); if (!gf.checkValidity()) { gf.reportValidity(); return; }
        ss.set('srv.guest', JSON.stringify({ name: gf.elements.gname.value.trim(), email: gf.elements.gemail.value.trim().toLowerCase(), phone: gf.elements.gphone.value.trim() }));
        closeSheet(gateEl); go.click();
      });
      return gateEl;
    }
    // a guest's details last for this visit, so a second booking does not ask again
    const guest = () => { try { return JSON.parse(ss.get('srv.guest') || 'null'); } catch (e) { return null; } };
    // after a booking: another time at the same venue (a fresh board), never out to other courts
    const again = $('[data-again]', el);
    if (again) again.addEventListener('click', (e) => { e.preventDefault(); const to = new URL(B.links.availability, location.href); if (to.pathname === location.pathname && to.search === location.search) location.reload(); else location.href = to.href; });
    // back from signing in: restore the held picks and go straight to payment (after the accounts script loads)
    setTimeout(() => {
      let pend = null; try { pend = JSON.parse(ss.get('srv.pending') || 'null'); } catch (e) { pend = null; }
      if (!pend || pend.path !== location.pathname || !acct()) return;
      ss.set('srv.pending', '');
      pickDate(pend.date, false);
      st.picks = {}; Object.entries(pend.picks || {}).forEach(([k, hs]) => { st.picks[k] = new Set(hs); });
      if (pend.court) st.court = pend.court;
      drawCourts(); drawSlots(); paintSum();
      if (!go.disabled) { toast('You are in. Your picks are ready to pay.'); go.click(); }
    }, 0);
    // a court owner books as a player: from the owner view they are offered a one-tap switch
    let swEl = null;
    function switchGate() {
      if (swEl) return swEl;
      swEl = d.createElement('div'); swEl.className = 'sheet'; swEl.hidden = true;
      swEl.setAttribute('role', 'dialog'); swEl.setAttribute('aria-modal', 'true'); swEl.setAttribute('aria-labelledby', 'sw-h');
      swEl.innerHTML = `<div class="sheet__in board gate"><button class="iconbtn sheet__x" type="button" data-sw-close aria-label="Close"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button><p class="kicker"><span class="kicker__ball" aria-hidden="true"></span>You are in your owner view</p><h2 class="d3" id="sw-h">Switch to player to book</h2><p class="gate__p">Court owners book as players. Switch to your player view to finish this booking. Your court page stays as it is, and you can switch back any time from your account.</p><div class="ctas"><button class="btn btn--accent" type="button" data-sw-go><span>Switch to player and continue</span><svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></button><button class="btn btn--ghost" type="button" data-sw-close><span>Not now</span></button></div></div>`;
      el.appendChild(swEl);
      $$('[data-sw-close]', swEl).forEach((b) => b.addEventListener('click', () => { closeSheet(swEl); go.focus(); }));
      swEl.addEventListener('click', (e) => { if (e.target === swEl) closeSheet(swEl); });
      $('[data-sw-go]', swEl).addEventListener('click', () => { W.__srv.acct.setMode('player'); closeSheet(swEl); toast('Switched to player. Switch back any time from your account.'); go.click(); });
      return swEl;
    }
    go.addEventListener('click', () => {
      const who = acct(); const g = who ? null : guest();
      if (!who && !g) { holdPicks(); openSheet(gate()); return; }
      if (who && who.role === 'owner' && (who.mode || 'owner') === 'owner') { openSheet(switchGate()); return; }
      const L = lines(); const by = who ? `${esc(who.first)} ${esc(who.last)}` : `${esc(g.name)} (guest)`;
      $('[data-pay-sum]', el).innerHTML = `<div class="row"><span>${esc(B.name)}</span><b>${fmt(st.date, { weekday: 'short', day: 'numeric', month: 'short' })}</b></div>${L.map((l) => `<div class="row"><span>${esc(l.court)}</span><span>${l.hours.map((h) => hh(h)).join(', ')}</span></div>`).join('')}<div class="row"><span>Booked by</span><span>${by}</span></div><div class="row"><span>Subtotal</span><span>${peso(st.sub)}</span></div><div class="row"><span>Service fee (5%)</span><span>${peso(st.fee)}</span></div><div class="row t"><span>Total</span><b>${peso(st.total)}</b></div>`;
      $('[data-pay-label]', el).textContent = 'Pay ' + peso(st.total);
      setStep(3); openSheet(pay);
    });
    $('[data-pay-close]', el).addEventListener('click', () => { closeSheet(pay); setStep(2); go.focus(); });
    $('[data-pay-go]', el).addEventListener('click', (e) => {
      const b = e.currentTarget; b.classList.add('is-busy');
      setTimeout(() => {
        b.classList.remove('is-busy'); closeSheet(pay);
        const L = lines(); const m = ($('input[name="paym"]:checked', el) || {}).parentElement;
        $('[data-ticket]', el).innerHTML = `<div class="row"><span>Venue</span><b>${esc(B.name)}</b></div><div class="row"><span>Date</span><b>${fmt(st.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b></div>${L.map((l) => `<div class="row"><span>${esc(l.court)}</span><b>${l.hours.map((h) => hh(h)).join(', ')}</b></div>`).join('')}<div class="row"><span>Paid with</span><b>${m ? esc(m.textContent.trim()) : ''}</b></div><div class="row t"><span>Total</span><b>${peso(st.total)}</b></div>`;
        steps.forEach((s) => { s.classList.add('is-done'); s.classList.remove('is-on'); }); steps[3].classList.add('is-on'); steps[3].classList.remove('is-done');
        const ref = W.__srv.acct ? W.__srv.acct.addBooking({ venue: B.name, slug: B.slug, address: B.address, date: st.date, lines: L, sub: st.sub, fee: st.fee, total: st.total, paidWith: m ? m.textContent.trim() : '' }) : null;
        const g = acct() ? null : guest(); const tk = $('[data-ticket]', el);
        if (ref) tk.insertAdjacentHTML('afterbegin', `<div class="row"><span>Reference</span><b>${esc(ref)}</b></div>`);
        // a guest keeps the reference; registering with the same email later brings the booking into the account
        const mine = $('a[href$="account/"]', done);
        if (g) {
          tk.insertAdjacentHTML('beforeend', `<div class="row"><span>Guest</span><b>${esc(g.name)}, ${esc(g.phone)}</b></div>`);
          if (mine) { mine.href = `${root.dataset.root || './'}sign-up/?email=${encodeURIComponent(g.email)}&next=account/`; $('span', mine).textContent = 'Save it to an account'; }
        } else if (mine) { mine.href = `${root.dataset.root || './'}account/`; $('span', mine).textContent = 'My bookings'; }
        openSheet(done);
      }, RM ? 50 : 1300);
    });
    done.addEventListener('click', (e) => { if (e.target === done) closeSheet(done); });
    pay.addEventListener('click', (e) => { if (e.target === pay) { closeSheet(pay); setStep(2); } });
    d.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!pay.hidden) { closeSheet(pay); setStep(2); go.focus(); } else if (!done.hidden) closeSheet(done); });
    $('[data-ics]', el).addEventListener('click', () => {
      const L = lines(); const ds = st.date.replace(/-/g, ''); const ev = [];
      L.forEach((l) => { let s = l.hours[0], p = s; const flush = (a, b) => ev.push(`BEGIN:VEVENT\r\nUID:${ds}-${a}-${l.court.replace(/\s/g, '')}@served-preview\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z\r\nDTSTART;TZID=Asia/Manila:${ds}T${String(a).padStart(2, '0')}0000\r\nDTEND;TZID=Asia/Manila:${ds}T${String(b + 1).padStart(2, '0')}0000\r\nSUMMARY:${B.name}, ${l.court}\r\nLOCATION:${B.address}\r\nDESCRIPTION:Preview booking made on the Served. design concept. Not a real reservation.\r\nEND:VEVENT`);
        l.hours.slice(1).forEach((h) => { if (h === p + 1) p = h; else { flush(s, p); s = p = h; } }); flush(s, p); });
      const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Served preview//EN\r\n${ev.join('\r\n')}\r\nEND:VCALENDAR`;
      const a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = `served-${B.slug}-${st.date}.ics`; d.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    if ('IntersectionObserver' in W) new IntersectionObserver((en) => { const on = en[0].isIntersecting; el.classList.toggle('is-active', on); root.classList.toggle('book-active', on); }, { rootMargin: '0px 0px -35% 0px' }).observe(el);
    else el.classList.add('is-active');
    // start
    const want = new URLSearchParams(location.search).get('date');
    const start = want && status(want) === 'open' ? want : firstOpen();
    calMonth = (start || today).slice(0, 7);
    if (mode === 'availability') setCal(true);
    if (start) pickDate(start, false); else { calMonth = today.slice(0, 7); paintSum(); }
    if (mode === 'slots' && want) setTimeout(() => { const t = $('[data-blk="time"]', el); if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }, 600);
  });
})();
