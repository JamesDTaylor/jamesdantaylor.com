import React, { useEffect, useRef, useState } from 'react';

/**
 * Pure Cartographer Cursor & Buzzing Flies
 * 
 * Clean, uncluttered directional pointer arrow in theme-matched parchment & ink palette,
 * with organic buzzing midges / flies swarm trailing the cursor.
 * Exposes fly registry for interactive predation by the ground frog character.
 */

const FLY_COUNT = 4;

function createFlies(startX = 0, startY = 0) {
  return Array.from({ length: FLY_COUNT }, (_, i) => ({
    id: `fly_${Date.now()}_${i}_${Math.random()}`,
    x: startX + (Math.random() - 0.5) * 20,
    y: startY - 8 + (Math.random() - 0.5) * 15,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    angle: (i * (Math.PI * 2)) / FLY_COUNT,
    orbitRadiusX: 8 + Math.random() * 6,
    orbitRadiusY: 4.5 + Math.random() * 4.5,
    speed: 0.038 + Math.random() * 0.025,
    direction: Math.random() > 0.5 ? 1 : -1,
    heightOffset: -6 - Math.random() * 6,
    lagFactor: 0.018 + Math.random() * 0.014, // Individual reaction delay
    dartTimer: Math.floor(Math.random() * 30),
    dartVx: 0,
    dartVy: 0,
    wingPhase: Math.random() * 10,
    eaten: false,
  }));
}

