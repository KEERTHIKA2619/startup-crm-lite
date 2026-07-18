/**
 * @file LeadTable.jsx
 * @description Renders all leads in either a Notion-style data table or a responsive
 * card grid. Includes pagination, view-mode toggling, and an inline two-step delete
 * confirmation (no native browser confirm() dialogs).
 *
 * @module components/leads/LeadTable
 */

import { useState, useEffect, useRef } from 'react';
import {
  Calendar, Mail, Building2, Pencil, Trash2,
  Globe, LayoutGrid, List, Check, X, DollarSign
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import LeadCard from './LeadCard';

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatValue = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(val || 0);

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── InlineDeleteCell ─────────────────────────────────────────────────────────
/**
 * Renders Edit + Delete buttons for a single table row.
 * The delete button uses a two-step inline confirm to avoid native dialogs.
 */
function InlineDeleteCell({ lead, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const targetId = lead.id || lead._id;
  const [prevLeadId, setPrevLeadId] = useState(targetId);
  // Inline sync: reset pending when the lead row identity changes
  if (targetId !== prevLeadId) {
    setPrevLeadId(targetId);
    setPendingDelete(false);
  }

  if (pendingDelete) {
    return (
      <div className="flex items-center justify-end gap-1.5 animate-fade-in">
        <span className="text-[11px] text-danger font-semibold whitespace-nowrap">Delete?</span>
        <button
          onClick={() => onDelete(targetId)}
          aria-label="Confirm delete"
          className="p-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors duration-150"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setPendingDelete(false)}
          aria-label="Cancel delete"
          className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors duration-150"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEdit(lead)}
        aria-label={`Edit lead ${lead.name}`}
        className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-primary transition-colors duration-150"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => setPendingDelete(true)}
        aria-label={`Delete lead ${lead.name}`}
        className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-danger transition-colors duration-150"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── LeadTable ────────────────────────────────────────────────────────────────

/**
 * LeadTable Component
 *
 * @param {Object}   props
 * @param {Array}    props.leads            - Filtered array of lead objects
 * @param {string}   props.viewMode         - 'table' | 'card'
 * @param {Function} props.onViewModeChange - Setter for viewMode
 * @param {Function} props.onEdit           - Called with lead object when Edit is clicked
 * @param {Function} props.onDelete         - Called with lead.id when deletion is confirmed
 */
export default function LeadTable({ leads = [], viewMode = 'table', onViewModeChange, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const totalItems = leads.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Screen size detection to force card view mode on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (viewMode !== 'card') onViewModeChange('card');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, onViewModeChange]);

  // Reset to page 1 whenever the leads array identity changes (filter applied)
  const prevLeadsRef = useRef(leads);
  useEffect(() => {
    if (prevLeadsRef.current !== leads) {
      setCurrentPage(1);
      prevLeadsRef.current = leads;
    }
  }, [leads]);

  // Inline clamp: keep currentPage in-bounds when leads list shrinks
  // (avoids setState-in-effect lint error)
  const safePage = totalPages > 0 && currentPage > totalPages ? totalPages : currentPage;

  const startIndex    = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">

      {/* ── View toggle header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium">
          Showing{' '}
          <span className="font-semibold text-text-main">{leads.length}</span>{' '}
          lead{leads.length !== 1 ? 's' : ''}
        </span>

        <div
          role="group"
          aria-label="Switch view mode"
          className="hidden md:flex items-center gap-1.5 bg-bg-surface-hover/50 border border-border-base p-1 rounded-lg"
        >
          <button
            onClick={() => onViewModeChange('table')}
            aria-label="Table view"
            aria-pressed={viewMode === 'table'}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('card')}
            aria-label="Card view"
            aria-pressed={viewMode === 'card'}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'card'
                ? 'bg-bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Card grid (mobile-first) ────────────────────────────────────── */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedLeads.map((lead) => (
            <LeadCard
              key={lead.id || lead._id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* ── Data table (horizontally scrollable on narrow screens) ──── */
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-border-base bg-bg-surface-hover/20 text-xs font-bold text-text-subtle uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5 font-semibold">Name</th>
                  <th className="py-3.5 px-5 font-semibold">Company</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold">Email</th>
                  <th className="py-3.5 px-5 font-semibold">Source</th>
                  <th className="py-3.5 px-5 font-semibold">Value</th>
                  <th className="py-3.5 px-5 font-semibold">Date Added</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base text-sm text-text-main">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id || lead._id}
                    className="hover:bg-bg-surface-hover/30 transition-colors duration-150 group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center font-display font-semibold text-xs flex-shrink-0 select-none">
                          {getInitials(lead.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-text-main group-hover:text-primary transition-colors duration-150">
                            {lead.name}
                          </p>
                          <p className="text-xs text-text-muted">{lead.title || 'No Title'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-5 text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-text-subtle flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{lead.company}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={lead.status} />
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 text-text-muted">
                      <div className="flex items-center gap-1.5 max-w-[160px] truncate">
                        <Mail className="w-4 h-4 text-text-subtle flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-5 text-text-muted text-xs">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
                        <span>{lead.source}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 text-text-main font-semibold text-xs">
                        <DollarSign className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
                        {formatValue(lead.value)}
                      </div>
                    </td>

                    {/* Date Added */}
                    <td className="py-3.5 px-5 text-text-muted text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
                        <span>{formatDate(lead.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions — inline confirm */}
                    <td className="py-3.5 px-5">
                      <InlineDeleteCell lead={lead} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="px-4 py-3 rounded-xl border border-border-base bg-bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs text-text-muted font-medium shadow-sm">
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-8 px-3 rounded border border-border-base hover:bg-bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`h-8 w-8 rounded transition-colors ${
                  p === safePage
                    ? 'bg-primary text-white font-bold'
                    : 'hover:bg-bg-surface-hover text-text-muted hover:text-text-main'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-8 px-3 rounded border border-border-base hover:bg-bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
