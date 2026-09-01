import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function pseudoNoise(seed, t) {
  return Math.sin(seed * 12.9898 + t * 1.3) * 0.5 +
         Math.cos(seed * 7.233 + t * 0.97) * 0.5;
}

export default function CharacterSwirlText({ text }) {
  const lettersRef = useRef([]);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 768 ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );

    if (isMobile) return;

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

  // Group characters into Words while maintaining continuous global character indices
  const { wordsStructure, charsData } = useMemo(() => {
    const rawWords = text.split(' ');
    let globalIndex = 0;
    const allCharsData = [];

    const words = rawWords.map((word, wIdx) => {
      // Append space to all but last word
      const wordString = wIdx < rawWords.length - 1 ? word + ' ' : word;
      const charObjs = wordString.split('').map((char) => {
        const idx = globalIndex++;
        const off = getOffscreenPos(idx);
        const charData = {
          char,
          globalIndex: idx,
          launchTime: idx * 0.035 + Math.random() * 0.02,
          ...off,
          varyY: (Math.random() - 0.5) * 6,
          varyZ: (Math.random() - 0.5) * 12,
          varyRot: (Math.random() - 0.5) * 4,
          seed: Math.random() * 8000 + idx * 33,
          repelX: 0,
          repelY: 0,
          repelZ: 0,
          repelRotX: 0,
          repelRotY: 0,
          targetRepelZ: 0,
        };
        allCharsData.push(charData);
        return charData;
      });

      return {
        word,
        chars: charObjs,
      };
    });

    return { wordsStructure: words, charsData: allCharsData };
  }, [text]);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const FLOAT_IN_DURATION = 1.6; // Smooth float-in from back center

    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      charsData.forEach((data, i) => {
        const el = lettersRef.current[i];
        if (!el) return;

        const timeSinceLaunch = elapsed - data.launchTime;
        if (timeSinceLaunch <= 0) {
          el.style.opacity = 0;
          return;
        }

        // 3D Mouse Repulsion Physics
        const rect = el.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const dx = charX - mouseRef.current.x;
        const dy = charY - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 140;

        if (dist < maxDist && dist > 1) {
          const factor = Math.pow((maxDist - dist) / maxDist, 1.5);
          const pushXY = factor * 45;
          const targetRX = (dx / dist) * pushXY;
          const targetRY = (dy / dist) * pushXY;
          data.targetRepelZ = factor * 130;
          const targetRotX = -(dy / dist) * factor * 18;
          const targetRotY = (dx / dist) * factor * 18;

          data.repelX += (targetRX - data.repelX) * 0.035;
          data.repelY += (targetRY - data.repelY) * 0.035;
          data.repelZ += (data.targetRepelZ - data.repelZ) * 0.035;
          data.repelRotX += (targetRotX - data.repelRotX) * 0.035;
          data.repelRotY += (targetRotY - data.repelRotY) * 0.035;
        } else {
          const hasSignificantDist = Math.hypot(data.repelX, data.repelY) > 4;
          
          if (hasSignificantDist) {
            data.targetRepelZ = -120; // dive into background depth first
          } else {
            data.targetRepelZ = 0; // return home Z = 0
          }

          // Continuous smooth exponential decay
          data.repelZ += (data.targetRepelZ - data.repelZ) * 0.02;
          data.repelX += (0 - data.repelX) * 0.015;
          data.repelY += (0 - data.repelY) * 0.015;
          data.repelRotX += (0 - data.repelRotX) * 0.018;
          data.repelRotY += (0 - data.repelRotY) * 0.018;
        }

        let curX, curY, curZ, curRot;
        const opacity = Math.min(1, timeSinceLaunch / 0.4);

        if (timeSinceLaunch < FLOAT_IN_DURATION) {
          const progress = timeSinceLaunch / FLOAT_IN_DURATION;
          const eased = easeOutQuint(progress);

          // Drift/float noise while traveling forward from back center
          const driftX = pseudoNoise(data.seed, elapsed * 0.35) * (1 - eased) * 25;
          const driftY = pseudoNoise(data.seed + 50, elapsed * 0.3) * (1 - eased) * 18;

          curX = data.offX * (1 - eased) + driftX;
          curY = data.offY * (1 - eased) + driftY;
          curZ = data.offZ * (1 - eased);
          curRot = data.offRot * (1 - eased);
        } else {
          const swayX = pseudoNoise(data.seed, elapsed * 0.2) * 0.8;
          const swayY = pseudoNoise(data.seed + 50, elapsed * 0.18) * 0.6;
          const swayZ = Math.sin(elapsed * 0.6 + i) * 1.2;
          const swayRot = Math.sin(elapsed * 0.4 + i) * 0.5;

          curX = swayX;
          curY = swayY;
          curZ = swayZ;
          curRot = swayRot;
        }

        curX += data.repelX;
        curY += data.repelY;
        const totalZ = curZ + data.repelZ;

        const zScale = 1 + Math.max(0, data.repelZ / 130) * 0.5;

        let blur = 0;
        if (totalZ < -15) {
          blur = Math.min(10, Math.abs(totalZ + 15) * 0.012);
        }

        el.style.transform = `translate3d(${curX}px, ${curY}px, ${totalZ}px) rotateX(${data.repelRotX}deg) rotateY(${data.repelRotY}deg) rotateZ(${curRot}deg) scale(${zScale})`;
        el.style.opacity = opacity;
        el.style.filter = blur > 0.1 ? `blur(${blur}px)` : 'none';
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [charsData]);

  return (
    <motion.div
      className="swirl-text-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {wordsStructure.map((wObj, wIdx) => (
        <span key={wIdx} className="smoke-word-wrapper">
          {wObj.chars.map((cObj) => (
            <span
              key={cObj.globalIndex}
              ref={(el) => { lettersRef.current[cObj.globalIndex] = el; }}
              className={`intro-letter ${cObj.char === ' ' ? 'space' : ''}`}
              style={{ opacity: 0 }}
            >
              {cObj.char === ' ' ? '\u00A0' : cObj.char}
            </span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
