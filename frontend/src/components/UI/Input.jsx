// src/components/UI/Input.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Input.module.css';

/**
 * Input Component
 * 
 * Purpose: Reusable input field with validation and animations
 * 
 * Props:
 * - label: Input label string
 * - type: Input type (text, password, email, etc.)
 * - value: Controlled value
 * - onChange: Change handler function
 * - error: Error message string
 * - placeholder: Placeholder text
 * - required: Boolean indicating required field
 * - icon: Icon string or element
 * - disabled: Boolean indicating disabled state
 * - autoComplete: Auto-complete attribute
 * 
 * Animations: Error message slide, focus states, icon interactions
 */
const Input = React.forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon,
  disabled = false,
  autoComplete,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const inputClasses = [
    styles.input,
    error && styles.error,
    isFocused && styles.focused,
    disabled && styles.disabled,
    icon && styles.withIcon
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {icon && (
          <span className={styles.icon}>
            {icon}
          </span>
        )}
        <motion.input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;