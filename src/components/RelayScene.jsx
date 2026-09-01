import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle, Mail, MapPin, ExternalLink, Copy, Check } from 'lucide-react';
import { LinkedInIcon } from './Icons';

export default function RelayScene({ onBack, onStartBrief }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('james.dan.taylor@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <button
        className="scene-back-btn"
        onClick={onBack}
      >
        <ArrowLeft size={13} /> Back to Overview
      </button>

      {/* Main Header */}
      <header className="narrative-header">
        <span className="narrative-tag">Chapter VI · Say Hello</span>
        <h1 className="narrative-title">
          I'd love to hear from you.
        </h1>
      </header>

      <div className="relay-split-grid">
        {/* Left: Direct Message Form */}
        <div className="relay-card">
          <h3 className="relay-card-title">Send Me a Note</h3>

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.8rem', padding: '1.5rem 0' }}
              >
                <CheckCircle size={44} color="#8b1e1e" />
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#1a0f0a' }}>Message Received!</h4>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#5a3825', lineHeight: 1.5 }}>
                  Thank you for reaching out, {formData.name}. I will read your message and get back to you as soon as I can.
                </p>
                <button
                  className="clean-secondary-btn"
                  style={{ marginTop: '0.8rem' }}
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleSubmit} className="relay-minimal-form">
                <div className="input-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="How should I address you?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Your Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Where can I write back to you?"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="message">What's on your mind?</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Tell me about your research project, study, or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="clean-primary-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
                >
                  <Send size={14} /> Send Message
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Direct Channels */}
        <div className="relay-sidebar">
          {/* Email Fast Copy Card */}
          <div className="contact-info-card" onClick={handleCopyEmail}>
            <div className="contact-icon-box">
              <Mail size={18} color="#8b1e1e" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Direct Email (Click to copy)</span>
              <span className="contact-val">james.dan.taylor@gmail.com</span>
            </div>
            <button className="copy-icon-btn" title="Copy email address">
              {copied ? <Check size={16} color="#8b1e1e" /> : <Copy size={16} />}
            </button>
          </div>

          {/* LinkedIn Verified Card */}
          <a
            href="https://www.linkedin.com/in/jamesdantaylor/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-info-card"
          >
            <div className="contact-icon-box linkedin-icon-box">
              <LinkedInIcon size={18} color="#ffffff" />
            </div>
            <div className="contact-details">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-val">linkedin.com/in/jamesdantaylor</span>
            </div>
            <ExternalLink size={14} color="#7c5238" />
          </a>

          {/* Location & Academic Base */}
          <div className="contact-info-card" style={{ cursor: 'default' }}>
            <div className="contact-icon-box">
              <MapPin size={18} color="#b45309" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Location & University</span>
              <span className="contact-val">Gauteng, SA · Stellenbosch University</span>
            </div>
          </div>

          {/* Guided Brief Callout */}
          <div className="guided-quest-banner">
            <span className="banner-tag">Have a specific project in mind?</span>
            <p className="banner-desc">
              Take 2 minutes to answer a few friendly questions about what you're hoping to create or research.
            </p>
            <button
              className="clean-secondary-btn"
              style={{ marginTop: '0.4rem', width: 'fit-content' }}
              onClick={onStartBrief}
            >
              Start Collaboration Questions ›
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
