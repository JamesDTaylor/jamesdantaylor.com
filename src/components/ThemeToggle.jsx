import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? "Switch to Daybreak (Light Mode)" : "Switch to Nocturne (Dark Mode)"}
      title={isDark ? "Switch to Daybreak (Light Mode) · [T]" : "Switch to Nocturne (Dark Mode) · [T]"}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Astrolabe Circular Border Ring */}
      <div className="theme-toggle-ring">
        <motion.div
          className="theme-toggle-rotator"
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          {isDark ? (
            <div className="theme-toggle-icon-wrap moon-wrap">
              <Moon size={16} className="theme-moon-icon" />
              <span className="theme-toggle-sparkle sp1">✦</span>
              <span className="theme-toggle-sparkle sp2">⋆</span>
            </div>
          ) : (
            <div className="theme-toggle-icon-wrap sun-wrap">
              <Sun size={17} className="theme-sun-icon" />
              <span className="theme-toggle-ray ray1" />
              <span className="theme-toggle-ray ray2" />
            </div>
          )}
        </motion.div>
      </div>

      <span className="theme-toggle-label">
        {isDark ? "Nocturne" : "Daybreak"}
      </span>
    </motion.button>
  );
}
