import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, GraduationCap, Compass, Code, Award } from 'lucide-react';

export default function TalentTreeScene({ onBack, onStartBriefWithTalents }) {
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

      {/* Main Header */}
      <header className="narrative-header">
        <span className="narrative-tag">Chapter III · Education & Background</span>
        <h1 className="narrative-title">
          My academic studies, design foundation, and technical background.
        </h1>
      </header>

      {/* 4 Academic Cards */}
      <div className="background-grid">
        {/* Higher Education */}
        <div className="bg-card">
          <div className="bg-card-head">
            <GraduationCap size={20} color="#8b1e1e" />
            <h3>University Education</h3>
          </div>
          <div className="bg-list">
            <div className="bg-item">
              <span className="bg-period">2024 - 2026</span>
              <h4 className="bg-title">MSc in Neuroscience (Psychiatry)</h4>
              <span className="bg-institution">Stellenbosch University</span>
              <p className="bg-note">Clinical research exploring virtual reality as an intervention for anxiety disorders.</p>
            </div>
            <div className="bg-item">
              <span className="bg-period">2015 - 2016</span>
              <h4 className="bg-title">BSc Honours in Cognitive Neuroscience</h4>
              <span className="bg-institution">University of the Witwatersrand</span>
              <p className="bg-note">Studied cognitive neuropsychology, memory, and experimental design methods.</p>
            </div>
            <div className="bg-item">
              <span className="bg-period">2011 - 2014</span>
              <h4 className="bg-title">BSc in Psychology & Applied Life Sciences</h4>
              <span className="bg-institution">University of the Witwatersrand</span>
            </div>
          </div>
        </div>

        {/* UX & Cognitive Design */}
        <div className="bg-card">
          <div className="bg-card-head">
            <Compass size={20} color="#b45309" />
            <h3>UX & Human-Centred Design</h3>
          </div>
          <div className="bg-list">
            <div className="bg-item">
              <h4 className="bg-title">Google UX Design Specialization</h4>
              <span className="bg-institution">Certified UX Researcher</span>
              <p className="bg-note">User empathy mapping, intuitive wireframing, cognitive load reduction, and accessibility audits.</p>
            </div>
            <div className="bg-item">
              <h4 className="bg-title">Cognitive Ergonomics & Digital Health</h4>
              <span className="bg-institution">Applied Practice</span>
              <p className="bg-note">Designing patient-facing tools and VR environments that respect sensory limits and mental energy.</p>
            </div>
          </div>
        </div>

        {/* Data & Code */}
        <div className="bg-card">
          <div className="bg-card-head">
            <Code size={20} color="#5a3825" />
            <h3>Data & Practical Tools</h3>
          </div>
          <div className="bg-list">
            <div className="bg-item">
              <h4 className="bg-title">Python for Data Science & Analytics</h4>
              <span className="bg-institution">Applied Modeling</span>
              <p className="bg-note">Customer clustering, statistical data pipelines, and exploratory data visualization in Python.</p>
            </div>
            <div className="bg-item">
              <h4 className="bg-title">Google Cloud Platform Essentials</h4>
              <span className="bg-institution">Cloud & Automation</span>
              <p className="bg-note">Building cloud automation scripts, web apps, and live data synchronization pipelines.</p>
            </div>
          </div>
        </div>

        {/* Honors & Awards */}
        <div className="bg-card">
          <div className="bg-card-head">
            <Award size={20} color="#8b1e1e" />
            <h3>Honors & Achievements</h3>
          </div>
          <div className="bg-list">
            <div className="bg-item">
              <h4 className="bg-title">Golden Key International Honour Society</h4>
              <span className="bg-institution">Top 15% Academic Standing</span>
            </div>
            <div className="bg-item">
              <h4 className="bg-title">Postgraduate Merit Award</h4>
              <span className="bg-institution">University of the Witwatersrand</span>
            </div>
            <div className="bg-item">
              <h4 className="bg-title">$100,000 Google Grant Award</h4>
              <span className="bg-institution">Food & Trees for Africa Data Initiative</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <footer className="narrative-actions-row">
        <button
          className="clean-primary-btn"
          onClick={() => onStartBriefWithTalents('Neuroscience, Humane UX & Data Science')}
        >
          Talk About Working Together <ArrowRight size={14} />
        </button>
      </footer>
    </motion.div>
  );
}
