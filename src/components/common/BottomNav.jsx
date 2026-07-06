import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3 } from 'lucide-react';

/**
 * BottomNav Component
 * Sticky mobile navigation bar visible on mobile screen viewports only (< 768px).
 * Displays icons for quick page access. Tap targets are 48x48px for touch accessibility.
 */
export const BottomNav = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-45 md:hidden shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
            aria-label={item.label}
          >
            {({ isActive }) => (
              <div className="relative flex items-center justify-center w-11 h-11">
                <Icon 
                  className={`w-5.5 h-5.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-md shadow-indigo-500/50" />
                )}
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
