import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FolderGit2,
  GraduationCap,
  Sparkles,
  MessageSquareHeart,
  Mail,
  ArrowRight,
} from 'lucide-react';
import KineticGlyphText from './KineticGlyphText';

const PORTAL_ITEMS = [
  {
    id: 'dossier',
    title: 'My Story & Research',
    desc: 'Studying virtual reality for anxiety, living with Multiple Sclerosis, and why humane design matters.',
    tag: 'Chapter I',
    icon: BookOpen,
    keyNum: '1',
  },
  {
    id: 'arsenal',
    title: 'Selected Projects',
    desc: 'Real work: VR anxiety trials, career coaching for chronic illness, and non-profit data systems.',
    tag: 'Chapter II',
    icon: FolderGit2,
    keyNum: '2',
  },
  {
    id: 'skills',
    title: 'Education & Background',
    desc: 'University degrees at Stellenbosch & Wits, UX design training, and data tools.',
    tag: 'Chapter III',
    icon: GraduationCap,
    keyNum: '3',
  },
  {
    id: 'lab',
    title: 'The Curiosity Room',
    desc: 'A playful interactive space to try kinetic ink typography and watch ink wanderers.',
    tag: 'Chapter IV',
    icon: Sparkles,
    keyNum: '4',
  },
  {
    id: 'quest',
    title: 'Start a Project Together',
    desc: 'A friendly 7-step guide to talk through your ideas, goals, and collaboration vision.',
    tag: 'Chapter V',
    icon: MessageSquareHeart,
    keyNum: '5',
  },
  {
    id: 'relay',
    title: 'Say Hello',
    desc: 'Send a direct message, grab my email, or connect on LinkedIn.',
    tag: 'Chapter VI',
    icon: Mail,
    keyNum: '6',
  },
];

export default function HomeScene({ onAction }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleSelect = useCallback((item) => {
    if (!item) return;

    if (item.id === 'quest') {
      onAction('selectQuestion', 1);
    } else {
      onAction(item.id);
    }
  }, [onAction]);

  useEffect(() => {
    const handleKey = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (isTyping) return;

      if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key, 10) - 1;
        if (PORTAL_ITEMS[idx]) {
          handleSelect(PORTAL_ITEMS[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSelect]);

  return (
    <motion.div
      className="parchment-portal-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Editorial Hero Block */}
      <motion.div
        className="parchment-hero-block"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1 className="parchment-hero-title">
          <KineticGlyphText
            text="RESEARCH, DESIGN & RESILIENCE"
            maxDistance={150}
            repelForce={35}
            zElevation={70}
          />
        </h1>

        <p className="parchment-hero-subtitle">
          Neuroscience candidate at Stellenbosch University, UX designer, and chronic illness coach. Exploring virtual reality for anxiety, living with Multiple Sclerosis, and building tools that treat human minds with care.
        </p>
      </motion.div>

      {/* Parchment Grid of Chapters */}
      <nav className="parchment-matrix-grid" role="menu" aria-label="Main Directory">
        {PORTAL_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === idx;

          return (
            <motion.div
              key={item.id}
              className={`parchment-portal-card ${isHovered ? 'parchment-portal-card--active' : ''}`}
              role="menuitem"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.12 + idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleSelect(item)}
            >
              <div className="portal-card-top-row">
                <div className="portal-card-icon-box">
                  <Icon size={20} />
                </div>
                <span className="portal-card-key-chip">[{item.keyNum}]</span>
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
