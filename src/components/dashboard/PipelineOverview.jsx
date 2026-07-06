import React, { useMemo } from 'react';
import { STATUS_COLORS } from '../../constants';

// Define status styling maps for CRM pipeline stages
const statusConfig = {
  New: {
    label: 'New Leads',
    color: 'bg-[#94A3B8]',
    text: 'text-[#94A3B8]',
    border: 'border-[#94A3B8]/20',
    bgLight: 'bg-[#94A3B8]/10',
  },
  Contacted: {
    label: 'Contacted',
    color: 'bg-[#2563EB]',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]/20',
    bgLight: 'bg-[#2563EB]/10',
  },
  'Meeting Scheduled': {
    label: 'Meetings',
    color: 'bg-[#F59E0B]',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
    bgLight: 'bg-[#F59E0B]/10',
  },
  'Proposal Sent': {
    label: 'Proposals',
    color: 'bg-[#7C3AED]',
    text: 'text-[#7C3AED]',
    border: 'border-[#7C3AED]/20',
    bgLight: 'bg-[#7C3AED]/10',
  },
  Won: {
    label: 'Won Deals',
    color: 'bg-[#22C55E]',
    text: 'text-[#22C55E]',
    border: 'border-[#22C55E]/20',
    bgLight: 'bg-[#22C55E]/10',
  },
  Lost: {
    label: 'Lost Deals',
    color: 'bg-[#EF4444]',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/20',
    bgLight: 'bg-[#EF4444]/10',
  },
};

const order = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

/**
 * PipelineOverview Component
 * Renders a horizontal bar chart reflecting the distribution of active CRM pipeline leads.
 * Optimized with React.memo and useMemo for large data loads.
 */
export const PipelineOverview = React.memo(({ leads = [] }) => {
  const totalLeads = leads.length;

  // Memoize lead segment breakdown to avoid recalculation on unrelated renders
  const segments = useMemo(() => {
    const counts = {};
    // Seed counts
    Object.keys(statusConfig).forEach(s => { counts[s] = 0; });
    
    // Group leads
    leads.forEach(lead => {
      if (lead.status && counts[lead.status] !== undefined) {
        counts[lead.status]++;
      }
    });

    return Object.keys(counts).map(status => {
      const count = counts[status];
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
      const config = statusConfig[status];

      return {
        status,
        count,
        percentage,
        ...config
      };
    }).sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  }, [leads, totalLeads]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full transition-colors duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pipeline Breakdown</h3>
        <p className="text-xs text-slate-550 dark:text-slate-450 mt-1">Lead volume distributions by active priority statuses.</p>
      </div>

      <div className="my-6">
        {/* Segmented Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {totalLeads > 0 ? (
            segments.map((seg) => {
              if (seg.count === 0) return null;
              return (
                <div
                  key={seg.status}
                  style={{ width: `${seg.percentage}%` }}
                  className={`${seg.color} h-full transition-all duration-500`}
                  title={`${seg.label}: ${seg.count} (${seg.percentage.toFixed(1)}%)`}
                />
              );
            })
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          )}
        </div>

        {/* Dynamic Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6">
          {segments.map((seg) => {
            if (seg.count === 0) return null;
            return (
              <div 
                key={seg.status} 
                className={`p-3 rounded-xl border ${seg.border} ${seg.bgLight} flex flex-col gap-1`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-350 truncate">{seg.label}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">{seg.count}</span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-500">
                    ({Math.round(seg.percentage)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
        <span>Total Opportunities</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{totalLeads} Leads</span>
      </div>
    </div>
  );
});

PipelineOverview.displayName = 'PipelineOverview';
export default PipelineOverview;
