import { Inbox, SearchX, RefreshCw } from 'lucide-react';

/**
 * @typedef {Object} EmptyStateProps
 * @property {number} totalLeads - Total number of leads in the pipeline (before any filtering)
 * @property {string} searchQuery - Current search query string
 * @property {string} activeFilter - Current active status filter
 * @property {function(): void} onClearFilters - Callback to reset all search/filter state
 */

/**
 * EmptyState Component
 * Displays a contextual empty state message when no leads match the current
 * search query and/or status filter combination.
 *
 * Two distinct modes:
 *   1. Zero total leads:   Pipeline is completely empty — prompt to create a lead
 *   2. Zero after filter:  Leads exist but no matches — prompt to clear filters
 *
 * @param {EmptyStateProps} props - The component parameters
 * @returns {React.JSX.Element} The rendered empty state
 */
export default function EmptyState({ totalLeads = 0, searchQuery = '', activeFilter = 'All', onClearFilters }) {
  const isPipelineEmpty = totalLeads === 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 sm:p-16 text-center flex flex-col items-center justify-center gap-5 transition-colors duration-200">
      {/* Icon container */}
      <div
        className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors duration-300 ${
          isPipelineEmpty
            ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-500'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-500'
        }`}
      >
        {isPipelineEmpty ? (
          <Inbox className="w-8 h-8" />
        ) : (
          <SearchX className="w-8 h-8" />
        )}
      </div>

      {/* Message content */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
          {isPipelineEmpty ? 'Pipeline Empty' : 'No leads found'}
        </h4>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isPipelineEmpty ? (
            <>
              Your pipeline is empty. Click{' '}
              <strong className="text-slate-700 dark:text-slate-200">"Create Lead"</strong> to add your first lead
              and start tracking opportunities.
            </>
          ) : (
            <>
              No leads match your current
              {searchQuery && (
                <>
                  {' '}search for{' '}
                  <strong className="text-slate-700 dark:text-slate-200">"{searchQuery}"</strong>
                </>
              )}
              {searchQuery && activeFilter !== 'All' && ' and'}
              {activeFilter !== 'All' && (
                <>
                  {' '}filter for{' '}
                  <strong className="text-slate-700 dark:text-slate-200">"{activeFilter}"</strong>
                </>
              )}
              . Try adjusting your criteria or clear the filters.
            </>
          )}
        </p>
      </div>

      {/* Clear filters action button — only shown when filters are active and pipeline isn't empty */}
      {!isPipelineEmpty && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#2563EB] dark:text-indigo-400 bg-blue-50 dark:bg-indigo-950/30 border border-blue-100 dark:border-indigo-900/50 hover:bg-blue-100 dark:hover:bg-indigo-950/50 hover:border-blue-200 dark:hover:border-indigo-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 active:scale-[0.98] cursor-pointer"
          aria-label="Clear all filters and show all leads"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}
