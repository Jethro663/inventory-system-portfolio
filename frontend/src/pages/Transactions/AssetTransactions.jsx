// ================================================================================
// FILE: src/pages/Transactions/AssetTransactions.jsx
// ================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import DataTable from '../../components/Data/DataTable';
import styles from './AssetTransactions.module.css';
import AssetForm from "../../components/Assets/AssetForm";
import Modal from "../../components/UI/Modal";
import TransactionForm from "../../components/Transactions/TransactionForm";

const AssetTransactions = () => {
    const { user } = useApp();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [filters, setFilters] = useState({
        notes: '',
        action: '',
        assetName: '',
        userName: ''
    });

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        total: 0
    });

    // unified search + field selector
    const [query, setQuery] = useState('');
    const [selectedField, setSelectedField] = useState('asset'); // default
    const debounceRef = useRef(null);

    useEffect(() => {
        fetchTransactions();
    }, [filters, pagination.page, pagination.size]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                size: pagination.size,
                notes: filters.notes || undefined,
                assetName: filters.assetName || undefined,
                username: filters.userName || undefined,
                action: filters.action || undefined
            };

            console.log('API Params:', params);

            const response = await api.get('/asset-transactions/search', { params });
            setTransactions(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.totalElements || 0
            }));
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };


    // Handle text input (debounced) - FIXED VERSION
    const handleSearchChange = (value) => {
        setQuery(value);
        setPagination(prev => ({ ...prev, page: 0 }));
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            setFilters(prev => {
                // Only set the filter for the currently selected field
                const newFilters = {
                    notes: '',
                    assetName: '',
                    userName: '',
                    action: prev.action
                };

                switch (selectedField) {
                    case 'notes':
                        newFilters.notes = value;
                        break;
                    case 'asset':
                        newFilters.assetName = value;
                        break;
                    case 'user':
                        newFilters.userName = value;
                        break;
                }

                return newFilters;
            });
        }, 300);
    };

    // Handle field radio change - FIXED VERSION
    const handleFieldChange = (e) => {
        const newField = e.target.value;
        setSelectedField(newField);

        // Reset filters to only include the selected field
        setFilters(prev => ({
            notes: newField === 'notes' ? query : '',
            assetName: newField === 'asset' ? query : '',
            userName: newField === 'user' ? query : '',
            action: prev.action // preserve action filter
        }));
    };

    const handleCreate = () => {
        setShowForm(true);
    };
    const handleFormSubmit = async () => {
        setShowForm(false);
        await fetchTransactions(); // Refresh the list
    };

    // Action dropdown
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

    const getActionIcon = (action) => {
        const icons = {
            CHECKOUT: '📤',
            RETURN: '📥',
            TRANSFER: '🔄',
            MAINTENANCE: '🔧',
            REPAIR: '⚒️',
            RETIRE: '📦'
        };
        return icons[action] || '📝';
    };

    const columns = [
        {
            key: 'action',
            label: 'Action',
            sortable: true,
            render: (value) => (
                <div className={styles.actionCell}>
                    <span className={styles.actionIcon}>{getActionIcon(value)}</span>
                    <span>{value}</span>
                </div>
            )
        },
        {
            key: 'asset.name',
            label: 'Asset',
            sortable: true,
            render: (value, transaction) => (
                <span>{transaction.asset?.name || 'Unknown Asset'}</span>
            )
        },
        {
            key: 'user.username',
            label: 'User',
            sortable: true,
            render: (value, transaction) => (
                <span className={styles.userName}>
          {transaction.user?.username || 'Unknown User'}
        </span>
            )
        },
        {
            key: 'transactionDate',
            label: 'Date',
            sortable: true,
            render: (value) => new Date(value).toLocaleString()
        },
        {
            key: 'notes',
            label: 'Notes',
            sortable: false
        }
    ];

    // Framer motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className={styles.transactions}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <div>
                        <h1>Asset Transactions</h1>
                        <p>View and manage asset transaction logs</p>
                    </div>
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
                                <label>
                                    <input
                                        type="radio"
                                        value="asset"
                                        checked={selectedField === 'asset'}
                                        onChange={handleFieldChange}
                                    />
                                    Asset
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="notes"
                                        checked={selectedField === 'notes'}
                                        onChange={handleFieldChange}
                                    />
                                    Notes
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        value="user"
                                        checked={selectedField === 'user'}
                                        onChange={handleFieldChange}
                                    />
                                    User
                                </label>
                            </div>

                            {/* Action select + Add Transaction button side by side */}
                            <div className={styles.actionGroup}>
                                <select
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">All Actions</option>
                                    <option value="CREATE">CREATE</option>
                                    <option value="AVAILABLE">AVAILABLE</option>
                                    <option value="IN_USE">IN_USE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="DAMAGED">DAMAGED</option>
                                    <option value="RETIRE">RETIRE</option>
                                </select>

                                {user?.role === 'ADMIN' && (
                                    <Button onClick={handleCreate}>+ Add Transaction</Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Data Table */}
                <motion.div variants={itemVariants}>
                    <DataTable
                        columns={columns}
                        data={transactions}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        emptyMessage="No transactions found."
                    />
                </motion.div>

                {/* Transaction Form Modal */}
                <Modal
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    title="Log New Transaction"
                    size="lg"
                >
                    <TransactionForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </Modal>


            </motion.div>
        </div>
    );
};

export default AssetTransactions;
