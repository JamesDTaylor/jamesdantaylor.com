import React, { useEffect, useRef, useMemo } from 'react';

/**
 * High-performance Interactive Kinetic Glyph Component
 * Gives text elements physics-based cursor repulsion, 3D tilt, and zero-jerk spring return.
 */
export default function KineticGlyphText({
  text,
  className = '',
  maxDistance = 110,
  repelForce = 28,
  zElevation = 60,
  as = 'span',
}) {
  const containerRef = useRef(null);
  const glyphsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const charsPhysicsRef = useRef([]);

  // Break text into words and chars
  const wordsStructure = useMemo(() => {
    const rawWords = text.split(' ');
    let globalIdx = 0;
    const initialPhysics = [];

    const struct = rawWords.map((word, wIdx) => {
      const isLast = wIdx === rawWords.length - 1;
      const chars = (isLast ? word : word + ' ').split('').map((char) => {
        const id = globalIdx++;
        initialPhysics.push({
          x: 0,
          y: 0,
          z: 0,
          rotX: 0,
          rotY: 0,
          targetX: 0,
          targetY: 0,
          targetZ: 0,
        });
        return { char, id };
      });
      return { word, chars };
    });

    charsPhysicsRef.current = initialPhysics;
    return struct;
  }, [text]);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 768 ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );

    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 768 ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );

    if (isMobile) return;

    let animId;

    const animate = () => {
      const mouse = mouseRef.current;

      glyphsRef.current.forEach((el, i) => {
        if (!el) return;
        const phys = charsPhysicsRef.current[i];
        if (!phys) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = centerX - mouse.x;
        const dy = centerY - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance && dist > 1) {
          const factor = Math.pow((maxDistance - dist) / maxDistance, 1.4);
          const push = factor * repelForce;
          phys.targetX = (dx / dist) * push;
          phys.targetY = (dy / dist) * push;
          phys.targetZ = factor * zElevation;
          phys.rotX = -(dy / dist) * factor * 16;
          phys.rotY = (dx / dist) * factor * 16;

          phys.x += (phys.targetX - phys.x) * 0.12;
          phys.y += (phys.targetY - phys.y) * 0.12;
          phys.z += (phys.targetZ - phys.z) * 0.12;
        } else {
          // Smooth return to rest
          phys.x += (0 - phys.x) * 0.08;
          phys.y += (0 - phys.y) * 0.08;
          phys.z += (0 - phys.z) * 0.08;
          phys.rotX += (0 - phys.rotX) * 0.08;
          phys.rotY += (0 - phys.rotY) * 0.08;
        }

        const isMoving = Math.abs(phys.x) > 0.1 || Math.abs(phys.y) > 0.1 || Math.abs(phys.z) > 0.1;
        if (isMoving) {
          el.style.transform = `translate3d(${phys.x.toFixed(2)}px, ${phys.y.toFixed(2)}px, ${phys.z.toFixed(2)}px) rotateX(${phys.rotX.toFixed(2)}deg) rotateY(${phys.rotY.toFixed(2)}deg)`;
          el.style.color = phys.z > 8 ? '#fef3c7' : '';
          el.style.textShadow = phys.z > 8 ? '0 0 16px rgba(245, 158, 11, 0.7), 0 0 32px rgba(180, 83, 9, 0.35)' : '';
        } else {
          el.style.transform = '';
          el.style.color = '';
          el.style.textShadow = '';
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [maxDistance, repelForce, zElevation]);

  const Tag = as;

  return (
    <Tag ref={containerRef} className={`kinetic-glyph-wrapper ${className}`} style={{ display: 'inline-flex', flexWrap: 'wrap', transformStyle: 'preserve-3d' }}>
      {wordsStructure.map((w, wIdx) => (
        <span key={wIdx} className="kinetic-word" style={{ display: 'inline-flex', whiteSpace: 'nowrap', transformStyle: 'preserve-3d' }}>
          {w.chars.map((c) => (
            <span
              key={c.id}
              ref={(el) => { glyphsRef.current[c.id] = el; }}
              className="kinetic-glyph-char"
              style={{
                display: 'inline-block',
                willChange: 'transform',
                transformStyle: 'preserve-3d',
                pointerEvents: 'none',
              }}
            >
              {c.char === ' ' ? '\u00A0' : c.char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
