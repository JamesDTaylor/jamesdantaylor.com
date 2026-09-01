import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Building2,
  MapPin,
  Calendar,
  Compass,
  Scroll,
  BookOpen,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

/* ─── Cartographic Seal Insignia for Role Types ─── */
const RoleInsignia = ({ index }) => {
  const insignias = ['Ψ', '⚙', '✦', '⌘', '⌥', '❦', '𓆣'];
  const symbol = insignias[index % insignias.length];

  return (
    <div className="chronicle-insignia-badge">
      <span className="chronicle-insignia-symbol">{symbol}</span>
    </div>
  );
};

const EXPERIENCES = [
  {
    id: 'stellenbosch',
    company: 'Stellenbosch University',
    role: 'Graduate Student',
    period: 'January 2025 - April 2026 (1 year 4 months)',
    location: 'Stellenbosch, South Africa',
    category: 'research',
    description:
      "I'm an MSc Neuroscience candidate in the department of Psychiatry researching the feasibility of virtual reality-based interventions for anxiety disorders.",
    bullets: [],
  },
  {
    id: 'james-does-coaching',
    company: 'James Does Coaching',
    role: 'Career Support for People with Chronic Illness',
    period: 'May 2023 - December 2024 (1 year 8 months)',
    location: 'South Africa',
    category: 'coaching',
    description:
      'I provided tailored career coaching to individuals managing chronic illnesses, supporting their transition into new professional pathways with empathy, evidence-based strategies, and resilience-focused guidance.',
    bullets: [],
  },
  {
    id: 'breaking-boundaries',
    company: 'Breaking Boundaries Support Services Inc.',
    role: 'Digital Marketing Consultant',
    period: 'June 2021 - September 2022 (1 year 4 months)',
    location: 'Canada',
    category: 'strategy',
    description:
      'Leveraged a multidisciplinary foundation in data and analytics to amplify awareness and execute high-impact digital marketing strategies for clients focused on mental health advocacy, education, and outreach. Provided data-driven insights and creative direction to design targeted campaigns that resonated with audiences and aligned with business objectives.',
    bullets: [
      'Business Analysis to assess the current state of the business and where to improve to maximise business value.',
      'Analyzed and planned digital marketing strategies based on data and research.',
      'Evaluated conversion rates and marketing initiatives.',
      'Analyzed web traffic to determine what marketing tactics are working and which are not.',
    ],
  },
  {
    id: 'independent-consultant',
    company: 'Independent Consultant',
    role: 'Data Specialist',
    period: 'May 2020 - September 2022 (2 years 5 months)',
    location: 'Gauteng, South Africa',
    category: 'data',
    description: '',
    bullets: [
      'Designed and deployed tailored M&E web applications and engineered custom data-capturing systems featuring robust authorization protocols and analytical capabilities.',
      'Spearheaded scalable Google Cloud Platform (GCP) architecture solutions to enhance operational efficiency.',
      'Automated administrative workflows using Google Apps Script - streamlining backups, form integrations, and real-time data synchronization across Cloud SQL and Cloud Storage.',
    ],
  },
  {
    id: 'insight-analytics',
    company: 'Insight Analytics',
    role: 'Data Analyst',
    period: 'August 2017 - January 2021 (3 years 6 months)',
    location: 'South Africa',
    category: 'data',
    description: '',
    bullets: [
      'Determined the reputation of a large retail holding company (Massmart) by analysing surveys from their suppliers, NGOs and Employees (based on their perceptions) using Python programming language and Microsoft Excel.',
      'Determined public awareness of an NGO and provided insights into how they could expand that awareness from data based on other, similar, successful social activist groups.',
      'Established customer archetypes (Black Friday), through segmentation using K-means clustering in Python and Microsoft Excel, for national retail stores (Makro) per province to successfully influence their marketing strategies.',
    ],
  },
  {
    id: 'food-and-trees',
    company: 'Food & Trees for Africa',
    role: 'Data Specialist · Intern to the Executive Director',
    period: '1 year 4 months (February 2019 - May 2020)',
    location: 'Gauteng, South Africa',
    category: 'data',
    description:
      "Executive Director's Internship at Food & Trees for Africa, a leading Section 21 Non-Profit that addresses food security and greening and environmental sustainability, where I learnt a wide range of skills. My innovative approach utilising my educational background and experience ultimately lead to my role as a Data Specialist:",
    bullets: [
      'Managed and Implemented a variety of Data Projects and Systems across all organisational departments including for field workers, assessors, data capturers, finance and procurement.',
      'Developed web applications, custom forms, real-time analysis with bespoke business intelligence capability using Google Apps Script, Google Sheets, HTML, CSS and JavaScript.',
      'Farmed historic and archived data across the organisation by coding add-ons for Google Forms, for data capturers, that feed that data into current data workflows for analysis.',
      'Created bots in JavaScript that wrangle financial data from thousands of spreadsheets for consolidation and analysis preparation.',
      'Proposal writing and development including securing a 100k grant from Google for the data project I was developing and coordinating.',
      'Business communications including developing and streamlining internal tools to automate processes, saving the company time and resources.',
      'Company administration',
      'Compliance including research involving best practices for BBBEE and maintaining NPO and Social Welfare Status',
      'Company management and strategy research in order to promote awareness, driving CSI and Enterprise development initiatives.',
      'Market research which included analysing competitors and identifying potential Individual and Corporate sponsors.',
      'Project management, including managing data projects by overseeing the implementation and custom development of CRM solutions, including Salesforce onboarding and training.',
    ],
  },
  {
    id: 'wits-roles',
    company: 'University of the Witwatersrand',
    role: 'Graduate Teaching Assistant · Graduate Research Assistant',
    period: '3 years (January 2013 - December 2015)',
    location: 'Johannesburg, South Africa',
    category: 'research',
    description:
      'I worked for postgraduate students and professors throughout my studies at Wits (3 years):',
    bullets: [
      'Provided lecturing support and coaching to tutoring medical students in Psychology, in a class environment.',
      'Essay marking and student liaison.',
      'Exam invigilation.',
      'Research (specifically, water chemical testing for plant species and recording data (1 year), maintenance and care of beetle populations and record keeping (the researcher was awarded an Ig Nobel prize for his work with these beetles) (1 year)',
      'Human affect reporting through observing student behaviour, contributing to teaching computer software to identify inattentive students by analysing video recordings of lectures (2 months)',
    ],
  },
];

