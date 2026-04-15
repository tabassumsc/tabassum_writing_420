/**
 * main.js — Becoming by Tabassum Chowdhury
 *
 * Handles:
 * - Month / page switching with accessible aria attributes
 * - Film strip frame highlighting on scroll
 * - Scroll-to-section with sticky header offset
 */

(function () {
  'use strict';

  /* ── CONFIG ── */
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

  /* ── HELPERS ── */

  function getHeaderHeight() {
    const header = document.getElementById('site-header');
    return header ? header.offsetHeight : 0;
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  /* ── MONTH SWITCHING ── */

  function selectMonth(month) {
    if (month === currentMonth) return;
    currentMonth = month;

    MONTHS.forEach(function (m) {
      const tab  = getEl('ntab-' + m);
      const page = getEl('page-' + m);

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

    /* Show / hide the right film strip */
    ['jan', 'feb', 'mar'].forEach(function (m) {
      const strip = getEl('strip-' + m);
      if (!strip) return;
      if (m === month) {
        strip.classList.add('visible');
      } else {
        strip.classList.remove('visible');
      }
    });

    /* Reset frame highlights for the newly selected month */
    updateActiveFrames();

    /* Scroll to top of page */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── JUMP TO SECTION ── */

  function jumpTo(sectionId) {
    const el = getEl(sectionId);
    if (!el) return;

    const headerH = getHeaderHeight();
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;

    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ── FRAME HIGHLIGHTING ON SCROLL ── */

  function updateActiveFrames() {
    const sections = MONTH_SECTIONS[currentMonth];
    const prefix   = FRAME_PREFIX[currentMonth];

    if (!sections || !prefix) return;

    const headerH   = getHeaderHeight();
    const threshold = window.scrollY + headerH + 120;

    let activeIdx = 0;

    sections.forEach(function (id, i) {
      const el = getEl(id);
      if (el && el.offsetTop <= threshold) {
        activeIdx = i + 1;
      }
    });

    for (let i = 1; i <= sections.length; i++) {
      const frame = getEl(prefix + i);
      if (frame) {
        frame.classList.toggle('active', i === activeIdx);
      }
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

  /* ── INIT ── */

  function init() {
    /* Ensure January is active on load */
    const janPage = getEl('page-jan');
    if (janPage) {
      janPage.classList.add('active');
      janPage.removeAttribute('hidden');
    }

    const janTab = getEl('ntab-jan');
    if (janTab) {
      janTab.classList.add('active');
      janTab.setAttribute('aria-current', 'page');
    }

    const janStrip = getEl('strip-jan');
    if (janStrip) janStrip.classList.add('visible');

    /* Initial frame highlight */
    updateActiveFrames();

    /* Scroll listener */
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── EXPOSE GLOBALS for inline onclick attributes ── */
  window.selectMonth = selectMonth;
  window.jumpTo = jumpTo;

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
