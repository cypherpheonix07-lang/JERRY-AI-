import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';

// Lazy load all page components for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SystemsPage = lazy(() => import('./pages/SystemsPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const SensorsPage = lazy(() => import('./pages/SensorsPage'));
const OpsPage = lazy(() => import('./pages/OpsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-cyan-400 text-xl">Loading J.A.R.V.I.S OMEGA...</div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <DashboardPage />
                  </motion.div>
                } />
                <Route path="systems" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SystemsPage />
                  </motion.div>
                } />
                <Route path="network" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <NetworkPage />
                  </motion.div>
                } />
                <Route path="security" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SecurityPage />
                  </motion.div>
                } />
                <Route path="sensors" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SensorsPage />
                  </motion.div>
                } />
                <Route path="ops" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <OpsPage />
                  </motion.div>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </AnimatePresence>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;