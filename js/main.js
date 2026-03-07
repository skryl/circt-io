// ============================================
// CIRCT Landing Page - Interactive Elements
// ============================================

(function () {
  'use strict';

  // ---- Circuit Board Canvas Animation ----
  function initCircuitCanvas() {
    const canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let traces = [];
    let pulses = [];
    let animationId;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      generateCircuit();
    }

    function generateCircuit() {
      nodes = [];
      traces = [];

      // Create a grid of nodes with some randomness
      const spacing = 80;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.4) {
            nodes.push({
              x: c * spacing + (Math.random() - 0.5) * 20,
              y: r * spacing + (Math.random() - 0.5) * 20,
              radius: Math.random() > 0.7 ? 3 : 1.5,
              brightness: Math.random() * 0.3 + 0.1,
            });
          }
        }
      }

      // Create traces between nearby nodes (Manhattan routing)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = Math.abs(nodes[i].x - nodes[j].x);
          const dy = Math.abs(nodes[i].y - nodes[j].y);
          const dist = dx + dy;

          if (dist < spacing * 1.5 && dist > spacing * 0.3 && Math.random() > 0.6) {
            // Manhattan routing: go horizontal then vertical
            const midX = Math.random() > 0.5 ? nodes[j].x : nodes[i].x;
            const midY = Math.random() > 0.5 ? nodes[i].y : nodes[j].y;

            traces.push({
              x1: nodes[i].x,
              y1: nodes[i].y,
              mx: midX,
              my: midY,
              x2: nodes[j].x,
              y2: nodes[j].y,
              brightness: Math.random() * 0.12 + 0.03,
            });
          }
        }
      }
    }

    function spawnPulse() {
      if (traces.length === 0) return;
      const trace = traces[Math.floor(Math.random() * traces.length)];
      pulses.push({
        trace: trace,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        brightness: 0.6 + Math.random() * 0.4,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw traces
      ctx.lineWidth = 1;
      for (const t of traces) {
        ctx.strokeStyle = `rgba(0, 212, 255, ${t.brightness})`;
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.mx, t.my);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.fillStyle = `rgba(0, 212, 255, ${n.brightness})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw and update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress > 1) {
          pulses.splice(i, 1);
          continue;
        }

        const t = p.trace;
        let px, py;

        if (p.progress < 0.5) {
          // First segment: start to mid
          const seg = p.progress * 2;
          px = t.x1 + (t.mx - t.x1) * seg;
          py = t.y1 + (t.my - t.y1) * seg;
        } else {
          // Second segment: mid to end
          const seg = (p.progress - 0.5) * 2;
          px = t.mx + (t.x2 - t.mx) * seg;
          py = t.my + (t.y2 - t.my) * seg;
        }

        const alpha = p.brightness * (1 - Math.abs(p.progress - 0.5) * 1.5);

        // Glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 12);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn new pulses
      if (Math.random() > 0.95) spawnPulse();

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();

    // Pre-spawn some pulses
    for (let i = 0; i < 5; i++) spawnPulse();

    draw();

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });
  }

  // ---- Scroll Animations (Intersection Observer) ----
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Stagger animation for grid items
            const parent = entry.target.parentElement;
            if (parent) {
              const siblings = Array.from(parent.querySelectorAll('.fade-in'));
              const idx = siblings.indexOf(entry.target);
              const delay = idx >= 0 ? idx * 80 : 0;
              setTimeout(() => entry.target.classList.add('visible'), delay);
            } else {
              entry.target.classList.add('visible');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  }

  // ---- Navbar Scroll Effect ----
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  // ---- Code Tabs ----
  function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    const panels = document.querySelectorAll('.code-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach((p) => {
          p.classList.toggle('hidden', p.id !== `tab-${target}`);
        });
      });
    });
  }

  // ---- Smooth Scroll for Anchor Links ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---- Initialize ----
  document.addEventListener('DOMContentLoaded', () => {
    initCircuitCanvas();
    initScrollAnimations();
    initNavScroll();
    initMobileMenu();
    initCodeTabs();
    initSmoothScroll();
  });
})();
