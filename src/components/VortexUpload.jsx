import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft, Feather, FileText, X } from 'lucide-react';

/* ─── Hand-Drawn Inked Upload Chest Frame ─── */
const UploadChestFrame = ({ isDragging }) => (
  <svg
    className="upload-svg-frame"
    viewBox="0 0 400 240"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer organic pen-drawn perimeter */}
    <path
      d="M 18 8 
         C 100 6, 200 9, 300 7 
         C 360 8, 385 6, 392 16 
         C 398 28, 396 100, 397 170 
         C 396 215, 398 226, 388 232 
         C 375 238, 300 236, 200 237 
         C 100 236, 28 238, 16 230 
         C 6 220, 8 160, 6 90 
         C 8 45, 6 18, 18 8 Z"
      stroke={isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.35)'}
      strokeWidth={isDragging ? '2.0' : '1.3'}
      vectorEffect="non-scaling-stroke"
      fill="none"
    />

    {/* Corner calligraphy flourishes */}
    <path
      d="M 8 26 C 8 14, 14 8, 26 8 M 14 14 Q 20 8, 26 14 Q 20 20, 14 14"
      stroke={isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.55)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 392 26 C 392 14, 386 8, 374 8 M 386 14 Q 380 8, 374 14 Q 380 20, 386 14"
      stroke={isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.55)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 8 214 C 8 226, 14 232, 26 232 M 14 226 Q 20 220, 26 226 Q 20 232, 14 226"
      stroke={isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.55)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 392 214 C 392 226, 386 232, 374 232 M 386 226 Q 380 220, 374 226 Q 380 232, 386 226"
      stroke={isDragging ? '#8b1e1e' : 'rgba(90, 56, 37, 0.55)'}
      strokeWidth="1.2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

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

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="narrative-scene-container"
      style={{ maxWidth: '720px', margin: '0 auto', gap: '1.8rem' }}
    >
      <header className="narrative-header" style={{ textAlign: 'center', alignItems: 'center' }}>
        <span className="narrative-tag">
          <Feather size={13} style={{ display: 'inline', marginRight: '5px' }} />
          Chapter IV · Reference Manuscripts & Brief
        </span>
        <h1 className="narrative-title" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.7rem)' }}>
          Have Sketches, Studies, or Docs to Share?
        </h1>
        <p className="narrative-subtitle-ink">
          Attach research notes, PDFs, concept wireframes, or design examples to accompany your brief (optional).
        </p>
      </header>

      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ width: '100%', position: 'relative' }}
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
          className="upload-dropzone-parchment"
        >
          <UploadChestFrame isDragging={isDragging} />

          <motion.div
            className="upload-icon-seal"
            whileHover={{ scale: 1.1, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
          >
            <UploadCloud
              size={36}
              strokeWidth={1.5}
              color={isDragging ? '#8b1e1e' : '#5a3825'}
            />
          </motion.div>

          <p className="upload-prompt-text">
            {isDragging
              ? 'Drop documents into the dispatch ledger'
              : 'Drag & drop research manuscripts here, or click to browse'}
          </p>

          <span className="upload-filetype-hint">
            ✦ Supports PDF, DOCX, PNG, JPG, FIG, and other common research formats ✦
          </span>
        </label>
      </form>

      {/* Uploaded Manuscripts List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="uploaded-files-list"
          >
            {files.map((file, idx) => (
              <motion.div
                key={idx}
                className="uploaded-file-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <FileText size={18} color="#8b1e1e" />
                <span className="uploaded-file-name">{file.name}</span>
                <span className="uploaded-file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  className="uploaded-file-remove-btn"
                  onClick={() => handleRemoveFile(idx)}
                  title="Remove document"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="narrative-actions-row" style={{ justifyContent: 'center', width: '100%' }}>
        {onBackToMindmap && (
          <motion.button
            type="button"
            className="clean-secondary-btn"
            onClick={onBackToMindmap}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={14} /> Back to Overview
          </motion.button>
        )}

        {files.length === 0 ? (
          <motion.button
            type="button"
            className="clean-primary-btn"
            onClick={() => onComplete([])}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Skip & Complete Brief <ArrowRight size={14} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            className="clean-primary-btn"
            onClick={() => onComplete(files)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Seal & Submit Brief ({files.length} {files.length === 1 ? 'manuscript' : 'manuscripts'}) <ArrowRight size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
