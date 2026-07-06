import React from 'react';
import { BarChart3, Plus } from 'lucide-react';

/**
 * EmptyAnalyticsState Component
 * Displayed when there are no leads inside the selected date range.
 * Provides a CTA button to trigger new lead creation.
 */
export const EmptyAnalyticsState = ({ onAddLead }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm text-center max-w-2xl mx-auto my-8">
      {/* Icon with glowing visual backing */}
      <div className="relative w-16 h-16 bg-[#2563EB]/10 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-[#2563EB] dark:text-indigo-400 mb-6">
        <BarChart3 className="w-8 h-8" />
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-xl animate-pulse" />
      </div>

      {/* Text Headings */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        No analytics available yet
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-8 leading-relaxed">
        Add your first lead to start tracking business performance, conversion rates, and revenue forecasting.
      </p>

      {/* Add Lead CTA Button */}
      <button
        onClick={onAddLead}
        className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        <span>Add Lead</span>
      </button>
    </div>
  );
};

export default EmptyAnalyticsState;
