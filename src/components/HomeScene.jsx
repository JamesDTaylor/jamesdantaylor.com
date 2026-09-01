import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FolderGit2,
  GraduationCap,
  MessageSquareHeart,
  Mail,
  ArrowRight,
} from 'lucide-react';
import KineticGlyphText from './KineticGlyphText';

/* ─── Whimsical Organic Inked Frame for Each Portal Card ─── */
const InkedCardBorder = ({ isHovered, isSelected }) => (
  <svg
    className="portal-svg-frame"
    viewBox="0 0 320 220"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Single Organic Pen-Drawn Ink Border & Rich Solid Parchment Body */}
    <path
      d="M 16 6 
         C 80 4, 160 7, 240 5 
         C 280 6, 300 4, 308 14 
         C 316 24, 314 80, 316 140 
         C 314 180, 317 200, 306 208 
         C 296 216, 240 214, 160 216 
         C 80 214, 24 216, 14 206 
         C 4 196, 6 140, 4 80 
         C 6 40, 4 16, 16 6 Z"
      fill={isSelected ? '#ffffff' : isHovered ? '#fffcf5' : '#f9f3e5'}
      stroke={isSelected ? '#7a2222' : isHovered ? '#7a2222' : 'rgba(90, 56, 37, 0.75)'}
      strokeWidth={isSelected ? '2.4' : isHovered ? '2.0' : '1.8'}
      vectorEffect="non-scaling-stroke"
    />

    {/* Subtle Calligraphy Corner Accents */}
    <path
      d="M 6 22 C 6 12, 12 6, 22 6"
      stroke={isSelected || isHovered ? '#7a2222' : 'rgba(90, 56, 37, 0.65)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      fill="none"
    />
    <path
      d="M 314 22 C 314 12, 308 6, 298 6"
      stroke={isSelected || isHovered ? '#7a2222' : 'rgba(90, 56, 37, 0.65)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      fill="none"
    />
    <path
      d="M 6 198 C 6 208, 12 214, 22 214"
      stroke={isSelected || isHovered ? '#7a2222' : 'rgba(90, 56, 37, 0.65)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      fill="none"
    />
    <path
      d="M 314 198 C 314 208, 308 214, 298 214"
      stroke={isSelected || isHovered ? '#7a2222' : 'rgba(90, 56, 37, 0.65)'}
      strokeWidth="1.4"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      fill="none"
    />
  </svg>
);

const PORTAL_ITEMS = [
  {
    id: 'summary',
    title: 'Summary',
    desc: 'MSc Neuroscience candidate researching virtual reality-based interventions for anxiety disorders and digital mental health solutions.',
    tag: 'Chapter I',
    icon: BookOpen,
    keyNum: '1',
  },
  {
    id: 'experience',
    title: 'Experience',
    desc: 'Professional roles at Stellenbosch University, James Does Coaching, Breaking Boundaries, Insight Analytics, and Food & Trees for Africa.',
    tag: 'Chapter II',
    icon: FolderGit2,
    keyNum: '2',
  },
  {
    id: 'education',
    title: 'Education & Background',
    desc: 'Degrees at Stellenbosch University and University of the Witwatersrand, professional certifications, and honors-awards.',
    tag: 'Chapter III',
    icon: GraduationCap,
    keyNum: '3',
  },
  {
    id: 'collaborate',
    title: 'Collaborate',
    desc: 'Collaborating across academia, healthcare, and industry to design and evaluate user-centred XR and digital mental health solutions.',
    tag: 'Chapter IV',
    icon: MessageSquareHeart,
    keyNum: '4',
  },
  {
    id: 'contact',
    title: 'Contact',
    desc: 'james.dan.taylor@gmail.com · linkedin.com/in/jamesdantaylor · Gauteng, South Africa.',
    tag: 'Chapter V',
    icon: Mail,
    keyNum: '5',
  },
];

/**
 * Computes physically-informed falling leaf trajectory keyframes at randomized rates
 * based on Zhukovsky thin-plate fluttering aerodynamics.
 * Fades out quickly at the very end of the fall.
 */
function computeRandomizedFallingLeafPhysics(index, totalCards = 5) {
  const steps = 10;
  const keyframes = {
    x: [],
    y: [],
    rotateZ: [],
    rotateX: [],
    rotateY: [],
    opacity: [],
    scale: [],
  };

  // Randomized card dispersion parameters for natural organic variation
  const normalizedPos = (index - (totalCards - 1) / 2) / ((totalCards - 1) / 2 || 1);
  const driftDirection = normalizedPos !== 0 ? Math.sign(normalizedPos) : (index % 2 === 0 ? -1 : 1);

  // Randomized fluttering frequencies (Froude-number scaling + turbulence seed)
  const seed = Math.sin(index * 12.9898) * 43758.5453;
  const randA = (seed - Math.floor(seed));
  const randB = ((seed * 1.5) - Math.floor(seed * 1.5));

  const fx = 1.2 + randA * 0.6; // Lateral lift oscillation frequency
  const fz = 1.0 + randB * 0.5; // Rocking yaw frequency
  const fy = 1.4 + randA * 0.4; // Pitch flapping frequency

  // Randomized amplitudes
  const Ax = 45 + randA * 40;
  const ThetaZ = 28 + randB * 24;
  const ThetaX = 35 + randA * 25;
  const ThetaY = 24 + randB * 20;

  // Randomized terminal fall distance and lateral wind dispersion
  const totalFallY = 850 + randA * 300;
  const totalDriftX = driftDirection * (130 + Math.abs(normalizedPos) * 160 + randB * 80);

  for (let s = 0; s <= steps; s++) {
    const t = s / steps; // Time parameter from 0 to 1

    // Vertical descent with quadratic aerodynamic drag and turbulent air-pocket bounce
    const dragT = Math.pow(t, 1.75 + randA * 0.2);
    const yVal = dragT * totalFallY + (t > 0 && t < 0.9 ? Math.sin(t * Math.PI * 3.2) * (12 + randB * 8) : 0);

    // Horizontal fluttering with sinusoidal lift envelope
    const flutterEnvelope = Math.sin(t * Math.PI);
    const xVal = totalDriftX * t + Ax * Math.sin(2 * Math.PI * fx * t + randA * Math.PI) * flutterEnvelope;

    // 3D Euler angles (Yaw, Pitch, Roll)
    const rotZ = ThetaZ * Math.sin(2 * Math.PI * fz * t + index * 0.8) + driftDirection * 25 * t;
    const rotX = ThetaX * Math.cos(2 * Math.PI * fy * t + randB);
    const rotY = ThetaY * Math.sin(2 * Math.PI * fx * t + Math.PI / 4);

    // Fast, crisp fade-out only during the last part of descent (t > 0.78)
    const op = t < 0.78 ? 1 : Math.max(0, 1 - Math.pow((t - 0.78) / 0.22, 2.0));
    const sc = 1 - t * (0.15 + randA * 0.1);

    keyframes.x.push(Math.round(xVal * 10) / 10);
    keyframes.y.push(Math.round(yVal * 10) / 10);
    keyframes.rotateZ.push(Math.round(rotZ * 10) / 10);
    keyframes.rotateX.push(Math.round(rotX * 10) / 10);
    keyframes.rotateY.push(Math.round(rotY * 10) / 10);
    keyframes.opacity.push(Math.round(op * 100) / 100);
    keyframes.scale.push(Math.round(sc * 100) / 100);
  }

  // Randomized duration and delay per card
  const duration = 1.0 + randA * 0.45; // 1.0s to 1.45s
  const delay = randB * 0.15;          // 0s to 0.15s

  return { keyframes, duration, delay };
}

export default function HomeScene({ onAction }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const cardRefs = useRef([]);
  const isNavigatingRef = useRef(false);
  const navigationTimerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerNavigation = useCallback(
    (item) => {
      if (item.id === 'quest') {
        onAction('selectQuestion', 1);
      } else {
        onAction(item.id);
      }
    },
    [onAction]
  );

  const handleSelect = useCallback(
    (item, index) => {
      if (!item) return;

      // If user clicks the already-selected centered card, proceed immediately without waiting
      if (isNavigatingRef.current && selectedId === item.id) {
        if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
        triggerNavigation(item);
        return;
      }

      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      // Compute vector offset to drift selected card to the exact midpoint between the tree boundaries
      const el = cardRefs.current[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Tree boundaries from InkCharacterEngine (Left: 0.04 * width, Right: 0.94 * width)
        const treeLeftX = viewportWidth * 0.04;
        const treeRightX = viewportWidth * 0.94;
        const treeClearingCenterX = (treeLeftX + treeRightX) / 2; // Midpoint between trees (0.49 * width)
        const treeClearingCenterY = viewportHeight / 2;

        setCenterOffset({
          x: Math.round(treeClearingCenterX - cardCenterX),
          y: Math.round(treeClearingCenterY - cardCenterY),
        });
      }

      setSelectedId(item.id);

      // Trigger navigation after 5 seconds as the card finishes its display and fade-out
      navigationTimerRef.current = setTimeout(() => {
        triggerNavigation(item);
      }, 5000);
    },
    [selectedId, triggerNavigation]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => {
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (isNavigatingRef.current) {
        // Allow pressing Enter or Space to skip immediately while card is centered
        if (e.key === 'Enter' || e.key === ' ') {
          const currentItem = PORTAL_ITEMS.find((it) => it.id === selectedId);
          if (currentItem) {
            if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
            triggerNavigation(currentItem);
          }
        }
        return;
      }

      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (isTyping) return;

      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        if (PORTAL_ITEMS[idx]) {
          handleSelect(PORTAL_ITEMS[idx], idx);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSelect, selectedId, triggerNavigation]);

  return (
    <motion.div
      className="parchment-portal-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        selectedId
          ? { opacity: 1, transition: { duration: 0 } } // Instant reveal of next scene since card has already disappeared!
          : { opacity: 0, scale: 0.97, filter: 'blur(8px)', transition: { duration: 0.3 } }
      }
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Editorial Hero Block */}
      <motion.div
        className="parchment-hero-block"
        initial={{ opacity: 0, y: -16 }}
        animate={
          selectedId
            ? { opacity: 0, y: -30, filter: 'blur(4px)', transition: { duration: 0.5, ease: 'easeIn' } }
            : { opacity: 1, y: 0, filter: 'blur(0px)' }
        }
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1 className="parchment-hero-title">
          <KineticGlyphText
            text="JAMES TAYLOR"
            maxDistance={150}
            repelForce={35}
            zElevation={70}
          />
        </h1>
      </motion.div>

      {/* Parchment Portal Grid with 3D Perspective */}
      <nav
        className="parchment-matrix-grid"
        role="menu"
        aria-label="Main Directory"
        style={{ perspective: 1200 }}
      >
        {PORTAL_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === idx && !selectedId;
          const isSelected = selectedId === item.id;
          const isOtherFalling = selectedId && !isSelected;

          // Compute randomized falling leaf aerodynamics per card
          const leafData = isOtherFalling
            ? computeRandomizedFallingLeafPhysics(idx, PORTAL_ITEMS.length)
            : null;

          return (
            <motion.div
              key={item.id}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`parchment-portal-card ${
                isHovered ? 'parchment-portal-card--active' : ''
              } ${isSelected ? 'parchment-portal-card--selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${item.title}: ${item.tag} - Press Enter or Space to open`}
              initial={{ opacity: 0, y: 18 }}
              animate={
                isSelected
                  ? {
                      // Move smoothly to center without enlarging on mobile for maximum legibility
                      x: [0, centerOffset.x, centerOffset.x, centerOffset.x],
                      y: [0, centerOffset.y, centerOffset.y, centerOffset.y],
                      scale: isMobile ? [1, 1, 1, 1] : [1, 1.04, 1.04, 1.04],
                      rotateZ: isMobile ? [0, 0, 0, 0] : [0, -0.2, 0, 0],
                      opacity: [1, 1, 1, 0],
                      filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(4px)'],
                      zIndex: 100,
                      transition: {
                        duration: 5.0,
                        times: [0, 0.09, 0.92, 1], // Drifts to center by ~0.45s, holds until 4.6s, fades out by 5.0s
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }
                  : isOtherFalling
                  ? {
                      // Fall down like leaves at randomized rates with quick fade-out at ground contact
                      x: leafData.keyframes.x,
                      y: leafData.keyframes.y,
                      rotateZ: leafData.keyframes.rotateZ,
                      rotateX: leafData.keyframes.rotateX,
                      rotateY: leafData.keyframes.rotateY,
                      opacity: leafData.keyframes.opacity,
                      scale: leafData.keyframes.scale,
                      pointerEvents: 'none',
                      zIndex: 10,
                      transition: {
                        duration: leafData.duration,
                        delay: leafData.delay,
                        ease: 'easeInOut',
                      },
                    }
                  : { opacity: 1, y: 0, x: 0, rotateZ: 0, rotateX: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={{
                duration: 0.4,
                delay: selectedId ? 0 : 0.1 + idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => !selectedId && setHoveredIndex(idx)}
              onMouseLeave={() => !selectedId && setHoveredIndex(null)}
              onFocus={() => !selectedId && setHoveredIndex(idx)}
              onBlur={() => !selectedId && setHoveredIndex(null)}
              onClick={() => handleSelect(item, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(item, idx);
                }
              }}
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%',
                cursor: 'pointer',
              }}
            >
              {/* Pure SVG Organic Outline & Body */}
              <InkedCardBorder isHovered={isHovered} isSelected={isSelected} />

              <div className="portal-card-top-row">
                <div className="portal-card-icon-box">
                  <Icon size={20} />
                </div>

                <div className="portal-card-key-chip">{item.keyNum}</div>
              </div>

              <h2 className="portal-card-title">{item.title}</h2>
              <p className="portal-card-desc">{item.desc}</p>

              <div className="portal-card-meta-row">
                <span className="portal-card-tag">{item.tag}</span>
                <ArrowRight size={16} className="portal-card-arrow" />
              </div>
            </motion.div>
          );
        })}
      </nav>
    </motion.div>
  );
}
