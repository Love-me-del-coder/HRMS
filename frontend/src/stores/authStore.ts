import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Company } from '../types';

interface AuthStore {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  sidebarExpanded: boolean;
  isMobileMenuOpen: boolean;
  
  setAuth: (user: User, company: Company, token: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  updateUser: (user: Partial<User>) => void;
  updateCompany: (company: Partial<Company>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
      theme: 'dark',
      sidebarExpanded: true,
      isMobileMenuOpen: false,

      setAuth: (user, company, token) => {
        set({ user, company, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, company: null, token: null, isAuthenticated: false });
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.className = newTheme;
        set({ theme: newTheme });
      },

      toggleSidebar: () => {
        set({ sidebarExpanded: !get().sidebarExpanded });
      },

      toggleMobileMenu: () => {
        set({ isMobileMenuOpen: !get().isMobileMenuOpen });
      },

      closeMobileMenu: () => {
        set({ isMobileMenuOpen: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      updateCompany: (updates) => {
        const current = get().company;
        if (current) {
          set({ company: { ...current, ...updates } });
        }
      },
    }),
    {
      name: 'hrms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarExpanded: state.sidebarExpanded,
      }),
    }
  )
);
