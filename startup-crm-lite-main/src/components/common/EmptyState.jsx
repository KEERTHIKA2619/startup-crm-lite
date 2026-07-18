/**
 * @file EmptyState.jsx
 * @description A friendly visual placeholder displayed when no leads are available.
 * Handles two scenarios:
 * 1. The CRM contains no leads at all (encourages adding a new lead).
 * 2. Filters or search queries resulted in zero matches (offers to reset filters).
 * Fully responsive and accessible.
 *
 * @module components/common/EmptyState
 */

import { SearchX, UserPlus, XCircle } from 'lucide-react';

/**
 * EmptyState Component
 *
 * @param {Object} props
 * @param {number} props.totalLeadsCount - Total number of leads currently stored in the system
 * @param {Function} props.onClearFilters - Callback to reset all active search and filter fields
 * @param {Function} props.onAddLeadClick - Callback to open the new lead creation modal
 */
export default function EmptyState({
  totalLeadsCount = 0,
  onClearFilters,
  onAddLeadClick
}) {
  const isCrmTotallyEmpty = totalLeadsCount === 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-bg-surface border border-border-base rounded-xl shadow-sm page-fade">
      {/* Icon Circle */}
      <div className="w-14 h-14 rounded-full bg-bg-base border border-border-base flex items-center justify-center mb-4 text-text-subtle shadow-inner">
        {isCrmTotallyEmpty ? (
          <UserPlus className="w-6 h-6 text-primary" />
        ) : (
          <SearchX className="w-6 h-6 text-text-muted" />
        )}
      </div>

      {/* Heading */}
      <h3 className="font-display font-semibold text-text-main text-lg mb-1">
        {isCrmTotallyEmpty ? 'No leads created yet' : 'No matching leads found'}
      </h3>

      {/* Subtext */}
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        {isCrmTotallyEmpty
          ? "Get started by creating your first lead. Track status, sources, notes, and deal values all in one workspace."
          : "We couldn't find any leads matching your active filters or search terms. Try adjusting your query or resetting your status filters."}
      </p>

      {/* Action CTA Button */}
      {isCrmTotallyEmpty ? (
        <button
          type="button"
          onClick={onAddLeadClick}
          className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          Add First Lead
        </button>
      ) : (
        <button
          type="button"
          onClick={onClearFilters}
          className="h-10 px-4 rounded-lg border border-border-base hover:bg-bg-surface-hover text-sm font-medium text-text-muted hover:text-text-main transition-colors duration-200 flex items-center gap-2"
        >
          <XCircle className="w-4 h-4 text-text-subtle" />
          Clear Search & Filters
        </button>
      )}
    </div>
  );
}
