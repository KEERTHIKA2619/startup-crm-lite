import React, { useState } from 'react';
import { Calendar, SlidersHorizontal } from 'lucide-react';

/**
 * AnalyticsFilters Component
 * Provides a button group for selecting standard date filter periods,
 * and a custom range date picker when "Custom Range" is selected.
 */
export const AnalyticsFilters = ({ activeFilter, onFilterChange, customRange, onCustomRangeChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(activeFilter === 'custom');

  const filterOptions = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' }
  ];

  const handleFilterClick = (key) => {
    onFilterChange(key);
    if (key === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    onCustomRangeChange({
      ...customRange,
      [name]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Control Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        
        {/* Left Side: Title and Active Filter Tag */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-[#2563EB] dark:text-indigo-400 rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date Filters</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Selected Range:</h4>
              <span className="text-xs font-bold bg-[#2563EB]/15 dark:bg-indigo-500/20 text-[#2563EB] dark:text-indigo-400 px-2 py-0.5 rounded-md">
                {filterOptions.find(o => o.key === activeFilter)?.label || 'Custom'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Predefined Options Buttons */}
        <div className="flex flex-wrap bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/20 w-fit" role="tablist">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleFilterClick(opt.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                role="tab"
                aria-selected={isActive}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Inline Custom Date Picker Panel */}
      {showCustomPicker && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#2563EB] dark:text-indigo-400" />
            <span>Custom Period</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="custom-start-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">From:</label>
              <input
                type="date"
                id="custom-start-date"
                name="startDate"
                value={customRange?.startDate || ''}
                onChange={handleDateChange}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-150 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="custom-end-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">To:</label>
              <input
                type="date"
                id="custom-end-date"
                name="endDate"
                value={customRange?.endDate || ''}
                onChange={handleDateChange}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-150 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
