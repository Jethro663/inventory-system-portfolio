// src/components/Users/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Input from '../UI/Input';
import Button from '../UI/Button';
import styles from './UserForm.module.css';

/**
 * User Form Component
 * * Purpose: Create and edit user accounts, including password changes for existing users.
 */
const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'VIEWER'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                password: '', // Always start with empty password fields for edits
                confirmPassword: '',
                role: user.role || 'VIEWER'
            });
        }
    }, [user]);

    // --- CHANGED: Updated validation logic ---
    const validateForm = () => {
        const newErrors = {};

        // Username validation (only for new users)
        if (!user && !formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (!user && formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!user && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        // Password validation logic
        const isCreating = !user;
        const isChangingPassword = user && (formData.password || formData.confirmPassword);

        // Required for new users
        if (isCreating && !formData.password) {
            newErrors.password = 'Password is required for new users';
        }

        // Check length if a password is being set or changed
        if ((isCreating || isChangingPassword) && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Check for matching passwords if a password is being set or changed
        if ((isCreating || isChangingPassword) && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // This logic correctly handles sending the password only if it's set
            const { confirmPassword, ...submitData } = formData;
            if (!submitData.password) {
                delete submitData.password;
            }
            await onSubmit(submitData);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save user';
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className={styles.form}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {errors.submit && (
                <div className={styles.errorMessage}>
                    {errors.submit}
                </div>
            )}

            <div className={styles.formGrid}>
                <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    placeholder="Enter username"
                    required
                    disabled={!!user} // Can't change username for existing users
                />

                <div className={styles.formGroup}>
                    <label className={styles.label}>Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={styles.select}
                        required
                    >
                        <option value="VIEWER">Viewer</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {/* --- CHANGED: Password fields are now always visible --- */}
            <div className={styles.passwordSection}>
                <h4 className={styles.sectionHeader}>
                    {user ? 'Change Password (Optional)' : 'Set Password'}
                </h4>
                <div className={styles.formGrid}>
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder={user ? "Leave blank to keep current password" : "Enter password"}
                        required={!user}
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="Confirm password"
                        required={!user}
                    />
                </div>
            </div>


            <div className={styles.formActions}>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                >
                    {user ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </motion.form>
    );
};

export default UserForm;