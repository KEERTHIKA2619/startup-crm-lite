import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * A controlled, debounced search input with an accessible label, magnifying glass icon, and clear button.
 */
export const SearchBar = React.memo(({ value, onChange }) => {
  // Local state for instant visual feedback while debounce timer runs
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const inputRef = useRef(null);

  // Sync local input when parent value changes externally (e.g., filter reset)
  if (value !== prevValue) {
    setLocalValue(value);
    setPrevValue(value);
  }

  // Debounce effect: waits 300ms after user stops typing before calling parent onChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full group">
      {/* Screen-reader-only accessible label linked to the input ID */}
      <label htmlFor="lead-search-input" className="sr-only">
        Search leads by name, company, or email
      </label>

      {/* Search magnifying glass icon */}
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-[#2563EB] dark:group-focus-within:text-indigo-400 transition-colors duration-200">
        <Search className="w-4 h-4" />
      </span>

      {/* Search text input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder="Search by name, company, or email..."
        id="lead-search-input"
        className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#2563EB] dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-indigo-500/20 text-sm text-slate-800 dark:text-slate-100 pl-10 pr-10 py-2.5 rounded-xl transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        autoComplete="off"
      />

      {/* Clear button — only visible when there is text */}
      {localValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] justify-center"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;
