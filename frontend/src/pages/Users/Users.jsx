// src/pages/Users/Users.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import DataTable from '../../components/Data/DataTable';
import UserForm from '../../components/Users/UserForm';
import Modal from '../../components/UI/Modal';
import styles from './Users.module.css';

/**
 * User Management Page (Admin Only)
 * 
 * Purpose: Manage system users, roles, and permissions
 * 
 * State:
 * - users: Array of user objects
 * - loading: Boolean indicating loading state
 * - showForm: Boolean controlling form modal visibility
 * - editingUser: Currently edited user object
 * - filters: Object containing filter criteria
 * 
 * Animations: Role badges, user cards, form transitions
 */
const Users = () => {
    const { user: currentUser, showModal, showConfirmModal } = useApp();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    role: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page, pagination.size]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...filters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] == null) {
          delete params[key];
        }
      });

      const response = await api.get('/users/search', { params });
      setUsers(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.totalElements || 0
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

    const handleDelete = async (user) => {
        if (user.username === currentUser.username) {
            showModal('Action Forbidden', 'You cannot delete your own account!', 'warning');
            return;
        }

        showConfirmModal({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the user "${user.username}"? This is permanent.`,
            confirmText: 'Delete User',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${user.username}`);
                    fetchUsers();
                    showModal('Success', `User "${user.username}" has been deleted.`, 'success');
                } catch (error) {
                    console.error('Failed to delete user:', error);
                    showModal('Error', 'Failed to delete user. Please try again.', 'error');
                }
            },
        });
    };

    // Users.jsx
    const handleFormSubmit = async (formData) => {
        try {
            const payload = {
                username: formData.username,
                role: formData.role,
                ...(formData.password && formData.password.trim() !== '' && {
                    password: formData.password
                })
            };

            if (editingUser) {
                await api.put(`/users/${editingUser.username}`, payload);
            } else {
                await api.post('/users', payload);
            }

            setShowForm(false);
            setEditingUser(null);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Failed to save user:', error);
            // Let the UserForm handle displaying the error message internally.
            // No alert needed here. We re-throw to allow the form to catch it.
            throw error;
        }
    };


    const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      ADMIN: { label: 'Admin', color: '#ef4444' },
      STAFF: { label: 'Staff', color: '#f59e0b' },
      VIEWER: { label: 'Viewer', color: '#3b82f6' }
    };

    const config = roleConfig[role] || { label: role, color: '#64748b' };

    return (
      <span
        className={styles.roleBadge}
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'username',
      label: 'Username',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => getRoleBadge(value)
    },
    {
      key: 'id',
      label: 'User ID',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(user)}
            disabled={user.username === currentUser.username}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(user)}
            disabled={user.username === currentUser.username}
          >
            Delete
          </Button>
        </div>
      )
    }
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

  if (currentUser?.role !== 'ADMIN') {
    return null; // Or redirect component
  }

  return (
    <div className={styles.users}>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div>
            <h1>User Management</h1>
            <p>Manage system users and their permissions</p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Add User
          </Button>
        </motion.div>

        {/* Role Summary */}
        <motion.div className={styles.summary} variants={itemVariants}>
          <Card className={styles.summaryCard}>
            <h3>User Roles Summary</h3>
            <div className={styles.roleSummary}>
              <div className={styles.roleStat}>
                <span className={styles.roleCount}>
                  {users.filter(u => u.role === 'ADMIN').length}
                </span>
                <span>Admins</span>
              </div>
              <div className={styles.roleStat}>
                <span className={styles.roleCount}>
                  {users.filter(u => u.role === 'STAFF').length}
                </span>
                <span>Staff</span>
              </div>
              <div className={styles.roleStat}>
                <span className={styles.roleCount}>
                  {users.filter(u => u.role === 'VIEWER').length}
                </span>
                <span>Viewers</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className={styles.filters}>
            <div className={styles.filterGrid}>
              <Input
                placeholder="Search users..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                icon="🔍"
              />
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className={styles.select}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </Card>
        </motion.div>

        {/* Data Table */}
        <motion.div variants={itemVariants}>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage="No users found. Create your first user to get started."
          />
        </motion.div>

        {/* User Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          title={editingUser ? 'Edit User' : 'Create New User'}
        >
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        </Modal>
      </motion.div>
    </div>
  );
};

export default Users;