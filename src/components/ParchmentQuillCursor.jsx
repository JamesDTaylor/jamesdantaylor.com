import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLY_COUNT = 4;

function createFlies() {
  return Array.from({ length: FLY_COUNT }, (_, i) => ({
    x: 0,
    y: 0,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    angle: (i * (Math.PI * 2)) / FLY_COUNT,
    orbitRadiusX: 8 + Math.random() * 6,
    orbitRadiusY: 4.5 + Math.random() * 4.5,
    speed: 0.038 + Math.random() * 0.025,
    direction: Math.random() > 0.5 ? 1 : -1,
    heightOffset: -7 - Math.random() * 7,
    lagFactor: 0.018 + Math.random() * 0.014, // Individual inertia / much longer reaction delay
    dartTimer: Math.floor(Math.random() * 30),
    dartVx: 0,
    dartVy: 0,
    wingPhase: Math.random() * 10,
  }));
}

function checkIsMobileOrTouch() {
  if (typeof window === 'undefined') return true;
  return (
    window.innerWidth < 768 ||
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
}

export default function ParchmentQuillCursor() {
  const [isMobile, setIsMobile] = useState(() => checkIsMobileOrTouch());
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [inkBlots, setInkBlots] = useState([]);

  const cursorRootRef = useRef(null);
  const branchContainerRef = useRef(null);
  const leafRef = useRef(null);
  const fliesCanvasRef = useRef(null);

  const fliesRef = useRef(createFlies());

  const physicsRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    lastX: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    lastY: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    swarmX: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    swarmY: typeof window !== 'undefined' ? window.innerHeight / 2 - 10 : 290,
    lastTime: performance.now(),
    vx: 0,
    vy: 0,
    smoothVx: 0,
    smoothVy: 0,
    speed: 0,
    branchTilt: 0,
    branchTiltVel: 0,
    leafTilt: 0,
    leafTiltVel: 0,
    wavePhase: 0,
    initialized: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobileOrTouch());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const p = physicsRef.current;

    const handlePointerMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);
      const dx = clientX - p.lastX;
      const dy = clientY - p.lastY;

      p.vx = (dx / dt) * 16.67;
      p.vy = (dy / dt) * 16.67;
      p.x = clientX;
      p.y = clientY;
      p.lastX = clientX;
      p.lastY = clientY;
      p.lastTime = now;

      // On initial start, seed swarm near cursor
      if (!p.initialized) {
        p.initialized = true;
        p.swarmX = clientX;
        p.swarmY = clientY - 10;
        fliesRef.current.forEach((fly) => {
          fly.x = clientX + (Math.random() - 0.5) * 12;
          fly.y = clientY - 10 + (Math.random() - 0.5) * 8;
        });
      }

      if (cursorRootRef.current) {
        cursorRootRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Check card / interactive hover state
      const target = e.target;
      const cardEl = target && target.closest
        ? target.closest(
            '.parchment-portal-card, .spatial-card-root, .work-spatial-card, .bg-card, .narrative-card, .relay-card, .contact-info-card'
          )
        : null;
      setIsCardHovered(!!cardEl);

      const interactiveEl = target && target.closest
        ? target.closest(
            'button, a, input, textarea, select, .parchment-portal-card, .clean-primary-btn, .clean-secondary-btn, .scene-back-btn, [role="button"], [role="menuitem"], .question-dot, .work-filter-chip'
          )
        : null;
      setIsInteractive(!!interactiveEl);
    };

    const handleMouseDown = (e) => {
      setIsClicking(true);
      const newBlot = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setInkBlots((prev) => [...prev.slice(-2), newBlot]);

      // Scatters flies outward momentarily on click
      fliesRef.current.forEach((fly) => {
        fly.dartVx = (Math.random() - 0.5) * 4;
        fly.dartVy = -1.5 - Math.random() * 2.5;
      });
    };

    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Main 120fps Kinetic Cursor & Delayed Swirling Flies Loop
  useEffect(() => {
    let animId;
    const canvas = fliesCanvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const tick = () => {
      const p = physicsRef.current;

      // Cursor movement velocity decay
      p.smoothVx += (p.vx - p.smoothVx) * 0.16;
      p.smoothVy += (p.vy - p.smoothVy) * 0.16;
      p.vx *= 0.85;
      p.vy *= 0.85;

      const speed = Math.hypot(p.smoothVx, p.smoothVy);
      p.speed = speed;
      p.wavePhase += 0.08 + Math.min(0.35, speed * 0.025);

      // Kinetic tilt
      const baseTilt = Math.max(-24, Math.min(24, p.smoothVx * 0.5));
      const waveRipple = Math.sin(p.wavePhase) * Math.min(5.5, speed * 0.25);
      const targetBranchTilt = baseTilt + waveRipple;

      p.branchTiltVel += (targetBranchTilt - p.branchTilt) * 0.12;
      p.branchTiltVel *= 0.76;
      p.branchTilt += p.branchTiltVel;

      const targetLeafTilt = -p.branchTilt * 0.7 + Math.sin(p.wavePhase * 1.5) * (Math.min(10, speed * 0.3) + 0.4);
      p.leafTiltVel += (targetLeafTilt - p.leafTilt) * 0.14;
      p.leafTiltVel *= 0.74;
      p.leafTilt += p.leafTiltVel;

      // Update cursor position & scale
      if (cursorRootRef.current) {
        cursorRootRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }

      if (branchContainerRef.current) {
        branchContainerRef.current.style.transform = `rotate(${p.branchTilt.toFixed(2)}deg) scale(${
          isClicking ? 0.94 : isCardHovered ? 1.12 : isInteractive ? 1.06 : 1
        })`;
      }

      if (leafRef.current) {
        leafRef.current.style.transform = `rotate(${p.leafTilt.toFixed(2)}deg)`;
      }

      // ==========================================
      // SIMULATED BUZZING FLIES WITH DELAYED PURSUIT
      // ==========================================
      // Swarm attractor position trails behind cursor with organic, much longer delay
      const targetApexX = p.x;
      const targetApexY = p.y - 10;

      p.swarmX += (targetApexX - p.swarmX) * 0.016; // Organic, long chase delay factor
      p.swarmY += (targetApexY - p.swarmY) * 0.016;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        fliesRef.current.forEach((fly) => {
          // Orbit angle progression with speed modulation
          fly.angle += fly.speed * fly.direction * (1 + speed * 0.04);
          fly.wingPhase += 0.48;

          // Ideal 3D-swirl orbital position around the DELAYED swarm center
          const orbitX = p.swarmX + Math.cos(fly.angle) * fly.orbitRadiusX + Math.sin(fly.angle * 2) * 2.5;
          const orbitY = p.swarmY + fly.heightOffset + Math.sin(fly.angle) * fly.orbitRadiusY + Math.cos(fly.angle * 1.5) * 1.5;

          // Spring acceleration towards delayed swirling orbit
          const ax = (orbitX - fly.x) * fly.lagFactor;
          const ay = (orbitY - fly.y) * fly.lagFactor;

          // Saccadic flight jitter / sudden fly darting
          fly.dartTimer--;
          if (fly.dartTimer <= 0) {
            fly.dartTimer = 18 + Math.floor(Math.random() * 26);
            fly.dartVx = (Math.random() - 0.5) * 2.2;
            fly.dartVy = (Math.random() - 0.5) * 1.8;
            if (Math.random() < 0.2) fly.direction *= -1; // change swirl direction
          } else {
            fly.dartVx *= 0.82;
            fly.dartVy *= 0.82;
          }

          // Velocity integration with air damping
          fly.vx = (fly.vx + ax + fly.dartVx) * 0.86;
          fly.vy = (fly.vy + ay + fly.dartVy) * 0.86;

          fly.x += fly.vx;
          fly.y += fly.vy;

          // Draw the Fly / Midge
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
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isCardHovered, isInteractive, isClicking]);

  return (
    <>
      {/* Simulated Buzzing Flies Canvas */}
      <canvas
        ref={fliesCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99992,
        }}
      />

      {/* Click Ink Blot Bleeds */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99991 }}>
        <AnimatePresence>
          {inkBlots.map((blot) => (
            <motion.div
              key={blot.id}
              initial={{ scale: 0.2, opacity: 0.9, x: blot.x - 12, y: blot.y - 12 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              onAnimationComplete={() => {
                setInkBlots((prev) => prev.filter((b) => b.id !== blot.id));
              }}
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(43, 27, 18, 0.6) 0%, rgba(90, 56, 37, 0.2) 50%, transparent 75%)',
                filter: 'blur(1px)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Smaller, Refined Hand-Inked Botanical Branch Cursor */}
      <div
        ref={cursorRootRef}
        className="active-branch-cursor-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
        }}
      >
        {/* Compact Branch rotating around contact tip (1.5, 1.5) */}
        <div
          ref={branchContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: '1.5px 1.5px',
            transform: 'rotate(0deg)',
            willChange: 'transform',
            transition: 'transform 0.03s ease-out',
          }}
        >
          <svg
            width="24"
            height="26"
            viewBox="0 0 24 26"
            fill="none"
            style={{
              overflow: 'visible',
              filter: isCardHovered
                ? 'drop-shadow(0 2px 4px rgba(180, 83, 9, 0.25)) drop-shadow(1px 1px 2px rgba(43, 27, 18, 0.25))'
                : isInteractive
                ? 'drop-shadow(0 2px 4px rgba(90, 56, 37, 0.25)) drop-shadow(1px 1px 2px rgba(43, 27, 18, 0.2))'
                : 'drop-shadow(1px 1px 2px rgba(43, 27, 18, 0.25))',
            }}
          >
            <defs>
              <linearGradient id="smallLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isCardHovered ? "#5f854b" : isInteractive ? "#507542" : "#436137"} />
                <stop offset="100%" stopColor={isCardHovered ? "#466935" : isInteractive ? "#3a562d" : "#2f4625"} />
              </linearGradient>
            </defs>

            {/* Main Slim Walnut Branch: Contact tip at (1.5, 1.5) */}
            <path
              d="M 1.5 1.5 Q 5 6, 8.5 11 Q 12 16, 17 21"
              stroke="#2b1b12"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Inner Wood Grain Line */}
            <path
              d="M 2.8 3.0 Q 5.8 7.2, 9.0 12 Q 12.2 16.5, 15.5 19.8"
              stroke={isCardHovered ? "#784b2c" : "#52331f"}
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Natural Bark Knot */}
            <circle cx="7.2" cy="9.5" r="0.7" fill="#1a0f0a" />

            {/* Side Twig Sprouting Close to Stem */}
            <path
              d="M 8.2 10.8 Q 9.8 9.6, 11.2 8.6"
              stroke="#2b1b12"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Single Compact Botanical Leaf Snug to the Stick with Kinetic Wave Undulation */}
            <g
              ref={leafRef}
              style={{
                transformOrigin: '11px 8.5px',
                transform: 'rotate(0deg)',
                willChange: 'transform',
              }}
            >
              {/* Leaf Blade - Nestled tightly along the twig */}
              <path
                d="M 10.5 8.8 C 11.2 6.0, 13.8 4.2, 17.5 4.0 C 16.8 7.4, 14.2 10.2, 10.5 8.8 Z"
                fill="url(#smallLeafGrad)"
                stroke="#1a0f0a"
                strokeWidth="0.65"
                strokeLinejoin="round"
              />
              {/* Leaf Center Vein */}
              <path
                d="M 11.0 8.5 C 13.0 7.0, 15.0 5.4, 17.0 4.3"
                stroke={isCardHovered ? "#a3c988" : "#8ab372"}
                strokeWidth="0.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Calligraphic Pointer Contact Tip: Minimal ink droplet bud */}
            <circle
              cx="1.5"
              cy="1.5"
              r={isCardHovered ? 1.8 : isInteractive ? 1.5 : 1.2}
              fill={isCardHovered ? "#b45309" : isInteractive ? "#8b1e1e" : "#1a0f0a"}
              stroke={isCardHovered ? "#fde68a" : isInteractive ? "#fca5a5" : "#5a3825"}
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
