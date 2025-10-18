// src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import styles from './Dashboard.module.css';
import Badge from "../../components/UI/Badge";
import { fetchMyRequests } from '../../api/borrowRequestsApi';
import app from "../../App";


/**
 * Dashboard Page
 *
 * Purpose: Main dashboard showing overview of inventory, recent activity, and key metrics
 *
 * State:
 * - stats: Object containing dashboard statistics
 * - recentTransactions: Array of recent asset transactions
 * - loading: Boolean indicating loading state
 *
 * Animations: Staggered card animations, loading states, hover effects
 */
const Dashboard = () => {
  const { user, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);



    // Assets needing attention
    const UpcomingMaintenance = () => {
        const [maintenanceAssets, setMaintenanceAssets] = useState([]);

        useEffect(() => {
            // Fetch assets that are due for maintenance or in maintenance status
            const fetchMaintenanceAssets = async () => {
                const response = await api.get('/assets/search?status=MAINTENANCE&size=5');
                setMaintenanceAssets(response.data?.data || []);
            };
            fetchMaintenanceAssets();
        }, []);

        return (
            <Card>
                <h3>Maintenance Needed</h3>
                {maintenanceAssets.length > 0 ? (
                    <div className={styles.maintenanceList}>
                        {maintenanceAssets.map(asset => (
                            <div key={asset.id} className={styles.maintenanceItem}>
                                <span>{asset.name}</span>
                                <Badge variant="warning">Maintenance</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noIssues}>No maintenance issues! 🎉</p>
                )}
            </Card>
        );
    };

    const MyItems = () => {
        const [myItems, setMyItems] = useState([]);

        useEffect(() => {
            const fetchMyItems = async () => {
                const response = await fetchMyRequests();

                setMyItems(response || []);
            };
            fetchMyItems();
        }, []);


        const approvedItems = myItems.filter(asset => {
            return asset.status === 'APPROVED';
        });


        return (
            <Card>
                <h3>Borrowed Items</h3>
                {/* 2. Check the length of the new 'approvedItems' array. */}
                {approvedItems.length > 0 ? (
                    <div className={styles.maintenanceList}>
                        {/* 3. Map over 'approvedItems' to render them. */}
                        {approvedItems.map(asset => (
                            <div key={asset.id} className={styles.maintenanceItem}>
                                <span>{asset.assetName}</span> {/* Correct property name */}
                                <Badge variant="success">Approved</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noIssues}>No Approved Items 🎉</p>
                )}
            </Card>
        );
    };


    // Visual status breakdown
    const AssetStatusOverview = ({ assets }) => {
        const statusCounts = {
            AVAILABLE: assets.filter(a => a.status === 'AVAILABLE').length,
            IN_USE: assets.filter(a => a.status === 'IN_USE').length,
            MAINTENANCE: assets.filter(a => a.status === 'MAINTENANCE').length,
            DAMAGED: assets.filter(a => a.status === 'DAMAGED').length,
            RETIRED: assets.filter(a => a.status === 'RETIRED').length
        };

        return (
            <Card>
                <h3>Asset Status</h3>
                <div className={styles.statusGrid}>
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className={styles.statusItem}>
                            <div className={`${styles.statusIndicator} ${styles[status.toLowerCase()]}`}>
                                {count}
                            </div>
                            <span className={styles.statusLabel}>{status.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    // Personalized activity feed for the current user
    const MyRecentActivity = ({ username }) => {
        const [myActivities, setMyActivities] = useState([]);

        useEffect(() => {
            // Fetch activities specifically for the current user
            const fetchMyActivities = async () => {
                const response = await api.get(`/asset-transactions/search?username=${username}&size=5`);
                setMyActivities(response.data?.data || []);
            };
            if (username) fetchMyActivities();
        }, [username]);

        return (
            <Card>
                <h3>My Recent Activity</h3>
                <div className={styles.activityList}>
                    {myActivities.map((activity, index) => (
                        <div key={activity.id} className={styles.activityItem}>
            <span className={styles.activityIcon}>
              {activity.action === 'CHECKOUT' ? '📤' : '📥'}
            </span>
                            <div className={styles.activityDetails}>
                                <span className={styles.assetName}>{activity.asset?.name}</span>
                                <span className={styles.action}>{activity.action}</span>
                            </div>
                            <span className={styles.activityTime}>
              {new Date(activity.transactionDate).toLocaleDateString()}
            </span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    // Add to Dashboard.jsx
    const QuickActions = () => {
        const navigate = useNavigate();
        const { user } = useApp();

        const actions = [
            {
                label: 'Add New Asset',
                icon: '➕',
                path: '/assets',
                roles: ['ADMIN']
            },
            {
                label: 'Borrow Assets',
                icon: '📁',
                path: '/assets',
                roles: ['VIEWER']
            },
            {
                label: 'Log Transaction',
                icon: '📝',
                path: '/transactions',
                roles: ['ADMIN']
            },
            {
                label: 'View Reports',
                icon: '📊',
                path: '/reports',
                roles: ['ADMIN']
            },
            {
                label: 'Manage Users',
                icon: '👥',
                path: '/users',
                roles: ['ADMIN']
            }
        ];

        const userActions = actions.filter(action =>
            action.roles.includes(user?.role)
        );

        return (
            <Card className={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div className={styles.actionsGrid}>
                    {userActions.map((action, index) => (
                        <motion.button
                            key={action.label}
                            className={styles.actionButton}
                            onClick={() => navigate(action.path)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <span className={styles.actionIcon}>{action.icon}</span>
                            <span>{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </Card>
        );
    };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, transactionsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/asset-transactions?page=0&size=5')
      ]);


        setStats(dashboardRes.data?.data || dashboardRes.data || null);
        setRecentTransactions(transactionsRes.data?.data || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
      // In your Dashboard.jsx - replace the current content with:
      <div className={styles.dashboard}>
          <motion.div className={styles.container} variants={containerVariants}>

              {/* Welcome Section (keep this) */}
              <motion.div className={styles.welcomeSection} variants={itemVariants}>
                  <h1>Welcome back, {user?.username}! 👋</h1>
                  <p>Here's what's happening with your inventory today.</p>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                  <QuickActions />
              </motion.div>

              {/* Main Content Grid */}
              <div className={styles.dashboardGrid}>

                  {/* Left Column */}
                  <div className={styles.leftColumn}>
                      <motion.div variants={itemVariants}>
                          <MyRecentActivity username={user?.username} />
                      </motion.div>


                  </div>
                  <div className={styles.rightColumn}>
                      {user?.role === "ADMIN" && (
                          <motion.div variants={itemVariants}>
                              <UpcomingMaintenance />
                          </motion.div>
                      )}
                      {user?.role === "VIEWER" && (
                          <motion.div variants={itemVariants}>
                              <MyItems />
                          </motion.div>
                      )}
                  </div>



              </div>

          </motion.div>
      </div>
  );
};

export default Dashboard;