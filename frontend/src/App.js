// src/App.js (updated)
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/Error/ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import GeneralModal from './components/UI/GeneralModal'; // Import GeneralModal
import ConfirmModal from './components/UI/ConfirmModal'; // Import ConfirmModal
import LoadingSpinner from './components/UI/LoadingSpinner';
import BorrowRequestsAdmin from "./pages/Transactions/BorrowRequestsAdmin";
import {useApp} from "./context/AppContext";

// Lazy loaded pages
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Assets = React.lazy(() => import('./pages/Assets/Assets'));
const AssetCategories = React.lazy(() => import('./pages/Assets/AssetCategories'));
const AssetTransactions = React.lazy(() => import('./pages/Transactions/AssetTransactions'));
const Users = React.lazy(() => import('./pages/Users/Users'));
const Audits = React.lazy(() => import('./pages/Audit/Audits'));
const Reports = React.lazy(() => import('./pages/Reports/Reports'));
const MyBorrowedAssets = React.lazy(() => import('./pages/Viewer/MyBorrowedAssets'));
const ActiveBorrowed = React.lazy(() => import('./pages/Viewer/ActiveBorrowed'));
const Features = React.lazy(() => import('./pages/FooterPages/Features'));
const Documentation = React.lazy(() => import('./pages/FooterPages/Documentation'));
const HelpCenter = React.lazy(() => import('./pages/FooterPages/HelpCenter'));
const Contact = React.lazy(() => import('./pages/FooterPages/Contact'));
const About = React.lazy(() => import('./pages/FooterPages/About'));
const PrivacyPolicy = React.lazy(() => import('./pages/FooterPages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/FooterPages/TermsOfService'));


const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

function App() {
    const location = useLocation();
    const { modal, hideModal, confirmModal, hideConfirmModal } = useApp();

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        hideConfirmModal();
    };

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <div className="app">
          <GeneralModal
              isOpen={modal.isOpen}
              title={modal.title}
              message={modal.message}
              type={modal.type}
              onOk={hideModal}
          />
          <ConfirmModal
              isOpen={confirmModal.isOpen}
              title={confirmModal.title}
              message={confirmModal.message}
              onConfirm={handleConfirm}
              onClose={hideConfirmModal}
              confirmText={confirmModal.confirmText}
              confirmVariant={confirmModal.confirmVariant}
          />
        <Header />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login />
                  </motion.div>
                } />
                <Route path="/register" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register />
                  </motion.div>
                } />
                <Route path="/" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard />
                  </motion.div>
                } />
                <Route path="/assets" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Assets />
                  </motion.div>
                } />
                <Route path="/asset-categories" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AssetCategories />
                  </motion.div>
                } />
                <Route path="/transactions" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AssetTransactions />
                  </motion.div>
                } />
                <Route path="/users" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Users />
                  </motion.div>
                } />
                <Route path="/audits" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Audits />
                  </motion.div>
                } />
                <Route path="/reports" element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Reports />
                  </motion.div>
                } />
                  <Route path="/borrowrequests" element={
                      <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                      >
                          <BorrowRequestsAdmin />

                      </motion.div>
                  } />
                  <Route path="/my-borrowed" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <MyBorrowedAssets />
                      </motion.div>

                  } />
                  <Route path="/my-active-borrowed" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <ActiveBorrowed />
                      </motion.div>
                  } />
                  <Route path="/features" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <Features />
                      </motion.div>
                  } />
                  <Route path="/docs" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <Documentation />
                      </motion.div>
                  } />
                  <Route path="/help" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <HelpCenter />
                      </motion.div>
                  } />
                  <Route path="/contact" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <Contact />
                      </motion.div>
                  } />
                  <Route path="/about" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <About />
                      </motion.div>
                  } />
                  <Route path="/privacy" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <PrivacyPolicy />
                      </motion.div>
                  } />
                  <Route path="/terms" element={
                      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                          <TermsOfService />
                      </motion.div>
                  } />

              </Routes>
            </React.Suspense>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;