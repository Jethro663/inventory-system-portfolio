// src/components/UI/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

/**
 * Card Component
 * 
 * Purpose: Container component with glassmorphism effects
 * 
 * Props:
 * - children: Card content
 * - className: Additional CSS classes
 * - hover: Boolean to enable hover effects
 * 
 * Animations: Hover lift, entrance animations
 */
const Card = ({ children, className = '', hover = true, ...props }) => {
  const cardClasses = [
    styles.card,
    hover && styles.hover,
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;