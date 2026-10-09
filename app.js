'use strict';
/* Kulivo v2 — small progressive enhancements. Page content is fully readable without JS. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const sum = a => a.reduce((t, v) => t + v, 0);

  /* ---- Mobile navigation ---- */
  const toggle = $('.nav-toggle'), nav = $('#site-nav');
  const setNav = open => { toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); } });

  /* ---- Sample dashboard (fictional data; same values as the original concept) ---- */
  const DISHES = [
    { id: 'rice', name: 'Rice', weights: [8, 9, 7, 8], rate: 100, time: '21:10' },
    { id: 'vegetables', name: 'Mixed vegetables', weights: [3, 4, 3, 4], rate: 150, time: '21:02' },
    { id: 'dal', name: 'Dal', weights: [2, 3, 2, 3], rate: 110, time: '20:48' }
  ];
  const COVERS = 400, MAX_SERVICE = 20, MAX_DISH = 32;
  function renderDash(sel) {
    const shown = DISHES.filter(d => sel === 'all' || d.id === sel);
    const perService = [0, 1, 2, 3].map(i => sum(shown.map(d => d.weights[i])));
    const kg = sum(perService);
    $('#m-weight').innerHTML = `${kg}<small> kg</small>`;
    $('#m-value').textContent = inr.format(sum(shown.map(d => sum(d.weights) * d.rate)));
    $('#m-cover').innerHTML = `${Math.round(kg * 1000 / COVERS)}<small> g</small>`;
    $('#m-records').textContent = shown.length * 4;
    $$('#trend .bar').forEach((bar, i) => { bar.style.setProperty('--h', `${perService[i] / MAX_SERVICE * 100}%`); $('b', bar).textContent = perService[i]; });
    $('#trend').setAttribute('aria-label', `Sample waste by service${sel === 'all' ? '' : ' for ' + shown[0].name.toLowerCase()}: ` + perService.map((v, i) => `Dinner ${i + 1}, ${v} kg`).join('; ') + '.');
    $('#rank').innerHTML = shown.map(d => `<li><span>${d.name}</span><strong>${sum(d.weights)} kg</strong><i style="--w:${sum(d.weights) / MAX_DISH * 100}%"></i></li>`).join('');
    $('#insight').textContent = sel === 'all' ? 'Rice is 57% of recorded waste.' : `${shown[0].name}: ${kg} kg across 4 dinners, ${Math.round(kg * 1000 / COVERS)} g per cover.`;
    $('#records').innerHTML = shown.map(d => `<tr><td>${d.time}</td><th scope="row">${d.name}</th><td class="num">${d.weights[3]} kg</td><td class="num">${inr.format(d.weights[3] * d.rate)}</td></tr>`).join('');
  }
  $$('input[name="dish"]').forEach(r => r.addEventListener('change', () => renderDash(r.value)));

  /* ---- Value calculator ---- */
  const wv = $('#waste-value'), red = $('#reduction');
  function calc() {
    const v = wv.valueAsNumber, r = Number(red.value);
    const ok = Number.isFinite(v) && v >= 0 && v <= 1e9;
    $('#reduction-out').textContent = r + '%';
    $('#calc-error').hidden = ok;
    wv.setAttribute('aria-invalid', String(!ok));
    $('#annual').textContent = ok ? inr.format(v * r / 100 * 12) : '—';
    $('#monthly').textContent = ok ? inr.format(v * r / 100) + ' per month' : 'Enter a valid monthly value.';
  }
  wv.addEventListener('input', calc); red.addEventListener('input', calc); calc();
  $('#est-apply').addEventListener('click', () => {
    const c = $('#est-covers').valueAsNumber, g = $('#est-grams').valueAsNumber, k = $('#est-rate').valueAsNumber;
    if (![c, g, k].every(n => Number.isFinite(n) && n >= 0)) { $('#est-out').textContent = 'Fill in all three fields with your own numbers.'; return; }
    const monthly = Math.round(c * g / 1000 * k * 30);
    wv.value = Math.min(monthly, 1e9); calc();
    $('#est-out').textContent = `${c.toLocaleString('en-IN')} covers × ${g} g × ${inr.format(k)}/kg × 30 days ≈ ${inr.format(monthly)} a month. Added above.`;
  });

  /* ---- Enquiry: prepared locally, never sent ---- */
  const form = $('#enquiry'), ready = $('#enquiry-ready'), err = $('#form-error');
  let text = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const req = ['#f-name', '#f-email', '#f-hotel'].map(s => $(s));
    let firstBad = null;
    req.forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !i.checkValidity()); i.setAttribute('aria-invalid', String(bad)); if (bad && !firstBad) firstBad = i; });
    if (firstBad) { err.textContent = 'Please add your name, a valid work email and your hotel.'; err.hidden = false; firstBad.focus(); return; }
    err.hidden = true;
    const f = Object.fromEntries(new FormData(form));
    text = [
      'Kulivo pilot enquiry', '',
      `Name: ${f.name}`, `Role: ${f.role}`, `Work email: ${f.email}`, f.phone ? `Phone: ${f.phone}` : null,
      `Hotel / group: ${f.hotel}`, f.city ? `City: ${f.city}` : null, `Most want to understand: ${f.focus}`,
      f.note ? `\nNotes:\n${f.note}` : null, '',
      'I would like to talk about starting a Kulivo pilot in one kitchen.'
    ].filter(l => l !== null).join('\n');
    $('#r-text').value = text;
    $('#r-mail').href = `mailto:?subject=${encodeURIComponent('Kulivo pilot enquiry: ' + f.hotel)}&body=${encodeURIComponent(text)}`;
    $('#r-status').textContent = '';
    form.hidden = true; ready.hidden = false; ready.focus();
  });
  $('#r-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text); $('#r-status').textContent = 'Copied to your clipboard.'; }
    catch { $('#r-text').select(); $('#r-status').textContent = 'Text selected. Press Ctrl/Cmd + C to copy.'; }
  });
  $('#r-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'kulivo-pilot-enquiry.txt' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#r-status').textContent = 'Download requested. Nothing has been sent.';
  });
  $('#r-edit').addEventListener('click', () => { ready.hidden = true; form.hidden = false; $('#f-name').focus(); });
})();
