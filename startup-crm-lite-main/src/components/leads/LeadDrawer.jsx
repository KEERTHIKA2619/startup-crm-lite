/**
 * @file components/leads/LeadDrawer.jsx
 * @description Slide-out panel for viewing and editing a lead's full details,
 * including contact info, deal attributes, and an activity notes timeline.
 *
 * Fixes applied:
 *  - C2: Replaced window.confirm() with an inline two-step delete confirm UI.
 *  - C3: Consolidated 8 individual useState calls into one formData object.
 *  - C4: STATUS_OPTIONS / SOURCE_OPTIONS imported from constants/index.js.
 *  - W8: All <label> elements now have htmlFor paired with input id attributes.
 */

import { useState, useCallback } from 'react';
import {
  X, Trash2, Calendar, MessageSquare,
  Plus, DollarSign, Building2, User,
  Mail, Phone, Tag, Globe, Sparkles, AlertTriangle, Check,
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import toast from 'react-hot-toast';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../constants/index';
import { formatDate } from '../../utils/formatters';

// ─── Initial form state ────────────────────────────────────────────────────────
const buildFormData = (lead) => ({
  name:    lead?.name    || '',
  title:   lead?.title   || '',
  company: lead?.company || '',
  email:   lead?.email   || '',
  phone:   lead?.phone   || '',
  value:   lead?.value   !== undefined ? lead.value : '',
  status:  lead?.status  || 'New',
  source:  lead?.source  || 'Website',
});

// ─── Status color helper ───────────────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case 'Won':              return 'bg-success/10 text-success border-success/20';
    case 'Lost':             return 'bg-danger/10 text-danger border-danger/20';
    case 'Proposal Sent':
    case 'Proposal':
    case 'Negotiation':      return 'bg-primary/10 text-primary border-primary/20';
    case 'Contacted':
    case 'Qualified':
    case 'Meeting Scheduled':return 'bg-warning/10 text-warning border-warning/20';
    default:                 return 'bg-bg-surface-hover text-text-muted border-border-base';
  }
};

