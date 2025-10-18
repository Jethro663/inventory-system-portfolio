// src/components/Error/ErrorBoundary.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';
import styles from './ErrorBoundary.module.css';

/**
 * Error Boundary Component
 * 
 * Purpose: Catch JavaScript errors in child components and display fallback UI
 * 
 * State:
 * - hasError: Boolean indicating if an error has been caught
 * - error: The caught error object
 * - errorInfo: Additional error information
 * 
 * Animations: Error page entrance, retry button interactions
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          className={styles.errorBoundary}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.errorContent}>
            <motion.div
              className={styles.errorIcon}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              ⚠️
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Something went wrong
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We encountered an unexpected error. Don't worry, our team has been notified.
            </motion.p>

            {this.props.showDetails && this.state.error && (
              <motion.div
                className={styles.errorDetails}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <details>
                  <summary>Error Details</summary>
                  <pre>{this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              </motion.div>
            )}

            <motion.div
              className={styles.errorActions}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="primary"
                onClick={this.handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;