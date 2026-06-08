"use client";

/**
 * AuthContext — thin bridge between Clerk and the rest of the app.
 *
 * Every component that calls `useAuth()` continues to work unchanged.
 * Clerk handles the real session; this context just exposes the same
 * interface the app already expects.
 */

import { createContext, useCallback, useContext, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

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
  const { user: clerkUser, isLoaded } = useUser();
  const { openSignIn, signOut: clerkSignOut } = useClerk();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribedState] = useState(false);

  // Map Clerk user → our AuthUser shape
  const user: AuthUser | null =
    isLoaded && clerkUser
      ? {
          name:
            clerkUser.fullName ??
            clerkUser.firstName ??
            clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] ??
            "User",
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        }
      : null;

  // openAuth → opens Clerk's hosted sign-in
  const openAuth = useCallback(() => {
    openSignIn();
  }, [openSignIn]);

  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  // Legacy stub — kept so nothing breaks, delegates to Clerk
  const signInWithEmail = useCallback(
    (_email: string, _name: string) => {
      openSignIn();
    },
    [openSignIn],
  );

  const continueAsGuest = useCallback(() => setIsAuthOpen(false), []);

  const signOut = useCallback(() => {
    void clerkSignOut();
  }, [clerkSignOut]);

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
