"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2, Braces, Code2 } from "lucide-react";

import { BottomBar } from "@/components/common/BottomBar";
import { CodePanel } from "@/components/code/CodePanel";
import { ComplexityBadge } from "@/components/code/ComplexityBadge";
import { VariableState } from "@/components/code/VariableState";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/explore/CategoryNav";
import { Controls } from "@/components/visualization/Controls";
import { InputPanel } from "@/components/visualization/InputPanel";
import { VisualizationCanvas } from "@/components/visualization/VisualizationCanvas";
import { useAnimationPlayer } from "@/hooks/useAnimationPlayer";
import { useVisualization } from "@/hooks/useVisualization";

interface ExploreClientProps {
  initialSlug?: string;
}

function parseInputFromQuery(raw: string | null): unknown | null {
  if (!raw) return null;
  // Try JSON first (handles objects, arrays, numbers, strings)
  try { return JSON.parse(raw); } catch { /* fall through */ }
  // Legacy: comma-separated numbers
  const parsed = raw.split(",").map((t) => Number(t.trim()));
  if (parsed.length && !parsed.some(Number.isNaN)) return parsed;
  return null;
}

type RightTab = "code" | "variables";

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ReactNode }[] = [
  { id: "code",      label: "Code",      icon: <Code2  className="h-3.5 w-3.5" /> },
  { id: "variables", label: "Variables", icon: <Braces className="h-3.5 w-3.5" /> },
];

const SPRING = { type: "spring" as const, damping: 26, stiffness: 340, mass: 0.7 };

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
      // Compact: plain number arrays stay comma-separated for readability
      if (Array.isArray(input) && (input as unknown[]).every((v) => typeof v === "number")) {
        p.set("input", (input as number[]).join(","));
      } else {
        p.set("input", JSON.stringify(input));
      }
    }
    router.replace(`/explore/${cat}/${vm.slug}?${p.toString()}`, { scroll: false });
  }, [currentStepIndex, input, vm, router]);

  const [rightTab, setRightTab] = useState<RightTab>("code");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPlaceholder = (currentStep?.visualState as any)?.state === "placeholder";

  if (!vm || !currentStep) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
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

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Header />

      {/* Horizontal category + algorithm navigation */}
      <CategoryNav activeSlug={vm.slug} />

      {/* Main layout — two-column for full algorithms, single-column for placeholders */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: Visualization panel (hidden for placeholders) ── */}
        {!isPlaceholder && (
          <div className="flex flex-col min-h-0 flex-[1.25] border-r border-white/5">

            {/* Algorithm header */}
            <div className="flex items-start justify-between px-5 py-3 border-b border-white/5 shrink-0 gap-4">
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-white leading-tight">{vm.title}</h1>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{vm.description}</p>
              </div>
              <div className="shrink-0">
                <ComplexityBadge
                  timeComplexity={vm.timeComplexity}
                  spaceComplexity={vm.spaceComplexity}
                />
              </div>
            </div>

            {/* Input + Controls inline row */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 shrink-0">
              <div className="flex-1 min-w-0">
                <InputPanel
                  defaultInput={vm.defaultInput}
                  input={input}
                  onApplyInput={(next: unknown) => {
                    setInput(next);
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                />
              </div>
              <div className="shrink-0">
                <Controls
                  isPlaying={isPlaying}
                  speed={speed}
                  onPlayPause={() => setIsPlaying((p) => !p)}
                  onStep={stepForward}
                  onReset={reset}
                  onSpeedChange={setSpeed}
                />
              </div>
            </div>

            {/* Visualization canvas — fills remaining space */}
            <div className="flex-1 min-h-0 p-4 overflow-hidden">
              <VisualizationCanvas visualState={currentStep.visualState} />
            </div>
          </div>
        )}

        {/* ── Right (or full-width for placeholders): Code / Variables panel ── */}
        <div className={`flex flex-col min-h-0 ${isPlaceholder ? "flex-1" : "flex-1"}`}>

          {/* Algorithm header for placeholder (shown here since left panel is hidden) */}
          {isPlaceholder && (
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/5 shrink-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-white leading-tight">{vm.title}</h1>
                <p className="text-xs text-zinc-500 mt-0.5">{vm.description}</p>
              </div>
              <ComplexityBadge
                timeComplexity={vm.timeComplexity}
                spaceComplexity={vm.spaceComplexity}
              />
              <span className="shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                Visualization coming soon
              </span>
            </div>
          )}

          {/* Tab bar — hide Variables tab for placeholders (empty variables) */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 shrink-0">
            {RIGHT_TABS.filter((t) => !isPlaceholder || t.id === "code").map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setRightTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  rightTab === tab.id ? "text-indigo-300" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                {rightTab === tab.id && (
                  <motion.div
                    layoutId="right-tab-bg"
                    transition={SPRING}
                    className="absolute inset-0 rounded-lg bg-indigo-600/15 border border-indigo-500/20"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
            ))}
            {!isPlaceholder && (
              <div className="ml-auto text-[10px] font-mono text-zinc-600">
                {currentStep.stepNumber} / {totalSteps}
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {(isPlaceholder || rightTab === "code") ? (
                <motion.div
                  key="code"
                  className="flex flex-col h-full p-3 gap-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: SPRING }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
                >
                  <div className="flex-1 min-h-0">
                    <CodePanel
                      code={vm.pythonCode}
                      highlightLines={isPlaceholder ? [] : currentStep.highlightLines}
                    />
                  </div>
                  {!isPlaceholder && <VariableState variables={currentStep.variables} />}
                </motion.div>
              ) : (
                <motion.div
                  key="variables"
                  className="h-full p-3 overflow-auto"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: SPRING }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
                >
                  <VariableState variables={currentStep.variables} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomBar
        currentStep={currentStep.stepNumber}
        totalSteps={totalSteps}
        description={currentStep.description}
        timeComplexity={vm.timeComplexity}
        spaceComplexity={vm.spaceComplexity}
      />
    </div>
  );
}
