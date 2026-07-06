import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Create Theme Context with null initial state
const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Manages the color scheme (dark mode vs light mode) with local storage persistence.
 *
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements to wrap.
 * @returns {React.JSX.Element} Provider component wrapper.
 */
export const ThemeProvider = ({ children }) => {
  // Use custom useLocalStorage hook to persist theme preference
  // LocalStorage key: 'startup-crm-theme'
  // Default: false (light mode)
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Synchronize CSS class with HTML document root for Tailwind theme support
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Toggles between dark mode and light mode
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to safely consume ThemeContext.
 * Asserts that the consumer is inside a ThemeProvider tree.
 *
 * @returns {{ isDarkMode: boolean, setIsDarkMode: Function, toggleTheme: Function }} The theme state and utilities.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider. Make sure to wrap your app or page component hierarchy.');
  }
  return context;
};

export default ThemeContext;
