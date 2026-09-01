import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const WORKS = [
  {
    id: 'vr-anxiety',
    title: 'VR Anxiety Interventions',
    subtitle: 'MSc Psychiatry Research · Stellenbosch University',
    category: 'VR & Mental Health',
    metric: 'Clinical Study',
    shortDesc: 'Researching how immersive virtual reality environments can help soothe autonomic nervous system responses in people experiencing anxiety.',
    fullStory: 'Exploring how multisensory grounding and peaceful virtual environments can help people regulate stress and calm their nervous system. The project brings together clinical psychiatry methods with accessible, compassionate spatial design.',
    meta: ['Stellenbosch University', '2024 - 2026', 'Clinical VR Research', 'Psychiatry Dept'],
  },
  {
    id: 'coaching-ms',
    title: 'James Does Coaching',
    subtitle: 'Founder & Resilience Coach',
    category: 'Chronic Illness',
    metric: 'Pacing Toolkits',
    shortDesc: 'Practical career coaching, energy management frameworks, and pacing tools for professionals living with chronic health conditions.',
    fullStory: 'Born directly from my own journey living with Multiple Sclerosis. I created practical pacing toolkits, Spoon Theory energy roadmaps, and career transition support to help people thrive without burning out their physical reserves.',
    meta: ['Independent Platform', '2023 - Present', 'MS Advocacy', 'Pacing & Wellbeing'],
  },
  {
    id: 'ftfa-grant',
    title: 'Food & Trees for Africa Systems',
    subtitle: '$100,000 Google Grant & Cloud Workflows',
    category: 'Non-Profit Tech',
    metric: '$100k Google Grant',
    shortDesc: 'Secured a $100k Google Grant and built automated data synchronization tools to track environmental and tree-planting impact across South Africa.',
    fullStory: 'Designed and deployed automated reporting tools and cloud workflows on Google Cloud Platform to help a leading South African non-profit measure and report community forestry projects with ease.',
    meta: ['Food & Trees for Africa', '2019 - 2020', '$100k Grant Award', 'Cloud Automation'],
  },
  {
    id: 'retail-clustering',
    title: 'Customer Behavior Modeling',
    subtitle: 'Python Machine Learning & Customer Insights',
    category: 'Data & Analytics',
    metric: 'Python Analytics',
    shortDesc: 'Analyzed customer behavioral patterns for major national retail groups (Massmart / Makro) using Python clustering techniques.',
    fullStory: 'Built data pipelines to analyze complex satisfaction surveys and purchasing behaviors, turning statistical models into clear, actionable insights that helped leaders better understand their customers.',
    meta: ['Insight Analytics', '2017 - 2021', 'Python Data Science', 'Behavioral Modeling'],
  },
];

const CATEGORIES = ['All', 'VR & Mental Health', 'Chronic Illness', 'Non-Profit Tech', 'Data & Analytics'];

export default function ArsenalScene({ onBack, onStartBriefWithProject }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedWork, setSelectedWork] = useState(null);

  const filteredWorks = WORKS.filter((w) => {
    if (activeFilter === 'All') return true;
    return w.category === activeFilter;
  });

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
        <span className="narrative-tag">Chapter II · Selected Projects</span>
        <h1 className="narrative-title">
          Things I've built, researched, and brought to life.
        </h1>
      </header>

      {/* Filter Chips Bar */}
      <div className="works-filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`work-filter-chip ${activeFilter === cat ? 'work-filter-chip--active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Spatial Works Grid */}
      <div className="works-grid">
        {filteredWorks.map((work) => (
          <motion.div
            key={work.id}
            className="work-spatial-card"
            whileHover={{ y: -3 }}
            onClick={() => setSelectedWork(work)}
          >
            <div className="work-card-top">
              <span className="work-tag">{work.category}</span>
              <span className="work-metric-chip">{work.metric}</span>
            </div>
            <h3 className="work-title">{work.title}</h3>
            <span className="work-subtitle">{work.subtitle}</span>
            <p className="work-desc">{work.shortDesc}</p>
            <div className="work-card-footer">
              <span className="work-read-more">
                Read full story <ArrowRight size={12} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Parchment Detail Modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            className="minimal-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWork(null)}
          >
            <motion.div
              className="minimal-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-btn"
                onClick={() => setSelectedWork(null)}
                aria-label="Close story"
              >
                <X size={15} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="work-tag">{selectedWork.category}</span>
                <span className="work-metric-chip">{selectedWork.metric}</span>
              </div>

              <h2 className="modal-work-title">{selectedWork.title}</h2>
              <p className="modal-work-subtitle">{selectedWork.subtitle}</p>

              <div className="modal-meta-row">
                {selectedWork.meta.map((m, idx) => (
                  <span key={idx} className="meta-pill">{m}</span>
                ))}
              </div>

              <p className="modal-work-story">{selectedWork.fullStory}</p>

              <div className="narrative-actions-row" style={{ marginTop: '0.6rem' }}>
                <button
                  className="clean-primary-btn"
                  onClick={() => {
                    setSelectedWork(null);
                    onStartBriefWithProject(selectedWork.title);
                  }}
                >
                  Collaborate on Something Similar <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