export default function ThemeCursor() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const cursorRootRef = useRef(null);
  const canvasRef = useRef(null);
  const fliesRef = useRef(createFlies());
  const respawnTimerRef = useRef(0);

  const physicsRef = useRef({
    x: -9999,
    y: -9999,
    lastX: -9999,
    lastY: -9999,
    swarmX: -9999,
    swarmY: -9999,
    lastTime: performance.now(),
    vx: 0,
    vy: 0,
    smoothVx: 0,
    smoothVy: 0,
    speed: 0,
    initialized: false,
  });

  // Expose global fly eating function for the frog character
  useEffect(() => {
    window.__cursorFlies = fliesRef.current;
    window.__eatCursorFly = (flyId) => {
      const idx = fliesRef.current.findIndex((f) => f.id === flyId);
      if (idx !== -1) {
        fliesRef.current.splice(idx, 1);
        window.__cursorFlies = fliesRef.current;
        return true;
      }
      return false;
    };

    return () => {
      window.__cursorFlies = [];
      window.__eatCursorFly = null;
    };
  }, []);

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

      // On initial start, seed swarm near cursor
      if (!p.initialized) {
        p.initialized = true;
        p.swarmX = clientX;
        p.swarmY = clientY - 8;
        fliesRef.current.forEach((fly) => {
          fly.x = clientX + (Math.random() - 0.5) * 12;
          fly.y = clientY - 8 + (Math.random() - 0.5) * 8;
        });
        window.__cursorFlies = fliesRef.current;
      }

      if (cursorRootRef.current) {
        cursorRootRef.current.style.opacity = '1';
        cursorRootRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Interactive hover detection
      const target = e.target;
      const interactiveEl = target && target.closest
        ? target.closest('button, a, input, textarea, select, .parchment-portal-card, .clean-primary-btn, .clean-secondary-btn, .scene-back-btn, [role="button"], [role="menuitem"], .question-dot, .map-index-btn, .header-tool-btn, .cmd-item-row, .dossier-letter-card, .chronicle-card, .talent-tree-container, .relay-envelope-card')
        : null;
      setIsHovered(!!interactiveEl);
    };

    const handleMouseDown = (e) => {
      if (e.pointerType === 'touch' || window.innerWidth < 768) return;
      setIsClicking(true);

      // Momentarily scatter buzzing flies outwards on click
      fliesRef.current.forEach((fly) => {
        fly.dartVx = (Math.random() - 0.5) * 4;
        fly.dartVy = -1.5 - Math.random() * 2.5;
      });
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

  // Canvas animation loop for buzzing flies midges
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
      if (!p.initialized || p.x === -9999) {
        animId = requestAnimationFrame(tick);
        return;
      }

      p.smoothVx += (p.vx - p.smoothVx) * 0.22;
      p.smoothVy += (p.vy - p.smoothVy) * 0.22;
      p.speed = Math.hypot(p.smoothVx, p.smoothVy);
      p.vx *= 0.82;
      p.vy *= 0.82;

      // Organic swarm center tracking
      const targetApexX = p.x;
      const targetApexY = p.y - 8;

      p.swarmX += (targetApexX - p.swarmX) * 0.018;
      p.swarmY += (targetApexY - p.swarmY) * 0.018;

      // Only spawn more flies once he eats them all
      if (fliesRef.current.length === 0) {
        respawnTimerRef.current += 0.016;
        if (respawnTimerRef.current >= 2.5) {
          fliesRef.current = createFlies(p.x, p.y);
          window.__cursorFlies = fliesRef.current;
          respawnTimerRef.current = 0;
        }
      } else {
        respawnTimerRef.current = 0;
      }

      // Synchronize flies array for frog tracking
      window.__cursorFlies = fliesRef.current;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        fliesRef.current.forEach((fly) => {
          if (fly.eaten) return;

          fly.angle += fly.speed * fly.direction * (1 + p.speed * 0.04);
          fly.wingPhase += 0.48;

          const orbitX = p.swarmX + Math.cos(fly.angle) * fly.orbitRadiusX + Math.sin(fly.angle * 2) * 2.5;
          const orbitY = p.swarmY + fly.heightOffset + Math.sin(fly.angle) * fly.orbitRadiusY + Math.cos(fly.angle * 1.5) * 1.5;

          const ax = (orbitX - fly.x) * fly.lagFactor;
          const ay = (orbitY - fly.y) * fly.lagFactor;

          fly.dartTimer--;
          if (fly.dartTimer <= 0) {
            fly.dartTimer = 18 + Math.floor(Math.random() * 26);
            fly.dartVx = (Math.random() - 0.5) * 2.2;
            fly.dartVy = (Math.random() - 0.5) * 1.8;
            if (Math.random() < 0.2) fly.direction *= -1;
          } else {
            fly.dartVx *= 0.82;
            fly.dartVy *= 0.82;
          }

          fly.vx = (fly.vx + ax + fly.dartVx) * 0.86;
          fly.vy = (fly.vy + ay + fly.dartVy) * 0.86;
          fly.x += fly.vx;
          fly.y += fly.vy;

          const isWingsUp = Math.sin(fly.wingPhase) > 0;

          ctx.save();
          ctx.translate(fly.x, fly.y);

          // Fly ink body
          ctx.fillStyle = '#1a0f0a';
          ctx.beginPath();
          ctx.ellipse(0, 0, 1.1, 0.7, fly.angle, 0, Math.PI * 2);
          ctx.fill();

          // High-frequency buzzing translucent wings
          ctx.fillStyle = 'rgba(70, 50, 35, 0.45)';
          ctx.beginPath();
          if (isWingsUp) {
            ctx.ellipse(-0.3, -1.0, 1.0, 0.45, -Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(0.3, -1.0, 1.0, 0.45, Math.PI / 4, 0, Math.PI * 2);
          } else {
            ctx.ellipse(-0.6, -0.5, 1.1, 0.4, -Math.PI / 8, 0, Math.PI * 2);
            ctx.ellipse(0.6, -0.5, 1.1, 0.4, Math.PI / 8, 0, Math.PI * 2);
          }
          ctx.fill();

          ctx.restore();
        });
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
      {/* Living Buzzing Midges Flies Swarm Canvas */}
      <canvas
        ref={canvasRef}
        className="cartographer-ink-canvas quill-flies-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99998,
          overflow: 'hidden',
        }}
      />

      {/* Pure, Clean Cursor Pointer Arrow */}
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
            transform: `scale(${isClicking ? 0.92 : isHovered ? 1.08 : 1.0})`,
            transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isHovered
              ? 'drop-shadow(0 0 6px rgba(180, 83, 9, 0.75)) drop-shadow(0 2px 4px rgba(26, 15, 10, 0.4))'
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
            </defs>

            {/* ── 1. Calligraphy Ink Silhouette Shadow Outline ── */}
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

            {/* ── 4. Chiseled Center Ridge Line ── */}
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
          </svg>
        </div>
      </div>
    </>
  );
}
