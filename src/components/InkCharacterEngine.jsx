import React, { useEffect, useRef, useCallback } from 'react';
import { getParchmentGroundY } from '../utils/terrain';

/**
 *Character Engine & Wind-Swept Terrain
 * 
 * Features:
 * 1. Realistic Full-Body High Overhead Reaching (Clavicle shrug, torso upward extension, full arm reach)
 * 2. Full 360° Omnidirectional Cursor Tracking & Overhead Gazing (Gaze & head pitch up to -0.95 rad)
 * 3. Stable Anatomical Height (Fixed 1.05 uniform scale with zero jumping)
 * 4. Locomotion Heading Direction (Always faces forward when walking; anterior-only 3/4 front view)
 * 5. Unified Continuous Arm Kinematics (Silky smooth blend transitions across all states)
 * 6. 100% Grounded & Planted Foliage (Anchored directly on the terrain curve with soil base mounds)
 * 7. Directional Ambient Wind System (Gentle eastward breeze affecting grass, hair, spores, fireflies)
 * 8. Deterministic Seeded PRNG (100% constant across reloads)
 */

function createSeededRng(seed = 133742) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function InkCharacterEngine({ extraCreaturesCount = 0 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    lastX: -1000,
    lastY: -1000,
    speed: 0,
    activeTimer: 0,
  });
  const charactersRef = useRef([]);
  const grassTuftsRef = useRef([]);
  const cauldronSmokeRef = useRef([]);

  const getGroundSlope = (x, width, height) => {
    const step = 6;
    const y1 = getParchmentGroundY(x - step, width, height);
    const y2 = getParchmentGroundY(x + step, width, height);
    return Math.atan2(y2 - y1, step * 2);
  };

  const getAmbientWind = (t, x) => {
    const baseBreeze = 0.18;
    const wave1 = Math.sin(t * 0.0012 + x * 0.0025) * 0.08;
    const wave2 = Math.sin(t * 0.0027 - x * 0.0012) * 0.05;
    const gust = Math.pow(Math.max(0, Math.sin(t * 0.0006)), 3) * 0.15;
    return baseBreeze + wave1 + wave2 + gust;
  };

  const createBotanicalTuft = (u, tuftType, tuftScale, isMother, rng) => {
    const blades = [];
    const isBackground = rng() > 0.6;

    if (tuftType === 'tall_reed') {
      const stalkCount = isMother ? 2 : 1;
      for (let s = 0; s < stalkCount; s++) {
        blades.push({
          type: 'reed',
          height: (20 + rng() * 10) * tuftScale,
          lean: (rng() - 0.5) * 0.22,
          curve: (rng() - 0.5) * 0.16,
          podSize: (2.2 + rng() * 1.0) * tuftScale,
          width: 1.5 * tuftScale,
        });
      }
      for (let c = 0; c < 2; c++) {
        blades.push({
          type: 'blade',
          height: (6 + rng() * 7) * tuftScale,
          lean: (rng() - 0.5) * 0.35,
          curve: (rng() - 0.5) * 0.22,
          width: 1.0 * tuftScale,
        });
      }
    } else if (tuftType === 'wild_wheat') {
      const stalkCount = isMother ? 2 : 1;
      for (let s = 0; s < stalkCount; s++) {
        blades.push({
          type: 'wheat',
          height: (15 + rng() * 8) * tuftScale,
          lean: (rng() - 0.5) * 0.3,
          curve: (rng() - 0.5) * 0.22,
          husks: 3 + Math.floor(rng() * 2),
          width: 1.4 * tuftScale,
        });
      }
      for (let c = 0; c < 2; c++) {
        blades.push({
          type: 'blade',
          height: (5 + rng() * 6) * tuftScale,
          lean: (rng() - 0.5) * 0.3,
          curve: (rng() - 0.5) * 0.22,
          width: 1.0 * tuftScale,
        });
      }
    } else if (tuftType === 'fern_frond') {
      const frondCount = isMother ? 3 : 2;
      for (let f = 0; f < frondCount; f++) {
        blades.push({
          type: 'fern',
          height: (11 + rng() * 8) * tuftScale,
          lean: ((f % 2 === 0 ? -1 : 1) * (0.16 + rng() * 0.22)),
          curve: (rng() - 0.5) * 0.18,
          pinnaeCount: 3 + Math.floor(rng() * 3),
          width: 1.3 * tuftScale,
        });
      }
    } else if (tuftType === 'wild_dandelion') {
      blades.push({
        type: 'dandelion',
        height: (9 + rng() * 7) * tuftScale,
        lean: (rng() - 0.5) * 0.22,
        curve: (rng() - 0.5) * 0.18,
        puffRadius: (2.0 + rng() * 1.0) * tuftScale,
        width: 1.2 * tuftScale,
      });
      for (let c = 0; c < 2; c++) {
        blades.push({
          type: 'blade',
          height: (4 + rng() * 5) * tuftScale,
          lean: (rng() - 0.5) * 0.35,
          curve: (rng() - 0.5) * 0.22,
          width: 1.0 * tuftScale,
        });
      }
    } else if (tuftType === 'clover_patch') {
      const patchCount = 2 + Math.floor(rng() * 3);
      for (let p = 0; p < patchCount; p++) {
        blades.push({
          type: 'clover',
          height: (4 + rng() * 4) * tuftScale,
          lean: (rng() - 0.5) * 0.35,
          curve: (rng() - 0.5) * 0.22,
          leafRadius: (1.5 + rng() * 0.7) * tuftScale,
          width: 1.0 * tuftScale,
        });
      }
    } else {
      const bladeCount = 3 + Math.floor(rng() * 4);
      for (let b = 0; b < bladeCount; b++) {
        blades.push({
          type: 'blade',
          height: (6 + rng() * 10) * tuftScale,
          lean: (rng() - 0.5) * 0.4,
          curve: (rng() - 0.5) * 0.25,
          width: (0.8 + rng() * 0.5) * tuftScale,
        });
      }
    }

    return {
      u,
      tuftType,
      tuftScale,
      isBackground,
      blades,
      swayAngle: 0,
      swayVel: 0,
      phase: rng() * Math.PI * 2,
    };
  };

  const initWorldProps = useCallback((width, height) => {
    const rng = createSeededRng(881239);
    const grass = [];

    grassTuftsRef.current = [];

    // Witch's Cauldron / Campfire Smoke & Fire Wisps
    const cSmoke = [];
    for (let i = 0; i < 14; i++) {
      cSmoke.push({
        x: width * 0.64 + (rng() - 0.5) * 10,
        y: getParchmentGroundY(width * 0.64, width, height) - 14 - rng() * 50,
        vx: (rng() - 0.5) * 0.25,
        vy: -0.35 - rng() * 0.4,
        radius: 3 + rng() * 4,
        maxRadius: 18 + rng() * 8,
        alpha: 0.08 + rng() * 0.25,
      });
    }
    cauldronSmokeRef.current = cSmoke;
  }, []);

  const initCharacters = useCallback((count) => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    initWorldProps(width, height);

    const chars = [];

    const startX = width * 0.38;
    chars.push({
      id: 'limbo-hero',
      isHero: true,
      x: startX,
      y: getParchmentGroundY(startX, width, height),
      targetX: width * 0.52,
      vx: 0,
      vy: 0,
      facing: 1,
      facingBlend: 1.0,
      yawAngle: 0.22,
      targetYaw: 0.22,
      state: 'walk',
      paceMode: 'walk',
      walkCycle: 0,
      strideLength: 8.0,
      walkSpeed: 60,
      scale: 1.05,

      walkBlend: 1.0,
      stretchBlend: 0.0,
      waveBlend: 0.0,
      crouchBlend: 0.0,
      sitBlend: 0.0,

      stretchProgress: 0,
      behaviorTimer: 0,

      // Filtered Continuous Arm Joints
      armL: { elbowX: -3.5, elbowY: -8.5, handX: -3.5, handY: -3.5 },
      armR: { elbowX: 3.5, elbowY: -8.5, handX: 3.5, handY: -3.5 },

      // Physical impulse recovery
      pushOffsetX: 0,
      pushVelX: 0,
      pushOffsetY: 0,
      pushVelY: 0,
      bodyLean: 0,
      bodyLeanVel: 0,
      headLag: 0,
      headLagVel: 0,
      hipImpactSpring: 0,
      hipImpactVel: 0,

      // 360° Omnidirectional Arm Reach Vectors with Independent Per-Arm Lowering
      reachBlendL: 0,
      reachVelL: 0,
      reachBlendR: 0,
      reachVelR: 0,
      reachDirX: 1,
      reachDirY: 0,

      hairPhysics: [
        { angle: 0, vel: 0 },
        { angle: 0, vel: 0 },
        { angle: 0, vel: 0 },
        { angle: 0, vel: 0 },
      ],

      saccadeTimer: 2.0,
      saccadeX: 0,
      saccadeY: 0,
      eyeDilation: 1.0,

      breathTimer: 0,
      blinkTimer: 3.2,
      isBlinking: false,
      blinkProgress: 0,
      weightShiftTimer: 0,
      weightShiftSide: 0,
      weightShiftProgress: 0,
      idleTimer: 0,
      actionCooldown: 2.0,

      gazeX: 0,
      gazeY: 0,
      headPitch: 0,
      headTilt: 0,
      headTiltTarget: 0,
    });

    for (let i = 0; i < count; i++) {
      const spX = width * 0.2 + i * 110;
      chars.push({
        id: `companion-${i}`,
        isHero: false,
        x: spX,
        y: getParchmentGroundY(spX, width, height),
        targetX: spX + (Math.random() - 0.5) * 160,
        vx: 0,
        vy: 0,
        facing: Math.random() > 0.5 ? 1 : -1,
        facingBlend: 1.0,
        yawAngle: 0.22,
        targetYaw: 0.22,
        state: 'walk',
        paceMode: 'walk',
        walkCycle: Math.random() * Math.PI * 2,
        strideLength: 7.0,
        walkSpeed: 50 + Math.random() * 18,
        scale: 1.05,

        walkBlend: 1.0,
        stretchBlend: 0.0,
        waveBlend: 0.0,
        crouchBlend: 0.0,
        sitBlend: 0.0,

        stretchProgress: 0,
        behaviorTimer: 0,

        armL: { elbowX: -3.5, elbowY: -8.5, handX: -3.5, handY: -3.5 },
        armR: { elbowX: 3.5, elbowY: -8.5, handX: 3.5, handY: -3.5 },

        pushOffsetX: 0,
        pushVelX: 0,
        pushOffsetY: 0,
        pushVelY: 0,
        bodyLean: 0,
        bodyLeanVel: 0,
        headLag: 0,
        headLagVel: 0,
        hipImpactSpring: 0,
        hipImpactVel: 0,

        reachBlendL: 0,
        reachVelL: 0,
        reachBlendR: 0,
        reachVelR: 0,
        reachDirX: 1,
        reachDirY: 0,

        hairPhysics: [
          { angle: 0, vel: 0 },
          { angle: 0, vel: 0 },
          { angle: 0, vel: 0 },
          { angle: 0, vel: 0 },
        ],

        saccadeTimer: 1.5 + Math.random() * 2,
        saccadeX: 0,
        saccadeY: 0,
        eyeDilation: 1.0,

        breathTimer: Math.random() * Math.PI * 2,
        blinkTimer: 2.0 + Math.random() * 3,
        isBlinking: false,
        blinkProgress: 0,
        weightShiftTimer: Math.random() * 4,
        weightShiftSide: 0,
        weightShiftProgress: 0,
        idleTimer: Math.random() * 3,
        actionCooldown: Math.random() * 2,

        gazeX: 0,
        gazeY: 0,
        headPitch: 0,
        headTilt: 0,
        headTiltTarget: 0,
      });
    }

    charactersRef.current = chars;
  }, [initWorldProps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initCharacters(extraCreaturesCount);
    }
  }, [extraCreaturesCount, initCharacters]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      initWorldProps(w, h);
      if (charactersRef.current.length === 0) {
        initCharacters(extraCreaturesCount);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initWorldProps, extraCreaturesCount, initCharacters]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      const speed = Math.hypot(dx, dy);

      mouseRef.current.vx = dx;
      mouseRef.current.vy = dy;
      mouseRef.current.speed = speed;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.activeTimer = 0;
    };

    const handleMouseDown = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      charactersRef.current.forEach((char) => {
        const dx = clickX - char.x;
        const dy = clickY - (char.y - 25);
        const dist = Math.hypot(dx, dy);

        if (dist < 55) {
          const impulseX = (dx < 0 ? 1 : -1) * 18;
          char.pushVelX += impulseX;
          char.pushVelY -= 10;
          char.bodyLeanVel += (dx < 0 ? 0.1 : -0.1);
          char.eyeDilation = 1.25;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Function to render a single botanical tuft following the terrain curve
  const renderTuft = (ctx, tuft, now, dt, width, height, mouse) => {
    const tuftX = tuft.u * width;
    const slope = getGroundSlope(tuftX, width, height);
    const rootX = tuftX;
    const rootY = getParchmentGroundY(tuftX, width, height);

    const wind = getAmbientWind(now, tuftX);
    let rustleForce = wind * 0.75 + Math.sin(now * 0.002 + tuft.phase) * 0.05;

    charactersRef.current.forEach((char) => {
      const charDist = Math.abs((char.x + char.pushOffsetX) - tuftX);
      if (charDist < 26) {
        rustleForce += char.facing * (1 - charDist / 26) * 0.35;
      }
    });

    if (mouse.x > 0) {
      const mDist = Math.abs(mouse.x - tuftX);
      const mDistY = Math.abs(mouse.y - rootY);
      if (mDist < 45 && mDistY < 55) {
        rustleForce += (mouse.vx * 0.008) + Math.sign(mouse.x - tuftX) * 0.2;
      }
    }

    tuft.swayVel += (-25.0 * tuft.swayAngle + rustleForce * 15 - 5.0 * tuft.swayVel) * dt;
    tuft.swayAngle += tuft.swayVel * dt;

    const strokeColor = tuft.isBackground ? 'rgba(38, 22, 14, 0.75)' : '#1a0f0a';

    ctx.save();
    ctx.translate(rootX, rootY);
    ctx.rotate(slope);

    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.ellipse(0, 0.5, 3.2 * tuft.tuftScale, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    tuft.blades.forEach((b) => {
      const swayFactor = (b.height / 30);
      const totalLean = b.lean + tuft.swayAngle * swayFactor;
      const totalCurve = b.curve + tuft.swayAngle * swayFactor * 0.5;

      const tipX = totalLean * b.height;
      const tipY = -b.height;
      const midX = totalCurve * b.height * 0.5;
      const midY = -b.height * 0.55;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = b.width || 1.2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      if (b.type === 'reed') {
        const podLen = b.podSize * 2.8;
        const podAngle = Math.atan2(tipY - midY, tipX - midX);
        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(podAngle);
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, podLen * 0.5, b.podSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(podLen * 0.5, 0);
        ctx.lineTo(podLen * 0.5 + 3.5, 0);
        ctx.stroke();
        ctx.restore();
      } else if (b.type === 'wheat') {
        for (let k = 0; k < (b.husks || 3); k++) {
          const prog = 0.65 + (k / (b.husks || 3)) * 0.35;
          const hx = midX * (1 - prog) + tipX * prog;
          const hy = -b.height * prog;
          const side = k % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + side * 3.8, hy - 2.8);
          ctx.stroke();
        }
      } else if (b.type === 'fern') {
        for (let k = 1; k <= (b.pinnaeCount || 3); k++) {
          const prog = k / ((b.pinnaeCount || 3) + 1);
          const fx = tipX * prog;
          const fy = -b.height * prog;
          const leafLen = (1 - prog * 0.4) * 3.8;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx - leafLen, fy - 1.5);
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + leafLen, fy - 1.5);
          ctx.stroke();
        }
      } else if (b.type === 'dandelion') {
        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(0, 0, b.puffRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(43, 27, 18, 0.6)';
        ctx.lineWidth = 0.8;
        for (let s = 0; s < 6; s++) {
          const angle = (s / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * b.puffRadius, Math.sin(angle) * b.puffRadius);
          ctx.stroke();
        }
        ctx.restore();
      } else if (b.type === 'clover') {
        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.fillStyle = strokeColor;
        for (let c = 0; c < 3; c++) {
          const angle = (c / 3) * Math.PI * 2 - Math.PI * 0.5;
          const lx = Math.cos(angle) * b.leafRadius * 0.65;
          const ly = Math.sin(angle) * b.leafRadius * 0.65;
          ctx.beginPath();
          ctx.ellipse(lx, ly, b.leafRadius * 0.5, b.leafRadius * 0.4, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    ctx.restore();
  };

  // Main Animation Loop
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();

    const render = (now) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(Math.max(0.001, (now - lastTime) / 1000), 0.045);
      lastTime = now;

      const width = canvas.width || window.innerWidth;
      const height = canvas.height || window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      mouseRef.current.activeTimer += dt;
      const mouse = mouseRef.current;

      // ----------------------------------------------------
      // 0. SOLID INKED GROUND BASELINE (ALWAYS VISIBLE)
      // ----------------------------------------------------
      ctx.save();
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, getParchmentGroundY(0, width, height));
      const gStep = 6;
      for (let x = gStep; x <= width; x += gStep) {
        ctx.lineTo(x, getParchmentGroundY(x, width, height));
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();


      // ----------------------------------------------------
      // 2. RENDER WORLD PROPS: ANTIQUE STREET LAMP (MOVED TO SMALL TREE POSITION)
      // ----------------------------------------------------
      const lampX = width * 0.28;
      const lampGroundY = getParchmentGroundY(lampX, width, height);
      const lampSlope = getGroundSlope(lampX, width, height);
      const lampHeight = 85;
      const lampTopY = -lampHeight;

      const flicker = Math.sin(now * 0.008) * 3 + Math.sin(now * 0.021) * 1.5;
      ctx.save();
      ctx.translate(lampX, lampGroundY);
      ctx.rotate(lampSlope);

      const glowGrad = ctx.createRadialGradient(0, lampTopY + 14, 2, 0, lampTopY + 14, 60 + flicker);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      glowGrad.addColorStop(0.35, 'rgba(217, 119, 6, 0.12)');
      glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, lampTopY + 14, 60 + flicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, lampTopY + 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, lampTopY + 22);
      ctx.quadraticCurveTo(-10, lampTopY + 14, -6, lampTopY + 4);
      ctx.quadraticCurveTo(0, lampTopY - 2, 6, lampTopY + 4);
      ctx.quadraticCurveTo(10, lampTopY + 14, 0, lampTopY + 22);
      ctx.stroke();

      ctx.fillStyle = '#1a0f0a';
      ctx.fillRect(-4.5, lampTopY + 5, 9, 2);
      ctx.fillRect(-3.5, lampTopY + 17, 7, 2);

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0, lampTopY + 11 + Math.sin(now * 0.015) * 0.6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------
      // 3. RENDER WORLD PROPS: BENCH & MILESTONE (NO SHADOW)
      // ----------------------------------------------------
      const benchX = width * 0.22;
      const benchGroundY = getParchmentGroundY(benchX, width, height);
      const benchSlope = getGroundSlope(benchX, width, height);
      ctx.save();
      ctx.translate(benchX, benchGroundY);
      ctx.rotate(benchSlope);

      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-11, -10);
      ctx.moveTo(12, 0);
      ctx.lineTo(11, -10);
      ctx.moveTo(-15, -10);
      ctx.lineTo(15, -10);
      ctx.moveTo(-11, -10);
      ctx.lineTo(-11, -18);
      ctx.moveTo(11, -10);
      ctx.lineTo(11, -18);
      ctx.moveTo(-14, -17);
      ctx.lineTo(14, -17);
      ctx.stroke();
      ctx.restore();

      const stoneX = width * 0.52;
      const stoneGroundY = getParchmentGroundY(stoneX, width, height);
      const stoneSlope = getGroundSlope(stoneX, width, height);
      ctx.save();
      ctx.translate(stoneX, stoneGroundY);
      ctx.rotate(stoneSlope);

      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.quadraticCurveTo(-8, -14, 0, -16);
      ctx.quadraticCurveTo(8, -14, 7, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, -5);
      ctx.moveTo(-2.5, -9);
      ctx.lineTo(2.5, -9);
      ctx.stroke();
      ctx.restore();

      // ====================================================
      // "INTO THE WOODS" ENVIRONMENT DECORATIONS
      // ====================================================

      // A. SHADOWY WOLF SILHOUETTE IN BACKGROUND FOLIAGE
      const wolfX = width * 0.83;
      const wolfGroundY = getParchmentGroundY(wolfX, width, height);
      const wolfSlope = getGroundSlope(wolfX, width, height);
      ctx.save();
      ctx.translate(wolfX, wolfGroundY);
      ctx.rotate(wolfSlope);
      ctx.fillStyle = '#140b07';
      ctx.beginPath();
      ctx.ellipse(0, -10, 16, 9, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Wolf Head & Ears
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(-22, -20); // Snout
      ctx.lineTo(-14, -26);
      ctx.lineTo(-12, -32); // Ear 1
      ctx.lineTo(-8, -24);
      ctx.lineTo(-6, -31); // Ear 2
      ctx.lineTo(-4, -20);
      ctx.closePath();
      ctx.fill();
      // Wolf Tail
      ctx.beginPath();
      ctx.strokeStyle = '#140b07';
      ctx.lineWidth = 3.5;
      ctx.moveTo(14, -12);
      ctx.quadraticCurveTo(24, -6, 22, 2);
      ctx.stroke();
      // Glowing Wolf Eyes
      const wolfBlink = Math.sin(now * 0.003 + 2.5) > 0.96;
      if (!wolfBlink) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-16, -22, 1.4, 0, Math.PI * 2);
        ctx.arc(-13, -22, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();







      // E. BAKER'S CART WHEEL & HOLLOW TREE STUMP
      const cartX = width * 0.58;
      const cartGroundY = getParchmentGroundY(cartX, width, height);
      const cartSlope = getGroundSlope(cartX, width, height);
      ctx.save();
      ctx.translate(cartX, cartGroundY);
      ctx.rotate(cartSlope);
      // Hollow Stump orthogonal to ground slope
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-14, -22);
      ctx.lineTo(14, -20);
      ctx.lineTo(18, 0);
      ctx.closePath();
      ctx.fill();
      // Stump Hollow Cavity
      ctx.fillStyle = '#0a0503';
      ctx.beginPath();
      ctx.ellipse(0, -10, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tiny Spirit Glow in Hollow
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.beginPath();
      ctx.arc(0, -10, 2, 0, Math.PI * 2);
      ctx.fill();
      // Complete Antique Wooden Wagon Wheel Leaning Against Stump
      const wheelX = 21;
      const wheelY = -15;
      
      // Outer Iron Tire Rim
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Wooden Felloe Rim
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 12.5, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Perfectly Evenly Spaced Radiating Wooden Spokes
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 1.6;
      const SPOKE_COUNT = 8;
      for (let sp = 0; sp < SPOKE_COUNT; sp++) {
        const spAngle = (sp * 2 * Math.PI) / SPOKE_COUNT;
        const cosA = Math.cos(spAngle);
        const sinA = Math.sin(spAngle);

        // Spoke ray from hub boundary to felloe inner boundary
        ctx.beginPath();
        ctx.moveTo(wheelX + cosA * 3.6, wheelY + sinA * 3.6);
        ctx.lineTo(wheelX + cosA * 12.5, wheelY + sinA * 12.5);
        ctx.stroke();

        // Small iron tire rivet stud at spoke joint on outer rim
        ctx.fillStyle = '#1a0f0a';
        ctx.beginPath();
        ctx.arc(wheelX + cosA * 13.8, wheelY + sinA * 13.8, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central Wooden Wheel Hub (drawn over spokes to clean inner joints)
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Iron Axle Center Cap
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // F. COZY FAIRYTALE CAMPFIRE & RISING EMBERS
      const campX = width * 0.64;
      const campGroundY = getParchmentGroundY(campX, width, height);
      const campSlope = getGroundSlope(campX, width, height);
      ctx.save();
      ctx.translate(campX, campGroundY);
      ctx.rotate(campSlope);

      // 1. Warm Fire Glow Effect on Ground
      const fireFlicker = Math.sin(now * 0.015) * 3 + Math.sin(now * 0.032) * 1.5;
      const fireGlow = ctx.createRadialGradient(0, -6, 2, 0, -6, 32 + fireFlicker);
      fireGlow.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
      fireGlow.addColorStop(0.4, 'rgba(239, 68, 68, 0.28)');
      fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fireGlow;
      ctx.beginPath();
      ctx.arc(0, -6, 32 + fireFlicker, 0, Math.PI * 2);
      ctx.fill();

      // 2. Stone Pit Base (Ring of River Stones)
      ctx.fillStyle = '#1a0f0a';
      const stoneOffsets = [-16, -11, -5, 0, 5, 11, 16];
      stoneOffsets.forEach((sx) => {
        ctx.beginPath();
        ctx.ellipse(sx, -2, 4.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Animated Campfire Flames (BEHIND THE WOODEN LOGS)
      for (let flame = 0; flame < 3; flame++) {
        const flameHeight = 16 + Math.sin(now * 0.018 + flame * 1.8) * 5 + fireFlicker * 0.5;
        const flameOffset = (flame - 1) * 5 + Math.sin(now * 0.02 + flame) * 2;
        const flameGrad = ctx.createLinearGradient(flameOffset, 0, flameOffset, -flameHeight);
        flameGrad.addColorStop(0, '#ef4444');
        flameGrad.addColorStop(0.5, '#f59e0b');
        flameGrad.addColorStop(1, '#fef08a');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(flameOffset - 6, -3);
        ctx.quadraticCurveTo(flameOffset - 2, -flameHeight * 0.6, flameOffset, -flameHeight);
        ctx.quadraticCurveTo(flameOffset + 2, -flameHeight * 0.6, flameOffset + 6, -3);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Crossed Burning Wooden Logs (IN FRONT OF FLAMES)
      ctx.strokeStyle = '#120b07';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-12, -1);
      ctx.lineTo(10, -12);
      ctx.moveTo(12, -1);
      ctx.lineTo(-10, -12);
      ctx.moveTo(-6, -1);
      ctx.lineTo(6, -14);
      ctx.stroke();

      // 5. Rising Campfire Embers & Smoke
      cauldronSmokeRef.current.forEach((sm) => {
        sm.y += sm.vy;
        sm.x += sm.vx + Math.sin(now * 0.003 + sm.y * 0.02) * 0.6;
        sm.radius += 0.06;
        sm.alpha *= 0.982;
        if (sm.alpha < 0.02 || sm.radius > sm.maxRadius) {
          sm.y = campGroundY - 14;
          sm.x = campX + (Math.random() - 0.5) * 10;
          sm.radius = 2 + Math.random() * 2;
          sm.alpha = 0.15 + Math.random() * 0.25;
        }
        ctx.fillStyle = Math.random() > 0.4 ? `rgba(245, 158, 11, ${sm.alpha * 1.5})` : `rgba(107, 68, 35, ${sm.alpha})`;
        ctx.beginPath();
        ctx.arc(sm.x - campX, sm.y - campGroundY, Math.max(0.6, sm.radius * (sm.alpha > 0.1 ? 0.3 : 1.0)), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // G. ANCIENT GOTHIC RUIN MONOLITH WITH GLOWING RUNES
      const monoX = width * 0.67;
      const monoGroundY = getParchmentGroundY(monoX, width, height);
      const monoSlope = getGroundSlope(monoX, width, height);
      ctx.save();
      ctx.translate(monoX, monoGroundY);
      ctx.rotate(monoSlope);
      // Weathered Stone Pillar Silhouette
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-10, -65);
      ctx.lineTo(-4, -78);
      ctx.lineTo(8, -74);
      ctx.lineTo(11, 0);
      ctx.closePath();
      ctx.fill();
      // Shimmering Carved Runes
      const runeGlow = 0.35 + Math.sin(now * 0.0025) * 0.25;
      ctx.strokeStyle = `rgba(245, 158, 11, ${runeGlow})`;
      ctx.lineWidth = 1.3;
      const runesY = -55;
      // Rune 1: Fehu (ᚠ)
      ctx.beginPath();
      ctx.moveTo(-2, runesY);
      ctx.lineTo(-2, runesY + 14);
      ctx.moveTo(-2, runesY + 2);
      ctx.lineTo(4, runesY - 2);
      ctx.moveTo(-2, runesY + 7);
      ctx.lineTo(4, runesY + 3);
      ctx.stroke();
      // Rune 2: Algiz (ᛉ)
      ctx.beginPath();
      ctx.moveTo(-1, runesY + 22);
      ctx.lineTo(-1, runesY + 36);
      ctx.moveTo(-1, runesY + 28);
      ctx.lineTo(-6, runesY + 22);
      ctx.moveTo(-1, runesY + 28);
      ctx.lineTo(4, runesY + 22);
      ctx.stroke();
      ctx.restore();


      // I. BIOLUMINESCENT MUSHROOM & TOADSTOOL CLUSTERS (Only far left and far right)
      const shroomPos = [width * 0.08, width * 0.90];
      shroomPos.forEach((mX, mIdx) => {
        const mGroundY = getParchmentGroundY(mX, width, height);
        const mSlope = getGroundSlope(mX, width, height);
        const distToM = Math.hypot(mouse.x - mX, mouse.y - mGroundY);
        const isNearM = distToM < 85 && mouse.x > 0;
        const capGlow = isNearM ? 0.9 : (0.4 + Math.sin(now * 0.003 + mIdx) * 0.2);

        ctx.save();
        ctx.translate(mX, mGroundY);
        ctx.rotate(mSlope);

        for (let k = 0; k < 3; k++) {
          const offX = (k - 1) * 7;
          const h = 10 + k * 4;
          const r = 5 + k * 2;
          // Stem
          ctx.strokeStyle = '#1a0f0a';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(offX, 0);
          ctx.lineTo(offX, -h);
          ctx.stroke();
          // Glowing Cap
          ctx.fillStyle = k === 1 ? `rgba(239, 68, 68, ${capGlow})` : `rgba(245, 158, 11, ${capGlow})`;
          ctx.beginPath();
          ctx.arc(offX, -h, r, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          // Cap Spots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(offX - r * 0.4, -h - r * 0.4, 0.8, 0, Math.PI * 2);
          ctx.arc(offX + r * 0.3, -h - r * 0.3, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // J. GNARLED ANCIENT OAK TREES & BLINKING CREATURE EYES (Screen Boundaries)
      // 1. Left Tree Boundary (x = width * 0.04)
      const treeLX = width * 0.04;
      const treeLGroundY = getParchmentGroundY(treeLX, width, height);
      const treeLSlope = getGroundSlope(treeLX, width, height);
      ctx.save();
      ctx.translate(treeLX, treeLGroundY);
      ctx.rotate(treeLSlope);
      ctx.fillStyle = '#140b07';
      // Root Base Flare orthogonal to ground slope
      ctx.beginPath();
      ctx.ellipse(0, 1, 38, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Massive Gnarled Trunk orthogonal to ground slope extending past top of screen
      ctx.beginPath();
      ctx.moveTo(-35, 1);
      ctx.quadraticCurveTo(-15, -height * 0.5, -30, -height * 1.5);
      ctx.lineTo(40, -height * 1.5);
      ctx.quadraticCurveTo(15, -height * 0.5, 35, 1);
      ctx.closePath();
      ctx.fill();
      // Overhanging Branches reaching inward across upper screen
      ctx.strokeStyle = '#140b07';
      ctx.lineWidth = 6.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, -height * 0.6);
      ctx.quadraticCurveTo(140, -height * 0.68, 240, -height * 0.76);
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(120, -height * 0.67);
      ctx.quadraticCurveTo(180, -height * 0.58, 220, -height * 0.52);
      ctx.stroke();
      // Tree Hollow Cavity
      ctx.fillStyle = '#080402';
      ctx.beginPath();
      ctx.ellipse(4, -80, 10, 18, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Blinking Creature Eyes inside Tree Hollow
      const eyeBlinkL = Math.sin(now * 0.002) > 0.94;
      if (!eyeBlinkL) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(1, -82, 1.8, 0, Math.PI * 2);
        ctx.arc(7, -82, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Right Tree Boundary (x = width * 0.94)
      const treeRX = width * 0.94;
      const treeRGroundY = getParchmentGroundY(treeRX, width, height);
      const treeRSlope = getGroundSlope(treeRX, width, height);
      ctx.save();
      ctx.translate(treeRX, treeRGroundY);
      ctx.rotate(treeRSlope);
      ctx.fillStyle = '#140b07';
      // Root Base Flare orthogonal to ground slope
      ctx.beginPath();
      ctx.ellipse(0, 1, 38, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Massive Trunk orthogonal to ground slope extending past top of screen
      ctx.beginPath();
      ctx.moveTo(-35, 1);
      ctx.quadraticCurveTo(-15, -height * 0.5, -25, -height * 1.5);
      ctx.lineTo(45, -height * 1.5);
      ctx.quadraticCurveTo(20, -height * 0.5, 40, 1);
      ctx.closePath();
      ctx.fill();
      // Sprawling Canopy Limbs — Top Branch
      ctx.strokeStyle = '#140b07';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -height * 0.55);
      ctx.quadraticCurveTo(-150, -height * 0.64, -250, -height * 0.72);
      ctx.stroke();
      // Bottom Branch — clearly intersects and forks from the top branch
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(-45, -height * 0.575);
      ctx.quadraticCurveTo(-145, -height * 0.55, -240, -height * 0.48);
      ctx.stroke();

      // Tree Hollow Cavity Right
      ctx.fillStyle = '#080402';
      ctx.beginPath();
      ctx.ellipse(-6, -95, 11, 20, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Blinking Eyes Right Hollow
      const eyeBlinkR = Math.sin(now * 0.0024 + 1.8) > 0.94;
      if (!eyeBlinkR) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-9, -97, 1.8, 0, Math.PI * 2);
        ctx.arc(-3, -97, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // K. PERCHED FOREST OWL (Permanently Attached to Top Surface of Top Branch)
      // Calculate exact (x,y) point on top branch quadratic bezier curve
      const owlT = 0.46;
      const owl1mt = 1 - owlT;
      const owlBranchX = owl1mt * owl1mt * (-10) + 2 * owl1mt * owlT * (-150) + owlT * owlT * (-250);
      const owlBranchY = owl1mt * owl1mt * (-height * 0.55) + 2 * owl1mt * owlT * (-height * 0.64) + owlT * owlT * (-height * 0.72);
      
      // Top boundary of branch line (top branch stroke lineWidth is 6.5)
      const branchTopY = owlBranchY - 3.25;

      // Owl Dimensions & Coordinates
      const owlRadiusX = 8.5;
      const owlRadiusY = 12;
      const owlCenterX = owlBranchX;
      // Center Y ensures the bottom edge of the owl body (owlCenterY + owlRadiusY) is EXACTLY at branchTopY
      const owlCenterY = branchTopY - owlRadiusY;

      // Owl Body & Silhouetted Feathers
      ctx.fillStyle = '#140b07';
      ctx.beginPath();
      ctx.ellipse(owlCenterX, owlCenterY, owlRadiusX, owlRadiusY, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Owl Ear Tufts
      ctx.fillStyle = '#140b07';
      ctx.beginPath();
      ctx.moveTo(owlCenterX - 6, owlCenterY - 12);
      ctx.lineTo(owlCenterX - 8, owlCenterY - 18);
      ctx.lineTo(owlCenterX - 2, owlCenterY - 14);
      ctx.lineTo(owlCenterX + 2, owlCenterY - 14);
      ctx.lineTo(owlCenterX + 8, owlCenterY - 18);
      ctx.lineTo(owlCenterX + 6, owlCenterY - 12);
      ctx.closePath();
      ctx.fill();

      // Owl Beak
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(owlCenterX - 2, owlCenterY - 3);
      ctx.lineTo(owlCenterX + 2, owlCenterY - 3);
      ctx.lineTo(owlCenterX, owlCenterY);
      ctx.closePath();
      ctx.fill();

      // Transform Mouse to Local Tree Coordinates for Responsive Gaze Tracking
      const cosS = Math.cos(-treeRSlope);
      const sinS = Math.sin(-treeRSlope);
      const dMouseX = mouse.x - treeRX;
      const dMouseY = mouse.y - treeRGroundY;
      const localMouseX = dMouseX * cosS - dMouseY * sinS;
      const localMouseY = dMouseX * sinS + dMouseY * cosS;

      const toMouseOwlX = localMouseX - owlCenterX;
      const toMouseOwlY = localMouseY - (owlCenterY - 6);
      const distOwl = Math.hypot(toMouseOwlX, toMouseOwlY);
      const gazeOwlX = distOwl > 1 ? (toMouseOwlX / distOwl) * 0.9 : 0;
      const gazeOwlY = distOwl > 1 ? (toMouseOwlY / distOwl) * 0.9 : 0;

      // Owl Gaze-Tracking Glowing Eyes
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(owlCenterX - 3.5 + gazeOwlX, owlCenterY - 6 + gazeOwlY, 2.4, 0, Math.PI * 2);
      ctx.arc(owlCenterX + 3.5 + gazeOwlX, owlCenterY - 6 + gazeOwlY, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Dark Pupils
      ctx.fillStyle = '#140b07';
      ctx.beginPath();
      ctx.arc(owlCenterX - 3.5 + gazeOwlX * 1.5, owlCenterY - 6 + gazeOwlY * 1.5, 1.0, 0, Math.PI * 2);
      ctx.arc(owlCenterX + 3.5 + gazeOwlX * 1.5, owlCenterY - 6 + gazeOwlY * 1.5, 1.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();




      // ----------------------------------------------------
      // 7. PROCESS CHARACTER PHYSICS & ORGANIC LOCOMOTION
      // ----------------------------------------------------
      charactersRef.current.forEach((char) => {
        const groundY = getParchmentGroundY(char.x + char.pushOffsetX, width, height);
        const groundSlope = getGroundSlope(char.x + char.pushOffsetX, width, height);
        char.y = groundY;

        // Key World Landmark Coordinates
        const signX = width * 0.24;
        const cartX = width * 0.58;
        const campX = width * 0.64;

        // Shoulder world reference point
        const shoulderWorldX = char.x + char.pushOffsetX;
        const shoulderWorldY = char.y - 28;

        const toMouseX = mouse.x - shoulderWorldX;
        const toMouseY = mouse.y - shoulderWorldY;
        const distToMouse = Math.hypot(toMouseX, toMouseY);

        // Sensitive 3D vicinity detection
        const isCursorInVicinity = distToMouse < 260 && mouse.activeTimer < 4.5 && mouse.x > 0;

        // Locomotion & State Selection
        char.actionCooldown -= dt;
        char.idleTimer += dt;

        // Stop walking when cursor is nearby — character freezes and observes with wonder
        if (isCursorInVicinity && char.state === 'walk') {
          char.targetX = char.x;
          char.vx *= Math.pow(0.04, dt);
          char.state = 'idle';
          char.idleTimer = 0;
          char.actionCooldown = Math.max(char.actionCooldown, 2.5);
        }

        // Turn to face cursor when idle near cursor
        if (isCursorInVicinity && Math.abs(mouse.x - shoulderWorldX) > 15 && (char.state === 'idle' || char.state === 'sit' || char.state === 'ponder')) {
          char.facing = mouse.x >= shoulderWorldX ? 1 : -1;
        }

        // Context-Aware Autonomous Action Selection (When not interrupted by cursor)
        if (!isCursorInVicinity && char.actionCooldown <= 0) {
          const actionRoll = Math.random();

          const distToCamp = Math.abs(char.x - campX);
          const distToCart = Math.abs(char.x - cartX);
          const distToSign = Math.abs(char.x - signX);

          // 1. Proximity element interactions
          if (distToCamp < 42 && actionRoll < 0.65) {
            // Warm hands near campfire
            char.state = 'warm_hands';
            char.facing = char.x < campX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 4.2 + Math.random() * 3.0;
          } else if (distToCart < 38 && actionRoll < 0.65) {
            // Inspect hollow stump cavity & wagon wheel
            char.state = 'inspect_hollow';
            char.facing = char.x < cartX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.6 + Math.random() * 2.5;
          } else if (distToSign < 48 && actionRoll < 0.60) {
            // Read signpost wooden degree branches
            char.state = 'read_sign';
            char.facing = char.x < signX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.8 + Math.random() * 2.8;
          } else if (char.x > width * 0.72 && actionRoll < 0.50) {
            // Look up at perched owl on right tree limb
            char.state = 'look_at_owl';
            char.facing = 1;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.4 + Math.random() * 2.2;
          } else if (actionRoll < 0.74) {
            // Slow, deliberate, unhurried walking with variable gait pacing
            const paceRoll = Math.random();
            if (paceRoll < 0.50) {
              char.paceMode = 'stroll'; // Meditative, slow exploration
              char.walkSpeed = 26 + Math.random() * 7;
              char.strideLength = 5.2;
            } else if (paceRoll < 0.85) {
              char.paceMode = 'walk'; // Grounded deliberate walking
              char.walkSpeed = 38 + Math.random() * 8;
              char.strideLength = 6.8;
            } else {
              char.paceMode = 'stride'; // Purposeful traveling stride
              char.walkSpeed = 50 + Math.random() * 8;
              char.strideLength = 8.4;
            }

            // Pick a destination (can be a landmark or open ground)
            const destChoice = Math.random();
            let chosenTarget = char.x;
            if (destChoice < 0.28) {
              chosenTarget = campX + (Math.random() > 0.5 ? -32 : 32);
            } else if (destChoice < 0.52) {
              chosenTarget = cartX + (Math.random() > 0.5 ? -28 : 28);
            } else if (destChoice < 0.72) {
              chosenTarget = signX + (Math.random() - 0.5) * 40;
            } else {
              const walkDelta = (Math.random() - 0.5) * 340;
              const minMove = (Math.random() > 0.5 ? 1 : -1) * (75 + Math.random() * 110);
              chosenTarget = char.x + (Math.abs(walkDelta) < 50 ? minMove : walkDelta);
            }

            char.targetX = Math.max(90, Math.min(width - 90, chosenTarget));
            char.idleTimer = 0;
            char.actionCooldown = 4.2 + Math.random() * 3.5;
            char.facing = Math.sign(char.targetX - char.x) || 1;
            char.state = 'walk';
            char.behaviorTimer = 0;
          } else if (actionRoll < 0.84) {
            char.state = 'ponder';
            char.behaviorTimer = 0;
            char.headTiltTarget = (Math.random() > 0.5 ? 1 : -1) * 0.24;
            char.actionCooldown = 3.2;
          } else if (actionRoll < 0.92) {
            char.state = 'inspect_plant';
            char.behaviorTimer = 0;
            char.actionCooldown = 3.0;
          } else if (actionRoll < 0.97) {
            char.state = 'stretch';
            char.behaviorTimer = 0;
            char.actionCooldown = 3.2;
          } else {
            char.state = 'wave';
            char.behaviorTimer = 0;
            char.actionCooldown = 2.8;
          }
        }

        const deltaTargetX = char.targetX - char.x;
        const absDist = Math.abs(deltaTargetX);

        if (absDist > 6 && char.state === 'walk' && !isCursorInVicinity) {
          const walkDir = Math.sign(deltaTargetX);
          char.facing = walkDir;

          // Slope physics: uphill slows naturally, downhill glides
          const slopeFactor = 1 - Math.sin(groundSlope * walkDir) * 0.28;
          const targetSpeed = walkDir * char.walkSpeed * slopeFactor;

          // Smooth exponential acceleration curve (deliberate weight transfer startup)
          const accel = (Math.abs(char.vx) < 6) ? 3.0 : 4.8;
          char.vx += (targetSpeed - char.vx) * dt * accel;
          char.x += char.vx * dt;

          const currentSpeed = Math.abs(char.vx);
          const gaitFreq = Math.max(1.8, currentSpeed / (char.strideLength * 1.5));
          const prevCycle = char.walkCycle;
          char.walkCycle += dt * gaitFreq;

          if (Math.floor(prevCycle / Math.PI) !== Math.floor(char.walkCycle / Math.PI)) {
            char.hipImpactVel += char.paceMode === 'stride' ? 12.0 : 7.5;
          }
        } else {
          char.vx += (-char.vx) * dt * 6.5;
          if (char.state === 'walk' && absDist <= 6) {
            char.state = char.idleTimer > 10 ? 'sit' : 'idle';
          }
        }

        // Smooth state timers
        if (char.state === 'warm_hands') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 4.5) char.state = 'idle';
        }
        if (char.state === 'inspect_hollow') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 3.8) char.state = 'idle';
        }
        if (char.state === 'read_sign') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 4.2) char.state = 'idle';
        }
        if (char.state === 'look_at_owl') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 3.5) char.state = 'idle';
        }
        if (char.state === 'inspect_plant') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 3.2) char.state = 'idle';
        }
        if (char.state === 'stretch') {
          char.behaviorTimer += dt;
          char.stretchProgress = Math.sin(Math.min(Math.PI, (char.behaviorTimer / 2.8) * Math.PI));
          if (char.behaviorTimer > 2.8) {
            char.stretchProgress = 0;
            char.state = 'idle';
          }
        } else {
          char.stretchProgress = (char.stretchProgress || 0) * 0.9;
        }
        if (char.state === 'wave') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 2.6) char.state = 'idle';
        }
        if (char.state === 'ponder') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 2.8) {
            char.headTiltTarget = 0;
            char.state = 'idle';
          }
        }

        // Continuous smooth facing blend
        if (char.facingBlend === undefined) char.facingBlend = char.facing || 1;
        char.facingBlend += (char.facing - char.facingBlend) * dt * 4.2;

        // Target yaw mapped to facingBlend
        if (char.state === 'wave') {
          char.targetYaw = Math.PI * 0.5;
        } else {
          const fNorm = (char.facingBlend + 1) * 0.5;
          char.targetYaw = (1 - fNorm) * (Math.PI - 0.22) + fNorm * 0.22;
        }

        const yawDiff = char.targetYaw - char.yawAngle;
        char.yawAngle += yawDiff * dt * 3.5;
        char.yawAngle = Math.max(0.18, Math.min(Math.PI - 0.18, char.yawAngle));

        // Physical push deflection
        const pushRadius = 38;
        if (distToMouse < pushRadius && mouse.x > 0) {
          const pushIntensity = (1 - distToMouse / pushRadius);
          const pushDirX = toMouseX === 0 ? -1 : -Math.sign(toMouseX);
          char.pushVelX += pushDirX * pushIntensity * 16 * dt * 8;
          char.pushVelY += -pushIntensity * 6 * dt * 5;
          char.bodyLeanVel += (-pushDirX * pushIntensity * 0.08);
          char.headLagVel += (pushDirX * pushIntensity * 0.1);
        }

        // Spring-Damper Recovery
        const springK = 42.0;
        const dampingC = 9.0;
        char.pushVelX += (-springK * char.pushOffsetX - dampingC * char.pushVelX) * dt;
        char.pushVelY += (-springK * char.pushOffsetY - dampingC * char.pushVelY) * dt;
        char.pushOffsetX += char.pushVelX * dt;
        char.pushOffsetY += char.pushVelY * dt;

        char.bodyLeanVel += (-32.0 * char.bodyLean - 8.0 * char.bodyLeanVel) * dt;
        char.bodyLean += char.bodyLeanVel * dt;

        char.headLagVel += (-36.0 * char.headLag - 8.5 * char.headLagVel) * dt;
        char.headLag += char.headLagVel * dt;
        char.headTilt += (char.headTiltTarget - char.headTilt) * dt * 3.5;

        char.hipImpactVel += (-50.0 * char.hipImpactSpring - 9.0 * char.hipImpactVel) * dt;
        char.hipImpactSpring += char.hipImpactVel * dt;

        char.eyeDilation += (1.0 - char.eyeDilation) * dt * 4.0;

        // Omnidirectional Reaching Vectors with Asymmetric Arm Swapping
        let targetReach = 0;
        if (isCursorInVicinity && distToMouse > 10 && char.state !== 'wave') {
          const rawReach = 1 - Math.max(0, Math.min(1, (distToMouse - 10) / 250));
          targetReach = rawReach * rawReach * (3 - 2 * rawReach);
          const normDist = Math.max(1, distToMouse);
          char.reachDirX = toMouseX / normDist;
          char.reachDirY = toMouseY / normDist;
        }

        const armHandoffWeight = Math.max(0, Math.min(1, (toMouseX + 35) / 70));
        const targetReachL = (isCursorInVicinity && distToMouse > 10 && char.state !== 'wave') ? targetReach * (1 - armHandoffWeight) : 0;
        const targetReachR = (isCursorInVicinity && distToMouse > 10 && char.state !== 'wave') ? targetReach * armHandoffWeight : 0;

        const isRaisingL = targetReachL > char.reachBlendL;
        const kL = isRaisingL ? 18.0 : 4.0;
        const dL = isRaisingL ? 7.0 : 3.8;
        char.reachVelL += ((targetReachL - char.reachBlendL) * kL - char.reachVelL * dL) * dt;
        char.reachBlendL = Math.max(0, Math.min(1, char.reachBlendL + char.reachVelL * dt));

        const isRaisingR = targetReachR > char.reachBlendR;
        const kR = isRaisingR ? 18.0 : 4.0;
        const dR = isRaisingR ? 7.0 : 3.8;
        char.reachVelR += ((targetReachR - char.reachBlendR) * kR - char.reachVelR * dR) * dt;
        char.reachBlendR = Math.max(0, Math.min(1, char.reachBlendR + char.reachVelR * dt));

        // Saccadic Micro-Movements
        char.saccadeTimer -= dt;
        if (char.saccadeTimer <= 0) {
          char.saccadeTimer = 1.5 + Math.random() * 2.8;
          char.saccadeX = (Math.random() - 0.5) * 0.35;
          char.saccadeY = (Math.random() - 0.5) * 0.25;
          if (char.state === 'idle') {
            char.headTiltTarget = (Math.random() - 0.5) * 0.12;
          }
        }

        // Gaze & Head Pitch per context state
        if (distToMouse > 1 && mouse.x > 0 && isCursorInVicinity) {
          const rawGazeX = (toMouseX / distToMouse) + char.saccadeX;
          const rawGazeY = (toMouseY / distToMouse) + char.saccadeY;
          char.gazeX += (rawGazeX - char.gazeX) * dt * 6.5;
          char.gazeY += (rawGazeY - char.gazeY) * dt * 6.5;
          const rawPitch = Math.max(-0.95, Math.min(0.45, (toMouseY / 120)));
          const targetPitch = rawPitch * char.facingBlend;
          char.headPitch += (targetPitch - char.headPitch) * dt * 7.0;
        } else if (char.state === 'warm_hands') {
          char.gazeX += (char.facingBlend * 0.7 - char.gazeX) * dt * 4.0;
          char.gazeY += (0.45 - char.gazeY) * dt * 4.0;
          char.headPitch += (0.28 * char.facingBlend - char.headPitch) * dt * 4.0;
        } else if (char.state === 'inspect_hollow') {
          char.gazeX += (char.facingBlend * 0.8 - char.gazeX) * dt * 4.0;
          char.gazeY += (0.6 - char.gazeY) * dt * 4.0;
          char.headPitch += (0.42 * char.facingBlend - char.headPitch) * dt * 4.0;
        } else if (char.state === 'read_sign') {
          char.gazeX += (char.facingBlend * 0.5 - char.gazeX) * dt * 4.0;
          char.gazeY += (-0.85 - char.gazeY) * dt * 4.0;
          char.headPitch += (-0.72 * char.facingBlend - char.headPitch) * dt * 4.0;
        } else if (char.state === 'look_at_owl') {
          char.gazeX += (0.8 - char.gazeX) * dt * 4.0;
          char.gazeY += (-0.95 - char.gazeY) * dt * 4.0;
          char.headPitch += (-0.85 - char.headPitch) * dt * 4.0;
        } else if (char.state === 'inspect_plant') {
          char.gazeX += (char.facingBlend * 0.4 - char.gazeX) * dt * 4.0;
          char.gazeY += (0.75 - char.gazeY) * dt * 4.0;
          char.headPitch += (0.48 * char.facingBlend - char.headPitch) * dt * 4.0;
        } else if (char.state === 'ponder') {
          char.gazeX += (0 - char.gazeX) * dt * 3.5;
          char.gazeY += (-0.6 - char.gazeY) * dt * 3.5;
          char.headPitch += (-0.45 * char.facingBlend - char.headPitch) * dt * 3.5;
        } else {
          char.gazeX += (char.facingBlend + char.saccadeX - char.gazeX) * dt * 3.5;
          char.gazeY += (char.saccadeY - char.gazeY) * dt * 3.5;
          char.headPitch += (-char.headPitch) * dt * 3.5;
        }

        // Blinking
        char.blinkTimer -= dt;
        if (char.blinkTimer <= 0) {
          char.isBlinking = true;
          char.blinkProgress += dt * 15;
          if (char.blinkProgress >= 1) {
            char.isBlinking = false;
            char.blinkProgress = 0;
            char.blinkTimer = Math.random() < 0.2 ? 0.25 : (2.8 + Math.random() * 4.5);
          }
        }

        // Respiration & Weight Shift
        char.breathTimer += dt * 1.8;
        const breathRaw = Math.sin(char.breathTimer);
        const breathCurve = Math.sign(breathRaw) * Math.pow(Math.abs(breathRaw), 1.25);

        char.weightShiftTimer += dt;
        if (char.weightShiftTimer > 4.5) {
          char.weightShiftTimer = 0;
          char.weightShiftSide = (Math.random() - 0.5) * 1.8;
        }
        char.weightShiftProgress += (char.weightShiftSide - char.weightShiftProgress) * dt * 2.0;

        // Smooth State Blend Coefficients
        const targetWalkBlend = (char.state === 'walk') ? 1.0 : 0.0;
        const targetStretchBlend = (char.state === 'stretch') ? 1.0 : 0.0;
        const targetWaveBlend = (char.state === 'wave') ? 1.0 : 0.0;
        const targetCrouchBlend = (char.state === 'crouch' || char.state === 'warm_hands') ? 1.0 : 0.0;
        const targetSitBlend = (char.state === 'sit') ? 1.0 : 0.0;

        char.walkBlend += (targetWalkBlend - char.walkBlend) * dt * 5.0;
        char.stretchBlend += (targetStretchBlend - char.stretchBlend) * dt * 4.5;
        char.waveBlend += (targetWaveBlend - char.waveBlend) * dt * 5.0;
        char.crouchBlend += (targetCrouchBlend - char.crouchBlend) * dt * 4.5;
        if (char.sitBlend === undefined) char.sitBlend = 0.0;
        char.sitBlend += (targetSitBlend - char.sitBlend) * dt * 4.5;

        // Hair Tuft Inertia with Ambient Wind Force
        const charWind = getAmbientWind(now, char.x);
        const bodyAccelX = char.pushVelX + char.vx * 0.08;
        char.hairPhysics.forEach((hair, idx) => {
          const hairSpring = -32.0 * hair.angle - 5.5 * hair.vel;
          const hairForce = -bodyAccelX * (0.012 + idx * 0.006) + (charWind * 0.22) + Math.sin(now * 0.004 + idx) * 0.04;
          hair.vel += (hairSpring + hairForce * 45) * dt;
          hair.angle += hair.vel * dt;
        });

        // ----------------------------------------------------
        // H. RENDER CHARACTER WITH FULL-BODY HIGH REACH & IK
        // ----------------------------------------------------
        ctx.save();
        const renderX = char.x + char.pushOffsetX;
        const renderY = char.y + char.pushOffsetY;
        const charSlope = getGroundSlope(char.x + char.pushOffsetX, width, height);

        ctx.translate(renderX, renderY);
        ctx.rotate(charSlope);
        ctx.scale(char.scale, char.scale);

        const theta = char.yawAngle;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const breathBob = breathCurve * 0.6;
        const walkBob = Math.abs(Math.sin(char.walkCycle)) * (char.paceMode === 'stride' ? 2.2 : 1.6) * char.walkBlend;
        const crouchBob = char.crouchBlend * -3.5;
        const sitBob = char.sitBlend * -5.0;
        const totalBodyBob = crouchBob + sitBob - (walkBob + breathBob) + char.hipImpactSpring * 0.18;

        const hipBaseY = -17 + totalBodyBob;

        // Biological Leg Kinematics with Natural Knee & Foot Roll
        const hipLx = -2.2;
        const hipRx = 2.2;

        const strideDir = char.facing || 1;
        const legStrideL = Math.sin(char.walkCycle) * char.strideLength * char.walkBlend * strideDir;
        const legStrideR = -Math.sin(char.walkCycle) * char.strideLength * char.walkBlend * strideDir;
        const legLiftL = Math.max(0, -Math.cos(char.walkCycle) * 2.8) * char.walkBlend;
        const legLiftR = Math.max(0, Math.cos(char.walkCycle) * 2.8) * char.walkBlend;

        const footLx = hipLx + legStrideL;
        const footLy = 1.8 - legLiftL * (1 - char.sitBlend * 0.8);
        const footRx = hipRx + legStrideR;
        const footRy = 1.8 - legLiftR * (1 - char.sitBlend * 0.8);

        const accelLean = (char.vx / (char.walkSpeed || 40)) * (char.paceMode === 'stride' ? 0.11 : 0.07);
        const stretchLean = -char.stretchBlend * char.stretchProgress * 0.22;
        const activeReach = Math.max(char.reachBlendL, char.reachBlendR);
        const cursorLean = activeReach * (char.reachDirX || 0) * 0.18;
        const dynamicLeanAngle = char.bodyLean + stretchLean + cursorLean + (char.walkBlend * accelLean);

        const drawLeg = (hx, hy, fx, fy, isLifted) => {
          ctx.strokeStyle = '#1a0f0a';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';

          // 2-Bone Knee IK
          const dx = fx - hx;
          const dy = fy - hy;
          const dist = Math.hypot(dx, dy);
          const maxLegLen = 17.0;
          const clampedDist = Math.min(maxLegLen - 0.2, Math.max(4.0, dist));
          
          const midX = hx + (dx / (dist || 1)) * (clampedDist * 0.5);
          const midY = hy + (dy / (dist || 1)) * (clampedDist * 0.5);
          const kneeBend = Math.sqrt(Math.max(0, (maxLegLen * 0.5) * (maxLegLen * 0.5) - (clampedDist * 0.5) * (clampedDist * 0.5)));
          const kneeX = midX + strideDir * (kneeBend * 0.65);
          const kneeY = midY + (isLifted ? -1.0 : 0.4);

          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(kneeX, kneeY, fx, fy);
          ctx.stroke();

          // Small grounded foot flat
          ctx.beginPath();
          ctx.moveTo(fx - strideDir * 1.5, fy);
          ctx.lineTo(fx + strideDir * 3.2, fy);
          ctx.stroke();
        };

        // Draw back leg first
        const drawLegLFirst = char.facing >= 0;
        if (drawLegLFirst) {
          drawLeg(hipLx, hipBaseY, footLx, footLy, legLiftL > 0.5);
        } else {
          drawLeg(hipRx, hipBaseY, footRx, footRy, legLiftR > 0.5);
        }

        ctx.save();
        ctx.translate(0, hipBaseY);
        ctx.rotate(dynamicLeanAngle);

        const chestExpand = (breathCurve * 0.35) + (char.stretchProgress * 0.6);
        const chestHalfW = 4.8 * Math.abs(sinT) + 3.8 * Math.abs(cosT) + chestExpand * 0.5;
        const waistHalfW = 3.6 * Math.abs(sinT) + 2.8 * Math.abs(cosT) + chestExpand * 0.3;
        const hipHalfW = 4.2 * Math.abs(sinT) + 3.2 * Math.abs(cosT);

        // Uniform Sleek Silhouette Body
        ctx.fillStyle = '#1a0f0a';
        ctx.beginPath();
        ctx.moveTo(-chestHalfW, -16);
        ctx.lineTo(chestHalfW, -16);
        ctx.quadraticCurveTo(waistHalfW + 0.8, -8, hipHalfW, 1.0);
        ctx.quadraticCurveTo(0, 5.2, -hipHalfW, 1.0);
        ctx.quadraticCurveTo(-waistHalfW - 0.8, -8, -chestHalfW, -16);
        ctx.closePath();
        ctx.fill();

        // Shoulder Coordinates & Arm IK
        const shoulderY = -14;
        const armWalkSwing = Math.sin(char.walkCycle) * (char.paceMode === 'stride' ? 4.5 : 3.0) * char.walkBlend;

        const shLx = -4.2 * sinT - 1.2 * cosT;
        const shLz = -4.2 * cosT + 1.2 * sinT;
        const shRx = 4.2 * sinT + 1.2 * cosT;
        const shRz = 4.2 * cosT - 1.2 * sinT;

        const reachDirX = char.reachDirX || (cosT >= 0 ? 1 : -1);
        const reachDirY = char.reachDirY || 0;
        const maxArmLen = 10.5;

        const computeArmPose = (armJoint, shX, isRightArm) => {
          const armDir = isRightArm ? 1 : -1;
          const armReach = isRightArm ? char.reachBlendR : char.reachBlendL;

          // 1. Walk Pose
          const swing = armWalkSwing * armDir * cosT;
          const walkHandTargetX = shX + (armDir * 1.5 + swing);
          const walkHandTargetY = shoulderY + 10.0;

          // 2. Warm Hands Pose (Extended toward fire)
          const isWarming = char.state === 'warm_hands';
          const warmHandTargetX = shX + char.facingBlend * 7.5 + (isRightArm ? 1.5 : -1.5) + Math.sin(now * 0.006) * 0.5;
          const warmHandTargetY = shoulderY + 2.5 + Math.sin(now * 0.008 + (isRightArm ? 1 : 0)) * 0.7;

          // 3. Stretch Pose
          const stretchHandTargetX = shX + armDir * 3.5;
          const stretchHandTargetY = shoulderY - 10.5 * char.stretchProgress;

          // 4. Wave Pose
          const waveHandTargetX = shX + Math.sin(now * 0.014) * 3.5 + 2.0;
          const waveHandTargetY = shoulderY - 8.5;

          // 5. Reach Pose (360° Omnidirectional)
          const reachHandTargetX = shX + reachDirX * maxArmLen;
          const reachHandTargetY = shoulderY + reachDirY * maxArmLen;

          // Weighted continuous blending across all states
          const wStretch = char.stretchBlend;
          const wWave = (isRightArm && reachDirX >= 0) ? char.waveBlend : 0;
          const wWarm = isWarming ? 0.9 : 0;
          const wReach = armReach > 0.005 ? armReach : 0;
          const wWalk = Math.max(0, 1 - (wStretch + wWave + wWarm + wReach));

          const rawTargetHandX = walkHandTargetX * wWalk + stretchHandTargetX * wStretch + waveHandTargetX * wWave + warmHandTargetX * wWarm + reachHandTargetX * wReach;
          const rawTargetHandY = walkHandTargetY * wWalk + stretchHandTargetY * wStretch + waveHandTargetY * wWave + warmHandTargetY * wWarm + reachHandTargetY * wReach;

          const dx = rawTargetHandX - shX;
          const dy = rawTargetHandY - shoulderY;
          const dist = Math.hypot(dx, dy);
          const clampedDist = Math.max(2.0, Math.min(maxArmLen - 0.2, dist));
          const unitX = dist > 0.001 ? dx / dist : 0;
          const unitY = dist > 0.001 ? dy / dist : 1;

          const targetHandX = shX + unitX * clampedDist;
          const targetHandY = shoulderY + unitY * clampedDist;

          // 2-Bone IK Elbow calculation
          const midX = shX + unitX * (clampedDist * 0.5);
          const midY = shoulderY + unitY * (clampedDist * 0.5);
          const bendHeight = Math.sqrt(Math.max(0, 27.0 - (clampedDist * 0.5) * (clampedDist * 0.5)));
          const normX = -unitY * armDir;
          const normY = unitX * armDir;

          const targetElbowX = midX + normX * (bendHeight * 0.65);
          const targetElbowY = midY + normY * (bendHeight * 0.65);

          armJoint.elbowX += (targetElbowX - armJoint.elbowX) * dt * 14.0;
          armJoint.elbowY += (targetElbowY - armJoint.elbowY) * dt * 14.0;
          armJoint.handX += (targetHandX - armJoint.handX) * dt * 14.0;
          armJoint.handY += (targetHandY - armJoint.handY) * dt * 14.0;

          return { wWave, wReach, wWarm };
        };

        const poseL = computeArmPose(char.armL, shLx, false);
        const poseR = computeArmPose(char.armR, shRx, true);

        const drawArm = (armJoint, shX, pose) => {
          ctx.lineWidth = 2.2;
          ctx.strokeStyle = '#1a0f0a';
          ctx.beginPath();
          ctx.moveTo(shX, shoulderY);
          ctx.quadraticCurveTo(armJoint.elbowX, armJoint.elbowY, armJoint.handX, armJoint.handY);
          ctx.stroke();

          if (pose.wWave > 0.3) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX, armJoint.handY, 1.4, 1.8, Math.sin(now * 0.014) * 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.wReach > 0.2) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.arc(armJoint.handX + reachDirX * 1.2, armJoint.handY + reachDirY * 1.2, 1.1, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.wWarm > 0.3) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX + char.facingBlend * 0.8, armJoint.handY, 1.2, 1.4, char.facingBlend * 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        // Draw back arm
        if (shLz < shRz) {
          drawArm(char.armL, shLx, poseL);
        } else {
          drawArm(char.armR, shRx, poseR);
        }

        const neckY = -17;
        const stretchHeadTilt = -char.stretchBlend * char.stretchProgress * 0.25;
        const headRotation = (char.headPitch * 0.75) + char.headLag + (char.headTilt * char.facingBlend) + stretchHeadTilt;

        ctx.save();
        ctx.translate(0, neckY);
        ctx.rotate(headRotation);

        ctx.fillStyle = '#1a0f0a';
        ctx.beginPath();
        ctx.arc(0, -6.5, 7.0, 0, Math.PI * 2);
        ctx.fill();

        const h0 = char.hairPhysics[0].angle;
        const h1 = char.hairPhysics[1].angle;
        const h2 = char.hairPhysics[2].angle;
        const h3 = char.hairPhysics[3].angle;

        ctx.beginPath();
        ctx.moveTo(-5.5 * cosT, -9);
        ctx.lineTo(-7.5 * cosT + h0 * 5.0, -14.0 + Math.abs(h0) * 2);
        ctx.lineTo(-4.5 * cosT, -12);
        ctx.lineTo(-2.8 * cosT + h1 * 7.0, -16.2 + Math.abs(h1) * 2.5);
        ctx.lineTo(0.5 * cosT, -13);
        ctx.lineTo(3.8 * cosT + h2 * 6.0, -15.0 + Math.abs(h2) * 2);
        ctx.lineTo(6.0 * cosT + h3 * 4.0, -11.5);
        ctx.lineTo(6.8 * cosT, -7);
        ctx.closePath();
        ctx.fill();

        const R = 6.0;
        const eyeAngle1 = theta - 0.38;
        const eyeAngle2 = theta + 0.38;

        const eye1x = R * Math.cos(eyeAngle1) + char.gazeX * 1.4;
        const eye1z = R * Math.sin(eyeAngle1);
        const eye2x = R * Math.cos(eyeAngle2) + char.gazeX * 1.4;
        const eye2z = R * Math.sin(eyeAngle2);

        const eyeY = -6.5 + char.gazeY * 1.0;
        const eyeScaleY = char.isBlinking ? Math.max(0.08, 1 - Math.sin(char.blinkProgress * Math.PI)) : 1.0;

        const drawEye3D = (ex, ey, ez) => {
          if (ez < -2.8) return;
          const depthAlpha = Math.max(0.2, Math.min(1.0, (ez + 2.8) / 5.5));
          const radX = 1.25 * char.eyeDilation;
          const radY = 1.4 * char.eyeDilation * eyeScaleY;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ex, ey, radX, radY, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * depthAlpha})`;
          ctx.beginPath();
          ctx.arc(ex, ey, 3.2 * char.eyeDilation * eyeScaleY, 0, Math.PI * 2);
          ctx.fill();
        };

        drawEye3D(eye1x, eyeY, eye1z);
        drawEye3D(eye2x, eyeY, eye2z);

        ctx.restore(); // Head

        // Draw front arm
        if (shLz >= shRz) {
          drawArm(char.armL, shLx, poseL);
        } else {
          drawArm(char.armR, shRx, poseR);
        }
        ctx.restore(); // Torso

        // Draw front leg
        if (drawLegLFirst) {
          drawLeg(hipRx, hipBaseY, footRx, footRy, legLiftR > 0.5);
        } else {
          drawLeg(hipLx, hipBaseY, footLx, footLy, legLiftL > 0.5);
        }

        ctx.restore();
      });



      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="limbo-character-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 38,
      }}
    />
  );
}
