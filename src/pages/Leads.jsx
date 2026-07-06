import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X, Users, TrendingUp, Trophy, AlertTriangle } from 'lucide-react';
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import { useLeads } from '../context/LeadContext';

/**
 * Leads Page Component
 * Manages the lead pipeline workspace.
 */
export const Leads = () => {
  const { leads, setLeads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // Holds lead object when editing

  // Filter leads based on active filter and query
  const filteredLeads = leads
    .filter((lead) => activeFilter === 'All' || lead.status === activeFilter)
    .filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate pipeline statistics
  const stats = {
    total: filteredLeads.length,
    active: filteredLeads.filter((l) => !['Won', 'Lost'].includes(l.status)).length,
    won: filteredLeads.filter((l) => l.status === 'Won').length,
    lost: filteredLeads.filter((l) => l.status === 'Lost').length,
  };

  // Close modal callback - wrapped in useCallback
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  // Modal Open Handlers - wrapped in useCallback
  const handleOpenAddModal = useCallback(() => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handleCloseModal]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Form submission callback - wrapped in useCallback
  const handleFormSubmit = useCallback((formData) => {
    if (selectedLead) {
      // EDIT MODE
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, ...formData } : l))
      );
      toast.success(`Updated lead: ${formData.name}`, {
        icon: '📝',
        style: {
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          fontWeight: '600',
          fontSize: '14px',
        },
        duration: 3000,
      });
    } else {
      // CREATE MODE
      const newLead = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        dateAdded: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success(`New lead added: ${formData.name}`, {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          fontWeight: '600',
          fontSize: '14px',
        },
        duration: 3000,
      });
    }
    handleCloseModal();
  }, [selectedLead, setLeads, handleCloseModal]);

  // Delete callback - wrapped in useCallback
  const handleDeleteLead = useCallback((lead) => {
    if (window.confirm(`Are you sure you want to remove "${lead.name}" from the pipeline?`)) {
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      toast.error(`Removed: ${lead.name}`, {
        icon: '🗑️',
        style: {
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#EF4444',
          border: '1px solid #FECACA',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)',
          fontWeight: '600',
          fontSize: '14px',
        },
        duration: 3000,
      });
    }
  }, [setLeads]);

  // Clear filters callback - wrapped in useCallback
  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('All');
  }, []);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            maxWidth: '400px',
          },
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Lead Pipeline
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage, nurture, and track your sales opportunities in one place.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          id="create-lead-btn"
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 text-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer min-w-[44px] min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Lead</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2563EB] dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">pipeline leads</span>
        </div>

        {/* Active Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">in progress</span>
        </div>

        {/* Won Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Won</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#22C55E] dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#16A34A] dark:text-[#22C55E]">{stats.won}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">converted</span>
        </div>

        {/* Lost Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lost</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] dark:text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#EF4444] dark:text-red-400">{stats.lost}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">dropped off</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          leads={leads}
        />

        {/* Active filters details */}
        {(searchQuery || activeFilter !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Results:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold text-[#2563EB] dark:text-indigo-400">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
            </span>

            <button
              onClick={handleClearAllFilters}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] justify-center"
              aria-label="Clear all filters"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Leads Table/Cards */}
      {filteredLeads.length > 0 ? (
        <LeadTable
          leads={filteredLeads}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteLead}
        />
      ) : (
        <EmptyState
          totalLeads={leads.length}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          onClearFilters={handleClearAllFilters}
        />
      )}

      {/* CRUD Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center md:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          {/* Modal Container: full-screen on mobile, centered max-w-lg on tablet+ */}
          <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg bg-white dark:bg-slate-900 border-0 md:border md:border-slate-200 dark:md:border-slate-800 rounded-none md:rounded-3xl p-6 shadow-2xl z-10 overflow-y-auto flex flex-col justify-between md:block">
            
            {/* top line indicator */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-none md:rounded-t-3xl" aria-hidden="true" />

            <div>
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 pt-2">
                <div>
                  <h3
                    id="lead-modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-slate-100"
                  >
                    {selectedLead ? 'Edit Lead Profile' : 'Register New Lead'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedLead
                      ? 'Modify the details for this pipeline opportunity.'
                      : 'Fill in the information to add a new lead to the workspace.'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Component */}
              <LeadForm
                initialData={selectedLead}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
