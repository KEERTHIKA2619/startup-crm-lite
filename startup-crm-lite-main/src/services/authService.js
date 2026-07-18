import api from './api';

/**
 * Authentication service handling API requests for user signup, login, and profile administration.
 */
export const authService = {
  /**
   * Registers a new user account.
   * 
   * @param {string} name - User's full name.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @returns {Promise<Object>} API response data containing the new user and JWT token.
   */
  async register(name, email, password) {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Logins into an existing user account.
   * 
   * @param {string} email - Registered email address.
   * @param {string} password - User password.
   * @returns {Promise<Object>} API response data containing the user profile and JWT token.
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Logouts the user on the client-side by clearing the storage token.
   */
  logout() {
    localStorage.removeItem('crm-token');
  },

  /**
   * Fetches the currently authenticated user's profile info.
   * 
   * @returns {Promise<Object>} API response data containing the user profile.
   */
  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  /**
   * Updates profile information (e.g. name or password).
   * 
   * @param {Object} data - Update fields (name, oldPassword, newPassword).
   * @returns {Promise<Object>} API response data containing the updated user.
   */
  async updateProfile(data) {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  }
};

export default authService;
