// src/pages/FooterPages/Features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import styles from './Features.module.css';

// An array to hold the features of your application
const featureList = [
    {
        icon: '💼',
        title: 'Comprehensive Asset Management',
        description: 'Track assets from acquisition to retirement. Manage details like serial numbers, cost, purchase dates, and status.'
    },
    {
        icon: '📁',
        title: 'Category Organization',
        description: 'Group assets into logical categories with custom names, descriptions, and icons for better organization.'
    },
    {
        icon: '👥',
        title: 'Role-Based Access Control',
        description: 'Secure your system with distinct roles (Admin, Staff, Viewer), ensuring users only access what they need.'
    },
    {
        icon: '➡️',
        title: 'Streamlined Borrowing Workflow',
        description: 'Users can request to borrow assets, and administrators can approve or decline requests with notes.'
    },
    {
        icon: '🔄',
        title: 'Detailed Transaction Logging',
        description: 'Every asset interaction, from creation to borrowing and maintenance, is automatically logged for a complete history.'
    },
    {
        icon: '📝',
        title: 'Complete Audit Trail',
        description: 'Monitor all system-wide activities, including user logins, password changes, and data modifications for full accountability.'
    },
    {
        icon: '📈',
        title: 'Insightful Reporting',
        description: 'Visualize your inventory with a dashboard that shows key metrics and asset distribution reports.'
    },
    {
        icon: '🔍',
        title: 'Advanced Search & Filtering',
        description: 'Quickly find any asset, user, or transaction with powerful, multi-field search and filtering capabilities.'
    }
];

const Features = () => {
    // Animation variants borrowed from your other pages for consistency
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
        <div className={styles.featuresPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>Application Features</h1>
                    <p>Discover the powerful tools that make JakiDustin™ a complete inventory solution.</p>
                </motion.div>

                {/* Grid of Features */}
                <div className={styles.featuresGrid}>
                    {featureList.map((feature, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className={styles.featureCard}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Features;