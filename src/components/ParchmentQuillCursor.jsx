import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParchmentQuillCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [inkBlots, setInkBlots] = useState([]);
  const footprintsCanvasRef = useRef(null);
  const footprintsRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100, lastStepDist: 0, lastX: -100, lastY: -100, stepSide: 1 });

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      const dist = Math.hypot(dx, dy);

      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Spawn subtle walking footsteps behind cursor
      mouseRef.current.lastStepDist += dist;
      if (mouseRef.current.lastStepDist > 32 && dist > 1) {
        mouseRef.current.lastStepDist = 0;
        const angle = Math.atan2(dy, dx);
        const sideOffset = (mouseRef.current.stepSide * 6);
        mouseRef.current.stepSide *= -1;

        const footX = e.clientX - Math.sin(angle) * sideOffset;
        const footY = e.clientY + Math.cos(angle) * sideOffset;

        footprintsRef.current.push({
          x: footX,
          y: footY,
          angle: angle + Math.PI / 2,
          life: 1.0,
          isRight: mouseRef.current.stepSide > 0,
        });

        if (footprintsRef.current.length > 40) {
          footprintsRef.current.shift();
        }
      }

      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;

      const target = e.target;
      const interactiveEl = target.closest(
        'button, a, input, textarea, select, .parchment-portal-card, .parchment-card, .parchment-subcard, [role="button"], [role="menuitem"], .cmd-item-row, .question-dot'
      );
      setIsHovered(!!interactiveEl);
    };

    const handleMouseDown = (e) => {
      setIsClicking(true);
      const newBlot = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setInkBlots((prev) => [...prev.slice(-3), newBlot]);
    };

    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Footprints / Ink Splatters Canvas Loop
  useEffect(() => {
    let animId;
    const canvas = footprintsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      footprintsRef.current = footprintsRef.current.filter((f) => f.life > 0.02);
      footprintsRef.current.forEach((f) => {
        f.life -= 0.018;
        const alpha = Math.max(0, f.life);

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);

        // Shoe outline on parchment (sole + heel)
        ctx.fillStyle = `rgba(54, 34, 20, ${alpha * 0.55})`;
        ctx.strokeStyle = `rgba(74, 44, 29, ${alpha * 0.75})`;
        ctx.lineWidth = 0.8;

        // Front Sole
        ctx.beginPath();
        ctx.ellipse(0, -4, 3, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rear Heel
        ctx.beginPath();
        ctx.ellipse(0, 4.5, 2.4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Footprints trail canvas */}
      <canvas
        ref={footprintsCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />

      {/* Click Ink Blot Bleeds */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
        <AnimatePresence>
          {inkBlots.map((blot) => (
            <motion.div
              key={blot.id}
              initial={{ scale: 0.2, opacity: 0.9, x: blot.x - 16, y: blot.y - 16 }}
              animate={{ scale: 2.0, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              onAnimationComplete={() => {
                setInkBlots((prev) => prev.filter((b) => b.id !== blot.id));
              }}
              style={{
                position: 'absolute',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(54, 34, 20, 0.85) 0%, rgba(139, 30, 30, 0.4) 50%, transparent 75%)',
                filter: 'blur(1px)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main Antique Calligraphy Quill Cursor */}
      <div
        className="parchment-cursor-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Calligraphy Quill / Nib SVG */}
        <motion.div
          animate={{
            scale: isClicking ? 0.88 : isHovered ? 1.25 : 1,
            rotate: isHovered ? -15 : -35,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            {/* Antique Feather Shaft / Handle */}
            <path
              d="M26 2C26 2 21 8 16 13L13 16L15 18L18 15C23 10 26 2 26 2Z"
              fill="#5a3825"
              stroke="#2c1810"
              strokeWidth="0.8"
            />
            {/* Brass Ferrule */}
            <path
              d="M13 16L15 18L12 21L10 19L13 16Z"
              fill="#b45309"
              stroke="#78350f"
              strokeWidth="0.8"
            />
            {/* Steel Calligraphy Nib */}
            <path
              d="M10 19L12 21L4 27C3 27 2 26 2 25L10 19Z"
              fill="#2c1810"
              stroke="#1a0f0a"
              strokeWidth="0.8"
            />
            {/* Ink Nib Slit */}
            <line x1="11" y1="20" x2="3.5" y2="26" stroke="#f4ecd8" strokeWidth="0.7" />
            {/* Wet Ink Tip Highlight */}
            <circle cx="3.5" cy="26" r="1.4" fill={isHovered ? "#8b1e1e" : "#2c1810"} />
          </svg>
        </motion.div>

        {/* Wax Seal Ring on Hover */}
        {isHovered && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.6 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: -12,
              left: -12,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '1.5px dashed #8b1e1e',
              background: 'rgba(139, 30, 30, 0.08)',
            }}
          />
        )}
      </div>
    </>
  );
}
