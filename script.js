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
    return [primary];
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
     Preloader
     ========================================= */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloader-fill');
    const text = document.getElementById('preloader-text');
    if (!preloader) return;

    const messages = ['Initializing portfolio...', 'Loading motion system...', 'Preparing visuals...', 'Ready'];
    let progress = 0;
    let msgIndex = 0;
    const timer = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18 + 9, 100);
      if (fill) fill.style.width = progress + '%';
      if (text && msgIndex < messages.length - 1 && progress >= (msgIndex + 1) * 25) {
        msgIndex++;
        text.textContent = messages[msgIndex];
      }
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          preloader.classList.add('done');
        }, 360);
      }
    }, 95);
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

    // Fade up animations
    inView(".section-label, .section-title, .project-card, .skill-category, .misc-card, .faq-item", (info) => {
      animate(info.target, { opacity: [0, 1], y: [40, 0] }, { ...springConfig, delay: 0.1 });
    });

    // Fade right animations
    inView(".about-image, .edu-card, .contact-info", (info) => {
      animate(info.target, { opacity: [0, 1], x: [-40, 0] }, { ...springConfig, delay: 0.1 });
    });

    // Fade left animations
    inView(".about-text, .contact-form", (info) => {
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

      // Background gradient — soft blue-white liquid light (tuned for glass bg)
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.3, 0,
        canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.7
      );
      grad.addColorStop(0, 'rgba(160,195,255,0.035)');
      grad.addColorStop(0.5, 'rgba(120,160,255,0.02)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      const t = Date.now() * 0.001;
      stars.forEach(s => {
        const op = s.op + Math.sin(t * s.ts * 60) * 0.12;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.1, Math.min(0.9, op))})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const grd = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len * (ss.vx / 8), ss.y - ss.len * (ss.vy / 8));
        grd.addColorStop(0, `rgba(168,199,255,${ss.op})`);
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
  function initHeroTyped() {
    const typedText = document.getElementById('typed-text');
    if (!typedText) return;
    typedText.textContent = '';
    const texts = ['Full Stack Developer', 'Quick Learner', 'Problem Solver', 'UI Enthusiast'];
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
    setTimeout(tick, 1200);
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
     Contact Form
     ========================================= */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.querySelector('span')?.textContent || btn.textContent;

      if (!name || !email || !message) { showToast('⚠️ Please fill all fields!', 2200); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠️ Enter a valid email!', 2200); return; }

      try {
        btn.disabled = true;
        if (btn.querySelector('span')) btn.querySelector('span').textContent = 'Sending... (may take up to 60s)';
        else btn.textContent = 'Sending... (may take up to 60s)';

        const { res, data } = await postApiJson('/contact', { name, email, message });
        if (res.ok && data.success) {
          showToast('✅ Message sent successfully!', 2500);
          form.reset();
        } else {
          showToast('❌ Failed: ' + (data.message || 'Unknown error'), 2500);
        }
      } catch {
        showToast('⚠️ Server error. Try again later.', 2500);
      } finally {
        btn.disabled = false;
        if (btn.querySelector('span')) btn.querySelector('span').textContent = originalText;
        else btn.textContent = originalText;
      }
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

    // Cinematic hero entrance
    const heroTl = gsap.timeline({ delay: 0.65 });
    heroTl
      .fromTo('.navbar', { y: -28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' })
      .fromTo('.hero-badge', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.2')
      .fromTo('.hero-title-line', { y: 60, opacity: 0, filter: 'blur(10px)' }, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.95,
        ease: 'power4.out',
        stagger: 0.12
      }, '-=0.18')
      .fromTo('.hero-subtitle, .hero-description', { y: 28, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.08
      }, '-=0.45')
      .fromTo('.hero-buttons .btn, .hero-stats .stat-item, .hero-stats .stat-divider', { y: 24, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.62,
        ease: 'power3.out',
        stagger: 0.06
      }, '-=0.36')
      .fromTo('.hero-visual-wrapper', { opacity: 0, y: 30, scale: 0.96 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out'
      }, '-=0.4')
      .fromTo('.hero-float-element', { opacity: 0, y: 15 }, {
        opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.1
      }, '-=0.3');

    if (!prefersReducedMotion) {
      gsap.to('.hero-visual-wrapper', { y: -10, rotation: 0.5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.float-1', { y: -8, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 });
      gsap.to('.float-2', { y: -5, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });
      gsap.to('.float-3', { y: -10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.1 });
      gsap.to('.float-4', { y: -6, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.3 });
    }

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

    // Skill chip stagger inside each category
    gsap.utils.toArray('.skill-category').forEach(card => {
      gsap.fromTo(card.querySelectorAll('.skill-chip'),
        { opacity: 0, y: 16, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.46,
          ease: 'back.out(1.7)',
          stagger: 0.055,
          scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none none' }
        }
      );
    });
  }

  /* =========================================
     DOMContentLoaded — Wire Everything
     ========================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
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
    initHeroTyped();
    initEducationAnimation();
    initCopyEmail();
    initContactForm();

    // VanillaTilt, Motion, GSAP
    requestAnimationFrame(() => {
      initTilt();
      if (typeof initPremiumInteractions === 'function') initPremiumInteractions();
      initMotionAnimations();
      initGSAP();
    });
  });

})();