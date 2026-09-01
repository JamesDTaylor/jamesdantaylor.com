import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SpatialParchmentContainer({
  children,
  className = '',
  maxTilt = 7,
  glare = true,
  style = {},
  ...rest
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to container center (-0.5 to +0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Glare position in percentage (0% to 100%)
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Physics springs for organic, zero-jerk response
  const springConfig = { damping: 24, stiffness: 220, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotations for the entire card container
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);

    glareX.set(x * 100);
    glareY.set(y * 100);
  }, [mouseX, mouseY, glareX, glareY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className={`spatial-container-root ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1400,
        transformStyle: 'preserve-3d',
        position: 'relative',
        ...style,
      }}
      {...rest}
    >
      <motion.div
        className="spatial-container-plane"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Child Cards Container Plane */}
        <div
          className="spatial-container-content"
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

        {/* Dynamic 3D Ambient Parchment Sheen across entire container */}
        {glare && (
          <motion.div
            className="spatial-container-glare"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '24px',
              pointerEvents: 'none',
              zIndex: 3,
              background: `radial-gradient(
                circle 450px at ${glareX.get()}% ${glareY.get()}%,
                rgba(254, 243, 199, 0.30) 0%,
                rgba(245, 158, 11, 0.08) 40%,
                transparent 75%
              )`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
