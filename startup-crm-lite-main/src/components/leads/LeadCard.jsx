/**
 * @file LeadCard.jsx
 * @description Card representation of a single CRM Lead.
 * Displays name, company, status badge, email, phone, deal value and action buttons
 * for editing and deletion. Uses an inline two-step delete confirmation instead of
 * native browser confirm() dialogs for a polished, crash-free UX.
 *
 * @module components/leads/LeadCard
 */

import { useState } from 'react';
import { Mail, Phone, Building2, Pencil, Trash2, DollarSign, Check, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * Derives two-character initials from a full name string.
 * @param {string} name
 * @returns {string}
 */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Formats a number as a USD currency string.
 * @param {number} val
 * @returns {string}
 */
const formatValue = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

/**
 * LeadCard Component
 *
 * @param {Object}   props
 * @param {Object}   props.lead     - The lead object to display
 * @param {Function} props.onEdit   - Called with the full lead object when Edit is clicked
 * @param {Function} props.onDelete - Called with lead.id when deletion is confirmed
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  const { name, company, email, phone, status, source, value, title } = lead;

  // Two-step delete: first click arms the confirm UI, second click fires deletion
  const [pendingDelete, setPendingDelete] = useState(false);

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(lead);
  };

  const handleDeleteArm = (e) => {
    e.stopPropagation();
    setPendingDelete(true);
  };

  const handleDeleteConfirm = (e) => {
    e.stopPropagation();
    onDelete(lead.id || lead._id);
  };

  const handleDeleteCancel = (e) => {
    e.stopPropagation();
    setPendingDelete(false);
  };

  return (
    <div className="premium-card p-5 flex flex-col justify-between h-full hover:translate-y-[-2px] transition-all duration-200 group relative">

      {/* ── Top section ──────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Avatar + name + status badge row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center font-display font-bold text-sm flex-shrink-0 select-none">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-main text-base truncate group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <p className="text-xs text-text-muted truncate">{title || 'No Title'}</p>
            </div>
          </div>
          <StatusBadge status={status} className="flex-shrink-0 mt-0.5" />
        </div>

        {/* Company + deal value */}
        <div className="pt-2 border-t border-border-base/50 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Building2 className="w-4 h-4 text-text-subtle flex-shrink-0" />
            <span className="truncate font-medium">{company}</span>
          </div>
          {value !== undefined && (
            <div className="flex items-center gap-2 text-text-main font-semibold">
              <DollarSign className="w-4 h-4 text-text-subtle flex-shrink-0" />
              <span>{formatValue(value)}</span>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-xs text-text-muted">
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-primary transition-colors duration-150 min-w-0"
              title={email}
            >
              <Mail className="w-4 h-4 text-text-subtle flex-shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          )}
          {phone ? (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-primary transition-colors duration-150"
            >
              <Phone className="w-4 h-4 text-text-subtle flex-shrink-0" />
              <span>{phone}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-text-subtle italic">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>No phone</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer actions ────────────────────────────────────────────────── */}
      <div className="mt-5 pt-3 border-t border-border-base/50 flex items-center justify-between text-xs">
        {/* Source pill */}
        <span className="text-[11px] px-2 py-0.5 rounded bg-bg-surface-hover border border-border-base text-text-muted select-none">
          {source || 'Other'}
        </span>

        {/* Action buttons — switches to inline confirm on first delete click */}
        <div className="flex items-center gap-1">
          {pendingDelete ? (
            /* Inline confirm row */
            <div className="flex items-center gap-1.5 animate-fade-in">
              <span className="text-[11px] text-danger font-semibold">Delete?</span>
              <button
                onClick={handleDeleteConfirm}
                aria-label="Confirm delete"
                className="p-1 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors duration-150"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteCancel}
                aria-label="Cancel delete"
                className="p-1 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Normal edit + delete buttons */
            <>
              <button
                onClick={handleEditClick}
                aria-label={`Edit lead ${name}`}
                className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-primary transition-colors duration-150"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteArm}
                aria-label={`Delete lead ${name}`}
                className="p-1.5 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-danger transition-colors duration-150"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
