import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Feather,
  Sparkles,
  Compass,
} from 'lucide-react';
import { LinkedInIcon } from './Icons';

export default function ContactScene({ onBack, onStartBrief }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('james.dan.taylor@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <motion.div
      className="narrative-scene-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Back Navigation */}
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
          <Feather size={13} style={{ display: 'inline', marginRight: '5px' }} />
          Chapter V · Carrier Pigeon Dispatch & Inquiries
        </span>
        <h1 className="narrative-title">Send a Dispatch or Connect</h1>
        <p className="narrative-subtitle-ink">
          Whether to discuss virtual reality neuroscience, digital mental health collaborations, or tailored career coaching.
        </p>
      </header>

      <div className="relay-split-grid">
        {/* Left: Vintage Dispatch Letter Box Form */}
        <motion.div
          className="relay-envelope-card"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          {/* Top Envelope Stamp Inscription */}
          <div className="relay-card-stamp-header">
            <div className="dispatch-seal-mark">
              <span className="dispatch-seal-text">POST</span>
            </div>
            <div>
              <h3 className="relay-card-title">Inscribe Your Message</h3>
              <span className="relay-card-subtitle">Direct dispatch to James Taylor</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relay-success-dispatch"
              >
                <div className="relay-success-seal">
                  <CheckCircle size={44} color="#8b1e1e" />
                </div>
                <h4 className="relay-success-title">Dispatch Sealed & Received!</h4>
                <p className="relay-success-text">
                  Thank you for reaching out, <strong>{formData.name}</strong>. Your message has been inscribed into the dispatch ledger and I will respond as swiftly as possible.
                </p>
                <motion.button
                  type="button"
                  className="clean-secondary-btn"
                  style={{ marginTop: '0.8rem' }}
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Inscribe Another Note
                </motion.button>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleSubmit} className="relay-minimal-form">
                <div className="input-group">
                  <label htmlFor="name">
                    <span className="input-quill-icon">✎</span> Your Name & Title
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g., Dr. Eleanor Vance / Research Lead"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">
                    <span className="input-quill-icon">✉</span> Return Dispatch Address (Email)
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Where should I send my reply?"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="message">
                    <span className="input-quill-icon">✦</span> Message & Inquiry
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Share your research ideas, collaboration proposals, or project requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <motion.button
                  type="submit"
                  className="clean-primary-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={15} /> Seal & Send Dispatch
                </motion.button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Direct Channels & Expedited Inquiries */}
        <div className="relay-sidebar">
          {/* Email Fast Copy Card */}
          <motion.div
            className={`contact-info-card ${copied ? 'contact-info-card--copied' : ''}`}
            onClick={handleCopyEmail}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            title="Click to copy email address"
          >
            <div className="contact-icon-box">
              <Mail size={18} color="#8b1e1e" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Direct Inquiries (Click to copy)</span>
              <span className="contact-val">james.dan.taylor@gmail.com</span>
            </div>
            <div className="copy-icon-btn-container">
              {copied ? (
                <span className="copied-stamp-badge">
                  <Check size={13} /> Copied
                </span>
              ) : (
                <Copy size={16} color="var(--ink-muted)" />
              )}
            </div>
          </motion.div>

          {/* LinkedIn Verified Card */}
          <motion.a
            href="https://www.linkedin.com/in/jamesdantaylor/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-info-card"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="contact-icon-box linkedin-icon-box">
              <LinkedInIcon size={18} color="#ffffff" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Professional Network</span>
              <span className="contact-val">linkedin.com/in/jamesdantaylor</span>
            </div>
            <ExternalLink size={14} color="#7c5238" />
          </motion.a>

          {/* Location & Academic Base */}
          <div className="contact-info-card" style={{ cursor: 'default' }}>
            <div className="contact-icon-box" style={{ background: 'rgba(180, 83, 9, 0.1)' }}>
              <Compass size={18} color="#b45309" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Academic Base & Region</span>
              <span className="contact-val">Stellenbosch University · Gauteng, SA</span>
            </div>
          </div>

          {/* Guided Collaboration Questionnaire Banner */}
          <motion.div
            className="guided-quest-banner"
            whileHover={{ scale: 1.01 }}
          >
            <div className="guided-quest-head">
              <Sparkles size={16} color="#8b1e1e" />
              <span className="banner-tag">Have a Specific Project in Mind?</span>
            </div>
            <p className="banner-desc">
              Answer 3 brief questions to clarify your goals in XR neuroscience, data pipelines, or coaching.
            </p>
            <motion.button
              type="button"
              className="clean-secondary-btn"
              style={{ marginTop: '0.4rem', width: 'fit-content' }}
              onClick={onStartBrief}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Collaboration Questionnaire ›
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
