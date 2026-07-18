import api from './api';

/**
 * Lead service handling API requests for lead management operations and pipeline analytics.
 */
export const leadService = {
  /**
   * Retrieves a paginated, filtered list of leads.
   * 
   * @param {Object} [params] - Query parameters (status, search, page, limit, sortBy, sortOrder).
   * @returns {Promise<Object>} API response data containing leads list and pagination info.
   */
  async getLeads(params = {}) {
    const response = await api.get('/api/leads', { params });
    return response.data;
  },

  /**
   * Creates a new lead.
   * 
   * @param {Object} leadData - Lead details to create.
   * @returns {Promise<Object>} API response data containing the created lead.
   */
  async createLead(leadData) {
    const response = await api.post('/api/leads', leadData);
    return response.data;
  },

  /**
   * Updates an existing lead's general information.
   * 
   * @param {string} id - Lead MongoDB ObjectId.
   * @param {Object} leadData - Fields to update.
   * @returns {Promise<Object>} API response data containing the updated lead.
   */
  async updateLead(id, leadData) {
    const response = await api.put(`/api/leads/${id}`, leadData);
    return response.data;
  },

  /**
   * Updates only the status of an existing lead.
   * 
   * @param {string} id - Lead MongoDB ObjectId.
   * @param {string} status - New pipeline status stage.
   * @returns {Promise<Object>} API response data containing the updated lead.
   */
  async updateLeadStatus(id, status) {
    const response = await api.patch(`/api/leads/${id}/status`, { status });
    return response.data;
  },

  /**
   * Deletes a lead.
   * 
   * @param {string} id - Lead MongoDB ObjectId.
   * @returns {Promise<Object>} API response data containing a success message.
   */
  async deleteLead(id) {
    const response = await api.delete(`/api/leads/${id}`);
    return response.data;
  },

  /**
   * Retrieves dashboard lead pipeline stats summary.
   * 
   * @returns {Promise<Object>} API response data containing KPI status metrics.
   */
  async getLeadStats() {
    const response = await api.get('/api/leads/stats/summary');
    return response.data;
  },

  /**
   * Retrieves monthly lead creation and won counts history for the last 6 months.
   * 
   * @returns {Promise<Object>} API response data containing chronological stats.
   */
  async getMonthlyStats() {
    const response = await api.get('/api/leads/stats/monthly');
    return response.data;
  }
};

export default leadService;
