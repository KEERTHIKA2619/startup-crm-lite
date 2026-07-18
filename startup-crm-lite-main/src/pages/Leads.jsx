/**
 * @file Leads.jsx
 * @description Main lead management page. Integrates SearchBar, FilterBar,
 * EmptyState, LeadTable, and LeadForm inside a modal overlay to offer complete
 * CRUD capabilities with responsive list representations (table/card modes) and
 * real-time feedback using react-hot-toast notifications.
 *
 * @module pages/Leads
 */

import { useState, useMemo, useCallback } from 'react';
import { useLeads } from '../context/LeadContext';
import { Plus, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';

// Component imports
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import { getNormalizedFilterStatus } from '../constants/index';
import EmptyState from '../components/common/EmptyState';
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';

// Toast icon theme shared across handlers
const SUCCESS_ICON = { iconTheme: { primary: '#10B981', secondary: '#FFF' } };
const DANGER_ICON  = { iconTheme: { primary: '#EF4444', secondary: '#FFF' } };

/**
 * Leads Page Component
 */
export default function Leads() {
  const { leads, addLead, updateLead, deleteLead } = useLeads();

  // Page layout and interactive states
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); // stores lead object when editing

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // C7 fix: memoize filtered leads — only re-runs when leads, activeFilter, or searchQuery changes
  const filteredLeads = useMemo(() =>
    leads
      .filter((lead) => activeFilter === 'All' || getNormalizedFilterStatus(lead.status) === activeFilter)
      .filter((lead) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          lead.name.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query)
        );
      }),
  [leads, activeFilter, searchQuery]);

  // C7 fix: memoize derived totals alongside filteredLeads
  const totalValue = useMemo(
    () => filteredLeads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0),
    [filteredLeads]
  );

  // W1 fix: wrap all handlers in useCallback to stabilize references across renders

  // Handles adding or updating a lead from the LeadForm
  const handleFormSubmit = useCallback((data) => {
    if (selectedLead) {
      const targetId = selectedLead.id || selectedLead._id;
      updateLead(targetId, data);
      toast.success(`Lead for ${data.name} updated successfully!`, SUCCESS_ICON);
    } else {
      addLead(data);
      toast.success(`Lead for ${data.name} created successfully!`, SUCCESS_ICON);
    }
    setIsModalOpen(false);
    setSelectedLead(null);
  }, [selectedLead, updateLead, addLead]);

  // Handles lead deletion
  const handleDeleteLead = useCallback((id) => {
    const leadToDelete = leads.find((l) => l.id === id || l._id === id);
    const name = leadToDelete ? leadToDelete.name : 'Lead';
    deleteLead(id);
    toast.error(`${name} has been deleted.`, DANGER_ICON);
  }, [leads, deleteLead]);

  // Triggers the edit modal
  const handleEditClick = useCallback((lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

  // Resets all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('All');
  }, []);

  // Opens add-lead modal (used by EmptyState and header button)
  const handleAddLeadClick = useCallback(() => {
    setSelectedLead(null);
    setIsModalOpen(true);
  }, []);

  // Closes modal and resets selected lead
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 page-fade">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-main tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track and handle conversion stages of your startup leads in real-time.
          </p>
        </div>

        {/* Header CTA &amp; Quick stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-xs bg-bg-surface border border-border-base p-2 rounded-xl">
            <div className="flex items-center gap-1.5 px-2 border-r border-border-base text-text-muted">
              <Users className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
              <span>Pipeline: <strong className="text-text-main">{filteredLeads.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2 text-text-muted">
              <DollarSign className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
              <span>Value: <strong className="text-text-main">${totalValue.toLocaleString()}</strong></span>
            </div>
          </div>

          <button
            onClick={handleAddLeadClick}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-sm flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Search and Filters Segment */}
      <div className="p-4 rounded-2xl bg-bg-surface border border-border-base flex flex-col gap-4 shadow-sm">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          leads={leads}
        />
      </div>

      {/* Main List Area */}
      {filteredLeads.length > 0 ? (
        <LeadTable
          leads={filteredLeads}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onEdit={handleEditClick}
          onDelete={handleDeleteLead}
        />
      ) : (
        <EmptyState
          totalLeadsCount={leads.length}
          filteredLeadsCount={filteredLeads.length}
          onClearFilters={handleClearFilters}
          onAddLeadClick={handleAddLeadClick}
        />
      )}

      {/* Create/Edit Lead Modal dialog overlay */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm page-fade"
        >
          <div className="relative w-full max-w-lg bg-bg-surface border-0 sm:border border-border-base rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto max-h-full sm:max-h-[90vh] animate-slide-in-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-bg-surface-hover/20">
              <h2 className="font-display font-semibold text-lg text-text-main">
                {selectedLead ? 'Edit Lead Details' : 'Create New Lead'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text-main p-1 rounded-md hover:bg-bg-surface-hover transition-colors duration-150"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
}
