/**
 * @file BottomNav.jsx
 * @description Mobile-only bottom navigation bar (hidden on md+ screens).
 *
 * Layout: 4 slots — Dashboard | Leads | [Add FAB] | Analytics
 *  - Each nav item is a NavLink with an icon + small text label
 *  - The centre slot is a primary-coloured FAB that opens the Add Lead modal
 *  - Minimum tap target: h-12 (48px) on each item
 *  - Respects iOS safe-area-inset-bottom via inline style padding
 *
 * @module components/common/BottomNav
 */

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { name: 'Leads',     path: '/leads',     icon: Users,             end: false },
  { name: 'Analytics', path: '/analytics', icon: BarChart3,         end: false },
];

/**
 * BottomNav — mobile navigation bar fixed at the bottom of the screen.
 *
 * @param {object}   props
 * @param {function} props.onAddLeadClick - Opens the global Add Lead modal
 */
export default function BottomNav({ onAddLeadClick }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Frosted-glass bar */}
      <div className="bg-bg-surface/95 backdrop-blur-md border-t border-border-base flex items-stretch">

        {/* Left two nav items */}
        {NAV_ITEMS.slice(0, 2).map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) => [
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2',
              'min-h-[52px] transition-colors duration-150 select-none',
              isActive
                ? 'text-primary'
                : 'text-text-muted hover:text-text-main',
            ].join(' ')}
            aria-label={name}
          >
            {({ isActive }) => (
              <>
                <span className={[
                  'flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-150',
                  isActive ? 'bg-primary/10 scale-110' : '',
                ].join(' ')}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide leading-none">
                  {name}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Centre FAB — Add Lead */}
        <div className="flex items-center justify-center px-4 py-2 flex-shrink-0">
          <button
            id="bottom-nav-add-lead"
            onClick={onAddLeadClick}
            aria-label="Add new lead"
            className={[
              'w-12 h-12 rounded-full bg-primary text-white',
              'flex items-center justify-center flex-shrink-0',
              'shadow-lg shadow-primary/30',
              'hover:bg-primary/90 active:scale-95',
              'transition-all duration-150',
              '-mt-5', // Lift above the bar
            ].join(' ')}
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right nav item */}
        {NAV_ITEMS.slice(2).map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) => [
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2',
              'min-h-[52px] transition-colors duration-150 select-none',
              isActive
                ? 'text-primary'
                : 'text-text-muted hover:text-text-main',
            ].join(' ')}
            aria-label={name}
          >
            {({ isActive }) => (
              <>
                <span className={[
                  'flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-150',
                  isActive ? 'bg-primary/10 scale-110' : '',
                ].join(' ')}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide leading-none">
                  {name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
