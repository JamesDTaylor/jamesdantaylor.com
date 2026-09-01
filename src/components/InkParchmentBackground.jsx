import React, { useEffect, useRef } from 'react';
import { getParchmentGroundY } from '../utils/terrain';

/**
 * Storybook Aged Parchment Background
 * 
 * Features:
 * 1. Celestial Golden Sun with Soft Radiant Aura & Constellation Stars
 * 2. Authentic Tea-Stained Aged Parchment Vignette
 * 3. Mathematical Boids Avian Flocking System in Side Profile (Kinematic Wing Flexion & Elevation Profile)
 * 4. Horizontal Cruising Airliner in True Side Profile (Fuselage, Windows, Engine Nacelle, Contrail, Nav Strobes)
 * 5. Multi-Layer Architectural City Skyline Silhouette with Single Central Clock Tower (Clean Rooflines)
 * 6. Interactive Calligraphy Ink Bleed Ripples on Click
 * 7. Grounded Silhouette Baseline for Character Physics
 */

function createSeededRng(seed = 94821) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function InkParchmentBackground() {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);

  useEffect(() => {
    const handleMouseDown = (e) => {
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

    // ============================================================
    // 1. PROCEDURAL STARS GENERATOR
    // ============================================================
    const generateStars = (w, h) => {
      const rng = createSeededRng(41982);
      const stars = [];
      for (let i = 0; i < 40; i++) {
        stars.push({
          x: rng() * w,
          y: rng() * (h * 0.40),
          radius: 0.5 + rng() * 1.0,
          omega: 0.0012 + rng() * 0.0025,
          phase: rng() * Math.PI * 2,
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
        vy: 0.0, // Pure level horizontal flight
        scale: 0.75,
        pitch: 0.0,
        contrailParticles: [],
      };
    };

    // ============================================================
    // 4. MULTI-LAYER ARCHITECTURAL CITY SKYLINE (No Chimneys)
    // ============================================================
    const generateCitySkyline = (w, h) => {
      const rng = createSeededRng(88421);
      
      // Far Skyline Buildings (Grand distant monuments & silhouettes)
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

      // Midground Skyline Buildings (Clean Rooflines)
      const midBuildings = [];
      let midX = -20;
      while (midX < w + 50) {
        const bWidth = 34 + rng() * 52;
        const bHeight = 58 + rng() * 105;
        const groundBaseline = getParchmentGroundY(midX + bWidth * 0.5, w, h);

        const typeChoice = rng();
        let bType = 'townhouse';
        if (typeChoice < 0.30) {
          bType = 'gothic_spire';
        } else if (typeChoice < 0.55) {
          bType = 'mansard';
        } else if (typeChoice < 0.78) {
          bType = 'stepped_terrace';
        }

        // Procedural Windows
        const windows = [];
        const cols = Math.max(1, Math.floor((bWidth - 10) / 10));
        const rows = Math.max(1, Math.floor((bHeight - 20) / 14));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (rng() > 0.38) {
              const wx = midX + 6 + c * ((bWidth - 12) / cols) + (rng() - 0.5) * 1.5;
              const wy = groundBaseline - bHeight + 14 + r * 13;
              windows.push({
                x: wx,
                y: wy,
                w: 3.5 + rng() * 1.5,
                h: 5.0 + rng() * 2.0,
                isArched: rng() > 0.5,
                twinkleSpeed: 0.001 + rng() * 0.003,
                twinklePhase: rng() * Math.PI * 2,
                baseAlpha: 0.45 + rng() * 0.45,
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

      // Designate ONLY ONE single building in the center as the Grand Clock Tower
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

    const render = () => {
      const now = performance.now();

      // ============================================================
      // 1. AGED VINTAGE PARCHMENT TEXTURE & VIGNETTE
      // ============================================================
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const vignetteRadius = Math.max(width, height) * 0.78;

      const bgGrad = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, vignetteRadius);
      bgGrad.addColorStop(0, '#faf6eb');     // Luminous warm core
      bgGrad.addColorStop(0.42, '#f2e7cd');  // Mid golden tea wash
      bgGrad.addColorStop(0.72, '#e4d0aa');  // Aged parchment tone
      bgGrad.addColorStop(1, '#c5ab7d');     // Weathered sepia leather border
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ============================================================
      // 2. CELESTIAL SUN & STARS
      // ============================================================
      ctx.save();
      const sunX = width * 0.80;
      const sunY = height * 0.18;
      const sunRad = Math.min(width, height) * 0.036;

      // Soft Radiant Solar Glow Aura
      const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRad * 0.3, sunX, sunY, sunRad * 2.8);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      sunGlow.addColorStop(0.45, 'rgba(245, 158, 11, 0.14)');
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Golden Celestial Body Silhouette
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
      ctx.fill();
      // Organic cutout matching background tone
      ctx.fillStyle = '#f2e7cd';
      ctx.beginPath();
      ctx.arc(sunX - sunRad * 0.42, sunY - sunRad * 0.18, sunRad * 0.94, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling Constellations
      stars.forEach((star) => {
        const twinkle = 0.28 + Math.sin(now * star.omega + star.phase) * 0.36;
        ctx.fillStyle = `rgba(90, 56, 37, ${Math.max(0.08, twinkle)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // ============================================================
      // 3. HORIZONTAL AIRLINER IN TRUE SIDE PROFILE (ELEVATION VIEW)
      // ============================================================
      if (plane.active) {
        // Horizontal flight kinematics
        plane.x += plane.vx;
        plane.y += plane.vy;
        plane.pitch = Math.sin(now * 0.0014) * 0.005;

        // Horizontal jet engine contrail emission in side view
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

        // Draw and update contrails
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

          ctx.fillStyle = `rgba(135, 90, 60, ${cp.alpha})`;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ─── Draw Aeroplane in Authentic Side Elevation Profile ───
        ctx.save();
        ctx.translate(plane.x, plane.y);
        ctx.rotate(plane.pitch);
        ctx.scale(plane.scale, plane.scale);

        ctx.fillStyle = '#261208';
        ctx.strokeStyle = '#140904';
        ctx.lineWidth = 1.1;

        // 1. Aerodynamic Side Fuselage Tube & Vertical Stabilizer Tail
        ctx.beginPath();
        // Nose radome
        ctx.moveTo(24, 0.5);
        // Slanted cockpit windscreen
        ctx.quadraticCurveTo(20, -3.2, 14, -3.2);
        // Upper cabin roofline
        ctx.lineTo(-17, -3.2);
        // Leading edge of vertical stabilizer tail fin
        ctx.lineTo(-27, -15.5);
        ctx.lineTo(-29, -15.5);
        // Trailing edge of tail fin
        ctx.lineTo(-26, -1.0);
        // Tail cone
        ctx.lineTo(-30, 0.8);
        ctx.lineTo(-26, 2.2);
        // Lower fuselage underbelly
        ctx.lineTo(-14, 3.2);
        ctx.quadraticCurveTo(14, 3.2, 24, 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Horizontal Tail Stabilizer (side profile extension)
        ctx.fillStyle = '#1e0e06';
        ctx.beginPath();
        ctx.moveTo(-22, 0.0);
        ctx.lineTo(-28, -2.5);
        ctx.lineTo(-29.5, -2.5);
        ctx.lineTo(-25, 0.5);
        ctx.closePath();
        ctx.fill();

        // 3. Swept Wing in Side Profile (slanted under fuselage)
        ctx.fillStyle = '#1a0b04';
        ctx.beginPath();
        ctx.moveTo(6, 1.2);
        ctx.lineTo(-8, 5.8);
        ctx.lineTo(-12, 5.8);
        ctx.lineTo(-3, 1.8);
        ctx.closePath();
        ctx.fill();

        // 4. Underslung Jet Turbine Engine Nacelle
        ctx.fillStyle = '#3a1f10';
        ctx.beginPath();
        ctx.roundRect(-4, 3.2, 10, 4.2, 2);
        ctx.fill();
        ctx.stroke();

        // Jet intake & exhaust cone
        ctx.fillStyle = '#1a0b04';
        ctx.fillRect(4.5, 3.8, 1.8, 3.0); // Intake
        ctx.fillRect(-5.5, 4.0, 1.8, 2.6); // Exhaust nozzle

        // 5. Side Cockpit & Passenger Cabin Window Row
        ctx.fillStyle = '#fef08a';
        // Cockpit window
        ctx.fillRect(17, -2.2, 2.4, 1.4);
        // Passenger windows
        for (let wIdx = 0; wIdx < 7; wIdx++) {
          ctx.fillRect(11 - wIdx * 3.6, -1.8, 1.6, 1.3);
        }

        // ============================================================
        // REALISTIC AVIATION LIGHTS IN SIDE PROFILE
        // ============================================================
        // 1. Tail Fin Anti-Collision Xenon Strobe (Double Flash Sequence)
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

          // Upper fuselage beacon flash
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.arc(2, -3.8, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Passive tail beacon marker
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.arc(-28, -15.5, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Passive red beacon
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.beginPath();
          ctx.arc(2, -3.8, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Wingtip Navigation Light (Red on forward wing in side view)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-8, 5.8, 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Screen boundary horizontal wrap
        if (plane.x > width + 150) {
          plane.active = false;
          plane.respawnCooldown = now + (7000 + Math.random() * 9000);
        }
      } else if (now > plane.respawnCooldown) {
        plane.active = true;
        const startY = height * (0.12 + Math.random() * 0.08);
        plane.x = -140;
        plane.y = startY;
        plane.vx = 1.30 + Math.random() * 0.20;
        plane.vy = 0.0;
        plane.scale = 0.72 + Math.random() * 0.16;
        plane.contrailParticles = [];
      }

      // ============================================================
      // 4. MATHEMATICAL BOIDS BIRDS IN TRUE SIDE PROFILE
      // ============================================================
      ctx.save();
      
      const flockTargetX = width * 0.5 + Math.cos(now * 0.0004) * (width * 0.35);
      const flockTargetY = height * 0.22 + Math.sin(now * 0.0006) * (height * 0.10);

      const rSep = 26;
      const rAli = 75;
      const rCoh = 110;

      for (let i = 0; i < flock.length; i++) {
        const b = flock[i];
        let sepX = 0, sepY = 0, sepCount = 0;
        let aliX = 0, aliY = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        for (let j = 0; j < flock.length; j++) {
          if (i === j) continue;
          const other = flock[j];
          const dx = b.x - other.x;
          const dy = b.y - other.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0 && dist < rSep) {
            sepX += (dx / dist) / dist;
            sepY += (dy / dist) / dist;
            sepCount++;
          }
          if (dist > 0 && dist < rAli) {
            aliX += other.vx;
            aliY += other.vy;
            aliCount++;
          }
          if (dist > 0 && dist < rCoh) {
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
        }

        let steerSepX = 0, steerSepY = 0;
        if (sepCount > 0) {
          sepX /= sepCount;
          sepY /= sepCount;
          const sepLen = Math.hypot(sepX, sepY);
          if (sepLen > 0.001) {
            steerSepX = (sepX / sepLen) * b.maxSpeed - b.vx;
            steerSepY = (sepY / sepLen) * b.maxSpeed - b.vy;
          }
        }

        let steerAliX = 0, steerAliY = 0;
        if (aliCount > 0) {
          aliX /= aliCount;
          aliY /= aliCount;
          const aliLen = Math.hypot(aliX, aliY);
          if (aliLen > 0.001) {
            steerAliX = (aliX / aliLen) * b.maxSpeed - b.vx;
            steerAliY = (aliY / aliLen) * b.maxSpeed - b.vy;
          }
        }

        let steerCohX = 0, steerCohY = 0;
        if (cohCount > 0) {
          cohX /= cohCount;
          cohY /= cohCount;
          const toCenterX = cohX - b.x;
          const toCenterY = cohY - b.y;
          const cohLen = Math.hypot(toCenterX, toCenterY);
          if (cohLen > 0.001) {
            steerCohX = (toCenterX / cohLen) * b.maxSpeed - b.vx;
            steerCohY = (toCenterY / cohLen) * b.maxSpeed - b.vy;
          }
        }

        const toTargX = flockTargetX - b.x;
        const toTargY = flockTargetY - b.y;
        const targLen = Math.hypot(toTargX, toTargY);
        let steerTargX = 0, steerTargY = 0;
        if (targLen > 0.001) {
          steerTargX = (toTargX / targLen) * b.maxSpeed - b.vx;
          steerTargY = (toTargY / targLen) * b.maxSpeed - b.vy;
        }

        let boundY = 0;
        if (b.y < height * 0.08) boundY = 0.06;
        if (b.y > height * 0.42) boundY = -0.06;

        let ax = steerSepX * 1.5 + steerAliX * 1.1 + steerCohX * 0.9 + steerTargX * 0.35;
        let ay = steerSepY * 1.5 + steerAliY * 1.1 + steerCohY * 0.9 + steerTargY * 0.35 + boundY;

        // Gentle forward cruising bias so the flock maintains a natural left-to-right migration across the sky
        if (b.vx < 0.8) ax += 0.035;

        const forceLen = Math.hypot(ax, ay);
        if (forceLen > b.maxForce) {
          ax = (ax / forceLen) * b.maxForce;
          ay = (ay / forceLen) * b.maxForce;
        }

        b.vx += ax;
        b.vy += ay;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > b.maxSpeed) {
          b.vx = (b.vx / speed) * b.maxSpeed;
          b.vy = (b.vy / speed) * b.maxSpeed;
        } else if (speed < b.minSpeed) {
          b.vx = (b.vx / speed) * b.minSpeed;
          b.vy = (b.vy / speed) * b.minSpeed;
        }

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -40) b.x = width + 30;
        if (b.x > width + 40) b.x = -30;

        b.glideTimer--;
        if (b.glideTimer <= 0) {
          b.isGliding = !b.isGliding;
          b.glideTimer = b.isGliding ? b.glideDuration : (45 + Math.random() * 80);
        }

        if (!b.isGliding) {
          b.flapPhase += b.flapFreq * (speed / b.maxSpeed);
        }

        // Side profile orientation & pitch (Always upright: back on top, feet/belly on bottom)
        const isFacingLeft = b.vx < 0;
        const speedH = Math.max(0.1, Math.abs(b.vx));
        // Realistic avian flight pitch angle (clamped within +/- 15 degrees so bird never inverts)
        const pitch = Math.max(-0.25, Math.min(0.25, Math.atan2(b.vy, speedH)));
        const flapSin = b.isGliding ? 0.35 : Math.sin(b.flapPhase);

        // ─── Render Bird in Pure Side Elevation Profile (Always Right-Side Up) ───
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(isFacingLeft ? -b.scale : b.scale, b.scale);
        ctx.rotate(pitch);

        ctx.fillStyle = '#220f06';
        ctx.strokeStyle = '#140904';
        ctx.lineWidth = 1.0;

        // 1. Far Wing (Behind torso in perspective)
        ctx.save();
        ctx.fillStyle = '#3a1e10';
        ctx.beginPath();
        const farWingY = flapSin * -10.0 - 2.0;
        ctx.moveTo(0, -1.0);
        ctx.quadraticCurveTo(-2, farWingY * 0.6 - 1, -6, farWingY);
        ctx.quadraticCurveTo(-3, farWingY * 0.4, 1.5, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Streamlined Bird Body in Side Elevation (Head, Beak, Chest, Tail)
        ctx.beginPath();
        ctx.moveTo(4.5, 0.2); // Beak tip
        ctx.lineTo(2.8, -0.8); // Upper beak / forehead
        ctx.quadraticCurveTo(1.5, -2.2, -1.5, -1.6); // Crown & back
        ctx.lineTo(-6.5, -0.5); // Tail tip
        ctx.lineTo(-4.0, 0.6); // Under tail
        ctx.quadraticCurveTo(-1.0, 2.2, 1.8, 1.4); // Chest / belly
        ctx.lineTo(3.2, 0.4); // Lower beak
        ctx.closePath();
        ctx.fill();

        // 3. Near Main Wing (Flexing with harmonic wing stroke in side view)
        ctx.beginPath();
        const nearWingY = flapSin * -13.0 - 3.0;
        const wingTipX = -7 - (flapSin > 0 ? flapSin * 2.5 : 0);
        ctx.moveTo(0.5, -0.8); // Shoulder joint
        ctx.quadraticCurveTo(-2.5, nearWingY * 0.5 - 2, wingTipX, nearWingY); // Wing upper leading edge
        ctx.quadraticCurveTo(-3.0, nearWingY * 0.3, -2.0, 0.0); // Trailing edge feathers
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
      ctx.restore();

      // ============================================================
      // 5. ARCHITECTURAL CITY SKYLINE INK LAYERS (Clean Rooflines)
      // ============================================================

      // ─── 5A. Distant Atmospheric Skyline (Hazy Sepia Wash) ───
      ctx.save();
      ctx.fillStyle = 'rgba(125, 82, 52, 0.20)';
      ctx.strokeStyle = 'rgba(95, 58, 35, 0.30)';
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
        } else if (b.type === 'stepped') {
          const midBx = b.x + b.width * 0.5;
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY + 30);
          ctx.lineTo(b.x + 6, topY + 30);
          ctx.lineTo(b.x + 6, topY + 14);
          ctx.lineTo(b.x + 12, topY + 14);
          ctx.lineTo(midBx, topY - 8);
          ctx.lineTo(b.x + b.width - 12, topY + 14);
          ctx.lineTo(b.x + b.width - 6, topY + 14);
          ctx.lineTo(b.x + b.width - 6, topY + 30);
          ctx.lineTo(b.x + b.width, topY + 30);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else if (b.type === 'bridge') {
          ctx.moveTo(b.x + 4, b.groundBaseline);
          ctx.lineTo(b.x + 8, topY - b.finialHeight * 0.7);
          ctx.lineTo(b.x + b.width - 8, topY - b.finialHeight * 0.7);
          ctx.lineTo(b.x + b.width - 4, b.groundBaseline);
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

      // ─── 5B. Midground Detailed City Skyline (Rich Ink Silhouette & Single Clock) ───
      ctx.save();

      // Draw Midground building bodies
      skyline.midBuildings.forEach((b) => {
        const topY = b.groundBaseline - b.height;
        const midBx = b.x + b.width * 0.5;

        ctx.fillStyle = 'rgba(54, 30, 16, 0.48)';
        ctx.strokeStyle = 'rgba(32, 16, 8, 0.68)';
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
        } else if (b.type === 'gothic_spire') {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x + 2, topY + 18);
          ctx.lineTo(midBx - 3, topY);
          ctx.lineTo(midBx, topY - b.spireHeight);
          ctx.lineTo(midBx + 3, topY);
          ctx.lineTo(b.x + b.width - 2, topY + 18);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else if (b.type === 'mansard') {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY + b.roofHeight);
          ctx.lineTo(b.x + 6, topY);
          ctx.lineTo(b.x + b.width - 6, topY);
          ctx.lineTo(b.x + b.width, topY + b.roofHeight);
          ctx.lineTo(b.x + b.width, b.groundBaseline);
        } else if (b.type === 'stepped_terrace') {
          ctx.moveTo(b.x, b.groundBaseline);
          ctx.lineTo(b.x, topY + 24);
          ctx.lineTo(b.x + 4, topY + 24);
          ctx.lineTo(b.x + 4, topY + 14);
          ctx.lineTo(b.x + 9, topY + 14);
          ctx.lineTo(b.x + 9, topY + 4);
          ctx.lineTo(midBx, topY - 3);
          ctx.lineTo(b.x + b.width - 9, topY + 4);
          ctx.lineTo(b.x + b.width - 9, topY + 14);
          ctx.lineTo(b.x + b.width - 4, topY + 14);
          ctx.lineTo(b.x + b.width - 4, topY + 24);
          ctx.lineTo(b.x + b.width, topY + 24);
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

        // ─── Single Central Clock Tower Dial ───
        if (b.hasClock) {
          const clockX = midBx;
          const clockY = topY + 14;
          const r = b.clockRadius;

          const clockGlow = ctx.createRadialGradient(clockX, clockY, 1, clockX, clockY, r * 1.8);
          clockGlow.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
          clockGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.40)');
          clockGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = clockGlow;
          ctx.beginPath();
          ctx.arc(clockX, clockY, r * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.strokeStyle = '#2d170b';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(clockX, clockY, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#5a3825';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(clockX, clockY - r + 1.2);
          ctx.lineTo(clockX, clockY - r + 2.8);
          ctx.moveTo(clockX, clockY + r - 1.2);
          ctx.lineTo(clockX, clockY + r - 2.8);
          ctx.moveTo(clockX - r + 1.2, clockY);
          ctx.lineTo(clockX - r + 2.8, clockY);
          ctx.moveTo(clockX + r - 1.2, clockY);
          ctx.lineTo(clockX + r - 2.8, clockY);
          ctx.stroke();

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

          ctx.fillStyle = '#7a2222';
          ctx.beginPath();
          ctx.arc(clockX, clockY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // ─── Glowing City Windows ───
        b.windows.forEach((win) => {
          const flicker = 0.72 + Math.sin(now * win.twinkleSpeed + win.twinklePhase) * 0.28;
          const alpha = win.baseAlpha * flicker;

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
      // 6. INTERACTIVE CALLIGRAPHY INK BLEED RIPPLES
      // ============================================================
      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0.01 && r.radius < r.maxRadius);
      ripplesRef.current.forEach((r) => {
        r.radius += (r.maxRadius - r.radius) * 0.075;
        r.alpha *= 0.94;
        const ripRad = Math.max(0.5, r.radius);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(90, 56, 37, ${Math.max(0, r.alpha * 0.35)})`;
        ctx.lineWidth = 1.0;
        ctx.arc(r.x, r.y, ripRad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ============================================================
      // 7. INKED GROUND TERRAIN BASELINE (Clean, Open Space for Character)
      // ============================================================
      ctx.save();
      ctx.fillStyle = '#1a0f0a';

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

      // Top ground contour hairline in warm sepia
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(90, 56, 37, 0.65)';
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
