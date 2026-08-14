/**
 * main.js — Becoming by Tabassum Chowdhury
 */

(function () {
  'use strict';

  const MONTHS = ['about', 'jan', 'feb', 'mar', 'apr', 'epilogue'];

  const MONTH_SECTIONS = {
    jan: ['s-wedding', 's-bench', 's-game', 's-boy', 's-im'],
    feb: ['s-routine', 's-team', 's-reset'],
    mar: ['s-experiences', 's-cat', 's-rush', 's-end'],
    apr: ['s-reconciliation', 's-trip', 's-moment'],
  };

  const FRAME_PREFIX = {
    jan: 'fi-jan-',
    feb: 'fi-feb-',
    mar: 'fi-mar-',
    apr: 'fi-apr-',
  };

  const PARALLAX_AMP = 0.09;

  let currentMonth = 'about';
  let ticking = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getHeaderHeight() {
    var h = document.getElementById('site-header');
    return h ? h.offsetHeight : 0;
  }

  function syncHeaderHeightVar() {
    document.documentElement.style.setProperty('--header-h', getHeaderHeight() + 'px');
  }

  function updateTally() {
    var sections = MONTH_SECTIONS[currentMonth];
    var tally = document.getElementById('tally');
    if (!tally) return;

    if (!sections) {
      tally.classList.remove('visible');
      return;
    }
    tally.classList.add('visible');

    var total = document.getElementById('tally-total');
    if (total) total.textContent = String(sections.length);
  }

  function updateActiveFrames() {
    var sections = MONTH_SECTIONS[currentMonth];
    var prefix   = FRAME_PREFIX[currentMonth];
    if (!sections || !prefix) return;

    var headerH   = getHeaderHeight();
    var threshold = window.scrollY + headerH + 120;
    var activeIdx = 0;

    sections.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= threshold) activeIdx = i + 1;
    });

    for (var i = 1; i <= sections.length; i++) {
      var frame = document.getElementById(prefix + i);
      if (frame) frame.classList.toggle('active', i === activeIdx);
    }

    var cur = document.getElementById('tally-cur');
    if (cur && activeIdx > 0) cur.textContent = String(activeIdx).padStart(2, '0');
  }

  function updateParallax() {
    if (reduced) return;
    var els = document.querySelectorAll('.parallax');
    if (!els.length) return;
    var vh = window.innerHeight;

    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return; // skip offscreen work
      var center = r.top + r.height / 2;
      var offset = (vh / 2 - center) * PARALLAX_AMP;
      offset = Math.max(-18, Math.min(18, offset));
      el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    });
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveFrames();
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }

  function selectMonth(month) {
    if (month === currentMonth) return;

    var main = document.getElementById('main-content');
    var shutter = document.getElementById('shutter');

    function applySwap() {
      currentMonth = month;

      MONTHS.forEach(function (m) {
        var tab  = document.getElementById('ntab-' + m);
        var page = document.getElementById('page-' + m);

        if (tab) {
          tab.classList.toggle('active', m === month);
          tab.setAttribute('aria-current', m === month ? 'page' : 'false');
        }

        if (page) {
          if (m === month) {
            page.classList.add('active');
            page.removeAttribute('hidden');
          } else {
            page.classList.remove('active');
            page.setAttribute('hidden', '');
          }
        }
      });

      ['jan', 'feb', 'mar', 'apr'].forEach(function (m) {
        var strip = document.getElementById('strip-' + m);
        if (!strip) return;
        strip.classList.toggle('visible', m === month);
      });

      updateTally();
      updateActiveFrames();
      updateParallax();
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }

    if (reduced || !main || !shutter) {
      applySwap();
      return;
    }

    shutter.classList.add('flash');
    main.classList.add('leaving');

    setTimeout(function () {
      applySwap();
      main.classList.remove('leaving');
      main.classList.add('entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          main.classList.remove('entering');
        });
      });
      shutter.classList.remove('flash');
    }, 150);
  }

  function jumpTo(sectionId) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    var headerH = getHeaderHeight();
    var top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (reduced) {
      els.forEach(function (e) { e.classList.add('in-view'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var target = entry.target;
          setTimeout(function () { target.classList.add('in-view'); }, i * 70);
          io.unobserve(target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (e) { io.observe(e); });
  }

  function init() {
    var aboutPage = document.getElementById('page-about');
    if (aboutPage) { aboutPage.classList.add('active'); aboutPage.removeAttribute('hidden'); }

    var aboutTab = document.getElementById('ntab-about');
    if (aboutTab) { aboutTab.classList.add('active'); aboutTab.setAttribute('aria-current', 'page'); }

    var janPage = document.getElementById('page-jan');
    if (janPage) { janPage.classList.remove('active'); janPage.setAttribute('hidden', ''); }

    var janTab = document.getElementById('ntab-jan');
    if (janTab) { janTab.classList.remove('active'); janTab.setAttribute('aria-current', 'false'); }

    ['jan', 'feb', 'mar', 'apr'].forEach(function (m) {
      var strip = document.getElementById('strip-' + m);
      if (strip) strip.classList.toggle('visible', m === currentMonth);
    });

    updateTally();
    updateActiveFrames();
    updateParallax();
    syncHeaderHeightVar();
    initReveal();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      window.requestAnimationFrame(syncHeaderHeightVar);
    });
  }

  window.selectMonth = selectMonth;
  window.jumpTo = jumpTo;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
