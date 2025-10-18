// src/components/Transactions/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Input from '../UI/Input';
import Button from '../UI/Button';
import api from '../../utils/api';
import styles from './TransactionForm.module.css';

/**
 * Transaction Form Component
 * 
 * Purpose: Log new asset transactions
 */
const TransactionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    userId: '',
    action: 'CHECKOUT',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assetsRes, usersRes] = await Promise.all([
        api.get('/assets'),
        api.get('/users')
      ]);
      setAssets(assetsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assetId) {
      newErrors.assetId = 'Asset is required';
    }

    if (!formData.userId) {
      newErrors.userId = 'User is required';
    }

    if (!formData.action) {
      newErrors.action = 'Action is required';
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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Send as URL parameters instead of JSON body
            const response = await api.post('/asset-transactions', null, {
                params: {
                    assetId: formData.assetId,
                    userId: formData.userId,
                    action: formData.action,
                    notes: formData.notes
                }
            });

            console.log('Transaction created:', response.data);
            onSubmit();
        } catch (error) {
            console.error('Failed to create transaction:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create transaction';
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Asset</label>
          <select
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            className={`${styles.select} ${errors.assetId ? styles.error : ''}`}
            required
            disabled={dataLoading}
          >
            <option value="">Select an asset</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.serialNumber})
              </option>
            ))}
          </select>
          {errors.assetId && (
            <span className={styles.errorText}>{errors.assetId}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>User</label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className={`${styles.select} ${errors.username ? styles.error : ''}`}
            required
            disabled={dataLoading}
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          {errors.username && (
            <span className={styles.errorText}>{errors.username}</span>
          )}
        </div>

          <div className={styles.formGroup}>
              <label className={styles.label}>Action</label>
              <select
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  className={styles.select}
                  required
              >
                  <option>Select an Action</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="IN_USE">IN_USE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="RETIRE">RETIRE</option>
              </select>
          </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about this transaction..."
          className={styles.textarea}
          rows="3"
        />
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
          Log Transaction
        </Button>
      </div>
    </motion.form>
  );
};

export default TransactionForm;