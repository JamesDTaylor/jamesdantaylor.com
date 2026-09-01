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

export default function InkCharacterEngine({ isDark = false, extraCreaturesCount = 0 }) {
  const canvasRef = useRef(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;
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
  const frogRef = useRef(null);
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

    // Initialize Frog Companion Character on the terrain
    const frogStartX = width * 0.22;
    frogRef.current = {
      x: frogStartX,
      y: getParchmentGroundY(frogStartX, width, height),
      vx: 0,
      vy: 0,
      facing: 1,
      state: 'idle', // 'idle' | 'crouch' | 'jump' | 'land' | 'tongue_strike'
      scale: 0.55,

      // Timers & intervals (randomized)
      idleTimer: 1.5 + Math.random() * 2.0,
      crouchTimer: 0,
      crouchDuration: 0.14,
      landingTimer: 0,
      landingDuration: 0.16,
      landingCompression: 0,

      // Ballistic Elastic Tongue Strike Engine
      tongue: {
        active: false,
        targetX: 0,
        targetY: 0,
        flyId: null,
        progress: 0,
        phase: 'extend',
        holdTimer: 0,
        caughtFly: false,
      },
      gulpTimer: 0,
      huntJumpCooldown: 0,
      isHuntingJump: false,
      huntTargetFly: null,

      // Organic micro-motions
      throatPhase: Math.random() * Math.PI * 2,
      breathingSpeed: 1.8 + Math.random() * 1.2,
      blinkTimer: 2.5 + Math.random() * 3.5,
      isBlinking: false,
      blinkProgress: 0,
      lookAngle: 0,
      lookTarget: 0,
      lookTimer: 1.5,

      // Kinematics & chaining
      jumpCount: 0,
      consecutiveJumpsTarget: 1,
      bodyAngle: 0,
      takeoffVx: 0,
      takeoffVy: 0,
      fleeCooldown: 0,
      isFleeJump: false,
      fleeFacing: 1,

      // Particle motes on takeoff / landing
      impactMotes: [],
      initialized: true,
    };

    const chars = [];

    // 1. MAIN HERO CHARACTER ('hero') - Spiky Hair, Moonlight White Eyes, Agile Wanderer
    const startX = width * 0.36;
    chars.push({
      id: 'limbo-hero',
      characterType: 'hero',
      isHero: true,
      x: startX,
      y: getParchmentGroundY(startX, width, height),
      targetX: width * 0.48,
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
      walkSpeed: 45,
      scale: 1.05,

      // State Blends
      walkBlend: 1.0,
      stretchBlend: 0.0,
      waveBlend: 0.0,
      crouchBlend: 0.0,
      sitBlend: 0.0,
      sitBenchBlend: 0.0,
      sitRockBlend: 0.0,
      catchFlyBlend: 0.0,
      warmHandsBlend: 0.0,
      jumpBlend: 0.0,

      stretchProgress: 0,
      behaviorTimer: 0,

      // Jump / Leap Mechanics
      isAirborne: false,
      jumpVy: 0,
      jumpOffsetY: 0,
      crouchTimer: 0,
      jumpCooldown: 4.0 + Math.random() * 5.0,
      impactMotes: [],

      // Firefly / Mote Tracking
      catchFlyDirX: 1,
      catchFlyDirY: -0.3,
      fireflyTimer: 0,

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

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const clickX = touch.clientX;
        const clickY = touch.clientY;

        charactersRef.current.forEach((char) => {
          const dx = clickX - char.x;
          const dy = clickY - (char.y - 25);
          const dist = Math.hypot(dx, dy);

          if (dist < 65) {
            const impulseX = (dx < 0 ? 1 : -1) * 18;
            char.pushVelX += impulseX;
            char.pushVelY -= 10;
            char.bodyLeanVel += (dx < 0 ? 0.1 : -0.1);
            char.eyeDilation = 1.25;
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
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

      const isNight = isDarkRef.current;
      const glowRadius = isNight ? 85 + flicker * 1.5 : 60 + flicker;
      const glowGrad = ctx.createRadialGradient(0, lampTopY + 14, 2, 0, lampTopY + 14, glowRadius);
      glowGrad.addColorStop(0, isNight ? 'rgba(254, 240, 138, 0.65)' : 'rgba(245, 158, 11, 0.35)');
      glowGrad.addColorStop(0.35, isNight ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 119, 6, 0.12)');
      glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, lampTopY + 14, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Downward conical amber light beam illuminating the ground & bench in Nocturne
      if (isNight) {
        const coneGrad = ctx.createLinearGradient(0, lampTopY + 18, 0, 0);
        coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        coneGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.22)');
        coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(-4, lampTopY + 18);
        ctx.lineTo(-32, 0);
        ctx.lineTo(32, 0);
        ctx.lineTo(4, lampTopY + 18);
        ctx.closePath();
        ctx.fill();
      }

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

      const stoneX = width * 0.42;
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







      // E. WOODLAND LEAN-TO SHELTER (TO THE LEFT OF CHEST & WAGON WHEEL)
      const leantoX = width * 0.525;
      const leantoGroundY = getParchmentGroundY(leantoX, width, height);
      const leantoSlope = getGroundSlope(leantoX, width, height);
      ctx.save();
      ctx.translate(leantoX, leantoGroundY);
      ctx.rotate(leantoSlope);

      // 1. Stacked Seasoned Firewood under back eaves
      ctx.fillStyle = '#120b07';
      const logCoords = [
        [-14, -3], [-8, -3], [-2, -3],
        [-11, -7], [-5, -7],
        [-8, -11]
      ];
      logCoords.forEach(([lx, ly]) => {
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2b1810';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(lx, ly, 1.3, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 2. Bed of dried pine boughs / woodland straw
      ctx.strokeStyle = '#26160d';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-16, -1);
      ctx.lineTo(14, -1);
      ctx.moveTo(-12, -2);
      ctx.lineTo(10, -2);
      ctx.stroke();

      // 3. Sturdy Front & Rear Vertical Timber Posts
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      // Front main upright timber post (facing towards campfire on the right)
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(18, -32);
      ctx.stroke();
      // Mid rear support post
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.stroke();
      // Back ground anchor post
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-20, -5);
      ctx.stroke();

      // 4. Slanted Timber Rafters & Handcrafted Cross Beams
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(-24, -2);
      ctx.lineTo(22, -34); // Main ridge rafter
      ctx.stroke();

      // Cross-bracing diagonal strut for handcrafted authenticity
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(18, -22);
      ctx.lineTo(8, -29);
      ctx.stroke();

      // 5. Overlapping Weathered Wooden Roof Planks & Bark Slabs
      ctx.fillStyle = '#1a0f0a';
      // Slanted roof silhouette with textured plank overhangs
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(-24, -4);
      ctx.lineTo(-12, -14);
      ctx.lineTo(0, -23);
      ctx.lineTo(12, -31);
      ctx.lineTo(24, -36);
      ctx.lineTo(23, -33);
      ctx.lineTo(11, -25);
      ctx.lineTo(-1, -17);
      ctx.lineTo(-13, -8);
      ctx.lineTo(-25, 0);
      ctx.closePath();
      ctx.fill();

      // Overlapping cedar shake plank lines
      ctx.strokeStyle = '#26160d';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-20, -7);
      ctx.lineTo(-17, -9);
      ctx.moveTo(-8, -16);
      ctx.lineTo(-5, -18);
      ctx.moveTo(4, -25);
      ctx.lineTo(7, -27);
      ctx.moveTo(16, -33);
      ctx.lineTo(19, -35);
      ctx.stroke();

      // 6. Hanging Iron Storm Lantern from Front Ridge Beam
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(14, -30);
      ctx.lineTo(14, -21); // Suspension chain
      ctx.stroke();

      // Lantern glow
      const lanternGlow = ctx.createRadialGradient(14, -18, 1, 14, -18, 12);
      lanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
      lanternGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
      lanternGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(14, -18, 12, 0, Math.PI * 2);
      ctx.fill();

      // Lantern iron frame & light core
      ctx.fillStyle = '#1a0f0a';
      ctx.fillRect(12.5, -21, 3, 1.2); // Cap
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12.8, -19.5, 2.4, 3.2); // Glass chamber
      ctx.fillStyle = '#1a0f0a';
      ctx.fillRect(12.5, -16, 3, 1.2); // Base

      ctx.restore();

      // F. ANTIQUE CHEST WITH WAGON WHEEL PROPPED BEHIND IT (BETWEEN LEAN-TO AND CAMPFIRE)
      const chestX = width * 0.585;
      const chestGroundY = getParchmentGroundY(chestX, width, height);
      const chestSlope = getGroundSlope(chestX, width, height);
      ctx.save();
      ctx.translate(chestX, chestGroundY);
      ctx.rotate(chestSlope);

      // 1. Antique Wooden Wagon Wheel (DRAWN BEHIND THE CHEST)
      const wheelX = 2;
      const wheelY = -14;
      
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

      // 8 Radiating Wooden Spokes
      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 1.6;
      const SPOKE_COUNT = 8;
      for (let sp = 0; sp < SPOKE_COUNT; sp++) {
        const spAngle = (sp * 2 * Math.PI) / SPOKE_COUNT;
        const cosA = Math.cos(spAngle);
        const sinA = Math.sin(spAngle);

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

      // Central Wooden Wheel Hub
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Iron Axle Center Cap
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Antique Iron-Banded Wooden Treasure Chest (IN FRONT OF WAGON WHEEL)
      // Ground cast shadow
      ctx.fillStyle = 'rgba(20, 10, 5, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Chest Wooden Box & Arched Domed Lid Silhouette
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      // Base box
      ctx.moveTo(-11, 0);
      ctx.lineTo(-11, -10);
      // Arched domed lid
      ctx.quadraticCurveTo(0, -16.5, 11, -10);
      ctx.lineTo(11, 0);
      ctx.closePath();
      ctx.fill();

      // Horizontal Lid Seam Line
      ctx.strokeStyle = '#2b1810';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(11, -10);
      ctx.stroke();

      // Left & Right Vertical Riveted Iron Strapping Bands
      ctx.fillStyle = '#26160d';
      ctx.fillRect(-7.5, -13.5, 2.4, 13.5); // Left band
      ctx.fillRect(5.1, -13.5, 2.4, 13.5);  // Right band

      // Iron Rivet Studs on Bands
      ctx.fillStyle = '#1a0f0a';
      const rivetYs = [-12.5, -9, -5, -1.5];
      rivetYs.forEach((ry) => {
        ctx.beginPath();
        ctx.arc(-6.3, ry, 0.65, 0, Math.PI * 2);
        ctx.arc(6.3, ry, 0.65, 0, Math.PI * 2);
        ctx.fill();
      });

      // Brass Lock Plate Hasp & Keyhole
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(-2.2, -11.5, 4.4, 4.2, [1]);
      ctx.fill();

      // Dark Keyhole in Brass Plate
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.arc(0, -10.2, 0.8, 0, Math.PI * 2);
      ctx.rect(-0.45, -10.2, 0.9, 1.6);
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

      // G. CAMPFIRE SITTING ROCK (SMALL FLAT-TOPPED BOULDER TO SIT ON NEXT TO THE FIRE)
      const campRockX = width * 0.675;
      const campRockGroundY = getParchmentGroundY(campRockX, width, height);
      const campRockSlope = getGroundSlope(campRockX, width, height);
      ctx.save();
      ctx.translate(campRockX, campRockGroundY);
      ctx.rotate(campRockSlope);

      // 1. Ground Cast Shadow
      ctx.fillStyle = 'rgba(20, 10, 5, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 11, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main Fireside Sitting Boulder Silhouette
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.quadraticCurveTo(-10, -5, -6, -8.5); // Left rounded shoulder
      ctx.lineTo(6, -8.5);                     // Flat comfortable seating surface
      ctx.quadraticCurveTo(10, -5, 9, 0);       // Right shoulder
      ctx.closePath();
      ctx.fill();

      // 3. Top Seating Surface Facet & Woodsy Texture
      ctx.strokeStyle = '#2b1810';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-6, -8.5);
      ctx.lineTo(6, -8.5);
      ctx.stroke();

      // 4. Warm Amber Firelight Reflection on Left Rock Face (facing campfire)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.beginPath();
      ctx.moveTo(-8.5, 0);
      ctx.quadraticCurveTo(-9.5, -4.5, -6, -8.5);
      ctx.lineTo(-2, -8.5);
      ctx.quadraticCurveTo(-5, -4, -4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // H. ANCIENT GOTHIC RUIN MONOLITH WITH GLOWING RUNES
      const monoX = width * 0.73;
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
        const benchX = width * 0.22;
        const lampX = width * 0.28;
        const stoneX = width * 0.52;
        const cartX = width * 0.58;
        const campX = width * 0.64;
        const treeRX = width * 0.94;

        // Fetch alive cursor flies from the global registry for hero interaction
        const aliveFlies = (typeof window !== 'undefined' && window.__cursorFlies ? window.__cursorFlies : []).filter(
          (f) => !f.eaten
        );

        let closestFly = null;
        let minDistToFly = Infinity;
        for (const fly of aliveFlies) {
          const d = Math.hypot(fly.x - char.x, fly.y - (char.y - 25));
          if (d < minDistToFly) {
            minDistToFly = d;
            closestFly = fly;
          }
        }

        // Shoulder world reference point
        const shoulderWorldX = char.x + char.pushOffsetX;
        const shoulderWorldY = char.y - 28 + (char.isAirborne ? char.jumpOffsetY : 0);

        const toMouseX = mouse.x - shoulderWorldX;
        const toMouseY = mouse.y - shoulderWorldY;
        const distToMouse = Math.hypot(toMouseX, toMouseY);

        // Sensitive 3D vicinity detection
        const isCursorInVicinity = distToMouse < 260 && mouse.activeTimer < 4.5 && mouse.x > 0;

        // Locomotion & State Selection
        char.actionCooldown -= dt;
        char.idleTimer += dt;
        if (char.jumpCooldown) char.jumpCooldown -= dt;

        // Stop walking when cursor is nearby — character freezes and observes with wonder
        if (isCursorInVicinity && char.state === 'walk') {
          char.targetX = char.x;
          char.vx *= Math.pow(0.04, dt);
          char.state = 'idle';
          char.idleTimer = 0;
          char.actionCooldown = Math.max(char.actionCooldown, 2.5);
        }

        // Turn to face cursor when idle or sitting near cursor
        if (isCursorInVicinity && Math.abs(mouse.x - shoulderWorldX) > 15 && (char.state === 'idle' || char.state === 'sit' || char.state === 'sit_bench' || char.state === 'ponder')) {
          char.facing = mouse.x >= shoulderWorldX ? 1 : -1;
        }

        // Context-Aware Autonomous Action Selection (When not interrupted by cursor)
        if (!isCursorInVicinity && char.actionCooldown <= 0 && !char.isAirborne) {
          const actionRoll = Math.random();

          const distToBench = Math.abs(char.x - benchX);
          const distToCamp = Math.abs(char.x - campX);
          const distToCart = Math.abs(char.x - cartX);
          const distToStone = Math.abs(char.x - stoneX);

          // 1. Firefly interaction (Hero observes and catches floating firefly/ember)
          if (closestFly && minDistToFly < 120 && actionRoll < 0.75 && char.state !== 'sit_bench') {
            char.state = 'catch_firefly';
            char.catchFlyDirX = (closestFly.x >= char.x ? 1 : -1);
            char.catchFlyDirY = Math.max(-0.9, Math.min(0.3, (closestFly.y - shoulderWorldY) / 60));
            char.facing = char.catchFlyDirX;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.5 + Math.random() * 2.0;
            char.eyeDilation = 1.35;
          }
          // 2. Sit on the antique wooden bench (Major Feature!)
          else if ((distToBench < 28 || actionRoll < 0.22) && char.state !== 'sit_bench') {
            if (distToBench > 10) {
              // Walk over to the bench first
              char.targetX = benchX;
              char.paceMode = 'stroll';
              char.walkSpeed = 30;
              char.strideLength = 5.8;
              char.state = 'walk';
              char.facing = Math.sign(benchX - char.x) || 1;
              char.actionCooldown = 0.5;
            } else {
              // Arrived at bench — sit down comfortably!
              char.x = benchX;
              char.targetX = benchX;
              char.vx = 0;
              char.state = 'sit_bench';
              char.facing = 1; // Face towards street lamp / clearing
              char.behaviorTimer = 0;
              char.actionCooldown = 9.0 + Math.random() * 6.0;
              char.headTiltTarget = 0.12;
            }
          }
          // 3. Proximity landmark interactions
          else if (distToCamp < 42 && actionRoll < 0.65 && char.state !== 'sit_bench') {
            // Warm hands near campfire
            char.state = 'warm_hands';
            char.facing = char.x < campX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 4.8 + Math.random() * 3.0;
          } else if (distToCart < 38 && actionRoll < 0.65 && char.state !== 'sit_bench') {
            // Inspect hollow stump cavity & wagon wheel
            char.state = 'inspect_hollow';
            char.facing = char.x < cartX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.8 + Math.random() * 2.5;
          } else if (distToStone < 48 && actionRoll < 0.60 && char.state !== 'sit_bench') {
            // Read milestone runes
            char.state = 'read_sign';
            char.facing = char.x < stoneX ? 1 : -1;
            char.behaviorTimer = 0;
            char.actionCooldown = 4.0 + Math.random() * 2.8;
          } else if (char.x > width * 0.72 && actionRoll < 0.50 && char.state !== 'sit_bench') {
            // Look up at perched owl on right tree limb
            char.state = 'look_at_owl';
            char.facing = 1;
            char.behaviorTimer = 0;
            char.actionCooldown = 3.6 + Math.random() * 2.2;
          } else if ((Math.abs(char.x - width * 0.08) < 38 || Math.abs(char.x - width * 0.90) < 38) && actionRoll < 0.55 && char.state !== 'sit_bench') {
            // Inspect bioluminescent mushrooms
            char.state = 'inspect_plant';
            char.behaviorTimer = 0;
            char.actionCooldown = 3.4 + Math.random() * 2.0;
          }
          // 4. Agile Traveler Leap / Hop over terrain
          else if (char.state === 'walk' && (!char.jumpCooldown || char.jumpCooldown <= 0) && actionRoll < 0.40) {
            char.state = 'jump_leap';
            char.crouchTimer = 0.09;
            char.behaviorTimer = 0;
            char.jumpCooldown = 6.0 + Math.random() * 6.0;
            char.actionCooldown = 2.0;
          }
          // 5. Walking with varied pacing modes
          else if (actionRoll < 0.76) {
            const paceRoll = Math.random();
            if (paceRoll < 0.45) {
              char.paceMode = 'stroll'; // Meditative, slow exploration
              char.walkSpeed = 26 + Math.random() * 7;
              char.strideLength = 5.2;
            } else if (paceRoll < 0.82) {
              char.paceMode = 'walk'; // Grounded deliberate walking
              char.walkSpeed = 38 + Math.random() * 8;
              char.strideLength = 6.8;
            } else {
              char.paceMode = 'stride'; // Purposeful traveling stride
              char.walkSpeed = 50 + Math.random() * 8;
              char.strideLength = 8.4;
            }

            // Destination selection (bench, stone, lean-to, chest, campfire rock, campfire, or open landscape)
            const destChoice = Math.random();
            let chosenTarget = char.x;
            if (destChoice < 0.18) {
              chosenTarget = benchX + (Math.random() > 0.5 ? -4 : 4);
            } else if (destChoice < 0.34) {
              chosenTarget = stoneX + (Math.random() - 0.5) * 24;
            } else if (destChoice < 0.50) {
              chosenTarget = leantoX + (Math.random() > 0.5 ? -22 : 22);
            } else if (destChoice < 0.66) {
              chosenTarget = chestX + (Math.random() > 0.5 ? -20 : 20);
            } else if (destChoice < 0.82) {
              chosenTarget = campRockX + (Math.random() > 0.5 ? -4 : 4);
            } else if (destChoice < 0.90) {
              chosenTarget = campX + (Math.random() > 0.5 ? -32 : 32);
            } else {
              const walkDelta = (Math.random() - 0.5) * 340;
              const minMove = (Math.random() > 0.5 ? 1 : -1) * (75 + Math.random() * 110);
              chosenTarget = char.x + (Math.abs(walkDelta) < 50 ? minMove : walkDelta);
            }

            char.targetX = Math.max(90, Math.min(width - 90, chosenTarget));
            char.idleTimer = 0;
            char.actionCooldown = 4.5 + Math.random() * 3.5;
            char.facing = Math.sign(char.targetX - char.x) || 1;
            char.state = 'walk';
            char.behaviorTimer = 0;
          } else if (actionRoll < 0.86) {
            char.state = 'ponder';
            char.behaviorTimer = 0;
            char.headTiltTarget = (Math.random() > 0.5 ? 1 : -1) * 0.26;
            char.actionCooldown = 3.2;
          } else if (actionRoll < 0.94) {
            char.state = 'stretch';
            char.behaviorTimer = 0;
            char.actionCooldown = 3.2;
          } else {
            char.state = 'wave';
            char.behaviorTimer = 0;
            char.actionCooldown = 2.8;
          }
        }

        // --- A. BENCH SITTING STATE ENGINE ---
        if (char.state === 'sit_bench') {
          char.behaviorTimer += dt;
          char.vx = 0;
          char.x = benchX - 2.0;
          char.facing = 1;

          // Relaxed contemplation gaze while sitting on the bench
          if (!isCursorInVicinity) {
            const lampGazeX = Math.sign(lampX - benchX) * 0.45;
            char.gazeX += (lampGazeX - char.gazeX) * dt * 3.0;
            char.gazeY += (Math.sin(now * 0.0015) * 0.2 - 0.1 - char.gazeY) * dt * 3.0;
            char.headPitch += (-0.06 - char.headPitch) * dt * 3.0;
          }

          // Stand up smoothly after sitting duration
          if (char.behaviorTimer > (char.actionCooldown || 12.0)) {
            char.state = 'walk';
            char.targetX = width * (0.35 + Math.random() * 0.35);
            char.facing = Math.sign(char.targetX - char.x) || 1;
            char.behaviorTimer = 0;
            char.actionCooldown = 4.0;
          }
        }

        // --- A2. CAMPFIRE ROCK SITTING STATE ENGINE ---
        if (char.state === 'sit_rock') {
          char.behaviorTimer += dt;
          char.vx = 0;
          char.x = campRockX;
          char.facing = -1; // Face left towards campfire flames

          // Gaze tracks dancing flames and rising embers
          if (!isCursorInVicinity) {
            char.gazeX += (-0.85 - char.gazeX) * dt * 4.0;
            char.gazeY += (Math.sin(now * 0.002) * 0.15 + 0.15 - char.gazeY) * dt * 4.0;
            char.headPitch += (0.12 - char.headPitch) * dt * 4.0;
          }

          // Stand up smoothly after sitting duration
          if (char.behaviorTimer > (char.actionCooldown || 12.0)) {
            char.state = 'walk';
            char.targetX = width * (0.35 + Math.random() * 0.35);
            char.facing = Math.sign(char.targetX - char.x) || 1;
            char.behaviorTimer = 0;
            char.actionCooldown = 4.0;
          }
        }

        // --- B. JUMP & LEAP PHYSICS ENGINE ---
        if (char.state === 'jump_leap') {
          if (char.crouchTimer > 0) {
            char.crouchTimer -= dt;
            if (char.crouchTimer <= 0) {
              // Takeoff!
              char.isAirborne = true;
              char.jumpVy = -230 - Math.random() * 50;
              char.jumpOffsetY = -2;
              char.vx = char.facing * (65 + Math.random() * 25);

              // Spawn takeoff dust motes
              for (let i = 0; i < 3; i++) {
                char.impactMotes.push({
                  x: char.x + (Math.random() - 0.5) * 8,
                  y: groundY,
                  vx: -char.vx * 0.08 + (Math.random() - 0.5) * 20,
                  vy: -10 - Math.random() * 20,
                  alpha: 0.65,
                  radius: 1.0 + Math.random() * 1.3,
                });
              }
            }
          }
        }

        if (char.isAirborne) {
          const gravity = 680; // px/s^2
          char.jumpVy += gravity * dt;
          char.jumpOffsetY += char.jumpVy * dt;
          char.x += char.vx * dt;

          // Boundary guard
          if (char.x < 70) {
            char.x = 70;
            char.vx = Math.abs(char.vx) * 0.5;
            char.facing = 1;
          } else if (char.x > width - 70) {
            char.x = width - 70;
            char.vx = -Math.abs(char.vx) * 0.5;
            char.facing = -1;
          }

          // Landing detection
          if (char.jumpOffsetY >= 0) {
            char.jumpOffsetY = 0;
            char.jumpVy = 0;
            char.isAirborne = false;
            char.hipImpactVel = 18.0;
            char.state = 'walk';

            // Spawn landing dust motes
            for (let i = 0; i < 4; i++) {
              char.impactMotes.push({
                x: char.x + (Math.random() - 0.5) * 10,
                y: groundY,
                vx: (Math.random() - 0.5) * 28,
                vy: -8 - Math.random() * 18,
                alpha: 0.7,
                radius: 1.1 + Math.random() * 1.4,
              });
            }
          }
        }

        // --- C. FIREFLY CATCHING INTERACTION ---
        if (char.state === 'catch_firefly') {
          char.behaviorTimer += dt;
          char.vx *= Math.pow(0.05, dt);

          if (closestFly) {
            const dxFly = closestFly.x - shoulderWorldX;
            const dyFly = closestFly.y - shoulderWorldY;
            const distF = Math.hypot(dxFly, dyFly);
            char.catchFlyDirX = distF > 1 ? dxFly / distF : char.facing;
            char.catchFlyDirY = distF > 1 ? dyFly / distF : -0.3;
            char.facing = char.catchFlyDirX >= 0 ? 1 : -1;
            char.gazeX += (char.catchFlyDirX * 0.85 - char.gazeX) * dt * 6.0;
            char.gazeY += (char.catchFlyDirY - char.gazeY) * dt * 6.0;
            char.headPitch += (char.catchFlyDirY * 0.7 - char.headPitch) * dt * 6.0;
          }

          if (char.behaviorTimer > 3.0) {
            char.state = 'idle';
            char.actionCooldown = 3.0;
          }
        }

        // --- D. WALKING NAVIGATION & MOMENTUM ---
        const deltaTargetX = char.targetX - char.x;
        const absDist = Math.abs(deltaTargetX);

        if (absDist > 6 && char.state === 'walk' && !isCursorInVicinity && !char.isAirborne) {
          const walkDir = Math.sign(deltaTargetX);
          char.facing = walkDir;

          // Slope physics: uphill slows naturally, downhill glides
          const slopeFactor = 1 - Math.sin(groundSlope * walkDir) * 0.28;
          const targetSpeed = walkDir * char.walkSpeed * slopeFactor;

          // Smooth exponential acceleration curve
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
        } else if (!char.isAirborne) {
          char.vx += (-char.vx) * dt * 6.5;
          if (char.state === 'walk' && absDist <= 6) {
            if (Math.abs(char.x - benchX) < 14) {
              char.state = 'sit_bench';
              char.behaviorTimer = 0;
              char.facing = 1;
              char.actionCooldown = 9.0 + Math.random() * 5.0;
            } else if (Math.abs(char.x - campRockX) < 14) {
              char.state = 'sit_rock';
              char.behaviorTimer = 0;
              char.facing = -1; // Face towards fire
              char.actionCooldown = 9.0 + Math.random() * 5.0;
            } else {
              char.state = char.idleTimer > 10 ? 'sit' : 'idle';
            }
          }
        }

        // Smooth state duration timers
        if (char.state === 'warm_hands') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 4.8) char.state = 'idle';
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
          if (char.behaviorTimer > 3.6) char.state = 'idle';
        }
        if (char.state === 'inspect_plant') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 3.4) char.state = 'idle';
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
        } else if (char.state === 'sit_bench') {
          char.targetYaw = 0.35; // Comfortable 3/4 front view facing street lamp
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
        } else if (char.state === 'catch_firefly') {
          // Gaze is set dynamically above
        } else if (char.state === 'ponder') {
          char.gazeX += (0 - char.gazeX) * dt * 3.5;
          char.gazeY += (-0.6 - char.gazeY) * dt * 3.5;
          char.headPitch += (-0.45 * char.facingBlend - char.headPitch) * dt * 3.5;
        } else if (char.state === 'sit_bench') {
          // Gaze is managed in sit_bench block above
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
        const targetCrouchBlend = (char.state === 'crouch' || char.state === 'warm_hands' || char.state === 'inspect_plant' || char.crouchTimer > 0) ? 1.0 : 0.0;
        const targetSitBlend = (char.state === 'sit') ? 1.0 : 0.0;
        const targetSitBenchBlend = (char.state === 'sit_bench') ? 1.0 : 0.0;
        const targetSitRockBlend = (char.state === 'sit_rock') ? 1.0 : 0.0;
        const targetCatchFlyBlend = (char.state === 'catch_firefly') ? 1.0 : 0.0;
        const targetJumpBlend = (char.isAirborne) ? 1.0 : 0.0;

        char.walkBlend += (targetWalkBlend - char.walkBlend) * dt * 5.0;
        char.stretchBlend += (targetStretchBlend - char.stretchBlend) * dt * 4.5;
        char.waveBlend += (targetWaveBlend - char.waveBlend) * dt * 5.0;
        char.crouchBlend += (targetCrouchBlend - char.crouchBlend) * dt * 4.5;
        if (char.sitBlend === undefined) char.sitBlend = 0.0;
        char.sitBlend += (targetSitBlend - char.sitBlend) * dt * 4.5;
        if (char.sitBenchBlend === undefined) char.sitBenchBlend = 0.0;
        char.sitBenchBlend += (targetSitBenchBlend - char.sitBenchBlend) * dt * 4.2;
        if (char.sitRockBlend === undefined) char.sitRockBlend = 0.0;
        char.sitRockBlend += (targetSitRockBlend - char.sitRockBlend) * dt * 4.2;
        if (char.catchFlyBlend === undefined) char.catchFlyBlend = 0.0;
        char.catchFlyBlend += (targetCatchFlyBlend - char.catchFlyBlend) * dt * 5.0;
        if (char.jumpBlend === undefined) char.jumpBlend = 0.0;
        char.jumpBlend += (targetJumpBlend - char.jumpBlend) * dt * 6.0;

        // Hair Tuft Inertia with Ambient Wind Force & Jump Velocity
        const charWind = getAmbientWind(now, char.x);
        const jumpWindX = char.isAirborne ? -char.vx * 0.12 : 0;
        const jumpWindY = char.isAirborne ? -char.jumpVy * 0.05 : 0;
        const bodyAccelX = char.pushVelX + char.vx * 0.08 + jumpWindX;
        char.hairPhysics.forEach((hair, idx) => {
          const hairSpring = -32.0 * hair.angle - 5.5 * hair.vel;
          const hairForce = -bodyAccelX * (0.014 + idx * 0.007) + (charWind * 0.22) + jumpWindY * 0.06 + Math.sin(now * 0.004 + idx) * 0.04;
          hair.vel += (hairSpring + hairForce * 45) * dt;
          hair.angle += hair.vel * dt;
        });

        // ----------------------------------------------------
        // H. RENDER HERO CHARACTER WITH FULL-BODY IK
        // ----------------------------------------------------
        // Render Dust Motes
        for (let i = char.impactMotes.length - 1; i >= 0; i--) {
          const mote = char.impactMotes[i];
          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          mote.vy += 320 * dt;
          mote.alpha -= dt * 1.8;
          if (mote.alpha <= 0) {
            char.impactMotes.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.fillStyle = `rgba(26, 15, 10, ${Math.max(0, mote.alpha)})`;
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        const renderX = char.x + char.pushOffsetX;
        const renderY = char.y + (char.isAirborne ? char.jumpOffsetY : 0) + char.pushOffsetY;
        const charSlope = char.isAirborne ? (char.jumpVy * 0.0008 * char.facing) : getGroundSlope(char.x + char.pushOffsetX, width, height);

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
        const sitBenchBob = char.sitBenchBlend * 7.5; // Sinks down to plant hips directly on bottom bar (seat plank at y = -10)
        const sitRockBob = char.sitRockBlend * 8.5;   // Sinks down to plant hips on top of campfire rock (y = -8.5)
        const totalBodyBob = crouchBob + sitBob + sitBenchBob + sitRockBob - (walkBob + breathBob) + char.hipImpactSpring * 0.18;

        const hipBaseY = -17 + totalBodyBob;

        // Biological Leg Kinematics with Natural Knee & Foot Roll & Bench/Rock Seated Fold
        const hipLx = -2.2;
        const hipRx = 2.2;

        const strideDir = char.facing || 1;
        const legStrideL = Math.sin(char.walkCycle) * char.strideLength * char.walkBlend * strideDir;
        const legStrideR = -Math.sin(char.walkCycle) * char.strideLength * char.walkBlend * strideDir;
        const legLiftL = Math.max(0, -Math.cos(char.walkCycle) * 2.8) * char.walkBlend;
        const legLiftR = Math.max(0, Math.cos(char.walkCycle) * 2.8) * char.walkBlend;

        const footLx = hipLx + legStrideL;
        const footLy = 1.8 - legLiftL * (1 - char.sitBlend * 0.8 - char.sitBenchBlend * 0.8 - char.sitRockBlend * 0.8);
        const footRx = hipRx + legStrideR;
        const footRy = 1.8 - legLiftR * (1 - char.sitBlend * 0.8 - char.sitBenchBlend * 0.8 - char.sitRockBlend * 0.8);

        const accelLean = (char.vx / (char.walkSpeed || 40)) * (char.paceMode === 'stride' ? 0.11 : 0.07);
        const stretchLean = -char.stretchBlend * char.stretchProgress * 0.22;
        const activeReach = Math.max(char.reachBlendL, char.reachBlendR);
        const cursorLean = activeReach * (char.reachDirX || 0) * 0.18;
        const sitBenchLean = char.sitBenchBlend * -0.08; // Relaxed backrest lean against bench
        const sitRockLean = char.sitRockBlend * 0.08;   // Gentle forward lean warming hands by campfire
        const dynamicLeanAngle = char.bodyLean + stretchLean + cursorLean + sitBenchLean + sitRockLean + (char.walkBlend * accelLean);

        const drawLeg = (hx, hy, fx, fy, isLifted) => {
          ctx.strokeStyle = '#1a0f0a';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';

          // 1. Standard 2-Bone Knee IK
          const dx = fx - hx;
          const dy = fy - hy;
          const dist = Math.hypot(dx, dy);
          const maxLegLen = 17.0;
          const clampedDist = Math.min(maxLegLen - 0.2, Math.max(4.0, dist));
          
          const midX = hx + (dx / (dist || 1)) * (clampedDist * 0.5);
          const midY = hy + (dy / (dist || 1)) * (clampedDist * 0.5);
          const kneeBend = Math.sqrt(Math.max(0, (maxLegLen * 0.5) * (maxLegLen * 0.5) - (clampedDist * 0.5) * (clampedDist * 0.5)));
          const airKneeTuck = char.isAirborne ? -4.5 : 0;
          const stdKneeX = midX + strideDir * (kneeBend * 0.65);
          const stdKneeY = midY + (isLifted ? -1.0 : 0.4) + airKneeTuck;

          // 2. Bench Seated Leg Kinematics:
          // Thigh rests horizontally along bottom bar (seat plank at y = -10), knee bends 90° over front edge, shin drops to ground
          const benchKneeX = hx + strideDir * 5.8;
          const benchKneeY = hy + 0.1; // Flat horizontal thigh on bottom bar
          const benchFootX = benchKneeX + strideDir * 0.4;
          const benchFootY = 0.5 + Math.sin(now * 0.002 + hx) * 0.4; // Grounded feet under bench

          // 3. Campfire Rock Seated Leg Kinematics:
          // Hips on rock top, knees bent forward towards the fire, grounded feet
          const rockKneeX = hx + strideDir * 5.4;
          const rockKneeY = hy + 0.1;
          const rockFootX = rockKneeX + strideDir * 0.4;
          const rockFootY = 0.5 + Math.sin(now * 0.002 + hx) * 0.3;

          // Seamless blending between walking, bench seated, and campfire rock postures
          const finalKneeX = (1 - char.sitBenchBlend - char.sitRockBlend) * stdKneeX + char.sitBenchBlend * benchKneeX + char.sitRockBlend * rockKneeX;
          const finalKneeY = (1 - char.sitBenchBlend - char.sitRockBlend) * stdKneeY + char.sitBenchBlend * benchKneeY + char.sitRockBlend * rockKneeY;
          const finalFootX = (1 - char.sitBenchBlend - char.sitRockBlend) * fx + char.sitBenchBlend * benchFootX + char.sitRockBlend * rockFootX;
          const finalFootY = (1 - char.sitBenchBlend - char.sitRockBlend) * fy + char.sitBenchBlend * benchFootY + char.sitRockBlend * rockFootY;

          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(finalKneeX, finalKneeY);
          ctx.lineTo(finalFootX, finalFootY);
          ctx.stroke();

          // Grounded / dangling foot flat
          ctx.beginPath();
          ctx.moveTo(finalFootX - strideDir * 1.5, finalFootY);
          ctx.lineTo(finalFootX + strideDir * 3.2, finalFootY);
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

        // ── Main Hero Silhouette Torso ──
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
          const isBackrestArm = (isRightArm && strideDir < 0) || (!isRightArm && strideDir >= 0);
          const armReach = isRightArm ? char.reachBlendR : char.reachBlendL;

          // 1. Walk Pose
          const swing = armWalkSwing * armDir * cosT;
          const walkHandTargetX = shX + (armDir * 1.5 + swing);
          const walkHandTargetY = shoulderY + 10.0;

          // 2. Warm Hands Pose (Extended toward fire while standing)
          const isWarming = char.state === 'warm_hands';
          const warmHandTargetX = shX + char.facingBlend * 7.5 + (isRightArm ? 1.5 : -1.5) + Math.sin(now * 0.006) * 0.5;
          const warmHandTargetY = shoulderY + 2.5 + Math.sin(now * 0.008 + (isRightArm ? 1 : 0)) * 0.7;

          // 3. Bench Seated Pose:
          // Back arm reaches backward and rests on top bar (y = -17)
          // Front arm rests comfortably forward on the knee / bottom bar
          const isSittingBench = char.sitBenchBlend > 0.01;
          let sitBenchHandTargetX = 0;
          let sitBenchHandTargetY = 0;
          if (isBackrestArm) {
            sitBenchHandTargetX = shX - strideDir * 7.2;
            sitBenchHandTargetY = shoulderY + 7.3; // Sits right on top bar (y = -17)
          } else {
            sitBenchHandTargetX = shX + strideDir * 4.8;
            sitBenchHandTargetY = shoulderY + 13.5;
          }

          // 3b. Campfire Rock Seated Pose (Hands extended comfortably warming over fire)
          const isSittingRock = char.sitRockBlend > 0.01;
          const sitRockHandTargetX = shX + strideDir * 7.5 + (isRightArm ? 1.2 : -1.2) + Math.sin(now * 0.006) * 0.5;
          const sitRockHandTargetY = shoulderY + 2.8 + Math.sin(now * 0.008 + (isRightArm ? 1 : 0)) * 0.6;

          // 4. Catch Firefly / Mote Pose (Cupped hand reaching gently toward glowing mote)
          const isCatching = char.catchFlyBlend > 0.01;
          const catchHandTargetX = shX + (char.catchFlyDirX || strideDir) * 8.5 + (isRightArm ? 1.2 : -1.2);
          const catchHandTargetY = shoulderY + (char.catchFlyDirY || -0.3) * 8.5;

          // 5. Jump Airborne Pose (Athletic balance extension)
          const jumpHandTargetX = shX - strideDir * 3.8 + (isRightArm ? 1.5 : -1.5);
          const jumpHandTargetY = shoulderY + 4.5;

          // 6. Stretch Pose
          const stretchHandTargetX = shX + armDir * 3.5;
          const stretchHandTargetY = shoulderY - 10.5 * char.stretchProgress;

          // 7. Wave Pose
          const waveHandTargetX = shX + Math.sin(now * 0.014) * 3.5 + 2.0;
          const waveHandTargetY = shoulderY - 8.5;

          // 8. Reach Pose (360° Omnidirectional cursor tracking)
          const reachHandTargetX = shX + reachDirX * maxArmLen;
          const reachHandTargetY = shoulderY + reachDirY * maxArmLen;

          // Weighted continuous blending across all states
          const wStretch = char.stretchBlend;
          const wWave = (isRightArm && reachDirX >= 0) ? char.waveBlend : 0;
          const wWarm = isWarming ? 0.9 : 0;
          const wSitBench = isSittingBench ? char.sitBenchBlend * (isBackrestArm ? 0.98 : 0.92) : 0;
          const wSitRock = isSittingRock ? char.sitRockBlend * 0.95 : 0;
          const wCatchFly = isCatching ? char.catchFlyBlend * 0.95 : 0;
          const wJump = char.isAirborne ? char.jumpBlend * 0.9 : 0;
          const wReach = armReach > 0.005 ? (isBackrestArm ? armReach * 0.35 : armReach) : 0;
          const wWalk = Math.max(0, 1 - (wStretch + wWave + wWarm + wSitBench + wSitRock + wCatchFly + wJump + wReach));

          const rawTargetHandX = walkHandTargetX * wWalk + stretchHandTargetX * wStretch + waveHandTargetX * wWave + warmHandTargetX * wWarm + sitBenchHandTargetX * wSitBench + sitRockHandTargetX * wSitRock + catchHandTargetX * wCatchFly + jumpHandTargetX * wJump + reachHandTargetX * wReach;
          const rawTargetHandY = walkHandTargetY * wWalk + stretchHandTargetY * wStretch + waveHandTargetY * wWave + warmHandTargetY * wWarm + sitBenchHandTargetY * wSitBench + sitRockHandTargetY * wSitRock + catchHandTargetY * wCatchFly + jumpHandTargetY * wJump + reachHandTargetY * wReach;

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
          
          let normX = -unitY * armDir;
          let normY = unitX * armDir;
          if (isSittingBench && isBackrestArm) {
            // Natural drape elbow over top bar
            normX = -strideDir * 0.6;
            normY = -0.8;
          }

          const targetElbowX = midX + normX * (bendHeight * 0.65);
          const targetElbowY = midY + normY * (bendHeight * 0.65);

          armJoint.elbowX += (targetElbowX - armJoint.elbowX) * dt * 14.0;
          armJoint.elbowY += (targetElbowY - armJoint.elbowY) * dt * 14.0;
          armJoint.handX += (targetHandX - armJoint.handX) * dt * 14.0;
          armJoint.handY += (targetHandY - armJoint.handY) * dt * 14.0;

          return { wWave, wReach, wWarm, wCatchFly, wSitBench, isBackrestArm };
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

          if (pose.wSitBench > 0.3 && pose.isBackrestArm) {
            // Hand draped / resting on top bar of the bench
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX, armJoint.handY, 1.4, 1.1, -0.2 * strideDir, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.wWave > 0.3) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX, armJoint.handY, 1.4, 1.8, Math.sin(now * 0.014) * 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.wReach > 0.2) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.arc(armJoint.handX + reachDirX * 1.2, armJoint.handY + reachDirY * 1.2, 1.1, 0, Math.PI * 2);
            ctx.fill();
          } else if (pose.wCatchFly > 0.25) {
            // Gentle cupped hand catching glowing firefly
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX, armJoint.handY, 1.5, 1.2, -0.3 * strideDir, 0, Math.PI * 2);
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

        // Spiky Tousled Hair (Hero)
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

          // Moonlit White Hero Eyes
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

      // ----------------------------------------------------
      // 8. PROCESS FROG CHARACTER PHYSICS & FLY PREDATION
      // ----------------------------------------------------
      const frog = frogRef.current;
      if (frog && frog.initialized) {
        const frogGroundY = getParchmentGroundY(frog.x, width, height);

        // Main hero character proximity detection
        const hero = (charactersRef.current && charactersRef.current.length > 0) ? charactersRef.current[0] : null;
        const heroGroundY = hero ? getParchmentGroundY(hero.x, width, height) : 0;
        const distToHero = hero ? Math.hypot(hero.x - frog.x, heroGroundY - frogGroundY) : Infinity;
        const dxToHero = hero ? (hero.x - frog.x) : 0;

        // Flee cooldown timer
        if (frog.fleeCooldown > 0) {
          frog.fleeCooldown -= dt;
        }

        // Fetch alive cursor flies from the global registry
        const aliveFlies = (typeof window !== 'undefined' && window.__cursorFlies ? window.__cursorFlies : []).filter(
          (f) => !f.eaten
        );

        // Find the closest alive fly
        let closestFly = null;
        let minDistToFly = Infinity;
        for (const fly of aliveFlies) {
          const d = Math.hypot(fly.x - frog.x, fly.y - (frog.y - 10));
          if (d < minDistToFly) {
            minDistToFly = d;
            closestFly = fly;
          }
        }

        // --- A. TONGUE STRIKE MECHANICS (Grounded or Mid-Air) ---
        if (frog.tongue && frog.tongue.active) {
          // If extending, keep target tracking the live fly
          if (frog.tongue.phase === 'extend') {
            if (frog.tongue.flyId) {
              const liveFly = (window.__cursorFlies || []).find((f) => f.id === frog.tongue.flyId);
              if (liveFly) {
                frog.tongue.targetX = liveFly.x;
                frog.tongue.targetY = liveFly.y;
              }
            }

            frog.tongue.progress += dt * 7.5; // Fast, snappy whip out (~0.13s)
            if (frog.tongue.progress >= 1.0) {
              frog.tongue.progress = 1.0;
              frog.tongue.phase = 'hold';
              frog.tongue.holdTimer = 0.07; // Latch onto fly for 70ms
              frog.tongue.caughtFly = true;
              // Mark fly as eaten so cursor canvas stops drawing it
              if (frog.tongue.flyId) {
                const flyObj = (window.__cursorFlies || []).find((f) => f.id === frog.tongue.flyId);
                if (flyObj) flyObj.eaten = true;
              }
            }
          } else if (frog.tongue.phase === 'hold') {
            frog.tongue.holdTimer -= dt;
            if (frog.tongue.holdTimer <= 0) {
              frog.tongue.phase = 'retract';
            }
          } else if (frog.tongue.phase === 'retract') {
            frog.tongue.progress -= dt * 6.0; // Smooth reel back into mouth (~0.16s)
            if (frog.tongue.progress <= 0) {
              frog.tongue.progress = 0;
              frog.tongue.active = false;
              frog.tongue.caughtFly = false;
              // Permanently remove fly from global cursor swarm
              if (frog.tongue.flyId && window.__eatCursorFly) {
                window.__eatCursorFly(frog.tongue.flyId);
              }
              frog.tongue.flyId = null;
              frog.gulpTimer = 0.28; // Satisfying throat gulp swallow
              if (frog.state === 'tongue_strike') {
                frog.state = 'idle';
                frog.idleTimer = 0.12; // Instant readiness to catch the next fly!
              }
            }
          }
        }

        // Swallowing gulp timer
        if (frog.gulpTimer > 0) {
          frog.gulpTimer -= dt;
        }

        // Hunting jump cooldown timer
        if (frog.huntJumpCooldown > 0) {
          frog.huntJumpCooldown -= dt;
        }

        // --- B. IDLE STATE (Stalking Flies, Breathing, Tongue Snapping, Fleeing, Jumping) ---
        if (frog.state === 'idle') {
          frog.y = frogGroundY;
          frog.vx = 0;
          frog.vy = 0;
          frog.bodyAngle = 0;

          // 1. HERO ESCAPE TRIGGER: If the Main Character approaches within 125px -> Jump away!
          if (distToHero < 125 && frog.fleeCooldown <= 0 && frog.gulpTimer <= 0) {
            let fleeFacing = dxToHero > 0 ? -1 : 1; // Face away from character
            // Boundary bounce guard if trapped at screen edge
            if (frog.x < 55 && fleeFacing === -1) fleeFacing = 1;
            if (frog.x > width - 55 && fleeFacing === 1) fleeFacing = -1;

            frog.facing = fleeFacing;
            frog.fleeFacing = fleeFacing;
            frog.state = 'crouch';
            frog.crouchDuration = 0.05 + Math.random() * 0.04; // Quick startled reaction
            frog.crouchTimer = 0;
            frog.isFleeJump = true;
            frog.isHuntingJump = false;
            frog.breathingSpeed = 5.0; // Panicked breathing
          }
          // 2. If flies are present on screen, actively hunt them
          else if (closestFly) {
            const dxToFly = closestFly.x - frog.x;
            frog.facing = dxToFly >= 0 ? 1 : -1;
            frog.lookAngle = Math.max(-0.75, Math.min(0.75, (dxToFly / 70) * frog.facing));
            frog.breathingSpeed = 4.2; // Excited predatory breathing

            // Trigger 1: Direct Tongue Strike (within realistic ~95px reach!)
            // Frog STAYS GROUNDED and flicks its quick slender tongue directly at nearby flies!
            if (minDistToFly <= 95 && (!frog.tongue || !frog.tongue.active) && frog.gulpTimer <= 0) {
              frog.state = 'tongue_strike';
              frog.tongue = {
                active: true,
                targetX: closestFly.x,
                targetY: closestFly.y,
                flyId: closestFly.id,
                progress: 0,
                phase: 'extend',
                holdTimer: 0.07,
                caughtFly: false,
              };
            }
            // Trigger 2: Fly is further away (>95px away) -> leap towards fly to get in range!
            else if (minDistToFly > 95 && (!frog.huntJumpCooldown || frog.huntJumpCooldown <= 0)) {
              frog.state = 'crouch';
              frog.crouchDuration = 0.08;
              frog.crouchTimer = 0;
              frog.isHuntingJump = true;
              frog.huntTargetFly = closestFly;
            }
          } else {
            // No flies: relaxed breathing & gentle autonomous idling
            // If hero is within alert radius (125-220px), turn away and track nervously
            if (distToHero < 220) {
              frog.facing = dxToHero > 0 ? -1 : 1;
              frog.lookAngle = Math.max(-0.75, Math.min(0.75, (dxToHero / 80) * frog.facing));
              frog.breathingSpeed = 3.4;
            } else {
              frog.breathingSpeed = 1.8;
              if (frog.lookTimer <= 0) {
                frog.lookTarget = (Math.random() - 0.5) * 0.45;
                frog.lookTimer = 1.5 + Math.random() * 2.8;
              }
              frog.lookAngle += (frog.lookTarget - frog.lookAngle) * dt * 4.0;
            }
            frog.isHuntingJump = false;
            frog.huntTargetFly = null;
          }

          // Micro-actions
          frog.throatPhase += dt * (2.6 + frog.breathingSpeed);
          frog.idleTimer -= dt;
          frog.blinkTimer -= dt;
          frog.lookTimer -= dt;

          if (frog.blinkTimer <= 0) {
            frog.isBlinking = true;
            frog.blinkProgress = 0;
            frog.blinkTimer = 2.5 + Math.random() * 3.5;
          }
          if (frog.isBlinking) {
            frog.blinkProgress += dt * 6.5;
            if (frog.blinkProgress >= 1.0) frog.isBlinking = false;
          }

          // Autonomous leisurely hop ONLY when NO flies are present
          if (frog.idleTimer <= 0 && !closestFly) {
            if (distToHero < 280) {
              frog.facing = dxToHero > 0 ? -1 : 1; // Always leap away from hero if nearby
            } else if (frog.x < width * 0.12) {
              frog.facing = 1;
            } else if (frog.x > width * 0.88) {
              frog.facing = -1;
            } else if (Math.random() < 0.42) {
              frog.facing = Math.random() > 0.5 ? 1 : -1;
            }

            frog.state = 'crouch';
            frog.crouchDuration = 0.12 + Math.random() * 0.08;
            frog.crouchTimer = 0;
          }
        }

        // --- C. TONGUE STRIKE STATE ---
        else if (frog.state === 'tongue_strike') {
          frog.y = frogGroundY;
          frog.vx = 0;
          frog.vy = 0;
        }

        // --- D. CROUCH STATE (Elastic potential accumulation) ---
        else if (frog.state === 'crouch') {
          frog.y = frogGroundY;
          frog.crouchTimer += dt;
          if (frog.crouchTimer >= frog.crouchDuration) {
            if (frog.isFleeJump) {
              // High-velocity athletic escape leap away from the hero!
              const isHeroVeryClose = Math.abs(dxToHero) < 65;
              const launchAngleDeg = isHeroVeryClose ? (60 + Math.random() * 10) : (46 + Math.random() * 8);
              const launchAngleRad = (launchAngleDeg * Math.PI) / 180;
              const jumpPower = 340 + Math.random() * 90;

              frog.vx = Math.cos(launchAngleRad) * jumpPower * (frog.fleeFacing || frog.facing);
              frog.vy = -Math.sin(launchAngleRad) * jumpPower;
              frog.state = 'jump';
              frog.isFleeJump = false;
              frog.fleeCooldown = 0.7; // Cooldown before next startled flee
            } else if (frog.isHuntingJump && frog.huntTargetFly) {
              // Targeted ballistic jump directly towards the distant fly's location!
              const targetX = frog.huntTargetFly.x;
              const dx = targetX - frog.x;
              frog.facing = dx >= 0 ? 1 : -1;

              // Calculate launch parameters
              const jumpDist = Math.min(480, Math.max(200, Math.abs(dx)));
              const launchAngleDeg = 48 + Math.random() * 8;
              const launchAngleRad = (launchAngleDeg * Math.PI) / 180;
              const jumpPower = Math.sqrt((jumpDist * 980) / Math.sin(2 * launchAngleRad)) * 0.95;

              frog.vx = Math.cos(launchAngleRad) * jumpPower * frog.facing;
              frog.vy = -Math.sin(launchAngleRad) * jumpPower;
              frog.state = 'jump';
              frog.isHuntingJump = false;
              frog.huntJumpCooldown = 0.3;
            } else {
              // Standard exploratory leap
              const jumpRoll = Math.random();
              let jumpPower = 270 + Math.random() * 110;
              let launchAngleDeg = 44 + Math.random() * 12;

              if (jumpRoll < 0.22) {
                jumpPower = 340 + Math.random() * 110;
                launchAngleDeg = 56 + Math.random() * 14;
              } else if (jumpRoll < 0.42) {
                jumpPower = 170 + Math.random() * 70;
                launchAngleDeg = 32 + Math.random() * 10;
              }

              const launchAngleRad = (launchAngleDeg * Math.PI) / 180;
              frog.vx = Math.cos(launchAngleRad) * jumpPower * frog.facing;
              frog.vy = -Math.sin(launchAngleRad) * jumpPower;
              frog.state = 'jump';
            }

            // Spawn takeoff dust motes
            for (let i = 0; i < 3; i++) {
              frog.impactMotes.push({
                x: frog.x + (Math.random() - 0.5) * 6,
                y: frogGroundY,
                vx: -frog.vx * 0.08 + (Math.random() - 0.5) * 16,
                vy: -12 - Math.random() * 20,
                alpha: 0.65,
                radius: 1.0 + Math.random() * 1.2,
              });
            }
          }
        }

        // --- E. JUMP STATE (Ballistic Flight, Gravity & Mid-Air Snatch) ---
        else if (frog.state === 'jump') {
          const gravity = 980; // px/s^2
          frog.vx *= (1 - 0.04 * dt); // air resistance
          frog.vy += gravity * dt;
          frog.x += frog.vx * dt;
          frog.y += frog.vy * dt;

          // Boundary bounce guard
          if (frog.x < 35) {
            frog.x = 35;
            frog.vx = Math.abs(frog.vx) * 0.5;
            frog.facing = 1;
          } else if (frog.x > width - 35) {
            frog.x = width - 35;
            frog.vx = -Math.abs(frog.vx) * 0.5;
            frog.facing = -1;
          }

          // Aerodynamic body pitch along velocity vector
          const flightAngle = Math.atan2(frog.vy, Math.abs(frog.vx));
          frog.bodyAngle = flightAngle * frog.facing;

          // Mid-air tongue snatch if fly is right next to the leaping frog (<= 65px)!
          if (closestFly && minDistToFly <= 65 && (!frog.tongue || !frog.tongue.active) && (!frog.tongue || !frog.tongue.caughtFly)) {
            frog.tongue = {
              active: true,
              targetX: closestFly.x,
              targetY: closestFly.y,
              flyId: closestFly.id,
              progress: 0,
              phase: 'extend',
              holdTimer: 0.07,
              caughtFly: false,
            };
          }

          // Ground collision
          if (frog.y >= frogGroundY && frog.vy > 0) {
            frog.y = frogGroundY;
            frog.landingCompression = Math.min(1.0, frog.vy / 360);
            frog.landingDuration = 0.15 + frog.landingCompression * 0.10;
            frog.landingTimer = 0;
            frog.vx = 0;
            frog.vy = 0;
            frog.bodyAngle = 0;
            frog.state = 'land';
            frog.jumpCount++;

            // Spawn landing dust motes
            for (let i = 0; i < 4; i++) {
              frog.impactMotes.push({
                x: frog.x + (Math.random() - 0.5) * 8,
                y: frogGroundY,
                vx: (Math.random() - 0.5) * 26,
                vy: -10 - Math.random() * 20,
                alpha: 0.7,
                radius: 1.1 + Math.random() * 1.4,
              });
            }
          }
        }

        // --- F. LAND STATE (Shock Absorption & Spring Rebound) ---
        else if (frog.state === 'land') {
          frog.y = frogGroundY;
          frog.landingTimer += dt;
          if (frog.landingTimer >= frog.landingDuration) {
            if (frog.jumpCount < frog.consecutiveJumpsTarget && !closestFly && Math.random() < 0.65) {
              // Consecutive hop in chain
              frog.state = 'crouch';
              frog.crouchDuration = 0.10;
              frog.crouchTimer = 0;
            } else {
              frog.jumpCount = 0;
              frog.consecutiveJumpsTarget = Math.random() < 0.32 ? 2 : 1;
              frog.state = 'idle';
              frog.idleTimer = closestFly ? 0.08 : 1.8 + Math.random() * 3.5;
            }
          }
        }

        // --- G. DRAW FROG & TONGUE ---
        const heightAboveGround = Math.max(0, frogGroundY - frog.y);
        const isAirborne = frog.state === 'jump';

        // 1. Dynamic Cast Ground Shadow
        const shadowAlpha = Math.max(0.06, 0.42 * (1 - Math.min(1, heightAboveGround / 200)));
        const shadowRx = (11 + heightAboveGround * 0.035) * frog.scale;
        const shadowRy = (3.6 + heightAboveGround * 0.015) * frog.scale;

        ctx.save();
        ctx.fillStyle = `rgba(26, 15, 10, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(frog.x, frogGroundY + 1, shadowRx, shadowRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Render Impact Motes
        for (let i = frog.impactMotes.length - 1; i >= 0; i--) {
          const mote = frog.impactMotes[i];
          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          mote.vy += 420 * dt;
          mote.alpha -= dt * 1.8;
          if (mote.alpha <= 0) {
            frog.impactMotes.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.fillStyle = `rgba(90, 56, 37, ${Math.max(0, mote.alpha)})`;
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 3. Render Ballistic Elastic Tongue (If active) - Refined Delicate Proportions
        if (frog.tongue && frog.tongue.active && frog.tongue.progress > 0.01) {
          const slope = getGroundSlope(frog.x, width, height);
          const rot = isAirborne ? frog.bodyAngle : slope;
          const cosR = Math.cos(rot);
          const sinR = Math.sin(rot);

          // Snout local mouth tip at (11 * facing * scale, -5 * scale)
          const lx = 11 * frog.facing * frog.scale;
          const ly = -5 * frog.scale;
          const snoutWorldX = frog.x + (lx * cosR - ly * sinR);
          const snoutWorldY = frog.y + (lx * sinR + ly * cosR);

          const tipX = snoutWorldX + (frog.tongue.targetX - snoutWorldX) * frog.tongue.progress;
          const tipY = snoutWorldY + (frog.tongue.targetY - snoutWorldY) * frog.tongue.progress;

          ctx.save();
          // Outer ink contour shadow (sleek & narrow)
          ctx.strokeStyle = '#450a0a';
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(snoutWorldX, snoutWorldY);
          const midX = (snoutWorldX + tipX) * 0.5;
          const whipArc = -6 * Math.sin(frog.tongue.progress * Math.PI);
          const midY = (snoutWorldY + tipY) * 0.5 + whipArc;
          ctx.quadraticCurveTo(midX, midY, tipX, tipY);
          ctx.stroke();

          // Main crimson red ink tongue
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(snoutWorldX, snoutWorldY);
          ctx.quadraticCurveTo(midX, midY, tipX, tipY);
          ctx.stroke();

          // Wet highlight spine
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(snoutWorldX, snoutWorldY);
          ctx.quadraticCurveTo(midX, midY - 0.3, tipX, tipY - 0.3);
          ctx.stroke();

          // Sticky tongue bulb tip with outer aura (scaled down)
          ctx.fillStyle = 'rgba(225, 29, 72, 0.45)';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tipX - 0.4, tipY - 0.4, 0.55, 0, Math.PI * 2);
          ctx.fill();

          // Caught fly adhering to tongue tip on retraction
          if (frog.tongue.caughtFly) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(tipX, tipY, 1.3, 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(80, 55, 38, 0.65)';
            ctx.beginPath();
            ctx.ellipse(tipX - 0.5, tipY - 0.9, 0.9, 0.4, -Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(tipX + 0.5, tipY - 0.9, 0.9, 0.4, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 4. Frog Body Transform & Deformation
        ctx.save();
        ctx.translate(frog.x, frog.y);

        if (!isAirborne) {
          const slope = getGroundSlope(frog.x, width, height);
          ctx.rotate(slope);
        } else {
          ctx.rotate(frog.bodyAngle);
        }

        ctx.scale(frog.facing * frog.scale, frog.scale);

        let squashY = 1.0;
        let stretchX = 1.0;

        if (frog.state === 'crouch') {
          const p = Math.min(1.0, frog.crouchTimer / frog.crouchDuration);
          squashY = 1.0 - p * 0.38;
          stretchX = 1.0 + p * 0.25;
        } else if (frog.state === 'land') {
          const p = Math.min(1.0, frog.landingTimer / frog.landingDuration);
          const impact = (1 - p) * frog.landingCompression;
          squashY = 1.0 - impact * 0.42;
          stretchX = 1.0 + impact * 0.30;
        } else if (frog.state === 'jump') {
          if (frog.vy < 0) {
            stretchX = 1.25;
            squashY = 0.82;
          } else {
            stretchX = 1.05;
            squashY = 0.95;
          }
        } else {
          const breath = Math.sin(frog.throatPhase) * 0.03;
          squashY = 1.0 + breath;
          stretchX = 1.0 - breath * 0.5;
        }

        ctx.scale(stretchX, squashY);

        // ── Back Hind Leg (Far Side) ──
        ctx.save();
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#24331d';

        if (frog.state === 'jump') {
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(-18, 2);
          ctx.lineTo(-27, 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-27, 4);
          ctx.lineTo(-33, 1);
          ctx.moveTo(-27, 4);
          ctx.lineTo(-34, 4);
          ctx.moveTo(-27, 4);
          ctx.lineTo(-33, 7);
          ctx.stroke();
        } else {
          const crouchOffset = frog.state === 'crouch' || frog.state === 'land' ? 2 : 0;
          ctx.beginPath();
          ctx.ellipse(-7, -4 + crouchOffset, 7, 4.5, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-11, 0 + crouchOffset);
          ctx.lineTo(-17, 0 + crouchOffset);
          ctx.stroke();
        }
        ctx.restore();

        // ── Gular Throat Sac (Breathing & Gulp Swallowing Pulse) ──
        const isGulping = frog.gulpTimer > 0;
        const gulpMult = isGulping ? 2.4 : 1.0;
        const pulse = (Math.sin(frog.throatPhase) * 2.2 + 2.0) * gulpMult;
        ctx.save();
        ctx.fillStyle = isGulping ? 'rgba(235, 195, 135, 0.95)' : 'rgba(215, 185, 120, 0.85)';
        ctx.strokeStyle = '#2b1b12';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(4.5, -1.0, 3.2 + pulse * 0.45, 2.0 + pulse * 0.65, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // ── Main Body Torso (Dorsum & Belly) ──
        ctx.save();
        ctx.fillStyle = '#344626';
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.quadraticCurveTo(5, -12, -4, -11);
        ctx.quadraticCurveTo(-11, -10, -12, -4);
        ctx.quadraticCurveTo(-11, 0, -5, 0);
        ctx.quadraticCurveTo(3, 0.5, 10, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Open mouth slit when tongue is active
        if (frog.tongue && frog.tongue.active) {
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#140b07';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(6, -6);
          ctx.lineTo(12, -7);
          ctx.lineTo(10, -2);
          ctx.lineTo(5, -2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Dorsal ink texture stippling
        ctx.fillStyle = '#140b07';
        ctx.beginPath();
        ctx.arc(-5, -8.5, 0.75, 0, Math.PI * 2);
        ctx.arc(-1, -8.0, 0.65, 0, Math.PI * 2);
        ctx.arc(-8, -6.5, 0.6, 0, Math.PI * 2);
        ctx.arc(2, -6.5, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Pale belly tone
        ctx.fillStyle = 'rgba(235, 218, 170, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, -1.5, 6.5, 2.2, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ── Front Foreleg / Arm ──
        ctx.save();
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (frog.state === 'jump') {
          ctx.beginPath();
          ctx.moveTo(4, -2);
          ctx.lineTo(10, 4);
          ctx.lineTo(14, 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(14, 6);
          ctx.lineTo(17, 5);
          ctx.moveTo(14, 6);
          ctx.lineTo(17, 7.5);
          ctx.moveTo(14, 6);
          ctx.lineTo(15.5, 9);
          ctx.stroke();
        } else {
          const armY = frog.state === 'crouch' || frog.state === 'land' ? 1.5 : 0;
          ctx.beginPath();
          ctx.moveTo(5, -3);
          ctx.lineTo(6.5, armY);
          ctx.lineTo(9.5, armY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(9.5, armY);
          ctx.lineTo(12, armY - 0.5);
          ctx.moveTo(9.5, armY);
          ctx.lineTo(12, armY + 1.0);
          ctx.stroke();
        }
        ctx.restore();

        // ── Near Hind Leg (Front Side) ──
        ctx.save();
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#3c522c';

        if (frog.state === 'jump') {
          ctx.beginPath();
          ctx.moveTo(-4, -3);
          ctx.lineTo(-16, 4);
          ctx.lineTo(-25, 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-25, 6);
          ctx.lineTo(-31, 2);
          ctx.moveTo(-25, 6);
          ctx.lineTo(-33, 5.5);
          ctx.moveTo(-25, 6);
          ctx.lineTo(-31, 9);
          ctx.stroke();
        } else {
          const crouchOffset = frog.state === 'crouch' || frog.state === 'land' ? 2 : 0;
          ctx.beginPath();
          ctx.ellipse(-5.5, -3.5 + crouchOffset, 6.8, 4.2, -0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-8, 0 + crouchOffset);
          ctx.lineTo(-15, 0.5 + crouchOffset);
          ctx.lineTo(-19, 0 + crouchOffset);
          ctx.stroke();
        }
        ctx.restore();

        // ── Periscope Eye & Orbital Dome (With Anatomical Swallow Eye-Sink) ──
        ctx.save();
        const eyeSinkY = isGulping ? 1.6 * Math.sin((frog.gulpTimer / 0.45) * Math.PI) : 0;
        const eyeX = 4.8;
        const eyeY = -9.2 + eyeSinkY;
        const eyeRadius = 3.4;

        // Eyeball Socket Arch
        ctx.fillStyle = '#344626';
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Luminous Amber Iris
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius * 0.78, 0, Math.PI * 2);
        ctx.fill();

        // Blink Scale
        const blinkScaleY = frog.isBlinking
          ? Math.max(0.05, 1 - Math.sin(frog.blinkProgress * Math.PI))
          : 1.0;

        // Horizontal Slit Pupil
        const pupilOffsetX = frog.lookAngle * 0.8;
        ctx.fillStyle = '#140b07';
        ctx.beginPath();
        ctx.ellipse(eyeX + pupilOffsetX, eyeY, 1.8, 0.8 * blinkScaleY, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Specular Glint
        if (blinkScaleY > 0.4) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX - 0.7, eyeY - 0.9, 0.65, 0, Math.PI * 2);
          ctx.fill();
        }

        // Upper Eyelid
        ctx.strokeStyle = '#140b07';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius * 0.88, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();

        ctx.restore();

        ctx.restore(); // Transform
      }



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
