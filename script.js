  (() => {
    'use strict';

    /* ── Theme Toggle ──────────────────────────────────────── */
    const html        = document.documentElement;
    const themeBtn    = document.getElementById('theme-toggle');
    const PREF_KEY    = 'rc-theme';

    // Read saved pref or OS preference
    const saved = localStorage.getItem(PREF_KEY);
    const osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initTheme = saved || (osDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initTheme);
    updateToggleLabel(initTheme);

    themeBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(PREF_KEY, next);
      updateToggleLabel(next);
    });

    function updateToggleLabel(theme) {
      themeBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    /* ── Mobile Nav ────────────────────────────────────────── */
    const navToggle  = document.getElementById('nav-toggle');
    const mobileNav  = document.getElementById('mobile-nav');

    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
      mobileNav.classList.toggle('is-open', !open);
      mobileNav.setAttribute('aria-hidden', String(open));
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        mobileNav.classList.remove('is-open');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        mobileNav.setAttribute('aria-hidden', 'true');
        navToggle.focus();
      }
    });

    /* ── Active nav on scroll (IntersectionObserver) ────────── */
    const sections      = document.querySelectorAll('section[id]');
    const desktopLinks  = document.querySelectorAll('.nav-list a[href^="#"]');
    const mobileLinks   = document.querySelectorAll('.mobile-nav-list a[href^="#"]');
    const allNavLinks   = [...desktopLinks, ...mobileLinks];

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          allNavLinks.forEach(link => {
            const active = link.getAttribute('href') === '#' + entry.target.id;
            link.setAttribute('aria-current', active ? 'true' : 'false');
          });
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });

    sections.forEach(s => sectionObserver.observe(s));

    /* ── Scroll-triggered reveal (IntersectionObserver) ─────── */
    const animEls = document.querySelectorAll('.anim-up');
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      animEls.forEach(el => revealObserver.observe(el));
    } else {
      // Respect reduced motion: show all immediately
      animEls.forEach(el => el.classList.add('in-view'));
    }

    /* ── Contact Form Validation ────────────────────────────── */
    const form      = document.getElementById('contact-form');
    const statusBox = document.getElementById('form-status');

    function validateField(input) {
      const errEl = document.getElementById(input.id + '-error');
      let msg = '';
      const val = input.value.trim();

      if (input.required && !val) {
        msg = 'This field is required.';
      } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Enter a valid email address.';
      } else if (input.minLength > 0 && val.length < input.minLength) {
        msg = `Minimum ${input.minLength} characters required.`;
      }

      if (errEl) errEl.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    // Validate on blur
    form.querySelectorAll('input[required], textarea[required]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const required = form.querySelectorAll('input[required], textarea[required]');
      let valid = true;
      required.forEach(f => { if (!validateField(f)) valid = false; });

      if (valid) {
        statusBox.textContent = "Message sent! I'll be in touch soon.";
        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
      } else {
        statusBox.textContent = 'Please fix the errors above.';
        const first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
      }
    });

  })();
  