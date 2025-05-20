import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
  UserCredential,
  onIdTokenChanged,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile, updateUserProfile } from './firestore';

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Set up persistence
setPersistence(auth, browserLocalPersistence);

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's display name
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      // Send email verification
      await sendEmailVerification(auth.currentUser);

      // Create user profile in Firestore
      // await createUserProfile(auth.currentUser.uid, {
      //   displayName,
      //   email,
      //   photoURL: "",
      // });
    }
    return userCredential;
  } catch (error) {
    console.error('Error signing up with email and password:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login in Firestore
    if (auth.currentUser) {
      await updateUserProfile(auth.currentUser.uid, {
        lastLoginAt: new Date().toISOString(),
      });
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in with email and password:', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign in with GitHub
export const signInWithGithub = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (error) {
    console.error('Error signing in with GitHub:', error);
    throw error;
  }
};

// Sign in with Microsoft
export const signInWithMicrosoft = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, microsoftProvider);
  } catch (error) {
    console.error('Error signing in with Microsoft:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen to auth state changes
export const listenToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export function listenToIdTokenChanges(cb: (user: User | null) => void) {
  return onIdTokenChanged(auth, cb);
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};