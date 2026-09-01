import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SpatialParchmentCard({
  children,
  className = '',
  onClick,
  onMouseEnter,
  onMouseLeave,
  maxTilt = 9,
  glare = true,
  style = {},
  role,
  ...rest
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center (-0.5 to +0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Glare position in percentage (0% to 100%)
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Smooth physics springs
  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotations
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);

  // Dynamic Shadow offset based on tilt
  const shadowX = useTransform(smoothMouseX, [-0.5, 0.5], [10, -10]);
  const shadowY = useTransform(smoothMouseY, [-0.5, 0.5], [15, -5]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);

    glareX.set(x * 100);
    glareY.set(y * 100);
  }, [mouseX, mouseY, glareX, glareY]);

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback((e) => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    if (onMouseLeave) onMouseLeave(e);
  }, [onMouseLeave, mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className={`spatial-card-root ${className} ${isHovered ? 'spatial-card--hovered' : ''}`}
      role={role}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      animate={{
        scale: isHovered ? 1.025 : 1,
        z: isHovered ? 20 : 0,
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...rest}
    >
      <motion.div
        className="spatial-card-inner"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: 'inherit',
        }}
      >
        {/* Card Content with 3D Depth */}
        <div
          className="spatial-card-content"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>

        {/* 3D Specular Parchment Glare Sheen */}
        {glare && isHovered && (
          <motion.div
            className="spatial-card-glare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 3,
              background: `radial-gradient(
                circle 240px at ${glareX.get()}% ${glareY.get()}%,
                rgba(254, 243, 199, 0.38) 0%,
                rgba(245, 158, 11, 0.12) 35%,
                rgba(139, 30, 30, 0.03) 60%,
                transparent 80%
              )`,
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Dynamic 3D Ink Depth Shadow */}
        <motion.div
          className="spatial-card-shadow"
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 1,
            boxShadow: isHovered
              ? `${shadowX.get()}px ${shadowY.get() + 12}px 32px rgba(54, 34, 20, 0.16), 0 2px 8px rgba(54, 34, 20, 0.08)`
              : '0 8px 24px rgba(54, 34, 20, 0.08)',
            transition: 'box-shadow 0.2s ease-out',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
