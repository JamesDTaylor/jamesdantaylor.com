import React, { useEffect, useRef, useState } from 'react';

/**
 * Authentic Cartographer's Feather Quill Cursor
 * 
 * Geometrically & anatomically proportioned antique bird flight feather quill:
 * - Contact writing tip precisely at (0, 0)
 * - Translucent calamus barrel with authentic nib slit & ink reservoir
 * - Graceful curved rachis (central spine) extending at a natural 40° writing angle
 * - Asymmetrical feather vanes (plumes) with delicate barbs and natural feather notches
 * - Wet calligraphy ink dip at the tip with subtle breathing glow on hover
 * - Organic ink bloom ripples on click & warm lantern spores on swift movement
 */

const MAX_PARTICLES = 30;
const MAX_RIPPLES = 4;

export default function CartographerQuillCursor() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const cursorRootRef = useRef(null);
  const canvasRef = useRef(null);

  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);

  const physicsRef = useRef({
    x: -9999,
    y: -9999,
    lastX: -9999,
    lastY: -9999,
    lastTime: performance.now(),
    vx: 0,
    vy: 0,
    smoothVx: 0,
    smoothVy: 0,
    speed: 0,
    tilt: 0,
    tiltVel: 0,
  });

  // Track pointer movements
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
      if (typeof window !== 'undefined' && window.innerWidth < 768) return;

      const clientX = e.clientX;
      const clientY = e.clientY;
      const p = physicsRef.current;
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);
      const dx = clientX - (p.lastX === -9999 ? clientX : p.lastX);
      const dy = clientY - (p.lastY === -9999 ? clientY : p.lastY);

      p.vx = (dx / dt) * 16.67;
      p.vy = (dy / dt) * 16.67;
      p.x = clientX;
      p.y = clientY;
      p.lastX = clientX;
      p.lastY = clientY;
      p.lastTime = now;

      if (!hasMoved) setHasMoved(true);

      if (cursorRootRef.current) {
        cursorRootRef.current.style.opacity = '1';
        cursorRootRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Emit delicate calligraphy ink spores & lantern motes on movement
      const dist = Math.hypot(dx, dy);
      if (dist > 4 && particlesRef.current.length < MAX_PARTICLES) {
        const themeColors = [
          'rgba(139, 30, 30, 0.85)',   // Vermilion ink
          'rgba(245, 158, 11, 0.80)',  // Warm amber lantern
          'rgba(90, 56, 37, 0.80)',    // Sepia walnut ink
          'rgba(217, 119, 6, 0.75)',   // Golden lantern glow
        ];
        particlesRef.current.push({
          x: clientX + (Math.random() - 0.5) * 3,
          y: clientY + (Math.random() - 0.5) * 3,
          vx: -p.vx * 0.08 + (Math.random() - 0.5) * 0.9,
          vy: -p.vy * 0.08 + (Math.random() - 0.5) * 0.9 - 0.2,
          size: 1.2 + Math.random() * 2.0,
          alpha: 0.82,
          decay: 0.038 + Math.random() * 0.025,
          color: themeColors[Math.floor(Math.random() * themeColors.length)],
        });
      }

      // Target hover detection
      const target = e.target;
      const cardEl = target && target.closest
        ? target.closest('.parchment-portal-card, .dossier-letter-card, .chronicle-card, .talent-tree-container, .relay-envelope-card')
        : null;
      setIsCardHovered(!!cardEl);

      const interactiveEl = target && target.closest
        ? target.closest('button, a, input, textarea, select, .parchment-portal-card, .clean-primary-btn, .clean-secondary-btn, .scene-back-btn, [role="button"], [role="menuitem"], .question-dot, .map-index-btn, .header-tool-btn, .cmd-item-row')
        : null;
      setIsHovered(!!interactiveEl);
    };

    const handleMouseDown = (e) => {
      if (e.pointerType === 'touch' || window.innerWidth < 768) return;
      setIsClicking(true);

      // Create an ink bloom ripple at click position
      if (ripplesRef.current.length < MAX_RIPPLES) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: 18,
          alpha: 0.65,
          color: '#8b1e1e', // Vermilion ink ring
        });
      }

      // Small splash of 6 fine ink motes
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 + (Math.random() - 0.5) * 0.3;
        const spd = 1.2 + Math.random() * 1.8;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.4 + Math.random() * 1.8,
          alpha: 0.9,
          decay: 0.05 + Math.random() * 0.03,
          color: i % 2 === 0 ? 'rgba(139, 30, 30, 0.9)' : 'rgba(245, 158, 11, 0.85)',
        });
      }
    };

    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hasMoved]);

  // Main animation canvas loop for ink particles & ripples
  useEffect(() => {
    if (!isDesktop) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsDesktop(false);
        return;
      }
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const tick = () => {
      const p = physicsRef.current;

      p.smoothVx += (p.vx - p.smoothVx) * 0.22;
      p.smoothVy += (p.vy - p.smoothVy) * 0.22;
      p.speed = Math.hypot(p.smoothVx, p.smoothVy);

      p.vx *= 0.82;
      p.vy *= 0.82;

      // Natural aerodynamic feather flexibility / tilt on movement
      const targetTilt = Math.max(-12, Math.min(12, -p.smoothVx * 0.4));
      p.tiltVel += (targetTilt - p.tilt) * 0.18;
      p.tiltVel *= 0.72;
      p.tilt += p.tiltVel;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render & expand ink ripples
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += 0.85;
          r.alpha -= 0.038;

          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Render drifting ink spores
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const sp = particlesRef.current[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.93;
          sp.vy *= 0.93;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, sp.alpha);
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * (sp.alpha * 0.8 + 0.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Ink Particles & Bloom Ripples Canvas */}
      <canvas
        ref={canvasRef}
        className="cartographer-ink-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          overflow: 'hidden',
        }}
      />

      {/* Cartographer's Feather Quill Cursor Container */}
      <div
        ref={cursorRootRef}
        className="cartographer-cursor-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform, opacity',
          opacity: hasMoved ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0px 0px',
            transform: `scale(${isClicking ? 0.90 : isHovered ? 1.08 : 1.0}) rotate(${physicsRef.current.tilt.toFixed(1)}deg)`,
            transition: 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isHovered
              ? 'drop-shadow(0 0 6px rgba(180, 83, 9, 0.75)) drop-shadow(0 2px 5px rgba(26, 15, 10, 0.45))'
              : 'drop-shadow(0 2px 4px rgba(26, 15, 10, 0.35))',
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', display: 'block' }}
          >
            <defs>
              {/* Parchment Ivory to Antique Gold Feather Gradient */}
              <linearGradient id="quillPlumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf8ea" />
                <stop offset="35%" stopColor="#f3e5c8" />
                <stop offset="70%" stopColor="#d9ba82" />
                <stop offset="100%" stopColor="#a3763f" />
              </linearGradient>

              {/* Shaded Under-Vane Feather Gradient */}
              <linearGradient id="quillUnderVaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dfca9e" />
                <stop offset="50%" stopColor="#b38749" />
                <stop offset="100%" stopColor="#633d1c" />
              </linearGradient>

              {/* Translucent Calamus Barrel Gradient */}
              <linearGradient id="quillCalamusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a0f0a" />
                <stop offset="30%" stopColor="#4a2d18" />
                <stop offset="70%" stopColor="#ecd49d" />
                <stop offset="100%" stopColor="#fdf7e7" />
              </linearGradient>

              {/* Central Rachis Shaft Gradient */}
              <linearGradient id="quillSpineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a0f0a" />
                <stop offset="35%" stopColor="#ecd59e" />
                <stop offset="85%" stopColor="#fefbf2" />
                <stop offset="100%" stopColor="#d6b272" />
              </linearGradient>
            </defs>

            {/* ── 1. Feather Silhouette Shadow / Outer Boundary ── */}
            <path
              d="M 0 0 
                 C 2 3, 5 7, 7 11
                 C 5 13, 6 17, 9 18
                 C 7 20, 10 24, 14 25
                 C 13 26, 17 29, 21 29
                 C 25 29, 28 30, 31 31
                 C 29 27, 26 21, 23 18
                 C 21 16, 18 12, 13 9
                 C 9 7, 5 4, 0 0 Z"
              fill="#1a0f0a"
              stroke="#140b07"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* ── 2. Lower Feather Vane (Broad side with organic notches) ── */}
            <path
              d="M 6 10
                 C 4 13, 5 16, 8 18
                 C 6 19, 9 23, 13 24
                 C 12 25, 16 28, 20 28
                 C 24 28, 27 29, 30 30
                 C 23 23, 16 16, 6 10 Z"
              fill="url(#quillUnderVaneGrad)"
            />

            {/* ── 3. Upper Feather Vane (Graceful sleek aerodynamic edge) ── */}
            <path
              d="M 6 10
                 C 9 8, 14 10, 18 13
                 C 22 16, 26 22, 30 30
                 C 23 23, 16 16, 6 10 Z"
              fill="url(#quillPlumeGrad)"
            />

            {/* ── 4. Detailed Feather Barb Striations (Slanted at natural ~30°) ── */}
            {/* Upper Vane Barbs */}
            <line x1="10" y1="12" x2="13" y2="10" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="14" y1="15" x2="18" y2="13" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="18" y1="19" x2="22.5" y2="17" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="22" y1="23" x2="26.5" y2="21" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.5" strokeLinecap="round" />

            {/* Lower Vane Barbs & Notch Shading */}
            <line x1="9" y1="14" x2="6.5" y2="16.5" stroke="rgba(40, 22, 10, 0.4)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="13" y1="17" x2="10" y2="21" stroke="rgba(40, 22, 10, 0.4)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="17" y1="21" x2="14.5" y2="25.5" stroke="rgba(40, 22, 10, 0.4)" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="22" y1="24.5" x2="19" y2="27.5" stroke="rgba(40, 22, 10, 0.4)" strokeWidth="0.5" strokeLinecap="round" />

            {/* ── 5. Central Rachis (Quill Shaft Spine) ── */}
            <path
              d="M 0 0 C 6 6, 15 15, 30 30"
              stroke="url(#quillSpineGrad)"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            {/* Rachis Highlight Crest */}
            <path
              d="M 2 2 C 7 7, 15 15, 28 28"
              stroke="#ffffff"
              strokeWidth="0.45"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />

            {/* ── 6. Bare Calamus Barrel (Cut Writing Nib at Tip) ── */}
            <path
              d="M 0 0 C 1.5 2.5, 3.5 5.5, 6 8.5 L 7 7.5 C 4.5 4.5, 2 1.5, 0 0 Z"
              fill="url(#quillCalamusGrad)"
            />

            {/* ── 7. Calamus Nib Slit & Breather Hole ── */}
            <line
              x1="0"
              y1="0"
              x2="4"
              y2="4"
              stroke="#1a0f0a"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
            <circle
              cx="4"
              cy="4"
              r="0.7"
              fill={isHovered ? "#8b1e1e" : "#1a0f0a"}
              stroke="#ecd59e"
              strokeWidth="0.3"
            />

            {/* ── 8. Wet Calligraphy Ink Pip at Contact Tip (0, 0) ── */}
            <circle
              cx="0"
              cy="0"
              r={isHovered ? 1.5 : 1.1}
              fill={isHovered ? "#8b1e1e" : "#140b07"}
              stroke={isHovered ? "#fde68a" : "#fbf7ee"}
              strokeWidth="0.4"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
