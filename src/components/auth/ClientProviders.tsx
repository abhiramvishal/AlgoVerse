"use client";

import { AuthModal } from "./AuthModal";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <AuthModal />
      </AuthProvider>
    </ThemeProvider>
  );
}
