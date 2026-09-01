import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function VortexUpload({ onComplete, onBackToMindmap }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.6rem',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span className="narrative-tag" style={{ display: 'block', marginBottom: '0.4rem' }}>
          Sketches & Reference Material
        </span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 3.4vw, 2.5rem)', color: '#1a0f0a', lineHeight: 1.25 }}>
          Have any sketches, docs, or inspiration to share?
        </h2>
        <p style={{ fontFamily: 'var(--font-serif)', color: '#5a3825', fontSize: '1rem', fontStyle: 'italic', marginTop: '0.4rem' }}>
          Feel free to attach research notes, PDFs, or design examples (optional).
        </p>
      </div>

      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ width: '100%' }}
      >
        <input
          type="file"
          id="fileUpload"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="fileUpload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.8rem 2rem',
            border: `1.5px dashed ${isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.35)'}`,
            borderRadius: '16px',
            backgroundColor: isDragging ? 'rgba(139, 30, 30, 0.08)' : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            boxShadow: 'var(--parchment-shadow)',
          }}
        >
          <UploadCloud
            size={40}
            strokeWidth={1.4}
            color={isDragging ? '#8b1e1e' : '#7c5238'}
            style={{ marginBottom: '0.8rem' }}
          />
          <p style={{ fontFamily: 'var(--font-heading)', color: isDragging ? '#8b1e1e' : '#1a0f0a', fontSize: '1.05rem', fontWeight: 600 }}>
            {isDragging ? 'Release to upload files' : 'Drag and drop files here, or click to browse'}
          </p>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.86rem', color: '#7c5238', fontStyle: 'italic', marginTop: '0.35rem' }}>
            Supports PDF, DOCX, PNG, JPG, FIG, and other common formats
          </span>
        </label>
      </form>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}
          >
            {files.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  background: '#ffffff',
                  border: '1px solid rgba(90, 56, 37, 0.2)',
                  borderRadius: '8px',
                }}
              >
                <CheckCircle size={16} color="#8b1e1e" />
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.96rem', color: '#1a0f0a', flex: 1 }}>{file.name}</span>
                <span style={{ fontSize: '0.78rem', color: '#7c5238', fontStyle: 'italic' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '0.4rem' }}>
        {onBackToMindmap && (
          <button
            className="clean-secondary-btn"
            onClick={onBackToMindmap}
          >
            <ArrowLeft size={13} /> Back to Overview
          </button>
        )}

        {files.length === 0 ? (
          <button
            className="clean-primary-btn"
            onClick={() => onComplete([])}
          >
            Skip & Finish <ArrowRight size={14} />
          </button>
        ) : (
          <button
            className="clean-primary-btn"
            onClick={() => onComplete(files)}
          >
            Finish & Send Brief ({files.length} {files.length === 1 ? 'file' : 'files'}) <ArrowRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
