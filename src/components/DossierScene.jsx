import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Feather, Sparkles } from 'lucide-react';

/* ─── Whimsical Hand-Drawn Ink Flourish Divider ─── */
const InkFlourish = () => (
  <svg
    className="dossier-flourish-svg"
    viewBox="0 0 320 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10,12 C60,12 90,4 130,12 C150,16 155,6 160,12 C165,18 170,8 190,12 C230,20 260,12 310,12"
      stroke="rgba(139, 30, 30, 0.45)"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="160" cy="12" r="3.5" fill="#8b1e1e" />
    <circle cx="145" cy="12" r="2" fill="rgba(139, 30, 30, 0.6)" />
    <circle cx="175" cy="12" r="2" fill="rgba(139, 30, 30, 0.6)" />
    <path
      d="M152,7 Q160,2 168,7"
      stroke="rgba(139, 30, 30, 0.5)"
      strokeWidth="0.8"
      fill="none"
    />
    <path
      d="M152,17 Q160,22 168,17"
      stroke="rgba(139, 30, 30, 0.5)"
      strokeWidth="0.8"
      fill="none"
    />
  </svg>
);

/* ─── Whimsical Wax Seal SVG Badge ─── */
const WaxSealBadge = () => (
  <motion.div
    className="dossier-wax-seal"
    initial={{ scale: 0, rotate: -30 }}
    animate={{ scale: 1, rotate: -6 }}
    transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 220 }}
    whileHover={{ rotate: 0, scale: 1.08 }}
  >
    <svg viewBox="0 0 70 70" className="wax-seal-svg">
      <defs>
        <radialGradient id="waxGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#b92b27" />
          <stop offset="60%" stopColor="#8b1e1e" />
          <stop offset="100%" stopColor="#540e0e" />
        </radialGradient>
        <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="rgba(26,15,10,0.5)" />
        </filter>
      </defs>
      {/* Irregular organic melted wax perimeter */}
      <path
        d="M35,4 C45,3 54,8 60,16 C66,24 67,35 63,44 C59,53 52,61 42,65 C32,69 21,65 13,59 C5,53 2,42 4,32 C6,22 13,12 22,6 C26,4 30,5 35,4 Z"
        fill="url(#waxGrad)"
        filter="url(#waxShadow)"
      />
      {/* Inner stamped ring */}
      <circle cx="35" cy="35" r="23" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="3 2" fill="none" opacity="0.75" />
      {/* Monogram / Emblem */}
      <text
        x="35"
        y="42"
        fontFamily="Cinzel, serif"
        fontSize="20"
        fontWeight="bold"
        fill="#fef08a"
        textAnchor="middle"
        letterSpacing="1"
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))' }}
      >
        JT
      </text>
    </svg>
  </motion.div>
);

export default function DossierScene({ onBack, onStartQuest, onInspectArsenal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      className="narrative-scene-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Back Navigation Button */}
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

      {/* Antique Parchment Letter Card */}
      <motion.div
        className="dossier-letter-card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        {/* Wax seal top-right */}
        <WaxSealBadge />

        {/* Header Ribbon / Chapter Inscription */}
        <header className="dossier-header">
          <div className="dossier-tag-wrapper">
            <span className="narrative-tag">
              <Feather size={13} style={{ display: 'inline', marginRight: '5px' }} />
              Chapter I · Summary & Manifesto
            </span>
          </div>

          <h1 className="dossier-name-title">James Taylor</h1>

          <div className="dossier-headline-pill">
            <span>MSc Neuroscience Candidate (Psychiatry) · Gauteng, South Africa</span>
          </div>
        </header>

        <InkFlourish />

        {/* Verbatim LinkedIn Summary with illuminated initial */}
        <div className="dossier-body">
          <p className="dossier-manuscript-text">
            <span className="dossier-dropcap">I</span> am an MSc Neuroscience candidate in the
            Department of Psychiatry researching the feasibility of virtual reality-based
            interventions for anxiety disorders. Informed by personal experience with multiple
            sclerosis and a multidisciplinary professional background, I explore approaches that
            integrate neuroscience, behavioural science, technology, and ethical perspectives to
            address real-world mental health needs. I am particularly interested in collaborating
            across academia, healthcare, and industry to design and evaluate user-centred XR and
            digital mental health solutions.
          </p>
        </div>

        {/* Vintage Actions Footer */}
        <footer className="dossier-actions-row">
          <motion.button
            type="button"
            className="clean-primary-btn"
            onClick={onStartQuest}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Start a Conversation <ArrowRight size={14} />
          </motion.button>

          <motion.button
            type="button"
            className="clean-secondary-btn"
            onClick={onInspectArsenal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Experience
          </motion.button>

          <a
            href="https://www.linkedin.com/in/jamesdantaylor/"
            target="_blank"
            rel="noopener noreferrer"
            className="clean-ghost-link"
          >
            www.linkedin.com/in/jamesdantaylor <ExternalLink size={13} />
          </a>
        </footer>
      </motion.div>
    </motion.div>
  );
}
