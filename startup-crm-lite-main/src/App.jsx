// src/App.jsx
import { useState, useCallback } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ── Layout Shell ─────────────────────────────────────────────────────────────
import Sidebar    from './components/common/Sidebar';
import Header     from './components/common/Header';
import BottomNav  from './components/common/BottomNav';

// ── Routes ───────────────────────────────────────────────────────────────────
import AppRoutes from './routes/index';

// ── Global Modal ─────────────────────────────────────────────────────────────
import LeadModal from './components/leads/LeadModal';
import LeadDrawer from './components/leads/LeadDrawer';

// ── Providers & Contexts ─────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider, useLeads } from './context/LeadContext';
import { NotificationProvider } from './context/NotificationContext';


// ─── AppContent ──────────────────────────────────────────────────────────────
function AppContent() {
  const { isLoading } = useAuth();
  const location = useLocation();
  
  // Controls the tablet/desktop sidebar drawer open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global "Add New Lead" modal (triggered from Header or BottomNav FAB)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal  = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const { activeLeadId, isDrawerOpen, closeLeadDrawer } = useLeads();

  // 1. Show full-page loading indicator while restoring authentication session
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base">
        <div className="w-8 h-8 rounded-full border-2 border-border-base border-t-primary animate-spin" />
      </div>
    );
  }

  // 2. Hide sidebar, header, navigation, and drawer shell on Login and Register pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) {
    return (
      <main className="min-h-screen auth-bg overflow-y-auto">
        <AppRoutes />
      </main>
    );
  }

  return (
    // Root flex row: Sidebar (static on md+) + right column
    <div className="flex h-screen overflow-hidden bg-bg-base">

      {/* ── Left navigation sidebar ─────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right-hand content column ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Sticky top header */}
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onAddLeadClick={openModal}
        />

        {/* ── Scrollable page viewport ─────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-bg-base pb-16 md:pb-0">
          <AppRoutes />
        </main>
      </div>

      {/* ── Mobile bottom navigation ─────────────────────────────────────── */}
      <BottomNav onAddLeadClick={openModal} />

      {/* ── Global "Add Lead" modal ──────────────────────────────────────── */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* ── Global Slide-out Lead Drawer ─────────────────────────────────── */}
      <LeadDrawer
        leadId={activeLeadId}
        isOpen={isDrawerOpen}
        onClose={closeLeadDrawer}
      />
    </div>
  );
}

// ─── App (root export) ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LeadProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background:   'var(--bg-surface)',
                color:        'var(--text-main)',
                border:       '1px solid var(--border-base)',
                borderRadius: '10px',
                fontSize:     '13px',
                fontFamily:   'var(--font-sans)',
                boxShadow:    '0 8px 24px rgba(0,0,0,0.12)',
              },
            }}
          />
        </LeadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
