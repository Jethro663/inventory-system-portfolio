// src/pages/Audit/Audits.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import DataTable from '../../components/Data/DataTable';
import styles from './Audits.module.css';

/**
 * Audit Log Page
 *
 * Purpose: Display system audit trail with filtering and search
 *
 * State:
 * - audits: Array of audit log entries
 * - loading: Boolean indicating loading state
 * - filters: Object containing filter criteria
 *
 * Animations: Timeline animations, filter transitions, search interactions
 */
const Audits = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    entityName: '',
    actionType: '',
    performedBy: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0
  });

    const [selectedField, setSelectedField] = useState('searchTerm'); // default
    const [query, setQuery] = useState('');

// Add these handlers
    const handleSearchChange = (value) => {
        setQuery(value);
        setFilters(prev => ({
            searchTerm: selectedField === 'searchTerm' ? value : '',
            entityName: selectedField === 'entityName' ? value : '',
            actionType: selectedField === 'actionType' ? value : '',
            performedBy: selectedField === 'performedBy' ? value : ''
        }));
    };

    const handleFieldChange = (e) => {
        const newField = e.target.value;
        setSelectedField(newField);
        setFilters(prev => ({
            searchTerm: newField === 'searchTerm' ? query : '',
            entityName: newField === 'entityName' ? query : '',
            actionType: newField === 'actionType' ? query : '',
            performedBy: newField === 'performedBy' ? query : ''
        }));
    };

  useEffect(() => {
    fetchAudits();
  }, [filters, pagination.page, pagination.size]);

  const fetchAudits = async () => {
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

      const response = await api.get('/audits/search', { params });
        setAudits(response.data?.data || []);
        setPagination(prev => ({
            ...prev,
            total: response.data?.pagination?.totalElements || 0,
        }));
    } catch (error) {
      console.error('Failed to fetch audits:', error);
    } finally {
      setLoading(false);
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

  const getActionIcon = (actionType) => {
    const icons = {
      CREATE: '🆕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      LOGIN: '🔐',
      LOGOUT: '🚪',
      REGISTER: '👤',
      PASSWORD_CHANGE: '🔑'
    };
    return icons[actionType] || '📝';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const columns = [
      {
          key: 'id',
          label: 'ID',
          sortable: true,
          render: (value) => (
              <div className={styles.actionCell}>
          <span className={styles.actionIcon}>
            {getActionIcon(value)}
          </span>
                  <span className={styles.actionText}>{value}</span>
              </div>
          )
      },
    {
      key: 'actionType',
      label: 'Action',
      sortable: true,
      render: (value) => (
        <div className={styles.actionCell}>
          <span className={styles.actionIcon}>
            {getActionIcon(value)}
          </span>
          <span className={styles.actionText}>{value}</span>
        </div>
      )
    },
    {
      key: 'entityName',
      label: 'Entity',
      sortable: true,
      render: (value, audit) => (
        <div>
          <div className={styles.entityName}>{value}</div>
          <div className={styles.entityId}>ID: {audit.entityId}</div>
        </div>
      )
    },
    {
      key: 'performedBy',
      label: 'Performed By',
      sortable: true
    },
    {
      key: 'performedAt',
      label: 'Timestamp',
      sortable: true,
      render: (value) => formatTimestamp(value)
    },
    {
      key: 'notes',
      label: 'Details',
      render: (_, audit) => (
        <div className={styles.details}>
          {audit.oldValue && (
            <div className={styles.change}>
              <strong>From:</strong> {audit.oldValue}
            </div>
          )}
          {audit.newValue && (
            <div className={styles.change}>
              <strong>To:</strong> {audit.newValue}
            </div>
          )}
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

  return (
    <div className={styles.audits}>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div>
            <h1>Audit Log</h1>
            <p>System activity and change history</p>
          </div>
        </motion.div>

        {/* Activity Summary */}
        <motion.div className={styles.summary} variants={itemVariants}>
          <Card className={styles.summaryCard}>
            <h3>Recent Activity</h3>
            <div className={styles.activitySummary}>
              <div className={styles.activityStat}>
                <span className={styles.statNumber}>
                  {audits.filter(a => a.actionType === 'CREATE').length}
                </span>
                <span>Creations</span>
              </div>
              <div className={styles.activityStat}>
                <span className={styles.statNumber}>
                  {audits.filter(a => a.actionType === 'UPDATE').length}
                </span>
                <span>Updates</span>
              </div>
              <div className={styles.activityStat}>
                <span className={styles.statNumber}>
                  {audits.filter(a => a.actionType === 'DELETE').length}
                </span>
                <span>Deletions</span>
              </div>
              <div className={styles.activityStat}>
                <span className={styles.statNumber}>
                  {audits.filter(a => a.actionType.includes('LOGIN')).length}
                </span>
                <span>Logins</span>
              </div>
            </div>
          </Card>
        </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
              <Card className={styles.filters}>
                  <div className={styles.filterGrid}>
                      {/* Search bar */}
                      <Input
                          placeholder={`Search by ${selectedField}...`}
                          value={query}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          icon="🔍"
                      />


                      {/* Radio buttons */}
                      <div className={styles.radioGroup}>
                          <label className={`${styles.radioLabel} ${selectedField === 'searchTerm' ? styles.radioSelected : ''}`}>
                              <input
                                  type="radio"
                                  value="searchTerm"
                                  checked={selectedField === 'searchTerm'}
                                  onChange={handleFieldChange}
                              />
                              <span className={styles.radioText}>All</span>
                          </label>
                          <label className={`${styles.radioLabel} ${selectedField === 'entityName' ? styles.radioSelected : ''}`}>
                              <input
                                  type="radio"
                                  value="entityName"
                                  checked={selectedField === 'entityName'}
                                  onChange={handleFieldChange}
                              />
                              <span className={styles.radioText}>Entity</span>
                          </label>

                          <label className={`${styles.radioLabel} ${selectedField === 'performedBy' ? styles.radioSelected : ''}`}>
                              <input
                                  type="radio"
                                  value="performedBy"
                                  checked={selectedField === 'performedBy'}
                                  onChange={handleFieldChange}
                              />
                              <span className={styles.radioText}>Performer</span>
                          </label>
                      </div>

                  </div>
              </Card>
          </motion.div>

        {/* Data Table */}
        <motion.div variants={itemVariants}>
          <DataTable
            columns={columns}
            data={audits}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage="No audit logs found. System activity will appear here."
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Audits;