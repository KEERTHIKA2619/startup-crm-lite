import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, X, Sparkles } from 'lucide-react';

/**
 * Sidebar Component
 * Renders the dashboard's side navigation. Highlights active links using NavLink.
 * Responsive behaviors:
 *   - Mobile (< md): Slides in as a 64px width drawer overlay via translate-x
 *   - Tablet (md to lg): Fixed left-hand bar with 56px width, icons + main text
 *   - Desktop (lg+): Wider left-hand bar with 64px/72px width, showing icons + text + sub-labels
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Navigation items mapping paths, labels, sub-labels and icons
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      subLabel: 'Overview & metrics', 
      icon: LayoutDashboard 
    },
    { 
      path: '/leads', 
      label: 'Lead Management', 
      subLabel: 'Nurture & sales cycle', 
      icon: Users 
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      subLabel: 'Growth & forecasting', 
      icon: BarChart3 
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-56 lg:w-64 xl:w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Main sidebar navigation"
    >
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-none text-white tracking-wide uppercase">CRM Lite</h1>
            <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase mt-1 block">
              Workspace v1.0
            </span>
          </div>
        </div>

        {/* Mobile Sidebar Close Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close sidebar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Auto close mobile sidebar after navigation on screen sizes < md (768px)
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border min-h-[44px] ${
                  isActive
                    ? 'bg-indigo-650/15 border-indigo-500/20 text-indigo-400 font-bold shadow-inner'
                    : 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-105 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs lg:text-sm font-semibold leading-tight">{item.label}</span>
                    {/* Sub-label shown on desktop views (lg+) only */}
                    <span className="hidden lg:block text-[10px] text-slate-500 dark:text-slate-500 group-hover:text-slate-400 font-medium transition-colors mt-0.5 truncate leading-none">
                      {item.subLabel}
                    </span>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 animate-pulse shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
            JD
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md"></span>
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-slate-250 truncate">John Doe</p>
          <p className="text-[10px] text-slate-500 font-medium truncate">john@crmlite.io</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
