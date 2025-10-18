// src/components/Layout/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

/**
 * Footer Component
 * 
 * Purpose: Display footer with application information and links
 * 
 * Animations: Smooth entrance, hover effects on links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.footer
      className={styles.footer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            className={styles.brand}
            whileHover={{ scale: 1.02 }}
          >
            <h3>JakiDustin™</h3>
            <p>JakiDustin™ Flexible Inventory System</p>
          </motion.div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>Product</h4>
              <ul>
                <li><a href="/features">Features</a></li>
                <li><a href="/docs">Documentation</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>Support</h4>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About</a></li>

              </ul>
            </div>
          </div>
        </div>
        
        <motion.div
          className={styles.copyright}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p>&copy; {currentYear} JakiDustin™. All rights reserved.</p>
          <div className={styles.legal}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;