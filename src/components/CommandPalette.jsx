import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, FolderGit2, GraduationCap, Sparkles, MessageSquareHeart, Mail, CornerDownLeft, X, Box } from 'lucide-react';

const COMMAND_ITEMS = [
  // Core Chapters
  {
    id: 'dossier',
    type: 'portal',
    title: 'My Story & Research',
    subtitle: 'MSc psychiatry research, Multiple Sclerosis ethos & humane UX design',
    icon: BookOpen,
    category: 'CHAPTER I',
    action: (nav) => nav.goToSection('dossier'),
  },
  {
    id: 'arsenal',
    type: 'portal',
    title: 'Selected Projects',
    subtitle: 'VR anxiety protocols, chronic illness coaching & non-profit systems',
    icon: FolderGit2,
    category: 'CHAPTER II',
    action: (nav) => nav.goToSection('arsenal'),
  },
  {
    id: 'skills',
    type: 'portal',
    title: 'Education & Background',
    subtitle: 'Stellenbosch & Wits degrees, UX design training & data competencies',
    icon: GraduationCap,
    category: 'CHAPTER III',
    action: (nav) => nav.goToSection('skills'),
  },
  {
    id: 'lab',
    type: 'portal',
    title: 'The Curiosity Room',
    subtitle: 'Interactive kinetic ink typography sandbox & map wanderers',
    icon: Sparkles,
    category: 'CHAPTER IV',
    action: (nav) => nav.goToSection('lab'),
  },
  {
    id: 'quest',
    type: 'portal',
    title: 'Start a Project Together',
    subtitle: 'Friendly 7-step guided conversation to talk through your ideas',
    icon: MessageSquareHeart,
    category: 'CHAPTER V',
    action: (nav) => nav.goToSection('quest'),
  },
  {
    id: 'relay',
    type: 'portal',
    title: 'Say Hello',
    subtitle: 'Send a note directly, copy my email address, or connect on LinkedIn',
    icon: Mail,
    category: 'CHAPTER VI',
    action: (nav) => nav.goToSection('relay'),
  },

  // Projects
  {
    id: 'proj-xr-anxiety',
    type: 'project',
    title: 'VR Anxiety Interventions Protocol',
    subtitle: 'Clinical VR study in the Department of Psychiatry (Stellenbosch University)',
    icon: Box,
    category: 'RESEARCH',
    action: (nav) => nav.selectProject('VR Anxiety Interventions'),
  },
  {
    id: 'proj-coaching',
    type: 'project',
    title: 'James Does Coaching',
    subtitle: 'Career support & pacing toolkits for people living with Multiple Sclerosis',
    icon: Box,
    category: 'INITIATIVE',
    action: (nav) => nav.selectProject('James Does Coaching'),
  },
  {
    id: 'proj-ftfa',
    type: 'project',
    title: 'Food & Trees for Africa Systems',
    subtitle: '$100,000 Google Grant award & automated cloud data reporting',
    icon: Box,
    category: 'NON-PROFIT',
    action: (nav) => nav.selectProject('Food & Trees for Africa Systems'),
  },
  {
    id: 'proj-clustering',
    type: 'project',
    title: 'Customer Behavior Modeling',
    subtitle: 'Python analytics & customer segmentation for Massmart / Makro',
    icon: Box,
    category: 'DATA SCIENCE',
    action: (nav) => nav.selectProject('Customer Behavior Modeling'),
  },

  // Studies & Competencies
  {
    id: 'skill-neuro',
    type: 'skill',
    title: 'MSc in Neuroscience (Psychiatry)',
    subtitle: 'Stellenbosch University · Virtual reality interventions for anxiety',
    icon: Sparkles,
    category: 'ACADEMIA',
    action: (nav) => nav.goToSection('skills'),
  },
  {
    id: 'skill-ux',
    type: 'skill',
    title: 'Google UX Design Specialization',
    subtitle: 'Cognitive load reduction, empathy mapping & accessible design',
    icon: Sparkles,
    category: 'STUDIES',
    action: (nav) => nav.goToSection('skills'),
  },
  {
    id: 'skill-python',
    type: 'skill',
    title: 'Python Analytics & Cloud Automation',
    subtitle: 'Statistical data pipelines, customer clustering & automated workflows',
    icon: Sparkles,
    category: 'STUDIES',
    action: (nav) => nav.goToSection('skills'),
  },
];

export default function CommandPalette({ isOpen, onClose, navigationActions }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action(navigationActions);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigationActions, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="cmd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="cmd-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Bar */}
          <div className="cmd-input-wrapper">
            <Search size={18} className="cmd-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="cmd-input-field"
              placeholder="Search chapters, projects, or background..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="cmd-close-btn" onClick={onClose} aria-label="Close Directory Index">
              <X size={16} />
            </button>
          </div>

          {/* Results List */}
          <div className="cmd-results-list" role="listbox">
            {filteredItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#7c5238', fontStyle: 'italic' }}>
                <span>No directory entries matching "{query}"</span>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className={`cmd-item-row ${isSelected ? 'cmd-item-row--selected' : ''}`}
                    onClick={() => {
                      item.action(navigationActions);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="cmd-item-icon-box">
                      <Icon size={16} />
                    </div>

                    <div className="cmd-item-text-group">
                      <div className="cmd-item-title-row">
                        <span className="cmd-item-title">{item.title}</span>
                        <span className="cmd-item-cat-badge">{item.category}</span>
                      </div>
                      <span className="cmd-item-subtitle">{item.subtitle}</span>
                    </div>

                    {isSelected && (
                      <div className="cmd-item-enter-hint">
                        <span>OPEN</span>
                        <CornerDownLeft size={11} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Hotkey Guide */}
          <div className="cmd-footer-bar">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Open</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
