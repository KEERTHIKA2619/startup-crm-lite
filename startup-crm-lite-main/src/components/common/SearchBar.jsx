/**
 * @file SearchBar.jsx
 * @description A controlled search input component featuring a search icon and a clear button.
 * Incorporates a 300ms input debounce to prevent lag during user text entry.
 * Accessible with proper aria-labels and keyboard behaviors.
 *
 * @module components/common/SearchBar
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 *
 * @param {Object} props
 * @param {string} props.value - The active search string from the parent state
 * @param {Function} props.onChange - Handler to report debounced string changes back to parent
 */
export default function SearchBar({ value, onChange }) {
  // Local state to keep typing responsive while debouncing the parent update
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Sync local state if value prop changes externally (e.g. from a clear-filters button)
  if (value !== prevValue) {
    setLocalValue(value);
    setPrevValue(value);
  }

  // Clean up any active timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);

    // Reset previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to delay parent update by 300ms
    debounceTimerRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleClearClick = () => {
    setLocalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange('');
  };

  return (
    <div className="relative w-full">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4.5 w-4.5 text-text-subtle" aria-hidden="true" />
      </span>
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder="Search by name, company, or email..."
        aria-label="Search by name, company, or email"
        className="w-full h-11 pl-11 pr-10 rounded-xl bg-bg-base border border-border-base text-sm placeholder:text-text-subtle focus:outline-none focus:border-primary/50 text-text-main transition-colors duration-200"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="Clear search input"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-main transition-colors duration-150"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
