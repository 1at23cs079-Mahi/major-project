/**
 * Authentication Store using Zustand
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from localStorage
      initialize: () => {
        const user = authApi.getStoredUser();
        const isAuthenticated = authApi.isAuthenticated();
        set({ user, isAuthenticated, isLoading: false });
      },

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          if (response.success) {
            set({ 
              user: response.data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null,
            });
            return { success: true, user: response.data.user };
          }
          throw new Error(response.message || 'Login failed');
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null,
          });
          return { success: false, error: error.message };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(userData);
          if (response.success) {
            set({ 
              user: response.data.user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null,
            });
            return { success: true, user: response.data.user };
          }
          throw new Error(response.message || 'Registration failed');
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed',
          });
          return { success: false, error: error.message };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } finally {
          authApi.clearTokens();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh profile
      refreshProfile: async () => {
        if (!get().isAuthenticated) return;
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            set({ user: response.data.user });
          }
        } catch (error) {
          // If profile fetch fails, log out
          get().logout();
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Get dashboard path based on role
      getDashboardPath: () => {
        const user = get().user;
        if (!user) return '/';
        
        const role = user.role?.toLowerCase();
        switch (role) {
          case 'admin':
            return '/admin';
          case 'doctor':
            return '/doctor';
          case 'patient':
            return '/patient';
          case 'pharmacy':
            return '/pharmacy';
          case 'lab':
            return '/lab';
          default:
            return '/patient';
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;
