// src/pages/FooterPages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import styles from './About.module.css';

// Step 2.1: Import the images from your src folder
import marcImage from '../../assets/images/marc.jpg';
import rapImage from '../../assets/images/rap.jpg';
import jjImage from '../../assets/images/jj.png';
import geloImage from '../../assets/images/gelo.jpg';

const teamMembers = [
    {
        name: 'Marc',
        role: 'Front-End Developer',
        image: marcImage
    },
    {
        name: 'Rap',
        role: 'Back-End Developer',
        image: rapImage
    },
    {
        name: 'JJ',
        role: 'Back-End Developer',
        image: jjImage
    },
    {
        name: 'Gelo',
        role: 'QA Specialist',
        image: geloImage
    }
];

const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className={styles.aboutPage}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <h1>About The Team</h1>
                    <p>Meet the <span className={styles.teamName}>SaJakipir Boys</span>, a passionate and well-rounded team of developers from NU-MOA, friends since our first year of college.</p>
                </motion.div>

                {/* Team Grid */}
                <div className={styles.teamGrid}>
                    {teamMembers.map((member, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className={styles.memberCard}>
                                <div className={styles.imageWrapper}>
                                    <img src={member.image} alt={member.name} className={styles.memberImage} />
                                </div>
                                <h3 className={styles.memberName}>{member.name}</h3>
                                <p className={styles.memberRole}>{member.role}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default About;