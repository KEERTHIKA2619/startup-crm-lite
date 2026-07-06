import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle Component
 * A stylish animated toggle switch with Sun (light) and Moon (dark) icons.
 * Reads and updates theme state via ThemeContext.
 *
 * @returns {React.JSX.Element} The rendered toggle switch
 */
const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-16 h-8 rounded-full border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sliding knob */}
      <span
        className={`absolute top-0.5 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-in-out ${
          isDarkMode
            ? 'translate-x-[calc(100%+0.125rem)] bg-slate-800 border border-slate-600'
            : 'translate-x-0.5 bg-white border border-slate-200'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400 transition-transform duration-300" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300" />
        )}
      </span>

      {/* Background icons — faded, decorative */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2">
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${isDarkMode ? 'opacity-30 text-slate-500' : 'opacity-0'}`} />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${isDarkMode ? 'opacity-0' : 'opacity-30 text-slate-400'}`} />
      </span>
    </button>
  );
};

export default DarkModeToggle;
