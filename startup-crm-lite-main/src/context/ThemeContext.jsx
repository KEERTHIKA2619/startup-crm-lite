/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ThemeContext = createContext(null);

/**
 * ThemeProvider component that manages the application's light and dark mode states.
 * Toggles a 'dark' class on document.documentElement for global CSS styling selectors.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child elements to wrap.
 * @returns {JSX.Element} The Theme Context Provider.
 */
export function ThemeProvider({ children }) {
  // Initialize theme state using custom useLocalStorage hook
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Sync state changes with document element class list
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error synchronizing theme classes:', error);
    }
  }, [isDarkMode]);

  /**
   * Toggles the theme state between active dark mode and light mode.
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom React hook to consume the ThemeContext.
 *
 * @returns {Object} Context object containing isDarkMode (boolean) and toggleTheme function.
 * @throws {Error} If consumed outside of a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
