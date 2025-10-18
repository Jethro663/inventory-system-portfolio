// src/pages/Auth/Login.jsx
import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useApp} from '../../context/AppContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import styles from './Auth.module.css';

/**
 * Login Page Component
 *
 * Purpose: Authenticate users with username and password
 *
 * State:
 * - formData: Object containing username and password
 * - errors: Object containing field validation errors
 * - isSubmitting: Boolean indicating submission state
 *
 * Animations: Form field animations, error states, loading transitions
 */
const Login = () => {
    const {login, isAuthenticated, loading, error, clearError} = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);


    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, {replace: true});
        }
    }, [isAuthenticated, navigate, from]);

    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [formData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await login(formData);
            navigate(from, {replace: true});
        } catch (error) {
            // Error handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 20},
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
        <div className={styles.authContainer}>
            <motion.div
                className={styles.authBackground}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.8}}
            >
                <div className={styles.gradient}></div>
            </motion.div>

            <motion.div
                className={styles.authContent}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <Card className={styles.authCard}>
                        <div className={styles.authHeader}>
                            <motion.h1
                                initial={{scale: 0.9}}
                                animate={{scale: 1}}
                                transition={{type: "spring", stiffness: 200}}
                            >
                                Welcome Back
                            </motion.h1>
                            <p>Sign in to your JakiDustin™ account</p>
                        </div>

                        {error && (
                            <motion.div
                                className={styles.errorMessage}
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -10}}
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.authForm}>
                            <motion.div variants={itemVariants}>
                                <Input
                                    label="Username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    error={errors.username}
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                    icon="👤"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    icon="🔒"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={isSubmitting || loading}
                                    fullWidth
                                    className={styles.submitButton}
                                >
                                    Sign In
                                </Button>
                            </motion.div>
                        </form>



                    </Card>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Login;