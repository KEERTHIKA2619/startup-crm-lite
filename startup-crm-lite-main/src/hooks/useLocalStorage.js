import { useState, useCallback } from 'react';

/**
 * Custom React hook that mimics useState but persists state in window.localStorage.
 * Synchronously writes state changes to localStorage and handles unavailable
 * environments (e.g., private browsing, disabled cookies, Server-Side Rendering) or parsing errors gracefully.
 *
 * @template T
 * @param {string} key - The unique localStorage key.
 * @param {T} initialValue - The initial fallback value if no value exists in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} An array with the current state and a function to update it.
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state using a lazy initializer function to read from localStorage on first load
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      // If item exists, parse and return it; otherwise, fallback to initialValue
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  /**
   * Updates state and saves the new value to localStorage simultaneously.
   * Supports functional state updates (e.g., setValue(prev => !prev)).
   *
   * @type {React.Dispatch<React.SetStateAction<T>>}
   */
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        // Handle functional state updater
        const valueToStore = value instanceof Function ? value(prevValue) : value;

        // Persist to localStorage synchronously
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (storageError) {
            console.warn(`[useLocalStorage] localStorage is unavailable for writing key "${key}". This may be due to private browsing or quota limits:`, storageError);
          }
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Error setting value for key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}
