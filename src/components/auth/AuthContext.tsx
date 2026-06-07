"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthOpen: boolean;
  newsletterSubscribed: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signInWithEmail: (email: string, name: string) => void;
  continueAsGuest: () => void;
  signOut: () => void;
  setNewsletterSubscribed: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribedState] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("algoverse_user");
      if (stored) setUser(JSON.parse(stored) as AuthUser);
      if (localStorage.getItem("algoverse_newsletter") === "true") {
        setNewsletterSubscribedState(true);
      }
    } catch {
      // localStorage unavailable (SSR guard)
    }
  }, []);

  const openAuth = useCallback(() => setIsAuthOpen(true), []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  const signInWithEmail = useCallback((email: string, name: string) => {
    const next: AuthUser = { email, name };
    setUser(next);
    try {
      localStorage.setItem("algoverse_user", JSON.stringify(next));
    } catch {}
    setIsAuthOpen(false);
  }, []);

  const continueAsGuest = useCallback(() => setIsAuthOpen(false), []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("algoverse_user");
    } catch {}
  }, []);

  const setNewsletterSubscribed = useCallback((val: boolean) => {
    setNewsletterSubscribedState(val);
    try {
      localStorage.setItem("algoverse_newsletter", String(val));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthOpen,
        newsletterSubscribed,
        openAuth,
        closeAuth,
        signInWithEmail,
        continueAsGuest,
        signOut,
        setNewsletterSubscribed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
