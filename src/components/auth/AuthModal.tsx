"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Newspaper, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "./AuthContext";

/* ── tiny helpers ── */
const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const sheet = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 28, stiffness: 340, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

type Step = "choose" | "email";

export function AuthModal() {
  const { isAuthOpen, closeAuth, continueAsGuest, signInWithEmail,
          newsletterSubscribed, setNewsletterSubscribed } = useAuth();

  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [error, setError]   = useState("");

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    signInWithEmail(email, name || email.split("@")[0]);
    setStep("choose");
    setEmail("");
    setName("");
    setError("");
  }

  function handleClose() {
    closeAuth();
    setStep("choose");
    setError("");
  }

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Modal sheet */}
          <motion.div
            key="auth-sheet"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0c1e] shadow-[0_0_80px_rgba(99,102,241,0.15)] pointer-events-auto overflow-hidden"
              variants={sheet}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Ambient glow strip */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-indigo-600/10 blur-[60px] pointer-events-none" />

              {/* Close */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </motion.button>

              <div className="p-8 space-y-6">
                {/* Branding */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    V
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {step === "choose" ? "Welcome to AlgoVerse" : "Sign in with email"}
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    {step === "choose"
                      ? "Create a free account to save your progress, or dive straight in."
                      : "Enter your details to continue. No verification required."}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {step === "choose" ? (
                    <motion.div
                      key="choose"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0, transition: { type: "spring", damping: 22, stiffness: 300 } }}
                      exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                      className="space-y-3"
                    >
                      {/* Google (no-op placeholder) */}
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.07)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition"
                        onClick={() => continueAsGuest()}
                      >
                        {/* Google "G" icon */}
                        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                        <span className="ml-auto text-[10px] text-zinc-500 font-normal">(coming soon)</span>
                      </motion.button>

                      <div className="flex items-center gap-3 text-xs text-zinc-600">
                        <div className="flex-1 h-px bg-white/5" />
                        or
                        <div className="flex-1 h-px bg-white/5" />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep("email")}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-600/10 px-4 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-600/20 transition"
                      >
                        <Mail className="h-4 w-4" />
                        Continue with Email
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="email"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0, transition: { type: "spring", damping: 22, stiffness: 300 } }}
                      exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                      onSubmit={handleEmailSubmit}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        placeholder="Display name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/8 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        className="w-full rounded-xl border border-white/8 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition"
                        required
                      />
                      {error && <p className="text-xs text-rose-400">{error}</p>}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] transition"
                      >
                        Create Account
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => { setStep("choose"); setError(""); }}
                        className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition py-1"
                      >
                        ← Back
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Newsletter opt-in */}
                <motion.label
                  whileHover={{ backgroundColor: "rgba(99,102,241,0.04)" }}
                  className="flex items-start gap-3 rounded-xl border border-white/5 p-3.5 cursor-pointer transition"
                >
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={newsletterSubscribed}
                      onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                    />
                    <div className="h-4 w-4 rounded border border-white/20 bg-zinc-900 peer-checked:bg-indigo-600 peer-checked:border-indigo-500 transition flex items-center justify-center">
                      {newsletterSubscribed && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Newspaper className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-200">AlgoVerse Trends</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase tracking-wider">Free</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      A weekly 5–10 min read on the latest shifts in Software Engineering, Algorithms & AI architectures.
                    </p>
                  </div>
                </motion.label>

                {/* Skip */}
                <div className="text-center">
                  <button
                    onClick={handleClose}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
                  >
                    Skip for now — go straight to visualizer
                  </button>
                </div>
              </div>

              {/* Bottom glow strip */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
