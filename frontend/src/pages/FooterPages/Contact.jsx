// src/pages/FooterPages/Contact.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import styles from './Contact.module.css';

const Contact = () => {
    // Reusing the same animation variants for consistency
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className={styles.contactPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className={styles.contactCard}>
                    <div className={styles.icon}>🔗</div>
                    <h3>Get in Touch</h3>
                    <p>
                        For questions, suggestions, or to report an issue, please connect with me on GitHub. This is the primary channel for all project-related communication.
                    </p>
                    <a
                        href="https://github.com/Jethro663"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            className={styles.contactButton}
                        >
                            Visit GitHub Profile
                        </Button>
                    </a>
                </Card>
            </motion.div>
        </div>
    );
};

export default Contact;