"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { listenToAuthChanges } from '@/lib/firebase/auth';
import useAuthStore from '@/store/useAuthStore';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export const useAuth = () => useContext(AuthContext);

const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const eraseCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const setUser = useAuthStore(state => state.setUser);
  
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((user) => {
      setUser(user);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    });
    
    return () => unsubscribe();
  }, [setUser, isInitialized]);
  
  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};