export default function LeadDrawer({ leadId, isOpen, onClose }) {
  const { leads, updateLead, deleteLead, addNote, deleteNote } = useLeads();
  const lead = leads.find((l) => l.id === leadId || l._id === leadId);

  // ── C3 fix: one formData object instead of 8 useState calls ─────────────
  const [formData, setFormData] = useState(() => buildFormData(lead));
  const [newNoteText, setNewNoteText] = useState('');
  // ── C2 fix: inline delete confirm state instead of window.confirm() ──────
  const [pendingDelete, setPendingDelete] = useState(false);
  // Track the previous leadId to detect when the viewed lead changes
  const [prevLeadId, setPrevLeadId] = useState(leadId);

  // Sync form inline (during render) when the viewed lead changes
  if (leadId !== prevLeadId) {
    setPrevLeadId(leadId);
    if (lead) {
      setFormData(buildFormData(lead));
      setPendingDelete(false);
    }
  }

  const targetId = lead ? (lead.id || lead._id) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleUpdate = useCallback((e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim() || !formData.email.trim()) {
      toast.error('Name, Company, and Email cannot be empty.');
      return;
    }
    if (!targetId) return;
    updateLead(targetId, {
      ...formData,
      value: Number(formData.value) || 0,
    });
    toast.success('Lead updated successfully!');
  }, [formData, targetId, updateLead]);

  // C2 fix: two-step confirm instead of window.confirm()
  const handleDeleteConfirm = useCallback(() => {
    if (!targetId) return;
    deleteLead(targetId);
    toast.success('Lead deleted.');
    onClose();
  }, [targetId, deleteLead, onClose]);

  const handleAddNote = useCallback((e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !targetId) return;
    addNote(targetId, newNoteText);
    setNewNoteText('');
    toast.success('Note added.');
  }, [newNoteText, targetId, addNote]);

  const handleDeleteNote = useCallback((noteId) => {
    if (!targetId) return;
    deleteNote(targetId, noteId);
    toast.success('Note removed.');
  }, [targetId, deleteNote]);

  if (!isOpen || !lead) return null;

  // Shared field class
  const fieldCls = 'w-full h-9 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors';
  const labelCls = 'text-[11px] font-semibold text-text-muted flex items-center gap-1 mb-1';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm page-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg md:max-w-xl bg-bg-surface border-l border-border-base shadow-2xl flex flex-col h-full animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base flex-shrink-0">
          <div>
            <h2 id="drawer-title" className="font-display font-semibold text-text-main">
              Lead Details
            </h2>
            <p className="text-xs text-text-subtle">ID: {lead.id || lead._id}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* C2 fix: two-step inline delete instead of window.confirm() */}
            {pendingDelete ? (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <span className="text-xs text-danger font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Delete?
                </span>
                <button
                  onClick={handleDeleteConfirm}
                  aria-label="Confirm lead deletion"
                  className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPendingDelete(false)}
                  aria-label="Cancel deletion"
                  className="p-1.5 rounded-lg hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPendingDelete(true)}
                aria-label={`Delete lead ${lead.name}`}
                className="p-2 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-drawer-btn"
              aria-label="Close details panel"
              onClick={onClose}
              className="p-2 rounded-lg text-text-subtle hover:text-text-main hover:bg-bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Main Info Summary */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-base border border-border-base">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-lg select-none">
              {formData.name.split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-base text-text-main truncate">
                {formData.name}
              </h3>
              <p className="text-xs text-text-muted">
                {formData.title} at <span className="font-medium">{formData.company}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-border-base bg-bg-surface text-text-muted flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" aria-hidden="true" />
                  {formData.source}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-semibold text-text-subtle block uppercase">Deal Value</span>
              <span className="font-display font-bold text-lg text-text-main">
                ${Number(formData.value).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Edit Form — C3 + W8 fixes */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <h4 className="text-xs font-bold text-text-subtle uppercase tracking-wider">
              Modify Attributes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name — W8 fix: id + htmlFor */}
              <div>
                <label htmlFor="drawer-name" className={labelCls}>
                  <User className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Name
                </label>
                <input
                  id="drawer-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  className={fieldCls}
                />
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="drawer-title" className={labelCls}>
                  <Sparkles className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Job Title
                </label>
                <input
                  id="drawer-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFieldChange}
                  className={fieldCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label htmlFor="drawer-company" className={labelCls}>
                  <Building2 className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Company
                </label>
                <input
                  id="drawer-company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleFieldChange}
                  className={fieldCls}
                />
              </div>

              {/* Deal Value */}
              <div>
                <label htmlFor="drawer-value" className={labelCls}>
                  <DollarSign className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Value ($)
                </label>
                <input
                  id="drawer-value"
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleFieldChange}
                  min="0"
                  className={fieldCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="drawer-email" className={labelCls}>
                  <Mail className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Email
                </label>
                <input
                  id="drawer-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  className={fieldCls}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="drawer-phone" className={labelCls}>
                  <Phone className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Phone
                </label>
                <input
                  id="drawer-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFieldChange}
                  className={fieldCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status — C4 fix: from constants */}
              <div>
                <label htmlFor="drawer-status" className={labelCls}>
                  <Tag className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Status
                </label>
                <select
                  id="drawer-status"
                  name="status"
                  value={formData.status}
                  onChange={handleFieldChange}
                  className={fieldCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-bg-surface text-text-main">{s}</option>
                  ))}
                </select>
              </div>

              {/* Source — C4 fix: from constants */}
              <div>
                <label htmlFor="drawer-source" className={labelCls}>
                  <Globe className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                  Source
                </label>
                <select
                  id="drawer-source"
                  name="source"
                  value={formData.source}
                  onChange={handleFieldChange}
                  className={fieldCls}
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-bg-surface text-text-main">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 text-sm font-semibold transition-colors"
              >
                Save Updates
              </button>
            </div>
          </form>

          {/* Notes Section */}
          <div className="space-y-4 pt-4 border-t border-border-base">
            <h4 className="text-xs font-bold text-text-subtle uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Notes &amp; Activity ({lead.notes?.length || 0})</span>
            </h4>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <label htmlFor="drawer-new-note" className="sr-only">
                New note text
              </label>
              <input
                id="drawer-new-note"
                type="text"
                placeholder="Add a new update or note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="submit"
                aria-label="Add note"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-white shadow-sm shadow-primary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-lg border border-border-base bg-bg-surface-hover/30 relative group"
                  >
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Delete note"
                      className="absolute top-3.5 right-3.5 p-1 rounded-md text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-sm text-text-main pr-6 leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-text-subtle">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{formatDate(note.date)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-text-subtle text-xs border border-dashed border-border-base rounded-lg">
                  No notes recorded for this lead yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
