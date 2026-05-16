/* ==========================================
   PREMIUM 2026 PORTFOLIO — script.js
   All original functionality preserved +
   upgraded with VanillaTilt, GSAP
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
  }

  /* =========================================
     Utility: Toast
     ========================================= */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toast-message');
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
     AOS
     ========================================= */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    const revealMap = [
      ['.section-label', 'fade-right'],
      ['.section-title', 'fade-up'],
      ['.about-image', 'fade-right'],
      ['.about-text', 'fade-left'],
      ['.project-card', 'fade-up'],
      ['.skill-category', 'zoom-in-up'],
      ['.edu-card', 'fade-right'],
      ['.cert-item', 'fade-up'],
      ['.strength-tag', 'zoom-in'],
      ['.misc-card', 'fade-up'],
      ['.contact-info', 'fade-right'],
      ['.contact-form', 'fade-left'],
      ['.footer-content', 'fade-up']
    ];
    revealMap.forEach(([selector, animation]) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        if (!el.hasAttribute('data-aos')) el.setAttribute('data-aos', animation);
        if (!el.hasAttribute('data-aos-delay')) el.setAttribute('data-aos-delay', String(Math.min((index % 6) * 70, 350)));
      });
    });
    AOS.init({
      duration: 760,
      easing: 'ease-out-cubic',
      offset: 70,
      once: true
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

      // Background gradient
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.3, 0,
        canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.7
      );
      grad.addColorStop(0, 'rgba(232,255,71,0.03)');
      grad.addColorStop(0.5, 'rgba(0,229,255,0.02)');
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
        grd.addColorStop(0, `rgba(232,255,71,${ss.op})`);
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

    // Mobile toggle
    if (navToggle && navMenu) {
      const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active', isOpen);
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
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    function updateOnScroll() {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        const goingDown = window.scrollY > lastScrollY && window.scrollY > 420;
        navbar.classList.toggle('nav-hidden', goingDown);
        lastScrollY = window.scrollY;
      }

      let current = '';
      sections.forEach(sec => {
        if (window.pageYOffset >= sec.offsetTop - 200) current = sec.id;
      });
      navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').replace('#', '');
        link.classList.toggle('active', href === current);
      });

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
    const apiUrl = 'https://portfolio-website-pa8z.onrender.com/api/contact';

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
        if (btn.querySelector('span')) btn.querySelector('span').textContent = 'Sending...';
        else btn.textContent = 'Sending...';

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
        const data = await res.json();
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
     ========================================= */
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    if (prefersReducedMotion || isTouchLike) return;
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 7,
      speed: 520,
      glare: true,
      'max-glare': 0.1,
      perspective: 1100,
      scale: 1.01,
      gyroscope: false
    });
  }

  /* =========================================
     Spotlight + magnetic micro-interactions
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
          const x = (lastEvent.clientX - rect.left - rect.width / 2) * 0.12;
          const y = (lastEvent.clientY - rect.top - rect.height / 2) * 0.18;
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

    // Generic fade-up for section labels & titles
    gsap.utils.toArray('.section-label').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    gsap.utils.toArray('.section-title').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Projects grid animation
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    // Skills
    gsap.utils.toArray('.skill-category').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    // Certs
    gsap.utils.toArray('.cert-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, delay: i * 0.07, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' }
        }
      );
    });

    // Strength tags
    gsap.utils.toArray('.strength-tag').forEach((tag, i) => {
      gsap.fromTo(tag,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.5, delay: i * 0.06, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: tag, start: 'top 92%', toggleActions: 'play none none none' }
        }
      );
    });

    // Misc cards
    gsap.utils.toArray('.misc-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    // Contact reveal: matched to the PRACTICE contact feel.
    const contactTl = gsap.timeline({
      scrollTrigger: { trigger: '#contact', start: 'top 78%', toggleActions: 'play none none none' }
    });
    contactTl
      .fromTo('.contact-info',
        { opacity: 0, x: -54 },
        { opacity: 1, x: 0, duration: 0.82, ease: 'power3.out' }
      )
      .fromTo('.contact-form',
        { opacity: 0, x: 54 },
        { opacity: 1, x: 0, duration: 0.82, ease: 'power3.out' },
        '-=0.66'
      )
      .fromTo('.contact-item',
        { opacity: 0, y: 18, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)', stagger: 0.08 },
        '-=0.36'
      )
      .fromTo('.contact-social .social-btn',
        { opacity: 0, y: 14, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)', stagger: 0.06 },
        '-=0.26'
      )
      .fromTo('.contact-form .form-group, .contact-form .btn-full',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.48, ease: 'power3.out', stagger: 0.07 },
        '-=0.42'
      );

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
      .fromTo('.hero-title-line', { y: 88, opacity: 0, rotateX: -12 }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.09
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
      }, '-=0.36');

    // Soft parallax layers
    gsap.to('.hero-grid-overlay', {
      yPercent: 12,
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

    initNavbar();
    initSmoothScroll();
    initHeroCanvas();
    initHeroPointerGlow();
    initHeroTyped();
    initEducationAnimation();
    initCopyEmail();
    initContactForm();

    // VanillaTilt & GSAP after brief layout settle
    requestAnimationFrame(() => {
      initTilt();
      initPremiumInteractions();
      // AOS CSS is kept for compatibility, but GSAP handles reveals.
      // Running both AOS and ScrollTrigger together made wheel scrolling feel heavy.
      initGSAP();
    });
  });

})();
