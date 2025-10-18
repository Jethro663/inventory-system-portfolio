// src/pages/FooterPages/HelpCenter.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import styles from './HelpCenter.module.css';

// Data for the FAQ section
const faqData = [
    {
        question: 'How do I change my password?',
        answer: 'Currently, password changes are handled by an Administrator. Please contact a system administrator to request a password reset.'
    },
    {
        question: 'What are the different user roles?',
        answer: 'There are three roles: VIEWER (can see assets and make borrow requests), STAFF (can manage assets and requests), and ADMIN (has full system access, including user management).'
    },
    {
        question: 'How do I request to borrow an asset?',
        answer: 'As a VIEWER, navigate to the "Assets" page. Find an asset with the status "AVAILABLE" and click the "Borrow Asset" button. You can add an optional note before submitting your request.'
    },
    {
        question: 'Where can I see the status of my borrow requests?',
        answer: 'You can see all of your past and present requests on the "My Borrowed Items" page, accessible from the main navigation.'
    },
    {
        question: 'How do I return an asset I have borrowed?',
        answer: 'Navigate to the "My Borrowed Items" page. For any active item (with an "APPROVED" status), you will see a "Return" button. Clicking this will complete the borrowing process and make the asset available for others.'
    },
    {
        question: 'What do the different asset statuses mean?',
        answer: 'Assets can have several statuses: AVAILABLE (ready to be borrowed), IN_USE (currently borrowed), MAINTENANCE (undergoing service), DAMAGED (needs repair), and RETIRED (no longer in service).'
    }
];

const HelpCenter = () => {
    // Reusing the same animation variants for consistency
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className={styles.helpCenterPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>Help Center</h1>
                    <p>Find answers to common questions about the inventory system.</p>
                </motion.div>

                {/* FAQ Container */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.faqCard}>
                        {faqData.map((faq, index) => (
                            <motion.details key={index} className={styles.faqItem} variants={itemVariants}>
                                <summary className={styles.faqQuestion}>
                                    {faq.question}
                                </summary>
                                <div className={styles.faqAnswer}>
                                    <p>{faq.answer}</p>
                                </div>
                            </motion.details>
                        ))}
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HelpCenter;