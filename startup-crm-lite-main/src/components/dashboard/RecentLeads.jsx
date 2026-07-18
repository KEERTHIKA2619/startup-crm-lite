/**
 * @file RecentLeads.jsx
 * @description Table showing the 5 most recently added leads on the Dashboard.
 *
 * Each row displays:
 *  - Avatar initials circle
 *  - Contact name + job title
 *  - Company name
 *  - Deal value
 *  - Status badge (colour-coded)
 *  - Date added (relative or formatted)
 *  - Chevron action affordance
 *
 * Rows are clickable; the optional `onRowClick` callback receives the lead ID,
 * allowing the parent (Dashboard) to open the LeadDrawer.
 *
 * @module components/dashboard/RecentLeads
 */

import { ChevronRight, Inbox, Calendar } from 'lucide-react';

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * Returns the Tailwind utility classes for a status pill.
 *
 * @param {string} status - Lead status string (e.g. 'Won', 'New', 'Lost')
 * @returns {string} Space-separated Tailwind classes
 */
function statusClasses(status) {
  const map = {
    Won:         'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    Lost:        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    Proposal:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    Negotiation: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    Qualified:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    Contacted:   'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    New:         'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
  return map[status] ?? map.New;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Produces up-to-2 initials from a full name string.
 *
 * @param {string} name - e.g. "Sarah Connor"
 * @returns {string}    - e.g. "SC"
 */
function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

/**
 * Formats a date string into a compact human-readable label.
 * Returns a relative label for dates within the last 7 days.
 *
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats a number as a compact USD string.
 *
 * @param {number} value
 * @returns {string} e.g. "$48K" or "$1.2M"
 */
function formatValue(value = 0) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

// ─── Sub-component: empty state ───────────────────────────────────────────────

/**
 * Rendered when the leads array is empty.
 * @returns {JSX.Element}
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600 select-none">
      <Inbox size={32} strokeWidth={1.5} className="mb-3 opacity-60" />
      <p className="text-sm font-medium">No leads yet</p>
      <p className="text-xs mt-1">Add your first lead to see it here.</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * RecentLeads — table of the 5 most recently created leads.
 *
 * @param {object}    props
 * @param {Array}     props.leads       - Full leads array (sorted by this component)
 * @param {Function}  [props.onRowClick] - Optional callback(leadId) when a row is clicked
 * @param {Function}  [props.onViewAll]  - Optional callback when "View all" is clicked
 *
 * @returns {JSX.Element}
 *
 * @example
 * <RecentLeads leads={leads} onRowClick={(id) => openDrawer(id)} />
 */
export default function RecentLeads({ leads = [], onRowClick, onViewAll }) {
  // Sort by createdAt descending, then take the first 5
  const recent = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <section
      className="premium-card overflow-hidden flex flex-col"
      aria-label="Recent leads"
    >
      {/* ── Card header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
            Recent Leads
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Latest 5 additions to your pipeline
          </p>
        </div>

        {/* "View all" link — calls onViewAll or navigates to /leads */}
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-0.5 transition-colors"
            aria-label="View all leads"
          >
            View all
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* ── Table or empty state ──────────────────────────────────────────── */}
      {recent.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">

            {/* Table head */}
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50">
                {['Contact', 'Company', 'Value', 'Status', 'Added'].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap select-none"
                  >
                    {col}
                  </th>
                ))}
                {/* Empty header for the chevron column */}
                <th scope="col" className="px-3 py-3 w-8" />
              </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((lead) => {
                const isClickable = typeof onRowClick === 'function';
                const targetId = lead.id || lead._id;
                return (
                  <tr
                    key={targetId}
                    onClick={isClickable ? () => onRowClick(targetId) : undefined}
                    className={[
                      'group transition-colors text-sm',
                      isClickable
                        ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        : '',
                    ].join(' ')}
                    role={isClickable ? 'button' : 'row'}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={isClickable
                      ? (e) => e.key === 'Enter' && onRowClick(targetId)
                      : undefined
                    }
                    aria-label={isClickable ? `Open details for ${lead.name}` : undefined}
                  >
                    {/* Contact column: avatar + name + title */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Initials avatar circle */}
                        <div
                          className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-display font-semibold text-xs flex-shrink-0"
                          aria-hidden="true"
                        >
                          {initials(lead.name)}
                        </div>
                        <div className="min-w-0">
                          {/* Name — turns blue on hover if clickable */}
                          <p className={[
                            'font-semibold text-slate-900 dark:text-white truncate max-w-[130px] transition-colors',
                            isClickable ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : '',
                          ].join(' ')}>
                            {lead.name}
                          </p>
                          {/* Job title subtitle */}
                          {lead.title && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {lead.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Company column */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                      {lead.company}
                    </td>

                    {/* Deal value column */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-display font-semibold text-slate-900 dark:text-white">
                      {formatValue(lead.value)}
                    </td>

                    {/* Status badge column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={[
                          'inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          statusClasses(lead.status),
                        ].join(' ')}
                        aria-label={`Status: ${lead.status}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* Date added column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <Calendar size={11} aria-hidden="true" />
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>

                    {/* Chevron affordance column */}
                    <td className="px-3 py-3.5 text-right">
                      <ChevronRight
                        size={14}
                        className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
