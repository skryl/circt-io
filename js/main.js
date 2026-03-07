// ============================================
// CIRCT Landing Page - Interactive Elements
// ============================================

(function () {
  'use strict';

  // ---- RTL Schematic Canvas Animation ----
  function initCircuitCanvas() {
    const canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let components = [];
    let wires = [];
    let pulses = [];
    let animationId;

    // Color palette - dark red Ruby/Shenzhen I/O theme
    const COLORS = {
      compFill: 'rgba(50, 25, 20, 0.6)',
      compStroke: 'rgba(140, 50, 40, 0.45)',
      wireColor: 'rgba(160, 80, 50, 0.25)',
      portIn: 'rgba(200, 70, 55, 0.7)',
      portOut: 'rgba(200, 70, 55, 0.5)',
      pulseCore: 'rgba(230, 80, 60, 0.9)',
      pulseGlow: 'rgba(204, 52, 45, 0.3)',
      labelColor: 'rgba(160, 90, 70, 0.35)',
    };

    // Component type templates
    const COMP_TYPES = [
      { name: 'MUX', w: 40, minH: 40, maxH: 60, inputs: [2, 3], outputs: 1 },
      { name: 'REG', w: 50, minH: 35, maxH: 50, inputs: [1, 2], outputs: 1 },
      { name: 'ALU', w: 55, minH: 50, maxH: 70, inputs: [2, 3], outputs: [1, 2] },
      { name: 'AND', w: 35, minH: 30, maxH: 40, inputs: [2], outputs: 1 },
      { name: 'OR', w: 35, minH: 30, maxH: 40, inputs: [2], outputs: 1 },
      { name: 'DFF', w: 45, minH: 35, maxH: 45, inputs: [1, 2], outputs: 1 },
      { name: 'DEC', w: 45, minH: 50, maxH: 70, inputs: [1], outputs: [2, 3, 4] },
      { name: 'ADD', w: 40, minH: 35, maxH: 45, inputs: [2], outputs: 1 },
      { name: 'CMP', w: 40, minH: 35, maxH: 45, inputs: [2], outputs: 1 },
      { name: 'SHL', w: 35, minH: 30, maxH: 40, inputs: [1, 2], outputs: 1 },
    ];

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
      return Math.floor(rand(min, max + 1));
    }

    function pick(arr) {
      return Array.isArray(arr) ? arr[randInt(0, arr.length - 1)] : arr;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateSchematic();
    }

    function generateSchematic() {
      components = [];
      wires = [];
      pulses = [];

      // Generate components in columns (left to right flow like RTL)
      const colSpacing = 130;
      const numCols = Math.ceil(width / colSpacing) + 2;
      const margin = 40;

      // For each column, place components vertically
      const columns = [];
      for (let col = 0; col < numCols; col++) {
        const x = col * colSpacing + rand(-15, 15) + margin;
        const compCount = randInt(2, Math.min(5, Math.ceil(height / 120)));
        const colComps = [];

        // Distribute components vertically
        const totalSpace = height - margin * 2;
        const slotHeight = totalSpace / compCount;

        for (let i = 0; i < compCount; i++) {
          const type = COMP_TYPES[randInt(0, COMP_TYPES.length - 1)];
          const h = rand(type.minH, type.maxH);
          const y = margin + slotHeight * i + rand(5, slotHeight - h - 5);
          const numInputs = pick(type.inputs);
          const numOutputs = pick(type.outputs);

          const comp = {
            x: x,
            y: y,
            w: type.w + rand(-5, 10),
            h: h,
            type: type.name,
            numInputs: numInputs,
            numOutputs: numOutputs,
            inputPorts: [],
            outputPorts: [],
            brightness: rand(0.5, 1.0),
          };

          // Generate input port positions (left side)
          for (let p = 0; p < numInputs; p++) {
            const py = comp.y + (comp.h / (numInputs + 1)) * (p + 1);
            comp.inputPorts.push({ x: comp.x, y: py, connected: false });
          }

          // Generate output port positions (right side)
          for (let p = 0; p < numOutputs; p++) {
            const py = comp.y + (comp.h / (numOutputs + 1)) * (p + 1);
            comp.outputPorts.push({ x: comp.x + comp.w, y: py, connected: false });
          }

          colComps.push(comp);
          components.push(comp);
        }
        columns.push(colComps);
      }

      // Connect components: output ports of column N -> input ports of column N+1 or N+2
      for (let col = 0; col < columns.length - 1; col++) {
        const srcCol = columns[col];
        const reachCols = [columns[col + 1]];
        if (col + 2 < columns.length && Math.random() > 0.5) {
          reachCols.push(columns[col + 2]);
        }

        for (const src of srcCol) {
          for (const outPort of src.outputPorts) {
            // Try to connect to a random input in a reachable column
            const targetCol = reachCols[randInt(0, reachCols.length - 1)];
            if (!targetCol || targetCol.length === 0) continue;

            const target = targetCol[randInt(0, targetCol.length - 1)];
            // Find an unconnected input, or pick any
            let inPort = target.inputPorts.find((p) => !p.connected);
            if (!inPort) inPort = target.inputPorts[randInt(0, target.inputPorts.length - 1)];

            if (Math.random() > 0.25) {
              // Manhattan routing with 1-2 bends
              const points = buildWireRoute(outPort, inPort);
              wires.push({
                points: points,
                brightness: rand(0.15, 0.4),
                totalLength: calcRouteLength(points),
              });
              outPort.connected = true;
              inPort.connected = true;
            }
          }
        }
      }

      // Add some extra random cross-connections for complexity
      const extraWires = Math.floor(components.length * 0.15);
      for (let i = 0; i < extraWires; i++) {
        const srcIdx = randInt(0, components.length - 1);
        const dstIdx = randInt(0, components.length - 1);
        if (srcIdx === dstIdx) continue;

        const src = components[srcIdx];
        const dst = components[dstIdx];
        if (src.outputPorts.length === 0 || dst.inputPorts.length === 0) continue;
        if (src.x >= dst.x) continue; // Only left to right

        const outPort = src.outputPorts[randInt(0, src.outputPorts.length - 1)];
        const inPort = dst.inputPorts[randInt(0, dst.inputPorts.length - 1)];

        const points = buildWireRoute(outPort, inPort);
        wires.push({
          points: points,
          brightness: rand(0.1, 0.3),
          totalLength: calcRouteLength(points),
        });
      }
    }

    function buildWireRoute(from, to) {
      const points = [{ x: from.x, y: from.y }];
      const dx = to.x - from.x;

      if (Math.abs(from.y - to.y) < 3) {
        // Nearly horizontal: straight line
        points.push({ x: to.x, y: to.y });
      } else if (dx > 40) {
        // Standard L or Z routing
        const midX = from.x + dx * rand(0.3, 0.7);
        // Horizontal out
        points.push({ x: midX, y: from.y });
        // Vertical jog
        points.push({ x: midX, y: to.y });
        // Horizontal in
        points.push({ x: to.x, y: to.y });
      } else {
        // Short connection or backwards: use a detour
        const detourX = from.x + rand(20, 50);
        const detourY = (from.y + to.y) / 2 + rand(-30, 30);
        points.push({ x: detourX, y: from.y });
        points.push({ x: detourX, y: detourY });
        points.push({ x: to.x - 10, y: detourY });
        points.push({ x: to.x - 10, y: to.y });
        points.push({ x: to.x, y: to.y });
      }

      return points;
    }

    function calcRouteLength(points) {
      let len = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return len;
    }

    function getPointOnRoute(points, progress, totalLength) {
      let targetDist = progress * totalLength;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        if (targetDist <= segLen) {
          const t = segLen > 0 ? targetDist / segLen : 0;
          return {
            x: points[i - 1].x + dx * t,
            y: points[i - 1].y + dy * t,
          };
        }
        targetDist -= segLen;
      }
      return points[points.length - 1];
    }

    function spawnPulse() {
      if (wires.length === 0) return;
      const wire = wires[Math.floor(Math.random() * wires.length)];
      pulses.push({
        wire: wire,
        progress: 0,
        speed: rand(0.003, 0.012),
        brightness: rand(0.5, 1.0),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw wires
      for (const wire of wires) {
        ctx.strokeStyle = `rgba(160, 80, 50, ${wire.brightness * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wire.points[0].x, wire.points[0].y);
        for (let i = 1; i < wire.points.length; i++) {
          ctx.lineTo(wire.points[i].x, wire.points[i].y);
        }
        ctx.stroke();
      }

      // Draw components
      for (const comp of components) {
        const a = comp.brightness;

        // Component body fill
        ctx.fillStyle = `rgba(50, 25, 20, ${0.45 * a})`;
        ctx.strokeStyle = `rgba(140, 50, 40, ${0.35 * a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(comp.x, comp.y, comp.w, comp.h);
        ctx.fill();
        ctx.stroke();

        // Component label (very subtle)
        ctx.fillStyle = `rgba(160, 90, 70, ${0.25 * a})`;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(comp.type, comp.x + comp.w / 2, comp.y + comp.h / 2);

        // Draw input ports (left side)
        for (const port of comp.inputPorts) {
          // Short wire stub
          ctx.strokeStyle = `rgba(200, 70, 55, ${0.3 * a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(port.x - 8, port.y);
          ctx.lineTo(port.x, port.y);
          ctx.stroke();

          // Port dot
          ctx.fillStyle = `rgba(200, 70, 55, ${0.6 * a})`;
          ctx.beginPath();
          ctx.arc(port.x - 8, port.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw output ports (right side)
        for (const port of comp.outputPorts) {
          // Short wire stub
          ctx.strokeStyle = `rgba(200, 70, 55, ${0.3 * a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(port.x, port.y);
          ctx.lineTo(port.x + 8, port.y);
          ctx.stroke();

          // Port dot
          ctx.fillStyle = `rgba(200, 70, 55, ${0.5 * a})`;
          ctx.beginPath();
          ctx.arc(port.x + 8, port.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw and update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;

        if (p.progress > 1) {
          pulses.splice(i, 1);
          continue;
        }

        const pos = getPointOnRoute(p.wire.points, p.progress, p.wire.totalLength);
        // Fade in/out at edges
        const edgeFade = Math.min(p.progress * 5, (1 - p.progress) * 5, 1);
        const alpha = p.brightness * edgeFade;

        // Glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 16);
        gradient.addColorStop(0, `rgba(230, 80, 60, ${alpha * 0.35})`);
        gradient.addColorStop(0.5, `rgba(204, 52, 45, ${alpha * 0.1})`);
        gradient.addColorStop(1, 'rgba(204, 52, 45, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(240, 90, 70, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlight the wire segment near the pulse
        ctx.strokeStyle = `rgba(230, 80, 60, ${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const p1 = getPointOnRoute(
          p.wire.points,
          Math.max(0, p.progress - 0.05),
          p.wire.totalLength
        );
        const p2 = getPointOnRoute(
          p.wire.points,
          Math.min(1, p.progress + 0.05),
          p.wire.totalLength
        );
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Spawn new pulses
      if (Math.random() > 0.92) spawnPulse();

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
    });
    resize();

    // Pre-spawn some pulses
    for (let i = 0; i < 10; i++) spawnPulse();

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
