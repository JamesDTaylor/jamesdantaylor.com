import React, { useEffect, useRef, useCallback } from 'react';
import { getParchmentGroundY } from '../utils/terrain';

/**
 * Limbo-Style Living Silhouette Character Engine & Wind-Swept Terrain
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
  const dustParticlesRef = useRef([]);
  const ambientSporesRef = useRef([]);
  const grassTuftsRef = useRef([]);
  const firefliesRef = useRef([]);

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

    // Props positions to avoid overlap
    const propZones = [
      { u: 0.22, halfWidth: 0.028 }, // Bench
      { u: 0.52, halfWidth: 0.022 }, // Milestone
      { u: 0.76, halfWidth: 0.026 }, // Street Lamp
    ];

    // Minimum non-overlapping clearance in normalized space (at least 34px)
    const minSpacing = Math.max(0.028, 34 / Math.max(800, width));

    const speciesPool = [
      'tall_reed',
      'wild_wheat',
      'fern_frond',
      'wild_dandelion',
      'clover_patch',
      'prairie_grass',
    ];

    const placedU = [];

    // Generate non-overlapping botanical tufts
    const candidateCount = 60;
    for (let c = 0; c < candidateCount; c++) {
      const candidateU = 0.04 + rng() * 0.92;

      // Check clearance from world props
      let hitsProp = false;
      for (const prop of propZones) {
        if (Math.abs(candidateU - prop.u) < prop.halfWidth + 0.012) {
          hitsProp = true;
          break;
        }
      }
      if (hitsProp) continue;

      // Check clearance from other plants (Zero overlap guarantee)
      let overlapsPlant = false;
      for (const u of placedU) {
        if (Math.abs(candidateU - u) < minSpacing) {
          overlapsPlant = true;
          break;
        }
      }
      if (overlapsPlant) continue;

      placedU.push(candidateU);

      const species = speciesPool[Math.floor(rng() * speciesPool.length)];
      const scale = 0.8 + rng() * 0.35;
      grass.push(createBotanicalTuft(candidateU, species, scale, rng() < 0.25, rng));
    }

    grass.sort((a, b) => a.u - b.u);
    grassTuftsRef.current = grass;

    const flies = [];
    for (let i = 0; i < 10; i++) {
      flies.push({
        x: rng() * width,
        y: height - 35 - rng() * 110,
        baseY: height - 35 - rng() * 110,
        vx: (rng() - 0.5) * 0.4,
        vy: (rng() - 0.5) * 0.3,
        seed: rng() * 1000,
        glowPhase: rng() * Math.PI * 2,
        radius: 1.2 + rng() * 0.8,
      });
    }
    firefliesRef.current = flies;

    const spores = [];
    for (let i = 0; i < 24; i++) {
      spores.push({
        x: rng() * width,
        y: height - 15 - rng() * 95,
        vx: 0.12 + rng() * 0.22,
        vy: -0.06 - rng() * 0.18,
        radius: 0.7 + rng() * 1.3,
        alpha: 0.12 + rng() * 0.28,
        seed: rng() * 1000,
      });
    }
    ambientSporesRef.current = spores;
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

      // 360° Omnidirectional Arm Reach Vector
      armReachProgress: 0,
      armReachVel: 0,
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

        armReachProgress: 0,
        armReachVel: 0,
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
    initCharacters(extraCreaturesCount);
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
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initWorldProps]);

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

          dustParticlesRef.current.push({
            x: char.x + (Math.random() - 0.5) * 8,
            y: char.y,
            vx: (Math.random() - 0.5) * 1.0,
            vy: -0.3 - Math.random() * 0.5,
            radius: 1.3,
            life: 0.7,
          });
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
      const dt = Math.min((now - lastTime) / 1000, 0.045);
      lastTime = now;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      mouseRef.current.activeTimer += dt;
      const mouse = mouseRef.current;

      // ----------------------------------------------------
      // 1. RENDER WORLD PROPS: AMBIENT WIND SPORES
      // ----------------------------------------------------
      ambientSporesRef.current.forEach((spore) => {
        const wind = getAmbientWind(now, spore.x);
        spore.x += spore.vx + wind * 0.65;
        spore.y += spore.vy + Math.sin(now * 0.001 + spore.seed) * 0.15;

        if (spore.y < height - 110) {
          spore.y = height - 12;
          spore.x = Math.random() * width;
        }
        if (spore.x < 0) spore.x = width;
        if (spore.x > width) spore.x = 0;

        ctx.beginPath();
        ctx.fillStyle = `rgba(43, 27, 18, ${spore.alpha * 0.45})`;
        ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------
      // 2. RENDER WORLD PROPS: ANTIQUE STREET LAMP (NO SHADOW)
      // ----------------------------------------------------
      const lampX = width * 0.76;
      const lampGroundY = getParchmentGroundY(lampX, width, height);
      const lampHeight = 85;
      const lampTopY = lampGroundY - lampHeight;

      const flicker = Math.sin(now * 0.008) * 3 + Math.sin(now * 0.021) * 1.5;
      const glowGrad = ctx.createRadialGradient(lampX, lampTopY + 14, 2, lampX, lampTopY + 14, 60 + flicker);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      glowGrad.addColorStop(0.35, 'rgba(217, 119, 6, 0.12)');
      glowGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lampX, lampTopY + 14, 60 + flicker, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(lampX - 5, lampGroundY);
      ctx.lineTo(lampX + 5, lampGroundY);
      ctx.moveTo(lampX, lampGroundY);
      ctx.lineTo(lampX, lampTopY + 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lampX, lampTopY + 22);
      ctx.quadraticCurveTo(lampX - 10, lampTopY + 14, lampX - 6, lampTopY + 4);
      ctx.quadraticCurveTo(lampX, lampTopY - 2, lampX + 6, lampTopY + 4);
      ctx.quadraticCurveTo(lampX + 10, lampTopY + 14, lampX, lampTopY + 22);
      ctx.stroke();

      ctx.fillStyle = '#1a0f0a';
      ctx.fillRect(lampX - 4.5, lampTopY + 5, 9, 2);
      ctx.fillRect(lampX - 3.5, lampTopY + 17, 7, 2);

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(lampX, lampTopY + 11 + Math.sin(now * 0.015) * 0.6, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // ----------------------------------------------------
      // 3. RENDER WORLD PROPS: BENCH & MILESTONE (NO SHADOW)
      // ----------------------------------------------------
      const benchX = width * 0.22;
      const benchGroundY = getParchmentGroundY(benchX, width, height);

      ctx.strokeStyle = '#1a0f0a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(benchX - 12, benchGroundY);
      ctx.lineTo(benchX - 11, benchGroundY - 10);
      ctx.moveTo(benchX + 12, benchGroundY);
      ctx.lineTo(benchX + 11, benchGroundY - 10);
      ctx.moveTo(benchX - 15, benchGroundY - 10);
      ctx.lineTo(benchX + 15, benchGroundY - 10);
      ctx.moveTo(benchX - 11, benchGroundY - 10);
      ctx.lineTo(benchX - 11, benchGroundY - 18);
      ctx.moveTo(benchX + 11, benchGroundY - 10);
      ctx.lineTo(benchX + 11, benchGroundY - 18);
      ctx.moveTo(benchX - 14, benchGroundY - 17);
      ctx.lineTo(benchX + 14, benchGroundY - 17);
      ctx.stroke();

      const stoneX = width * 0.52;
      const stoneGroundY = getParchmentGroundY(stoneX, width, height);

      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(stoneX - 7, stoneGroundY);
      ctx.quadraticCurveTo(stoneX - 8, stoneGroundY - 14, stoneX, stoneGroundY - 16);
      ctx.quadraticCurveTo(stoneX + 8, stoneGroundY - 14, stoneX + 7, stoneGroundY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(stoneX, stoneGroundY - 12);
      ctx.lineTo(stoneX, stoneGroundY - 5);
      ctx.moveTo(stoneX - 2.5, stoneGroundY - 9);
      ctx.lineTo(stoneX + 2.5, stoneGroundY - 9);
      ctx.stroke();

      // ----------------------------------------------------
      // 4. RENDER BACKGROUND BOTANICAL TUFTS
      // ----------------------------------------------------
      grassTuftsRef.current.filter((t) => t.isBackground).forEach((tuft) => {
        renderTuft(ctx, tuft, now, dt, width, height, mouse);
      });

      // ----------------------------------------------------
      // 5. RENDER GLOWING FIREFLIES
      // ----------------------------------------------------
      firefliesRef.current.forEach((fly) => {
        const wind = getAmbientWind(now, fly.x);
        fly.x += fly.vx + wind * 0.35 + Math.sin(now * 0.0015 + fly.seed) * 0.35;
        fly.y += fly.vy + Math.cos(now * 0.0018 + fly.seed) * 0.35;

        const distToLamp = Math.hypot(fly.x - lampX, fly.y - (lampTopY + 14));
        if (distToLamp < 180) {
          fly.vx += (lampX - fly.x) * 0.0003;
          fly.vy += (lampTopY + 14 - fly.y) * 0.0003;
        }

        if (fly.y < height - 140) fly.y = height - 30;
        if (fly.y > height - 10) fly.y = height - 100;
        if (fly.x < 0) fly.x = width;
        if (fly.x > width) fly.x = 0;

        const pulse = 0.4 + Math.sin(now * 0.005 + fly.glowPhase) * 0.35;

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(245, 158, 11, ${pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius * 3.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------
      // 6. RENDER DUST PUFFS
      // ----------------------------------------------------
      dustParticlesRef.current = dustParticlesRef.current.filter((p) => p.life > 0.02);
      dustParticlesRef.current.forEach((p) => {
        const wind = getAmbientWind(now, p.x);
        p.x += p.vx + wind * 0.5;
        p.y += p.vy;
        p.vy += dt * 0.8;
        p.life -= dt * 1.8;
        const currentLife = Math.max(0.01, p.life);
        const radius = Math.max(0.4, p.radius * currentLife);

        ctx.beginPath();
        ctx.fillStyle = `rgba(54, 34, 20, ${currentLife * 0.45})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------
      // 7. PROCESS CHARACTER PHYSICS & FULL-BODY HIGH REACH
      // ----------------------------------------------------
      charactersRef.current.forEach((char) => {
        const groundY = getParchmentGroundY(char.x + char.pushOffsetX, width, height);
        const groundSlope = getGroundSlope(char.x + char.pushOffsetX, width, height);
        char.y = groundY;

        // Shoulder world reference point
        const shoulderWorldX = char.x + char.pushOffsetX;
        const shoulderWorldY = char.y - 28;

        const toMouseX = mouse.x - shoulderWorldX;
        const toMouseY = mouse.y - shoulderWorldY;
        const distToMouse = Math.hypot(toMouseX, toMouseY);

        // Sensitive 3D vicinity detection
        const isCursorInVicinity = distToMouse < 280 && mouse.activeTimer < 4.2 && mouse.x > 0;

        // Locomotion & State Selection
        char.actionCooldown -= dt;
        char.idleTimer += dt;

        if (isCursorInVicinity) {
          char.targetX = char.x;
          char.vx += (-char.vx) * dt * 10.0;
          if (char.state === 'walk') char.state = 'idle';

          // Turn gently toward cursor when stationary near cursor
          if (Math.abs(mouse.x - shoulderWorldX) > 25) {
            char.facing = mouse.x >= shoulderWorldX ? 1 : -1;
          }
        } else {
          if (char.actionCooldown <= 0) {
            const r = Math.random();
            if (r < 0.50) {
              const paceRoll = Math.random();
              if (paceRoll < 0.35) {
                char.paceMode = 'stroll';
                char.walkSpeed = 38 + Math.random() * 10;
                char.strideLength = 5.8;
              } else if (paceRoll < 0.75) {
                char.paceMode = 'walk';
                char.walkSpeed = 58 + Math.random() * 12;
                char.strideLength = 8.0;
              } else {
                char.paceMode = 'trot';
                char.walkSpeed = 82 + Math.random() * 14;
                char.strideLength = 10.5;
              }

              const walkDelta = (Math.random() - 0.5) * 360;
              char.targetX = Math.max(80, Math.min(width - 80, char.x + walkDelta));
              char.idleTimer = 0;
              char.actionCooldown = 4.5 + Math.random() * 4.0;
            } else if (r < 0.65) {
              char.state = 'wave';
              char.behaviorTimer = 0;
              char.actionCooldown = 3.2;
            } else if (r < 0.78) {
              char.state = 'stretch';
              char.behaviorTimer = 0;
              char.actionCooldown = 3.2;
            } else if (r < 0.90) {
              char.state = 'ponder';
              char.headTiltTarget = (Math.random() > 0.5 ? 1 : -1) * 0.24;
              char.actionCooldown = 3.0 + Math.random() * 2.5;
            } else {
              char.state = 'crouch';
              char.actionCooldown = 2.8 + Math.random() * 2.0;
            }
          }

          const deltaTargetX = char.targetX - char.x;
          const absDist = Math.abs(deltaTargetX);

          if (absDist > 8 && char.state !== 'stretch' && char.state !== 'crouch' && char.state !== 'wave') {
            char.state = 'walk';
            const walkDir = Math.sign(deltaTargetX);
            char.facing = walkDir;

            const slopeFactor = 1 - Math.sin(groundSlope * walkDir) * 0.3;
            const targetSpeed = walkDir * char.walkSpeed * slopeFactor;
            char.vx += (targetSpeed - char.vx) * dt * 7.0;
            char.x += char.vx * dt;

            const prevCycle = char.walkCycle;
            char.walkCycle += dt * (char.walkSpeed / 7.2);

            if (Math.floor(prevCycle / Math.PI) !== Math.floor(char.walkCycle / Math.PI)) {
              char.hipImpactVel += char.paceMode === 'trot' ? 15.0 : 10.0;
              dustParticlesRef.current.push({
                x: char.x + char.pushOffsetX - char.facing * 5,
                y: groundY,
                vx: -char.facing * (0.25 + Math.random() * 0.35),
                vy: -0.15 - Math.random() * 0.2,
                radius: 1.2 + Math.random() * 0.6,
                life: 0.8,
              });
            }
          } else {
            char.vx += (-char.vx) * dt * 9.0;
            if (char.state === 'walk') {
              char.state = char.idleTimer > 12 ? 'sit' : 'idle';
            }
          }
        }

        // Anterior 3/4 Target Yaw (always facing front/viewer)
        if (char.state === 'wave') {
          char.targetYaw = Math.PI * 0.5;
        } else {
          char.targetYaw = char.facing === 1 ? 0.22 : (Math.PI - 0.22);
        }

        const yawDiff = char.targetYaw - char.yawAngle;
        char.yawAngle += yawDiff * dt * 2.2;
        char.yawAngle = Math.max(0.18, Math.min(Math.PI - 0.18, char.yawAngle));

        // Subtle physical push deflection
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

        // Full 360° Omnidirectional Reaching Vector
        let targetReach = 0;
        if (isCursorInVicinity && distToMouse > 10 && char.state !== 'wave') {
          const rawReach = 1 - Math.max(0, Math.min(1, (distToMouse - 10) / 250));
          targetReach = rawReach * rawReach * (3 - 2 * rawReach);

          const normDist = Math.max(1, distToMouse);
          char.reachDirX = toMouseX / normDist;
          char.reachDirY = toMouseY / normDist;
        }

        const reachSpringK = 16.0;
        const reachDamping = 6.0;
        const reachForce = (targetReach - char.armReachProgress) * reachSpringK - char.armReachVel * reachDamping;
        char.armReachVel += reachForce * dt;
        char.armReachProgress = Math.max(0, Math.min(1, char.armReachProgress + char.armReachVel * dt));

        // Saccadic Eye Micro-Movements & Dynamic Head Pitch
        char.saccadeTimer -= dt;
        if (char.saccadeTimer <= 0) {
          char.saccadeTimer = 1.5 + Math.random() * 2.8;
          char.saccadeX = (Math.random() - 0.5) * 0.4;
          char.saccadeY = (Math.random() - 0.5) * 0.3;
          char.headTiltTarget = (Math.random() - 0.5) * 0.12;
        }

        if (distToMouse > 1 && mouse.x > 0) {
          const rawGazeX = (toMouseX / distToMouse) + char.saccadeX;
          const rawGazeY = (toMouseY / distToMouse) + char.saccadeY;
          char.gazeX += (rawGazeX - char.gazeX) * dt * 6.5;
          char.gazeY += (rawGazeY - char.gazeY) * dt * 6.5;
          // Upward gaze tracking high overhead (head pitch up to -0.95 rad when cursor is high)
          const targetPitch = Math.max(-0.95, Math.min(0.45, (toMouseY / 140)));
          char.headPitch += (targetPitch - char.headPitch) * dt * 7.0;
        } else if (char.state === 'ponder') {
          char.gazeX += (0 - char.gazeX) * dt * 3.5;
          char.gazeY += (-0.8 - char.gazeY) * dt * 3.5;
          char.headPitch += (-0.65 - char.headPitch) * dt * 3.5;
        } else if (char.state === 'wave') {
          char.gazeX += (0 - char.gazeX) * dt * 4.0;
          char.gazeY += (0 - char.gazeY) * dt * 4.0;
          char.headPitch += (-0.1 - char.headPitch) * dt * 4.0;
        } else {
          char.gazeX += (char.facing + char.saccadeX - char.gazeX) * dt * 3.5;
          char.gazeY += (char.saccadeY - char.gazeY) * dt * 3.5;
          char.headPitch += (-char.headPitch) * dt * 3.5;
        }

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
        const targetCrouchBlend = (char.state === 'crouch') ? 1.0 : 0.0;

        char.walkBlend += (targetWalkBlend - char.walkBlend) * dt * 6.0;
        char.stretchBlend += (targetStretchBlend - char.stretchBlend) * dt * 4.5;
        char.waveBlend += (targetWaveBlend - char.waveBlend) * dt * 5.0;
        char.crouchBlend += (targetCrouchBlend - char.crouchBlend) * dt * 5.0;

        if (char.state === 'stretch') {
          char.behaviorTimer += dt;
          char.stretchProgress = Math.sin(Math.min(Math.PI, (char.behaviorTimer / 2.8) * Math.PI));
          if (char.behaviorTimer > 2.8) {
            char.state = 'idle';
          }
        } else {
          char.stretchProgress *= 0.9;
        }

        if (char.state === 'wave') {
          char.behaviorTimer += dt;
          if (char.behaviorTimer > 2.6) {
            char.state = 'idle';
          }
        }

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
        // H. RENDER CHARACTER WITH FULL-BODY HIGH REACH
        // ----------------------------------------------------
        ctx.save();
        const renderX = char.x + char.pushOffsetX;
        const renderY = char.y + char.pushOffsetY;

        ctx.translate(renderX, renderY);
        ctx.scale(char.scale, char.scale);

        const theta = char.yawAngle;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const isSitting = char.state === 'sit';
        const breathBob = breathCurve * 0.6;
        const walkBob = Math.abs(Math.sin(char.walkCycle)) * (char.paceMode === 'trot' ? 2.4 : 1.8) * char.walkBlend;
        const crouchBob = char.crouchBlend * -4;
        const totalBodyBob = crouchBob - (walkBob + breathBob) + char.hipImpactSpring * 0.18;

        const hipBaseY = -17 + totalBodyBob;

        // 3D Joints Rotation
        const hipLx = -2.2 * cosT;
        const hipLz = 2.2 * sinT;
        const hipRx = 2.2 * cosT;
        const hipRz = -2.2 * sinT;

        const legStrideL = Math.sin(char.walkCycle) * char.strideLength * char.walkBlend;
        const legStrideR = -Math.sin(char.walkCycle) * char.strideLength * char.walkBlend;
        const legLiftL = Math.max(0, -Math.cos(char.walkCycle) * 3.0) * char.walkBlend;
        const legLiftR = Math.max(0, Math.cos(char.walkCycle) * 3.0) * char.walkBlend;

        const footLx = hipLx + legStrideL * cosT;
        const footLy = isSitting ? -2.5 : -legLiftL;
        const footRx = hipRx + legStrideR * cosT;
        const footRy = isSitting ? -2.5 : -legLiftR;

        const accelLean = (char.vx / (char.walkSpeed || 60)) * (char.paceMode === 'trot' ? 0.12 : 0.07);
        const stretchLean = -char.stretchBlend * char.stretchProgress * 0.22;
        // Lean naturally in reach direction
        const cursorLean = char.armReachProgress * (char.reachDirX || 0) * 0.18;
        const dynamicLeanAngle = char.bodyLean + stretchLean + cursorLean + (char.walkBlend * accelLean);

        const drawLegLFirst = hipLz < hipRz;

        const drawLeg = (hx, hy, fx, fy) => {
          ctx.strokeStyle = '#1a0f0a';
          ctx.lineWidth = 2.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(fx, fy);
          ctx.stroke();
        };

        if (drawLegLFirst) {
          drawLeg(hipLx, hipBaseY, footLx, footLy);
        } else {
          drawLeg(hipRx, hipBaseY, footRx, footRy);
        }

        ctx.save();
        ctx.translate(0, hipBaseY);
        ctx.rotate(dynamicLeanAngle);

        const pelvisW = 6.0 * Math.abs(sinT) + 4.5 * Math.abs(cosT);
        ctx.fillStyle = '#1a0f0a';
        ctx.beginPath();
        ctx.ellipse(0, 2, pelvisW * 0.65, 4.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // High reach upward spine extension
        const isReachingHigh = (char.reachDirY < -0.25) ? Math.abs(char.reachDirY) * char.armReachProgress : 0;
        const spineStretch = isReachingHigh * 3.5;

        const chestExpand = (breathCurve * 0.35) + (char.stretchProgress * 0.6);
        const chestHalfW = 4.2 * Math.abs(sinT) + 3.2 * Math.abs(cosT) + chestExpand * 0.5;
        const waistHalfW = 5.2 * Math.abs(sinT) + 4.0 * Math.abs(cosT) + chestExpand * 0.5;

        ctx.beginPath();
        ctx.moveTo(-waistHalfW, 2);
        ctx.quadraticCurveTo(-waistHalfW - 1.0, -9 - spineStretch * 0.5, -chestHalfW, -16 - spineStretch);
        ctx.lineTo(chestHalfW, -16 - spineStretch);
        ctx.quadraticCurveTo(waistHalfW + 1.0, -9 - spineStretch * 0.5, waistHalfW, 2);
        ctx.closePath();
        ctx.fill();

        // ----------------------------------------------------
        // FULL OVERHEAD HIGH REACH & ARM KINEMATICS
        // ----------------------------------------------------
        const shoulderY = -14 - spineStretch;
        const armWalkSwing = Math.sin(char.walkCycle) * (char.paceMode === 'trot' ? 5.5 : 3.5) * char.walkBlend;

        const shLx = -3.5 * cosT;
        const shRx = 3.5 * cosT;

        // Reach direction and high overhead arm length
        const reachDirX = char.reachDirX || (cosT >= 0 ? 1 : -1);
        const reachDirY = char.reachDirY || 0;
        const fullReachLength = 17.5; // Full human anatomical reach extension

        const updateAndDrawArm = (armJoint, shX, isRightArm) => {
          const armDir = isRightArm ? 1 : -1;
          const isReachingArm = (isRightArm && reachDirX >= 0) || (!isRightArm && reachDirX < 0);

          // Shoulder shrug elevation when reaching high
          const shoulderShrug = (isReachingArm && reachDirY < -0.2) ? Math.abs(reachDirY) * 3.2 * char.armReachProgress : 0;
          const currentShY = shoulderY - shoulderShrug;

          // 1. Walk Pose
          const swing = armWalkSwing * armDir * cosT;
          const walkElbowX = shX + (armDir * 1.3 + swing * 0.3);
          const walkElbowY = currentShY + 5.5;
          const walkHandX = shX + swing;
          const walkHandY = currentShY + 10.5;

          // 2. Stretch Pose
          const stretchElbowX = shX + armDir * 2.5;
          const stretchElbowY = currentShY - 6.0 * char.stretchProgress;
          const stretchHandX = shX + armDir * 3.5;
          const stretchHandY = currentShY - 11.0 * char.stretchProgress;

          // 3. Wave Pose
          const waveElbowX = shX + 3.0;
          const waveElbowY = currentShY - 3.5;
          const waveHandX = shX + Math.sin(now * 0.014) * 3.5;
          const waveHandY = currentShY - 9.0;

          // 4. Full 360° Omnidirectional Reach Pose (Reaches high overhead, diagonal, down)
          const curReachLen = fullReachLength * char.armReachProgress;
          const reachHandX = shX + reachDirX * curReachLen;
          const reachHandY = currentShY + reachDirY * curReachLen;
          
          // Elbow bend with natural straightening when fully extended
          const elbowBendMag = (1 - char.armReachProgress * 0.6) * 2.4;
          const reachElbowX = shX + reachDirX * (curReachLen * 0.52) - reachDirY * elbowBendMag * armDir;
          const reachElbowY = currentShY + reachDirY * (curReachLen * 0.52) + reachDirX * elbowBendMag * armDir;

          // Weighted continuous blending across all states
          const wStretch = char.stretchBlend;
          const wWave = isReachingArm ? char.waveBlend : 0;
          const wReach = (isReachingArm && char.armReachProgress > 0.05) ? char.armReachProgress : 0;
          const wWalk = Math.max(0, 1 - (wStretch + wWave + wReach));

          const targetElbowX = walkElbowX * wWalk + stretchElbowX * wStretch + waveElbowX * wWave + reachElbowX * wReach;
          const targetElbowY = walkElbowY * wWalk + stretchElbowY * wStretch + waveElbowY * wWave + reachElbowY * wReach;
          const targetHandX = walkHandX * wWalk + stretchHandX * wStretch + waveHandX * wWave + reachHandX * wReach;
          const targetHandY = walkHandY * wWalk + stretchHandY * wStretch + waveHandY * wWave + reachHandY * wReach;

          // Smooth low-pass filter
          armJoint.elbowX += (targetElbowX - armJoint.elbowX) * dt * 14.0;
          armJoint.elbowY += (targetElbowY - armJoint.elbowY) * dt * 14.0;
          armJoint.handX += (targetHandX - armJoint.handX) * dt * 14.0;
          armJoint.handY += (targetHandY - armJoint.handY) * dt * 14.0;

          ctx.lineWidth = 2.2;
          ctx.strokeStyle = '#1a0f0a';
          ctx.beginPath();
          ctx.moveTo(shX, currentShY);
          ctx.quadraticCurveTo(armJoint.elbowX, armJoint.elbowY, armJoint.handX, armJoint.handY);
          ctx.stroke();

          if (wWave > 0.3) {
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.ellipse(armJoint.handX, armJoint.handY, 1.4, 1.8, Math.sin(now * 0.014) * 0.3, 0, Math.PI * 2);
            ctx.fill();
          } else if (wReach > 0.2) {
            // Expressive outstretched fingertip pointing to cursor
            ctx.fillStyle = '#1a0f0a';
            ctx.beginPath();
            ctx.arc(armJoint.handX + reachDirX * 1.5, armJoint.handY + reachDirY * 1.5, 1.15, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        updateAndDrawArm(char.armL, shLx, false);
        updateAndDrawArm(char.armR, shRx, true);

        const neckY = -17 - spineStretch;
        const stretchHeadTilt = -char.stretchBlend * char.stretchProgress * 0.25;
        const headRotation = (char.headPitch * 0.75) + char.headLag + char.headTilt + stretchHeadTilt;

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

        const eye1x = R * Math.cos(eyeAngle1) + char.gazeX * 1.2;
        const eye1z = R * Math.sin(eyeAngle1);
        const eye2x = R * Math.cos(eyeAngle2) + char.gazeX * 1.2;
        const eye2z = R * Math.sin(eyeAngle2);

        const eyeY = -6.5 + char.gazeY * 1.0;
        const eyeScaleY = char.isBlinking ? Math.max(0.08, 1 - Math.sin(char.blinkProgress * Math.PI)) : 1.0;

        const drawEye3D = (ex, ey, ez) => {
          if (ez < -1.5) return;
          const depthAlpha = Math.max(0.1, Math.min(1.0, (ez + 2.0) / 4.0));
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
        ctx.restore(); // Torso

        if (drawLegLFirst) {
          drawLeg(hipRx, hipBaseY, footRx, footRy);
        } else {
          drawLeg(hipLx, hipBaseY, footLx, footLy);
        }

        ctx.restore();
      });

      // ----------------------------------------------------
      // 8. RENDER FOREGROUND BOTANICAL TUFTS (CURVE CONFORMING)
      // ----------------------------------------------------
      grassTuftsRef.current.filter((t) => !t.isBackground).forEach((tuft) => {
        renderTuft(ctx, tuft, now, dt, width, height, mouse);
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
        zIndex: 10,
      }}
    />
  );
}
