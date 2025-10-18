// src/components/Modals/BorrowRequestModal.jsx
// NOTE: Prevents duplicate borrow requests by checking existing requests and disabling multiple submissions.

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import styles from '../UI/Modal.module.css'; // Reuse your modal style

/**
 * BorrowRequestModal
 *
 * Props:
 * - isOpen (bool)
 * - onClose (fn)
 * - asset (object) -> { id, name, status }
 * - currentUser (object) -> { id, username }
 * - onSuccess (fn) optional callback
 */
export default function BorrowRequestModal({ isOpen, onClose, asset, currentUser, onSuccess }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alreadyRequested, setAlreadyRequested] = useState(false); // NOTE: new state to track duplicate

    // NOTE: When modal opens, check if this user already has a pending/in_use request for this asset
    useEffect(() => {
        const checkExistingRequest = async () => {
            if (!isOpen || !asset?.id || !currentUser) return;

            try {
                setError('');
                setAlreadyRequested(false);
                console.log(asset)
                console.log(currentUser)

                // NOTE: Query existing borrow requests for this asset & user
                const res = await api.get('/borrow-requests/check', {
                    params: {
                        assetId: asset.id,
                        userId: currentUser,
                    },
                });


                if(res.data.data === true) {
                    console.log(res.data)
                    setAlreadyRequested(true);
                    setError('You already have an active or pending borrow request for this asset.');
                }

            } catch (err) {
                console.error('Failed to check duplicate borrow request', err);
            }
        };

        checkExistingRequest();
    }, [isOpen, asset?.id, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // NOTE: Block duplicate submit attempt
        if (alreadyRequested) {
            setError('You already submitted a borrow request for this asset.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = {
                userId: currentUser, // NOTE: was passing whole object; now send only ID
                assetId: asset.id,
                note,
            };

            const res = await api.post('/borrow-requests', payload);
            onSuccess?.(res.data?.data);
            onClose();
        } catch (e) {
            // NOTE: If backend returns a duplicate conflict, show message
            const msg = e.response?.data?.message || 'Failed to submit request.';
            setError(msg);

            // NOTE: If backend confirms duplicate, prevent re-submit
            if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
                setAlreadyRequested(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={`${styles.modal} ${styles.sm}`}
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                {/* Header */}
                <div className={styles.header}>
                    <h3 className={styles.title}>Request to Borrow</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            htmlFor="assetName"
                            style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
                        >
                            Asset
                        </label>
                        <input
                            id="assetName"
                            type="text"
                            value={asset?.name || ''}
                            readOnly
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--neutral-300)',
                                background: 'var(--neutral-100)',
                                color: 'var(--on-background)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label
                            htmlFor="note"
                            style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}
                        >
                            Note (optional)
                        </label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={5}
                            placeholder="Add a note or reason for borrowing..."
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--neutral-300)',
                                resize: 'none',
                                background: 'var(--surface-variant)',
                                color: 'var(--on-background)',
                            }}
                            disabled={alreadyRequested}
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    {/* NOTE: Show a soft info banner when duplicate detected */}
                    {alreadyRequested && !error && (
                        <div
                            style={{
                                background: 'var(--neutral-100)',
                                color: 'var(--neutral-700)',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '1rem',
                            }}
                        >
                            You already have a borrow request for this asset.
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem',
                        padding: 'var(--space-6)',
                        borderTop: '1px solid var(--neutral-200)',
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--neutral-100)',
                            color: 'var(--neutral-800)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || alreadyRequested} // NOTE: block when duplicate or loading
                        style={{
                            padding: '0.5rem 1rem',
                            background: alreadyRequested ? 'var(--neutral-300)' : 'var(--primary)',
                            color: 'var(--on-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: alreadyRequested ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {alreadyRequested
                            ? 'Already Requested'
                            : loading
                                ? 'Sending...'
                                : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
