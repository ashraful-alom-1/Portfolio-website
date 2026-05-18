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
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
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
     AI Portfolio Assistant
     ========================================= */
  function initAIAssistant() {
    const assistant = document.getElementById('ai-assistant');
    const toggle = document.getElementById('ai-chat-toggle');
    const panel = document.getElementById('ai-chat-panel');
    const closeBtn = document.getElementById('ai-close-chat');
    const clearBtn = document.getElementById('ai-clear-chat');
    const resumeBtn = document.getElementById('ai-resume-btn');
    const form = document.getElementById('ai-input-form');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const messagesEl = document.getElementById('ai-messages');
    const suggestions = document.getElementById('ai-suggestions');
    const statusText = document.getElementById('ai-status-text');
    const leadForm = document.getElementById('ai-lead-form');
    const cancelLeadBtn = document.getElementById('ai-cancel-lead');
    const voiceBtn = document.getElementById('ai-voice-btn');

    if (!assistant || !toggle || !panel || !form || !input || !messagesEl) return;

    const assistantApiUrl = `${getApiBaseUrl()}/assistant`;
    const storageKey = 'ashraful-ai-assistant-history-v2';
    const greeting = "Hi! I'm Ashraful Alom. Ask me about my skills, projects, education, or why I'd be a great fit for your team.";
    const localKnowledge = {
      person:
        'I am Ashraful Alom, a Full Stack Developer and B.Tech CSE student from Palwal, Haryana, India.',
      education:
        'I am pursuing B.Tech CSE at J.C. Bose University (YMCA), Faridabad from 2022-2026. I completed Higher Secondary (12th) from Lengtisinga H.S. School in Science stream in 2022 and HSLC (10th) from Dr. B.R. Ambedkar High School in 2020.',
      skills: {
        technical: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'C', 'C++', 'Git', 'GitHub', 'MS Excel'],
        soft: ['Quick Learner', 'Problem Solver', 'Good Listener', 'Adaptability', 'Time Management', 'Self-Motivated', 'Teamwork']
      },
      experience: ['3+ years of learning experience', 'Fresher actively seeking first professional role', 'No prior company employment'],
      projects: [
        {
          name: 'Abhayapuri Care Hospital',
          type: 'Hospital management system',
          tech: 'Next.js, Tailwind CSS, Framer Motion',
          summary: 'Hospital management system.'
        },
        {
          name: 'Ecommerce Website',
          type: 'Responsive ecommerce project',
          tech: 'Vanilla JavaScript',
          summary: 'Shopping cart, product listing, and responsive design.'
        },
        {
          name: 'E-Learning Platform',
          type: 'Responsive e-learning project',
          tech: 'Responsive design',
          summary: 'Course layout and user-focused UI.'
        },
        {
          name: 'Car Showroom Website',
          type: 'Responsive car showroom project',
          tech: 'Responsive design',
          summary: 'Automotive design and smooth animations.'
        },
        {
          name: 'Justice Desk',
          type: 'Multi-page legal service website',
          tech: 'HTML, CSS, JavaScript',
          summary: 'Multi-page legal service website.'
        },
        {
          name: 'Travel Website',
          type: 'Responsive travel website',
          tech: 'Responsive design',
          summary: 'Destination showcase and interactive UI.'
        },
        {
          name: 'Interactive Calculator',
          type: 'Calculator project',
          tech: 'JavaScript',
          summary: 'Real-time calculations and keyboard input support.'
        },
        {
          name: 'Basic Login Page',
          type: 'Authentication UI design',
          tech: 'HTML, CSS, JavaScript',
          summary: 'Form validation and authentication UI design.'
        },
        {
          name: 'C Language Programs',
          type: 'C programming collection',
          tech: 'C',
          summary: 'Fundamental concepts and logic building collection.'
        }
      ],
      links: {
        github: 'https://github.com/ashraful-alom-1',
        linkedin: 'https://www.linkedin.com/in/ashraful-alom-612a05268',
        email: 'ashraful.abh@gmail.com'
      },
      location: 'Palwal, Haryana, India',
      languages: [
        'Assamese: Native. I can read, write, and speak Assamese.',
        'Bengali: Fluent. I can read, write, and speak Bengali.',
        'Hindi: Fluent. I can read, write, and speak Hindi.',
        'English: Elementary. I can read, write, and speak English, but not fluently.'
      ],
      hobbies: ['Photography', 'Travel', 'Football'],
      certifications: ['KG Coding: HTML, CSS, Complete Coding', 'NPTEL: Business Ethics - IIT Kharagpur', 'NPTEL: Air Pollution - IIT Roorkee', 'NPTEL: IoT - IIT Kharagpur', 'NPTEL: Cloud Computing - IIT Kharagpur'],
      awards: ['Mini Soccer - From DCTM'],
      fallback: "I don't have that specific information on my portfolio. Please contact me at ashraful.abh@gmail.com"
    };

    let messages = loadMessages();
    let isSending = false;
    let typingEl = null;

    function setStatus(text) {
      if (statusText) statusText.textContent = text;
    }

    function escapeHtml(value = '') {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function inlineMarkdown(text) {
      return escapeHtml(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    function renderMarkdown(text = '') {
      const lines = String(text).split(/\n+/);
      let html = '';
      let inList = false;

      lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line) return;
        const bullet = line.match(/^[-*]\s+(.+)/);
        const numbered = line.match(/^\d+\.\s+(.+)/);

        if (bullet || numbered) {
          if (!inList) {
            html += '<ul>';
            inList = true;
          }
          html += `<li>${inlineMarkdown((bullet || numbered)[1])}</li>`;
          return;
        }

        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<p>${inlineMarkdown(line)}</p>`;
      });

      if (inList) html += '</ul>';
      return html || '<p>I am ready to help.</p>';
    }

    function loadMessages() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (Array.isArray(saved) && saved.length) return saved.slice(-24);
      } catch {
        localStorage.removeItem(storageKey);
      }
      return [{ role: 'assistant', content: greeting, time: Date.now() }];
    }

    function saveMessages() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-24)));
      } catch {
        // Private browsing can block storage; the current chat still works.
      }
    }

    function scrollToBottom() {
      requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }

    function appendMessage(message, shouldSave = true) {
      const item = document.createElement('div');
      item.className = `ai-message ai-message-${message.role}`;
      item.innerHTML = renderMarkdown(message.content);
      messagesEl.appendChild(item);
      scrollToBottom();

      if (shouldSave) {
        messages.push({ role: message.role, content: message.content, time: Date.now() });
        saveMessages();
      }
    }

    function renderHistory() {
      messagesEl.innerHTML = '';
      messages.forEach(message => appendMessage(message, false));
    }

    function showTyping() {
      removeTyping();
      typingEl = document.createElement('div');
      typingEl.className = 'ai-message ai-message-assistant';
      typingEl.innerHTML = '<span class="ai-typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>';
      messagesEl.appendChild(typingEl);
      scrollToBottom();
    }

    function removeTyping() {
      if (typingEl) typingEl.remove();
      typingEl = null;
    }

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close AI portfolio assistant' : 'Open AI portfolio assistant');
      if (open) setTimeout(() => input.focus(), 180);
    }

    function resizeInput() {
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
    }

    function detectsLeadIntent(text) {
      return /\b(hire|hiring|internship|job|interview|freelance|collaborat|available|opportunity|schedule|contact|work with|recruiter|remote)\b/i.test(text);
    }

    function isHinglish(value) {
      return /\b(tum|tumhara|tera|aap|kaun|kya|kaise|kahan|kis|mein|hai|ho|karte|batao|padhai|naam|kyun|kitna|kaunsa|accha|pura|kiska)\b/i.test(value);
    }

    function hasUnsupportedRequest(value) {
      return /\b(meaning|mean|matlab|pronounce|nickname|cgpa|gpa|marks|percentage|rank|jee|semester|sem|backlog|attendance|fee|quota|aicte|ranking|age|phone|number|salary|ctc|stipend|family|born|birth|database|mongodb|sql|nosql|firebase|node|express|redux|figma|bootstrap|docker|devops|ci\/cd|jest|graphql|api|rest api|payment|stripe|razorpay|hipaa|medical records|admin panel|dashboard|patient login|user registration|localstorage|wishlist|filter|coupon|review|rating|video|walkthrough|days|timeline|alone|contribution|state management|pages|count|mentor|guru|blogs|channels|hackathon|competition|open source|twitter|youtube|favorite|food|movie|music|weather|lunch|coffee)\b/i.test(value);
    }

    function normalizeQuery(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^\w\s.+#-]/g, ' ')
        .replace(/\b(his|her|their|your|you|he|him|ashraful|alom|please|tell|me|about|what|is|are|do|does|can|could|would|the|a|an)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function hasAnyQuery(text, words) {
      const raw = String(text || '').toLowerCase();
      const normalized = normalizeQuery(raw);
      return words.some(word => {
        const rawWord = String(word).toLowerCase();
        if (rawWord.length <= 3) {
          return new RegExp(`\\b${rawWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(raw);
        }
        const normalizedWord = normalizeQuery(rawWord);
        if (rawWord.includes(' ') && normalizedWord.split(/\s+/).length < 2) {
          return raw.includes(rawWord);
        }
        const exactWord = new RegExp(`\\b${rawWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(raw);
        return exactWord || Boolean(normalizedWord && normalized.includes(normalizedWord));
      });
    }

function localAssistantReply(prompt) {
  const q = String(prompt || '').trim();
  const Q = q.toLowerCase();
  const normalizedQ = normalizeQuery(q);
  const H = isHinglish(q);
  const projList = localKnowledge.projects.map(p => `- **${p.name}** (${p.type}): ${p.summary} Tech: ${p.tech}`).join('\n');
  const eduList = `- B.Tech CSE: J.C. Bose University (YMCA), Faridabad (2022-2026, currently pursuing)\n- Higher Secondary (12th), Science stream: Lengtisinga H.S. School (2022)\n- HSLC (10th): Dr. B.R. Ambedkar High School (2020)`;
  const certList = localKnowledge.certifications.map(c => `- ${c}`).join('\n');
  const langList = localKnowledge.languages.map(l => `- ${l}`).join('\n');
  const softList = localKnowledge.skills.soft.join(', ');
  const techList = localKnowledge.skills.technical.join(', ');
  const expList = localKnowledge.experience.map(e => `- ${e}`).join('\n');
  const FB = localKnowledge.fallback;
  const loc = localKnowledge.location;
  const email = localKnowledge.links.email;
  const linkedin = localKnowledge.links.linkedin;
  const github = localKnowledge.links.github;

  // ============ GREETINGS (EXACT & VARIATIONS) ============
  if (Q === 'hi' || Q === 'hello' || Q === 'hey' || Q === 'hii' || Q === 'heyy' || Q === 'hiii' || Q === 'heya' || Q === 'howdy' || Q === 'yo' || Q === 'wassup' || Q === 'sup' || Q === 'wassup dude?' || Q === 'wassup dude' || Q === 'what\'s good' || Q === 'whats good' || Q === 'good morning' || Q === 'good evening' || Q === 'good afternoon' || Q === 'namaste' || Q === 'namaskar' || /^(hi|hello|hey|hii|heyy|hiii|heya|howdy|yo|sup|wassup)\b/i.test(Q))
    return H ? 'Hi! Main Ashraful Alom hoon. Mere portfolio ke baare mein poocho — skills, projects, education, ya contact.' : "Hi! I'm Ashraful Alom. Ask me about my skills, projects, education, or why I'd be a great fit for your team.";

  if (Q === 'how are you?' || Q === 'how are you' || Q === 'how r u' || Q === 'how you doing' || Q === 'how\'s it going' || Q === 'how is your day going?' || Q === 'how is your day going' || Q === 'what\'s up?' || Q === 'whats up' || Q === 'what\'s new?' || Q === 'whats new' || Q === 'kaise ho?' || Q === 'kaise ho' || Q === 'kya haal hai' || Q === 'sab theek')
    return H ? 'Main theek hoon! Aap batao — mere portfolio ke baare mein kya jaanna chahte ho?' : "I'm doing great! What would you like to know about my portfolio?";

  if (Q === 'long time!' || Q === 'long time' || Q === 'missed you!' || Q === 'missed you' || Q === 'nice to meet you.' || Q === 'nice to meet you')
    return H ? 'Haan! Kya jaanna chahte ho mere baare mein?' : 'Nice to meet you too! What would you like to know about me?';

  // ============ GOODBYE (flexible) ============
if (hasAnyQuery(Q, ['bye', 'byee', 'goodbye', 'see you', 'cya', 'see ya', 'tata', 'take care', 'farewell', 'alvida', 'phir milenge', 'ok bye', 'ok bye!', 'bye bye', 'byy', 'tata bye bye', 'okay bye', 'alright bye', 'bye for now', 'see you again', 'see you later','have a nice day','good night', 'talk to you later', 'talk you later', 'catch you later', 'see you soon', 'talk soon'])) {
    return H ? 'Bye! Agar aur koi sawaal ho toh pooch lena. Contact: ashraful.abh@gmail.com' : 'Bye! Feel free to ask more questions anytime. Contact: ashraful.abh@gmail.com';
}

  // ============ THANKS ============
  if (Q === 'thank you' || Q === 'thanks' || Q === 'thx' || Q === 'ty' || Q === 'thanks for your help.' || Q === 'thanks for your help' || Q === 'thankx' || Q === 'dhanyawad' || Q === 'shukriya' || Q === 'thank u')
    return H ? 'Koi baat nahi! Aur kuch poochna ho toh batao.' : "You're welcome! Ask me anything else about my portfolio.";

  // ============ HELP / WHAT CAN YOU DO ============
  if (Q === 'can you help me?' || Q === 'can you help me' || Q === 'what can you do?' || Q === 'what can you do' || Q === 'what questions can i ask?' || Q === 'what questions can i ask' || Q === 'what can the chatbot help with?' || Q === 'what can the chatbot help with')
    return H ? 'Main Ashraful ke baare mein yeh sab bata sakta hoon: name, profession, location, education, skills, projects, certifications, languages, hobbies, experience, strengths, weaknesses, aur contact info. Poocho kya jaanna hai!' : 'I can answer questions about: name, profession, location, education, skills, projects, certifications, languages, hobbies, experience, strengths, weaknesses, and contact info. What would you like to know?';

  // ============ IDENTITY / NAME (EXACT MATCHES) ============
  if (Q === 'what is your name?' || Q === 'what is your name' || Q === 'what\'s your name?' || Q === 'whats your name' || Q === 'your name?' || Q === 'your name' || Q === 'who are you?' || Q === 'who are you' || Q === 'who exactly is ashraful alom?' || Q === 'who exactly is ashraful alom' || Q === 'who is ashraful alom?' || Q === 'who is ashraful alom' || Q === 'tell me about yourself.' || Q === 'tell me about yourself' || Q === 'can you introduce yourself?' || Q === 'can you introduce yourself' || Q === 'introduce yourself' || Q === 'what\'s your identity?' || Q === 'whats your identity' || Q === 'who am i speaking with?' || Q === 'who am i speaking with' || Q === 'who are you exactly?' || Q === 'who are you exactly' || Q === 'who do i have the pleasure of speaking with?' || Q === 'who do i have the pleasure of speaking with' || Q === 'tell me your name and what you do.' || Q === 'tell me your name and what you do' || Q === 'what\'s your full name?' || Q === 'whats your full name' || Q === 'what is your full name' || Q === 'is your name ashraful alom?' || Q === 'is your name ashraful alom' || Q === 'are you ashraful?' || Q === 'are you ashraful' || Q === 'is ashraful your first name?' || Q === 'is ashraful your first name')
    return H ? `Main Ashraful Alom hoon, ek **Full Stack Developer | B.Tech CSE Student**. Main ${loc} se hoon.` : `I'm Ashraful Alom, a **Full Stack Developer | B.Tech CSE Student** from ${loc}.`;

  if (Q === 'so you\'re ashraful, right?' || Q === 'so you are ashraful right' || Q === 'am i talking to ashraful directly?' || Q === 'am i talking to ashraful directly' || Q === 'are you the real ashraful or a bot?' || Q === 'are you the real ashraful or a bot')
    return H ? 'Haan, main Ashraful Alom hoon! Mere portfolio ke baare mein poocho.' : 'Yes, I am Ashraful Alom! Ask me about my portfolio.';

  if (Q === 'what does ashraful mean?' || Q === 'what does ashraful mean' || Q === 'how do you pronounce your name?' || Q === 'how do you pronounce your name' || Q === 'what should i call you?' || Q === 'what should i call you' || Q === 'should i call you ash or ashraful?' || Q === 'should i call you ash or ashraful' || Q === 'do you have a nickname?' || Q === 'do you have a nickname')
    return FB;

  // ============ PORTFOLIO OWNERSHIP ============
  if (Q === 'is this ashraful\'s portfolio?' || Q === 'is this ashrafuls portfolio' || Q === 'who owns this website?' || Q === 'who owns this website' || Q === 'who is behind this portfolio?' || Q === 'who is behind this portfolio' || Q === 'who created this site?' || Q === 'who created this site' || Q === 'whose portfolio is this?' || Q === 'whose portfolio is this' || Q === 'what is this website?' || Q === 'what is this website' || Q === 'is this your portfolio?' || Q === 'is this your portfolio')
    return H ? 'Yeh Ashraful Alom ka portfolio website hai. Main khud Ashraful hoon — poocho kya jaanna hai!' : 'This is Ashraful Alom\'s portfolio website. I am Ashraful — ask me anything!';

  // ============ PROFESSION ============
  if (Q === 'what do you do?' || Q === 'what do you do' || Q === 'what is your profession?' || Q === 'what is your profession' || Q === 'what\'s your profession?' || Q === 'whats your profession' || Q === 'what is your job title?' || Q === 'what is your job title' || Q === 'what\'s your job title?' || Q === 'whats your job title' || Q === 'what is your occupation?' || Q === 'what is your occupation' || Q === 'what\'s your occupation?' || Q === 'whats your occupation' || Q === 'what is your designation?' || Q === 'what is your designation' || Q === 'what is your current role?' || Q === 'what is your current role' || Q === 'what do you do professionally?' || Q === 'what do you do professionally' || Q === 'what\'s your line of work?' || Q === 'whats your line of work' || Q === 'what kind of work are you into?' || Q === 'what kind of work are you into' || Q === 'what\'s your area of work?' || Q === 'whats your area of work' || Q === 'what\'s your craft?' || Q === 'whats your craft' || Q === 'what\'s your trade?' || Q === 'whats your trade' || Q === 'so what exactly do you do for a living?' || Q === 'so what exactly do you do for a living')
    return H ? `Main ek **Full Stack Developer | B.Tech CSE Student** hoon. ${loc} se hoon.` : `I'm a **Full Stack Developer | B.Tech CSE Student** from ${loc}.`;

  if (Q === 'are you a developer?' || Q === 'are you a developer' || Q === 'are you a programmer?' || Q === 'are you a programmer' || Q === 'do you code for a living?' || Q === 'do you code for a living' || Q === 'are you a developer by profession?' || Q === 'are you a developer by profession' || Q === 'are you into tech?' || Q === 'are you into tech')
    return H ? 'Haan, main ek Full Stack Developer hoon!' : 'Yes, I am a Full Stack Developer!';

  if (Q === 'are you a full stack developer?' || Q === 'are you a full stack developer' || Q === 'are you a web developer?' || Q === 'are you a web developer' || Q === 'are you a frontend developer?' || Q === 'are you a frontend developer' || Q === 'are you a backend developer?' || Q === 'are you a backend developer' || Q === 'are you a software engineer?' || Q === 'are you a software engineer')
    return H ? 'Haan, main Full Stack Developer hoon — frontend aur backend dono kaam karta hoon.' : 'Yes, I am a Full Stack Developer — I work on both frontend and backend.';

  if (Q === 'are you a student?' || Q === 'are you a student' || Q === 'do you work somewhere or study?' || Q === 'do you work somewhere or study' || Q === 'are you employed or a student?' || Q === 'are you employed or a student' || Q === 'are you currently a student?' || Q === 'are you currently a student')
    return H ? 'Haan, main B.Tech CSE ka student hoon YMCA Faridabad mein (2022-2026). Saath hi Full Stack Developer bhi hoon.' : 'Yes, I am a B.Tech CSE student at YMCA Faridabad (2022-2026). I am also a Full Stack Developer.';

  if (Q === 'are you a freelancer?' || Q === 'are you a freelancer' || Q === 'do you work full-time?' || Q === 'do you work full-time')
    return H ? 'Main ek fresher hoon, first professional role actively seek kar raha hoon. Freelance projects ke liye bhi open hoon.' : 'I am a fresher actively seeking my first professional role. I am also open to freelance projects.';

  if (Q === 'how would you describe yourself in one sentence?' || Q === 'how would you describe yourself in one sentence' || Q === 'sum yourself up in a line.' || Q === 'sum yourself up in a line' || Q === 'what\'s your elevator pitch?' || Q === 'whats your elevator pitch')
    return H ? `Main ek Full Stack Developer aur B.Tech CSE student hoon — Quick Learner, Problem Solver, aur 9+ projects ke saath fresher actively seeking first role.` : `I am a Full Stack Developer and B.Tech CSE student — a Quick Learner and Problem Solver with 9+ projects, actively seeking my first professional role.`;

  if (Q === 'what kind of engineer are you?' || Q === 'what kind of engineer are you' || Q === 'what is your engineering discipline?' || Q === 'what is your engineering discipline' || Q === 'what is your field of engineering?' || Q === 'what is your field of engineering')
    return 'I am pursuing Computer Science & Engineering (CSE).';

  if (Q === 'so you build websites?' || Q === 'so you build websites' || Q === 'you make websites, right?' || Q === 'you make websites right')
    return H ? 'Haan, main websites banata hoon! 9 projects hain mere portfolio mein.' : 'Yes, I build websites! I have 9 projects in my portfolio.';

  if (Q === 'do you develop apps as well?' || Q === 'do you develop apps as well')
    return 'I primarily build web applications. Check my portfolio for all my projects!';

  if (Q === 'what is your current occupation?' || Q === 'what is your current occupation' || Q === 'what keeps you busy these days?' || Q === 'what keeps you busy these days' || Q === 'what\'s your day job?' || Q === 'whats your day job' || Q === 'what do you do on a daily basis?' || Q === 'what do you do on a daily basis')
    return H ? 'Main B.Tech CSE pursue kar raha hoon aur actively first professional role seek kar raha hoon. Saath mein projects aur skills improve kar raha hoon.' : 'I am pursuing B.Tech CSE and actively seeking my first professional role while improving my skills through projects.';

  // ============ PROFESSIONAL IDENTITY ============
  if (Q === 'what\'s your professional identity?' || Q === 'whats your professional identity' || Q === 'how do you introduce yourself professionally?' || Q === 'how do you introduce yourself professionally' || Q === 'what does your business card say?' || Q === 'what does your business card say' || Q === 'what\'s your professional headline?' || Q === 'whats your professional headline' || Q === 'what\'s your tagline?' || Q === 'whats your tagline' || Q === 'how would you brand yourself?' || Q === 'how would you brand yourself')
    return 'Ashraful Alom — Full Stack Developer | B.Tech CSE Student | Quick Learner | Problem Solver';

  if (Q === 'if someone asks what you do, what do you say?' || Q === 'if someone asks what you do what do you say')
    return H ? 'Main kehta hoon — "Main ek Full Stack Developer hoon, B.Tech CSE student, aur 9 projects build kar chuka hoon."' : 'I say — "I\'m a Full Stack Developer, B.Tech CSE student, and I\'ve built 9 projects."';

  if (Q === 'are you a developer, designer, or both?' || Q === 'are you a developer designer or both' || Q === 'are you a generalist or specialist?' || Q === 'are you a generalist or specialist')
    return 'I am primarily a developer (Full Stack). I also focus on responsive UI design in my projects.';

  if (Q === 'do you do full-stack or just frontend?' || Q === 'do you do full-stack or just frontend' || Q === 'are you a front-end specialist?' || Q === 'are you a front end specialist')
    return 'I do Full Stack development. I have experience with both frontend (React, Next.js, Tailwind CSS) and fundamentals in C and C++.';

  if (Q === 'what\'s your niche?' || Q === 'whats your niche' || Q === 'what do you want to be known for?' || Q === 'what do you want to be known for')
    return 'I want to be known for building clean, responsive, and user-focused web applications as a Full Stack Developer.';

  // ============ LOCATION (EXACT MATCHES) ============
  if (Q === 'where are you from?' || Q === 'where are you from' || Q === 'where are you located?' || Q === 'where are you located' || Q === 'what is your location?' || Q === 'what is your location' || Q === 'where do you live?' || Q === 'where do you live' || Q === 'what city are you in?' || Q === 'what city are you in' || Q === 'what is your city?' || Q === 'what is your city' || Q === 'where is home for you?' || Q === 'where is home for you' || Q === 'what place do you call home?' || Q === 'what place do you call home' || Q === 'what\'s your native place?' || Q === 'whats your native place' || Q === 'where do you put up?' || Q === 'where do you put up' || Q === 'where are you residing currently?' || Q === 'where are you residing currently' || Q === 'what\'s your current base?' || Q === 'whats your current base' || Q === 'what is your hometown?' || Q === 'what is your hometown' || Q === 'what is your base location?' || Q === 'what is your base location' || Q === 'where do you reside?' || Q === 'where do you reside' || Q === 'what is your current city?' || Q === 'what is your current city' || Q === 'your roots are from where?' || Q === 'your roots are from where')
    return H ? `Main **${loc}** se hoon.` : `I am from **${loc}**.`;

  if (Q === 'are you from india?' || Q === 'are you from india' || Q === 'are you indian?' || Q === 'are you indian' || Q === 'what is your nationality?' || Q === 'what is your nationality' || Q === 'what is your country?' || Q === 'what is your country' || Q === 'you\'re indian, right?' || Q === 'youre indian right')
    return 'Yes, I am Indian. I live in Palwal, Haryana.';

  if (Q === 'which state are you from?' || Q === 'which state are you from' || Q === 'state you belong to?' || Q === 'state you belong to' || Q === 'what region are you from?' || Q === 'what region are you from' || Q === 'which part of india are you from?' || Q === 'which part of india are you from')
    return 'I am from Haryana, India.';

  if (Q === 'are you from haryana?' || Q === 'are you from haryana' || Q === 'is your home in haryana?' || Q === 'is your home in haryana' || Q === 'are you from haryana, india?' || Q === 'are you from haryana india')
    return 'Yes, I am from Palwal, Haryana, India.';

  if (Q === 'is your location palwal?' || Q === 'is your location palwal' || Q === 'do you live in palwal, haryana?' || Q === 'do you live in palwal haryana' || Q === 'is palwal your hometown?' || Q === 'is palwal your hometown' || Q === 'are you from palwal?' || Q === 'are you from palwal' || Q === 'do you stay in palwal only?' || Q === 'do you stay in palwal only' || Q === 'are you originally from palwal?' || Q === 'are you originally from palwal')
    return 'Yes, I live in Palwal, Haryana, India.';

  if (Q === 'where is palwal?' || Q === 'where is palwal')
    return 'Palwal is a city in Haryana, India — located near Faridabad and Delhi.';

  if (Q === 'where in india are you?' || Q === 'where in india are you' || Q === 'are you located in north india?' || Q === 'are you located in north india')
    return 'I am in Palwal, Haryana — in North India.';

  if (Q === 'where did you grow up?' || Q === 'where did you grow up' || Q === 'were you born in haryana?' || Q === 'were you born in haryana')
    return 'I grew up in and am based in Palwal, Haryana.';

  if (Q === 'are you based in india?' || Q === 'are you based in india')
    return 'Yes, I am based in India — Palwal, Haryana.';

  if (Q === 'near delhi or far?' || Q === 'near delhi or far' || Q === 'how far is palwal from delhi?' || Q === 'how far is palwal from delhi' || Q === 'are you near delhi?' || Q === 'are you near delhi')
    return 'Palwal is approximately 60 km from Delhi.';

  if (Q === 'are you located in faridabad?' || Q === 'are you located in faridabad')
    return 'No, I am in Palwal — but I study at YMCA in Faridabad.';

  if (Q === 'do you work remotely from india?' || Q === 'do you work remotely from india' || Q === 'do you have good connectivity for remote work?' || Q === 'do you have good connectivity for remote work')
    return 'Yes, I am open to remote work from India and have good connectivity.';

  if (Q === 'is palwal your permanent address?' || Q === 'is palwal your permanent address' || Q === 'what\'s your address?' || Q === 'whats your address' || Q === 'what is your exact location?' || Q === 'what is your exact location' || Q === 'what is your pin code?' || Q === 'what is your pin code')
    return FB;

  // ============ PROFESSIONAL SUMMARY & BACKGROUND ============
  if (Q === 'what is your background?' || Q === 'what is your background' || Q === 'tell me about your professional background.' || Q === 'tell me about your professional background' || Q === 'what is your professional summary?' || Q === 'what is your professional summary' || Q === 'can you give me a brief bio?' || Q === 'can you give me a brief bio' || Q === 'what is your biography?' || Q === 'what is your biography' || Q === 'tell me something about yourself.' || Q === 'tell me something about yourself')
    return localKnowledge.person + '\n\nI have 3+ years of learning experience, 9 projects, and I am actively seeking my first professional role.';

  if (Q === 'what\'s your story?' || Q === 'whats your story' || Q === 'how did you get into coding?' || Q === 'how did you get into coding' || Q === 'what inspired you to become a developer?' || Q === 'what inspired you to become a developer' || Q === 'what motivates you?' || Q === 'what motivates you' || Q === 'what is your passion?' || Q === 'what is your passion')
    return 'I got into coding during my B.Tech CSE and discovered my passion for building web applications. The ability to create something from scratch and solve real problems keeps me motivated.';

  if (Q === 'why did you choose computer science?' || Q === 'why did you choose computer science')
    return 'I chose Computer Science because I was fascinated by how technology works and wanted to build things that impact people\'s lives.';

  if (Q === 'what are your career goals?' || Q === 'what are your career goals' || Q === 'what is your dream job?' || Q === 'what is your dream job' || Q === 'what are your professional goals?' || Q === 'what are your professional goals' || Q === 'what do you want to achieve?' || Q === 'what do you want to achieve')
    return 'My goal is to become a skilled Full Stack Developer, contribute to impactful projects, and grow into a tech lead role.';

  if (Q === 'what kind of work do you do?' || Q === 'what kind of work do you do' || Q === 'what is your expertise?' || Q === 'what is your expertise' || Q === 'what are your core competencies?' || Q === 'what are your core competencies' || Q === 'what do you specialize in?' || Q === 'what do you specialize in' || Q === 'what is your technical expertise?' || Q === 'what is your technical expertise')
    return `My core competencies are: ${techList}. I specialize in building responsive web applications using React, Next.js, and Tailwind CSS.`;

  if (Q === 'what is your usp?' || Q === 'what is your usp' || Q === 'what makes you unique?' || Q === 'what makes you unique' || Q === 'what sets you apart from other developers?' || Q === 'what sets you apart from other developers' || Q === 'what\'s your edge over other freshers?' || Q === 'whats your edge over other freshers')
    return 'My USP: Quick Learner with 9+ real projects, strong problem-solving skills, and adaptability. I don\'t just know theory — I\'ve built real, deployable projects.';

  if (Q === 'what value do you bring to the table?' || Q === 'what value do you bring to the table')
    return `I bring: ${softList}, plus hands-on experience with 9 real projects using modern tech like React, Next.js, and Tailwind CSS.`;

  // ============ EXPERIENCE (EXACT MATCHES) ============
  if (normalizedQ.includes('experience') || normalizedQ.includes('how long') || normalizedQ.includes('years'))
    return `I have ${expList}`;

  if (Q === 'are you a fresher?' || Q === 'are you a fresher' || Q === 'do you have professional experience?' || Q === 'do you have professional experience' || Q === 'are you experienced?' || Q === 'are you experienced' || Q === 'have you worked for any company?' || Q === 'have you worked for any company' || Q === 'do you have internship experience?' || Q === 'do you have internship experience')
    return 'Yes, I am a fresher. I have 3+ years of learning experience and 9 projects, but I am yet to work in a professional company setting. I am actively seeking my first role.';

  if (Q === 'when did you start programming?' || Q === 'when did you start programming')
    return 'I started programming during my B.Tech, around 2022. It\'s been 3+ years of continuous learning.';

  // ============ LEARNING JOURNEY ============
  if (Q === 'how did you learn to code?' || Q === 'how did you learn to code' || Q === 'are you self-taught?' || Q === 'are you self taught' || Q === 'did you learn from online courses?' || Q === 'did you learn from online courses' || Q === 'what resources did you use to learn?' || Q === 'what resources did you use to learn')
    return 'I learned through a combination of college (B.Tech CSE), online courses (KG Coding, NPTEL), and hands-on project building.';

  if (Q === 'what was your learning path?' || Q === 'what was your learning path' || Q === 'what is your learning journey?' || Q === 'what is your learning journey')
    return 'My learning path: Started with C and C++ fundamentals → Moved to web development (HTML, CSS, JavaScript) → Advanced to React and Next.js → Built 9 projects to apply my skills → Pursuing NPTEL certifications.';

  if (Q === 'how do you keep learning?' || Q === 'how do you keep learning' || Q === 'what are you learning currently?' || Q === 'what are you learning currently' || Q === 'what are you upskilling in right now?' || Q === 'what are you upskilling in right now')
    return 'I keep learning by building projects and taking certifications. Currently improving my React and Next.js skills.';

  if (Q === 'how many hours do you code daily?' || Q === 'how many hours do you code daily' || Q === 'do you still consider yourself a learner?' || Q === 'do you still consider yourself a learner')
    return 'I code regularly as part of my learning and project work. Yes, I will always consider myself a learner — tech evolves fast!';

  if (Q === 'what\'s the latest thing you learned?' || Q === 'whats the latest thing you learned' || Q === 'how do you stay updated with tech?' || Q === 'how do you stay updated with tech')
    return 'I stay updated through documentation, online courses, and building projects with the latest technologies.';

  if (Q === 'what was your first language you learned?' || Q === 'what was your first language you learned' || Q === 'when did you write your first line of code?' || Q === 'when did you write your first line of code' || Q === 'what made you choose web development?' || Q === 'what made you choose web development' || Q === 'how did you start your coding journey?' || Q === 'how did you start your coding journey')
    return 'I started with C language during my B.Tech first year, then moved to web development because I loved creating visual, interactive applications.';

  if (Q === 'what\'s your learning style?' || Q === 'whats your learning style' || Q === 'do you prefer videos or documentation?' || Q === 'do you prefer videos or documentation')
    return 'I prefer a mix — video courses for concepts, documentation for deep understanding, and hands-on projects to solidify learning.';

  if (Q === 'how do you tackle new technologies?' || Q === 'how do you tackle new technologies' || Q === 'what\'s your approach to learning a new framework?' || Q === 'whats your approach to learning a new framework')
    return 'I start with the official documentation, watch tutorial videos, then immediately build a small project to apply what I learned.';

  if (Q === 'how fast can you pick up a new language?' || Q === 'how fast can you pick up a new language' || Q === 'are you a quick learner?' || Q === 'are you a quick learner')
    return 'Yes, Quick Learner is one of my top strengths. I can pick up new technologies and concepts rapidly through hands-on practice.';

  if (Q === 'what was your biggest learning challenge?' || Q === 'what was your biggest learning challenge' || Q === 'what mistake taught you the most?' || Q === 'what mistake taught you the most')
    return 'My biggest challenge was transitioning from basic programming to full stack development. Building real projects taught me more than any course.';

  if (Q === 'have you ever felt like giving up on coding?' || Q === 'have you ever felt like giving up on coding' || Q === 'how do you overcome coding frustration?' || Q === 'how do you overcome coding frustration' || Q === 'what keeps you going?' || Q === 'what keeps you going' || Q === 'what\'s your source of motivation?' || Q === 'whats your source of motivation')
    return 'Like every developer, I face challenges — but solving a tough bug or completing a project gives me the motivation to keep going.';

  if (Q === 'who inspires you in the tech world?' || Q === 'who inspires you in the tech world' || Q === 'any role models?' || Q === 'any role models' || Q === 'whose career do you admire?' || Q === 'whose career do you admire' || Q === 'what developer do you look up to?' || Q === 'what developer do you look up to')
    return FB;

  // ============ COMMUNITY / SOCIAL ============
  if (Q === 'do you follow any indian tech influencers?' || Q === 'do you follow any indian tech influencers' || Q === 'what tech communities are you part of?' || Q === 'what tech communities are you part of' || Q === 'do you attend hackathons?' || Q === 'do you attend hackathons' || Q === 'have you ever participated in a coding competition?' || Q === 'have you ever participated in a coding competition' || Q === 'what was your rank in any contest?' || Q === 'what was your rank in any contest' || Q === 'do you contribute to open source?' || Q === 'do you contribute to open source' || Q === 'have you done any open source contributions?' || Q === 'have you done any open source contributions' || Q === 'what\'s your github contribution graph like?' || Q === 'whats your github contribution graph like' || Q === 'how active are you on github?' || Q === 'how active are you on github' || Q === 'do you write technical blogs?' || Q === 'do you write technical blogs' || Q === 'do you share coding content on social media?' || Q === 'do you share coding content on social media' || Q === 'are you on twitter as a developer?' || Q === 'are you on twitter as a developer' || Q === 'what\'s your developer social media presence?' || Q === 'whats your developer social media presence' || Q === 'do you have a youtube channel?' || Q === 'do you have a youtube channel' || Q === 'do you teach coding to anyone?' || Q === 'do you teach coding to anyone' || Q === 'have you mentored anyone?' || Q === 'have you mentored anyone')
    return FB;


    // ============ FULL STACK PROJECT SPECIFIC ============
  if (Q === 'which is the full stack project' || Q === 'which is the full stack project?' || Q === 'which is your full stack project' || Q === 'which is your full stack project?' || /which is the full stack project/i.test(Q)) {
    return H ? 'Mera **full-stack project** **Abhayapuri Care Hospital** hai — Next.js, Tailwind CSS, Framer Motion ke saath.' : 'My **full-stack project** is **Abhayapuri Care Hospital** — built with Next.js, Tailwind CSS, and Framer Motion.';
  }


    // ============ HINGLISH IDENTITY ============
  if (hasAnyQuery(Q, ['tum kaun ho', 'aap kaun ho', 'kaun ho tum', 'who are you'])) {
    return H ? `Main Ashraful Alom hoon, ek Full Stack Developer. ${loc} se hoon.` : `I am Ashraful Alom, a Full Stack Developer from ${loc}.`;
  }
  if (hasAnyQuery(Q, ['tumhara naam', 'aapka naam', 'tera naam', 'naam kya hai', 'name kya hai', 'your name'])) {
    return `Mera naam Ashraful Alom hai. Main ek Full Stack Developer hoon.`;
  }
  if (hasAnyQuery(Q, ['what is your hobby', 'tumhara hobby', 'hobby kya hai', 'free time mein kya karte'])) {
    return `Mere hobbies hain: Photography, Travel, aur Football.`;
  }

// ============ GOALS (flexible) ============
if (hasAnyQuery(Q, ['goal', 'career goal', 'dream job', 'want to achieve', 'professional goal', 'aim', 'target', 'what is your goal', 'what are your goals'])) {
    return 'My goal is to become a skilled Full Stack Developer, contribute to impactful projects, and grow into a tech lead role.';
}


    // ============ EDUCATION (flexible) ============
  if (hasAnyQuery(Q, ['education', 'study', 'degree', 'university', 'college', 'b.tech', 'btech', 'academic', 'school', '12th', '10th', 'hslc', 'ymca'])) {
    return `My education:\n${eduList}`;
  }

  // ============ LANGUAGES (flexible) ============
  if (hasAnyQuery(Q, ['language', 'speak', 'assamese', 'bengali', 'hindi', 'english', 'mother tongue', 'fluent', 'multilingual'])) {
    return `I speak these languages:\n${langList}`;
  }

  // ============ WEAKNESS (flexible) ============
  if (hasAnyQuery(Q, ['weakness', 'weaknesses', 'weak point', 'limitation', 'drawback', 'not good at', 'struggle', 'improve', 'english weak', 'fresher weakness'])) {
    return H ? 'Main apni **English communication** improve kar raha hoon (abhi Elementary level hai) aur ek **fresher** hone ke naate professional experience build kar raha hoon. Dono pe actively kaam kar raha hoon.' : 'I\'m working on improving my **English communication** (currently at Elementary level) and gaining more **professional experience** as a fresher. I\'m actively working on both.';
  }

  // ============ EXPERIENCE (flexible) ============
  if (hasAnyQuery(Q, ['experience', 'fresher', 'professional experience', 'company', 'internship', 'learning experience', 'worked before'])) {
    return `I have ${expList}`;
  }

  // ============ HOBBIES / FREE TIME (flexible) ============
  if (hasAnyQuery(Q, ['hobby', 'hobbies', 'free time', 'like to do', 'enjoy', 'outside coding', 'passion', 'fun', 'relax'])) {
    return `My hobbies are: **${localKnowledge.hobbies.join(', ')}**.`;
  }


      // ============ LOCATION (flexible) ============
  if (hasAnyQuery(Q, ['location', 'where are you', 'where do you live', 'current location', 'based', 'city', 'hometown', 'palwal', 'haryana', 'india', 'from which place', 'kahan', 'rehte', 'kahan rehte', 'kahan se', 'kaunse sheher', 'address'])) {
    return H ? `Main **${loc}** mein rehta hoon.` : `I am based in **${loc}**.`;
  }

  // ============ CONTACT (flexible) ============
  if (hasAnyQuery(Q, ['contact', 'reach', 'email', 'get in touch', 'connect', 'message me', 'how to contact', 'mail', 'linkedin', 'github link'])) {
    return `📧 Email: **${email}**\n💼 LinkedIn: ${linkedin}\n🐙 GitHub: ${github}\n\nFeel free to reach out!`;
  }

  // ============ TEAMWORK / COLLABORATION (flexible) ============
  if (hasAnyQuery(Q, ['team', 'collaborate', 'work together', 'team player', 'colleague', 'group project', 'co-founder', 'together'])) {
    return `Yes! Teamwork is one of my key strengths. I collaborate well, communicate clearly, and am a good listener. I'm open to working in teams or as a solo contributor.`;
  }


   // ============ CERTIFICATIONS & AWARDS (flexible) ============
  if (hasAnyQuery(Q, ['certification', 'certificate', 'nptel', 'kg coding', 'award', 'mini soccer', 'credentials', 'courses', 'nptel courses', 'iit certifications'])) {
    return `My verified certifications are:\n${certList}\n\nAward: ${localKnowledge.awards[0]}`;
  }


  
  // ============ PERSONAL INTERESTS ============
  if (Q === 'what are your interests?' || Q === 'what are your interests' || Q === 'what do you like to do outside of coding?' || Q === 'what do you like to do outside of coding' || Q === 'what are you passionate about?' || Q === 'what are you passionate about')
    return `Outside of coding, I enjoy: ${localKnowledge.hobbies.join(', ')}.`;

  if (Q === 'what drives you?' || Q === 'what drives you' || Q === 'what do you enjoy doing?' || Q === 'what do you enjoy doing' || Q === 'what do you do for fun?' || Q === 'what do you do for fun')
    return `I enjoy ${localKnowledge.hobbies.join(', ')} in my free time.`;

  if (Q === 'what are your personal values?' || Q === 'what are your personal values' || Q === 'what is important to you?' || Q === 'what is important to you' || Q === 'what do you believe in?' || Q === 'what do you believe in' || Q === 'what is your life philosophy?' || Q === 'what is your life philosophy' || Q === 'what is your life motto?' || Q === 'what is your life motto')
    return FB;

  // ============ WHY HIRE ============
  if (Q === 'why should i hire you?' || Q === 'why should i hire you' || Q === 'why should we hire you?' || Q === 'why should we hire you' || Q === 'why should we hire ashraful?' || Q === 'why should we hire ashraful')
    return `You should hire me because I bring: **${softList}**. Plus I have 9 real projects, hands-on experience with modern technologies (${techList}), and I'm a quick learner ready to contribute to your team.`;

  if (Q === 'what can you bring to a team?' || Q === 'what can you bring to a team' || Q === 'what can you bring to the team?' || Q === 'what can you bring to the team')
    return `I bring: ${softList}. I collaborate well, learn fast, and deliver clean, responsive code.`;

  if (Q === 'what makes you a good candidate?' || Q === 'what makes you a good candidate' || Q === 'what makes you hireable?' || Q === 'what makes you hireable')
    return `What makes me a good candidate: ${softList}, plus 9 verified projects, 3+ years of learning, and modern tech skills (${techList}).`;

  // ============ STRENGTHS / SOFT SKILLS ============
  if (normalizedQ.includes('strength') || normalizedQ.includes('good at') || normalizedQ.includes('soft skill') || normalizedQ.includes('asset') || normalizedQ.includes('trait'))
    return `My strengths are: **${softList}**.`;

  if (Q === 'are you a quick learner?' || Q === 'are you a quick learner')
    return 'Yes! Quick Learner is one of my top strengths. I pick up new technologies and concepts rapidly.';

  if (Q === 'are you good at problem solving?' || Q === 'are you good at problem solving' || Q === 'are you a problem solver or a coder?' || Q === 'are you a problem solver or a coder')
    return 'Yes! Problem Solving is one of my core strengths. I approach challenges methodically.';

  if (Q === 'can you work in a team?' || Q === 'can you work in a team' || Q === 'do you work well in teams?' || Q === 'do you work well in teams' || Q === 'are you a team player?' || Q === 'are you a team player')
    return 'Yes! Teamwork is one of my key strengths. I collaborate well and am a good listener.';

  if (Q === 'are you self motivated?' || Q === 'are you self motivated' || Q === 'are you self-motivated?' || Q === 'are you self-motivated')
    return 'Yes! Self-Motivation is one of my key strengths. I drive myself to learn and complete projects independently.';

  if (Q === 'can you adapt easily?' || Q === 'can you adapt easily' || Q === 'are you adaptable to change?' || Q === 'are you adaptable to change')
    return 'Yes! Adaptability is one of my strengths. I adjust well to new situations, tools, and environments.';

  if (Q === 'how do you manage time?' || Q === 'how do you manage time' || Q === 'how are your time management skills?' || Q === 'how are your time management skills' || Q === 'how do you prioritize tasks?' || Q === 'how do you prioritize tasks')
    return 'Time Management is one of my strengths. I prioritize tasks effectively to meet deadlines.';

  if (Q === 'are you a good listener?' || Q === 'are you a good listener')
    return 'Yes! Being a Good Listener is one of my strengths — I listen carefully before responding.';

  if (Q === 'what are your soft skills?' || Q === 'what are your soft skills' || Q === 'what soft skills do you have?' || Q === 'what soft skills do you have')
    return `My soft skills are: **${softList}**.`;

  if (Q === 'can you solve problems?' || Q === 'can you solve problems' || Q === 'how do you solve problems?' || Q === 'how do you solve problems')
    return 'Yes, I approach problems methodically — analyze, break down, find solutions, and implement.';

  if (Q === 'can you collaborate with others?' || Q === 'can you collaborate with others' || Q === 'how do you collaborate?' || Q === 'how do you collaborate')
    return 'Yes, I collaborate well — I communicate clearly, listen to feedback, and contribute effectively.';

  // ============ WEAKNESSES ============
  if (Q === 'what is your weakness?' || Q === 'what is your weakness' || Q === 'what are your weaknesses?' || Q === 'what are your weaknesses' || Q === 'your weakness' || Q === 'your weaknesses' || Q === 'tell me your weaknesses' || Q === 'tell me your weaknesses' || Q === 'what is his weakness' || Q === 'what is his weakness' || Q === 'what are his weaknesses' || Q === 'what are his weaknesses' || Q === 'his weakness' || Q === 'his weaknesses' || Q === 'tell me his weaknesses' || Q === 'tell me his weaknesses' || Q === 'what is your biggest weakness?' || Q === 'what is your biggest weakness' || Q === 'what is your greatest weakness?' || Q === 'what is your greatest weakness' || Q === 'weak points')
    return H ? 'Main apni **English communication** improve kar raha hoon (abhi Elementary level hai) aur ek **fresher** hone ke naate professional experience build kar raha hoon. Dono pe actively kaam kar raha hoon.' : 'I\'m working on improving my **English communication** (currently at Elementary level) and gaining more **professional experience** as a fresher. I\'m actively working on both.';

  if (Q === 'what are you not good at?' || Q === 'what are you not good at' || Q === 'what do you struggle with?' || Q === 'what do you struggle with' || Q === 'what are your limitations?' || Q === 'what are your limitations' || Q === 'what do you need to improve?' || Q === 'what do you need to improve' || Q === 'areas of improvement' || Q === 'what are your drawbacks?' || Q === 'what are your drawbacks' || Q === 'any weakness in your skills?' || Q === 'any weakness in your skills' || Q === 'what skills do you lack?' || Q === 'what skills do you lack')
    return 'I\'m working on: 1) English communication (Elementary level), 2) Gaining professional work experience. I actively practice both daily.';

  if (Q === 'why shouldn\'t we hire you?' || Q === 'why shouldnt we hire you')
    return 'I\'m a fresher and my English is at Elementary level — but I\'m a Quick Learner, Self-Motivated, and have proven my skills through 9 real projects, making me a fast-growing asset.';

  if (Q === 'are you weak in english?' || Q === 'are you weak in english' || Q === 'is your english good?' || Q === 'is your english good')
    return 'My English is at Elementary level. I can read, write, and speak — but I\'m actively working to improve my fluency.';

  if (Q === 'do you have experience?' || Q === 'do you have experience')
    return 'I am a fresher with 3+ years of learning experience and 9 projects. I am seeking my first professional role.';

  // ============ WORK STYLE ============
  if (Q === 'how do you handle pressure?' || Q === 'how do you handle pressure' || Q === 'can you work under pressure?' || Q === 'can you work under pressure' || Q === 'are you calm under pressure?' || Q === 'are you calm under pressure')
    return 'I stay calm under pressure, prioritize tasks, and focus on solving one problem at a time. Time Management helps me handle deadlines effectively.';

  if (Q === 'what is your work style?' || Q === 'what is your work style' || Q === 'how would you describe your work ethic?' || Q === 'how would you describe your work ethic' || Q === 'are you a hard worker?' || Q === 'are you a hard worker' || Q === 'what is your attitude towards work?' || Q === 'what is your attitude towards work')
    return 'My work style: Self-motivated, disciplined, and focused on delivering clean, functional code. I believe in learning by doing.';

  if (Q === 'how would your colleagues describe you?' || Q === 'how would your colleagues describe you' || Q === 'if i ask your friend about you, what will they say?' || Q === 'if i ask your friend about you what will they say')
    return 'They would describe me as a Quick Learner, reliable team player, and someone who stays calm while solving tough problems.';

  if (Q === 'how do you handle challenges?' || Q === 'how do you handle challenges')
    return 'I break down the challenge, research solutions, and tackle it step by step. Persistence is key.';

  if (Q === 'what makes you a good team member?' || Q === 'what makes you a good team member')
    return 'I\'m a Good Listener, adaptable, and collaborative. I communicate clearly and respect others\' ideas.';

  if (Q === 'how do you stay motivated?' || Q === 'how do you stay motivated')
    return 'Building projects and learning new things keeps me motivated. Completing a challenging project gives me a great sense of achievement.';

  if (Q === 'how do you handle feedback?' || Q === 'how do you handle feedback' || Q === 'how do you take criticism on your code?' || Q === 'how do you take criticism on your code' || Q === 'are you open to feedback?' || Q === 'are you open to feedback')
    return 'I welcome feedback openly — it helps me grow as a developer. I see criticism as an opportunity to improve.';

  if (Q === 'what is your greatest soft skill?' || Q === 'what is your greatest soft skill')
    return 'My greatest soft skill is being a Quick Learner — I pick up new technologies and adapt to new environments rapidly.';

  if (Q === 'are you organized?' || Q === 'are you organized' || Q === 'how do you organize your tasks?' || Q === 'how do you organize your tasks')
    return 'Yes, I stay organized. I prioritize tasks, set goals, and use time management to stay on track.';

  if (Q === 'are you disciplined?' || Q === 'are you disciplined' || Q === 'what habits make you productive?' || Q === 'what habits make you productive')
    return 'Yes, discipline is key to my learning. I set daily goals, build consistently, and stay self-motivated.';

  if (Q === 'how do you plan your day?' || Q === 'how do you plan your day' || Q === 'morning person or night owl?' || Q === 'morning person or night owl' || Q === 'what time do you code best?' || Q === 'what time do you code best' || Q === 'how many productive hours in a day?' || Q === 'how many productive hours in a day' || Q === 'do you procrastinate?' || Q === 'do you procrastinate' || Q === 'how do you beat procrastination?' || Q === 'how do you beat procrastination')
    return FB;

  if (Q === 'how do you manage multiple projects?' || Q === 'how do you manage multiple projects')
    return 'I prioritize based on deadlines and complexity, focus on one task at a time, and use Time Management to stay productive.';

  if (Q === 'are you a leader or a follower?' || Q === 'are you a leader or a follower' || Q === 'what\'s your leadership style?' || Q === 'whats your leadership style' || Q === 'have you ever led a team?' || Q === 'have you ever led a team')
    return 'I can adapt to both roles. I collaborate well as a team member and am willing to take initiative when needed.';

  if (Q === 'how do you communicate with others?' || Q === 'how do you communicate with others' || Q === 'what are your interpersonal skills?' || Q === 'what are your interpersonal skills' || Q === 'can you explain tech to a non-techie?' || Q === 'can you explain tech to a non techie' || Q === 'how do you communicate technical concepts?' || Q === 'how do you communicate technical concepts')
    return 'I communicate clearly and simply. I can explain technical concepts to non-technical people in easy-to-understand language.';

  if (Q === 'are you detail-oriented?' || Q === 'are you detail oriented' || Q === 'can you work independently?' || Q === 'can you work independently' || Q === 'do you prefer working alone?' || Q === 'do you prefer working alone')
    return 'Yes, I can work independently. I\'m self-motivated and detail-oriented — I take ownership of my work.';

  if (Q === 'are you an introvert or extrovert?' || Q === 'are you an introvert or extrovert' || Q === 'how do you network?' || Q === 'how do you network' || Q === 'are you good at small talk?' || Q === 'are you good at small talk' || Q === 'what do people misunderstand about you?' || Q === 'what do people misunderstand about you')
    return FB;

  if (Q === 'what is your management style?' || Q === 'what is your management style' || Q === 'what do you expect from a colleague?' || Q === 'what do you expect from a colleague' || Q === 'what do you expect from a boss?' || Q === 'what do you expect from a boss' || Q === 'what irritates you at work?' || Q === 'what irritates you at work' || Q === 'how do you deal with difficult people?' || Q === 'how do you deal with difficult people')
    return FB;

  if (Q === 'can you present in front of an audience?' || Q === 'can you present in front of an audience' || Q === 'have you given any tech talks?' || Q === 'have you given any tech talks' || Q === 'are you a teacher at heart?' || Q === 'are you a teacher at heart' || Q === 'do you like helping juniors?' || Q === 'do you like helping juniors')
    return FB;

  if (Q === 'can you handle a crisis?' || Q === 'can you handle a crisis')
    return 'Yes, I stay calm and focus on finding solutions step by step.';

  if (Q === 'how do you handle disagreements in a team?' || Q === 'how do you handle disagreements in a team' || Q === 'what if your idea is rejected?' || Q === 'what if your idea is rejected')
    return 'I listen to others\' perspectives, communicate respectfully, and work towards the best solution for the team.';

  if (Q === 'how do you approach a bug you can\'t solve?' || Q === 'how do you approach a bug you cant solve' || Q === 'what do you do when stuck on code?' || Q === 'what do you do when stuck on code')
    return 'I research the issue, check documentation and Stack Overflow, try different approaches, and if needed, ask for help.';

  if (Q === 'how do you ask for help?' || Q === 'how do you ask for help' || Q === 'do you google or ask a senior first?' || Q === 'do you google or ask a senior first')
    return 'I research and Google first to learn independently. If stuck, I ask seniors with context about what I\'ve already tried.';

  if (Q === 'what\'s your go-to resource for solutions?' || Q === 'whats your go to resource for solutions' || Q === 'stack overflow or documentation?' || Q === 'stack overflow or documentation')
    return 'Documentation first, then Stack Overflow if needed.';

  if (Q === 'how do you debug your code?' || Q === 'how do you debug your code' || Q === 'what\'s your go-to debugging technique?' || Q === 'whats your go to debugging technique')
    return FB;

  if (Q === 'give an example of your quick learning.' || Q === 'give an example of your quick learning' || Q === 'how quickly did you pick up react?' || Q === 'how quickly did you pick up react' || Q === 'tell me about a time you adapted.' || Q === 'tell me about a time you adapted' || Q === 'describe a time you solved a difficult problem.' || Q === 'describe a time you solved a difficult problem')
    return 'I quickly picked up React and Next.js while building my hospital management project (Abhayapuri Care Hospital). Learning by building real projects is my best approach.';

  if (Q === 'your biggest failure and what you learned?' || Q === 'your biggest failure and what you learned' || Q === 'a time you failed in coding?' || Q === 'a time you failed in coding' || Q === 'how did you bounce back?' || Q === 'how did you bounce back' || Q === 'are you resilient?' || Q === 'are you resilient')
    return 'Every bug and failed attempt taught me something valuable. I bounce back by analyzing what went wrong, learning from it, and trying again.';

  if (Q === 'how do you handle stress?' || Q === 'how do you handle stress' || Q === 'do you meditate?' || Q === 'do you meditate' || Q === 'work-life balance — how do you manage?' || Q === 'work life balance how do you manage' || Q === 'do you overwork?' || Q === 'do you overwork' || Q === 'how do you avoid burnout?' || Q === 'how do you avoid burnout' || Q === 'ever experienced coder\'s block?' || Q === 'ever experienced coders block' || Q === 'how do you get unstuck?' || Q === 'how do you get unstuck')
    return FB;

  if (Q === 'what\'s your superpower?' || Q === 'whats your superpower')
    return 'My superpower is Quick Learning — I can pick up new technologies and start building with them rapidly.';

  if (Q === 'how do you define success?' || Q === 'how do you define success' || Q === 'what is your philosophy on teamwork?' || Q === 'what is your philosophy on teamwork')
    return FB;

  if (Q === 'do you work well in a team?' || Q === 'do you work well in a team')
    return `Yes, Teamwork is one of my strengths. My soft skills include: ${softList}.`;

  // ============ EDUCATION (EXACT MATCHES) ============
  if (Q === 'what are you studying?' || Q === 'what are you studying' || Q === 'what is your current education?' || Q === 'what is your current education' || Q === 'are you pursuing a b.tech?' || Q === 'are you pursuing a btech' || Q === 'are you pursuing a b.tech' || Q === 'what degree are you doing?' || Q === 'what degree are you doing' || Q === 'what is your degree?' || Q === 'what is your degree' || Q === 'what is your major?' || Q === 'what is your major' || Q === 'what is your field of study?' || Q === 'what is your field of study' || Q === 'what branch in b.tech?' || Q === 'what branch in btech' || Q === 'are you in computer science?' || Q === 'are you in computer science' || Q === 'what is your specialization?' || Q === 'what is your specialization' || Q === 'what stream in engineering?' || Q === 'what stream in engineering' || Q === 'are you doing b.tech in cse?' || Q === 'are you doing btech in cse' || Q === 'what is your undergraduate degree?' || Q === 'what is your undergraduate degree' || Q === 'what is your course?' || Q === 'what is your course' || Q === 'what program are you in?' || Q === 'what program are you in' || Q === 'what branch are you in?' || Q === 'what branch are you in' || Q === 'is your course computer science?' || Q === 'is your course computer science' || Q === 'are you in cse?' || Q === 'are you in cse' || Q === 'what is your b.tech specialization?' || Q === 'what is your btech specialization' || Q === 'is your branch computer science and engineering?' || Q === 'is your branch computer science and engineering' || Q === 'what is your stream in engineering?' || Q === 'what is your stream in engineering' || Q === 'what is your undergraduate major?' || Q === 'what is your undergraduate major' || Q === 'what is your undergraduate program?' || Q === 'what is your undergraduate program' || Q === 'are you pursuing a bachelor\'s degree?' || Q === 'are you pursuing a bachelors degree' || Q === 'what bachelor\'s degree?' || Q === 'what bachelors degree' || Q === 'is it a four-year degree?' || Q === 'is it a four year degree' || Q === 'is your b.tech four years?' || Q === 'is your btech four years' || Q === 'what is your course duration?' || Q === 'what is your course duration')
    return `I am pursuing **B.Tech in Computer Science & Engineering (CSE)** at J.C. Bose University (YMCA), Faridabad (2022-2026). It is a 4-year degree.`;

  if (Q === 'what university are you at?' || Q === 'what university are you at' || Q === 'which college are you in?' || Q === 'which college are you in' || Q === 'where are you studying?' || Q === 'where are you studying' || Q === 'what institution are you attending?' || Q === 'what institution are you attending' || Q === 'are you at j.c. bose university?' || Q === 'are you at jc bose university' || Q === 'is your university ymca faridabad?' || Q === 'is your university ymca faridabad' || Q === 'what is your university name?' || Q === 'what is your university name' || Q === 'which university do you go to?' || Q === 'which university do you go to' || Q === 'what college do you attend?' || Q === 'what college do you attend' || Q === 'where is your university located?' || Q === 'where is your university located' || Q === 'what is your college name?' || Q === 'what is your college name' || Q === 'what is your university?' || Q === 'what is your university' || Q === 'what is your educational institute?' || Q === 'what is your educational institute')
    return 'I am studying at **J.C. Bose University of Science and Technology (YMCA)**, Faridabad, Haryana.';

  if (Q === 'when will you graduate?' || Q === 'when will you graduate' || Q === 'what is your graduation year?' || Q === 'what is your graduation year' || Q === 'when do you finish your b.tech?' || Q === 'when do you finish your btech' || Q === 'are you graduating in 2026?' || Q === 'are you graduating in 2026')
    return 'I will graduate in **2026**.';

  if (Q === 'what year are you in?' || Q === 'what year are you in' || Q === 'are you a final year student?' || Q === 'are you a final year student' || Q === 'what is your academic year?' || Q === 'what is your academic year' || Q === 'when did you start your b.tech?' || Q === 'when did you start your btech' || Q === 'what is your duration of study?' || Q === 'what is your duration of study')
    return 'My B.Tech is from **2022 to 2026** (4 years). I am in the later years of the program.';

  if (Q === 'what is your gpa?' || Q === 'what is your gpa' || Q === 'what is your cgpa?' || Q === 'what is your cgpa' || Q === 'what\'s your current cgpa?' || Q === 'whats your current cgpa' || Q === 'what are your grades?' || Q === 'what are your grades' || Q === 'what percentage did you get?' || Q === 'what percentage did you get' || Q === 'do you have 88% in b.tech?' || Q === 'do you have 88 percent in btech' || Q === 'is your score 88%?' || Q === 'is your score 88 percent' || Q === 'what is your academic performance?' || Q === 'what is your academic performance')
    return FB;

  if (Q === 'are you a good student?' || Q === 'are you a good student' || Q === 'did you do well in school?' || Q === 'did you do well in school' || Q === 'what are your academic achievements?' || Q === 'what are your academic achievements' || Q === 'how was your academic performance?' || Q === 'how was your academic performance')
    return 'Yes, I am dedicated to my studies and have completed NPTEL certifications from IITs along with my B.Tech.';

  if (Q === 'what was your previous education?' || Q === 'what was your previous education' || Q === 'where did you complete your higher secondary?' || Q === 'where did you complete your higher secondary' || Q === 'what school did you attend for 12th?' || Q === 'what school did you attend for 12th' || Q === 'what is your high school?' || Q === 'what is your high school')
    return 'I completed my **Higher Secondary (12th)** in **Science stream** from **Lengtisinga H.S. School** in 2022.';

  if (Q === 'where did you do your hslc?' || Q === 'where did you do your hslc' || Q === 'which school did you go to?' || Q === 'which school did you go to')
    return 'I completed my **HSLC (10th)** from **Dr. B.R. Ambedkar High School** in 2020.';

  if (Q === 'did you study at lengtisinga h.s. school?' || Q === 'did you study at lengtisinga hs school')
    return 'Yes, I completed my 12th (Science) from Lengtisinga H.S. School in 2022.';

  if (Q === 'did you go to dr. b.r. ambedkar high school?' || Q === 'did you go to dr br ambedkar high school')
    return 'Yes, I completed my 10th (HSLC) from Dr. B.R. Ambedkar High School in 2020.';

  if (Q === 'what was your higher secondary stream?' || Q === 'what was your higher secondary stream' || Q === 'did you take science in 12th?' || Q === 'did you take science in 12th' || Q === 'were you a science student from the beginning?' || Q === 'were you a science student from the beginning')
    return 'Yes, I took **Science** in 12th.';

  if (Q === 'when did you complete your higher secondary?' || Q === 'when did you complete your higher secondary' || Q === 'what was your 12th pass year?' || Q === 'what was your 12th pass year')
    return 'I completed Higher Secondary in **2022**.';

  if (Q === 'when did you pass 10th grade?' || Q === 'when did you pass 10th grade' || Q === 'what year did you complete hslc?' || Q === 'what year did you complete hslc')
    return 'I completed HSLC (10th) in **2020**.';

  if (Q === 'what is your academic background?' || Q === 'what is your academic background' || Q === 'what are your educational qualifications?' || Q === 'what are your educational qualifications' || Q === 'what is your highest qualification?' || Q === 'what is your highest qualification' || Q === 'what is your educational history?' || Q === 'what is your educational history' || Q === 'can you list your education timeline?' || Q === 'can you list your education timeline' || Q === 'what is your education summary?' || Q === 'what is your education summary' || Q === 'what degrees do you hold?' || Q === 'what degrees do you hold' || Q === 'what have you studied?' || Q === 'what have you studied' || Q === 'what is your academic profile?' || Q === 'what is your academic profile' || Q === 'what is your educational level?' || Q === 'what is your educational level' || Q === 'what is your schooling?' || Q === 'what is your schooling' || Q === 'where did you study?' || Q === 'where did you study' || Q === 'what is your alma mater?' || Q === 'what is your alma mater' || Q === 'what was your school name?' || Q === 'what was your school name' || Q === 'what are your academic credentials?' || Q === 'what are your academic credentials' || Q === 'what is your learning background?' || Q === 'what is your learning background' || Q === 'what is your study background?' || Q === 'what is your study background' || Q === 'what is your formal education?' || Q === 'what is your formal education' || Q === 'what is your training background?' || Q === 'what is your training background' || Q === 'what educational path did you take?' || Q === 'what educational path did you take')
    return `My education:\n${eduList}`;

  if (Q === 'tell me about your education.' || Q === 'tell me about your education' || Q === 'what is your education?' || Q === 'what is your education' || Q === 'describe your education.' || Q === 'describe your education' || Q === 'what is your educational qualification?' || Q === 'what is your educational qualification' || Q === 'tell me your student life story.' || Q === 'tell me your student life story' || Q === 'walk me through your academic journey.' || Q === 'walk me through your academic journey' || Q === 'your education path so far?' || Q === 'your education path so far' || Q === 'summary of your schooling and college.' || Q === 'summary of your schooling and college' || Q === 'give me your education timeline.' || Q === 'give me your education timeline' || Q === 'what schools and colleges have you attended?' || Q === 'what schools and colleges have you attended' || Q === 'list your academic institutions.' || Q === 'list your academic institutions')
    return `My education:\n${eduList}`;

  if (Q === 'what are you studying right now?' || Q === 'what are you studying right now')
    return 'I am currently pursuing B.Tech CSE at J.C. Bose University (YMCA), Faridabad (2022-2026).';

  if (Q === 'what is your student status?' || Q === 'what is your student status')
    return 'I am currently a student pursuing B.Tech CSE (2022-2026).';

  if (Q === 'what degrees will you hold by 2026?' || Q === 'what degrees will you hold by 2026' || Q === 'what will be your degree?' || Q === 'what will be your degree' || Q === 'what degree are you pursuing?' || Q === 'what degree are you pursuing' || Q === 'what is your expected degree?' || Q === 'what is your expected degree')
    return 'By 2026, I will hold a **B.Tech in Computer Science & Engineering (CSE)** from J.C. Bose University (YMCA), Faridabad.';

  if (Q === 'what\'s your educational roadmap?' || Q === 'whats your educational roadmap')
    return 'B.Tech CSE (2022-2026) → Professional role or higher studies (M.Tech/MBA, still deciding).';

  if (Q === 'what\'s after b.tech?' || Q === 'whats after btech' || Q === 'continuing studies or job first?' || Q === 'continuing studies or job first')
    return 'I am actively seeking my first professional role after B.Tech. I may consider higher studies later.';

  if (Q === 'what certificates do you have?' || Q === 'what certificates do you have' || Q === 'have you completed any diploma?' || Q === 'have you completed any diploma')
    return `My certifications include:\n${certList}`;

  if (Q === 'did you study science?' || Q === 'did you study science' || Q === 'what subjects did you study?' || Q === 'what subjects did you study')
    return 'I studied Science in 12th, and now Computer Science & Engineering in B.Tech.';

  if (Q === 'do you believe formal education is necessary?' || Q === 'do you believe formal education is necessary' || Q === 'has college taught you more than online courses?' || Q === 'has college taught you more than online courses' || Q === 'what\'s your take on the indian education system?' || Q === 'whats your take on the indian education system' || Q === 'are you satisfied with your academic progress?' || Q === 'are you satisfied with your academic progress' || Q === 'what would you change about your education?' || Q === 'what would you change about your education')
    return FB;

  if (Q === 'any educational gap years?' || Q === 'any educational gap years' || Q === 'did you ever drop a year?' || Q === 'did you ever drop a year' || Q === 'are you a regular student or distance learning?' || Q === 'are you a regular student or distance learning')
    return 'I am a regular student with no gap years.';

  if (Q === 'what was your 10th percentage?' || Q === 'what was your 10th percentage' || Q === 'what was your 12th percentage?' || Q === 'what was your 12th percentage' || Q === 'what semester is going on?' || Q === 'what semester is going on' || Q === 'when is your final exam?' || Q === 'when is your final exam' || Q === 'do you have a backlog?' || Q === 'do you have a backlog' || Q === 'what subjects are you studying this sem?' || Q === 'what subjects are you studying this sem' || Q === 'what\'s your favorite subject in engineering?' || Q === 'whats your favorite subject in engineering' || Q === 'which subject do you hate the most?' || Q === 'which subject do you hate the most' || Q === 'what\'s the toughest subject for you?' || Q === 'whats the toughest subject for you' || Q === 'are you good at mathematics?' || Q === 'are you good at mathematics' || Q === 'how\'s your dsa?' || Q === 'hows your dsa' || Q === 'do you do competitive programming?' || Q === 'do you do competitive programming' || Q === 'leetcode or codechef?' || Q === 'leetcode or codechef' || Q === 'what\'s your coding profile?' || Q === 'whats your coding profile' || Q === 'have you done any internships during college?' || Q === 'have you done any internships during college' || Q === 'does your college provide placement?' || Q === 'does your college provide placement' || Q === 'are you preparing for campus placements?' || Q === 'are you preparing for campus placements' || Q === 'what companies visit your campus?' || Q === 'what companies visit your campus' || Q === 'what\'s the average package at your college?' || Q === 'whats the average package at your college' || Q === 'what\'s your dream company for placement?' || Q === 'whats your dream company for placement' || Q === 'are you eligible for placements?' || Q === 'are you eligible for placements' || Q === 'what\'s your attendance percentage?' || Q === 'whats your attendance percentage' || Q === 'do you attend classes regularly?' || Q === 'do you attend classes regularly' || Q === 'how is the faculty at your college?' || Q === 'how is the faculty at your college' || Q === 'do you like your college environment?' || Q === 'do you like your college environment' || Q === 'how\'s the infrastructure at ymca?' || Q === 'hows the infrastructure at ymca' || Q === 'is ymca a good university?' || Q === 'is ymca a good university' || Q === 'what\'s the ranking of your university?' || Q === 'whats the ranking of your university' || Q === 'is your college aicte approved?' || Q === 'is your college aicte approved' || Q === 'is ymca a government or private college?' || Q === 'is ymca a government or private college' || Q === 'what\'s the fee structure?' || Q === 'whats the fee structure' || Q === 'did you get admission through jee?' || Q === 'did you get admission through jee' || Q === 'what was your jee rank?' || Q === 'what was your jee rank' || Q === 'was it through state quota?' || Q === 'was it through state quota' || Q === 'how did you get into ymca?' || Q === 'how did you get into ymca' || Q === 'why did you choose ymca faridabad?' || Q === 'why did you choose ymca faridabad' || Q === 'was ymca your first choice?' || Q === 'was ymca your first choice' || Q === 'any regrets about your college choice?' || Q === 'any regrets about your college choice' || Q === 'which board were you in for 12th?' || Q === 'which board were you in for 12th' || Q === 'seba or cbse for hslc?' || Q === 'seba or cbse for hslc' || Q === 'was your schooling in assamese medium?' || Q === 'was your schooling in assamese medium' || Q === 'did you study in a government school?' || Q === 'did you study in a government school' || Q === 'how was your school life?' || Q === 'how was your school life' || Q === 'were you a topper in school?' || Q === 'were you a topper in school' || Q === 'did you take coaching for jee?' || Q === 'did you take coaching for jee' || Q === 'did you ever fail any subject?' || Q === 'did you ever fail any subject' || Q === 'what extracurricular activities did you do in school?' || Q === 'what extracurricular activities did you do in school' || Q === 'were you a sports person in school?' || Q === 'were you a sports person in school' || Q === 'any school achievements?' || Q === 'any school achievements' || Q === 'did you get any scholarship?' || Q === 'did you get any scholarship' || Q === 'were you a prefect or monitor?' || Q === 'were you a prefect or monitor' || Q === 'what was your favorite teacher\'s name?' || Q === 'what was your favorite teachers name' || Q === 'any subject you were particularly good at?' || Q === 'any subject you were particularly good at' || Q === 'did you have computer science in 12th?' || Q === 'did you have computer science in 12th' || Q === 'when did you first touch a computer?' || Q === 'when did you first touch a computer' || Q === 'did you have internet at home during school?' || Q === 'did you have internet at home during school' || Q === 'how did you manage studies in a small town?' || Q === 'how did you manage studies in a small town' || Q === 'what are the education facilities like in your hometown?' || Q === 'what are the education facilities like in your hometown' || Q === 'do you plan to do a master\'s degree?' || Q === 'do you plan to do a masters degree' || Q === 'mtech or mba?' || Q === 'mtech or mba' || Q === 'do you want to study abroad?' || Q === 'do you want to study abroad' || Q === 'plans for higher education?' || Q === 'plans for higher education' || Q === 'will you go for gate?' || Q === 'will you go for gate' || Q === 'are you interested in research?' || Q === 'are you interested in research' || Q === 'any plans for phd?' || Q === 'any plans for phd' || Q === 'do you want to be a professor someday?' || Q === 'do you want to be a professor someday' || Q === 'what\'s your ultimate academic goal?' || Q === 'whats your ultimate academic goal')
    return FB;

  // ============ SKILLS (EXACT MATCHES) ============
  if (normalizedQ.includes('skill') || normalizedQ.includes('tech') || normalizedQ.includes('stack') || normalizedQ.includes('know') || normalizedQ.includes('expertise') || normalizedQ.includes('arsenal'))
    return `My technical skills are: **${techList}**.`;

  if (Q === 'what frontend skills do you have?' || Q === 'what frontend skills do you have')
    return 'My frontend skills include: HTML, CSS, JavaScript, React, Next.js, Tailwind CSS.';

  if (Q === 'do you know html?' || Q === 'do you know html' || Q === 'can you code in css?' || Q === 'can you code in css' || Q === 'are you proficient in javascript?' || Q === 'are you proficient in javascript' || Q === 'do you know react?' || Q === 'do you know react' || Q === 'what frameworks do you use?' || Q === 'what frameworks do you use' || Q === 'what frontend frameworks do you prefer?' || Q === 'what frontend frameworks do you prefer' || Q === 'are you a react developer?' || Q === 'are you a react developer')
    return `Yes! My frontend stack is: React, Next.js, Tailwind CSS, along with HTML, CSS, and JavaScript.`;

  if (Q === 'do you know tailwind css?' || Q === 'do you know tailwind css' || Q === 'are you good with html/css?' || Q === 'are you good with html css')
    return 'Yes, I am comfortable with HTML, CSS, and Tailwind CSS for building responsive designs.';

  if (Q === 'can you build responsive websites?' || Q === 'can you build responsive websites' || Q === 'what ui technologies do you use?' || Q === 'what ui technologies do you use')
    return 'Yes, I build responsive websites. I use Tailwind CSS and modern CSS techniques for responsive UI.';

  if (Q === 'do you know next.js?' || Q === 'do you know nextjs')
    return 'Yes, I use Next.js for building full-stack applications — like my Abhayapuri Care Hospital project.';

  if (Q === 'how good are you with css?' || Q === 'how good are you with css' || Q === 'what is your javascript level?' || Q === 'what is your javascript level')
    return 'I am proficient — I use CSS (including Tailwind CSS) and JavaScript to build responsive, interactive web applications.';

  if (Q === 'what tools do you use?' || Q === 'what tools do you use' || Q === 'do you use git?' || Q === 'do you use git' || Q === 'do you use github?' || Q === 'do you use github' || Q === 'what is your version control system?' || Q === 'what is your version control system')
    return 'I use **Git** and **GitHub** for version control.';

  if (Q === 'what ide do you use?' || Q === 'what ide do you use' || Q === 'do you use vs code?' || Q === 'do you use vs code' || Q === 'what development tools are you familiar with?' || Q === 'what development tools are you familiar with')
    return 'I use **VS Code** as my primary IDE.';

  if (Q === 'what programming languages do you know?' || Q === 'what programming languages do you know' || Q === 'what languages can you code in?' || Q === 'what languages can you code in' || Q === 'how many languages can you code in?' || Q === 'how many languages can you code in')
    return 'I code in **HTML, CSS, JavaScript, C, and C++**.';

  if (Q === 'do you know c?' || Q === 'do you know c' || Q === 'can you program in c++?' || Q === 'can you program in c++' || Q === 'what is your proficiency in c++?' || Q === 'what is your proficiency in c++' || Q === 'are you good at problem-solving in c?' || Q === 'are you good at problem solving in c')
    return 'Yes, I know C and C++. I have a collection of C Language Programs and understand fundamental programming concepts.';

  if (Q === 'what backend languages do you know?' || Q === 'what backend languages do you know')
    return 'I primarily use C and C++ for programming fundamentals. I am expanding into Node.js.';

  if (Q === 'do you know python?' || Q === 'do you know python' || Q === 'do you know java?' || Q === 'do you know java')
    return 'Python and Java are not listed in my current technical skills. My focus is JavaScript, React, Next.js, C, and C++.';

  if (Q === 'what programming skills do you have?' || Q === 'what programming skills do you have' || Q === 'what is your strongest language?' || Q === 'what is your strongest language' || Q === 'what is your best skill?' || Q === 'what is your best skill')
    return `My strongest languages are JavaScript, React, and Next.js for web development, with strong fundamentals in C and C++.`;

  if (Q === 'do you know ms word?' || Q === 'do you know ms word' || Q === 'can you use ms excel?' || Q === 'can you use ms excel' || Q === 'do you have data entry skills?' || Q === 'do you have data entry skills' || Q === 'what office tools can you use?' || Q === 'what office tools can you use' || Q === 'are you good with excel?' || Q === 'are you good with excel' || Q === 'what are your data entry skills?' || Q === 'what are your data entry skills' || Q === 'what is your skill level in ms office?' || Q === 'what is your skill level in ms office')
    return 'Yes, I am proficient in **MS Excel** and familiar with MS Office tools.';

  if (Q === 'can you work with databases?' || Q === 'can you work with databases')
    return FB;

  if (Q === 'what other skills do you have?' || Q === 'what other skills do you have' || Q === 'what are your non-technical skills?' || Q === 'what are your non-technical skills')
    return `My non-technical (soft) skills are: **${softList}**.`;

  if (Q === 'what skills are you currently learning?' || Q === 'what skills are you currently learning' || Q === 'what skills do you want to learn?' || Q === 'what skills do you want to learn' || Q === 'what technology excites you?' || Q === 'what technology excites you')
    return 'I am continuing to improve my React, Next.js skills and expanding into backend technologies.';

  if (Q === 'do you have any certification in these skills?' || Q === 'do you have any certification in these skills' || Q === 'how did you learn these skills?' || Q === 'how did you learn these skills' || Q === 'where did you acquire your skills?' || Q === 'where did you acquire your skills' || Q === 'are your skills self-taught?' || Q === 'are your skills self taught')
    return 'I learned through college (B.Tech CSE), online courses (KG Coding, NPTEL), and hands-on project building.';

  if (Q === 'can you provide examples of your work?' || Q === 'can you provide examples of your work')
    return `Yes! Check my 9 projects:\n${projList}`;

  if (Q === 'what is your favorite technology to work with?' || Q === 'what is your favorite technology to work with' || Q === 'what technologies are you most comfortable with?' || Q === 'what technologies are you most comfortable with')
    return 'I am most comfortable with React, Next.js, and Tailwind CSS — they make building beautiful, responsive apps fast and enjoyable.';

  // ============ SKILL LEVELS / EXPERIENCE (UNSUPPORTED) ============
  if (Q === 'how many years of html experience?' || Q === 'how many years of html experience' || Q === 'rate your css skills out of 10.' || Q === 'rate your css skills out of 10' || Q === 'can you do css animations?' || Q === 'can you do css animations' || Q === 'do you know css grid?' || Q === 'do you know css grid' || Q === 'are you good with flexbox?' || Q === 'are you good with flexbox' || Q === 'can you make a website from a figma design?' || Q === 'can you make a website from a figma design' || Q === 'do you know figma?' || Q === 'do you know figma' || Q === 'can you convert psd to html?' || Q === 'can you convert psd to html' || Q === 'what\'s your javascript level — beginner, intermediate, advanced?' || Q === 'whats your javascript level' || Q === 'do you know es6 features?' || Q === 'do you know es6 features' || Q === 'can you explain closures in javascript?' || Q === 'can you explain closures in javascript' || Q === 'what\'s your understanding of promises?' || Q === 'whats your understanding of promises' || Q === 'do you know async/await?' || Q === 'do you know async await' || Q === 'are you comfortable with apis?' || Q === 'are you comfortable with apis' || Q === 'can you do dom manipulation?' || Q === 'can you do dom manipulation' || Q === 'what frontend libraries do you use?' || Q === 'what frontend libraries do you use' || Q === 'have you used bootstrap?' || Q === 'have you used bootstrap' || Q === 'do you prefer tailwind or bootstrap?' || Q === 'do you prefer tailwind or bootstrap' || Q === 'why tailwind over bootstrap?' || Q === 'why tailwind over bootstrap' || Q === 'what\'s your favorite css framework?' || Q === 'whats your favorite css framework' || Q === 'how many react projects have you built?' || Q === 'how many react projects have you built' || Q === 'do you know react hooks?' || Q === 'do you know react hooks' || Q === 'can you explain usestate and useeffect?' || Q === 'can you explain usestate and useeffect' || Q === 'have you used react router?' || Q === 'have you used react router' || Q === 'do you know redux?' || Q === 'do you know redux' || Q === 'what\'s your state management approach?' || Q === 'whats your state management approach' || Q === 'have you built any full react apps?' || Q === 'have you built any full react apps' || Q === 'can you do server-side rendering?' || Q === 'can you do server side rendering' || Q === 'do you know next.js deeply?' || Q === 'do you know nextjs deeply' || Q === 'have you deployed next.js apps?' || Q === 'have you deployed nextjs apps' || Q === 'what hosting platforms do you use?' || Q === 'what hosting platforms do you use' || Q === 'vercel or netlify?' || Q === 'vercel or netlify' || Q === 'have you used firebase?' || Q === 'have you used firebase' || Q === 'do you know any backend?' || Q === 'do you know any backend' || Q === 'can you work with node.js?' || Q === 'can you work with nodejs' || Q === 'have you tried express.js?' || Q === 'have you tried expressjs' || Q === 'do you know mongodb?' || Q === 'do you know mongodb' || Q === 'what database do you prefer?' || Q === 'what database do you prefer' || Q === 'sql or nosql?' || Q === 'sql or nosql' || Q === 'can you write apis?' || Q === 'can you write apis' || Q === 'have you built rest apis?' || Q === 'have you built rest apis' || Q === 'do you know graphql?' || Q === 'do you know graphql' || Q === 'what\'s your full-stack capability?' || Q === 'whats your full stack capability' || Q === 'are you mern stack?' || Q === 'are you mern stack' || Q === 'what exactly is your stack?' || Q === 'what exactly is your stack' || Q === 'which os do you code on?' || Q === 'which os do you code on' || Q === 'windows, mac, or linux?' || Q === 'windows mac or linux' || Q === 'do you use any linux distro?' || Q === 'do you use any linux distro' || Q === 'what\'s your terminal preference?' || Q === 'whats your terminal preference' || Q === 'do you use npm or yarn?' || Q === 'do you use npm or yarn' || Q === 'what vs code extensions do you use?' || Q === 'what vs code extensions do you use' || Q === 'can you share your vs code setup?' || Q === 'can you share your vs code setup' || Q === 'what theme do you use in your ide?' || Q === 'what theme do you use in your ide' || Q === 'do you use copilot or any ai coding tools?' || Q === 'do you use copilot or any ai coding tools' || Q === 'are you using chatgpt for coding?' || Q === 'are you using chatgpt for coding')
    return FB;

  if (Q === 'how do you debug your code?' || Q === 'how do you debug your code' || Q === 'what\'s your go-to debugging technique?' || Q === 'whats your go to debugging technique' || Q === 'do you write tests?' || Q === 'do you write tests' || Q === 'have you done unit testing?' || Q === 'have you done unit testing' || Q === 'do you know jest?' || Q === 'do you know jest' || Q === 'what\'s your code quality practice?' || Q === 'whats your code quality practice' || Q === 'do you follow any coding standards?' || Q === 'do you follow any coding standards' || Q === 'are you familiar with agile?' || Q === 'are you familiar with agile' || Q === 'have you worked in sprints?' || Q === 'have you worked in sprints' || Q === 'do you use project management tools?' || Q === 'do you use project management tools' || Q === 'trello, jira, or asana?' || Q === 'trello jira or asana' || Q === 'what\'s your development workflow?' || Q === 'whats your development workflow' || Q === 'how do you plan a project?' || Q === 'how do you plan a project' || Q === 'do you make wireframes first?' || Q === 'do you make wireframes first' || Q === 'what\'s your design-to-code process?' || Q === 'whats your design to code process' || Q === 'do you do code reviews?' || Q === 'do you do code reviews' || Q === 'have you ever reviewed someone\'s code?' || Q === 'have you ever reviewed someones code' || Q === 'what version control workflow do you use?' || Q === 'what version control workflow do you use' || Q === 'git branching strategy?' || Q === 'git branching strategy' || Q === 'do you commit regularly?' || Q === 'do you commit regularly' || Q === 'what\'s your commit message style?' || Q === 'whats your commit message style' || Q === 'have you ever messed up a git repo?' || Q === 'have you ever messed up a git repo' || Q === 'how did you fix it?' || Q === 'how did you fix it' || Q === 'do you use docker?' || Q === 'do you use docker' || Q === 'any devops knowledge?' || Q === 'any devops knowledge' || Q === 'have you set up ci/cd?' || Q === 'have you set up cicd' || Q === 'what\'s your deployment process?' || Q === 'whats your deployment process' || Q === 'how do you ensure website performance?' || Q === 'how do you ensure website performance' || Q === 'do you optimize for seo?' || Q === 'do you optimize for seo' || Q === 'what\'s your page speed score target?' || Q === 'whats your page speed score target' || Q === 'do you care about accessibility?' || Q === 'do you care about accessibility' || Q === 'have you built accessible websites?' || Q === 'have you built accessible websites' || Q === 'do you follow wcag guidelines?' || Q === 'do you follow wcag guidelines' || Q === 'what\'s your approach to responsive design?' || Q === 'whats your approach to responsive design' || Q === 'mobile-first or desktop-first?' || Q === 'mobile first or desktop first' || Q === 'how do you test across devices?' || Q === 'how do you test across devices' || Q === 'what browsers do you support?' || Q === 'what browsers do you support' || Q === 'cross-browser compatibility experience?' || Q === 'cross browser compatibility experience' || Q === 'have you dealt with browser-specific bugs?' || Q === 'have you dealt with browser specific bugs')
    return FB;

  if (Q === 'how many years of experience with react?' || Q === 'how many years of experience with react' || Q === 'how many projects have you built with html/css?' || Q === 'how many projects have you built with html css' || Q === 'what is your proficiency level in javascript?' || Q === 'what is your proficiency level in javascript' || Q === 'can you build a full website from scratch?' || Q === 'can you build a full website from scratch' || Q === 'what is your experience with front-end development?' || Q === 'what is your experience with front end development' || Q === 'how do you rate your skills?' || Q === 'how do you rate your skills' || Q === 'are you a beginner or expert in react?' || Q === 'are you a beginner or expert in react' || Q === 'what is your competency in c?' || Q === 'what is your competency in c' || Q === 'can you handle end-to-end project development?' || Q === 'can you handle end to end project development')
    return 'I have built multiple projects with React, Next.js, HTML, and CSS. I can build full websites from scratch — check my 9 projects for proof!';

  if (Q === 'what areas are you skilled in?' || Q === 'what areas are you skilled in')
    return `I am skilled in: ${techList}.`;





  // ============ FULL STACK PROJECT SPECIFIC ============
  if (Q === 'which is the full stack project' || Q === 'which is the full stack project?' || Q === 'which is your full stack project' || Q === 'which is your full stack project?' || /which is the full stack project/i.test(Q)) {
    return H ? 'Mera **full-stack project** **Abhayapuri Care Hospital** hai — Next.js, Tailwind CSS, Framer Motion ke saath.' : 'My **full-stack project** is **Abhayapuri Care Hospital** — built with Next.js, Tailwind CSS, and Framer Motion.';
  }

  // ============ PROJECTS (EXACT MATCHES) ============
  if (Q === 'what is your best project?' || Q === 'what is your best project' || Q === 'what\'s your flagship project?' || Q === 'whats your flagship project' || Q === 'which project are you most famous for?' || Q === 'which project are you most famous for' || Q === 'show me your star project.' || Q === 'show me your star project' || Q === 'what project truly represents your skills?' || Q === 'what project truly represents your skills' || Q === 'which project got you the most praise?' || Q === 'which project got you the most praise')
    return 'My flagship project is **Abhayapuri Care Hospital** — a full-stack hospital management system built with Next.js, Tailwind CSS, and Framer Motion.';

  if (Q === 'what project are you most proud of?' || Q === 'what project are you most proud of')
    return 'I am most proud of **Abhayapuri Care Hospital** — it\'s a full-stack project that demonstrates my skills with Next.js, Tailwind CSS, and Framer Motion.';

  if (Q === 'what is your latest project?' || Q === 'what is your latest project')
    return 'My latest project is listed on my portfolio. Check my GitHub for the most recent updates!';

  if (Q === 'what project has the most features?' || Q === 'what project has the most features')
    return 'The **Abhayapuri Care Hospital** project has the most features — it\'s a full-stack hospital management system.';

  if (Q === 'which one took the longest?' || Q === 'which one took the longest' || Q === 'quickest project you built?' || Q === 'quickest project you built' || Q === 'which project was the easiest?' || Q === 'which project was the easiest' || Q === 'hardest project you\'ve finished?' || Q === 'hardest project youve finished')
    return FB;

  if (Q === 'do you have any live projects?' || Q === 'do you have any live projects' || Q === 'where can i see your projects?' || Q === 'where can i see your projects')
    return 'You can see all my projects on my portfolio website and GitHub: https://github.com/ashraful-alom-1';

  if (Q === 'can you give project details?' || Q === 'can you give project details')
    return `Sure! Here are the details:\n${projList}`;

  if (Q === 'what was your first project?' || Q === 'what was your first project')
    return 'My early projects include C Language Programs and the Basic Login Page — starting from fundamentals and building up to full-stack applications.';

  // ============ ABHAYAPURI CARE HOSPITAL (flexible) ============
  if (hasAnyQuery(Q, ['abhayapuri', 'care hospital', 'hospital project', 'hospital management', 'healthcare project', 'tell me about abhayapuri', 'abhayapuri care hospital project', 'about abhayapuri', 'what is abhayapuri'])) {
    return '**Abhayapuri Care Hospital** is a full-stack hospital management system built with **Next.js, Tailwind CSS, and Framer Motion**. It features a responsive UI and modern design.';
  }


  // ============ ABHAYAPURI CARE HOSPITAL ============
  if (Q === 'tell me about the abhayapuri care hospital project.' || Q === 'tell me about the abhayapuri care hospital project' || Q === 'what is the hospital management project?' || Q === 'what is the hospital management project' || Q === 'what is your healthcare project about?' || Q === 'what is your healthcare project about' || Q === 'tell me about your full-stack project.' || Q === 'tell me about your full stack project' || Q === 'what is your healthcare management app?' || Q === 'what is your healthcare management app')
    return '**Abhayapuri Care Hospital** is a full-stack hospital management system built with **Next.js, Tailwind CSS, and Framer Motion**. It features a responsive UI and modern design.';

  if (Q === 'what project uses next.js?' || Q === 'what project uses nextjs' || Q === 'which project uses tailwind css?' || Q === 'which project uses tailwind css' || Q === 'what project has framer motion?' || Q === 'what project has framer motion')
    return 'The **Abhayapuri Care Hospital** project uses Next.js, Tailwind CSS, and Framer Motion.';

  if (Q === 'what features does the hospital project have?' || Q === 'what features does the hospital project have' || Q === 'does it have appointment booking?' || Q === 'does it have appointment booking' || Q === 'does it have a responsive ui?' || Q === 'does it have a responsive ui' || Q === 'what tech stack for the hospital project?' || Q === 'what tech stack for the hospital project' || Q === 'is the hospital project full-stack?' || Q === 'is the hospital project full stack' || Q === 'what is the purpose of the hospital project?' || Q === 'what is the purpose of the hospital project' || Q === 'how did you build the hospital website?' || Q === 'how did you build the hospital website')
    return '**Abhayapuri Care Hospital** — Full Stack project. Tech: Next.js, Tailwind CSS, Framer Motion. It demonstrates hospital management functionality with a clean, responsive UI.';

  if (Q === 'what challenges did you face in the healthcare project?' || Q === 'what challenges did you face in the healthcare project' || Q === 'what was the hardest part of this project?' || Q === 'what was the hardest part of this project' || Q === 'any special feature you\'re proud of?' || Q === 'any special feature youre proud of')
    return FB;

  if (Q === 'what\'s the full name of the hospital project?' || Q === 'whats the full name of the hospital project')
    return 'The full name is **Abhayapuri Care Hospital**.';

  if (Q === 'is abhayapuri a real hospital?' || Q === 'is abhayapuri a real hospital' || Q === 'where is abhayapuri care hospital?' || Q === 'where is abhayapuri care hospital' || Q === 'is the hospital project live?' || Q === 'is the hospital project live' || Q === 'can patients actually book appointments?' || Q === 'can patients actually book appointments' || Q === 'does it have a doctor\'s dashboard?' || Q === 'does it have a doctors dashboard' || Q === 'is there a patient login?' || Q === 'is there a patient login' || Q === 'how does the appointment system work?' || Q === 'how does the appointment system work' || Q === 'is there a payment gateway?' || Q === 'is there a payment gateway' || Q === 'does it store medical records?' || Q === 'does it store medical records' || Q === 'is it hipaa compliant?' || Q === 'is it hipaa compliant' || Q === 'how secure is patient data?' || Q === 'how secure is patient data' || Q === 'what database does the hospital project use?' || Q === 'what database does the hospital project use' || Q === 'did you integrate any third-party apis?' || Q === 'did you integrate any third party apis' || Q === 'is there an admin panel?' || Q === 'is there an admin panel' || Q === 'how many pages does the hospital site have?' || Q === 'how many pages does the hospital site have' || Q === 'can i see a demo?' || Q === 'can i see a demo' || Q === 'do you have a video walkthrough?' || Q === 'do you have a video walkthrough' || Q === 'what inspired the hospital project?' || Q === 'what inspired the hospital project' || Q === 'did a hospital ask you to build it?' || Q === 'did a hospital ask you to build it' || Q === 'was it for a college project submission?' || Q === 'was it for a college project submission' || Q === 'how many days did it take?' || Q === 'how many days did it take' || Q === 'did you do it alone or in a team?' || Q === 'did you do it alone or in a team' || Q === 'what was your specific contribution?' || Q === 'what was your specific contribution' || Q === 'how did you handle state management?' || Q === 'how did you handle state management' || Q === 'did you use any ui library for the hospital project?' || Q === 'did you use any ui library for the hospital project' || Q === 'is the design original or inspired?' || Q === 'is the design original or inspired' || Q === 'how did you come up with the ui?' || Q === 'how did you come up with the ui')
    return FB;

  // ============ ECOMMERCE ============
  if (Q === 'tell me about your ecommerce project.' || Q === 'tell me about your ecommerce project' || Q === 'what is your ecommerce website about?' || Q === 'what is your ecommerce website about')
    return '**Ecommerce Website** — Shopping cart, product listing, and responsive design. Built with Vanilla JavaScript.';

  if (Q === 'what did you use to build the ecommerce site?' || Q === 'what did you use to build the ecommerce site' || Q === 'what is the tech stack for the ecommerce project?' || Q === 'what is the tech stack for the ecommerce project' || Q === 'did you use vanilla javascript for it?' || Q === 'did you use vanilla javascript for it')
    return 'The Ecommerce Website was built using **Vanilla JavaScript** with responsive design.';

  if (Q === 'is the ecommerce site responsive?' || Q === 'is the ecommerce site responsive' || Q === 'does it have a shopping cart?' || Q === 'does it have a shopping cart' || Q === 'what features does your ecommerce site have?' || Q === 'what features does your ecommerce site have' || Q === 'what is the product listing feature?' || Q === 'what is the product listing feature' || Q === 'how does the shopping cart work?' || Q === 'how does the shopping cart work' || Q === 'is the ecommerce project dynamic?' || Q === 'is the ecommerce project dynamic' || Q === 'what dom interactions did you implement?' || Q === 'what dom interactions did you implement')
    return 'The **Ecommerce Website** features a shopping cart, product listing, and responsive design — all built with Vanilla JavaScript.';

  if (Q === 'does your ecommerce site actually sell products?' || Q === 'does your ecommerce site actually sell products' || Q === 'is there real payment integration?' || Q === 'is there real payment integration' || Q === 'demo payment or real stripe/razorpay?' || Q === 'demo payment or real stripe razorpay' || Q === 'how many products are listed?' || Q === 'how many products are listed' || Q === 'is there a product filter?' || Q === 'is there a product filter' || Q === 'does it have search functionality?' || Q === 'does it have search functionality' || Q === 'is there a product detail page?' || Q === 'is there a product detail page' || Q === 'can you add items to a wishlist?' || Q === 'can you add items to a wishlist' || Q === 'is there user registration?' || Q === 'is there user registration' || Q === 'how is cart data stored?' || Q === 'how is cart data stored' || Q === 'localstorage or database for cart?' || Q === 'localstorage or database for cart' || Q === 'does the cart persist after refresh?' || Q === 'does the cart persist after refresh' || Q === 'how did you implement the checkout flow?' || Q === 'how did you implement the checkout flow' || Q === 'is there order confirmation?' || Q === 'is there order confirmation' || Q === 'does it send email notifications?' || Q === 'does it send email notifications' || Q === 'any backend for the ecommerce site?' || Q === 'any backend for the ecommerce site' || Q === 'is it purely frontend?' || Q === 'is it purely frontend' || Q === 'how did you create product data?' || Q === 'how did you create product data' || Q === 'is it hardcoded or dynamic?' || Q === 'is it hardcoded or dynamic' || Q === 'did you use any fake api?' || Q === 'did you use any fake api' || Q === 'how\'s the performance with many products?' || Q === 'hows the performance with many products' || Q === 'is there lazy loading?' || Q === 'is there lazy loading' || Q === 'any image optimization done?' || Q === 'any image optimization done' || Q === 'how do you handle out-of-stock?' || Q === 'how do you handle out of stock' || Q === 'is there a quantity selector?' || Q === 'is there a quantity selector' || Q === 'can i apply coupon codes?' || Q === 'can i apply coupon codes' || Q === 'is there a review section?' || Q === 'is there a review section' || Q === 'did you implement ratings?' || Q === 'did you implement ratings' || Q === 'what was the ecommerce site inspired by?' || Q === 'what was the ecommerce site inspired by' || Q === 'amazon clone or original design?' || Q === 'amazon clone or original design')
    return FB;

  // ============ E-LEARNING ============
  if (Q === 'what is your e-learning platform?' || Q === 'what is your e learning platform' || Q === 'tell me about the e-learning project.' || Q === 'tell me about the e learning project')
    return '**E-Learning Platform** — Course layout and user-focused UI. Built with responsive design.';

  if (Q === 'what is the course layout like?' || Q === 'what is the course layout like' || Q === 'is the e-learning platform responsive?' || Q === 'is the e learning platform responsive' || Q === 'what features does the e-learning site have?' || Q === 'what features does the e learning site have' || Q === 'how did you design the e-learning ui?' || Q === 'how did you design the e learning ui' || Q === 'is it user-focused?' || Q === 'is it user focused')
    return 'The **E-Learning Platform** features a clean course layout, user-focused UI, and fully responsive design.';

  if (Q === 'what interactive lessons are there?' || Q === 'what interactive lessons are there' || Q === 'what problem does the e-learning platform solve?' || Q === 'what problem does the e learning platform solve' || Q === 'what can i learn on your e-learning site?' || Q === 'what can i learn on your e learning site' || Q === 'is there actual course content?' || Q === 'is there actual course content' || Q === 'how many courses are there?' || Q === 'how many courses are there' || Q === 'are there video lessons?' || Q === 'are there video lessons' || Q === 'is it like udemy or coursera?' || Q === 'is it like udemy or coursera' || Q === 'do users need to log in?' || Q === 'do users need to log in' || Q === 'is there progress tracking?' || Q === 'is there progress tracking' || Q === 'can you bookmark lessons?' || Q === 'can you bookmark lessons' || Q === 'is there a quiz feature?' || Q === 'is there a quiz feature' || Q === 'does it give certificates?' || Q === 'does it give certificates' || Q === 'is the content original?' || Q === 'is the content original' || Q === 'where did you get the course material?' || Q === 'where did you get the course material' || Q === 'did you write the content yourself?' || Q === 'did you write the content yourself' || Q === 'how is the course structured?' || Q === 'how is the course structured' || Q === 'module-based or lesson-based?' || Q === 'module based or lesson based' || Q === 'is there a discussion forum?' || Q === 'is there a discussion forum' || Q === 'can students interact?' || Q === 'can students interact' || Q === 'is there an instructor profile?' || Q === 'is there an instructor profile' || Q === 'how responsive is the learning platform?' || Q === 'how responsive is the learning platform' || Q === 'does it work well on mobile for learning?' || Q === 'does it work well on mobile for learning' || Q === 'any accessibility features for learners?' || Q === 'any accessibility features for learners' || Q === 'what age group is it for?' || Q === 'what age group is it for' || Q === 'is it for kids or adults?' || Q === 'is it for kids or adults' || Q === 'what was the vision behind this project?' || Q === 'what was the vision behind this project' || Q === 'edtech inspired?' || Q === 'edtech inspired' || Q === 'do you plan to launch it for real?' || Q === 'do you plan to launch it for real' || Q === 'would you add live classes?' || Q === 'would you add live classes' || Q === 'how would you scale it?' || Q === 'how would you scale it' || Q === 'what tech would you use for video streaming?' || Q === 'what tech would you use for video streaming' || Q === 'is there any gamification?' || Q === 'is there any gamification')
    return FB;

  // ============ CAR SHOWROOM ============
  if (Q === 'tell me about the car showroom website.' || Q === 'tell me about the car showroom website' || Q === 'what is your car showroom project?' || Q === 'what is your car showroom project')
    return '**Car Showroom Website** — Automotive-inspired design with smooth animations. Built with responsive design.';

  if (Q === 'does it have animations?' || Q === 'does it have animations' || Q === 'is the car website responsive?' || Q === 'is the car website responsive' || Q === 'what design style is it?' || Q === 'what design style is it' || Q === 'how did you create smooth animations?' || Q === 'how did you create smooth animations' || Q === 'what is the car showroom site about?' || Q === 'what is the car showroom site about')
    return 'The **Car Showroom Website** features automotive design, smooth animations, and fully responsive layout.';

  if (Q === 'what automotive-inspired design elements?' || Q === 'what automotive inspired design elements')
    return 'It features an automotive-inspired design with smooth animations and responsive layout.';

  if (Q === 'what car brands are on the showroom site?' || Q === 'what car brands are on the showroom site' || Q === 'is it for a specific brand or generic?' || Q === 'is it for a specific brand or generic' || Q === 'are the cars real models?' || Q === 'are the cars real models' || Q === 'did you use car images from the internet?' || Q === 'did you use car images from the internet' || Q === 'is there a 3d car viewer?' || Q === 'is there a 3d car viewer' || Q === 'how did you do the animations?' || Q === 'how did you do the animations' || Q === 'css animations or javascript?' || Q === 'css animations or javascript' || Q === 'what animation library did you use?' || Q === 'what animation library did you use' || Q === 'is there a test drive booking?' || Q === 'is there a test drive booking' || Q === 'can i see car interiors?' || Q === 'can i see car interiors' || Q === 'is there a price filter?' || Q === 'is there a price filter' || Q === 'does it compare cars?' || Q === 'does it compare cars' || Q === 'any parallax scrolling effects?' || Q === 'any parallax scrolling effects' || Q === 'how smooth are the animations?' || Q === 'how smooth are the animations' || Q === 'what was the performance impact of animations?' || Q === 'what was the performance impact of animations' || Q === 'did you optimize for performance?' || Q === 'did you optimize for performance' || Q === 'is the design luxury or sporty?' || Q === 'is the design luxury or sporty' || Q === 'how did you choose the color scheme?' || Q === 'how did you choose the color scheme' || Q === 'what makes it visually appealing?' || Q === 'what makes it visually appealing' || Q === 'was it a design-first approach?' || Q === 'was it a design first approach')
    return FB;

  // ============ JUSTICE DESK ============
  if (Q === 'what is the justice desk project?' || Q === 'what is the justice desk project' || Q === 'tell me about your legal service website.' || Q === 'tell me about your legal service website')
    return '**Justice Desk** — Multi-page legal service website built with HTML, CSS, and JavaScript.';

  if (Q === 'is justice desk multi-page?' || Q === 'is justice desk multi page' || Q === 'what is the tech stack for justice desk?' || Q === 'what is the tech stack for justice desk' || Q === 'is it built with html, css, and js?' || Q === 'is it built with html css and js' || Q === 'what features does justice desk have?' || Q === 'what features does justice desk have' || Q === 'is the legal website responsive?' || Q === 'is the legal website responsive' || Q === 'what is the professional ui like?' || Q === 'what is the professional ui like')
    return '**Justice Desk** is a multi-page legal service website with a professional UI, built using HTML, CSS, and JavaScript.';

  if (Q === 'what does justice desk actually do?' || Q === 'what does justice desk actually do' || Q === 'is it for lawyers or clients?' || Q === 'is it for lawyers or clients' || Q === 'can i book a legal consultation?' || Q === 'can i book a legal consultation' || Q === 'is there case tracking?' || Q === 'is there case tracking' || Q === 'how many service pages does it have?' || Q === 'how many service pages does it have' || Q === 'is it a template or custom built?' || Q === 'is it a template or custom built')
    return FB;

  // ============ TRAVEL WEBSITE ============
  if (Q === 'tell me about your travel website.' || Q === 'tell me about your travel website' || Q === 'what is the travel project about?' || Q === 'what is the travel project about')
    return '**Travel Website** — Destination showcase with interactive UI, built with responsive design.';

  if (Q === 'does it showcase destinations?' || Q === 'does it showcase destinations' || Q === 'does it have a booking-style ui?' || Q === 'does it have a booking style ui' || Q === 'is the travel site interactive?' || Q === 'is the travel site interactive' || Q === 'is it responsive?' || Q === 'is it responsive' || Q === 'what design elements did you use?' || Q === 'what design elements did you use')
    return 'The **Travel Website** showcases destinations with an interactive UI and fully responsive design.';

  if (Q === 'what\'s unique about the travel website?' || Q === 'whats unique about the travel website' || Q === 'which destinations does the travel site feature?' || Q === 'which destinations does the travel site feature' || Q === 'is it for a travel agency?' || Q === 'is it for a travel agency' || Q === 'does it have a booking calendar?' || Q === 'does it have a booking calendar' || Q === 'how interactive is the travel site?' || Q === 'how interactive is the travel site')
    return FB;

  // ============ INTERACTIVE CALCULATOR ============
  if (Q === 'tell me about your calculator project.' || Q === 'tell me about your calculator project' || Q === 'what is the interactive calculator?' || Q === 'what is the interactive calculator')
    return '**Interactive Calculator** — Real-time calculations with keyboard input support. Built with JavaScript.';

  if (Q === 'does it support keyboard input?' || Q === 'does it support keyboard input' || Q === 'is there dom manipulation in the calculator?' || Q === 'is there dom manipulation in the calculator' || Q === 'can it do real-time calculations?' || Q === 'can it do real time calculations' || Q === 'what math operations does it support?' || Q === 'what math operations does it support' || Q === 'is the calculator a frontend project?' || Q === 'is the calculator a frontend project' || Q === 'how did you build the calculator?' || Q === 'how did you build the calculator')
    return 'The **Interactive Calculator** performs real-time calculations with keyboard input support, built using JavaScript and DOM manipulation.';

  if (Q === 'what can the calculator do exactly?' || Q === 'what can the calculator do exactly' || Q === 'scientific or basic calculator?' || Q === 'scientific or basic calculator' || Q === 'does it handle edge cases well?' || Q === 'does it handle edge cases well' || Q === 'what happens if i divide by zero?' || Q === 'what happens if i divide by zero' || Q === 'can i chain operations on the calculator?' || Q === 'can i chain operations on the calculator' || Q === 'is the calculator mobile-friendly?' || Q === 'is the calculator mobile friendly')
    return FB;

  // ============ BASIC LOGIN PAGE ============
  if (Q === 'tell me about your login page project.' || Q === 'tell me about your login page project' || Q === 'what is the login interface?' || Q === 'what is the login interface')
    return '**Basic Login Page** — Form validation and authentication UI design. Built with HTML, CSS, and JavaScript.';

  if (Q === 'does it have form validation?' || Q === 'does it have form validation' || Q === 'is the login page responsive?' || Q === 'is the login page responsive' || Q === 'what authentication ui design?' || Q === 'what authentication ui design' || Q === 'is it just a frontend login?' || Q === 'is it just a frontend login' || Q === 'what validation does it include?' || Q === 'what validation does it include' || Q === 'how is the authentication ui designed?' || Q === 'how is the authentication ui designed')
    return 'The **Basic Login Page** includes form validation and clean authentication UI design.';

  if (Q === 'does the login page connect to any backend?' || Q === 'does the login page connect to any backend' || Q === 'is it just a mockup?' || Q === 'is it just a mockup' || Q === 'what validation rules did you apply?' || Q === 'what validation rules did you apply' || Q === 'does it check email format?' || Q === 'does it check email format' || Q === 'is there password strength checking?' || Q === 'is there password strength checking' || Q === 'can i actually sign up?' || Q === 'can i actually sign up')
    return FB;

  // ============ C LANGUAGE PROGRAMS ============
  if (Q === 'what are your c language programs?' || Q === 'what are your c language programs' || Q === 'tell me about your c programming collection.' || Q === 'tell me about your c programming collection')
    return '**C Language Programs** — A collection of fundamental programming concepts and logic building exercises in C.';

  if (Q === 'what c problems did you solve?' || Q === 'what c problems did you solve' || Q === 'what concepts do the c programs cover?' || Q === 'what concepts do the c programs cover' || Q === 'are they fundamental programming concepts?' || Q === 'are they fundamental programming concepts' || Q === 'is it for logic building?' || Q === 'is it for logic building')
    return 'The C Language Programs cover fundamental programming concepts and are designed for logic building.';

  if (Q === 'how many c programs do you have?' || Q === 'how many c programs do you have' || Q === 'are the c solutions available?' || Q === 'are the c solutions available' || Q === 'what\'s in your c programs collection?' || Q === 'whats in your c programs collection' || Q === 'how many c programs total?' || Q === 'how many c programs total' || Q === 'what\'s the most complex c program you wrote?' || Q === 'whats the most complex c program you wrote' || Q === 'data structures in c?' || Q === 'data structures in c' || Q === 'did you implement algorithms?' || Q === 'did you implement algorithms' || Q === 'sorting, searching programs?' || Q === 'sorting searching programs' || Q === 'any game in c?' || Q === 'any game in c' || Q === 'did you do file handling programs?' || Q === 'did you do file handling programs' || Q === 'are the c programs commented?' || Q === 'are the c programs commented' || Q === 'can a beginner learn from your c code?' || Q === 'can a beginner learn from your c code' || Q === 'do you still write c code?' || Q === 'do you still write c code' || Q === 'is c your base language?' || Q === 'is c your base language')
    return FB;

// ============ PROJECT COUNT ============
  if (normalizedQ.includes('project') || normalizedQ.includes('work') || normalizedQ.includes('portfolio') || normalizedQ.includes('built'))
    return `I have completed 9 projects:\n${projList}`;



  // ============ PROJECT DEEP DIVES ============
  if (Q === 'what was your role in these projects?' || Q === 'what was your role in these projects' || Q === 'did you work on these alone?' || Q === 'did you work on these alone' || Q === 'were these solo projects?' || Q === 'were these solo projects' || Q === 'are these academic projects?' || Q === 'are these academic projects' || Q === 'what was the most challenging project?' || Q === 'what was the most challenging project' || Q === 'which project taught you the most?' || Q === 'which project taught you the most' || Q === 'what problem does each project solve?' || Q === 'what problem does each project solve' || Q === 'how long did each project take?' || Q === 'how long did each project take' || Q === 'can you walk me through one project?' || Q === 'can you walk me through one project' || Q === 'how did you approach these projects?' || Q === 'how did you approach these projects' || Q === 'what was your development process?' || Q === 'what was your development process' || Q === 'did you use any apis in your projects?' || Q === 'did you use any apis in your projects' || Q === 'what databases did you use?' || Q === 'what databases did you use' || Q === 'are these projects deployed?' || Q === 'are these projects deployed' || Q === 'are all repos public?' || Q === 'are all repos public' || Q === 'can anyone use your code?' || Q === 'can anyone use your code' || Q === 'what license do you use?' || Q === 'what license do you use' || Q === 'is your project code clean?' || Q === 'is your project code clean' || Q === 'did you write documentation?' || Q === 'did you write documentation' || Q === 'is there a readme for each project?' || Q === 'is there a readme for each project' || Q === 'do your projects have proper folder structure?' || Q === 'do your projects have proper folder structure' || Q === 'are they production-ready?' || Q === 'are they production ready' || Q === 'what would you improve in your older projects?' || Q === 'what would you improve in your older projects' || Q === 'how often do you update your projects?' || Q === 'how often do you update your projects' || Q === 'do you refactor old code?' || Q === 'do you refactor old code' || Q === 'any project you\'re embarrassed about now?' || Q === 'any project youre embarrassed about now' || Q === 'show your growth through projects.' || Q === 'show your growth through projects' || Q === 'which project shows your beginner self?' || Q === 'which project shows your beginner self' || Q === 'which shows your current level?' || Q === 'which shows your current level' || Q === 'if an employer sees your projects, what impression will they get?' || Q === 'if an employer sees your projects what impression will they get' || Q === 'what do your projects say about you?' || Q === 'what do your projects say about you' || Q === 'what problem-solving ability do they show?' || Q === 'what problem solving ability do they show' || Q === 'do you test on different screen sizes?' || Q === 'do you test on different screen sizes' || Q === 'have you done user testing?' || Q === 'have you done user testing' || Q === 'any feedback you got on projects?' || Q === 'any feedback you got on projects' || Q === 'did you implement any user suggestions?' || Q === 'did you implement any user suggestions' || Q === 'any project you abandoned? why?' || Q === 'any project you abandoned why' || Q === 'what\'s one project you want to rebuild?' || Q === 'whats one project you want to rebuild' || Q === 'if you could showcase only one project, which one?' || Q === 'if you could showcase only one project which one' || Q === 'any project that went viral or got noticed?' || Q === 'any project that went viral or got noticed' || Q === 'did any recruiter like a specific project?' || Q === 'did any recruiter like a specific project' || Q === 'which project taught you real-world skills?' || Q === 'which project taught you real world skills' || Q === 'what project was purely for learning?' || Q === 'what project was purely for learning' || Q === 'any project built for a client?' || Q === 'any project built for a client' || Q === 'have you done freelance projects?' || Q === 'have you done freelance projects' || Q === 'any paid project experience?' || Q === 'any paid project experience' || Q === 'what\'s your first paid work?' || Q === 'whats your first paid work' || Q === 'have you built websites for money?' || Q === 'have you built websites for money' || Q === 'what\'s your project completion rate?' || Q === 'whats your project completion rate' || Q === 'do you finish what you start?' || Q === 'do you finish what you start' || Q === 'how many side projects are in progress?' || Q === 'how many side projects are in progress' || Q === 'do you have a project graveyard?' || Q === 'do you have a project graveyard' || Q === 'what\'s your next big project idea?' || Q === 'whats your next big project idea' || Q === 'any dream project you want to build?' || Q === 'any dream project you want to build' || Q === 'what problem do you want to solve with code?' || Q === 'what problem do you want to solve with code' || Q === 'any social impact project in mind?' || Q === 'any social impact project in mind' || Q === 'do you have any collaborative projects?' || Q === 'do you have any collaborative projects' || Q === 'what projects are you currently working on?' || Q === 'what projects are you currently working on' || Q === 'do you plan to build more projects?' || Q === 'do you plan to build more projects' || Q === 'what is your next project idea?' || Q === 'what is your next project idea' || Q === 'how do you come up with project ideas?' || Q === 'how do you come up with project ideas' || Q === 'what inspires your projects?' || Q === 'what inspires your projects' || Q === 'how do you select projects to showcase?' || Q === 'how do you select projects to showcase' || Q === 'why did you choose these particular projects?' || Q === 'why did you choose these particular projects' || Q === 'what is your most complex project?' || Q === 'what is your most complex project')
    return FB;

  // ============ CERTIFICATIONS (EXACT MATCHES) ============
  if (Q === 'what certifications do you have?' || Q === 'what certifications do you have' || Q === 'are you certified?' || Q === 'are you certified' || Q === 'what courses have you completed?' || Q === 'what courses have you completed' || Q === 'do you have an html certification?' || Q === 'do you have an html certification' || Q === 'do you have a css certificate?' || Q === 'do you have a css certificate' || Q === 'can you list your certifications?' || Q === 'can you list your certifications' || Q === 'what are your credentials?' || Q === 'what are your credentials' || Q === 'what is your certificate summary?' || Q === 'what is your certificate summary' || Q === 'what are your professional certifications?' || Q === 'what are your professional certifications' || Q === 'how many certifications do you have?' || Q === 'how many certifications do you have')
    return `My verified certifications are:\n${certList}`;

  if (Q === 'what is the kg coding certificate?' || Q === 'what is the kg coding certificate' || Q === 'what is kg coding complete certificate?' || Q === 'what is kg coding complete certificate')
    return 'KG Coding provides certificates in HTML, CSS, and Complete Coding. I have completed all three.';

  if (Q === 'is it an online course?' || Q === 'is it an online course' || Q === 'who provides the kg coding certificate?' || Q === 'who provides the kg coding certificate')
    return 'Yes, KG Coding is an online learning platform that provides certificates in web development skills.';

  if (Q === 'what is the complete coding certification?' || Q === 'what is the complete coding certification')
    return 'The Complete Coding certification from KG Coding covers comprehensive coding fundamentals and web development.';

  if (Q === 'tell me about your nptel certifications.' || Q === 'tell me about your nptel certifications' || Q === 'what nptel courses did you take?' || Q === 'what nptel courses did you take')
    return 'I completed NPTEL courses in: Business Ethics (IIT Kharagpur), Air Pollution (IIT Roorkee), IoT (IIT Kharagpur), and Cloud Computing (IIT Kharagpur).';

  if (Q === 'did you do nptel: business ethics?' || Q === 'did you do nptel business ethics' || Q === 'was business ethics from iit kharagpur?' || Q === 'was business ethics from iit kharagpur')
    return 'Yes, I completed NPTEL: Business Ethics from IIT Kharagpur.';

  if (Q === 'did you take nptel: air pollution?' || Q === 'did you take nptel air pollution' || Q === 'was air pollution from iit roorkee?' || Q === 'was air pollution from iit roorkee')
    return 'Yes, I completed NPTEL: Air Pollution from IIT Roorkee.';

  if (Q === 'did you do nptel: iot?' || Q === 'did you do nptel iot' || Q === 'was iot from iit kharagpur?' || Q === 'was iot from iit kharagpur')
    return 'Yes, I completed NPTEL: IoT from IIT Kharagpur.';

  if (Q === 'did you take nptel: cloud computing?' || Q === 'did you take nptel cloud computing' || Q === 'was cloud computing from iit kharagpur?' || Q === 'was cloud computing from iit kharagpur')
    return 'Yes, I completed NPTEL: Cloud Computing from IIT Kharagpur.';

  if (Q === 'what iits are your certifications from?' || Q === 'what iits are your certifications from')
    return 'My NPTEL certifications are from IIT Kharagpur and IIT Roorkee.';

  if (Q === 'how many nptel courses have you completed?' || Q === 'how many nptel courses have you completed')
    return 'I have completed 4 NPTEL courses.';

  if (Q === 'did you get certified in cloud computing?' || Q === 'did you get certified in cloud computing')
    return 'Yes, I am certified in NPTEL Cloud Computing from IIT Kharagpur.';

  if (Q === 'are nptel certifications verified?' || Q === 'are nptel certifications verified' || Q === 'are nptel certificates valuable?' || Q === 'are nptel certificates valuable' || Q === 'are nptel certificates recognized by companies?' || Q === 'are nptel certificates recognized by companies' || Q === 'do they add value to a resume?' || Q === 'do they add value to a resume')
    return 'Yes, NPTEL certifications are verified and recognized by companies and academic institutions. They add significant value to a resume.';

  if (Q === 'do employers care about your certifications?' || Q === 'do employers care about your certifications' || Q === 'have any of your certifications helped in interviews?' || Q === 'have any of your certifications helped in interviews' || Q === 'what\'s the roi of certifications for you?' || Q === 'whats the roi of certifications for you' || Q === 'certificate vs experience — what matters more?' || Q === 'certificate vs experience what matters more')
    return 'Certifications validate knowledge, but hands-on experience matters more. I combine both — certifications plus 9 real projects.';

  if (Q === 'why did you take certifications?' || Q === 'why did you take certifications' || Q === 'for learning or for resume?' || Q === 'for learning or for resume')
    return 'I took certifications for both learning and building my resume. They validate my skills while I build practical experience through projects.';

  if (Q === 'how do you showcase certifications?' || Q === 'how do you showcase certifications' || Q === 'are they uploaded on your linkedin?' || Q === 'are they uploaded on your linkedin' || Q === 'did you put them on your resume?' || Q === 'did you put them on your resume')
    return 'I showcase certifications on my portfolio, LinkedIn profile, and resume.';

  if (Q === 'what is the mini soccer award?' || Q === 'what is the mini soccer award' || Q === 'did you win an award for mini soccer?' || Q === 'did you win an award for mini soccer' || Q === 'what\'s the mini soccer award about?' || Q === 'whats the mini soccer award about')
    return 'The **Mini Soccer** award is from DCTM — a recognition for sports achievement.';

  if (Q === 'what is the dctm award?' || Q === 'what is the dctm award' || Q === 'tell me about your award from dctm.' || Q === 'tell me about your award from dctm' || Q === 'is dctm your college event?' || Q === 'is dctm your college event' || Q === 'what does dctm stand for?' || Q === 'what does dctm stand for' || Q === 'what did you do to win the dctm award?' || Q === 'what did you do to win the dctm award')
    return 'DCTM stands for a college/university event where I received the Mini Soccer award.';

  if (Q === 'how many awards in total?' || Q === 'how many awards in total')
    return 'I have 2 awards: Mini Soccer (from DCTM).';

  if (Q === 'what\'s your most prized achievement?' || Q === 'whats your most prized achievement')
    return 'My most prized achievements are completing 9 projects and earning NPTEL certifications from IITs.';

  if (Q === 'what is your highest certification?' || Q === 'what is your highest certification')
    return 'My highest certifications are the NPTEL courses from IIT Kharagpur and IIT Roorkee.';

  if (Q === 'are you planning more certifications?' || Q === 'are you planning more certifications' || Q === 'what\'s the next certification you want?' || Q === 'whats the next certification you want' || Q === 'aws or azure certification planned?' || Q === 'aws or azure certification planned' || Q === 'any interest in google certifications?' || Q === 'any interest in google certifications' || Q === 'would you do paid certifications?' || Q === 'would you do paid certifications' || Q === 'what\'s your certification strategy?' || Q === 'whats your certification strategy' || Q === 'how do you choose which certification to do?' || Q === 'how do you choose which certification to do' || Q === 'do you have any pending certifications?' || Q === 'do you have any pending certifications')
    return 'I am open to more certifications that add value to my skills, especially in cloud and full-stack development.';

  if (Q === 'how long was the html certification course?' || Q === 'how long was the html certification course' || Q === 'how many hours per nptel course?' || Q === 'how many hours per nptel course' || Q === 'how long did it take to complete them?' || Q === 'how long did it take to complete them' || Q === 'when did you complete these certifications?' || Q === 'when did you complete these certifications')
    return FB;

  if (Q === 'are any certifications free?' || Q === 'are any certifications free' || Q === 'did you pay for any certification?' || Q === 'did you pay for any certification')
    return 'NPTEL courses are government-funded and affordable. KG Coding is an online platform.';

  if (Q === 'what were the toughest certifications?' || Q === 'what were the toughest certifications' || Q === 'which nptel course was most useful?' || Q === 'which nptel course was most useful' || Q === 'which was the easiest?' || Q === 'which was the easiest' || Q === 'did you get good grades in nptel?' || Q === 'did you get good grades in nptel' || Q === 'what\'s your percentage in nptel iot?' || Q === 'whats your percentage in nptel iot' || Q === 'score in nptel cloud computing?' || Q === 'score in nptel cloud computing' || Q === 'what are your nptel scores?' || Q === 'what are your nptel scores')
    return FB;

  if (Q === 'how do i verify your nptel certificates?' || Q === 'how do i verify your nptel certificates' || Q === 'do you have certificate ids?' || Q === 'do you have certificate ids' || Q === 'what\'s your nptel enrollment number?' || Q === 'whats your nptel enrollment number' || Q === 'can i see your certificates?' || Q === 'can i see your certificates' || Q === 'do you have soft copies?' || Q === 'do you have soft copies' || Q === 'do you have digital badges for these?' || Q === 'do you have digital badges for these')
    return FB;

  if (Q === 'did you actually attend nptel classes?' || Q === 'did you actually attend nptel classes' || Q === 'how did you prepare for nptel exams?' || Q === 'how did you prepare for nptel exams' || Q === 'do certifications help in job search?' || Q === 'do certifications help in job search' || Q === 'are you proud of any specific certification?' || Q === 'are you proud of any specific certification' || Q === 'any certification you regret doing?' || Q === 'any certification you regret doing' || Q === 'any certification that was a waste of time?' || Q === 'any certification that was a waste of time' || Q === 'best certification for a fresher like you?' || Q === 'best certification for a fresher like you' || Q === 'are your certifications relevant to your field?' || Q === 'are your certifications relevant to your field')
    return FB;

  // ============ LANGUAGES (EXACT MATCHES) ============
  if (Q === 'what languages do you speak?' || Q === 'what languages do you speak' || Q === 'how many languages can you speak?' || Q === 'how many languages can you speak' || Q === 'can you speak multiple languages?' || Q === 'can you speak multiple languages' || Q === 'what languages are you proficient in?' || Q === 'what languages are you proficient in' || Q === 'are you multilingual?' || Q === 'are you multilingual' || Q === 'how many indian languages do you know?' || Q === 'how many indian languages do you know' || Q === 'what languages do you know besides programming?' || Q === 'what languages do you know besides programming' || Q === 'what languages do you use for communication?' || Q === 'what languages do you use for communication')
    return `I speak these languages:\n${langList}`;

  if (Q === 'what is your native language?' || Q === 'what is your native language' || Q === 'what is your mother tongue?' || Q === 'what is your mother tongue' || Q === 'what is your primary language?' || Q === 'what is your primary language')
    return 'My native language / mother tongue is **Assamese**.';

  if (Q === 'is assamese your mother tongue?' || Q === 'is assamese your mother tongue' || Q === 'are you fluent in assamese?' || Q === 'are you fluent in assamese' || Q === 'can you read and write assamese?' || Q === 'can you read and write assamese' || Q === 'what is your fluency level in assamese?' || Q === 'what is your fluency level in assamese')
    return 'Yes, Assamese is my mother tongue. I can read, write, and speak Assamese fluently.';

  if (Q === 'do you speak bengali?' || Q === 'do you speak bengali' || Q === 'are you fluent in bengali?' || Q === 'are you fluent in bengali' || Q === 'is bengali your second language?' || Q === 'is bengali your second language')
    return 'Yes, I am fluent in Bengali. I can read, write, and speak Bengali.';

  if (Q === 'do you speak hindi?' || Q === 'do you speak hindi' || Q === 'how good is your hindi?' || Q === 'how good is your hindi' || Q === 'is your hindi fluent or broken?' || Q === 'is your hindi fluent or broken')
    return 'Yes, I am fluent in Hindi. I can read, write, and speak Hindi.';

  if (Q === 'what is your english level?' || Q === 'what is your english level' || Q === 'is your english elementary?' || Q === 'is your english elementary' || Q === 'can you communicate in english?' || Q === 'can you communicate in english' || Q === 'what is your comfort level in english?' || Q === 'what is your comfort level in english')
    return 'My English is at **Elementary** level. I can read, write, and speak English, but not fluently. I am actively working on improving it.';

  if (Q === 'can you give an interview in hindi?' || Q === 'can you give an interview in hindi' || Q === 'can you negotiate in hindi?' || Q === 'can you negotiate in hindi' || Q === 'can you work in a hindi-speaking environment?' || Q === 'can you work in a hindi speaking environment')
    return 'Yes! Hindi is one of my fluent languages. I can comfortably communicate and work in a Hindi-speaking environment.';

  if (Q === 'can you write professional emails in english?' || Q === 'can you write professional emails in english' || Q === 'can you handle english documentation?' || Q === 'can you handle english documentation' || Q === 'do you struggle with english communication?' || Q === 'do you struggle with english communication')
    return 'I can write and read English, but my fluency is at Elementary level. I am actively working on improving my English communication.';

  if (Q === 'what is your language proficiency?' || Q === 'what is your language proficiency')
    return `My language proficiency: ${langList.replace(/\n/g, ' | ')}`;

  if (Q === 'do you know any other regional languages?' || Q === 'do you know any other regional languages')
    return 'Yes, I know Assamese, Bengali, and Hindi — all regional languages of India.';

  if (Q === 'how did you learn multiple languages?' || Q === 'how did you learn multiple languages' || Q === 'what\'s your linguistic background?' || Q === 'whats your linguistic background')
    return 'Being from Assam, I grew up with Assamese and Bengali. I learned Hindi through daily life and media, and English through education.';

  if (Q === 'do you speak any international languages?' || Q === 'do you speak any international languages')
    return 'English is the international language I can communicate in, though at an Elementary level.';

  if (Q === 'can you provide translation help?' || Q === 'can you provide translation help')
    return 'I can assist with Assamese, Bengali, and Hindi translations.';

  if (Q === 'what language do you think in?' || Q === 'what language do you think in' || Q === 'dream in which language?' || Q === 'dream in which language' || Q === 'does knowing multiple languages help in coding?' || Q === 'does knowing multiple languages help in coding' || Q === 'have you ever done translation work?' || Q === 'have you ever done translation work' || Q === 'can you code in multiple languages? (pun intended)' || Q === 'can you code in multiple languages' || Q === 'any plans to learn a foreign language?' || Q === 'any plans to learn a foreign language' || Q === 'japanese, german, or french?' || Q === 'japanese german or french' || Q === 'would you learn a language for a job abroad?' || Q === 'would you learn a language for a job abroad' || Q === 'what\'s the most beautiful language according to you?' || Q === 'whats the most beautiful language according to you' || Q === 'what language do you use with friends?' || Q === 'what language do you use with friends' || Q === 'what language for social media?' || Q === 'what language for social media' || Q === 'language preference for coding tutorials?' || Q === 'language preference for coding tutorials')
    return FB;

  // ============ HOBBIES (EXACT MATCHES) ============
  if (Q === 'what are your hobbies?' || Q === 'what are your hobbies' || Q === 'what do you do in your free time?' || Q === 'what do you do in your free time')
    return `My hobbies are: **${localKnowledge.hobbies.join(', ')}**.`;

  if (Q === 'do you like photography?' || Q === 'do you like photography' || Q === 'what kind of photography do you enjoy?' || Q === 'what kind of photography do you enjoy')
    return 'Yes, I enjoy photography as a hobby.';

  if (Q === 'do you travel?' || Q === 'do you travel' || Q === 'how often do you travel?' || Q === 'how often do you travel')
    return 'Yes, I love to travel! It\'s one of my hobbies.';

  if (Q === 'do you play football?' || Q === 'do you play football' || Q === 'what is your football position?' || Q === 'what is your football position')
    return 'Yes, I play football! It is one of my favorite sports.';

  if (Q === 'what sports do you follow?' || Q === 'what sports do you follow')
    return 'I follow and play football.';

  if (Q === 'how do you spend your weekends?' || Q === 'how do you spend your weekends' || Q === 'what do you do to relax?' || Q === 'what do you do to relax')
    return 'I spend my free time with photography, travel, and football — when I\'m not coding!';

  if (Q === 'what are your interests outside of tech?' || Q === 'what are your interests outside of tech' || Q === 'do you have any other hobbies?' || Q === 'do you have any other hobbies')
    return `Outside of tech, I enjoy: ${localKnowledge.hobbies.join(', ')}.`;

  if (Q === 'do you have any creative hobbies?' || Q === 'do you have any creative hobbies' || Q === 'what kind of photos do you take?' || Q === 'what kind of photos do you take')
    return 'Yes, photography is my creative outlet.';

  if (Q === 'are you a football fan?' || Q === 'are you a football fan' || Q === 'do you follow any football clubs?' || Q === 'do you follow any football clubs')
    return 'Yes, I am a football fan!';

  if (Q === 'do you play football regularly?' || Q === 'do you play football regularly' || Q === 'have you played at any level?' || Q === 'have you played at any level')
    return 'Yes, I play football regularly. I also won the Mini Soccer award from DCTM.';

  if (Q === 'what is your favorite hobby?' || Q === 'what is your favorite hobby' || Q === 'do you like outdoor activities?' || Q === 'do you like outdoor activities')
    return `I enjoy all my hobbies — ${localKnowledge.hobbies.join(', ')}. They keep me active and creative!`;

  if (Q === 'what is your favorite travel destination?' || Q === 'what is your favorite travel destination' || Q === 'what\'s the last place you visited?' || Q === 'whats the last place you visited' || Q === 'your dream travel destination?' || Q === 'your dream travel destination' || Q === 'mountains or beaches?' || Q === 'mountains or beaches')
    return FB;

  if (Q === 'have you been to many places?' || Q === 'have you been to many places' || Q === 'solo travel or with friends?' || Q === 'solo travel or with friends' || Q === 'any travel story you\'d like to share?' || Q === 'any travel story youd like to share' || Q === 'what is your favorite travel memory?' || Q === 'what is your favorite travel memory')
    return FB;

  if (Q === 'do you vlog your travels?' || Q === 'do you vlog your travels' || Q === 'do you share your photography online?' || Q === 'do you share your photography online' || Q === 'what camera do you use?' || Q === 'what camera do you use' || Q === 'what camera gear do you own?' || Q === 'what camera gear do you own' || Q === 'dslr or mobile photography?' || Q === 'dslr or mobile photography' || Q === 'are you into photography professionally?' || Q === 'are you into photography professionally')
    return FB;

  if (Q === 'what do you like to photograph?' || Q === 'what do you like to photograph' || Q === 'nature, people, or street photography?' || Q === 'nature people or street photography' || Q === 'do you edit your photos?' || Q === 'do you edit your photos' || Q === 'lightroom or photoshop?' || Q === 'lightroom or photoshop' || Q === 'can i see your photography portfolio?' || Q === 'can i see your photography portfolio' || Q === 'do you have an instagram for photos?' || Q === 'do you have an instagram for photos')
    return FB;

  if (Q === 'favorite football player?' || Q === 'favorite football player' || Q === 'messi or ronaldo?' || Q === 'messi or ronaldo' || Q === 'favorite football club?' || Q === 'favorite football club' || Q === 'do you watch the world cup?' || Q === 'do you watch the world cup' || Q === 'any football injury stories?' || Q === 'any football injury stories')
    return FB;

  if (Q === 'what other sports do you play?' || Q === 'what other sports do you play' || Q === 'cricket or football?' || Q === 'cricket or football')
    return 'I primarily play football. I also follow other sports occasionally.';

  if (Q === 'do you go to the gym?' || Q === 'do you go to the gym' || Q === 'fitness routine?' || Q === 'fitness routine')
    return 'Football and outdoor activities keep me active!';

  if (Q === 'do you read books?' || Q === 'do you read books' || Q === 'what genre?' || Q === 'what genre' || Q === 'any book that changed your perspective?' || Q === 'any book that changed your perspective' || Q === 'favorite movie?' || Q === 'favorite movie' || Q === 'binge-watching any series right now?' || Q === 'binge watching any series right now' || Q === 'what music do you listen to while coding?' || Q === 'what music do you listen to while coding' || Q === 'any playlist you can share?' || Q === 'any playlist you can share')
    return FB;

  if (Q === 'how do you balance hobbies and work?' || Q === 'how do you balance hobbies and work' || Q === 'do your hobbies influence your work?' || Q === 'do your hobbies influence your work')
    return 'Hobbies keep me refreshed and creative. I balance them with coding through good time management.';

  // ============ GITHUB / CODE ============
  if (Q === 'where can i see the code?' || Q === 'where can i see the code' || Q === 'are the projects on github?' || Q === 'are the projects on github' || Q === 'do you have a github repository link?' || Q === 'do you have a github repository link' || Q === 'what is your github username?' || Q === 'what is your github username' || Q === 'can i see your github?' || Q === 'can i see your github' || Q === 'what is your github profile?' || Q === 'what is your github profile' || Q === 'can you share the source code?' || Q === 'can you share the source code')
    return `My GitHub: ${github}`;

  if (Q === 'do all projects have a live demo?' || Q === 'do all projects have a live demo' || Q === 'where are all your projects hosted?' || Q === 'where are all your projects hosted' || Q === 'github pages or vercel?' || Q === 'github pages or vercel')
    return 'Projects are hosted on GitHub Pages and/or Vercel. Check my GitHub for live demos!';

  // ============ CONTACT (EXACT MATCHES) ============
  if (Q === 'how can i contact you?' || Q === 'how can i contact you' || Q === 'what is your email?' || Q === 'what is your email' || Q === 'what is your contact information?' || Q === 'what is your contact information' || Q === 'where can i reach you?' || Q === 'where can i reach you' || Q === 'how do i get in touch?' || Q === 'how do i get in touch' || Q === 'how can we work together?' || Q === 'how can we work together')
    return `📧 Email: **${email}**\n💼 LinkedIn: ${linkedin}\n🐙 GitHub: ${github}\n\nFeel free to reach out!`;

  if (Q === 'can i hire you?' || Q === 'can i hire you' || Q === 'are you available for collaboration?' || Q === 'are you available for collaboration' || Q === 'can we discuss a project?' || Q === 'can we discuss a project' || Q === 'i have a job opportunity for you.' || Q === 'i have a job opportunity for you' || Q === 'we are hiring, are you interested?' || Q === 'we are hiring are you interested')
    return `Yes! I'm actively seeking opportunities. Contact me at **${email}** to discuss.`;

  if (Q === 'do you have a linkedin profile?' || Q === 'do you have a linkedin profile' || Q === 'what is your linkedin?' || Q === 'what is your linkedin')
    return `My LinkedIn: ${linkedin}`;

  if (Q === 'what is your phone number?' || Q === 'what is your phone number')
    return FB;

  if (Q === 'can you send your resume?' || Q === 'can you send your resume' || Q === 'where can i download your resume?' || Q === 'where can i download your resume' || Q === 'do you have a cv?' || Q === 'do you have a cv' || Q === 'can you provide your resume?' || Q === 'can you provide your resume' || Q === 'what is your resume link?' || Q === 'what is your resume link' || Q === 'is your resume updated?' || Q === 'is your resume updated')
    return 'You can download my resume from the **Download Resume** button on my portfolio page.';

  if (Q === 'can you share your portfolio?' || Q === 'can you share your portfolio' || Q === 'what is your portfolio link?' || Q === 'what is your portfolio link')
    return 'This is my portfolio! You are already here. Browse through my projects, skills, and contact info.';

  // ============ JOB SEARCH (EXACT MATCHES) ============
  if (Q === 'are you looking for a job?' || Q === 'are you looking for a job' || Q === 'are you available for opportunities?' || Q === 'are you available for opportunities' || Q === 'are you open to work?' || Q === 'are you open to work' || Q === 'what is your job search status?' || Q === 'what is your job search status' || Q === 'are you actively seeking employment?' || Q === 'are you actively seeking employment')
    return 'Yes! I am actively seeking my first professional role as a Full Stack Developer.';

  if (Q === 'what kind of job are you looking for?' || Q === 'what kind of job are you looking for' || Q === 'what roles are you interested in?' || Q === 'what is your desired job title?' || Q === 'what is your desired job title')
    return 'I am looking for a **Full Stack Developer** or **Frontend Developer** role.';

  if (Q === 'do you want a full-time job?' || Q === 'do you want a full time job')
    return 'Yes, I am looking for a full-time role.';

  if (Q === 'are you open to internships?' || Q === 'are you open to internships')
    return 'Yes, I am open to internships that provide learning and growth opportunities.';

  if (Q === 'would you consider freelance work?' || Q === 'would you consider freelance work' || Q === 'would you freelance full-time?' || Q === 'would you freelance full time')
    return 'Yes, I am open to freelance projects. Contact me to discuss!';

  if (Q === 'what is your availability?' || Q === 'what is your availability' || Q === 'when can you start?' || Q === 'when can you start' || Q === 'can you join immediately?' || Q === 'can you join immediately' || Q === 'ready to start tomorrow?' || Q === 'ready to start tomorrow')
    return 'I am available to start immediately!';

  if (Q === 'are you open to remote jobs?' || Q === 'are you open to remote jobs' || Q === 'do you prefer onsite or remote?' || Q === 'do you prefer onsite or remote')
    return 'Yes, I am open to remote work. I have good connectivity and am comfortable working remotely.';

  if (Q === 'what kind of company do you want to work for?' || Q === 'what kind of company do you want to work for' || Q === 'are you looking for a developer role?' || Q === 'are you looking for a developer role')
    return 'I want to work for a company where I can learn, grow, and contribute as a Full Stack Developer.';

  if (Q === 'do you want to work in a startup?' || Q === 'do you want to work in a startup' || Q === 'are you interested in mncs?' || Q === 'are you interested in mncs' || Q === 'mnc vs startup preference?' || Q === 'mnc vs startup preference')
    return 'I am open to both startups and MNCs — wherever I can learn the most and make an impact.';

  if (Q === 'what is your dream company?' || Q === 'what is your dream company')
    return 'I admire companies that build impactful products and have a strong engineering culture.';

  if (Q === 'are you open to startups?' || Q === 'are you open to startups')
    return 'Yes, I am open to startups!';

  if (Q === 'what if you don\'t get a job in 2026?' || Q === 'what if you dont get a job in 2026' || Q === 'backup plan?' || Q === 'backup plan')
    return 'I will continue building projects, improving skills, and seeking opportunities. Persistence pays off.';

  if (Q === 'would you start your own company?' || Q === 'would you start your own company' || Q === 'entrepreneurial ambitions?' || Q === 'entrepreneurial ambitions' || Q === 'any startup idea?' || Q === 'any startup idea')
    return 'Maybe someday! Right now, I\'m focused on building skills and gaining professional experience.';

  if (Q === 'do you work with teams?' || Q === 'do you work with teams' || Q === 'would you join as a co-founder?' || Q === 'would you join as a co founder' || Q === 'looking for a co-founder yourself?' || Q === 'looking for a co founder yourself')
    return 'Yes, I work well in teams and am open to collaboration opportunities.';

  // ============ JOB PREFERENCES (UNSUPPORTED) ============
  if (Q === 'what\'s your expected salary as a fresher?' || Q === 'whats your expected salary as a fresher' || Q === 'what salary do you expect?' || Q === 'what salary do you expect' || Q === 'minimum salary you\'d accept?' || Q === 'minimum salary youd accept' || Q === 'what is your expected ctc?' || Q === 'what is your expected ctc' || Q === 'what is your notice period?' || Q === 'what is your notice period' || Q === 'notice period if you\'re hired?' || Q === 'notice period if youre hired' || Q === 'are you willing to relocate?' || Q === 'are you willing to relocate' || Q === 'are you flexible with location?' || Q === 'are you flexible with location' || Q === 'relocation support needed?' || Q === 'relocation support needed' || Q === 'would you leave india for a job?' || Q === 'would you leave india for a job' || Q === 'any countries on your radar?' || Q === 'any countries on your radar' || Q === 'work visa preference?' || Q === 'work visa preference' || Q === 'are you open to unpaid internships?' || Q === 'are you open to unpaid internships' || Q === 'stipend expectation for internship?' || Q === 'stipend expectation for internship' || Q === 'would you work for equity?' || Q === 'would you work for equity')
    return FB;

  if (Q === 'what\'s your job hunting strategy?' || Q === 'whats your job hunting strategy' || Q === 'where are you applying?' || Q === 'where are you applying' || Q === 'how many applications have you sent?' || Q === 'how many applications have you sent' || Q === 'got any interview calls?' || Q === 'got any interview calls' || Q === 'how are you preparing for interviews?' || Q === 'how are you preparing for interviews' || Q === 'what\'s your weakest area for interviews?' || Q === 'whats your weakest area for interviews' || Q === 'dsa or development — what\'s your focus?' || Q === 'dsa or development whats your focus' || Q === 'are you on naukri.com?' || Q === 'are you on naukricom' || Q === 'is your linkedin profile updated?' || Q === 'is your linkedin profile updated' || Q === 'how many linkedin connections?' || Q === 'how many linkedin connections' || Q === 'are you networking on linkedin?' || Q === 'are you networking on linkedin' || Q === 'do you post on linkedin?' || Q === 'do you post on linkedin' || Q === 'have you reached out to recruiters?' || Q === 'have you reached out to recruiters')
    return FB;

  if (Q === 'what is your ideal job?' || Q === 'what is your ideal job' || Q === 'what are your career aspirations?' || Q === 'what are your career aspirations' || Q === 'where do you see yourself in 5 years?' || Q === 'where do you see yourself in 5 years' || Q === 'where do you see yourself career-wise in 3 years?' || Q === 'where do you see yourself career wise in 3 years' || Q === '10-year career vision?' || Q === '10 year career vision' || Q === 'what is your career plan?' || Q === 'what is your career plan')
    return 'I want to grow as a Full Stack Developer, work on impactful projects, and eventually lead a development team.';

  if (Q === 'what industry do you want to work in?' || Q === 'what industry do you want to work in' || Q === 'fintech, edtech, healthtech preference?' || Q === 'fintech edtech healthtech preference' || Q === 'any domain expertise you want to build?' || Q === 'any domain expertise you want to build')
    return 'I am open to all industries — EdTech, HealthTech, and FinTech all interest me.';

  if (Q === 'what kind of problems excite you?' || Q === 'what kind of problems excite you')
    return 'I love solving real-world problems through code — especially building clean, user-friendly applications.';

  if (Q === 'b2b or b2c products?' || Q === 'b2b or b2c products' || Q === 'product-based or service-based company?' || Q === 'product based or service based company')
    return 'I am open to both product-based and service-based companies.';

  if (Q === 'what\'s more important — salary or learning?' || Q === 'whats more important salary or learning')
    return 'As a fresher, **learning** is most important right now. Salary will follow as I grow.';

  if (Q === 'what\'s a dealbreaker in a job offer?' || Q === 'whats a dealbreaker in a job offer' || Q === 'what benefits are you looking for?' || Q === 'what benefits are you looking for' || Q === 'what work environment do you prefer?' || Q === 'what work environment do you prefer')
    return FB;

  if (Q === 'do you like working in teams or alone?' || Q === 'do you like working in teams or alone')
    return 'I enjoy both — I can work independently and also collaborate well in teams.';

  if (Q === 'what kind of projects do you want to work on?' || Q === 'what kind of projects do you want to work on' || Q === 'what technologies do you want to work with?' || Q === 'what technologies do you want to work with' || Q === 'are you interested in a particular domain?' || Q === 'are you interested in a particular domain' || Q === 'what is your passion in tech?' || Q === 'what is your passion in tech')
    return 'I want to work on web applications using React, Next.js, and modern technologies that solve real problems.';

  if (Q === 'what role do you want — ic or lead?' || Q === 'what role do you want ic or lead' || Q === 'ic track or management track?' || Q === 'ic track or management track' || Q === 'what\'s your ideal team size?' || Q === 'whats your ideal team size')
    return FB;

  if (Q === 'have you done any freelancing gigs?' || Q === 'have you done any freelancing gigs' || Q === 'what services can you offer as a freelancer?' || Q === 'what services can you offer as a freelancer' || Q === 'what\'s your hourly rate?' || Q === 'whats your hourly rate' || Q === 'how do you plan to get clients?' || Q === 'how do you plan to get clients' || Q === 'fiverr or upwork profile?' || Q === 'fiverr or upwork profile')
    return FB;

  if (Q === 'how do we discuss a project?' || Q === 'how do we discuss a project')
    return `Email me at **${email}** with your project details and I'll respond promptly!`;

  if (Q === 'do you have a contract template?' || Q === 'do you have a contract template' || Q === 'how do you charge — hourly or fixed?' || Q === 'how do you charge hourly or fixed' || Q === 'what\'s your payment method?' || Q === 'whats your payment method' || Q === 'do you require advance payment?' || Q === 'do you require advance payment' || Q === 'what\'s your turnaround time?' || Q === 'whats your turnaround time' || Q === 'can you work on tight deadlines?' || Q === 'can you work on tight deadlines' || Q === 'do you offer revisions?' || Q === 'do you offer revisions' || Q === 'what if i\'m not satisfied?' || Q === 'what if im not satisfied' || Q === 'do you provide maintenance?' || Q === 'do you provide maintenance' || Q === 'will you teach me how to update the site?' || Q === 'will you teach me how to update the site' || Q === 'is support included after project delivery?' || Q === 'is support included after project delivery' || Q === 'how long do you support a project?' || Q === 'how long do you support a project' || Q === 'can you sign an nda?' || Q === 'can you sign an nda')
    return FB;

  if (Q === 'what\'s your availability for freelance work?' || Q === 'whats your availability for freelance work')
    return 'I am available for freelance projects. Contact me to discuss timelines!';

  // ============ WEBSITE / CHATBOT ============
  if (Q === 'who built this site?' || Q === 'who built this site' || Q === 'how did you build this website?' || Q === 'how did you build this website')
    return 'I built this portfolio website myself to showcase my skills and projects!';

  if (Q === 'what technologies are used in this portfolio?' || Q === 'what technologies are used in this portfolio')
    return 'This portfolio is built with modern web technologies including responsive HTML, CSS, JavaScript, and GSAP animations.';

  if (Q === 'is this website responsive?' || Q === 'is this website responsive' || Q === 'is this a static site?' || Q === 'is this a static site' || Q === 'where is this site hosted?' || Q === 'where is this site hosted' || Q === 'did you use a template?' || Q === 'did you use a template' || Q === 'how long did it take to build this portfolio?' || Q === 'how long did it take to build this portfolio' || Q === 'what is the purpose of this site?' || Q === 'what is the purpose of this site' || Q === 'can i see the code for this portfolio?' || Q === 'can i see the code for this portfolio' || Q === 'is this site open-source?' || Q === 'is this site open source' || Q === 'is this portfolio open source?' || Q === 'is this portfolio open source' || Q === 'how can i build a similar portfolio?' || Q === 'how can i build a similar portfolio' || Q === 'what design framework did you use?' || Q === 'what design framework did you use' || Q === 'is this a single-page application?' || Q === 'is this a single page application')
    return FB;

  if (Q === 'what is the ai chat feature?' || Q === 'what is the ai chat feature')
    return 'This AI chat feature helps visitors learn about me — my skills, projects, education, and more!';

  if (Q === 'how does this chatbot work?' || Q === 'how does this chatbot work' || Q === 'did you code this chatbot yourself?' || Q === 'did you code this chatbot yourself' || Q === 'is the chatbot ai-powered?' || Q === 'is the chatbot ai powered' || Q === 'what ai does the chatbot use?' || Q === 'what ai does the chatbot use' || Q === 'is the chatbot custom-made?' || Q === 'is the chatbot custom made' || Q === 'how do i use the chatbot?' || Q === 'how do i use the chatbot' || Q === 'what questions work with the chatbot?' || Q === 'what questions work with the chatbot' || Q === 'does the chatbot learn over time?' || Q === 'does the chatbot learn over time' || Q === 'is the chatbot connected to chatgpt?' || Q === 'is the chatbot connected to chatgpt' || Q === 'can the chatbot schedule a call?' || Q === 'can the chatbot schedule a call' || Q === 'does the chatbot collect my data?' || Q === 'does the chatbot collect my data' || Q === 'how is my chat data used?' || Q === 'how is my chat data used' || Q === 'is this website your first portfolio?' || Q === 'is this website your first portfolio' || Q === 'how many versions of your portfolio exist?' || Q === 'how many versions of your portfolio exist' || Q === 'what was your old portfolio like?' || Q === 'what was your old portfolio like' || Q === 'why did you redesign?' || Q === 'why did you redesign' || Q === 'how often do you update the portfolio?' || Q === 'how often do you update the portfolio' || Q === 'what\'s next for this website?' || Q === 'whats next for this website' || Q === 'are you adding a blog section?' || Q === 'are you adding a blog section' || Q === 'will you add more interactive elements?' || Q === 'will you add more interactive elements' || Q === 'dark mode for the portfolio?' || Q === 'dark mode for the portfolio' || Q === 'can i use your portfolio template?' || Q === 'can i use your portfolio template' || Q === 'will you help me set up a similar portfolio?' || Q === 'will you help me set up a similar portfolio' || Q === 'how much did this website cost to build?' || Q === 'how much did this website cost to build' || Q === 'can the chatbot answer all questions?' || Q === 'can the chatbot answer all questions' || Q === 'how accurate is the chatbot?' || Q === 'how accurate is the chatbot' || Q === 'can i trust the information from the chatbot?' || Q === 'can i trust the information from the chatbot' || Q === 'is the chatbot always available?' || Q === 'is the chatbot always available' || Q === 'can the chatbot take a message for you?' || Q === 'can the chatbot take a message for you' || Q === 'is my conversation with the chatbot private?' || Q === 'is my conversation with the chatbot private')
    return FB;

  // ============ LOCATION SPECIFIC (UNSUPPORTED) ============
  if (Q === 'how\'s life in palwal?' || Q === 'hows life in palwal' || Q === 'is palwal a good place for techies?' || Q === 'is palwal a good place for techies' || Q === 'what\'s the internet speed at your place?' || Q === 'whats the internet speed at your place' || Q === 'how far are you from gurgaon tech hubs?' || Q === 'how far are you from gurgaon tech hubs' || Q === 'commute time to faridabad?' || Q === 'commute time to faridabad' || Q === 'do you travel daily to college?' || Q === 'do you travel daily to college' || Q === 'how\'s the connectivity from palwal?' || Q === 'hows the connectivity from palwal' || Q === 'nearest metro station?' || Q === 'nearest metro station' || Q === 'palwal to delhi travel time?' || Q === 'palwal to delhi travel time' || Q === 'have you lived in a hostel?' || Q === 'have you lived in a hostel' || Q === 'do you stay with family?' || Q === 'do you stay with family' || Q === 'rented place or own house?' || Q === 'rented place or own house' || Q === 'what\'s the cost of living there?' || Q === 'whats the cost of living there' || Q === 'is palwal developing as a tech city?' || Q === 'is palwal developing as a tech city' || Q === 'are you willing to move?' || Q === 'are you willing to move' || Q === 'can you commute to faridabad?' || Q === 'can you commute to faridabad' || Q === 'is your location accessible?' || Q === 'is your location accessible' || Q === 'what is the nearest city to you?' || Q === 'what is the nearest city to you' || Q === 'can you work in gurgaon?' || Q === 'can you work in gurgaon' || Q === 'do you live in a rural area?' || Q === 'do you live in a rural area' || Q === 'are you ready to relocate for a job?' || Q === 'are you ready to relocate for a job')
    return FB;

  // ============ CONVERSATIONAL (UNSUPPORTED) ============
  if (Q === 'how\'s the weather?' || Q === 'hows the weather' || Q === 'hot or cold there?' || Q === 'hot or cold there' || Q === 'had lunch?' || Q === 'had lunch' || Q === 'what did you eat?' || Q === 'what did you eat' || Q === 'chai or coffee?' || Q === 'chai or coffee' || Q === 'tea person or coffee person?' || Q === 'tea person or coffee person' || Q === 'are you a foodie?' || Q === 'are you a foodie' || Q === 'favorite cuisine?' || Q === 'favorite cuisine' || Q === 'can you cook?' || Q === 'can you cook' || Q === 'do you party?' || Q === 'do you party' || Q === 'weekend plans?' || Q === 'weekend plans' || Q === 'what are you doing right now?' || Q === 'what are you doing right now' || Q === 'are you free to chat?' || Q === 'are you free to chat' || Q === 'tell me a joke.' || Q === 'tell me a joke' || Q === 'what is the meaning of life?' || Q === 'what is the meaning of life' || Q === 'what is your favorite color?' || Q === 'what is your favorite color' || Q === 'do you have any pets?' || Q === 'do you have any pets' || Q === 'what is your favorite food?' || Q === 'what is your favorite food' || Q === 'do you like music?' || Q === 'do you like music' || Q === 'what is your favorite movie?' || Q === 'what is your favorite movie' || Q === 'do you play video games?' || Q === 'do you play video games' || Q === 'who is your inspiration?' || Q === 'who is your inspiration' || Q === 'what is your favorite book?' || Q === 'what is your favorite book' || Q === 'what is your life motto?' || Q === 'what is your life motto' || Q === 'howdy!' || Q === 'howdy')
    return FB;

  // ============ ULTIMATE FALLBACK ============
  return FB;
}
function openLeadForm(prefill = '') {
  if (!leadForm) return;
  leadForm.hidden = false;
  const textarea = leadForm.querySelector('textarea[name="message"]');
  if (textarea && prefill && !textarea.value.trim()) textarea.value = prefill;
  setStatus('Contact capture is ready');
  setTimeout(() => leadForm.querySelector('input[name="name"]')?.focus(), 80);
}

function closeLeadForm() {
  if (!leadForm) return;
  leadForm.hidden = true;
  setStatus('Ready to answer portfolio questions');
}

async function sendMessage(text) {
  const prompt = String(text || '').trim();
  if (!prompt || isSending) return;

  isSending = true;
  sendBtn.disabled = true;
  input.value = '';
  resizeInput();
  setStatus('Preparing answer...');
  appendMessage({ role: 'user', content: prompt });
  showTyping();

  // Simulate typing delay for natural feel
  setTimeout(() => {
    removeTyping();
    // Use your local 1500+ handler directly
    const reply = localAssistantReply(prompt);
    appendMessage({ role: 'assistant', content: reply });
    
    if (detectsLeadIntent(prompt)) {
      setTimeout(() => openLeadForm(prompt), 1500);
    }
    
    isSending = false;
    sendBtn.disabled = false;
    setStatus('Ready to answer portfolio questions');
  }, 300);
}

function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!voiceBtn || !SpeechRecognition) {
    if (voiceBtn) voiceBtn.style.display = 'none';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener('start', () => {
    voiceBtn.classList.add('is-active');
    setStatus('Listening...');
  });
  recognition.addEventListener('end', () => {
    voiceBtn.classList.remove('is-active');
    setStatus('Ready to answer portfolio questions');
  });
  recognition.addEventListener('result', event => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    input.value = transcript;
    resizeInput();
    input.focus();
  });
  recognition.addEventListener('error', () => {
    showToast('Voice input is not available right now.', 2200);
  });

  voiceBtn.addEventListener('click', () => recognition.start());
}

toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
closeBtn?.addEventListener('click', () => setOpen(false));
clearBtn?.addEventListener('click', () => {
  messages = [{ role: 'assistant', content: greeting, time: Date.now() }];
  saveMessages();
  renderHistory();
  closeLeadForm();
  showToast('Chat history cleared.', 1800);
});
resumeBtn?.addEventListener('click', () => {
  window.location.href = 'Ashraful Alom  Full Stack Developer Resume.pdf';
});

input.addEventListener('input', resizeInput);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  sendMessage(input.value);
});

