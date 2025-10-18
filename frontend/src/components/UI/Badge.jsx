// src/components/UI/Badge.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styles from './Badge.module.css';

const Badge = ({
                   children,
                   variant = 'default',
                   size = 'md',
                   ...props
               }) => {
    const badgeClasses = [
        styles.badge,
        styles[variant],
        styles[size]
    ].filter(Boolean).join(' ');

    return (
        <motion.span
            className={badgeClasses}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {children}
        </motion.span>
    );
};

export default Badge;