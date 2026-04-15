/**
 * main.js — Becoming by Tabassum Chowdhury
 */

(function () {
  'use strict';

  const MONTHS = ['about', 'jan', 'feb', 'mar', 'apr'];

  const MONTH_SECTIONS = {
    jan: ['s-wedding', 's-bench', 's-game', 's-boy', 's-im'],
    feb: ['s-routine', 's-team', 's-reset'],
    mar: ['s-experiences', 's-cat', 's-rush', 's-end'],
  };

  const FRAME_PREFIX = {
    jan: 'fi-jan-',
    feb: 'fi-feb-',
    mar: 'fi-mar-',
  };

  let currentMonth = 'jan';
  let ticking = false;

  function getHeaderHeight() {
    var h = document.getElementById('site-header');
    return h ? h.offsetHeight : 0;
  }

  function selectMonth(month) {
    if (month === currentMonth) return;
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

    ['jan', 'feb', 'mar'].forEach(function (m) {
      var strip = document.getElementById('strip-' + m);
      if (!strip) return;
      strip.classList.toggle('visible', m === month);
    });

    updateActiveFrames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function jumpTo(sectionId) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    var headerH = getHeaderHeight();
    var top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
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
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveFrames();
        ticking = false;
      });
      ticking = true;
    }
  }

  function init() {
    var janPage = document.getElementById('page-jan');
    if (janPage) { janPage.classList.add('active'); janPage.removeAttribute('hidden'); }

    var janTab = document.getElementById('ntab-jan');
    if (janTab) { janTab.classList.add('active'); janTab.setAttribute('aria-current', 'page'); }

    var janStrip = document.getElementById('strip-jan');
    if (janStrip) janStrip.classList.add('visible');

    updateActiveFrames();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  window.selectMonth = selectMonth;
  window.jumpTo = jumpTo;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
