import { useState, useEffect, useCallback } from 'react';

/**
 * Checks if localStorage is supported and accessible in the current browser session.
 * This is crucial to handle edge cases like private/incognito browsing or disabled cookies/storage.
 *
 * @returns {boolean} True if localStorage is available, false otherwise.
 */
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test_key__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    // Throws a SecurityError if storage is blocked/disabled
    return false;
  }
};

/**
 * Custom React hook for synchronizing state with window.localStorage.
 * Works seamlessly with any JSON-serializable data type: arrays, objects, strings, numbers, booleans.
 *
 * Key behaviors:
 * 1. Safe detection of storage availability (e.g. private browsing).
 * 2. On first load, reads and parses existing storage values. Falls back to initialValue if not found or on JSON parse error.
 * 3. Returns the identical API signature to useState: [storedValue, setValue].
 * 4. Updates state and updates localStorage simultaneously.
 * 5. Supports functional updates: setValue((prev) => nextValue).
 *
 * @template T
 * @param {string} key - The localStorage key name under which the data is saved.
 * @param {T | (() => T)} initialValue - The initial value or initializer function to fall back to.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A stateful value and a function to update it.
 */
export function useLocalStorage(key, initialValue) {
  // Resolve the initial state value (handling cases where initialValue is a function)
  const getInitialValue = () => {
    const fallback = typeof initialValue === 'function' ? (initialValue)() : initialValue;

    if (!isLocalStorageAvailable()) {
      return fallback;
    }

    try {
      const storedItem = window.localStorage.getItem(key);
      if (storedItem !== null) {
        return JSON.parse(storedItem);
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Gracefully caught JSON parse error for key "${key}":`, error);
      // Handles JSON parse errors gracefully by returning initialValue on error
      return fallback;
    }

    return fallback;
  };

  const [storedValue, setStoredValue] = useState(getInitialValue);

  // Return a stable setter function that updates state and storage simultaneously
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        // Support functional state updates (identical to useState)
        const valueToStore = value instanceof Function ? value(prevValue) : value;

        // Persist to localStorage if it's available
        if (isLocalStorageAvailable()) {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (writeError) {
            console.error(`[useLocalStorage] Failed to save key "${key}" to localStorage:`, writeError);
          }
        }

        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Failed to set state for key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
