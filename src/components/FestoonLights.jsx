import React, { useState, useEffect } from 'react';

/**
 * Whimsical SVG Festoon Lights (Single Garland Line)
 * Draped across the top of the canopy, extending deeply into the trees on either side.
 * Positioned high so the bulbs remain safely above the "JAMES TAYLOR" title header.
 */

export default function FestoonLights({ isDark = false }) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;

  // Tree anchors extending generously past the tree trunks to eliminate any gap
  const leftX = -50;
  const leftY = 10;
  const rightX = width + 50;
  const rightY = 12;

  // Gentle catenary sag midpoint kept high above "JAMES TAYLOR" header
  const midX = width * 0.5;
  const midY = 38;

  // Single Garland Line
  const strandPath = `M ${leftX} ${leftY} Q ${midX} ${midY} ${rightX} ${rightY}`;

  // Quadratic Bezier interpolation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const getQuadraticPoint = (p0, p1, p2, t) => {
    const mt = 1 - t;
    const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
    const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  const p0 = { x: leftX, y: leftY };
  const p1 = { x: midX, y: midY };
  const p2 = { x: rightX, y: rightY };

  // Calculate bulb count based on viewport width
  const bulbCount = Math.max(8, Math.min(16, Math.floor(width / 95)));

  const bulbs = [];
  for (let i = 1; i <= bulbCount; i++) {
    const t = 0.08 + (i / (bulbCount + 1)) * 0.84;
    const pt = getQuadraticPoint(p0, p1, p2, t);
    bulbs.push({ ...pt, id: `bulb-${i}`, delay: (i * 0.23) % 2.5, dropLen: 8 + (i % 3) * 2 });
  }

  return (
    <div
      className="festoon-lights-wrapper"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Warm Golden Festoon Glow Filter */}
          <filter id="festoon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial Light Glow Gradient */}
          <radialGradient id="festoon-radial-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ============================================================ */}
        {/* SINGLE FESTOON GARLAND */}
        {/* ============================================================ */}
        <g className="festoon-strand festoon-strand-1">
          {/* Main Ink Catenary Cord */}
          <path
            d={strandPath}
            fill="none"
            stroke="#1a0f0a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Secondary subtle shadow cord */}
          <path
            d={strandPath}
            fill="none"
            stroke="rgba(90, 56, 37, 0.35)"
            strokeWidth="0.9"
            transform="translate(0, 1)"
          />

          {/* Glowing Edison Bulbs */}
          {bulbs.map((b) => (
            <g key={b.id} transform={`translate(${b.x}, ${b.y})`}>
              {/* Vertical wire drop */}
              <line x1="0" y1="0" x2="0" y2={b.dropLen} stroke="#1a0f0a" strokeWidth="1.3" />
              {/* Brass socket cap */}
              <rect x="-2.5" y={b.dropLen} width="5" height="3.5" rx="1" fill="#2d170b" stroke="#140b07" strokeWidth="0.8" />
              {/* Ambient Glow Halo */}
              <circle
                cx="0"
                cy={b.dropLen + 8}
                r="16"
                fill="url(#festoon-radial-glow)"
                className="festoon-bulb-halo"
                style={{ animationDelay: `${b.delay}s` }}
              />
              {/* Teardrop Glass Bulb Body */}
              <path
                d={`M -3.8 ${b.dropLen + 3} 
                    C -5 ${b.dropLen + 6.5}, -5 ${b.dropLen + 10.5}, 0 ${b.dropLen + 13} 
                    C 5 ${b.dropLen + 10.5}, 5 ${b.dropLen + 6.5}, 3.8 ${b.dropLen + 3} Z`}
                fill="#fef08a"
                stroke="#d97706"
                strokeWidth="0.9"
                filter="url(#festoon-glow)"
                className="festoon-bulb-glass"
                style={{ animationDelay: `${b.delay}s` }}
              />
              {/* Internal Filament Loop */}
              <path
                d={`M -1.5 ${b.dropLen + 4} Q 0 ${b.dropLen + 8.5} 1.5 ${b.dropLen + 4}`}
                fill="none"
                stroke="#b45309"
                strokeWidth="0.8"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
