
(function () {
  'use strict';
 
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* ignore */ }
  }
  /* -------------------------
     Utility: Toast helper
     ------------------------- */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toast-message');
  function showToast(message = '', duration = 3000, type = '') {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.remove('success', 'error', 'info');
    if (type) {
      toastEl.classList.add(type);
    }
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }
  /* -------------------------
     DOMContentLoaded: init features that need DOM
     ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------
       MOBILE NAV TOGGLE VISIBILITY FIX
       ------------------------- */
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
    ensureMobileNavVisible();
    window.addEventListener('resize', ensureMobileNavVisible);
    setTimeout(ensureMobileNavVisible, 500);
    setTimeout(ensureMobileNavVisible, 1000);
    
    /* -------------------------
       Modern Education Section Animation
       ------------------------- */
    function initEducationAnimation() {
      const eduCards = document.querySelectorAll('.edu-card');
      function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.2 &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      }
      function checkEducationVisibility() {
        eduCards.forEach(card => {
          if (isInViewport(card)) {
            card.classList.add('visible');
          }
        });
      }
      checkEducationVisibility();
      window.addEventListener('scroll', checkEducationVisibility);
    }
    initEducationAnimation();
    
    /* -------------------------
       Mobile nav toggle
       ------------------------- */
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
    }
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          if (navToggle) navToggle.classList.remove('active');
        }
      });
    });
    
    /* -------------------------
       Active nav based on scroll + navbar scrolled class
       ------------------------- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.clientHeight;
        if (window.pageYOffset >= top - 200) {
          current = section.getAttribute('id');
        }
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = (link.getAttribute('href') || '').replace('#', '');
        if (href === current) link.classList.add('active');
      });
      if (navbar) {
        if (window.scrollY > 100) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
      if (window.innerWidth <= 768) {
        ensureMobileNavVisible();
      }
    });
    
    /* -------------------------
       Hero background stars and falling stars with trail
       ------------------------- */
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      heroBg.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      function resizeCanvas() {
        canvas.width = heroBg.offsetWidth;
        canvas.height = heroBg.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Stars array
      const stars = [];
      const numStars = 250; // Increased from 150 to 250 for more stars
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.8 + 0.5, // Slightly larger stars
          opacity: Math.random() * 0.5 + 0.4, // Slightly dimmer for variety
          twinkleSpeed: Math.random() * 0.02 + 0.01
        });
      }
      
      // Falling stars array
      const fallingStars = [];
      function createFallingStar() {
        if (fallingStars.length < 3) { // Allow up to 3 falling stars
          fallingStars.push({
            x: Math.random() * canvas.width * 0.5,
            y: -10,
            length: Math.random() * 30 + 20, // Longer trail
            speed: Math.random() * 6 + 4, // Slightly faster
            opacity: Math.random() * 0.5 + 0.5,
            trail: [] // Store trail points
          });
        }
      }
      
      // Animation loop
      function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw static stars
        stars.forEach(star => {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
          // Twinkle effect
          star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.1;
          star.opacity = Math.max(0.3, Math.min(0.9, star.opacity));
        });
        
        // Draw falling stars with trail
        fallingStars.forEach((star, index) => {
          // Update trail (store last 10 positions)
          star.trail.push({ x: star.x, y: star.y, opacity: star.opacity });
          if (star.trail.length > 10) star.trail.shift();
          
          // Draw trail
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          star.trail.forEach((point, i) => {
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${point.opacity * (1 - i / 10)})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
          });
          
          // Draw star
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
          
          // Update position
          star.x += star.speed * 0.7;
          star.y += star.speed;
          star.opacity -= 0.008; // Slower fade for longer trail
          
          // Remove if off-screen or faded
          if (star.y > canvas.height || star.opacity <= 0) {
            fallingStars.splice(index, 1);
          }
        });
        
        // Randomly create falling stars
        if (Math.random() < 0.03) { // Increased spawn rate slightly
          createFallingStar();
        }
        
        requestAnimationFrame(animateStars);
      }
      animateStars();
    }
    
    /* -------------------------
       Accessible Copy-to-Clipboard (email)
       ------------------------- */
    const copyEl = document.getElementById('copy-email');
    if (copyEl) {
      copyEl.setAttribute('tabindex', '0');
      copyEl.setAttribute('role', 'button');
      copyEl.setAttribute('aria-label', 'Copy email to clipboard');
      const tooltip = copyEl.querySelector('.copy-tooltip');
      const defaultTooltipText = tooltip ? tooltip.textContent.trim() : 'Copy to clipboard';
      function showCopyTooltip(text = 'Copied!') {
        if (!tooltip) return;
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.bottom = 'calc(100% + 12px)';
        clearTimeout(copyEl._tipTimer);
        copyEl._tipTimer = setTimeout(() => {
          tooltip.textContent = defaultTooltipText;
          tooltip.style.opacity = '';
          tooltip.style.visibility = '';
          tooltip.style.bottom = '';
        }, 1600);
      }
      async function doCopyEmail() {
        let email = copyEl.getAttribute('data-email') || '';
        if (!email) {
          const txt = Array.from(copyEl.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.nodeValue.trim())
            .join(' ')
            .trim();
          email = (txt.split(/\s+/)[0] || '').trim();
        }
        if (!email) {
          showCopyTooltip('No email found');
          return;
        }
        try {
          await navigator.clipboard.writeText(email);
          showCopyTooltip('Copied!');
          showToast('Email copied to clipboard!', 2000, 'success');
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            showCopyTooltip('Copied!');
            showToast('Email copied to clipboard!', 2000, 'success');
          } catch (err2) {
            showCopyTooltip('Copy failed');
            showToast('Copy failed', 2000, 'error');
          }
          document.body.removeChild(ta);
        }
      }
      copyEl.addEventListener('click', doCopyEmail);
      copyEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          doCopyEmail();
        }
      });
    }
    
    /* -------------------------
       Contact form handling
       ------------------------- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      const apiUrl = 'https://portfolio-website-pa8z.onrender.com/api/contact';
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        if (!name || !email || !message) {
          showToast('⚠️ Please fill all fields!', 2200, 'error');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast('⚠️ Please enter a valid email address!', 2200, 'error');
          return;
        }
        try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('✅ Message sent successfully!', 2200, 'success');
            contactForm.reset();
          } else {
            showToast('❌ Failed to send message: ' + (data.message || 'Unknown error'), 2200, 'error');
          }
        } catch (err) {
          console.error("Error:", err);
          showToast('⚠️ Server error. Try again later.', 2500, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
    
    /* -------------------------
       Hero typed effect
       ------------------------- */
    (function initHeroTyped() {
      const typedText = document.getElementById('typed-text');
      if (!typedText) return;
      typedText.textContent = '';
      const texts = ['Full Stack Developer', 'Quick Learner', 'Problem Solver'];
      let tIndex = 0, cIndex = 0, deleting = false;
      let typingSpeed = 100;
      function tick() {
        const current = texts[tIndex];
        if (deleting) {
          typedText.textContent = current.substring(0, cIndex - 1);
          cIndex--;
          typingSpeed = 50;
        } else {
          typedText.textContent = current.substring(0, cIndex + 1);
          cIndex++;
          typingSpeed = 100;
        }
        if (!deleting && cIndex === current.length) {
          deleting = true;
          typingSpeed = 1500;
        } else if (deleting && cIndex === 0) {
          deleting = false;
          tIndex = (tIndex + 1) % texts.length;
          typingSpeed = 500;
        }
        setTimeout(tick, typingSpeed);
      }
      setTimeout(tick, 1000);
    })();
  });

  /* =========================
     GSAP / ScrollTrigger Animations
     ========================= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
      /* ---------- generic section reveal ---------- */
      gsap.utils.toArray('.section').forEach(section => {
        gsap.fromTo(section, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1,
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });

      /* ---------- project cards ---------- */
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card, 
          { opacity: 0, y: 80, scale: 0.9, rotateY: 10 }, 
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            rotateY: 0,
            duration: 1, 
            delay: i * 0.12,
            ease: "back.out(1.7)", 
            scrollTrigger: { 
              trigger: card, 
              start: "top 90%", 
              toggleActions: "play none none none" 
            }
          }
        );
        let buttons = card.querySelectorAll('.project-links a');
        gsap.fromTo(buttons, 
          { opacity: 0, y: 20, scale: 0.8 }, 
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.5, 
            stagger: 0.15, 
            delay: 0.4 + i * 0.12, 
            ease: "power3.out",
            scrollTrigger: { 
              trigger: card, 
              start: "top 90%" 
            } 
          }
        );
      });

      /* ---------- education cards ---------- */
      document.addEventListener('DOMContentLoaded', function() {
        gsap.registerPlugin(ScrollTrigger);
        const style = document.createElement('style');
        style.textContent = `
          .edu-card {
            animation: none !important;
          }
          .edu-card:nth-child(1), 
          .edu-card:nth-child(2), 
          .edu-card:nth-child(3) {
            animation: none !important;
          }
        `;
        document.head.appendChild(style);
        
        gsap.utils.toArray('.edu-card').forEach((card, i) => {
          gsap.set(card, { transition: 'none' });
          let tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
              markers: false
            },
            delay: i * 0.15
          });
          tl.fromTo(card, 
            { opacity: 0, y: 80, scale: 0.5, rotateY: 15, z: -100 }, 
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              rotateY: 0,
              z: 0,
              duration: 1, 
              ease: "back.out(1.7)" 
            }
          );
          let icon = card.querySelector('.edu-icon');
          if (icon) {
            gsap.set(icon, { opacity: 0, scale: 0.5, rotate: -90 });
            tl.fromTo(icon, 
              { opacity: 0, scale: 0.5, rotate: -90 }, 
              { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.5"
            );
          }
          let texts = card.querySelectorAll('h3, p, .edu-date, .edu-progress-text');
          if (texts.length) {
            gsap.set(texts, { opacity: 0, y: 20 });
            tl.fromTo(texts, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "-=0.3"
            );
          }
          let progressBar = card.querySelector('.edu-progress-bar');
          if (progressBar) {
            let targetWidth = progressBar.style.width;
            gsap.set(progressBar, { width: "0%" });
            tl.fromTo(progressBar, 
              { width: "0%" }, 
              { width: targetWidth, duration: 1, ease: "power2.out" }, "-=0.6"
            );
          }
          tl.add(() => {
            gsap.set(card, { clearProps: 'transition' });
          });
        });
      });

      /* ---------- skill cards ---------- */
      gsap.utils.toArray('.skill-category').forEach((card, i) => {
        gsap.set(card, { transition: 'none' });
        gsap.set(card.querySelectorAll('.skill-chip'), { transition: 'none' });
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        tl.fromTo(card,
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)"
          }
        );
        let title = card.querySelector('h3');
        let chips = card.querySelectorAll('.skill-chip');
        if (title || chips.length) {
          if (title) gsap.set(title, { opacity: 0, y: 15 });
          if (chips.length) gsap.set(chips, { opacity: 0, y: 15, scale: 0.9 });
          tl.to(title,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "back.out(1.7)"
            },
            "-=0.5"
          );
          tl.to(chips,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              stagger: 0.03,
              ease: "back.out(1.7)"
            },
            "-=0.4"
          );
        }
        tl.add(() => {
          gsap.set(card, { clearProps: 'transition' });
          gsap.set(card.querySelectorAll('.skill-chip'), { clearProps: 'transition' });
        });
      });

      /* ---------- certification items ---------- */
      gsap.utils.toArray('.cert-item').forEach((item, i) => {
        gsap.set(item, { transition: 'none' });
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        tl.fromTo(item,
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)"
          }
        );
        let icon = item.querySelector('i');
        let text = item.querySelector('span');
        if (icon || text) {
          if (icon) gsap.set(icon, { opacity: 0, scale: 0.9 });
          if (text) gsap.set(text, { opacity: 0, y: 15 });
          if (icon) {
            tl.to(icon,
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.5"
            );
          }
          if (text) {
            tl.to(text,
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.4"
            );
          }
        }
        tl.add(() => {
          gsap.set(item, { clearProps: 'transition' });
        });
      });

      /* ---------- strength tags ---------- */
      gsap.utils.toArray('.strength-tag').forEach((tag, i) => {
        gsap.set(tag, { transition: 'none' });
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: tag,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        tl.fromTo(tag,
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)"
          }
        );
        tl.add(() => {
          gsap.set(tag, { clearProps: 'transition' });
        });
      });

      /* ---------- misc cards (languages & hobbies) ---------- */
      gsap.utils.toArray('.misc-card').forEach((card, i) => {
        gsap.set(card, { transition: 'none' });
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.15
        });
        tl.fromTo(card,
          { opacity: 0, y: 60, scale: 0.85 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.7)"
          }
        );
        let title = card.querySelector('.misc-title');
        let items = card.querySelectorAll('.misc-list li');
        if (title || items.length) {
          if (title) gsap.set(title, { opacity: 0, y: 15 });
          if (items.length) gsap.set(items, { opacity: 0, y: 15 });
          if (title) {
            tl.to(title,
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.5"
            );
          }
          if (items.length) {
            tl.to(items,
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: "back.out(1.7)"
              },
              "-=0.4"
            );
          }
        }
        tl.add(() => {
          gsap.set(card, { clearProps: 'transition' });
        });
      });

      /* ---------- contact section ---------- */
      gsap.set('.contact-info, .contact-form, .contact-info p, .contact-item, .contact-social .social-btn, .form-group, .contact-form .btn-primary', { transition: 'none' });
      let contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#contact',
          start: "top 85%",
          toggleActions: "play none none none",
          markers: false
        }
      });
      // Animate section title
      contactTl.fromTo('.contact .section-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "back.out(1.7)"
        }
      );
      // Animate contact info paragraph (left side)
      contactTl.fromTo('.contact-info p',
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "back.out(1.7)"
        },
        "-=0.5"
      );
      // Animate contact items (email, location - left side)
      gsap.utils.toArray('.contact-item').forEach((item, i) => {
        let itemTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        itemTl.fromTo(item,
          { opacity: 0, x: -30, scale: 0.85 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
          }
        );
        let icon = item.querySelector('i');
        let text = item.querySelector('a, span');
        if (icon || text) {
          if (icon) gsap.set(icon, { opacity: 0, scale: 0.9 });
          if (text) gsap.set(text, { opacity: 0, x: -15 });
          if (icon) {
            itemTl.to(icon,
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.3"
            );
          }
          if (text) {
            itemTl.to(text,
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.3"
            );
          }
        }
        itemTl.add(() => {
          gsap.set(item, { clearProps: 'transition' });
        });
      });
      // Animate social buttons (left side)
      gsap.utils.toArray('.contact-social .social-btn').forEach((btn, i) => {
        let btnTl = gsap.timeline({
          scrollTrigger: {
            trigger: btn,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        btnTl.fromTo(btn,
          { opacity: 0, x: -30, scale: 0.85 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
          }
        );
        btnTl.add(() => {
          gsap.set(btn, { clearProps: 'transition' });
        });
      });
      // Animate contact form (right side)
      contactTl.fromTo('.contact-form',
        { opacity: 0, x: 60, scale: 0.85 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)"
        },
        "-=0.5"
      );
      // Animate form groups (right side)
      gsap.utils.toArray('.form-group').forEach((group, i) => {
        let groupTl = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: "top 85%",
            toggleActions: "play none none none",
            markers: false
          },
          delay: i * 0.1
        });
        groupTl.fromTo(group,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            ease: "back.out(1.7)"
          }
        );
        let input = group.querySelector('input, textarea');
        let label = group.querySelector('label');
        if (input || label) {
          if (input) gsap.set(input, { opacity: 0, x: 15 });
          if (label) gsap.set(label, { opacity: 0, x: 15 });
          if (label) {
            groupTl.to(label,
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.3"
            );
          }
          if (input) {
            groupTl.to(input,
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
              },
              "-=0.3"
            );
          }
        }
        groupTl.add(() => {
          gsap.set(group, { clearProps: 'transition' });
        });
      });
      // Animate submit button (right side)
      let buttonTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.contact-form .btn-primary',
          start: "top 85%",
          toggleActions: "play none none none",
          markers: false
        }
      });
      buttonTl.fromTo('.contact-form .btn-primary',
        { opacity: 0, x: 30, scale: 0.85 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)"
        }
      );
      buttonTl.add(() => {
        gsap.set('.contact-form .btn-primary', { clearProps: 'transition' });
      });

      /* ---------- buttons ---------- */
      gsap.utils.toArray('.btn').forEach(btn => {
        gsap.fromTo(btn, { scale: 0 }, {
          scale: 1, duration: 0.45, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: btn, start: 'top 95%', toggleActions: 'play none none none' }
        });
      });

      /* ---------- floating social links ---------- */
      gsap.to('.social-link', {
        y: -8, duration: 1.5, yoyo: true, repeat: -1, ease: 'power1.inOut', stagger: 0.18
      });
    } catch (err) {
      console.warn('GSAP animations error:', err);
    }
  }

  /* =========================
     About section specific sequence
     ========================= */
  (function aboutSequence() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }
    function typeText(el, text, speed = 24) {
      return new Promise((resolve) => {
        if (!el) { resolve(); return; }
        el.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
          el.textContent += text.charAt(i);
          i++;
          if (i >= text.length) {
            clearInterval(timer);
            resolve();
          }
        }, speed);
      });
    }
    let played = false;
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 78%',
      onEnter: () => {
        if (played) return;
        played = true;
        const aboutTextWrap = document.querySelector('#about .about-text');
        const aboutPara = document.querySelector('#about .about-text p');
        const aboutImage = document.querySelector('#about .about-image');
        const downloadBtn = document.querySelector('#about .btn-outline');
        if (!aboutTextWrap || !aboutPara || !aboutImage) return;
        const fullText = aboutPara.textContent.trim();
        aboutPara.textContent = '';
        aboutPara.style.opacity = '1';
        aboutPara.style.height = 'auto';
        aboutPara.style.overflow = 'visible';
        gsap.fromTo(aboutTextWrap, { x: -90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.72, ease: 'power3.out' });
        gsap.fromTo(aboutImage, { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.06 });
        const caret = document.createElement('span');
        caret.className = 'about-typing-caret';
        aboutPara.parentNode.insertBefore(caret, aboutPara.nextSibling);
        setTimeout(() => {
          typeText(aboutPara, fullText, 22).then(() => {
            setTimeout(() => {
              if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
            }, 300);
            if (downloadBtn) {
              gsap.to(downloadBtn, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)' });
            }
          });
        }, 420);
      }
    });
  })();
})();