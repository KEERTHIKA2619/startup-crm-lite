import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleLeads } from '../data/sampleLeads';

// Initialize context with null default to catch out-of-bounds uses
const LeadContext = createContext(null);

/**
 * LeadProvider Component
 * Context provider that manages the lead pipeline state with local storage persistence.
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements to wrap.
 * @returns {React.JSX.Element} Provider component wrapper.
 */
export const LeadProvider = ({ children }) => {
  // Use custom useLocalStorage hook to persist the leads array
  // LocalStorage key: 'startup-crm-leads'
  // InitialValue: sampleLeads (imported from src/data/sampleLeads.js)
  const [leads, setLeads] = useLocalStorage('startup-crm-leads', sampleLeads);

  return (
    <LeadContext.Provider value={{ leads, setLeads }}>
      {children}
    </LeadContext.Provider>
  );
};

/**
 * Custom hook to safely consume LeadContext.
 * Asserts that the consumer is inside a LeadProvider tree.
 *
 * @returns {{ leads: Array, setLeads: Function }} The leads state and its updater.
 */
export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider. Make sure to wrap your app or page component hierarchy.');
  }
  return context;
};

export default LeadContext;
