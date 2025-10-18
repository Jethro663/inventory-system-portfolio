// src/pages/Assets/Assets.jsx
import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {useApp} from '../../context/AppContext';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import DataTable from '../../components/Data/DataTable';
import AssetForm from '../../components/Assets/AssetForm';
import Modal from '../../components/UI/Modal';
import styles from './Assets.module.css';
import BorrowRequestModal from '../../components/UI/BorrowRequestModal';
import {createAsset} from '../../services/assets';

const Assets = () => {
    const { user, showModal, showConfirmModal } = useApp();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: 'AVAILABLE',
        category: ''
    });
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        total: 0
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Check if user has write permissions
    const canEditAssets = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const canBorrowAssets = user?.role === 'VIEWER';

    useEffect(() => {
        fetchAssets();
    }, [filters, pagination.page, pagination.size]);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                size: pagination.size,
                searchTerm: filters.searchTerm,
                status: filters.status,
                categoryName: filters.category
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] == null) {
                    delete params[key];
                }
            });

            const response = await api.get('/assets/search', {params});
            let fetchedAssets = response.data.data || [];

            // ✅ NOTE: Hide retired assets unless the filter is explicitly "RETIRED"
            if (filters.status !== 'RETIRED') {
                fetchedAssets = fetchedAssets.filter(asset => asset.status !== 'RETIRED');
            }

            // NOTE: Add borrowedByDisplay helper for table rendering
            const mappedAssets = fetchedAssets.map(asset => {
                if (asset.borrowedBy) {
                    const displayName =
                        asset.borrowedBy.fullName ||
                        asset.borrowedBy.username ||
                        '';
                    return {...asset, borrowedByDisplay: displayName};
                }
                return {...asset, borrowedByDisplay: ''};
            });


            setAssets(mappedAssets);

            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.totalElements || 0
            }));
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAsset(null);
        setShowForm(true);
    };

    const handleEdit = (asset) => {
        setEditingAsset(asset);

        setShowForm(true);
    };

    const handleDelete = async (asset) => {
        showConfirmModal({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/assets/${asset.id}`);
                    await fetchAssets();
                    showModal('Success', `Asset "${asset.name}" was deleted successfully.`, 'success');
                } catch (error) {
                    console.error('Failed to delete asset:', error);
                    showModal('Error', 'Failed to delete asset. Please try again.', 'error');
                }
            },
        });
    };

    const handleBorrow = (asset) => {
       // try {
       //
       //     const res =  api.get('/borrow-requests/check', {
       //         params: {
       //             assetId: asset.id,
       //             userId: user.id,
       //         },
       //     });
       //     console.log(res)
       //     console.log(api.get('/borrow-requests/check'));
       //     if (res.data?.exists || res.data?.data?.exists) {
       //        window.alert("asset already in request")
       //         return;
       //     }
       // } catch (err) {
       //     console.error('Failed to check duplicate borrow request', err);
       // }
        setSelectedAsset(asset);
        setModalOpen(true);
    };

    const handleFormSubmit = async (normalizedPayload) => {
        try {
            if (editingAsset) {
                await api.put(`/assets/${editingAsset.id}`, normalizedPayload);
            } else {
                await createAsset(normalizedPayload);
            }
            await fetchAssets();
            setEditingAsset(null);
            setShowForm(false);
        } catch (error) {
            console.error('Failed to save asset:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination(prev => ({...prev, page: 0}));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({...prev, page: newPage}));
    };

    const columns = [
        {
            key: 'name',
            label: 'Asset Name',
            sortable: true,
            render: (value, asset) => (
                <div className={styles.assetCell}>
                    {asset.imageUrl && (
                        <img
                            src={`${process.env.REACT_APP_API_URL}${asset.imageUrl}`}
                            alt={asset.name}
                            className={styles.assetImage}
                        />
                    )}
                    <div>
                        <div className={styles.assetName}>{value}</div>
                        <div className={styles.assetSerial}>{asset.serialNumber}</div>

                        {/* NOTE: Display borrower info under asset name if in use */}
                        {asset.status === 'IN_USE' && asset.borrowedByDisplay && (
                            <div className={styles.borrowedByText}>
                                Borrowed by: <strong>{asset.borrowedByDisplay}</strong>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'category.name',
            label: 'Category',
            sortable: true,
            render: (value, asset) => (
                <span className={styles.category}>
                    {asset.category?.name || 'No Category'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`${styles.status} ${styles[value.toLowerCase()]}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'cost',
            label: 'Cost',
            sortable: true,
            render: (value) => `$${parseFloat(value).toFixed(2)}`
        },
        {
            key: 'purchaseDate',
            label: 'Purchase Date',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'serialNumber',
            label: 'Serial Number',
            sortable: true,
            render: (value, asset) => <span className={styles.category}>
                    {asset.serialNumber || 'Null'}
                </span>
        },
        // Only show actions column if user can edit
        ...(canEditAssets ? [{
            key: 'actions',
            label: 'Actions',
            render: (_, asset) => (
                <div className={styles.actions}>
                    {asset.status !== "RETIRED" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                        >
                            Edit
                        </Button>

                    )}

                    {asset.status !== "RETIRED" && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(asset)}
                        >
                            Delete
                        </Button>
                    )}



                </div>
            )
        }] : []),
        ...(canBorrowAssets ? [{
            key: 'actions',
            label: 'Actions',
            render: (_, asset) => (
                <div className={styles.actions}>
                    <Button
                        disabled={asset?.status !== 'AVAILABLE'}
                        variant="ghost"
                        size="sm"
                        // NOTE: Updated to call handleBorrow
                        onClick={() => handleBorrow(asset)}
                    >
                        Borrow Asset
                    </Button>
                </div>
            )
        }] : [])

    ];

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    if (loading && assets.length === 0) {
        return <LoadingSpinner/>;
    }

    return (
        <div className={styles.assets}>
            <motion.div
                className={styles.container}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className={styles.header} variants={itemVariants}>
                    <div>
                        <h1>Asset Management</h1>
                        <p>Manage your inventory assets and track their status</p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div variants={itemVariants}>
                    <Card className={styles.filters}>
                        <div className={styles.filterGrid}>
                            <Input
                                placeholder="Search assets..."
                                value={filters.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                icon="🔍"
                            />
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className={styles.select}
                            >

                                <option value="AVAILABLE">Available</option>
                                <option value="IN_USE">In Use</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="RETIRED">Retired</option>
                            </select>
                            <Input
                                placeholder="Category"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                icon="📁"
                            />
                            {canEditAssets && (
                                <Button
                                    variant="primary"
                                    onClick={handleCreate}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                >
                                    + Add Asset
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Data Table */}
                <motion.div variants={itemVariants}>
                    <DataTable
                        columns={columns}
                        data={assets}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        emptyMessage="No assets found. Create your first asset to get started."
                    />
                </motion.div>

                {/* Asset Form Modal - Only render if user can edit */}
                {canEditAssets && (
                    <Modal
                        isOpen={showForm}
                        onClose={() => {
                            setShowForm(false);
                            setEditingAsset(null);
                        }}
                        title={editingAsset ? 'Edit Asset' : 'Create New Asset'}
                    >
                        <AssetForm
                            asset={editingAsset}
                            onSubmit={handleFormSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingAsset(null);
                            }}
                        />
                    </Modal>
                )}
                <BorrowRequestModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    asset={selectedAsset}
                    currentUser={user.id} // from your context
                    onSuccess={(created) => {
                        // optionally refresh assets list
                        fetchAssets();
                    }}
                />
            </motion.div>
        </div>
    );
};

export default Assets;
