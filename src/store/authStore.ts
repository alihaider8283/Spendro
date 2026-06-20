import { authService } from '@/services/authService';
import { create } from 'zustand';

export interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  isLoading: boolean;
  authListenerUnsubscribe: (() => void) | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  authListenerUnsubscribe: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      await authService.login(email, password);
      // State updates automatically when the onAuthStateChanged listener fires
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true });
      await authService.signup(email, password, name);
      // State updates automatically when the onAuthStateChanged listener fires
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      // State updates automatically when the onAuthStateChanged listener fires
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ isLoading: true });
      await authService.signInWithGoogle();
      // auth state updates automatically via onAuthStateChanged listener
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateName: async (name: string) => {
    await authService.updateDisplayName(name);
    set((state) => ({
      user: state.user ? { ...state.user, name } : null,
    }));
  },

  initializeAuth: async () => {
    try {
      // Unsubscribe from any previous listener before creating a new one
      const { authListenerUnsubscribe } = get();
      if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
      }

      const unsubscribe = authService.subscribeToAuthChanges((firebaseUser) => {
        if (firebaseUser) {
          set({
            isAuthenticated: true,
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            },
            isLoading: false,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      });

      set({ authListenerUnsubscribe: unsubscribe });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
