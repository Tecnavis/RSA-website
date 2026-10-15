/* RSA Kerala — site behaviour (no dependencies) */
(function () {
  'use strict';
  var WA = '919817100100'; // WhatsApp number that receives every form
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- preloader ---------- */
  var pre = $('#pre'), started = Date.now();
  function ready() {
    document.body.classList.add('ready');
    if (pre) { pre.classList.add('done'); setTimeout(function () { pre.remove(); }, 1000); }
    try { sessionStorage.setItem('rsaPre', '1'); } catch (e) {}
  }
  function onLoad() { setTimeout(ready, pre ? Math.max(0, 1100 - (Date.now() - started)) : 60); }
  if (document.readyState === 'complete') onLoad(); else window.addEventListener('load', onLoad);
  setTimeout(function () { if (!document.body.classList.contains('ready')) ready(); }, 3500);

  /* ---------- header, progress, mobile menu ---------- */
  var header = $('.header'), bar = $('.progress');
  var burger = $('.burger'), menu = $('#menu');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (bar) bar.style.setProperty('--sp', h > 0 ? (y / h).toFixed(4) : 0);
    roadUpdate();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', o);
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- counters ---------- */
  function count(el) {
    var to = +el.getAttribute('data-count'), t0 = null, dur = 1800;
    if (reduce) { el.textContent = to; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { co.observe(el); });
  } else $$('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });

  /* ---------- hero slideshow ---------- */
  var slides = $$('.slide'), dots = $$('.pager button'), cur = 0, timer;
  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('on', n === cur); });
    dots.forEach(function (d, n) { d.classList.remove('on'); if (n === cur) { void d.offsetWidth; d.classList.add('on'); } });
    clearTimeout(timer);
    timer = setTimeout(function () { go(cur + 1); }, 6500);
  }
  if (slides.length > 1) {
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); }); });
    go(0);
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else go(cur); });
  }

  /* ---------- spotlight + tilt + magnetic (pointer devices only) ---------- */
  if (fine && !reduce) {
    $$('.spot').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
        if (c.classList.contains('tilt')) {
          var rx = ((y / r.height) - .5) * -7, ry = ((x / r.width) - .5) * 7;
          c.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
        }
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- truck driving along the process road ---------- */
  var roadEl = $('.road-wrap'), stepEls = $$('.step');
  function roadUpdate() {
    if (!roadEl) return;
    var r = roadEl.getBoundingClientRect();
    var p = clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.55), 0, 1);
    roadEl.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle('on', p >= (i + 0.15) / stepEls.length); });
  }

  /* ---------- reviews slider ---------- */
  var track = $('.rev-track');
  if (track) {
    var rt;
    var by = function (d) {
      var c = track.firstElementChild; if (!c) return;
      var w = c.getBoundingClientRect().width + 24;
      if (d > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) track.scrollTo({ left: 0, behavior: 'smooth' });
      else if (d < 0 && track.scrollLeft <= 8) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      else track.scrollBy({ left: d * w, behavior: 'smooth' });
    };
    var auto = function () { clearInterval(rt); rt = setInterval(function () { by(1); }, 5500); };
    var pb = $('.rev-nav .prev'), nb = $('.rev-nav .next');
    if (pb) pb.addEventListener('click', function () { by(-1); auto(); });
    if (nb) nb.addEventListener('click', function () { by(1); auto(); });
    track.addEventListener('pointerenter', function () { clearInterval(rt); });
    track.addEventListener('pointerleave', auto);
    if (!reduce) auto();
  }

  /* ---------- WhatsApp forms ---------- */
  function fmtDate(v) {
    if (!v) return '';
    var d = new Date(v + 'T00:00:00');
    return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtTime(v) {
    if (!v) return '';
    var p = v.split(':'), h = +p[0], m = p[1], ap = h >= 12 ? 'PM' : 'AM';
    return ((h % 12) || 12) + ':' + m + ' ' + ap;
  }
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $$('input[type=date]').forEach(function (i) { i.min = today.toISOString().slice(0, 10); });

  $$('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var v = function (n) { var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; };
      var lines = ['*' + (f.getAttribute('data-title') || 'New enquiry') + '*', ''];
      var add = function (label, val) { if (val) lines.push('*' + label + ':* ' + val); };
      add('Service', v('service'));
      add('Name', v('name'));
      add('Phone', v('phone'));
      add('Email', v('email'));
      add('Pick-up location', v('pickup'));
      add('Drop-off location', v('drop'));
      var when = [fmtDate(v('date')), fmtTime(v('time'))].filter(Boolean).join(' at ');
      add('Date & time', when);
      add('Subject', v('subject'));
      add('Message', v('message'));
      lines.push('', '_Sent from rsakerala.com_');
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url; // popup blocked → same tab
    });
  });

  $$('.yr').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
