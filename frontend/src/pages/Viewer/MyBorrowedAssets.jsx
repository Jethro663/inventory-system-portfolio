// src/pages/MyBorrowedAssets.jsx
import React, { useEffect, useState } from 'react';
import DataTable from '../../components/Data/DataTable';
import Button from '../../components/UI/Button';
import { fetchMyRequests, cancelRequest } from '../../api/borrowRequestsApi';
import { useApp } from '../../context/AppContext';
import styles from '../Transactions/BorrowRequestsAdmin.module.css'; // reuse the admin module CSS for consistent layout
import { motion } from 'framer-motion';

/**
 * Viewer page: My Borrow Requests / Currently Borrowed Items
 *
 * Mirrors the admin table but only displays requests belonging to the logged-in user.
 * Columns: Request ID | Asset Name | Status | Requested At | Processed By | Note | Action
 *
 * - Pending requests show a Cancel button.
 * - Approved requests with asset in_use are visible here as active borrowings.
 */

const MyBorrowedAssets = () => {
    const { user, showModal, showConfirmModal } = useApp();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rowActionLoading, setRowActionLoading] = useState({}); // { [id]: boolean }

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await fetchMyRequests();
            setRequests(data);
        } catch (e) {
            console.error('Failed to fetch user borrow requests', e);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        showConfirmModal({
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel this pending request?',
            confirmText: 'Cancel Request',
            confirmVariant: 'danger',
            onConfirm: async () => {
                setRowActionLoading(prev => ({ ...prev, [id]: true }));
                try {
                    await cancelRequest(id);
                    await loadRequests();
                    showModal('Success', 'Request cancelled successfully.', 'success');
                } catch (e) {
                    showModal('Error', 'Failed to cancel request: ' + (e.response?.data?.message || e.message), 'error');
                } finally {
                    setRowActionLoading(prev => ({ ...prev, [id]: false }));
                }
            },
        });
    };

    // Define DataTable columns similarly to admin page for visual consistency
    const columns = [
        {
            key: 'id',
            label: 'Request ID',
            sortable: true
        },
        {
            key: 'assetName',
            label: 'Asset Name',
            sortable: true,
            render: (val, row) => <span>{val || (row.assetId ? `Asset #${row.assetId}` : '-')}</span>
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => <span className={styles.statusBadge}>{val}</span>
        },
        {
            key: 'requestedAt',
            label: 'Requested At',
            sortable: true,
            render: (val) => val ? new Date(val).toLocaleString() : '-'
        },
        {
            key: 'processedBy',
            label: 'Processed By',
            sortable: false,
            render: (val) => val || '-'
        },
        {
            key: 'note',
            label: 'Note',
            sortable: false,
            render: (val) => val || '-'
        },
        {
            key: 'declineReason',
            label: 'Reason',
            sortable: false,
            render: (val) => val || '-'
        },
        {
            key: 'actions',
            label: 'Action',
            sortable: false,
            cellClassName: styles.actionsCell,
            render: (_, row) => {
                // Only allow cancel if status is PENDING (case-insensitive)
                const isPending = (row.status || '').toUpperCase() === 'PENDING';
                return (
                    <div className={styles.actions}>
                        {isPending ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(row.id)}
                                disabled={rowActionLoading[row.id]}
                            >
                                {rowActionLoading[row.id] ? 'Cancelling...' : 'Cancel'}
                            </Button>
                        ) : (
                            <span style={{ color: 'var(--neutral-500)' }}>—</span>
                        )}
                    </div>
                );
            }
        }
    ];

    const pagination = {
        page: 0,
        size: requests.length || 10,
        total: requests.length || 0
    };

    return (
        <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.header}>
                <h2>My Borrow Requests</h2>
                <div>
                    <small style={{ color: 'var(--neutral-500)' }}>
                        Showing requests and active borrowings for <strong>{user?.username}</strong>
                    </small>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={requests}
                loading={loading}
                pagination={pagination}
                onPageChange={() => {}}
                emptyMessage="You have no borrow requests or active borrowed assets."
            />
        </motion.div>
    );
};

export default MyBorrowedAssets;
