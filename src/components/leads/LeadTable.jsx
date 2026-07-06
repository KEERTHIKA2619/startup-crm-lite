import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, List, Mail, Edit3, Trash2, Globe } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LeadCard from './LeadCard';

/**
 * LeadTable Component
 * Manages the display layout for the leads pipeline.
 * Responsive behaviors:
 *   - Mobile (< 768px): Card view only (toggles hidden)
 *   - Tablet (768px to 1023px): Hybrid view toggleable via layout selectors
 *   - Desktop (>= 1024px): Full table view only (toggles hidden)
 */
export const LeadTable = React.memo(({ leads = [], onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState('table'); // State used only on tablet
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Resolve the actual view mode based on screen size
  const activeView = isMobile ? 'card' : isDesktop ? 'table' : viewMode;

  const handleEditClick = (lead) => {
    onEdit(lead);
  };

  const handleDeleteClick = (lead) => {
    onDelete(lead);
  };

  return (
    <div className="space-y-6">

      {/* ─── Layout Toggle Control Bar (Visible on Tablet only) ─── */}
      {isTablet && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              View Mode:
            </span>
            <span className="text-xs font-bold text-[#2563EB] dark:text-indigo-400 uppercase tracking-wider">
              {activeView === 'table' ? 'List Table' : 'Card Grid'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              ({leads.length} {leads.length === 1 ? 'lead' : 'leads'})
            </span>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl" role="tablist" aria-label="View mode toggle">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 text-xs font-semibold cursor-pointer min-h-[38px] ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              role="tab"
              aria-selected={viewMode === 'table'}
              aria-label="Table list view"
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 text-xs font-semibold cursor-pointer min-h-[38px] ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              role="tab"
              aria-selected={viewMode === 'card'}
              aria-label="Card grid view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Content Views ─── */}
      {activeView === 'table' ? (
        /* ━━━ TABLE LAYOUT VIEW ━━━ */
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300"
          role="tabpanel"
          id="leads-table-panel"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Leads pipeline table">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 dark:from-slate-800 to-slate-50/50 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Source
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Date Added
                  </th>
                  <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                          {lead.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {lead.company}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <StatusBadge status={lead.status} />
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <a href={`mailto:${lead.email}`} className="hover:text-[#2563EB] dark:hover:text-indigo-400 hover:underline transition-colors whitespace-nowrap">
                          {lead.email}
                        </a>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{lead.source || 'Direct'}</span>
                      </div>
                    </td>

                    {/* Date Added */}
                    <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                      {lead.dateAdded}
                    </td>

                    {/* Action Buttons - 44px (w-11 h-11) touch targets */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5" role="group" aria-label={`Actions for ${lead.name}`}>
                        <button
                          onClick={() => handleEditClick(lead)}
                          className="w-11 h-11 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#2563EB] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center justify-center cursor-pointer"
                          aria-label={`Edit ${lead.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lead)}
                          className="w-11 h-11 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#EF4444] dark:hover:text-red-450 hover:bg-red-550 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center justify-center cursor-pointer"
                          aria-label={`Delete ${lead.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850 px-6 py-3 flex items-center justify-between transition-colors duration-300">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Showing {leads.length} {leads.length === 1 ? 'record' : 'records'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Startup CRM Lite
            </span>
          </div>
        </div>
      ) : (
        /* ━━━ CARD GRID LAYOUT VIEW ━━━ */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="tabpanel"
          id="leads-card-panel"
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

LeadTable.displayName = 'LeadTable';
export default LeadTable;
