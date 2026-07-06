import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Mail, Phone, Tag, Globe, IndianRupee } from 'lucide-react';
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../constants';

/**
 * LeadForm Component
 * Renders a validated form for creating new leads or editing existing ones.
 * Connects to centralized options constants.
 */
export const LeadForm = React.memo(({ initialData, onSubmit, onCancel }) => {
  // Form state initialized with defaults or edit data
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    source: 'Website',
    value: '',
    owner: 'Sarah',
  });

  // Validation error messages keyed by field name
  const [errors, setErrors] = useState({});

  // Track which fields have been touched
  const [touched, setTouched] = useState({});

  // Auto-focus the name field on mount
  const nameInputRef = useRef(null);

  // Populate form with initialData when entering edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        status: initialData.status || 'New',
        source: initialData.source || 'Website',
        value: initialData.value !== undefined ? initialData.value : '',
        owner: initialData.owner || 'Sarah',
      });
      setTouched({ name: true, company: true, email: true });
    }
  }, [initialData]);

  // Focus the name input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    switch (fieldName) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'company':
        if (!value.trim()) error = 'Company is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    setTouched({ name: true, company: true, email: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        value: formData.value !== '' ? Number(formData.value) : 0,
      });
    }
  };

  const handleCancelClick = () => {
    onCancel();
  };

  const isEditMode = !!initialData;

  const getInputClasses = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full bg-slate-50/80 dark:bg-slate-800/80 border ${
      hasError
        ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-[#2563EB]/30 focus:border-[#2563EB]'
    } focus:outline-none focus:ring-2 text-sm text-slate-800 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500`;
  };

  const getSelectClasses = () =>
    'w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 text-sm text-slate-800 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200 appearance-none cursor-pointer';

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Name Input */}
      <div>
        <label
          htmlFor="lead-form-name"
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          Contact Name <span className="text-[#EF4444]">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </span>
          <input
            ref={nameInputRef}
            type="text"
            id="lead-form-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Sarah Connor"
            className={getInputClasses('name')}
            aria-required="true"
            aria-invalid={!!(touched.name && errors.name)}
            aria-describedby={errors.name ? 'lead-name-error' : undefined}
            autoComplete="name"
          />
        </div>
        {touched.name && errors.name && (
          <p id="lead-name-error" className="text-xs text-[#EF4444] font-semibold mt-1.5 flex items-center gap-1" role="alert">
            <span className="w-1 h-1 rounded-full bg-[#EF4444] shrink-0" aria-hidden="true" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Company Input */}
      <div>
        <label
          htmlFor="lead-form-company"
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          Company Name <span className="text-[#EF4444]">*</span>
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-4 h-4" />
          </span>
          <input
            type="text"
            id="lead-form-company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Cyberdyne Systems"
            className={getInputClasses('company')}
            aria-required="true"
            aria-invalid={!!(touched.company && errors.company)}
            aria-describedby={errors.company ? 'lead-company-error' : undefined}
            autoComplete="organization"
          />
        </div>
        {touched.company && errors.company && (
          <p id="lead-company-error" className="text-xs text-[#EF4444] font-semibold mt-1.5 flex items-center gap-1" role="alert">
            <span className="w-1 h-1 rounded-full bg-[#EF4444] shrink-0" aria-hidden="true" />
            {errors.company}
          </p>
        )}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label
            htmlFor="lead-form-email"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Email Address <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              id="lead-form-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="s.connor@cyberdyne.com"
              className={getInputClasses('email')}
              aria-required="true"
              aria-invalid={!!(touched.email && errors.email)}
              aria-describedby={errors.email ? 'lead-email-error' : undefined}
              autoComplete="email"
            />
          </div>
          {touched.email && errors.email && (
            <p id="lead-email-error" className="text-xs text-[#EF4444] font-semibold mt-1.5 flex items-center gap-1" role="alert">
              <span className="w-1 h-1 rounded-full bg-[#EF4444] shrink-0" aria-hidden="true" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="lead-form-phone"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="tel"
              id="lead-form-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 901-2029"
              className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 text-sm text-slate-800 pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200 placeholder:text-slate-400"
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      {/* Status & Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label
            htmlFor="lead-form-status"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Lead Status
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-4 h-4" />
            </span>
            <select
              id="lead-form-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={getSelectClasses()}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Source */}
        <div>
          <label
            htmlFor="lead-form-source"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Lead Source
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </span>
            <select
              id="lead-form-source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={getSelectClasses()}
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Deal Value & Sales Owner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Deal Value */}
        <div>
          <label
            htmlFor="lead-form-value"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Deal Value (₹)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IndianRupee className="w-4 h-4" />
            </span>
            <input
              type="number"
              id="lead-form-value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className={getInputClasses('value')}
              min="0"
            />
          </div>
        </div>

        {/* Sales Owner */}
        <div>
          <label
            htmlFor="lead-form-owner"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Sales Owner
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <select
              id="lead-form-owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className={getSelectClasses()}
            >
              {['Sarah', 'Alex', 'David'].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Form Action Buttons - py-3 represents 44px+ height touch target */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-6">
        <button
          type="button"
          onClick={handleCancelClick}
          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-650 text-slate-655 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 cursor-pointer min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-sm hover:shadow-md shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer min-h-[44px]"
        >
          {isEditMode ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
});

LeadForm.displayName = 'LeadForm';
export default LeadForm;
