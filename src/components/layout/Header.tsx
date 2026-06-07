"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthContext";
import { useTheme } from "@/components/theme/ThemeContext";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, openAuth, signOut } = useAuth();
  const { theme, toggle }           = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 px-6 shadow-[0_4px_30px_rgba(0,0,0,0.16)] backdrop-blur-md"
      style={{ background: "var(--header-bg)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs text-white transition-shadow"
            style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" }}
          >
            V
          </motion.div>
          <span className="text-md font-bold tracking-tight glow-text group-hover:opacity-80 transition-opacity">
            AlgoVerse
          </span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden w-52 sm:block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            className="pl-9 h-9 bg-zinc-950/40 border-white/5 focus-visible:ring-1 focus-visible:ring-[var(--accent)]/40 text-xs placeholder-zinc-500 transition-all rounded-lg"
            placeholder="Search topics…"
          />
        </div>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1,
                  transition: { type: "spring", damping: 18, stiffness: 340 } }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5,
                  transition: { duration: 0.12 } }}
                style={{ display: "flex" }}
              >
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate:  90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1,
                  transition: { type: "spring", damping: 18, stiffness: 340 } }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5,
                  transition: { duration: 0.12 } }}
                style={{ display: "flex" }}
              >
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Auth */}
        {user ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-800 transition"
            >
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                {user.name[0].toUpperCase()}
              </div>
              <span className="hidden sm:block">{user.name}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8,  scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,   scale: 1,
                    transition: { type: "spring", damping: 22, stiffness: 320 } }}
                  exit={{ opacity: 0, y: -6, scale: 0.95,
                    transition: { duration: 0.15 } }}
                  className="absolute right-0 top-10 w-44 rounded-xl border border-white/8 shadow-2xl overflow-hidden z-50"
                  style={{ background: "var(--panel-solid)" }}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={openAuth}
            className="h-8 flex items-center gap-1.5 rounded-lg border px-4 text-xs font-semibold transition"
            style={{
              borderColor: "var(--accent-glow)",
              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent-hover)",
            }}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in
          </motion.button>
        )}
      </div>
    </header>
  );
}
