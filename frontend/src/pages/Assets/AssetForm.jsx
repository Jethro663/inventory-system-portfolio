// src/components/Assets/AssetForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Input from '../UI/Input';
import Button from '../UI/Button';
import api from '../../utils/api';
import styles from './AssetForm.module.css';

/**
 * Asset Form Component
 * 
 * Purpose: Create and edit asset records with validation
 * 
 * Props:
 * - asset: Asset object for editing (null for creation)
 * - onSubmit: Function called on form submission
 * - onCancel: Function called on form cancellation
 * 
 * State:
 * - formData: Object containing form field values
 * - errors: Object containing validation errors
 * - categories: Array of available asset categories
 * - loading: Boolean indicating submission state
 * 
 * Animations: Form field animations, error states, loading transitions
 */
const AssetForm = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    category: '',
    status: 'AVAILABLE',
    purchaseDate: '',
    cost: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        serialNumber: asset.serialNumber || '',
          category: asset.category || '',
        status: asset.status || 'AVAILABLE',
        purchaseDate: asset.purchaseDate || '',
        cost: asset.cost || '',
        imageUrl: asset.imageUrl || ''
      });
    }
  }, [asset]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/asset-categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.serialNumber)) {
      newErrors.serialNumber = 'Serial number must contain only uppercase letters, numbers, and hyphens';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.cost && formData.cost < 0.01) {
      newErrors.cost = 'Cost must be at least 0.01';
    }

    if (formData.purchaseDate && new Date(formData.purchaseDate) > new Date()) {
      newErrors.purchaseDate = 'Purchase date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value, // ✅ Always updates category and other fields
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
            // Build backend-compatible payload
            const payload = {
                ...formData,
                category: { id: parseInt(formData.category, 10) }, // expects object
            };

            await onSubmit(payload); // send to parent (POST /assets)
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Failed to save asset';
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };



    const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic file validation
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, imageUrl: 'Image must be less than 5MB' }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/assets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.data
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, imageUrl: 'Failed to upload image' }));
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={styles.form}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {errors.submit && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errors.submit}
        </motion.div>
      )}

      <div className={styles.formGrid}>
        <Input
          label="Asset Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter asset name"
          required
        />

        <Input
          label="Serial Number"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          error={errors.serialNumber}
          placeholder="Enter serial number"
          required
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`${styles.select} ${errors.category ? styles.error : ''}`}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
                <option key={category.id} value={String(category.id)}>
                    {category.name}
                </option>

            ))}
          </select>
          {errors.category && (
            <span className={styles.errorText}>{errors.category}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DAMAGED">Damaged</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <Input
          label="Purchase Date"
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          error={errors.purchaseDate}
        />

        <Input
          label="Cost ($)"
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          error={errors.cost}
          placeholder="0.00"
          step="0.01"
          min="0.01"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Asset Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.fileInput}
        />
        {formData.imageUrl && (
          <motion.div
            className={styles.imagePreview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
              <img
                  src={
                      asset.imageUrl?.startsWith('http')
                          ? asset.imageUrl
                          : `${process.env.REACT_APP_API_URL}${asset.imageUrl}`
                  }
                  alt={asset.name}
              />

          </motion.div>
        )}
        {errors.imageUrl && (
          <span className={styles.errorText}>{errors.imageUrl}</span>
        )}
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
          {asset ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </motion.form>
  );
};

export default AssetForm;