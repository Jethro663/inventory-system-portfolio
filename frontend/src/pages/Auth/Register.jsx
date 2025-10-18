// src/pages/Auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import styles from './Auth.module.css';

/**
 * Register Page Component
 * 
 * Purpose: Create new user accounts with validation
 * 
 * State:
 * - formData: Object containing registration fields
 * - errors: Object containing field validation errors
 * - isSubmitting: Boolean indicating submission state
 * 
 * Animations: Form field animations, password strength indicator, success states
 */
const Register = () => {
  const { register, isAuthenticated, loading, error, clearError } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength],
      color: colors[strength]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <motion.div
        className={styles.authBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.gradient}></div>
      </motion.div>

      <motion.div
        className={styles.authContent}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className={styles.authCard}>
            <div className={styles.authHeader}>
              <motion.h1
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                Create Account
              </motion.h1>
              <p>Join JakiDustin™ to manage your assets</p>
            </div>

            {error && (
              <motion.div
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <motion.div variants={itemVariants}>
                <Input
                  label="Username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Choose a username"
                  required
                  autoComplete="username"
                  icon="👤"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  icon="🔒"
                />
                {formData.password && (
                  <motion.div
                    className={styles.passwordStrength}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className={styles.strengthBar}>
                      <motion.div
                        className={styles.strengthFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        style={{ backgroundColor: passwordStrength.color }}
                      />
                    </div>
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  icon="🔒"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting || loading}
                  fullWidth
                  className={styles.submitButton}
                >
                  Create Account
                </Button>
              </motion.div>
            </form>

            <motion.div
              className={styles.authFooter}
              variants={itemVariants}
            >
              <p>
                Already have an account?{' '}
                <Link to="/login" className={styles.link}>
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;