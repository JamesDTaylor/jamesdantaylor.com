import React, { useEffect, useRef } from 'react';
import { getParchmentGroundY } from '../utils/terrain';

/**
 * Antique Parchment & Cartographic Canvas Background
 * Authentic aged parchment texture with vintage contour lines,
 * architectural corridors, faint compass marks,
 * and an inked ground baseline for the living silhouette character.
 */
export default function InkParchmentBackground() {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 65,
        alpha: 0.35,
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

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // 1. Aged Vintage Parchment Background
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const radius = Math.max(width, height) * 0.75;

      // Radial tea-stained vignette
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, radius);
      bgGrad.addColorStop(0, '#f9f4e8');      // Luminous parchment center
      bgGrad.addColorStop(0.45, '#f1e5cb');   // Mid warm tea wash
      bgGrad.addColorStop(0.75, '#e4d2ad');   // Aged paper rim
      bgGrad.addColorStop(1, '#c8af82');      // Weathered leather/sepia border

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Faint Architectural Corridors & Compass Survey Grids
      ctx.save();
      ctx.strokeStyle = 'rgba(107, 68, 35, 0.08)';
      ctx.lineWidth = 1;

      // Diagonal map survey lines
      for (let i = -width; i < width * 2; i += 180) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height * 0.8, height);
        ctx.stroke();
      }

      // Compass concentric rings in center-top
      const compassX = width * 0.5;
      const compassY = height * 0.35;
      ctx.beginPath();
      ctx.arc(compassX, compassY, 140, 0, Math.PI * 2);
      ctx.arc(compassX, compassY, 220, 0, Math.PI * 2);
      ctx.arc(compassX, compassY, 320, 0, Math.PI * 2);
      ctx.stroke();

      // Blueprint linework
      ctx.strokeStyle = 'rgba(74, 44, 29, 0.06)';
      ctx.beginPath();
      ctx.strokeRect(width * 0.08, height * 0.2, width * 0.16, height * 0.45);
      ctx.strokeRect(width * 0.1, height * 0.25, width * 0.12, height * 0.35);
      ctx.strokeRect(width * 0.76, height * 0.2, width * 0.16, height * 0.45);
      ctx.strokeRect(width * 0.78, height * 0.25, width * 0.12, height * 0.35);
      ctx.stroke();

      ctx.restore();

      // 3. Delicate Ink Bleed Ripples on Click
      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0.01 && r.radius < r.maxRadius);
      ripplesRef.current.forEach((r) => {
        r.radius += (r.maxRadius - r.radius) * 0.07;
        r.alpha *= 0.94;
        const ripRad = Math.max(0.5, r.radius);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(139, 30, 30, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 1.2;
        ctx.arc(r.x, r.y, ripRad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 4. Inked Ground Terrain Baseline (Sampled continuously)
      ctx.save();
      ctx.fillStyle = '#1a0f0a'; // Deep silhouette ink

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
