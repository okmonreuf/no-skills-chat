import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authService,
  User,
  LoginCredentials,
  RegisterData,
} from "@/services/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          set({ user: currentUser });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.login(credentials);
          set({ user, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Erreur de connexion",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Erreur d'inscription",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({ user: null, isLoading: false, error: null });
        } catch (error) {
          console.error("Erreur lors de la déconnexion:", error);
          // Force logout même en cas d'erreur
          set({ user: null, isLoading: false, error: null });
        }
      },

      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyEmail(code);
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, isVerified: true },
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Erreur de vérification",
            isLoading: false,
          });
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.updateProfile(data);
          set({ user, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Erreur de mise à jour",
            isLoading: false,
          });
          throw error;
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const avatarUrl = await authService.uploadAvatar(file);
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, avatar: avatarUrl },
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erreur d'upload",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
