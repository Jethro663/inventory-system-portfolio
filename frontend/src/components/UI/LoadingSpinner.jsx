// src/components/UI/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './LoadingSpinner.module.css';

/**
 * Loading Spinner Component
 * 
 * Purpose: Show loading state with animated spinner
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' - spinner size
 * - message: string - optional loading message
 * 
 * Animations: Rotating spinner with scale
 */
const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className={`${styles.spinner} ${styles[size]}`}
        variants={spinnerVariants}
        animate="animate"
      />
      {message && <p className={styles.message}>{message}</p>}
    </motion.div>
  );
};

export default LoadingSpinner;