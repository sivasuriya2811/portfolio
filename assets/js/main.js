/**
 * SIVA SURIYA S — PORTFOLIO CORE SCRIPTS
 * One-Page Single Scrolling Experience
 * Futuristic Micro-interactions, Animated Counters, ScrollSpy, Navigation, and Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initScrollSpy();
  initAnimatedCounters();
  initResumeModal();
  initContactForm();
  initScrollReveals();
});

/* ==========================================================================
   NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  // Sticky transition on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile hamburger
  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
}

/* ==========================================================================
   SMOOTH SCROLLING FOR ALL ANCHORS
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Close mobile drawer if open
        const navToggle = document.querySelector('.nav-toggle');
        const mobileDrawer = document.querySelector('.mobile-nav-drawer');
        if (navToggle && mobileDrawer && mobileDrawer.classList.contains('open')) {
          navToggle.classList.remove('open');
          mobileDrawer.classList.remove('open');
          document.body.style.overflow = '';
        }

        const navHeight = 78;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navHeight + 10);

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL hash without abrupt jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/* ==========================================================================
   SCROLLSPY ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initScrollSpy() {
  const sectionIds = [
    'home',
    'about',
    'skills',
    'problem-solving',
    'projects',
    'education',
    'achievements',
    'certification',
    'training',
    'contact'
  ];

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function updateActiveSection() {
    const scrollPosition = window.scrollY + 140; // Offset for navbar height + buffer
    let currentId = 'home';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    // If near the top
    if (window.scrollY < 200) {
      currentId = 'home';
    }

    // If near the absolute bottom of page, highlight contact
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 80) {
      currentId = 'contact';
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();
}

/* ==========================================================================
   ANIMATED STATISTICS COUNTER
   Requirements:
   - Start counters from 0
   - Smoothly count to final value with cubic easing
   - Trigger when section enters viewport
   - Staggered start
   - Scale-up on completion
   - Do NOT restart on repeat scrolling
   - Format 7.6 properly (not 7.60)
   - Format percentages 86% and 91%
   - Treat "4 Months" as text without broken numeric parsing
   ========================================================================== */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('[data-target]');
  if (!counterElements.length) return;

  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  };

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        obs.disconnect(); // Do not repeatedly restart when scrolling past

        counterElements.forEach((el, index) => {
          const rawTarget = el.getAttribute('data-target');
          const isDecimal = el.getAttribute('data-decimal') === 'true';
          const isPercentage = el.getAttribute('data-percentage') === 'true';
          const isText = el.getAttribute('data-is-text') === 'true';
          const delay = index * 100; // Subtle stagger

          setTimeout(() => {
            if (isText) {
              el.textContent = rawTarget;
              el.classList.add('finished');
              return;
            }

            const targetVal = parseFloat(rawTarget);
            const duration = 1600; // Duration in ms
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease out cubic
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentVal = targetVal * easeOut;

              if (isDecimal) {
                el.textContent = currentVal.toFixed(1);
              } else {
                el.textContent = Math.floor(currentVal).toLocaleString();
              }

              if (isPercentage) {
                el.textContent += '%';
              }

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                if (isDecimal) {
                  el.textContent = targetVal.toFixed(1);
                } else if (isPercentage) {
                  el.textContent = targetVal + '%';
                } else {
                  el.textContent = targetVal.toLocaleString();
                }
                el.classList.add('finished');
              }
            }

            requestAnimationFrame(updateCounter);
          }, delay);
        });
      }
    });
  }, observerOptions);

  const statsSection = document.getElementById('stats') || document.querySelector('.stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ==========================================================================
   RESUME VIEWER MODAL
   ========================================================================== */
function initResumeModal() {
  const openButtons = document.querySelectorAll('.btn-resume-trigger');
  const modal = document.getElementById('resumeModal');
  const closeBtn = document.getElementById('closeResumeModal');

  if (!modal) return;

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   CONTACT FORM HANDLER & TOAST
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('senderName')?.value.trim();
    const email = document.getElementById('senderEmail')?.value.trim();
    const message = document.getElementById('senderMessage')?.value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      showToast('Please fill in all fields before sending.', 'error');
      return;
    }

    // Set button to loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Preparing Draft...
    `;
    submitBtn.disabled = true;

    // Simulate polished response & open mailto client
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      form.reset();

      showToast('Opening your email client to complete sending...', 'success');

      // Create prefilled mailto draft
      const mailtoUrl = `mailto:sivasuriya.s.it.28@psvpec.in?subject=Portfolio%20Inquiry%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(message + '\n\nSender Email: ' + email)}`;
      window.location.href = mailtoUrl;
    }, 800);
  });
}

function showToast(message, type = 'info') {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  const icon = type === 'error' ? '⚠️' : '✓';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   SCROLL REVEAL MICRO-INTERACTIONS
   ========================================================================== */
function initScrollReveals() {
  const revealCards = document.querySelectorAll(
    '.stat-card, .skill-category-card, .dsa-topic-card, .project-card, .edu-card, .achievement-card, .training-phase-card, .cert-card-premium'
  );

  if (!('IntersectionObserver' in window)) return;

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(card);
  });
}
