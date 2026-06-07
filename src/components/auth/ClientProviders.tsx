"use client";

import { AuthModal } from "./AuthModal";
import { AuthProvider } from "./AuthContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
