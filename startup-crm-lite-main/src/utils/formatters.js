/**
 * @file utils/formatters.js
 * @description Shared formatting utility functions used across multiple components.
 *
 * Previously duplicated in:
 *  - LeadTable.jsx    (getInitials, formatDate, formatValue)
 *  - LeadCard.jsx     (getInitials, formatValue)
 *  - RecentLeads.jsx  (initials, formatDate, formatValue)
 *  - Dashboard.jsx    (fmtCurrency, todayLabel)
 */

// ─── Name Utilities ────────────────────────────────────────────────────────────

/**
 * Derives up-to-2 uppercase initials from a full name string.
 *
 * @param {string} name - e.g. "Sarah Connor"
 * @returns {string}    - e.g. "SC"
 *
 * @example
 * getInitials('Jane Doe')   // → 'JD'
 * getInitials('Aarav')      // → 'AA'
 * getInitials('')           // → '?'
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Formats a date string into a compact human-readable label.
 * Returns a relative label ("Today", "Yesterday", "Xd ago") for recent dates,
 * and a "Mon DD" or "Mon DD, YYYY" format for older ones.
 *
 * @param {string} dateStr - ISO date string
 * @returns {string}
 *
 * @example
 * formatRelativeDate('2026-06-25T10:00:00Z') // → 'Today'
 * formatRelativeDate('2026-06-24T10:00:00Z') // → 'Yesterday'
 * formatRelativeDate('2026-06-10T10:00:00Z') // → '15d ago'
 * formatRelativeDate('2025-01-15T10:00:00Z') // → 'Jan 15, 2025'
 */
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Formats a date string as "Mon DD, YYYY" (absolute format, no relative labels).
 *
 * @param {string} dateStr - ISO date string
 * @returns {string}
 *
 * @example
 * formatDate('2026-06-20T10:00:00Z') // → 'Jun 20, 2026'
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ─── Currency Utilities ────────────────────────────────────────────────────────

/**
 * Formats a number as a full USD currency string with no decimal places.
 *
 * @param {number} val
 * @returns {string} e.g. "$48,000"
 *
 * @example
 * formatCurrency(48000) // → '$48,000'
 */
export const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

/**
 * Formats a number as a compact USD string (K/M suffix).
 *
 * @param {number} value
 * @returns {string} e.g. "$12K" | "$1.2M"
 *
 * @example
 * formatCompactCurrency(12000)    // → '$12K'
 * formatCompactCurrency(1200000)  // → '$1.2M'
 * formatCompactCurrency(500)      // → '$500'
 */
export const formatCompactCurrency = (value = 0) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
};

// ─── Date Label ────────────────────────────────────────────────────────────────

/**
 * Returns today's date formatted as a long human-readable string.
 *
 * @returns {string} e.g. "Friday, June 20, 2026"
 */
export const getTodayLabel = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
