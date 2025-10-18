// src/components/UI/GeneralModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import styles from './GeneralModal.module.css';

/**
 * Reusable Modal Component
 *
 * Purpose: Display messages, confirmations, or information with a simple OK button
 *
 * Props:
 * - title: Modal title
 * - message: Main content/message
 * - onOk: Function to call when OK is clicked
 * - isOpen: Boolean to control modal visibility
 * - type: 'info' | 'success' | 'warning' | 'error' (default: 'info')
 * - okText: Custom text for OK button (default: 'OK')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */
const Modal = ({
                   title,
                   message,
                   onOk,
                   isOpen,
                   type = 'info',
                   okText = 'OK',
                   size = 'md'
               }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return 'ℹ️';
        }
    };

    const getTypeClass = () => {
        return styles[`type-${type}`];
    };

    return (
        <div className={styles.modalOverlay}>
            <motion.div
                className={`${styles.modal} ${styles[`size-${size}`]} ${getTypeClass()}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.titleContainer}>
                        <span className={styles.icon}>{getIcon()}</span>
                        <h2 className={styles.title}>{title}</h2>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    {typeof message === 'string' ? (
                        <p className={styles.message}>{message}</p>
                    ) : (
                        <div className={styles.message}>{message}</div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <Button
                        variant="primary"
                        onClick={onOk}
                        className={styles.okButton}
                    >
                        {okText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default Modal;