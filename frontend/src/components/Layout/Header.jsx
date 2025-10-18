// src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import ThemeToggle from '../UI/ThemeToggle';
import styles from './Header.module.css';

const Header = () => {
    const { user, logout, isAuthenticated } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/assets', label: 'Assets', icon: '💼' },
    ];

    if(user?.role === "VIEWER") {
        navItems.push({ path: '/my-active-borrowed', label: 'My Borrowed Items', icon: '📦' });
        navItems.push({ path: '/my-borrowed', label: 'Borrow History', icon: '📁' });

    }

    // Only STAFF and ADMIN can access these
    if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
        navItems.push(
            { path: '/asset-categories', label: 'Categories', icon: '📁' },
            { path: '/borrowrequests', label: 'Requests', icon: '📩' },
            { path: '/transactions', label: 'Transactions', icon: '🔄' },
            { path: '/audits', label: 'Audit Log', icon: '📝' },

            { path: '/reports', label: 'Reports', icon: '📈' }
        );
    }

    // Only ADMIN can access Users
    if (user?.role === 'ADMIN') {
        navItems.push({ path: '/users', label: 'Users', icon: '👥' });
    }

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4
            }
        }
    };

    return (
        <motion.header
            className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className={styles.container}>
                {/* Logo Section */}
                <motion.div
                    className={styles.logo}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/">
                        <h1 className={isScrolled ? styles.compactLogo : ''}>
                            {isScrolled ? 'JD' : 'JakiDustin™'}
                        </h1>
                    </Link>
                </motion.div>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <motion.nav className={`${styles.nav} ${isScrolled ? styles.compactNav : ''}`} variants={containerVariants}>
                        <ul className={styles.navList}>
                            {navItems.map((item, index) => (
                                <motion.li
                                    key={item.path}
                                    variants={itemVariants}
                                    custom={index}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={item.path}
                                        className={`${styles.navLink} ${
                                            location.pathname === item.path ? styles.active : ''
                                        } ${isScrolled ? styles.compactLink : ''}`}
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span className={styles.navText}>{item.label}</span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.nav>
                )}

                {/* Actions Section */}
                <motion.div className={`${styles.actions} ${isScrolled ? styles.compactActions : ''}`} variants={itemVariants}>
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <div className={styles.userSection}>
                            <motion.span
                                className={`${styles.userInfo} ${isScrolled ? styles.compactUserInfo : ''}`}
                                whileHover={{ scale: 1.02 }}
                            >
                                {isScrolled ? `👋 ${user?.username}` : `👋 ${user?.username} (${user?.role})`}
                            </motion.span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isScrolled ? '🚪' : 'Logout'}
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Mobile Menu Button */}
                {isAuthenticated && (
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        ☰
                    </button>
                )}
            </div>

            {/* Mobile Navigation */}
            {isAuthenticated && isMobileMenuOpen && (
                <motion.div
                    className={styles.mobileNav}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <ul className={styles.mobileNavList}>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`${styles.mobileNavLink} ${
                                        location.pathname === item.path ? styles.active : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </motion.header>
    );
};

export default Header;