/**
 * @file LeadForm.jsx
 * @description A dual-purpose form for both creating new leads and editing existing ones.
 * Features inline validation error alerts for required fields (Name, Company, Email)
 * and conforms to status and source option guidelines.
 *
 * @module components/leads/LeadForm
 */

import { useState } from 'react';

// Status and source options as requested
const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/**
 * LeadForm Component
 *
 * @param {Object} props
 * @param {Object} [props.initialData] - Existing lead object (if in edit mode)
 * @param {Function} props.onSubmit - Callback function when form validates and submits
 * @param {Function} props.onCancel - Callback function when cancel button is clicked
 */
export default function LeadForm({ initialData = null, onSubmit, onCancel }) {
  const isEditMode = !!initialData;

  // Local state for form values
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    title: initialData?.title || '',
    value: initialData?.value !== undefined ? initialData.value : '',
    status: initialData?.status || 'New',
    source: initialData?.source || 'Website',
  });
  // Local state for inline validation errors
  const [errors, setErrors] = useState({ name: '', company: '', email: '' });
  // Track previous initialData to sync when it changes (e.g. switching edit targets)
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Inline derived-state sync: avoids setState-in-effect lint error
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        title: initialData.title || '',
        value: initialData.value !== undefined ? initialData.value : '',
        status: initialData.status || 'New',
        source: initialData.source || 'Website',
      });
    }
  }

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form submit handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: !formData.name.trim() ? 'Name is required' : '',
      company: !formData.company.trim() ? 'Company is required' : '',
      email: !formData.email.trim()
        ? 'Email is required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ? 'Please enter a valid email address'
        : ''
    };

    setErrors(newErrors);

    // If any errors exist, halt submission
    if (newErrors.name || newErrors.company || newErrors.email) {
      return;
    }

    // Pass data back to parent handler, ensuring numeric value
    onSubmit({
      ...formData,
      value: formData.value === '' ? 0 : Number(formData.value)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Input */}
        <div className="space-y-1">
          <label htmlFor="lead-name" className="text-xs font-semibold text-text-muted block">
            Name <span className="text-danger">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`w-full h-10 px-3 rounded-lg bg-bg-base border ${
              errors.name ? 'border-danger focus:border-danger' : 'border-border-base focus:border-primary/50'
            } text-sm text-text-main placeholder:text-text-subtle focus:outline-none transition-colors duration-250`}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-danger font-medium mt-1 animate-slide-in-right">
              {errors.name}
            </p>
          )}
        </div>

        {/* Company Input */}
        <div className="space-y-1">
          <label htmlFor="lead-company" className="text-xs font-semibold text-text-muted block">
            Company <span className="text-danger">*</span>
          </label>
          <input
            id="lead-company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Acme Corp"
            aria-required="true"
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? "company-error" : undefined}
            className={`w-full h-10 px-3 rounded-lg bg-bg-base border ${
              errors.company ? 'border-danger focus:border-danger' : 'border-border-base focus:border-primary/50'
            } text-sm text-text-main placeholder:text-text-subtle focus:outline-none transition-colors duration-250`}
          />
          {errors.company && (
            <p id="company-error" className="text-xs text-danger font-medium mt-1 animate-slide-in-right">
              {errors.company}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Input */}
        <div className="space-y-1">
          <label htmlFor="lead-email" className="text-xs font-semibold text-text-muted block">
            Email <span className="text-danger">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@acme.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`w-full h-10 px-3 rounded-lg bg-bg-base border ${
              errors.email ? 'border-danger focus:border-danger' : 'border-border-base focus:border-primary/50'
            } text-sm text-text-main placeholder:text-text-subtle focus:outline-none transition-colors duration-250`}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-danger font-medium mt-1 animate-slide-in-right">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-1">
          <label htmlFor="lead-phone" className="text-xs font-semibold text-text-muted block">
            Phone
          </label>
          <input
            id="lead-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1 (555) 019-9922"
            className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors duration-250"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title Input */}
        <div className="space-y-1">
          <label htmlFor="lead-title" className="text-xs font-semibold text-text-muted block">
            Job Title
          </label>
          <input
            id="lead-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. VP of Product"
            className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors duration-250"
          />
        </div>

        {/* Deal Value Input */}
        <div className="space-y-1">
          <label htmlFor="lead-value" className="text-xs font-semibold text-text-muted block">
            Deal Value ($)
          </label>
          <input
            id="lead-value"
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="e.g. 15000"
            min="0"
            className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary/50 transition-colors duration-250"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Dropdown */}
        <div className="space-y-1">
          <label htmlFor="lead-status" className="text-xs font-semibold text-text-muted block">
            Status
          </label>
          <div className="relative">
            <select
              id="lead-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors duration-250 appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-bg-surface text-text-main">
                  {status}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Source Dropdown */}
        <div className="space-y-1">
          <label htmlFor="lead-source" className="text-xs font-semibold text-text-muted block">
            Source
          </label>
          <div className="relative">
            <select
              id="lead-source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg bg-bg-base border border-border-base text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors duration-250 appearance-none cursor-pointer"
            >
              {SOURCE_OPTIONS.map((source) => (
                <option key={source} value={source} className="bg-bg-surface text-text-main">
                  {source}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-lg border border-border-base hover:bg-bg-surface-hover text-sm font-medium text-text-muted hover:text-text-main transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01]"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
