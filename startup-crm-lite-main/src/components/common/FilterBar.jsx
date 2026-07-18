/**
 * @file FilterBar.jsx
 * @description Horizontal scrollable filter bar showing status buttons (All, New, Contacted, etc.)
 * with live counts from the leads array. Active buttons are styled with the primary color theme.
 * Includes status normalization for legacy status counts.
 *
 * @module components/common/FilterBar
 */

import { useMemo } from 'react';
import { FILTER_CATEGORIES, getNormalizedFilterStatus } from '../../constants/index';

/**
 * FilterBar Component
 *
 * @param {Object} props
 * @param {string} props.activeFilter - The active status filter value (e.g., 'All', 'Won')
 * @param {Function} props.onFilterChange - Callback when filter category is clicked
 * @param {Array} props.leads - Complete list of leads to calculate status distribution counts
 */
export default function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  // Compute counts map for each status button exactly once per leads update
  const counts = useMemo(() => {
    const map = { All: leads.length };
    FILTER_CATEGORIES.forEach((cat) => {
      if (cat.value !== 'All') {
        map[cat.value] = 0;
      }
    });

    leads.forEach((lead) => {
      const normalizedStatus = getNormalizedFilterStatus(lead.status);
      if (map[normalizedStatus] !== undefined) {
        map[normalizedStatus] += 1;
      }
    });

    return map;
  }, [leads]);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -my-2 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-max px-1">
        {FILTER_CATEGORIES.map((category) => {
          const count = counts[category.value] || 0;
          const isActive = activeFilter === category.value;

          return (
            <button
              key={category.value}
              onClick={() => onFilterChange(category.value)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'bg-bg-surface hover:bg-bg-surface-hover text-text-muted hover:text-text-main border border-border-base'
              }`}
            >
              <span>{category.label}</span>
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-surface-hover text-text-subtle group-hover:text-text-muted border border-border-base'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
