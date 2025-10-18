// src/pages/Reports/Reports.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import styles from './Reports.module.css';

/**
 * Reports Dashboard Page
 * 
 * Purpose: Display analytics and reports for inventory management
 * 
 * State:
 * - dashboardStats: Object containing dashboard statistics
 * - assetSummary: Object containing asset category distribution
 * - recentTransactions: Array of recent transactions
 * - loading: Boolean indicating loading state
 * 
 * Animations: Chart animations, metric counters, data visualization
 */
const Reports = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [assetSummary, setAssetSummary] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, summaryRes, transactionsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/asset-summary'),
        api.get('/asset-transactions/search?page=0&size=5&sort=transactionDate,desc')
      ]);

        setDashboardStats(dashboardRes.data?.data || dashboardRes.data || null);
        setAssetSummary(summaryRes.data?.data || {});
        setRecentTransactions(transactionsRes.data?.data || []);

    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['Category', 'Count'];
    const data = Object.entries(assetSummary).map(([category, count]) => [category, count]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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

  const counterVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.reports}>
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className={styles.header} variants={itemVariants}>
          <div>
            <h1>Reports & Analytics</h1>
            <p>Insights and statistics for your inventory</p>
          </div>
          <Button
            variant="primary"
            onClick={exportToCSV}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📊 Export CSV
          </Button>
        </motion.div>

        {/* Key Metrics */}
        <motion.div className={styles.metricsGrid} variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Card className={styles.metricCard}>
              <div className={styles.metricIcon}>💼</div>
              <div className={styles.metricContent}>
                <h3>Total Assets</h3>
                <motion.span
                  className={styles.metricValue}
                  variants={counterVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {dashboardStats?.totalAssets || 0}
                </motion.span>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={styles.metricCard}>
              <div className={styles.metricIcon}>👥</div>
              <div className={styles.metricContent}>
                <h3>Total Users</h3>
                <motion.span
                  className={styles.metricValue}
                  variants={counterVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {dashboardStats?.totalUsers || 0}
                </motion.span>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={styles.metricCard}>
              <div className={styles.metricIcon}>🔄</div>
              <div className={styles.metricContent}>
                <h3>Transactions</h3>
                <motion.span
                  className={styles.metricValue}
                  variants={counterVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {dashboardStats?.totalTransactions || 0}
                </motion.span>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={styles.metricCard}>
              <div className={styles.metricIcon}>📈</div>
              <div className={styles.metricContent}>
                <h3>Categories</h3>
                <motion.span
                  className={styles.metricValue}
                  variants={counterVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {Object.keys(assetSummary).length}
                </motion.span>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Asset Distribution */}
        <motion.div className={styles.chartSection} variants={itemVariants}>
          <Card>
            <div className={styles.chartHeader}>
              <h2>Asset Distribution by Category</h2>
              <Button variant="ghost" size="sm" onClick={exportToCSV}>
                Export
              </Button>
            </div>
            <div className={styles.chartContent}>
              {Object.entries(assetSummary).length > 0 ? (
                <div className={styles.distributionChart}>
                  {Object.entries(assetSummary).map(([category, count], index) => {
                    const percentage = (count / dashboardStats?.totalAssets) * 100;
                    return (
                      <motion.div
                        key={category}
                        className={styles.chartItem}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={styles.chartBar}>
                          <motion.div
                            className={styles.chartFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          />
                        </div>
                        <div className={styles.chartLabel}>
                          <span className={styles.categoryName}>{category}</span>
                          <span className={styles.categoryCount}>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noData}>
                  <p>No asset data available for reporting</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className={styles.activitySection} variants={itemVariants}>
          <Card>
            <h2>Recent Activity</h2>
            <div className={styles.activityList}>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    className={styles.activityItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={styles.activityIcon}>
                      {transaction.action === 'CHECKOUT' ? '📤' : 
                       transaction.action === 'RETURN' ? '📥' : '🔧'}
                    </div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityTitle}>
                        {transaction.asset?.name}
                      </div>
                      <div className={styles.activityDescription}>
                        {transaction.action} by {transaction.user?.username}
                      </div>
                    </div>
                    <div className={styles.activityTime}>
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={styles.noData}>
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Reports;