suggestions?.addEventListener('click', e => {
  const button = e.target.closest('button[data-question]');
  if (!button) return;
  setOpen(true);
  sendMessage(button.dataset.question);
});

cancelLeadBtn?.addEventListener('click', closeLeadForm);
leadForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(leadForm);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    company: String(formData.get('company') || '').trim(),
    message: String(formData.get('message') || '').trim(),
    inquiryType: 'AI assistant lead',
    source: 'AI portfolio assistant'
  };

  if (!payload.name || !payload.email || !payload.message) {
    showToast('Please fill name, email, and message.', 2200);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    showToast('Enter a valid email address.', 2200);
    return;
  }

  const submitBtn = leadForm.querySelector('button[type="submit"]');
  const label = submitBtn?.querySelector('span');
  const oldLabel = label?.textContent || 'Send Inquiry';

  try {
    if (submitBtn) submitBtn.disabled = true;
    if (label) label.textContent = 'Sending...';

    const { res: response, data } = await postApiJson('/contact', payload);

    if (!response.ok || !data.success) {
      showToast(data.message || 'Could not send inquiry.', 2500);
      return;
    }

    appendMessage({
      role: 'system',
      content: 'Your inquiry has been sent to Ashraful. He can reply directly to the email you provided.'
    });
    showToast('Inquiry sent successfully.', 2200);
    leadForm.reset();
    closeLeadForm();
  } catch {
    showToast('Server error. Please try again later.', 2500);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (label) label.textContent = oldLabel;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
});

renderHistory();
resizeInput();
initVoiceInput();
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
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // Projects grid animation
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.1, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Skills
  gsap.utils.toArray('.skill-category').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.1, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Certs
  gsap.utils.toArray('.cert-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.5, delay: i * 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });

  // Strength tags
  gsap.utils.toArray('.strength-tag').forEach((tag, i) => {
    gsap.fromTo(tag,
      { opacity: 0, scale: 0.7 },
      {
        opacity: 1, scale: 1, duration: 0.5, delay: i * 0.06, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: tag, start: 'top 92%', toggleActions: 'play none none none' }
      }
    );
  });

  // Misc cards
  gsap.utils.toArray('.misc-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
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
  initAIAssistant();

  // VanillaTilt & GSAP after brief layout settle
  requestAnimationFrame(() => {
    initTilt();
    initPremiumInteractions();
    // AOS CSS is kept for compatibility, but GSAP handles reveals.
    // Running both AOS and ScrollTrigger together made wheel scrolling feel heavy.
    initGSAP();
  });
});

}) ();