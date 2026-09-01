import React, { useEffect, useRef, useState } from 'react';

/**
 * Golden Steampunk Cursor
 * Ergonomics & shape: Identical to the standard OS pointer arrow (tip at 0,0).
 * Aesthetics: Hand-forged burnished brass, 24k gold highlights, chiseled bevels,
 * interlocking micro clockwork gears, ruby pivot jewel, brass rivets, and
 * golden aetheric spark particle trails on movement & click.
 */

const SPARK_MAX = 35;

export default function SteampunkCursor() {
  const [isDesktopActive, setIsDesktopActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorRootRef = useRef(null);
  const gear1Ref = useRef(null);
  const gear2Ref = useRef(null);
  const canvasRef = useRef(null);

  // Particle pool for golden aether sparks & steam motes
  const sparksRef = useRef([]);

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
    gearAngle1: 0,
    gearAngle2: 0,
    initialized: false,
  });

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

      if (!isDesktopActive) {
        setIsDesktopActive(true);
      }

      if (cursorRootRef.current) {
        cursorRootRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Spawn warm lantern glow & sepia motes on movement
      const dist = Math.hypot(dx, dy);
      if (dist > 3 && sparksRef.current.length < SPARK_MAX) {
        const colors = ['#f59e0b', '#d97706', '#b45309', '#e8ca84', '#8b1e1e'];
        sparksRef.current.push({
          x: clientX + (Math.random() - 0.5) * 4,
          y: clientY + (Math.random() - 0.5) * 4,
          vx: -p.vx * 0.08 + (Math.random() - 0.5) * 1.2,
          vy: -p.vy * 0.08 + (Math.random() - 0.5) * 1.2 - 0.25,
          size: 1.2 + Math.random() * 2.0,
          alpha: 0.82,
          decay: 0.035 + Math.random() * 0.03,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Interactive / Card Hover Detection
      const target = e.target;
      const cardEl = target && target.closest
        ? target.closest('.parchment-portal-card, .spatial-card-root, .work-spatial-card, .dossier-letter-card, .chronicle-card, .talent-tree-container, .relay-envelope-card')
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

      // Burst of warm amber lantern sparks on click
      const clickColors = ['#f59e0b', '#d97706', '#ecd599', '#8b1e1e'];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + (Math.random() - 0.5) * 0.4;
        const spd = 1.4 + Math.random() * 2.6;
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.5 + Math.random() * 2.2,
          alpha: 1.0,
          decay: 0.045 + Math.random() * 0.03,
          color: clickColors[i % clickColors.length],
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
  }, [isDesktopActive]);

  // Canvas Particle Animation & Clockwork Gears Loop
  useEffect(() => {
    if (!isDesktopActive) return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsDesktopActive(false);
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

      // Smooth velocity tracking
      p.smoothVx += (p.vx - p.smoothVx) * 0.25;
      p.smoothVy += (p.vy - p.smoothVy) * 0.25;
      p.speed = Math.hypot(p.smoothVx, p.smoothVy);

      p.vx *= 0.84;
      p.vy *= 0.84;

      // Rotate steampunk cogs based on speed and hover
      const spinSpeed = (isHovered || isCardHovered ? 4.2 : 0.75) + p.speed * 0.7;
      p.gearAngle1 = (p.gearAngle1 + spinSpeed) % 360;
      p.gearAngle2 = (p.gearAngle2 - spinSpeed * 1.4) % 360; // Interlocking counter-rotation

      if (gear1Ref.current) {
        gear1Ref.current.style.transform = `rotate(${p.gearAngle1.toFixed(1)}deg)`;
      }
      if (gear2Ref.current) {
        gear2Ref.current.style.transform = `rotate(${p.gearAngle2.toFixed(1)}deg)`;
      }

      // Draw particle sparks on canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = sparksRef.current.length - 1; i >= 0; i--) {
          const sp = sparksRef.current[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            sparksRef.current.splice(i, 1);
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
  }, [isDesktopActive, isHovered, isCardHovered]);

  if (!isDesktopActive) return null;

  return (
    <>
      {/* Warm Ambient Lantern & Ink Sparks Canvas */}
      <canvas
        ref={canvasRef}
        className="steampunk-sparks-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          overflow: 'hidden',
        }}
      />

      {/* Main Theme-Matched Steampunk Pointer Arrow */}
      <div
        ref={cursorRootRef}
        className="steampunk-cursor-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '0px 0px',
            transform: `scale(${isClicking ? 0.92 : isHovered ? 1.10 : 1.0})`,
            transition: 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isHovered
              ? 'drop-shadow(0 0 7px rgba(180, 83, 9, 0.75)) drop-shadow(0 2px 5px rgba(26, 15, 10, 0.45))'
              : 'drop-shadow(0 2px 5px rgba(26, 15, 10, 0.38))',
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible', display: 'block' }}
          >
            <defs>
              {/* Theme-Matched Antique Parchment Gold Gradient */}
              <linearGradient id="themeGoldFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf6e2" />
                <stop offset="30%" stopColor="#ecd599" />
                <stop offset="70%" stopColor="#caa052" />
                <stop offset="100%" stopColor="#9e7232" />
              </linearGradient>

              {/* Theme-Matched Deep Walnut & Leather Shadow Gradient */}
              <linearGradient id="themeWalnutFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a87834" />
                <stop offset="45%" stopColor="#7a4e20" />
                <stop offset="85%" stopColor="#4a2c13" />
                <stop offset="100%" stopColor="#2b170a" />
              </linearGradient>

              {/* Theme-Matched Antique Clockwork Brass Cog Gradient */}
              <linearGradient id="themeCogBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5de9c" />
                <stop offset="50%" stopColor="#c49645" />
                <stop offset="100%" stopColor="#734a18" />
              </linearGradient>

              {/* Theme Wax Seal Vermilion Red Jewel Gradient */}
              <radialGradient id="themeWaxJewelGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="35%" stopColor="#dc2626" />
                <stop offset="75%" stopColor="#8b1e1e" />
                <stop offset="100%" stopColor="#4a0b0b" />
              </radialGradient>
            </defs>

            {/* ── 1. Outer Deep Calligraphy Ink Border & Cast Bevel ── */}
            <path
              d="M 0 0 L 0 19 L 4.5 15 L 8.5 23 L 12 21.5 L 8 13.5 L 14.5 13.5 Z"
              fill="#1a0f0a"
              stroke="#140b07"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* ── 2. Deep Walnut / Antique Bronze Right Facet & Shaft ── */}
            <path
              d="M 0 0 L 6 12 L 8 13.5 L 14.5 13.5 L 8 13.5 L 12 21.5 L 8.5 23 L 4.5 15 L 6 12 Z"
              fill="url(#themeWalnutFacet)"
            />

            {/* ── 3. Luminous Antique Parchment Gilded Upper Facet ── */}
            <path
              d="M 0 0 L 0 19 L 4.5 15 L 6 12 Z"
              fill="url(#themeGoldFacet)"
            />

            {/* ── 4. Chiseled Center Blade Ridge Line (Creamy Parchment Ivory) ── */}
            <line
              x1="0"
              y1="0"
              x2="6"
              y2="12"
              stroke="#fdf8e8"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* ── 5. Secondary Shaft Ridge Line ── */}
            <line
              x1="6"
              y1="12"
              x2="10.2"
              y2="22.2"
              stroke="#ecd599"
              strokeWidth="0.55"
              strokeLinecap="round"
            />

            {/* ── 6. Precision Vernier Cartography Ticks along Left Edge ── */}
            <line x1="0.5" y1="4.5" x2="2.2" y2="4.5" stroke="#3d220e" strokeWidth="0.55" />
            <line x1="0.5" y1="8" x2="3.0" y2="8" stroke="#3d220e" strokeWidth="0.65" />
            <line x1="0.5" y1="11.5" x2="2.2" y2="11.5" stroke="#3d220e" strokeWidth="0.55" />
            <line x1="0.5" y1="15" x2="3.0" y2="15" stroke="#3d220e" strokeWidth="0.65" />

            {/* ── 7. Secondary Interlocking Pinion Micro-Gear on Shaft (at 8.2, 17.5) ── */}
            <g
              ref={gear2Ref}
              style={{
                transformOrigin: '8.2px 17.5px',
                willChange: 'transform',
              }}
            >
              <circle cx="8.2" cy="17.5" r="2.2" fill="url(#themeCogBrassGrad)" stroke="#1a0f0a" strokeWidth="0.4" />
              {/* 4 Micro Teeth */}
              <line x1="8.2" y1="14.8" x2="8.2" y2="20.2" stroke="#f5de9c" strokeWidth="0.75" />
              <line x1="5.5" y1="17.5" x2="10.9" y2="17.5" stroke="#f5de9c" strokeWidth="0.75" />
              <circle cx="8.2" cy="17.5" r="0.8" fill="#3d220e" />
            </g>

            {/* ── 8. Primary Steampunk Clockwork Cog (at Heart of Arrow: 5.6, 9.2) ── */}
            <g
              ref={gear1Ref}
              style={{
                transformOrigin: '5.6px 9.2px',
                willChange: 'transform',
              }}
            >
              {/* Outer Gear Wheel */}
              <circle cx="5.6" cy="9.2" r="3.4" fill="url(#themeCogBrassGrad)" stroke="#1a0f0a" strokeWidth="0.45" />
              
              {/* 6 Radial Brass Gear Teeth */}
              <line x1="5.6" y1="5.2" x2="5.6" y2="13.2" stroke="#fae8b4" strokeWidth="1.0" />
              <line x1="2.1" y1="7.2" x2="9.1" y2="11.2" stroke="#fae8b4" strokeWidth="1.0" />
              <line x1="2.1" y1="11.2" x2="9.1" y2="7.2" stroke="#fae8b4" strokeWidth="1.0" />

              {/* Inner Gear Recess */}
              <circle cx="5.6" cy="9.2" r="2.2" fill="#3d220e" stroke="#caa052" strokeWidth="0.3" />

              {/* Center Wax Seal Vermilion Red Pivot Jewel */}
              <circle cx="5.6" cy="9.2" r="1.2" fill="url(#themeWaxJewelGrad)" stroke="#caa052" strokeWidth="0.3" />
              <circle cx="5.2" cy="8.8" r="0.35" fill="#ffffff" />
            </g>

            {/* ── 9. Micro Brass Rivets / Screws with Fastener Slits ── */}
            {/* Rivet 1: Base notch */}
            <g transform="translate(2.4, 15.6)">
              <circle cx="0" cy="0" r="0.85" fill="#ecd599" stroke="#3d220e" strokeWidth="0.35" />
              <line x1="-0.5" y1="0" x2="0.5" y2="0" stroke="#3d220e" strokeWidth="0.3" />
            </g>
            {/* Rivet 2: Shaft tail */}
            <g transform="translate(9.8, 20.8)">
              <circle cx="0" cy="0" r="0.8" fill="#ecd599" stroke="#3d220e" strokeWidth="0.35" />
              <line x1="-0.45" y1="0" x2="0.45" y2="0" stroke="#3d220e" strokeWidth="0.3" />
            </g>
            {/* Rivet 3: Right wing */}
            <g transform="translate(12.6, 13.5)">
              <circle cx="0" cy="0" r="0.8" fill="#ecd599" stroke="#3d220e" strokeWidth="0.35" />
              <line x1="-0.45" y1="0" x2="0.45" y2="0" stroke="#3d220e" strokeWidth="0.3" />
            </g>

            {/* ── 10. Fine Warm Ivory Apex Pip (Hot Spot 0, 0) ── */}
            <circle cx="0" cy="0" r="0.85" fill="#fdf8e8" stroke="#140b07" strokeWidth="0.3" />
          </svg>
        </div>
      </div>
    </>
  );
}
