// src/components/UI/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

/**
 * Button Component
 * 
 * Purpose: Reusable button with multiple variants and sizes
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: boolean - shows loading state
 * - disabled: boolean - disables button
 * - onClick: function - click handler
 * - children: node - button content
 * - type: 'button' | 'submit' | 'reset'
 * - fullWidth: boolean - makes button full width
 * 
 * Animations: Scale on hover and tap, loading spinner
 */
const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  fullWidth = false,
  ...props
}, ref) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (loading || disabled) && styles.disabled
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && (
        <motion.span
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span className={loading ? styles.hidden : ''}>
        {children}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;