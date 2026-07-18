// src/routes/index.jsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// ─── Lazy imports ──────────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

// ─── PageLoader ────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center h-full min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-border-base border-t-primary animate-spin" />
    </div>
  );
}

// ─── ProtectedRoute Component ───────────────────────────────────────────────
/**
 * Route guard component that checks for token existence before rendering child routes.
 * Redirects to the /login page if the token is not found in localStorage.
 */
function ProtectedRoute() {
  const token = localStorage.getItem('crm-token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// ─── AppRoutes ─────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard — root path */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Lead Management — /leads */}
          <Route path="/leads" element={<Leads />} />
          
          {/* Analytics & Reports — /analytics */}
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* CATCH-ALL 404 */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
    </Suspense>
  );
}
export { ProtectedRoute };
