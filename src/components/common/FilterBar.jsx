import React, { useMemo } from 'react';
import { FILTER_OPTIONS, STATUS_COLORS } from '../../constants';

/**
 * FilterBar Component
 * Renders a row of filter buttons with lead status counts.
 * Uses memoized counts to optimize rendering performance for large datasets.
 */
export const FilterBar = React.memo(({ activeFilter, onFilterChange, leads = [] }) => {
  // Pre-calculate counts of leads in a single scan (O(N) vs 7 * O(N) previously)
  const counts = useMemo(() => {
    const countsMap = { All: leads.length };
    
    // Seed default status keys with 0
    FILTER_OPTIONS.forEach((opt) => {
      if (opt !== 'All') countsMap[opt] = 0;
    });

    // Populate counts
    leads.forEach((lead) => {
      if (lead.status && countsMap[lead.status] !== undefined) {
        countsMap[lead.status]++;
      }
    });

    return countsMap;
  }, [leads]);

  const handleFilterClick = (filter) => {
    onFilterChange(filter);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter leads by status">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = activeFilter === filter;
        const count = counts[filter] || 0;

        return (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`
              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
              border transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 cursor-pointer
              ${
                isActive
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm shadow-blue-600/20 focus:ring-blue-505'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 focus:ring-slate-400'
              }
            `}
            aria-pressed={isActive}
            aria-label={`Filter by ${filter} status, ${count} leads`}
          >
            {/* Status color dot indicator */}
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                isActive ? 'bg-white' : ''
              }`}
              style={{
                backgroundColor: isActive ? undefined : (STATUS_COLORS[filter] || '#64748B')
              }}
              aria-hidden="true"
            />

            {/* Filter label and count in parentheses */}
            <span>
              {filter}{' '}
              <span
                className={`font-semibold transition-colors duration-300 ${
                  isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                ({count})
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
export default FilterBar;
