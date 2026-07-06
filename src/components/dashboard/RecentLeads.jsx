import React, { useMemo } from 'react';
import { STATUS_COLORS } from '../../constants';

// Mapped badge styles matching status values
const badgeColors = {
  New: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Contacted: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50',
  'Meeting Scheduled': 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
  'Proposal Sent': 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50',
  Won: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  Lost: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 dark:bg-rose-950/30 dark:text-rose-455 dark:border-rose-900/50',
};

/**
 * RecentLeads Component
 * Renders a tabular display of the five most recently added leads from the CRM database.
 * Optimized with React.memo and useMemo for rendering speed.
 */
export const RecentLeads = React.memo(({ leads = [] }) => {
  // Sort leads by creation date descending and slice the top 5
  const displayLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.dateAdded);
        const dateB = new Date(b.createdAt || b.dateAdded);
        // Fallback checks for invalid dates
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [leads]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-full transition-colors duration-200">
      <div>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Opportunities</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Latest leads registered on the CRM system.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
            Realtime
          </span>
        </div>

        <div className="overflow-x-auto">
          {displayLeads.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead details</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Created on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayLeads.map((lead) => {
                  const badgeClass = badgeColors[lead.status] || 'bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 border-slate-200 dark:border-slate-700';
                  return (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-indigo-50/20 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-6">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] dark:group-hover:text-indigo-400 transition-colors block">
                          {lead.name}
                        </span>
                      </td>
                      
                      {/* Company */}
                      <td className="py-3.5 px-6">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {lead.company}
                        </span>
                      </td>
                      
                      {/* Status Badge */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                          {lead.status}
                        </span>
                      </td>
                      
                      {/* Date */}
                      <td className="py-3.5 px-6 text-right">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          {lead.dateAdded || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-xs text-slate-400 font-semibold">No recent records available</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Recent Activity Feed
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Startup CRM Lite
        </span>
      </div>
    </div>
  );
});

RecentLeads.displayName = 'RecentLeads';
export default RecentLeads;
