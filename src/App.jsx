import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import DarkModeToggle from './components/common/DarkModeToggle';
import AppRoutes from './routes';
import { Menu, X } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

/**
 * App Component
 * The entry logic of the CRM client application. Wraps the app layout with
 * React Router's BrowserRouter and provides the Suspense container for lazy loading.
 */
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden transition-colors duration-300">
        
        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Component */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        {/* Adjust left padding dynamically based on sidebar sizes at various breakpoints, and add bottom padding on mobile for BottomNav */}
        <div className="flex-1 flex flex-col min-h-screen w-full md:pl-56 lg:pl-64 xl:pl-72 pb-16 md:pb-0">
          
          {/* Header for Mobile and Top Navigation */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:justify-end transition-colors duration-300">
            {/* Mobile Menu Toggle Button - 44px tap target size */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Sidebar"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Quick Actions / Profile Status */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle Switch */}
              <DarkModeToggle />

              <div className="hidden sm:flex flex-col text-right font-sans">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">John Doe</span>
                <span className="text-xs text-[#2563EB] dark:text-indigo-400 font-medium">Administrator</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
                JD
              </div>
            </div>
          </header>

          {/* Page Body Container */}
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            {/* Suspense handles route transitions and dynamically loads component chunks */}
            <Suspense 
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                  <div className="relative w-12 h-12">
                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading CRM Dashboard...</span>
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </Router>
  );
}

export default App;
