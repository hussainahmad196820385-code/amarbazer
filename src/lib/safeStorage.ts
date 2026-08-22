// Safe storage wrapper to prevent crashes in private browsing / restricted webviews
const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Fallback to memory store
    }
    return memoryStore[key] || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Fallback to memory store
    }
    memoryStore[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Fallback
    }
    delete memoryStore[key];
  },

  getJSON: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = safeStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch (e) {
      console.warn(`Error parsing JSON from storage for key ${key}:`, e);
    }
    return defaultValue;
  }
};
