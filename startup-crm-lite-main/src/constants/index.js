/**
 * @file constants/index.js
 * @description Single source of truth for all domain-level constants used across the CRM.
 *
 * Previously these were duplicated across:
 *  - LeadForm.jsx         (STATUS_OPTIONS, SOURCE_OPTIONS)
 *  - LeadModal.jsx        (statuses, sources — different values!)
 *  - LeadDrawer.jsx       (statuses, sources — different values!)
 *  - FilterBar.jsx        (FILTER_CATEGORIES)
 *  - analyticsColors.js   (STATUS_COLORS, SOURCE_COLORS)
 *
 * Import from here to eliminate drift and keep data consistent.
 */

// ─── Lead Pipeline Status ──────────────────────────────────────────────────────

/** Ordered list of all valid lead pipeline statuses. */
export const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

// ─── Lead Source Channels ──────────────────────────────────────────────────────

/** Ordered list of all valid lead acquisition sources. */
export const SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Other',
];

// ─── Filter Bar Categories ─────────────────────────────────────────────────────

/**
 * Ordered filter button definitions for the FilterBar component.
 * Each object maps a user-facing label to the filter value used in comparisons.
 */
export const FILTER_CATEGORIES = [
  { label: 'All',               value: 'All' },
  { label: 'New',               value: 'New' },
  { label: 'Contacted',         value: 'Contacted' },
  { label: 'Meeting Scheduled', value: 'Meeting Scheduled' },
  { label: 'Proposal Sent',     value: 'Proposal Sent' },
  { label: 'Won',               value: 'Won' },
  { label: 'Lost',              value: 'Lost' },
];

// ─── Status Colors (for charts) ────────────────────────────────────────────────

/**
 * Hex color map for each lead status.
 * Keys match STATUS_OPTIONS exactly.
 */
export const STATUS_COLORS = {
  'New':              'var(--text-subtle)',
  'Contacted':        'var(--primary)',
  'Meeting Scheduled':'var(--accent)',
  'Proposal Sent':    'var(--secondary)',
  'Won':              'var(--success)',
  'Lost':             'var(--danger)',
};

// ─── Source Colors (for charts) ────────────────────────────────────────────────

/**
 * Hex color map for each lead source channel.
 * Keys match SOURCE_OPTIONS exactly.
 */
export const SOURCE_COLORS = {
  'Website':        'var(--primary)',
  'Referral':       'var(--accent)',
  'LinkedIn':       'var(--secondary)',
  'Cold Call':      'var(--danger)',
  'Email Campaign': 'var(--secondary)',
  'Other':          'var(--text-subtle)',
};

// ─── Pagination ────────────────────────────────────────────────────────────────

/** Default number of leads shown per page in the LeadTable. */
export const LEADS_PER_PAGE = 8;

// ─── Status Normalization ──────────────────────────────────────────────────────

/**
 * Normalizes legacy statuses to match the active filters list.
 *
 * @param {string} status - Raw status value from lead data
 * @returns {string} Normalized status
 */
export const getNormalizedFilterStatus = (status) => {
  if (!status) return 'New';
  const trimmed = status.trim();
  if (trimmed === 'Qualified') return 'Contacted';
  if (trimmed === 'Proposal' || trimmed === 'Negotiation') return 'Proposal Sent';
  return trimmed;
};

