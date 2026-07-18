/**
 * @file components/leads/LeadModal.jsx
 * @description Global "Add New Lead" modal triggered from the Header or BottomNav FAB.
 * Only handles lead creation (not editing — that is handled by LeadForm inside Leads.jsx).
 *
 * Fixes applied:
 *  - C1: All hooks are now called unconditionally before the early return guard.
 *  - C5: STATUS_OPTIONS / SOURCE_OPTIONS imported from constants/index.js.
 *  - W5: The external Submit button no longer duplicates onClick={handleSubmit};
 *        it is now inside the <form> as type="submit".
 *  - W9: Every <label> now has a matching htmlFor pointing to its input's id.
 */

import { useState, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import toast from 'react-hot-toast';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../constants/index';

// ─── Default form state ────────────────────────────────────────────────────────
const INITIAL_FORM = {
  name:        '',
  title:       '',
  company:     '',
  email:       '',
  phone:       '',
  value:       '',
  status:      'New',
  source:      'Website',
  initialNote: '',
};

export default function LeadModal({ isOpen, onClose }) {
  // ── Hooks always called (C1 fix) ──────────────────────────────────────────
  const { addLead } = useLeads();
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setFormData(INITIAL_FORM);
  }, [onClose]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.company.trim() || !formData.email.trim()) {
      toast.error('Please fill in Name, Company, and Email.');
      return;
    }

    const newLead = {
      name:    formData.name,
      title:   formData.title,
      company: formData.company,
      email:   formData.email,
      phone:   formData.phone,
      value:   Number(formData.value) || 0,
      status:  formData.status,
      source:  formData.source,
      notes:   formData.initialNote.trim()
        ? [{ id: `note-${Date.now()}`, text: formData.initialNote.trim(), date: new Date().toISOString() }]
        : [],
    };

    addLead(newLead);
    toast.success(`Lead for ${formData.name} created!`);
    handleClose();
  }, [formData, addLead, handleClose]);

  // ── Early return AFTER all hooks (C1 fix) ─────────────────────────────────
  if (!isOpen) return null;

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls = 'w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors';
  const selectCls = 'w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm page-fade"
    >
      <div className="relative w-full max-w-lg bg-bg-surface border-0 sm:border border-border-base rounded-none sm:rounded-xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-full sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="lead-modal-title" className="font-display font-semibold text-lg text-text-main">
              Add New Lead
            </h2>
          </div>
          <button
            id="close-modal-btn"
            aria-label="Close modal"
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-bg-surface-hover text-text-muted hover:text-text-main transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form — W5 fix: submit button is INSIDE the form so only one submit fires */}
        <form
          id="add-lead-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto flex flex-col"
          noValidate
        >
          <div className="p-6 space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Name — W9 fix: htmlFor + id */}
              <div className="space-y-1">
                <label htmlFor="modal-name" className="text-xs font-semibold text-text-muted block">
                  Contact Name <span className="text-danger">*</span>
                </label>
                <input
                  id="modal-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Connor"
                  className={inputCls}
                  required
                  aria-required="true"
                />
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label htmlFor="modal-title" className="text-xs font-semibold text-text-muted block">
                  Job Title
                </label>
                <input
                  id="modal-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. CTO"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div className="space-y-1">
                <label htmlFor="modal-company" className="text-xs font-semibold text-text-muted block">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  id="modal-company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Skynet Solutions"
                  className={inputCls}
                  required
                  aria-required="true"
                />
              </div>

              {/* Deal Value */}
              <div className="space-y-1">
                <label htmlFor="modal-value" className="text-xs font-semibold text-text-muted block">
                  Deal Value ($)
                </label>
                <input
                  id="modal-value"
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  min="0"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label htmlFor="modal-email" className="text-xs font-semibold text-text-muted block">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sarah.c@company.io"
                  className={inputCls}
                  required
                  aria-required="true"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label htmlFor="modal-phone" className="text-xs font-semibold text-text-muted block">
                  Phone Number
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status — C5 fix: from constants */}
              <div className="space-y-1">
                <label htmlFor="modal-status" className="text-xs font-semibold text-text-muted block">
                  Lead Status
                </label>
                <select
                  id="modal-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={selectCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-bg-surface text-text-main">{s}</option>
                  ))}
                </select>
              </div>

              {/* Source — C5 fix: from constants */}
              <div className="space-y-1">
                <label htmlFor="modal-source" className="text-xs font-semibold text-text-muted block">
                  Lead Source
                </label>
                <select
                  id="modal-source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={selectCls}
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-bg-surface text-text-main">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Initial Note */}
            <div className="space-y-1">
              <label htmlFor="modal-note" className="text-xs font-semibold text-text-muted block">
                Initial Note / Details
              </label>
              <textarea
                id="modal-note"
                name="initialNote"
                value={formData.initialNote}
                onChange={handleChange}
                rows={3}
                placeholder="Add key insights, timeline, or meeting notes..."
                className="w-full p-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer — W5 fix: type="submit" inside form, no onClick needed */}
          <div className="px-6 py-4 border-t border-border-base flex items-center justify-end gap-3 bg-bg-surface-hover/30 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="h-10 px-4 rounded-lg border border-border-base hover:bg-bg-surface-hover text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01]"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
