import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/types'; // Assuming User type is defined in lib/types

// Define the shape of your settings state
interface SettingsState {
  currentUser: User | null;
  accessToken: string | null;
  memosPath: string; // Path to the user's memos instance, e.g., https://memos.example.com
  filterList: string[]; // For filtering memos, e.g., by tags or keywords
  theme: 'light' | 'dark' | 'system';
  // Add other settings as needed
}

// Define actions to update the state
interface SettingsActions {
  setCurrentUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setMemosPath: (path: string) => void;
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearFilters: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Create the store with persist middleware
export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      accessToken: null,
      memosPath: '', // Default or load from a more global config if needed
      filterList: [],
      theme: 'system', // Default theme

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setMemosPath: (path) => set({ memosPath: path }),
      addFilter: (filter) =>
        set((state) => ({
          filterList: state.filterList.includes(filter)
            ? state.filterList
            : [...state.filterList, filter],
        })),
      removeFilter: (filter) =>
        set((state) => ({
          filterList: state.filterList.filter((f) => f !== filter),
        })),
      clearFilters: () => set({ filterList: [] }),
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to documentElement for Tailwind CSS dark mode
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
    }),
    {
      name: 'memobbs-settings-storage', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
      // You can choose to persist only specific parts of the store:
      // partialize: (state) => ({ currentUser: state.currentUser, accessToken: state.accessToken, theme: state.theme }),
    }
  )
);

// Helper hook to initialize theme on app load (if using this store for theme)
export const useInitializeTheme = () => {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedSettings = localStorage.getItem('memobbs-settings-storage');
        if (storedSettings) {
            try {
                const parsedSettings = JSON.parse(storedSettings);
                if (parsedSettings.state && parsedSettings.state.theme) {
                    setTheme(parsedSettings.state.theme);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse settings from localStorage", e);
            }
        }
      // If no theme in storage, or if it's system, apply system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const currentTheme = theme === 'system' ? systemTheme : theme;
       document.documentElement.classList.add(currentTheme);
    }
  }, [theme, setTheme]);
};
