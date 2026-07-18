/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import leadService from '../services/leadService';

export const LeadContext = createContext(null);

// Success and danger styling for toast notifications
const SUCCESS_ICON = { iconTheme: { primary: '#22C55E', secondary: '#FFF' } };
const DANGER_ICON  = { iconTheme: { primary: '#EF4444', secondary: '#FFF' } };

/**
 * LeadProvider component that manages global leads state and provides API-driven CRUD functionality.
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  // Global LeadDrawer UI State
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openLeadDrawer = useCallback((id) => {
    setActiveLeadId(id);
    setIsDrawerOpen(true);
  }, []);

  const closeLeadDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setActiveLeadId(null);
  }, []);

  /**
   * Fetches the user's leads from the API.
   * 
   * @param {Object} [params] - Query parameter filters (status, search, page, etc.).
   */
  const fetchLeads = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const res = await leadService.getLeads(params);
      if (res && res.success) {
        setLeads(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to fetch leads from server';
      toast.error(errMsg, DANGER_ICON);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leads automatically on mount if a JWT token exists
  useEffect(() => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      fetchLeads();
    }
  }, [fetchLeads]);

  /**
   * Adds a new lead to the CRM by calling the API.
   * 
   * @param {Object} leadData - The lead details.
   */
  const addLead = useCallback(async (leadData) => {
    setIsLoading(true);
    try {
      const res = await leadService.createLead(leadData);
      if (res && res.success && res.data) {
        setLeads((prev) => [res.data, ...prev]);
        toast.success(`Lead for ${res.data.name} created successfully!`, SUCCESS_ICON);
        return res.data;
      } else {
        throw new Error(res?.message || 'Failed to create lead');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to create lead';
      toast.error(errMsg, DANGER_ICON);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Updates fields of an existing lead via the API.
   * 
   * @param {string} id - The ID of the lead to update.
   * @param {Object} updatedFields - The field edits to merge.
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const res = await leadService.updateLead(id, updatedFields);
      if (res && res.success && res.data) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id || lead._id === id ? res.data : lead))
        );
        toast.success(`Lead for ${res.data.name} updated successfully!`, SUCCESS_ICON);
        return res.data;
      } else {
        throw new Error(res?.message || 'Failed to update lead');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update lead';
      toast.error(errMsg, DANGER_ICON);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deletes a lead by ID via the API.
   * 
   * @param {string} id - The unique lead ID.
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await leadService.deleteLead(id);
      if (res && res.message) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id && lead._id !== id));
        toast.success(res.message || 'Lead deleted successfully!', SUCCESS_ICON);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete lead';
      toast.error(errMsg, DANGER_ICON);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retrieves a lead from local state by ID.
   * 
   * @param {string} id - The unique lead ID.
   * @returns {Object|undefined} The lead object or undefined if not found.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id || lead._id === id);
  }, [leads]);

  // Activity timeline notes placeholder functionality matching frontend expectation
  const addNote = useCallback((leadId, noteText) => {
    // Note updates can run on top of lead updates
    const lead = getLeadById(leadId);
    if (!lead || !noteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      date: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...(lead.notes || [])];
    updateLead(leadId, { notes: updatedNotes });
  }, [getLeadById, updateLead]);

  const deleteNote = useCallback((leadId, noteId) => {
    const lead = getLeadById(leadId);
    if (!lead) return;

    const updatedNotes = (lead.notes || []).filter((note) => note.id !== noteId);
    updateLead(leadId, { notes: updatedNotes });
  }, [getLeadById, updateLead]);

  const contextValue = useMemo(() => ({
    leads,
    isLoading,
    pagination,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    addNote,
    deleteNote,
    activeLeadId,
    isDrawerOpen,
    openLeadDrawer,
    closeLeadDrawer
  }), [
    leads,
    isLoading,
    pagination,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    addNote,
    deleteNote,
    activeLeadId,
    isDrawerOpen,
    openLeadDrawer,
    closeLeadDrawer
  ]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to consume the LeadContext.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
