import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signInWithGithub, 
  signInWithMicrosoft, 
  logOut, 
  resetPassword 
} from '@/lib/firebase/auth';
import { createUserProfile } from '@/lib/firebase/firestore';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        
        signUp: async (email, password, displayName) => {
          set({ isLoading: true, error: null });
          try {
            const userCredential = await signUpWithEmail(email, password, displayName);
            set({ user: userCredential.user, isLoading: false });
            
            await createUserProfile( userCredential.user.uid , {
              displayName,
              email,
              photoURL: "",
              role: "user",
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              emailVerified: false,
              subscriptionTier: "free",
            });

          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during sign up', 
              isLoading: false 
            });
            throw error;
          }
        },

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const userCredential = await signInWithEmail(email, password);
            set({ user: userCredential.user, isLoading: false });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during login', 
              isLoading: false 
            });
            throw error;
          }
        },

        loginWithGoogle: async () => {
          set({ isLoading: true, error: null });
          try {
            const userCredential = await signInWithGoogle();
            set({ user: userCredential.user, isLoading: false });
            await createUserProfile( userCredential.user.uid , {
              displayName: userCredential.user.displayName || "",
              email: userCredential.user.email || "",
              photoURL: userCredential.user.photoURL || "",
              role: "user",
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              emailVerified: userCredential.user.emailVerified || false,
              subscriptionTier: "free",
            });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during Google login', 
              isLoading: false 
            });
            throw error;
          }
        },

        loginWithGithub: async () => {
          set({ isLoading: true, error: null });
          try {
            const userCredential = await signInWithGithub();
            set({ user: userCredential.user, isLoading: false });
            await createUserProfile( userCredential.user.uid , {
              displayName: userCredential.user.displayName || "",
              email: userCredential.user.email || "",
              photoURL: userCredential.user.photoURL || "",
              role: "user",
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              emailVerified: userCredential.user.emailVerified || false,
              subscriptionTier: "free",
            });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during GitHub login', 
              isLoading: false 
            });
            throw error;
          }
        },

        loginWithMicrosoft: async () => {
          set({ isLoading: true, error: null });
          try {
            const userCredential = await signInWithMicrosoft();
            set({ user: userCredential.user, isLoading: false });
            await createUserProfile( userCredential.user.uid , {
              displayName: userCredential.user.displayName || "",
              email: userCredential.user.email || "",
              photoURL: userCredential.user.photoURL || "",
              role: "user",
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              emailVerified: userCredential.user.emailVerified || false,
              subscriptionTier: "free",
            });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during Microsoft login', 
              isLoading: false 
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null });
          try {
            await logOut();
            set({ user: null, isLoading: false });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred during logout', 
              isLoading: false 
            });
            throw error;
          }
        },

        resetUserPassword: async (email) => {
          set({ isLoading: true, error: null });
          try {
            await resetPassword(email);
            set({ isLoading: false });
          } catch (error: any) {
            set({ 
              error: error.message || 'An error occurred while resetting password', 
              isLoading: false 
            });
            throw error;
          }
        },
        
        setUser: (user) => {
          set({ user });
        },
        
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user })
      }
    )
  )
);

export default useAuthStore;