import React, { useEffect, useRef, useState } from 'react';

/**
 * Cartographer's Navigation Pointer Cursor
 * 
 * An unmistakable, classic directional cursor arrow crafted in the
 * Marauder's Map & Antique Parchment art style:
 * - Unambiguous pointer arrow silhouette with contact apex precisely at (0, 0)
 * - Chiseled cartographic compass facets: gilded parchment brass & shaded walnut bronze
 * - Embedded miniature vermilion compass star / wax seal jewel
 * - Fine calligraphy ink contour for high contrast across parchment & cards
 * - Soft lantern motes & ink ripples on interaction
 */

const MAX_PARTICLES = 25;
const MAX_RIPPLES = 3;

export default function ThemeCursor() {
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
  });

  // Track pointer movements with zero latency
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

      // Delicate ambient lantern motes on brisk motion
      const dist = Math.hypot(dx, dy);
      if (dist > 5 && particlesRef.current.length < MAX_PARTICLES) {
        const themeColors = [
          'rgba(245, 158, 11, 0.85)',  // Warm lantern amber
          'rgba(217, 119, 6, 0.80)',   // Gilded gold
          'rgba(139, 30, 30, 0.75)',   // Vermilion seal red
          'rgba(90, 56, 37, 0.75)',    // Walnut ink
        ];
        particlesRef.current.push({
          x: clientX + (Math.random() - 0.5) * 3,
          y: clientY + (Math.random() - 0.5) * 3,
          vx: -p.vx * 0.08 + (Math.random() - 0.5) * 0.8,
          vy: -p.vy * 0.08 + (Math.random() - 0.5) * 0.8 - 0.2,
          size: 1.2 + Math.random() * 1.8,
          alpha: 0.8,
          decay: 0.04 + Math.random() * 0.03,
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

      // Ink ripple pulse at click position
      if (ripplesRef.current.length < MAX_RIPPLES) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: 16,
          alpha: 0.65,
          color: '#8b1e1e',
        });
      }

      // Small burst of 6 fine lantern sparks
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 + (Math.random() - 0.5) * 0.3;
        const spd = 1.3 + Math.random() * 1.8;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.4 + Math.random() * 1.6,
          alpha: 0.95,
          decay: 0.05 + Math.random() * 0.03,
          color: i % 2 === 0 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(139, 30, 30, 0.85)',
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

  // Canvas animation loop for particles & ripples
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
      p.vx *= 0.82;
      p.vy *= 0.82;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render ripples
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += 0.8;
          r.alpha -= 0.04;

          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = Math.max(0, r.alpha);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Render particles
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
      {/* Ambient Lantern & Ink Sparks Canvas */}
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

      {/* Cartographer's Navigation Pointer Arrow */}
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
            transform: `scale(${isClicking ? 0.92 : isHovered ? 1.10 : 1.0})`,
            transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isHovered
              ? 'drop-shadow(0 0 6px rgba(180, 83, 9, 0.8)) drop-shadow(0 2px 4px rgba(26, 15, 10, 0.45))'
              : 'drop-shadow(0 2px 4px rgba(26, 15, 10, 0.35))',
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
              {/* Luminous Antique Parchment Brass Highlight Gradient */}
              <linearGradient id="navGoldFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffdf4" />
                <stop offset="30%" stopColor="#f3deaa" />
                <stop offset="70%" stopColor="#caa052" />
                <stop offset="100%" stopColor="#9e7232" />
              </linearGradient>

              {/* Shaded Walnut & Deep Leather Bronze Gradient */}
              <linearGradient id="navWalnutFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a87834" />
                <stop offset="45%" stopColor="#7a4e20" />
                <stop offset="85%" stopColor="#4a2c13" />
                <stop offset="100%" stopColor="#241308" />
              </linearGradient>

              {/* Wax Seal Vermilion Red Jewel Gradient */}
              <radialGradient id="navSealGem" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="35%" stopColor="#dc2626" />
                <stop offset="75%" stopColor="#8b1e1e" />
                <stop offset="100%" stopColor="#450a0a" />
              </radialGradient>
            </defs>

            {/* ── 1. Calligraphy Ink Silhouette Shadow Outline (Unmistakable Arrow Silhouette) ── */}
            <path
              d="M 0 0 
                 L 0 19.5 
                 L 4.5 15.5 
                 L 8.5 23.5 
                 L 12 22 
                 L 8 14 
                 L 14.5 14 
                 Z"
              fill="#1a0f0a"
              stroke="#140b07"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* ── 2. Shaded Walnut Leather / Bronze Right Facet & Arrow Shaft ── */}
            <path
              d="M 0 0 
                 L 6 12 
                 L 8 14 
                 L 14.5 14 
                 L 8 14 
                 L 12 22 
                 L 8.5 23.5 
                 L 4.5 15.5 
                 L 6 12 
                 Z"
              fill="url(#navWalnutFacet)"
            />

            {/* ── 3. Luminous Antique Parchment Gilded Upper-Left Facet ── */}
            <path
              d="M 0 0 
                 L 0 19.5 
                 L 4.5 15.5 
                 L 6 12 
                 Z"
              fill="url(#navGoldFacet)"
            />

            {/* ── 4. Chiseled Center Blade Ridge Line (Warm Ivory Reflection) ── */}
            <line
              x1="0"
              y1="0"
              x2="6"
              y2="12"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />

            {/* ── 5. Secondary Shaft Ridge Line ── */}
            <line
              x1="6"
              y1="12"
              x2="10.2"
              y2="22.5"
              stroke="#ecd599"
              strokeWidth="0.55"
              strokeLinecap="round"
            />

            {/* ── 6. Cartographer's Navigation Compass Star / Seal Gem at (5.5, 9.5) ── */}
            <g transform="translate(5.5, 9.5)">
              {/* Gold Compass Star Diamond */}
              <path
                d="M 0 -3.2 L 1.2 -1 L 3.2 0 L 1.2 1 L 0 3.2 L -1.2 1 L -3.2 0 L -1.2 -1 Z"
                fill="#ecd599"
                stroke="#1a0f0a"
                strokeWidth="0.35"
              />
              {/* Center Vermilion Wax Core */}
              <circle cx="0" cy="0" r="1.3" fill="url(#navSealGem)" stroke="#1a0f0a" strokeWidth="0.3" />
              <circle cx="-0.35" cy="-0.35" r="0.35" fill="#ffffff" />
            </g>

            {/* ── 7. Fine Contact Tip Point at (0, 0) ── */}
            <circle
              cx="0"
              cy="0"
              r="0.8"
              fill="#fffdf4"
              stroke="#140b07"
              strokeWidth="0.3"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
