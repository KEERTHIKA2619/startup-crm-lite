/**
 * @file Sidebar.jsx
 * @description Three-tier responsive left-hand navigation sidebar.
 *
 * Breakpoint behaviour:
 *  - mobile (< md)  : Hidden by default. Clicking the hamburger menu in the Header toggles it as a slide-in drawer.
 *  - tablet (md)    : Left sidebar, width w-60. Icons + text labels.
 *  - desktop (lg+)  : Wider left sidebar, width w-72. Icons + text labels + sub-labels.
 *
 * Props:
 *  isOpen  {boolean}  – whether the mobile/tablet drawer is open
 *  onClose {function} – collapses the drawer
 */

import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Sun,
  Moon,
  X,
  LogOut,
} from 'lucide-react';

const LINKS = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    end: true,
    subLabel: 'Overview & pipeline stats',
  },
  {
    name: 'Leads',
    path: '/leads',
    icon: Users,
    end: false,
    subLabel: 'Manage active sales pipeline',
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    end: false,
    subLabel: 'Charts, rates & performance',
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const name = user?.name || 'User';
  const email = user?.email || 'user@example.com';

  return (
    <>
      {/* ── Mobile backdrop (below md when drawer is open) ─────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────────────────── */}
      <aside
        className={[
          // Flex column layout, always
          'flex flex-col bg-bg-surface border-r border-border-base',
          // Position: Fixed overlay on mobile, relative on tablet+
          'fixed inset-y-0 left-0 z-50 md:relative md:inset-auto md:z-auto',
          // Width: w-64 on mobile drawer, w-60 on tablet, w-72 on desktop
          'w-64 md:w-60 lg:w-72',
          // Slide transition animation
          'transition-transform duration-300 ease-in-out md:transition-none',
          // Translate: translated out of view on mobile unless open; always visible on tablet+
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        aria-label="Primary navigation"
      >
        {/* ── Brand header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-base flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Logo icon */}
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0">
              <img src="/logo.png" alt="PulseCRM Logo" className="w-full h-full object-cover" />
            </div>

            {/* Brand name */}
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent truncate">
              PulseCRM
            </span>
          </div>

          {/* Close button — only visible on mobile drawer */}
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors md:hidden ml-1"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation links ──────────────────────────────────────────── */}
        <nav
          className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto"
          aria-label="Sidebar links"
        >
          {LINKS.map(({ name, path, icon: Icon, end, subLabel }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              title={name}
              className={({ isActive }) =>
                [
                  'flex items-start gap-3 rounded-lg border px-3 py-2.5',
                  'text-sm font-medium transition-all duration-150 group',
                  'min-h-[44px]', // Touch target optimization
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover border-transparent',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'flex-shrink-0 w-5 h-5 mt-0.5 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-text-subtle group-hover:text-text-main',
                    ].join(' ')}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-semibold">{name}</span>
                    {/* Sub-label — hidden on mobile and tablet, shown on desktop */}
                    <span className="hidden lg:block text-[11px] text-text-subtle font-normal mt-0.5 leading-snug">
                      {subLabel}
                    </span>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 self-center" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer: theme toggle + avatar ─────────────────────────────── */}
        <div className="p-3 border-t border-border-base space-y-2 flex-shrink-0">
          {/* Theme toggle button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-bg-surface-hover border border-transparent transition-all min-h-[44px]"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-warning flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-primary flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* User avatar row with dynamic info and logout */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg min-h-[44px] group/user">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-xs flex-shrink-0 select-none">
                {initials}
              </div>
              {/* Name + email details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-main truncate">{name}</p>
                <p className="text-[10px] text-text-subtle truncate">{email}</p>
              </div>
            </div>
            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer flex-shrink-0"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
