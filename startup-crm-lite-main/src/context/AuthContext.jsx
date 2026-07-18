import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the React app and manages the authentication states (user, token, loading).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restores user session on mount if crm-token is found in localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('crm-token');
      if (savedToken) {
        try {
          const res = await authService.getProfile();
          // Profile endpoint returns user document inside res.data
          if (res && res.success && res.data) {
            setUser(res.data);
            setToken(savedToken);
          } else {
            // Token is invalid/expired
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('[AuthContext] Session restoration failed:', error);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res && res.success && res.data) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('crm-token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return res;
      } else {
        throw new Error(res?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registration handler
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password);
      if (res && res.success && res.data) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('crm-token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return res;
      } else {
        throw new Error(res?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }), [user, token, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom React hook to consume AuthContext properties and functions.
 * 
 * @returns {Object} Authentication context values.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
