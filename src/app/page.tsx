"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Zap,
  BookOpen,
  Terminal,
  Cpu,
  Network,
  Database,
  Shield,
  Brain,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";

// Initial array for the interactive hero preview
const initialArr = [6, 2, 8, 3, 7, 1, 5, 4];

interface SortStep {
  array: number[];
  active: number[];
  sorted: number[];
  swapped: boolean;
  codeLine: number;
  desc: string;
}

export default function Home() {
  // --- Interactive Sorting Preview Logic ---
  const [array, setArray] = useState<number[]>([...initialArr]);
  const [active, setActive] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<SortStep[]>([]);
  
  // Generate all sorting steps for the interactive visualizer
  useEffect(() => {
    const arr = [...initialArr];
    const generatedSteps: SortStep[] = [];
    const n = arr.length;

    generatedSteps.push({
      array: [...arr],
      active: [],
      sorted: [],
      swapped: false,
      codeLine: 1,
      desc: "Ready to start Bubble Sort.",
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Step for comparison
        generatedSteps.push({
          array: [...arr],
          active: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          swapped: false,
          codeLine: 5,
          desc: `Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`,
        });

        if (arr[j] > arr[j + 1]) {
          // Swap
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          generatedSteps.push({
            array: [...arr],
            active: [j, j + 1],
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            swapped: true,
            codeLine: 6,
            desc: `Swapping values: ${arr[j + 1]} > ${arr[j]}`,
          });
        }
      }
      // Element is sorted
    }

    generatedSteps.push({
      array: [...arr],
      active: [],
      sorted: Array.from({ length: n }, (_, k) => k),
      swapped: false,
      codeLine: 8,
      desc: "Bubble Sort completed! Array is sorted.",
    });

    setSteps(generatedSteps);
  }, []);

  // Playback timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPlaying && steps.length > 0) {
      intervalId = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          const currentStep = steps[nextIndex];
          if (currentStep) {
            setArray(currentStep.array);
            setActive(currentStep.active);
            setSorted(currentStep.sorted);
          }
          return nextIndex;
        });
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, steps]);

  const handlePlayPause = () => {
    if (stepIndex >= steps.length - 1) {
      // restart
      setStepIndex(0);
      const startStep = steps[0];
      if (startStep) {
        setArray(startStep.array);
        setActive(startStep.active);
        setSorted(startStep.sorted);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    if (stepIndex < steps.length - 1) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      const nextStep = steps[nextIndex];
      if (nextStep) {
        setArray(nextStep.array);
        setActive(nextStep.active);
        setSorted(nextStep.sorted);
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    const startStep = steps[0];
    if (startStep) {
      setArray(startStep.array);
      setActive(startStep.active);
      setSorted(startStep.sorted);
    }
  };

  const currentStepInfo = steps[stepIndex] || {
    desc: "Initializing...",
    codeLine: 1,
  };

  // CS Fields config
  const csFields = [
    {
      title: "Data Structures",
      icon: <Layers className="h-6 w-6 text-indigo-400" />,
      desc: "Arrays, lists, heaps, red-black trees, and hash tables with responsive visual transitions.",
      badge: "24 Topics",
      gradient: "from-indigo-600/20 to-purple-600/10",
      link: "/explore/trees/binary-search-tree",
    },
    {
      title: "Algorithms",
      icon: <Zap className="h-6 w-6 text-amber-400" />,
      desc: "Sorting, dynamic programming, backtracking, spatial geometry, and graphs.",
      badge: "56 Topics",
      gradient: "from-amber-600/20 to-orange-600/10",
      link: "/explore/sorting/quick-sort",
    },
    {
      title: "Operating Systems",
      icon: <Cpu className="h-6 w-6 text-cyan-400" />,
      desc: "Explore CPU scheduling, process sync, paging, deadlock avoidance (Banker's), and disk operations.",
      badge: "28 Topics",
      gradient: "from-cyan-600/20 to-blue-600/10",
      link: "/explore/process-scheduling/round-robin",
    },
    {
      title: "Computer Networks",
      icon: <Network className="h-6 w-6 text-emerald-400" />,
      desc: "Inspect the TCP 3-way handshake, DNS resolutions, sliding windows, and security handshakes.",
      badge: "18 Topics",
      gradient: "from-emerald-600/20 to-teal-600/10",
      link: "/explore/tcp-ip/three-way-handshake",
    },
    {
      title: "Database Systems",
      icon: <Database className="h-6 w-6 text-rose-400" />,
      desc: "Visualize B-Tree indexes, query parsing, hash joins, lock management, and write-ahead logs.",
      badge: "12 Topics",
      gradient: "from-rose-600/20 to-pink-600/10",
      link: "/explore/indexing/btree-index",
    },
    {
      title: "Machine Learning & AI",
      icon: <Brain className="h-6 w-6 text-fuchsia-400" />,
      desc: "See neural net backpropagation, self-attention mechanisms, PCA steps, and RAG retrieval flows.",
      badge: "26 Topics",
      gradient: "from-fuchsia-600/20 to-indigo-600/10",
      link: "/explore/modern-ai/transformer-attention",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#06050b] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Glossy radial ambient glows */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-900/10 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[40%] -right-40 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-40 left-1/4 h-[700px] w-[700px] rounded-full bg-cyan-900/10 blur-[160px] pointer-events-none animate-float-medium" />

      {/* Decorative floating grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5 bg-[#08070f]/40 backdrop-blur-md z-45">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-white glow-text">
            AlgoVerse
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition"
          >
            All Courses
          </Link>
          <Link
            href="/explore"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch Explorer
          </Link>
        </div>
      </header>

      {/* Main hero & interactive preview grid */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-24 z-10 space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3 w-3" />
              <span>THE ULTIMATE CS VISUALIZATION ENGINE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none text-white">
              Visualizing the entire{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent glow-text">
                Computer Science
              </span>{" "}
              Universe
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md">
              Step through complex concepts in real-time. Sync interactive 2D/3D visualizations with custom Python walkthroughs and variable tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.65)] hover:scale-[1.02] transition-all"
              >
                <BookOpen className="h-4 w-4" /> Start Learning Now
              </Link>
              <Link
                href="/explore/sorting/quick-sort"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/40 px-6 py-3 font-semibold text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition"
              >
                <Terminal className="h-4 w-4" /> Try Quick Sort
              </Link>
            </div>
            {/* Quick statistics */}
            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-white glow-text">20+</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">CS Fields</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white glow-text">150+</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Interactive Topics</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white glow-text">100%</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Python Synced</p>
              </div>
            </div>
          </div>

          {/* Interactive visualizer card */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
              {/* Card top glossy header */}
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

              {/* Sorting Canvas Area */}
              <div className="h-56 bg-zinc-950/70 border border-white/5 rounded-xl p-4 flex items-end gap-2 relative overflow-hidden">
                {array.map((val, idx) => {
                  const isActive = active.includes(idx);
                  const isSorted = sorted.includes(idx);
                  const maxVal = Math.max(...initialArr);
                  const heightPercent = `${(val / maxVal) * 80 + 10}%`;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                      <span className="text-[10px] text-zinc-400 font-mono">{val}</span>
                      <motion.div
                        layout
                        transition={{ type: "spring", damping: 20, stiffness: 220 }}
                        className={`w-full rounded-t-md relative overflow-hidden shadow-lg ${
                          isActive
                            ? "bg-gradient-to-t from-rose-600 to-rose-400 shadow-rose-900/40 border border-rose-400/30"
                            : isSorted
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-emerald-900/40 border border-emerald-400/30"
                              : "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-indigo-900/20 border border-indigo-400/20"
                        }`}
                        style={{ height: heightPercent }}
                      >
                        {/* Highlighting sheen overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                      </motion.div>
                      <span className="text-[9px] text-zinc-600 font-mono">{idx}</span>
                    </div>
                  );
                })}
              </div>

              {/* Controls and Code grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Visualizer controls panel */}
                <div className="md:col-span-5 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-white">Bubble Sort</h3>
                    <p className="text-xs text-zinc-400 leading-normal min-h-12">
                      {currentStepInfo.desc}
                    </p>
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="flex-1 py-2 px-3 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 font-semibold text-xs flex items-center justify-center gap-1.5 text-white active:scale-95 transition"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={handleStepForward}
                      disabled={isPlaying}
                      className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                    >
                      <StepForward className="h-3.5 w-3.5" /> Step
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-2 px-3 rounded-lg border border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs flex items-center justify-center active:scale-95 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Micro pseudocode walkthrough */}
                <div className="md:col-span-7 bg-zinc-950/60 border border-white/5 rounded-xl p-3 font-mono text-[11px] leading-relaxed flex flex-col justify-center text-zinc-400">
                  {[
                    "def bubble_sort(arr):",
                    "    for i in range(len(arr)):",
                    "        for j in range(len(arr) - i - 1):",
                    "            if arr[j] > arr[j + 1]:",
                    "                arr[j], arr[j + 1] = arr[j + 1], arr[j]",
                    "                # swap triggered",
                    "    return arr",
                  ].map((line, index) => {
                    const mappedLineNumber = index + 1;
                    const isHighlighted =
                      (currentStepInfo.codeLine === 5 && mappedLineNumber === 4) ||
                      (currentStepInfo.codeLine === 6 && mappedLineNumber >= 5 && mappedLineNumber <= 6) ||
                      (currentStepInfo.codeLine === 1 && mappedLineNumber <= 2) ||
                      (currentStepInfo.codeLine === 8 && mappedLineNumber === 7);

                    return (
                      <div
                        key={index}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          isHighlighted
                            ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400 pl-1.5"
                            : ""
                        }`}
                      >
                        <span className="text-zinc-600 mr-2">{index + 1}</span>
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CS Core categories list */}
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white glow-text">
              Fields Available in the Explorer
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Explore custom dashboards tailored for every major domain of computer science. All complete with step-by-step visualizations and python state tracing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {csFields.map((field, index) => (
              <Link key={index} href={field.link}>
                <div
                  className={`glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4 text-left h-full group cursor-pointer transition`}
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
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {field.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#08070f]/60 py-8 text-center text-xs text-zinc-500 relative z-10">
        <p>© 2026 AlgoVerse. Visualizing everything in Computer Science.</p>
      </footer>
    </div>
  );
}
