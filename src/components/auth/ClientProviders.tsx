"use client";

import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        {/* AuthModal removed — Clerk handles sign-in UI natively */}
      </AuthProvider>
    </ThemeProvider>
  );
}
