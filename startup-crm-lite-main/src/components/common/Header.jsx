import { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Sparkles, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import { useNotifications } from '../../hooks/useNotifications';
import { useLeads } from '../../context/LeadContext';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/leads': 'Leads Database',
  '/analytics': 'Analytics & Reports',
};

// ─── Dropdown helpers ──────────────────────────────────────────────────────────
const getIconBg = (type) => {
  switch (type) {
    case 'success': return 'bg-success/10 text-success';
    case 'warning': return 'bg-warning/10 text-warning';
    case 'danger':  return 'bg-danger/10 text-danger';
    default:        return 'bg-primary/10 text-primary';
  }
};

const getIcon = (type) => {
  switch (type) {
    case 'success': return <Check className="w-4 h-4" />;
    case 'warning': return <AlertTriangle className="w-4 h-4" />;
    case 'danger':  return <AlertCircle className="w-4 h-4" />;
    default:        return <Info className="w-4 h-4" />;
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Header({ onMenuToggle, onAddLeadClick }) {
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { openLeadDrawer } = useLeads();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsDropdownOpen(false);
    if (notif.metadata?.leadId) {
      openLeadDrawer(notif.metadata.leadId);
    }
  };

  // Get readable page name using memoized lookup
  const pageTitle = useMemo(() => {
    return PAGE_TITLES[location.pathname] || 'Pulse CRM';
  }, [location.pathname]);

  return (
    <header className="h-16 px-4 md:px-6 bg-bg-surface border-b border-border-base flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-bg-surface-hover md:hidden text-text-muted hover:text-text-main transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-display font-semibold text-base sm:text-lg text-text-main">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global Search Bar (Linear Inspired) */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-bg-base border border-border-base text-sm placeholder:text-text-subtle focus:outline-none focus:border-primary/50 text-text-main transition-colors"
          />
          <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-5 items-center gap-0.5 rounded border border-border-base bg-bg-surface px-1.5 font-sans text-[10px] font-medium text-text-subtle">
            ⌘K
          </kbd>
        </div>

        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* Action Button */}
        <button
          id="new-lead-btn"
          onClick={onAddLeadClick}
          className="h-9 px-2.5 sm:px-3.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01] min-h-[36px]"
          aria-label="Add new lead"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            aria-label={`Notifications, ${unreadCount} unread`}
            className="p-2 rounded-lg hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors relative min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-bg-surface animate-pulse" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-surface border border-border-base rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-fade-in">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border-base bg-bg-surface-hover/20 flex items-center justify-between flex-shrink-0">
                <h3 className="font-display font-semibold text-sm text-text-main">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border-base">
                {notifications.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <Bell className="w-8 h-8 text-text-subtle mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-text-muted">All caught up!</p>
                    <p className="text-[10px] text-text-subtle mt-0.5">No notifications at this time.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex gap-3 hover:bg-bg-surface-hover/30 cursor-pointer transition-colors relative group ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      {/* Notification Type Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBg(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-text-main truncate">{notif.title}</h4>
                          <span className="text-[9px] font-medium text-text-subtle whitespace-nowrap mt-0.5">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed break-words">{notif.message}</p>
                      </div>

                      {/* Unread dot / Mark Read Hover Action */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0 gap-1.5 w-6">
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="p-1 rounded hover:bg-bg-surface-hover text-text-subtle hover:text-text-main opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Mark as read"
                          aria-label="Mark notification as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-border-base bg-bg-surface-hover/10 flex justify-end flex-shrink-0">
                  <button
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-text-subtle hover:text-danger transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
