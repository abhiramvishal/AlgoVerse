"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, LogOut, Search, User } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthContext";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, openAuth, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#08070f]/80 backdrop-blur-md px-6 shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_18px_rgba(99,102,241,0.8)] transition-shadow"
          >
            V
          </motion.div>
          <span className="text-md font-bold tracking-tight text-white glow-text group-hover:text-indigo-300 transition-colors">
            AlgoVerse
          </span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden w-56 sm:block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            className="pl-9 h-9 bg-zinc-950/50 border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 text-xs text-zinc-300 placeholder-zinc-500 transition-all rounded-lg"
            placeholder="Search topics..."
          />
        </div>

        {/* Auth button / user avatar */}
        {user ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:border-indigo-500/30 transition"
            >
              <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user.name[0].toUpperCase()}
              </div>
              <span className="hidden sm:block">{user.name}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 320 } }}
                  exit={{ opacity: 0, y: -6, scale: 0.95, transition: { duration: 0.15 } }}
                  className="absolute right-0 top-10 w-44 rounded-xl border border-white/8 bg-[#0d0c1e] shadow-2xl overflow-hidden z-50"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 18px rgba(99,102,241,0.35)" }}
            whileTap={{ scale: 0.96 }}
            onClick={openAuth}
            className="h-8 flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/10 px-4 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/20 hover:text-white transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </motion.button>
        )}
      </div>
    </header>
  );
}
