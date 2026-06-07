"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Brain, Cpu, Database, Layers,
  Network, Pause, Play, RotateCcw, Sparkles,
  StepForward, Terminal, Zap,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthContext";

/* ─── Sorting preview data ─────────────────────────────────────────────────── */
const INITIAL_ARR = [6, 2, 8, 3, 7, 1, 5, 4];

interface SortStep {
  array: number[];
  active: number[];
  sorted: number[];
  codeLine: number;
  desc: string;
}

function generateBubbleSortSteps(): SortStep[] {
  const arr = [...INITIAL_ARR];
  const steps: SortStep[] = [];
  const n = arr.length;

  steps.push({ array: [...arr], active: [], sorted: [], codeLine: 1, desc: "Ready to start Bubble Sort." });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr],
        active: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        codeLine: 5,
        desc: `Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`,
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          array: [...arr],
          active: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          codeLine: 6,
          desc: `Swapped: ${arr[j + 1]} > ${arr[j]}`,
        });
      }
    }
  }
  steps.push({ array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k), codeLine: 8, desc: "Bubble Sort complete!" });
  return steps;
}

/* ─── CS Fields config ─────────────────────────────────────────────────────── */
const CS_FIELDS = [
  {
    title: "Data Structures",
    icon: <Layers className="h-6 w-6 text-indigo-400" />,
    desc: "Arrays, lists, heaps, red-black trees, and hash tables with responsive visual transitions.",
    badge: "24 Topics",
    accentClass: "from-indigo-600/20 to-purple-600/10",
    borderHover: "hover:border-indigo-500/30",
    link: "/explore/trees/binary-search-tree",
  },
  {
    title: "Algorithms",
    icon: <Zap className="h-6 w-6 text-amber-400" />,
    desc: "Sorting, dynamic programming, backtracking, spatial geometry, and graphs.",
    badge: "56 Topics",
    accentClass: "from-amber-600/20 to-orange-600/10",
    borderHover: "hover:border-amber-500/30",
    link: "/explore/sorting/quick-sort",
  },
  {
    title: "Operating Systems",
    icon: <Cpu className="h-6 w-6 text-cyan-400" />,
    desc: "CPU scheduling, process sync, paging, deadlock avoidance, and disk operations.",
    badge: "28 Topics",
    accentClass: "from-cyan-600/20 to-blue-600/10",
    borderHover: "hover:border-cyan-500/30",
    link: "/explore/process-scheduling/round-robin",
  },
  {
    title: "Computer Networks",
    icon: <Network className="h-6 w-6 text-emerald-400" />,
    desc: "TCP 3-way handshake, DNS resolutions, sliding windows, and security handshakes.",
    badge: "18 Topics",
    accentClass: "from-emerald-600/20 to-teal-600/10",
    borderHover: "hover:border-emerald-500/30",
    link: "/explore/tcp-ip/three-way-handshake",
  },
  {
    title: "Database Systems",
    icon: <Database className="h-6 w-6 text-rose-400" />,
    desc: "B-Tree indexes, query parsing, hash joins, lock management, and write-ahead logs.",
    badge: "12 Topics",
    accentClass: "from-rose-600/20 to-pink-600/10",
    borderHover: "hover:border-rose-500/30",
    link: "/explore/indexing/btree-index",
  },
  {
    title: "Machine Learning & AI",
    icon: <Brain className="h-6 w-6 text-fuchsia-400" />,
    desc: "Neural net backpropagation, self-attention, PCA steps, and RAG retrieval flows.",
    badge: "26 Topics",
    accentClass: "from-fuchsia-600/20 to-indigo-600/10",
    borderHover: "hover:border-fuchsia-500/30",
    link: "/explore/modern-ai/transformer-attention",
  },
];

/* ─── Code snippet lines ───────────────────────────────────────────────────── */
const CODE_LINES = [
  "def bubble_sort(arr):",
  "    for i in range(len(arr)):",
  "        for j in range(len(arr) - i - 1):",
  "            if arr[j] > arr[j + 1]:",
  "                arr[j], arr[j + 1] = arr[j + 1], arr[j]",
  "                # swap triggered",
  "    return arr",
];

