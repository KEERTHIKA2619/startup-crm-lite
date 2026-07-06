import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load page components for optimized bundle sizes and initial load performance.
// React.lazy dynamic imports are wrapped in Suspense in the main layout.
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * AppRoutes Component
 * Establishes the routing hierarchy for the Startup CRM Lite application.
 * All paths map to respective lazy-loaded view components.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Dashboard Route */}
      <Route path="/" element={<Dashboard />} />

      {/* Lead Management Route */}
      <Route path="/leads" element={<Leads />} />

      {/* Analytics Route */}
      <Route path="/analytics" element={<Analytics />} />

      {/* Catch-all Wildcard Route for 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
