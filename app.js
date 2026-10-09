'use strict';
/* ==========================================================================
   SITE CONFIG: the only values you need to edit.
   - WHATSAPP_NUMBER: international format, digits only, no "+" or spaces,
       e.g. '919876543210' for +91 98765 43210. Leave '' to hide every
       WhatsApp button (floating and inline).
   - BOOKING_URL: the full Google Calendar appointment-schedule link
       (https://calendar.app.google/...). Leave '' to hide every
       "Book a 30-min call" button.
   ========================================================================== */
const WHATSAPP_NUMBER = '';
const WHATSAPP_TEXT = "Hi Kulivo, I'd like to know more about the 30-day free pilot for my kitchen.";
const BOOKING_URL = 'https://calendar.app.google/je7n1twqj7SaQdXt7';
const LEAD_EMAIL = 'info@kulivo.ai';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/badfdf22978df7da3be8be2268aaf833';
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

  /* ---- Contact options driven by config (render nothing when empty) ---- */
  const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, '');
  const waUrl = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(WHATSAPP_TEXT)}` : '';
  const bookUrl = /^https:\/\//.test(BOOKING_URL) ? BOOKING_URL : '';
  const WA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3Z"/></svg>';
  const link = (cls, href, html, label) => {
    const a = document.createElement('a');
    a.className = cls; a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.innerHTML = html;
    if (label) a.setAttribute('aria-label', label);
    return a;
  };
  const reachRow = $('#reach-row');
  if (waUrl) {
    reachRow.append(link('reach-link reach-wa', waUrl, `${WA_ICON} WhatsApp`, 'Chat with Kulivo on WhatsApp (opens WhatsApp)'));
    const fab = link('wa-fab', waUrl, `${WA_ICON}<span class="wa-fab-text">WhatsApp us</span>`, 'Chat with Kulivo on WhatsApp (opens WhatsApp)');
    document.body.append(fab); document.body.classList.add('has-wa');
    // Step aside while the contact section or footer is on screen, so it never covers the form or footer.
    if ('IntersectionObserver' in window) {
      const seen = new Set();
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => en.isIntersecting ? seen.add(en.target) : seen.delete(en.target));
        fab.classList.toggle('wa-fab-hidden', seen.size > 0);
      });
      ['#contact', '.site-footer'].forEach(s => { const el = $(s); if (el) io.observe(el); });
    }
  }
  if (bookUrl) {
    reachRow.append(link('reach-link', bookUrl, '<span aria-hidden="true">📅</span> Book a 30-min call', 'Book a 30-minute call (opens Google Calendar)'));
    $$('[data-cta-row]').forEach(row => row.append(link('btn btn-outline', bookUrl, 'Book a 30-min call', 'Book a 30-minute call (opens Google Calendar)')));
  }

  /* ---- Calculator → enquiry ---- */
  $('#calc-to-form').addEventListener('click', e => {
    const v = wv.valueAsNumber, r = Number(red.value);
    if (!(Number.isFinite(v) && v >= 0 && v <= 1e9)) return; // just scroll
    const note = $('#f-note');
    const estimate = `Savings estimate from the website calculator: monthly food waste value ${inr.format(v)}, assumed reduction ${r}%, illustrative food value saved ${inr.format(v * r / 100 * 12)} per year.`;
    note.value = note.value.includes('Savings estimate from the website calculator:')
      ? note.value.replace(/Savings estimate from the website calculator:[^\n]*/, estimate)
      : (note.value.trim() ? note.value.trim() + '\n\n' : '') + estimate;
    e.preventDefault();
    $('#contact').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $('#f-name').focus({ preventScroll: true }), 400);
  });

  /* ---- Enquiry form: AJAX POST to FormSubmit, delivered to info@kulivo.ai ---- */
  const form = $('#enquiry'), err = $('#form-error'), btn = $('#f-submit');
  const done = $('#enquiry-done'), fail = $('#enquiry-fail');
  const fName = $('#f-name'), fHotel = $('#f-hotel'), fEmail = $('#f-email'), fPhone = $('#f-phone'), fNote = $('#f-note');
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const phoneOk = v => v.replace(/\D/g, '').length >= 8;
  const collect = () => ({
    name: fName.value.trim(), hotel: fHotel.value.trim(), email: fEmail.value.trim(), phone: fPhone.value.trim(),
    improve: $$('input[name="improve"]:checked').map(c => c.value).join(', '), message: fNote.value.trim()
  });
  const asText = d => [
    `Name: ${d.name}`, `Hotel / organisation: ${d.hotel}`, d.email && `Email: ${d.email}`, d.phone && `Phone: ${d.phone}`,
    d.improve && `Would like to improve: ${d.improve}`, d.message && `Message: ${d.message}`, '', 'I’d like to know more about the 30-day free pilot.'
  ].filter(l => l !== '' && l !== undefined && l !== false).join('\n');
  function validate(d) {
    const bad = [];
    const mark = (el, isBad) => { el.setAttribute('aria-invalid', String(isBad)); if (isBad) bad.push(el); };
    mark(fName, !d.name); mark(fHotel, !d.hotel);
    const noContact = !d.email && !d.phone;
    mark(fEmail, noContact || (!!d.email && !emailOk(d.email)));
    mark(fPhone, noContact || (!!d.phone && !phoneOk(d.phone)));
    if (!bad.length) return '';
    bad[0].focus();
    if (!d.name || !d.hotel) return 'Please add your name and your hotel or organisation.';
    if (noContact) return 'Please add an email address or a phone number so we can reply.';
    if (d.email && !emailOk(d.email)) return 'That email address doesn’t look right.';
    return 'Please check the phone number (at least 8 digits).';
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (btn.disabled) return;
    const d = collect();
    const msg = validate(d);
    err.textContent = msg; err.hidden = !msg;
    if (msg) return;
    const payload = {
      name: d.name, hotel: d.hotel, email: d.email || '(not given)', phone: d.phone || '(not given)',
      improve: d.improve || '(not specified)', message: d.message || '(none)', page: location.href.split('#')[0],
      _subject: `New Kulivo pilot enquiry — ${d.hotel}`, _template: 'table', _captcha: 'false', _honey: $('#f-honey').value
    };
    if (d.email) payload._autoresponse = 'Thanks for your interest in Kulivo’s 30-day free pilot. We’ll get back to you within one working day.';
    else delete payload.email; // no email given → no autoresponse, nothing sent to an empty address
    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Sending…';
    let ok = false;
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      ok = res.ok && String(body.success) === 'true';
    } catch { ok = false; }
    btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = 'Request my 30-day free pilot';
    form.hidden = true;
    if (ok) {
      $('#done-title').textContent = `Thanks, ${d.name}.`;
      done.hidden = false; done.focus();
      form.reset();
    } else {
      $('#fail-mail').href = `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent('Kulivo 30-day free pilot — ' + d.hotel)}&body=${encodeURIComponent(asText(d))}`;
      fail.hidden = false; fail.focus();
    }
  });
  $('#done-again').addEventListener('click', () => { done.hidden = true; form.hidden = false; fName.focus(); });
  $('#fail-retry').addEventListener('click', () => { fail.hidden = true; form.hidden = false; btn.focus(); });
})();
