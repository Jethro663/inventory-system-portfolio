// src/pages/FooterPages/PrivacyPolicy.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
    // Reusing the same animation variants for consistency
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className={styles.policyPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>Privacy Policy</h1>
                    <p>Last updated: October 18, 2025</p>
                </motion.div>

                {/* Policy Content */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.policyCard}>
                        <h3>Introduction</h3>
                        <p>
                            Welcome to the JakiDustin™ Inventory System ("we," "our," or "us"). We are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
                        </p>

                        <h3>Information We Collect</h3>
                        <p>
                            We collect information that you provide directly to us when you create an account. This includes:
                        </p>
                        <ul>
                            <li><strong>Account Information:</strong> Your username and a hashed version of your password.</li>
                            <li><strong>Activity Information:</strong> Records of actions you perform within the application, such as creating assets, logging transactions, or making borrow requests, are stored in our audit and transaction logs for administrative and security purposes.</li>
                        </ul>

                        <h3>How We Use Your Information</h3>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, operate, and maintain the inventory system.</li>
                            <li>Authenticate your access to your account.</li>
                            <li>Maintain a secure and auditable record of system activity.</li>
                            <li>Communicate with you regarding your borrow requests and other system notifications.</li>
                        </ul>

                        <h3>Data Security</h3>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. Your password is encrypted and stored securely in our database. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>

                        <h3>Third-Party Services</h3>
                        <p>
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                        </p>

                        <h3>Changes to This Privacy Policy</h3>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                        </p>

                        <h3>Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please visit our <Link to="/contact" className={styles.link}>Contact Page</Link>.
                        </p>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;