import { animate, scroll, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

/* ==========================================
   PREMIUM 2026 PORTFOLIO — script.js
   All original functionality preserved +
   upgraded with VanillaTilt, GSAP, Motion
   ========================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchLike = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;

  /* =========================================
     GSAP Registration
     ========================================= */
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);
    
    if (typeof ScrollTrigger !== 'undefined') {
      document.documentElement.classList.add('js-anim-ready');
    }
  }

  /* =========================================
     Utility: Toast
     ========================================= */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toast-message');
  const productionApiBase = 'https://portfolio-website-pa8z.onrender.com/api';

  function getApiBaseUrl() {
    if (window.PORTFOLIO_API_BASE) return String(window.PORTFOLIO_API_BASE).replace(/\/$/, '');
    const host = window.location.hostname;
    const isLocal = window.location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1';
    return isLocal ? 'http://localhost:5000/api' : productionApiBase;
  }

  function getApiBaseUrls() {
    const primary = getApiBaseUrl();
    if (primary === productionApiBase) return [productionApiBase];
    return [primary, productionApiBase];
  }

  async function postApiJson(path, payload) {
    let lastError;

    for (const baseUrl of getApiBaseUrls()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));

        if (res.ok || res.status < 500) return { res, data };
        lastError = new Error(data.message || `API request failed with ${res.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('API request failed');
  }

  function showToast(message = '', duration = 3000) {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  /* =========================================
     Cinematic Welcome Intro (Stage 1)
     ========================================= */
  function initWelcomeIntro(onIntroComplete) {
    const introEl = document.getElementById('welcome-intro');
    if (!introEl) {
      if (typeof onIntroComplete === 'function') onIntroComplete();
      return;
    }

    const skipBtn = document.getElementById('skip-intro');

    // If visitor prefers reduced motion, bypass intro immediately
    if (prefersReducedMotion) {
      introEl.classList.add('is-hidden');
      introEl.style.display = 'none';
      if (typeof onIntroComplete === 'function') onIntroComplete();
      return;
    }

    // Ensure intro is visible on every load / reload
    introEl.classList.remove('is-hidden');
    introEl.style.display = 'flex';
    introEl.style.opacity = '1';

    let completed = false;
    let introTl = null;

    function finishIntro() {
      if (completed) return;
      completed = true;
      if (introTl) {
        introTl.kill();
        introTl = null;
      }

      if (typeof gsap !== 'undefined') {
        gsap.to(introEl, {
          opacity: 0,
          y: -24,
          duration: 0.65,
          ease: 'power3.inOut',
          onComplete: () => {
            introEl.classList.add('is-hidden');
            introEl.style.display = 'none';
            if (typeof onIntroComplete === 'function') onIntroComplete();
          }
        });
      } else {
        introEl.classList.add('is-hidden');
        introEl.style.display = 'none';
        if (typeof onIntroComplete === 'function') onIntroComplete();
      }
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        finishIntro();
      }, { once: true });
    }

    if (typeof gsap !== 'undefined') {
      // Reset initial values before playing
      gsap.set('.welcome-brand', { opacity: 0, scale: 0.92, y: 14 });
      gsap.set('.welcome-word', { opacity: 0, y: 18 });
      gsap.set('#welcome-tagline', { opacity: 0, y: 12 });
      gsap.set('.welcome-controls', { opacity: 0, y: 10 });
      gsap.set('#welcome-meter-fill', { width: '0%' });

      introTl = gsap.timeline({ onComplete: finishIntro });

      // Step 1: Smooth reveal of the brand monogram and full typography
      introTl
        .to('.welcome-brand', {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
        .to('.welcome-word', {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          stagger: 0.07
        }, '-=0.15')
        .to('#welcome-tagline', {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out'
        }, '-=0.1')
        .to('.welcome-controls', {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out'
        }, '-=0.2')
        .addLabel('hold'); // At this label, monogram, full sentence, and tagline are 100% visible

      // Step 2: 5-SECOND HOLD
      // Hold the complete welcome screen for approximately 5 seconds.
      // Progress indicator fills smoothly across this 5-second hold and reaches 100% as the hold concludes.
      introTl
        .to('#welcome-meter-fill', {
          width: '100%',
          duration: 5.0,
          ease: 'linear'
        }, 'hold')
        .to({}, { duration: 5.0 }, 'hold'); // Synchronized 5.0-second hold

    } else {
      // Fallback if GSAP is unavailable: keep visible for 5s then transition
      setTimeout(finishIntro, 5000);
    }

    // Safe fallback timeout: 11 seconds ensures the 5-second hold is never prematurely cut off,
    // while providing a guaranteed exit if timeline is blocked by background tab throttle
    setTimeout(finishIntro, 11000);
  }

  /* =========================================
     Scroll progress
     ========================================= */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    let ticking = false;

    function update() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    update();
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
  }

  /* =========================================
     Motion (Framer Motion Vanilla)
     ========================================= */
  function initMotionAnimations() {
    const springConfig = { type: "spring", bounce: 0.25, duration: 0.8 };

    // Fade up animations (only for non-GSAP elements to avoid transform conflicts)
    inView(".section-label, .section-title, .misc-card", (info) => {
      animate(info.target, { opacity: [0, 1], y: [40, 0] }, { ...springConfig, delay: 0.1 });
    });

    // Fade right animations
    inView(".about-image, .edu-card, .contact-info", (info) => {
      animate(info.target, { opacity: [0, 1], x: [-40, 0] }, { ...springConfig, delay: 0.1 });
    });

    // Fade left animations
    inView(".about-text, .contact-form-wrapper", (info) => {
      animate(info.target, { opacity: [0, 1], x: [40, 0] }, { ...springConfig, delay: 0.2 });
    });

    // Staggered lists (certs, strengths)
    inView(".certs-grid", (info) => {
      animate(".cert-item", { opacity: [0, 1], x: [-30, 0] }, { delay: stagger(0.1), ...springConfig });
    });
    inView(".strengths-grid", (info) => {
      animate(".strength-tag", { opacity: [0, 1], scale: [0.8, 1] }, { delay: stagger(0.1), ...springConfig });
    });
  }

  /* =========================================
     Mobile Nav Toggle Fix
     ========================================= */
  function ensureMobileNavVisible() {
    if (window.innerWidth <= 768) {
      const navToggle = document.getElementById('nav-toggle');
      if (navToggle) {
        navToggle.style.display = 'flex';
        navToggle.style.visibility = 'visible';
        navToggle.style.opacity = '1';
      }
    }
  }

  /* =========================================
     Hero Canvas — Stars & Shooting Stars
     ========================================= */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let running = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Static stars
    const stars = [];
    const starCount = isTouchLike ? 80 : 150;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.5 + 0.3,
        op: Math.random() * 0.5 + 0.2,
        ts: Math.random() * 0.015 + 0.005
      });
    }

    // Shooting stars
    const shootingStars = [];
    function createShootingStar() {
      if (shootingStars.length >= 3) return;
      shootingStars.push({
        x: Math.random() * canvas.width * 0.6,
        y: Math.random() * canvas.height * 0.4,
        vx: Math.random() * 5 + 4,
        vy: Math.random() * 4 + 3,
        len: Math.random() * 100 + 60,
        op: 0.8,
        maxOp: Math.random() * 0.4 + 0.5
      });
    }

    let frame = 0;
    function draw() {
      if (!running || document.hidden) {
        requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient — subtle cobalt radial glow
      const grad = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.5, 0,
        canvas.width * 0.7, canvas.height * 0.5, canvas.width * 0.6
      );
      grad.addColorStop(0, 'rgba(44, 52, 128, 0.15)'); /* Cobalt */
      grad.addColorStop(0.5, 'rgba(44, 52, 128, 0.05)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      const t = Date.now() * 0.001;
      stars.forEach(s => {
        const op = s.op + Math.sin(t * s.ts * 60) * 0.12;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.02, Math.min(0.3, op * 0.4))})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const grd = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len * (ss.vx / 8), ss.y - ss.len * (ss.vy / 8));
        grd.addColorStop(0, `rgba(168,199,255,${ss.op * 0.4})`);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 10, ss.y - ss.vy * 10);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 2;
        ctx.stroke();

        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.op -= 0.012;

        if (ss.op <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
          shootingStars.splice(i, 1);
        }
      }

      frame++;
      if (frame % 90 === 0) createShootingStar();
      requestAnimationFrame(draw);
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        running = entries[0]?.isIntersecting ?? true;
      }, { threshold: 0.01 });
      observer.observe(canvas);
    }
    draw();
  }

  /* =========================================
     Hero cursor glow
     ========================================= */
  function initHeroPointerGlow() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.addEventListener('pointermove', e => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
    }, { passive: true });
  }

  /* =========================================
     Hero Typed Effect
     ========================================= */
  let heroTypedStarted = false;
  function initHeroTyped() {
    if (heroTypedStarted) return;
    heroTypedStarted = true;
    const typedText = document.getElementById('typed-text');
    if (!typedText) return;
    typedText.textContent = '';
    const texts = ['Web Developer & Full-Stack Developer', 'Frontend Engineer', 'Custom Web Solutions'];
    let tIndex = 0, cIndex = 0, deleting = false, speed = 100;

    function tick() {
      const current = texts[tIndex];
      if (deleting) {
        typedText.textContent = current.substring(0, cIndex - 1);
        cIndex--;
        speed = 45;
      } else {
        typedText.textContent = current.substring(0, cIndex + 1);
        cIndex++;
        speed = 100;
      }
      if (!deleting && cIndex === current.length) { deleting = true; speed = 1800; }
      else if (deleting && cIndex === 0) { deleting = false; tIndex = (tIndex + 1) % texts.length; speed = 500; }
      setTimeout(tick, speed);
    }
    setTimeout(tick, 400);
  }

  /* =========================================
     Navbar: Scroll class + Active Links
     ========================================= */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    let lastScrollY = window.scrollY;
    let ticking = false;
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));

    // Setup active state IntersectionObserver
    if ('IntersectionObserver' in window && sections.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0
      };
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              const href = (link.getAttribute('href') || '').replace('#', '');
              link.classList.toggle('active', href === id);
            });
          }
        });
      }, observerOptions);
      sections.forEach(sec => navObserver.observe(sec));
    }

    // Mobile toggle
    if (navToggle && navMenu) {
      const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active', isOpen);
        navbar && navbar.classList.toggle('menu-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };
      navToggle.addEventListener('click', toggleMenu);
      navToggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMenu();
        }
      });
    }
    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu && navMenu.classList.remove('active');
        navToggle && navToggle.classList.remove('active');
        navbar && navbar.classList.remove('menu-open');
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
        navToggle && navToggle.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = '';
      });
    });

    function updateOnScroll() {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        const goingDown = window.scrollY > lastScrollY && window.scrollY > 420;
        navbar.classList.toggle('nav-hidden', goingDown && !navMenu?.classList.contains('active'));
        lastScrollY = window.scrollY;
      }

      // Scroll active state logic removed, handled by IntersectionObserver

      if (window.innerWidth <= 768) ensureMobileNavVisible();
      ticking = false;
    }

    // Scroll updates
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateOnScroll);
    });
  }

  /* =========================================
     Smooth internal scroll
     ========================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* =========================================
     Education Card Visibility
     ========================================= */
  function initEducationAnimation() {
    const cards = document.querySelectorAll('.edu-card');
    if (!cards.length) return;

    const revealCard = card => {
      card.classList.add('visible');
      const bar = card.querySelector('.edu-progress-bar');
      if (bar && !bar._animated) {
        bar._animated = true;
        const targetW = bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = targetW; }, 50);
        });
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          revealCard(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
      cards.forEach(card => observer.observe(card));
    } else {
      cards.forEach(revealCard);
    }
  }

  /* =========================================
     Copy Email
     ========================================= */
  function initCopyEmail() {
    const copyEl = document.getElementById('copy-email');
    if (!copyEl) return;
    copyEl.setAttribute('tabindex', '0');
    copyEl.setAttribute('role', 'button');
    const tooltip = copyEl.querySelector('.copy-tooltip');

    function showTip(text) {
      if (!tooltip) return;
      tooltip.textContent = text;
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      clearTimeout(copyEl._tipTimer);
      copyEl._tipTimer = setTimeout(() => {
        tooltip.style.opacity = '';
        tooltip.style.visibility = '';
        tooltip.textContent = 'Copy to clipboard';
      }, 1800);
    }

    async function doCopy() {
      const email = copyEl.getAttribute('data-email') ||
        Array.from(copyEl.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.nodeValue.trim())
          .join('')
          .split(/\s/)[0];
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        showTip('Copied!');
        showToast('✅ Email copied to clipboard!', 2200);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showTip('Copied!'); showToast('✅ Email copied!', 2200); }
        catch { showTip('Copy failed'); }
        document.body.removeChild(ta);
      }
    }
    copyEl.addEventListener('click', doCopy);
    copyEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); } });
  }

  /* =========================================
     Interactive Contact Message Delivery (Stage 3)
     Full Claude v2 Truck Delivery Animation & Production Backend
     ========================================= */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const stage = document.getElementById('delivery-stage');
    if (!form || !stage) return;

    // Enforce initial visibility: Contact form MUST be visible; delivery stage MUST be hidden
    form.style.display = 'flex';
    form.classList.remove('is-hidden');
    form.style.opacity = '1';
    form.style.visibility = 'visible';

    stage.style.display = 'none';
    stage.classList.remove('is-active');
    stage.setAttribute('aria-hidden', 'true');

    const capsule = document.getElementById('td-capsule');
    const scene = document.getElementById('td-scene');
    const status = document.getElementById('td-status');
    const ok = document.getElementById('td-ok');
    const bad = document.getElementById('td-bad');
    const truck = document.getElementById('td-truck');
    const tbody = document.getElementById('td-tbody');
    const house = document.getElementById('td-house');
    const pin = document.getElementById('td-pin');
    const courier = document.getElementById('td-courier');
    const cParcel = document.getElementById('td-parcel');
    const doorPanel = document.getElementById('td-door-panel');
    const bubble = document.getElementById('td-bubble');
    const fx = document.getElementById('td-fx');
    const stars = document.getElementById('td-stars');
    const receipt = document.getElementById('td-receipt');
    const errmsg = document.getElementById('td-errmsg');
    const btnAgain = document.getElementById('td-again');
    const btnRetry = document.getElementById('td-retry');
    const btnEdit = document.getElementById('td-edit');

    const NS = 'http://www.w3.org/2000/svg';
    const TX0 = 70, TX1 = 280;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const run = (el, kf, opt) => el.animate(kf, { fill: 'forwards', ...opt }).finished;
    const cpos = x => `translate(${x}px,196px)`;

    let payload = null;
    let busy = false;
    let driveAnimId = null;

    /* ---------- Scenery (Procedural) ---------- */
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    if (stars) {
      let st = '';
      for (let i = 0; i < 46; i++) {
        st += `<circle class="star" cx="${(rnd() * 640).toFixed(0)}" cy="${(rnd() * 110).toFixed(0)}" r="${(rnd() * 1.1 + 0.3).toFixed(1)}" opacity="${(rnd() * 0.6 + 0.3).toFixed(2)}"/>`;
      }
      stars.innerHTML = st;
    }

    const twice = s => `<g>${s}</g><g transform="translate(640 0)">${s}</g>`;
    let hills = 'M0 150';
    for (let x = 0; x <= 640; x += 16) {
      hills += ` L${x} ${(108 + 16 * Math.sin(x / 640 * Math.PI * 4) + 9 * Math.sin(x / 640 * Math.PI * 8)).toFixed(1)}`;
    }
    hills += ' L640 150Z';

    let city = '';
    for (let i = 0; i < 16; i++) {
      const h = 32 + Math.floor(rnd() * 62), x = i * 40;
      city += `<rect x="${x}" y="${150 - h}" width="38" height="${h}" fill="#0d1428"/>`;
      for (let wy = 150 - h + 6; wy < 144; wy += 9) {
        for (let wx = 5; wx < 34; wx += 11) {
          if (rnd() > 0.62) city += `<rect x="${x + wx}" y="${wy}" width="4" height="5" fill="#fcd34d" opacity="${(rnd() * 0.4 + 0.35).toFixed(2)}"/>`;
        }
      }
    }

    let trees = '';
    for (let k = 0; k < 10; k++) {
      const x = k * 64 + 22, h = 36 + (k % 3) * 9;
      trees += `<rect x="${x - 1.5}" y="164" width="3" height="8" fill="#05080f"/><path d="M${x - 12} 166L${x} ${170 - h}L${x + 12} 166Z" fill="#071a18"/><path d="M${x - 9} 150L${x} ${158 - h + 8}L${x + 9} 150Z" fill="#082220"/>`;
    }

    let ground = '';
    for (const x of [120, 440]) {
      ground += `<rect x="${x - 1.5}" y="96" width="3" height="76" fill="#1f2937"/><path d="M${x} 98Q${x} 88 ${x + 14} 88" stroke="#1f2937" stroke-width="3" fill="none"/><rect x="${x + 8}" y="87" width="16" height="5" rx="2" fill="#fde68a"/><polygon points="${x + 12},92 ${x - 18},174 ${x + 50},174" fill="url(#td-lampg)"/><ellipse cx="${x + 16}" cy="176" rx="40" ry="4" fill="#fbbf24" opacity=".14"/>`;
    }
    for (let k = 0; k < 10; k++) {
      ground += `<rect x="${k * 64 + 10}" y="212" width="36" height="3" rx="1" fill="#cbd5e1" opacity=".6"/>`;
    }

    const layerDefs = [
      ['td-far', `<path d="${hills}" fill="#0a1124"/>`, 90000],
      ['td-city', city, 26000],
      ['td-trees', trees, 5200],
      ['td-ground', ground, 2400]
    ];

    const layers = layerDefs.map(([id, svg, dur]) => {
      const el = document.getElementById(id);
      if (!el) return null;
      el.innerHTML = twice(svg);
      const a = el.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-640px)' }],
        { duration: dur, iterations: Infinity }
      );
      a.pause();
      return a;
    }).filter(Boolean);

    const wheels = scene ? [...scene.querySelectorAll('.wheel')].map(w => {
      const a = w.animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }],
        { duration: 360, iterations: Infinity }
      );
      a.pause();
      return a;
    }) : [];

    /* ---------- Helpers ---------- */
    function walk(x0, x1, d) {
      if (!courier) return Promise.resolve();
      courier.classList.add('walking');
      return run(courier, [{ transform: cpos(x0) }, { transform: cpos(x1) }], { duration: d, easing: 'linear' })
        .then(() => courier.classList.remove('walking'));
    }

    function sparkle(cx, cy) {
      if (!fx) return;
      for (let i = 0; i < 14; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', cy);
        c.setAttribute('r', 2);
        c.setAttribute('fill', ['#fcd34d', '#34d399', '#7dd3fc', '#fff'][i % 4]);
        fx.appendChild(c);
        const a = (i / 14) * Math.PI * 2, d = 26 + Math.random() * 30;
        c.animate(
          [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 12}px) scale(.2)`, opacity: 0 }],
          { duration: 900, easing: 'ease-out' }
        ).finished.then(() => c.remove());
      }
    }

    function update(p, s, t, now) {
      if (truck) truck.style.transform = `translateX(${TX0 + (TX1 - TX0) * p}px)`;
      if (house) house.style.transform = `translateX(${380 * (1 - p)}px)`;
      if (pin) pin.style.transform = `translateX(${-300 * p}px)`;
      const r = Math.max(s, 0.0001);
      layers.forEach(a => { if (a) a.playbackRate = r; });
      wheels.forEach(a => { if (a) a.playbackRate = r; });
      const squat = t < 0.22 ? -1.3 * Math.sin(Math.PI * t / 0.22) : 0;
      const dive = t > 0.7 ? 2.2 * Math.sin(Math.PI * Math.min((t - 0.7) / 0.3, 1)) : 0;
      if (tbody) tbody.style.transform = `translateY(${(Math.sin(now / 58) * 0.7 + Math.sin(now / 23) * 0.25) * s}px) rotate(${squat + dive}deg)`;
      if (scene) scene.classList.toggle('braking', t > 0.68 && t < 1);
    }

    function drive(D) {
      return new Promise(res => {
        const sm = x => x * x * (3 - 2 * x);
        const sp = t => (t < 0.22 ? sm(t / 0.22) : t > 0.72 ? sm((1 - t) / 0.28) : 1);
        const TOT = 0.75 * D;
        const t0 = performance.now();
        let last = t0, pos = 0;
        layers.forEach(a => a && a.play());
        wheels.forEach(a => a && a.play());
        (function f(now) {
          const dt = now - last;
          last = now;
          const t = Math.min((now - t0) / D, 1);
          pos += sp(t) * dt;
          update(Math.min(pos / TOT, 1), sp(t), t, now);
          if (t < 1) {
            driveAnimId = requestAnimationFrame(f);
          } else {
            driveAnimId = null;
            update(1, 0, 1, now);
            layers.forEach(a => a && a.pause());
            wheels.forEach(a => a && a.pause());
            res();
          }
        })(t0);
      });
    }

    function reset() {
      if (driveAnimId) {
        cancelAnimationFrame(driveAnimId);
        driveAnimId = null;
      }
      if (scene) scene.classList.remove('driving', 'received', 'lights', 'braking', 'dooropen', 'hazard-on');
      [truck, courier, cParcel, doorPanel, bubble, house, pin, tbody].forEach(e => {
        if (e) e.getAnimations().forEach(a => a.cancel());
      });
      layers.forEach(a => { if (a) { a.pause(); a.currentTime = 0; a.playbackRate = 1; } });
      wheels.forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
      if (truck) truck.style.transform = `translateX(${TX0}px)`;
      if (house) house.style.transform = 'translateX(380px)';
      if (pin) pin.style.transform = 'translateX(0)';
      if (tbody) tbody.style.transform = '';
      if (courier) {
        courier.style.transform = cpos(24);
        courier.style.opacity = '1';
        courier.classList.remove('walking');
      }
      if (cParcel) {
        cParcel.style.transform = '';
        cParcel.style.opacity = '1';
      }
      if (doorPanel) {
        doorPanel.style.transform = '';
      }
      if (bubble) bubble.style.opacity = '0';
      if (fx) fx.innerHTML = '';
      if (ok) ok.classList.remove('show');
      if (bad) bad.classList.remove('show');
      if (capsule) capsule.style.display = 'block';
    }

    async function deliver(p) {
      if (busy) return;
      busy = true;
      payload = p;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      form.style.display = 'none';
      form.classList.add('is-hidden');
      stage.style.display = 'flex';
      stage.classList.add('is-active');
      stage.setAttribute('aria-hidden', 'false');
      reset();

      if (status) status.textContent = 'COURIER PICKING UP YOUR MESSAGE...';

      // Send to real backend API in parallel
      const sending = postApiJson('/contact', p)
        .then(({ res, data }) => {
          if (res.ok && data.success) {
            return { ok: true, data };
          }
          return { ok: false, error: new Error(data.message || 'Dispatch failed on the mail server.') };
        })
        .catch(err => ({ ok: false, error: err }));

      if (prefersReducedMotion) {
        const r = await sending;
        finish(r);
        return;
      }

      await wait(300);
      await walk(24, 146, 1000); // courier -> side door

      if (status) status.textContent = 'LOADING PARCEL...';
      if (doorPanel) await run(doorPanel, [{ transform: 'translateY(0)' }, { transform: 'translateY(-66px)' }], { duration: 480, easing: 'ease-in-out' });
      if (cParcel) await run(cParcel, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(16px,-66px) scale(.55)', opacity: 1, offset: 0.85 }, { transform: 'translate(18px,-70px) scale(.5)', opacity: 0 }], { duration: 560, easing: 'ease-in' });
      if (doorPanel) await run(doorPanel, [{ transform: 'translateY(-66px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-in-out' });

      await walk(146, 226, 600); // courier -> cab
      if (courier) await run(courier, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });

      if (status) status.textContent = 'ENGINE STARTING...';
      if (scene) scene.classList.add('lights');
      await wait(700);

      if (status) status.textContent = 'IN TRANSIT • DELIVERING MESSAGE';
      if (scene) scene.classList.add('driving');
      await drive(4200);
      if (scene) scene.classList.remove('driving', 'braking');

      if (status) status.textContent = 'ARRIVED • CONFIRMING DELIVERY...';
      const r = await sending;

      if (!r.ok) {
        if (scene) scene.classList.add('hazard-on');
        if (status) status.textContent = 'DELIVERY INTERRUPTED';
        await wait(1300);
        finish(r);
        return;
      }

      // Courier steps out at destination
      const cx0 = TX1 + 150;
      if (cParcel) cParcel.getAnimations().forEach(a => a.cancel());
      if (courier) {
        courier.style.transform = cpos(cx0);
        await run(courier, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      }

      if (status) status.textContent = 'HANDING OVER TO INBOX...';
      await walk(cx0, 552, 900);

      if (scene) scene.classList.add('dooropen');
      await wait(350);

      if (cParcel) await run(cParcel, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(30px,-16px) scale(.5)', opacity: 0 }], { duration: 520, easing: 'ease-in' });
      if (courier) run(courier, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 200 });

      if (scene) scene.classList.add('received');
      sparkle(585, 140);

      if (bubble) run(bubble, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1.12)', offset: 0.6 }, { opacity: 1, transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });

      if (status) status.textContent = 'MESSAGE RECEIVED ✓';
      await wait(1500);
      finish(r);
    }

    function finish(r) {
      if (scene) scene.classList.remove('driving');
      if (capsule) capsule.style.display = 'none';
      if (r.ok) {
        const refId = 'AA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (receipt) receipt.textContent = `Delivery Ref: #${refId} • Received at ${timeStr}`;
        if (ok) ok.classList.add('show');
        showToast('✅ Message delivered successfully!', 3500);
      } else {
        if (errmsg) errmsg.textContent = (r.error && r.error.message) || 'Truck was unable to reach the mail server. Your message is safe — please retry or edit.';
        if (bad) bad.classList.add('show');
        showToast('⚠️ Dispatch failed. Please retry or edit.', 3500);
      }
      busy = false;
    }

    function backToForm(clear) {
      reset();
      stage.classList.remove('is-active');
      stage.style.display = 'none';
      stage.setAttribute('aria-hidden', 'true');
      form.style.display = 'flex';
      form.classList.remove('is-hidden');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
      if (clear) form.reset();
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (busy) return;

      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();
      const inquiryType = document.getElementById('project-type')?.value || 'General Inquiry';

      if (!name || !email || !message) {
        showToast('⚠️ Please fill in all required fields!', 2400);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('⚠️ Please enter a valid email address!', 2400);
        return;
      }

      deliver({ name, email, message, inquiryType });
    });

    if (btnAgain) btnAgain.addEventListener('click', () => backToForm(true));
    if (btnEdit) btnEdit.addEventListener('click', () => backToForm(false));
    if (btnRetry) btnRetry.addEventListener('click', () => {
      if (payload && !busy) deliver(payload);
    });
  }

  /* =========================================
     VanillaTilt — 3D tilt effect
     (tuned down slightly: restrained physical lift
     instead of dramatic 3D tilt, per the glass brief)
     ========================================= */
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    if (prefersReducedMotion || isTouchLike) return;
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 5,
      speed: 520,
      glare: true,
      'max-glare': 0.08,
      perspective: 1300,
      scale: 1.008,
      gyroscope: false
    });
  }
  /* =========================================
     Spotlight + magnetic micro-interactions
     (no cursor-following blob/dot — only a
     bounded highlight inside cards/buttons
     the pointer is already over, per the brief)
     ========================================= */
  function initPremiumInteractions() {
    if (prefersReducedMotion || isTouchLike) return;
    const spotlightItems = document.querySelectorAll(
      '.project-card, .skill-category, .edu-card, .cert-item, .misc-card, .contact-form, .contact-item, .detail-item'
    );
    spotlightItems.forEach(item => {
      let frame = null;
      let lastEvent = null;
      item.addEventListener('pointermove', e => {
        lastEvent = e;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const rect = item.getBoundingClientRect();
          item.style.setProperty('--spot-x', `${lastEvent.clientX - rect.left}px`);
          item.style.setProperty('--spot-y', `${lastEvent.clientY - rect.top}px`);
          frame = null;
        });
      }, { passive: true });
    });

    const magneticItems = document.querySelectorAll('.btn, .btn-nav, .social-link, .social-btn, .skill-chip, .strength-tag');
    magneticItems.forEach(item => {
      let frame = null;
      let lastEvent = null;
      item.addEventListener('pointermove', e => {
        lastEvent = e;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const rect = item.getBoundingClientRect();
          const x = (lastEvent.clientX - rect.left - rect.width / 2) * 0.10;
          const y = (lastEvent.clientY - rect.top - rect.height / 2) * 0.14;
          item.style.transform = `translate(${x}px, ${y}px)`;
          frame = null;
        });
      }, { passive: true });
      item.addEventListener('pointerleave', () => {
        item.style.transform = '';
      });
    });
  }

  /* =========================================
     GSAP ScrollTrigger Animations
     ========================================= */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Hero stats counter animation
    ScrollTrigger.create({
      trigger: '.hero-stats',
      start: 'top 90%',
      once: true,
      onEnter: () => {
        document.querySelectorAll('.stat-number').forEach(el => {
          const target = parseInt(el.textContent);
          const suffix = el.textContent.replace(/[0-9]/g, '');
          let current = 0;
          const step = Math.ceil(target / 24);
          const interval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + suffix;
            if (current >= target) clearInterval(interval);
          }, 50);
        });
      }
    });

    // About sequence
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        const aboutTextWrap = document.querySelector('.about-text');
        const aboutImage = document.querySelector('.about-image');
        const aboutPara = document.querySelector('#about-text-content');

        if (aboutTextWrap) {
          gsap.to(aboutTextWrap, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        }
        if (aboutImage) {
          gsap.to(aboutImage, { x: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: 'power3.out' });
        }

        if (aboutPara) {
          const fullText = aboutPara.textContent.trim();
          aboutPara.textContent = '';
          aboutPara.style.opacity = '1';
          aboutPara.style.height = 'auto';
          aboutPara.style.overflow = 'visible';

          let i = 0;
          const speed = 20;
          setTimeout(() => {
            const t = setInterval(() => {
              aboutPara.textContent += fullText.charAt(i);
              i++;
              if (i >= fullText.length) clearInterval(t);
            }, speed);
          }, 400);
        }
      }
    });

    // Floating social links
    gsap.to('.social-link', {
      y: -6, duration: 1.8, yoyo: true, repeat: -1,
      ease: 'sine.inOut', stagger: 0.3
    });

    // Safety fallback: Ensure hero visual is visible if animation is interrupted
    setTimeout(() => {
      const visual = document.querySelector('.hero-visual-wrapper');
      if (visual && parseFloat(getComputedStyle(visual).opacity) < 0.2) {
        visual.style.opacity = '1';
        visual.style.transform = 'none';
      }
    }, 12000);

    // Services section entrance
    ScrollTrigger.create({
      trigger: '#services',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.fromTo('.service-card', 
          { opacity: 0, y: 35, scale: 0.97 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.15 }
        );
      }
    });

    // Process section line-fill & step reveals
    ScrollTrigger.create({
      trigger: '#process',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        const isMobile = window.innerWidth <= 768;
        const tl = gsap.timeline();
        tl.to('.process-line-fill', isMobile ? { height: '100%', duration: 1.5, ease: 'power1.inOut' } : { width: '100%', duration: 1.5, ease: 'power1.inOut' }, 0)
          .fromTo('.process-step', 
            { opacity: 0, y: 25 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.25 }, 
            0.2
          );
      }
    });

    // Selected Projects entrance choreography
    gsap.utils.toArray('.project-card').forEach((card, idx) => {
      gsap.fromTo(card,
        { opacity: 0, y: 36, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // FAQ section entrance
    gsap.utils.toArray('.faq-item').forEach((item, idx) => {
      gsap.fromTo(item,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          delay: idx * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#faq',
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Education cards & Certifications reveal
    gsap.utils.toArray('.edu-card, .cert-item').forEach((el, idx) => {
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          delay: (idx % 2) * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Contact items reveal
    gsap.utils.toArray('.contact-item').forEach((item, idx) => {
      gsap.fromTo(item,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: idx * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Soft parallax layers
    gsap.to('.liquid-blob', {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    gsap.to('.scroll-indicator', {
      opacity: 0,
      y: 26,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '35% top',
        scrub: true
      }
    });

    // Skills section cards & chips entrance
    gsap.utils.toArray('.skill-category').forEach((card, idx) => {
      gsap.fromTo(card,
        { opacity: 0, y: 32, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          delay: idx * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#skills', start: 'top 85%', toggleActions: 'play none none none' }
        }
      );

      gsap.fromTo(card.querySelectorAll('.skill-chip'),
        { opacity: 0, y: 14, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'back.out(1.5)',
          stagger: 0.05,
          delay: 0.18 + idx * 0.08,
          scrollTrigger: { trigger: '#skills', start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Contact form entrance
    const contactFormEl = document.getElementById('contact-form');
    if (contactFormEl) {
      gsap.fromTo(contactFormEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#contact', start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    }

    // Safety fallback: Ensure critical interaction containers are never stuck at opacity: 0
    setTimeout(() => {
      document.querySelectorAll('.skill-category, .skill-chip, .contact-form, .project-card, .service-card, .edu-card, .faq-item').forEach(el => {
        if (el && parseFloat(getComputedStyle(el).opacity) < 0.2) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 2500);
  }

  /* =========================================
     Hero Entrance Choreography
     ========================================= */
  let heroEntrancePlayed = false;

  function primeHeroElements() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) return;
    gsap.set('.navbar', { opacity: 0, y: -28 });
    gsap.set('.hero-badge', { opacity: 0, y: 18 });
    gsap.set('.hero-title-line', { opacity: 0, y: 60, filter: 'blur(10px)' });
    gsap.set('.hero-subtitle, .hero-description', { opacity: 0, y: 28 });
    gsap.set('.hero-buttons .btn, .hero-stats .stat-item, .hero-stats .stat-divider', { opacity: 0, y: 24 });
    gsap.set('.hero-visual-wrapper', { opacity: 0, y: 32, scale: 0.96 });
    gsap.set('.monolith-code-pane, .monolith-viewport-card', { opacity: 0, y: 16 });
  }

  function playHeroEntrance() {
    if (heroEntrancePlayed) return;
    heroEntrancePlayed = true;

    // Start typewriter effect in perfect sync with hero entrance
    initHeroTyped();

    if (typeof gsap === 'undefined' || prefersReducedMotion) {
      const heroEls = document.querySelectorAll(
        '.navbar, .hero-badge, .hero-visual-wrapper, .hero-title-line, .hero-subtitle, .hero-description, .hero-buttons .btn, .hero-stats .stat-item, .hero-stats .stat-divider, .monolith-code-pane, .monolith-viewport-card'
      );
      heroEls.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
      return;
    }

    const heroTl = gsap.timeline();
    heroTl
      .to('.navbar', { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' })
      .to('.hero-badge', { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.2')
      .to('.hero-title-line', {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.95,
        ease: 'power4.out',
        stagger: 0.12
      }, '-=0.18')
      .to('.hero-subtitle, .hero-description', {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.08
      }, '-=0.45')
      .to('.hero-buttons .btn, .hero-stats .stat-item, .hero-stats .stat-divider', {
        y: 0,
        opacity: 1,
        duration: 0.62,
        ease: 'power3.out',
        stagger: 0.06
      }, '-=0.36')
      .to('.hero-visual-wrapper', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: 'power3.out'
      }, '-=0.4')
      .to('.monolith-code-pane, .monolith-viewport-card', {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.14
      }, '-=0.35');

    if (!prefersReducedMotion) {
      gsap.to('.dev-monolith', { y: -6, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
  }

  /* =========================================
     Interactive FAQ Accordion
     ========================================= */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other accordion items for clean focus
        faqItems.forEach(other => {
          if (other !== item && other.classList.contains('active')) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* =========================================
     DOMContentLoaded — Wire Everything
     ========================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    ensureMobileNavVisible();
    window.addEventListener('resize', ensureMobileNavVisible);
    setTimeout(ensureMobileNavVisible, 500);

    // Safety-net fallback for About section if GSAP doesn't run
    setTimeout(() => {
      const aboutText = document.querySelector('.about-text');
      const aboutImage = document.querySelector('.about-image');
      const aboutContent = document.querySelector('#about-text-content');
      if (aboutText) { aboutText.style.opacity = '1'; aboutText.style.transform = 'none'; }
      if (aboutImage) { aboutImage.style.opacity = '1'; aboutImage.style.transform = 'none'; }
      if (aboutContent) { 
        aboutContent.style.opacity = '1'; 
        aboutContent.style.height = 'auto'; 
        aboutContent.style.overflow = 'visible'; 
      }
    }, 4000);

    initNavbar();
    initSmoothScroll();
    initHeroCanvas();
    initHeroPointerGlow();
    initEducationAnimation();
    initCopyEmail();
    initFaqAccordion();
    initContactForm();

    // VanillaTilt, Motion, GSAP
    requestAnimationFrame(() => {
      initTilt();
      if (typeof initPremiumInteractions === 'function') initPremiumInteractions();
      initMotionAnimations();
      initGSAP();

      // Prime Hero elements to their hidden entrance state while welcome overlay covers page
      primeHeroElements();

      // Trigger Welcome Intro, seamlessly transitioning into Hero entrance exactly once
      initWelcomeIntro(() => {
        playHeroEntrance();
      });
    });
  });

})();