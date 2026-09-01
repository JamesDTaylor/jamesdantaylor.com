import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/* ─── Cursor-Interactive Architectural Signpost Cap with Spring Leaves ─── */
const SignpostCapWithLeaves = () => {
  const capRef = useRef(null);
  const [sway, setSway] = useState(0);
  const [isNear, setIsNear] = useState(false);
  const [rustle, setRustle] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!capRef.current) return;
      const rect = capRef.current.getBoundingClientRect();
      const capCenterX = rect.left + rect.width / 2;
      const capCenterY = rect.top + (rect.height * 30) / 54; // apex anchor point

      const dx = e.clientX - capCenterX;
      const dy = e.clientY - capCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxProximity = 220;

      if (dist < maxProximity) {
        const force = Math.pow(1 - dist / maxProximity, 1.3);
        // Deflect leaves with wind elasticity
        const swayVal = (dx / maxProximity) * 34 * force;
        setSway(swayVal);
        setIsNear(true);
      } else {
        setSway(0);
        setIsNear(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLeafTouch = () => {
    setRustle(1);
    setTimeout(() => setRustle(0), 450);
  };

  return (
    <svg
      ref={capRef}
      className="ink-post-cap-svg"
      viewBox="0 0 64 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', cursor: 'pointer', pointerEvents: 'auto' }}
      onClick={handleLeafTouch}
      onMouseEnter={handleLeafTouch}
    >
      {/* Eaves collar linking cap to post shaft */}
      <path
        d="M 16 46 L 48 46 L 44 54 L 20 54 Z"
        fill="#1a0f0a"
      />

      {/* Hand-carved pitched wooden cap roof */}
      <path
        d="M 14 46 L 32 30 L 50 46 Z"
        fill="#1a0f0a"
        stroke="#1a0f0a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Subtle architectural cap ridge line */}
      <line x1="32" y1="30" x2="32" y2="46" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

      {/* ── Symmetrical Canopy Leaves embedded at apex (32, 30) (Right-Side Up & Cursor Reactive) ── */}
      <g transform="translate(32, 30)">
        {/* Center upright leaf (pointing straight UP into the sky) */}
        <g
          transform={`rotate(${sway * 0.85 + (rustle ? 5 : 0)})`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <path
            d="M0,0 Q5,-12 2,-25 Q0,-28 -2,-25 Q-5,-12 0,0Z"
            fill={isNear ? 'rgba(82, 128, 68, 0.95)' : 'rgba(67, 97, 55, 0.85)'}
            stroke="#1a0f0a"
            strokeWidth="0.8"
          />
          <path d="M0,0 Q1,-10 0,-21" stroke="rgba(33, 48, 26, 0.6)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Left inner leaf (base -28deg, pointing UP-LEFT) */}
        <g
          transform={`rotate(${-28 + sway * 1.05 + (rustle ? -8 : 0)})`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <path
            d="M0,0 Q4,-10 2,-21 Q0,-23 -2,-21 Q-4,-10 0,0Z"
            fill={isNear ? 'rgba(82, 128, 68, 0.88)' : 'rgba(67, 97, 55, 0.75)'}
            stroke="#1a0f0a"
            strokeWidth="0.7"
          />
          <path d="M0,0 Q1,-8 0,-17" stroke="rgba(33, 48, 26, 0.5)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Left outer leaf (base -55deg, pointing UP-LEFT) */}
        <g
          transform={`rotate(${-55 + sway * 1.25 + (rustle ? -12 : 0)})`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <path
            d="M0,0 Q3,-8 1,-16 Q0,-18 -1,-16 Q-3,-8 0,0Z"
            fill={isNear ? 'rgba(82, 128, 68, 0.78)' : 'rgba(67, 97, 55, 0.65)'}
            stroke="#1a0f0a"
            strokeWidth="0.7"
          />
        </g>

        {/* Right inner leaf (base +28deg, pointing UP-RIGHT) */}
        <g
          transform={`rotate(${28 + sway * 1.05 + (rustle ? 8 : 0)})`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <path
            d="M0,0 Q4,-10 2,-21 Q0,-23 -2,-21 Q-4,-10 0,0Z"
            fill={isNear ? 'rgba(82, 128, 68, 0.88)' : 'rgba(67, 97, 55, 0.75)'}
            stroke="#1a0f0a"
            strokeWidth="0.7"
          />
          <path d="M0,0 Q1,-8 0,-17" stroke="rgba(33, 48, 26, 0.5)" strokeWidth="0.5" fill="none" />
        </g>

        {/* Right outer leaf (base +55deg, pointing UP-RIGHT) */}
        <g
          transform={`rotate(${55 + sway * 1.25 + (rustle ? 12 : 0)})`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <path
            d="M0,0 Q3,-8 1,-16 Q0,-18 -1,-16 Q-3,-8 0,0Z"
            fill={isNear ? 'rgba(82, 128, 68, 0.78)' : 'rgba(67, 97, 55, 0.65)'}
            stroke="#1a0f0a"
            strokeWidth="0.7"
          />
        </g>
      </g>
    </svg>
  );
};

/* ─── Organic Hand-Hewn Wooden Post Shaft (Silhouette Only) ─── */
const SignpostShaftSilhouette = () => (
  <svg
    className="ink-post-shaft-svg"
    viewBox="0 0 64 800"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Pure solid silhouette with organic subtle timber curves */}
    <path
      d="M 20 0 
         C 19 80, 21.5 160, 19.5 240 
         C 18 320, 21 400, 19 480 
         C 17.5 560, 20.5 640, 18 720 
         C 17 760, 15.5 785, 14.5 800 
         L 49.5 800 
         C 48.5 785, 47 760, 46 720 
         C 43.5 640, 46.5 560, 45 480 
         C 43 400, 46 320, 44.5 240 
         C 42.5 160, 45 80, 44 0 
         Z"
      fill="#1a0f0a"
    />
  </svg>
);

/* ─── Completed Degrees & Background from Profile ─── */
const BRANCHES = [
  // ── EDUCATION ──
  {
    id: 'edu-msc-neuro',
    year: '2024–2026',
    heading: 'MSc Neuroscience',
    side: 'right',
    entries: [
      {
        primary: 'Stellenbosch University',
        secondary: 'MSc (Neuroscience), Psychiatry',
        meta: 'November 2024 - December 2026',
        summary:
          "I'm an MSc Neuroscience candidate in the Department of Psychiatry researching the feasibility of virtual reality-based interventions for anxiety disorders.",
      },
    ],
  },
  {
    id: 'edu-bsc-hons',
    year: '2015–2016',
    heading: 'BSc Honours',
    side: 'left',
    entries: [
      {
        primary: 'University of the Witwatersrand',
        secondary: 'Bachelor of Science with Honours, Cognitive Neuroscience/Psychology',
        meta: '2015 - 2016',
        summary:
          'Cognitive neuroscience and psychology honours programme, accompanied by Graduate Teaching Assistant and Graduate Research Assistant responsibilities.',
      },
    ],
  },
  {
    id: 'edu-bsc',
    year: '2011–2014',
    heading: 'Bachelor of Science',
    side: 'right',
    entries: [
      {
        primary: 'University of the Witwatersrand',
        secondary: 'Bachelor of Science',
        meta: '2011 - 2014',
        summary:
          'Undergraduate scientific training at Wits spanning biological sciences, psychology, and academic research assistantships.',
      },
    ],
  },

  // ── CERTIFICATIONS ──
  {
    id: 'certifications',
    year: 'Credentials',
    heading: 'Certifications',
    side: 'left',
    entries: [
      { primary: 'Advertising on Facebook: Advanced' },
      { primary: 'Foundations of User Experience (UX) Design' },
      { primary: 'GCP Essentials' },
      { primary: 'Neural Network Visualizer Web App with Python' },
      { primary: 'Introduction to Python for Data Science' },
    ],
  },

  // ── HONORS-AWARDS ──
  {
    id: 'honors',
    year: 'Recognition',
    heading: 'Honors-Awards',
    side: 'right',
    entries: [
      { primary: 'Golden Key International Honour Society' },
      { primary: 'Postgraduate Merit Award' },
    ],
  },

  // ── LANGUAGES ──
  {
    id: 'languages',
    year: 'Languages',
    heading: 'Languages',
    side: 'left',
    languages: [
      { lang: 'English', level: 'Native or Bilingual' },
      { lang: 'Afrikaans', level: 'Professional Working' },
    ],
  },
];

export default function TalentTreeScene({ onBack, onStartBriefWithTalents }) {
  // All tabs open by default (user can toggle closed if desired)
  const [collapsedIds, setCollapsedIds] = useState(new Set());

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const toggleBranch = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.div
      className="narrative-scene-container talent-tree-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.button
        type="button"
        className="scene-back-btn"
        onClick={onBack}
        whileHover={{ x: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Back to Overview"
      >
        <ArrowLeft size={14} /> Back to Overview
      </motion.button>

      <header className="narrative-header">
        <span className="narrative-tag">Chapter III · Education & Background</span>
        <h1 className="narrative-title">Education, Certifications, Honors & Languages</h1>
      </header>

      {/* ── Sturdy Wooden Signpost ── */}
      <div className="ink-post-wrapper">
        {/* Organic wooden pole with proper cap, interactive leaves, and silhouette shaft */}
        <div className="ink-post-trunk">
          <SignpostCapWithLeaves />
          <SignpostShaftSilhouette />
        </div>

        {/* ── Branch Stations List ── */}
        <div className="ink-post-stations">
          {BRANCHES.map((branch, idx) => {
            const isRight = branch.side === 'right';
            const isExpanded = !collapsedIds.has(branch.id);
            const stationDelay = 0.08 + idx * 0.04;

            return (
              <motion.div
                key={branch.id}
                className={`ink-post-station ink-post-station--${branch.side}`}
                initial={{ opacity: 0, x: isRight ? 18 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: stationDelay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Station Branch Assembly: Directional Plank (Behind Post) + Suspended Scroll */}
                <div className="ink-station-assembly">
                  {/* Directional Wooden Sign Plank */}
                  <motion.div
                    className={`ink-post-plank ink-post-plank--${branch.side}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${branch.heading} (${branch.year}) - Click to toggle`}
                    onClick={() => toggleBranch(branch.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleBranch(branch.id);
                      }
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Metal Iron Stud Accent */}
                    <span className="ink-plank-stud">✦</span>

                    <span className="ink-post-plank-year">{branch.year}</span>
                    <h2 className="ink-post-plank-title">{branch.heading}</h2>

                    <span className="ink-plank-toggle-hint">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </motion.div>

                  {/* Suspended Parchment Scroll Card (Open by default) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        className="ink-scroll-card"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{ originY: 0, overflow: 'hidden' }}
                      >
                        {/* Decorative hanging scroll curl top */}
                        <svg className="scroll-curl" viewBox="0 0 200 8" preserveAspectRatio="none">
                          <path
                            d="M0 8 Q20 0,40 4 Q60 8,80 2 Q100 -1,120 4 Q140 8,160 2 Q180 -1,200 5"
                            stroke="rgba(90,56,37,0.25)"
                            strokeWidth="1.2"
                            fill="none"
                          />
                        </svg>

                        <div className="ink-scroll-content">
                          {/* Degree / Credential Entries with Verbatim Summaries */}
                          {branch.entries &&
                            branch.entries.map((entry, eIdx) => (
                              <div key={eIdx} className="ink-scroll-entry">
                                <h3 className="ink-scroll-primary">{entry.primary}</h3>
                                {entry.secondary && (
                                  <span className="ink-scroll-secondary">{entry.secondary}</span>
                                )}
                                {entry.meta && (
                                  <span className="ink-scroll-meta">{entry.meta}</span>
                                )}
                                {entry.summary && (
                                  <p className="ink-scroll-desc">{entry.summary}</p>
                                )}
                              </div>
                            ))}

                          {/* Languages */}
                          {branch.languages && (
                            <div className="ink-scroll-entry">
                              <span className="ink-scroll-meta">Languages</span>
                              <div className="ink-lang-list">
                                {branch.languages.map((l, lIdx) => (
                                  <div key={lIdx} className="ink-scroll-lang">
                                    <strong>{l.lang}</strong> <em>({l.level})</em>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Decorative scroll curl bottom */}
                        <svg className="scroll-curl" viewBox="0 0 200 8" preserveAspectRatio="none">
                          <path
                            d="M0 0 Q20 8,40 4 Q60 0,80 6 Q100 9,120 4 Q140 0,160 6 Q180 9,200 3"
                            stroke="rgba(90,56,37,0.25)"
                            strokeWidth="1.2"
                            fill="none"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <footer className="narrative-actions-row" style={{ marginTop: '1.2rem', marginBottom: '0.5rem', position: 'relative', zIndex: 10 }}>
        <motion.button
          type="button"
          className="clean-primary-btn"
          onClick={() => onStartBriefWithTalents('Collaborative Projects')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Talk About Working Together <ArrowRight size={14} />
        </motion.button>
      </footer>
    </motion.div>
  );
}