/* ─── Framer variants ──────────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 260 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20, stiffness: 240 } },
};

export default function Home() {
  const { openAuth } = useAuth();

  /* ── Sorting preview state ── */
  const [steps] = useState(generateBubbleSortSteps);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = steps[stepIndex] ?? steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, 750);
    return () => clearInterval(id);
  }, [isPlaying, steps.length]);

  function handlePlayPause() {
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }

  function handleStep() {
    if (stepIndex < steps.length - 1) setStepIndex((p) => p + 1);
  }

  function handleReset() {
    setIsPlaying(false);
    setStepIndex(0);
  }

  const { array, active, sorted } = currentStep;
  const maxVal = Math.max(...INITIAL_ARR);

  return (
    <div className="relative min-h-screen bg-[#06050b] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-900/10 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] -right-40 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-40 left-1/4 h-[700px] w-[700px] rounded-full bg-cyan-900/10 blur-[160px] pointer-events-none animate-float-medium" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* ── Nav header ── */}
      <header className="relative flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5 bg-[#08070f]/40 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1, boxShadow: "0 0 22px rgba(99,102,241,0.8)" }}
            className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] cursor-default"
          >
            V
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-white glow-text">AlgoVerse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition"
          >
            All Courses
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/explore"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.65)] transition-shadow inline-block"
            >
              Launch Explorer
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 z-10 space-y-28">

        {/* Hero + preview grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Hero text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3 w-3" />
              THE ULTIMATE CS VISUALIZATION ENGINE
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none text-white">
              Visualizing the entire{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent glow-text">
                Computer Science
              </span>{" "}
              Universe
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              Step through complex concepts in real-time. Sync interactive 2D/3D visualizations with custom Python walkthroughs and variable tracking.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-indigo-500 hover:shadow-[0_0_28px_rgba(99,102,241,0.65)] transition-all"
                >
                  <BookOpen className="h-4 w-4" /> Start Learning Now
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/explore/sorting/quick-sort"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-6 py-3 font-semibold text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition"
                >
                  <Terminal className="h-4 w-4" /> Try Quick Sort
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6 mt-4">
              {[["20+", "CS Fields"], ["150+", "Interactive Topics"], ["100%", "Python Synced"]].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white glow-text">{num}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Interactive visualizer card */}
          <motion.div variants={fadeUp} className="lg:col-span-7">
            <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
              {/* macOS-style top bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  <span className="text-xs text-zinc-500 font-mono ml-2">bubble_sort.py</span>
                </div>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/10">
                  Interactive Preview
                </span>
              </div>

              {/* Sorting canvas */}
              <div className="h-56 bg-zinc-950/70 border border-white/5 rounded-xl p-4 flex items-end gap-2 relative overflow-hidden">
                {array.map((val, idx) => {
                  const isActive = active.includes(idx);
                  const isSorted = sorted.includes(idx);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                      <span className="text-[10px] text-zinc-400 font-mono">{val}</span>
                      <motion.div
                        layout
                        layoutId={`hero-bar-${idx}`}
                        transition={{ type: "spring", damping: 22, stiffness: 240 }}
                        className={`w-full rounded-t-md relative overflow-hidden shadow-lg ${
                          isActive
                            ? "bg-gradient-to-t from-rose-600 to-rose-400 border border-rose-400/30"
                            : isSorted
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400 border border-emerald-400/30"
                              : "bg-gradient-to-t from-indigo-600 to-indigo-400 border border-indigo-400/20"
                        }`}
                        style={{ height: `${(val / maxVal) * 80 + 10}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] animate-shimmer pointer-events-none" />
                      </motion.div>
                      <span className="text-[9px] text-zinc-600 font-mono">{idx}</span>
                    </div>
                  );
                })}
              </div>

              {/* Controls + pseudocode */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-5 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">Bubble Sort</h3>
                    <p className="text-xs text-zinc-400 leading-normal min-h-12">{currentStep.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handlePlayPause}
                      className="flex-1 py-2 px-3 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 font-semibold text-xs flex items-center justify-center gap-1.5 text-white transition"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {isPlaying ? "Pause" : "Play"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleStep}
                      disabled={isPlaying}
                      className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <StepForward className="h-3.5 w-3.5" /> Step
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, rotate: -25 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", damping: 18, stiffness: 360 }}
                      onClick={handleReset}
                      className="py-2 px-3 rounded-lg border border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs flex items-center justify-center transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Pseudocode */}
                <div className="md:col-span-7 bg-zinc-950/60 border border-white/5 rounded-xl p-3 font-mono text-[11px] leading-relaxed flex flex-col justify-center text-zinc-400">
                  <AnimatePresence initial={false}>
                    {CODE_LINES.map((line, index) => {
                      const ln = index + 1;
                      const isHl =
                        (currentStep.codeLine === 5 && ln === 4) ||
                        (currentStep.codeLine === 6 && ln >= 5 && ln <= 6) ||
                        (currentStep.codeLine === 1 && ln <= 2) ||
                        (currentStep.codeLine === 8 && ln === 7);
                      return (
                        <motion.div
                          key={index}
                          animate={{ backgroundColor: isHl ? "rgba(99,102,241,0.15)" : "transparent" }}
                          transition={{ duration: 0.25 }}
                          className={`px-2 py-0.5 rounded ${isHl ? "border-l-2 border-indigo-400 pl-1.5 text-indigo-300" : ""}`}
                        >
                          <span className="text-zinc-600 mr-2">{ln}</span>
                          {line}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CS Field cards */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-bold text-white glow-text">Fields Available in the Explorer</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore custom dashboards tailored for every major domain of computer science. All complete with step-by-step visualizations and Python state tracing.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {CS_FIELDS.map((field) => (
              <motion.div key={field.title} variants={cardVariant}>
                <Link href={field.link} className="block h-full">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -3 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", damping: 20, stiffness: 320 }}
                    className={`glass-panel rounded-2xl p-6 flex flex-col gap-4 text-left h-full border border-white/5 ${field.borderHover} hover:border-opacity-50 hover:shadow-[0_8px_32px_rgba(99,102,241,0.08)] transition-all group cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all">
                        {field.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:bg-indigo-600/15 group-hover:text-indigo-300 group-hover:border-indigo-500/10 transition-all">
                        {field.badge}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {field.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{field.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-900/20 to-violet-900/10 p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.07),transparent_70%)] pointer-events-none" />
          <div className="relative space-y-4 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3 w-3" /> AlgoVerse Trends
            </div>
            <h3 className="text-2xl font-bold text-white">Stay sharp every week</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A weekly 5–10 min read on the latest shifts in Software Engineering, Algorithms & AI architectures. Zero fluff.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(99,102,241,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={openAuth}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow"
            >
              Subscribe for free
            </motion.button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#08070f]/60 py-8 text-center text-xs text-zinc-500 relative z-10">
        <p>© 2026 AlgoVerse. Visualizing everything in Computer Science.</p>
      </footer>
    </div>
  );
}
