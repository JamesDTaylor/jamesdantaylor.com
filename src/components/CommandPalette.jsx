import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, FolderGit2, GraduationCap, MessageSquareHeart, Mail, CornerDownLeft, X, Box, CheckCircle2, Award } from 'lucide-react';

const COMMAND_ITEMS = [
  // Core Chapters
  {
    id: 'summary',
    type: 'portal',
    title: 'Summary',
    subtitle: 'MSc Neuroscience candidate in the Department of Psychiatry',
    icon: BookOpen,
    category: 'CHAPTER I',
    action: (nav) => nav.goToSection('summary'),
  },
  {
    id: 'experience',
    type: 'portal',
    title: 'Experience',
    subtitle: 'Stellenbosch University, James Does Coaching, Breaking Boundaries, Insight Analytics, Food & Trees for Africa',
    icon: FolderGit2,
    category: 'CHAPTER II',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'education',
    type: 'portal',
    title: 'Education & Background',
    subtitle: 'Stellenbosch University, Wits, Certifications & Honors',
    icon: GraduationCap,
    category: 'CHAPTER III',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'collaborate',
    type: 'portal',
    title: 'Collaborate',
    subtitle: 'Design and evaluate user-centred XR and digital mental health solutions',
    icon: MessageSquareHeart,
    category: 'CHAPTER IV',
    action: (nav) => nav.goToSection('collaborate'),
  },
  {
    id: 'contact',
    type: 'portal',
    title: 'Contact',
    subtitle: 'james.dan.taylor@gmail.com · linkedin.com/in/jamesdantaylor',
    icon: Mail,
    category: 'CHAPTER V',
    action: (nav) => nav.goToSection('contact'),
  },

  // Experience Positions
  {
    id: 'exp-stellenbosch',
    type: 'project',
    title: 'Stellenbosch University · Graduate Student',
    subtitle: 'MSc Neuroscience candidate in the department of Psychiatry (Jan 2025 - Apr 2026)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'exp-coaching',
    type: 'project',
    title: 'James Does Coaching · Career Support for People with Chronic Illness',
    subtitle: 'Tailored career coaching to individuals managing chronic illnesses (May 2023 - Dec 2024)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'exp-bb',
    type: 'project',
    title: 'Breaking Boundaries Support Services Inc. · Digital Marketing Consultant',
    subtitle: 'High-impact digital marketing strategies for mental health advocacy (Jun 2021 - Sep 2022)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'exp-independent',
    type: 'project',
    title: 'Independent Consultant · Data Specialist',
    subtitle: 'M&E web applications, Google Cloud Platform (GCP) architecture & automation (May 2020 - Sep 2022)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'exp-insight',
    type: 'project',
    title: 'Insight Analytics · Data Analyst',
    subtitle: 'Massmart reputation analysis, NGO awareness & Makro K-means segmentation (Aug 2017 - Jan 2021)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },
  {
    id: 'exp-ftfa',
    type: 'project',
    title: 'Food & Trees for Africa · Data Specialist & Intern to the Executive Director',
    subtitle: 'Data projects, Google Apps Script systems & 100k Google Grant (Feb 2019 - May 2020)',
    icon: Box,
    category: 'EXPERIENCE',
    action: (nav) => nav.goToSection('experience'),
  },

  // Education & Honors
  {
    id: 'edu-su',
    type: 'skill',
    title: 'Stellenbosch University',
    subtitle: 'MSc (Neuroscience), Psychiatry · (Nov 2024 - Dec 2026)',
    icon: GraduationCap,
    category: 'EDUCATION',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'edu-wits-hons',
    type: 'skill',
    title: 'University of the Witwatersrand · BSc Honours',
    subtitle: 'Cognitive Neuroscience / Psychology · (2015 - 2016)',
    icon: GraduationCap,
    category: 'EDUCATION',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'edu-wits-bsc',
    type: 'skill',
    title: 'University of the Witwatersrand · Bachelor of Science',
    subtitle: 'Bachelor of Science · (2011 - 2014)',
    icon: GraduationCap,
    category: 'EDUCATION',
    action: (nav) => nav.goToSection('education'),
  },

  // Certifications
  {
    id: 'cert-fb',
    type: 'skill',
    title: 'Advertising on Facebook: Advanced',
    subtitle: 'Professional Certification',
    icon: CheckCircle2,
    category: 'CERTIFICATIONS',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'cert-ux',
    type: 'skill',
    title: 'Foundations of User Experience (UX) Design',
    subtitle: 'Google / UX Design Certification',
    icon: CheckCircle2,
    category: 'CERTIFICATIONS',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'cert-gcp',
    type: 'skill',
    title: 'GCP Essentials',
    subtitle: 'Google Cloud Platform Certification',
    icon: CheckCircle2,
    category: 'CERTIFICATIONS',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'cert-nn',
    type: 'skill',
    title: 'Neural Network Visualizer Web App with Python',
    subtitle: 'Machine Learning & Web App Certification',
    icon: CheckCircle2,
    category: 'CERTIFICATIONS',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'cert-python-ds',
    type: 'skill',
    title: 'Introduction to Python for Data Science',
    subtitle: 'Data Science Certification',
    icon: CheckCircle2,
    category: 'CERTIFICATIONS',
    action: (nav) => nav.goToSection('education'),
  },

  // Honors
  {
    id: 'award-gk',
    type: 'skill',
    title: 'Golden Key International Honour Society',
    subtitle: 'Academic Recognition',
    icon: Award,
    category: 'HONORS-AWARDS',
    action: (nav) => nav.goToSection('education'),
  },
  {
    id: 'award-pma',
    type: 'skill',
    title: 'Postgraduate Merit Award',
    subtitle: 'Postgraduate Recognition & Scholarship',
    icon: Award,
    category: 'HONORS-AWARDS',
    action: (nav) => nav.goToSection('education'),
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
              placeholder="Search experience, education, certifications..."
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
