import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Plus, Users } from 'lucide-react';
import CharacterSwirlText from './CharacterSwirlText';

const PRESETS = [
  "Virtual reality interventions for anxiety",
  "Designing software that respects human limits",
  "Living and working with Multiple Sclerosis",
  "Neuroscience in the Department of Psychiatry",
];

export default function NeuralLabScene({ onBack, onSpawnCritter, creatureCount = 0 }) {
  const [customText, setCustomText] = useState("Virtual reality interventions for anxiety");

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
        <span className="narrative-tag">Chapter IV · The Curiosity Room</span>
        <h1 className="narrative-title">
          An interactive sandbox to play with kinetic ink typography and watch the parchment come alive.
        </h1>
      </header>

      <div className="lab-grid">
        {/* Kinetic Typography Sandbox Card */}
        <div className="lab-card">
          <div className="lab-card-header">
            <span className="lab-title">
              <Sparkles size={18} color="#8b1e1e" /> Kinetic Ink Calligraphy
            </span>
            <span className="lab-hint">Move your quill near the letters to watch them disperse in 3D ink space</span>
          </div>

          <div className="swirl-viewport">
            <CharacterSwirlText text={customText} />
          </div>

          <div className="preset-row">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                className={`lab-preset-btn ${customText === p ? 'active' : ''}`}
                onClick={() => setCustomText(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Companion Wanderers Spawner Card */}
        <div className="lab-card">
          <div className="lab-card-header">
            <span className="lab-title">
              <Users size={18} color="#b45309" /> Ink Wanderers
            </span>
            <span className="lab-hint">Active Wanderers: {1 + creatureCount}</span>
          </div>

          <p className="lab-card-desc">
            The small wanderers strolling along the bottom of your screen move autonomously, look up toward your quill cursor, and stroll toward any spot you click on the page.
          </p>

          <button
            className="clean-primary-btn"
            style={{ marginTop: '0.4rem', width: 'fit-content' }}
            onClick={onSpawnCritter}
          >
            <Plus size={14} /> Summon an Ink Companion
          </button>
        </div>
      </div>
    </motion.div>
  );
}
