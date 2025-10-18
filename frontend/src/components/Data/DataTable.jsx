// src/components/Data/DataTable.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../UI/LoadingSpinner';
import Button from '../UI/Button';
import styles from './DataTable.module.css';

const DataTable = ({
                       columns,
                       data,
                       loading = false,
                       pagination,
                       onPageChange,
                       emptyMessage = "No data available"
                   }) => {
    const [sortConfig, setSortConfig] = React.useState({
        key: null,
        direction: 'asc'
    });

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const getValue = (obj, path) => {
                return path.split('.').reduce((acc, part) => acc && acc[part], obj);
            };

            const aValue = getValue(a, sortConfig.key);
            const bValue = getValue(b, sortConfig.key);

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const totalPages = Math.ceil(pagination.total / pagination.size);
    const currentPage = pagination.page + 1; // Convert to 1-based for display

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const handlePageClick = (pageNumber) => {
        onPageChange(pageNumber - 1); // Convert back to 0-based for internal use
    };

    const handleFirstPage = () => {
        onPageChange(0);
    };

    const handleLastPage = () => {
        onPageChange(totalPages - 1);
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        }),
        exit: { opacity: 0, y: -20 }
    };

    if (loading && data.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner message="Loading data..." />
            </div>
        );
    }

    return (
        <div className={styles.dataTable}>
            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        {columns.map(column => (
                            <th
                                key={column.key}
                                className={`${column.sortable ? styles.sortable : ''} ${
                                    sortConfig.key === column.key ? styles.sorted : ''
                                }`}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className={styles.headerContent}>
                                    {column.label}
                                    {column.sortable && (
                                        <span className={styles.sortIndicator}>
                        {sortConfig.key === column.key && (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                        )}
                      </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    <AnimatePresence>
                        {sortedData.map((row, index) => (
                            <motion.tr
                                key={row.id}
                                custom={index}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                whileHover={{ backgroundColor: 'var(--neutral-50)' }}
                                className={styles.tableRow}
                            >
                                {columns.map(column => (
                                    <td key={column.key} className={column.cellClassName || ''}>
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                    </tbody>
                </table>

                {/* Empty State */}
                {!loading && sortedData.length === 0 && (
                    <motion.div
                        className={styles.emptyState}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.emptyIcon}>📊</div>
                        <h3>No Data Found</h3>
                        <p>{emptyMessage}</p>
                    </motion.div>
                )}

                {/* Loading Overlay */}
                {loading && data.length > 0 && (
                    <motion.div
                        className={styles.loadingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <LoadingSpinner size="sm" />
                    </motion.div>
                )}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <motion.div
                    className={styles.pagination}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Left side - Page info */}
                    <div className={styles.pageInfo}>
                        Showing {pagination.size * pagination.page + 1} to {Math.min(pagination.size * (pagination.page + 1), pagination.total)} of {pagination.total} entries
                    </div>

                    {/* Right side - Page navigation */}
                    <div className={styles.pageNavigation}>
                        {/* First Page Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFirstPage}
                            disabled={pagination.page === 0}
                            className={styles.pageButton}
                        >
                            First
                        </Button>

                        {/* Previous Page Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 0}
                            className={styles.pageButton}
                        >
                            Previous
                        </Button>

                        {/* Page Numbers */}
                        <div className={styles.pageNumbers}>
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    className={`${styles.pageNumber} ${
                                        currentPage === page ? styles.activePage : ''
                                    }`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Next Page Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= totalPages - 1}
                            className={styles.pageButton}
                        >
                            Next
                        </Button>

                        {/* Last Page Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLastPage}
                            disabled={pagination.page >= totalPages - 1}
                            className={styles.pageButton}
                        >
                            Last
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DataTable;