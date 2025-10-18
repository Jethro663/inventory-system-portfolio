// src/pages/Transactions/BorrowRequestsAdmin.jsx
// NOTE: Admin page showing borrow requests in a DataTable with approve / decline actions.

import React, { useEffect, useState, useRef } from 'react'; // NOTE: React + hooks
import { motion } from 'framer-motion'; // NOTE: follow your page animation pattern
import { useApp } from '../../context/AppContext'; // NOTE: to get current user (adminId)
import api from '../../utils/api'; // NOTE: axios instance used across your app
import DataTable from '../../components/Data/DataTable'; // NOTE: reusable table component. See your DataTable implementation. :contentReference[oaicite:4]{index=4}
import Modal from '../../components/UI/Modal'; // NOTE: modal component used elsewhere. :contentReference[oaicite:5]{index=5}
import Button from '../../components/UI/Button'; // NOTE: button component used elsewhere. :contentReference[oaicite:6]{index=6}
import Input from '../../components/UI/Input'; // NOTE: optional search input (keeps UX consistent)
import styles from './BorrowRequestsAdmin.module.css'; // NOTE: local module CSS

// NOTE: Helper to format ISO timestamps into readable strings
const formatDateTime = (iso) => {
    try {
        return iso ? new Date(iso).toLocaleString() : '-';
    } catch (e) {
        return iso || '-';
    }
};

