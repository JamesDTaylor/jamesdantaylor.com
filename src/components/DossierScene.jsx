import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export default function DossierScene({ onBack, onStartQuest, onInspectArsenal }) {
  return (
    <motion.div
      className="narrative-scene-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Back Navigation */}
      <button
        className="scene-back-btn"
        onClick={onBack}
      >
        <ArrowLeft size={13} /> Back to Overview
      </button>

      {/* Main Narrative Card */}
      <div className="narrative-card">
        <header className="narrative-header">
          <span className="narrative-tag">Chapter I · Story & Purpose</span>
          <h1 className="narrative-title">
            Understanding the mind, living with chronic illness, and designing for real people.
          </h1>
        </header>

        <div className="narrative-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p className="narrative-lead">
            I am currently completing my <strong>MSc in Neuroscience</strong> in the Department of Psychiatry at Stellenbosch University. 
            My research investigates how <strong>virtual reality (VR) environments</strong> can help reduce autonomic stress responses 
            and offer accessible support for anxiety disorders.
          </p>

          <p className="narrative-paragraph">
            This work is deeply personal. Living with <strong>Multiple Sclerosis (MS)</strong> completely reshaped how I navigate life and work. 
            Experiencing cognitive fatigue and physical uncertainty taught me the vital importance of pacing, mental clarity, and low-friction design. 
            I bring this perspective to every digital health project, UX study, and coaching relationship—ensuring what we build genuinely respects human limits.
          </p>

          {/* 3 Digestible Pillars */}
          <div className="narrative-pillars-row">
            <div className="narrative-pillar-item">
              <span className="pillar-num">01 / RESEARCH</span>
              <h3 className="pillar-name">VR for Anxiety</h3>
              <p className="pillar-desc">
                Studying how immersive virtual grounding and sensory environments can soothe acute stress and support therapy.
              </p>
            </div>

            <div className="narrative-pillar-item">
              <span className="pillar-num">02 / LIVED ADVOCACY</span>
              <h3 className="pillar-name">Living with MS</h3>
              <p className="pillar-desc">
                Founder of James Does Coaching, sharing practical energy-management and pacing strategies for people with chronic illness.
              </p>
            </div>

            <div className="narrative-pillar-item">
              <span className="pillar-num">03 / HUMANE UX</span>
              <h3 className="pillar-name">Thoughtful Design</h3>
              <p className="pillar-desc">
                Creating digital tools and workflows that reduce cognitive overload and feel effortless to use.
              </p>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <footer className="narrative-actions-row">
          <button
            className="clean-primary-btn"
            onClick={onStartQuest}
          >
            Start a Conversation <ArrowRight size={14} />
          </button>

          <button
            className="clean-secondary-btn"
            onClick={onInspectArsenal}
          >
            Explore Selected Projects
          </button>

          <a
            href="https://www.linkedin.com/in/jamesdantaylor/"
            target="_blank"
            rel="noopener noreferrer"
            className="clean-ghost-link"
          >
            Connect on LinkedIn <ExternalLink size={13} />
          </a>
        </footer>
      </div>
    </motion.div>
  );
}
