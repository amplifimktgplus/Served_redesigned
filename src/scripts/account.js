/* Served. accounts, bookings and the court owner studio. This preview has no server, so everything lives in
   the visitor's own browser: accounts and bookings in localStorage (passwords salted and hashed with SHA-256,
   never stored as typed), an owner's page settings in localStorage and their photos in IndexedDB. */
(() => {
  'use strict';
  const S = window.__srv; if (!S || typeof S !== 'object') return;
  const { $, $$, esc, toast, fmt, peso, hh } = S;
  const d = document, W = window, root = d.documentElement;
  const R = root.dataset.root || './';
  const LS = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('This browser is not keeping data right now (private mode or storage full).'); return false; } },
  };
  const qs = new URLSearchParams(location.search);

  // ---------------------------------------------------------------- accounts
  const users = () => LS.get('srv.users', []);
  const me = () => { const e = LS.get('srv.session', null); return e ? users().find((u) => u.email === e) || null : null; };
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashPw = async (pw, salt) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${pw}`)));
  const landing = (u) => (u.role === 'owner' ? 'owner/studio/' : 'account/');
  // only a path inside this site, never another origin
  const safeNext = () => { const n = qs.get('next') || ''; return /^[a-z0-9][a-z0-9/_\-.?=&]*$/i.test(n) && !n.includes('..') && !n.includes('//') ? n : ''; };
  const goOn = (u) => { location.href = R + (safeNext() || landing(u)); };
  const signOut = () => { LS.set('srv.session', null); toast('Signed out.'); };
  function addBooking(b) {
    const u = me(); if (!u) return;
    const all = LS.get('srv.bookings', []);
    const id = 'SV-' + Date.now().toString(36).toUpperCase().slice(-6);
    all.unshift({ ...b, id, email: u.email, status: 'confirmed', created: new Date().toISOString() });
    LS.set('srv.bookings', all);
  }
  S.acct = { me, addBooking, signOut };

  // form messages: one alert line per form, read out when it changes
  function say(form, html) {
    let p = $('.form-err', form);
    if (!p) { p = d.createElement('p'); p.className = 'form-err'; p.setAttribute('role', 'alert'); const btn = $('button[type="submit"]', form); form.insertBefore(p, btn); }
    p.innerHTML = html; p.hidden = !html;
  }
  const field = (f, n) => (f.elements[n] ? f.elements[n].value.trim() : '');

  const fIn = $('form[data-auth="signin"]');
  if (fIn) {
    fIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!fIn.checkValidity()) { fIn.reportValidity(); return; }
      if (!W.isSecureContext || !crypto.subtle) { say(fIn, 'Signing in needs a secure (https) page.'); return; }
      const id = field(fIn, 'email').toLowerCase();
      const u = users().find((x) => x.email === id || (x.username || '').toLowerCase() === id);
      const next = safeNext() ? `?next=${encodeURIComponent(safeNext())}` : '';
      if (!u) { say(fIn, `No account with that email or username in this browser yet. <a href="${R}sign-up/${next}">Create one</a>, it takes a minute.`); return; }
      if (u.hash !== await hashPw(fIn.elements.password.value, u.salt)) { say(fIn, 'That password does not match. Try again.'); return; }
      LS.set('srv.session', u.email);
      toast(`Welcome back, ${u.first}.`);
      goOn(u);
    });
  }

  const fUp = $('form[data-auth="register"]');
  if (fUp) {
    fUp.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!fUp.checkValidity()) { fUp.reportValidity(); return; }
      if (!W.isSecureContext || !crypto.subtle) { say(fUp, 'Registering needs a secure (https) page.'); return; }
      const email = field(fUp, 'email').toLowerCase(), username = field(fUp, 'username');
      const pw = fUp.elements.password.value, pw2 = fUp.elements.password_confirm.value;
      if (pw.length < 6) { say(fUp, 'Use at least 6 characters for your password.'); return; }
      if (pw !== pw2) { say(fUp, 'The two passwords do not match.'); return; }
      const all = users();
      if (all.some((x) => x.email === email)) { say(fUp, `An account with this email already exists in this browser. <a href="${R}sign-in/">Sign in</a> instead.`); return; }
      if (all.some((x) => (x.username || '').toLowerCase() === username.toLowerCase())) { say(fUp, 'That username is taken in this browser. Try another.'); return; }
      const role = ($('input[name="role"]:checked', fUp) || {}).value === 'owner' ? 'owner' : 'player';
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      const u = { email, username, first: field(fUp, 'first_name'), last: field(fUp, 'last_name'), phone: field(fUp, 'phone'), role, salt, hash: await hashPw(pw, salt), created: new Date().toISOString() };
      if (!LS.set('srv.users', [...all, u])) return;
      LS.set('srv.session', u.email);
      toast(role === 'owner' ? `Welcome, ${u.first}. Set up your court page.` : `Welcome to Served, ${u.first}. Book any listed court.`);
      goOn(u);
    });
  }

  // header and drawer: once signed in, the account link greets and leads to the right home
  const who = me();
  if (who) $$('[data-acct]').forEach((a) => { a.href = R + landing(who); const s = $('span', a); if (s) s.textContent = who.first ? `Hi, ${who.first}` : 'My account'; });

  // ---------------------------------------------------------------- my account
  const view = $('[data-acct-view]');
  if (view) {
    const startOf = (b) => new Date(`${b.date}T${String(Math.min(...b.lines.flatMap((l) => l.hours))).padStart(2, '0')}:00:00+08:00`);
    const draw = () => {
      const u = me();
      if (!u) {
        view.innerHTML = `<div class="acct__empty board"><h2 class="d3">Sign in to see your bookings</h2><p>Bookings made in this browser show here once you are signed in.</p><div class="ctas"><a class="btn btn--accent" href="${R}sign-in/?next=account/"><span>Sign in</span></a><a class="btn btn--ghost" href="${R}sign-up/?next=account/"><span>Create an account</span></a></div></div>`;
        return;
      }
      const mine = LS.get('srv.bookings', []).filter((b) => b.email === u.email);
      const card = (b) => {
        const when = startOf(b); const past = when < new Date(); const late = when - new Date() < 864e5;
        const st = b.status === 'cancelled' ? '<span class="bk__st is-off">Cancelled</span>' : past ? '<span class="bk__st is-past">Played</span>' : '<span class="bk__st">Confirmed</span>';
        return `<article class="bk board"><div class="bk__main"><p class="bk__ref">Ref ${esc(b.id)}</p><h3 class="bk__v">${esc(b.venue)}</h3><p class="bk__d">${fmt(b.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><ul class="bk__l">${b.lines.map((l) => `<li><b>${esc(l.court)}</b>${l.hours.map((h) => hh(h)).join(', ')}</li>`).join('')}</ul></div><div class="bk__side"><b class="bk__t">${peso(b.total)}</b>${st}${b.status !== 'cancelled' && !past ? `<button class="btn btn--line btn--sm" type="button" data-cancel="${esc(b.id)}" data-late="${late ? 1 : 0}"><span>Cancel booking</span></button>` : ''}<a class="link" href="${R}courts/${esc(b.slug)}/">View court</a></div></article>`;
      };
      view.innerHTML = `<div class="acct__grid"><aside class="acct__me board"><span class="acct__av" aria-hidden="true">${esc((u.first || u.email)[0].toUpperCase())}</span><h2 class="d3">${esc(u.first)} ${esc(u.last)}</h2><p>${esc(u.email)}</p><p class="acct__role">${u.role === 'owner' ? 'Court owner' : 'Player'}</p>${u.role === 'owner' ? `<a class="btn btn--accent btn--block" href="${R}owner/studio/"><span>Court page studio</span></a>` : ''}<a class="btn btn--accent btn--block" href="${R}courts/"><span>Book a court</span></a><button class="btn btn--ghost btn--block" type="button" data-signout><span>Sign out</span></button></aside><div class="acct__list"><h2 class="d3">Your bookings</h2>${mine.length ? mine.map(card).join('') : `<div class="acct__empty board"><p>No bookings yet. Pick a court, choose your times and they will show here.</p><a class="btn btn--accent" href="${R}courts/"><span>Find a court</span></a></div>`}</div></div>`;
    };
    draw();
    view.addEventListener('click', (e) => {
      if (e.target.closest('[data-signout]')) { signOut(); draw(); return; }
      const c = e.target.closest('[data-cancel]'); if (!c) return;
      if (!c.classList.contains('is-sure')) { c.classList.add('is-sure'); $('span', c).textContent = 'Tap again to cancel'; setTimeout(() => { if (c.isConnected) { c.classList.remove('is-sure'); $('span', c).textContent = 'Cancel booking'; } }, 3000); return; }
      const all = LS.get('srv.bookings', []); const b = all.find((x) => x.id === c.dataset.cancel); if (!b) return;
      b.status = 'cancelled'; LS.set('srv.bookings', all);
      toast(c.dataset.late === '1' ? 'Booking cancelled. It was inside 24 hours, so the court price is not refunded.' : 'Booking cancelled. The court price is refunded.');
      draw();
    });
  }

  // ---------------------------------------------------------------- owner page settings: storage, colour maths, photos
  const idb = (() => {
    let p = null;
    const open = () => p || (p = new Promise((res, rej) => { const r = indexedDB.open('srv-studio', 1); r.onupgradeneeded = () => r.result.createObjectStore('img'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const run = (mode, fn) => open().then((db) => new Promise((res, rej) => { const t = db.transaction('img', mode); const q = fn(t.objectStore('img')); t.oncomplete = () => res(q && 'result' in q ? q.result : undefined); t.onerror = () => rej(t.error); }));
    return { get: (k) => run('readonly', (s) => s.get(k)), set: (k, v) => run('readwrite', (s) => s.put(v, k)), del: (k) => run('readwrite', (s) => s.delete(k)) };
  })();
  const pages = () => LS.get('srv.studio', {});
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hexOf = (c) => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hexOf(x.map((v, i) => v + (y[i] - v) * t)); };
  const lum = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  async function shrink(file, max) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = d.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.84));
  }

  // a venue's own pages wear the owner's settings: accent, background, hero photo (under the same gradient) and photos
  const vslug = d.body.dataset.venue;
  if (vslug) {
    const cfg = pages()[vslug];
    if (cfg) {
      if (cfg.base) {
        root.style.setProperty('--ink', cfg.base); root.style.setProperty('--ink-2', mix(cfg.base, '#000000', 0.35));
        root.style.setProperty('--iron', mix(cfg.base, '#ffffff', 0.07)); root.style.setProperty('--iron-2', mix(cfg.base, '#ffffff', 0.13)); root.style.setProperty('--iron-3', mix(cfg.base, '#ffffff', 0.2));
        const m = d.querySelector('meta[name="theme-color"]'); if (m) m.content = cfg.base;
      }
      if (cfg.accent) {
        root.style.setProperty('--accent', cfg.accent); root.style.setProperty('--accent-hot', mix(cfg.accent, '#ffffff', 0.22)); root.style.setProperty('--accent-deep', mix(cfg.accent, '#000000', 0.28)); root.style.setProperty('--heat', cfg.accent);
        const s = d.createElement('style'); s.textContent = `[data-tone]{--tone:${cfg.accent}}`; d.head.appendChild(s);
      }
      if (cfg.hero) idb.get('hero:' + vslug).then((blob) => {
        const im = $('.vhero__bg img'); if (!blob || !im) return;
        im.removeAttribute('srcset'); im.src = URL.createObjectURL(blob); im.style.objectPosition = '50% 50%';
        const note = $('[data-photo-note]'); if (note) note.hidden = true;
      }).catch(() => {});
      const box = $('[data-vgal-grid]');
      if (box && cfg.gallery && cfg.gallery.length) Promise.all(cfg.gallery.map((id) => idb.get(id).catch(() => null))).then((blobs) => {
        const ok = blobs.filter(Boolean); if (!ok.length) return;
        // the owner's photos on the same concave carousel as the venue photos elsewhere
        const name = esc($('.vbar__brand b') ? $('.vbar__brand b').textContent : 'the venue'); const n = ok.length;
        box.innerHTML = `<div class="cc" data-cc><div class="cc__track" data-cc-track tabindex="0" role="region" aria-roledescription="carousel" aria-label="Photos of ${name}">${ok.map((b, i) => { const url = URL.createObjectURL(b); return `<figure class="cc__s" data-cc-slide aria-label="${i + 1} of ${n}"><button class="cc__btn" type="button" data-lightbox="${url}" aria-label="Enlarge photo ${i + 1} of ${name}"><img src="${url}" alt="Photo ${i + 1} of ${name}"></button></figure>`; }).join('')}</div><div class="cc__ui"><button class="iconbtn" type="button" data-cc-prev aria-label="Previous photo"><svg class="ico" aria-hidden="true"><use href="#i-back"/></svg></button><span class="cc__count" data-cc-count aria-live="polite">1 / ${n}</span><button class="iconbtn" type="button" data-cc-next aria-label="Next photo"><svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></button></div></div>`;
        const sec = $('[data-vgal]'); if (sec) sec.hidden = false; const ln = $('[data-vgal-link]'); if (ln) ln.hidden = false;
        if (S.cc) S.cc($('[data-cc]', box));
      });
    }
  }

  // ---------------------------------------------------------------- the studio
  const studio = $('[data-studio]');
  if (studio) {
    const u = me();
    if (!u || u.role !== 'owner') { $('[data-studio-gate]').hidden = false; return; }
    studio.hidden = false;
    const f = $('[data-studio-form]'), frame = $('[data-studio-frame]'), urlEl = $('[data-studio-url]'), view = $('[data-studio-view]'), warn = $('[data-contrast]');
    const all = pages();
    let slug = Object.keys(all).find((k) => all[k].owner === u.email) || f.elements.venue.value;
    const cur = () => pages()[slug] || { owner: u.email, accent: '', base: '', hero: false, gallery: [] };
    const save = (patch) => { const p = pages(); p[slug] = { ...cur(), ...patch, owner: u.email }; LS.set('srv.studio', p); refresh(); };
    let tReload = null;
    const reload = () => { clearTimeout(tReload); tReload = setTimeout(() => { frame.src = `${R}courts/${slug}/?studio=${Date.now()}`; }, 250); };
    const check = () => {
      const c = cur(); const a = c.accent || '#ff6b18', b = c.base || '#0a0a0a';
      const r = contrast(a, b);
      warn.textContent = r < 4.5 ? `This accent is hard to read on this background (contrast ${r.toFixed(1)} to 1). Buttons use the background colour for their text, so pick a lighter accent or a darker background.` : '';
    };
    function paintHero() { const box = $('[data-hero-prev]'); idb.get('hero:' + slug).then((b) => { box.style.backgroundImage = b ? `url(${URL.createObjectURL(b)})` : ''; box.classList.toggle('is-set', !!b); $('span', box).textContent = b ? 'Your photo' : 'Default photo'; }).catch(() => {}); }
    function paintGal() {
      const box = $('[data-gal]'); const ids = cur().gallery || [];
      Promise.all(ids.map((id) => idb.get(id).catch(() => null))).then((blobs) => {
        box.innerHTML = ids.map((id, i) => blobs[i] ? `<figure><img src="${URL.createObjectURL(blobs[i])}" alt=""><button class="iconbtn" type="button" data-gal-del="${id}" aria-label="Remove photo ${i + 1}"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button></figure>` : '').join('') || '<p class="fine">No photos yet.</p>';
      });
    }
    function refresh() {
      const c = cur();
      f.elements.venue.value = slug;
      $$('input[name="accent"]', f).forEach((i) => { i.checked = i.value === (c.accent || ''); });
      if (c.accent) f.elements.accentPick.value = c.accent;
      $$('input[name="base"]', f).forEach((i) => { i.checked = i.value === (c.base || ''); });
      urlEl.textContent = `served.ph/courts/${slug}`; view.href = `${R}courts/${slug}/`;
      check(); reload();
    }
    f.elements.venue.addEventListener('change', () => { slug = f.elements.venue.value; const p = pages(); if (!p[slug]) { p[slug] = { owner: u.email, accent: '', base: '', hero: false, gallery: [] }; LS.set('srv.studio', p); } refresh(); paintHero(); paintGal(); });
    f.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'accent') save({ accent: t.value });
      if (t.name === 'base') save({ base: t.value });
      if (t.name === 'accentPick') save({ accent: t.value });
    });
    // a custom colour clears the preset ticks, so picking a preset afterwards always registers as a change
    f.elements.accentPick.addEventListener('input', (e) => { $$('input[name="accent"]', f).forEach((i) => { i.checked = false; }); const p = pages(); p[slug] = { ...cur(), accent: e.target.value, owner: u.email }; LS.set('srv.studio', p); check(); });
    f.elements.hero.addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try { await idb.set('hero:' + slug, await shrink(file, 2000)); save({ hero: true }); paintHero(); toast('Hero photo saved.'); } catch (err) { toast('That photo could not be read. Try a JPEG or PNG.'); }
      e.target.value = '';
    });
    $('[data-hero-reset]').addEventListener('click', async () => { await idb.del('hero:' + slug).catch(() => {}); save({ hero: false }); paintHero(); });
    f.elements.gallery.addEventListener('change', async (e) => {
      const files = [...e.target.files]; const ids = [...(cur().gallery || [])];
      for (const file of files) {
        if (ids.length >= 12) { toast('The gallery holds 12 photos. Remove one to add another.'); break; }
        try { const id = `gal:${slug}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; await idb.set(id, await shrink(file, 1600)); ids.push(id); } catch (err) { toast('One photo could not be read and was skipped.'); }
      }
      save({ gallery: ids }); paintGal(); e.target.value = '';
    });
    $('[data-gal]').addEventListener('click', async (e) => { const b = e.target.closest('[data-gal-del]'); if (!b) return; await idb.del(b.dataset.galDel).catch(() => {}); save({ gallery: (cur().gallery || []).filter((x) => x !== b.dataset.galDel) }); paintGal(); });
    $('[data-studio-reset]').addEventListener('click', async () => { const c = cur(); await Promise.all([idb.del('hero:' + slug), ...(c.gallery || []).map((id) => idb.del(id))].map((p) => p.catch(() => {}))); const p = pages(); delete p[slug]; LS.set('srv.studio', p); refresh(); paintHero(); paintGal(); toast('Your page is back to the default.'); });
    if (!pages()[slug]) { const p = pages(); p[slug] = { owner: u.email, accent: '', base: '', hero: false, gallery: [] }; LS.set('srv.studio', p); }
    refresh(); paintHero(); paintGal();
  }
})();
