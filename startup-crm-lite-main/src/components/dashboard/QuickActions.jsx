/**
 * @file QuickActions.jsx
 * @description Quick-action button panel for the CRM Dashboard.
 *
 * Provides three primary calls-to-action:
 *  1. Add New Lead   — opens the global LeadModal
 *  2. View All Leads — navigates to /leads
 *  3. Export Data    — downloads leads as a CSV file
 *
 * Each action is represented as a card-style button with an icon, label,
 * description line, and a coloured accent. The component uses the
 * `useNavigate` hook from React Router for programmatic navigation.
 *
 * @module components/dashboard/QuickActions
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Download, ArrowRight } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import toast from 'react-hot-toast';

// ─── CSV export helper ────────────────────────────────────────────────────────

/**
 * Converts a leads array to a CSV string and triggers a browser download.
 *
 * Columns exported: Name, Title, Company, Email, Phone, Value, Status, Source, Created.
 *
 * @param {Array} leads - Full leads array from LeadContext
 */
function exportLeadsAsCsv(leads) {
  if (leads.length === 0) {
    toast.error('No leads to export.');
    return;
  }

  // CSV header row
  const headers = [
    'Name', 'Title', 'Company', 'Email',
    'Phone', 'Value', 'Status', 'Source', 'Created',
  ];

  // Escape a single cell value: wrap in quotes, escape inner quotes
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  // Map each lead to a CSV row
  const rows = leads.map((l) =>
    [
      l.name, l.title, l.company, l.email,
      l.phone, l.value, l.status, l.source,
      new Date(l.createdAt).toLocaleDateString('en-US'),
    ]
      .map(escape)
      .join(',')
  );

  // Combine header + rows into the full CSV text
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create an in-memory blob and trigger an <a> click to download it
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `pulse-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke the object URL to release memory
  URL.revokeObjectURL(url);

  toast.success(`Exported ${leads.length} lead${leads.length !== 1 ? 's' : ''} to CSV!`);
}

// ─── Action definitions ───────────────────────────────────────────────────────

/**
 * @typedef {object} ActionDef
 * @property {string}           id          - Unique identifier (also used as button id)
 * @property {string}           label       - Button primary label
 * @property {string}           description - Short secondary description
 * @property {React.ElementType} icon       - Lucide icon component
 * @property {string}           iconBg      - Tailwind class for icon badge background
 * @property {string}           iconText    - Tailwind class for icon badge text colour
 * @property {string}           hoverBg     - Tailwind class for card hover background
 * @property {string}           hoverBorder - Tailwind class for card hover border
 */

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * QuickActions — a row of three primary CTA cards.
 *
 * @param {object}   props
 * @param {Function} [props.onAddLead] - Callback to open the "Add Lead" modal.
 *                                       If omitted the button is disabled.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <QuickActions onAddLead={() => setIsModalOpen(true)} />
 */
export default function QuickActions({ onAddLead }) {
  const navigate  = useNavigate();
  const { leads } = useLeads(); // needed for the CSV export

  // ── Action handlers ───────────────────────────────────────────────────────

  /** Open the global Add Lead modal provided by Dashboard/App */
  const handleAddLead = useCallback(() => {
    if (typeof onAddLead === 'function') {
      onAddLead();
    }
  }, [onAddLead]);

  /** Navigate to the Leads database page */
  const handleViewLeads = useCallback(() => {
    navigate('/leads');
  }, [navigate]);

  /** Export all leads to a CSV download */
  const handleExport = useCallback(() => {
    exportLeadsAsCsv(leads);
  }, [leads]);

  // ── Action config array ───────────────────────────────────────────────────
  // Defined inside the component so handlers are in scope
  /** @type {{ id: string, label: string, description: string, icon: React.ElementType, iconBg: string, iconText: string, hoverBorder: string, onClick: Function, disabled?: boolean }[]} */
  const actions = [
    {
      id:          'quick-action-add-lead',
      label:       'Add New Lead',
      description: 'Capture a new prospect into the pipeline',
      icon:        UserPlus,
      iconBg:      'bg-blue-500/10 dark:bg-blue-500/20',
      iconText:    'text-blue-600 dark:text-blue-400',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
      onClick:     handleAddLead,
      disabled:    typeof onAddLead !== 'function',
    },
    {
      id:          'quick-action-view-leads',
      label:       'View All Leads',
      description: 'Browse, search, and filter every lead',
      icon:        Users,
      iconBg:      'bg-violet-500/10 dark:bg-violet-500/20',
      iconText:    'text-violet-600 dark:text-violet-400',
      hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
      onClick:     handleViewLeads,
    },
    {
      id:          'quick-action-export',
      label:       'Export Data',
      description: `Download ${leads.length} lead${leads.length !== 1 ? 's' : ''} as CSV`,
      icon:        Download,
      iconBg:      'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconText:    'text-emerald-600 dark:text-emerald-400',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      onClick:     handleExport,
    },
  ];

  return (
    <section aria-label="Quick actions" className="flex flex-col gap-3">
      {/* Section heading */}
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-0.5 select-none">
        Quick Actions
      </h2>

      {/* Action card grid: 1-col → 3-col */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map(({
          id, label, description, icon: Icon,
          iconBg, iconText, hoverBorder, onClick, disabled,
        }) => (
          <button
            key={id}
            id={id}
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={[
              // Base card style
              'group w-full text-left premium-card px-4 py-4 flex items-start gap-4',
              // Animated hover border accent
              'border transition-all duration-200',
              hoverBorder,
              // Disabled state
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
            ].join(' ')}
          >
            {/* Icon badge */}
            <div
              className={[
                'p-2.5 rounded-lg flex-shrink-0 mt-0.5 transition-transform duration-200',
                'group-hover:scale-110',
                iconBg, iconText,
              ].join(' ')}
              aria-hidden="true"
            >
              <Icon size={16} strokeWidth={2} />
            </div>

            {/* Text block */}
            <div className="flex-1 min-w-0">
              {/* Action label */}
              <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {label}
              </p>
              {/* Description line */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {description}
              </p>
            </div>

            {/* Trailing arrow — slides right on hover */}
            <ArrowRight
              size={14}
              className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all mt-1.5"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
