import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, TableProperties, Download, Activity } from 'lucide-react';

/**
 * @typedef {Object} QuickActionsProps
 * @property {function} [onAddLead] - Callback function triggered when "Add New Lead" is clicked
 * @property {function} [onExportData] - Callback function triggered when "Export Data" is clicked
 */

/**
 * QuickActions Component
 * Provides a card with accessible action triggers for creating leads, navigating to listings,
 * and performing analytics data exports.
 * 
 * @param {QuickActionsProps} props - The component parameters
 * @returns {React.JSX.Element} The quick actions container element
 */
const QuickActions = ({ onAddLead, onExportData }) => {
  const navigate = useNavigate();

  const handleAddClick = () => {
    if (onAddLead) {
      onAddLead();
    } else {
      alert('Add Lead workflow initiated! (Mock Modal Trigger)');
    }
  };

  const handleExportClick = () => {
    if (onExportData) {
      onExportData();
    } else {
      alert('Preparing leads export... Download started (CSV mockup)');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full transition-colors duration-200">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Workspace Actions</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accelerate routine workflows with quick system commands.</p>
      </div>

      <div className="my-6 flex flex-col gap-3">
        {/* Add New Lead button */}
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-3 w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>

        {/* View All Leads Link Button */}
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all text-sm"
        >
          <TableProperties className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>View All Leads</span>
        </button>

        {/* Export Data Button */}
        <button
          onClick={handleExportClick}
          className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] transition-all text-sm"
        >
          <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-[#22C55E]" />
        <span>Operations Hub</span>
      </div>
    </div>
  );
};

export default QuickActions;
