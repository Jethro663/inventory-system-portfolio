// src/pages/Assets/AssetCategories.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import DataTable from '../../components/Data/DataTable';
import Modal from '../../components/UI/Modal';
import styles from './AssetCategories.module.css';

/**
 * Asset Categories Management Page
 * 
 * Purpose: Manage asset categories with CRUD operations
 * 
 * State:
 * - categories: Array of category objects
 * - loading: Boolean indicating loading state
 * - showForm: Boolean controlling form modal visibility
 * - editingCategory: Currently edited category object
 * - searchTerm: Search filter term
 */
const AssetCategories = () => {
    const { user, showModal, showConfirmModal } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/asset-categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };
    const canEditAssetsCategories = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

    const handleDelete = async (category) => {
        showConfirmModal({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the category "${category.name}"?`,
            confirmText: 'Delete',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/asset-categories/${category.id}`);
                    fetchCategories();
                    showModal('Success', `Category "${category.name}" was deleted.`, 'success');
                } catch (error) {
                    console.error('Failed to delete category:', error);
                    const errorMessage = error.response?.data?.message || 'Failed to delete category.';
                    showModal('Error', errorMessage, 'error');
                }
            },
        });
    };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/asset-categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/asset-categories', formData);
      }
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (value, category) => (
        <div className={styles.categoryCell}>

          <div>
            <div className={styles.categoryName}>{value}</div>
            {category.description && (
              <div className={styles.categoryDescription}>{category.description}</div>
            )}
              {category.iconUrl && (
                  <img
                      src={`${process.env.REACT_APP_API_URL}${category.iconUrl}`}
                      alt={category.description}
                      className={styles.categoryIcon}
                  />
              )}
          </div>
        </div>
      )
    },
      {
          key: 'assets',
          label: 'Asset Count',
          render: (_, category) => (
              <span className={styles.assetCount}>
      {category.assetCount} assets
    </span>
          )
      }
      ,
      ...(canEditAssetsCategories ? [{
          key: 'actions',
          label: 'Actions',
          render: (_, category) => (
              <div className={styles.actions}>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                  >
                      Edit
                  </Button>
                  <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      disabled={category.assets?.length > 0}
                  >
                      Delete
                  </Button>
              </div>
          )
      }] : [])

  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
    <div className={styles.categories}>

      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
          {/* Header */}

          <motion.div className={styles.header} variants={itemVariants}>
              <div>
                  <h1>Asset Categories</h1>
                  <p>Organize your assets into categories for better management</p>
              </div>



          </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants}>
          <Card className={styles.searchCard}>
           <div className={styles.filterGrid}>
               <Input
                   placeholder="Search categories..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   icon="🔍"
               />
               {/* Add Category Button */}
               {canEditAssetsCategories && ( <Button
                   variant="primary"
                   onClick={handleCreate}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
               >
                   + Add Category
               </Button>)}
               <div className={styles.spacer}></div>

           </div>
          </Card>

        </motion.div>

        {/* Categories Grid */}
        <motion.div variants={itemVariants}>
          <DataTable
            columns={columns}
            data={filteredCategories}
            loading={loading}
            pagination={{
              page: 0,
              size: 10,
              total: filteredCategories.length
            }}
            onPageChange={() => {}}
            emptyMessage="No categories found. Create your first category to get started."
          />
        </motion.div>
          {/* Category Form Modal */}

          {canEditAssetsCategories && (<Modal
              isOpen={showForm}
              onClose={() => {
                  setShowForm(false);
                  setEditingCategory(null);
              }}
              title={editingCategory ? 'Edit Category' : 'Create New Category'}
          >
              <CategoryForm
                  category={editingCategory}
                  onSubmit={handleFormSubmit}  // Calls POST or PUT depending on create/edit
                  onCancel={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                  }}
              />
          </Modal>)}

      </motion.div>


    </div>
  );
};

// Simple Category Form Component
const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        iconUrl: category.iconUrl || ''
      });
    }
  }, [category]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Description cannot exceed 255 characters';
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
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save category';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, iconUrl: 'Please select an image file' }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/asset-categories/upload-icon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        iconUrl: response.data.data
      }));
    } catch (error) {
      setErrors(prev => ({ ...prev, iconUrl: 'Failed to upload icon' }));
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

      <div className={styles.formGroup}>
        <Input
          label="Category Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter category name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter category description (optional)"
          className={styles.textarea}
          rows="3"
        />
        {errors.description && (
          <span className={styles.errorText}>{errors.description}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Category Icon</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleIconUpload}
          className={styles.fileInput}
        />
        {formData.iconUrl && (
          <motion.div
            className={styles.iconPreview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={formData.iconUrl} alt="Icon preview" />
          </motion.div>
        )}
        {errors.iconUrl && (
          <span className={styles.errorText}>{errors.iconUrl}</span>
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
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </motion.form>
  );
};

export default AssetCategories;