// src/pages/FooterPages/Documentation.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import styles from './Documentation.module.css';

const Documentation = () => {
    // Animation variants for consistency with other pages
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className={styles.docPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>Documentation</h1>
                    <p>A guide to understanding and using the JakiDustin™ Inventory System.</p>
                </motion.div>

                {/* Getting Started Section */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.docCard}>
                        <h3>Getting Started</h3>
                        <p>This system is designed to manage, track, and report on organizational assets. Access to features is determined by your user role.</p>
                    </Card>
                </motion.div>

                {/* User Roles Section */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.docCard}>
                        <h3>User Roles & Permissions</h3>
                        <p>The system utilizes a role-based access control model to ensure security and proper delegation of tasks. There are three primary roles:</p>
                        <ul>
                            <li><strong>ADMIN:</strong> Has full access to all system features, including user management, asset creation, transaction logging, and viewing reports.</li>
                            <li><strong>STAFF:</strong> Can manage assets, categories, and transactions but does not have access to user management. Can approve or decline borrow requests.</li>
                            <li><strong>VIEWER:</strong> Has read-only access to assets. Can view their own borrow history and request to borrow available assets.</li>
                        </ul>
                    </Card>
                </motion.div>

                {/* Managing Assets Section */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.docCard}>
                        <h3>Managing Assets</h3>
                        <p>Administrators and Staff can perform full CRUD (Create, Read, Update, Delete) operations on assets and asset categories via the "Assets" and "Categories" pages.</p>
                        <p>When creating or updating an asset, all fields must be filled out correctly. The system validates data such as serial numbers (must be unique) and purchase dates (cannot be in the future).</p>
                    </Card>
                </motion.div>

                {/* Borrowing Process Section */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.docCard}>
                        <h3>The Borrowing Process</h3>
                        <p>The borrowing workflow is a core feature of the system:</p>
                        <ol>
                            <li>A <code>VIEWER</code> finds an <code>AVAILABLE</code> asset and submits a borrow request.</li>
                            <li>An <code>ADMIN</code> or <code>STAFF</code> member reviews the request on the "Requests" page.</li>
                            <li>The request can be <strong>Approved</strong>, which changes the asset's status to <code>IN_USE</code>, or <strong>Declined</strong>, with an optional reason.</li>
                            <li>The <code>VIEWER</code> can track the status of their requests on the "My Borrowed Items" page and can cancel any <code>PENDING</code> request.</li>
                            <li>Once a <code>VIEWER</code> is done with an asset, they can mark it as returned from the "My Borrowed Items" page. This sets the request status to <code>COMPLETE</code> and the asset status back to <code>AVAILABLE</code>.</li>
                        </ol>
                    </Card>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Documentation;