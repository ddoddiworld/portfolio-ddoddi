(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: solid after hero */
  var header = $('#header');
  var onScroll = function () {
    header.classList.toggle('is-solid', window.scrollY > 40);
    $('#toTop').classList.toggle('is-visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  var toggle = $('#navToggle'), gnb = $('#gnb');
  var setNav = function (open) {
    gnb.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', function () { setNav(!gnb.classList.contains('is-open')); });
  gnb.addEventListener('click', function (e) { if (e.target.tagName === 'A') setNav(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setNav(false); });

  /* hero title reveal */
  var title = $('.hero-title');
  requestAnimationFrame(function () { requestAnimationFrame(function () { title.classList.add('in'); }); });

  /* hero video: play only when it can; otherwise poster stays */
  var video = $('.hero-media video');
  if (video) {
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    var p = video.play && video.play();
    if (p && p.catch) p.catch(function () {});
  }

  var hasIO = 'IntersectionObserver' in window;

  /* active nav */
  var links = $$('#gnb a[href^="#"]');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if (hasIO) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* reveal on scroll */
  var reveals = $$('.reveal, .tl-item');
  if (hasIO && !reduce) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revIO.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* journey progress line */
  var tl = $('.tl');
  if (tl) {
    var tlProgress = function () {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var pct = (vh * 0.6 - r.top) / r.height;
      pct = Math.max(0, Math.min(1, pct));
      tl.style.setProperty('--fill', (pct * 100).toFixed(1) + '%');
    };
    window.addEventListener('scroll', tlProgress, { passive: true });
    window.addEventListener('resize', tlProgress);
    tlProgress();
  }

  /* counters */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var dur = 1400, start = null;
    var fmt = function (v) { return v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    if (reduce) { el.textContent = fmt(target); return; }
    var step = function (ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (hasIO) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounter(en.target); cIO.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cIO.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* case dialogs */
  $$('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var d = document.getElementById(btn.getAttribute('data-open'));
      if (d && typeof d.showModal === 'function') { d.showModal(); document.body.style.overflow = 'hidden'; }
    });
  });
  $$('dialog.sheet').forEach(function (d) {
    var close = function () { d.close(); };
    $('[data-close]', d).addEventListener('click', close);
    d.addEventListener('click', function (e) { if (e.target === d) close(); });
    d.addEventListener('close', function () { document.body.style.overflow = ''; });
  });

  /* copy email */
  var selectText = function (el) {
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  };
  $$('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = $(b.getAttribute('data-copy')), text = el.textContent.trim();
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(el); });
      } else { selectText(el); }
    });
  });

  /* to top */
  $('#toTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* custom cursor (fine pointers only) */
  var cursor = $('#cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches && !reduce) {
    var cx = 0, cy = 0, tx = 0, ty = 0, raf;
    var loop = function () {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains('is-on')) { cx = tx; cy = ty; cursor.classList.add('is-on'); loop(); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); cancelAnimationFrame(raf); });
    document.addEventListener('mouseenter', function () { if (tx || ty) { cursor.classList.add('is-on'); loop(); } });
    $$('a, button, summary, .case').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-big'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-big'); });
    });
  }
})();
