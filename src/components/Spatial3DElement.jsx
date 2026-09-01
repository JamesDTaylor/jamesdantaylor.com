import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Spatial3DElement({
  children,
  className = '',
  maxTilt = 15,
  scaleOnHover = 1.1,
  elevation = 16,
  glare = true,
  style = {},
  ...rest
}) {
  const elRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 300, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);

  const handleMouseMove = useCallback((e) => {
    if (!elRef.current) return;
    const rect = elRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={elRef}
      className={`spatial-3d-element ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 600,
        transformStyle: 'preserve-3d',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      animate={{
        scale: isHovered ? scaleOnHover : 1,
        z: isHovered ? elevation : 0,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...rest}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {children}

        {/* Red / Vermilion Specular Sheen when hovered */}
        {glare && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.45) 0%, rgba(139, 30, 30, 0.15) 60%, transparent 80%)',
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
