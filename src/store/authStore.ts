import { create } from 'zustand';

export interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      // TODO: Call your API endpoint
      // const response = await authService.login(email, password);
      set({
        isAuthenticated: true,
        user: {
          id: '1',
          email,
          name: email.split('@')[0],
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true });
      // TODO: Call your API endpoint
      // const response = await authService.signup(email, password, name);
      set({
        isAuthenticated: true,
        user: {
          id: '1',
          email,
          name,
        },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      // TODO: Call your API endpoint
      // await authService.logout();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      // TODO: Check if user is already authenticated (from secure storage or API)
      // For now, default to not authenticated
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