const BorrowRequestsAdmin = () => {
    // NOTE: get current user (for adminId param)
    const { user } = useApp(); // NOTE: AppContext provides user object
    const [requests, setRequests] = useState([]); // NOTE: table data
    const [loading, setLoading] = useState(true); // NOTE: global loading state
    const [rowActionLoading, setRowActionLoading] = useState({}); // NOTE: per-row action loading map { [id]: boolean }

    // NOTE: searching + debounce similar to other pages
    const [searchTerm, setSearchTerm] = useState('');
    const debounceRef = useRef(null);

    // NOTE: pagination state (DataTable expects { page, size, total })
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        total: 0
    });

    // NOTE: decline modal state
    const [declineModalOpen, setDeclineModalOpen] = useState(false);
    const [selectedToDecline, setSelectedToDecline] = useState(null); // NOTE: id of request to decline
    const [declineReason, setDeclineReason] = useState(''); // NOTE: the reason text

    // NOTE: fetch requests whenever page/size/searchTerm changes
    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.size, /* searchTerm handled by debounce below */]);

    // NOTE: debounce search input so API isn't spammed
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // Reset to page 0 when searching
            setPagination(prev => ({ ...prev, page: 0 }));
            fetchRequests({ page: 0, size: pagination.size, search: searchTerm });
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // NOTE: core fetch function for borrow requests
    const fetchRequests = async (override = null) => {
        const pageToUse = override?.page ?? pagination.page;
        const sizeToUse = override?.size ?? pagination.size;
        const searchToUse = override?.search ?? searchTerm;

        setLoading(true);
        try {
            const params = {
                page: pageToUse,
                size: sizeToUse,
            };

            // NOTE: include searchTerm only when present
            if (searchToUse && searchToUse.trim() !== '') params.searchTerm = searchToUse.trim();

            // NOTE: backend returns pending by default; including params is safe
            const res = await api.get('/borrow-requests', { params }); // NOTE: follow the existing pattern in your codebase. :contentReference[oaicite:7]{index=7}

            // NOTE: many pages expect data in res.data.data and pagination in res.data.pagination
            const items = res.data?.data || [];
            const totalElements = res.data?.pagination?.totalElements ?? items.length; // fallback when API returns full list

            setRequests(items);
            setPagination(prev => ({ ...prev, total: totalElements, page: pageToUse, size: sizeToUse }));
        } catch (err) {
            console.error('Failed to fetch borrow requests', err);
            // NOTE: you may want to surface the error via your app context later
        } finally {
            setLoading(false);
        }
    };

    // NOTE: handler for DataTable page changes (DataTable passes 0-based page index)
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // NOTE: Approve a request -> PUT /borrow-requests/{id}/approve
    const handleApprove = async (id) => {
        setRowActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await api.put(`/borrow-requests/${id}/approve`, null, { params: { adminId: user?.id }, validateStatus: () => true });
            // NOTE: adminId param per your backend pattern. :contentReference[oaicite:8]{index=8}
            await fetchRequests(); // NOTE: refresh list after approve
        } catch (err) {
            console.error('Approve failed', err);
            alert('Failed to approve: ' + (err.response?.data?.message || err.message));
        } finally {
            setRowActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // NOTE: open decline modal
    const openDeclineModal = (id) => {
        setSelectedToDecline(id);
        setDeclineReason('');
        setDeclineModalOpen(true);
    };

    // NOTE: confirm decline (calls PUT /borrow-requests/{id}/decline with adminId + reason)
    const confirmDecline = async () => {
        const id = selectedToDecline;
        if (!id) return;
        setRowActionLoading(prev => ({ ...prev, [id]: true }));
        try {
            await api.put(`/borrow-requests/${id}/decline`, null, {
                params: { adminId: user?.id, reason: declineReason || '' },
                validateStatus: () => true
            });


            setDeclineModalOpen(false);
            setSelectedToDecline(null);
            setDeclineReason('');
            await fetchRequests();
        } catch (err) {
            console.error('Decline failed', err);
            alert('Failed to decline: ' + (err.response?.data?.message || err.message));
        } finally {
            setRowActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // NOTE: DataTable column definitions (keys must match objects in requests)
    const columns = [
        {
            key: 'id',
            label: 'Request ID',
            sortable: true,
            render: (val, row) => <span>{row.id}</span>
        },
        {
            key: 'asset.name',
            label: 'Asset Name',
            sortable: true,
            // NOTE: DataTable's render receives (value, row) but we must display asset.name safely
            render: (_, row) => <span>{row.asset?.name || '-'}</span>
        },
        {
            key: 'requester.username',
            label: 'Requested By',
            sortable: true,
            render: (_, row) => <span>{row.requester?.username || '-'}</span>
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => <span className={styles.statusBadge}>{val}</span>
        },
        {
            key: 'createdAt',
            label: 'Processed at',
            sortable: true,
            render: (val) => <span>{formatDateTime(val)}</span>
        },
        {
            key: 'actions',
            label: 'Action',
            sortable: false,
            cellClassName: styles.actionsCell,
            render: (_, row) => (
                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(row.id)}
                        disabled={rowActionLoading[row.id]}
                    >
                        {rowActionLoading[row.id] ? 'Approving...' : 'Approve'}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeclineModal(row.id)}
                        disabled={rowActionLoading[row.id]}
                    >
                        Decline
                    </Button>
                </div>
            )
        }
    ];

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header + controls */}
            <div className={styles.header}>
                <h2>Borrow Requests (Admin)</h2> {/* NOTE: page title */}
                <div className={styles.controls}>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={requests}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyMessage="No borrow requests found."
            />

            {/* Decline reason modal */}
            <Modal
                isOpen={declineModalOpen}
                onClose={() => setDeclineModalOpen(false)}
                title="Decline Borrow Request"
                size="sm"
            >
                <div className={styles.modalContent}>
                    <label className={styles.label}>Reason (optional)</label>
                    <textarea
                        className={styles.textarea}
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Enter reason for decline (optional)"
                    />
                    <div className={styles.modalActions}>
                        <Button variant="ghost" size="sm" onClick={() => setDeclineModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={confirmDecline}
                            disabled={!selectedToDecline || rowActionLoading[selectedToDecline]}
                        >
                            {rowActionLoading[selectedToDecline] ? 'Declining...' : 'Confirm Decline'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
};

export default BorrowRequestsAdmin;
