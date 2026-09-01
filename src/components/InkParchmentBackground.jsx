import React, { useEffect, useRef } from 'react';
import { getParchmentGroundY } from '../utils/terrain';

/**
 * Storybook Aged Parchment Background & Nocturne Celestial Engine
 * 
 * Features:
 * 1. Seamless Day/Night Celestial Transition with "Falling Elements" Physics
 * 2. Day Sun descending below horizon / Luminous Inked Crescent Moon rising with lunar aura
 * 3. Day avian flock tumbling down with fluttering feathers on nightfall / ascending on daybreak
 * 4. Twinkling Midnight Constellations, Star Clusters & Shooting Star Streaks
 * 5. Horizontal Cruising Airliner with Night Aviation Strobes
 * 6. Multi-Layer Architectural City Skyline with Stained Glass & Luminous Clock Tower
 * 7. Drifting Midnight Ground Mist & Calligraphy Ink Bleed Ripples
 */

function createSeededRng(seed = 94821) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Helper to interpolate between two hex or rgba color components
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function InkParchmentBackground({ isDark = false }) {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return;
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 75,
        alpha: 0.4,
      });
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic Theme Blend State (0 = Pure Day, 1 = Pure Night)
    let themeBlend = isDarkRef.current ? 1.0 : 0.0;
    let prevIsDark = isDarkRef.current;

    // Falling / Rising Dynamics Arrays
    let fallingBirds = [];
    let fallingFeathers = [];
    let shootingStars = [];
    let lastShootingStarTime = 0;
    let groundMist = [];

    // ============================================================
    // 1. PROCEDURAL STARS & CONSTELLATIONS GENERATOR
    // ============================================================
    const generateStars = (w, h) => {
      const rng = createSeededRng(41982);
      const stars = [];
      const count = 75;
      for (let i = 0; i < count; i++) {
        const colorType = rng();
        stars.push({
          x: rng() * w,
          y: rng() * (h * 0.52),
          radius: 0.6 + rng() * 1.4,
          omega: 0.0015 + rng() * 0.0035,
          phase: rng() * Math.PI * 2,
          isMajor: rng() < 0.22,
          hue: colorType < 0.6 ? 'gold' : colorType < 0.85 ? 'cyan' : 'white',
        });
      }
      return stars;
    };

    // ============================================================
    // 2. MATHEMATICAL BOIDS FLOCKING ENGINE (Side Profile Physics)
    // ============================================================
    const initBirdFlock = (w, h) => {
      const rng = createSeededRng(67231);
      const count = 14;
      const birds = [];
      const startX = w * 0.15;
      const startY = h * 0.22;

      for (let i = 0; i < count; i++) {
        birds.push({
          x: startX + (rng() - 0.5) * 120,
          y: startY + (rng() - 0.5) * 80,
          vx: 1.4 + rng() * 0.8,
          vy: (rng() - 0.5) * 0.35,
          maxSpeed: 2.2 + rng() * 0.5,
          minSpeed: 1.1,
          maxForce: 0.045,
          scale: 0.75 + rng() * 0.35,
          wingSpan: 10 + rng() * 4,
          flapPhase: rng() * Math.PI * 2,
          flapFreq: 0.13 + rng() * 0.04,
          isGliding: false,
          glideTimer: 60 + rng() * 120,
          glideDuration: 80 + rng() * 100,
        });
      }
      return birds;
    };

    // ============================================================
    // 3. HORIZONTAL AIRLINER MODEL (Side Profile Elevation View)
    // ============================================================
    const initAeroplane = (w, h) => {
      return {
        active: true,
        respawnCooldown: 0,
        x: -140,
        y: h * 0.14,
        vx: 1.30,
        vy: 0.0,
        scale: 0.75,
        pitch: 0.0,
        contrailParticles: [],
      };
    };

    // ============================================================
    // 4. MULTI-LAYER ARCHITECTURAL CITY SKYLINE
    // ============================================================
    const generateCitySkyline = (w, h) => {
      const rng = createSeededRng(88421);
      
      const farBuildings = [];
      let farX = -30;
      while (farX < w + 60) {
        const bWidth = 38 + rng() * 65;
        const bHeight = 85 + rng() * 140;
        const groundBaseline = getParchmentGroundY(farX + bWidth * 0.5, w, h);
        
        const typeChoice = rng();
        let bType = 'block';
        if (typeChoice < 0.22) bType = 'spire';
        else if (typeChoice < 0.42) bType = 'dome';
        else if (typeChoice < 0.62) bType = 'stepped';
        else if (typeChoice < 0.78) bType = 'bridge';

        farBuildings.push({
          x: farX,
          width: bWidth,
          height: bHeight,
          type: bType,
          groundBaseline,
          finialHeight: 14 + rng() * 25,
        });

        farX += bWidth - (6 + rng() * 12);
      }

      const midBuildings = [];
      let midX = -20;
      while (midX < w + 50) {
        const bWidth = 32 + rng() * 54;
        const bHeight = 55 + rng() * 95;
        const groundBaseline = getParchmentGroundY(midX + bWidth * 0.5, w, h);

        const typeChoice = rng();
        let bType = 'pitched';
        if (typeChoice < 0.24) bType = 'gothic_spire';
        else if (typeChoice < 0.48) bType = 'mansard';
        else if (typeChoice < 0.72) bType = 'stepped_terrace';

        const windows = [];
        const rows = 2 + Math.floor(rng() * 4);
        const cols = 2 + Math.floor(rng() * 3);
        const winMarginX = bWidth * 0.18;
        const winMarginY = 16;
        const availW = bWidth - winMarginX * 2;
        const availH = bHeight - winMarginY * 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (rng() > 0.35) {
              const wx = midX + winMarginX + (c / (cols - 1 || 1)) * (availW - 4);
              const wy = groundBaseline - bHeight + winMarginY + (r / (rows - 1 || 1)) * (availH - 6);
              windows.push({
                x: wx,
                y: wy,
                w: 2.8 + rng() * 1.8,
                h: 4.2 + rng() * 2.4,
                isArched: rng() > 0.4,
                baseAlpha: 0.35 + rng() * 0.45,
                twinkleSpeed: 0.002 + rng() * 0.005,
                twinklePhase: rng() * Math.PI * 2,
              });
            }
          }
        }

        midBuildings.push({
          x: midX,
          width: bWidth,
          height: bHeight,
          type: bType,
          groundBaseline,
          hasClock: false,
          clockRadius: 7.5,
          roofHeight: 12 + rng() * 22,
          windows,
          spireHeight: 18 + rng() * 26,
        });

        midX += bWidth - (4 + rng() * 10);
      }

      if (midBuildings.length > 0) {
        const centerX = w * 0.5;
        let closestIdx = 0;
        let minDiff = Infinity;
        midBuildings.forEach((b, idx) => {
          const bMid = b.x + b.width * 0.5;
          const diff = Math.abs(bMid - centerX);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        const centralTower = midBuildings[closestIdx];
        centralTower.hasClock = true;
        centralTower.type = 'clock_tower';
        centralTower.width = Math.max(40, centralTower.width);
        centralTower.height = Math.max(95, centralTower.height);
        centralTower.spireHeight = 28;
        centralTower.clockRadius = 8.0;
      }

      return { farBuildings, midBuildings };
    };

    // Initialize Mist
    for (let i = 0; i < 24; i++) {
      groundMist.push({
        x: Math.random() * width,
        y: height * 0.75 + Math.random() * (height * 0.2),
        vx: 0.15 + Math.random() * 0.25,
        radius: 35 + Math.random() * 45,
        alpha: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let stars = generateStars(width, height);
    let skyline = generateCitySkyline(width, height);
    let flock = initBirdFlock(width, height);
    let plane = initAeroplane(width, height);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
      stars = generateStars(width, height);
      skyline = generateCitySkyline(width, height);
    };
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Handle Theme Transition & Falling Elements trigger
      const currentDark = isDarkRef.current;
      if (currentDark !== prevIsDark) {
        if (currentDark) {
          // DAY -> NIGHT: Trigger Falling Flock & Sun Descent
          if (flock.length > 0) {
            flock.forEach((b) => {
              fallingBirds.push({
                x: b.x,
                y: b.y,
                vx: b.vx * 0.4,
                vy: 50 + Math.random() * 60,
                fallSpin: (Math.random() - 0.5) * 5.5,
                fallAngle: 0,
                scale: b.scale,
              });

              // Shed falling feathers
              for (let f = 0; f < 3; f++) {
                fallingFeathers.push({
                  x: b.x + (Math.random() - 0.5) * 16,
                  y: b.y + (Math.random() - 0.5) * 10,
                  vx: (Math.random() - 0.5) * 20,
                  vy: 20 + Math.random() * 40,
                  rot: Math.random() * Math.PI * 2,
                  rotVel: (Math.random() - 0.5) * 3,
                  alpha: 0.8,
                  len: 3 + Math.random() * 3,
                });
              }
            });
            flock = [];
          }
        } else {
          // NIGHT -> DAY: Flock ascends back into sky
          flock = initBirdFlock(width, height);
          flock.forEach((b) => {
            b.y += 120; // Ascend from horizon
            b.vy = -0.8 - Math.random() * 0.6;
          });
        }
        prevIsDark = currentDark;
      }

      // Smooth Theme Blend Interpolation
      const targetBlend = currentDark ? 1.0 : 0.0;
      themeBlend += (targetBlend - themeBlend) * Math.min(1.0, dt * 2.4);

      // ============================================================
      // 1. DYNAMIC PARCHMENT BACKGROUND (Daybreak Tea Wash vs Midnight Nocturne)
      // ============================================================
      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const vignetteRadius = Math.max(width, height) * 0.78;

      // Day palette: #faf6eb -> #f2e7cd -> #e4d0aa -> #c5ab7d
      // Night palette: #131422 -> #0c0d16 -> #07080f -> #030407
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, vignetteRadius);
      
      const r0 = Math.round(lerp(250, 19, themeBlend));
      const g0 = Math.round(lerp(246, 20, themeBlend));
      const b0 = Math.round(lerp(235, 34, themeBlend));

      const r1 = Math.round(lerp(242, 12, themeBlend));
      const g1 = Math.round(lerp(231, 13, themeBlend));
      const b1 = Math.round(lerp(205, 22, themeBlend));

      const r2 = Math.round(lerp(228, 7, themeBlend));
      const g2 = Math.round(lerp(208, 8, themeBlend));
      const b2 = Math.round(lerp(170, 15, themeBlend));

      const r3 = Math.round(lerp(197, 3, themeBlend));
      const g3 = Math.round(lerp(171, 4, themeBlend));
      const b3 = Math.round(lerp(125, 7, themeBlend));

      bgGrad.addColorStop(0, `rgb(${r0}, ${g0}, ${b0})`);
      bgGrad.addColorStop(0.42, `rgb(${r1}, ${g1}, ${b1})`);
      bgGrad.addColorStop(0.72, `rgb(${r2}, ${g2}, ${b2})`);
      bgGrad.addColorStop(1, `rgb(${r3}, ${g3}, ${b3})`);
      
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ============================================================
      // 2. CELESTIAL BODIES (Falling Day Sun vs Rising Nocturne Moon)
      // ============================================================
      ctx.save();

      // ─── 2A. Day Sun with Orbital Fall Physics ───
      const sunBaseX = width * 0.80;
      const sunBaseY = height * 0.18;
      const sunY = sunBaseY + (themeBlend * height * 0.85); // Drops into horizon on nightfall
      const sunX = sunBaseX + (themeBlend * 45);
      const sunRad = Math.min(width, height) * 0.036;

      if (themeBlend < 0.98) {
        const sunAlpha = 1 - themeBlend;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRad * 0.3, sunX, sunY, sunRad * 2.8);
        sunGlow.addColorStop(0, `rgba(254, 240, 138, ${0.45 * sunAlpha})`);
        sunGlow.addColorStop(0.45, `rgba(245, 158, 11, ${0.14 * sunAlpha})`);
        sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRad * 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(217, 119, 6, ${sunAlpha})`;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, ${sunAlpha})`;
        ctx.beginPath();
        ctx.arc(sunX - sunRad * 0.42, sunY - sunRad * 0.18, sunRad * 0.94, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── 2B. Luminous Inked Crescent Moon (Rises in Nocturne) ───
      if (themeBlend > 0.02) {
        const moonAlpha = themeBlend;
        const moonBaseX = width * 0.20;
        const moonTargetY = height * 0.16;
        const moonY = moonTargetY + (1 - themeBlend) * (height * 0.45); // Rises gracefully as night falls
        const moonRad = Math.min(width, height) * 0.034;

        // Radiant Lunar Halo
        const moonHalo = ctx.createRadialGradient(moonBaseX, moonY, moonRad * 0.2, moonBaseX, moonY, moonRad * 3.2);
        moonHalo.addColorStop(0, `rgba(224, 242, 254, ${0.48 * moonAlpha})`);
        moonHalo.addColorStop(0.4, `rgba(254, 240, 138, ${0.22 * moonAlpha})`);
        moonHalo.addColorStop(0.7, `rgba(56, 189, 248, ${0.08 * moonAlpha})`);
        moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(moonBaseX, moonY, moonRad * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Luminous Silver-Gold Crescent Body
        ctx.fillStyle = `rgba(254, 240, 138, ${0.95 * moonAlpha})`;
        ctx.beginPath();
        ctx.arc(moonBaseX, moonY, moonRad, 0, Math.PI * 2);
        ctx.fill();

        // Organic Cutout for Elegant Crescent Arch
        ctx.fillStyle = `rgba(${r0}, ${g0}, ${b0}, ${moonAlpha})`;
        ctx.beginPath();
        ctx.arc(moonBaseX + moonRad * 0.42, moonY - moonRad * 0.22, moonRad * 0.88, 0, Math.PI * 2);
        ctx.fill();

        // Stippled Inked Moon Craters
        ctx.fillStyle = `rgba(180, 140, 80, ${0.35 * moonAlpha})`;
        ctx.beginPath();
        ctx.arc(moonBaseX - moonRad * 0.35, moonY + moonRad * 0.22, 1.4, 0, Math.PI * 2);
        ctx.arc(moonBaseX - moonRad * 0.15, moonY - moonRad * 0.45, 1.1, 0, Math.PI * 2);
        ctx.arc(moonBaseX - moonRad * 0.48, moonY - moonRad * 0.12, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── 2C. Twinkling Stars & Constellations ───
      stars.forEach((star) => {
        const twinkle = 0.35 + Math.sin(now * star.omega + star.phase) * 0.45;
        const dayAlpha = Math.max(0.04, twinkle * 0.2);
        const nightAlpha = Math.max(0.2, twinkle * 0.95);
        const finalAlpha = lerp(dayAlpha, nightAlpha, themeBlend);

        if (star.hue === 'cyan' && themeBlend > 0.4) {
          ctx.fillStyle = `rgba(56, 189, 248, ${finalAlpha})`;
        } else if (star.hue === 'white' && themeBlend > 0.4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        } else {
          const starR = Math.round(lerp(90, 254, themeBlend));
          const starG = Math.round(lerp(56, 240, themeBlend));
          const starB = Math.round(lerp(37, 138, themeBlend));
          ctx.fillStyle = `rgba(${starR}, ${starG}, ${starB}, ${finalAlpha})`;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * (1 + themeBlend * 0.3), 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 2D. Shooting Stars / Meteor Streaks in Nocturne ───
      if (themeBlend > 0.6) {
        if (now - lastShootingStarTime > 3200 + Math.random() * 2500) {
          lastShootingStarTime = now;
          shootingStars.push({
            x: width * (0.2 + Math.random() * 0.6),
            y: height * (0.05 + Math.random() * 0.22),
            vx: 320 + Math.random() * 120,
            vy: 160 + Math.random() * 80,
            len: 55 + Math.random() * 45,
            alpha: 1.0,
          });
        }
      }

      for (let sIdx = shootingStars.length - 1; sIdx >= 0; sIdx--) {
        const ss = shootingStars[sIdx];
        ss.x += ss.vx * dt;
        ss.y += ss.vy * dt;
        ss.alpha -= dt * 1.6;

        if (ss.alpha <= 0.02 || ss.x > width + 50 || ss.y > height) {
          shootingStars.splice(sIdx, 1);
          continue;
        }

        const angle = Math.atan2(ss.vy, ss.vx);
        const tailX = ss.x - Math.cos(angle) * ss.len;
        const tailY = ss.y - Math.sin(angle) * ss.len;

        const starGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        starGrad.addColorStop(0.35, `rgba(56, 189, 248, ${ss.alpha * 0.8})`);
        starGrad.addColorStop(0.8, `rgba(254, 240, 138, ${ss.alpha * 0.3})`);
        starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ============================================================
      // 3. HORIZONTAL AIRLINER IN TRUE SIDE PROFILE
      // ============================================================
      if (plane.active) {
        plane.x += plane.vx;
        plane.y += plane.vy;
        plane.pitch = Math.sin(now * 0.0014) * 0.005;

        if (Math.random() < 0.85) {
          const exhaustX = plane.x - 10 * plane.scale;
          const exhaustY = plane.y + 4.5 * plane.scale;

          plane.contrailParticles.push({
            x: exhaustX,
            y: exhaustY,
            vx: -0.65,
            vy: 0.0,
            radius: 1.1,
            maxRadius: 4.2,
            alpha: 0.26,
          });
        }

        ctx.save();
        for (let i = plane.contrailParticles.length - 1; i >= 0; i--) {
          const cp = plane.contrailParticles[i];
          cp.x += cp.vx;
          cp.radius += 0.028;
          cp.alpha *= 0.982;

          if (cp.alpha <= 0.01 || cp.radius >= cp.maxRadius) {
            plane.contrailParticles.splice(i, 1);
            continue;
          }

          const cR = Math.round(lerp(135, 75, themeBlend));
          const cG = Math.round(lerp(90, 85, themeBlend));
          const cB = Math.round(lerp(60, 120, themeBlend));
          ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${cp.alpha * (1 - themeBlend * 0.4)})`;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(plane.x, plane.y);
        ctx.rotate(plane.pitch);
        ctx.scale(plane.scale, plane.scale);

        ctx.fillStyle = themeBlend > 0.5 ? '#161824' : '#261208';
        ctx.strokeStyle = themeBlend > 0.5 ? '#0c0d14' : '#140904';
        ctx.lineWidth = 1.1;

        // Fuselage
        ctx.beginPath();
        ctx.moveTo(24, 0.5);
        ctx.quadraticCurveTo(20, -3.2, 14, -3.2);
        ctx.lineTo(-17, -3.2);
        ctx.lineTo(-27, -15.5);
        ctx.lineTo(-29, -15.5);
        ctx.lineTo(-26, -1.0);
        ctx.lineTo(-30, 0.8);
        ctx.lineTo(-26, 2.2);
        ctx.lineTo(-14, 3.2);
        ctx.quadraticCurveTo(14, 3.2, 24, 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horizontal Stabilizer
        ctx.fillStyle = themeBlend > 0.5 ? '#12131d' : '#1e0e06';
        ctx.beginPath();
        ctx.moveTo(-22, 0.0);
        ctx.lineTo(-28, -2.5);
        ctx.lineTo(-29.5, -2.5);
        ctx.lineTo(-25, 0.5);
        ctx.closePath();
        ctx.fill();

        // Swept Wing
        ctx.fillStyle = themeBlend > 0.5 ? '#0e0f17' : '#1a0b04';
        ctx.beginPath();
        ctx.moveTo(6, 1.2);
        ctx.lineTo(-8, 5.8);
        ctx.lineTo(-12, 5.8);
        ctx.lineTo(-3, 1.8);
        ctx.closePath();
        ctx.fill();

        // Turbine
        ctx.fillStyle = themeBlend > 0.5 ? '#1f2233' : '#3a1f10';
        ctx.beginPath();
        ctx.roundRect(-4, 3.2, 10, 4.2, 2);
        ctx.fill();
        ctx.stroke();

        // Windows
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(17, -2.2, 2.4, 1.4);
        for (let wIdx = 0; wIdx < 7; wIdx++) {
          ctx.fillRect(11 - wIdx * 3.6, -1.8, 1.6, 1.3);
        }

        // Aviation Strobes
        const strobeCycle = (Math.floor(now) % 1300);
        const isStrobe = (strobeCycle >= 0 && strobeCycle < 75) || (strobeCycle >= 160 && strobeCycle < 235);
        if (isStrobe) {
          const tailGlow = ctx.createRadialGradient(-28, -15.5, 0.5, -28, -15.5, 7.5);
          tailGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
          tailGlow.addColorStop(0.35, 'rgba(254, 240, 138, 0.7)');
          tailGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = tailGlow;
          ctx.beginPath();
          ctx.arc(-28, -15.5, 7.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-28, -15.5, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        if (plane.x > width + 180) {
          plane.x = -160;
          plane.y = height * (0.12 + Math.random() * 0.08);
        }
      }

      // ============================================================
      // 4. DAY BIRD FLOCK & FALLING ELEMENTS DYNAMICS
      // ============================================================
      // ─── 4A. Active Daytime Flocking Birds ───
      if (flock.length > 0) {
        ctx.save();
        for (let i = 0; i < flock.length; i++) {
          const b = flock[i];
          let alignX = 0, alignY = 0;
          let cohereX = 0, cohereY = 0;
          let sepX = 0, sepY = 0;
          let neighbors = 0;

          for (let j = 0; j < flock.length; j++) {
            if (i === j) continue;
            const other = flock[j];
            const dist = Math.hypot(other.x - b.x, other.y - b.y);

            if (dist < 85) {
              alignX += other.vx;
              alignY += other.vy;
              cohereX += other.x;
              cohereY += other.y;
              neighbors++;

              if (dist < 28) {
                sepX += (b.x - other.x) / (dist || 1);
                sepY += (b.y - other.y) / (dist || 1);
              }
            }
          }

          if (neighbors > 0) {
            alignX /= neighbors;
            alignY /= neighbors;
            b.vx += (alignX - b.vx) * b.maxForce;
            b.vy += (alignY - b.vy) * b.maxForce;

            cohereX /= neighbors;
            cohereY /= neighbors;
            b.vx += ((cohereX - b.x) * 0.008) * b.maxForce;
            b.vy += ((cohereY - b.y) * 0.008) * b.maxForce;
          }

          b.vx += sepX * 0.08;
          b.vy += sepY * 0.08;

          const speed = Math.hypot(b.vx, b.vy);
          if (speed > b.maxSpeed) {
            b.vx = (b.vx / speed) * b.maxSpeed;
            b.vy = (b.vy / speed) * b.maxSpeed;
          }

          b.x += b.vx;
          b.y += b.vy;

          if (b.x < -40) b.x = width + 30;
          if (b.x > width + 40) b.x = -30;

          b.flapPhase += b.flapFreq;
          const isFacingLeft = b.vx < 0;
          const flapSin = Math.sin(b.flapPhase);

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.scale(isFacingLeft ? -b.scale : b.scale, b.scale);
          ctx.rotate(Math.max(-0.25, Math.min(0.25, Math.atan2(b.vy, Math.abs(b.vx)))));

          ctx.fillStyle = '#220f06';
          ctx.beginPath();
          ctx.moveTo(4.5, 0.2);
          ctx.lineTo(2.8, -0.8);
          ctx.quadraticCurveTo(1.5, -2.2, -1.5, -1.6);
          ctx.lineTo(-6.5, -0.5);
          ctx.lineTo(-4.0, 0.6);
          ctx.quadraticCurveTo(-1.0, 2.2, 1.8, 1.4);
          ctx.lineTo(3.2, 0.4);
          ctx.closePath();
          ctx.fill();

          // Wing
          const nearWingY = flapSin * -13.0 - 3.0;
          ctx.beginPath();
          ctx.moveTo(0.5, -0.8);
          ctx.quadraticCurveTo(-2.5, nearWingY * 0.5 - 2, -7, nearWingY);
          ctx.quadraticCurveTo(-3.0, nearWingY * 0.3, -2.0, 0.0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
        ctx.restore();
      }

      // ─── 4B. Falling Elements Physics (Tumbling Birds & Feathers on Nightfall) ───
      for (let i = fallingBirds.length - 1; i >= 0; i--) {
        const fb = fallingBirds[i];
        fb.vy += 420 * dt; // Gravity
        fb.y += fb.vy * dt;
        fb.x += fb.vx * dt;
        fb.fallAngle += fb.fallSpin * dt;

        if (fb.y > height + 60) {
          fallingBirds.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(fb.x, fb.y);
        ctx.rotate(fb.fallAngle);
        ctx.scale(fb.scale, fb.scale);

        ctx.fillStyle = '#1c0c05';
        ctx.beginPath();
        ctx.moveTo(4.5, 0.2);
        ctx.lineTo(-6.5, -0.5);
        ctx.lineTo(-4.0, 0.6);
        ctx.quadraticCurveTo(-1.0, 2.2, 1.8, 1.4);
        ctx.closePath();
        ctx.fill();

        // Folded distressed wing
        ctx.beginPath();
        ctx.moveTo(0.5, -0.8);
        ctx.lineTo(-4, 6);
        ctx.lineTo(-2, 0);
        ctx.fill();

        ctx.restore();
      }

      // Falling Feathers
      for (let i = fallingFeathers.length - 1; i >= 0; i--) {
        const f = fallingFeathers[i];
        f.y += f.vy * dt;
        f.x += f.vx * dt + Math.sin(now * 0.005 + f.y * 0.05) * 0.8;
        f.rot += f.rotVel * dt;
        f.alpha -= dt * 0.35;

        if (f.alpha <= 0.02 || f.y > height + 20) {
          fallingFeathers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = `rgba(130, 80, 50, ${f.alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.len, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ============================================================
      // 5. ARCHITECTURAL CITY SKYLINE (Nocturne Stained Glass Windows)
      // ============================================================
      // Far Skyline
      ctx.save();
      const farSkylineR = Math.round(lerp(125, 20, themeBlend));
      const farSkylineG = Math.round(lerp(82, 22, themeBlend));
      const farSkylineB = Math.round(lerp(52, 34, themeBlend));
      ctx.fillStyle = `rgba(${farSkylineR}, ${farSkylineG}, ${farSkylineB}, ${0.20 + themeBlend * 0.25})`;
      ctx.strokeStyle = `rgba(${farSkylineR}, ${farSkylineG}, ${farSkylineB}, ${0.35 + themeBlend * 0.25})`;
      ctx.lineWidth = 1.0;

      skyline.farBuildings.forEach((b) => {
        const topY = b.groundBaseline - b.height;
        ctx.beginPath();

        if (b.type === 'spire') {
          const midBx = b.x + b.width * 0.5;
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x + 4, topY + 20);
          ctx.lineTo(midBx - 3, topY + 10);
          ctx.lineTo(midBx, topY - b.finialHeight);
          ctx.lineTo(midBx + 3, topY + 10);
          ctx.lineTo(b.x + b.width - 4, topY + 20);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else if (b.type === 'dome') {
          const midBx = b.x + b.width * 0.5;
          const domeRad = b.width * 0.44;
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY + domeRad);
          ctx.arc(midBx, topY + domeRad, domeRad, Math.PI, 0);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY);
          ctx.lineTo(b.x + b.width, topY);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();

      // Midground Skyline
      ctx.save();
      const midSkylineR = Math.round(lerp(54, 14, themeBlend));
      const midSkylineG = Math.round(lerp(30, 15, themeBlend));
      const midSkylineB = Math.round(lerp(16, 24, themeBlend));

      skyline.midBuildings.forEach((b) => {
        const topY = b.groundBaseline - b.height;
        const midBx = b.x + b.width * 0.5;

        ctx.fillStyle = `rgba(${midSkylineR}, ${midSkylineG}, ${midSkylineB}, ${0.48 + themeBlend * 0.38})`;
        ctx.strokeStyle = `rgba(18, 10, 6, ${0.68 + themeBlend * 0.28})`;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        if (b.type === 'clock_tower') {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x + 3, topY + 24);
          ctx.lineTo(b.x - 2, topY + 24);
          ctx.lineTo(b.x - 2, topY + 4);
          ctx.lineTo(midBx - 4, topY - b.spireHeight * 0.6);
          ctx.lineTo(midBx, topY - b.spireHeight);
          ctx.lineTo(midBx + 4, topY - b.spireHeight * 0.6);
          ctx.lineTo(b.x + b.width + 2, topY + 4);
          ctx.lineTo(b.x + b.width + 2, topY + 24);
          ctx.lineTo(b.x + b.width - 3, topY + 24);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY + 12);
          ctx.lineTo(midBx, topY - 4);
          ctx.lineTo(b.x + b.width, topY + 12);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Clock Dial
        if (b.hasClock) {
          const clockX = midBx;
          const clockY = topY + 14;
          const r = b.clockRadius;

          const clockGlow = ctx.createRadialGradient(clockX, clockY, 1, clockX, clockY, r * (1.8 + themeBlend * 1.2));
          clockGlow.addColorStop(0, `rgba(254, 240, 138, ${0.85 + themeBlend * 0.15})`);
          clockGlow.addColorStop(0.5, `rgba(245, 158, 11, ${0.40 + themeBlend * 0.35})`);
          clockGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = clockGlow;
          ctx.beginPath();
          ctx.arc(clockX, clockY, r * (1.8 + themeBlend * 1.2), 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(clockX, clockY, r, 0, Math.PI * 2);
          ctx.fill();

          const minuteAngle = (now * 0.0004) % (Math.PI * 2);
          const hourAngle = minuteAngle / 12;
          ctx.strokeStyle = '#1a0f0a';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(clockX, clockY);
          ctx.lineTo(clockX + Math.sin(minuteAngle) * (r * 0.72), clockY - Math.cos(minuteAngle) * (r * 0.72));
          ctx.moveTo(clockX, clockY);
          ctx.lineTo(clockX + Math.sin(hourAngle) * (r * 0.48), clockY - Math.cos(hourAngle) * (r * 0.48));
          ctx.stroke();
        }

        // Windows (Intensified golden lantern glow in Nocturne)
        b.windows.forEach((win) => {
          const flicker = 0.72 + Math.sin(now * win.twinkleSpeed + win.twinklePhase) * 0.28;
          const alpha = (win.baseAlpha + themeBlend * 0.35) * flicker;

          ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
          if (win.isArched) {
            ctx.beginPath();
            ctx.arc(win.x + win.w * 0.5, win.y + win.w * 0.5, win.w * 0.5, Math.PI, 0);
            ctx.rect(win.x, win.y + win.w * 0.5, win.w, win.h - win.w * 0.5);
            ctx.fill();
          } else {
            ctx.fillRect(win.x, win.y, win.w, win.h);
          }
        });
      });
      ctx.restore();

      // ============================================================
      // 6. DRIFTING MIDNIGHT GROUND MIST & INK BLEED RIPPLES
      // ============================================================
      if (themeBlend > 0.15) {
        ctx.save();
        groundMist.forEach((m) => {
          m.x += m.vx;
          if (m.x > width + m.radius) m.x = -m.radius;
          const mistAlpha = m.alpha * themeBlend * (0.8 + Math.sin(now * 0.001 + m.phase) * 0.2);

          const mistGlow = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.radius);
          mistGlow.addColorStop(0, `rgba(56, 189, 248, ${mistAlpha * 0.7})`);
          mistGlow.addColorStop(0.5, `rgba(30, 41, 59, ${mistAlpha * 0.4})`);
          mistGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = mistGlow;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Ink Bleed Ripples
      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0.01 && r.radius < r.maxRadius);
      ripplesRef.current.forEach((r) => {
        r.radius += (r.maxRadius - r.radius) * 0.075;
        r.alpha *= 0.94;
        const ripRad = Math.max(0.5, r.radius);

        ctx.beginPath();
        ctx.strokeStyle = themeBlend > 0.5 ? `rgba(254, 240, 138, ${r.alpha * 0.45})` : `rgba(90, 56, 37, ${r.alpha * 0.35})`;
        ctx.lineWidth = 1.0;
        ctx.arc(r.x, r.y, ripRad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ============================================================
      // 7. INKED GROUND TERRAIN BASELINE
      // ============================================================
      ctx.save();
      ctx.fillStyle = themeBlend > 0.5 ? '#0c0d15' : '#1a0f0a';

      ctx.beginPath();
      const step = 8;
      ctx.moveTo(0, getParchmentGroundY(0, width, height));
      for (let x = step; x <= width; x += step) {
        ctx.lineTo(x, getParchmentGroundY(x, width, height));
      }
      ctx.lineTo(width, height + 50);
      ctx.lineTo(0, height + 50);
      ctx.closePath();
      ctx.fill();

      // Top ground contour hairline
      ctx.beginPath();
      ctx.strokeStyle = themeBlend > 0.5 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(90, 56, 37, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, getParchmentGroundY(0, width, height));
      for (let x = step; x <= width; x += step) {
        ctx.lineTo(x, getParchmentGroundY(x, width, height));
      }
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="parchment-base-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
