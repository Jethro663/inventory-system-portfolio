// src/components/UI/ThemeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import styles from './ThemeToggle.module.css';

/**
 * Theme Toggle Component
 * 
 * Purpose: Toggle between light and dark themes with smooth animation
 * 
 * State: Managed by AppContext
 * 
 * Animations: Sun/moon icon rotation and scale
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useApp();

  return (
    <motion.button
      className={styles.themeToggle}
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        className={styles.icon}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;