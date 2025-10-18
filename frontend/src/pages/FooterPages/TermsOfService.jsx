// src/pages/FooterPages/TermsOfService.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import styles from './TermsOfService.module.css';

const TermsOfService = () => {
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
        <div className={styles.termsPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>Terms of Service</h1>
                    <p>Last updated: October 18, 2025</p>
                </motion.div>

                {/* Terms Content */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.termsCard}>
                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using the JakiDustin™ Inventory System (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.
                        </p>

                        <h3>2. User Accounts</h3>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use a "strong" password (a password that uses a combination of upper and lower case letters, numbers, and symbols) with your account. We cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.
                        </p>

                        <h3>3. User Conduct</h3>
                        <p>
                            You agree not to use the Service for any purpose that is illegal or prohibited by these terms. You are responsible for all of your activity in connection with the Service.
                        </p>

                        <h3>4. Termination</h3>
                        <p>
                            We may terminate or suspend your access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>

                        <h3>5. Limitation of Liability</h3>
                        <p>
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. In no event shall we be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>

                        <h3>6. Changes to Terms</h3>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
                        </p>

                        <h3>7. Contact Information</h3>
                        <p>
                            If you have any questions about these Terms, please <Link to="/contact" className={styles.link}>contact us</Link>.
                        </p>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default TermsOfService;