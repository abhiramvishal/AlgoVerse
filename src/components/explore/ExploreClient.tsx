"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2, Pause, Play, RotateCcw, StepForward } from "lucide-react";

import { CodePanel } from "@/components/code/CodePanel";
import { ComplexityBadge } from "@/components/code/ComplexityBadge";
import { VariableState } from "@/components/code/VariableState";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/explore/CategoryNav";
import { InputPanel } from "@/components/visualization/InputPanel";
import { VisualizationCanvas } from "@/components/visualization/VisualizationCanvas";
import { useAnimationPlayer } from "@/hooks/useAnimationPlayer";
import { useVisualization } from "@/hooks/useVisualization";

interface ExploreClientProps {
  initialSlug?: string;
}

function parseInputFromQuery(raw: string | null): unknown | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { /* fall through */ }
  const parsed = raw.split(",").map((t) => Number(t.trim()));
  if (parsed.length && !parsed.some(Number.isNaN)) return parsed;
  return null;
}

const SPRING = { type: "spring" as const, damping: 26, stiffness: 340, mass: 0.7 };
const SPEEDS = [0.5, 1, 1.5, 2, 3];

export function ExploreClient({ initialSlug = "bubble-sort" }: ExploreClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [initialStep] = useState(() => Number(searchParams.get("step") ?? "0"));

  const { module: vm, steps, setSlug, setInput, input } = useVisualization();

  const parsedInputFromQuery = useMemo(
    () => parseInputFromQuery(searchParams.get("input")),
    [searchParams],
  );

  useEffect(() => { setSlug(initialSlug); }, [initialSlug, setSlug]);

  useEffect(() => {
    if (parsedInputFromQuery) { setInput(parsedInputFromQuery); return; }
    if (vm) setInput(vm.defaultInput);
  }, [vm, parsedInputFromQuery, setInput]);

  const {
    currentStep, currentStepIndex, totalSteps,
    isPlaying, speed, setIsPlaying, setSpeed,
    setCurrentStepIndex, stepForward, reset,
  } = useAnimationPlayer({
    steps,
    initialStep: Number.isFinite(initialStep) ? initialStep : 0,
  });

  useEffect(() => {
    if (!vm) return;
    const cat = vm.category[vm.category.length - 1] ?? "sorting";
    const p = new URLSearchParams();
    p.set("step", String(currentStepIndex));
    if (input !== null && input !== undefined) {
      if (Array.isArray(input) && (input as unknown[]).every((v) => typeof v === "number")) {
        p.set("input", (input as number[]).join(","));
      } else {
        p.set("input", JSON.stringify(input));
      }
    }
    router.replace(`/explore/${cat}/${vm.slug}?${p.toString()}`, { scroll: false });
  }, [currentStepIndex, input, vm, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPlaceholder = (currentStep?.visualState as any)?.state === "placeholder";

  /* ── Loading state ── */
  if (!vm || !currentStep) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="text-sm text-zinc-400">Loading visualization…</p>
          </div>
        </div>
      </div>
    );
  }

  const topCategory = vm.category[vm.category.length - 1] ?? "algorithms";

  return (
    <div className="flex h-screen flex-col bg-[#06050b] text-foreground overflow-hidden">

      {/* ══ Hover-reveal top strip: Header + CategoryNav ══
          Thin bar always visible; full chrome slides down on hover              */}
      <div className="group/topbar relative z-50 shrink-0">
        {/* Thin always-visible bar */}
        <div className="flex h-9 items-center justify-between px-5 bg-zinc-950/90 border-b border-white/[0.04] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]">
              V
            </div>
            <span className="text-xs font-bold text-zinc-500 tracking-tight">AlgoVerse</span>
            <span className="text-[10px] text-zinc-700">·</span>
            <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">{vm.title}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-zinc-700">
            {!isPlaceholder && (
              <span className="font-mono">{currentStep.stepNumber}/{totalSteps}</span>
            )}
            <span>hover to navigate ↑</span>
          </div>
        </div>

        {/* Full Header + CategoryNav — slide down on hover */}
        <div
          className="absolute top-full left-0 right-0
                     opacity-0 -translate-y-1 pointer-events-none
                     group-hover/topbar:opacity-100 group-hover/topbar:translate-y-0 group-hover/topbar:pointer-events-auto
                     transition-all duration-200 ease-out
                     shadow-2xl"
          style={{ background: "var(--background)" }}
        >
          <Header />
          <CategoryNav activeSlug={vm.slug} />
        </div>
      </div>

      {/* ══ Main two-panel layout ══ */}
      <div className="flex flex-1 min-h-0 gap-4 p-4 overflow-hidden">

        {/* ── LEFT: Code glass-card ── */}
        <div
          className="glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl shrink-0"
          style={{ width: "38%" }}
        >
          {/* macOS header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="font-mono text-xs text-zinc-500 ml-1.5">{vm.slug}.py</span>
            </div>
            <ComplexityBadge
              timeComplexity={vm.timeComplexity}
              spaceComplexity={vm.spaceComplexity}
            />
          </div>

          {/* Code — fills remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodePanel
              code={vm.pythonCode}
              highlightLines={isPlaceholder ? [] : currentStep.highlightLines}
            />
          </div>

          {/* Footer: algo title + description */}
          <div className="px-4 py-3 border-t border-white/5 shrink-0 bg-zinc-950/40">
            <h3 className="text-sm font-semibold text-white">{vm.title}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
              {vm.description}
            </p>
          </div>
        </div>

        {/* ── RIGHT: Visualization glass-card ── */}
        <div className="flex-1 min-w-0 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl">

          {/* macOS header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="font-mono text-xs text-zinc-500 ml-1.5">{vm.slug}_visualizer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 capitalize">
                {topCategory.replace(/-/g, " ")}
              </span>
              {!isPlaceholder && (
                <span className="text-[10px] font-mono text-zinc-600">
                  {currentStep.stepNumber} / {totalSteps}
                </span>
              )}
            </div>
          </div>

          {/* Visualization canvas — dominant, fills all space */}
          <motion.div
            key={vm.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: SPRING }}
            className="flex-1 min-h-0 p-3"
          >
            {isPlaceholder ? (
              <div className="flex h-full items-center justify-center flex-col gap-3 text-center">
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400">
                  Visualization coming soon
                </span>
                <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
                  The interactive canvas for <strong className="text-zinc-400">{vm.title}</strong> is being built.
                </p>
              </div>
            ) : (
              <VisualizationCanvas visualState={currentStep.visualState} />
            )}
          </motion.div>

          {/* ── Bottom strip: controls + input | variables ── */}
          {!isPlaceholder && (
            <div className="flex shrink-0 border-t border-white/5" style={{ maxHeight: "148px" }}>

              {/* Left: compact input + controls */}
              <div className="flex flex-col justify-between gap-2.5 px-4 py-3 flex-1 min-w-0">

                {/* Row 1: custom input (compact) */}
                <InputPanel
                  compact
                  defaultInput={vm.defaultInput}
                  input={input}
                  onApplyInput={(next: unknown) => {
                    setInput(next);
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                />

                {/* Row 2: Play / Step / Reset  +  speed chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Play */}
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (currentStepIndex >= totalSteps - 1) { reset(); setIsPlaying(true); }
                      else setIsPlaying((p) => !p);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 px-3 h-8 text-xs font-semibold text-white transition"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isPlaying ? (
                        <motion.span key="pause" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} style={{ display: "flex" }}>
                          <Pause className="h-3.5 w-3.5" />
                        </motion.span>
                      ) : (
                        <motion.span key="play" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} style={{ display: "flex" }}>
                          <Play className="h-3.5 w-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isPlaying ? "Pause" : "Play"}
                  </motion.button>

                  {/* Step */}
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={stepForward}
                    disabled={isPlaying || currentStepIndex >= totalSteps - 1}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 px-3 h-8 text-xs font-semibold text-white transition"
                  >
                    <StepForward className="h-3.5 w-3.5" /> Step
                  </motion.button>

                  {/* Reset */}
                  <motion.button
                    whileHover={{ scale: 1.08, rotate: -20 }} whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", damping: 14, stiffness: 360 }}
                    onClick={reset}
                    className="flex items-center justify-center rounded-lg border border-zinc-700 hover:bg-zinc-800 h-8 w-8 text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </motion.button>

                  {/* Divider */}
                  <div className="h-5 w-px bg-white/10" />

                  {/* Speed chips — same height as buttons */}
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`h-8 rounded-lg px-2.5 text-xs font-mono font-bold transition ${
                        speed === s
                          ? "bg-indigo-600 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                          : "text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 hover:bg-zinc-700/60"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>

                {/* Step description — compact */}
                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 min-h-0">
                  {currentStep.description}
                </p>
              </div>

              {/* Divider */}
              <div className="w-px bg-white/5 shrink-0" />

              {/* Right: Variables */}
              <div className="w-52 shrink-0 flex flex-col min-h-0">
                <div className="px-3 pt-2.5 pb-1 shrink-0">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Variables</span>
                </div>
                <div className="flex-1 min-h-0 overflow-auto px-3 pb-2.5">
                  <VariableState variables={currentStep.variables} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slim T/S complexity footer */}
      <div className="flex items-center justify-end gap-5 px-5 py-1.5 border-t border-white/[0.04] bg-zinc-950/60 shrink-0">
        <span className="text-[10px] font-mono text-zinc-700">
          T: <span className="text-zinc-500">{vm.timeComplexity}</span>
        </span>
        <span className="text-[10px] font-mono text-zinc-700">
          S: <span className="text-zinc-500">{vm.spaceComplexity}</span>
        </span>
      </div>
    </div>
  );
}
