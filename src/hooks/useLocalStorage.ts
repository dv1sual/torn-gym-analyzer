import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Helper function to get initial state from localStorage or use defaults
  const getInitialState = (key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(() => getInitialState(key, defaultValue));

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
