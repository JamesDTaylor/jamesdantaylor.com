import React, { useMemo, useEffect, useRef } from 'react';

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function pseudoNoise(seed, t) {
  return Math.sin(seed * 12.9898 + t * 1.3) * 0.5 +
         Math.cos(seed * 7.233 + t * 0.97) * 0.5;
}

export default function IntroScene({ onIntroComplete }) {
  const lettersRef = useRef([]);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getOffscreenPos = () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 35;
    return {
      offX: Math.cos(angle) * dist,
      offY: Math.sin(angle) * dist,
      offZ: -750 - Math.random() * 350,
      offRot: (Math.random() - 0.5) * 30,
    };
  };

  const hiChars = useMemo(() => {
    const text = "Hi!";

    return text.split('').map((char, i) => {
      const off = getOffscreenPos();
      return {
        char,
        launchTime: i * 0.08,
        ...off,
        seed: Math.random() * 6000 + i * 45,
        repelX: 0,
        repelY: 0,
        repelZ: 0,
        repelRotX: 0,
        repelRotY: 0,
        targetRepelZ: 0,
      };
    });
  }, []);

  useEffect(() => {
    startTimeRef.current = performance.now();
    let completeTriggered = false;

    // Timeline:
    // 0.0s - 1.2s: "Hi!" floats in from 3D space
    // 1.2s - 3.2s: 2.0 second pause with gentle organic sway & mouse repulsion
    // 3.2s - 4.0s: Smooth dissolve & blur out -> transitions to Mindmap
    const FLOAT_IN_DURATION = 1.2;
    const PAUSE_DURATION = 2.0;
    const DISSOLVE_START = FLOAT_IN_DURATION + PAUSE_DURATION; // 3.2s
    const TOTAL_INTRO_TIME = DISSOLVE_START + 0.8; // 4.0s

    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      let overallOpacity = 1;
      let overallBlur = 0;
      if (elapsed > DISSOLVE_START) {
        const dissolveT = Math.min(1, (elapsed - DISSOLVE_START) / (TOTAL_INTRO_TIME - DISSOLVE_START));
        const dissolveEased = easeInOutQuart(dissolveT);
        overallOpacity = 1 - dissolveEased;
        overallBlur = dissolveEased * 16;
      }

      // Continuous Zero-Jerk Mouse Repulsion Physics
      const applyMouseRepulsion = (el, data) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const dx = charX - mouseRef.current.x;
        const dy = charY - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 160;

        if (dist < maxDist && dist > 1) {
          const factor = Math.pow((maxDist - dist) / maxDist, 1.5);
          const pushXY = factor * 45;
          const targetRX = (dx / dist) * pushXY;
          const targetRY = (dy / dist) * pushXY;
          data.targetRepelZ = factor * 140;
          const targetRotX = -(dy / dist) * factor * 18;
          const targetRotY = (dx / dist) * factor * 18;

          data.repelX += (targetRX - data.repelX) * 0.04;
          data.repelY += (targetRY - data.repelY) * 0.04;
          data.repelZ += (data.targetRepelZ - data.repelZ) * 0.04;
          data.repelRotX += (targetRotX - data.repelRotX) * 0.04;
          data.repelRotY += (targetRotY - data.repelRotY) * 0.04;
        } else {
          const hasSignificantDist = Math.hypot(data.repelX, data.repelY) > 4;
          
          if (hasSignificantDist) {
            data.targetRepelZ = -120;
          } else {
            data.targetRepelZ = 0;
          }

          data.repelZ += (data.targetRepelZ - data.repelZ) * 0.02;
          data.repelX += (0 - data.repelX) * 0.02;
          data.repelY += (0 - data.repelY) * 0.02;
          data.repelRotX += (0 - data.repelRotX) * 0.02;
          data.repelRotY += (0 - data.repelRotY) * 0.02;
        }
      };

      hiChars.forEach((data, i) => {
        const el = lettersRef.current[i];
        if (!el) return;

        const timeSinceLaunch = elapsed - data.launchTime;
        if (timeSinceLaunch <= 0) {
          el.style.opacity = 0;
          return;
        }

        applyMouseRepulsion(el, data);

        let curX, curY, curZ, curRot;
        const opacity = Math.min(1, timeSinceLaunch / 0.3) * overallOpacity;

        if (timeSinceLaunch < FLOAT_IN_DURATION) {
          const progress = timeSinceLaunch / FLOAT_IN_DURATION;
          const eased = easeOutQuint(progress);
          const driftX = pseudoNoise(data.seed, elapsed * 0.35) * (1 - eased) * 25;
          const driftY = pseudoNoise(data.seed + 50, elapsed * 0.3) * (1 - eased) * 18;

          curX = data.offX * (1 - eased) + driftX;
          curY = data.offY * (1 - eased) + driftY;
          curZ = data.offZ * (1 - eased);
          curRot = data.offRot * (1 - eased);
        } else {
          const swayX = pseudoNoise(data.seed, elapsed * 0.2) * 1.2;
          const swayY = pseudoNoise(data.seed + 50, elapsed * 0.18) * 0.8;
          const swayZ = Math.sin(elapsed * 0.6 + i) * 1.8;
          const swayRot = Math.sin(elapsed * 0.4 + i) * 0.8;

          curX = swayX;
          curY = swayY;
          curZ = swayZ;
          curRot = swayRot;
        }

        curX += data.repelX;
        curY += data.repelY;
        const totalZ = curZ + data.repelZ;

        const zScale = 1 + Math.max(0, data.repelZ / 140) * 0.5;

        let blur = 0;
        if (totalZ < -15) {
          blur = Math.min(10, Math.abs(totalZ + 15) * 0.012);
        }
        const totalBlur = blur + overallBlur;

        el.style.transform = `translate3d(${curX}px, ${curY}px, ${totalZ}px) rotateX(${data.repelRotX}deg) rotateY(${data.repelRotY}deg) rotateZ(${curRot}deg) scale(${zScale})`;
        el.style.opacity = opacity;
        el.style.filter = totalBlur > 0.1 ? `blur(${totalBlur}px)` : 'none';
      });

      if (elapsed >= TOTAL_INTRO_TIME && !completeTriggered && onIntroComplete) {
        completeTriggered = true;
        onIntroComplete();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hiChars, onIntroComplete]);

  return (
    <div className="intro-scene-container">
      <div className="intro-line">
        {hiChars.map((data, i) => (
          <span
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            className={`intro-letter ${data.char === ' ' ? 'space' : ''}`}
            style={{ opacity: 0 }}
          >
            {data.char === ' ' ? '\u00A0' : data.char}
          </span>
        ))}
      </div>

      <button
        className="skip-intro-btn"
        onClick={onIntroComplete}
        aria-label="Skip Introduction"
      >
        SKIP
      </button>
    </div>
  );
}