export default function ArsenalScene({ onBack, onStartBriefWithProject }) {
  const [selectedExperience, setSelectedExperience] = useState(null);

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

      {/* Main Header */}
      <header className="narrative-header">
        <span className="narrative-tag">
          <Scroll size={13} style={{ display: 'inline', marginRight: '5px' }} />
          Chapter II · Experience Chronicles
        </span>
        <h1 className="narrative-title">Professional Expeditions & Roles</h1>
        <p className="narrative-subtitle-ink">
          From neuroscience research in psychiatry to data architecture, digital health, and specialized career coaching.
        </p>
      </header>

      {/* Chronicle Cards Grid */}
      <div className="chronicle-grid">
        {EXPERIENCES.map((exp, idx) => (
          <motion.div
            key={exp.id}
            className="chronicle-card"
            role="button"
            tabIndex={0}
            aria-label={`View details for ${exp.role} at ${exp.company}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + idx * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => setSelectedExperience(exp)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedExperience(exp);
              }
            }}
          >
            {/* Top Ornamental Header */}
            <div className="chronicle-card-header">
              <div className="chronicle-org-box">
                <RoleInsignia index={idx} />
                <div>
                  <h4 className="chronicle-org-name">{exp.company}</h4>
                  {exp.location && (
                    <span className="chronicle-location-tag">
                      <MapPin size={11} /> {exp.location}
                    </span>
                  )}
                </div>
              </div>
              <span className="chronicle-date-badge">
                <Calendar size={11} /> {exp.period}
              </span>
            </div>

            {/* Role Title */}
            <h3 className="chronicle-role-title">{exp.role}</h3>

            {/* Snippet / Lead */}
            {exp.description && (
              <p className="chronicle-desc-snippet">{exp.description}</p>
            )}

            {exp.bullets.length > 0 && !exp.description && (
              <p className="chronicle-desc-snippet">
                • {exp.bullets[0]}
              </p>
            )}

            {/* Card Footer Link */}
            <div className="chronicle-card-footer">
              {exp.bullets.length > 0 && (
                <span className="chronicle-bullet-count">
                  {exp.bullets.length} Key Achievements
                </span>
              )}
              <span className="chronicle-inspect-prompt">
                Examine Ledger <ArrowRight size={13} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Antique Ledger Modal for Full Details */}
      <AnimatePresence>
        {selectedExperience && (
          <motion.div
            className="minimal-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExperience(null)}
          >
            <motion.div
              className="minimal-modal-card chronicle-modal-parchment"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="modal-close-btn"
                onClick={() => setSelectedExperience(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className="chronicle-modal-header">
                <div className="chronicle-modal-seal">
                  <BookOpen size={22} color="#8b1e1e" />
                </div>
                <div>
                  <span className="work-tag">{selectedExperience.company}</span>
                  {selectedExperience.location && (
                    <span className="work-metric-chip" style={{ marginLeft: '0.5rem' }}>
                      <MapPin size={12} style={{ display: 'inline' }} /> {selectedExperience.location}
                    </span>
                  )}
                  <h2 className="modal-work-title">{selectedExperience.role}</h2>
                  <span className="modal-work-subtitle">
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedExperience.period}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedExperience.description && (
                <p className="modal-work-story">
                  {selectedExperience.description}
                </p>
              )}

              {/* Full Verbatim Bullets */}
              {selectedExperience.bullets.length > 0 && (
                <div className="chronicle-bullets-list">
                  <span className="chronicle-section-subhead">
                    <Sparkles size={13} /> Detailed Records & Contributions
                  </span>
                  <ul>
                    {selectedExperience.bullets.map((bullet, bIdx) => (
                      <motion.li
                        key={bIdx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + bIdx * 0.03 }}
                        className="chronicle-bullet-item"
                      >
                        <span className="chronicle-bullet-quill">✦</span>
                        <span>{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action */}
              <div className="narrative-actions-row" style={{ marginTop: '1.2rem' }}>
                <motion.button
                  type="button"
                  className="clean-primary-btn"
                  onClick={() => {
                    const title = selectedExperience.role;
                    setSelectedExperience(null);
                    onStartBriefWithProject(title);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Discuss Collaboration on This Domain <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
